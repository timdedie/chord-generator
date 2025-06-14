"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import Spacer from "./Spacer";
import SortableChord from "./SortableChord"; // Ensure this path is correct
import { Card, CardContent } from "@/components/ui/card";
import { ChordItem } from "@/hooks/useChordManagement";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

// Updated props to include playback controls and remove unused setChords
interface ChordRowProps {
    chords: ChordItem[];
    loadingChordId: string | null;
    sensors: any;
    handleDragEnd: (event: DragEndEvent) => void;
    addChordAt: (position: number) => void;
    playChord: (chord: string) => void;
    onRemoveChord: (chordId: string, chordSymbol: string) => void;
    playingChordId: string | null;
    isPlaying: boolean;
    onTogglePlayPause: () => void;
}

export default function ChordRow({
                                     chords,
                                     loadingChordId,
                                     sensors,
                                     handleDragEnd,
                                     addChordAt,
                                     playChord,
                                     onRemoveChord,
                                     playingChordId,
                                     isPlaying,
                                     onTogglePlayPause,
                                 }: ChordRowProps) {
    const hasChords = chords.length > 0;

    // This is your proven, working structure for the elements list.
    // The only change is passing the `isPlaying` prop to SortableChord.
    const elements = hasChords ? chords.flatMap((chord, index) => [
        <Spacer
            key={`spacer-${index}-${chords.length}`}
            position={index}
            chordsCount={chords.length}
            addChordAt={addChordAt}
        />,
        <motion.div
            key={chord.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
        >
            <SortableChord
                id={chord.id}
                item={chord}
                onPlay={() => playChord(chord.chord)}
                onRemove={() => onRemoveChord(chord.id, chord.chord)}
                loading={loadingChordId === chord.id}
                isPlaying={playingChordId === chord.id} // Pass down playback state
            />
        </motion.div>,
    ]) : [];

    if (hasChords) {
        elements.push(
            <Spacer
                key={`spacer-${chords.length}-${chords.length}`}
                position={chords.length}
                chordsCount={chords.length}
                addChordAt={addChordAt}
            />
        );
    }

    return (
        // The layout is adjusted here, outside the D&D logic.
        // Card is given a fixed height to match the skeleton.
        <Card className="w-full max-w-3xl bg-transparent shadow-none h-72">
            <CardContent className="p-4 sm:p-6 h-full flex flex-col">
                {hasChords ? (
                    <div className="flex flex-col h-full">
                        {/* This div grows to fill space, containing the scrolling list */}
                        <div className="flex-grow flex items-center overflow-y-hidden">
                            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                {/* Your working D&D context structure is preserved perfectly here */}
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={chords.map((c) => c.id)}
                                        strategy={horizontalListSortingStrategy}
                                    >
                                        <div className="flex items-center gap-2 w-max py-4">
                                            <AnimatePresence>{elements}</AnimatePresence>
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>
                        {/* This div contains the play button at the bottom */}
                        <div className="flex-shrink-0 flex justify-center pt-4">
                            <Button onClick={onTogglePlayPause} variant="outline" size="lg" className="transition-all w-48">
                                {isPlaying ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                                {isPlaying ? "Pause" : "Play Progression"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full flex justify-center items-center">
                        <p className="text-muted-foreground">
                            Your generated chords will appear here.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}