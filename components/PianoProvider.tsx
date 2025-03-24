"use client";

import React, { createContext, useEffect, useState } from "react";
import * as Tone from "tone";

export const PianoContext = createContext<Tone.Sampler | null>(null);

interface PianoProviderProps {
    children: React.ReactNode;
}

export default function PianoProvider({ children }: PianoProviderProps) {
    const [piano, setPiano] = useState<Tone.Sampler | null>(null);

    useEffect(() => {
        const sampler = new Tone.Sampler({
            urls: {
                A0: "A0.mp3",
                A1: "A1.mp3",
                A2: "A2.mp3",
                A3: "A3.mp3",
                A4: "A4.mp3",
                A5: "A5.mp3",
                A6: "A6.mp3",
                A7: "A7.mp3",
                C1: "C1.mp3",
                C2: "C2.mp3",
                C3: "C3.mp3",
                C4: "C4.mp3",
                C5: "C5.mp3",
                C6: "C6.mp3",
                C7: "C7.mp3",
                C8: "C8.mp3",
                "D#1": "Dsharp1.mp3",
                "D#2": "Dsharp2.mp3",
                "D#3": "Dsharp3.mp3",
                "D#4": "Dsharp4.mp3",
                "D#5": "Dsharp5.mp3",
                "D#6": "Dsharp6.mp3",
                "D#7": "Dsharp7.mp3",
                "F#1": "Fsharp1.mp3",
                "F#2": "Fsharp2.mp3",
                "F#3": "Fsharp3.mp3",
                "F#4": "Fsharp4.mp3",
                "F#5": "Fsharp5.mp3",
                "F#6": "Fsharp6.mp3",
                "F#7": "Fsharp7.mp3",
            },
            release: 1,
            baseUrl: "/piano/",
        }).toDestination();

        setPiano(sampler);
    }, []);

    return (
        <PianoContext.Provider value={piano}>
            {children}
        </PianoContext.Provider>
    );
}
