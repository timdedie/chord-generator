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
 *  - numbers in the suffix as superscript (now slightly smaller)
 *  - suffix letters inline small
 */
const ChordSymbol: React.FC<ChordSymbolProps> = ({ chord, className = "" }) => {
    // Function to replace 'b' with '♭' and '#' with '♯'
    const replaceAccidentals = (str: string) =>
        str.replace(/b/g, "♭").replace(/#/g, "♯");

    const match = chord.match(/^([A-G](?:#|b)?)(.*)$/);

    let root = match?.[1] ?? chord;
    let suffix = match?.[2] ?? "";

    root = replaceAccidentals(root);
    // Suffix parts will be processed individually

    const parts = suffix.split(/(\d+)/).filter(Boolean);

    return (
        <span
            className={`inline-flex items-baseline select-none ${className}`}
            aria-label={`Chord ${replaceAccidentals(chord)}`} // Also update aria-label
        >
      <span className="text-3xl font-semibold leading-none">{root}</span>
            {parts.length > 0 && (
                <span className="ml-1 flex items-baseline leading-none">
          {parts.map((part, i) =>
              /^\d+$/.test(part) ? (
                  <sup key={i} className="text-lg font-light"> {/* Changed from text-xl to text-lg */}
                      {part} {/* Numbers don't need accidental replacement */}
                  </sup>
              ) : (
                  <span key={i} className="text-xl font-light">
                {replaceAccidentals(part)} {/* Replace accidentals in suffix text parts */}
              </span>
              )
          )}
        </span>
            )}
    </span>
    );
};

export default ChordSymbol;