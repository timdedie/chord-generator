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
                isPlaying={playingChordId === chord.id}
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
        <Card className="w-full max-w-3xl bg-transparent shadow-none h-72">
            {/* 1. Add `relative` to make this the positioning container for the absolute button */}
            <CardContent className="relative p-4 sm:p-6 h-full flex flex-col">
                {hasChords ? (
                    // Use a React Fragment to hold the button and the chord list as siblings
                    <>
                        {/* 2. Absolutely position the button in the top-left corner */}
                        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10">
                            <Button
                                onClick={onTogglePlayPause}
                                variant="outline"
                                size="icon"
                                className="relative w-14 h-14 rounded-full"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {isPlaying ? (
                                        <motion.div
                                            key="pause"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <Pause className="h-6 w-6" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="play"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <Play className="h-6 w-6" fill="currentColor" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </div>

                        {/* 3. This container now centers the chord list vertically and horizontally */}
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
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
                    </>
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