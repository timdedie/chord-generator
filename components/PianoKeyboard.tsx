"use client";

import React from "react"; // Removed useContext as usePiano is used
import { Piano, MidiNumbers } from "react-piano";
// import { PianoContext } from "./PianoProvider"; // Old import
import { usePiano } from "./PianoProvider"; // New import for custom hook
import { useMediaQuery } from "react-responsive";
import { motion, useScroll, useTransform } from "framer-motion";

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
    // const piano = useContext(PianoContext); // Old way
    const { piano, areSamplesLoaded } = usePiano(); // New way using custom hook
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const responsiveWidth = isMobile ? 320 : width;

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

    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [0, 100], [1, 0]);

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
        <motion.div style={{ opacity }} className="fixed bottom-0 left-0 right-0 flex justify-center p-4">
            <div className={`w-full ${isMobile ? 'max-w-[320px]' : 'max-w-[600px]'} bg-transparent`}>
                <div className="bg-transparent drop-shadow-md">
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
        </motion.div>
    );
}