import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DarkModeToggle from '@/components/DarkModeToggle';

const popularGenres = [
    { slug: 'lo-fi', label: 'Lo-Fi' },
    { slug: 'jazz', label: 'Jazz' },
    { slug: 'pop', label: 'Pop' },
    { slug: 'edm', label: 'EDM' },
    { slug: 'rnb', label: 'R&B' },
    { slug: 'rock', label: 'Rock' },
    { slug: 'cinematic', label: 'Cinematic' },
    { slug: 'neo-soul', label: 'Neo-Soul' },
];

const popularKeys = [
    { slug: 'c-major', label: 'C Major' },
    { slug: 'g-major', label: 'G Major' },
    { slug: 'd-major', label: 'D Major' },
    { slug: 'a-minor', label: 'A Minor' },
    { slug: 'e-minor', label: 'E Minor' },
    { slug: 'd-minor', label: 'D Minor' },
];

export function Footer() {
    return (
        <footer className="w-full bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 sm:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-3">
                            <Image
                                src="/chordgen_logo_small.png"
                                alt="ChordGen Logo"
                                width={64}
                                height={64}
                                className="h-6 w-6 dark:invert"
                            />
                            <span className="font-bold text-gray-900 dark:text-gray-100">ChordGen</span>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed">
                            The free AI chord progression generator. Describe a mood, get progressions, download MIDI.
                        </p>
                    </div>

                    <nav>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/app" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                                    Generator
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    <nav>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">By Genre</h3>
                        <ul className="space-y-2 text-sm">
                            {popularGenres.map((g) => (
                                <li key={g.slug}>
                                    <Link
                                        href={`/chords/${g.slug}`}
                                        className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                                    >
                                        {g.label} progressions
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href="/chords" className="text-primary hover:underline font-semibold">
                                    All genres →
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    <nav>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">By Key</h3>
                        <ul className="space-y-2 text-sm">
                            {popularKeys.map((k) => (
                                <li key={k.slug}>
                                    <Link
                                        href={`/key/${k.slug}`}
                                        className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                                    >
                                        {k.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href="/key" className="text-primary hover:underline font-semibold">
                                    All keys →
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-500">
                    <p>&copy; {new Date().getFullYear()} ChordGen. All rights reserved.</p>
                    <DarkModeToggle />
                </div>
            </div>
        </footer>
    );
}
