"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface ColumnSpacerProps {
  position: number;
  chordsCount: number;
  addChordAt: (position: number) => void;
}

export default function ColumnSpacer({
  position,
  chordsCount,
  addChordAt,
}: ColumnSpacerProps) {
  const [hover, setHover] = useState(false);
  const canAdd = chordsCount < 8;

  return (
    <div
      className="relative flex-shrink-0 h-full flex items-center justify-center transition-all duration-200"
      style={{ width: hover && canAdd ? 40 : 4 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Desktop: show on hover */}
      <AnimatePresence>
        {hover && canAdd && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="hidden md:flex absolute w-8 h-8 items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors z-10 cursor-pointer"
            onClick={() => addChordAt(position)}
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
