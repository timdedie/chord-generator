import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChordRow } from '@/components/ChordChip';

const title = 'Common Chord Progressions: 12 Patterns Every Songwriter Should Know';
const description =
    'The 12 chord progressions used in thousands of songs — I–V–vi–IV, ii–V–I, the 50s progression, the Andalusian cadence, and more. Examples, songs, and free MIDI.';
const url = 'https://www.chordgen.org/blog/common-chord-progressions-guide';
const datePublished = '2026-04-24';

export const metadata: Metadata = {
    title,
    description,
    alternates: { canonical: '/blog/common-chord-progressions-guide' },
    openGraph: {
        title,
        description,
        url,
        type: 'article',
        publishedTime: datePublished,
    },
    twitter: {
        card: 'summary_large_image',
        title,
        description,
    },
};

const progressions = [
    {
        name: 'I – V – vi – IV (the "axis" progression)',
        chords: ['C', 'G', 'Am', 'F'],
        key: 'C major',
        body: 'The most-used four-chord progression in popular music. Found in "Let It Be," "Don\'t Stop Believin\'," "With or Without You," "No Woman No Cry," and thousands more. The lift from V to vi is what makes it irresistible — a strong tonic resolution defused by an unexpected minor chord.',
    },
    {
        name: 'vi – IV – I – V (the "sad pop" rotation)',
        chords: ['Am', 'F', 'C', 'G'],
        key: 'C major',
        body: 'Same chords as the axis, started on the vi. The minor opening makes it feel reflective and bittersweet rather than triumphant. "Apologize" by OneRepublic, "Numb" by Linkin Park, "Despacito" — all sit on this rotation.',
    },
    {
        name: 'I – vi – IV – V (the 50s progression)',
        chords: ['C', 'Am', 'F', 'G'],
        key: 'C major',
        body: 'The doo-wop progression. "Stand By Me," "Earth Angel," "Heart and Soul" — comforting and instantly recognizable. Modern uses include "Beautiful Girls" by Sean Kingston and "Crocodile Rock" by Elton John.',
    },
    {
        name: 'ii – V – I (the jazz cadence)',
        chords: ['Dm7', 'G7', 'Cmaj7'],
        key: 'C major',
        body: 'The single most important cadence in jazz. The ii sets up the dominant V; the V resolves to I with maximum harmonic gravity. Every standard uses it, often dozens of times. In pop it appears in "Sunday Morning" by Maroon 5 and "Just the Two of Us" by Bill Withers.',
    },
    {
        name: 'I – IV – V (the three-chord trick)',
        chords: ['G', 'C', 'D'],
        key: 'G major',
        body: 'The bedrock of blues, country, folk, and rock and roll. "Twist and Shout," "La Bamba," "Wild Thing" — three chords and the truth. If you only learn one progression, learn this.',
    },
    {
        name: 'i – ♭VI – ♭III – ♭VII (the epic minor cycle)',
        chords: ['Am', 'F', 'C', 'G'],
        key: 'A minor',
        body: 'The "Inception" progression. Used by Hans Zimmer in film, by Avicii in EDM, by Toto in "Africa." Same chords as the pop axis, but heard as starting on the relative minor — the emotional weight shifts entirely.',
    },
    {
        name: 'i – iv – V (the harmonic minor cadence)',
        chords: ['Am', 'Dm', 'E'],
        key: 'A minor',
        body: 'A minor key with a major V — the V borrowed from the harmonic minor scale. Used in classical music, metal, and middle-eastern-flavored pop. The leading tone in the V chord makes the resolution to i feel inevitable.',
    },
    {
        name: 'i – ♭VII – ♭VI – V (the Andalusian cadence)',
        chords: ['Am', 'G', 'F', 'E'],
        key: 'A minor',
        body: 'A descending bass line that walks down the minor tetrachord. Heard in flamenco, surf rock ("Misirlou"), and hundreds of metal tracks. "Hit the Road Jack" is a famous pop example.',
    },
    {
        name: 'I – V – IV – I (the country / gospel turnaround)',
        chords: ['G', 'D', 'C', 'G'],
        key: 'G major',
        body: 'Less common in modern pop but everywhere in country, gospel, and bluegrass. The IV resolves directly back to I instead of going through V — a "plagal" cadence with a softer, more conclusive feel.',
    },
    {
        name: 'I – ♭VII – IV (the Mixolydian rock pattern)',
        chords: ['D', 'C', 'G'],
        key: 'D Mixolydian',
        body: 'The ♭VII chord is borrowed from the Mixolydian mode (the major scale with a flatted 7th). Used in "Sweet Home Alabama," "Sympathy for the Devil," "Royals" by Lorde. Instantly evokes 70s rock.',
    },
    {
        name: 'I – iii – IV – V (the Doris Day variant)',
        chords: ['C', 'Em', 'F', 'G'],
        key: 'C major',
        body: 'The iii minor in second position adds gentle melancholy without breaking the I–IV–V backbone. Used in "Que Sera Sera," "Lean on Me," and many show tunes.',
    },
    {
        name: 'imaj7 – IVmaj7 – iim7 – V7 (the bossa nova cycle)',
        chords: ['Cmaj7', 'Fmaj7', 'Dm7', 'G7'],
        key: 'C major',
        body: 'Jobim\'s harmonic vocabulary in miniature. The maj7 voicings give it a smooth, hovering quality; the ii–V at the end pulls back to the I to restart the cycle. "The Girl from Ipanema" lives in this territory.',
    },
];

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
        { '@type': 'ListItem', position: 3, name: 'Common Chord Progressions Guide', item: url },
    ],
};

export default function CommonChordProgressionsGuide() {
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
                        Common Chord Progressions: 12 Patterns Every Songwriter Should Know
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-12 font-medium leading-relaxed">
                        Almost all popular music sits on a small set of chord progressions. Learn these 12 patterns
                        and you can play, recognize, or compose the harmonic backbone of thousands of songs.
                    </p>

                    <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
                        <p>
                            A chord progression is just a sequence of chords played in order. What makes some
                            progressions feel inevitable — what makes &ldquo;Let It Be&rdquo; sound like Let It Be — is the
                            relationship between those chords and the key they sit in. The 12 patterns below show
                            up across decades, genres, and continents. They are the vocabulary of popular music.
                        </p>
                        <p>
                            All examples are written in C major or A minor for readability, but progressions
                            transpose freely. Every example has a free MIDI download once you generate it inside
                            ChordGen — try the prompts at the bottom of each section.
                        </p>
                    </div>

                    <div className="space-y-12 mb-16">
                        {progressions.map((p, idx) => (
                            <section key={p.name}>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {idx + 1}. {p.name}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-500 mb-5">
                                    Key of {p.key}
                                </p>
                                <div className="mb-5">
                                    <ChordRow chords={p.chords} large />
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {p.body}
                                </p>
                            </section>
                        ))}
                    </div>

                    <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-10 mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Try any progression in any key
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                            ChordGen generates these progressions (and thousands more) in any key and any mood.
                            Type a prompt, preview on a piano, download as MIDI.
                        </p>
                        <Button asChild size="lg" className="font-bold">
                            <Link href="/app">
                                Generate progressions <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>

                    <section className="border-t border-gray-200 dark:border-gray-800 pt-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Keep exploring
                        </h2>
                        <ul className="space-y-3 text-base">
                            <li>
                                <Link href="/chords/jazz" className="text-primary hover:underline">
                                    → Jazz chord progressions: ii–V–I and beyond
                                </Link>
                            </li>
                            <li>
                                <Link href="/chords/pop" className="text-primary hover:underline">
                                    → Pop chord progressions and the axis of awesome
                                </Link>
                            </li>
                            <li>
                                <Link href="/chords/lo-fi" className="text-primary hover:underline">
                                    → Lo-fi chord progressions and jazz voicings
                                </Link>
                            </li>
                            <li>
                                <Link href="/key/c-major" className="text-primary hover:underline">
                                    → Every chord progression in C major
                                </Link>
                            </li>
                            <li>
                                <Link href="/key/a-minor" className="text-primary hover:underline">
                                    → Every chord progression in A minor
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog/free-online-piano-chord-generator" className="text-primary hover:underline">
                                    → How ChordGen works as a free piano chord generator
                                </Link>
                            </li>
                        </ul>
                    </section>
                </div>
            </article>

            <Script
                id="article-schema-common"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <Script
                id="breadcrumb-schema-common"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </div>
    );
}
