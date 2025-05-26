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
Your goal is to generate chords that are musically correct, harmonically rich, interesting, and fitting for the given context.
Strive for good voice leading and musical coherence.

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
Create a musically compelling ${count}-chord progression based on this requirement: "${prompt}".

The progression should have a clear harmonic direction and sound cohesive.
Consider the musical context, style, function, or any specific constraints mentioned in the requirement.
Ensure smooth voice leading and transitions between chords.

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
    const requirement =
        prompt && prompt.trim()
            ? `Musical requirement: "${prompt}"`
            : hasExisting
                ? 'The new chord should create smooth harmonic transitions with the surrounding chords.'
                : 'The new chord should be musically interesting.';

    return [
        context + before + after,
        requirement,
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