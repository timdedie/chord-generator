"use client";

import React from "react";

interface ColumnChordInfoProps {
  chord: string;
  textColor: string;
}

const replaceAccidentals = (str: string) =>
  str.replace(/b/g, "\u266D").replace(/#/g, "\u266F");

export default function ColumnChordInfo({
  chord,
  textColor,
}: ColumnChordInfoProps) {
  const match = chord.match(/^([A-G](?:#|b)?)(.*)$/);
  const root = match?.[1] ?? chord;
  const suffix = match?.[2] ?? "";

  const displayRoot = replaceAccidentals(root);
  const parts = suffix.split(/(\d+)/).filter(Boolean);

  return (
    <div
      className="flex flex-col items-center gap-1"
      style={{ color: textColor }}
    >
      <span className="text-4xl md:text-5xl font-bold leading-none">
        {displayRoot}
      </span>
      {/* Fixed-height suffix area so root stays aligned across all columns */}
      <div className="h-7 md:h-8 flex items-start justify-center">
        {parts.length > 0 && (
          <span className="flex items-baseline leading-none">
            {parts.map((part, i) =>
              /^\d+$/.test(part) ? (
                <sup key={i} className="text-lg md:text-xl font-light">
                  {part}
                </sup>
              ) : (
                <span key={i} className="text-xl md:text-2xl font-light">
                  {replaceAccidentals(part)}
                </span>
              )
            )}
          </span>
        )}
      </div>
    </div>
  );
}
