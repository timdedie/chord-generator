// app/layout.tsx
import "./globals.css";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import React from "react";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { CSPostHogProvider } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";


const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-outfit",
    display: "swap",
});

// ✅ CORRECT: This schema describes the entire application and belongs in the layout.
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

// ❌ REMOVED: The FAQ and HowTo schemas were removed from this file because
// they do not apply to every page on the site.

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

            {/* This script will now correctly appear on every page */}
            <Script id="webapp-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
        </head>

        <body className={`${outfit.className} bg-gray-50 dark:bg-black`}>
        <CSPostHogProvider>
            <Header />
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