import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { genres } from '@/lib/seoContent';

export const metadata: Metadata = {
    title: 'Chord Progressions by Genre',
    description:
        'Browse chord progressions by genre — jazz, lo-fi, pop, rock, R&B, EDM, neo-soul, blues, country, folk, gospel, cinematic, ambient, and bossa nova.',
    alternates: { canonical: '/chords' },
};

export default function ChordsIndex() {
    return (
        <div className="bg-gray-50 dark:bg-black">
            <section className="px-4 pt-20 pb-12">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6">
                        Chord progressions by genre
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
                        Each guide covers the chord vocabulary, characteristic progressions, and famous examples for one genre — with free MIDI you can drop straight into your DAW.
                    </p>
                </div>
            </section>

            <section className="px-4 pb-24">
                <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {genres.map((g) => (
                        <Link
                            key={g.slug}
                            href={`/chords/${g.slug}`}
                            className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all hover:shadow-xl"
                        >
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                                {g.title}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                                {g.intro}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
