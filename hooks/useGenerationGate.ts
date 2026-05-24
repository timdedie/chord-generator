'use client';

import { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

const STORAGE_KEY = 'chordgen_guest_count';
const FREE_LIMIT = 3;

export interface UseGenerationGateReturn {
    checkAndGate: () => boolean;
    incrementCount: () => void;
    guestCount: number;
    paywallOpen: boolean;
    setPaywallOpen: (open: boolean) => void;
}

export function useGenerationGate(): UseGenerationGateReturn {
    const { isSignedIn, isLoaded } = useUser();
    const [paywallOpen, setPaywallOpen] = useState(false);

    const getCount = useCallback((): number => {
        if (typeof window === 'undefined') return 0;
        return parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10);
    }, []);

    const checkAndGate = useCallback((): boolean => {
        if (!isLoaded) return true;
        if (isSignedIn) return true;
        const count = getCount();
        if (count < FREE_LIMIT) return true;
        setPaywallOpen(true);
        return false;
    }, [isLoaded, isSignedIn, getCount]);

    const incrementCount = useCallback(() => {
        if (isSignedIn) return;
        const current = getCount();
        localStorage.setItem(STORAGE_KEY, String(current + 1));
    }, [isSignedIn, getCount]);

    const guestCount = isSignedIn ? 0 : getCount();

    return { checkAndGate, incrementCount, guestCount, paywallOpen, setPaywallOpen };
}
