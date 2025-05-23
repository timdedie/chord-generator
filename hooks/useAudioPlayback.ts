import { useState, useCallback, useEffect, useContext } from 'react';
import * as Tone from 'tone';
import { Chord } from 'tonal';
import { PianoContext } from '@/components/PianoProvider'; // Ensure this path is correct

export function useAudioPlayback(isMobile: boolean) {
    const [activeNotes, setActiveNotes] = useState<string[]>([]);
    const piano = useContext(PianoContext);

    // Log the piano instance when the hook initializes or piano context changes
    useEffect(() => {
        console.log('useAudioPlayback: Piano instance from context:', piano);
    }, [piano]);

    // Effect for resuming audio on mobile
    useEffect(() => {
        if (isMobile) {
            const resumeAudio = async () => {
                try {
                    await Tone.start();
                    console.log("useAudioPlayback: Audio context resumed for mobile");
                } catch (err) {
                    console.error("useAudioPlayback: Error resuming audio", err);
                }
            };
            window.addEventListener("touchstart", resumeAudio, { once: true });
            return () => {
                window.removeEventListener("touchstart", resumeAudio);
            };
        }
    }, [isMobile]);

    const playChord = useCallback(
        async (chordSymbol: string) => {
            console.log(`useAudioPlayback: playChord called with symbol: ${chordSymbol}`);
            if (!piano) {
                console.warn("useAudioPlayback: Piano context not available (piano instance is null) when trying to play chord.");
                setActiveNotes([]);
                return;
            }
            if (!chordSymbol) {
                console.warn("useAudioPlayback: playChord called with no chordSymbol.");
                setActiveNotes([]);
                return;
            }

            try {
                await Tone.start(); // Ensure audio context is running
                const chordData = Chord.get(chordSymbol);

                if (!chordData || !chordData.notes || chordData.notes.length === 0) {
                    console.warn(`useAudioPlayback: Could not get notes for chord: ${chordSymbol}`);
                    setActiveNotes([]);
                    return;
                }

                const notesToPlay = chordData.notes.map((n) =>
                    /\d/.test(n.trim()) ? n.trim() : `${n.trim()}4`
                );

                setActiveNotes(notesToPlay);
                console.log(`useAudioPlayback: Triggering attack/release for notes: ${notesToPlay.join(', ')}`);
                piano.triggerAttackRelease(notesToPlay, "2n");

                setTimeout(() => setActiveNotes([]), 500);

            } catch (err) {
                console.error("useAudioPlayback: Error playing chord:", err);
                setActiveNotes([]); // Clear notes on error
            }
        },
        [piano] // Dependency: re-create playChord if the piano instance changes
    );

    return { activeNotes, playChord };
}