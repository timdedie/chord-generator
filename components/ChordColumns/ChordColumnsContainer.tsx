"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ChordItem } from "@/hooks/useChordManagement";
import { Chord } from "tonal";
import { now as toneNow } from "tone";
import { usePiano } from "@/components/PianoProvider";
import { getVoicedChordNotes } from "@/lib/chordUtils";
import { generateChordColors } from "@/lib/chordColors";
import { useTheme } from "next-themes";
import ChordColumn from "./ChordColumn";
import ColumnSpacer from "./ColumnSpacer";
import ColumnToolbar from "./ColumnToolbar";

const generateUniqueId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

interface ChordColumnsContainerProps {
  id: string;
  initialChords: string[];
  style: string;
  prompt: string;
  onActiveNotesChange: (notes: string[]) => void;
  onChordPlay?: (chord: string) => void;
}

export default function ChordColumnsContainer({
  id,
  initialChords,
  style,
  prompt,
  onActiveNotesChange,
  onChordPlay,
}: ChordColumnsContainerProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  const [chords, setChords] = useState<ChordItem[]>(() =>
    initialChords.map((chord, index) => ({
      id: `${id}-chord-${index}-${generateUniqueId()}`,
      chord,
    }))
  );
  const [loadingChordId, setLoadingChordId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingChordId, setPlayingChordId] = useState<string | null>(null);

  // Explanation state
  const [isExplanationPopoverOpen, setIsExplanationPopoverOpen] =
    useState(false);
  const [currentExplanationText, setCurrentExplanationText] = useState("");
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [explanationCache, setExplanationCache] = useState<
    Map<string, string>
  >(new Map());
  const explanationAbortControllerRef = useRef<AbortController | null>(null);
  const currentProgressionKeyRef = useRef<string>("");

  const { piano, areSamplesLoaded, loadSamples, isLoadingSamples } =
    usePiano();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heldNotesRef = useRef<string[]>([]);
  const CHORD_PLAYBACK_INTERVAL = 1200;

  // Generate colors based on current chords
  const colors = generateChordColors(
    chords.map((c) => c.chord),
    isDarkMode
  );

  // --- Playback ---

  const singlePlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playChordOnce = useCallback(
    async (chordSymbol: string, chordId?: string) => {
      if (!areSamplesLoaded) {
        if (!isLoadingSamples) await loadSamples();
        return;
      }
      if (!piano) return;
      onChordPlay?.(chordSymbol);

      const notesToPlay = getVoicedChordNotes(chordSymbol);
      if (notesToPlay.length === 0) {
        onActiveNotesChange([]);
        return;
      }

      const noteDuration = 0.8;
      onActiveNotesChange(notesToPlay);
      piano.triggerAttackRelease(notesToPlay, noteDuration, toneNow());

      if (chordId && !isPlaying) {
        if (singlePlayTimeoutRef.current) clearTimeout(singlePlayTimeoutRef.current);
        setPlayingChordId(chordId);
        singlePlayTimeoutRef.current = setTimeout(() => {
          setPlayingChordId((prev) => (prev === chordId ? null : prev));
        }, noteDuration * 1000);
      }

      setTimeout(() => onActiveNotesChange([]), noteDuration * 1000);
    },
    [piano, areSamplesLoaded, isLoadingSamples, loadSamples, onActiveNotesChange, onChordPlay, isPlaying]
  );

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

  const playNextChord = useCallback(
    (index: number) => {
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
    },
    [chords, piano, pauseProgression, onActiveNotesChange]
  );

  const handleTogglePlayPause = useCallback(async () => {
    if (isPlaying) {
      pauseProgression();
    } else {
      if (chords.length === 0) return;
      if (!areSamplesLoaded) {
        if (!isLoadingSamples) await loadSamples();
        return;
      }
      setIsPlaying(true);
      playNextChord(0);
    }
  }, [
    isPlaying,
    pauseProgression,
    playNextChord,
    chords,
    areSamplesLoaded,
    isLoadingSamples,
    loadSamples,
  ]);

  // Stop playback when chords change
  useEffect(() => {
    pauseProgression();
  }, [chords, pauseProgression]);

  // --- Drag & Drop ---

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setChords((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
  }, []);

  // --- Add / Remove ---

  const handleRemoveChord = useCallback((chordId: string) => {
    setChords((prev) => prev.filter((c) => c.id !== chordId));
  }, []);

  const addChordAt = useCallback(
    async (position: number) => {
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
        const existingChordsForApi = originalChords.map((c) => ({
          chord: c.chord,
        }));

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
          setChords(originalChords);
          setLoadingChordId(null);
          return;
        }

        const cleanedReceivedChordSymbol = data.chord?.trim();
        const chordData = cleanedReceivedChordSymbol
          ? Chord.get(cleanedReceivedChordSymbol)
          : null;

        if (
          !cleanedReceivedChordSymbol ||
          !chordData ||
          !chordData.symbol
        ) {
          setChords(originalChords);
          setLoadingChordId(null);
          return;
        }

        const updatedChordItem: ChordItem = {
          id: newChordId,
          chord: chordData.symbol,
        };
        setChords((prev) =>
          prev.map((ch) => (ch.id === newChordId ? updatedChordItem : ch))
        );
      } catch (e) {
        console.error("Error adding chord:", e);
        setChords(originalChords);
      }
      setLoadingChordId(null);
    },
    [chords, prompt]
  );

  // --- Explanation ---

  const fetchAndStreamExplanation = async (progressionKey: string) => {
    if (explanationAbortControllerRef.current) {
      explanationAbortControllerRef.current.abort();
    }
    explanationAbortControllerRef.current = new AbortController();
    setIsExplanationLoading(true);
    let accumulatedText = "";
    setCurrentExplanationText("");

    try {
      const response = await fetch("/api/explain-progression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chords: chords.map((c) => c.chord),
          prompt,
        }),
        signal: explanationAbortControllerRef.current.signal,
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
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
            setCurrentExplanationText((prev) => prev + chunk);
          }
        }
      }

      if (currentProgressionKeyRef.current === progressionKey) {
        setExplanationCache(
          (prev) => new Map(prev).set(progressionKey, accumulatedText)
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // Aborted
      } else {
        if (currentProgressionKeyRef.current === progressionKey) {
          setCurrentExplanationText("Error fetching explanation.");
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
    const progressionKey = chords.map((c) => c.chord).join("-");

    if (
      isExplanationPopoverOpen &&
      currentProgressionKeyRef.current === progressionKey &&
      !isExplanationLoading
    ) {
      setIsExplanationPopoverOpen(false);
      return;
    }

    currentProgressionKeyRef.current = progressionKey;
    setIsExplanationPopoverOpen(true);

    if (explanationCache.has(progressionKey)) {
      setCurrentExplanationText(
        explanationCache.get(progressionKey) || ""
      );
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

  return (
    <div className="w-full rounded-xl overflow-hidden border border-border/50 bg-card/50">
      <ColumnToolbar
        style={style}
        chords={chords.map((c) => c.chord)}
        prompt={prompt}
        isPlaying={isPlaying}
        onTogglePlayPause={handleTogglePlayPause}
        isExplanationPopoverOpen={isExplanationPopoverOpen}
        onExplainClick={handleExplainClick}
        onPopoverOpenChange={onPopoverOpenChange}
        isExplanationLoading={isExplanationLoading}
        currentExplanationText={currentExplanationText}
      />

      {hasChords && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={chords.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div
              className="flex w-full overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory md:snap-none"
              style={{ height: "50vh", minHeight: 300 }}
            >
              <AnimatePresence mode="popLayout">
                {chords.flatMap((chord, index) => [
                  <ColumnSpacer
                    key={`spacer-${index}`}
                    position={index}
                    chordsCount={chords.length}
                    addChordAt={addChordAt}
                  />,
                  <ChordColumn
                    key={chord.id}
                    id={chord.id}
                    chord={chord.chord}
                    color={
                      colors[index] || {
                        bg: "hsl(220, 60%, 70%)",
                        text: "white",
                        hue: 220,
                        saturation: 60,
                        lightness: 70,
                      }
                    }
                    isPlaying={playingChordId === chord.id}
                    loading={loadingChordId === chord.id}
                    onPlay={() => playChordOnce(chord.chord, chord.id)}
                    onRemove={() => handleRemoveChord(chord.id)}
                  />,
                ])}
                <ColumnSpacer
                  key="spacer-trailing"
                  position={chords.length}
                  chordsCount={chords.length}
                  addChordAt={addChordAt}
                />
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
