'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Sparkles,
    Music,
    Piano,
    Download,
    Edit3,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
};

// Data
const features = [
    {
        icon: Music,
        title: 'AI-Powered',
        description: 'Describe any mood or genre. Our AI creates musically coherent progressions instantly.',
    },
    {
        icon: Piano,
        title: 'Visual Piano',
        description: 'See and hear every chord on an interactive keyboard as you build your progression.',
    },
    {
        icon: Edit3,
        title: 'Full Control',
        description: 'Drag, drop, add, or remove chords. Fine-tune until it sounds exactly right.',
    },
    {
        icon: Download,
        title: 'Free MIDI',
        description: 'Export to any DAW. Standard MIDI files, completely free, no strings attached.',
    },
];

const steps = [
    { number: '01', title: 'Describe', description: 'Enter a prompt like "melancholic jazz" or "upbeat pop anthem"' },
    { number: '02', title: 'Generate', description: 'Our AI creates multiple unique progressions tailored to your vision' },
    { number: '03', title: 'Refine', description: 'Edit, rearrange, and perfect your progression with intuitive controls' },
    { number: '04', title: 'Export', description: 'Download as MIDI and drop directly into your DAW' },
];

const faqs = [
    {
        question: 'Is ChordGen really free?',
        answer: 'Yes, completely free. Generate unlimited progressions, download unlimited MIDI files. No account required, no hidden fees.',
    },
    {
        question: 'Can I use the chords commercially?',
        answer: 'Absolutely. Everything you create is yours. Use it in commercial releases, sync licensing, whatever you want. No attribution needed.',
    },
    {
        question: 'How does the AI work?',
        answer: 'ChordGen uses a fine-tuned language model trained on music theory and harmonic principles. It understands context, mood, and genre to generate musically coherent progressions.',
    },
    {
        question: 'What DAWs are supported?',
        answer: 'Any DAW that accepts MIDI files: Ableton Live, Logic Pro, FL Studio, Pro Tools, Cubase, GarageBand, Reaper, and more.',
    },
    {
        question: 'Does it work on mobile?',
        answer: 'Yes. ChordGen is fully responsive. Generate and preview chords on any device, though desktop provides the best editing experience.',
    },
];

export default function LandingPage() {
    return (
        <div className="bg-gray-50 dark:bg-black overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-4">
                {/* Background gradient */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        {/* Badge */}
                        <motion.div
                            variants={fadeInUp}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8"
                        >
                            <Sparkles className="h-4 w-4" />
                            <span>Free AI-Powered Tool</span>
                        </motion.div>

                        {/* Main headline */}
                        <motion.h1
                            variants={fadeInUp}
                            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-gray-900 dark:text-white leading-[0.95] mb-6"
                        >
                            Generate chords
                            <br />
                            <span className="text-primary">from words.</span>
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 font-medium"
                        >
                            Describe a mood. Get chord progressions.
                            <br className="hidden sm:block" />
                            Download MIDI. It&apos;s that simple.
                        </motion.p>

                        {/* CTA */}
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Button asChild size="lg" className="text-lg px-8 py-7 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                                <Link href="/app">
                                    Start Creating
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </motion.div>

                        {/* Trust signal */}
                        <motion.p
                            variants={fadeInUp}
                            className="mt-8 text-sm text-gray-500 dark:text-gray-500"
                        >
                            No sign-up required. 100% free. Forever.
                        </motion.p>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700 flex items-start justify-center p-2"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-24 sm:py-32 px-4">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="max-w-6xl mx-auto"
                >
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            Everything you need
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                            From inspiration to production-ready MIDI in seconds.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={scaleIn}
                                className="group relative p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="h-7 w-7 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 sm:py-32 px-4 bg-white dark:bg-gray-950">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="max-w-5xl mx-auto"
                >
                    <motion.div variants={fadeInUp} className="text-center mb-20">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            How it works
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                            Four simple steps to your next progression.
                        </p>
                    </motion.div>

                    <div className="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                            >
                                <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                                    <span className="text-6xl sm:text-7xl font-black text-primary/20 mb-4 leading-none">
                                        {step.number}
                                    </span>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 sm:py-32 px-4">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="max-w-3xl mx-auto"
                >
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            Questions?
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                            We&apos;ve got answers.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeInUp}>
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="border border-gray-200 dark:border-gray-800 rounded-2xl px-6 bg-white dark:bg-gray-900 data-[state=open]:shadow-lg transition-shadow"
                                >
                                    <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-gray-600 dark:text-gray-400 pb-6 text-base leading-relaxed">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </motion.div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 sm:py-32 px-4">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="max-w-4xl mx-auto"
                >
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 px-8 py-16 sm:px-16 sm:py-24 text-center">
                        {/* Background decoration */}
                        <div className="absolute inset-0 -z-10">
                            <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                        </div>

                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                            Ready to create?
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-xl mx-auto">
                            Your next chord progression is just a prompt away.
                            Start generating for free, right now.
                        </p>
                        <Button
                            asChild
                            size="lg"
                            className="text-lg px-10 py-7 rounded-2xl font-bold bg-white text-gray-900 hover:bg-gray-100 shadow-2xl"
                        >
                            <Link href="/app">
                                Launch ChordGen
                                <ChevronRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
