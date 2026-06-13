'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

export interface UsePremiumGenerationReturn {
    isSignedIn: boolean;
    available: boolean;
    enabled: boolean;
    used: number;
    limit: number;
    remaining: number;
    unlimited: boolean;
    toggle: () => void;
    consume: () => void;
    refresh: () => void;
}

interface Status {
    used: number;
    limit: number;
    unlimited: boolean;
}

const EMPTY: Status = { used: 0, limit: 0, unlimited: false };

const STORAGE_KEY = 'chordgen.premiumEnabled';

export function usePremiumGeneration(): UsePremiumGenerationReturn {
    const { isSignedIn, isLoaded } = useUser();
    const [status, setStatus] = useState<Status>(EMPTY);
    const [rawEnabled, setEnabled] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(STORAGE_KEY) === '1';
    });

    const refresh = useCallback(() => {
        if (!isSignedIn) return;
        fetch('/api/premium-status', { cache: 'no-store' })
            .then((res) => res.json())
            .then((data) =>
                setStatus({
                    used: Number(data.used ?? 0),
                    limit: Number(data.limit ?? 0),
                    unlimited: Boolean(data.unlimited),
                })
            )
            .catch(() => setStatus(EMPTY));
    }, [isSignedIn]);

    useEffect(() => {
        if (!isLoaded) return;
        refresh();
    }, [isLoaded, refresh]);

    // Re-read availability whenever the page is shown again (tab focus, or a
    // back/forward navigation restoring a bfcached page). Without this, a page
    // left mounted keeps stale availability after generations are consumed
    // elsewhere — the source of the app/results inconsistency.
    useEffect(() => {
        if (!isLoaded) return;
        const onVisible = () => {
            if (document.visibilityState === 'visible') refresh();
        };
        window.addEventListener('focus', refresh);
        window.addEventListener('pageshow', refresh);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.removeEventListener('focus', refresh);
            window.removeEventListener('pageshow', refresh);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [isLoaded, refresh]);

    // Treat status as empty once the user is signed out, without discarding
    // the fetched state (it's reused if they sign back in).
    const effectiveStatus = isSignedIn ? status : EMPTY;
    const available = effectiveStatus.unlimited || effectiveStatus.used < effectiveStatus.limit;

    // A persisted "on" state is only honored once we know it's actually
    // usable (signed in, with premium remaining); before the status loads we
    // optimistically keep showing it as on.
    const enabled = rawEnabled && (!isLoaded || (isSignedIn && available));

    // Persist the toggle so it survives navigation/reload until the user
    // explicitly turns it off, but never persist it for a signed-out user
    // or once it's no longer usable.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (enabled) {
            window.localStorage.setItem(STORAGE_KEY, '1');
        } else {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    }, [enabled]);

    const toggle = useCallback(() => {
        if (!isSignedIn || !available) return;
        setEnabled((prev) => !prev);
    }, [isSignedIn, available]);

    // Called after a premium generation lands. Bump the count optimistically
    // so the UI reflects the use immediately, then reconcile with the server
    // (a fresh status fetch can lag the generation's DB write). The toggle
    // stays on for the next generation as long as premium is still available;
    // the effect above will turn it off once the quota is exhausted.
    const consume = useCallback(() => {
        setStatus((s) => (s.unlimited ? s : { ...s, used: s.used + 1 }));
        refresh();
    }, [refresh]);

    return {
        isSignedIn: Boolean(isSignedIn),
        available,
        enabled,
        used: effectiveStatus.used,
        limit: effectiveStatus.limit,
        remaining: effectiveStatus.unlimited ? Infinity : Math.max(0, effectiveStatus.limit - effectiveStatus.used),
        unlimited: effectiveStatus.unlimited,
        toggle,
        consume,
        refresh,
    };
}
