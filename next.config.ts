import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
    // Your other Next.js config options can go here
    // For example, if you have reactStrictMode, it would look like:
    // reactStrictMode: true,
};

export default withBundleAnalyzer(nextConfig);