import React from 'react';

const formatChord = (chord: string) =>
    chord.replace(/b/g, '♭').replace(/#/g, '♯');

export function ChordChip({ chord, large = false }: { chord: string; large?: boolean }) {
    return (
        <span
            className={`inline-flex items-center justify-center rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 font-bold text-gray-900 dark:text-white shadow-sm ${
                large ? 'min-w-20 h-20 text-2xl px-4' : 'min-w-14 h-14 text-base px-3'
            }`}
        >
            {formatChord(chord)}
        </span>
    );
}

export function ChordRow({ chords, large = false }: { chords: string[]; large?: boolean }) {
    return (
        <div className="flex flex-wrap gap-2 sm:gap-3">
            {chords.map((c, i) => (
                <ChordChip key={`${c}-${i}`} chord={c} large={large} />
            ))}
        </div>
    );
}
