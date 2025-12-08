# GTD Agent

AI-powered Getting Things Done (GTD) task management app built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Core GTD Workflow**: Inbox, Next Actions, Projects, Scheduled, Someday/Maybe, and Reference sections
- **Local Storage**: All data stored locally using IndexedDB
- **Mobile-First Design**: Responsive design optimized for mobile browsers
- **PWA Support**: Can be installed as a Progressive Web App
- **AI Integration Ready**: Architecture prepared for AI service integration (Alibaba Qwen, Zhipu AI, or OpenAI)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
gtd-agent/
├── app/                  # Next.js app directory
│   ├── (tabs)/          # Tab navigation routes
│   │   ├── inbox/       # Inbox page
│   │   ├── next-actions/ # Next Actions page
│   │   ├── projects/    # Projects page
│   │   ├── scheduled/   # Scheduled page
│   │   ├── someday/     # Someday/Maybe page
│   │   └── reference/   # Reference page
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── ui/             # Base UI components
│   ├── task/           # Task-related components
│   └── navigation/     # Navigation components
├── lib/                # Utilities and services
│   ├── services/       # Storage and AI services
│   ├── store/          # State management (Zustand)
│   └── utils/          # Helper functions
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Storage**: IndexedDB (via idb library)
- **Icons**: Lucide React
- **PWA**: next-pwa

## Development Roadmap

- [x] Phase 1: Foundation - Project setup, navigation, core components
- [ ] Phase 2: Core GTD Features - Task management, project grouping
- [ ] Phase 3: AI Integration - AI service integration for task advice
- [ ] Phase 4: Polish & Testing - UI refinements, performance optimization

## License

MIT
