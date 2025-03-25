// app/head.tsx
export default function Head() {
    const webAppSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "ChordGen",
        url: "https://www.chordgen.org",
        description: "Generate unique chord progressions with AI using natural language input. Free to use. Edit and download chords as MIDI files.",
        applicationCategory: "MusicApplication",
        operatingSystem: "ALL",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        image: "https://www.chordgen.org/chordgen_logo.png",
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
            {
                "@type": "Question",
                name: "Is ChordGen free to use?",
                acceptedAnswer: { "@type": "Answer", text: "Yes! ChordGen is 100% free. You can generate, edit, and download MIDI chord progressions without creating an account." },
            },
            {
                "@type": "Question",
                name: "Can I export the chords as MIDI files?",
                acceptedAnswer: { "@type": "Answer", text: "Absolutely. Once you've generated or edited your chord progression, you can download it instantly as a standard MIDI file." },
            },
            {
                "@type": "Question",
                name: "How does ChordGen work?",
                acceptedAnswer: { "@type": "Answer", text: "ChordGen uses advanced AI models to interpret your natural language input and create musically coherent chord progressions tailored to your request." },
            },
            {
                "@type": "Question",
                name: "Do I need musical knowledge to use ChordGen?",
                acceptedAnswer: { "@type": "Answer", text: "No prior music theory knowledge is required. Simply describe the mood or style you want, and ChordGen handles the rest." },
            },
        ],
    };

    return (
        <>
            <title>ChordGen – Free AI Chord Generator & MIDI Export Tool</title>
            <meta name="author" content="ChordGen Team" />
            <meta name="description" content="Generate unique chord progressions instantly using natural language with ChordGen. Free to use! Edit chords, rearrange them, and download MIDI files." />
            <meta name="keywords" content="Free AI chord generator, MIDI chord download, music composition tool" />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href="https://www.chordgen.org" />

            {/* Open Graph */}
            <meta property="og:title" content="ChordGen – Free AI Chord Generator" />
            <meta property="og:description" content="Create and customize chord progressions using AI. Completely free!" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.chordgen.org" />
            <meta property="og:image" content="https://www.chordgen.org/chordgen_logo.png" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="ChordGen – Free AI Chord Generator" />
            <meta name="twitter:description" content="Generate chord progressions using AI. 100% free!" />
            <meta name="twitter:image" content="https://www.chordgen.org/chordgen_logo.png" />

            {/* Structured Data */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        </>
    );
}
