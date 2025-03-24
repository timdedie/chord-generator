import "./globals.css";
import {Gloock} from "next/font/google";
import {Analytics} from '@vercel/analytics/next';
import { Metadata } from "next";


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
        {children}
        <Analytics/>
        </body>
        </html>
    );
}
