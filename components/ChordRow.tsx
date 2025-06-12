"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import Spacer from "./Spacer";
import SortableChord from "./SortableChord";
import { Skeleton } from "@/components/ui/skeleton";
import { ChordItem } from "@/hooks/useChordManagement";

interface ChordRowProps {
    chords: ChordItem[];
    fullLoading: boolean;
    loadingChordId: string | null;
    sensors: any;
    handleDragEnd: (event: DragEndEvent) => void; // This should be handleDragEndAndTrack from ClientHome
    addChordAt: (position: number) => void; // This should be handleAddChordRequestAndTrack from ClientHome
    playChord: (chord: string) => void; // This should be playChordAndTrack from ClientHome
    onRemoveChord: (chordId: string, chordSymbol: string) => void; // New prop for handling removal with tracking
    setChords: React.Dispatch<React.SetStateAction<ChordItem[]>>; // Keep for other potential direct manipulations if any, or remove if all state changes are through callbacks
    numChordsToGenerate?: number;
}

function SkeletonCardUi() {
    return <Skeleton className="w-48 h-48 rounded-xl" />;
}

export default function ChordRow({
                                     chords,
                                     fullLoading,
                                     loadingChordId,
                                     sensors,
                                     handleDragEnd,
                                     addChordAt,
                                     playChord,
                                     onRemoveChord, // Use the new prop
                                     setChords, // Keep or remove based on usage
                                     numChordsToGenerate = 4,
                                 }: ChordRowProps) {
    let content: React.ReactNode = null;

    if (chords.length === 0 && fullLoading) {
        const numberOfSkeletons = numChordsToGenerate > 0 ? numChordsToGenerate : 4;
        content = (
            <div className="flex gap-4">
                {[...Array(numberOfSkeletons)].map((_, i) => (
                    <SkeletonCardUi key={`skeleton-${i}`} />
                ))}
            </div>
        );
    }
    else if (chords.length > 0) {
        const elements = chords.flatMap((chord, index) => [
            <Spacer
                key={`spacer-${index}-${chords.length}`}
                position={index}
                chordsCount={chords.length}
                addChordAt={addChordAt} // Propagates the tracking-enabled handler
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
                    onPlay={() => playChord(chord.chord)} // Propagates the tracking-enabled handler
                    onRemove={() => onRemoveChord(chord.id, chord.chord)} // Use the new onRemoveChord prop
                    loading={
                        loadingChordId === chord.id ||
                        fullLoading
                    }
                />
            </motion.div>,
        ]);

        elements.push(
            <Spacer
                key={`spacer-${chords.length}-${chords.length}`}
                position={chords.length}
                chordsCount={chords.length}
                addChordAt={addChordAt} // Propagates the tracking-enabled handler
            />
        );

        content = (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd} // Propagates the tracking-enabled handler
            >
                <SortableContext
                    items={chords.map((c) => c.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    <div className="flex gap-4 justify-center items-start w-full">
                        <AnimatePresence>
                            {elements}
                        </AnimatePresence>
                    </div>
                </SortableContext>
            </DndContext>
        );
    }

    return <>{content}</>;
}
