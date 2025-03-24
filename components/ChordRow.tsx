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

// Define the type for a chord item.
export interface ChordItem {
    id: string;
    chord: string;
    locked: boolean;
}

interface ChordRowProps {
    chords: ChordItem[];
    fullLoading: boolean;
    loadingChordId: string | null;
    sensors: any; // adjust sensor type if desired
    handleDragEnd: (event: DragEndEvent) => void;
    addChordAt: (position: number) => void;
    playChord: (chord: string) => void;
    toggleLock: (id: string) => void;
    setChords: React.Dispatch<React.SetStateAction<ChordItem[]>>;
}

function SkeletonCard() {
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
                                     toggleLock,
                                     setChords,
                                 }: ChordRowProps) {
    let content: React.ReactNode = null;

    if (chords.length > 0) {
        const elements = chords.flatMap((chord, index) => [
            <Spacer
                key={`spacer-${index}`}
                position={index}
                chordsCount={chords.length}
                addChordAt={addChordAt}
            />,
            <motion.div
                key={chord.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
            >
                <SortableChord
                    id={chord.id}
                    item={chord}
                    onPlay={() => playChord(chord.chord)}
                    toggleLock={toggleLock}
                    onRemove={() =>
                        setChords((prev) => prev.filter((c) => c.id !== chord.id))
                    }
                    loading={
                        !chord.locked && (fullLoading || loadingChordId === chord.id)
                    }
                />
            </motion.div>,
        ]);

        // Add a final spacer at the end.
        elements.push(
            <Spacer
                key={`spacer-${chords.length}`}
                position={chords.length}
                chordsCount={chords.length}
                addChordAt={addChordAt}
            />
        );

        content = (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={chords.map((c) => c.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    <div className="flex gap-4 justify-center w-full">
                        <AnimatePresence>{elements}</AnimatePresence>
                    </div>
                </SortableContext>
            </DndContext>
        );
    } else if (fullLoading) {
        // Show some skeletons while loading.
        content = (
            <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    return <>{content}</>;
}
