"use client";

import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const MobileHeader: React.FC = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true); // This ensures Dialog only mounts on the client side
    }, []);

    if (!mounted) {
        return (
            <header className="flex justify-between items-center p-4 bg-white dark:bg-black shadow-md">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Chord Generator
                </h1>
                {/* Placeholder button to match layout */}
                <Button variant="ghost" size="icon" aria-label="How it works" disabled>
                    <Info className="h-6 w-6" />
                </Button>
            </header>
        );
    }

    return (
        <header className="flex justify-between items-center p-4 bg-white dark:bg-black shadow-md">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Chord Generator
            </h1>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="How it works">
                        <Info className="h-6 w-6" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="p-6 bg-white dark:bg-black">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-black dark:text-white">
                            How It Works
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm text-black dark:text-white">
                        <p>• Tap chords to play them.</p>
                        <p>• Long press chords to lock/unlock.</p>
                        <p>• Generate new progressions with refresh.</p>
                        <p>• Use the desktop version to add, remove and move chords and to download MIDI.</p>
                    </div>
                </DialogContent>
            </Dialog>
        </header>
    );
};

export default MobileHeader;
