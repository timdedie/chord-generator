"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { X, MoveHorizontal } from "lucide-react";
import ChordSymbol from "@/components/ChordSymbol";
import { ChordItem } from "@/hooks/useChordManagement";
import { cn } from "@/lib/utils";

// This interface is updated to include `isPlaying`
export interface SortableChordProps {
    id: string;
    item: ChordItem;
    onPlay: () => void;
    onRemove: () => void;
    loading: boolean;
    isPlaying: boolean; // Prop for the playback indicator
}

const SortableChord: React.FC<SortableChordProps> = ({
                                                         id,
                                                         item,
                                                         onPlay,
                                                         onRemove,
                                                         loading,
                                                         isPlaying,
                                                     }) => {
    // This hook provides the props needed for dnd-kit to make this element sortable.
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });
    const [hover, setHover] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (loading || !item.chord) {
        return (
            <div className="w-28 h-28 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
        );
    }

    return (
        // `setNodeRef` and `style` from dnd-kit are applied here.
        <div ref={setNodeRef} style={style} className="touch-none">
            <Card
                onClick={onPlay}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                className={cn(
                    "relative group cursor-pointer flex items-center justify-center w-28 h-28 flex-shrink-0 border border-gray-300 bg-gray-50 dark:bg-black dark:border-gray-700 transition-colors duration-200",
                    isPlaying && "ring-2 ring-primary ring-offset-2 ring-offset-background dark:ring-offset-black"
                )}
            >
                <ChordSymbol chord={item.chord} className="text-4xl" />

                <div
                    className={cn(
                        "absolute inset-0 transition-opacity duration-200",
                        hover ? "opacity-100" : "opacity-0"
                    )}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="absolute top-1 right-1 cursor-pointer p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Remove</span>
                    </button>
                    {/* The drag handle gets the listeners from dnd-kit */}
                    <div
                        {...attributes}
                        {...listeners}
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 cursor-grab p-1"
                    >
                        <MoveHorizontal className="h-5 w-5 text-muted-foreground" />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SortableChord;