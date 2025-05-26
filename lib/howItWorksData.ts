import {
    MoveHorizontal,
    Plus,
    RefreshCw,
    X,
    Info,
    PlayCircle,
    Download,
    Piano as PianoIcon,
    Sparkles,
    BookOpenText,
    ListOrdered,
    LucideIcon, // Import LucideIcon type for better type safety
} from "lucide-react";
import React from "react";

export interface HowItWorksItem {
    title: string;
    description: string;
    IconComponent: LucideIcon; // Use LucideIcon type
}

export const howItWorksItems: HowItWorksItem[] = [
    {
        title: "Generating Progressions",
        description: 'Enter a description (e.g., "happy jazz in C major") and click refresh to generate a new progression.',
        IconComponent: RefreshCw,
    },
    {
        title: "Chord Count",
        description: "Select the number of chords (2-8) for your progression using the dropdown.",
        IconComponent: ListOrdered,
    },
    {
        title: "High Creativity Mode",
        description: 'Toggle "High Creativity Mode" to use a more creative AI model (potentially less musically accurate).',
        IconComponent: Sparkles,
    },
    {
        title: "Explain Progression",
        description: 'Click "Explain Progression" for a music theory breakdown of the generated chords.',
        IconComponent: BookOpenText,
    },
    {
        title: "Playing Chords",
        description: "Click any chord card to hear it played.",
        IconComponent: PlayCircle,
    },
    {
        title: "Rearranging Chords",
        description: "Hover a chord, then drag its move icon to reorder. (Desktop only)",
        IconComponent: MoveHorizontal,
    },
    {
        title: "Adding Chords",
        description: "Click the plus icon (+) between chords to add a new one. (Desktop only)",
        IconComponent: Plus,
    },
    {
        title: "Removing Chords",
        description: "Hover a chord and click its 'X' icon to remove it. (Desktop only)",
        IconComponent: X,
    },
    {
        title: "Downloading MIDI",
        description: "Download your progression as a MIDI file. (Desktop only)",
        IconComponent: Download,
    },
    {
        title: "Piano Interface",
        description: "The piano highlights notes as chords play and can be played manually.",
        IconComponent: PianoIcon,
    },
];