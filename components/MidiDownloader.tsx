"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import MidiWriter from "midi-writer-js";
import { Chord } from "tonal";
import { toast } from "sonner";

interface MidiDownloaderProps {
    chords: string[];
    prompt: string;
}

const MidiDownloader: React.FC<MidiDownloaderProps> = ({ chords, prompt }) => {
    const [midiUrl, setMidiUrl] = useState<string>("");
    const [hasValidChords, setHasValidChords] = useState<boolean>(false);

    useEffect(() => {
        if (!chords || chords.length === 0) {
            if (midiUrl) URL.revokeObjectURL(midiUrl);
            setMidiUrl("");
            setHasValidChords(false);
            return;
        }

        const track = new MidiWriter.Track();
        track.setTimeSignature(4, 4, 24, 8);
        track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

        let validChordsFound = false;
        chords.forEach((ch) => {
            const chordData = Chord.get(ch);
            if (chordData.empty || !chordData.notes || chordData.notes.length === 0) {
                console.warn(`Skipping empty or invalid chord for MIDI: ${ch}`);
                return;
            }
            const notes = chordData.notes.map((n) =>
                /\d/.test(n) ? n : `${n}4`
            );
            track.addEvent(new MidiWriter.NoteEvent({ pitch: notes, duration: "1" }));
            validChordsFound = true;
        });

        if (!validChordsFound) {
            if (midiUrl) URL.revokeObjectURL(midiUrl);
            setMidiUrl("");
            setHasValidChords(false);
            return;
        }

        setHasValidChords(true);
        const writer = new MidiWriter.Writer([track]);
        const blob = new Blob([writer.buildFile()], {
            type: "audio/midi",
        });
        const newUrl = URL.createObjectURL(blob);

        if (midiUrl) {
            URL.revokeObjectURL(midiUrl);
        }
        setMidiUrl(newUrl);

        return () => {
            URL.revokeObjectURL(newUrl);
        };
    }, [chords]);

    const handleDownloadClick = () => {
        if (!midiUrl || !hasValidChords) {
            toast.error("MIDI Not Ready", {
                description: "No valid chords to download.",
            });
            return;
        }
        toast.success("Download Started!", {
            description: "Drag the MIDI file into your DAW to use it.",
        });
    };

    // Correctly structured variants object with a const assertion
    const buttonVariants = {
        initial: { opacity: 0, y: 10 },
        animate: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, ease: "easeInOut" },
        },
        exit: {
            opacity: 0,
            y: 10,
            transition: { duration: 0.3, ease: "easeInOut" },
        },
    } as const; // This tells TypeScript these values are fixed and literal

    const sanitizePromptForFilename = (text: string) => {
        if (!text) return "prompt";
        return text
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^\w-]+/g, '')
            .substring(0, 50);
    };

    const generateFilename = () => {
        const sanitizedPrompt = sanitizePromptForFilename(prompt);
        if (!chords || chords.length === 0) {
            return `${sanitizedPrompt}_progression.mid`;
        }
        const safeChords = chords.map(chord => chord.replace(/\//g, '-').replace(/\s+/g, '_'));
        return `${sanitizedPrompt}_${safeChords.join('_')}.mid`;
    };

    return (
        <div>
            <AnimatePresence>
                {(midiUrl && hasValidChords) && (
                    <motion.div
                        key="downloadButtonActual"
                        variants={buttonVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        <Button
                            asChild
                            className="transition transform gap-2 max-w-xs sm:w-auto"
                            onClick={handleDownloadClick}
                        >
                            <a
                                href={midiUrl}
                                download={generateFilename()}
                                className="flex items-center"
                            >
                                <Download className="h-5 w-5" />
                                Download MIDI
                            </a>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MidiDownloader;