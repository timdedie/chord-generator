import { createOpenAI } from '@ai-sdk/openai';
import { generateText, CoreMessage } from 'ai';

interface SimpleChordObject {
    chord: string;
}

interface RequestBody {
    prompt?: string;
    existingChords?: SimpleChordObject[];
    addChordPosition?: number;
    numChords?: number;
    useAdvancedModel?: boolean; // New field for model selection
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
    ADVANCED: 'deepseek-reasoner', // Make sure this is the correct model identifier
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
`.trim();

function createResponse(data: unknown, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function createSimpleProgressionString(chords: SimpleChordObject[]): string {
    return chords.map(chord => chord.chord).join(' - ');
}

async function createChatCompletion(
    userMessage: string,
    useAdvanced: boolean,
    isRegeneration: boolean = false // This flag can influence temperature or minor prompt details
): Promise<string> {
    console.log('[API createChatCompletion] User message to AI:\n', userMessage);

    const modelToUse = useAdvanced ? MODEL_SELECTION.ADVANCED : MODEL_SELECTION.DEFAULT;
    console.log(`[API createChatCompletion] Using model: ${modelToUse} (Advanced: ${useAdvanced})`);

    const systemMessage = `You are an expert musician and composer assisting with chord progressions. Your goal is to generate chords that are musically correct, harmonically rich, interesting, and fitting for the given context. Strive for good voice leading and avoid overly simplistic or cliché progressions unless the user's prompt explicitly asks for something very simple. Pay close attention to the user's specific requests for chord count and desired tone. **It is absolutely critical that you strictly adhere to the output format requested in the user's message. Your response MUST contain ONLY the specified chord data and NO other text, explanations, or conversational filler whatsoever.**`;

    const messages: CoreMessage[] = [
        { role: 'user', content: userMessage }
    ];

    // Example: Potentially slightly higher temperature for advanced model if desired
    let currentTemperature = isRegeneration ? 0.75 : 0.7;
    if (useAdvanced) {
        currentTemperature = isRegeneration ? 0.8 : 0.75; // Slightly higher for advanced if desired
    }
    console.log(`[API createChatCompletion] Using temperature: ${currentTemperature}`);

    const { text } = await generateText({
        model: deepseek(modelToUse),
        system: systemMessage,
        messages: messages,
        temperature: currentTemperature,
    });

    if (!text) {
        throw new Error('No valid response from API (Vercel AI SDK)');
    }
    return text.trim();
}

function buildNewProgressionMessage(prompt: string, numChords: number): string {
    console.log(`[API buildNewProgressionMessage] Received numChords: ${numChords}`);
    const count = numChords >= 2 && numChords <= 8 ? numChords : 4;
    console.log(`[API buildNewProgressionMessage] Effective count for prompt: ${count}`);
    return `
Create a musically compelling ${count}-chord progression that evokes the feeling of: "${prompt}".
The progression should have a clear harmonic direction and sound cohesive.
Aim for a balance of familiarity and creativity.
Ensure smooth transitions between chords.

**IMPORTANT: Your response MUST consist ONLY of the ${count} chord names, separated by hyphens.**
For example, if the chords are C, G, Am, F, your response must be: C-G-Am-F
Do NOT include any other text, explanations, or conversational remarks.

${CHORD_FORMATTING_RULES}
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

**IMPORTANT: Your response MUST consist ONLY of the complete, new chord progression as a hyphen-separated list of ${targetLength} chord names.**
For example, if the new progression is Dm-G7-Cmaj7-F, your response must be: Dm-G7-Cmaj7-F
Do NOT include any other text, explanations, or conversational remarks.

${CHORD_FORMATTING_RULES}
  `.trim();
}

function buildAddChordMessage(
    prompt: string | undefined, // This prompt is specific to the chord being added
    existingChords: SimpleChordObject[], // Overall progression context
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

    if (prompt && prompt.trim() !== "add one suitable chord here" && prompt.trim() !== "") { // Check if a meaningful prompt was passed for this specific chord
        messageParts.push(`The desired tone or function for this new chord is: "${prompt}".`);
    } else if (hasExistingChords) {
        messageParts.push('The new chord should be musically interesting and create a smooth, logical, or compelling harmonic transition with the surrounding chords.');
    } else {
        messageParts.push('The new chord should be musically interesting.');
    }


    messageParts.push('The new chord should add harmonic richness or serve a clear musical function (e.g., passing chord, preparing a cadence, adding color).');
    messageParts.push(`**IMPORTANT: Your response MUST consist ONLY of the single chord name for the new chord.**`);
    messageParts.push(`For example, if the new chord is F#m7, your response must be: F#m7`);
    messageParts.push(CHORD_FORMATTING_RULES);
    return messageParts.join('\n\n');
}

export async function POST(request: Request): Promise<Response> {
    try {
        const requestBody = await request.json() as RequestBody;
        console.log("[API POST] Received request body:", JSON.stringify(requestBody, null, 2));

        const {
            // 'prompt' from requestBody is the *overall* prompt for the progression
            // or a specific instruction if 'addChordPosition' is present.
            prompt: overallOrActionPrompt,
            existingChords = [],
            addChordPosition,
            numChords,
            useAdvancedModel = false, // Default to false if not provided
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
            // If numChords is not valid, default based on existing or to 4
            effectiveNumChords = (existingChords.length >= 2 && existingChords.length <= 8) ? existingChords.length : 4;
            if (existingChords.length === 0 && (typeof numChords !== 'number' || numChords < 2 || numChords > 8) ) {
                effectiveNumChords = 4; // Specifically for new generation if client sent bad numChords
            }
            console.log(`[API POST] numChordsFromClient ("${numChords}") was invalid/undefined. Defaulting effectiveNumChords to ${effectiveNumChords}.`);
        }
        console.log(`[API POST] Calculated effectiveNumChords: ${effectiveNumChords}`);

        let userMessage: string;
        let result: unknown;
        let isRegenerationCall = false;

        if (typeof addChordPosition !== 'undefined') {
            // For addChordMessage, the 'prompt' argument is the specific instruction for that chord.
            userMessage = buildAddChordMessage(overallOrActionPrompt, existingChords, addChordPosition);
        } else {
            if (!overallOrActionPrompt && existingChords.length === 0) { // Require prompt only if generating from scratch
                throw Object.assign(new Error("Prompt is required for initial generation."), { status: 400 });
            }
            const regenerationPrompt = overallOrActionPrompt || "Continue the progression in a similar style"; // Fallback prompt for regeneration if none provided

            if (existingChords.length > 0) {
                userMessage = buildRegenerateMessage(regenerationPrompt, existingChords, effectiveNumChords);
                isRegenerationCall = true;
            } else { // Initial generation
                userMessage = buildNewProgressionMessage(regenerationPrompt, effectiveNumChords);
            }
        }

        const aiResponse = await createChatCompletion(userMessage, useAdvancedModel, isRegenerationCall);

        if (typeof addChordPosition !== 'undefined') {
            console.log('[API POST] Received new single chord from AI:', aiResponse);
            result = { chord: aiResponse };
        } else {
            console.log("[API POST] Received new progression from AI:", aiResponse);
            result = { chords: aiResponse };
        }

        return createResponse(result);
    } catch (error: unknown) {
        console.error('[API POST] Error:', error);
        const err = error as ApiError;
        return createResponse(
            { error: err.message || 'Internal server error' },
            err.status || 500
        );
    }
}