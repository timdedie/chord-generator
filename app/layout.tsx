// app/layout.tsx
import "./globals.css";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import React from "react";
import {
    MoveHorizontal,
    Plus,
    RefreshCw,
    X,
    PlayCircle,
    Download,
    Piano as PianoIcon,
    BookOpenText,
} from "lucide-react";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-outfit",
    display: "swap",
});

// JSON-LD Schemas (UPDATED CONTENT from previous correct version)
const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ChordGen",
    url: "https://www.chordgen.org",
    description:
        "Generate unique chord progressions with AI using natural language input. Free to use. Edit, select chord count, use Deep Think, get explanations, and download chords as MIDI files.",
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
                text: "Absolutely. Once you've generated or edited your chord progression, you can download it instantly as a standard MIDI file (desktop only).",
            },
        },
        {
            "@type": "Question",
            name: "How does ChordGen work?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "ChordGen uses advanced AI models (like Deepseek Chat and Deepseek Reasoner) to interpret your natural language input and create musically coherent chord progressions. You can choose the number of chords and enable 'Deep Think' for more advanced results.",
            },
        },
        {
            "@type": "Question",
            name: "Do I need musical knowledge to use ChordGen?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "No prior music theory knowledge is required. Simply describe the mood or style you want. You can also use the 'Explain Progression' feature to learn about the music theory behind your chords.",
            },
        },
    ],
};

const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Use ChordGen AI Chord Progression Generator",
    description:
        "Learn how to generate AI chord progressions, select chord count, use Deep Think, get music theory explanations, play, edit, and download MIDI files with ChordGen.",
    step: [
        { "@type": "HowToStep", name: "Describe Desired Chords", text: "Enter a text description (e.g., 'epic movie score chords', 'jazzy lofi progression in F minor') into the input field." },
        { "@type": "HowToStep", name: "Select Number of Chords", text: "Use the dropdown to choose how many chords (2-8) you want in your progression." },
        { "@type": "HowToStep", name: "Enable Deep Think (Optional)", text: "Toggle the 'Deep Think' switch to use a more advanced AI model for potentially richer or more complex chord suggestions. This may take slightly longer." },
        { "@type": "HowToStep", name: "Generate Progression", text: "Click the refresh button or press Enter in the input field to generate your chord progression." },
        { "@type": "HowToStep", name: "Play Chords", text: "Click on any of the generated chord cards to hear the chord played on the virtual piano." },
        { "@type": "HowToStep", name: "Explain Progression", text: "Click the 'Explain Progression' button (appears after generation) to receive an AI-generated music theory explanation of the chord sequence." },
        { "@type": "HowToStep", name: "Rearrange Chords (Desktop)", text: "On a desktop computer, hover over a chord card to reveal the move icon, then drag and drop the chord to a new position." },
        { "@type": "HowToStep", name: "Add Chords (Desktop)", text: "On desktop, click the plus icon (+) that appears between chords to have the AI suggest and insert a new chord at that spot." },
        { "@type": "HowToStep", name: "Remove Chords (Desktop)", text: "On desktop, hover over a chord card and click the 'X' icon to remove that chord from the progression." },
        { "@type": "HowToStep", name: "Download MIDI (Desktop)", text: "Click the 'Download MIDI' button to save your current chord progression as a MIDI file, compatible with most DAWs." },
        { "@type": "HowToStep", name: "Interact with Piano", text: "The on-screen piano highlights notes as chords play. You can also click the piano keys to play notes manually." }
    ]
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">{/* Ensure no space/newline after <html lang="en"> and before <head> or after <html> and EOF */}
        <head>{/* Ensure no space/newline after <head> and before first child or after last child and before </head> */}
            {/* Primary Title & Description */}
            <title>ChordGen – Free AI Chord Generator & MIDI Export Tool</title>
            <meta
                name="description"
                content="Generate unique chord progressions instantly using natural language with ChordGen. Free to use! Edit chords, rearrange them, download MIDI files, and learn music theory with AI explanations."
            />
            <meta name="author" content="ChordGen Team" />
            <meta
                name="keywords"
                content="Free AI chord generator, MIDI chord download, music composition tool, learn music theory, AI music explanation, chord progression tool, Deep Think AI music"
            />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://www.chordgen.org" />
            {/* Favicon / Manifest / Icons */}
            <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16"/>
            <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32"/>
            <link rel="icon" href="/favicon.ico" type="image/x-icon" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/site.webmanifest" />
            {/* Open Graph */}
            <meta property="og:title" content="ChordGen – Free AI Chord Generator & Music Theory Helper" />
            <meta
                property="og:description"
                content="Create and customize chord progressions using AI, download MIDI, and understand the theory behind them. Completely free!"
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.chordgen.org" />
            <meta property="og:image" content="https://www.chordgen.org/og-image.png"/>
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="ChordGen – Free AI Chord Generator & Music Theory Insights"/>
            <meta name="twitter:description" content="Generate chord progressions with AI, download MIDI, and learn music theory. 100% free!"/>
            <meta name="twitter:image" content="https://www.chordgen.org/twitter-image.png"/>
            {/* JSON-LD Schemas */}
            <Script
                id="webapp-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
            />
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Script
                id="howto-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />{/* Ensure no space/newline after last Script tag and before </head> */}
        </head>
        <body className={`${outfit.className} flex flex-col min-h-screen`}>{/* Ensure no space/newline after <body> and before <main> or after last child and before </body> */}
        <main className="flex-grow">{children}</main>
        <Analytics />
        <footer className="w-full text-center text-sm text-gray-500 dark:text-gray-400 p-8 space-y-8 relative z-20 bg-white dark:bg-black">
            {/* Short About Section */}
            <div>
                <p>
                    <strong>ChordGen</strong> is a free AI-powered chord progression
                    generator. Describe the mood, style, or vibe you want, and ChordGen
                    will instantly generate unique chord progressions tailored to your input.
                    Edit, rearrange, and download your chords as MIDI files for seamless
                    integration into your music production workflow. Plus, you can learn about the music theory behind your progressions with our AI-powered explanations.
                </p>
                <p className="mt-2">
                    Whether you're a producer, songwriter, or composer, ChordGen helps
                    spark creativity, speed up your songwriting process, and deepen your understanding of music.
                </p>
            </div>
            {/* Internal Link (Call to Action) */}
            <div>
                <a
                    href="https://www.chordgen.org"
                    className="underline"
                    aria-label="ChordGen Free AI Chord Progression Generator"
                >
                    Try ChordGen – Free AI Chord Progression Generator
                </a>
            </div>
            {/* How it works Section */}
            <div className="text-left max-w-xl mx-auto space-y-6">
                <h3 className="font-semibold mb-4 text-base">How It Works</h3>
                <div className="space-y-4">
                    <div>
                        <strong className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 opacity-75" />
                            1. Describe & Generate
                        </strong>
                        <p className="ml-7">Enter a description, choose chord count (2-8), optionally toggle "Deep Think" for advanced AI, then click refresh or press Enter.</p>
                    </div>
                    <div>
                        <strong className="flex items-center gap-2">
                            <PlayCircle className="h-5 w-5 opacity-75" />
                            2. Play Chords
                        </strong>
                        <p className="ml-7">Click any generated chord card to hear it played.</p>
                    </div>
                    <div>
                        <strong className="flex items-center gap-2">
                            <BookOpenText className="h-5 w-5 opacity-75" />
                            3. Explain Progression
                        </strong>
                        <p className="ml-7">Click "Explain Progression" for an AI music theory breakdown.</p>
                    </div>
                    <div>
                        <strong className="flex items-center gap-2">
                            <MoveHorizontal className="h-5 w-5 opacity-75" />
                            4. Edit & Arrange (Desktop)
                        </strong>
                        <p className="ml-7">Drag to reorder. Click '+' to add. Click 'X' to remove.</p>
                    </div>
                    <div>
                        <strong className="flex items-center gap-2">
                            <Download className="h-5 w-5 opacity-75" />
                            5. Download MIDI (Desktop)
                        </strong>
                        <p className="ml-7">Save your progression as a MIDI file.</p>
                    </div>
                    <div>
                        <strong className="flex items-center gap-2">
                            <PianoIcon className="h-5 w-5 opacity-75" />
                            6. Interact with Piano
                        </strong>
                        <p className="ml-7">The piano highlights notes and can be played manually.</p>
                    </div>
                </div>
            </div>
            {/* SEO-Friendly FAQ Section */}
            <div className="text-left max-w-xl mx-auto space-y-4">
                <h3 className="font-semibold mb-4 text-base">Frequently Asked Questions</h3>
                <div className="space-y-4">
                    {faqSchema.mainEntity.map((faqItem, index) => (
                        <div key={index}>
                            <strong>{faqItem.name}</strong>
                            <p>{faqItem.acceptedAnswer.text}</p>
                        </div>
                    ))}
                </div>
            </div>
            {/* Copyright and Other Links Section */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <p>© {new Date().getFullYear()} ChordGen. All Rights Reserved.</p>
                <nav className="mt-2 space-x-4">
                    <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>
                    <a href="/terms" className="underline hover:text-primary">Terms of Service</a>
                    <a href="/contact" className="underline hover:text-primary">Contact Us</a>
                </nav>
            </div>
        </footer>
        <SonnerToaster richColors position="bottom-right" />
        </body>{/* Ensure no space/newline after </body> and before </html> or after </html> and EOF */}
        </html>
    );
}