"use client";
import React from "react";

interface ChordSymbolProps {
    chord: string;
    className?: string;
}

/**
 * Splits a chord string like "F#m7b5" into root "F#" and suffix "m7b5",
 * replaces 'b' with '♭' and '#' with '♯', then renders:
 *  - root as large bold text
 *  - numbers in the suffix as superscript
 *  - suffix letters inline small
 */
const ChordSymbol: React.FC<ChordSymbolProps> = ({ chord, className = "" }) => {
    const replaceAccidentals = (str: string) =>
        str.replace(/b/g, "♭").replace(/#/g, "♯");

    const match = chord.match(/^([A-G](?:#|b)?)(.*)$/);

    let root = match?.[1] ?? chord;
    let suffix = match?.[2] ?? "";

    root = replaceAccidentals(root);

    const parts = suffix.split(/(\d+)/).filter(Boolean);

    return (
        <span
            className={`inline-flex items-baseline select-none ${className}`}
            aria-label={`Chord ${replaceAccidentals(chord)}`}
        >
      <span className="text-3xl font-semibold leading-none">{root}</span>
            {parts.length > 0 && (
                <span className="ml-1 flex items-baseline leading-none">
          {parts.map((part, i) =>
              /^\d+$/.test(part) ? (
                  <sup key={i} className="text-lg font-light"> 
                      {part} 
                  </sup>
              ) : (
                  <span key={i} className="text-xl font-light">
                {replaceAccidentals(part)} 
              </span>
              )
          )}
        </span>
            )}
    </span>
    );
};

export default ChordSymbol;
