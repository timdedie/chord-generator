'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, Home, Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Theme = 'light' | 'dark' | 'system';

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState<Theme>('system');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setTheme((localStorage.getItem('theme') as Theme) || 'system');
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
            root.classList.add(systemTheme);

            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e: MediaQueryListEvent) => {
                root.classList.toggle('dark', e.matches);
            };
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            root.classList.add(theme);
        }
    }, [theme]);

    const handleThemeChange = (value: Theme) => {
        setTheme(value);
        localStorage.setItem('theme', value);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center justify-between h-14 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open menu">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <SheetHeader className="h-14 px-4 border-b border-border flex flex-row items-center justify-start">
                        <Link href="/app" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                            <Image
                                src="/chordgen_logo_small.png"
                                alt="ChordGen Logo"
                                width={28}
                                height={28}
                                className="h-7 w-7 dark:invert"
                            />
                            <SheetTitle className="text-lg font-bold">ChordGen</SheetTitle>
                        </Link>
                    </SheetHeader>

                    <nav className="flex-1 py-4 px-4">
                        {/* Future: History, saved progressions, settings links */}
                    </nav>

                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Theme</label>
                            <Select value={theme} onValueChange={handleThemeChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">
                                        <div className="flex items-center gap-2">
                                            <Sun className="h-4 w-4" />
                                            <span>Light</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="dark">
                                        <div className="flex items-center gap-2">
                                            <Moon className="h-4 w-4" />
                                            <span>Dark</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="system">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="h-4 w-4" />
                                            <span>System</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            variant="outline"
                            asChild
                            className="w-full justify-start"
                            onClick={() => setOpen(false)}
                        >
                            <Link href="/">
                                <Home className="h-4 w-4 mr-2" />
                                Back to site
                            </Link>
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            <Link href="/app" className="flex items-center gap-2">
                <Image
                    src="/chordgen_logo_small.png"
                    alt="ChordGen Logo"
                    width={28}
                    height={28}
                    className="h-7 w-7 dark:invert"
                />
                <span className="font-bold">ChordGen</span>
            </Link>

            {/* Placeholder for right side - keeps logo centered */}
            <div className="w-10" />
        </header>
    );
}

export default MobileSidebar;
