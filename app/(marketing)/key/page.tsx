import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { keys } from '@/lib/seoContent';

export const metadata: Metadata = {
    title: 'Chord Progressions by Key',
    description:
        'Browse chord progressions in all 24 major and minor keys. Diatonic chords, common patterns, and free MIDI export for any DAW.',
    alternates: { canonical: '/key' },
};

export default function KeyIndex() {
    const majorKeys = keys.filter((k) => k.quality === 'major');
    const minorKeys = keys.filter((k) => k.quality === 'minor');

    return (
        <div className="bg-gray-50 dark:bg-black">
            <section className="px-4 pt-20 pb-12">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6">
                        Chord progressions by key
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
                        Diatonic chords, common patterns, and famous examples for every major and minor key.
                    </p>
                </div>
            </section>

            <section className="px-4 pb-24">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Major keys</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {majorKeys.map((k) => (
                                <Link
                                    key={k.slug}
                                    href={`/key/${k.slug}`}
                                    className="block p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all text-center font-bold text-gray-900 dark:text-white hover:text-primary"
                                >
                                    {k.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Minor keys</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {minorKeys.map((k) => (
                                <Link
                                    key={k.slug}
                                    href={`/key/${k.slug}`}
                                    className="block p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all text-center font-bold text-gray-900 dark:text-white hover:text-primary"
                                >
                                    {k.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
