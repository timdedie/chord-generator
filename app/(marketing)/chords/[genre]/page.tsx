import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChordRow } from '@/components/ChordChip';
import { genres, getGenre } from '@/lib/seoContent';

type Params = { genre: string };

export function generateStaticParams(): Params[] {
    return genres.map((g) => ({ genre: g.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
    const { genre } = await params;
    const g = getGenre(genre);
    if (!g) return {};
    return {
        title: g.metaTitle,
        description: g.metaDescription,
        alternates: { canonical: `/chords/${g.slug}` },
        openGraph: {
            title: g.metaTitle,
            description: g.metaDescription,
            url: `https://www.chordgen.org/chords/${g.slug}`,
            type: 'article',
        },
        twitter: { card: 'summary_large_image', title: g.metaTitle, description: g.metaDescription },
    };
}

export default async function GenrePage({ params }: { params: Promise<Params> }) {
    const { genre } = await params;
    const g = getGenre(genre);
    if (!g) notFound();

    const url = `https://www.chordgen.org/chords/${g.slug}`;

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: g.metaTitle,
        description: g.metaDescription,
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
            { '@type': 'ListItem', position: 2, name: 'Chords by Genre', item: 'https://www.chordgen.org/chords' },
            { '@type': 'ListItem', position: 3, name: g.title, item: url },
        ],
    };

    const promptHref = `/app/results?q=${encodeURIComponent(g.promptSeed)}&n=4`;

    return (
        <div className="bg-gray-50 dark:bg-black">
            <article className="px-4 py-20">
                <div className="max-w-3xl mx-auto">
                    <nav className="text-sm text-gray-500 dark:text-gray-500 mb-6" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-primary">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/chords" className="hover:text-primary">Chords by Genre</Link>
                    </nav>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
                        {g.title}
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-12 font-medium leading-relaxed">
                        {g.intro}
                    </p>

                    <section className="mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Defining characteristics
                        </h2>
                        <ul className="space-y-2">
                            {g.characteristics.map((c) => (
                                <li
                                    key={c}
                                    className="flex gap-3 text-gray-600 dark:text-gray-400 leading-relaxed"
                                >
                                    <span className="text-primary font-bold flex-shrink-0">→</span>
                                    <span>{c}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
                            Example progressions
                        </h2>
                        <div className="space-y-10">
                            {g.progressions.map((p) => (
                                <div key={p.name}>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        {p.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                                        {p.roman} &middot; {p.key}
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

                    {g.examples.length > 0 && (
                        <section className="mb-16">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                Songs in this style
                            </h2>
                            <div className="space-y-3">
                                {g.examples.map((e) => (
                                    <div
                                        key={e.song}
                                        className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                                    >
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {e.song} &mdash; <span className="font-normal text-gray-600 dark:text-gray-400">{e.artist}</span>
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                                            {e.progression}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-10 mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Generate your own {g.title.toLowerCase()}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            ChordGen produces unlimited variations in any key, with free MIDI export to your DAW.
                        </p>
                        <Button asChild size="lg" className="font-bold">
                            <Link href={promptHref}>
                                Generate {g.slug.replace('-', ' ')} progressions <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>

                    <section className="border-t border-gray-200 dark:border-gray-800 pt-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Related genres
                        </h2>
                        <ul className="space-y-3 text-base">
                            {g.relatedGenres
                                .map((slug) => getGenre(slug))
                                .filter((x): x is NonNullable<typeof x> => Boolean(x))
                                .map((rel) => (
                                    <li key={rel.slug}>
                                        <Link href={`/chords/${rel.slug}`} className="text-primary hover:underline">
                                            → {rel.title}
                                        </Link>
                                    </li>
                                ))}
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
                id={`article-schema-${g.slug}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <Script
                id={`breadcrumb-schema-${g.slug}`}
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </div>
    );
}
