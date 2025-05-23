// app/layout.tsx
import "./globals.css";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import React from "react";
import {
    Lock,
    MoveHorizontal,
    Plus,
    RefreshCw,
    X,
    PlayCircle,
    Download,
    Piano as PianoIcon
} from "lucide-react";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-outfit",
    display: "swap",
});

// JSON-LD Schemas (keeping them as they are)
const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ChordGen",
    url: "https://www.chordgen.org",
    description:
        "Generate unique chord progressions with AI using natural language input. Free to use. Edit and download chords as MIDI files.",
    applicationCategory: "MusicApplication",
    operatingSystem: "ALL",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    image: "https://www.chordgen.org/chordgen_logo.png",
};

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
        {
            "@type": "Question",
            name: "Is ChordGen free to use?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes! ChordGen is 100% free. You can generate, edit, and download MIDI chord progressions without creating an account.",
            },
        },
        {
            "@type": "Question",
            name: "Can I export the chords as MIDI files?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Absolutely. Once you've generated or edited your chord progression, you can download it instantly as a standard MIDI file.",
            },
        },
        {
            "@type": "Question",
            name: "How does ChordGen work?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "ChordGen uses advanced AI models to interpret your natural language input and create musically coherent chord progressions tailored to your request.",
            },
        },
        {
            "@type": "Question",
            name: "Do I need musical knowledge to use ChordGen?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "No prior music theory knowledge is required. Simply describe the mood or style you want, and ChordGen handles the rest.",
            },
        },
    ],
};

const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Use ChordGen",
    description:
        "Learn how to generate, play, lock, rearrange, and download chords using ChordGen.",
    step: [
        {
            "@type": "HowToStep",
            name: "Generating Progressions",
            text: "Enter a description (e.g., 'happy jazz in C major') and click refresh to generate a new progression."
        },
        {
            "@type": "HowToStep",
            name: "Playing Chords",
            text: "Click a chord to hear it played on the piano."
        },
        {
            "@type": "HowToStep",
            name: "Locking Chords",
            text: "Hover and lock a chord to keep it during generation."
        },
        {
            "@type": "HowToStep",
            name: "Rearranging Chords",
            text: "Hover to see the move icon, then drag to rearrange."
        },
        {
            "@type": "HowToStep",
            name: "Adding Chords",
            text: "Hover between chords and click the plus button to add a new chord."
        },
        {
            "@type": "HowToStep",
            name: "Removing Chords",
            text: "Hover over a chord and click X to remove it."
        },
        {
            "@type": "HowToStep",
            name: "Downloading MIDI",
            text: "Download your chord progression as a MIDI file."
        },
        {
            "@type": "HowToStep",
            name: "Piano Interface",
            text: "Highlights notes as chords play. You can also play manually on the piano."
        }
    ]
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <head>
            {/* Primary Title & Description */}
            <title>ChordGen – Free AI Chord Generator & MIDI Export Tool</title>
            <meta
                name="description"
                content="Generate unique chord progressions instantly using natural language with ChordGen. Free to use! Edit chords, rearrange them, and download MIDI files."
            />
            <meta name="author" content="ChordGen Team" />
            <meta
                name="keywords"
                content="Free AI chord generator, MIDI chord download, music composition tool"
            />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://www.chordgen.org" />

            {/* Favicon / Manifest / Icons */}
            <link
                rel="icon"
                href="/favicon-16x16.png"
                type="image/png"
                sizes="16x16"
            />
            <link
                rel="icon"
                href="/favicon-32x32.png"
                type="image/png"
                sizes="32x32"
            />
            <link rel="icon" href="/favicon.ico" type="image/x-icon" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/site.webmanifest" />

            {/* Open Graph */}
            <meta property="og:title" content="ChordGen – Free AI Chord Generator" />
            <meta
                property="og:description"
                content="Create and customize chord progressions using AI. Completely free!"
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.chordgen.org" />
            <meta
                property="og:image"
                content="https://www.chordgen.org/chordgen_logo.png"
            />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta
                name="twitter:title"
                content="ChordGen – Free AI Chord Generator"
            />
            <meta
                name="twitter:description"
                content="Generate chord progressions using AI. 100% free!"
            />
            <meta
                name="twitter:image"
                content="https://www.chordgen.org/chordgen_logo.png"
            />

            {/* JSON-LD: WebApp */}
            <Script
                id="webapp-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(webAppSchema),
                }}
            />
            {/* JSON-LD: FAQ */}
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema),
                }}
            />
            {/* JSON-LD: HowTo */}
            <Script
                id="howto-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(howToSchema),
                }}
            />
        </head>
        <body className={outfit.className}>
        <main className="flex-grow">{children}</main>
        <Analytics />
        <footer className="w-full text-center text-sm text-gray-500 dark:text-gray-400 p-8 space-y-6">
            {/* ... existing footer content ... */}
            <div>
                <p>
                    <strong>ChordGen</strong> is a free AI-powered chord progression
                    generator. Describe the mood, style, or vibe you want, and ChordGen
                    will instantly generate unique chord progressions tailored to your input.
                    Edit, rearrange, and download your chords as MIDI files for seamless
                    integration into your music production workflow.
                </p>
                <p className="mt-2">
                    Whether you're a producer, songwriter, or composer, ChordGen helps
                    spark creativity and speed up your songwriting process.
                </p>
            </div>

            <div>
                <a
                    href="https://www.chordgen.org"
                    className="underline"
                    aria-label="ChordGen Free AI Chord Progression Generator"
                >
                    Try ChordGen – Free AI Chord Progression Generator
                </a>
            </div>
            <div className="text-left max-w-xl mx-auto mt-8 space-y-6">
                <h3 className="font-semibold mb-4">How it works</h3>
                <div className="space-y-4">
                    <div>
                        <strong className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 opacity-75" />
                            Generating Progressions
                        </strong>
                        <p>Enter a description (e.g., “happy jazz in C major”) and click refresh to generate a new progression.</p>
                    </div>

                    <div>
                        <strong className="flex items-center gap-2">
                            <PlayCircle className="h-5 w-5 opacity-75" />
                            Playing Chords
                        </strong>
                        <p>Click a chord to hear it played on the piano.</p>
                    </div>

                    <div>
                        <strong className="flex items-center gap-2">
                            <Lock className="h-5 w-5 opacity-75" />
                            Locking Chords
                        </strong>
                        <p>Hover and lock a chord to keep it during generation.</p>
                    </div>

                    <div>
                        <strong className="flex items-center gap-2">
                            <MoveHorizontal className="h-5 w-5 opacity-75" />
                            Rearranging Chords
                        </strong>
                        <p>Hover to see the move icon, then drag to rearrange.</p>
                    </div>

                    <div>
                        <strong className="flex items-center gap-2">
                            <Plus className="h-5 w-5 opacity-75" />
                            Adding Chords
                        </strong>
                        <p>Hover between chords and click plus to add a new one.</p>
                    </div>

                    <div>
                        <strong className="flex items-center gap-2">
                            <X className="h-5 w-5 opacity-75" />
                            Removing Chords
                        </strong>
                        <p>Hover and click X to remove a chord.</p>
                    </div>

                    <div>
                        <strong className="flex items-center gap-2">
                            <Download className="h-5 w-5 opacity-75" />
                            Downloading MIDI
                        </strong>
                        <p>Download your progression as a MIDI file.</p>
                    </div>

                    <div>
                        <strong className="flex items-center gap-2">
                            <PianoIcon className="h-5 w-5 opacity-75" />
                            Piano Interface
                        </strong>
                        <p>Highlights notes as chords play; you can also play manually.</p>
                    </div>
                </div>
            </div>


            <div className="text-left max-w-xl mx-auto mt-8">
                <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4">
                    <div>
                        <strong>Is ChordGen free to use?</strong>
                        <p>
                            Yes! ChordGen is 100% free. You can generate, edit, and
                            download MIDI chord progressions without creating an account.
                        </p>
                    </div>
                    <div>
                        <strong>Can I export the chords as MIDI files?</strong>
                        <p>
                            Absolutely. Once you've generated or edited your chord progression,
                            you can download it instantly as a standard MIDI file.
                        </p>
                    </div>
                    <div>
                        <strong>How does ChordGen work?</strong>
                        <p>
                            ChordGen uses advanced AI models to interpret your natural language
                            input and create musically coherent chord progressions tailored to
                            your request.
                        </p>
                    </div>
                    <div>
                        <strong>Do I need musical knowledge to use ChordGen?</strong>
                        <p>
                            No prior music theory knowledge is required. Simply describe
                            the mood or style you want, and ChordGen handles the rest.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
        <SonnerToaster richColors position="bottom-right" /> {/* Changed position here */}
        </body>
        </html>
    );
}