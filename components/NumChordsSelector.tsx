"use client";

import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface NumChordsSelectorProps {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
    compact?: boolean;
}

const chordCountOptions = [2, 3, 4, 5, 6, 7, 8];

export default function NumChordsSelector({ value, onChange, disabled, compact = false }: NumChordsSelectorProps) {
    return (
        <div className="flex flex-col items-start gap-1.5">
            <label htmlFor="num-chords-select" className="text-sm text-gray-600 dark:text-gray-300 sr-only">
                Number of Chords
            </label>
            <Select
                value={String(value)}
                onValueChange={(val) => onChange(parseInt(val, 10))}
                disabled={disabled}
                name="num-chords-select"
            >
                <SelectTrigger
                    className={compact ? "w-[110px] h-10 text-sm border-0 bg-transparent focus:ring-0" : "w-full sm:w-[130px] h-16 text-base"}
                    id="num-chords-select"
                    aria-label="Select number of chords to generate"
                >
                    <SelectValue placeholder="Chords" />
                </SelectTrigger>
                <SelectContent>
                    {chordCountOptions.map((num) => (
                        <SelectItem key={num} value={String(num)} className={compact ? "text-sm" : "text-base"}>
                            {num} Chords
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}