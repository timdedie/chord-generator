// app/blog/free-online-piano-chord-generator/page.tsx (The New, Correct Version)

// NO 'use client' HERE! This is now a Server Component.

import React from 'react';
import type { Metadata } from 'next';
import { CTA } from '@/components/blog/CTA';
import { ArticleHeader } from '@/components/blog/ArticleHeader';
import { posts } from '@/lib/blogData';

// --- START: NEW METADATA FUNCTION ---
const slug = 'free-online-piano-chord-generator';

// This function runs on the server to generate metadata for this specific page
export async function generateMetadata(): Promise<Metadata> {
    const post = posts.find(p => p.slug === slug);

    if (!post) {
        return { title: 'Post Not Found' };
    }

    return {
        title: post.title,
        description: "Discover how a free online piano chord generator can help you create beautiful chord progressions, learn music theory, and conquer writer's block.",
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            title: post.title,
            description: "Discover how a free online piano chord generator can help you create beautiful chord progressions, learn music theory, and conquer writer's block.",
            url: `/blog/${slug}`,
            type: 'article',
            publishedTime: post.date,
        },
        twitter: {
            title: post.title,
            description: "Discover how a free online piano chord generator can help you create beautiful chord progressions, learn music theory, and conquer writer's block.",
        }
    };
}
// --- END: NEW METADATA FUNCTION ---


// This is the React component for your page. It runs on the server.
export default function PianoChordGeneratorPost() {
    const post = posts.find(p => p.slug === slug);

    if (!post) {
        return (
            <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-24 text-center">
                <h1 className="text-2xl font-bold">Post Not Found</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Sorry, we couldn't find the article you were looking for.
                </p>
            </div>
        );
    }

    // The rest of your component is exactly the same!
    return (
        <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-24">
            <ArticleHeader title={post.title} date={post.date} />
            <article className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                    Have you ever sat down at a piano or keyboard, full of ideas, but struggled to find the right chords to bring them to life? Music theory can be intimidating, and building a compelling chord progression from scratch is a real challenge.
                </p>
                <blockquote>
                    What if you could have a free, intelligent <strong>piano chord generator</strong> right in your browser? A tool that not only creates beautiful progressions but also shows you how to play them. Welcome to the future of songwriting with ChordGen.
                </blockquote>
                <h2>What is an AI Chord Progression Generator?</h2>
                <p>
                    An <strong>AI chord progression generator</strong> is a smart tool that helps you create sequences of chords instantly. Unlike a simple random chord generator, an AI-powered tool like ChordGen understands music theory. You can give it a prompt—like "sad lofi piano" or "uplifting movie score"—and it will generate a harmonically rich progression that fits the mood. It's the ultimate chord builder for musicians of all skill levels.
                </p>
                <h2>The 5-Step Guide to Creating Piano Chords Online (for Free!)</h2>
                <p>
                    Our free <strong>chord maker</strong> is designed to be intuitive. Here’s how you can go from a simple idea to a full piano chord progression in under a minute.
                </p>
                <h3>Step 1: Describe the Mood</h3>
                <p>
                    Start by typing a description of the music you want to create into the prompt box. Don't be shy! The more descriptive you are, the better the result. Try things like:
                </p>
                <ul>
                    <li>"Dreamy and melancholic piano chords"</li>
                    <li>"Upbeat 90s house progression"</li>
                    <li>"Dark, tense cinematic chords"</li>
                    <li>"Simple, happy folk progression"</li>
                </ul>
                <h3>Step 2: Generate with AI</h3>
                <p>
                    Click the generate button and let the <strong>AI chord generator</strong> do its work. In seconds, it will analyze your prompt and craft a unique chord sequence. You'll instantly see the chord names (like Cmaj7, G, Am, F) and hear them played back.
                </p>
                <h3>Step 3: See and Learn on the Virtual Piano</h3>
                <p>
                    This is where our <strong>online piano chord generator</strong> truly shines. As the progression plays, you'll see the exact notes highlighted on a virtual keyboard. This is an incredible way to learn new voicings and understand the structure of chords visually, making it a powerful learning tool.
                </p>
                <h3>Step 4: Customize Your Progression</h3>
                <p>
                    The AI gives you a fantastic starting point, but you are always in control. You can easily rearrange the chords, delete ones you don't like, or change their timing. This flexibility makes it more than a generator; it's a true <strong>chord creator</strong>.
                </p>
                <h3>Step 5: Download the MIDI File</h3>
                <p>
                    Once you're happy with your progression, just click "Download MIDI." You can drag this file directly into any music software (like Ableton Live, FL Studio, or Logic Pro) and assign your favorite piano sound to it. Your song's foundation is now built.
                </p>
                <CTA />
                <h2>Why This is a Game-Changer for Songwriters</h2>
                <ul>
                    <li><strong>It's Free and Accessible:</strong> No downloads, no installations. Our chord maker works entirely online, for free.</li>
                    <li><strong>Conquer Writer's Block:</strong> Never stare at a blank project again. Generate endless ideas whenever you feel stuck.</li>
                    <li><strong>Learn Music Theory Passively:</strong> By seeing and hearing how chords are constructed, you'll absorb music theory concepts without tedious study.</li>
                    <li><strong>Accelerate Your Workflow:</strong> Spend less time clicking in notes and more time being creative with melodies, sound design, and arrangement.</li>
                </ul>
                <p>
                    Whether you're a complete beginner who wants to learn piano chords or a seasoned producer looking for a spark of inspiration, an <strong>AI chord progression generator</strong> is the most powerful tool you can add to your creative arsenal.
                </p>
            </article>
        </div>
    );
}