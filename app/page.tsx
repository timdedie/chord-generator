"use client";

import { useState, ChangeEvent, KeyboardEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import LoadingCircleSpinner from "@/components/ui/LoadingCircleSpinner";
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

// SortableChord component remains unchanged
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
    const [prompt, setPrompt] = useState("");
    const [chords, setChords] = useState<
        { id: string; chord: string; locked: boolean }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [midiUrl, setMidiUrl] = useState("");

    const removeChord = (id: string) =>
        setChords((prev) => prev.filter((chord) => chord.id !== id));

    const toggleLock = (id: string) =>
        setChords((prev) =>
            prev.map((chord) =>
                chord.id === id ? { ...chord, locked: !chord.locked } : chord
            )
        );

    const generateChords = async () => {
        if (!prompt.trim()) {
            setError("Please describe your chord progression before generating.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            const cleaned = data.chords
                .replace(/^chords:\s*['"]?/, "")
                .replace(/['"]?$/, "")
                .trim()
                .split(/[-‐‑–—]/)
                .map((c: string) => c.trim())
                .filter((c: string) => c);

            let initialChords = cleaned.slice(0, 4).map((c) => ({
                id: `${Date.now()}-${Math.random()}`,
                chord: c,
                locked: false,
            }));
            // Ensure at least 2 chords
            while (initialChords.length < 2) {
                initialChords.push({
                    id: `${Date.now()}-${Math.random()}`,
                    chord: "A",
                    locked: false,
                });
            }
            setChords(initialChords);
        } catch (e) {
            console.error(e);
            // Fallback to at least 2 chords if API fails
            setChords([
                { id: `${Date.now()}-1`, chord: "A", locked: false },
                { id: `${Date.now()}-2`, chord: "D", locked: false },
            ]);
        }
        setLoading(false);
    };

    const playChord = async (chord: string) => {
        if (!chord) return;
        await Tone.start();
        const synth = new Tone.PolySynth().toDestination();
        const notes = Chord.get(chord).notes.map((n) =>
            /\d/.test(n) ? n : `${n}4`
        );
        synth.triggerAttackRelease(notes, "2n");
    };

    const makeMidiUrl = (values: string[]) => {
        const track = new MidiWriter.Track();
        track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));
        values.forEach((chord) => {
            const notes = Chord.get(chord).notes.map((n) =>
                /\d/.test(n) ? n : `${n}4`
            );
            track.addEvent(new MidiWriter.NoteEvent({ pitch: notes, duration: "4" }));
        });
        return URL.createObjectURL(
            new Blob([new MidiWriter.Writer(track).buildFile()], {
                type: "audio/midi",
            })
        );
    };

    useEffect(() => {
        if (chords.length === 0) {
            setMidiUrl("");
            return;
        }
        const url = makeMidiUrl(chords.map((c) => c.chord));
        setMidiUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [chords]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") generateChords();
    };

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (over && active.id !== over.id) {
            setChords((items) => {
                const activeIndex = items.findIndex((item) => item.id === active.id);
                const overIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, activeIndex, overIndex);
            });
        }
    };

    const addChordAt = (position: number) => {
        if (chords.length >= 8) return;
        const newChord = { id: `${Date.now()}-${Math.random()}`, chord: "A", locked: false };
        setChords((prev) => [
            ...prev.slice(0, position),
            newChord,
            ...prev.slice(position),
        ]);
    };

    const Spacer = ({ position }: { position: number }) => {
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
    };

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
                    onRemove={removeChord}
                    loading={loading}
                />
            </motion.div>
        );
    });
    elements.push(<Spacer key={`spacer-${chords.length}`} position={chords.length} />);

    return (
        <div className="min-h-screen bg-gray-50 pt-32">
            <header className="absolute top-0 left-0 p-8">
                <h1 className="text-4xl font-bold">Chord Generator</h1>
            </header>

            <main className="flex flex-col items-center">
                <div className="w-full max-w-3xl mb-12">
                    <p className="text-sm text-gray-600 mb-1">
                        Describe your chord progression
                    </p>
                    <div className="flex gap-4">
                        <Input
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="happy and uplifting"
                            className="flex-grow px-8 h-24 placeholder:text-4xl !text-4xl"
                        />
                        <Button
                            onClick={generateChords}
                            className="w-24 h-24 flex items-center justify-center transition transform hover:scale-105"
                            disabled={loading}
                        >
                            <FaArrowRotateRight className={`text-6xl ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                    {error && <p className="text-red-600 mt-2">{error}</p>}
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={chords.map((chord) => chord.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        <div className="flex justify-center w-full">
                            <AnimatePresence>
                                {elements}
                            </AnimatePresence>
                        </div>
                    </SortableContext>
                </DndContext>

                <AnimatePresence>
                    {midiUrl && (
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