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

export function usePremiumGeneration(): UsePremiumGenerationReturn {
    const { isSignedIn, isLoaded } = useUser();
    const [status, setStatus] = useState<Status>(EMPTY);
    const [enabled, setEnabled] = useState(false);

    const refresh = useCallback(() => {
        if (!isSignedIn) {
            setStatus(EMPTY);
            return;
        }
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

    const available = status.unlimited || status.used < status.limit;

    const toggle = useCallback(() => {
        if (!isSignedIn || !available) return;
        setEnabled((prev) => !prev);
    }, [isSignedIn, available]);

    // Called after a premium generation lands. Turn the toggle off and bump the
    // count optimistically so the UI reflects the use immediately, then reconcile
    // with the server (a fresh status fetch can lag the generation's DB write).
    const consume = useCallback(() => {
        setEnabled(false);
        setStatus((s) => (s.unlimited ? s : { ...s, used: s.used + 1 }));
        refresh();
    }, [refresh]);

    return {
        isSignedIn: Boolean(isSignedIn),
        available,
        enabled,
        used: status.used,
        limit: status.limit,
        remaining: status.unlimited ? Infinity : Math.max(0, status.limit - status.used),
        unlimited: status.unlimited,
        toggle,
        consume,
        refresh,
    };
}
