# Deploying Retro Manager to Vercel

This Next.js 15.5.9 project is production-ready for Vercel. Follow these steps to deploy the playable experience as a web app:

1. **Prepare your GitHub repo**
   * Push the `retro-main` branch (or `main`) to the remote you plan to deploy from (skinks/retromanager). Vercel watches branches to create deployments automatically.

2. **Connect the repository in Vercel**
   * Log into [vercel.com](https://vercel.com), create (or select) a team, and click **New Project**.
   * Import the `skinks/retromanager` repo.
   * Accept the suggested framework detection (Next.js). Build command: `npm run build`; output is the default Next.js app (no custom Output Directory). The project sets `outputFileTracingRoot` in `next.config.ts` so dependency tracing uses this repo’s root even when other lockfiles exist (e.g. in a parent directory).

3. **Configure environment & defaults**
   * No special environment variables are required—Retro Manager stores its career save entirely in the visitor’s browser (see `localStorage` keys in `/src/lib/store.tsx`).
   * If you change the app’s port or add API routes in the future, make sure the Vercel project is still using the default settings (no custom `vercel.json` is needed yet).

4. **Enable preview deployments**
   * Every pull request and pushed branch will generate a preview deployment. Use those previews to test new game logic before merging to `main`.

5. **Publish the playable site**
   * After linking, Vercel will build the project automatically for each push. Once the `main` branch build succeeds, you will have a permanent Vercel URL (for example `https://retro-manager.vercel.app/`).

6. **Optional marketing landing page**
   * The `website/` directory contains a static landing page you can host separately (even as a second Vercel project) to describe the game, highlight features, and link visitors to the playable experience (example CTA uses `https://retro-manager.vercel.app/`).

7. **LocalStorage persistence reminder**
   * Because saves live in the browser, players keep their careers between sessions by clicking the “Save Career” tile and trusting their browser’s localStorage. Refreshing the page will only auto-load if the key `retro_manager_save_v1.9.3` still exists. You can mention this on the Vercel landing page or in player help text.
