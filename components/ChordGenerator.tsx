"use client";

import { useState, ChangeEvent } from 'react';

interface ChordGeneratorProps {
    onChordsGenerated: (chords: string) => void;
}

export default function ChordGenerator({ onChordsGenerated }: ChordGeneratorProps) {
    const [prompt, setPrompt] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const generateChords = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();

            // Clean the response to only have the chord progression (e.g., "C-G-Am-F")
            const cleanChords: string = data.chords
                .replace(/^chords:\s*['"]?/, '')
                .replace(/['"]?$/, '')
                .trim();

            onChordsGenerated(cleanChords);
        } catch (error) {
            console.error('Error generating chords:', error);
        }
        setLoading(false);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Chord Progression Generator</h1>
            <textarea
                value={prompt}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                placeholder="Describe your music (e.g., 'a happy pop song')"
                className="w-full p-2 border rounded mb-2"
                rows={3}
            />
            <button
                onClick={generateChords}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                {loading ? 'Generating...' : 'Generate Chords'}
            </button>
        </div>
    );
}
