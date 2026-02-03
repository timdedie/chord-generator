import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, CoreMessage } from 'ai';
import { z } from 'zod';
import {
    CHORD_FORMATTING_RULES,
    MultipleProgressionsSchema,
} from '@/lib/schemas';

interface RequestBody {
    prompt: string;
    numChords: number;
}

interface ApiError extends Error {
    status?: number;
    details?: unknown;
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
const DEFAULT_TEMPERATURE = 1.2; // Slightly higher for more variation
const MAX_RETRIES = 2;

function createResponse(data: unknown, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

/**
 * Generates multiple chord progressions with retry logic.
 */
async function createMultipleProgressionsGeneration(
    userMessage: string
): Promise<z.infer<typeof MultipleProgressionsSchema>> {
    const modelClient = deepseek(PRIMARY_MODEL_ID);
    const systemMessage = `
You are an expert musician and composer specializing in chord progressions.
Your primary goal is to generate THREE DISTINCT chord progressions that are musically correct, harmonically rich, and sound genuinely good.
Each progression should offer a different interpretation or variation of the user's request.

Guidelines for creating variations:
1. **Different Harmonic Approaches:** One might be simpler (triads), another more jazzy (7ths, extensions), another with modal colors.
2. **Different Keys or Modes:** If appropriate, explore the same mood in different keys or modes.
3. **Different Rhythmic Implications:** Some progressions suggest faster movement, others slower, more drawn-out changes.
4. **Voice Leading Variety:** Use slash chords and inversions differently across progressions.

Each progression should have a short "style" label (2-4 words) that describes its character, like "Warm Jazz", "Dark Cinematic", "Bright Pop", "Neo Soul", "Modal Exploration", etc.

Simple, well-chosen triads and basic 7th chords are often the best choice. Extensions and alterations should be used thoughtfully.
**Remember to use slash chords (e.g., C/E, Am/G) to specify inversions for smooth bass lines.**

${CHORD_FORMATTING_RULES}
  `.trim();

    const messages: CoreMessage[] = [{ role: 'user', content: userMessage }];
    const allErrors: { attempt: number; error: string; response?: unknown }[] = [];

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        console.log(`[API generate-multiple] Attempt ${attempt + 1} of ${MAX_RETRIES + 1}...`);

        try {
            const { object } = await generateObject({
                model: modelClient,
                schema: MultipleProgressionsSchema,
                system: systemMessage,
                messages,
                temperature: DEFAULT_TEMPERATURE,
                mode: 'json',
            });

            // Run our own stricter validation which includes `refine` checks
            const parsed = MultipleProgressionsSchema.safeParse(object);

            if (parsed.success) {
                console.log(`[API generate-multiple] Successfully validated object on attempt ${attempt + 1}.`);
                return parsed.data;
            }

            // Validation failed, prepare for retry
            const validationError = parsed.error;
            const errorMessage = `The generated object failed validation. Errors: ${JSON.stringify(validationError.format())}`;
            console.error(`[API generate-multiple] Attempt ${attempt + 1} failed Zod validation:`, validationError.format());
            allErrors.push({ attempt: attempt + 1, error: errorMessage, response: object });

            // Add the assistant's failed response and a correction message
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
            console.error(`[API generate-multiple] Attempt ${attempt + 1} threw an error:`, errorMessage);
            allErrors.push({ attempt: attempt + 1, error: errorMessage });

            if (attempt < MAX_RETRIES) {
                messages.push({
                    role: 'user',
                    content: `Your previous attempt failed with an error: "${errorMessage}". This likely means the JSON structure was invalid. Please generate a valid JSON object that strictly adheres to the schema and all formatting rules.`
                });
            }
        }
    }

    const finalError = new Error(`AI failed to generate valid progressions after ${MAX_RETRIES + 1} attempts.`) as ApiError;
    finalError.status = 500;
    finalError.details = {
        message: "The model could not produce a response that passes validation, even after retrying.",
        errors: allErrors
    };
    throw finalError;
}

function buildMultipleProgressionsMessage(prompt: string, numChords: number): string {
    const count = numChords >= 2 && numChords <= 8 ? numChords : 4;
    return `
Create THREE DIFFERENT ${count}-chord progressions based on this requirement: "${prompt}".

Each progression should:
1. Have exactly ${count} chords
2. Be musically compelling and cohesive
3. Offer a DIFFERENT interpretation or variation of the request
4. Have a unique "style" label (2-4 words) that captures its character

Make each progression distinct:
- **Progression 1:** A straightforward, accessible interpretation
- **Progression 2:** A more sophisticated or jazzy take
- **Progression 3:** An unexpected or creative variation

Consider these elements as options to be used with care:
- Inversions (slash chords like G/B) for smoother bass lines
- Different chord qualities (major, minor, dominant, suspended)
- Extensions (7ths, 9ths) used sparingly and purposefully
- Modal colors or brief tonicizations when appropriate

If the prompt is simple, lean towards simpler chord choices. If the prompt suggests complexity, more adventurous choices are warranted.

Provide the response as a JSON object with a "progressions" array containing exactly 3 objects, each with:
- "chords": an array of ${count} chord strings
- "style": a short 2-4 word label

Example format:
{
  "progressions": [
    { "chords": ["Am", "F", "C", "G"], "style": "Classic Pop" },
    { "chords": ["Am7", "Fmaj7", "Cmaj7/E", "G6"], "style": "Smooth Jazz" },
    { "chords": ["Am", "Dm/F", "E7", "Am/E"], "style": "Minor Drama" }
  ]
}
  `.trim();
}

export async function POST(request: Request): Promise<Response> {
    try {
        const body = (await request.json()) as RequestBody;
        const { prompt, numChords } = body;

        if (!prompt) {
            return createResponse(
                { error: 'Prompt is required for progression generation.' },
                400
            );
        }

        const effectiveCount = (typeof numChords === 'number' && numChords >= 2 && numChords <= 8) ? numChords : 4;
        const userMessage = buildMultipleProgressionsMessage(prompt, effectiveCount);

        const validatedResponse = await createMultipleProgressionsGeneration(userMessage);

        // Add unique IDs to each progression
        const progressionsWithIds = validatedResponse.progressions.map((prog, index) => ({
            id: `prog-${Date.now()}-${index}`,
            chords: prog.chords,
            style: prog.style,
        }));

        console.log(`[API generate-multiple] Successfully generated ${progressionsWithIds.length} progressions.`);

        return createResponse({ progressions: progressionsWithIds });

    } catch (err: unknown) {
        console.error('[API generate-multiple] Final Error:', err);
        const e = err as ApiError;

        if (e.status && e.details) {
            return createResponse(
                {
                    error: e.message || 'AI response validation failed after multiple attempts.',
                    details: e.details
                },
                e.status
            );
        }

        return createResponse(
            { error: e.message || 'An unexpected internal server error occurred.' },
            e.status || 500
        );
    }
}
