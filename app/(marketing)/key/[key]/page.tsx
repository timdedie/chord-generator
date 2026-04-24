import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChordRow } from '@/components/ChordChip';
import { keys, getKey } from '@/lib/seoContent';

type Params = { key: string };

export function generateStaticParams(): Params[] {
    return keys.map((k) => ({ key: k.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { key } = await params;
    const k = getKey(key);
    if (!k) return {};
    return {
        title: k.metaTitle,
        description: k.metaDescription,
        alternates: { canonical: `/key/${k.slug}` },
        openGraph: {
            title: k.metaTitle,
            description: k.metaDescription,
            url: `https://www.chordgen.org/key/${k.slug}`,
            type: 'article',
        },
        twitter: { card: 'summary_large_image', title: k.metaTitle, description: k.metaDescription },
    };
}

export default async function KeyPage({ params }: { params: Promise<Params> }) {
    const { key } = await params;
    const k = getKey(key);
    if (!k) notFound();

    const url = `https://www.chordgen.org/key/${k.slug}`;

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: k.metaTitle,
        description: k.metaDescription,
        image: 'https://www.chordgen.org/og-image.png',
        datePublished: '2026-04-24',
        dateModified: '2026-04-24',
        author: { '@type': 'Organization', name: 'ChordGen' },
        publisher: {
            '@type': 'Organization',
            name: 'ChordGen',
            logo: { '@type': 'ImageObject', url: 'https://www.chordgen.org/chordgen_logo.png' },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.chordgen.org' },
            { '@type': 'ListItem', position: 2, name: 'Chord Progressions by Key', item: 'https://www.chordgen.org/key' },
            { '@type': 'ListItem', position: 3, name: k.label, item: url },
        ],
    };

    const promptHref = `/app/results?q=${encodeURIComponent(k.promptSeed)}&n=4`;

    return (
        <div className="bg-gray-50 dark:bg-black">
            <article className="px-4 py-20">
                <div className="max-w-3xl mx-auto">
                    <nav className="text-sm text-gray-500 dark:text-gray-500 mb-6" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-primary">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/key" className="hover:text-primary">Chord Progressions by Key</Link>
                    </nav>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
                        Chord Progressions in {k.label}
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-12 font-medium leading-relaxed">
                        {k.intro}
                    </p>

                    <section className="mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            The diatonic chords of {k.label}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                            The seven chords built from the {k.label} scale.
                        </p>
                        <ChordRow chords={k.diatonicChords} />
                        <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
                            {k.diatonicRoman.map((r, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center justify-center min-w-14 h-6 text-xs font-medium text-gray-500 dark:text-gray-500 px-3"
                                >
                                    {r}
                                </span>
                            ))}
                        </div>
                    </section>

                    <section className="mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
                            Common progressions in {k.label}
                        </h2>
                        <div className="space-y-10">
                            {k.progressions.map((p) => (
                                <div key={p.name}>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        {p.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                                        {p.roman}
                                    </p>
                                    <div className="mb-3">
                                        <ChordRow chords={p.chords} />
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {p.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mb-16 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            Relative key
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {k.label} shares the same notes as its relative {k.quality === 'major' ? 'minor' : 'major'},{' '}
                            <Link href={`/key/${k.relativeKey.slug}`} className="text-primary hover:underline font-semibold">
                                {k.relativeKey.label}
                            </Link>
                            . You can borrow chords freely between the two.
                        </p>
                    </section>

                    <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-10 mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Generate progressions in {k.label}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            ChordGen builds custom progressions in any key. Just describe the mood — the AI handles the music theory.
                        </p>
                        <Button asChild size="lg" className="font-bold">
                            <Link href={promptHref}>
                                Generate {k.label} progressions <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>

                    <section className="border-t border-gray-200 dark:border-gray-800 pt-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Keep exploring
                        </h2>
                        <ul className="space-y-3 text-base">
                            <li>
                                <Link href={`/key/${k.relativeKey.slug}`} className="text-primary hover:underline">
                                    → Chord progressions in {k.relativeKey.label} (relative {k.quality === 'major' ? 'minor' : 'major'})
                                </Link>
                            </li>
                            <li>
                                <Link href="/key" className="text-primary hover:underline">
                                    → All keys
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog/common-chord-progressions-guide" className="text-primary hover:underline">
                                    → 12 common chord progressions every songwriter should know
                                </Link>
                            </li>
                        </ul>
                    </section>
                </div>
            </article>

            <Script
                id={`article-schema-${k.slug}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <Script
                id={`breadcrumb-schema-${k.slug}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </div>
    );
}
