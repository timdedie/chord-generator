'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DarkModeToggle from '@/components/DarkModeToggle';
import { Button } from '@/components/ui/button';

export function MarketingHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/chordgen_logo_small.png"
                        alt="ChordGen Logo"
                        width={64}
                        height={64}
                        className="h-7 w-7 dark:invert"
                        priority
                    />
                    <span className="text-lg font-bold">ChordGen</span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    <DarkModeToggle />
                    <Button asChild className="font-semibold">
                        <Link href="/app">
                            Try ChordGen
                        </Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}

export default MarketingHeader;
