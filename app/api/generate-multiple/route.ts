import { createMultipleProgressionsSchema } from '@/lib/schemas';
import { generateChordObject, createResponse } from '@/lib/ai';

interface RequestBody {
    prompt: string;
    numChords: number;
    existingProgressions?: { chords: string[]; style: string }[];
}

interface ApiError extends Error {
    status?: number;
    details?: unknown;
}

function buildMultipleProgressionsMessage(
    prompt: string,
    numChords: number,
    existingProgressions?: { chords: string[]; style: string }[]
): string {
    let existingSection = '';
    if (existingProgressions && existingProgressions.length > 0) {
        const listing = existingProgressions
            .map((p, i) => `  ${i + 1}. [${p.style}] ${p.chords.join(' \u2192 ')}`)
            .join('\n');
        existingSection = `\n\nThe user already has these progressions. Generate completely DIFFERENT ones \u2014 different keys, modes, and harmonic approaches. Do NOT repeat or closely resemble any of these:\n${listing}`;
    }

    return `
Create 3 distinct ${numChords}-chord progressions: "${prompt}"${existingSection}

Each should take a genuinely different harmonic approach \u2014 not just the same chords reharmonized:
- **Progression 1:** A grounded, satisfying interpretation
- **Progression 2:** A richer, more harmonically adventurous take
- **Progression 3:** Something unexpected \u2014 a different key, mode, or harmonic language entirely

Make every progression sound intentional and coherent on its own. Vary the keys \u2014 don't put all three in the same key.

Label each with a 2-4 word style descriptor that captures its character (e.g. "Warm Jazz", "Dark Cinematic", "Bright Modal").
  `.trim();
}

export async function POST(request: Request): Promise<Response> {
    try {
        const body = (await request.json()) as RequestBody;
        const { prompt, numChords, existingProgressions } = body;

        if (!prompt) {
            return createResponse({ error: 'Prompt is required.' }, 400);
        }

        const count = (typeof numChords === 'number' && numChords >= 2 && numChords <= 8) ? numChords : 4;
        const userMessage = buildMultipleProgressionsMessage(prompt, count, existingProgressions);
        const schema = createMultipleProgressionsSchema(count);

        const result = await generateChordObject(userMessage, schema, 1.2);

        const progressionsWithIds = result.progressions.map((prog: { chords: string[]; style: string }, index: number) => ({
            id: `prog-${Date.now()}-${index}`,
            chords: prog.chords,
            style: prog.style,
        }));

        return createResponse({ progressions: progressionsWithIds });

    } catch (err: unknown) {
        const e = err as ApiError;
        console.error('[API generate-multiple] Error:', e.message);

        if (e.details) {
            return createResponse({ error: e.message, details: e.details }, e.status || 500);
        }
        return createResponse({ error: e.message || 'Internal server error' }, e.status || 500);
    }
}
