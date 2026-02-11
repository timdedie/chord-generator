"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import posthog from "posthog-js";

import { Plus } from "lucide-react";
import SearchHeader from "@/components/SearchHeader";
import ProgressionCard from "@/components/ProgressionCard";
import PianoKeyboard from "@/components/PianoKeyboard";
import { usePiano } from "@/components/PianoProvider";
import ThinkingMessages from "@/components/ThinkingMessages";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface ProgressionData {
    id: string;
    chords: string[];
    style: string;
}

const checkPosthogConfigured = () => {
    return typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST;
}

function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { loadSamples, areSamplesLoaded, isLoadingSamples } = usePiano();

    const [prompt, setPrompt] = useState("");
    const [numChords, setNumChords] = useState(4);
    const [progressions, setProgressions] = useState<ProgressionData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [activeNotes, setActiveNotes] = useState<string[]>([]);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Load samples on mount
    useEffect(() => {
        if (!areSamplesLoaded && !isLoadingSamples) {
            loadSamples();
        }
    }, [areSamplesLoaded, isLoadingSamples, loadSamples]);

    // Load from URL params on mount
    useEffect(() => {
        const q = searchParams.get("q");
        const n = searchParams.get("n");

        if (q) {
            setPrompt(q);
        }
        if (n) {
            const numVal = parseInt(n, 10);
            if (numVal >= 2 && numVal <= 8) {
                setNumChords(numVal);
            }
        }

        // If we have a query and haven't generated yet, generate
        if (q && !hasInitialized) {
            setHasInitialized(true);
            generateProgressions(q, n ? parseInt(n, 10) : 4);
        }
    }, [searchParams, hasInitialized]);

    const generateProgressions = useCallback(async (queryPrompt: string, queryNumChords: number) => {
        if (!queryPrompt.trim()) return;

        setIsLoading(true);
        setProgressions([]);

        // Load samples if not loaded
        if (!areSamplesLoaded && !isLoadingSamples) {
            loadSamples();
        }

        try {
            const res = await fetch("/api/generate-multiple", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: queryPrompt,
                    numChords: queryNumChords,
                }),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                console.error("Generation error:", data.error);
                setIsLoading(false);
                return;
            }

            setProgressions(data.progressions || []);

            if (checkPosthogConfigured()) {
                posthog.capture('multiple_progressions_generated', {
                    prompt_text: queryPrompt,
                    num_chords_requested: queryNumChords,
                    num_progressions: data.progressions?.length || 0,
                });
            }
        } catch (err) {
            console.error("Network error:", err);
        }

        setIsLoading(false);
    }, [areSamplesLoaded, isLoadingSamples, loadSamples]);

    const generateMoreProgressions = useCallback(async () => {
        if (!prompt.trim() || isLoadingMore) return;

        setIsLoadingMore(true);

        try {
            const existingProgressions = progressions.map((p) => ({
                chords: p.chords,
                style: p.style,
            }));

            const res = await fetch("/api/generate-multiple", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt,
                    numChords,
                    existingProgressions,
                }),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                console.error("Generate more error:", data.error);
                setIsLoadingMore(false);
                return;
            }

            setProgressions((prev) => [...prev, ...(data.progressions || [])]);

            if (checkPosthogConfigured()) {
                posthog.capture('more_progressions_generated', {
                    prompt_text: prompt,
                    num_chords_requested: numChords,
                    total_progressions: progressions.length + (data.progressions?.length || 0),
                });
            }
        } catch (err) {
            console.error("Network error:", err);
        }

        setIsLoadingMore(false);
    }, [prompt, numChords, progressions, isLoadingMore]);

    const handleGenerate = useCallback(() => {
        if (!prompt.trim()) return;

        // Update URL
        const params = new URLSearchParams();
        params.set("q", prompt);
        params.set("n", String(numChords));
        router.push(`/app/results?${params.toString()}`);

        generateProgressions(prompt, numChords);
    }, [prompt, numChords, router, generateProgressions]);

    const handleNumChordsChange = useCallback((value: number) => {
        setNumChords(value);
        if (checkPosthogConfigured()) {
            posthog.capture('num_chords_setting_changed', { num_chords_selected: value });
        }
    }, []);

    const handleActiveNotesChange = useCallback((notes: string[]) => {
        setActiveNotes(notes);
    }, []);

    const firstNote = MidiNumbers.fromNote("C3");
    const lastNote = MidiNumbers.fromNote("C5");

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
            {/* Top gradient */}
            <div className="fixed top-0 left-0 md:left-14 right-0 h-12 bg-gradient-to-b from-gray-50 dark:from-black to-transparent pointer-events-none z-20" />

            <SearchHeader
                prompt={prompt}
                setPrompt={setPrompt}
                numChords={numChords}
                onNumChordsChange={handleNumChordsChange}
                onGenerate={handleGenerate}
                isLoading={isLoading}
            />

            <main className="container max-w-4xl mx-auto px-4 pt-36 pb-48">
                {isLoading ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-center py-8">
                            <ThinkingMessages />
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-full">
                                <Skeleton className="h-[200px] w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                ) : progressions.length > 0 ? (
                    <div className="space-y-6">
                        {progressions.map((progression) => (
                            <ProgressionCard
                                key={progression.id}
                                id={progression.id}
                                initialChords={progression.chords}
                                style={progression.style}
                                prompt={prompt}
                                onActiveNotesChange={handleActiveNotesChange}
                            />
                        ))}
                        {isLoadingMore ? (
                            <>
                                {[1, 2, 3].map((i) => (
                                    <div key={`skeleton-more-${i}`} className="w-full">
                                        <Skeleton className="h-[200px] w-full rounded-lg" />
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="flex justify-center pt-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={generateMoreProgressions}
                                    className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors"
                                >
                                    <Plus className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-muted-foreground text-lg">
                            {prompt ? "No progressions generated yet." : "Enter a prompt to generate chord progressions."}
                        </p>
                        {prompt && (
                            <p className="text-muted-foreground text-sm mt-2">
                                Click the generate button to create progressions.
                            </p>
                        )}
                    </div>
                )}
            </main>

            {/* Bottom gradient above piano */}
            <div className="fixed bottom-0 left-0 md:left-14 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-black to-transparent pointer-events-none z-20" />

            <PianoKeyboard firstNote={firstNote} lastNote={lastNote} activeNotes={activeNotes} />
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}
