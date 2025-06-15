// app/faq/page.tsx (The New Server Component Shell)

// NO 'use client' here!

import type { Metadata } from 'next';
import FaqClient from './FaqClient'; // Import the client component we just made

// ✅ Metadata lives here, in a server component.
export const metadata: Metadata = {
    title: 'Frequently Asked Questions (FAQ)',
    description: 'Find answers to common questions about ChordGen, including MIDI downloads, AI features, commercial usage, and more. Get the support you need.',
    alternates: {
        canonical: '/faq', // The correct canonical URL for the FAQ page
    },
};

// This is the entire page component. It just renders the client part.
export default function FAQPage() {
    return <FaqClient />;
}