import OpenAI from 'openai';

// Initialize the OpenAI SDK with DeepSeek configuration
const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY as string,
});

export async function POST(request: Request): Promise<Response> {
    const { prompt } = await request.json();

    if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    try {
        // Use the deepseek-reasoner model (DeepSeek-R1) for chord generation.
        const completion = await openai.chat.completions.create({
            model: 'deepseek-chat', // or use 'deepseek-reasoner' if preferred
            messages: [
                { role: 'system', content: 'You are a chord generator.' },
                { role: 'user', content: `Generate a chord progression with 4 chords for "${prompt}". Respond only with the chord progression in the format C‑G‑Am‑F, without any extra text.` }
            ],
        });
        const chords = completion.choices[0].message.content;
        return new Response(JSON.stringify({ chords }), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
