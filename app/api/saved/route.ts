import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { savedProgressions } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export interface SavedProgressionResponse {
    id: string;
    chords: string[];
    style: string;
    prompt: string;
    savedAt: number;
}

function toResponse(row: typeof savedProgressions.$inferSelect): SavedProgressionResponse {
    return {
        id: row.id,
        chords: row.chords,
        style: row.style,
        prompt: row.prompt,
        savedAt: row.savedAt.getTime(),
    };
}

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await db
        .select()
        .from(savedProgressions)
        .where(eq(savedProgressions.userId, userId))
        .orderBy(desc(savedProgressions.savedAt));

    return NextResponse.json({ progressions: rows.map(toResponse) });
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as { id: string; chords: string[]; style: string; prompt: string };
    if (!body.id || !body.chords || !body.style) {
        return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    await db
        .insert(savedProgressions)
        .values({ id: body.id, userId, chords: body.chords, style: body.style, prompt: body.prompt ?? "" })
        .onConflictDoNothing();

    return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json() as { id: string };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await db
        .delete(savedProgressions)
        .where(and(eq(savedProgressions.id, id), eq(savedProgressions.userId, userId)));

    return NextResponse.json({ ok: true });
}
