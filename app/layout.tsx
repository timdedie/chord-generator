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
    manifest: "/site.webmanifest", // Optional but you already have it!
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={poppins.className}>
        <main className="flex-grow">
            {children}
            <Analytics/>
        </main>
        <footer className="w-full text-center text-sm text-gray-500 dark:text-gray-400 p-6">
            <p>
                <strong>ChordGen</strong> is a free AI-powered chord progression generator.
                Simply describe the mood or style you want, and ChordGen will create unique chord progressions you can edit and rearrange.
                Download your chords as MIDI files instantly and use them in your music production workflow.
            </p>
            <p className="mt-2">
                Perfect for producers, composers, and musicians looking to spark creativity or speed up their songwriting process.
            </p>
        </footer>
        </body>
        </html>
    );
}
