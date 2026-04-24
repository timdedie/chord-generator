import { MetadataRoute } from 'next';
import { genres, keys } from '@/lib/seoContent';

// Use a stable date so Google does not see every URL as "modified" on every crawl.
// Bump this when you ship meaningful content updates.
const lastModified = new Date('2026-04-24');

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.chordgen.org';

    const core: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified, changeFrequency: 'monthly', priority: 1.0 },
        { url: `${baseUrl}/app`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/blog`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/chords`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/key`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    ];

    const blog: MetadataRoute.Sitemap = [
        'common-chord-progressions-guide',
        'free-online-piano-chord-generator',
    ].map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    const genrePages: MetadataRoute.Sitemap = genres.map((g) => ({
        url: `${baseUrl}/chords/${g.slug}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    const keyPages: MetadataRoute.Sitemap = keys.map((k) => ({
        url: `${baseUrl}/key/${k.slug}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...core, ...blog, ...genrePages, ...keyPages];
}
