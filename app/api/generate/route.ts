import { createOpenAI } from '@ai-sdk/openai';
import { generateText, CoreMessage } from 'ai';

interface ChordObject {
    chord: string;
    locked: boolean;
}

// 1. Remove 'model' from RequestBody interface
interface RequestBody {
    prompt?: string;
    existingChords?: ChordObject[];
    addChordPosition?: number;
    // model?: string; // Removed
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

// MODEL_SELECTION is still useful if you decide to hardcode a different default later
const MODEL_SELECTION = {
    DEFAULT: 'deepseek-chat',
    ADVANCED: 'deepseek-reasoner', // Kept for reference, but not actively used by switcher
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

function createProgressionString(chords: ChordObject[]): string {
    return chords
        .map(chord => chord.locked ? `${chord.chord} (locked)` : chord.chord)
        .join(' - ');
}

// 2. Simplify createChatCompletion, always use default model
async function createChatCompletion(
    userMessage: string,
    isRegeneration: boolean = false
): Promise<string> {
    console.log('User message (to Vercel AI SDK):', userMessage);
    const modelToUse = MODEL_SELECTION.DEFAULT;
    console.log(`Using model: ${modelToUse}`);

    const systemMessage = `You are an expert musician and composer assisting with chord progressions. Your goal is to generate chords that are musically correct, harmonically rich, interesting, and fitting for the given context. Strive for good voice leading and avoid overly simplistic or cliché progressions unless the user's prompt explicitly asks for something very simple. Pay close attention to the user's specific requests regarding locked chords, chord count, and desired tone. **It is absolutely critical that you strictly adhere to the output format requested in the user's message. Your response MUST contain ONLY the specified chord data and NO other text, explanations, or conversational filler whatsoever.**`;

    const messages: CoreMessage[] = [
        { role: 'user', content: userMessage }
    ];

    const currentTemperature = (isRegeneration && userMessage.includes("completely NEW")) ? 0.8 : (isRegeneration ? 0.75 : 0.7);
    console.log(`Using temperature: ${currentTemperature}`);

    const { text } = await generateText({
        model: deepseek(modelToUse), // Use the default model instance
        system: systemMessage,
        messages: messages,
        temperature: currentTemperature,
    });

    if (!text) {
        throw new Error('No valid response from API (Vercel AI SDK)');
    }
    return text.trim();
}

function buildNewProgressionMessage(prompt: string): string {
    return `
Create a musically compelling 4-chord progression that evokes the feeling of: "${prompt}".
The progression should have a clear harmonic direction and sound cohesive.
Aim for a balance of familiarity and creativity, perhaps incorporating at least one chord that adds unique color or tension (e.g., a 7th, extended chord, altered chord, or a borrowed chord) if it fits the requested tone.
Ensure smooth transitions between chords.

**IMPORTANT: Your response MUST consist ONLY of the 4 chord names, separated by hyphens.**
For example, if the chords are C, G, Am, F, your response must be: C-G-Am-F
Do NOT include any other text, explanations, or conversational remarks.

${CHORD_FORMATTING_RULES}
  `.trim();
}

function buildRegenerateMessage(prompt: string, existingChords: ChordObject[]): string {
    const progression = createProgressionString(existingChords);
    const unlockedChordsCount = existingChords.filter(c => !c.locked).length;

    if (existingChords.length > 0 && unlockedChordsCount === existingChords.length) {
        console.log(`Regenerating all ${existingChords.length} chords based on new prompt.`);
        return `
You are tasked with creating a completely NEW ${existingChords.length}-chord progression.
The new progression MUST evoke the feeling of: "${prompt}".

**CRITICAL INSTRUCTION:** You are to generate a fresh set of ${existingChords.length} chords based *solely* on the new prompt: "${prompt}".
Do NOT try to simply modify or slightly alter any previous chord ideas. The goal is a brand new interpretation.
The previous progression was: ${progression}. Disregard those specific chord names entirely for this task.

Ensure the new progression:
1. Strongly evokes: "${prompt}".
2. Has exactly ${existingChords.length} chords.
3. Is musically compelling and a fresh take. Avoid minor adjustments to any prior ideas.

**IMPORTANT: Your response MUST consist ONLY of the complete, updated chord progression as a hyphen-separated list of ${existingChords.length} chord names.**
For example, if the new progression is Dm-G7-Cmaj7-F, your response must be: Dm-G7-Cmaj7-F
Do NOT include any other text, explanations, or conversational remarks.

${CHORD_FORMATTING_RULES}
  `.trim();
    }

    let instructionForUnlocked = `I want you to creatively reimagine and regenerate ONLY the ${unlockedChordsCount > 0 ? unlockedChordsCount : 'ALL'} unlocked chord(s).`;
    if (unlockedChordsCount === 0 && existingChords.length > 0) {
        instructionForUnlocked = `All current chords are locked. I want a fresh interpretation for this regeneration. Please regenerate ALL ${existingChords.length} chords based *only* on the new prompt's tone, effectively treating them as if they were unlocked for this specific regeneration task. (This specific instruction path implies a full regeneration despite 'locked' status - prioritize the prompt for a new set).`;
    }

    return `
I have the following chord progression: ${progression}.
${instructionForUnlocked}
The **primary goal** for these regenerated (previously unlocked or now treated as unlocked) chords is to **strongly and freshly evoke the new tone**: "${prompt}".
Do not feel constrained by the previous identities of any chords you are regenerating; they should change significantly if the new prompt's tone warrants it.

Critical rules:
1. New regenerated chords must create a strong musical relationship with any explicitly locked chords (if any). Consider voice leading and harmonic flow.
2. The overall progression must strongly evoke: "${prompt}".
3. Total chord count must remain exactly ${existingChords.length}.
4. Positions and names of (locked) chords MUST NOT change. Do not change chord order.
5. Regenerated chords should be interesting, musically satisfying, and a fresh take. Avoid minor adjustments.

**IMPORTANT: Your response MUST consist ONLY of the complete, updated chord progression as a hyphen-separated list of ${existingChords.length} chord names.**
For example, if the updated progression is Dm-G7-Cmaj7-F, your response must be: Dm-G7-Cmaj7-F
Do NOT include any other text, explanations, or conversational remarks.

${CHORD_FORMATTING_RULES}
  `.trim();
}

function buildAddChordMessage(
    prompt: string | undefined,
    existingChords: ChordObject[],
    addChordPosition: number
): string {
    const hasExistingChords = existingChords.length > 0;
    const progression = createProgressionString(existingChords);
    const messageParts: string[] = [];

    let contextDescription = "";
    if (hasExistingChords) {
        contextDescription = `I have the progression: ${progression}. I want to insert a new chord at position ${addChordPosition} (making it the ${addChordPosition}${addChordPosition === 1 ? 'st' : addChordPosition === 2 ? 'nd' : addChordPosition === 3 ? 'rd' : 'th'} chord in the new sequence).`;
        const beforeChordObject = addChordPosition > 1 ? existingChords[addChordPosition - 2] : null;
        const afterChordObject = addChordPosition <= existingChords.length ? existingChords[addChordPosition - 1] : null;
        const beforeChord = beforeChordObject ? (beforeChordObject.locked ? `${beforeChordObject.chord} (locked)`: beforeChordObject.chord) : null;
        const afterChord = afterChordObject ? (afterChordObject.locked ? `${afterChordObject.chord} (locked)`: afterChordObject.chord) : null;

        if (beforeChord && afterChord) {
            contextDescription += ` The new chord will be between ${beforeChord} and ${afterChord}.`;
        } else if (beforeChord) {
            contextDescription += ` The new chord will follow ${beforeChord}.`;
        } else if (afterChord) {
            contextDescription += ` The new chord will precede ${afterChord}.`;
        }
        messageParts.push(contextDescription);
        messageParts.push('Any (locked) chords in the existing progression must remain unchanged in their original relative order.');
    } else {
        messageParts.push('Generate an interesting single starting chord.');
    }

    if (prompt) {
        messageParts.push(`The desired tone for this new chord (and the overall progression if this is the first chord) is: "${prompt}".`);
    } else if (hasExistingChords) {
        messageParts.push('The new chord should be musically interesting and create a smooth, logical, or compelling harmonic transition with the surrounding chords.');
    }

    messageParts.push('The new chord should add harmonic richness or serve a clear musical function (e.g., passing chord, preparing a cadence, adding color).');
    messageParts.push(`**IMPORTANT: Your response MUST consist ONLY of the single chord name for the new chord.**`);
    messageParts.push(`For example, if the new chord is F#m7, your response must be: F#m7`);
    messageParts.push(`Do NOT include any other text, explanations, or conversational remarks.`);
    messageParts.push(CHORD_FORMATTING_RULES);
    return messageParts.join('\n\n');
}

export async function POST(request: Request): Promise<Response> {
    try {
        // 3. Remove 'model' (or 'requestedModel') from destructuring
        const {
            prompt,
            existingChords = [],
            addChordPosition,
            // model: requestedModel // Removed
        } = await request.json() as RequestBody;

        let userMessage: string;
        let result: unknown;
        let isRegenerationCall = false;

        // No need for modelToUse variable anymore, createChatCompletion uses default
        // const modelToUse = MODEL_SELECTION.DEFAULT; // Removed

        if (typeof addChordPosition !== 'undefined') {
            userMessage = buildAddChordMessage(prompt, existingChords, addChordPosition);
        } else {
            if (!prompt) {
                throw Object.assign(new Error("Prompt is required for generation"), { status: 400 });
            }
            if (existingChords.length > 0) {
                userMessage = buildRegenerateMessage(prompt, existingChords);
                isRegenerationCall = true;
            } else {
                userMessage = buildNewProgressionMessage(prompt);
            }
        }

        // 4. Call createChatCompletion without the model argument
        const aiResponse = await createChatCompletion(userMessage, isRegenerationCall);

        if (typeof addChordPosition !== 'undefined') {
            console.log('Received new chord:', aiResponse);
            result = { chord: aiResponse };
        } else {
            console.log("Received new progression:", aiResponse);
            result = { chords: aiResponse };
        }

        return createResponse(result);
    } catch (error: unknown) {
        console.error('API Error:', error);
        const err = error as ApiError;
        return createResponse(
            { error: err.message || 'Internal server error' },
            err.status || 500
        );
    }
}