// app/sitemap.ts

import { MetadataRoute } from 'next';

// In the future, you'll fetch your blog posts from a CMS or local files
// This is a placeholder to show how you would do it dynamically.
// For now, we'll hardcode the one post you have.
async function getAllBlogPosts() {
    // Example: When you have more posts, you'd fetch them here.
    // const response = await fetch('https://your-cms.com/api/posts');
    // const posts = await response.json();
    // return posts;

    // For now, just return the static post you have:
    return [
        {
            slug: 'midi-chord-generator-for-producers',
            lastModified: new Date('2025-06-14'),
        },
        {
            slug: 'free-online-piano-chord-generator',
            lastModified: new Date('2025-06-15'),
        },
        {
            slug: 'break-writers-block-random-chord-generator',
            lastModified: new Date('2025-06-15'),
        },
    ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.chordgen.org';

    // 1. Get all your blog posts
    const posts = await getAllBlogPosts();
    const blogPostUrls = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.lastModified,
        changeFrequency: 'weekly' as const, // Or 'monthly' if you don't update them often
        priority: 0.8,
    }));

    // 2. Define all your static pages
    const staticUrls = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 1.0,
        },
        {
            url: `${baseUrl}/how-it-works`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/faq`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        },
    ];

    // 3. Combine and return all URLs
    return [...staticUrls, ...blogPostUrls];
}