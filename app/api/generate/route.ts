import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, CoreMessage } from 'ai';
import { z } from 'zod';
import { Chord } from 'tonal'; // For backend validation

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
    details?: any; // To include error details, e.g., from Zod
}

const { GOOGLE_GENERATIVE_AI_API_KEY } = process.env;
if (!GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set.');
}

const googleAIProvider = createGoogleGenerativeAI({});
const PRIMARY_MODEL_ID = 'gemini-2.5-flash-preview-05-20';

const DEFAULT_TEMPERATURE = 1.0;

const CHORD_FORMATTING_RULES = `
Chord formatting rules:

**Basics:**
*   **Root:** Uppercase A–G. Use '#' for sharps and 'b' for flats (e.g., F#, Bb).
*   **Major Triad:** Just the root (e.g., C, F#).
*   **Minor Triad:** "m" (e.g., Am, Bbm).

**Seventh Chords:**
*   **Dominant Seventh:** "7" (e.g., G7, A7).
*   **Major Seventh:** "maj7" or "M7" (e.g., Cmaj7, FM7). Do not use the triangle symbol (△).
*   **Minor Seventh:** "m7" (e.g., Dm7).
*   **Minor-Major Seventh:** "mM7" (e.g., AmM7). Do NOT use "mmaj7" or "m(maj7)".
*   **Diminished Seventh:** "dim7" or "°7" (e.g., Bdim7, B°7).
*   **Half-Diminished Seventh:** "m7b5" or "ø" (e.g., F#m7b5, F#ø).

**Suspended Chords:**
*   **Suspended Second:** "sus2".
*   **Suspended Fourth:** "sus4".
*   **Dominant Suspended Fourth:** "7sus4" (e.g., G7sus4).

**Extensions & Alterations:**
*   **Common Extensions:** Use standard suffixes like "9", "11", "13" (e.g., C9, Dm11, G13).
*   **Major Extensions:** For major chords with extensions, prefer 'maj9', 'maj11', 'maj13' (e.g., 'Cmaj9' instead of 'Cmaj7add9').
*   **Alterations:** Clearly append alterations. Use 'b' for flat and '#' for sharp (e.g., G7b9, C7#5, Fmaj7#11).

**Slash Chords (Inversions / Specific Bass):**
*   **Bass Note:** Use a forward slash "/" followed by the bass note to indicate an inversion or a specific bass (e.g., C/E, Am7/G, G7b9/F). This is crucial for good voice leading.

**Guideline:**
Provide only the chord symbols according to these rules. For example, a progression of A minor, G major, and C major should be ["Am", "G", "C"]. A single F sharp minor seventh chord should be "F#m7".
`.trim();

const ValidChordStringSchema = z.string()
    .describe("A musical chord symbol, strictly adhering to the CHORD_FORMATTING_RULES.")
    .transform(chordSymbol => {
        let cleaned = chordSymbol.trim();
        if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
            cleaned = cleaned.substring(1, cleaned.length - 1).trim();
        }
        cleaned = cleaned.replace(/[.,;:!?]$/, "").trim();
        return cleaned;
    })
    .refine(chordSymbol => {
        if (!chordSymbol) return false;
        const chordData = Chord.get(chordSymbol);
        return !!(chordData && !chordData.empty && chordData.name && chordData.name.length > 0 && chordData.notes && chordData.notes.length > 0);
    }, {
        message: "Invalid chord symbol or format. Ensure it matches CHORD_FORMATTING_RULES and is a recognized chord.",
    });

const ChordProgressionSchema = z.object({
    chords: z.array(ValidChordStringSchema)
        .describe('An array of chord names forming a progression.'),
});

const SingleChordSchema = z.object({
    chord: ValidChordStringSchema
        .describe("A single musical chord symbol, strictly adhering to the CHORD_FORMATTING_RULES. Example: 'F#m7'."),
});

function createResponse(data: unknown, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function createSimpleProgressionString(chords: SimpleChordObject[]): string {
    return chords.map((c) => c.chord).join(' - ');
}

async function createChordObjectGeneration<T extends z.ZodTypeAny>(
    userMessage: string,
    schema: T
): Promise<z.infer<T>> {
    console.log('[API createChordObjectGeneration] User message to AI:\n', userMessage);

    const modelClient = googleAIProvider(PRIMARY_MODEL_ID);
    console.log(`[API createChordObjectGeneration] Using temperature: ${DEFAULT_TEMPERATURE}`);

    const systemMessage = `
You are an expert musician and composer specializing in chord progressions.
Your primary goal is to generate chords that are musically correct, harmonically rich, and sound genuinely good.
While creativity is valued, it should not come at the expense of fundamental musicality.
Simple, well-chosen triads and basic 7th chords are often the best choice. Extensions and alterations should be used thoughtfully, only when they truly enhance the musical context.
**Remember to use slash chords (e.g., C/E, Am/G) to specify inversions, which is essential for creating smooth, melodic bass lines and better voice leading.**

Pay close attention to the user's specific musical requirements, context, and desired chord count.
You will provide your response as a structured JSON object according to the provided schema.
Ensure all chord symbols strictly adhere to the detailed CHORD_FORMATTING_RULES provided below.

${CHORD_FORMATTING_RULES}
  `.trim();

    const messages: CoreMessage[] = [{ role: 'user', content: userMessage }];

    const { object } = await generateObject({
        model: modelClient,
        schema,
        system: systemMessage,
        messages,
        temperature: DEFAULT_TEMPERATURE,
        mode: 'json',
    });

    if (!object) {
        const error = new Error('No valid object response from AI (Vercel AI SDK)') as ApiError;
        error.status = 500;
        error.details = "The AI model did not return the expected structured object.";
        throw error;
    }
    return object;
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
    addChordPosition: number // Requires a number, not undefined
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

        // --- FIX IS HERE ---
        // By using 'typeof addChordPosition === 'number'', TypeScript can infer
        // that inside this block, 'addChordPosition' is not undefined.
        if (typeof addChordPosition === 'number') {
            schema = SingleChordSchema;
            // This call is now safe, as 'addChordPosition' is guaranteed to be a number.
            userMessage = buildAddChordMessage(prompt, existingChords, addChordPosition);
        } else {
            // This is the progression generation case.
            if (!prompt) {
                throw Object.assign(new Error('Prompt is required for progression generation.'), {
                    status: 400,
                });
            }
            const effectiveCount = (typeof numChords === 'number' && numChords >= 2 && numChords <= 8) ? numChords : 4;
            schema = ChordProgressionSchema;
            userMessage = buildProgressionMessage(prompt, effectiveCount);
        }

        const aiObj = await createChordObjectGeneration(userMessage, schema);
        console.log(`[API Raw AI Response] aiObj:`, JSON.stringify(aiObj, null, 2));

        const parsed = schema.safeParse(aiObj);
        if (!parsed.success) {
            console.error(`[API Zod Error]`, parsed.error.format());
            throw Object.assign(new Error('Invalid response from AI after refinement and validation.'), {
                status: 500,
                details: parsed.error.format()
            });
        }

        return createResponse(parsed.data);

    } catch (err: unknown) {
        console.error('[API POST] Error:', err);
        const e = err as ApiError;

        if (e.status && e.details) {
            return createResponse({ error: e.message || 'AI response validation failed.', details: e.details }, e.status);
        }
        if (e.message && (e.message.includes("response did not match schema") || e.message.includes("No object generated"))) {
            return createResponse({ error: "AI failed to generate a response matching the required format. Please try rephrasing your request or try again.", details: e.message }, 500);
        }
        return createResponse({ error: e.message || 'Internal server error' }, e.status || 500);
    }
}