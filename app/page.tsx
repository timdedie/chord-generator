import type { Metadata } from 'next';
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
    title: 'AI Chord Progression Generator from Text | ChordGen',
    description: 'Generate chord progressions instantly with our free AI chord progression generator. Visualize on an interactive piano, edit, and download MIDI files.',
    alternates: {
        canonical: '/',
    },
};

export default function HomePage() {
    return <HomeClient />;
}
