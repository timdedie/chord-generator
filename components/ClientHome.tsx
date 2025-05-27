"use client";

import React, { useEffect, useState, useCallback, KeyboardEvent, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import * as Tone from "tone";
import { Chord, Note } from "tonal"; // Ensure Note is imported here
import ReactMarkdown from 'react-markdown';

import { useChordManagement } from "@/hooks/useChordManagement";
import { useExamplePrompts } from "@/hooks/useExamplePrompts";

import ThinkingMessages from "@/components/ThinkingMessages";
import Header from "@/components/Header";
import PianoKeyboard from "@/components/PianoKeyboard";
import ChordRow from "@/components/ChordRow";
import ChordGenerator from "@/components/ChordGenerator";
import MidiDownloader from "@/components/MidiDownloader";
import PianoProvider, { PianoContext } from "@/components/PianoProvider";
import MobileChordGrid from "@/components/MobileChordRow";
import MobileHeader from "@/components/MobileHeader";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useMediaQuery } from "react-responsive";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Sparkles, BookOpenText } from "lucide-react";

export default function ClientHome() {
    const {
        prompt, setPrompt, // prompt is already available here
        chords, setChords,
        fullLoading,
        loadingChordId,
        generateChords,
        addChordAt,
        handleDragEnd,
        generateChordsFromExample,
    } = useChordManagement();

    const { randomExamples } = useExamplePrompts();

    const [activeNotes, setActiveNotes] = useState<string[]>([]);
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const sensors = useSensors(useSensor(PointerSensor));
    const piano = useContext(PianoContext);
    const [numChordsToGenerate, setNumChordsToGenerate] = useState<number>(4);
    const [useHighCreativity, setUseHighCreativity] = useState<boolean>(false);

    const [isExplanationPopoverOpen, setIsExplanationPopoverOpen] = useState(false);
    const [currentExplanationText, setCurrentExplanationText] = useState("");
    const [isExplanationLoading, setIsExplanationLoading] = useState(false);
    const [explanationCache, setExplanationCache] = useState<Map<string, string>>(new Map());
    const explanationAbortControllerRef = useRef<AbortController | null>(null);
    const currentProgressionKeyRef = useRef<string>("");

    useEffect(() => {
        if (isMobile) {
            const resumeAudio = async () => {
                try { await Tone.start(); } catch (err) { console.error("Error resuming audio", err); }
            };
            window.addEventListener("touchstart", resumeAudio, { once: true });
            return () => window.removeEventListener("touchstart", resumeAudio);
        }
    }, [isMobile]);

    const playChord = useCallback(
        async (chordSymbol: string) => {
            if (!chordSymbol) return;
            await Tone.start();
            const chordData = Chord.get(chordSymbol);

            if (!chordData || !chordData.notes || chordData.notes.length === 0 || !chordData.tonic) {
                setActiveNotes([]);
                return;
            }

            const rootPc = chordData.tonic; // Get the root pitch class (e.g., "C")
            const notesPc = chordData.notes; // Pitch classes for the main chord body (e.g., ["C", "E", "G"])

            let startOctave = 3; // Main chord voicing starts at octave 3
            const bassOctave = startOctave - 1; // Bass note will be in octave 2
            const bassNote = rootPc + bassOctave.toString(); // Construct the bass note string (e.g., "C2")

            const voicedNotes: string[] = []; // To store notes of the main chord body
            let previousNoteMidi: number | null = null;
            let currentProcessingOctave = startOctave;

            for (const pc of notesPc) {
                let noteWithOctave = pc + currentProcessingOctave;
                let currentNoteMidi = Note.midi(noteWithOctave);

                if (currentNoteMidi === null) {
                    console.warn(`Could not get MIDI for note: ${pc}. Using default octave 4.`);
                    voicedNotes.push(pc + "4");
                    previousNoteMidi = Note.midi(pc + "4");
                    continue;
                }

                if (previousNoteMidi !== null) {
                    // Ensure notes are ascending to avoid overly muddy voicings
                    while (currentNoteMidi! <= previousNoteMidi!) {
                        currentProcessingOctave++;
                        noteWithOctave = pc + currentProcessingOctave;
                        currentNoteMidi = Note.midi(noteWithOctave);
                        if (currentNoteMidi === null) {
                            console.warn(`Error finding ascending MIDI for ${pc}. Using fallback.`);
                            noteWithOctave = pc + (currentProcessingOctave - 1); // Fallback to previous octave attempt
                            break;
                        }
                    }
                }

                voicedNotes.push(noteWithOctave);
                previousNoteMidi = currentNoteMidi;
                currentProcessingOctave = startOctave; // Reset for the next note in notesPc for compact voicing
            }

            // Combine the bass note with the main chord notes
            const allNotesToPlay = [bassNote, ...voicedNotes];

            setActiveNotes(allNotesToPlay);
            piano?.triggerAttackRelease(allNotesToPlay, "2n");
            setTimeout(() => setActiveNotes([]), 500);
        }, [piano]
    );

    const handleGenerateChordsRequest = useCallback(() => {
        generateChords({ numChords: numChordsToGenerate, useHighCreativity });
    }, [generateChords, numChordsToGenerate, useHighCreativity]);

    const handleExampleClickRequest = useCallback((example: string) => {
        generateChordsFromExample(example, numChordsToGenerate, useHighCreativity);
    }, [generateChordsFromExample, numChordsToGenerate, useHighCreativity]);

    const handleInputKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.preventDefault();
                generateChords({ numChords: numChordsToGenerate, useHighCreativity });
            }
        }, [generateChords, numChordsToGenerate, useHighCreativity]
    );

    const handleAddChordRequest = useCallback((position: number) => {
        addChordAt(position, { useHighCreativity });
    }, [addChordAt, useHighCreativity]);


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
                body: JSON.stringify({ chords: chords.map(c => c.chord), prompt: prompt }), // Added prompt here
                signal: explanationAbortControllerRef.current.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
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
            if (currentProgressionKeyRef.current === progressionKey && !explanationAbortControllerRef.current?.signal.aborted) {
                setExplanationCache(prevCache => new Map(prevCache).set(progressionKey, accumulatedText));
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log(`Explanation fetch for ${progressionKey} aborted`);
                if (isExplanationPopoverOpen && currentProgressionKeyRef.current === progressionKey && !accumulatedText) {
                    setCurrentExplanationText("Explanation loading was cancelled.");
                }
            } else {
                console.error("Error fetching explanation:", err);
                if (currentProgressionKeyRef.current === progressionKey) {
                    setCurrentExplanationText(`Error fetching explanation: ${err.message}`);
                }
            }
        } finally {
            if (currentProgressionKeyRef.current === progressionKey) {
                setIsExplanationLoading(false);
            }
            if (explanationAbortControllerRef.current && explanationAbortControllerRef.current.signal.aborted) {
                if (currentProgressionKeyRef.current === progressionKey) setIsExplanationLoading(false);
            }
            explanationAbortControllerRef.current = null;
        }
    };

    const handleExplainButtonClick = () => {
        if (chords.length === 0) return;
        const progressionKey = chords.map(c => c.chord).join('-');

        if (isExplanationPopoverOpen && currentProgressionKeyRef.current === progressionKey && !isExplanationLoading) {
            setIsExplanationPopoverOpen(false);
            return;
        }

        const previousKey = currentProgressionKeyRef.current;
        currentProgressionKeyRef.current = progressionKey;
        setIsExplanationPopoverOpen(true);

        if (explanationCache.has(progressionKey)) {
            setCurrentExplanationText(explanationCache.get(progressionKey) || "Could not load cached explanation.");
            setIsExplanationLoading(false);
        } else {
            if (previousKey !== progressionKey) {
                setCurrentExplanationText("");
            }
            fetchAndStreamExplanation(progressionKey);
        }
    };

    const onPopoverOpenChange = (open: boolean) => {
        setIsExplanationPopoverOpen(open);
        if (!open && explanationAbortControllerRef.current) {
            explanationAbortControllerRef.current.abort();
        }
    };

    const hasChordsProp = chords.length > 0 || fullLoading;
    const firstNote = MidiNumbers.fromNote("C3");
    const lastNote = MidiNumbers.fromNote("C5");

    const buttonAppearAnimation = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
        transition: { duration: 0.3, ease: "easeInOut" }
    };

    return (
        <PianoProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 selection:bg-primary/70 selection:text-primary-foreground">
                {isMobile ? <MobileHeader /> : <Header />}

                <motion.main
                    className="flex flex-col items-center w-full px-4"
                    initial={false}
                    animate={{ paddingTop: hasChordsProp ? (isMobile ? "10vh" : "20vh") : (isMobile ? "12vh" : "35vh") }}
                    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                    <ChordGenerator
                        prompt={prompt}
                        setPrompt={setPrompt}
                        handleKeyDown={handleInputKeyDown}
                        generateChords={handleGenerateChordsRequest}
                        fullLoading={fullLoading}
                        chordsLength={chords.length}
                        randomExamples={randomExamples}
                        handleExampleClick={handleExampleClickRequest}
                        numChordsToGenerate={numChordsToGenerate}
                        onNumChordsChange={setNumChordsToGenerate}
                        useHighCreativity={useHighCreativity}
                        onHighCreativityChange={setUseHighCreativity}
                    />

                    {(chords.length > 0 || fullLoading) && (
                        <div className="w-full max-w-fit mt-4">
                            {isMobile ? (
                                <MobileChordGrid
                                    chords={chords}
                                    playChord={playChord}
                                />
                            ) : (
                                <ChordRow
                                    chords={chords}
                                    fullLoading={fullLoading}
                                    loadingChordId={loadingChordId}
                                    sensors={sensors}
                                    handleDragEnd={handleDragEnd}
                                    addChordAt={handleAddChordRequest}
                                    playChord={playChord}
                                    setChords={setChords}
                                    numChordsToGenerate={numChordsToGenerate}
                                />
                            )}
                            <div className="h-8 flex items-center justify-center mt-2">
                                {fullLoading && <ThinkingMessages />}
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {chords.length > 0 && !fullLoading && (
                            <motion.div
                                key="buttonsRow"
                                className="mt-6 w-full flex flex-row justify-center items-center space-x-4"
                                initial={buttonAppearAnimation.initial}
                                animate={buttonAppearAnimation.animate}
                                exit={buttonAppearAnimation.exit}
                                transition={buttonAppearAnimation.transition}
                            >
                                <div>
                                    <Popover open={isExplanationPopoverOpen} onOpenChange={onPopoverOpenChange}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                onClick={handleExplainButtonClick}
                                                variant="outline"
                                                size="lg"
                                                disabled={isExplanationLoading && currentProgressionKeyRef.current === chords.map(c=>c.chord).join('-')}
                                                className="w-full max-w-xs sm:w-auto transition transform"
                                            >
                                                {(isExplanationLoading && currentProgressionKeyRef.current === chords.map(c=>c.chord).join('-')) ? <Sparkles className="mr-2 h-5 w-5 animate-pulse" /> : <BookOpenText className="mr-2 h-5 w-5" />}
                                                {(isExplanationLoading && currentProgressionKeyRef.current === chords.map(c=>c.chord).join('-')) ? "Getting Explanation..." : "Explain Progression"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-[300px] sm:w-[380px] p-4 flex flex-col"
                                            sideOffset={5}
                                            align="center"
                                        >
                                            <h4 className="font-medium leading-none text-sm mb-2 flex-shrink-0">Explanation</h4>
                                            <div className="min-h-[50px] w-full">
                                                {(isExplanationLoading && currentProgressionKeyRef.current === chords.map(c=>c.chord).join('-') && !currentExplanationText) && (
                                                    <div className="flex items-center justify-center h-full">
                                                        <Sparkles className="h-6 w-6 animate-pulse text-primary" />
                                                        <p className="ml-2 text-sm text-muted-foreground">Generating...</p>
                                                    </div>
                                                )}
                                                {currentExplanationText && (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                        <ReactMarkdown>
                                                            {currentExplanationText}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {!isMobile && (
                                    <div>
                                        <MidiDownloader chords={chords.map((c) => c.chord)} prompt={prompt} />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.main>

                <PianoKeyboard firstNote={firstNote} lastNote={lastNote} activeNotes={activeNotes} />

                <footer className="text-center text-xs text-gray-500 dark:text-gray-400 py-4 mt-8 h-10">
                </footer>
            </div>
        </PianoProvider>
    );
}