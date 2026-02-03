"use client";

import React from "react";
import { Piano, MidiNumbers } from "react-piano";
import { usePiano } from "./PianoProvider";
import { useMediaQuery } from "react-responsive";

interface PianoKeyboardProps {
    firstNote: number;
    lastNote: number;
    activeNotes: string[];
    width?: number;
}

export default function PianoKeyboard({
                                          firstNote,
                                          lastNote,
                                          activeNotes,
                                          width = 400,
                                      }: PianoKeyboardProps) {
    const { piano, areSamplesLoaded } = usePiano();
    const isMobile = useMediaQuery({ maxWidth: 768 });

    // Calculate responsive width - smaller overall
    const responsiveWidth = isMobile
        ? Math.min(typeof window !== 'undefined' ? window.innerWidth * 0.7 : 180, 180)
        : width;

    const handlePlayNote = (midiNumber: number) => {
        if (piano && areSamplesLoaded) { // Check if piano instance exists and samples are loaded
            const note = MidiNumbers.getAttributes(midiNumber).note;
            piano.triggerAttack(note);
        } else {
            // console.log("Piano not ready or samples not loaded for individual note play.");
        }
    };

    const handleStopNote = (midiNumber: number) => {
        if (piano && areSamplesLoaded) { // Check if piano instance exists and samples are loaded
            const note = MidiNumbers.getAttributes(midiNumber).note;
            piano.triggerRelease(note);
        }
    };

    const sanitizedActiveNotes = activeNotes
        .map(n => n.trim())
        .filter(n => /^[A-G](?:#|b)?\d$/.test(n))
        .map(n => {
            try {
                return MidiNumbers.fromNote(n);
            } catch {
                console.warn(`⚠️ Invalid note dropped: "${n}"`);
                return null;
            }
        })
        .filter((midi): midi is number => midi !== null);

    return (
        <div className={`fixed bottom-0 left-0 right-0 flex justify-center z-40 ${isMobile ? 'p-2' : 'p-4'}`}>
            <div className={`w-full ${isMobile ? 'max-w-[180px]' : 'max-w-[400px]'} bg-transparent`}>
                <div className="bg-transparent drop-shadow-lg">
                    <Piano
                        noteRange={{ first: firstNote, last: lastNote }}
                        playNote={handlePlayNote}
                        stopNote={handleStopNote}
                        activeNotes={sanitizedActiveNotes}
                        width={responsiveWidth}
                        renderNoteLabel={() => null}
                    />
                </div>
            </div>
        </div>
    );
}