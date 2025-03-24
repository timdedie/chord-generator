"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import MidiWriter from "midi-writer-js";
import { Chord } from "tonal";

interface MidiDownloaderProps {
    chords: string[];
}

const MidiDownloader: React.FC<MidiDownloaderProps> = ({ chords }) => {
    const [midiUrl, setMidiUrl] = useState<string>("");

    useEffect(() => {
        // Clean up old URL if any
        if (!chords.length) {
            setMidiUrl("");
            return;
        }

        const track = new MidiWriter.Track();
        track.setTimeSignature(4, 4, 24, 8);
        track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

        chords.forEach((ch) => {
            const notes = Chord.get(ch).notes.map((n) =>
                /\d/.test(n) ? n : `${n}4`
            );
            track.addEvent(new MidiWriter.NoteEvent({ pitch: notes, duration: "1" }));
        });

        const blob = new Blob([new MidiWriter.Writer(track).buildFile()], {
            type: "audio/midi",
        });
        const url = URL.createObjectURL(blob);
        setMidiUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [chords]);

    return (
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
                    <Button asChild disabled={!midiUrl} className="transition transform hover:scale-105 gap-2">
                        <a href={midiUrl} download="chord_progression.mid" className="flex items-center">
                            <Download className="h-5 w-5" />
                            Download MIDI
                        </a>
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MidiDownloader;
