'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
} from '@/components/ui/dialog';

const SEEN_KEY_PREFIX = 'welcome-toast-shown-';
const FRESH_SIGNUP_WINDOW_MS = 2 * 60 * 1000;

export default function WelcomeAfterSignUp() {
    const { isSignedIn, isLoaded, user } = useUser();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user) return;

        const seenKey = `${SEEN_KEY_PREFIX}${user.id}`;
        if (localStorage.getItem(seenKey)) return;

        const createdAt = user.createdAt ? new Date(user.createdAt).getTime() : 0;
        const justSignedUp = Date.now() - createdAt < FRESH_SIGNUP_WINDOW_MS;

        localStorage.setItem(seenKey, '1');
        if (!justSignedUp) return;

        setOpen(true);
    }, [isLoaded, isSignedIn, user]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-sm text-center lowercase">
                <DialogHeader className="items-center text-center sm:text-center">
                    <Image
                        src="/chordgen_logo.svg"
                        alt="ChordGen"
                        width={56}
                        height={56}
                        className="h-14 w-14 object-contain"
                    />
                    <DialogDescription className="text-sm">
                        hey :) thanks for using my app! if you like it, consider supporting it via
                        paypal to help me keep it running and cover server costs (im just a
                        student) but if you cant, no worries, have fun with the free tool :)
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <a
                        href="https://www.paypal.com/paypalme/timdedie"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 shadow px-4 py-2 font-medium text-gray-700 dark:text-gray-200 transition-transform hover:scale-105"
                    >
                        <Image
                            src="/paypal/paypal-logo.png"
                            alt="PayPal"
                            width={16}
                            height={16}
                            className="h-4 w-4 shrink-0 object-contain"
                        />
                        <span>support via paypal</span>
                    </a>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
