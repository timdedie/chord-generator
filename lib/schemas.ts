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
 * Validates a chord symbol string.
 * Cleans common AI artifacts (quotes, trailing punctuation), then validates with tonal.js.
 */
export const ValidChordStringSchema = z.string()
    .describe("A chord symbol (e.g. F#m7, Cmaj7/E, Bbm)")
    .transform(s => {
        let cleaned = s.trim();
        if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
            cleaned = cleaned.substring(1, cleaned.length - 1).trim();
        }
        return cleaned.replace(/[.,;:!?]$/, "").trim();
    })
    .refine(s => {
        if (!s) return false;
        const chord = Chord.get(s);
        return chord && !chord.empty;
    }, { message: "Invalid or unrecognized chord symbol." });

/**
 * Schema factories — enforce exact chord count at the schema level.
 */
export const createProgressionSchema = (numChords: number) => z.object({
    chords: z.array(ValidChordStringSchema)
        .length(numChords)
        .describe(`A ${numChords}-chord progression.`),
});

export const createMultipleProgressionsSchema = (numChords: number) => z.object({
    progressions: z.array(z.object({
        chords: z.array(ValidChordStringSchema)
            .length(numChords)
            .describe(`A ${numChords}-chord progression.`),
        style: z.string()
            .describe("A 2-4 word style label (e.g. 'Warm Jazz', 'Dark Cinematic')"),
    }))
        .length(3)
        .describe('3 distinct chord progressions, each with a style label.'),
});

export const SingleChordSchema = z.object({
    chord: ValidChordStringSchema.describe("A single chord symbol (e.g. F#m7)"),
});

/**
 * Type definitions
 */
export type ValidChordString = z.infer<typeof ValidChordStringSchema>;
export type SingleChord = z.infer<typeof SingleChordSchema>;
