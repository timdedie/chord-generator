"use client";

import React, { useEffect, useState, useCallback, KeyboardEvent, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import * as Tone from "tone";
import { Chord } from "tonal";
import MidiWriter from "midi-writer-js";
import SortableChord, { ChordItem } from "@/components/SortableChord";

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

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

// Lucide Icons
import {
    Sun,
    Moon,
    AlertCircle,
    Lock,
    Unlock,
    MoveHorizontal,
    Plus,
    RefreshCw,
    X,
    Info,
    PlayCircle,
    Download,
    Piano as PianoIcon
} from "lucide-react";

import exampleInputs from "@/public/example-inputs.json";

interface SortableChordProps {
    id: string;
    item: ChordItem;
    onPlay: () => void;
    toggleLock: (id: string) => void;
    onRemove: (id: string) => void;
    loading: boolean;
}

// Helper: Generate a unique ID for each chord.
const generateUniqueId = () => `${Date.now()}-${Math.random()}`;

function SkeletonCard() {
    return <Skeleton className="w-48 h-48 rounded-xl" />;
}

export default function Home() {
    // Dark mode state and effect
    const [darkMode, setDarkMode] = useState(false);
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

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
    const pianoRef = useRef<Tone.Sampler | null>(null);

    // On mount, load examples and initialize piano sampler
    useEffect(() => {
        setExamples(exampleInputs as string[]);
        pickRandomExamples(exampleInputs as string[]);
    }, []);

    useEffect(() => {
        pianoRef.current = new Tone.Sampler({
            urls: {
                A0: "A0.mp3",
                A1: "A1.mp3",
                A2: "A2.mp3",
                A3: "A3.mp3",
                A4: "A4.mp3",
                A5: "A5.mp3",
                A6: "A6.mp3",
                A7: "A7.mp3",
                C1: "C1.mp3",
                C2: "C2.mp3",
                C3: "C3.mp3",
                C4: "C4.mp3",
                C5: "C5.mp3",
                C6: "C6.mp3",
                C7: "C7.mp3",
                C8: "C8.mp3",
                "D#1": "Dsharp1.mp3",
                "D#2": "Dsharp2.mp3",
                "D#3": "Dsharp3.mp3",
                "D#4": "Dsharp4.mp3",
                "D#5": "Dsharp5.mp3",
                "D#6": "Dsharp6.mp3",
                "D#7": "Dsharp7.mp3",
                "F#1": "Fsharp1.mp3",
                "F#2": "Fsharp2.mp3",
                "F#3": "Fsharp3.mp3",
                "F#4": "Fsharp4.mp3",
                "F#5": "Fsharp5.mp3",
                "F#6": "Fsharp6.mp3",
                "F#7": "Fsharp7.mp3",
            },
            release: 1,
            baseUrl: "/piano/",
        }).toDestination();
    }, []);

    // Helper: pick 5 random examples
    const pickRandomExamples = useCallback((lines: string[]) => {
        const shuffled = [...lines].sort(() => 0.5 - Math.random());
        setRandomExamples(shuffled.slice(0, 5));
    }, []);

    // Toggle lock on a chord
    const toggleLock = useCallback((id: string) => {
        setChords((prev) =>
            prev.map((ch) => (ch.id === id ? { ...ch, locked: !ch.locked } : ch))
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
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: usedPrompt, existingChords: chords }),
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

    const playChord = useCallback(async (chord: string) => {
        if (!chord) return;
        await Tone.start();
        const chordNotes = Chord.get(chord).notes.map((n) => {
            const trimmed = n.trim();
            return /\d/.test(trimmed) ? trimmed : `${trimmed}4`;
        });
        if (!chordNotes.length || chordNotes.some(note => !note)) return;
        setActiveNotes(chordNotes);
        pianoRef.current?.triggerAttackRelease(chordNotes, "2n");
        setTimeout(() => setActiveNotes([]), 500);
    }, []);

    const makeMidiUrl = useCallback((values: string[]): string => {
        const track = new MidiWriter.Track();
        track.setTimeSignature(4, 4, 24, 8);
        track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));
        values.forEach((ch) => {
            const notes = Chord.get(ch).notes.map((n) => (/\d/.test(n) ? n : `${n}4`));
            track.addEvent(
                new MidiWriter.NoteEvent({
                    pitch: notes,
                    duration: "1",
                })
            );
        });
        return URL.createObjectURL(
            new Blob([new MidiWriter.Writer(track).buildFile()], { type: "audio/midi" })
        );
    }, []);

    useEffect(() => {
        if (!chords.length) {
            setMidiUrl("");
            return;
        }
        const url = makeMidiUrl(chords.map((c) => c.chord));
        setMidiUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [chords, makeMidiUrl]);

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
        ({ active, over }: DragEndEvent) => {
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
            const placeholderChord: ChordItem = { id: newChordId, chord: "", locked: false };
            setChords((prev) => [
                ...prev.slice(0, position),
                placeholderChord,
                ...prev.slice(position),
            ]);
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
                    setChords((prev) => prev.filter((ch) => ch.id !== newChordId));
                    setLoadingChordId(null);
                    return;
                }
                const updatedChord: ChordItem = { id: newChordId, chord: data.chord.trim(), locked: false };
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

    const Spacer = useCallback(({ position }: { position: number }) => {
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
                            className="absolute inset-0 m-auto w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full"
                            onClick={() => addChordAt(position)}
                        >
                            <Plus className="h-5 w-5" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        );
    }, [chords.length, addChordAt]);

    let chordRow: React.ReactNode = null;
    if (chords.length > 0) {
        const elements: React.ReactNode[] = chords.flatMap((chord, index) => [
            <Spacer key={`spacer-${index}`} position={index} />,
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
                    onRemove={() => setChords((prev) => prev.filter((ch) => ch.id !== chord.id))}
                    loading={!chord.locked && (fullLoading || loadingChordId === chord.id)}
                />
            </motion.div>,
        ]);
        elements.push(<Spacer key={`spacer-${chords.length}`} position={chords.length} />);
        chordRow = (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={chords.map((ch) => ch.id)} strategy={horizontalListSortingStrategy}>
                    <div className="flex gap-4 justify-center w-full">
                        <AnimatePresence>{elements}</AnimatePresence>
                    </div>
                </SortableContext>
            </DndContext>
        );
    } else if (fullLoading) {
        chordRow = (
            <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    const hasChords = chords.length > 0 || fullLoading;
    const firstNote = MidiNumbers.fromNote("C3");
    const lastNote = MidiNumbers.fromNote("C5");
    const keyboardShortcuts = KeyboardShortcuts.create({
        firstNote,
        lastNote,
        keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
            <header className="absolute top-0 left-0 p-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Chord Generator</h1>
            </header>

            <div className="absolute top-0 right-0 p-8 flex items-center gap-4">
                {/* Dark mode toggle */}
                <div className="flex items-center gap-2">
                    <Sun className="h-6 w-6 text-yellow-500" />
                    <Switch
                        checked={darkMode}
                        onCheckedChange={(checked: boolean) => setDarkMode(checked)}
                    />
                    <Moon className="h-6 w-6 text-gray-300" />
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="How it works">
                            <Info className="h-6 w-6" />
                        </Button>
                    </DialogTrigger>
                    {/* Updated DialogContent: white background in light mode and black in dark mode with full contrast text */}
                    <DialogContent className="max-w-3xl p-8 bg-white dark:bg-black">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold mb-4 text-black dark:text-white">
                                How It Works
                            </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-black dark:text-white">
                                        <RefreshCw className="h-5 w-5" /> Generating Progressions
                                    </h3>
                                    <p className="text-sm text-black dark:text-white">
                                        Enter a description (e.g., "happy jazz in C major") and click refresh to generate a new progression.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-black dark:text-white">
                                        <PlayCircle className="h-5 w-5" /> Playing Chords
                                    </h3>
                                    <p className="text-sm text-black dark:text-white">
                                        Click a chord to hear it played on the piano.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-black dark:text-white">
                                        <Lock className="h-5 w-5" /> Locking Chords
                                    </h3>
                                    <p className="text-sm text-black dark:text-white">
                                        Hover and lock a chord to keep it during generation.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-black dark:text-white">
                                        <MoveHorizontal className="h-5 w-5" /> Rearranging Chords
                                    </h3>
                                    <p className="text-sm text-black dark:text-white">
                                        Hover to see the move icon, then drag to rearrange.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-black dark:text-white">
                                        <Plus className="h-5 w-5" /> Adding Chords
                                    </h3>
                                    <p className="text-sm text-black dark:text-white">
                                        Hover between chords and click plus to add a new one.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-black dark:text-white">
                                        <X className="h-5 w-5" /> Removing Chords
                                    </h3>
                                    <p className="text-sm text-black dark:text-white">
                                        Hover and click X to remove a chord.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-black dark:text-white">
                                        <Download className="h-5 w-5" /> Downloading MIDI
                                    </h3>
                                    <p className="text-sm text-black dark:text-white">
                                        Download your progression as a MIDI file.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-black dark:text-white">
                                        <PianoIcon className="h-5 w-5" /> Piano Interface
                                    </h3>
                                    <p className="text-sm text-black dark:text-white">
                                        Highlights notes as chords play; you can also play manually.
                                    </p>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogContent>
                </Dialog>
            </div>

            <motion.main
                className="flex flex-col items-center w-full"
                initial={{ paddingTop: "45vh" }}
                animate={{ paddingTop: hasChords ? "20vh" : "35vh" }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
                <div className="w-full max-w-3xl">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        What chord progression do you want to generate?
                    </p>
                    <div className="flex gap-4 mb-8">
                        <Input
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe a mood, style, genre or key ..."
                            className="flex-grow px-8 h-16 placeholder:text-2xl !text-2xl"
                            disabled={fullLoading}
                        />
                        <Button
                            onClick={() => generateChords()}
                            className="w-16 h-16 flex items-center justify-center transition transform hover:scale-105"
                            disabled={fullLoading}
                        >
                            <RefreshCw className={`h-8 w-8 ${fullLoading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>

                    <AnimatePresence>
                        {!fullLoading && chords.length === 0 && (
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
                            <Button asChild disabled={!midiUrl} className="transition transform hover:scale-105 gap-2">
                                <a href={midiUrl} download="chord_progression.mid" className="flex items-center">
                                    <Download className="h-5 w-5" />
                                    Download MIDI
                                </a>
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.main>

            {/* Piano fixed at the bottom */}
            <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4">
                <div className="max-w-[600px] w-full">
                    <Piano
                        noteRange={{ first: firstNote, last: lastNote }}
                        playNote={(midiNumber: number) => {
                            const note = MidiNumbers.getAttributes(midiNumber).note;
                            pianoRef.current?.triggerAttack(note);
                        }}
                        stopNote={(midiNumber: number) => {
                            const note = MidiNumbers.getAttributes(midiNumber).note;
                            pianoRef.current?.triggerRelease(note);
                        }}
                        activeNotes={activeNotes
                            .filter(note => note && note.trim() !== "")
                            .map(note => MidiNumbers.fromNote(note.trim()))}
                        width={600}
                        renderNoteLabel={() => null}
                    />
                </div>
            </div>
        </div>
    );
}
