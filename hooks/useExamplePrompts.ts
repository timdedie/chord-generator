import { useState, useEffect, useCallback } from 'react';
// Assuming your example inputs are in public/example-inputs.json
// The import path might need adjustment based on your tsconfig.json baseUrl or path aliases
import exampleInputsFromFile from '@/public/example-inputs.json';

export function useExamplePrompts(numberOfRandomExamples: number = 5) {
    const [allExamples, setAllExamples] = useState<string[]>([]);
    const [randomExamples, setRandomExamples] = useState<string[]>([]);

    // Load all examples from the JSON file on initial mount
    useEffect(() => {
        // Type assertion: we're telling TypeScript we expect exampleInputsFromFile to be string[]
        const loadedExamples = exampleInputsFromFile as string[];
        setAllExamples(loadedExamples);
    }, []); // Empty dependency array ensures this runs only once

    // Function to pick a new set of random examples
    const pickNewRandomExamples = useCallback(() => {
        if (allExamples.length > 0) {
            const shuffled = [...allExamples].sort(() => 0.5 - Math.random());
            setRandomExamples(shuffled.slice(0, Math.min(numberOfRandomExamples, allExamples.length)));
        }
    }, [allExamples, numberOfRandomExamples]);

    // Pick initial random examples once allExamples are loaded
    useEffect(() => {
        if (allExamples.length > 0) {
            pickNewRandomExamples();
        }
    }, [allExamples, pickNewRandomExamples]); // Runs when allExamples changes or pickNewRandomExamples is redefined

    return {
        allExamples,        // In case you need the full list elsewhere
        randomExamples,
        pickNewRandomExamples // Function to allow refreshing the random examples if needed
    };
}