"use client";

import React, { useEffect, useState, useCallback, KeyboardEvent, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import * as Tone from "tone";
import { Chord } from "tonal";
import { ChordItem } from "@/components/SortableChord"; // Assuming this is used by ChordRow/MobileChordGrid or other children

// Import Custom Hooks
import { useChordManagement } from "@/hooks/useChordManagement";
import { useExamplePrompts } from "@/hooks/useExamplePrompts"; // <-- NEW HOOK

// Import Components
import ThinkingMessages from "@/components/ThinkingMessages";
import Header from "@/components/Header";
import PianoKeyboard from "@/components/PianoKeyboard";
import ChordRow from "@/components/ChordRow";
import ChordGenerator from "@/components/ChordGenerator";
import MidiDownloader from "@/components/MidiDownloader";
import PianoProvider, { PianoContext } from "@/components/PianoProvider";
import MobileChordGrid from "@/components/MobileChordRow";
import MobileHeader from "@/components/MobileHeader";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useMediaQuery } from "react-responsive";
// exampleInputs.json is no longer imported here directly

export default function ClientHome() {
    // --- Use the custom hook for chord management ---
    const {
        prompt, setPrompt,
        chords, setChords,
        fullLoading,
        loadingChordId,
        error,
        toggleLock,
        generateChords,
        addChordAt,
        handleDragEnd,
        generateChordsFromExample,
    } = useChordManagement();

    // --- Use the custom hook for example prompts ---
    const { randomExamples /*, pickNewRandomExamples */ } = useExamplePrompts(); // <-- USING NEW HOOK

    // --- Audio State and Logic (still managed by ClientHome for now) ---
    const [activeNotes, setActiveNotes] = useState<string[]>([]);
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const sensors = useSensors(useSensor(PointerSensor));
    const piano = useContext(PianoContext);

    // Resume Tone.js audio on mobile devices
    useEffect(() => {
        if (isMobile) {
            const resumeAudio = async () => {
                try {
                    await Tone.start();
                    console.log("Audio context resumed");
                } catch (err) {
                    console.error("Error resuming audio", err);
                }
            };
            window.addEventListener("touchstart", resumeAudio, { once: true });
            return () => {
                window.removeEventListener("touchstart", resumeAudio);
            };
        }
    }, [isMobile]);

    // Play a given chord
    const playChord = useCallback(
        async (chordSymbol: string) => {
            if (!chordSymbol) return;
            await Tone.start(); // Ensure audio context is running
            const chordData = Chord.get(chordSymbol);
            if (!chordData || !chordData.notes || chordData.notes.length === 0) {
                console.warn(`Could not get notes for chord: ${chordSymbol}`);
                setActiveNotes([]);
                return;
            }
            const chordNotes = chordData.notes.map((n) =>
                /\d/.test(n.trim()) ? n.trim() : `${n.trim()}4`
            );
            setActiveNotes(chordNotes);
            piano?.triggerAttackRelease(chordNotes, "2n");
            setTimeout(() => setActiveNotes([]), 500);
        },
        [piano]
    );

    // Handle 'Enter' key press in the prompt input
    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                generateChords();
            }
        },
        [generateChords]
    );

    // --- Derived State and Constants ---
    const hasChords = chords.length > 0 || fullLoading;
    const firstNote = MidiNumbers.fromNote("C3");
    const lastNote = MidiNumbers.fromNote("C5");

    return (
        <PianoProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
                {isMobile ? <MobileHeader /> : <Header />}

                <motion.main
                    className="flex flex-col items-center w-full"
                    initial={false}
                    animate={{
                        paddingTop: hasChords ? (isMobile ? "10vh" : "20vh") : (isMobile ? "12vh" : "35vh"),
                    }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                    <ChordGenerator
                        prompt={prompt}
                        setPrompt={setPrompt}
                        handleKeyDown={handleKeyDown}
                        generateChords={() => generateChords()}
                        fullLoading={fullLoading}
                        chordsLength={chords.length}
                        randomExamples={randomExamples} // <-- From useExamplePrompts hook
                        handleExampleClick={generateChordsFromExample}
                    />

                    {error && (
                        <div className="text-red-500 mt-2 text-center p-2 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-md">
                            {error}
                        </div>
                    )}

                    {(chords.length > 0 || fullLoading) && (
                        <>
                            {isMobile ? (
                                <MobileChordGrid chords={chords} playChord={playChord} toggleLock={toggleLock} />
                            ) : (
                                <ChordRow
                                    chords={chords}
                                    fullLoading={fullLoading}
                                    loadingChordId={loadingChordId}
                                    sensors={sensors}
                                    handleDragEnd={handleDragEnd}
                                    addChordAt={addChordAt}
                                    playChord={playChord}
                                    toggleLock={toggleLock}
                                    setChords={setChords}
                                />
                            )}
                            <div className="h-8 flex items-center justify-center">
                                {fullLoading && <ThinkingMessages />}
                            </div>
                        </>
                    )}

                    {!isMobile && (
                        <AnimatePresence>
                            <MidiDownloader chords={chords.map((c) => c.chord)} />
                        </AnimatePresence>
                    )}
                </motion.main>

                <PianoKeyboard firstNote={firstNote} lastNote={lastNote} activeNotes={activeNotes} />
            </div>
        </PianoProvider>
    );
}