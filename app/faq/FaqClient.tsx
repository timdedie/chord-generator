// app/faq/FaqClient.tsx (Updated)

'use client';

import React from 'react';
import Script from 'next/script';
import { motion } from 'framer-motion';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// --- UPDATED FAQ DATA ---
const faqData = [
    {
        question: "Is ChordGen truly free to use?",
        answer: "Yes! ChordGen is 100% free. You can use our AI chord progression generator to create, edit, and download unlimited MIDI files without an account or payment."
    },
    {
        question: "Can I use the generated chords in my commercial music?",
        answer: "Absolutely. The chord progressions you generate and the resulting MIDI files are yours to use freely in your personal and commercial projects. No attribution is required."
    },
    {
        question: "How do I export the chords as MIDI files?",
        answer: "Once our chord maker has generated your chord sequence, you can edit it and then click the 'Download MIDI' button. A standard MIDI file (.mid) will be saved, ready to import into any Digital Audio Workstation (DAW)."
    },
    {
        // This answer now includes an internal link
        question: "What kind of AI does ChordGen use?",
        answer: (
            <>
                ChordGen uses a fine-tuned large language model (LLM) trained on music theory and harmonic principles. It analyzes your text to generate musically creative chord progressions. You can learn more about the process on our <Link href="/how-it-works" className="text-primary underline hover:no-underline">How It Works</Link> page.
            </>
        )
    },
    {
        question: "Does this work on mobile devices?",
        answer: "Yes, ChordGen is fully responsive. You can generate and play chords on your phone or tablet. For the best experience with our chord progression maker, including drag-and-drop editing, we recommend using a desktop browser."
    },
];

const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map(item => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
            "@type": "Answer",
            // Handle the case where the answer is a string or a JSX element
            text: typeof item.answer === 'string' ? item.answer : 'ChordGen uses a fine-tuned large language model (LLM) trained on music theory and harmonic principles. It analyzes your text to generate musically creative chord progressions. You can learn more about the process on our How It Works page.'
        }
    }))
};

export default function FaqClient() {
    return (
        <>
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto max-w-3xl px-4 py-16 sm:py-24"
            >
                {/* ... The rest of your component remains exactly the same ... */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                        Frequently Asked Questions
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        Have questions? We have answers. If you can't find what you're looking for, feel free to contact us.
                    </p>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {faqData.map((item, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-left text-lg hover:no-underline">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-base text-gray-600 dark:text-gray-400">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <div className="text-center mt-16">
                    <p className="text-lg mb-4">Start creating your next masterpiece.</p>
                    <Button asChild size="lg">
                        <Link href="/">
                            Go to the Generator <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </>
    );
}