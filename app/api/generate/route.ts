import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY as string,
});

export async function POST(request: Request): Promise<Response> {
    const { prompt, existingChords, addChordPosition } = await request.json();

    // --- Handle Add Chord Case ---
    if (typeof addChordPosition !== "undefined") {
        // Create a progression string from the current chords
        const progression = Array.isArray(existingChords) && existingChords.length > 0
            ? existingChords
                .map((chordObj: { chord: string; locked: boolean }) =>
                    chordObj.locked ? `${chordObj.chord} (locked)` : chordObj.chord
                )
                .join(" - ")
            : "";

        const userMessage = progression
            ? `I currently have the following chord progression: ${progression}. I want to insert a new chord at position ${addChordPosition}. Please provide a chord that fits well in this position, keeping locked chords unchanged. Respond only with the chord name.`
            : `Generate a chord for a new progression. Respond only with the chord name.`;

        console.log("Message sent to API for adding chord:", userMessage);

        try {
            const completion = await openai.chat.completions.create({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: 'You are a chord generator.' },
                    { role: 'user', content: userMessage },
                ],
            });

            const message = completion.choices[0].message;
            if (!message || !message.content) {
                throw new Error("Invalid API response: missing message content");
            }
            const newChord = message.content.trim();
            console.log("Response from API (new chord):", newChord);

            return new Response(JSON.stringify({ chord: newChord }), { status: 200 });
        } catch (error: any) {
            console.error("Error during API call:", error.message);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }

    // --- Original Generation Logic ---
    if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    let userMessage: string;
    if (Array.isArray(existingChords) && existingChords.length > 0) {
        const progression = existingChords
            .map((chordObj: { chord: string; locked: boolean }) =>
                chordObj.locked ? `${chordObj.chord} (locked)` : chordObj.chord
            )
            .join(" - ");
        userMessage = `I currently have the following chord progression: ${progression}. Replace only the chords that are not locked with new suggestions and keep the locked chords unchanged. For the unlocked chords use new chords if possible. Respond only with the updated chord progression in the format C‑G‑Am‑F, without any extra text.`;
    } else {
        userMessage = `Generate a chord progression with 4 chords for "${prompt}". Respond only with the chord progression in the format C‑G‑Am‑F, without any extra text.`;
    }

    console.log("Message sent to API:", userMessage);

    try {
        const completion = await openai.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                { role: 'system', content: 'You are a chord generator.' },
                { role: 'user', content: userMessage },
            ],
        });
        const chords = completion.choices[0].message.content;
        console.log("Response from API:", chords);
        return new Response(JSON.stringify({ chords }), { status: 200 });
    } catch (error: any) {
        console.error("Error during API call:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
