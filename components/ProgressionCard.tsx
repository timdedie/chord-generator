"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SortableChord from "@/components/SortableChord";
import Spacer from "@/components/Spacer";
import { ChordItem } from "@/hooks/useChordManagement";
import { Chord } from "tonal";
import { now as toneNow } from "tone";
import { usePiano } from "@/components/PianoProvider";
import { getVoicedChordNotes } from "@/lib/chordUtils";
import dynamic from "next/dynamic";
import posthog from "posthog-js";

const MidiDownloaderInline = dynamic(() => import("@/components/MidiDownloader"), {
    loading: () => <Button size="sm" variant="outline" disabled><Download className="h-4 w-4 mr-1" />MIDI</Button>,
    ssr: false
});

const DynamicMarkdownDisplay = dynamic(() => import("@/components/MarkdownDisplay"), {
    loading: () => (
        <div className="flex items-center justify-center h-full">
            <Sparkles className="h-6 w-6 animate-pulse text-primary" />
        </div>
    ),
    ssr: false
});

interface ProgressionCardProps {
    id: string;
    initialChords: string[];
    style: string;
    prompt: string;
    onActiveNotesChange: (notes: string[]) => void;
    onChordPlay?: (chord: string) => void;
}

const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const checkPosthogConfigured = () => {
    return typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST;
}

export default function ProgressionCard({
    id,
    initialChords,
    style,
    prompt,
    onActiveNotesChange,
    onChordPlay,
}: ProgressionCardProps) {
    const [chords, setChords] = useState<ChordItem[]>(() =>
        initialChords.map((chord, index) => ({
            id: `${id}-chord-${index}-${generateUniqueId()}`,
            chord,
        }))
    );
    const [loadingChordId, setLoadingChordId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingChordId, setPlayingChordId] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(true);

    // Explanation state
    const [isExplanationPopoverOpen, setIsExplanationPopoverOpen] = useState(false);
    const [currentExplanationText, setCurrentExplanationText] = useState("");
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [explanationCache, setExplanationCache] = useState<Map<string, string>>(new Map());
    const explanationAbortControllerRef = useRef<AbortController | null>(null);
    const currentProgressionKeyRef = useRef<string>("");

    const { piano, areSamplesLoaded, loadSamples, isLoadingSamples } = usePiano();
    const sensors = useSensors(useSensor(PointerSensor));

    const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const heldNotesRef = useRef<string[]>([]);
    const CHORD_PLAYBACK_INTERVAL = 1200;

    const playChordOnce = useCallback(async (chordSymbol: string) => {
        if (!piano || !areSamplesLoaded) return;
        if (checkPosthogConfigured()) posthog.capture('chord_played', { chord_symbol: chordSymbol, source: 'progression_card' });
        onChordPlay?.(chordSymbol);

        const notesToPlay = getVoicedChordNotes(chordSymbol);
        if (notesToPlay.length === 0) {
            onActiveNotesChange([]);
            return;
        }

        const noteDuration = 0.8;
        onActiveNotesChange(notesToPlay);
        piano.triggerAttackRelease(notesToPlay, noteDuration, toneNow());
        setTimeout(() => onActiveNotesChange([]), noteDuration * 1000);
    }, [piano, areSamplesLoaded, onActiveNotesChange, onChordPlay]);

    const pauseProgression = useCallback(() => {
        if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
        playbackTimeoutRef.current = null;

        if (piano && heldNotesRef.current.length > 0) {
            piano.triggerRelease(heldNotesRef.current, toneNow());
            heldNotesRef.current = [];
        }

        setIsPlaying(false);
        setPlayingChordId(null);
        onActiveNotesChange([]);
    }, [piano, onActiveNotesChange]);

    const playNextChord = useCallback((index: number) => {
        if (index >= chords.length) {
            pauseProgression();
            return;
        }

        const chordToPlay = chords[index];
        if (chordToPlay && piano) {
            setPlayingChordId(chordToPlay.id);
            const newNotes = getVoicedChordNotes(chordToPlay.chord);

            if (newNotes.length > 0) {
                if (heldNotesRef.current.length > 0) {
                    piano.triggerRelease(heldNotesRef.current, toneNow());
                }
                piano.triggerAttack(newNotes, toneNow());
                heldNotesRef.current = newNotes;
                onActiveNotesChange(newNotes);
            }

            playbackTimeoutRef.current = setTimeout(() => {
                playNextChord(index + 1);
            }, CHORD_PLAYBACK_INTERVAL);
        } else {
            pauseProgression();
        }
    }, [chords, piano, pauseProgression, onActiveNotesChange]);

    const handleTogglePlayPause = useCallback(() => {
        if (isPlaying) {
            pauseProgression();
            if (checkPosthogConfigured()) posthog.capture('progression_playback_paused', { progression: chords.map(c => c.chord).join('-') });
        } else {
            if (chords.length === 0) return;
            if (!areSamplesLoaded) {
                if (!isLoadingSamples) loadSamples();
                return;
            }
            setIsPlaying(true);
            playNextChord(0);
            if (checkPosthogConfigured()) posthog.capture('progression_playback_started', { progression: chords.map(c => c.chord).join('-'), chord_count: chords.length });
        }
    }, [isPlaying, pauseProgression, playNextChord, chords, areSamplesLoaded, isLoadingSamples, loadSamples]);

    // Stop playback when chords change
    useEffect(() => {
        pauseProgression();
    }, [chords, pauseProgression]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setChords((items) => {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return items;
            return arrayMove(items, oldIndex, newIndex);
        });

        if (checkPosthogConfigured()) {
            const oldIndex = chords.findIndex(c => String(c.id) === String(active.id));
            const newIndex = chords.findIndex(c => String(c.id) === String(over.id));
            posthog.capture('chord_rearranged', {
                moved_chord_symbol: chords[oldIndex]?.chord || 'unknown',
                original_index: oldIndex,
                new_index: newIndex,
                total_chords_in_progression: chords.length
            });
        }
    }, [chords]);

    const handleRemoveChord = useCallback((chordId: string, chordSymbol: string) => {
        setChords(prev => prev.filter(c => c.id !== chordId));
        if (checkPosthogConfigured()) {
            posthog.capture('chord_removed', {
                removed_chord_symbol: chordSymbol,
                remaining_chords_count: chords.length > 0 ? chords.length - 1 : 0
            });
        }
    }, [chords.length]);

    const addChordAt = useCallback(async (position: number) => {
        if (chords.length >= 8) return;

        const newChordId = generateUniqueId();
        const placeholderChord: ChordItem = { id: newChordId, chord: "" };

        const originalChords = [...chords];
        const updatedChordsWithPlaceholder = [
            ...originalChords.slice(0, position),
            placeholderChord,
            ...originalChords.slice(position),
        ];
        setChords(updatedChordsWithPlaceholder);
        setLoadingChordId(newChordId);

        try {
            const existingChordsForApi = originalChords.map(c => ({ chord: c.chord }));

            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    existingChords: existingChordsForApi,
                    addChordPosition: position,
                    prompt: prompt || "add one suitable chord here",
                }),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                console.error("Add Chord API Error:", data.error);
                setChords(originalChords);
                setLoadingChordId(null);
                return;
            }

            const cleanedReceivedChordSymbol = data.chord?.trim();
            const chordData = cleanedReceivedChordSymbol ? Chord.get(cleanedReceivedChordSymbol) : null;

            if (!cleanedReceivedChordSymbol || !chordData || !chordData.symbol) {
                setChords(originalChords);
                setLoadingChordId(null);
                return;
            }

            const updatedChordItem: ChordItem = {
                id: newChordId,
                chord: chordData.symbol,
            };
            setChords(prev => prev.map(ch => (ch.id === newChordId ? updatedChordItem : ch)));
        } catch (e) {
            console.error("Error adding chord:", e);
            setChords(originalChords);
        }
        setLoadingChordId(null);
    }, [chords, prompt]);

    // Explanation functionality
    const fetchAndStreamExplanation = async (progressionKey: string) => {
        if (explanationAbortControllerRef.current) {
            explanationAbortControllerRef.current.abort();
        }
        explanationAbortControllerRef.current = new AbortController();
        setIsExplanationLoading(true);
        let accumulatedText = "";
        setCurrentExplanationText("");

        try {
            const response = await fetch('/api/explain-progression', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chords: chords.map(c => c.chord), prompt: prompt }),
                signal: explanationAbortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (!response.body) throw new Error("Response body is null");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done: readerDone } = await reader.read();
                if (readerDone) break;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedText += chunk;
                    if (currentProgressionKeyRef.current === progressionKey) {
                        setCurrentExplanationText(prev => prev + chunk);
                    }
                }
            }

            if (currentProgressionKeyRef.current === progressionKey) {
                setExplanationCache(prev => new Map(prev).set(progressionKey, accumulatedText));
                if (checkPosthogConfigured()) {
                    posthog.capture('explanation_generated_successfully', {
                        progression_key: progressionKey,
                        prompt_used_for_explanation: prompt
                    });
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') {
                // Aborted
            } else {
                if (currentProgressionKeyRef.current === progressionKey) {
                    setCurrentExplanationText(`Error fetching explanation.`);
                }
            }
        } finally {
            if (currentProgressionKeyRef.current === progressionKey) {
                setIsExplanationLoading(false);
            }
            explanationAbortControllerRef.current = null;
        }
    };

    const handleExplainClick = () => {
        if (chords.length === 0) return;
        const progressionKey = chords.map(c => c.chord).join('-');

        if (isExplanationPopoverOpen && currentProgressionKeyRef.current === progressionKey && !isExplanationLoading) {
            setIsExplanationPopoverOpen(false);
            return;
        }

        currentProgressionKeyRef.current = progressionKey;
        setIsExplanationPopoverOpen(true);

        if (explanationCache.has(progressionKey)) {
            setCurrentExplanationText(explanationCache.get(progressionKey) || "");
            setIsExplanationLoading(false);
        } else {
            setCurrentExplanationText("");
            fetchAndStreamExplanation(progressionKey);
        }
    };

    const onPopoverOpenChange = (open: boolean) => {
        setIsExplanationPopoverOpen(open);
        if (!open && explanationAbortControllerRef.current) {
            explanationAbortControllerRef.current.abort();
        }
    };

    const hasChords = chords.length > 0;

    const elements = hasChords ? chords.flatMap((chord, index) => [
        <Spacer
            key={`spacer-${index}-${chords.length}`}
            position={index}
            chordsCount={chords.length}
            addChordAt={addChordAt}
        />,
        <motion.div
            key={chord.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
        >
            <SortableChord
                id={chord.id}
                item={chord}
                onPlay={() => playChordOnce(chord.chord)}
                onRemove={() => handleRemoveChord(chord.id, chord.chord)}
                loading={loadingChordId === chord.id}
                isPlaying={playingChordId === chord.id}
            />
        </motion.div>,
    ]) : [];

    if (hasChords) {
        elements.push(
            <Spacer
                key={`spacer-${chords.length}-${chords.length}`}
                position={chords.length}
                chordsCount={chords.length}
                addChordAt={addChordAt}
            />
        );
    }

    return (
        <Card className="w-full bg-card/50 border border-border/50">
            <CardContent className="p-4 sm:p-6">
                {/* Header row with style label and collapse toggle */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">{style}</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="h-8 w-8 p-0"
                    >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Chords row */}
                            <div className="flex items-center gap-4">
                                {/* Play button */}
                                <Button
                                    onClick={handleTogglePlayPause}
                                    variant="outline"
                                    size="icon"
                                    className="relative w-12 h-12 rounded-full flex-shrink-0"
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        {isPlaying ? (
                                            <motion.div
                                                key="pause"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <Pause className="h-5 w-5" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="play"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <Play className="h-5 w-5" fill="currentColor" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Button>

                                {/* Chords container */}
                                <div className="flex-1 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={chords.map(c => c.id)}
                                            strategy={horizontalListSortingStrategy}
                                        >
                                            <div className="flex items-center gap-1 w-max py-2">
                                                <AnimatePresence>{elements}</AnimatePresence>
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                                <Popover open={isExplanationPopoverOpen} onOpenChange={onPopoverOpenChange}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleExplainClick}
                                            disabled={isExplanationLoading}
                                        >
                                            {isExplanationLoading ? (
                                                <Sparkles className="h-4 w-4 mr-1 animate-pulse" />
                                            ) : (
                                                <Sparkles className="h-4 w-4 mr-1" />
                                            )}
                                            Explain
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] sm:w-[380px] p-4" sideOffset={5}>
                                        <h4 className="font-medium leading-none text-sm mb-2">Explanation</h4>
                                        <div className="min-h-[50px] w-full">
                                            {isExplanationLoading && !currentExplanationText && (
                                                <div className="flex items-center justify-center h-full">
                                                    <Sparkles className="h-6 w-6 animate-pulse text-primary" />
                                                </div>
                                            )}
                                            {currentExplanationText && (
                                                <DynamicMarkdownDisplay markdownText={currentExplanationText} />
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                <MidiDownloaderInline
                                    chords={chords.map(c => c.chord)}
                                    prompt={prompt}
                                    compact
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
