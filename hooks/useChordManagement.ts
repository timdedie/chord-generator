import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState, useCallback } from "react";
import { Chord } from "tonal";
import { toast } from "sonner";

export interface ChordItem {
    id: string;
    chord: string;
}

const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

interface UseChordManagementProps {
    initialPrompt?: string;
    initialChords?: ChordItem[];
}

// For parameters passed to generateChords
interface GenerationParams {
    numChords: number;
    customPrompt?: string;
    useAdvancedModel?: boolean;
}

// For parameters passed to addChordAt for its specific generation context
interface AddChordContextParams {
    prompt?: string; // Contextual prompt for adding this specific chord
    useAdvancedModel?: boolean; // Model choice for adding this specific chord
}


export function useChordManagement(props?: UseChordManagementProps) {
    const [prompt, setPrompt] = useState<string>(props?.initialPrompt || ""); // Overall prompt for the progression
    const [chords, setChords] = useState<ChordItem[]>(props?.initialChords || []);
    const [fullLoading, setFullLoading] = useState<boolean>(false);
    const [loadingChordId, setLoadingChordId] = useState<string | null>(null);

    const showErrorToast = useCallback((title: string, description?: string) => {
        toast.error(title, {
            description: description,
        });
    }, []);

    // const showInfoToast = useCallback((title: string, description?: string) => {
    //     toast.info(title, { description });
    // }, []);

    const generateChordsInternal = useCallback(
        async (
            currentPromptInternal: string,
            currentChords: ChordItem[],
            numChordsToGen: number,
            useAdvanced: boolean,
            attempt: number = 0
        ): Promise<ChordItem[] | null> => {
            const MAX_ATTEMPTS = 3;
            if (!currentPromptInternal.trim() && currentChords.length === 0) { // Only require prompt if generating from scratch
                showErrorToast("Input Error", "Please describe your chord progression before generating.");
                setFullLoading(false);
                return null;
            }
            setFullLoading(true);
            let generatedChordsResult = null;

            try {
                const existingChordsForApi = currentChords.map(c => ({ chord: c.chord }));

                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt: currentPromptInternal,
                        existingChords: existingChordsForApi,
                        numChords: numChordsToGen,
                        useAdvancedModel: useAdvanced,
                    }),
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

                let allCleanedChordsAreValid = true;
                for (const chordName of cleaned) {
                    const chordData = Chord.get(chordName);
                    if (!chordData || !chordData.notes || chordData.notes.length === 0) {
                        allCleanedChordsAreValid = false;
                        break;
                    }
                }

                if (!allCleanedChordsAreValid) {
                    if (attempt < MAX_ATTEMPTS - 1) {
                        console.warn(`Invalid chord name found in AI response ("${cleaned.join('-')}"), reattempting generation`, attempt + 1);
                        return generateChordsInternal(currentPromptInternal, currentChords, numChordsToGen, useAdvanced, attempt + 1);
                    } else {
                        showErrorToast("Generation Error", "AI returned invalid chord names after several attempts.");
                        setFullLoading(false); return null;
                    }
                }

                if (cleaned.length !== numChordsToGen && currentChords.length === 0) {
                    console.warn(`AI returned ${cleaned.length} for initial generation, but expected ${numChordsToGen}. Proceeding with AI's response.`);
                } else if (cleaned.length !== numChordsToGen && currentChords.length > 0) {
                    console.warn(`AI returned ${cleaned.length} for regeneration, but expected ${numChordsToGen}. Proceeding with AI's response.`);
                }

                generatedChordsResult = cleaned.map((aiChordName: string, index: number) => {
                    const originalChordInSlot = currentChords[index];
                    return {
                        id: originalChordInSlot?.id || generateUniqueId(),
                        chord: aiChordName,
                    };
                });

            } catch (e: any) {
                console.error("Generation error:", e);
                showErrorToast("Network Error", e.message || "Error generating chords. Please try again.");
                setFullLoading(false);
                return null;
            }
            setFullLoading(false);
            return generatedChordsResult;
        },
        [showErrorToast]
    );

    const generateChords = useCallback(async (params: GenerationParams) => {
        const { numChords, customPrompt, useAdvancedModel = false } = params;
        console.log("useChordManagement: generateChords called. Params:", params, "Current prompt state (hook):", prompt);

        let usedPrompt: string;
        if (typeof customPrompt === 'string') {
            usedPrompt = customPrompt;
        } else {
            usedPrompt = prompt; // from hook's state
        }

        // Ensure there's a prompt if generating from scratch (no existing chords)
        if (!usedPrompt.trim() && chords.length === 0) {
            showErrorToast("Input Error", "Please describe your chord progression before generating.");
            return; // Don't proceed if no prompt and no existing chords
        }

        const result = await generateChordsInternal(usedPrompt, chords, numChords, useAdvancedModel);
        if (result) {
            setChords(result);
        }
    }, [prompt, chords, generateChordsInternal, setChords, showErrorToast]); // Added showErrorToast


    const addChordAt = useCallback(
        async (position: number, contextParams?: AddChordContextParams) => {
            if (chords.length >= 8) {
                showErrorToast("Limit Reached", "Maximum of 8 chords allowed.");
                return;
            }
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

                const requestBody: any = {
                    existingChords: existingChordsForApi,
                    addChordPosition: position,
                    // Use contextParams.prompt if provided, otherwise fallback to the main hook prompt or a default
                    prompt: contextParams?.prompt || prompt || "add one suitable chord here",
                };

                if (contextParams?.useAdvancedModel !== undefined) {
                    requestBody.useAdvancedModel = contextParams.useAdvancedModel;
                }


                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody),
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
                const chordData = receivedChordSymbol ? Chord.get(receivedChordSymbol) : null;

                if (!receivedChordSymbol || !chordData || !chordData.name || chordData.notes.length === 0) {
                    showErrorToast("Invalid Chord", "Received an invalid chord from the server.");
                    setChords(originalChords); // Rollback
                    setLoadingChordId(null);
                    return;
                }

                const updatedChord: ChordItem = {
                    id: newChordId,
                    chord: chordData.name,
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
        [chords, prompt, showErrorToast, setChords]
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
        [setChords]
    );

    const generateChordsFromExample = useCallback(
        (examplePrompt: string, numChordsForExample: number, useAdvanced: boolean) => {
            if (typeof examplePrompt === 'string') {
                setPrompt(examplePrompt); // Update the main prompt state
                generateChords({
                    numChords: numChordsForExample,
                    customPrompt: examplePrompt,
                    useAdvancedModel: useAdvanced
                });
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
        generateChords,
        addChordAt,
        handleDragEnd,
        generateChordsFromExample,
    };
}