"use client";

import React, { useContext } from "react";
import { Piano, MidiNumbers } from "react-piano";
import { PianoContext } from "./PianoProvider";

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
                                          width = 600,
                                      }: PianoKeyboardProps) {
    const piano = useContext(PianoContext);

    const handlePlayNote = (midiNumber: number) => {
        const note = MidiNumbers.getAttributes(midiNumber).note;
        piano?.triggerAttack(note);
    };

    const handleStopNote = (midiNumber: number) => {
        const note = MidiNumbers.getAttributes(midiNumber).note;
        piano?.triggerRelease(note);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4">
            <div className="max-w-[600px] w-full">
                <Piano
                    noteRange={{ first: firstNote, last: lastNote }}
                    playNote={handlePlayNote}
                    stopNote={handleStopNote}
                    activeNotes={activeNotes
                        .filter((note) => note.trim() !== "")
                        .map((note) => MidiNumbers.fromNote(note.trim()))}
                    width={width}
                    renderNoteLabel={() => null}
                />
            </div>
        </div>
    );
}
