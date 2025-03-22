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
import { FaArrowsAltH, FaLock, FaLockOpen } from "react-icons/fa";
import { TiDelete } from "react-icons/ti";
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

function SortableChord({
                           id,
                           item,
                           index,
                           onPlay,
                           toggleLock,
                           onRemove,
                           loading,
                       }: {
    id: string;
    item: { chord: string; locked: boolean };
    index: number;
    onPlay: () => void;
    toggleLock: (i: number) => void;
    onRemove: (i: number) => void;
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
            className={`relative group cursor-pointer flex items-center justify-center w-48 h-48 border border-gray-300 ${
                item.chord ? "bg-gray-50" : "bg-gray-200"
            }`}
        >
            {loading ? (
                <LoadingThreeDotsJumping />
            ) : (
                <AnimatePresence>
                    {item.chord && (
                        <motion.span
                            key={item.chord}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="text-2xl font-bold"
                        >
                            {item.chord}
                        </motion.span>
                    )}
                </AnimatePresence>
            )}

            {/* DELETE BUTTON */}
            <AnimatePresence>
                {hover && !loading && (
                    <motion.div
                        key="delete"
                        onClick={e => { e.stopPropagation(); onRemove(index); }}
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

            {/* DRAG HANDLE */}
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

            {/* LOCK ICON (no transition) */}
            <AnimatePresence>
                {(item.locked || hover) && !loading && (
                    <motion.div
                        key={item.locked ? "locked" : "unlocked"}
                        onClick={e => { e.stopPropagation(); toggleLock(index); }}
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
    const [chords, setChords] = useState<{ chord: string; locked: boolean }[]>(
        Array(4).fill({ chord: "", locked: false })
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [midiUrl, setMidiUrl] = useState("");

    const removeChord = (i: number) =>
        setChords(prev =>
            prev.map((c, idx) => (idx === i ? { chord: "", locked: false } : c))
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
                .map((c: string) => c.trim());

            setChords(
                [...cleaned.map((c) => ({ chord: c, locked: false })), ...Array(4)].slice(
                    0,
                    4
                )
            );
        } catch (e) {
            console.error(e);
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
            new Blob([new MidiWriter.Writer(track).buildFile()], { type: "audio/midi" })
        );
    };

    useEffect(() => {
        if (chords.every((c) => c.chord === "")) {
            setMidiUrl("");
            return;
        }
        const url = makeMidiUrl(chords.map((c) => c.chord).filter(Boolean));
        setMidiUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [chords]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") generateChords();
    };

    const toggleLock = (i: number) =>
        setChords((prev) =>
            prev.map((c, idx) => (idx === i ? { ...c, locked: !c.locked } : c))
        );

    const sensors = useSensors(useSensor(PointerSensor));
    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (over && active.id !== over.id) {
            setChords((items) =>
                arrayMove(
                    items,
                    Number(active.id.split("-")[1]),
                    Number(over.id.split("-")[1])
                )
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32">
            <header className="absolute top-0 left-0 p-8">
                <h1 className="text-4xl font-bold">Chord Generator</h1>
            </header>

            <main className="flex flex-col items-center">
                <div className="w-full max-w-3xl mb-12">
                    <p className="text-sm text-gray-600 mb-1">Describe your chord progression</p>
                    <div className="flex gap-4">
                        <Input
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="happy and uplifting"
                            className="flex-grow px-8 h-24 placeholder:text-4xl !text-4xl"
                        />
                        <Button onClick={generateChords} className="w-24 h-24">
                            {loading ? <LoadingCircleSpinner /> : "Go"}
                        </Button>
                    </div>
                    {error && <p className="text-red-600 mt-2">{error}</p>}
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={chords.map((_, i) => `chord-${i}`)} strategy={horizontalListSortingStrategy}>
                        <div className="flex gap-[30px]">
                            {chords.map((item, idx) => (
                                <SortableChord
                                    key={idx}
                                    id={`chord-${idx}`}
                                    item={item}
                                    index={idx}
                                    loading={loading}
                                    onPlay={() => playChord(item.chord)}
                                    toggleLock={toggleLock}
                                    onRemove={removeChord}
                                />
                            ))}
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
                            <Button asChild disabled={!midiUrl}>
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
