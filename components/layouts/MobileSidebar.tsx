'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, SquarePen, Moon, Sun, Monitor, User, Settings } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useUser, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';

type Theme = 'light' | 'dark' | 'system';

export function MobileSidebar() {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState<Theme>('system');
    const { isSignedIn, isLoaded } = useUser();

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
                <SheetContent side="left" className="w-64 p-0 flex flex-col">
                    <SheetHeader className="h-14 px-4 border-b border-border flex flex-row items-center justify-start flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
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

                    {/* New progression button */}
                    <div className="p-4 border-b border-border flex-shrink-0">
                        <Button asChild variant="ghost" className="w-full justify-start" onClick={() => setOpen(false)}>
                            <Link href="/app">
                                <SquarePen className="h-4 w-4 mr-2" />
                                New Progression
                            </Link>
                        </Button>
                    </div>

                    <nav className="flex-1 py-4 px-4" />

                    {/* Bottom: Settings → Account */}
                    <div className="flex-shrink-0 border-t border-border">
                        {/* Settings row */}
                        <div className="p-4 border-b border-border">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <Settings className="h-4 w-4 mr-2" />
                                        Settings
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[560px] max-w-[90vw] h-[420px] p-0 flex flex-col overflow-hidden">
                                    <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
                                        <DialogTitle className="text-base">Settings</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-1 overflow-hidden">
                                        <div className="w-40 border-r border-border p-3 flex-shrink-0">
                                            <p className="px-2 py-1.5 text-sm font-medium bg-accent rounded-md">Appearance</p>
                                        </div>
                                        <div className="flex-1 p-6 overflow-y-auto">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Theme</label>
                                                    <Select value={theme} onValueChange={handleThemeChange}>
                                                        <SelectTrigger className="w-48">
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
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Account row */}
                        {isLoaded && (
                            <div className="p-4">
                                {isSignedIn ? (
                                    <div className="flex items-center gap-2">
                                        <UserButton />
                                        <span className="text-sm text-muted-foreground">Account</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <SignUpButton mode="modal">
                                            <Button size="sm" className="w-full rounded-full font-semibold text-xs">
                                                Sign up free
                                            </Button>
                                        </SignUpButton>
                                        <SignInButton mode="modal">
                                            <Button variant="ghost" size="sm" className="w-full text-xs">
                                                Sign in
                                            </Button>
                                        </SignInButton>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2">
                <Image
                    src="/chordgen_logo_small.png"
                    alt="ChordGen Logo"
                    width={28}
                    height={28}
                    className="h-7 w-7 dark:invert"
                />
                <span className="font-bold">ChordGen</span>
            </Link>

            {isLoaded && (
                isSignedIn ? (
                    <UserButton appearance={{ elements: { avatarBox: 'h-8 w-8' } }} />
                ) : (
                    <SignInButton mode="modal">
                        <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Sign in">
                            <User className="h-5 w-5" />
                        </Button>
                    </SignInButton>
                )
            )}
        </header>
    );
}

export default MobileSidebar;
