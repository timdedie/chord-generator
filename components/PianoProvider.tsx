"use client";

import React, { createContext, useState, useCallback, useContext, ReactNode } from "react";
// Import only the specific components/functions needed from Tone.js
import { Sampler, start as toneStart } from "tone"; // Renamed 'start' to 'toneStart' to avoid conflict if any local 'start' variable exists

export interface PianoContextState {
    piano: Sampler | null; // Use the imported Sampler type
    loadSamples: () => Promise<void>;
    areSamplesLoaded: boolean;
    isLoadingSamples: boolean;
}

export const PianoContext = createContext<PianoContextState | null>(null);

interface PianoProviderProps {
    children: ReactNode;
}

export default function PianoProvider({ children }: PianoProviderProps) {
    const [pianoInstance, setPianoInstance] = useState<Sampler | null>(null); // Use Sampler type
    const [areSamplesLoaded, setAreSamplesLoaded] = useState<boolean>(false);
    const [isLoadingSamples, setIsLoadingSamples] = useState<boolean>(false);
    const [loadAttempted, setLoadAttempted] = useState<boolean>(false);

    const loadSamplesCallback = useCallback(async () => {
        if (areSamplesLoaded || isLoadingSamples) {
            return;
        }
        if (loadAttempted && !areSamplesLoaded) {
            console.log("Sample loading was previously attempted and is not complete. Not re-attempting automatically.");
            return;
        }

        setIsLoadingSamples(true);
        setLoadAttempted(true);

        try {
            await toneStart(); // Ensure AudioContext is running, using the imported and potentially renamed function

            const samplerPromise = new Promise<Sampler>((resolve) => { // Use Sampler type
                const sampler = new Sampler({ // Use the imported Sampler class
                    urls: {
                        A2: "A2.mp3", A3: "A3.mp3", A4: "A4.mp3", A5: "A5.mp3",
                        C2: "C2.mp3", C3: "C3.mp3", C4: "C4.mp3", C5: "C5.mp3", C6: "C6.mp3",
                        "D#2": "Dsharp2.mp3", "D#3": "Dsharp3.mp3", "D#4": "Dsharp4.mp3", "D#5": "Dsharp5.mp3",
                        "F#2": "Fsharp2.mp3", "F#3": "Fsharp3.mp3", "F#4": "Fsharp4.mp3", "F#5": "Fsharp5.mp3",
                    },
                    release: 1,
                    baseUrl: "/piano/",
                    onload: () => {
                        console.log("Piano samples loaded via Sampler onload.");
                        resolve(sampler);
                    },
                }).toDestination(); // .toDestination() is a method on the Sampler instance
            });

            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error("Timeout: Piano samples took too long to load (15s).")), 15000);
            });

            const loadedSampler = await Promise.race([samplerPromise, timeoutPromise]);

            setPianoInstance(loadedSampler);
            setAreSamplesLoaded(true);
        } catch (error) {
            console.error("Error loading piano samples:", error);
            // areSamplesLoaded remains false.
            // loadAttempted is true, subsequent calls will not retry automatically.
        } finally {
            setIsLoadingSamples(false);
        }
    }, [areSamplesLoaded, isLoadingSamples, loadAttempted]);

    return (
        <PianoContext.Provider value={{ piano: pianoInstance, loadSamples: loadSamplesCallback, areSamplesLoaded, isLoadingSamples }}>
            {children}
        </PianoContext.Provider>
    );
}

export const usePiano = (): PianoContextState => {
    const context = useContext(PianoContext);
    if (context === null) {
        throw new Error("usePiano must be used within a PianoProvider. Make sure ClientHome is wrapped by PianoProvider in app/page.tsx.");
    }
    return context;
};