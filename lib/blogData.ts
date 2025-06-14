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
    // Add your next blog post here...
];