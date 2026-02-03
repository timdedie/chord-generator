import { z } from 'zod';
import { Chord } from 'tonal';

/**
 * Chord formatting rules for AI prompts
 */
export const CHORD_FORMATTING_RULES = `
Chord formatting rules:

**Basics:**
*   **Root:** Uppercase A–G. Use '#' for sharps and 'b' for flats (e.g., F#, Bb).
*   **Major Triad:** Just the root (e.g., C, F#).
*   **Minor Triad:** "m" (e.g., Am, Bbm).

**Seventh Chords:**
*   **Dominant Seventh:** "7" (e.g., G7, A7).
*   **Major Seventh:** "maj7" or "M7" (e.g., Cmaj7, FM7). Do not use the triangle symbol (△).
*   **Minor Seventh:** "m7" (e.g., Dm7).
*   **Minor-Major Seventh:** "mM7" (e.g., AmM7). Do NOT use "mmaj7" or "m(maj7)".
*   **Diminished Seventh:** "dim7" or "°7" (e.g., Bdim7, B°7).
*   **Half-Diminished Seventh:** "m7b5" or "ø" (e.g., F#m7b5, F#ø).

**Suspended Chords:**
*   **Suspended Second:** "sus2".
*   **Suspended Fourth:** "sus4".
*   **Dominant Suspended Fourth:** "7sus4" (e.g., G7sus4).

**Extensions & Alterations:**
*   **Common Extensions:** Use standard suffixes like "9", "11", "13" (e.g., C9, Dm11, G13).
*   **Major Extensions:** For major chords with extensions, prefer 'maj9', 'maj11', 'maj13' (e.g., 'Cmaj9' instead of 'Cmaj7add9').
*   **Alterations:** Clearly append alterations. Use 'b' for flat and '#' for sharp (e.g., G7b9, C7#5, Fmaj7#11).

**Slash Chords (Inversions / Specific Bass):**
*   **Bass Note:** Use a forward slash "/" followed by the bass note to indicate an inversion or a specific bass (e.g., C/E, Am7/G, G7b9/F). This is crucial for good voice leading.

**Guideline:**
Provide only the chord symbols according to these rules. For example, a progression of A minor, G major, and C major should be ["Am", "G", "C"]. A single F sharp minor seventh chord should be "F#m7".
`.trim();

/**
 * Schema for validating a single chord symbol.
 * Transforms and cleans the input, then validates using Tonal.js.
 */
export const ValidChordStringSchema = z.string()
    .describe("A musical chord symbol, strictly adhering to the CHORD_FORMATTING_RULES.")
    .transform(chordSymbol => {
        let cleaned = chordSymbol.trim();
        // Remove surrounding quotes if present
        if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
            cleaned = cleaned.substring(1, cleaned.length - 1).trim();
        }
        // Remove trailing punctuation
        cleaned = cleaned.replace(/[.,;:!?]$/, "").trim();
        return cleaned;
    })
    .refine(chordSymbol => {
        if (!chordSymbol) return false;
        const chordData = Chord.get(chordSymbol);
        return !!(chordData && !chordData.empty && chordData.name && chordData.name.length > 0 && chordData.notes && chordData.notes.length > 0);
    }, {
        message: "Invalid chord symbol or format. Ensure it matches CHORD_FORMATTING_RULES and is a recognized chord.",
    });

/**
 * Creates a schema for a chord progression with a specific number of chords.
 */
export const createProgressionSchema = (numChords: number) => z.object({
    chords: z.array(ValidChordStringSchema)
        .length(numChords, `Progression must have exactly ${numChords} chords`)
        .describe('An array of chord names forming a progression.'),
});

/**
 * Schema for a chord progression without length validation.
 * Used when the exact number of chords is flexible.
 */
export const ChordProgressionSchema = z.object({
    chords: z.array(ValidChordStringSchema)
        .describe('An array of chord names forming a progression.'),
});

/**
 * Schema for a single chord response.
 */
export const SingleChordSchema = z.object({
    chord: ValidChordStringSchema
        .describe("A single musical chord symbol, strictly adhering to the CHORD_FORMATTING_RULES. Example: 'F#m7'."),
});

/**
 * Schema for a single progression with a style label.
 */
export const ProgressionWithStyleSchema = z.object({
    chords: z.array(ValidChordStringSchema)
        .min(2)
        .max(8)
        .describe('An array of chord names forming a progression.'),
    style: z.string()
        .describe("A short 2-4 word style label like 'Jazz Soul' or 'Neo Soul Variation'"),
});

/**
 * Schema for multiple progressions response (3 progressions with style labels).
 */
export const MultipleProgressionsSchema = z.object({
    progressions: z.array(ProgressionWithStyleSchema)
        .length(3)
        .describe('An array of 3 different chord progressions, each with a style label.'),
});

/**
 * Type definitions derived from schemas
 */
export type ValidChordString = z.infer<typeof ValidChordStringSchema>;
export type ChordProgression = z.infer<typeof ChordProgressionSchema>;
export type SingleChord = z.infer<typeof SingleChordSchema>;
export type ProgressionWithStyle = z.infer<typeof ProgressionWithStyleSchema>;
export type MultipleProgressions = z.infer<typeof MultipleProgressionsSchema>;
