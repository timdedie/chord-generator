import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, CoreMessage } from 'ai';
import { z } from 'zod';
import {
    CHORD_FORMATTING_RULES,
    ChordProgressionSchema,
    SingleChordSchema
} from '@/lib/schemas';

interface SimpleChordObject {
    chord: string;
}

interface RequestBody {
    prompt?: string;
    existingChords?: SimpleChordObject[];
    addChordPosition?: number;
    numChords?: number;
}

interface ApiError extends Error {
    status?: number;
    details?: any;
}

const { DEEPSEEK_API_KEY } = process.env;
if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY environment variable is not set.");
}

const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: DEEPSEEK_API_KEY,
});

const PRIMARY_MODEL_ID = 'deepseek-chat';
const DEFAULT_TEMPERATURE = 1.0;
const MAX_RETRIES = 2;

function createResponse(data: unknown, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function createSimpleProgressionString(chords: SimpleChordObject[]): string {
    return chords.map((c) => c.chord).join(' - ');
}

/**
 * Generates a structured object from an AI model with a built-in retry mechanism.
 * If the initial response from the AI fails validation, it will retry up to MAX_RETRIES times,
 * feeding the validation error back to the model to guide it towards a correct response.
 */
async function createChordObjectGeneration<T extends z.ZodTypeAny>(
    userMessage: string,
    schema: T
): Promise<z.infer<T>> {
    const modelClient = deepseek(PRIMARY_MODEL_ID);
    const systemMessage = `
You are an expert musician and composer specializing in chord progressions.
Your primary goal is to generate chords that are musically correct, harmonically rich, and sound genuinely good.
While creativity is valued, it should not come at theexpense of fundamental musicality.
Simple, well-chosen triads and basic 7th chords are often the best choice. Extensions and alterations should be used thoughtfully, only when they truly enhance the musical context.
**Remember to use slash chords (e.g., C/E, Am/G) to specify inversions, which is essential for creating smooth, melodic bass lines and better voice leading.**

Pay close attention to the user's specific musical requirements, context, and desired chord count.
You will provide your response as a structured JSON object according to the provided schema.
Ensure all chord symbols strictly adhere to the detailed CHORD_FORMATTING_RULES provided below.

${CHORD_FORMATTING_RULES}
  `.trim();

    const messages: CoreMessage[] = [{ role: 'user', content: userMessage }];
    const allErrors: { attempt: number; error: string; response?: any }[] = [];

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        console.log(`[API createChordObjectGeneration] Attempt ${attempt + 1} of ${MAX_RETRIES + 1}...`);

        try {
            const { object } = await generateObject({
                model: modelClient,
                schema,
                system: systemMessage,
                messages,
                temperature: DEFAULT_TEMPERATURE,
                mode: 'json',
            });

            // Run our own stricter validation which includes `refine` checks
            const parsed = schema.safeParse(object);

            if (parsed.success) {
                console.log(`[API createChordObjectGeneration] Successfully validated object on attempt ${attempt + 1}.`);
                return parsed.data; // Success!
            }

            // Validation failed, prepare for retry
            const validationError = parsed.error;
            const errorMessage = `The generated object failed validation. Errors: ${JSON.stringify(validationError.format())}`;
            console.error(`[API createChordObjectGeneration] Attempt ${attempt + 1} failed Zod validation:`, validationError.format());
            allErrors.push({ attempt: attempt + 1, error: errorMessage, response: object });

            // Add the assistant's failed response and a correction message for the next attempt.
            messages.push(
                { role: 'assistant', content: JSON.stringify(object) },
                {
                    role: 'user',
                    content: `Your previous response was invalid. Please fix the following errors and provide a new, valid response.
Errors:
${JSON.stringify(validationError.format(), null, 2)}

Ensure your response strictly adheres to all CHORD_FORMATTING_RULES and the requested JSON schema. Every chord symbol must be musically valid.`
                }
            );

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`[API createChordObjectGeneration] Attempt ${attempt + 1} threw an error:`, errorMessage);
            allErrors.push({ attempt: attempt + 1, error: errorMessage });

            if (attempt < MAX_RETRIES) {
                messages.push({
                    role: 'user',
                    content: `Your previous attempt failed with an error: "${errorMessage}". This likely means the JSON structure was invalid. Please generate a valid JSON object that strictly adheres to the schema and all formatting rules.`
                });
            }
        }
    }

    // If the loop finishes, all retries have failed.
    const finalError = new Error(`AI failed to generate a valid response after ${MAX_RETRIES + 1} attempts.`) as ApiError;
    finalError.status = 500;
    finalError.details = {
        message: "The model could not produce a response that passes validation, even after retrying.",
        errors: allErrors
    };
    throw finalError;
}

function buildProgressionMessage(prompt: string, numChords: number): string {
    const count = numChords >= 2 && numChords <= 8 ? numChords : 4;
    return `
Create a ${count}-chord progression based on this requirement: "${prompt}".

The progression should be musically compelling and cohesive. Avoid predictability, but do not feel obligated to make every chord complex. Often, a progression of simple triads or basic 7ths is most effective.
Think about creating a clear harmonic direction and a strong sense of musicality.

Consider these elements as *options* to be used with care:
- **Inversions (slash chords like G/B)** to create smoother bass lines and better voice leading.
- Satisfying resolutions, which can be simple or more nuanced.
- Diminished or half-diminished chords (like Bdim7 or F#m7b5) as passing chords.
- Subtle modal colors or brief tonicizations, if appropriate and not forced.
- Extensions or alterations, but only if they enhance the specific mood without sounding overly dense.

**If the prompt is simple (e.g., "a happy pop song"), lean towards simpler, standard chord choices. If the prompt suggests a more complex genre (e.g., "atonal jazz," "impressionistic piece"), then more adventurous choices are warranted, but always with musical justification.**

Provide the ${count} chord names as an array of strings in the 'chords' field of the JSON output.
Each chord name must strictly adhere to the CHORD_FORMATTING_RULES.
Do not include any other text or explanations; only the JSON object.
  `.trim();
}

function buildAddChordMessage(
    prompt: string | undefined,
    existingChords: SimpleChordObject[],
    addChordPosition: number
): string {
    const hasExisting = existingChords.length > 0;
    const context = hasExisting
        ? `I have the progression: ${createSimpleProgressionString(
            existingChords
        )}. I want to insert a new chord at position ${
            addChordPosition + 1
        } (0-indexed: ${addChordPosition}).`
        : 'Generate an interesting single starting chord.';

    const before = hasExisting && addChordPosition > 0
        ? ` The new chord will follow ${existingChords[addChordPosition - 1].chord}.`
        : '';
    const after = hasExisting && addChordPosition < existingChords.length
        ? ` The new chord will precede ${existingChords[addChordPosition].chord}.`
        : '';

    let requirementInstruction: string;
    if (prompt && prompt.trim()) {
        requirementInstruction = `Musical requirement for the new chord: "${prompt}". The new chord should fulfill this while integrating seamlessly and musically.`;
    } else if (hasExisting) {
        requirementInstruction = `The new chord should create a smooth harmonic transition with the surrounding chords.`;
    } else {
        requirementInstruction = `The new chord should be musically interesting and serve as a solid starting point. A strong, clear chord (triad or basic 7th) is often best.`;
    }

    return `
${context}${before}${after}

${requirementInstruction}

When selecting the chord, consider these priorities:
1.  **Excellent voice leading:** The primary goal. **A slash chord (e.g., G/B to lead to a C chord) is an extremely effective tool to achieve this.**
2.  **Harmonic Context:** Does the chord fit the progression? Does it add color, create tension, or provide resolution?
3.  **Simplicity vs. Complexity:** Do not default to complexity. A simple triad is often the most powerful choice. Use extensions/alterations only when there is a strong musical reason.

Provide the single new chord name as a string in the 'chord' field of the JSON output.
The chord name must strictly adhere to the CHORD_FORMATTING_RULES.
Do not include any other text or explanations; only the JSON object.
  `.trim();
}

export async function POST(request: Request): Promise<Response> {
    try {
        const body = (await request.json()) as RequestBody;
        const {
            prompt,
            existingChords = [],
            addChordPosition,
            numChords,
        } = body;

        let userMessage: string;
        let schema: z.ZodTypeAny;

        if (typeof addChordPosition === 'number') {
            schema = SingleChordSchema;
            userMessage = buildAddChordMessage(prompt, existingChords, addChordPosition);
        } else {
            if (!prompt) {
                throw Object.assign(new Error('Prompt is required for progression generation.'), {
                    status: 400,
                });
            }
            const effectiveCount = (typeof numChords === 'number' && numChords >= 2 && numChords <= 8) ? numChords : 4;
            schema = ChordProgressionSchema;
            userMessage = buildProgressionMessage(prompt, effectiveCount);
        }

        // This function now handles retries and validation internally.
        // It either returns a valid, parsed object or throws a detailed error.
        const validatedAiObject = await createChordObjectGeneration(userMessage, schema);

        console.log(`[API] Successfully generated and validated AI Response:`, JSON.stringify(validatedAiObject, null, 2));

        // The object is already parsed and validated, so we can return it directly.
        return createResponse(validatedAiObject);

    } catch (err: unknown) {
        console.error('[API POST] Final Error after all retries:', err);
        const e = err as ApiError;

        // The error from our retry function will have status and details.
        if (e.status && e.details) {
            return createResponse(
                {
                    error: e.message || 'AI response validation failed after multiple attempts.',
                    details: e.details
                },
                e.status
            );
        }

        // Handle other potential errors (e.g., the 400 from missing prompt).
        return createResponse(
            { error: e.message || 'An unexpected internal server error occurred.' },
            e.status || 500
        );
    }
}