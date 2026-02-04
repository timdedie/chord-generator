import React from 'react';
import Script from 'next/script';
import { MarketingHeader } from '@/components/layouts/MarketingHeader';
import { Footer } from '@/components/Footer';

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

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
        },
    })),
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <MarketingHeader />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    );
}
