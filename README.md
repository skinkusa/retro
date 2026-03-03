# Retro Manager

# Retro Manager is a Next.js 15 + Tailwind CSS single-page sim designed to feel like a vintage football management OS with detail-heavy HUD panels, retro typography, and a message-driven workflow.

## Quick start

1. Install dependencies: `npm install` (Node 18+ is recommended). Next 15 and React 19 require a modern toolchain.
2. Run the dev server: `npm run dev`. The default Turbopack dev server listens on port 9002 (`http://localhost:9002`).
3. Build for production: `npm run build`.
4. Preview the production build locally: `npm run start`.

>The app is a client-heavy interface that stores the entire game state in browser localStorage, so you can start a career, save, close the tab, and continue later from the “Continue Saved Career” panel. The save key is `retro_manager_save_v1.9.3`; team overrides are stored under `retro_manager_team_overrides_v1.9.3`.

## Features

- Quad-division league system with automatic promotion/relegation and 38-game calendars.
- Tactical controls, best-11 selectors, and roster editing tools inspired by retro management sims.
- Transfer market interactions (shortlists, offers, incoming bids) plus staff hiring/firing.
- Text-based match simulation, news feed, season summaries, financial HUD, and message-toaster feedback.
- LocalStorage persistence for saves plus an editor for team names that survive resets.

## Deploying to Vercel

This project is ready for Vercel by default—Next.js projects only need a Git push to trigger the platform. For a recommended workflow, see `docs/vercel-deployment.md` for preparation steps. The `website/` folder contains the lightweight marketing landing page that can be used to introduce the game before linking to the playable experience.

## Documentation & supporting site

- `docs/blueprint.md` describes the core gameplay pillars and style guide.
- `docs/vercel-deployment.md` explains how to wire up the Next.js project to Vercel, how branch previews work, and how to keep localStorage saves accessible.
- `website/` contains a small static site (HTML + CSS) that can be hosted alongside, or even on another Vercel project, to provide a landing page or promotional microsite for Retro Manager.
