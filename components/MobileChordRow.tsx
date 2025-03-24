"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export interface ChordItem {
    id: string;
    chord: string;
    locked: boolean;
}

interface MobileChordGridProps {
    chords: ChordItem[];
    playChord: (chord: string) => void;
    toggleLock: (id: string) => void;
}

export default function MobileChordGrid({
                                            chords,
                                            playChord,
                                            toggleLock,
                                        }: MobileChordGridProps) {
    const timers = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const handleMouseDown = (id: string, e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        timers.current[id] = setTimeout(() => {
            toggleLock(id);
        }, 500);
    };

    const handleMouseUp = (id: string, chord: string) => {
        if (timers.current[id]) {
            clearTimeout(timers.current[id]);
            delete timers.current[id];
            playChord(chord);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-4 p-4 select-none">
            {chords.slice(0, 4).map((chord) => (
                <motion.div
                    key={chord.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card
                        className={cn(
                            "p-6 rounded-xl shadow-md cursor-pointer",
                            chord.locked && "bg-gray-200"
                        )}
                        onMouseDown={(e) => handleMouseDown(chord.id, e)}
                        onMouseUp={() => handleMouseUp(chord.id, chord.chord)}
                        onMouseLeave={() => {
                            if (timers.current[chord.id]) {
                                clearTimeout(timers.current[chord.id]);
                                delete timers.current[chord.id];
                            }
                        }}
                        onTouchStart={(e) => handleMouseDown(chord.id, e)}
                        onTouchEnd={() => handleMouseUp(chord.id, chord.chord)}
                    >
                        <div className="text-2xl text-center font-semibold">
                            {chord.chord}
                        </div>
                        {chord.locked && (
                            <div className="flex justify-center mt-2">
                                <Lock className="h-5 w-5 text-gray-500" />
                            </div>
                        )}
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}