// components/MidiDownloader.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface MidiDownloaderProps {
    midiUrl: string;
}

const MidiDownloader: React.FC<MidiDownloaderProps> = ({ midiUrl }) => {
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
                    <Button
                        asChild
                        disabled={!midiUrl}
                        className="transition transform hover:scale-105 gap-2"
                    >
                        <a
                            href={midiUrl}
                            download="chord_progression.mid"
                            className="flex items-center"
                        >
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
