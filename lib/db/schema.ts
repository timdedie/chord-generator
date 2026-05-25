import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const savedProgressions = pgTable("saved_progressions", {
    id: text("id").notNull(),
    userId: text("user_id").notNull(),
    chords: text("chords").array().notNull(),
    style: text("style").notNull(),
    prompt: text("prompt").notNull().default(""),
    savedAt: timestamp("saved_at").notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.id, t.userId] })]);
