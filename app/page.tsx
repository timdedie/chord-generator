// app/page.tsx

import ClientHome from "@/components/ClientHome";
import PianoProvider from "@/components/PianoProvider";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Chord Progression Generator from Text | ChordGen',
    description: 'Generate chord progressions instantly with our free AI chord progression generator. Visualize on an interactive piano, edit, and download MIDI files.',
    alternates: {
        canonical: '/',
    },
};

export default function HomePage() {
    return (
        <PianoProvider>
            {/* The <main> tag is removed from here */}
            <ClientHome />
        </PianoProvider>
    );
}