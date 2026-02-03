'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import PianoProvider from '@/components/PianoProvider';

const AppSidebar = dynamic(() => import('@/components/layouts/AppSidebar'), { ssr: false });
const MobileSidebar = dynamic(() => import('@/components/layouts/MobileSidebar'), { ssr: false });

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PianoProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-black">
                <AppSidebar />
                <MobileSidebar />
                <main className="flex-1 pt-14 md:pt-0 md:ml-14">
                    {children}
                </main>
            </div>
        </PianoProvider>
    );
}
