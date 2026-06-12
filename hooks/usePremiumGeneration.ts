'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

export interface UsePremiumGenerationReturn {
    isSignedIn: boolean;
    available: boolean;
    enabled: boolean;
    toggle: () => void;
    consume: () => void;
    refresh: () => void;
}

export function usePremiumGeneration(): UsePremiumGenerationReturn {
    const { isSignedIn, isLoaded } = useUser();
    const [available, setAvailable] = useState(false);
    const [enabled, setEnabled] = useState(false);

    const refresh = useCallback(() => {
        if (!isSignedIn) {
            setAvailable(false);
            return;
        }
        fetch('/api/premium-status')
            .then((res) => res.json())
            .then((data) => setAvailable(Boolean(data.available)))
            .catch(() => setAvailable(false));
    }, [isSignedIn]);

    useEffect(() => {
        if (!isLoaded) return;
        refresh();
    }, [isLoaded, refresh]);

    const toggle = useCallback(() => {
        if (!isSignedIn || !available) return;
        setEnabled((prev) => !prev);
    }, [isSignedIn, available]);

    const consume = useCallback(() => {
        setEnabled(false);
        setAvailable(false);
    }, []);

    return {
        isSignedIn: Boolean(isSignedIn),
        available,
        enabled,
        toggle,
        consume,
        refresh,
    };
}
