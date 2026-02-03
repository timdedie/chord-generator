'use client';

import React from 'react';
import { AppSidebar } from '@/components/layouts/AppSidebar';
import { MobileSidebar } from '@/components/layouts/MobileSidebar';
import PianoProvider from '@/components/PianoProvider';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PianoProvider>
            <div className="flex min-h-screen bg-gray-50 dark:bg-black">
                <AppSidebar />
                <MobileSidebar />
                <main className="flex-1 md:ml-0 pt-14 md:pt-0">
                    {children}
                </main>
            </div>
        </PianoProvider>
    );
}
