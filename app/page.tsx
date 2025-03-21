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

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [chords, setChords] = useState<string[]>(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [midiUrl, setMidiUrl] = useState("");

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
            setChords([...cleaned, "", "", ""].slice(0, 4));
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const playChord = async (chord: string) => {
        if (!chord) return;
        await Tone.start();
        const synth = new Tone.PolySynth().toDestination();
        const notes = Chord.get(chord).notes.map(n => (/\d/.test(n) ? n : `${n}4`));
        synth.triggerAttackRelease(notes, "2n");
    };

    const makeMidiUrl = (values: string[]) => {
        const track = new MidiWriter.Track();
        track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));
        values.forEach(chord => {
            const notes = Chord.get(chord).notes.map(n => (/\d/.test(n) ? n : `${n}4`));
            track.addEvent(new MidiWriter.NoteEvent({ pitch: notes, duration: "4" }));
        });
        const writer = new MidiWriter.Writer(track);
        return URL.createObjectURL(new Blob([writer.buildFile()], { type: "audio/midi" }));
    };

    useEffect(() => {
        if (chords.every(c => c === "")) {
            setMidiUrl("");
            return;
        }
        const url = makeMidiUrl(chords.filter(Boolean));
        setMidiUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [chords]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") generateChords();
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
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPrompt(e.target.value)}
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

                <div className="grid grid-cols-4 gap-8 w-full max-w-3xl mx-auto">
                    {chords.map((chord, idx) => (
                        <Card
                            key={idx}
                            onClick={() => playChord(chord)}
                            className={`cursor-pointer flex items-center justify-center w-40 h-40 border border-gray-300 ${
                                chord === "" ? "bg-gray-200" : "bg-gray-50"
                            }`}
                        >
                            {loading ? <LoadingThreeDotsJumping /> : <span className="text-2xl font-bold">{chord}</span>}
                        </Card>
                    ))}
                </div>

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
