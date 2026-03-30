# Smarthome Dashboard

A multi-source smart home dashboard built for tablets. Connect your Homey, and more data sources coming soon.

## Features

- **Multi-source architecture** — plugin adapter pattern lets you add any smart home platform
- **Homey integration** — connects to Homey via local API
- **Tablet-first** — touch-friendly, responsive grid layout, PWA support
- **Real-time updates** — device states update automatically
- **Drag & drop** — rearrange widgets to your liking
- **Dark mode** — easy on the eyes for always-on displays

## Quick Start

```bash
npm install
npm run dev
```

The dashboard starts with a Demo adapter enabled, showing sample devices. To connect your Homey, open Settings and configure the Homey adapter with your local IP and API token.

## Adding Data Sources

Implement the `DataSourceAdapter` interface in `src/core/types.ts` and register it in `src/adapters/index.ts`. See `src/adapters/demo/DemoAdapter.ts` for a minimal example.

## Tech Stack

- Vite + React 19 + TypeScript
- Tailwind CSS
- Zustand (state management)
- react-grid-layout (draggable grid)
- PWA via vite-plugin-pwa
