"use client";

import React from "react";
import { Sun, Moon, Info, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface HeaderProps {
    darkMode: boolean;
    onToggleDarkMode: (checked: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, onToggleDarkMode }) => {
    return (
        <>
            {/* Left side: Page Title */}
            <header className="absolute top-0 left-0 p-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    Chord Generator
                </h1>
            </header>

            {/* Right side: Dark Mode Toggle & Info Dialog */}
            <div className="absolute top-0 right-0 p-8 flex items-center gap-4">
                {/* Dark Mode Toggle */}
                <div className="flex items-center gap-2">
                    <Sun className="h-6 w-6 text-yellow-500" />
                    <Switch checked={darkMode} onCheckedChange={onToggleDarkMode} />
                    <Moon className="h-6 w-6 text-gray-300" />
                </div>

                {/* "How It Works" Dialog */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="How it works">
                            <Info className="h-6 w-6" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl p-8 bg-white dark:bg-black">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold mb-4 text-black dark:text-white">
                                How It Works
                            </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-black dark:text-white">
                                        <RefreshCw className="h-5 w-5" /> Generating Progressions
                                    </h3>
                                    <p className="text-sm text-black dark:text-white">
                                        Enter a description (e.g., "happy jazz in C major") and click refresh to generate a new progression.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-black dark:text-white">
                                        <Info className="h-5 w-5" /> Playing Chords
                                    </h3>
                                    <p className="text-sm text-black dark:text-white">
                                        Click a chord to hear it played on the piano.
                                    </p>
                                </div>
                                {/* You can add more sections as needed */}
                            </div>
                        </DialogDescription>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default Header;
