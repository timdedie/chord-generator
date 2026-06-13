import { useState, useCallback } from 'react';
// Assuming your example inputs are in public/example-inputs.json
// The import path might need adjustment based on your tsconfig.json baseUrl or path aliases
import exampleInputsFromFile from '@/public/example-inputs.json';

const allExamples = exampleInputsFromFile as string[];

function pickRandomExamples(count: number): string[] {
    const shuffled = [...allExamples].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, allExamples.length));
}

export function useExamplePrompts(numberOfRandomExamples: number = 5) {
    const [randomExamples, setRandomExamples] = useState<string[]>(() =>
        pickRandomExamples(numberOfRandomExamples)
    );

    // Function to allow refreshing the random examples on demand
    const pickNewRandomExamples = useCallback(() => {
        setRandomExamples(pickRandomExamples(numberOfRandomExamples));
    }, [numberOfRandomExamples]);

    return {
        allExamples,        // In case you need the full list elsewhere
        randomExamples,
        pickNewRandomExamples // Function to allow refreshing the random examples if needed
    };
}
