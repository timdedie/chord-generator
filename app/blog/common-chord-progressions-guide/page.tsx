// app/blog/common-chord-progressions-guide/page.tsx

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CTA } from '@/components/blog/CTA';
import { ArticleHeader } from '@/components/blog/ArticleHeader';
import { posts } from '@/lib/blogData';

const slug = 'common-chord-progressions-guide';

export async function generateMetadata(): Promise<Metadata> {
    const post = posts.find(p => p.slug === slug);
    if (!post) { return { title: 'Post Not Found' }; }
    return {
        title: post.title,
        description: post.description,
        alternates: { canonical: `/blog/${slug}` },
        openGraph: {
            title: post.title,
            description: post.description,
            url: `/blog/${slug}`,
            type: 'article',
            publishedTime: post.date,
        },
        twitter: {
            title: post.title,
            description: post.description,
        }
    };
}

export default function CommonChordProgressionsPost() {
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

    return (
        <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-24">
            <ArticleHeader title={post.title} date={post.date} />
            <article className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                    Whether you're a beginner songwriter or a seasoned producer, understanding common chord progressions is the fastest way to create music that resonates. Certain sequences of chords appear again and again across genres because they simply work—they create emotion, drive movement, and feel satisfying to the ear.
                </p>
                <p>
                    In this complete guide, we'll explore the most popular chord progressions in music history, explain why they work, and show you how to use them in your own compositions. By the end, you'll have a toolkit of proven progressions ready to spark your next song.
                </p>

                <h2>Why Do Some Chord Progressions Work Better Than Others?</h2>
                <p>
                    Music theory tells us that chords have relationships based on the scale they're built from. In any major or minor key, each chord has a <strong>function</strong>—some chords feel stable (like "home"), while others create tension that wants to resolve.
                </p>
                <p>
                    The most effective chord progressions create a journey: they move away from stability, build tension, and then resolve back to a sense of rest. This is why certain patterns appear in countless hit songs—they tap into our natural expectations for how music should move.
                </p>

                <h2>Understanding Roman Numeral Notation</h2>
                <p>
                    Before we dive into specific progressions, let's quickly explain the notation system. Musicians use <strong>Roman numerals</strong> to describe chord progressions in a way that works in any key:
                </p>
                <ul>
                    <li><strong>I, IV, V</strong> (uppercase) = major chords</li>
                    <li><strong>ii, iii, vi</strong> (lowercase) = minor chords</li>
                    <li><strong>vii°</strong> = diminished chord</li>
                </ul>
                <p>
                    For example, in the key of C major:
                </p>
                <ul>
                    <li>I = C major</li>
                    <li>ii = D minor</li>
                    <li>iii = E minor</li>
                    <li>IV = F major</li>
                    <li>V = G major</li>
                    <li>vi = A minor</li>
                </ul>
                <p>
                    This system lets you transpose any progression to any key—a I-V-vi-IV progression could be C-G-Am-F in C major, or D-A-Bm-G in D major.
                </p>

                <h2>The 8 Most Common Chord Progressions</h2>

                <h3>1. I-V-vi-IV (The "Pop-Punk" Progression)</h3>
                <p><em>Example in C major: C - G - Am - F</em></p>
                <p>
                    This is arguably the most popular chord progression in modern pop music. You'll find it everywhere from "Let It Be" by The Beatles to "Don't Stop Believin'" by Journey to countless hits by Coldplay, Taylor Swift, and The Chainsmokers.
                </p>
                <p>
                    <strong>Why it works:</strong> It starts with stability (I), moves to the dominant (V), dips into a minor chord for emotional color (vi), then uses the subdominant (IV) to create forward motion back to I.
                </p>

                <h3>2. vi-IV-I-V (The Emotional Variation)</h3>
                <p><em>Example in C major: Am - F - C - G</em></p>
                <p>
                    This is the same four chords as above, but starting on the vi (minor) chord creates a completely different emotional feel. It sounds more introspective and melancholic. Used in songs like "Apologize" by OneRepublic and "Counting Stars" by OneRepublic.
                </p>
                <p>
                    <strong>Why it works:</strong> Starting on a minor chord immediately establishes a more vulnerable, emotional tone.
                </p>

                <h3>3. I-IV-V (The Classic Rock Foundation)</h3>
                <p><em>Example in C major: C - F - G</em></p>
                <p>
                    The backbone of rock and roll, blues, and country music. This three-chord progression powered early rock classics like "Twist and Shout," "La Bamba," and "Wild Thing."
                </p>
                <p>
                    <strong>Why it works:</strong> These are the three most important chords in any key—the tonic (home), subdominant (preparation), and dominant (tension that wants to resolve home).
                </p>

                <h3>4. ii-V-I (The Jazz Standard)</h3>
                <p><em>Example in C major: Dm7 - G7 - Cmaj7</em></p>
                <p>
                    This is the foundation of jazz harmony. Nearly every jazz standard uses this progression multiple times, often with extensions and alterations (like Dm9, G13b9, Cmaj7#11).
                </p>
                <p>
                    <strong>Why it works:</strong> The ii chord sets up the V, which creates strong tension that resolves beautifully to I. It's the smoothest, most natural-sounding resolution in Western music.
                </p>

                <h3>5. I-vi-IV-V (The "50s" Progression)</h3>
                <p><em>Example in C major: C - Am - F - G</em></p>
                <p>
                    Also called the "doo-wop" progression, this sequence defined 1950s and early 60s pop music. Think "Stand By Me," "Blue Moon," and "Every Breath You Take" by The Police.
                </p>
                <p>
                    <strong>Why it works:</strong> The vi (relative minor) adds emotional depth while maintaining a sense of forward momentum through IV and V.
                </p>

                <h3>6. I-V-vi-iii-IV-I-IV-V (The "Canon" Progression)</h3>
                <p><em>Example in C major: C - G - Am - Em - F - C - F - G</em></p>
                <p>
                    Based on Pachelbel's Canon in D, this eight-chord sequence has been used in countless songs including "Basket Case" by Green Day and "Hook" by Blues Traveler. It's one of the most satisfying progressions in music.
                </p>
                <p>
                    <strong>Why it works:</strong> It creates a complete harmonic journey with smooth voice leading between chords.
                </p>

                <h3>7. i-VII-VI-VII (The Minor Epic)</h3>
                <p><em>Example in A minor: Am - G - F - G</em></p>
                <p>
                    This minor-key progression has a powerful, cinematic quality. Used in songs like "Stairway to Heaven" (verse) and "All Along the Watchtower."
                </p>
                <p>
                    <strong>Why it works:</strong> The descending motion from i to VII to VI feels like a grand statement, while the return to VII creates compelling tension.
                </p>

                <h3>8. I-bVII-IV (The Modal Rock Progression)</h3>
                <p><em>Example in C major: C - Bb - F</em></p>
                <p>
                    This progression "borrows" the bVII chord from the parallel minor key, creating a more ambiguous, modern sound. Found in countless alternative rock songs and EDM tracks.
                </p>
                <p>
                    <strong>Why it works:</strong> The bVII chord adds an unexpected color that sounds fresh while maintaining a strong sense of tonality.
                </p>

                <CTA />

                <h2>How to Use These Progressions in Your Music</h2>
                <p>
                    Now that you know these foundational progressions, here's how to put them to work:
                </p>

                <h3>1. Start with a Proven Pattern</h3>
                <p>
                    Choose one of the progressions above and try it in different keys. Use an <Link href="/"><strong>AI chord generator</strong></Link> to quickly hear how each progression sounds in different keys and with different voicings.
                </p>

                <h3>2. Add Your Own Twist</h3>
                <p>
                    Don't just copy—make it yours! Try these variations:
                </p>
                <ul>
                    <li><strong>Change the rhythm:</strong> Vary how long you hold each chord</li>
                    <li><strong>Add extensions:</strong> Turn major chords into maj7, minor chords into m9</li>
                    <li><strong>Substitute chords:</strong> Replace a IV with a ii, or a V with a iii</li>
                    <li><strong>Change one chord:</strong> Replace just one chord in the progression with something unexpected</li>
                </ul>

                <h3>3. Combine Progressions</h3>
                <p>
                    Use one progression for your verse and another for your chorus. For example, a melancholic vi-IV-I-V in the verse could build into a powerful I-V-vi-IV in the chorus.
                </p>

                <h3>4. Experiment with Different Genres</h3>
                <p>
                    Take a pop progression and play it with jazz voicings. Or take a jazz ii-V-I and play it with distorted guitar. The same chord progression can create completely different vibes depending on instrumentation and rhythm.
                </p>

                <h2>Beyond the Basics: Creating Unique Progressions</h2>
                <p>
                    Once you've mastered these common progressions, you can start breaking the rules:
                </p>
                <ul>
                    <li><strong>Modal interchange:</strong> Borrow chords from parallel modes</li>
                    <li><strong>Secondary dominants:</strong> Add V/V or V/vi chords for more tension</li>
                    <li><strong>Chromatic movement:</strong> Move chords up or down by half steps</li>
                    <li><strong>Unexpected resolutions:</strong> Set up a V chord but resolve to vi instead of I (called a "deceptive cadence")</li>
                </ul>
                <p>
                    But remember: you need to know the rules before you can break them effectively. Master these eight progressions first, and you'll have a solid foundation for any musical style.
                </p>

                <h2>Practice Makes Perfect</h2>
                <p>
                    The best way to internalize these progressions is to <strong>hear them in action</strong>. Try each progression in multiple keys, listen for them in your favorite songs, and experiment with variations.
                </p>
                <p>
                    Using a <Link href="/"><strong>chord progression generator</strong></Link> is one of the fastest ways to explore these patterns. You can instantly hear how they sound with different voicings, see them visualized on a piano keyboard, and export them as MIDI files to use in your productions.
                </p>

                <h2>Conclusion: Your Chord Progression Toolkit</h2>
                <p>
                    These eight chord progressions form the backbone of Western popular music. They work because they create emotional journeys—they build tension and provide release in ways that feel natural and satisfying to listeners.
                </p>
                <p>
                    But remember: knowing these progressions isn't about copying them note-for-note. It's about understanding the <em>why</em> behind them so you can create your own unique progressions that follow similar principles.
                </p>
                <p>
                    Start with these proven patterns, experiment with variations, and trust your ears. The best chord progression for your song is the one that serves your melody and message—and now you have the theory to make informed creative decisions.
                </p>
                <p>
                    Ready to start experimenting? Try each of these progressions using <Link href="/"><strong>ChordGen's AI-powered generator</strong></Link>. Generate progressions in any style, see them visualized on piano, and download MIDI files to use in your DAW. The perfect progression for your next song is just a prompt away.
                </p>
            </article>
        </div>
    );
}
