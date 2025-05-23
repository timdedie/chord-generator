import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*', // Applies to all user-agents (bots)
                allow: '/',     // Allows crawling of all content under the root
                // disallow: '/private/', // Example: if you had private pages
            },
        ],
        sitemap: 'https://www.chordgen.org/sitemap.xml',
    };
}