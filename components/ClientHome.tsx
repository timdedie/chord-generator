'use client';

import React, { useEffect, useState, useCallback, KeyboardEvent, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import { start as toneStart, now as toneNow } from "tone";
import { Chord, Note } from "tonal";
import dynamic from 'next/dynamic';
import posthog from 'posthog-js';
import type { DragEndEvent } from "@dnd-kit/core";

import { useChordManagement } from "@/hooks/useChordManagement";
import { useExamplePrompts } from "@/hooks/useExamplePrompts";

import ThinkingMessages from "@/components/ThinkingMessages";
import Header from "@/components/Header";
import PianoKeyboard from "@/components/PianoKeyboard";
import ChordRow from "@/components/ChordRow";
import ChordGenerator from "@/components/ChordGenerator";
import { usePiano } from "@/components/PianoProvider";
import MobileChordGrid from "@/components/MobileChordRow";
import ChordRowSkeleton from "@/components/ChordRowSkeleton";
import MobileHeader from "@/components/MobileHeader";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useMediaQuery } from "react-responsive";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Sparkles } from "lucide-react";

const MidiDownloader = dynamic(() => import('@/components/MidiDownloader'), {
    loading: () => <Button size="lg" disabled>Loading Downloader...</Button>,
    ssr: false
});

const DynamicMarkdownDisplay = dynamic(() => import('@/components/MarkdownDisplay'), {
    loading: () => (
        <div className="flex items-center justify-center h-full">
            <Sparkles className="h-6 w-6 animate-pulse text-primary" />
            <p className="ml-2 text-sm text-muted-foreground">Loading content...</p>
        </div>
    ),
    ssr: false
});


export default function ClientHome() {
    const {
        prompt, setPrompt,
        chords, setChords,
        fullLoading,
        loadingChordId,
        generateChords,
        addChordAt,
        handleDragEnd: originalHandleDragEnd,
        generateChordsFromExample,
    } = useChordManagement();

    const { randomExamples } = useExamplePrompts();
    const { piano, loadSamples, areSamplesLoaded, isLoadingSamples } = usePiano();

    const [activeNotes, setActiveNotes] = useState<string[]>([]);
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const sensors = useSensors(useSensor(PointerSensor));
    const [numChordsToGenerate, setNumChordsToGenerateState] = useState<number>(4);

    const [isExplanationPopoverOpen, setIsExplanationPopoverOpen] = useState(false);
    const [currentExplanationText, setCurrentExplanationText] = useState("");
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [explanationCache, setExplanationCache] = useState<Map<string, string>>(new Map());
    const explanationAbortControllerRef = useRef<AbortController | null>(null);
    const currentProgressionKeyRef = useRef<string>("");

    const [isPlayingProgression, setIsPlayingProgression] = useState(false);
    const [playingChordId, setPlayingChordId] = useState<string | null>(null);
    const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const heldNotesRef = useRef<string[]>([]);
    const CHORD_PLAYBACK_INTERVAL = 1200;

    const checkPosthogConfigured = () => {
        return typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST;
    }

    useEffect(() => {
        if (areSamplesLoaded && checkPosthogConfigured()) {
            posthog.capture('piano_samples_loaded');
        }
    }, [areSamplesLoaded]);

    useEffect(() => {
        if (isMobile) {
            const resumeAudio = async () => {
                try { await toneStart(); } catch (err) { console.error("Error resuming audio", err); }
            };
            window.addEventListener("touchstart", resumeAudio, { once: true });
            return () => window.removeEventListener("touchstart", resumeAudio);
        }
    }, [isMobile]);

    const getVoicedChordNotes = (chordSymbol: string): string[] => {
        const chordData = Chord.get(chordSymbol);
        if (!chordData || !chordData.notes || chordData.notes.length === 0 || !chordData.tonic) {
            return [];
        }
        const rootPc = chordData.tonic; const notesPc = chordData.notes;
        let startOctave = 3; const bassOctave = startOctave - 1; const bassNote = rootPc + bassOctave.toString();
        const voicedNotes: string[] = []; let previousNoteMidi: number | null = null; let currentProcessingOctave = startOctave;
        for (const pc of notesPc) {
            let noteWithOctave = pc + currentProcessingOctave; let currentNoteMidi = Note.midi(noteWithOctave);
            if (currentNoteMidi === null) { voicedNotes.push(pc + "4"); previousNoteMidi = Note.midi(pc + "4"); continue; }
            if (previousNoteMidi !== null) {
                while (currentNoteMidi! <= previousNoteMidi!) {
                    currentProcessingOctave++; noteWithOctave = pc + currentProcessingOctave; currentNoteMidi = Note.midi(noteWithOctave);
                    if (currentNoteMidi === null) { noteWithOctave = pc + (currentProcessingOctave - 1); break; }
                }
            }
            voicedNotes.push(noteWithOctave); previousNoteMidi = currentNoteMidi; currentProcessingOctave = startOctave;
        }
        return [bassNote, ...voicedNotes];
    };

    const playChordOnce = useCallback(async (chordSymbol: string) => {
        if (!piano || !areSamplesLoaded) return;
        if (checkPosthogConfigured()) posthog.capture('chord_played', { chord_symbol: chordSymbol, source: 'chord_card' });

        const notesToPlay = getVoicedChordNotes(chordSymbol);
        if (notesToPlay.length === 0) {
            setActiveNotes([]);
            return;
        }

        const noteDuration = 0.8;
        setActiveNotes(notesToPlay);
        piano.triggerAttackRelease(notesToPlay, noteDuration, toneNow());
        setTimeout(() => setActiveNotes([]), noteDuration * 1000);
    }, [piano, areSamplesLoaded]);

    const pauseProgression = useCallback(() => {
        if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
        playbackTimeoutRef.current = null;

        if (piano && heldNotesRef.current.length > 0) {
            piano.triggerRelease(heldNotesRef.current, toneNow());
            heldNotesRef.current = [];
        }

        setIsPlayingProgression(false);
        setPlayingChordId(null);
        setActiveNotes([]);
    }, [piano]);

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
                setActiveNotes(newNotes);
            }

            playbackTimeoutRef.current = setTimeout(() => {
                playNextChord(index + 1);
            }, CHORD_PLAYBACK_INTERVAL);
        } else {
            pauseProgression();
        }
    }, [chords, piano, areSamplesLoaded, pauseProgression, CHORD_PLAYBACK_INTERVAL]);

    const handleTogglePlayPause = useCallback(() => {
        if (isPlayingProgression) {
            pauseProgression();
            if (checkPosthogConfigured()) posthog.capture('progression_playback_paused', { progression: chords.map(c => c.chord).join('-') });
        } else {
            if (chords.length === 0) return;
            if (!areSamplesLoaded) {
                if (!isLoadingSamples) loadSamples();
                return;
            }
            setIsPlayingProgression(true);
            playNextChord(0);
            if (checkPosthogConfigured()) posthog.capture('progression_playback_started', { progression: chords.map(c => c.chord).join('-'), chord_count: chords.length });
        }
    }, [isPlayingProgression, pauseProgression, playNextChord, chords, areSamplesLoaded, isLoadingSamples, loadSamples]);

    useEffect(() => {
        pauseProgression();
    }, [chords, pauseProgression]);

    const handleNumChordsChangeAndTrack = useCallback((value: number) => {
        setNumChordsToGenerateState(value);
        if (checkPosthogConfigured()) { posthog.capture('num_chords_setting_changed', { num_chords_selected: value }); }
    }, [setNumChordsToGenerateState]);

    const handleGenerateChordsRequestAndTrack = useCallback(() => {
        if (!areSamplesLoaded && !isLoadingSamples) { loadSamples(); }
        generateChords({ numChords: numChordsToGenerate });
        if (checkPosthogConfigured()) { posthog.capture('chords_generated', { prompt_text: prompt, prompt_length: prompt.length, num_chords_requested: numChordsToGenerate }); }
    }, [generateChords, numChordsToGenerate, loadSamples, areSamplesLoaded, isLoadingSamples, prompt]);

    const handleExampleClickAndTrack = useCallback((example: string) => {
        if (!areSamplesLoaded && !isLoadingSamples) { loadSamples(); }
        setPrompt(example);
        generateChordsFromExample(example, numChordsToGenerate);
        if (checkPosthogConfigured()) { posthog.capture('example_prompt_clicked', { example_prompt_text: example, num_chords_requested: numChordsToGenerate }); }
    }, [generateChordsFromExample, numChordsToGenerate, loadSamples, areSamplesLoaded, isLoadingSamples, setPrompt]);

    const handleInputKeyDownAndTrack = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") { e.preventDefault(); handleGenerateChordsRequestAndTrack(); }
    }, [handleGenerateChordsRequestAndTrack]);

    const handleAddChordRequestAndTrack = useCallback((position: number) => {
        addChordAt(position);
        if (checkPosthogConfigured()) { posthog.capture('manual_chord_add_initiated', { insert_position: position, current_chord_count: chords.length }); }
    }, [addChordAt, chords.length]);

    const handleDragEndAndTrack = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const oldIndex = chords.findIndex(c => String(c.id) === String(active.id));
            const newIndex = chords.findIndex(c => String(c.id) === String(over.id));
            if (oldIndex !== -1 && newIndex !== -1 && checkPosthogConfigured()) { posthog.capture('chord_rearranged', { moved_chord_symbol: chords[oldIndex]?.chord || 'unknown', original_index: oldIndex, new_index: newIndex, total_chords_in_progression: chords.length }); }
        }
        originalHandleDragEnd(event);
    }, [originalHandleDragEnd, chords]);

    const handleRemoveChordAndTrack = useCallback((chordIdToRemove: string, removedChordSymbol: string) => {
        setChords(prevChords => prevChords.filter(c => c.id !== chordIdToRemove));
        if (checkPosthogConfigured()) { posthog.capture('chord_removed', { removed_chord_symbol: removedChordSymbol, remaining_chords_count: chords.length > 0 ? chords.length - 1 : 0 }); }
    }, [chords, setChords]);

    const fetchAndStreamExplanationAndTrack = async (progressionKey: string) => {
        if (explanationAbortControllerRef.current) { explanationAbortControllerRef.current.abort(); }
        explanationAbortControllerRef.current = new AbortController();
        setIsExplanationLoading(true);
        let accumulatedText = "";
        setCurrentExplanationText("");

        try {
            const response = await fetch('/api/explain-progression', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chords: chords.map(c => c.chord), prompt: prompt }),
                signal: explanationAbortControllerRef.current.signal,
            });
            if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.error || `HTTP error! status: ${response.status}`); }
            if (!response.body) throw new Error("Response body is null");
            const reader = response.body.getReader(); const decoder = new TextDecoder();
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
            if (currentProgressionKeyRef.current === progressionKey && !explanationAbortControllerRef.current?.signal.aborted) {
                setExplanationCache(prevCache => new Map(prevCache).set(progressionKey, accumulatedText));
                if (checkPosthogConfigured()) { posthog.capture('explanation_generated_successfully', { progression_key: progressionKey, prompt_used_for_explanation: prompt, explanation_length: accumulatedText.length }); }
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                if (isExplanationPopoverOpen && currentProgressionKeyRef.current === progressionKey && !accumulatedText) { setCurrentExplanationText("Explanation loading was cancelled."); }
                if (checkPosthogConfigured()) { posthog.capture('explanation_generation_aborted', { progression_key: progressionKey }); }
            } else {
                if (currentProgressionKeyRef.current === progressionKey) { setCurrentExplanationText(`Error fetching explanation: ${err.message}`); }
                if (checkPosthogConfigured()) { posthog.capture('explanation_generation_failed', { progression_key: progressionKey, error_message: err.message }); }
            }
        } finally {
            if (currentProgressionKeyRef.current === progressionKey) setIsExplanationLoading(false);
            if (explanationAbortControllerRef.current?.signal.aborted && currentProgressionKeyRef.current === progressionKey) { setIsExplanationLoading(false); }
            explanationAbortControllerRef.current = null;
        }
    };

    const handleExplainButtonClickAndTrack = () => {
        if (chords.length === 0) return;
        const progressionKey = chords.map(c => c.chord).join('-');
        if (isExplanationPopoverOpen && currentProgressionKeyRef.current === progressionKey && !isExplanationLoading) {
            setIsExplanationPopoverOpen(false);
            return;
        }
        const previousKey = currentProgressionKeyRef.current;
        currentProgressionKeyRef.current = progressionKey;
        setIsExplanationPopoverOpen(true);
        if (checkPosthogConfigured()) { posthog.capture('explain_progression_button_clicked', { progression_key: progressionKey, is_cached_explanation: explanationCache.has(progressionKey), current_prompt: prompt }); }

        if (explanationCache.has(progressionKey)) {
            setCurrentExplanationText(explanationCache.get(progressionKey) || "Could not load cached explanation.");
            setIsExplanationLoading(false);
        } else {
            if (previousKey !== progressionKey || !currentExplanationText) {
                setCurrentExplanationText("");
            }
            fetchAndStreamExplanationAndTrack(progressionKey);
        }
    };

    const onPopoverOpenChangeAndTrack = (open: boolean) => {
        setIsExplanationPopoverOpen(open);
        if (checkPosthogConfigured()) { posthog.capture('explanation_popover_toggled', { opened: open, progression_key: currentProgressionKeyRef.current }); }
        if (!open && explanationAbortControllerRef.current) {
            explanationAbortControllerRef.current.abort();
        }
    };

    const hasChordsProp = chords.length > 0 || fullLoading;
    const firstNote = MidiNumbers.fromNote("C3"); const lastNote = MidiNumbers.fromNote("C5");
    const buttonAppearAnimation = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 10 }, transition: { duration: 0.3, ease: "easeInOut" } };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 selection:bg-primary/70 selection:text-primary-foreground">
            <motion.main
                className="flex flex-col items-center w-full px-4"
                initial={false}
                animate={{ paddingTop: hasChordsProp ? (isMobile ? "10vh" : "20vh") : (isMobile ? "12vh" : "35vh") }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
                <ChordGenerator
                    prompt={prompt}
                    setPrompt={setPrompt}
                    handleKeyDown={handleInputKeyDownAndTrack}
                    generateChords={handleGenerateChordsRequestAndTrack}
                    fullLoading={fullLoading}
                    chordsLength={chords.length}
                    randomExamples={randomExamples}
                    handleExampleClick={handleExampleClickAndTrack}
                    numChordsToGenerate={numChordsToGenerate}
                    onNumChordsChange={handleNumChordsChangeAndTrack}
                />

                <div className="w-full flex flex-col items-center mt-4">
                    {(chords.length > 0 || fullLoading) ? (
                        fullLoading ? (
                            isMobile ? ( <MobileChordGrid chords={[]} playChord={() => {}} /> ) : ( <ChordRowSkeleton /> )
                        ) : (
                            isMobile ? (
                                <MobileChordGrid chords={chords} playChord={playChordOnce} />
                            ) : (
                                <ChordRow
                                    chords={chords}
                                    loadingChordId={loadingChordId}
                                    sensors={sensors}
                                    handleDragEnd={handleDragEndAndTrack}
                                    addChordAt={handleAddChordRequestAndTrack}
                                    playChord={playChordOnce}
                                    onRemoveChord={handleRemoveChordAndTrack}
                                    playingChordId={playingChordId}
                                    isPlaying={isPlayingProgression}
                                    onTogglePlayPause={handleTogglePlayPause}
                                />
                            )
                        )
                    ) : null}

                    <div className="h-8 flex items-center justify-center">
                        {fullLoading && !isMobile && <ThinkingMessages />}
                    </div>
                </div>

                <AnimatePresence>
                    {chords.length > 0 && !fullLoading && (
                        <motion.div key="buttonsRow" className="mt-6 w-full flex flex-row justify-center items-center space-x-4" {...buttonAppearAnimation}>
                            <div>
                                <Popover open={isExplanationPopoverOpen} onOpenChange={onPopoverOpenChangeAndTrack}>
                                    <PopoverTrigger asChild>
                                        <Button type="button" onClick={handleExplainButtonClickAndTrack} variant="outline" size="lg" disabled={isExplanationLoading && currentProgressionKeyRef.current === chords.map(c => c.chord).join('-')} className="w-full max-w-xs sm:w-auto transition transform">
                                            {(isExplanationLoading && currentProgressionKeyRef.current === chords.map(c => c.chord).join('-')) ? <Sparkles className="mr-2 h-5 w-5 animate-pulse" /> : <Sparkles className="mr-2 h-5 w-5" />}
                                            {(isExplanationLoading && currentProgressionKeyRef.current === chords.map(c => c.chord).join('-')) ? "Getting Explanation..." : "Explain Progression"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] sm:w-[380px] p-4 flex flex-col" sideOffset={5} align="center">
                                        <h4 className="font-medium leading-none text-sm mb-2 flex-shrink-0">Explanation</h4>
                                        <div className="min-h-[50px] w-full">
                                            {isExplanationLoading && currentProgressionKeyRef.current === chords.map(c => c.chord).join('-') && !currentExplanationText && (<div className="flex items-center justify-center h-full"><Sparkles className="h-6 w-6 animate-pulse text-primary" /><p className="ml-2 text-sm text-muted-foreground"></p></div>)}
                                            {currentExplanationText && (<DynamicMarkdownDisplay markdownText={currentExplanationText} />)}
                                            {!isExplanationLoading && !currentExplanationText && !explanationCache.has(currentProgressionKeyRef.current) && (<p className="text-sm text-muted-foreground">Click "Explain Progression" to get an analysis.</p>)}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            {!isMobile && (
                                <div>
                                    <MidiDownloader
                                        chords={chords.map((c) => c.chord)}
                                        prompt={prompt}
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.main>
            <PianoKeyboard firstNote={firstNote} lastNote={lastNote} activeNotes={activeNotes} />
            <footer className="text-center text-xs text-gray-500 dark:text-gray-400 py-4 mt-8 h-10"></footer>
        </div>
    );
}