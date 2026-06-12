import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { premiumGenerations } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { FREE_PREMIUM_GENERATIONS_PER_DAY } from "@/lib/ai";
import { hasUnlimitedPremium } from "@/lib/premium";

export const runtime = "edge";

function todayDate(): string {
    return new Date().toISOString().slice(0, 10);
}

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ signedIn: false, available: false });
    }

    if (await hasUnlimitedPremium(userId)) {
        return NextResponse.json({ signedIn: true, available: true });
    }

    const rows = await db
        .select()
        .from(premiumGenerations)
        .where(and(eq(premiumGenerations.userId, userId), eq(premiumGenerations.date, todayDate())));

    const used = rows[0]?.count ?? 0;
    return NextResponse.json({ signedIn: true, available: used < FREE_PREMIUM_GENERATIONS_PER_DAY });
}
