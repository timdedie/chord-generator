import React from 'react';
import { MarketingHeader } from '@/components/layouts/MarketingHeader';
import { Footer } from '@/components/Footer';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <MarketingHeader />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </>
    );
}
