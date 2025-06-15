// app/how-it-works/page.tsx (The New Server Component Shell)

// NO 'use client' here!

import type { Metadata } from 'next';
import HowItWorksClient from './HowItWorksClient'; // Import the client component we just made

// ✅ Metadata lives here, in a server component.
export const metadata: Metadata = {
    title: 'How It Works',
    description: 'A step-by-step guide on how ChordGen works. Learn to generate chord progressions from text, visualize them on a piano, and download MIDI files for your DAW.',
    alternates: {
        canonical: '/how-it-works', // The correct canonical URL for this page
    },
};

// This is the entire page component. It just renders the client part.
export default function HowItWorksPage() {
    return <HowItWorksClient />;
}