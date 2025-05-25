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

interface GenerationParams {
    numChords: number;
    customPrompt?: string;
    useHighCreativity?: boolean; // Renamed from useAdvancedModel
}

interface AddChordContextParams {
    prompt?: string;
    useHighCreativity?: boolean; // Renamed from useAdvancedModel
}

// Added: Define types for the expected API response
interface ApiChordProgressionResponse {
    chords: string[];
    error?: string;
}

interface ApiSingleChordResponse {
    chord: string;
    error?: string;
}


export function useChordManagement(props?: UseChordManagementProps) {
    const [prompt, setPrompt] = useState<string>(props?.initialPrompt || "");
    const [chords, setChords] = useState<ChordItem[]>(props?.initialChords || []);
    const [fullLoading, setFullLoading] = useState<boolean>(false);
    const [loadingChordId, setLoadingChordId] = useState<string | null>(null);

    const showErrorToast = useCallback((title: string, description?: string) => {
        toast.error(title, {
            description: description,
        });
    }, []);

    const generateChordsInternal = useCallback(
        async (
            currentPromptInternal: string,
            currentChords: ChordItem[],
            numChordsToGen: number,
            isHighCreativity: boolean, // Renamed from useAdvanced
            attempt: number = 0
        ): Promise<ChordItem[] | null> => {
            const MAX_ATTEMPTS = 3;
            if (!currentPromptInternal.trim() && currentChords.length === 0) {
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
                        useHighCreativity: isHighCreativity, // Renamed field for API
                    }),
                });

                const data: ApiChordProgressionResponse = await res.json();

                if (!res.ok || data.error) {
                    const errorMsg = data.error || "Failed to generate chords from server.";
                    showErrorToast("Generation Failed", errorMsg);
                    setFullLoading(false);
                    return null;
                }

                const receivedChordSymbols = data.chords;

                if (!Array.isArray(receivedChordSymbols)) {
                    showErrorToast("Generation Error", "AI returned an unexpected data format.");
                    setFullLoading(false); return null;
                }

                const cleanedChordSymbols = receivedChordSymbols
                    .map((c: string) => c.trim().replace(/△/g, ""))
                    .filter((c: string) => c);


                let allCleanedChordsAreValid = true;
                if (cleanedChordSymbols.length === 0 && numChordsToGen > 0) {
                    allCleanedChordsAreValid = false;
                } else {
                    for (const chordName of cleanedChordSymbols) {
                        const chordData = Chord.get(chordName);
                        if (!chordData || !chordData.notes || chordData.notes.length === 0) {
                            allCleanedChordsAreValid = false;
                            break;
                        }
                    }
                }


                if (!allCleanedChordsAreValid) {
                    if (attempt < MAX_ATTEMPTS - 1) {
                        console.warn(`Invalid chord name(s) or empty array found in AI response ("${cleanedChordSymbols.join('-')}"), reattempting generation`, attempt + 1);
                        return generateChordsInternal(currentPromptInternal, currentChords, numChordsToGen, isHighCreativity, attempt + 1);
                    } else {
                        showErrorToast("Generation Error", "AI returned invalid chord names or an empty array after several attempts.");
                        setFullLoading(false); return null;
                    }
                }

                if (cleanedChordSymbols.length !== numChordsToGen && currentChords.length === 0) {
                    console.warn(`AI returned ${cleanedChordSymbols.length} chords for initial generation, but expected ${numChordsToGen}. Proceeding with AI's response.`);
                } else if (cleanedChordSymbols.length !== numChordsToGen && currentChords.length > 0) {
                    console.warn(`AI returned ${cleanedChordSymbols.length} chords for regeneration, but expected ${numChordsToGen}. Proceeding with AI's response.`);
                }


                generatedChordsResult = cleanedChordSymbols.map((aiChordName: string, index: number) => {
                    const originalChordInSlot = (currentChords.length === cleanedChordSymbols.length) ? currentChords[index] : undefined;
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
        const { numChords, customPrompt, useHighCreativity = false } = params; // Renamed here
        console.log("useChordManagement: generateChords called. Params:", params, "Current prompt state (hook):", prompt);

        let usedPrompt: string;
        if (typeof customPrompt === 'string') {
            usedPrompt = customPrompt;
        } else {
            usedPrompt = prompt;
        }

        if (!usedPrompt.trim() && chords.length === 0) {
            showErrorToast("Input Error", "Please describe your chord progression before generating.");
            return;
        }

        const result = await generateChordsInternal(usedPrompt, chords, numChords, useHighCreativity); // Pass renamed var
        if (result) {
            setChords(result);
        }
    }, [prompt, chords, generateChordsInternal, setChords, showErrorToast]);


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
                    prompt: contextParams?.prompt || prompt || "add one suitable chord here",
                };

                if (contextParams?.useHighCreativity !== undefined) { // Renamed here
                    requestBody.useHighCreativity = contextParams.useHighCreativity; // Renamed field for API
                }

                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestBody),
                });

                const data: ApiSingleChordResponse = await res.json();

                if (!res.ok || data.error) {
                    const errorMsg = data.error || "Failed to add chord from server.";
                    showErrorToast("Add Chord Failed", errorMsg);
                    setChords(originalChords);
                    setLoadingChordId(null);
                    return;
                }

                const receivedChordSymbol = data.chord?.trim().replace(/△/g, "");
                const chordData = receivedChordSymbol ? Chord.get(receivedChordSymbol) : null;

                if (!receivedChordSymbol || !chordData || !chordData.name || chordData.notes.length === 0) {
                    showErrorToast("Invalid Chord", `Received an invalid chord ("${receivedChordSymbol || 'empty'}") from the server.`);
                    setChords(originalChords);
                    setLoadingChordId(null);
                    return;
                }

                const updatedChordItem: ChordItem = {
                    id: newChordId,
                    chord: chordData.name,
                };
                setChords((prev) =>
                    prev.map((ch) => (ch.id === newChordId ? updatedChordItem : ch))
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
        (examplePrompt: string, numChordsForExample: number, isHighCreativity: boolean) => { // Renamed here
            if (typeof examplePrompt === 'string') {
                setPrompt(examplePrompt);
                generateChords({
                    numChords: numChordsForExample,
                    customPrompt: examplePrompt,
                    useHighCreativity: isHighCreativity // Pass renamed var
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