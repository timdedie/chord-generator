import { createOpenAI } from '@ai-sdk/openai';
import { streamText, CoreMessage } from 'ai';

// Ensure the DEEPSEEK_API_KEY is available
const { DEEPSEEK_API_KEY } = process.env;
if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY environment variable is not set.");
}

const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: DEEPSEEK_API_KEY,
});

const EXPLANATION_MODEL = 'deepseek-chat';

export async function POST(request: Request) {
    try {
        const { chords } = await request.json() as { chords: string[] };

        if (!chords || chords.length === 0) {
            return new Response(JSON.stringify({ error: "No chords provided for explanation." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const progressionString = chords.join(' - ');

        // SYSTEM MESSAGE: Confident, clear, beginner-friendly tone
        const systemMessage = `You are an expert music theory guide, explaining chord progressions with clarity and confidence. Your goal is to make the music theory behind a progression accessible and understandable for a beginner. Explain the established theoretical functions as clear aspects of the progression's design. Use simple Markdown (like **bold** or *italics*) for emphasis, but keep the overall text very short. Avoid overly repetitive phrasing across different explanations.`;

        // USER MESSAGE CONTENT: More general focus points, example illustrates style not rigid structure
        const userMessageContent = `
Please provide a **very short, clear, and beginner-friendly music theory explanation** for the chord progression: ${progressionString}.
Present the theory as inherent to the progression's structure, with confidence and certainty, avoiding any speculative language or first-person ("I") statements.

Consider these aspects when forming your explanation:
1.  **Tonal Center/Key (if applicable):** If the progression has a clear tonal center or key, identify it and briefly explain its significance in simple terms (e.g., as the point of resolution or stability).
2.  **Function of Key Chords:** Describe the role of one or two important chords in establishing the harmonic direction or feeling, using simple language (e.g., how a chord creates tension, leads to another, or provides stability).
3.  **Harmonic Movement/Flow:** Briefly describe the overall journey or flow of the chords in a way a beginner can grasp (e.g., "The chords move from a point of rest, build some anticipation, and then return to a sense of completion.").

**Keep the entire explanation to a maximum of 3-4 short sentences (around 50-75 words).**
Use simple, direct language. The explanation should be unique and insightful for the given progression, not a generic template.
Use simple Markdown (like **bolding key terms** or *italicizing simple concepts*) if it helps.
Start directly with the explanation.

Example of the *style and simplicity desired* (but do not copy this structure or specific terms like 'home base' if not appropriate for every progression):
For C - G - Am - F: "This progression in **C Major** uses the **G chord** to create a strong pull towards the **Am** (a softer, related sound to C), before moving to the **F chord**, which often prepares a return to C. It's a common way to create a cycle that feels both familiar and satisfying."
For Dm - G7 - Cmaj7: "Here, the **Dm chord** starts a classic movement. The **G7** then builds significant tension that beautifully resolves to the stable **Cmaj7 chord**. This 'two-five-one' movement is a cornerstone of many musical styles."
`.trim();

        const messages: CoreMessage[] = [
            { role: 'user', content: userMessageContent }
        ];

        const result = await streamText({
            model: deepseek(EXPLANATION_MODEL),
            system: systemMessage,
            messages: messages,
            temperature: 0.6, // Adjusted temperature for a balance of creativity and focus
        });

        return result.toTextStreamResponse();

    } catch (error: unknown) {
        console.error('API Error in /api/explain-progression:', error);
        const err = error as Error & { status?: number };
        return new Response(
            JSON.stringify({ error: err.message || 'Internal server error' }),
            { status: err.status || 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}