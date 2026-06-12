import { auth } from '@clerk/nextjs/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { premiumGenerations } from '@/lib/db/schema';
import { createMultipleProgressionsSchema } from '@/lib/schemas';
import { generateChordObject, createResponse, STANDARD_MODEL_ID, PREMIUM_MODEL_ID, FREE_PREMIUM_GENERATIONS_PER_DAY, PRO_PREMIUM_GENERATIONS_PER_DAY } from '@/lib/ai';
import { getUserRole } from '@/lib/premium';
import { checkRateLimit } from '@/lib/rateLimit';

export const runtime = 'edge';
export const maxDuration = 25;

interface RequestBody {
    prompt: string;
    numChords: number;
    existingProgressions?: { chords: string[]; style: string }[];
    premium?: boolean;
}

function todayDate(): string {
    return new Date().toISOString().slice(0, 10);
}

/** Atomically claims one of today's premium generation slots for a user. Returns true if claimed. */
async function claimPremiumSlot(userId: string, limit: number): Promise<boolean> {
    const rows = await db
        .insert(premiumGenerations)
        .values({ userId, date: todayDate(), count: 1 })
        .onConflictDoUpdate({
            target: [premiumGenerations.userId, premiumGenerations.date],
            set: { count: sql`${premiumGenerations.count} + 1` },
            where: sql`${premiumGenerations.count} < ${limit}`,
        })
        .returning();

    return rows.length > 0;
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
            .map((p, i) => `  ${i + 1}. [${p.style}] ${p.chords.join(' → ')}`)
            .join('\n');
        existingSection = `\n\nThe user already has these progressions. Generate completely DIFFERENT ones — different keys, modes, and harmonic approaches. Do NOT repeat or closely resemble any of these:\n${listing}`;
    }

    return `
Create 3 distinct ${numChords}-chord progressions for: "${prompt}"${existingSection}

These are *alternatives* the user picks between — they don't need to relate to each other. Each one stands on its own. The hard requirement: the chords *within* a single progression must flow coherently and sound intentional together.

Give the user three genuinely different angles on the prompt:
- **Progression 1 — Faithful:** The most direct, satisfying read. The version that "just works."
- **Progression 2 — Elevated:** A richer take — smarter voice leading, a borrowed chord, a secondary dominant, an unexpected resolution.
- **Progression 3 — Reimagined:** A different angle entirely — different key, mode, or harmonic language. Should still serve the prompt's emotional intent.

Choose whatever key best serves each progression — only lock to a specific key if the user named one.

Label each with a 2-4 word descriptor of its character (e.g. "Open and Direct", "Warm Jazz Lift", "Dorian Reframing").
  `.trim();
}

export async function POST(request: Request): Promise<Response> {
    try {
        const { userId } = await auth();
        const role = await getUserRole(userId);

        if (role !== 'admin' && !(await checkRateLimit(request))) {
            return createResponse({ error: 'Too many requests. Please try again tomorrow.' }, 429);
        }

        const body = (await request.json()) as RequestBody;
        const { prompt, numChords, existingProgressions, premium } = body;

        if (!prompt) {
            return createResponse({ error: 'Prompt is required.' }, 400);
        }

        let premiumGranted = false;
        const unlimitedPremium = role === 'admin';
        if (premium) {
            if (unlimitedPremium) {
                premiumGranted = true;
            } else if (userId) {
                const limit = role === 'pro' ? PRO_PREMIUM_GENERATIONS_PER_DAY : FREE_PREMIUM_GENERATIONS_PER_DAY;
                premiumGranted = await claimPremiumSlot(userId, limit);
            }
        }

        const count = (typeof numChords === 'number' && numChords >= 2 && numChords <= 8) ? numChords : 4;
        const userMessage = buildMultipleProgressionsMessage(prompt, count, existingProgressions);
        const schema = createMultipleProgressionsSchema(count);
        const modelId = premiumGranted ? PREMIUM_MODEL_ID : STANDARD_MODEL_ID;

        const result = await generateChordObject(userMessage, schema, 1.2, modelId);

        const progressionsWithIds = result.progressions.map((prog: { chords: string[]; style: string }, index: number) => ({
            id: `prog-${Date.now()}-${index}`,
            chords: prog.chords,
            style: prog.style,
        }));

        return createResponse({ progressions: progressionsWithIds, premiumUsed: premiumGranted, unlimitedPremium });

    } catch (err: unknown) {
        const e = err as ApiError;
        console.error('[API generate-multiple] Error:', e.message);

        if (e.details) {
            return createResponse({ error: e.message, details: e.details }, e.status || 500);
        }
        return createResponse({ error: e.message || 'Internal server error' }, e.status || 500);
    }
}
