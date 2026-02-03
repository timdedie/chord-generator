import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
    trailingSlash: false,
    async redirects() {
        return [
            {
                source: '/:path*',
                has: [
                    {
                        type: 'host',
                        value: 'chordgen.org',
                    },
                ],
                destination: 'https://www.chordgen.org/:path*',
                permanent: true,
            },
            {
                source: '/results',
                destination: '/app/results',
                permanent: true,
            },
        ];
    },
};

export default withBundleAnalyzer(nextConfig);