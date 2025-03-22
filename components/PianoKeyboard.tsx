// PianoKeyboard.tsx
import React from "react";

const WHITE_KEYS = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
const BLACK_KEYS = [
    { note: "C#4", offset: 30 },
    { note: "D#4", offset: 70 },
    { note: "", offset: 0 }, // gap (no black key between E and F)
    { note: "F#4", offset: 150 },
    { note: "G#4", offset: 190 },
    { note: "A#4", offset: 230 },
    { note: "", offset: 0 }, // gap (no black key between B and C)
];

type PianoKeyboardProps = {
    activeNotes: string[];
};

export default function PianoKeyboard({ activeNotes }: PianoKeyboardProps) {
    return (
        <div className="relative w-full max-w-3xl mx-auto mt-8">
            {/* White keys */}
            <div className="flex">
                {WHITE_KEYS.map((note) => (
                    <div
                        key={note}
                        className={`relative w-12 h-48 border border-black ${
                            activeNotes.includes(note) ? "bg-blue-300" : "bg-white"
                        }`}
                    >
            <span className="absolute bottom-1 w-full text-center text-xs">
              {note}
            </span>
                    </div>
                ))}
            </div>
            {/* Black keys */}
            <div className="absolute top-0 left-0 h-32 w-full pointer-events-none">
                {BLACK_KEYS.map((bk, index) => {
                    if (!bk.note) return null;
                    return (
                        <div
                            key={bk.note}
                            className={`absolute w-6 h-32 border border-black z-10 ${
                                activeNotes.includes(bk.note) ? "bg-blue-500" : "bg-black"
                            }`}
                            style={{ left: `${bk.offset}px` }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
