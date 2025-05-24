"use client";

import React, { KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";
import NumChordsSelector from "@/components/NumChordsSelector";
import ModelSwitch from "@/components/ModelSwitch"; // Import the new component

interface ChordGeneratorProps {
    prompt: string;
    setPrompt: (value: string) => void;
    handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    generateChords: () => void; // This will be updated in ClientHome to pass model choice
    fullLoading: boolean;
    chordsLength: number;
    randomExamples: string[];
    handleExampleClick: (example: string) => void; // This will be updated
    numChordsToGenerate: number;
    onNumChordsChange: (value: number) => void;
    useAdvancedModel: boolean; // New prop
    onAdvancedModelChange: (checked: boolean) => void; // New prop
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
                                           useAdvancedModel,       // New
                                           onAdvancedModelChange,  // New
                                       }: ChordGeneratorProps) {
    return (
        <div className="w-full max-w-3xl px-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                What chord progression do you want to generate?
            </p>
            <div className="flex flex-col gap-4 mb-4"> {/* Changed outer flex to col for input + controls */}
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
                    />
                    {/* Generate Button moved next to input on larger screens or below on smaller */}
                    <Button
                        onClick={generateChords}
                        className="w-full sm:w-16 h-16 flex items-center justify-center transition transform hover:scale-105 flex-shrink-0"
                        disabled={fullLoading}
                        aria-label="Generate Chords"
                    >
                        <RefreshCw className={`h-8 w-8 ${fullLoading ? "animate-spin" : ""}`} />
                    </Button>
                </div>

                {/* Controls Container: NumChordsSelector and ModelSwitch */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center mt-1">
                    <NumChordsSelector
                        value={numChordsToGenerate}
                        onChange={onNumChordsChange}
                        disabled={fullLoading}
                    />
                    <ModelSwitch
                        checked={useAdvancedModel}
                        onCheckedChange={onAdvancedModelChange}
                        disabled={fullLoading}
                        label="Deep Think ✨"
                        description="Uses advanced model (slower)."
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
                        className="flex flex-wrap gap-2 mb-6" // mb-6 was mb-8 on input group before
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