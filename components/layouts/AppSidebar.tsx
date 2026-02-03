'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, SquarePen, Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Theme = 'light' | 'dark' | 'system';

export function AppSidebar() {
    const [collapsed, setCollapsed] = useState(true);
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
        <aside
            className={`hidden md:flex flex-col fixed top-0 left-0 h-screen bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-200 z-40 ${
                collapsed ? 'w-14' : 'w-56'
            }`}
        >
            {/* Top section: Logo and collapse toggle */}
            <div className="flex items-center justify-between h-16 px-3">
                <Link href="/" className="flex items-center gap-2 overflow-hidden">
                    <Image
                        src="/chordgen_logo_small.png"
                        alt="ChordGen Logo"
                        width={32}
                        height={32}
                        className="h-8 w-8 flex-shrink-0 dark:invert"
                        priority
                    />
                    {!collapsed && (
                        <span className="text-lg font-bold whitespace-nowrap">ChordGen</span>
                    )}
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="h-8 w-8 flex-shrink-0"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* New progression button */}
            <div className="p-2">
                <Button
                    asChild
                    variant="ghost"
                    size={collapsed ? "icon" : "default"}
                    className={`w-full ${collapsed ? '' : 'justify-start'}`}
                >
                    <Link href="/app">
                        <SquarePen className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="ml-2">New Progression</span>}
                    </Link>
                </Button>
            </div>

            {/* Middle section: Empty nav area for future features */}
            <nav className="flex-1 py-4 px-2">
                {/* Future: History, saved progressions, settings links */}
            </nav>

            {/* Bottom section: Dark mode toggle */}
            <div className="p-3">
                {collapsed ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            const newTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';
                            handleThemeChange(newTheme);
                        }}
                        className="w-full h-8"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <Moon className="h-4 w-4" />
                        ) : theme === 'light' ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Monitor className="h-4 w-4" />
                        )}
                    </Button>
                ) : (
                    <Select value={theme} onValueChange={handleThemeChange}>
                        <SelectTrigger className="w-full h-8 text-sm">
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
                )}
            </div>
        </aside>
    );
}

export default AppSidebar;
