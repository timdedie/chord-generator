// lib/blogData.ts
export interface Post {
    slug: string;
    title: string;
    description: string;
    date: string;
}

export const posts: Post[] = [
    {
        slug: 'midi-chord-generator-for-producers',
        title: 'How a MIDI Chord Generator Can Break Your Writer\'s Block',
        description: 'Staring at a blank piano roll? Discover how a MIDI chord generator can instantly spark new ideas, accelerate your workflow, and help you learn music theory along the way.',
        date: '2025-06-14',
    },
    {
        slug: 'free-online-piano-chord-generator',
        title: 'The Ultimate Guide to Using a Free Online Piano Chord Generator',
        date: '2025-06-15',
        description: 'Learn how to instantly create amazing piano chord progressions for free using an AI-powered chord maker. A step-by-step guide for musicians of all levels.'
    },
    {
        slug: 'break-writers-block-random-chord-generator',
        title: 'How a Random Chord Progression Generator Can Break Writer\'s Block',
        date: '2025-06-15', // Use today's date
        description: 'Feeling stuck? Learn how to use a random and AI chord generator to spark instant inspiration, find new ideas, and download free MIDI progressions for your next track.'
    },
    {
        slug: 'common-chord-progressions-guide',
        title: 'Common Chord Progressions: The Complete Guide for Musicians',
        date: '2025-11-07',
        description: 'Master the most popular chord progressions used in music. From I-V-vi-IV to jazz standards, learn the theory and hear examples of progressions that work in every genre.'
    }
    // Add your next blog post here...
];