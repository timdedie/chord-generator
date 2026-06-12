import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { apiUsage } from "@/lib/db/schema";

/** Generous per-IP cap on AI generation calls per day, to deter scripted abuse. */
export const DAILY_IP_LIMIT = 150;

function todayDate(): string {
    return new Date().toISOString().slice(0, 10);
}

export function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();
    return request.headers.get("x-real-ip") ?? "unknown";
}

/** Atomically increments today's request count for the caller's IP. Returns false once the daily limit is exceeded. */
export async function checkRateLimit(request: Request, limit: number = DAILY_IP_LIMIT): Promise<boolean> {
    const ip = getClientIp(request);
    const rows = await db
        .insert(apiUsage)
        .values({ ip, date: todayDate(), count: 1 })
        .onConflictDoUpdate({
            target: [apiUsage.ip, apiUsage.date],
            set: { count: sql`${apiUsage.count} + 1` },
            where: sql`${apiUsage.count} < ${limit}`,
        })
        .returning();

    return rows.length > 0;
}
