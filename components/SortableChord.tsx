"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { X, Lock, Unlock, MoveHorizontal } from "lucide-react";

export interface ChordItem {
    id: string;
    chord: string;
    locked: boolean;
}

export interface SortableChordProps {
    id: string;
    item: ChordItem;
    onPlay: () => void;
    toggleLock: (id: string) => void;
    onRemove: (id: string) => void;
    loading: boolean;
}

function SkeletonCard() {
    return <div className="w-48 h-48 rounded-xl bg-gray-200 animate-pulse" />;
}

const SortableChord: React.FC<SortableChordProps> = ({
                                                         id,
                                                         item,
                                                         onPlay,
                                                         toggleLock,
                                                         onRemove,
                                                         loading,
                                                     }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const [hover, setHover] = useState(false);

    if (loading) return <SkeletonCard />;

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
            <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-bold text-gray-900 dark:text-gray-100"
            >
                {item.chord}
            </motion.span>

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
                        className="absolute top-2 right-2 cursor-pointer"
                    >
                        <X className="h-6 w-6" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Drag handle */}
            <AnimatePresence>
                {hover && (
                    <motion.div
                        {...listeners}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-grab"
                    >
                        <MoveHorizontal className="h-6 w-6" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lock/unlock control */}
            <AnimatePresence>
                {(item.locked || hover) && (
                    <motion.div
                        key={item.locked ? "locked" : "unlocked"}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleLock(item.id);
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 cursor-pointer"
                    >
                        {item.locked ? <Lock className="h-6 w-6" /> : <Unlock className="h-6 w-6" />}
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
};

export default SortableChord;
