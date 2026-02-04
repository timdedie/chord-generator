import React from 'react';
import type { Metadata } from 'next';
import AppShell from './AppShell';

export const metadata: Metadata = {
    title: 'Create Chord Progression',
    description: 'Generate AI-powered chord progressions from text descriptions. Visualize on piano, edit, and download free MIDI files.',
};

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AppShell>{children}</AppShell>;
}
