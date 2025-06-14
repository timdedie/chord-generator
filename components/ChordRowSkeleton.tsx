"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ChordRowSkeleton() {
    // --- CHANGE: Increased height to h-72 (18rem) to give more vertical space ---
    return <Skeleton className="w-full max-w-3xl h-72 rounded-xl" />;
}