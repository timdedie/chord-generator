import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import type { Metadata } from 'next';
import {
    ArrowRight,
    Sparkles,
    Music,
    Piano,
    Download,
    Edit3,
    ChevronRight,
    Mic2,
    Headphones,
    BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { MotionSection, MotionItem, ScrollIndicator } from '@/components/motion-wrapper';
import { faqs } from '@/lib/constants';

export const metadata: Metadata = {
    title: 'AI Chord Progression Generator — Free, No Sign-Up | ChordGen',
    description: 'Generate chord progressions instantly from any mood, genre, or feeling. Interactive piano preview, drag-and-drop editing, free MIDI download for any DAW. No account needed.',
    alternates: { canonical: '/' },
};

const useCases = [
    {
        Icon: Mic2,
        title: 'Songwriters',
        description: 'Break through writer\'s block. Describe the emotion of your song and get harmonic ideas in seconds — no theory knowledge required.',
    },
    {
        Icon: Headphones,
        title: 'Producers',
        description: 'Prototype chord beds for beats, EDM drops, or cinematic cues. Export MIDI and layer it with your sounds instantly.',
    },
    {
        Icon: Piano,
        title: 'Instrumentalists',
        description: 'Explore new harmonic territory for jazz, classical, or contemporary playing. Use the interactive piano to visualize every chord.',
    },
    {
        Icon: BookOpen,
        title: 'Music students',
        description: 'Learn how real progressions are built across genres. Generate examples for any style — from blues to neo-soul to film scoring.',
    },
];

const features = [
    {
        Icon: Music,
        title: 'AI-Powered',
        description: 'Describe any mood or genre. Our AI creates musically coherent progressions instantly.',
    },
    {
        Icon: Piano,
        title: 'Visual Piano',
        description: 'See and hear every chord on an interactive keyboard as you build your progression.',
    },
    {
        Icon: Edit3,
        title: 'Full Control',
        description: 'Drag, drop, add, or remove chords. Fine-tune until it sounds exactly right.',
    },
    {
        Icon: Download,
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

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to generate a chord progression with ChordGen',
    description:
        'Generate AI-powered chord progressions from a text description, preview them on a piano, edit them, and export as MIDI.',
    totalTime: 'PT2M',
    step: steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.title,
        text: s.description,
        url: `https://www.chordgen.org/#step-${i + 1}`,
    })),
};

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
                    {/* Badge */}
                    <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8">
                        <Sparkles className="h-4 w-4" />
                        <span>Free AI-Powered Tool</span>
                    </div>

                    {/* Main headline */}
                    <h1 className="animate-fade-in-up-delay-1 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-gray-900 dark:text-white leading-[0.95] mb-6">
                        Generate chords
                        <br />
                        <span className="text-primary">from words.</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="animate-fade-in-up-delay-2 text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4 font-medium">
                        The free AI chord progression generator.
                        Describe a mood, preview on piano, download MIDI.
                    </p>

                    {/* CTA */}
                    <div className="animate-fade-in-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button asChild size="lg" className="text-lg px-8 py-7 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                            <Link href="/app">
                                Start Creating
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>

                    {/* Trust signal */}
                    <p className="animate-fade-in-up-delay-4 mt-8 text-sm text-gray-500 dark:text-gray-500">
                        No sign-up required. 100% free. Forever.
                    </p>
                </div>

                {/* Scroll indicator */}
                <ScrollIndicator />
            </section>

            {/* Features Section */}
            <section className="py-24 sm:py-32 px-4">
                <MotionSection variant="stagger" className="max-w-6xl mx-auto">
                    <MotionItem className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            Everything you need
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                            From inspiration to production-ready MIDI in seconds.
                        </p>
                    </MotionItem>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <MotionItem
                                key={index}
                                variant="scaleIn"
                            >
                                <div className="group relative p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <feature.Icon className="h-7 w-7 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </MotionItem>
                        ))}
                    </div>
                </MotionSection>
            </section>

            {/* How It Works Section */}
            <section className="py-24 sm:py-32 px-4 bg-white dark:bg-gray-950">
                <MotionSection variant="stagger" className="max-w-5xl mx-auto">
                    <MotionItem className="text-center mb-20">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            How it works
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                            Four simple steps to your next progression.
                        </p>
                    </MotionItem>

                    <div className="space-y-8 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8">
                        {steps.map((step, index) => (
                            <MotionItem key={index}>
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
                            </MotionItem>
                        ))}
                    </div>
                </MotionSection>
            </section>

            {/* Use Cases Section */}
            <section className="py-24 sm:py-32 px-4">
                <MotionSection variant="stagger" className="max-w-6xl mx-auto">
                    <MotionItem className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            Built for every musician
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                            Whether you&apos;re writing your first song or scoring your hundredth.
                        </p>
                    </MotionItem>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {useCases.map((useCase, index) => (
                            <MotionItem key={index} variant="scaleIn">
                                <div className="group p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl h-full">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <useCase.Icon className="h-7 w-7 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                        {useCase.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {useCase.description}
                                    </p>
                                </div>
                            </MotionItem>
                        ))}
                    </div>
                </MotionSection>
            </section>

            {/* Browse by genre / key */}
            <section className="py-24 sm:py-32 px-4">
                <MotionSection variant="stagger" className="max-w-5xl mx-auto">
                    <MotionItem className="text-center mb-12">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            Browse by genre or key
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                            Reference guides for every common style and tonality.
                        </p>
                    </MotionItem>

                    <MotionItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
                                    Popular genres
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        ['lo-fi', 'Lo-Fi'],
                                        ['jazz', 'Jazz'],
                                        ['pop', 'Pop'],
                                        ['edm', 'EDM'],
                                        ['rnb', 'R&B'],
                                        ['rock', 'Rock'],
                                        ['blues', 'Blues'],
                                        ['neo-soul', 'Neo-Soul'],
                                        ['cinematic', 'Cinematic'],
                                        ['ambient', 'Ambient'],
                                        ['folk', 'Folk'],
                                        ['country', 'Country'],
                                        ['gospel', 'Gospel'],
                                        ['bossa-nova', 'Bossa Nova'],
                                    ].map(([slug, label]) => (
                                        <Link
                                            key={slug}
                                            href={`/chords/${slug}`}
                                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors"
                                        >
                                            {label}
                                        </Link>
                                    ))}
                                </div>
                                <Link
                                    href="/chords"
                                    className="inline-flex items-center gap-1 mt-5 text-sm font-bold text-primary hover:underline"
                                >
                                    All genres <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="p-8 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
                                    Common keys
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        ['c-major', 'C Major'],
                                        ['g-major', 'G Major'],
                                        ['d-major', 'D Major'],
                                        ['a-major', 'A Major'],
                                        ['e-major', 'E Major'],
                                        ['f-major', 'F Major'],
                                        ['a-minor', 'A Minor'],
                                        ['e-minor', 'E Minor'],
                                        ['d-minor', 'D Minor'],
                                        ['b-minor', 'B Minor'],
                                        ['f-sharp-minor', 'F♯ Minor'],
                                        ['c-minor', 'C Minor'],
                                    ].map(([slug, label]) => (
                                        <Link
                                            key={slug}
                                            href={`/key/${slug}`}
                                            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors"
                                        >
                                            {label}
                                        </Link>
                                    ))}
                                </div>
                                <Link
                                    href="/key"
                                    className="inline-flex items-center gap-1 mt-5 text-sm font-bold text-primary hover:underline"
                                >
                                    All keys <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </MotionItem>
                </MotionSection>
            </section>

            {/* FAQ Section */}
            <section className="py-24 sm:py-32 px-4 bg-white dark:bg-gray-950">
                <MotionSection variant="stagger" className="max-w-3xl mx-auto">
                    <MotionItem className="text-center mb-16">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
                            Questions?
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-medium">
                            We&apos;ve got answers.
                        </p>
                    </MotionItem>

                    <MotionItem>
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
                    </MotionItem>
                </MotionSection>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 sm:py-32 px-4">
                <MotionSection variant="fadeInUp" className="max-w-4xl mx-auto">
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
                </MotionSection>
            </section>

            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Script
                id="howto-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
        </div>
    );
}
