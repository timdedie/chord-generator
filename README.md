# Chord Gen

AI-powered chord progression generator. Describe a mood, genre, or vibe and get musically valid chord progressions you can play, edit, and export.

## Features

- Generate chord progressions from natural language prompts
- 3 style variations per generation (e.g. simple, jazzy, complex)
- Interactive piano keyboard with Tone.js audio playback
- Drag-and-drop chord reordering
- Chord editing with AI-assisted suggestions
- MIDI file export
- Progression analysis and explanation

## Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **AI**: Vercel AI SDK + DeepSeek Chat
- **Music**: tonal.js (chord validation), Tone.js (audio), midi-writer-js (MIDI export)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Environment

Create `.env.local`:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── (marketing)/        # Landing page
├── app/                # Main application
│   └── results/        # Chord progression display
└── api/
    ├── generate/           # Single chord/progression generation
    ├── generate-multiple/  # 3 progression variations
    └── explain-progression/

components/
├── ProgressionCard.tsx     # Main progression UI (edit, play, drag-and-drop)
├── PianoKeyboard.tsx       # Interactive piano
└── PianoProvider.tsx       # Audio context

hooks/
└── useChordManagement.ts   # Chord generation and state

lib/
└── schemas.ts              # Zod schemas for AI responses
```

## How It Works

1. Enter a prompt on the home page (e.g. "melancholic jazz in D minor")
2. The app calls `/api/generate-multiple` which generates 3 variations
3. Each progression is validated with tonal.js — invalid chords trigger a retry (up to 2x)
4. Results are displayed with playback, editing, and export options
