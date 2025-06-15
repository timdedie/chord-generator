// app/how-it-works/HowItWorksClient.tsx

'use client'; // This directive STAYS HERE for the animations.

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Sparkles,
    ListMusic,
    RefreshCw,
    PlayCircle,
    BookText,
    MousePointer,
    Download,
    ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const howItWorksItems = [
    { icon: Sparkles, title: '1. Describe Your Vibe', description: "Enter a text prompt like 'sad lofi chords' or 'epic movie score' to tell the AI what you need." },
    { icon: ListMusic, title: '2. Select Chord Count', description: 'Choose how many chords (2-8) you want in your progression using the simple dropdown menu.' },
    { icon: RefreshCw, title: '3. Generate Progression', description: 'Click the generate button and let the AI create a unique, musically coherent chord sequence for you.' },
    { icon: PlayCircle, title: '4. Play & Visualize', description: 'Click any chord to hear it and see the notes light up on the interactive on-screen piano.' },
    { icon: BookText, title: '5. Get a Theory Explanation', description: 'Click "Explain Progression" to get an AI-generated breakdown of the music theory behind your chords.' },
    { icon: MousePointer, title: '6. Edit & Customize', description: 'Easily rearrange chords with drag-and-drop, add new chords, or remove them to perfect your sequence.' },
    { icon: Download, title: '7. Download as MIDI', description: 'Export your final progression as a standard MIDI file to drag directly into your DAW (Logic, Ableton, FL Studio).' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

// Renamed the function for clarity. The code inside is identical.
export default function HowItWorksClient() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto max-w-4xl px-4 py-16 sm:py-24"
        >
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                    How ChordGen Works
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    From a simple idea to a complete MIDI chord progression in just a few clicks.
                </p>
            </div>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {howItWorksItems.map((item, index) => (
                    <motion.div variants={itemVariants} key={index}>
                        <Card className="h-full bg-white/50 dark:bg-black/50 backdrop-blur-sm border-gray-200 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 transition-colors">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <item.icon className="h-8 w-8 text-primary" />
                                <CardTitle>{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
            <div className="text-center mt-16">
                <p className="text-lg mb-4">Ready to create your own progression?</p>
                <Button asChild size="lg">
                    <Link href="/">
                        Try ChordGen For Free <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </motion.div>
    );
}