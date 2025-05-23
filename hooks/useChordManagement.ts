import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState, useCallback } from "react";
import { Chord } from "tonal";
import { toast } from "sonner";

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
    const [prompt, setPrompt] = useState<string>(props?.initialPrompt || "");
    const [chords, setChords] = useState<ChordItem[]>(props?.initialChords || []);
    const [fullLoading, setFullLoading] = useState<boolean>(false);
    const [loadingChordId, setLoadingChordId] = useState<string | null>(null);

    const showErrorToast = useCallback((title: string, description?: string) => {
        toast.error(title, {
            description: description,
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

                // NEW LOGIC STARTS HERE:
                // First, ensure all chord names in 'cleaned' are valid before proceeding
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
                        return generateChordsInternal(currentPromptInternal, currentChords, attempt + 1);
                    } else {
                        showErrorToast("Generation Error", "AI returned invalid chord names after several attempts.");
                        setFullLoading(false); return null;
                    }
                }

                // At this point, 'cleaned' is an array of valid chord *names* from the AI.
                // 'currentChords' is the state *before* this regeneration.

                if (currentChords.length > 0) {
                    // This is a regeneration (either some chords were locked, or all were unlocked but we're updating).
                    // The AI is prompted to return a progression of the same length as currentChords.
                    if (cleaned.length !== currentChords.length) {
                        console.warn(`AI returned ${cleaned.length} chords, but expected ${currentChords.length} based on the original progression. Proceeding with AI's length for now, but this might be undesirable if strict length matching is critical.`);
                        // If strict length matching is crucial, you might want to handle this more assertively:
                        // showErrorToast("Generation Error", `AI returned ${cleaned.length} chords, expected ${currentChords.length}.`);
                        // setFullLoading(false);
                        // return null;
                    }

                    generatedChordsResult = cleaned.map((aiChordName: string, index: number) => {
                        const originalChordInSlot = currentChords[index];

                        if (originalChordInSlot && originalChordInSlot.locked) {
                            // This slot was locked. Reuse its ID and locked status.
                            // The AI was instructed to keep the chord name the same for locked chords.
                            // We take aiChordName to be robust, in case AI changes it despite instructions.
                            return {
                                id: originalChordInSlot.id,
                                chord: aiChordName, // Name from AI for this slot
                                locked: true,
                            };
                        } else {
                            // This slot was unlocked, or it's a new slot (if AI returned more chords than original),
                            // or originalChordInSlot is undefined (if AI returned fewer chords than original and index is out of bounds for currentChords).
                            // In any of these cases, it's effectively a new/regenerated chord.
                            return {
                                id: (originalChordInSlot && !originalChordInSlot.locked) ? originalChordInSlot.id : generateUniqueId(), // Reuse ID if it was an unlocked slot, else new ID
                                chord: aiChordName, // Name from AI for this slot
                                locked: false,
                            };
                        }
                    });
                    // If AI returned fewer chords than original, and some original unlocked chords were at the end, they are now gone.
                    // If AI returned more, new unlocked chords are added at the end. This map handles that.

                } else {
                    // This is an initial generation (no existingChords).
                    generatedChordsResult = cleaned.map((chordName: string) => ({
                        id: generateUniqueId(),
                        chord: chordName,
                        locked: false,
                    }));
                }
                // --- END OF NEW LOGIC ---

            } catch (e: any) {
                console.error("Generation error:", e);
                showErrorToast("Network Error", e.message || "Error generating chords. Please try again.");
                setFullLoading(false); // Ensure loading is reset on catch
                return null; // Return null on error
            }
            setFullLoading(false);
            return generatedChordsResult;
        },
        [showErrorToast] // No `chords` in dependencies, `currentChords` is passed as arg
    );

    const generateChords = useCallback(async (customPromptArg?: string | unknown) => {
        let usedPrompt: string;
        if (typeof customPromptArg === 'string') {
            usedPrompt = customPromptArg;
        } else {
            usedPrompt = prompt;
        }
        // Pass the current `chords` state directly to `generateChordsInternal`
        const result = await generateChordsInternal(usedPrompt, chords);
        if (result) {
            setChords(result);
        }
    }, [prompt, chords, generateChordsInternal]); // `chords` is needed here because it's passed to generateChordsInternal


    const addChordAt = useCallback(
        async (position: number) => {
            if (chords.length >= 8) {
                showErrorToast("Limit Reached", "Maximum of 8 chords allowed.");
                return;
            }
            const newChordId = generateUniqueId();
            const placeholderChord: ChordItem = { id: newChordId, chord: "", locked: false };

            // Capture the current state of chords for potential rollback
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
                        // Send the original chords *before* adding the placeholder for API context
                        existingChords: originalChords,
                        addChordPosition: position,
                        prompt: prompt || "add one suitable chord here",
                    }),
                });
                const data = await res.json();

                if (!res.ok || data.error) {
                    const errorMsg = data.error || "Failed to add chord from server.";
                    showErrorToast("Add Chord Failed", errorMsg);
                    setChords(originalChords); // Rollback
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
                    id: newChordId, // Use the ID of the placeholder
                    chord: chordData.name, // Use the validated/normalized chord name
                    locked: false,
                };
                // Update the placeholder with the received chord
                setChords((prev) =>
                    prev.map((ch) => (ch.id === newChordId ? updatedChord : ch))
                );
            } catch (e: any) {
                console.error("Error adding chord:", e);
                showErrorToast("Network Error", e.message || "Error adding chord. Please try again.");
                setChords(originalChords); // Rollback
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
                if (oldIndex === -1 || newIndex === -1) return items; // Should not happen if IDs are correct
                return arrayMove(items, oldIndex, newIndex);
            });
        },
        [] // No dependencies needed as it operates on the items passed to the updater
    );

    const generateChordsFromExample = useCallback((examplePrompt: string) => {
        if (typeof examplePrompt === 'string') {
            setPrompt(examplePrompt);
            // Call generateChords, which will use the new prompt and current chords state
            generateChords(examplePrompt);
        } else {
            console.error("generateChordsFromExample received a non-string prompt:", examplePrompt);
            showErrorToast("Input Error", "Invalid example prompt type.");
        }
    }, [generateChords, setPrompt, showErrorToast]); // generateChords is a dependency

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