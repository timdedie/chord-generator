export const maxDuration = 60;

import { EditProgressionSchema } from '@/lib/schemas';
import { generateChordObject, createResponse } from '@/lib/ai';

interface RequestBody {
    chords?: string[];
    feedback?: string;
    prompt?: string;
}

interface ApiError extends Error {
    status?: number;
    details?: unknown;
}

function buildEditProgressionMessage(chords: string[], feedback: string, prompt?: string): string {
    const progressionStr = chords.join(' - ');

    let context = `Current progression: ${progressionStr}`;
    if (prompt?.trim()) {
        context += `\nOriginal creative direction: "${prompt}"`;
    }

    return `${context}

Revise this progression based on the following feedback from the user: "${feedback}"

Apply the requested change(s) faithfully while keeping the result musically coherent. Keep the chord count the same unless the feedback explicitly calls for adding or removing chords (the result must stay between 2 and 8 chords). Return the complete revised progression, not just the changed chords.`.trim();
}

export async function POST(request: Request): Promise<Response> {
    try {
        const body = (await request.json()) as RequestBody;
        const { chords = [], feedback, prompt } = body;

        if (!chords.length) {
            throw Object.assign(new Error('Chords are required to edit a progression.'), { status: 400 });
        }
        if (!feedback?.trim()) {
            throw Object.assign(new Error('Feedback is required to edit a progression.'), { status: 400 });
        }

        const userMessage = buildEditProgressionMessage(chords, feedback.trim(), prompt);
        const result = await generateChordObject(userMessage, EditProgressionSchema);
        return createResponse(result);

    } catch (err: unknown) {
        const e = err as ApiError;
        console.error('[API edit-progression] Error:', e.message);

        if (e.details) {
            return createResponse({ error: e.message, details: e.details }, e.status || 500);
        }
        return createResponse({ error: e.message || 'Internal server error' }, e.status || 500);
    }
}
