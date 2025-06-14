// app/layout.tsx
import "./globals.css";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import React from "react";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { CSPostHogProvider } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/Footer"; // Import the new clean footer
import { Header } from "@/components/Header"; // <-- IMPORT THE HEADER


const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-outfit",
    display: "swap",
});

// JSON-LD Schemas - Optimized for SEO
const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ChordGen",
    url: "https://www.chordgen.org",
    description:
        "Free AI chord progression generator with an interactive piano. Generate unique chord sequences using natural language and download as MIDI files.",
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
                text: "Yes! ChordGen is a 100% free AI chord generator. You can create, edit, and download unlimited MIDI chord progressions without an account.",
            },
        },
        {
            "@type": "Question",
            name: "Can I export the chords as MIDI files?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Absolutely. Once you've generated your chord sequence, you can download it instantly as a standard MIDI file, ready for your DAW.",
            },
        },
        {
            "@type": "Question",
            name: "How does ChordGen work?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "ChordGen uses advanced AI to interpret your natural language input (like 'sad lofi chords') and create musically coherent chord progressions. You can then play them on a virtual piano, edit them, and get a music theory explanation.",
            },
        },
        {
            "@type": "Question",
            name: "Does this work as a piano chord progression generator?",
            acceptedAnswer: {
                "@type": "Answer",
                text: "Yes! ChordGen includes an interactive piano that highlights the notes of each chord, making it an excellent tool for pianists and keyboard players to visualize and learn new progressions.",
            },
        },
    ],
};

const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Use ChordGen AI Chord & MIDI Generator",
    description:
        "Learn how to use our free AI tool to generate chord progressions, visualize them on a piano, get music theory explanations, and download MIDI files.",
    step: [
        { "@type": "HowToStep", name: "Describe Your Vibe", text: "Enter a text description (e.g., 'epic movie score chords', 'jazzy lofi progression in F minor') into the input field." },
        { "@type": "HowToStep", name: "Select Number of Chords", text: "Use the dropdown to choose how many chords (2-8) you want in your progression." },
        { "@type": "HowToStep", name: "Generate Your Progression", text: "Click the refresh button to have the AI generate your unique chord sequence." },
        { "@type": "HowToStep", name: "Play & Visualize on Piano", text: "Click on any generated chord card to hear it and see the notes highlighted on the interactive piano." },
        { "@type": "HowToStep", name: "Get a Theory Explanation", text: "Click the 'Explain Progression' button to receive an AI-generated music theory breakdown of your chord sequence." },
        { "@type": "HowToStep", name: "Edit Your Sequence", text: "Drag and drop chords to rearrange them, click the '+' to add a new chord, or click 'X' to remove one." },
        { "@type": "HowToStep", name: "Download Your MIDI", text: "Click the 'Download MIDI' button to save your final chord progression as a MIDI file, compatible with any DAW." },
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
            {/* All your SEO head content remains the same */}
            <title>ChordGen - AI Chord Progression & MIDI Generator Piano</title>
            <meta name="description" content="Instantly generate chord progressions with our free AI chord generator. Visualize chords on an interactive piano, edit your sequence, and download as a MIDI file for your DAW. Perfect for songwriters!" />
            <meta name="author" content="ChordGen Team" />
            <meta name="keywords" content="ai chord generator, midi chord generator, chord progression generator, piano chord generator, free midi download, chord sequence generator, ai music tool, songwriting helper" />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://www.chordgen.org" />
            <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16"/>
            <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32"/>
            <link rel="icon" href="/favicon.ico" type="image/x-icon" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="manifest" href="/site.webmanifest" />
            <meta property="og:title" content="AI Chord Progression & MIDI Generator (with Piano) - ChordGen" />
            <meta property="og:description" content="Create unique chord sequences with AI, visualize on a piano, and download MIDI for free. The ultimate songwriting tool." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.chordgen.org" />
            <meta property="og:image" content="https://www.chordgen.org/og-image.png"/>
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="AI Chord Progression & MIDI Generator (with Piano) - ChordGen"/>
            <meta name="twitter:description" content="Create unique chord sequences with AI, visualize on a piano, and download MIDI for free. The ultimate songwriting tool."/>
            <meta name="twitter:image" content="https://www.chordgen.org/twitter-image.png"/>
            <Script id="webapp-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <Script id="howto-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
        </head>

        {/*
          CHANGED: Removed `flex flex-col min-h-screen` from the body.
          The body is now just a simple container for background color and font.
        */}
        <body className={`${outfit.className} bg-gray-50 dark:bg-black`}>
        <CSPostHogProvider>
            <Header />

            {/*
              CHANGED: Added layout classes to the <main> tag.
              This makes the <main> element the primary container that ensures all content
              fits between the header and footer, even on short pages.
              Your homepage's `flex-grow` will now target this container.
            */}
            <main className="flex flex-col min-h-[calc(100vh-theme(height.16))]">
                {children}
            </main>

            <Analytics />
            <SpeedInsights/>
            <Footer />
            <SonnerToaster richColors position="bottom-right" />
        </CSPostHogProvider>
        </body>
        </html>
    );
}