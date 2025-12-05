# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ChordGen is a Next.js 15 web application that generates musical chord progressions using AI. Users describe a mood, genre, or style, and the AI (DeepSeek) generates chord progressions that can be visualized on a piano keyboard, played back, edited, and exported as MIDI files.

## Development Commands

```bash
# Development server (uses Turbopack)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Environment Variables

Required in `.env.local`:
- `DEEPSEEK_API_KEY` - API key for DeepSeek AI service (used for both chord generation and explanations)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key (optional)
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL (optional)

## Core Architecture

### AI Chord Generation Flow

1. **User Input** → `ClientHome.tsx` (main client component)
2. **API Request** → `/app/api/generate/route.ts` (Next.js API route)
3. **AI Generation** → DeepSeek AI with structured output using Zod schemas
4. **Validation** → Tonal.js validates chord symbols and provides canonical forms
5. **State Management** → `useChordManagement` hook manages chord array state
6. **UI Update** → ChordRow/MobileChordGrid display chords with piano visualization

### Key Components

**Main Application Flow:**
- `app/page.tsx` → Entry point, renders `ClientHome`
- `components/ClientHome.tsx` → Main client component orchestrating all interactions
- `components/ChordGenerator.tsx` → Input field and example prompts UI
- `components/ChordRow.tsx` → Desktop chord display with drag-and-drop
- `components/MobileChordRow.tsx` → Mobile-optimized grid layout
- `components/PianoKeyboard.tsx` → Fixed bottom piano visualization

**State Management:**
- `hooks/useChordManagement.ts` → Core hook managing chord state, generation, and manipulation
- `hooks/useExamplePrompts.ts` → Manages random example prompts
- `components/PianoProvider.tsx` → Context provider for Tone.js piano sampler instance

### API Routes

**`/api/generate` (POST)**
- Generates chord progressions or single chords
- Request body:
  - Full progression: `{ prompt: string, numChords: number, existingChords?: [] }`
  - Single chord: `{ prompt?: string, existingChords: [], addChordPosition: number }`
- Uses Zod schemas with `.refine()` to validate chord symbols via Tonal.js
- Implements retry logic (MAX_RETRIES = 2) for invalid AI responses
- Returns: `{ chords: string[] }` or `{ chord: string }`

**`/api/explain-progression` (POST)**
- Generates music theory explanations for chord progressions
- Request body: `{ chords: string[], prompt?: string }`
- Streams response using `streamText` from Vercel AI SDK
- Returns text stream explaining the progression

### Audio Architecture

**Piano Sampler Setup:**
- `PianoProvider.tsx` initializes Tone.js Sampler with lazy loading
- Samples stored in `/public/piano/*.mp3`
- `loadSamples()` called on first user interaction (button click)
- Piano instance shared via React Context

**Playback:**
- Single chords: `playChordOnce()` in ClientHome
- Progression playback: `playNextChord()` with sequential timeouts
- Voice leading: `getVoicedChordNotes()` creates bass + voiced chord notes

### Chord Data Structure

```typescript
interface ChordItem {
  id: string;           // Unique ID for React keys and drag-drop
  chord: string;        // Canonical chord symbol from Tonal.js (e.g., "Cmaj7", "F#m7b5")
}
```

### Important Libraries

- **Tonal.js** - Music theory library for chord parsing and validation
- **Tone.js** - Web Audio API wrapper for audio playback
- **@dnd-kit** - Drag and drop for chord reordering
- **Vercel AI SDK** - Structured AI generation with streaming
- **Zod** - Schema validation for AI responses
- **react-piano** - Piano keyboard visualization
- **PostHog** - Analytics tracking

## Chord Validation Rules

Chords must adhere to strict formatting rules defined in `/app/api/generate/route.ts`:
- Root: Uppercase A-G with # or b (e.g., F#, Bb)
- Major triad: Just root (C, F#)
- Minor: "m" suffix (Am, Bbm)
- Seventh chords: 7, maj7/M7, m7, mM7, dim7/°7, m7b5/ø
- Suspended: sus2, sus4, 7sus4
- Extensions: 9, 11, 13 with major variants (maj9, maj11, maj13)
- Alterations: b or # (G7b9, C7#5, Fmaj7#11)
- Slash chords: / for inversions (C/E, Am7/G)
- **Never use triangle symbol (△)** - use "maj7" or "M7" instead

The `ValidChordStringSchema` in `/app/api/generate/route.ts` enforces these rules using Zod transforms and refinements with Tonal.js validation.

## State and Props Flow

**Generation Flow:**
1. User types prompt in `ChordGenerator` input
2. Click generate → `handleGenerateChordsRequestAndTrack()` in ClientHome
3. Calls `generateChords({ numChords })` from `useChordManagement`
4. Fetches `/api/generate` with prompt and numChords
5. Updates `chords` state array with validated ChordItem objects
6. ChordRow/MobileChordGrid re-render with new chords

**Add Chord Flow:**
1. Click "+" button on ChordRow → `handleAddChordRequestAndTrack(position)`
2. Calls `addChordAt(position)` from `useChordManagement`
3. Inserts placeholder ChordItem with empty chord string
4. Fetches `/api/generate` with `addChordPosition` and `existingChords`
5. Replaces placeholder with validated chord from API

## Analytics

PostHog events tracked throughout the application:
- `chords_generated` - When user generates progression
- `example_prompt_clicked` - When user clicks example
- `chord_played` - When chord is clicked/played
- `progression_playback_started/paused` - Progression playback
- `chord_removed` - When user deletes a chord
- `chord_rearranged` - When user drags to reorder
- `explanation_generated_successfully` - When explanation loads
- `piano_samples_loaded` - When audio samples finish loading

Check pattern in `ClientHome.tsx` before adding new tracking.

## Styling

- **Tailwind CSS** with custom configuration in `tailwind.config.js`
- **shadcn/ui** components in `components/ui/`
- Dark mode support via `next-themes`
- Responsive design with `react-responsive` breakpoints
- Framer Motion for animations

## TypeScript Configuration

- Path alias `@/*` maps to root directory
- Strict mode enabled
- Module resolution: "bundler"
- Target: ES2017 for Tone.js compatibility

## Blog and Content

Blog posts are static pages in `/app/blog/[slug]/page.tsx`
- Blog metadata in `lib/blogData.ts`
- FAQ data in `lib/howItWorksData.ts`
- Uses `@tailwindcss/typography` for prose styling
