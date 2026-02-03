// app/layout.tsx (Optimized and Unified)

import "./globals.css";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import React from "react";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { CSPostHogProvider } from "./providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { Header } from "@/components/Header";
import { ConditionalDonationButton } from "@/components/ConditionalDonationButton";
import type { Metadata } from 'next';

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-outfit",
    display: "swap",
});

// --- UNIFIED DESCRIPTION ---
const unifiedDescription = 'Describe a mood, genre, or feeling, and our AI instantly generates unique chord progressions. Visualize on piano, edit, and download free MIDI files for any DAW.';

const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ChordGen",
    url: "https://www.chordgen.org",
    description: unifiedDescription, // <--- Use unified description
    applicationCategory: "MusicApplication",
    operatingSystem: "ALL",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    image: "https://www.chordgen.org/chordgen_logo.png",
};

export const metadata: Metadata = {
    metadataBase: new URL('https://www.chordgen.org'),

    title: {
        default: 'AI Chord Progression Generator from Text | ChordGen', // Your excellent new title
        template: '%s | ChordGen',
    },
    description: unifiedDescription, // <--- Use unified description
    authors: [{ name: 'ChordGen Team', url: 'https://www.chordgen.org' }],
    keywords: ['ai chord generator', 'chord progression generator', 'midi generator', 'chord maker', 'ai music generator', 'songwriting tool', 'free midi', 'natural language music'],

    icons: {
        icon: [
            { url: '/favicon.ico', type: 'image/x-icon' },
            { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
            { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
        ],
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',

    openGraph: {
        title: 'AI Chord Progression Generator from Text | ChordGen',
        description: unifiedDescription, // <--- Use unified description
        url: '/',
        siteName: 'ChordGen',
        images: [ { url: '/og-image.png', width: 1200, height: 630 } ],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Chord Progression Generator from Text | ChordGen',
        description: unifiedDescription, // <--- Use unified description
        images: ['/twitter-image.png'],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
    return (
        <html lang="en">
        <body className={`${outfit.className} bg-gray-50 dark:bg-black`}>
        <CSPostHogProvider>
            <Header />
            <main className="flex flex-col min-h-[calc(100vh-theme(height.16))]">
                {children}
            </main>
            <Analytics />
            <SpeedInsights />
            <ConditionalFooter />
            <ConditionalDonationButton />
            <SonnerToaster richColors position="bottom-right" />
        </CSPostHogProvider>
        <Script id="webapp-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
        </body>
        </html>
    );
}