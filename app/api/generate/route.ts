import OpenAI from 'openai';

interface ChordObject {
    chord: string;
    locked: boolean;
}

interface RequestBody {
    prompt?: string;
    existingChords?: ChordObject[];
    addChordPosition?: number;
}

interface ApiError extends Error {
    status?: number;
}

const { DEEPSEEK_API_KEY } = process.env;
if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY environment variable is not set.");
}

const openai = new OpenAI({
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

async function createChatCompletion(userMessage: string): Promise<string> {
    console.log('User message:', userMessage);

    const completion = await openai.chat.completions.create({
        model: MODEL_SELECTION.DEFAULT,
        messages: [
            { role: 'system', content: 'You are a chord generator.' },
            { role: 'user', content: userMessage },
        ],
    });

    const message = completion.choices[0]?.message?.content?.trim();
    if (!message) {
        throw new Error('No valid response from API');
    }
    return message;
}

function buildAddChordMessage(
    prompt: string | undefined,
    existingChords: ChordObject[],
    addChordPosition: number
): string {
    const hasExistingChords = existingChords.length > 0;
    const progression = createProgressionString(existingChords);

    const messageParts: string[] = [];
    if (hasExistingChords) {
        messageParts.push(`I currently have: ${progression}. Insert a new chord at position ${addChordPosition}.`);
        messageParts.push('Keep locked chords unchanged.');
    } else {
        messageParts.push('Generate a single chord for a new progression.');
    }

    if (prompt) {
        messageParts.push(`The tone must exactly match: "${prompt}".`);
    } else if (hasExistingChords) {
        messageParts.push('The new chord should maintain musical consistency with the existing progression.');
    }

    messageParts.push(`Respond ONLY with the chord name. ${CHORD_FORMATTING_RULES}`);
    return messageParts.join(' ');
}

function buildRegenerateMessage(prompt: string, existingChords: ChordObject[]): string {
    const progression = createProgressionString(existingChords);
    return `
Current progression: ${progression}.
Regenerate ONLY the unlocked chords with these requirements:
1. Strictly match tone: "${prompt}"
2. Keep the chord count exactly: ${existingChords.length}
3. Maintain musical logic with the locked chords
4. Do NOT change the order of chords

Respond ONLY with updated progression using hyphens.

${CHORD_FORMATTING_RULES}
  `.trim();
}

function buildNewProgressionMessage(prompt: string): string {
    return `
Generate a 4-chord progression for: "${prompt}".
Respond ONLY with 4 chords separated by hyphens.

${CHORD_FORMATTING_RULES}
  `.trim();
}

export async function POST(request: Request): Promise<Response> {
    try {
        const { prompt, existingChords = [], addChordPosition } = await request.json() as RequestBody;

        let userMessage: string;
        let result: unknown;

        if (typeof addChordPosition !== 'undefined') {
            userMessage = buildAddChordMessage(prompt, existingChords, addChordPosition);
            console.log('Add Chord Message:', userMessage);
            const newChord = await createChatCompletion(userMessage);
            console.log('Received new chord:', newChord);
            result = { chord: newChord };
        } else {
            if (!prompt) {
                throw Object.assign(new Error("Prompt is required for generation"), { status: 400 });
            }

            userMessage = existingChords.length > 0
                ? buildRegenerateMessage(prompt, existingChords)
                : buildNewProgressionMessage(prompt);

            console.log('Progression Generation Message:', userMessage);
            const chords = await createChatCompletion(userMessage);
            console.log("Received new progression:", chords);
            result = { chords };
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
