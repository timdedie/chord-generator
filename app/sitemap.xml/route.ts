// /app/sitemap.xml/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
    const baseUrl = 'https://www.chordgen.org';

    const pages = [
        '', // homepage
        // Add other static pages if needed
    ];

    const body = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages
        .map(
            (page) => `
      <url>
        <loc>${baseUrl}/${page}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
      </url>
    `
        )
        .join('')}
  </urlset>`;

    return new NextResponse(body, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
