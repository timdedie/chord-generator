import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable"; // Corrected import for arrayMove
import { useState, useCallback, useEffect } from "react";
import { Chord } from "tonal";
// import { ChordItem } from "@/components/SortableChord"; // Assuming this type definition exists

// Temporary ChordItem definition if not available elsewhere yet for the sake of the hook
export interface ChordItem {
    id: string;
    chord: string;
    locked: boolean;
}


const generateUniqueId = () => `${Date.now()}-${Math.random()}`;

// Interface for props if you want to pass initial values
interface UseChordManagementProps {
    initialPrompt?: string;
    initialChords?: ChordItem[];
    examplePrompts?: string[]; // If examples are managed here
}

export function useChordManagement(props?: UseChordManagementProps) {
    const [prompt, setPrompt] = useState<string>(props?.initialPrompt || "");
    const [chords, setChords] = useState<ChordItem[]>(props?.initialChords || []);
    const [fullLoading, setFullLoading] = useState<boolean>(false);
    const [loadingChordId, setLoadingChordId] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    // If managing examples here:
    // const [examples, setExamples] = useState<string[]>(props?.examplePrompts || []);
    // const [randomExamples, setRandomExamples] = useState<string[]>([]);


    // --- Effects ---
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Example: if managing example prompts here
    // useEffect(() => {
    //   if (examples.length > 0) {
    //     const shuffled = [...examples].sort(() => 0.5 - Math.random());
    //     setRandomExamples(shuffled.slice(0, 5));
    //   }
    // }, [examples]);


    // --- Callbacks ---
    const toggleLock = useCallback((id: string) => {
        setChords((prev) =>
            prev.map((ch) => (ch.id === id ? { ...ch, locked: !ch.locked } : ch))
        );
    }, []);

    const generateChordsInternal = useCallback(
        async (currentPrompt: string, currentChords: ChordItem[], attempt: number = 0): Promise<ChordItem[] | null> => {
            const MAX_ATTEMPTS = 3;
            if (!currentPrompt.trim()) {
                setError("Please describe your chord progression before generating.");
                return null; // Indicate failure or no chords
            }
            setError("");
            setFullLoading(true);
            let generatedChordsResult = null;

            try {
                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: currentPrompt, existingChords: currentChords }),
                });
                const data = await res.json();
                if (data.error) {
                    setError(data.error);
                    setFullLoading(false);
                    return null;
                }

                const cleaned = data.chords
                    .replace(/^chords:\s*['"]?/, "").replace(/['"]?$/, "")
                    .trim().replace(/△/g, "").split(/[-‐‑–—]/)
                    .map((c: string) => c.trim()).filter((c: string) => c);

                let valid = true;
                const newChords: (ChordItem | null)[] = cleaned.map((c: string) => {
                    const chordData = Chord.get(c);
                    if (!chordData || !chordData.notes || chordData.notes.length === 0) {
                        valid = false; return null;
                    }
                    return { id: generateUniqueId(), chord: c, locked: false };
                });

                if (!valid) {
                    if (attempt < MAX_ATTEMPTS) {
                        console.warn("Invalid chord detected, reattempting generation", attempt + 1);
                        return generateChordsInternal(currentPrompt, currentChords, attempt + 1);
                    } else {
                        setError("Could not generate valid chords after several attempts.");
                        setFullLoading(false); return null;
                    }
                }

                const validNewChords = newChords.filter(Boolean) as ChordItem[];

                if (currentChords.some(c => c.locked)) {
                    generatedChordsResult = validNewChords.map((newChord, idx) => {
                        const oldChord = currentChords[idx];
                        return oldChord && oldChord.locked ? oldChord : newChord;
                    });
                } else {
                    generatedChordsResult = validNewChords;
                }

            } catch (e) {
                console.error("Generation error:", e);
                setError("Error generating chords. Please try again.");
            }
            setFullLoading(false);
            return generatedChordsResult;
        },
        [] // Dependencies for fetch, etc.
    );

    const generateChords = useCallback(async (customPrompt?: string) => {
        const usedPrompt = customPrompt ?? prompt;
        const result = await generateChordsInternal(usedPrompt, chords);
        if (result) {
            setChords(result);
        }
    }, [prompt, chords, generateChordsInternal]);


    const addChordAt = useCallback(
        async (position: number) => {
            if (chords.length >= 8) return;
            const newChordId = generateUniqueId();
            const placeholderChord: ChordItem = { id: newChordId, chord: "", locked: false };

            const originalChords = [...chords];
            const updatedChordsWithPlaceholder = [
                ...originalChords.slice(0, position),
                placeholderChord,
                ...originalChords.slice(position),
            ];
            setChords(updatedChordsWithPlaceholder);
            setLoadingChordId(newChordId);

            try {
                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        existingChords: originalChords,
                        addChordPosition: position,
                        prompt: prompt || "add chord",
                    }),
                });
                const data = await res.json();
                if (data.error) {
                    setError(data.error);
                    setChords(originalChords);
                    setLoadingChordId(null);
                    return;
                }
                const updatedChord: ChordItem = {
                    id: newChordId,
                    chord: data.chord.trim(),
                    locked: false,
                };
                setChords((prev) =>
                    prev.map((ch) => (ch.id === newChordId ? updatedChord : ch))
                );
            } catch (e) {
                console.error("Error adding chord:", e);
                setError("Error adding chord. Please try again.");
                setChords(originalChords);
            }
            setLoadingChordId(null);
        },
        [chords, prompt]
    );

    const handleDragEnd = useCallback(
        ({ active, over }: DragEndEvent) => {
            if (!over || active.id === over.id) return;
            setChords((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        },
        []
    );

    const generateChordsFromExample = useCallback((examplePrompt: string) => {
        setPrompt(examplePrompt);
        generateChords(examplePrompt);
    }, [generateChords, setPrompt]);


    return {
        prompt, setPrompt,
        chords, setChords,
        fullLoading,
        loadingChordId,
        error,
        toggleLock,
        generateChords,
        addChordAt,
        handleDragEnd,
        generateChordsFromExample,
    };
}