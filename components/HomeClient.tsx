"use client";

import React, { useState, useCallback, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import NumChordsSelector from "@/components/NumChordsSelector";
import { useExamplePrompts } from "@/hooks/useExamplePrompts";
import posthog from "posthog-js";

const checkPosthogConfigured = () => {
    return typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST;
}

export default function HomeClient() {
    const router = useRouter();
    const { randomExamples } = useExamplePrompts();

    const [prompt, setPrompt] = useState("");
    const [numChords, setNumChords] = useState(4);
    const [isNavigating, setIsNavigating] = useState(false);

    const handleGenerate = useCallback(() => {
        if (!prompt.trim()) return;

        setIsNavigating(true);

        if (checkPosthogConfigured()) {
            posthog.capture('chords_generated', {
                prompt_text: prompt,
                prompt_length: prompt.length,
                num_chords_requested: numChords,
                source: 'homepage',
            });
        }

        const params = new URLSearchParams();
        params.set("q", prompt);
        params.set("n", String(numChords));
        router.push(`/results?${params.toString()}`);
    }, [prompt, numChords, router]);

    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleGenerate();
        }
    }, [handleGenerate]);

    const handleExampleClick = useCallback((example: string) => {
        if (checkPosthogConfigured()) {
            posthog.capture('example_prompt_clicked', {
                example_prompt_text: example,
                num_chords_requested: numChords,
            });
        }

        setIsNavigating(true);

        const params = new URLSearchParams();
        params.set("q", example);
        params.set("n", String(numChords));
        router.push(`/results?${params.toString()}`);
    }, [numChords, router]);

    const handleNumChordsChange = useCallback((value: number) => {
        setNumChords(value);
        if (checkPosthogConfigured()) {
            posthog.capture('num_chords_setting_changed', { num_chords_selected: value });
        }
    }, []);

    return (
        <div className="min-h-[calc(100vh-theme(height.16))] bg-gray-50 dark:bg-black transition-colors duration-300 selection:bg-primary/70 selection:text-primary-foreground">
            <main className="flex flex-col items-center justify-center w-full px-4 min-h-[calc(100vh-theme(height.16))]">
                <div className="w-full max-w-3xl">
                    {/* Search bar - same style as results page */}
                    <div className="flex items-center gap-2 bg-white dark:bg-black rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-2 mb-6">
                        <Input
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe a mood, style, or genre..."
                            className="flex-grow h-12 text-lg px-4 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            disabled={isNavigating}
                            aria-label="Chord progression description"
                            maxLength={200}
                            autoFocus
                        />

                        <div className="flex-shrink-0 hidden sm:block">
                            <NumChordsSelector
                                value={numChords}
                                onChange={handleNumChordsChange}
                                disabled={isNavigating}
                                compact
                            />
                        </div>

                        <Button
                            onClick={handleGenerate}
                            className="h-12 w-12 flex items-center justify-center flex-shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                            disabled={isNavigating || !prompt.trim()}
                            aria-label="Generate Chords"
                        >
                            <ArrowRight className="h-5 w-5" strokeWidth={3} />
                        </Button>
                    </div>

                    {/* Example prompts */}
                    <AnimatePresence>
                        {!isNavigating && (
                            <motion.div
                                key="example-buttons"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-wrap gap-2"
                            >
                                {randomExamples.map((ex, i) => (
                                    <Button
                                        key={i}
                                        variant="secondary"
                                        disabled={isNavigating}
                                        onClick={() => handleExampleClick(ex)}
                                        className="hover:scale-[1.01] transition-transform shadow-md bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        {ex}
                                    </Button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
