"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface SpacerProps {
    position: number;
    chordsCount: number;
    addChordAt: (position: number) => void;
}

const Spacer: React.FC<SpacerProps> = ({ position, chordsCount, addChordAt }) => {
    const [hover, setHover] = useState(false);
    const canAdd = chordsCount < 8;

    return (
        <div
            className="w-[30px] h-28 relative"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <AnimatePresence>
                {hover && canAdd && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 m-auto w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full"
                        onClick={() => addChordAt(position)}
                    >
                        <Plus className="h-5 w-5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Spacer;
