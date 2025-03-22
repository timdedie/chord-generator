"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import Papa from "papaparse";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import LoadingThreeDotsJumping from "@/components/ui/LoadingThreeDotsJumping";
import * as Tone from "tone";
import { Chord } from "tonal";
import MidiWriter from "midi-writer-js";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowsAltH, FaLock, FaLockOpen, FaPlus } from "react-icons/fa";
import { TiDelete } from "react-icons/ti";
import { FaArrowRotateRight } from "react-icons/fa6";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    arrayMove,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Removed the ChordSkeleton component

function SortableChord({
                           id,
                           item,
                           onPlay,
                           toggleLock,
                           onRemove,
                           loading,
                       }: {
    id: string;
    item: { id: string; chord: string; locked: boolean };
    onPlay: () => void;
    toggleLock: (id: string) => void;
    onRemove: (id: string) => void;
    loading: boolean;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });
    const [hover, setHover] = useState(false);

    return (
        <Card
            ref={setNodeRef}
            {...attributes}
            onClick={onPlay}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className="relative group cursor-pointer flex items-center justify-center w-48 h-48 border border-gray-300 bg-gray-50"
        >
            {loading ? (
                <LoadingThreeDotsJumping />
            ) : (
                <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold"
                >
                    {item.chord}
                </motion.span>
            )}

            <AnimatePresence>
                {hover && !loading && (
                    <motion.div
                        key="delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(item.id);
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-2 right-2 cursor-pointer text-2xl"
                    >
                        <TiDelete />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {hover && !loading && (
                    <motion.div
                        {...listeners}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-grab text-2xl"
                    >
                        <FaArrowsAltH />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(item.locked || hover) && !loading && (
                    <motion.div
                        key={item.locked ? "locked" : "unlocked"}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleLock(item.id);
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 cursor-pointer text-2xl"
                    >
                        {item.locked ? <FaLock /> : <FaLockOpen />}
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}

export default function Home() {
    // State hooks
    const [prompt, setPrompt] = useState("");
    const [chords, setChords] = useState<
        { id: string; chord: string; locked: boolean }[]
    >([]);
    const [fullLoading, setFullLoading] = useState(false);
    const [loadingChordId, setLoadingChordId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [midiUrl, setMidiUrl] = useState("");

    // CSV examples
    const [examples, setExamples] = useState<string[]>([]);
    const [randomExamples, setRandomExamples] = useState<string[]>([]);

    // Always call sensor hooks unconditionally
    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        Papa.parse("/example-inputs.csv", {
            download: true,
            complete: (results) => {
                if (results?.data) {
                    const lines = (results.data as string[][])
                        .map((row) => row[0]?.trim())
                        .filter(Boolean);
                    setExamples(lines);
                    pickRandomExamples(lines);
                }
            },
        });
    }, []);

    function pickRandomExamples(lines: string[]) {
        const shuffled = [...lines].sort(() => 0.5 - Math.random());
        setRandomExamples(shuffled.slice(0, 5));
    }

    function toggleLock(id: string) {
        setChords((prev) =>
            prev.map((ch) =>
                ch.id === id ? { ...ch, locked: !ch.locked } : ch
            )
        );
    }

    function handleExampleClick(example: string) {
        setPrompt(example);
        generateChords(example);
    }

    async function generateChords(customPrompt?: string) {
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: usedPrompt, existingChords: chords }),
            });
            const data = await res.json();
            console.log("API response:", data);

            if (data.error) {
                setError(data.error);
                setFullLoading(false);
                return;
            }

            const cleaned = data.chords
                .replace(/^chords:\s*['"]?/, "")
                .replace(/['"]?$/, "")
                .trim()
                .split(/[-‐‑–—]/)
                .map((c: string) => c.trim())
                .filter((c: string) => c);

            let newChords = cleaned.slice(0, 4).map((c) => ({
                id: `${Date.now()}-${Math.random()}`,
                chord: c,
                locked: false,
            }));

            if (chords.length > 0) {
                newChords = newChords.map((newChord, idx) => {
                    const oldChord = chords[idx];
                    if (oldChord && oldChord.locked) {
                        return oldChord;
                    }
                    return newChord;
                });
            }

            setChords(newChords);
        } catch (e) {
            console.error("Generation error:", e);
            setError("Error generating chords. Please try again.");
        }
        setFullLoading(false);
    }

    async function playChord(chord: string) {
        if (!chord) return;
        await Tone.start();
        const synth = new Tone.PolySynth().toDestination();
        const notes = Chord.get(chord).notes.map((n) =>
            /\d/.test(n) ? n : `${n}4`
        );
        synth.triggerAttackRelease(notes, "2n");
    }

    function makeMidiUrl(values: string[]) {
        const track = new MidiWriter.Track();
        track.setTimeSignature(4, 4);
        track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

        values.forEach((ch) => {
            const notes = Chord.get(ch).notes.map((n) =>
                /\d/.test(n) ? n : `${n}4`
            );
            track.addEvent(
                new MidiWriter.NoteEvent({
                    pitch: notes,
                    duration: "1",
                })
            );
        });

        return URL.createObjectURL(
            new Blob([new MidiWriter.Writer(track).buildFile()], {
                type: "audio/midi",
            })
        );
    }

    useEffect(() => {
        if (!chords.length) {
            setMidiUrl("");
            return;
        }
        const url = makeMidiUrl(chords.map((c) => c.chord));
        setMidiUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [chords]);

    // Updated chord row logic:
    let chordRow: React.ReactNode = null;
    if (chords.length > 0) {
        const handleDragEnd = ({ active, over }: DragEndEvent) => {
            if (!over || active.id === over.id) return;
            setChords((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        };

        async function addChordAt(position: number) {
            if (chords.length >= 8) return;

            // Create a new chord with a placeholder value.
            const newChordId = `${Date.now()}-${Math.random()}`;
            const placeholderChord = {
                id: newChordId,
                chord: "Loading...",
                locked: false,
            };

            // Insert the placeholder chord into the progression.
            setChords((prev) => [
                ...prev.slice(0, position),
                placeholderChord,
                ...prev.slice(position),
            ]);
            // Mark this chord as loading.
            setLoadingChordId(newChordId);

            try {
                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        existingChords: chords,
                        addChordPosition: position,
                        prompt: prompt || "add chord",
                    }),
                });
                const data = await res.json();
                if (data.error) {
                    setError(data.error);
                    // Remove the placeholder chord if there's an error.
                    setChords((prev) => prev.filter((ch) => ch.id !== newChordId));
                    setLoadingChordId(null);
                    return;
                }

                // Update the placeholder chord with the API response.
                const updatedChord = {
                    id: newChordId,
                    chord: data.chord.trim(),
                    locked: false,
                };
                setChords((prev) =>
                    prev.map((ch) => (ch.id === newChordId ? updatedChord : ch))
                );
            } catch (e) {
                console.error("Error adding chord:", e);
                setError("Error adding chord. Please try again.");
                // Optionally remove the placeholder on error.
                setChords((prev) => prev.filter((ch) => ch.id !== newChordId));
            }
            setLoadingChordId(null);
        }

        function Spacer({ position }: { position: number }) {
            const [hover, setHover] = useState(false);
            return (
                <div
                    className="w-[30px] h-48 relative"
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    <AnimatePresence>
                        {hover && chords.length < 8 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 m-auto w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full"
                                onClick={() => addChordAt(position)}
                            >
                                <FaPlus className="text-lg" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            );
        }

        const elements = [];
        chords.forEach((chord, index) => {
            elements.push(<Spacer key={`spacer-${index}`} position={index} />);
            elements.push(
                <motion.div
                    key={chord.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                >
                    <SortableChord
                        id={chord.id}
                        item={chord}
                        onPlay={() => playChord(chord.chord)}
                        toggleLock={toggleLock}
                        onRemove={() =>
                            setChords((prev) =>
                                prev.filter((ch) => ch.id !== chord.id)
                            )
                        }
                        // Show loading if this chord is currently being added or if a full generation is in progress (and chord isn't locked)
                        loading={!chord.locked && (fullLoading || loadingChordId === chord.id)}
                    />
                </motion.div>
            );
        });
        elements.push(
            <Spacer key={`spacer-${chords.length}`} position={chords.length} />
        );

        chordRow = (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={chords.map((ch) => ch.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    <div className="flex gap-4 justify-center w-full">
                        <AnimatePresence>{elements}</AnimatePresence>
                    </div>
                </SortableContext>
            </DndContext>
        );
    } else if (fullLoading) {
        // Generation has started but no chords yet – show cards with the jumping loading animation.
        chordRow = (
            <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="w-48 h-48 border border-gray-300 bg-gray-50 rounded flex items-center justify-center"
                    >
                        <LoadingThreeDotsJumping />
                    </div>
                ))}
            </div>
        );
    }

    // Fixed: use fullLoading instead of undefined loading
    const hasChords = chords.length > 0 || fullLoading;

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") generateChords();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="absolute top-0 left-0 p-8">
                <h1 className="text-4xl font-bold">Chord Generator</h1>
            </header>

            <main
                className={`flex flex-col items-center transition-all duration-500 ${
                    hasChords ? "pt-40" : "justify-center h-screen"
                }`}
            >
                <div className="w-full max-w-3xl">
                    <p className="text-sm text-gray-600 mb-1">
                        What kind of chord progression do you want to generate?
                    </p>
                    <div className="flex gap-4 mb-8">
                        <Input
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe a mood or style ..."
                            className="flex-grow px-8 h-16 placeholder:text-2xl !text-2xl"
                            disabled={fullLoading}
                        />
                        <Button
                            onClick={() => generateChords()}
                            className="w-16 h-16 flex items-center justify-center transition transform hover:scale-105"
                            disabled={fullLoading}
                        >
                            <FaArrowRotateRight
                                className={`text-3xl ${fullLoading ? "animate-spin" : ""}`}
                            />
                        </Button>
                    </div>

                    {/* Show suggestion buttons only if no chords have been generated */}
                    <AnimatePresence>
                        {(!fullLoading && chords.length === 0) && (
                            <motion.div
                                key="example-buttons"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-wrap gap-2 mb-6"
                            >
                                {randomExamples.map((ex, i) => (
                                    <Button
                                        key={i}
                                        variant="secondary"
                                        disabled={fullLoading}
                                        onClick={() => handleExampleClick(ex)}
                                        className="hover:scale-101"
                                    >
                                        {ex}
                                    </Button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && <p className="text-red-600 mb-4">{error}</p>}
                </div>

                {chordRow}

                <AnimatePresence>
                    {midiUrl && chords.length > 0 && (
                        <motion.div
                            key="download"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 16 }}
                            transition={{ duration: 0.3 }}
                            className="w-full max-w-3xl flex justify-end mt-8"
                        >
                            <Button
                                asChild
                                disabled={!midiUrl}
                                className="transition transform hover:scale-105"
                            >
                                <a href={midiUrl} download="chord_progression.mid">
                                    Download MIDI
                                </a>
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
