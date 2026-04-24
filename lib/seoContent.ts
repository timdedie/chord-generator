// Static content for SEO landing pages (genres, keys, blog).
// Kept server-only — referenced from RSC pages, generateStaticParams, and sitemap.

export type Progression = {
    name: string;
    roman: string;
    chords: string[];
    key: string;
    description: string;
};

export type Genre = {
    slug: string;
    title: string;
    metaTitle: string;
    metaDescription: string;
    intro: string;
    characteristics: string[];
    progressions: Progression[];
    examples: { song: string; artist: string; progression: string }[];
    relatedGenres: string[];
    promptSeed: string;
};

export const genres: Genre[] = [
    {
        slug: 'lo-fi',
        title: 'Lo-Fi Chord Progressions',
        metaTitle: 'Lo-Fi Chord Progressions: 10 Examples + Free MIDI',
        metaDescription:
            'The chord progressions that define lo-fi hip hop — extended jazz voicings, modal interchange, and dreamy seventh chords. Examples in multiple keys, free MIDI download.',
        intro:
            'Lo-fi hip hop borrows its harmonic vocabulary from jazz: extended chords (7ths, 9ths, 11ths), modal interchange, and chromatic bass motion. The genre favors muted, slightly nostalgic chord voicings — major 7ths over minor i, sus chords that never fully resolve, ii–V cadences pulled out of bebop and slowed to a crawl.',
        characteristics: [
            'Major 7th and minor 7th chords as the harmonic baseline',
            'ii–V–I jazz cadences, often unresolved',
            'Modal interchange (borrowing chords from parallel minor)',
            'Chromatic bass walks between diatonic chords',
            'Tempos between 70–90 BPM with swung 16ths',
        ],
        progressions: [
            {
                name: 'Classic lo-fi loop',
                roman: 'imaj7 – iv7 – ♭VII7 – ♭VImaj7',
                chords: ['Cmaj7', 'Fm7', 'B♭7', 'A♭maj7'],
                key: 'C minor',
                description:
                    'A four-bar loop that captures the J Dilla / Nujabes sound. The major 7 on i creates ambiguity; the ♭VII7 borrows from mixolydian.',
            },
            {
                name: 'Dreamy ii–V vamp',
                roman: 'iim7 – V7 – Imaj7 – VImaj7',
                chords: ['Dm7', 'G7', 'Cmaj7', 'Amaj7'],
                key: 'C major',
                description:
                    'Standard ii–V–I with an unexpected VImaj7 that pulls toward a brief modal shift before looping back.',
            },
            {
                name: 'Nostalgic four-chord',
                roman: 'imaj7 – ♭IIImaj7 – ivm7 – ♭VImaj7',
                chords: ['Amaj7', 'Cmaj7', 'Dm7', 'Fmaj7'],
                key: 'A minor (modal)',
                description:
                    'A wandering progression with no strong tonic pull — perfect for study beats and mellow vocal samples.',
            },
        ],
        examples: [
            { song: 'Feather', artist: 'Nujabes', progression: 'Em9 – Am9 – Dm9 – G7' },
            { song: 'Two Stars', artist: 'J Dilla', progression: 'Fmaj7 – Em7 – Dm7 – Cmaj7' },
        ],
        relatedGenres: ['jazz', 'neo-soul', 'ambient'],
        promptSeed: 'mellow lo-fi hip hop with jazzy 7th chords',
    },
    {
        slug: 'jazz',
        title: 'Jazz Chord Progressions',
        metaTitle: 'Jazz Chord Progressions: ii-V-I, Turnarounds & MIDI',
        metaDescription:
            'The essential jazz progressions: ii–V–I, rhythm changes, Coltrane changes, modal vamps. Free MIDI examples in every key. Built for songwriters and improvisers.',
        intro:
            'Jazz harmony is built on extensions, substitutions, and motion. The ii–V–I is the gravitational center of the language — a tension-and-release pattern that resolves a tritone substitution into a stable tonic. From there, the vocabulary opens into tritone subs, modal interchange, secondary dominants, and Coltrane changes that move in major thirds.',
        characteristics: [
            'Seventh chords as the minimum unit (triads are rare)',
            'ii–V–I as the foundational cadence',
            'Tritone substitutions on dominant chords',
            'Secondary dominants and chromatic approach chords',
            'Modal interchange between parallel major/minor',
        ],
        progressions: [
            {
                name: 'ii–V–I in C major',
                roman: 'iim7 – V7 – Imaj7',
                chords: ['Dm7', 'G7', 'Cmaj7'],
                key: 'C major',
                description: 'The single most common cadence in the jazz repertoire.',
            },
            {
                name: 'Minor ii–V–i',
                roman: 'iim7♭5 – V7♭9 – im7',
                chords: ['Dm7b5', 'G7b9', 'Cm7'],
                key: 'C minor',
                description:
                    'The minor variant uses the half-diminished ii and an altered dominant for a darker resolution.',
            },
            {
                name: 'Rhythm changes A section',
                roman: 'I – vi – ii – V',
                chords: ['B♭maj7', 'Gm7', 'Cm7', 'F7'],
                key: 'B♭ major',
                description:
                    'The 32-bar AABA form derived from "I Got Rhythm" — used in hundreds of bebop heads.',
            },
            {
                name: 'Coltrane changes (excerpt)',
                roman: 'Imaj7 – ♭III7 – ♭VImaj7',
                chords: ['Cmaj7', 'E♭7', 'A♭maj7'],
                key: 'C major (modulating)',
                description:
                    'Movement in major thirds, dividing the octave equally. From "Giant Steps" — harmonic study material.',
            },
        ],
        examples: [
            { song: 'Autumn Leaves', artist: 'Joseph Kosma', progression: 'Cm7 – F7 – B♭maj7 – E♭maj7 – Am7♭5 – D7 – Gm' },
            { song: 'Take the A Train', artist: 'Duke Ellington', progression: 'Cmaj7 – D7 – Dm7 – G7' },
        ],
        relatedGenres: ['lo-fi', 'neo-soul', 'bossa-nova'],
        promptSeed: 'sophisticated jazz progression with ii-V-I cadences',
    },
    {
        slug: 'pop',
        title: 'Pop Chord Progressions',
        metaTitle: 'Pop Chord Progressions: I-V-vi-IV and 6 More + MIDI',
        metaDescription:
            'The chord progressions used in modern pop — I–V–vi–IV, the 50s progression, axis of awesome patterns. With MIDI examples in C, G, and D major.',
        intro:
            'Pop music has converged on a small set of progressions that work across decades and genres. The I–V–vi–IV ("axis") progression alone underpins thousands of hits; rotated variants (vi–IV–I–V, IV–I–V–vi) provide subtle emotional shifts while keeping the same four diatonic chords.',
        characteristics: [
            'Diatonic triads (occasionally with sus2/sus4)',
            'Strong tonic pull with predictable cadences',
            'Repetitive 4-chord loops over verse + chorus',
            'Optional pre-chorus modulation or borrowed chord',
            'Tempos 90–130 BPM',
        ],
        progressions: [
            {
                name: 'The axis progression',
                roman: 'I – V – vi – IV',
                chords: ['C', 'G', 'Am', 'F'],
                key: 'C major',
                description:
                    'Probably the most recorded progression of the last 40 years. "Let It Be," "Don\'t Stop Believin\'," "With or Without You" — all variations.',
            },
            {
                name: 'Sad pop / emotional',
                roman: 'vi – IV – I – V',
                chords: ['Am', 'F', 'C', 'G'],
                key: 'C major',
                description:
                    'Same chords as the axis, rotated to start on vi for an immediate melancholy feel.',
            },
            {
                name: '50s doo-wop',
                roman: 'I – vi – IV – V',
                chords: ['C', 'Am', 'F', 'G'],
                key: 'C major',
                description:
                    'The "Stand By Me" / "Earth Angel" progression. Comforting, nostalgic, instantly familiar.',
            },
        ],
        examples: [
            { song: 'Let It Be', artist: 'The Beatles', progression: 'C – G – Am – F' },
            { song: 'Someone Like You', artist: 'Adele', progression: 'A – E – F♯m – D' },
            { song: 'No Woman No Cry', artist: 'Bob Marley', progression: 'C – G – Am – F' },
        ],
        relatedGenres: ['rock', 'folk', 'country'],
        promptSeed: 'catchy uplifting pop progression with a strong hook',
    },
    {
        slug: 'edm',
        title: 'EDM Chord Progressions',
        metaTitle: 'EDM Chord Progressions for Drops & Builds + MIDI',
        metaDescription:
            'Chord progressions for EDM, house, future bass, and progressive house. Big drops, emotional builds, and supersaw-friendly voicings. Free MIDI for any DAW.',
        intro:
            'EDM harmony is functionally simple — the energy comes from arrangement, sound design, and rhythm. Progressions are typically 4-bar loops in minor keys, with the iv chord providing the emotional lift before a drop. Open voicings (sus2, add9) translate well to supersaws and pluck synths.',
        characteristics: [
            'Minor keys (Am, Em, F♯m most common)',
            'Sus2 and add9 voicings for open, airy textures',
            '4-bar loops for verse, build, and drop sections',
            'Picardy thirds (major resolution) for euphoric drops',
            'Sidechain-friendly sustained pads',
        ],
        progressions: [
            {
                name: 'Future bass drop',
                roman: 'i – ♭VII – ♭VI – ♭VII',
                chords: ['Am', 'G', 'F', 'G'],
                key: 'A minor',
                description:
                    'The classic Flume / Illenium progression. Works with both minor and sus2 voicings.',
            },
            {
                name: 'Progressive house build',
                roman: 'vi – IV – I – V',
                chords: ['Am', 'F', 'C', 'G'],
                key: 'C major',
                description: 'A four-on-the-floor staple that builds energy across a 16-bar phrase.',
            },
            {
                name: 'Deep house / melodic techno',
                roman: 'i – v – ♭VI – ♭VII',
                chords: ['Am', 'Em', 'F', 'G'],
                key: 'A minor',
                description:
                    'Hypnotic and forward-driving. The minor v (instead of dominant V7) keeps it modal.',
            },
        ],
        examples: [
            { song: 'Strobe', artist: 'deadmau5', progression: 'C♯m – A – E – B' },
            { song: 'Never Be Like You', artist: 'Flume', progression: 'F♯m – D – A – E' },
        ],
        relatedGenres: ['pop', 'ambient', 'cinematic'],
        promptSeed: 'euphoric EDM drop with sus2 chords in a minor key',
    },
    {
        slug: 'rnb',
        title: 'R&B Chord Progressions',
        metaTitle: 'R&B Chord Progressions: Neo-Soul, 90s, Modern + MIDI',
        metaDescription:
            'The chord vocabulary of R&B and neo-soul: extended 9ths and 11ths, slash chords, and chromatic motion. Examples from D\'Angelo, Frank Ocean, SZA. Free MIDI.',
        intro:
            'R&B inherits jazz harmony but voices it differently — wider, lusher, with more attention to the bassline. Slash chords are fundamental: a Cmaj7/E or a Bm/D shifts the harmonic center without changing the chord quality. Neo-soul takes this further with rich 9th and 11th extensions.',
        characteristics: [
            'Extended chords: maj9, m9, m11, 13',
            'Slash chords for stepwise bass motion',
            'Chromatic passing chords between diatonic targets',
            'Suspended dominants (V7sus4 → V7)',
            'Modal interchange (♭VII, ♭III) for hip-hop flavor',
        ],
        progressions: [
            {
                name: 'Neo-soul classic',
                roman: 'Imaj9 – iiim7 – vim9 – iim11',
                chords: ['Cmaj9', 'Em7', 'Am9', 'Dm11'],
                key: 'C major',
                description:
                    'The D\'Angelo / Erykah Badu sound — every chord stacked with extensions, no triads in sight.',
            },
            {
                name: 'Modern R&B ballad',
                roman: 'Imaj7 – iiim7 – ivm7 – ♭VIIsus4',
                chords: ['Cmaj7', 'Em7', 'Fm7', 'B♭sus4'],
                key: 'C major',
                description:
                    'The borrowed iv minor adds the bittersweet lift heard in Frank Ocean and SZA productions.',
            },
            {
                name: '90s R&B vamp',
                roman: 'iim7 – V7 – iiim7 – vim7',
                chords: ['Dm7', 'G7', 'Em7', 'Am7'],
                key: 'C major',
                description: 'Backdoor cycle with smooth voice leading — Babyface, Boyz II Men territory.',
            },
        ],
        examples: [
            { song: 'Untitled (How Does It Feel)', artist: "D'Angelo", progression: 'E♭maj7 – Fm7 – Gm7 – A♭maj7' },
            { song: 'Pyramids', artist: 'Frank Ocean', progression: 'Em – Am – D – G' },
        ],
        relatedGenres: ['neo-soul', 'jazz', 'lo-fi'],
        promptSeed: 'smooth R&B with extended 9th chords and slash bass',
    },
    {
        slug: 'rock',
        title: 'Rock Chord Progressions',
        metaTitle: 'Rock Chord Progressions: Power Chords & Anthems + MIDI',
        metaDescription:
            'The progressions that define rock — I–IV–V, vi–IV–I–V anthems, blues-derived 12-bar forms, and modal mixture. Free MIDI examples for guitar and keys.',
        intro:
            'Rock builds on the blues but freely borrows from modes — Mixolydian (♭VII) for British invasion swagger, Dorian (♭III–IV) for grunge, Aeolian for power-chord metal. The I–IV–V remains the bedrock, but the genre\'s identity often comes from the borrowed chords that surround it.',
        characteristics: [
            'Power chords (root + 5th) and open triads',
            '♭VII as a signature borrowed chord',
            '12-bar blues structures in rock and roll',
            'Anthem progressions (vi–IV–I–V) for stadium rock',
            'Suspended chords (sus4) for tension before resolving',
        ],
        progressions: [
            {
                name: 'Three-chord rock',
                roman: 'I – IV – V',
                chords: ['E', 'A', 'B'],
                key: 'E major',
                description: 'The bedrock of rock and roll — Chuck Berry to The Stooges.',
            },
            {
                name: 'Mixolydian rock',
                roman: 'I – ♭VII – IV',
                chords: ['D', 'C', 'G'],
                key: 'D Mixolydian',
                description: '"Sweet Home Alabama," "Sympathy for the Devil," countless others.',
            },
            {
                name: 'Stadium anthem',
                roman: 'vi – IV – I – V',
                chords: ['Am', 'F', 'C', 'G'],
                key: 'C major',
                description:
                    'Big, emotional, instantly recognizable — used by U2, Coldplay, Green Day, and many more.',
            },
        ],
        examples: [
            { song: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', progression: 'D – C – G – D' },
            { song: 'Wonderwall', artist: 'Oasis', progression: 'Em7 – G – Dsus4 – A7sus4' },
        ],
        relatedGenres: ['pop', 'blues', 'folk'],
        promptSeed: 'classic rock progression with mixolydian flavor',
    },
    {
        slug: 'blues',
        title: 'Blues Chord Progressions',
        metaTitle: '12-Bar Blues Chord Progressions + Free MIDI',
        metaDescription:
            'The 12-bar blues, quick-change variations, jazz blues, and minor blues forms. Free MIDI for guitar, piano, and harmonica practice in every key.',
        intro:
            'The 12-bar blues is the most influential 12 measures in popular music. Three chords (I7, IV7, V7) arranged in a fixed pattern provide the template for thousands of songs across blues, rock, jazz, and country. Variations — quick-change, jazz blues, minor blues — extend the form without breaking it.',
        characteristics: [
            'Dominant 7th chords on every degree (I7, IV7, V7)',
            '12-bar AAB lyric structure',
            'Turnaround in the last two bars',
            'Quick-change variant uses IV7 in bar 2',
            'Shuffle or swung 8th-note feel',
        ],
        progressions: [
            {
                name: '12-bar blues',
                roman: 'I7 (×4) – IV7 (×2) – I7 (×2) – V7 – IV7 – I7 – V7',
                chords: ['E7', 'E7', 'E7', 'E7', 'A7', 'A7', 'E7', 'E7', 'B7', 'A7', 'E7', 'B7'],
                key: 'E major',
                description: 'The standard 12-bar form in E — the most common blues guitar key.',
            },
            {
                name: 'Quick-change blues',
                roman: 'I7 – IV7 – I7 – I7 – IV7 – IV7 – I7 – I7 – V7 – IV7 – I7 – V7',
                chords: ['A7', 'D7', 'A7', 'A7', 'D7', 'D7', 'A7', 'A7', 'E7', 'D7', 'A7', 'E7'],
                key: 'A major',
                description: 'The IV chord arrives one bar early — the standard variation.',
            },
            {
                name: 'Minor blues',
                roman: 'i7 – iv7 – i7 – i7 – iv7 – iv7 – i7 – i7 – ♭VI7 – V7 – i7 – V7',
                chords: ['Am7', 'Dm7', 'Am7', 'Am7', 'Dm7', 'Dm7', 'Am7', 'Am7', 'F7', 'E7', 'Am7', 'E7'],
                key: 'A minor',
                description: 'Darker, more melancholy form — used by B.B. King, Otis Rush, and Gary Moore.',
            },
        ],
        examples: [
            { song: 'Pride and Joy', artist: 'Stevie Ray Vaughan', progression: 'E7 – A7 – B7 (12-bar)' },
            { song: 'The Thrill Is Gone', artist: 'B.B. King', progression: 'Bm – Em – Bm – F♯7 (minor blues)' },
        ],
        relatedGenres: ['rock', 'jazz', 'country'],
        promptSeed: '12-bar blues shuffle in a guitar-friendly key',
    },
    {
        slug: 'neo-soul',
        title: 'Neo-Soul Chord Progressions',
        metaTitle: 'Neo-Soul Chord Progressions: Lush Voicings + MIDI',
        metaDescription:
            'Neo-soul chord progressions inspired by D\'Angelo, Erykah Badu, Robert Glasper. Extended chords, modal mixture, chromatic motion. Free MIDI download.',
        intro:
            'Neo-soul fuses jazz harmony with hip-hop rhythm and soul vocals. Chords are voiced wide and rich — m9s, maj13s, sus chords with added 9ths — and the bass often moves chromatically beneath them. Robert Glasper, D\'Angelo, and Hiatus Kaiyote are the modern reference points.',
        characteristics: [
            'Wide, lush voicings (9ths, 11ths, 13ths)',
            'Chromatic bass walks',
            'ii–V cadences without a final I (suspended forever)',
            'Modal mixture between major and parallel minor',
            'Loose, behind-the-beat groove',
        ],
        progressions: [
            {
                name: "D'Angelo voicing",
                roman: 'imaj9 – ivm11 – ♭VIImaj9 – ♭IIImaj9',
                chords: ['Cmaj9', 'Fm11', 'B♭maj9', 'E♭maj9'],
                key: 'C minor (modal)',
                description: 'A constantly modulating progression that never quite settles.',
            },
            {
                name: 'Glasper-style cycle',
                roman: 'iim9 – V13 – Imaj9 – ♭VIImaj9',
                chords: ['Dm9', 'G13', 'Cmaj9', 'B♭maj9'],
                key: 'C major',
                description: 'The ♭VIImaj9 at the end pulls the ear into modal territory.',
            },
        ],
        examples: [
            { song: 'Cranes in the Sky', artist: 'Solange', progression: 'Bm9 – Emaj9 – C♯m9' },
            { song: 'Liquid Spirit', artist: 'Gregory Porter', progression: 'Cm9 – Fm9 – B♭7 – E♭maj7' },
        ],
        relatedGenres: ['rnb', 'jazz', 'lo-fi'],
        promptSeed: 'lush neo-soul with extended chords and chromatic bass',
    },
    {
        slug: 'cinematic',
        title: 'Cinematic Chord Progressions',
        metaTitle: 'Cinematic Chord Progressions for Film Score + MIDI',
        metaDescription:
            'Epic cinematic chord progressions for film, trailer, and game music. Borrowed chords, modal mixture, and dramatic tension. Free MIDI for any DAW.',
        intro:
            'Cinematic harmony exploits modal mixture and unresolved tension. The progression doesn\'t need to "go" anywhere — it needs to feel like something. Hans Zimmer\'s i–♭VI–♭III–♭VII (the "Inception sound") is the modern shorthand for epic. Lydian raised 4ths suggest wonder; Phrygian ♭2s suggest dread.',
        characteristics: [
            'Modal mixture (♭VI, ♭III, ♭VII borrowed from minor)',
            'Open fifths and octaves for orchestral weight',
            'Suspended pedal tones across chord changes',
            'Unresolved Picardy thirds for ambiguity',
            'Slow tempos with sustained pads',
        ],
        progressions: [
            {
                name: 'Epic minor cycle',
                roman: 'i – ♭VI – ♭III – ♭VII',
                chords: ['Am', 'F', 'C', 'G'],
                key: 'A minor',
                description: 'The "Inception" / "Skyrim" cycle. Heroic and dark in equal measure.',
            },
            {
                name: 'Lydian wonder',
                roman: 'I – II – I',
                chords: ['C', 'D', 'C'],
                key: 'C Lydian',
                description: 'The raised 4th of Lydian creates the sense of awe used by John Williams in fantasy scores.',
            },
            {
                name: 'Tension build',
                roman: 'i – ♭II – i – V',
                chords: ['Am', 'B♭', 'Am', 'E'],
                key: 'A Phrygian dominant',
                description: 'The ♭II creates Phrygian dread; resolution to V keeps it unstable.',
            },
        ],
        examples: [
            { song: 'Time', artist: 'Hans Zimmer (Inception)', progression: 'Am – F – C – G' },
            { song: 'Cornfield Chase', artist: 'Hans Zimmer (Interstellar)', progression: 'F – Am – C – G' },
        ],
        relatedGenres: ['ambient', 'edm', 'classical'],
        promptSeed: 'epic cinematic progression with modal mixture',
    },
    {
        slug: 'ambient',
        title: 'Ambient Chord Progressions',
        metaTitle: 'Ambient Chord Progressions: Pads, Drones + MIDI',
        metaDescription:
            'Ambient chord progressions for pads, drones, and atmospheric music. Slow harmonic motion, suspended chords, modal voicings. Free MIDI download.',
        intro:
            'Ambient music treats harmony as texture. Chords change slowly — sometimes one chord per minute — and the focus is on overtones, voicing, and timbre rather than harmonic motion. Suspended chords, open fifths, and modal vamps form the vocabulary.',
        characteristics: [
            'Suspended and open-fifth voicings',
            'Modal vamps (often Lydian or Dorian)',
            'Pedal tones held across changes',
            'Slow harmonic rhythm (4–32 bars per chord)',
            'Avoidance of strong V–I cadences',
        ],
        progressions: [
            {
                name: 'Drifting suspended',
                roman: 'Isus2 – IVsus2 – vimsus – Isus2',
                chords: ['Csus2', 'Fsus2', 'Amsus', 'Csus2'],
                key: 'C major (modal)',
                description: 'No 3rds anywhere — pure suspended motion that floats without resolving.',
            },
            {
                name: 'Modal Lydian drone',
                roman: 'Imaj7♯11 (sustained)',
                chords: ['Cmaj7♯11'],
                key: 'C Lydian',
                description: 'A single chord, voiced with the ♯11, can carry an entire 8-minute piece.',
            },
        ],
        examples: [
            { song: '1/1', artist: 'Brian Eno', progression: 'Csus2 (sustained drone)' },
            { song: 'Avril 14th', artist: 'Aphex Twin', progression: 'Fmaj7 – Em7 – Am – Dm' },
        ],
        relatedGenres: ['cinematic', 'lo-fi', 'edm'],
        promptSeed: 'slowly evolving ambient pad progression',
    },
    {
        slug: 'folk',
        title: 'Folk Chord Progressions',
        metaTitle: 'Folk Chord Progressions: Open Chords + MIDI',
        metaDescription:
            'The chord progressions of folk music — open guitar voicings, modal melodies, three-chord ballads. Free MIDI examples for songwriters.',
        intro:
            'Folk music favors open guitar chords (G, C, D, Em, Am) and modal scales. Many traditional folk songs sit in Mixolydian or Dorian modes, giving them a slightly antique sound. Modern indie folk (Bon Iver, Fleet Foxes) extends the vocabulary with sus chords and unusual voicings.',
        characteristics: [
            'Open-position guitar chords',
            'Mixolydian (♭VII) and Dorian (♭III) modal flavors',
            'Three- to four-chord ballad structures',
            'Capo-friendly keys (G, C, D, A)',
            'Acoustic instrumentation drives voicing choices',
        ],
        progressions: [
            {
                name: 'Three-chord folk',
                roman: 'I – IV – V',
                chords: ['G', 'C', 'D'],
                key: 'G major',
                description: 'The simplest folk pattern — countless traditional songs use just these three.',
            },
            {
                name: 'Mixolydian ballad',
                roman: 'I – ♭VII – IV – I',
                chords: ['G', 'F', 'C', 'G'],
                key: 'G Mixolydian',
                description: 'The ♭VII gives folk songs their wistful, slightly archaic quality.',
            },
            {
                name: 'Indie folk',
                roman: 'vi – IV – I – V',
                chords: ['Em', 'C', 'G', 'D'],
                key: 'G major',
                description: 'The pop axis progression voiced with open guitar chords — Mumford & Sons, The Lumineers.',
            },
        ],
        examples: [
            { song: 'The Times They Are a-Changin\'', artist: 'Bob Dylan', progression: 'G – Em – C – D' },
            { song: 'Skinny Love', artist: 'Bon Iver', progression: 'Am – C – G – Dm' },
        ],
        relatedGenres: ['country', 'pop', 'rock'],
        promptSeed: 'fingerstyle acoustic folk progression in an open key',
    },
    {
        slug: 'country',
        title: 'Country Chord Progressions',
        metaTitle: 'Country Chord Progressions: Honky Tonk to Modern + MIDI',
        metaDescription:
            'Classic and modern country chord progressions. Three-chord honky tonk, train beats, modern country pop. Free MIDI in guitar-friendly keys.',
        intro:
            'Country sticks closer to the I–IV–V than almost any other genre, but uses the V7 → I cadence with religious frequency and adds a vi for the wistful turn. Modern country has absorbed pop\'s vi–IV–I–V, but the bones remain the same.',
        characteristics: [
            'I, IV, V, and vi as the core vocabulary',
            'V7 dominant (with the b7) at every cadence',
            'Walking bass between chord roots',
            'Major keys (G, D, A, E) on guitar',
            'Train-beat rhythm in classic country',
        ],
        progressions: [
            {
                name: 'Honky tonk',
                roman: 'I – IV – I – V',
                chords: ['G', 'C', 'G', 'D'],
                key: 'G major',
                description: 'The Hank Williams template — three chords and the truth.',
            },
            {
                name: 'Country ballad',
                roman: 'I – V – vi – IV',
                chords: ['G', 'D', 'Em', 'C'],
                key: 'G major',
                description: 'The pop axis works for country too — used by Garth Brooks, Carrie Underwood, and many others.',
            },
        ],
        examples: [
            { song: 'Ring of Fire', artist: 'Johnny Cash', progression: 'G – C – D' },
            { song: 'Friends in Low Places', artist: 'Garth Brooks', progression: 'A – D – E' },
        ],
        relatedGenres: ['folk', 'rock', 'blues'],
        promptSeed: 'classic country honky tonk in a guitar-friendly key',
    },
    {
        slug: 'gospel',
        title: 'Gospel Chord Progressions',
        metaTitle: 'Gospel Chord Progressions: Cycles & Reharmonization + MIDI',
        metaDescription:
            'Gospel chord progressions: the gospel cycle, reharmonization patterns, and rich extended voicings. Free MIDI for piano and organ.',
        intro:
            'Gospel piano is built on motion — chords don\'t sit still. The gospel cycle (a sequence of secondary dominants) cycles through all 12 keys; reharmonization techniques replace simple cadences with chromatic substitutions. Every cadence is decorated.',
        characteristics: [
            'Secondary dominants on every chord',
            'Tritone substitutions in turnarounds',
            'Extended voicings (9ths, 13ths) at every chord',
            'Chromatic passing chords between diatonic targets',
            'Melodic bass that contradicts chord roots',
        ],
        progressions: [
            {
                name: 'Gospel turnaround',
                roman: 'I – VI7 – ii7 – V7',
                chords: ['C', 'A7', 'Dm7', 'G7'],
                key: 'C major',
                description: 'The VI7 secondary dominant pulls into the ii — every gospel pianist\'s default.',
            },
            {
                name: 'Reharmonized I–IV',
                roman: 'I – I7/♭7 – IV/3 – ivm',
                chords: ['C', 'C7', 'F/A', 'Fm'],
                key: 'C major',
                description: 'A walked-up reharm of the basic I–IV move using bass motion and modal mixture.',
            },
        ],
        examples: [
            { song: 'Oh Happy Day', artist: 'Edwin Hawkins', progression: 'A – D – E – A' },
            { song: 'How Great Is Our God', artist: 'Chris Tomlin', progression: 'C – Am – F – G' },
        ],
        relatedGenres: ['rnb', 'jazz', 'neo-soul'],
        promptSeed: 'gospel progression with secondary dominants and reharmonization',
    },
    {
        slug: 'bossa-nova',
        title: 'Bossa Nova Chord Progressions',
        metaTitle: 'Bossa Nova Chord Progressions: Brazilian Jazz + MIDI',
        metaDescription:
            'Bossa nova chord progressions inspired by Jobim, Gilberto, and Mendes. ii–V–I in Brazilian style, modal interchange, free MIDI download.',
        intro:
            'Bossa nova is jazz harmony filtered through Brazilian rhythm. Jobim\'s vocabulary leans on ii–V–I, but with constant modal interchange and chromatic root motion. The famous "Girl from Ipanema" intro modulates through a circle of secondary dominants.',
        characteristics: [
            'ii–V–I cadences in major and minor',
            'Tritone substitutions for chromatic bass',
            'Maj7 and m7 as the default chord qualities',
            'Modal interchange via ♭VI and ♭III',
            'Slow, steady tempo with the bossa rhythm pattern',
        ],
        progressions: [
            {
                name: 'Bossa ii–V–I',
                roman: 'iim7 – V7 – Imaj7 – VI7',
                chords: ['Dm7', 'G7', 'Cmaj7', 'A7'],
                key: 'C major',
                description: 'The VI7 turnaround pulls back to the ii of the next cycle.',
            },
            {
                name: 'Modal bossa',
                roman: 'Imaj7 – ♭VIImaj7 – Imaj7 – ♭VImaj7',
                chords: ['Cmaj7', 'B♭maj7', 'Cmaj7', 'A♭maj7'],
                key: 'C major (modal)',
                description: 'Jobim used this kind of stepwise motion in "Wave" and "Triste".',
            },
        ],
        examples: [
            { song: 'The Girl from Ipanema', artist: 'Jobim', progression: 'Fmaj7 – G7 – Gm7 – F♯7' },
            { song: 'Corcovado', artist: 'Jobim', progression: 'Am7 – D7 – Gmaj7 – Bm7♭5' },
        ],
        relatedGenres: ['jazz', 'lo-fi', 'rnb'],
        promptSeed: 'bossa nova progression in the style of Jobim',
    },
];

export type KeyContent = {
    slug: string;
    label: string;
    tonic: string;
    quality: 'major' | 'minor';
    metaTitle: string;
    metaDescription: string;
    intro: string;
    diatonicChords: string[];
    diatonicRoman: string[];
    progressions: Progression[];
    relativeKey: { label: string; slug: string };
    promptSeed: string;
};

const majorRoman = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const minorRoman = ['i', 'ii°', '♭III', 'iv', 'v', '♭VI', '♭VII'];

// Keys whose relative would require an enharmonic outside this set (Gb major, D# minor)
// are intentionally omitted — Eb minor and F# major.
const majorScales: Record<string, string[]> = {
    C: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
    G: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
    D: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
    A: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
    E: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
    B: ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
    F: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm', 'Edim'],
    Bb: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'Adim'],
    Eb: ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm', 'Ddim'],
    Ab: ['Ab', 'Bbm', 'Cm', 'Db', 'Eb', 'Fm', 'Gdim'],
    Db: ['Db', 'Ebm', 'Fm', 'Gb', 'Ab', 'Bbm', 'Cdim'],
};

const minorScales: Record<string, string[]> = {
    A: ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'],
    E: ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'],
    B: ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A'],
    'F#': ['F#m', 'G#dim', 'A', 'Bm', 'C#m', 'D', 'E'],
    'C#': ['C#m', 'D#dim', 'E', 'F#m', 'G#m', 'A', 'B'],
    'G#': ['G#m', 'A#dim', 'B', 'C#m', 'D#m', 'E', 'F#'],
    D: ['Dm', 'Edim', 'F', 'Gm', 'Am', 'Bb', 'C'],
    G: ['Gm', 'Adim', 'Bb', 'Cm', 'Dm', 'Eb', 'F'],
    C: ['Cm', 'Ddim', 'Eb', 'Fm', 'Gm', 'Ab', 'Bb'],
    F: ['Fm', 'Gdim', 'Ab', 'Bbm', 'Cm', 'Db', 'Eb'],
    Bb: ['Bbm', 'Cdim', 'Db', 'Ebm', 'Fm', 'Gb', 'Ab'],
};

const flatLabel = (s: string) => s.replace(/b/g, '♭').replace(/#/g, '♯');

const slugifyKey = (tonic: string, quality: 'major' | 'minor') => {
    const t = tonic.replace('#', '-sharp').replace('b', '-flat').toLowerCase();
    return `${t}-${quality}`;
};

const relativePairs: Record<string, string> = {
    'c-major': 'a-minor', 'a-minor': 'c-major',
    'g-major': 'e-minor', 'e-minor': 'g-major',
    'd-major': 'b-minor', 'b-minor': 'd-major',
    'a-major': 'f-sharp-minor', 'f-sharp-minor': 'a-major',
    'e-major': 'c-sharp-minor', 'c-sharp-minor': 'e-major',
    'b-major': 'g-sharp-minor', 'g-sharp-minor': 'b-major',
    'f-sharp-major': 'd-sharp-minor', 'd-sharp-minor': 'f-sharp-major',
    'f-major': 'd-minor', 'd-minor': 'f-major',
    'b-flat-major': 'g-minor', 'g-minor': 'b-flat-major',
    'e-flat-major': 'c-minor', 'c-minor': 'e-flat-major',
    'a-flat-major': 'f-minor', 'f-minor': 'a-flat-major',
    'd-flat-major': 'b-flat-minor', 'b-flat-minor': 'd-flat-major',
};

const labelize = (slug: string) => {
    const withQuality = slug
        .replace('-sharp-', '♯ ')
        .replace('-flat-', '♭ ')
        .replace('-major', ' Major')
        .replace('-minor', ' Minor');
    return withQuality.charAt(0).toUpperCase() + withQuality.slice(1);
};

function buildMajorKey(tonic: string): KeyContent {
    const slug = slugifyKey(tonic, 'major');
    const chords = majorScales[tonic];
    const label = `${flatLabel(tonic)} Major`;
    return {
        slug,
        label,
        tonic,
        quality: 'major',
        metaTitle: `${label} Chord Progressions: I-V-vi-IV in ${flatLabel(tonic)} + MIDI`,
        metaDescription: `Chord progressions in the key of ${label}. The diatonic chords, common patterns (I–V–vi–IV, I–IV–V, ii–V–I), and free MIDI download.`,
        intro: `The key of ${label} is built on the ${label} scale: ${flatLabel(tonic)}, ${chords.slice(1).map((c) => flatLabel(c.replace(/m|dim/, ''))).join(', ')}. Its diatonic chords give you everything you need to harmonize a melody — three majors (I, IV, V), three minors (ii, iii, vi), and one diminished (vii°). Most pop, rock, and folk songs in this key never venture outside this set.`,
        diatonicChords: chords,
        diatonicRoman: majorRoman,
        progressions: [
            {
                name: `Pop axis in ${label}`,
                roman: 'I – V – vi – IV',
                chords: [chords[0], chords[4], chords[5], chords[3]],
                key: label,
                description: 'The most common four-chord progression in popular music.',
            },
            {
                name: `50s progression in ${label}`,
                roman: 'I – vi – IV – V',
                chords: [chords[0], chords[5], chords[3], chords[4]],
                key: label,
                description: 'Doo-wop and early rock and roll. Stand By Me, Earth Angel.',
            },
            {
                name: `ii–V–I in ${label}`,
                roman: 'ii – V – I',
                chords: [chords[1], chords[4], chords[0]],
                key: label,
                description: 'The jazz cadence — works equally well in pop choruses.',
            },
            {
                name: `Three-chord rock in ${label}`,
                roman: 'I – IV – V',
                chords: [chords[0], chords[3], chords[4]],
                key: label,
                description: 'Blues, country, rock and roll — all built on this triad.',
            },
        ],
        relativeKey: {
            label: labelize(relativePairs[slug]),
            slug: relativePairs[slug],
        },
        promptSeed: `progression in the key of ${label}`,
    };
}

function buildMinorKey(tonic: string): KeyContent {
    const slug = slugifyKey(tonic, 'minor');
    const chords = minorScales[tonic];
    const label = `${flatLabel(tonic)} Minor`;
    return {
        slug,
        label,
        tonic,
        quality: 'minor',
        metaTitle: `${label} Chord Progressions: i-VI-III-VII in ${flatLabel(tonic)} + MIDI`,
        metaDescription: `Chord progressions in the key of ${label}. Natural minor diatonic chords, common patterns (i–♭VI–♭III–♭VII, i–iv–V), and free MIDI download.`,
        intro: `The key of ${label} is built on the natural minor scale starting on ${flatLabel(tonic)}. Its diatonic chords give it a darker, more introspective character than the parallel major. The i–♭VI–♭III–♭VII cycle (heard in everything from "Africa" to "Time" by Hans Zimmer) is the most recognizable minor-key progression in modern music.`,
        diatonicChords: chords,
        diatonicRoman: minorRoman,
        progressions: [
            {
                name: `Epic minor cycle in ${label}`,
                roman: 'i – ♭VI – ♭III – ♭VII',
                chords: [chords[0], chords[5], chords[2], chords[6]],
                key: label,
                description: 'The most-used minor progression of the last 40 years.',
            },
            {
                name: `Andalusian cadence in ${label}`,
                roman: 'i – ♭VII – ♭VI – V',
                chords: [chords[0], chords[6], chords[5], chords[4].replace('m', '')],
                key: label,
                description: 'Flamenco, surf rock, and metal all use this descending pattern.',
            },
            {
                name: `Minor i–iv–V in ${label}`,
                roman: 'i – iv – V',
                chords: [chords[0], chords[3], chords[4].replace('m', '')],
                key: label,
                description: 'The harmonic minor cadence with a major V — used in classical and metal.',
            },
            {
                name: `Sad pop in ${label}`,
                roman: 'i – ♭VI – ♭III – ♭VII',
                chords: [chords[0], chords[5], chords[2], chords[6]],
                key: label,
                description: 'Reflective and melancholic — used in pop ballads and indie.',
            },
        ],
        relativeKey: {
            label: labelize(relativePairs[slug]),
            slug: relativePairs[slug],
        },
        promptSeed: `melancholic progression in ${label}`,
    };
}

export const keys: KeyContent[] = [
    ...Object.keys(majorScales).map(buildMajorKey),
    ...Object.keys(minorScales).map(buildMinorKey),
];

export const getGenre = (slug: string) => genres.find((g) => g.slug === slug);
export const getKey = (slug: string) => keys.find((k) => k.slug === slug);
