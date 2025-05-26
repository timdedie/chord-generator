"use client";
import React from "react";

interface ChordSymbolProps {
    chord: string;
    className?: string;
}

/**
 * Splits a chord string like "F#m7b5" into root "F#" and suffix "m7b5",
 * then renders:
 *  - root as large bold text
 *  - numbers in the suffix as superscript
 *  - suffix letters inline small
 */
const ChordSymbol: React.FC<ChordSymbolProps> = ({ chord, className = "" }) => {
    const match = chord.match(/^([A-G](?:#|b)?)(.*)$/);
    const root = match?.[1] ?? chord;
    const suffix = match?.[2] ?? "";

    const parts = suffix.split(/(\d+)/).filter(Boolean);

    return (
        <span
            className={`inline-flex items-baseline select-none ${className}`}
            aria-label={`Chord ${chord}`}
        >
      <span className="text-3xl font-semibold leading-none">{root}</span>
            {parts.length > 0 && (
                <span className="ml-1 flex items-baseline leading-none">
          {parts.map((part, i) =>
              /^\d+$/.test(part) ? (
                  <sup key={i} className="text-xl font-light">
                      {part}
                  </sup>
              ) : (
                  <span key={i} className="text-xl font-light">
                {part}
              </span>
              )
          )}
        </span>
            )}
    </span>
    );
};

export default ChordSymbol;