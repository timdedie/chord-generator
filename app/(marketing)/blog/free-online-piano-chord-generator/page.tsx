import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import { ArrowRight, Piano, Download, Edit3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChordRow } from '@/components/ChordChip';

const title = 'Free Online Piano Chord Generator: How ChordGen Works';
const description =
    'A walkthrough of ChordGen — a free online piano chord generator that turns text prompts into chord progressions you can play, edit, and download as MIDI.';
const url = 'https://www.chordgen.org/blog/free-online-piano-chord-generator';
const datePublished = '2026-04-24';

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: '/blog/free-online-piano-chord-generator' },
    openGraph: { title, description, url, type: 'article', publishedTime: datePublished },
    twitter: { card: 'summary_large_image', title, description },
};

const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: 'https://www.chordgen.org/og-image.png',
    datePublished,
    dateModified: datePublished,
    author: { '@type': 'Organization', name: 'ChordGen', url: 'https://www.chordgen.org' },
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
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.chordgen.org/blog' },
        { '@type': 'ListItem', position: 3, name: 'Free Online Piano Chord Generator', item: url },
    ],
};

const features = [
    {
        Icon: Sparkles,
        title: 'Text-to-chords',
        body: 'Describe a mood — "melancholic jazz", "upbeat summer pop", "lo-fi beat" — and ChordGen interprets it musically. No theory knowledge required.',
    },
    {
        Icon: Piano,
        title: 'Interactive piano preview',
        body: 'Every generated chord renders on a playable piano keyboard. Click a chord to hear it; play through the progression with one button.',
    },
    {
        Icon: Edit3,
        title: 'Edit, drag, and reorder',
        body: 'Don\'t love a chord? Replace it. Want to swap the bridge order? Drag and drop. The piano updates in real time.',
    },
    {
        Icon: Download,
        title: 'Free MIDI export',
        body: 'Download your progression as a standard MIDI file and drop it into Ableton, Logic, FL Studio, GarageBand, or any other DAW.',
    },
];

export default function FreeOnlinePianoChordGenerator() {
    return (
        <div className="bg-gray-50 dark:bg-black">
            <article className="px-4 py-20">
                <div className="max-w-3xl mx-auto">
                    <nav className="text-sm text-gray-500 dark:text-gray-500 mb-6" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-primary">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/blog" className="hover:text-primary">Blog</Link>
                    </nav>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
                        Free Online Piano Chord Generator
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-12 font-medium leading-relaxed">
                        ChordGen is a free piano chord generator that runs entirely in your browser. Type what you
                        want, get chord progressions you can hear, edit, and download. No account, no install, no fees.
                    </p>

                    <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
                        <p>
                            Most &ldquo;chord generators&rdquo; online ask you to pick a key, a scale, and a mode, then spit out a
                            random sequence of chords from that scale. That works if you already know what you want.
                            If you don&apos;t — if you only know that you&apos;re after something <em>warm</em>, or
                            <em> melancholic</em>, or <em>like that one Frank Ocean track</em> — you&apos;re stuck.
                        </p>
                        <p>
                            ChordGen takes a different approach. You describe the music in words, and an AI translates
                            that description into musically coherent chord progressions. Every chord is validated
                            against music theory rules before it reaches you, so you never get nonsense like a &ldquo;Cm5b♯&rdquo;.
                        </p>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-8">
                        What it does
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                    <f.Icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {f.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {f.body}
                                </p>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Try a generated progression
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        Here&apos;s what you might get from a prompt like <em>&ldquo;warm Sunday-morning piano in C major&rdquo;</em>:
                    </p>
                    <div className="mb-12 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <ChordRow chords={['Cmaj7', 'Em7', 'Fmaj7', 'G7sus4']} large />
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                            A diatonic progression in C major with a suspended dominant — the kind of harmonic
                            cushion you&apos;d hear in a Norah Jones or Bill Withers track.
                        </p>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        How it compares to other tools
                    </h2>
                    <div className="prose prose-lg dark:prose-invert max-w-none mb-16">
                        <ul>
                            <li>
                                <strong>vs. random chord generators:</strong> ChordGen produces music that means
                                something, not random output filtered by scale.
                            </li>
                            <li>
                                <strong>vs. DAW chord plugins:</strong> works in any browser, no install, exports MIDI
                                you can use in any DAW including the one you already have.
                            </li>
                            <li>
                                <strong>vs. generative music apps:</strong> ChordGen gives you editable, exportable
                                building blocks, not finished tracks. You stay in control of arrangement and sound design.
                            </li>
                        </ul>
                    </div>

                    <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-10 mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Try ChordGen free
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            No account, no sign-up, no payment ever. Generate as many progressions as you want and
                            download every one as MIDI.
                        </p>
                        <Button asChild size="lg" className="font-bold">
                            <Link href="/app">
                                Open the chord generator <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>

                    <section className="border-t border-gray-200 dark:border-gray-800 pt-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Read next
                        </h2>
                        <ul className="space-y-3 text-base">
                            <li>
                                <Link href="/blog/common-chord-progressions-guide" className="text-primary hover:underline">
                                    → 12 chord progressions every songwriter should know
                                </Link>
                            </li>
                            <li>
                                <Link href="/chords/lo-fi" className="text-primary hover:underline">
                                    → Lo-fi chord progressions
                                </Link>
                            </li>
                            <li>
                                <Link href="/chords/jazz" className="text-primary hover:underline">
                                    → Jazz chord progressions
                                </Link>
                            </li>
                        </ul>
                    </section>
                </div>
            </article>

            <Script
                id="article-schema-piano"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <Script
                id="breadcrumb-schema-piano"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </div>
    );
}
