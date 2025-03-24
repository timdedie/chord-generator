"use client";

import React, { useContext } from "react";
import { Piano, MidiNumbers } from "react-piano";
import { PianoContext } from "./PianoProvider";
import { useMediaQuery } from "react-responsive";
import { motion, useViewportScroll, useTransform } from "framer-motion";

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
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const responsiveWidth = isMobile ? 320 : width;

    const handlePlayNote = (midiNumber: number) => {
        const note = MidiNumbers.getAttributes(midiNumber).note;
        piano?.triggerAttack(note);
    };

    const handleStopNote = (midiNumber: number) => {
        const note = MidiNumbers.getAttributes(midiNumber).note;
        piano?.triggerRelease(note);
    };

    // Use Framer Motion to track the scroll position and animate the opacity
    const { scrollY } = useViewportScroll();
    // When scrollY is 0, opacity is 1; when scrollY reaches 100, opacity becomes 0.
    const opacity = useTransform(scrollY, [0, 100], [1, 0]);

    return (
        <motion.div style={{ opacity }} className="fixed bottom-0 left-0 right-0 flex justify-center p-4">
            <div className={`w-full ${isMobile ? 'max-w-[320px]' : 'max-w-[600px]'} bg-white shadow-lg rounded-lg`}>
                {isMobile && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                        Use the desktop version to move, delete, or add chords and download MIDI
                    </p>
                )}
                <Piano
                    noteRange={{ first: firstNote, last: lastNote }}
                    playNote={handlePlayNote}
                    stopNote={handleStopNote}
                    activeNotes={activeNotes
                        .filter((note) => note.trim() !== "")
                        .map((note) => MidiNumbers.fromNote(note.trim()))}
                    width={responsiveWidth}
                    renderNoteLabel={() => null}
                />
            </div>
        </motion.div>
    );
}
