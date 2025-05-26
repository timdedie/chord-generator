"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { X, MoveHorizontal } from "lucide-react";
import ChordSymbol from "@/components/ChordSymbol";
import { ChordItem } from "@/hooks/useChordManagement";

export interface SortableChordProps {
    id: string;
    item: ChordItem;
    onPlay: () => void;
    onRemove: (id: string) => void;
    loading: boolean;
}

function SkeletonCard() {
    return (
        <div className="w-48 h-48 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
    );
}

const SortableChord: React.FC<SortableChordProps> = ({
                                                         id,
                                                         item,
                                                         onPlay,
                                                         onRemove,
                                                         loading,
                                                     }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });
    const [hover, setHover] = useState(false);

    if (loading || !item.chord) {
        return <SkeletonCard />;
    }

    return (
        <Card
            ref={setNodeRef}
            {...attributes}
            onClick={onPlay}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className="relative group cursor-pointer flex items-center justify-center w-48 h-48 border border-gray-300 bg-gray-50 dark:bg-black dark:border-gray-700"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
            >
                <ChordSymbol chord={item.chord} />
            </motion.div>

            {/* Delete button */}
            <AnimatePresence>
                {hover && (
                    <motion.div
                        key="delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(item.id);
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-2 right-2 cursor-pointer p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Drag handle */}
            <AnimatePresence>
                {hover && (
                    <motion.div
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 cursor-grab p-1"
                    >
                        <MoveHorizontal className="h-6 w-6" />
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default SortableChord;