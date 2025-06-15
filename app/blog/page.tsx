// app/blog/page.tsx (The New Server Component Shell)

// NO 'use client' here!

import type { Metadata } from 'next';
import BlogIndexClient from './BlogIndexClient'; // Import the client component we just made

// ✅ Metadata lives here, in a server component, where it belongs.
export const metadata: Metadata = {
    title: 'Blog', // Will become "Blog | ChordGen" via your layout template
    description: 'The ChordGen Blog: Songwriting tips, music theory insights, and product updates to help you create better music.',
    alternates: {
        canonical: '/blog', // The correct canonical URL for the blog index
    },
};

// This is the entire page component. It just renders the client part.
export default function BlogIndexPage() {
    return <BlogIndexClient />;
}