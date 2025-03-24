import Head from "next/head";
import ClientHome from "@/components/ClientHome";

export default function HomePage() {
    return (
        <>
            <Head>
                {/* Primary Meta Tags */}
                <title>ChordGen – Free AI Chord Generator & MIDI Export Tool</title>
                <meta
                    name="description"
                    content="Generate unique chord progressions instantly using natural language with ChordGen. Free to use! Edit chords, rearrange them, and download MIDI files for your music production."
                />
                <meta
                    name="keywords"
                    content="Free AI chord generator, free chord progression generator, MIDI chord download, music composition tool, chord editor, natural language music tool"
                />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://www.chordgen.org" />

                {/* Open Graph / Facebook Meta Tags */}
                <meta property="og:title" content="ChordGen – Free AI Chord Generator & MIDI Export Tool" />
                <meta
                    property="og:description"
                    content="Create and customize chord progressions using AI. Completely free! Edit chords and download them as MIDI files instantly."
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.chordgen.org" />
                <meta property="og:image" content="https://www.chordgen.org/chordgen_logo.png" />

                {/* Twitter Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="ChordGen – Free AI Chord Generator & MIDI Export Tool" />
                <meta
                    name="twitter:description"
                    content="Generate chord progressions using AI. 100% free! Edit and download your chords as MIDI files instantly."
                />
                <meta name="twitter:image" content="https://www.chordgen.org/chordgen_logo.png" />

                {/* JSON-LD Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            "name": "ChordGen",
                            "url": "https://www.chordgen.org",
                            "description": "Generate unique chord progressions with AI using natural language input. Free to use. Edit and download chords as MIDI files.",
                            "applicationCategory": "MusicApplication",
                            "operatingSystem": "ALL",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "image": "https://www.chordgen.org/chordgen_logo.png"
                        }),
                    }}
                />
            </Head>
            <main>
                <ClientHome />
            </main>
        </>
    );
}
