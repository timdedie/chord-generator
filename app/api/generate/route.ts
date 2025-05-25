import { createOpenAI } from '@ai-sdk/openai';
// Updated: Import generateObject and CoreMessage
import { generateObject, CoreMessage } from 'ai';
// Added: Import Zod
import { z } from 'zod';

interface SimpleChordObject {
    chord: string;
}

interface RequestBody {
    prompt?: string;
    existingChords?: SimpleChordObject[];
    addChordPosition?: number;
    numChords?: number;
    useAdvancedModel?: boolean;
}

interface ApiError extends Error {
    status?: number;
}

const { DEEPSEEK_API_KEY } = process.env;
if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY environment variable is not set.");
}

const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: DEEPSEEK_API_KEY,
});

const MODEL_SELECTION = {
    DEFAULT: 'deepseek-chat',
    ADVANCED: 'deepseek-reasoner',
};

const CHORD_FORMATTING_RULES = `
Chord formatting rules:
• Root = uppercase A–G (use # or b for accidentals)
• Major triad = just the root (C, F)
• Minor = “m” (Am, Dm7)
• Dominant seventh = “7” (G7)
• Major seventh = “maj7” (no △)
• Minor seventh = “m7”
• Suspended = “sus2” or “sus4”
• Extensions/alterations allowed: 9, add9, #5, b9, #11, 13, etc.
Guideline: Provide only the chord symbols according to these rules. For example, if generating ["Am", "G", "C"], the 'chords' array should be ["Am", "G", "C"]. If generating a single chord "F#m7", the 'chord' field should be "F#m7".
`.trim();

// Added: Zod Schemas for structured output
const ChordProgressionSchema = z.object({
    chords: z.array(z.string().describe("A musical chord symbol, strictly adhering to the CHORD_FORMATTING_RULES. Example: 'Am', 'G7', 'Cmaj7'.")).describe("An array of chord names forming a progression.")
});

const SingleChordSchema = z.object({
    chord: z.string().describe("A single musical chord symbol, strictly adhering to the CHORD_FORMATTING_RULES. Example: 'F#m7'.")
});

function createResponse(data: unknown, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function createSimpleProgressionString(chords: SimpleChordObject[]): string {
    return chords.map(chord => chord.chord).join(' - ');
}

// Renamed and Rewritten: Replaced createChatCompletion with createChordObjectGeneration
async function createChordObjectGeneration<T extends z.ZodTypeAny>(
    userMessage: string,
    useAdvanced: boolean,
    schema: T, // Schema for the desired object
    isRegeneration: boolean = false
): Promise<z.infer<T>> { // Return type is inferred from the Zod schema
    console.log('[API createChordObjectGeneration] User message to AI:\n', userMessage);

    const modelToUse = useAdvanced ? MODEL_SELECTION.ADVANCED : MODEL_SELECTION.DEFAULT;
    console.log(`[API createChordObjectGeneration] Using model: ${modelToUse} (Advanced: ${useAdvanced})`);

    // Updated: System message adjusted for object generation
    const systemMessage = `You are an expert musician and composer assisting with chord progressions.
Your goal is to generate chords that are musically correct, harmonically rich, interesting, and fitting for the given context.
Strive for good voice leading and avoid overly simplistic or cliché progressions unless the user's prompt explicitly asks for something very simple.
Pay close attention to the user's specific requests for chord count and desired tone.
You will provide your response as a structured JSON object according to the provided schema.
Ensure all chord symbols strictly adhere to the CHORD_FORMATTING_RULES.
${CHORD_FORMATTING_RULES}
    `.trim();

    const messages: CoreMessage[] = [
        { role: 'user', content: userMessage }
    ];

    let currentTemperature = isRegeneration ? 0.75 : 0.7;
    if (useAdvanced) {
        currentTemperature = isRegeneration ? 0.8 : 0.75;
    }
    console.log(`[API createChordObjectGeneration] Using temperature: ${currentTemperature}`);

    // Updated: Using generateObject instead of generateText
    const { object } = await generateObject({
        model: deepseek(modelToUse),
        schema: schema, // Pass the Zod schema
        system: systemMessage,
        messages: messages,
        temperature: currentTemperature,
        mode: 'json', // Explicitly request JSON mode if available/needed for the model
    });

    if (!object) { // Should not happen if generateObject resolves, but good for robustness
        throw new Error('No valid object response from API (Vercel AI SDK)');
    }
    return object;
}

// Updated: Prompt building functions now focus on content, not string format
function buildNewProgressionMessage(prompt: string, numChords: number): string {
    console.log(`[API buildNewProgressionMessage] Received numChords: ${numChords}`);
    const count = numChords >= 2 && numChords <= 8 ? numChords : 4;
    console.log(`[API buildNewProgressionMessage] Effective count for prompt: ${count}`);
    return `
Create a musically compelling ${count}-chord progression that evokes the feeling of: "${prompt}".
The progression should have a clear harmonic direction and sound cohesive.
Aim for a balance of familiarity and creativity.
Ensure smooth transitions between chords.
Provide the ${count} chord names as an array of strings in the 'chords' field of the JSON output.
Each chord name must strictly adhere to the CHORD_FORMATTING_RULES.
Do not include any other text, explanations, or conversational remarks in your response; only the JSON object.
  `.trim();
}

function buildRegenerateMessage(prompt: string, existingChords: SimpleChordObject[], requestedNumChords: number): string {
    console.log(`[API buildRegenerateMessage] Received requestedNumChords: ${requestedNumChords}`);
    const progressionContext = existingChords.length > 0 ? createSimpleProgressionString(existingChords) : "no previous progression";
    const targetLength = requestedNumChords >= 2 && requestedNumChords <= 8 ? requestedNumChords : (existingChords.length > 0 && existingChords.length >=2 && existingChords.length <=8 ? existingChords.length : 4);
    console.log(`[API buildRegenerateMessage] targetLength for new progression: ${targetLength}`);

    return `
You are tasked with creating a NEW ${targetLength}-chord progression.
The new progression MUST evoke the feeling of: "${prompt}".

If there was a previous progression, it was: ${progressionContext}. You can use this as inspiration for the vibe if you wish, but you are generating a completely new set of ${targetLength} chords based primarily on the prompt: "${prompt}".

Ensure the new progression:
1. Strongly evokes: "${prompt}".
2. Has exactly ${targetLength} chords.
3. Is musically compelling and a fresh take.
Provide the new, complete chord progression as an array of ${targetLength} chord names in the 'chords' field of the JSON output.
Each chord name must strictly adhere to the CHORD_FORMATTING_RULES.
Do not include any other text, explanations, or conversational remarks; only the JSON object.
  `.trim();
}

function buildAddChordMessage(
    prompt: string | undefined,
    existingChords: SimpleChordObject[],
    addChordPosition: number
): string {
    console.log(`[API buildAddChordMessage] Called for position ${addChordPosition}. Add-specific prompt: "${prompt}"`);
    const hasExistingChords = existingChords.length > 0;
    const progressionContextString = hasExistingChords ? createSimpleProgressionString(existingChords) : "no current progression";
    const messageParts: string[] = [];

    let contextDescription = "";
    if (hasExistingChords) {
        contextDescription = `I have the progression: ${progressionContextString}. I want to insert a new chord at position ${addChordPosition + 1} (0-indexed: ${addChordPosition}).`;
        const beforeChord = addChordPosition > 0 ? existingChords[addChordPosition - 1].chord : null;
        const afterChord = addChordPosition < existingChords.length ? existingChords[addChordPosition].chord : null;

        if (beforeChord && afterChord) {
            contextDescription += ` The new chord will be between ${beforeChord} and ${afterChord}.`;
        } else if (beforeChord) {
            contextDescription += ` The new chord will follow ${beforeChord}.`;
        } else if (afterChord) {
            contextDescription += ` The new chord will precede ${afterChord}.`;
        }
        messageParts.push(contextDescription);
    } else {
        messageParts.push('Generate an interesting single starting chord.');
    }

    if (prompt && prompt.trim() !== "add one suitable chord here" && prompt.trim() !== "") {
        messageParts.push(`The desired tone or function for this new chord is: "${prompt}".`);
    } else if (hasExistingChords) {
        messageParts.push('The new chord should be musically interesting and create a smooth, logical, or compelling harmonic transition with the surrounding chords.');
    } else {
        messageParts.push('The new chord should be musically interesting.');
    }

    messageParts.push('The new chord should add harmonic richness or serve a clear musical function (e.g., passing chord, preparing a cadence, adding color).');
    messageParts.push(`Provide the single new chord name as a string in the 'chord' field of the JSON output.`);
    messageParts.push(`The chord name must strictly adhere to the CHORD_FORMATTING_RULES.`);
    messageParts.push(`Do not include any other text, explanations, or conversational remarks; only the JSON object.`);
    return messageParts.join('\n\n');
}

export async function POST(request: Request): Promise<Response> {
    try {
        const requestBody = await request.json() as RequestBody;
        console.log("[API POST] Received request body:", JSON.stringify(requestBody, null, 2));

        const {
            prompt: overallOrActionPrompt,
            existingChords = [],
            addChordPosition,
            numChords,
            useAdvancedModel = false,
        } = requestBody;

        console.log(`[API POST] overallOrActionPrompt: "${overallOrActionPrompt}"`);
        console.log(`[API POST] numChordsFromClient: ${numChords}`);
        console.log(`[API POST] useAdvancedModel: ${useAdvancedModel}`);
        console.log(`[API POST] existingChords length: ${existingChords.length}`);
        console.log(`[API POST] addChordPosition: ${addChordPosition}`);

        let effectiveNumChords: number;
        if (typeof numChords === 'number' && numChords >= 2 && numChords <= 8) {
            effectiveNumChords = numChords;
        } else {
            effectiveNumChords = (existingChords.length >= 2 && existingChords.length <= 8) ? existingChords.length : 4;
            if (existingChords.length === 0 && (typeof numChords !== 'number' || numChords < 2 || numChords > 8) ) {
                effectiveNumChords = 4;
            }
            console.log(`[API POST] numChordsFromClient ("${numChords}") was invalid/undefined. Defaulting effectiveNumChords to ${effectiveNumChords}.`);
        }
        console.log(`[API POST] Calculated effectiveNumChords: ${effectiveNumChords}`);

        let userMessage: string;
        let result: unknown; // This will now be the structured object
        let isRegenerationCall = false;

        // Updated: Logic to call createChordObjectGeneration with the appropriate schema
        if (typeof addChordPosition !== 'undefined') {
            userMessage = buildAddChordMessage(overallOrActionPrompt, existingChords, addChordPosition);
            const aiObject = await createChordObjectGeneration(userMessage, useAdvancedModel, SingleChordSchema, isRegenerationCall);
            console.log('[API POST] Received new single chord object from AI:', aiObject);
            // Validate with Zod on the server side (optional, but good practice)
            const parsed = SingleChordSchema.safeParse(aiObject);
            if (!parsed.success) {
                console.error("[API POST] Zod validation failed for single chord:", parsed.error);
                throw new Error("AI returned an invalid object structure for a single chord.");
            }
            result = parsed.data; // { chord: "Am" }
        } else {
            if (!overallOrActionPrompt && existingChords.length === 0) {
                throw Object.assign(new Error("Prompt is required for initial generation."), { status: 400 });
            }
            const regenerationPrompt = overallOrActionPrompt || "Continue the progression in a similar style";

            if (existingChords.length > 0) {
                userMessage = buildRegenerateMessage(regenerationPrompt, existingChords, effectiveNumChords);
                isRegenerationCall = true;
            } else {
                userMessage = buildNewProgressionMessage(regenerationPrompt, effectiveNumChords);
            }
            const aiObject = await createChordObjectGeneration(userMessage, useAdvancedModel, ChordProgressionSchema, isRegenerationCall);
            console.log("[API POST] Received new progression object from AI:", aiObject);
            // Validate with Zod
            const parsed = ChordProgressionSchema.safeParse(aiObject);
            if (!parsed.success) {
                console.error("[API POST] Zod validation failed for chord progression:", parsed.error);
                throw new Error("AI returned an invalid object structure for chord progression.");
            }
            result = parsed.data; // { chords: ["C", "G", "Am", "F"] }
        }

        return createResponse(result);
    } catch (error: unknown) {
        console.error('[API POST] Error:', error);
        const err = error as ApiError; // Consider checking for Vercel AI SDK specific error types too
        // If error is a ZodError, you might want to return a more specific message
        if (error instanceof z.ZodError) {
            return createResponse(
                { error: 'Invalid data format received from AI.', details: error.format() },
                500
            );
        }
        return createResponse(
            { error: err.message || 'Internal server error' },
            err.status || 500
        );
    }
}