# Project check (quick audit)

**Date:** Post–improvements.md implementation.

## Deployments

- **Main app (Next.js):** Unchanged. `npm run build` and `npm run start` work; no custom output dir or `vercel.json`. Vercel will deploy as before using framework preset Next.js and default build/start.
- **Website (static landing):** The `website/` folder is standalone (`index.html` + `styles.css`). To deploy as before:
  - **Option A:** Second Vercel project with root directory set to `website/`, no build command (or “Other” and leave build blank so it serves static files).
  - **Option B:** Copy `website/*` into the main app’s `public/` and link to `/index.html` from the app if you want one deployment.

No `.vercelignore` present; nothing excludes `website/` from the repo. The main Vercel project builds only the Next.js app and does not serve `website/` unless you add it under `public/`.

## Verification run

- `npm run typecheck` — pass
- `npm run test` — 13 tests pass (including calibration)
- `npm run build` — success (static prerender of `/` and `/_not-found`)

## Suggestions (optional)

1. **Build-time checks:** `next.config.ts` has `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true`. Consider turning these off in CI so type/lint errors fail the build; leave them on only if you rely on them for a known reason.

2. **Landing page URL:** `website/index.html` CTA uses `https://retro-manager.vercel.app`; `website/README.md` mentions `https://retro-manager-1993.vercel.app`. Align with your real production URL so “Play the Game” goes to the correct app.

3. **Tests in CI:** Add `npm run test` to your Vercel (or GitHub Actions) pipeline so engine and calibration tests run on every push.

4. **Engine config:** Match output is now tuned via `src/lib/engine-config.ts`. If you want different presets (e.g. “Arcade” vs “Realistic”) in the UI, expose a selector that passes the chosen config into the store’s simulate calls.

5. **New result fields:** Fixture results now include optional `homeShots`, `awayShots`, `homeShotsOnTarget`, `awayShotsOnTarget`. All consumers use `?? result.homeChances` (or equivalent) fallbacks, so old saves and fixtures remain valid.

Nothing in this check blocks the website or main app from deploying as before.
