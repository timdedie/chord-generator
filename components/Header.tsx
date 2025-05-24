"use client";

import React from "react";
import {
    MoveHorizontal,
    Plus,
    RefreshCw,
    X,
    Info,
    PlayCircle,
    Download,
    Piano as PianoIcon,
    BrainCircuit,
    BookOpenText,
    ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import DarkModeToggle from "@/components/DarkModeToggle";

const Header: React.FC = () => {
    return (
        <>
            <header className="absolute top-0 left-0 p-4 sm:p-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                    Chord Generator
                </h1>
            </header>
            <div className="absolute top-0 right-0 p-4 sm:p-8 flex items-center gap-2 sm:gap-4">
                <DarkModeToggle />
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="How it works">
                            <Info className="h-5 w-5 sm:h-6 sm:w-6" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg md:max-w-2xl lg:max-w-3xl p-6 sm:p-8 bg-white dark:bg-black max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-black dark:text-white">
                                How It Works
                            </DialogTitle>
                        </DialogHeader>
                        <DialogDescription asChild>
                            {/* Reverted to grid layout for two columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6"> {/* gap-x for column gap, gap-y for row gap */}
                                <div>
                                    <h3 className="text-md sm:text-lg font-semibold flex items-center gap-2 mb-1 text-black dark:text-white">
                                        <RefreshCw className="h-5 w-5 flex-shrink-0" /> Generating Progressions
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Enter a description (e.g., "happy jazz in C major") and click refresh to generate a new progression.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-md sm:text-lg font-semibold flex items-center gap-2 mb-1 text-black dark:text-white">
                                        <ListOrdered className="h-5 w-5 flex-shrink-0" /> Chord Count
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Select the number of chords (2-8) for your progression using the dropdown.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-md sm:text-lg font-semibold flex items-center gap-2 mb-1 text-black dark:text-white">
                                        <BrainCircuit className="h-5 w-5 flex-shrink-0" /> Deep Think
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Toggle "Deep Think" to use an advanced AI model for generation (slower, potentially better).
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-md sm:text-lg font-semibold flex items-center gap-2 mb-1 text-black dark:text-white">
                                        <BookOpenText className="h-5 w-5 flex-shrink-0" /> Explain Progression
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Click "Explain Progression" for a music theory breakdown of the generated chords.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-md sm:text-lg font-semibold flex items-center gap-2 mb-1 text-black dark:text-white">
                                        <PlayCircle className="h-5 w-5 flex-shrink-0" /> Playing Chords
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Click any chord card to hear it played.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-md sm:text-lg font-semibold flex items-center gap-2 mb-1 text-black dark:text-white">
                                        <MoveHorizontal className="h-5 w-5 flex-shrink-0" /> Rearranging Chords
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Hover a chord, then drag its move icon to reorder. (Desktop only)
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-md sm:text-lg font-semibold flex items-center gap-2 mb-1 text-black dark:text-white">
                                        <Plus className="h-5 w-5 flex-shrink-0" /> Adding Chords
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Click the plus icon (+) between chords to add a new one. (Desktop only)
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-md sm:text-lg font-semibold flex items-center gap-2 mb-1 text-black dark:text-white">
                                        <X className="h-5 w-5 flex-shrink-0" /> Removing Chords
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Hover a chord and click its 'X' icon to remove it. (Desktop only)
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-md sm:text-lg font-semibold flex items-center gap-2 mb-1 text-black dark:text-white">
                                        <Download className="h-5 w-5 flex-shrink-0" /> Downloading MIDI
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Download your progression as a MIDI file. (Desktop only)
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-md sm:text-lg font-semibold flex items-center gap-2 mb-1 text-black dark:text-white">
                                        <PianoIcon className="h-5 w-5 flex-shrink-0" /> Piano Interface
                                    </h3>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        The piano highlights notes as chords play and can be played manually.
                                    </p>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default Header;