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

        // SYSTEM MESSAGE: Focus on educational and clear music theory explanations.
        const systemMessage = `You are a knowledgeable and friendly music theory assistant. Your purpose is to help users understand chord progressions by explaining the underlying music theory in a clear, educational, and beginner-friendly manner. Use simple Markdown (like **bolding key terms**) where it enhances readability.`;

        // USER MESSAGE CONTENT: Simplified request for an educational explanation, emphasizing extreme brevity.
        const userMessageContent = `
Please explain the music theory behind the chord progression: **${progressionString}**.

Make your explanation educational and relatively easy for a beginner to understand.
Focus on the most important theoretical aspect or the overall feel.

**Keep the explanation very short and to the point, ideally 2-3 concise sentences.**
Start directly with the explanation.

For example, for C - G - Am - F: "This progression in **C Major** uses **G** (dominant) to create tension towards **Am** (relative minor), with **F** (subdominant) often leading back to C. It's a common, satisfying pop sound."
For Dm7 - G7 - Cmaj7: "A classic **ii-V-I** in C Major. **Dm7** leads to the tension of **G7** (dominant), which strongly resolves to the stable **Cmaj7** (tonic). Fundamental in jazz."
`.trim();

        const messages: CoreMessage[] = [
            { role: 'user', content: userMessageContent }
        ];

        const result = await streamText({
            model: deepseek(EXPLANATION_MODEL),
            system: systemMessage,
            messages: messages,
            temperature: 0.6, // Slightly lower temperature might help with conciseness
            maxTokens: 150, // Increased maxTokens to provide more buffer
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