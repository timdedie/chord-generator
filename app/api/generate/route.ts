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
// const PRIMARY_MODEL_ID = 'gemini-2.0-flash-lite';

const DEFAULT_TEMPERATURE = 1.0;

const CHORD_FORMATTING_RULES = `
Chord formatting rules:
• Root = uppercase A–G (use # or b for accidentals).
• Chord symbols must ONLY contain standard alphanumeric characters (A-G, a-g, 0-9), standard accidentals (#, b), the degree symbol (°), and common suffixes (m, maj, dim, aug, sus, etc.). No other special characters, slashes (except for polychords if explicitly requested and formatted like C/G), or escape sequences (like \\b) are allowed within a single chord symbol.
• Major triad = just the root (C, F)
• Minor triad = "m" (Am, Dm)
• Dominant seventh = "7" (G7)
• Major seventh = "maj7" (no △) (e.g., Cmaj7).
• Major Seventh with Altered Fifth: For a major seventh chord with an altered fifth (e.g., C E Gb B for Cmaj7(b5) or C E G# B for Cmaj7(#5)), use parentheses for the alteration: "Xmaj7(b5)" or "Xmaj7(#5)". Example: "Cmaj7(b5)", "Fmaj7(#5)". Do NOT append the alteration directly like "Cmaj7b5".
• Minor seventh = "m7"
• Minor-Major Seventh Chords: For a minor chord with an added major seventh (e.g., notes C-Eb-G-B), YOU MUST use the format "mM7". Example: "CmM7". The formats "Cm(maj7)" or "Cmmaj7" are INCORRECT for our system and will be rejected.
• Diminished Chords: Use "dim" (e.g., Cdim) for a diminished triad. For a diminished seventh chord, use "dim7" or "°7" or "o7" (e.g., Cdim7, C°7, Co7). Ensure the root note is clear (e.g., F#dim7, Bb°7).
• Suspended = "sus2" or "sus4" (e.g., Csus4, Gsus2). These are for basic suspended chords without dominant 7ths.
• Suspended Dominant Chords (e.g., A D E G): Use "7sus4" (e.g., A7sus4).
• Suspended Dominant Chords with Alterations: For suspended dominant 7th chords that also include alterations (like b9, #9, #11, b13), use formats such as "X7susb9" or "X7(sus4,b9)". Example: "A7susb9" for A7sus4 with a b9, or "G7(sus4,#11)" for G7sus4 with a #11. Avoid directly appending alterations after "X7sus4" like "A7sus4b9".
• For chords with a major 7th and an added 9th, use the 'maj9' suffix (e.g., 'Cmaj9') instead of 'maj7add9'.
• Extensions/alterations allowed (general): 9, add9, #5, b9, #11, 13, etc., applied to standard chord types (Ensure these are standard and parsable, prefer 'Cmaj9' over 'Cmaj7add9' if applicable). Use parentheses for alterations on complex chords if it aids clarity and standard notation, e.g., C7(#9b13).
Guideline: Provide only the chord symbols according to these rules. For example, if generating ["Am", "G", "C"], the 'chords' array should be ["Am", "G", "C"]. If generating a single chord "F#m7", the chord name should be "F#m7".
`.trim();

// Refined Zod type for a single chord string with tonal validation
const ValidChordStringSchema = z.string()
    .describe("A musical chord symbol, strictly adhering to the CHORD_FORMATTING_RULES.")
    .transform(chordSymbol => {
        let cleaned = chordSymbol.trim();

        // Step 1: Unwrap if the string value itself is quoted (e.g., "'Am'" or "\"Cmaj7\"")
        if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
            cleaned = cleaned.substring(1, cleaned.length - 1).trim();
        }

        // Step 2: Remove common trailing punctuation that AI might add.
        // Example: "Am." -> "Am", "Cmaj7," -> "Cmaj7"
        cleaned = cleaned.replace(/[.,;:!?]$/, "").trim();

        // Step 3: The original .replace(/△/g, "") is removed.
        // Tonal.js handles '△' correctly as an alias for 'maj7'.
        // For example, Chord.get("C△7").symbol is "Cmaj7".
        // The previous replacement of '△' to "" would turn "C△7" into "C7" (dominant 7th),
        // incorrectly changing the chord quality. The CHORD_FORMATTING_RULES asks the AI
        // for "maj7" and "no △", but if △ is provided, Tonal.js can parse it correctly.

        return cleaned;
    })
    .refine(chordSymbol => {
        if (!chordSymbol) return false; // Reject empty string after transform
        const chordData = Chord.get(chordSymbol); // Validate with tonal
        // Ensure it's a valid chord and tonal could parse its name and notes
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
While creativity and distinctiveness are valued, they should not come at the expense of fundamental musicality or by overusing complex chords.
**Simple, well-chosen triads and basic 7th chords are often the best choice. Extensions (9ths, 11ths, 13ths) and alterations should be used thoughtfully and sparingly, only when they truly enhance the musical context.**
Strive for good voice leading, musical coherence, and progressions that are memorable.

Pay close attention to the user's specific musical requirements, context, and desired chord count.
You will provide your response as a structured JSON object according to the provided schema.
Ensure all chord symbols strictly adhere to the CHORD_FORMATTING_RULES.

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

The progression should be musically compelling, cohesive, and **above all, sound good.** It should aim for a memorable and fitting character for the given prompt.
**Avoid predictability, but do not feel obligated to make every chord a complex 7th, 9th, or altered chord. Often, a progression of simple triads (C, G, Am, F) or basic 7ths (Dm7, G7, Cmaj7) is most effective.**
Think about creating a clear harmonic direction.

Consider these elements as *options*, not requirements, to be used with care:
- Satisfying resolutions, which can be simple or more nuanced.
- Subtle modal colors or brief tonicizations, if appropriate and not forced.
- Chords with extensions or alterations, but only if they enhance the specific mood without sounding out of place or overly dense. A common mistake is to make all chords complex; strive for balance.
- A sense of harmonic storytelling.

**If the prompt is simple or common (e.g., "a happy pop song"), lean towards simpler, more standard chord choices. If the prompt suggests a more complex or specific genre (e.g., "atonal jazz," "impressionistic piece"), then more adventurous choices might be warranted, but always with musical justification.**

Ensure smooth voice leading and strong melodic potential.

Provide the ${count} chord names as an array of strings in the 'chords' field of the JSON output.
Each chord name must strictly adhere to the CHORD_FORMATTING_RULES.
Do not include any other text, explanations, or conversational remarks in your response; only the JSON object.
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
        requirementInstruction = `Musical requirement for the new chord: "${prompt}". The new chord should fulfill this while integrating seamlessly and musically. **Prioritize a chord that sounds good and fits the context.**`;
    } else if (hasExisting) {
        requirementInstruction = `The new chord should create smooth harmonic transitions with the surrounding chords. **Aim to enhance the existing progression. This might mean adding a unique color or a passing chord that improves flow.**`;
    } else {
        requirementInstruction = `The new chord should be musically interesting and serve as a **solid and inviting starting point. It doesn't need to be overly complex; a strong, clear chord (triad or basic 7th) is often best.**`;
    }

    return [
        context + before + after,
        requirementInstruction,
        'When selecting the chord, consider:',
        '- **Excellent voice leading into and out of the new chord.**',
        '- **Whether a simple triad, a basic 7th, or a more complex chord (with extensions/alterations) is most appropriate for the musical context. Do not default to complexity.**',
        '- **How this chord contributes to the overall flow and musicality of the progression. The primary aim is a good-sounding result.**',
        'Provide the single new chord name as a string in the \'chord\' field of the JSON output.',
        'The chord name must strictly adhere to the CHORD_FORMATTING_RULES.',
        'Do not include any other text, explanations, or conversational remarks; only the JSON object.',
    ].join('\n\n');
}

export async function POST(request: Request): Promise<Response> {
    try {
        const body = (await request.json()) as RequestBody;
        const {
            prompt: userPrompt,
            existingChords = [],
            addChordPosition,
            numChords,
        } = body;

        let effectiveCount: number;
        if (typeof numChords === 'number' && numChords >= 2 && numChords <= 8) {
            effectiveCount = numChords;
        } else {
            effectiveCount =
                existingChords.length >= 2 && existingChords.length <= 8
                    ? existingChords.length
                    : 4;
        }

        let userMessage: string;
        let aiResult: unknown;

        if (typeof addChordPosition !== 'undefined') {
            userMessage = buildAddChordMessage(userPrompt, existingChords, addChordPosition);
            const aiObj = await createChordObjectGeneration(
                userMessage,
                SingleChordSchema
            );
            console.log('[API Raw AI Response for Single Chord] aiObj:', JSON.stringify(aiObj, null, 2));
            const parsed = SingleChordSchema.safeParse(aiObj);
            if (!parsed.success) {
                console.error("[API Single Chord Zod Error]", parsed.error.format());
                throw Object.assign(new Error('Invalid single-chord response from AI after refinement and validation.'), {
                    status: 500,
                    details: parsed.error.format()
                });
            }
            aiResult = parsed.data;
        } else {
            if (!userPrompt) {
                throw Object.assign(new Error('Prompt is required for progression generation.'), {
                    status: 400,
                });
            }
            userMessage = buildProgressionMessage(userPrompt, effectiveCount);
            const aiObj = await createChordObjectGeneration(
                userMessage,
                ChordProgressionSchema
            );
            console.log('[API Raw AI Response for Progression] aiObj:', JSON.stringify(aiObj, null, 2));
            const parsed = ChordProgressionSchema.safeParse(aiObj);
            if (!parsed.success) {
                console.error("[API Progression Zod Error]", parsed.error.format());
                throw Object.assign(new Error('Invalid progression response from AI after refinement and validation.'), {
                    status: 500,
                    details: parsed.error.format()
                });
            }
            aiResult = parsed.data;
        }

        return createResponse(aiResult);
    } catch (err: unknown) {
        console.error('[API POST] Error:', err);
        const e = err as ApiError;

        if (e.status && e.details) {
            return createResponse({ error: e.message || 'AI response validation failed.', details: e.details }, e.status);
        }
        // Check if the error comes from the AI SDK's generateObject itself due to schema mismatch
        if (e.message && (e.message.includes("response did not match schema") || e.message.includes("No object generated"))) {
            return createResponse({ error: "AI failed to generate a response matching the required format. Please try rephrasing your request or try again.", details: e.message }, 500);
        }
        return createResponse({ error: e.message || 'Internal server error' }, e.status || 500);
    }
}