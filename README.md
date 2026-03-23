# Excalicord

**Turn Your Ideas Into Videos** - A whiteboard video recording and presentation platform built on Excalidraw.

![Excalicord](https://via.placeholder.com/800x400?text=Excalicord)

## Features

- **Infinite Whiteboard**: Powered by Excalidraw for seamless drawing and collaboration
- **Camera Bubble**: Draggable, resizable camera overlay with multiple shape options
- **Recording Controls**: Start, pause, resume, and stop recording with timer
- **Slide Navigation**: Easy navigation between scenes/slides
- **Beauty Filters**: Smoothing, whitening, face slimming, and skin tone adjustments
- **AI Avatar Support**: Placeholder for AI avatar integration (D-ID, HeyGen)
- **Export Options**: MP4, WebM, and GIF export formats

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: shadcn/ui (Radix + Tailwind)
- **Whiteboard**: @excalidraw/excalidraw
- **Backend**: Supabase (Auth, Database, Storage)
- **Payments**: Stripe
- **Analytics**: PostHog
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/excalicord.git
cd excalicord

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project key

## Project Structure

```
src/
├── components/
│   ├── canvas/           # Excalidraw and camera bubble
│   ├── slides/          # Slide navigation
│   ├── recording/       # Recording controls and export
│   ├── layout/          # Header, main layout, panels
│   ├── beauty/           # Beauty filter UI
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── services/
│   ├── video/            # Video processing
│   ├── beauty/           # Beauty filter
│   ├── ai/               # AI avatar
│   ├── i18n/             # Internationalization
│   └── api/              # Supabase, Stripe, Analytics
├── contexts/             # React contexts
├── lib/                  # Utilities and constants
└── types/                # TypeScript types
```

## Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint

# Preview production build
npm run preview
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
npm run build
# Upload dist/ to your hosting provider
```

## Documentation

- [Product Specification](./docs/product-spec.md)
- [Technical Architecture](./docs/technical-architecture.md)
- [Design System](./docs/design-system.md)

## Reports

Phase reports are available in the `reports/` directory:

- [Phase 0: Initialization](./reports/phase-0-initialization/)
- [Phase 1: Foundation](./reports/phase-1-foundation/)
- [Phase 2: Core Features](./reports/phase-2-core-features/)
- [Phase 3: Advanced Features](./reports/phase-3-advanced-features/)
- [Phase 4: Launch](./reports/phase-4-launch/)

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

Built with ❤️ by the Excalicord team
