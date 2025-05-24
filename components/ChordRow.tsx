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
    handleDragEnd: (event: DragEndEvent) => void;
    addChordAt: (position: number) => void;
    playChord: (chord: string) => void;
    setChords: React.Dispatch<React.SetStateAction<ChordItem[]>>;
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
                                     setChords,
                                     numChordsToGenerate = 4,
                                 }: ChordRowProps) {
    let content: React.ReactNode = null;

    // Case 1: Initial loading (no chords yet, but fullLoading is true)
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
    // Case 2: Chords are present
    else if (chords.length > 0) {
        const elements = chords.flatMap((chord, index) => [
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
                // No 'layout' prop here for smoother DND reordering as per previous fix
            >
                <SortableChord
                    id={chord.id}
                    item={chord}
                    onPlay={() => playChord(chord.chord)}
                    onRemove={() =>
                        setChords((prev) => prev.filter((c) => c.id !== chord.id))
                    }
                    // Updated loading logic:
                    // A chord is loading if:
                    // 1. It's the specific chord being added (loadingChordId matches).
                    // 2. OR, a full regeneration is happening (fullLoading is true).
                    //    This will make existing chords show as skeletons during regeneration.
                    loading={
                        loadingChordId === chord.id || // True if this specific chord is being added
                        fullLoading                     // True if a general regeneration is in progress
                    }
                />
            </motion.div>,
        ]);

        elements.push(
            <Spacer
                key={`spacer-${chords.length}-${chords.length}`}
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
                    <div className="flex gap-4 justify-center items-start w-full">
                        <AnimatePresence>
                            {elements}
                        </AnimatePresence>
                    </div>
                </SortableContext>
            </DndContext>
        );
    }
    // Case 3: Not loading and no chords (e.g., after deleting all chords)
    // This will render `null` for content, which is fine.

    return <>{content}</>;
}