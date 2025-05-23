import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.chordgen.org';

export default function sitemap(): MetadataRoute.Sitemap {
    // Get current date for lastModified, or use specific dates if preferred
    const lastModifiedDate = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

    return [
        {
            url: `${BASE_URL}/`,
            lastModified: lastModifiedDate,
            changeFrequency: 'monthly',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: '2025-05-23', // Assuming this content doesn't change often
            changeFrequency: 'yearly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/privacy`,
            lastModified: '2025-05-23', // Assuming this content doesn't change often
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified: '2025-05-23', // Assuming this content doesn't change often
            changeFrequency: 'yearly',
            priority: 0.5,
        },
    ];
}