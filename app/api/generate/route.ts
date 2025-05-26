import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject, CoreMessage } from 'ai';
import { z } from 'zod';

interface SimpleChordObject {
    chord: string;
}

interface RequestBody {
    prompt?: string;
    existingChords?: SimpleChordObject[];
    addChordPosition?: number;
    numChords?: number;
    useHighCreativity?: boolean;
}

interface ApiError extends Error {
    status?: number;
}

const { GOOGLE_GENERATIVE_AI_API_KEY } = process.env;
if (!GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set.');
}

const googleAIProvider = createGoogleGenerativeAI({});
const PRIMARY_MODEL_ID = 'gemini-2.5-flash-preview-05-20';
// const PRIMARY_MODEL_ID = 'gemini-2.0-flash-lite';


const CREATIVITY_SETTINGS = {
    standard: {
        temperature: 0.6,
        providerOptions: undefined,
    },
    high: {
        temperature: 0.85,
        providerOptions: undefined,
    },
};

const CHORD_FORMATTING_RULES = `
Chord formatting rules:
• Root = uppercase A–G (use # or b for accidentals)
• Major triad = just the root (C, F)
• Minor = "m" (Am, Dm7)
• Dominant seventh = "7" (G7)
• Major seventh = "maj7" (no △)
• Minor seventh = "m7"
• Suspended = "sus2" or "sus4"
• Extensions/alterations allowed: 9, add9, #5, b9, #11, 13, etc.
Guideline: Provide only the chord symbols according to these rules. For example, if generating ["Am", "G", "C"], the 'chords' array should be ["Am", "G", "C"]. If generating a single chord "F#m7", the 'chord' field should be "F#m7".
`.trim();

const ChordProgressionSchema = z.object({
    chords: z
        .array(
            z
                .string()
                .describe("A musical chord symbol, strictly adhering to the CHORD_FORMATTING_RULES. Example: 'Am', 'G7', 'Cmaj7'.")
        )
        .describe('An array of chord names forming a progression.'),
});

const SingleChordSchema = z.object({
    chord: z
        .string()
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
    isHighCreativityMode: boolean,
    schema: T
): Promise<z.infer<T>> {
    console.log('[API createChordObjectGeneration] User message to AI:\n', userMessage);

    const modelClient = googleAIProvider(PRIMARY_MODEL_ID);
    const creativityConfig = isHighCreativityMode
        ? CREATIVITY_SETTINGS.high
        : CREATIVITY_SETTINGS.standard;

    console.log(`[API createChordObjectGeneration] Using temperature: ${creativityConfig.temperature}`);

    const systemMessage = `
You are an expert musician and composer specializing in chord progressions.
Your goal is to generate chords that are musically correct, harmonically rich, **distinctive, and avoid clichés unless specifically appropriate for the request.**
Strive for good voice leading, musical coherence, and progressions that are memorable and non-generic.

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
        temperature: creativityConfig.temperature,
        providerOptions: creativityConfig.providerOptions,
        mode: 'json',
    });

    if (!object) {
        throw new Error('No valid object response from API (Vercel AI SDK)');
    }
    return object;
}

function buildProgressionMessage(prompt: string, numChords: number): string {
    const count = numChords >= 2 && numChords <= 8 ? numChords : 4;
    return `
Create a ${count}-chord progression based on this requirement: "${prompt}".

Strive for a progression that is not only musically compelling and cohesive with a clear harmonic direction, but also **memorable and distinctive.**
**Avoid overly common or predictable harmonic clichés (e.g., I-V-vi-IV in C Major unless the prompt specifically asks for a very common pop sound). Instead, explore more nuanced and creative harmonic pathways.**
Consider incorporating elements like:
- **Unexpected but satisfying resolutions.**
- **Subtle modal colors (e.g., hints of Lydian, Dorian, Mixolydian b6) or brief tonicizations to secondary chords.**
- **Chords with interesting extensions (9ths, 11ths, 13ths) or alterations (b5, #5, b9, #9, #11) that enhance the mood without sounding out of place.**
- **A sense of harmonic storytelling or emotional arc within the progression.**
- **If the prompt is for a specific genre, lean into sophisticated versions of that genre's harmony rather than the most basic interpretation.**

Consider the musical context, style, function, or any specific constraints mentioned in the requirement.
Ensure smooth voice leading (imagine melodic lines connecting the notes of successive chords) and strong melodic potential in the implied top notes of the chords.

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
        requirementInstruction = `Musical requirement for the new chord: "${prompt}". The new chord should creatively fulfill this while integrating seamlessly and interestingly into the existing harmonic context.`;
    } else if (hasExisting) {
        requirementInstruction = `The new chord should create smooth harmonic transitions with the surrounding chords, **while also adding a unique color, an unexpected (but fitting) harmonic twist, or a richer voicing that enhances the existing progression. Avoid a purely functional or predictable choice unless it's the only way to maintain coherence. Think about what chord could elevate this progression.**`;
    } else {
        requirementInstruction = `The new chord should be musically interesting and serve as a **strong, non-generic starting point for a compelling progression. Think about chords that evoke a specific mood, have a rich harmonic texture, or suggest an intriguing direction.**`;
    }

    return [
        context + before + after,
        requirementInstruction,
        'When selecting the chord, consider elements like:',
        '- **Excellent voice leading into and out of the new chord.**',
        '- **Introducing a subtle harmonic surprise, richness, or a borrowed chord if appropriate.**',
        '- **Using extensions or alterations that add character without clashing or sounding forced.**',
        '- **How this single chord choice can make the overall progression less generic.**',
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
            useHighCreativity = false,
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
                useHighCreativity,
                SingleChordSchema
            );
            const parsed = SingleChordSchema.safeParse(aiObj);
            if (!parsed.success) throw new Error('Invalid single-chord response.');
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
                useHighCreativity,
                ChordProgressionSchema
            );
            const parsed = ChordProgressionSchema.safeParse(aiObj);
            if (!parsed.success) throw new Error('Invalid progression response.');
            aiResult = parsed.data;
        }

        return createResponse(aiResult);
    } catch (err: unknown) {
        console.error('[API POST] Error:', err);
        const e = err as ApiError;
        if (err instanceof z.ZodError) {
            return createResponse({ error: 'Invalid AI response format.', details: err.format() }, 500);
        }
        return createResponse({ error: e.message || 'Internal server error' }, e.status || 500);
    }
}