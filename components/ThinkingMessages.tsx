"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const thinkingMessagesList = [
    "Analyzing chords...", "Processing harmony...", "Generating chord ideas...",
    "Exploring options...", "Searching for chords...", "Calculating progression...",
    "Finding transitions...", "Structuring sequence...", "Evaluating combinations...",
    "Building progression...", "Refining selection...", "Connecting chords...",
    "Mapping harmony...", "Balancing variation...", "Running models...",
    "Filtering choices...", "Selecting transitions...", "Assembling sequence...",
    "Shaping harmony...", "Thinking in chords...", "Tuning flow...",
    "Adjusting dynamics...", "Choosing voicings...", "Arranging chords...",
    "Organizing structure...", "Aligning progression...", "Checking relationships...",
    "Sequencing chords...", "Resolving patterns...", "Verifying structure...",
    "Making decisions...", "Constructing output...", "Linking sections...",
    "Working on flow...", "Building structure...", "Solving puzzle...",
    "Ordering elements...", "Reviewing options...", "Placing chords...",
    "Designing sequence...", "Curating harmony...", "Modeling progression...",
    "Layering harmonies...", "Weighing chord paths...", "Testing variations...",
    "Outlining structure...", "Blending transitions...", "Auditioning ideas...",
    "Organizing voicings...", "Inspecting combinations...", "Generating structure...",
    "Drafting progression...", "Fitting harmonic pieces...", "Rechecking flow...",
    "Forming connections...", "Assembling ideas...", "Weaving chord paths...",
    "Simplifying structure...", "Reviewing progression...", "Tuning relationships...",
    "Arranging flow...", "Evaluating options...", "Checking consistency...",
];

export default function ThinkingMessages() {
    const [shuffledMessages, setShuffledMessages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const shuffled = [...thinkingMessagesList].sort(() => 0.5 - Math.random());
        setShuffledMessages(shuffled);
        setCurrentIndex(0);
    }, []);

    useEffect(() => {
        if (shuffledMessages.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % shuffledMessages.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [shuffledMessages]);

    if (shuffledMessages.length === 0) {
        return null; // Or a default loading message if preferred before shuffle
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={shuffledMessages[currentIndex]}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.7, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="mt-4 text-center text-gray-500 dark:text-gray-400"
            >
                {shuffledMessages[currentIndex]}
            </motion.div>
        </AnimatePresence>
    );
}