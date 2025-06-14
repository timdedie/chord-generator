"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ChordRowSkeleton() {
    // This component IS the skeleton. It does not render a Card/box around it.
    // It has a fixed height that matches the total height of the ChordRow Card.
    // ChordRow's CardContent has h-52 (13rem) + p-6 (1.5rem top/bottom),
    // making the total height ~16rem, which is h-64 in Tailwind.
    return <Skeleton className="w-full max-w-3xl h-64 rounded-xl" />;
}