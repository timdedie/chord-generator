"use client";

import React from "react"; 
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { ChordItem } from "@/hooks/useChordManagement";

interface MobileChordGridProps {
    chords: ChordItem[]; 
    playChord: (chord: string) => void;
}

export default function MobileChordGrid({
                                            chords,
                                            playChord,
                                        }: MobileChordGridProps) {

    const handleClickOrTap = (chordSymbol: string) => {
        playChord(chordSymbol);
    };

    return (
        <div className="grid grid-cols-2 gap-4 p-4 select-none">
            {chords.slice(0, 8).map((chord) => ( 
                <motion.div
                    key={chord.id}
                    layout 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card
                        className={cn(
                            "p-6 rounded-xl shadow-md cursor-pointer h-full flex flex-col items-center justify-center"
                        )}
                        onClick={() => handleClickOrTap(chord.chord)} 
                        onTouchEnd={(e) => { 
                            e.preventDefault(); 
                            handleClickOrTap(chord.chord);
                        }}
                    >
                        <div className="text-2xl text-center font-semibold break-all"> 
                            {chord.chord || "..."} 
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
