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
    useAdvancedModel?: boolean;
}

interface AddChordContextParams {
    prompt?: string;
    useAdvancedModel?: boolean;
}

// Added: Define types for the expected API response
interface ApiChordProgressionResponse {
    chords: string[];
    error?: string; // Keep error for consistency if API returns it at top level
}

interface ApiSingleChordResponse {
    chord: string;
    error?: string; // Keep error for consistency
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
            useAdvanced: boolean,
            attempt: number = 0
        ): Promise<ChordItem[] | null> => {
            const MAX_ATTEMPTS = 3; // Keep retry logic for semantic validation (is it a valid chord?)
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
                        useAdvancedModel: useAdvanced,
                    }),
                });

                // Updated: Expecting ApiChordProgressionResponse
                const data: ApiChordProgressionResponse = await res.json();

                if (!res.ok || data.error) {
                    const errorMsg = data.error || "Failed to generate chords from server.";
                    showErrorToast("Generation Failed", errorMsg);
                    setFullLoading(false);
                    return null;
                }

                // Updated: data.chords is now expected to be an array of strings directly
                // No more string splitting or complex regex cleaning needed for the structure.
                // The AI should return an array like ["Am", "G", "C"].
                // We still need to validate the *content* of those strings.
                const receivedChordSymbols = data.chords;

                if (!Array.isArray(receivedChordSymbols)) {
                    showErrorToast("Generation Error", "AI returned an unexpected data format.");
                    setFullLoading(false); return null;
                }

                // Trim and filter empty strings just in case, though ideally AI provides clean array
                const cleanedChordSymbols = receivedChordSymbols
                    .map((c: string) => c.trim().replace(/△/g, "")) // Keep △ removal for now
                    .filter((c: string) => c);


                let allCleanedChordsAreValid = true;
                if (cleanedChordSymbols.length === 0 && numChordsToGen > 0) { // If AI returns empty array but we expected chords
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
                        // For re-attempt, ensure we pass the original number of chords requested for generation.
                        return generateChordsInternal(currentPromptInternal, currentChords, numChordsToGen, useAdvanced, attempt + 1);
                    } else {
                        showErrorToast("Generation Error", "AI returned invalid chord names or an empty array after several attempts.");
                        setFullLoading(false); return null;
                    }
                }

                // Length check can still be useful, though generateObject should be more reliable
                if (cleanedChordSymbols.length !== numChordsToGen && currentChords.length === 0) {
                    console.warn(`AI returned ${cleanedChordSymbols.length} chords for initial generation, but expected ${numChordsToGen}. Proceeding with AI's response.`);
                } else if (cleanedChordSymbols.length !== numChordsToGen && currentChords.length > 0) {
                    console.warn(`AI returned ${cleanedChordSymbols.length} chords for regeneration, but expected ${numChordsToGen}. Proceeding with AI's response.`);
                }


                generatedChordsResult = cleanedChordSymbols.map((aiChordName: string, index: number) => {
                    // If regenerating, try to reuse existing IDs for stability in UI lists.
                    // If the number of chords changed, this might not align perfectly.
                    const originalChordInSlot = (currentChords.length === cleanedChordSymbols.length) ? currentChords[index] : undefined;
                    return {
                        id: originalChordInSlot?.id || generateUniqueId(),
                        chord: aiChordName, // Already validated by Chord.get()
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
        [showErrorToast] // Removed setChords as it's handled by the caller `generateChords`
    );

    const generateChords = useCallback(async (params: GenerationParams) => {
        const { numChords, customPrompt, useAdvancedModel = false } = params;
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

        // When generating/regenerating the whole progression, currentChords for the API call should be the existing ones if any.
        // If it's a regeneration, the API will get the existingChords.
        // If it's a new generation, existingChords will be empty.
        const result = await generateChordsInternal(usedPrompt, chords, numChords, useAdvancedModel);
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
            const placeholderChord: ChordItem = { id: newChordId, chord: "" }; // Placeholder remains useful for UI

            const originalChords = [...chords]; // For rollback
            const updatedChordsWithPlaceholder = [
                ...originalChords.slice(0, position),
                placeholderChord,
                ...originalChords.slice(position),
            ];
            setChords(updatedChordsWithPlaceholder);
            setLoadingChordId(newChordId);

            try {
                // For addChordAt, existingChords sent to API should be the state *before* adding the placeholder
                const existingChordsForApi = originalChords.map(c => ({ chord: c.chord }));

                const requestBody: any = {
                    existingChords: existingChordsForApi,
                    addChordPosition: position,
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

                // Updated: Expecting ApiSingleChordResponse
                const data: ApiSingleChordResponse = await res.json();

                if (!res.ok || data.error) {
                    const errorMsg = data.error || "Failed to add chord from server.";
                    showErrorToast("Add Chord Failed", errorMsg);
                    setChords(originalChords); // Rollback
                    setLoadingChordId(null);
                    return;
                }

                // Updated: data.chord is now expected to be a string directly
                const receivedChordSymbol = data.chord?.trim().replace(/△/g, ""); // Keep △ removal
                const chordData = receivedChordSymbol ? Chord.get(receivedChordSymbol) : null;

                if (!receivedChordSymbol || !chordData || !chordData.name || chordData.notes.length === 0) {
                    showErrorToast("Invalid Chord", `Received an invalid chord ("${receivedChordSymbol || 'empty'}") from the server.`);
                    setChords(originalChords); // Rollback
                    setLoadingChordId(null);
                    return;
                }

                const updatedChordItem: ChordItem = { // Renamed to avoid conflict with tonal.Chord
                    id: newChordId,
                    chord: chordData.name, // Use the validated/normalized name from tonal
                };
                setChords((prev) =>
                    prev.map((ch) => (ch.id === newChordId ? updatedChordItem : ch))
                );
            } catch (e: any) {
                console.error("Error adding chord:", e);
                showErrorToast("Network Error", e.message || "Error adding chord. Please try again.");
                setChords(originalChords); // Rollback on general error
            }
            setLoadingChordId(null);
        },
        [chords, prompt, showErrorToast, setChords] // Added setChords
    );

    const handleDragEnd = useCallback(
        ({ active, over }: DragEndEvent) => {
            if (!over || active.id === over.id) return;
            setChords((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                if (oldIndex === -1 || newIndex === -1) return items; // Should not happen
                return arrayMove(items, oldIndex, newIndex);
            });
        },
        [setChords]
    );

    const generateChordsFromExample = useCallback(
        (examplePrompt: string, numChordsForExample: number, useAdvanced: boolean) => {
            if (typeof examplePrompt === 'string') {
                setPrompt(examplePrompt);
                // When generating from an example, it's a new progression, so currentChords for API should be empty.
                // The generateChords function internally uses the `chords` state, so we might want to clear it
                // or ensure generateChordsInternal is called appropriately.
                // For simplicity, let generateChords handle the current `chords` state.
                // If an example implies starting fresh, the user should perhaps clear existing chords first,
                // or we modify generateChords to have a "startFresh" option.
                // Current implementation: generateChords will use the current `chords` array for regeneration if it's not empty.
                // This means an "example" might regenerate based on existing chords if any.
                // To ensure an example ALWAYS starts fresh, we could do:
                // setChords([]); // If example should always clear
                // generateChords({ numChords: numChordsForExample, customPrompt: examplePrompt, useAdvancedModel });
                // However, the current `generateChords` will pass its `chords` (which might be non-empty)
                // to `generateChordsInternal`.
                // Let's stick to current logic: example prompt becomes main prompt, then generate.
                generateChords({
                    numChords: numChordsForExample,
                    customPrompt: examplePrompt, // This will be used as `usedPrompt`
                    useAdvancedModel: useAdvanced
                });
            } else {
                console.error("generateChordsFromExample received a non-string prompt:", examplePrompt);
                showErrorToast("Input Error", "Invalid example prompt type.");
            }
        }, [generateChords, setPrompt, showErrorToast]); // Removed setChords as it's part of generateChords

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