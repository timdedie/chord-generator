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
import { Card, CardContent } from "@/components/ui/card";
import { ChordItem } from "@/hooks/useChordManagement";

interface ChordRowProps {
    chords: ChordItem[];
    loadingChordId: string | null;
    sensors: any;
    handleDragEnd: (event: DragEndEvent) => void;
    addChordAt: (position: number) => void;
    playChord: (chord: string) => void;
    onRemoveChord: (chordId: string, chordSymbol: string) => void;
    setChords: React.Dispatch<React.SetStateAction<ChordItem[]>>;
}

export default function ChordRow({
                                     chords,
                                     loadingChordId,
                                     sensors,
                                     handleDragEnd,
                                     addChordAt,
                                     playChord,
                                     onRemoveChord,
                                 }: ChordRowProps) {
    const hasChords = chords.length > 0;
    let content: React.ReactNode;

    if (hasChords) {
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
            >
                <SortableChord
                    id={chord.id}
                    item={chord}
                    onPlay={() => playChord(chord.chord)}
                    onRemove={() => onRemoveChord(chord.id, chord.chord)}
                    loading={loadingChordId === chord.id}
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
            <div className="w-full h-full overflow-x-auto flex items-center pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={chords.map((c) => c.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        <div className="flex items-center gap-2 w-max">
                            <AnimatePresence>{elements}</AnimatePresence>
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        );
    } else {
        content = (
            <div className="w-full flex justify-center items-center h-full">
                <p className="text-muted-foreground">
                    Your generated chords will appear here.
                </p>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-3xl bg-transparent shadow-none">
            <CardContent className="p-4 sm:p-6 h-52">
                {content}
            </CardContent>
        </Card>
    );
}