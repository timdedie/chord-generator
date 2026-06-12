import React from 'react';
import { JetBrains_Mono } from 'next/font/google';
import { MarketingHeader } from '@/components/layouts/MarketingHeader';
import { Footer } from '@/components/Footer';

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-mono',
    display: 'swap',
});

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`${jetbrainsMono.variable} contents`}>
            <MarketingHeader />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
}
