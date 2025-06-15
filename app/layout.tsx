// app/layout.tsx (The new, correct version)

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
import type { Metadata } from 'next'; // <--- IMPORT METADATA TYPE

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-outfit",
    display: "swap",
});

const webAppSchema = {
    // ... your schema object remains the same
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

// ==================================================================
//  START OF NEW METADATA OBJECT
// ==================================================================
export const metadata: Metadata = {
    // metadataBase is crucial for resolving relative URLs for canonicals and OG images
    metadataBase: new URL('https://www.chordgen.org'),

    // Default title for homepage, with a template for other pages
    title: {
        default: 'ChordGen - AI Chord Progression & MIDI Generator Piano',
        template: '%s | ChordGen',
    },
    description: 'Instantly generate chord progressions with our free AI chord generator. Visualize chords on an interactive piano, edit your sequence, and download as a MIDI file for your DAW. Perfect for songwriters!',
    authors: [{ name: 'ChordGen Team', url: 'https://www.chordgen.org' }],
    keywords: ['ai chord generator', 'midi chord generator', 'chord progression generator', 'piano chord generator', 'free midi download', 'chord sequence generator', 'ai music tool', 'songwriting helper'],

    // This replaces your <link rel="icon"> tags
    icons: {
        icon: [
            { url: '/favicon.ico', type: 'image/x-icon' },
            { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
            { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
        ],
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',

    // Default Open Graph and Twitter card data (will be overridden by individual pages)
    openGraph: {
        title: 'AI Chord Progression & MIDI Generator (with Piano) - ChordGen',
        description: 'Create unique chord sequences with AI, visualize on a piano, and download MIDI for free. The ultimate songwriting tool.',
        url: '/', // This will become https://www.chordgen.org
        siteName: 'ChordGen',
        images: [
            {
                url: '/og-image.png', // Relative to metadataBase
                width: 1200,
                height: 630,
            },
        ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Chord Progression & MIDI Generator (with Piano) - ChordGen',
        description: 'Create unique chord sequences with AI, visualize on a piano, and download MIDI for free. The ultimate songwriting tool.',
        images: ['/twitter-image.png'], // Relative to metadataBase
    },

    // IMPORTANT: No canonical tag here. It will be set per-page.
    // If you want one for the homepage, set it in app/page.tsx
};
// ==================================================================
//  END OF NEW METADATA OBJECT
// ==================================================================


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        // Next.js automatically injects the <head> based on the metadata object
        <html lang="en">
        <body className={`${outfit.className} bg-gray-50 dark:bg-black`}>
        <CSPostHogProvider>
            <Header />
            <main className="flex flex-col min-h-[calc(100vh-theme(height.16))]">
                {children}
            </main>
            <Analytics />
            <SpeedInsights />
            <Footer />
            <SonnerToaster richColors position="bottom-right" />
        </CSPostHogProvider>

        {/* Your schema script can stay here */}
        <Script id="webapp-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
        </body>
        </html>
    );
}