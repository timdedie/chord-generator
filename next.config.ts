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
                source: '/results',
                destination: '/app/results',
                permanent: true,
            },
        ];
    },
};

export default withBundleAnalyzer(nextConfig);