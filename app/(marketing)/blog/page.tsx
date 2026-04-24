import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Blog: Guides & References for Chord Progressions',
    description:
        'Guides, references, and tutorials on chord progressions, music theory, and AI-assisted songwriting from the team at ChordGen.',
    alternates: { canonical: '/blog' },
};

const posts = [
    {
        slug: 'common-chord-progressions-guide',
        title: 'Common Chord Progressions: The Complete Guide',
        excerpt:
            'The 12 chord progressions every songwriter should know — from I–V–vi–IV to ii–V–I — with examples, songs, and free MIDI in every key.',
        readTime: '12 min read',
    },
    {
        slug: 'free-online-piano-chord-generator',
        title: 'Free Online Piano Chord Generator: How ChordGen Works',
        excerpt:
            'A walkthrough of how to use ChordGen as a free online piano chord generator — generate progressions from a text prompt, preview on a keyboard, export MIDI.',
        readTime: '6 min read',
    },
];

export default function BlogIndex() {
    return (
        <div className="bg-gray-50 dark:bg-black">
            <section className="px-4 pt-20 pb-12 sm:pt-28">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6">
                        The ChordGen Blog
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400">
                        Guides, references, and tutorials on chord progressions, music theory, and AI-assisted songwriting.
                    </p>
                </div>
            </section>

            <section className="px-4 pb-24">
                <div className="max-w-3xl mx-auto space-y-6">
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="block group p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors">
                                {post.title}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                                <span>{post.readTime}</span>
                                <span aria-hidden>·</span>
                                <span className="inline-flex items-center gap-1">
                                    Read more <ArrowRight className="h-4 w-4" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
