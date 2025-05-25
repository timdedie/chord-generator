"use client";

import React from "react";
import { Info } from "lucide-react"; // Only Info is needed directly here now
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
import { howItWorksItems } from "@/lib/howItWorksData"; // Import the shared data

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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                {howItWorksItems.map((item, index) => (
                                    <div key={index}>
                                        <h3 className="text-md sm:text-lg font-semibold flex items-center gap-2 mb-1 text-black dark:text-white">
                                            <item.IconComponent className="h-5 w-5 flex-shrink-0" /> {item.title}
                                        </h3>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {item.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </DialogDescription>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default Header;