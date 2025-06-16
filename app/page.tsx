// app/page.tsx

import ClientHome from "@/components/ClientHome";
import PianoProvider from "@/components/PianoProvider";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Chord Progression Generator from Text | ChordGen',
    description: 'Instantly generate chord progressions with our free AI chord generator. Visualize chords on an interactive piano, edit your sequence, and download as a MIDI file for your DAW. Perfect for songwriters!',
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