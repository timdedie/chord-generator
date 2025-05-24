"use client";

import React from "react"; // Removed useRef as timers are gone
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
// import { Lock } from "lucide-react"; // REMOVED Lock icon

// Import the ChordItem type from the central location
import { ChordItem } from "@/hooks/useChordManagement";

// Remove local ChordItem definition if it was here before and ensure to use the imported one
// export interface ChordItem {
//     id: string;
//     chord: string;
//     locked: boolean; // This was the issue
// }

interface MobileChordGridProps {
    chords: ChordItem[]; // Will use ChordItem from useChordManagement (no 'locked')
    playChord: (chord: string) => void;
    // toggleLock: (id: string) => void; // REMOVED
}

export default function MobileChordGrid({
                                            chords,
                                            playChord,
                                            // toggleLock, // REMOVED
                                        }: MobileChordGridProps) {
    // const timers = useRef<{ [key: string]: NodeJS.Timeout }>({}); // REMOVED long-press logic

    // REMOVED handleMouseDown
    // const handleMouseDown = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    //     e.preventDefault();
    //     timers.current[id] = setTimeout(() => {
    //         toggleLock(id);
    //     }, 500);
    // };

    // REMOVED handleMouseUp - click/tap now directly plays chord
    // const handleMouseUp = (id: string, chord: string) => {
    //     if (timers.current[id]) {
    //         clearTimeout(timers.current[id]);
    //         delete timers.current[id];
    //         playChord(chord);
    //     }
    // };

    const handleClickOrTap = (chordSymbol: string) => {
        playChord(chordSymbol);
    };

    return (
        <div className="grid grid-cols-2 gap-4 p-4 select-none">
            {chords.slice(0, 8).map((chord) => ( // Changed slice to 8 to show more on mobile if available, adjust as needed
                <motion.div
                    key={chord.id}
                    layout // Added for smoother animations if chords are added/removed
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card
                        className={cn(
                            "p-6 rounded-xl shadow-md cursor-pointer h-full flex flex-col items-center justify-center" // Ensure card takes full height of grid cell and centers content
                            // chord.locked && "bg-gray-200" // REMOVED locked state styling
                        )}
                        // Removed mouse/touch events for long-press
                        // onMouseDown={(e) => handleMouseDown(chord.id, e)}
                        // onMouseUp={() => handleMouseUp(chord.id, chord.chord)}
                        // onMouseLeave={() => { // This is also part of long-press logic
                        //     if (timers.current[chord.id]) {
                        //         clearTimeout(timers.current[chord.id]);
                        //         delete timers.current[chord.id];
                        //     }
                        // }}
                        // onTouchStart={(e) => handleMouseDown(chord.id, e)}
                        // onTouchEnd={() => handleMouseUp(chord.id, chord.chord)}
                        onClick={() => handleClickOrTap(chord.chord)} // Simple click/tap to play
                        onTouchEnd={(e) => { // Use onTouchEnd for tap consistency, prevent default if needed for scrolling
                            e.preventDefault(); // May or may not be needed depending on scroll behavior
                            handleClickOrTap(chord.chord);
                        }}
                    >
                        <div className="text-2xl text-center font-semibold break-all"> {/* Added break-all for long chord names */}
                            {chord.chord || "..."} {/* Show ... if chord is somehow empty */}
                        </div>
                        {/* REMOVED Lock icon display
                        {chord.locked && (
                            <div className="flex justify-center mt-2">
                                <Lock className="h-5 w-5 text-gray-500" />
                            </div>
                        )}
                        */}
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}