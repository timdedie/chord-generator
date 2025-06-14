// app/faq/page.tsx
'use client';

import React from 'react';
import Script from 'next/script'; // <-- 1. IMPORT Script from next/script
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

// This is the visible content on the page
const faqData = [
    {
        question: "Is ChordGen truly free to use?",
        answer: "Yes! ChordGen is 100% free. You can generate, edit, and download unlimited MIDI chord progressions without creating an account or providing any payment information."
    },
    {
        question: "Can I use the generated chords in my commercial music?",
        answer: "Absolutely. The chord progressions you generate and the resulting MIDI files are yours to use freely in your personal and commercial projects. No attribution is required."
    },
    {
        question: "How do I export the chords as MIDI files?",
        answer: "Once you've generated or edited your chord progression, simply click the 'Download MIDI' button. A standard MIDI file (.mid) will be saved to your computer, ready to be imported into any Digital Audio Workstation (DAW)."
    },
    {
        question: "What kind of AI does ChordGen use?",
        answer: "ChordGen uses a fine-tuned version of a large language model (LLM) that has been trained on music theory concepts, popular song structures, and harmonic principles to generate musically coherent and creative chord progressions based on your text prompts."
    },
    {
        question: "Does this work on mobile devices?",
        answer: "Yes, ChordGen is fully responsive. You can generate and play chords on your phone or tablet. For the best experience, including editing features like drag-and-drop and MIDI download, we recommend using a desktop browser."
    },
];

// ✅ 2. CREATE the FAQ schema, which now lives on the page it describes.
// This perfectly matches the visible content from `faqData`.
const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map(item => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
        }
    }))
};

export default function FAQPage() {
    return (
        // 3. WRAP the output in a fragment to include the Script tag
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