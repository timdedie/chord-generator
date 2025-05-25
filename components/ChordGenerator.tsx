"use client";

import React, { KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";
import NumChordsSelector from "@/components/NumChordsSelector";
import ModelSwitch from "@/components/ModelSwitch";
// Tooltip related imports are removed

interface ChordGeneratorProps {
    prompt: string;
    setPrompt: (value: string) => void;
    handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    generateChords: () => void;
    fullLoading: boolean;
    chordsLength: number;
    randomExamples: string[];
    handleExampleClick: (example: string) => void;
    numChordsToGenerate: number;
    onNumChordsChange: (value: number) => void;
    useHighCreativity: boolean;
    onHighCreativityChange: (checked: boolean) => void;
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
                                           numChordsToGenerate,
                                           onNumChordsChange,
                                           useHighCreativity,
                                           onHighCreativityChange,
                                       }: ChordGeneratorProps) {
    return (
        <div className="w-full max-w-3xl px-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                What chord progression do you want to generate?
            </p>
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
                    <Input
                        id="prompt-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe a mood, style, genre or key ..."
                        className="flex-grow px-8 h-16 placeholder:text-2xl !text-2xl"
                        disabled={fullLoading}
                        aria-label="Chord progression description"
                        maxLength={200}
                    />
                    <Button
                        onClick={generateChords}
                        className="w-full sm:w-16 h-16 flex items-center justify-center transition transform hover:scale-105 flex-shrink-0"
                        disabled={fullLoading}
                        aria-label="Generate Chords"
                    >
                        <RefreshCw className={`h-8 w-8 ${fullLoading ? "animate-spin" : ""}`} />
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center mt-1">
                    <NumChordsSelector
                        value={numChordsToGenerate}
                        onChange={onNumChordsChange}
                        disabled={fullLoading}
                    />
                    {/* TooltipProvider and Tooltip components are removed */}
                    <ModelSwitch
                        checked={useHighCreativity}
                        onCheckedChange={onHighCreativityChange}
                        disabled={fullLoading}
                        label="Experimental Mode" // Label updated, emoji removed for now
                        id="creative-mode-switch"
                    />
                </div>
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