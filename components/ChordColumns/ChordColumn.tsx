"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { X, GripVertical } from "lucide-react";
import ColumnChordInfo from "./ColumnChordInfo";
import { ChordColor } from "@/lib/chordColors";
import { cn } from "@/lib/utils";

interface ChordColumnProps {
  id: string;
  chord: string;
  color: ChordColor;
  isPlaying: boolean;
  loading: boolean;
  onPlay: () => void;
  onRemove: () => void;
}

export default function ChordColumn({
  id,
  chord,
  color,
  isPlaying,
  loading,
  onPlay,
  onRemove,
}: ChordColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const [hover, setHover] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: color.bg,
  };

  if (loading || !chord) {
    return (
      <motion.div
        layout
        initial={{ flex: 0 }}
        animate={{ flex: 1 }}
        exit={{ flex: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative h-full min-w-[120px] md:min-w-0 snap-center overflow-hidden"
        style={{ backgroundColor: color.bg, opacity: 0.5 }}
      >
        <div className="absolute inset-0 animate-pulse bg-white/20" />
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      layout={!isDragging}
      initial={{ flex: 0, opacity: 0 }}
      animate={{ flex: 1, opacity: 1 }}
      exit={{ flex: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={style}
      className={cn(
        "relative h-full min-w-[120px] md:min-w-0 cursor-pointer select-none snap-center overflow-hidden",
        isDragging && "z-50 opacity-80 shadow-2xl"
      )}
      onClick={onPlay}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Playing pulse overlay */}
      {isPlaying && (
        <motion.div
          className="absolute inset-0 bg-white/20"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Hover overlay with controls */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-200 z-10",
          hover ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-colors cursor-pointer"
          style={{ color: color.text }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </button>

        {/* Drag handle - only this element triggers drag */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 rounded-full bg-black/10 cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical
            className="h-5 w-5"
            style={{ color: color.text, opacity: 0.7 }}
          />
        </div>
      </div>

      {/* Chord info anchored to bottom */}
      <div className="absolute bottom-0 left-0 right-0 pb-6 flex justify-center">
        <ColumnChordInfo chord={chord} textColor={color.text} />
      </div>
    </motion.div>
  );
}
