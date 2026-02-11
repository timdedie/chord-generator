"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";

const MidiDownloaderInline = dynamic(
  () => import("@/components/MidiDownloader"),
  {
    loading: () => (
      <Button size="sm" variant="ghost" disabled>
        <Download className="h-4 w-4 mr-1" />
        MIDI
      </Button>
    ),
    ssr: false,
  }
);

const DynamicMarkdownDisplay = dynamic(
  () => import("@/components/MarkdownDisplay"),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Sparkles className="h-6 w-6 animate-pulse text-primary" />
      </div>
    ),
    ssr: false,
  }
);

interface ColumnToolbarProps {
  style: string;
  chords: string[];
  prompt: string;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  isExplanationPopoverOpen: boolean;
  onExplainClick: () => void;
  onPopoverOpenChange: (open: boolean) => void;
  isExplanationLoading: boolean;
  currentExplanationText: string;
}

export default function ColumnToolbar({
  style,
  chords,
  prompt,
  isPlaying,
  onTogglePlayPause,
  isExplanationPopoverOpen,
  onExplainClick,
  onPopoverOpenChange,
  isExplanationLoading,
  currentExplanationText,
}: ColumnToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center gap-3">
        <Button
          onClick={onTogglePlayPause}
          variant="ghost"
          size="icon"
          className="relative w-9 h-9 rounded-full"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isPlaying ? (
              <motion.div
                key="pause"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Pause className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Play className="h-4 w-4" fill="currentColor" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        <h3 className="text-sm font-medium text-foreground">{style}</h3>
      </div>

      <div className="flex items-center gap-1.5">
        <Popover
          open={isExplanationPopoverOpen}
          onOpenChange={onPopoverOpenChange}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExplainClick}
              disabled={isExplanationLoading}
            >
              {isExplanationLoading ? (
                <Sparkles className="h-4 w-4 mr-1 animate-pulse" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              Explain
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[300px] sm:w-[380px] p-4"
            sideOffset={5}
          >
            <h4 className="font-medium leading-none text-sm mb-2">
              Explanation
            </h4>
            <div className="min-h-[50px] w-full">
              {isExplanationLoading && !currentExplanationText && (
                <div className="flex items-center justify-center h-full">
                  <Sparkles className="h-6 w-6 animate-pulse text-primary" />
                </div>
              )}
              {currentExplanationText && (
                <DynamicMarkdownDisplay
                  markdownText={currentExplanationText}
                />
              )}
            </div>
          </PopoverContent>
        </Popover>

        <MidiDownloaderInline chords={chords} prompt={prompt} compact />
      </div>
    </div>
  );
}
