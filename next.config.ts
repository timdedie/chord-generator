import type { NextConfig } from "next";

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
    trailingSlash: false,
    async redirects() {
        return [
            {
                source: '/results',
                destination: '/app/results',
                permanent: true,
            },
        ];
    },
};

export default withBundleAnalyzer(nextConfig);