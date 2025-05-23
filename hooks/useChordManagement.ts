import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState, useCallback } from "react"; // Removed useEffect as it's not used
import { Chord } from "tonal";
import { toast } from "sonner"; // Import toast from sonner

export interface ChordItem {
    id: string;
    chord: string;
    locked: boolean;
}

const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

interface UseChordManagementProps {
    initialPrompt?: string;
    initialChords?: ChordItem[];
}

export function useChordManagement(props?: UseChordManagementProps) {
    // toast function from sonner is directly available
    const [prompt, setPrompt] = useState<string>(props?.initialPrompt || "");
    const [chords, setChords] = useState<ChordItem[]>(props?.initialChords || []);
    const [fullLoading, setFullLoading] = useState<boolean>(false);
    const [loadingChordId, setLoadingChordId] = useState<string | null>(null);

    const showErrorToast = useCallback((title: string, description?: string) => {
        // sonner's API for error toasts is typically toast.error(title, { description: ... })
        toast.error(title, {
            description: description,
            // duration: 5000, // Optional: sonner has its own defaults
            // action: { label: "Dismiss", onClick: () => {} }, // Optional
        });
    }, []);

    const toggleLock = useCallback((id: string) => {
        setChords((prev) =>
            prev.map((ch) => (ch.id === id ? { ...ch, locked: !ch.locked } : ch))
        );
    }, []);

    const generateChordsInternal = useCallback(
        async (currentPromptInternal: string, currentChords: ChordItem[], attempt: number = 0): Promise<ChordItem[] | null> => {
            const MAX_ATTEMPTS = 3;
            if (!currentPromptInternal.trim()) {
                showErrorToast("Input Error", "Please describe your chord progression before generating.");
                setFullLoading(false);
                return null;
            }
            setFullLoading(true);
            let generatedChordsResult = null;

            try {
                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: currentPromptInternal, existingChords: currentChords }),
                });
                const data = await res.json();
                if (!res.ok || data.error) {
                    const errorMsg = data.error || "Failed to generate chords from server.";
                    showErrorToast("Generation Failed", errorMsg);
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
                    if (attempt < MAX_ATTEMPTS - 1) {
                        console.warn("Invalid chord detected, reattempting generation", attempt + 1);
                        return generateChordsInternal(currentPromptInternal, currentChords, attempt + 1);
                    } else {
                        showErrorToast("Generation Error", "Could not generate valid chords after several attempts.");
                        setFullLoading(false); return null;
                    }
                }

                const validNewChords = newChords.filter(Boolean) as ChordItem[];

                if (currentChords.some(c => c.locked)) {
                    const finalResult: ChordItem[] = [];
                    let newChordIdx = 0;
                    // Iterate based on the length of the original chords array to preserve positions
                    for(let i=0; i < currentChords.length; i++) {
                        if(currentChords[i].locked) {
                            finalResult[i] = currentChords[i];
                        } else if (newChordIdx < validNewChords.length) {
                            // Fill unlocked slot with a new chord
                            finalResult[i] = validNewChords[newChordIdx++];
                        } else {
                            // If no new chords left for this unlocked slot (new progression is shorter)
                            // This slot will be empty and filtered out later, effectively removing the old unlocked chord
                        }
                    }
                    // Add any remaining new chords if the new progression was longer than original
                    if (newChordIdx < validNewChords.length) {
                        finalResult.push(...validNewChords.slice(newChordIdx));
                    }
                    generatedChordsResult = finalResult.filter(Boolean); // Remove any empty slots
                } else {
                    generatedChordsResult = validNewChords;
                }

            } catch (e: any) {
                console.error("Generation error:", e);
                showErrorToast("Network Error", e.message || "Error generating chords. Please try again.");
            }
            setFullLoading(false);
            return generatedChordsResult;
        },
        [showErrorToast]
    );

    const generateChords = useCallback(async (customPromptArg?: string | unknown) => {
        let usedPrompt: string;
        if (typeof customPromptArg === 'string') {
            usedPrompt = customPromptArg;
        } else {
            usedPrompt = prompt;
        }
        const result = await generateChordsInternal(usedPrompt, chords);
        if (result) {
            setChords(result);
        }
    }, [prompt, chords, generateChordsInternal]);


    const addChordAt = useCallback(
        async (position: number) => {
            if (chords.length >= 8) {
                showErrorToast("Limit Reached", "Maximum of 8 chords allowed.");
                return;
            }
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
                        prompt: prompt || "add one suitable chord here",
                    }),
                });
                const data = await res.json();

                if (!res.ok || data.error) {
                    const errorMsg = data.error || "Failed to add chord from server.";
                    showErrorToast("Add Chord Failed", errorMsg);
                    setChords(originalChords);
                    setLoadingChordId(null);
                    return;
                }

                const receivedChordSymbol = data.chord?.trim();
                if (!receivedChordSymbol || !Chord.get(receivedChordSymbol).name) {
                    showErrorToast("Invalid Chord", "Received an invalid chord from the server.");
                    setChords(originalChords);
                    setLoadingChordId(null);
                    return;
                }

                const updatedChord: ChordItem = {
                    id: newChordId,
                    chord: receivedChordSymbol,
                    locked: false,
                };
                setChords((prev) =>
                    prev.map((ch) => (ch.id === newChordId ? updatedChord : ch))
                );
            } catch (e: any) {
                console.error("Error adding chord:", e);
                showErrorToast("Network Error", e.message || "Error adding chord. Please try again.");
                setChords(originalChords);
            }
            setLoadingChordId(null);
        },
        [chords, prompt, showErrorToast]
    );

    const handleDragEnd = useCallback(
        ({ active, over }: DragEndEvent) => {
            if (!over || active.id === over.id) return;
            setChords((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                if (oldIndex === -1 || newIndex === -1) return items;
                return arrayMove(items, oldIndex, newIndex);
            });
        },
        []
    );

    const generateChordsFromExample = useCallback((examplePrompt: string) => {
        if (typeof examplePrompt === 'string') {
            setPrompt(examplePrompt);
            generateChords(examplePrompt);
        } else {
            console.error("generateChordsFromExample received a non-string prompt:", examplePrompt);
            showErrorToast("Input Error", "Invalid example prompt type.");
        }
    }, [generateChords, setPrompt, showErrorToast]);

    return {
        prompt, setPrompt,
        chords, setChords,
        fullLoading,
        loadingChordId,
        toggleLock,
        generateChords,
        addChordAt,
        handleDragEnd,
        generateChordsFromExample,
    };
}