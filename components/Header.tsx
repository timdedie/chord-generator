// components/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, MessageCircleQuestion } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import { Button } from './ui/button';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Left Side: Brand and Main Navigation */}
                <div className="flex items-center gap-6">

                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/chordgen_logo.png"
                            alt="ChordGen Logo"
                            width={1024}
                            height={1024}
                            className="h-7 w-7 dark:invert"
                            priority
                        />
                        {/* --- NAME RESTORED HERE --- */}
                        <span className="text-lg font-bold">ChordGen</span>
                        {/* --- END OF RESTORATION --- */}
                    </Link>

                    <nav className="hidden items-center gap-6 text-sm md:flex">
                        <Link
                            href="/blog"
                            className="font-medium text-foreground/60 transition-colors hover:text-foreground"
                        >
                            Blog
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="font-medium text-foreground/60 transition-colors hover:text-foreground"
                        >
                            How It Works
                        </Link>
                        <Link
                            href="/faq"
                            className="font-medium text-foreground/60 transition-colors hover:text-foreground"
                        >
                            FAQ
                        </Link>
                    </nav>
                </div>

                {/* Right Side: Icons and Toggles */}
                <div className="flex items-center gap-2">
                    {/* Mobile navigation links */}
                    <nav className="flex items-center gap-1 md:hidden">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/blog" aria-label="Blog"><BookOpen className="h-5 w-5" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/faq" aria-label="FAQ"><MessageCircleQuestion className="h-5 w-5" /></Link>
                        </Button>
                    </nav>
                    <DarkModeToggle />
                </div>
            </div>
        </header>
    );
}

export default Header;