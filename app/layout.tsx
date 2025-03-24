import "./globals.css";
import {Gloock} from "next/font/google";
import {Analytics} from '@vercel/analytics/next';
import { Metadata } from "next";
import React from "react";


const poppins = Gloock({subsets: ["latin"], weight: "400"});

export const metadata = {
    title: "ChordGen – Free AI Chord Generator",
    description: "Generate and edit chord progressions using AI. Download MIDI files for free.",
    icons: {
        icon: [
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
            { url: "/favicon.ico", type: "image/x-icon" },
        ],
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    authors: [{ name: "ChordGen Team" }], // Add author
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={poppins.className}>
        <main className="flex-grow">
            {children}
        </main>
        <Analytics/>
        <footer className="w-full text-center text-sm text-gray-500 dark:text-gray-400 p-8 space-y-6">

            {/* Short About Section with Keywords */}
            <div>
                <p>
                    <strong>ChordGen</strong> is a free AI-powered chord progression generator.
                    Describe the mood, style, or vibe you want, and ChordGen will instantly generate unique chord progressions tailored to your input.
                    Edit, rearrange, and download your chords as MIDI files for seamless integration into your music production workflow.
                </p>
                <p className="mt-2">
                    Whether you're a producer, songwriter, or composer, ChordGen helps spark creativity and speed up your songwriting process.
                </p>
            </div>

            {/* Internal Link (boosts SEO) */}
            <div>
                <a href="https://www.chordgen.org" className="underline" aria-label="ChordGen Free AI Chord Progression Generator">
                    Try ChordGen – Free AI Chord Progression Generator
                </a>
            </div>

            {/* SEO-Friendly FAQ Section */}
            <div className="text-left max-w-xl mx-auto mt-8">
                <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                    <div>
                        <strong>Is ChordGen free to use?</strong>
                        <p>Yes! ChordGen is 100% free. You can generate, edit, and download MIDI chord progressions without creating an account.</p>
                    </div>
                    <div>
                        <strong>Can I export the chords as MIDI files?</strong>
                        <p>Absolutely. Once you've generated or edited your chord progression, you can download it instantly as a standard MIDI file.</p>
                    </div>
                    <div>
                        <strong>How does ChordGen work?</strong>
                        <p>ChordGen uses advanced AI models to interpret your natural language input and create musically coherent chord progressions tailored to your request.</p>
                    </div>
                    <div>
                        <strong>Do I need musical knowledge to use ChordGen?</strong>
                        <p>No prior music theory knowledge is required. Simply describe the mood or style you want, and ChordGen handles the rest.</p>
                    </div>
                </div>
            </div>

        </footer>

        </body>
        </html>
    );
}
