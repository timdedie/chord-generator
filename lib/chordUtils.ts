import { Chord, Note } from "tonal";

export function getVoicedChordNotes(chordSymbol: string): string[] {
    const chordData = Chord.get(chordSymbol);
    if (!chordData || !chordData.notes || chordData.notes.length === 0 || !chordData.tonic) {
        return [];
    }
    const rootPc = chordData.tonic;
    const notesPc = chordData.notes;
    const startOctave = 3;
    const bassOctave = startOctave - 1;
    const bassNote = rootPc + bassOctave.toString();
    const voicedNotes: string[] = [];
    let previousNoteMidi: number | null = null;
    let currentProcessingOctave = startOctave;

    for (const pc of notesPc) {
        let noteWithOctave = pc + currentProcessingOctave;
        let currentNoteMidi = Note.midi(noteWithOctave);
        if (currentNoteMidi === null) {
            voicedNotes.push(pc + "4");
            previousNoteMidi = Note.midi(pc + "4");
            continue;
        }
        if (previousNoteMidi !== null) {
            while (currentNoteMidi! <= previousNoteMidi!) {
                currentProcessingOctave++;
                noteWithOctave = pc + currentProcessingOctave;
                currentNoteMidi = Note.midi(noteWithOctave);
                if (currentNoteMidi === null) {
                    noteWithOctave = pc + (currentProcessingOctave - 1);
                    break;
                }
            }
        }
        voicedNotes.push(noteWithOctave);
        previousNoteMidi = currentNoteMidi;
        currentProcessingOctave = startOctave;
    }
    return [bassNote, ...voicedNotes];
}
