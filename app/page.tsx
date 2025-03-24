"use client";

import React, {useEffect, useState, useCallback, KeyboardEvent, useContext} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {MidiNumbers} from "react-piano";
import "react-piano/dist/styles.css";
import * as Tone from "tone";
import {Chord} from "tonal";
import MidiWriter from "midi-writer-js";
import {ChordItem} from "@/components/SortableChord";
import Header from "@/components/Header";
import PianoKeyboard from "@/components/PianoKeyboard";
import ChordRow from "@/components/ChordRow";
import ChordGenerator from "@/components/ChordGenerator";
import MidiDownloader from "@/components/MidiDownloader";
import PianoProvider, {PianoContext} from "@/components/PianoProvider";


import {
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
} from "@dnd-kit/sortable";

import exampleInputs from "@/public/example-inputs.json";


// Helper: Generate a unique ID for each chord.
const generateUniqueId = () => `${Date.now()}-${Math.random()}`;

export default function Home() {
    const [prompt, setPrompt] = useState<string>("");
    const [chords, setChords] = useState<ChordItem[]>([]);
    const [fullLoading, setFullLoading] = useState<boolean>(false);
    const [loadingChordId, setLoadingChordId] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const [midiUrl, setMidiUrl] = useState<string>("");
    const [activeNotes, setActiveNotes] = useState<string[]>([]);
    const [examples, setExamples] = useState<string[]>([]);
    const [randomExamples, setRandomExamples] = useState<string[]>([]);

    // Initialize DnD sensors and piano sampler ref
    const sensors = useSensors(useSensor(PointerSensor));

    // On mount, load examples and initialize piano sampler
    useEffect(() => {
        setExamples(exampleInputs as string[]);
        pickRandomExamples(exampleInputs as string[]);
    }, []);

    // Helper: pick 5 random examples
    const pickRandomExamples = useCallback((lines: string[]) => {
        const shuffled = [...lines].sort(() => 0.5 - Math.random());
        setRandomExamples(shuffled.slice(0, 5));
    }, []);

    // Toggle lock on a chord
    const toggleLock = useCallback((id: string) => {
        setChords((prev) =>
            prev.map((ch) => (ch.id === id ? {...ch, locked: !ch.locked} : ch))
        );
    }, []);

    // Generate chords based on the prompt
    const generateChords = useCallback(
        async (customPrompt?: string, attempt: number = 0) => {
            const MAX_ATTEMPTS = 3;
            const usedPrompt = customPrompt ?? prompt;
            if (!usedPrompt.trim()) {
                setError("Please describe your chord progression before generating.");
                return;
            }
            setError("");
            setFullLoading(true);

            try {
                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({prompt: usedPrompt, existingChords: chords}),
                });
                const data = await res.json();
                if (data.error) {
                    setError(data.error);
                    setFullLoading(false);
                    return;
                }

                // Clean and split the API response.
                const cleaned = data.chords
                    .replace(/^chords:\s*['"]?/, "")
                    .replace(/['"]?$/, "")
                    .trim()
                    .replace(/△/g, "")
                    .split(/[-‐‑–—]/)
                    .map((c: string) => c.trim())
                    .filter((c: string) => c);

                let valid = true;
                // Validate each chord.
                const newChords: (ChordItem | null)[] = cleaned.map((c: string) => {
                    const chordData = Chord.get(c);
                    if (!chordData || !chordData.notes || chordData.notes.length === 0) {
                        valid = false;
                        return null;
                    }
                    return {
                        id: generateUniqueId(),
                        chord: c,
                        locked: false,
                    };
                });

                if (!valid) {
                    if (attempt < MAX_ATTEMPTS) {
                        console.warn("Invalid chord detected, reattempting generation", attempt + 1);
                        return generateChords(customPrompt, attempt + 1);
                    } else {
                        setError("Could not generate valid chords after several attempts.");
                        setFullLoading(false);
                        return;
                    }
                }

                // Preserve locked chords if they already exist.
                let finalChords = newChords as ChordItem[];
                if (chords.length > 0) {
                    finalChords = finalChords.map((newChord: ChordItem, idx: number): ChordItem => {
                        const oldChord = chords[idx];
                        return oldChord && oldChord.locked ? oldChord : newChord;
                    });
                }

                setChords(finalChords);
            } catch (e) {
                console.error("Generation error:", e);
                setError("Error generating chords. Please try again.");
            }
            setFullLoading(false);
        },
        [prompt, chords]
    );

    const handleExampleClick = useCallback(
        (example: string) => {
            setPrompt(example);
            generateChords(example);
        },
        [generateChords]
    );

    const piano = useContext(PianoContext);

    const playChord = useCallback(async (chord: string) => {
        if (!chord) return;
        await Tone.start();
        const chordNotes = Chord.get(chord).notes.map((n) =>
            /\d/.test(n.trim()) ? n.trim() : `${n.trim()}4`
        );
        setActiveNotes(chordNotes);
        piano?.triggerAttackRelease(chordNotes, "2n");
        setTimeout(() => setActiveNotes([]), 500);
    }, [piano]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") generateChords();
    }, [generateChords]);

    const handleDragEnd = useCallback(
        ({active, over}: DragEndEvent) => {
            if (!over || active.id === over.id) return;
            setChords((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        },
        []
    );

    const addChordAt = useCallback(
        async (position: number) => {
            if (chords.length >= 8) return;
            const newChordId = generateUniqueId();
            const placeholderChord: ChordItem = {id: newChordId, chord: "", locked: false};
            setChords((prev) => [
                ...prev.slice(0, position),
                placeholderChord,
                ...prev.slice(position),
            ]);
            setLoadingChordId(newChordId);
            try {
                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        existingChords: chords,
                        addChordPosition: position,
                        prompt: prompt || "add chord",
                    }),
                });
                const data = await res.json();
                if (data.error) {
                    setError(data.error);
                    setChords((prev) => prev.filter((ch) => ch.id !== newChordId));
                    setLoadingChordId(null);
                    return;
                }
                const updatedChord: ChordItem = {id: newChordId, chord: data.chord.trim(), locked: false};
                setChords((prev) =>
                    prev.map((ch) => (ch.id === newChordId ? updatedChord : ch))
                );
            } catch (e) {
                console.error("Error adding chord:", e);
                setError("Error adding chord. Please try again.");
                setChords((prev) => prev.filter((ch) => ch.id !== newChordId));
            }
            setLoadingChordId(null);
        },
        [chords, prompt]
    );


    const hasChords = chords.length > 0 || fullLoading;
    const firstNote = MidiNumbers.fromNote("C3");
    const lastNote = MidiNumbers.fromNote("C5");


    return (
        <PianoProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
                <Header/>


                <motion.main
                    className="flex flex-col items-center w-full"
                    initial={{paddingTop: "45vh"}}
                    animate={{paddingTop: hasChords ? "20vh" : "35vh"}}
                    transition={{duration: 0.5, ease: [0.4, 0, 0.2, 1]}}
                >
                    <ChordGenerator
                        prompt={prompt}
                        setPrompt={setPrompt}
                        handleKeyDown={handleKeyDown}
                        generateChords={generateChords}
                        fullLoading={fullLoading}
                        chordsLength={chords.length}
                        randomExamples={randomExamples}
                        handleExampleClick={handleExampleClick}
                    />

                    {(chords.length > 0 || fullLoading) && (
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

                    <AnimatePresence>
                        <MidiDownloader chords={chords.map((c) => c.chord)}/>
                    </AnimatePresence>
                </motion.main>

                <PianoKeyboard
                    firstNote={firstNote}
                    lastNote={lastNote}
                    activeNotes={activeNotes}
                />
            </div>
        </PianoProvider>
    );
}
