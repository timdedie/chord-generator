// components/blog/CTA.tsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export function CTA() {
    return (
        <div className="my-12 p-8 rounded-xl bg-gradient-to-tr from-primary/10 to-transparent border border-primary/20 text-center">
            <Sparkles className="mx-auto h-10 w-10 text-primary mb-4" />
            <h2 className="text-2xl font-bold">Ready to Find the Perfect Chords?</h2>
            <p className="mt-2 mb-6 text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                Stop guessing and start creating. Use the ChordGen AI Generator to spark your next idea in seconds.
            </p>
            <Button asChild size="lg">
                <Link href="/">Try ChordGen for Free</Link>
            </Button>
        </div>
    );
}