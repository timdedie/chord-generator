"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";

export interface SavedProgression {
    id: string;
    chords: string[];
    style: string;
    prompt: string;
    savedAt: number;
}

export function useSavedProgressions() {
    const { isSignedIn, isLoaded } = useUser();
    const [saved, setSaved] = useState<SavedProgression[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) {
            setSaved([]);
            return;
        }
        setIsLoading(true);
        fetch("/api/saved")
            .then((r) => r.json())
            .then((data) => setSaved(data.progressions ?? []))
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, [isLoaded, isSignedIn]);

    const isSaved = useCallback(
        (id: string) => saved.some((p) => p.id === id),
        [saved]
    );

    const toggleSave = useCallback(
        async (progression: Omit<SavedProgression, "savedAt">) => {
            if (!isSignedIn) return;

            const alreadySaved = saved.some((p) => p.id === progression.id);
            if (alreadySaved) {
                // Optimistic remove
                setSaved((prev) => prev.filter((p) => p.id !== progression.id));
                await fetch("/api/saved", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: progression.id }),
                });
            } else {
                // Optimistic add
                const newEntry: SavedProgression = { ...progression, savedAt: Date.now() };
                setSaved((prev) => [...prev, newEntry]);
                await fetch("/api/saved", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(progression),
                });
            }
        },
        [isSignedIn, saved]
    );

    return { saved, isSaved, toggleSave, isLoading, isSignedIn: isSignedIn ?? false };
}
