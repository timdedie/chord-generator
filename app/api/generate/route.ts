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

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY as string,
});

const MODEL_SELECTION = {
    DEFAULT: 'deepseek-chat',
    ADVANCED: 'deepseek-reasoner'
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
`;

function createResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function createProgressionString(chords: ChordObject[]): string {
    return chords
        .map((chord) => chord.locked ? `${chord.chord} (locked)` : chord.chord)
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
    if (!message) throw new Error('No valid response from API');
    console.log('API response:', message);
    return message;
}

export async function POST(request: Request): Promise<Response> {
    try {
        const { prompt, existingChords = [], addChordPosition } = await request.json() as RequestBody;

        // Handle Add Chord Case
        if (typeof addChordPosition !== 'undefined') {
            const hasExistingChords = existingChords.length > 0;
            const progression = createProgressionString(existingChords);

            const messageParts = [];
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

            const userMessage = messageParts.join(' ');
            console.log(userMessage);
            const newChord = await createChatCompletion(userMessage);
            console.log('Received new chord:', newChord);
            return createResponse({ chord: newChord });
        }

        // Handle Original Generation/Replacement
        if (!prompt) throw Object.assign(new Error('Prompt is required for generation'), { status: 400 });

        const hasExistingChords = existingChords.length > 0;
        const progression = createProgressionString(existingChords);

        const userMessage = hasExistingChords
            ? `Current progression: ${progression}. Regenerate ONLY unlocked chords with these requirements:
            1. Strictly match tone: "${prompt}"
            2. New chords must be different from original unlocked chords
            3. Maintain musical logic with locked chords
            Respond ONLY with updated progression using hyphens. ${CHORD_FORMATTING_RULES}`
                        : `Generate a 4-chord progression for: "${prompt}". 
            Respond ONLY with 4 chords separated by hyphens. ${CHORD_FORMATTING_RULES}`;
        const chords = await createChatCompletion(userMessage);
        console.log('Received new progression:', chords);
        return createResponse({ chords });

    } catch (error: unknown) {
        console.error('API Error:', error);
        const err = error as ApiError;
        return createResponse(
            { error: err.message || 'Internal server error' },
            err.status || 500
        );
    }
}