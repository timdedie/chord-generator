"use client";

import React, { KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";

interface ChordGeneratorProps {
    prompt: string;
    setPrompt: (value: string) => void;
    handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    generateChords: () => void;
    fullLoading: boolean;
    chordsLength: number;
    randomExamples: string[];
    handleExampleClick: (example: string) => void;
}

export default function ChordGenerator({
                                           prompt,
                                           setPrompt,
                                           handleKeyDown,
                                           generateChords,
                                           fullLoading,
                                           chordsLength,
                                           randomExamples,
                                           handleExampleClick,
                                       }: ChordGeneratorProps) {
    return (
        <div className="w-full max-w-3xl px-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                What chord progression do you want to generate?
            </p>
            <div className="flex gap-4 mb-8">
                <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe a mood, style, genre or key ..."
                    className="flex-grow px-8 h-16 placeholder:text-2xl !text-2xl"
                    disabled={fullLoading}
                />
                <Button
                    onClick={generateChords}
                    className="w-16 h-16 flex items-center justify-center transition transform hover:scale-105"
                    disabled={fullLoading}
                >
                    <RefreshCw className={`h-8 w-8 ${fullLoading ? "animate-spin" : ""}`} />
                </Button>
            </div>

            <AnimatePresence>
                {!fullLoading && chordsLength === 0 && (
                    <motion.div
                        key="example-buttons"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-wrap gap-2 mb-6"
                    >
                        {randomExamples.map((ex, i) => (
                            <Button
                                key={i}
                                variant="secondary"
                                disabled={fullLoading}
                                onClick={() => handleExampleClick(ex)}
                                className="hover:scale-101"
                            >
                                {ex}
                            </Button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
