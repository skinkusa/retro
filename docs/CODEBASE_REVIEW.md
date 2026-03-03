# Retro Manager – Full Codebase Review

Review covers all source under `src/` (app, components, lib, types, hooks, ai). Functionality is summarized by area; issues and suggestions are listed with file references.

---

## 1. App layer (`src/app/`)

### Functionality

- **layout.tsx** – Root layout: Inter font, metadata (title "Retro Manager", description), global CSS. Renders `<html>`/`<body>` with theme and selection styles.
- **page.tsx** – Single client page. Wraps app in `GameProvider` and `TooltipProvider`. Renders:
  - **StartMenu** – Manager name, philosophy (Analyst/Motivator/Economist/Maverick/Celebrity), division + team pick, "Continue Career" when save exists, "Database Editor" button, "Initialize Career".
  - **GameContent** – After start: HUB / SQUAD / WORLD / MARKET / CLUB tabs; match day overlay; modals for Team Roster and Player Profile. Club sub-views: Office (tiles), Manager Info, Finance, Staff, Records, Settings, Commit Save.
- **globals.css** – Tailwind base/components/utilities, CSS variables (primary, accent, muted, etc.), body background (external image URL), custom classes (`retro-tile`, `retro-button`, `animate-goal-strobe`), scrollbar and font overrides.

### Issues / suggestions

- **Database Editor does nothing** – Start menu sets `showSettings(true)` on click, but nothing is rendered when `showSettings` is true (no dialog/modal). Either open a modal that shows season/year and team name editing (e.g. SettingsHub content) or remove the button/state.
- **Save key hardcoded** – `retro_manager_save_v1.9.3` appears in page and store. Prefer a single constant (e.g. `lib/constants.ts`) or a versioned key for future save-format changes.
- **External background image** – `globals.css` uses a Firebase URL for body background. App depends on that host; consider self-hosting or a fallback if the URL fails.

---

## 2. Game components (`src/components/game/`)

### Functionality

| Component       | Role |
|----------------|------|
| **RetroWindow** | Reusable “window” frame (title bar, optional footer/padding) used across game UI. |
| **SquadList**   | Squad table with position filter, lineup checkboxes, auto-pick/clear, swap mode, tactical role labels; opens PlayerProfile. |
| **TacticsPitch** | Visual pitch with formation slots, player markers (position/side), swap and profile actions. |
| **MatchSim**    | Full match flow: lineups, minute-by-minute tick, commentary/events, pause for tactics/subs, half-time/full-time, zone strength bars, possession. |
| **LeagueTable** | Division standings (P/W/D/L/GD/Pts), form bubbles, qualification styling; team click opens TeamRoster. |
| **PlayerMarket** | Transfer market: search, position/age/skill filters, shortlist tab, “scout search” (delay + toast); opens PlayerProfile. |
| **PlayerProfile** | Player profile (overview, attributes, contract). Contract renewal (years/wage/patience), transfer list toggle, accept/reject bid, buy player. |
| **TeamRoster**  | Dialog listing a team’s squad with position filter, sort by skill; row click opens PlayerProfile. |
| **FinanceHub**  | Season accounts (gate, merchandise, transfers, wages, tax), net balance, board message. |
| **StaffManagement** | Current staff and applicants; hire/fire with toasts. |
| **ManagerInfo** | Manager philosophy, career stats, board confidence/expectations, job market (apply). |
| **TeamRecords** | Club records (biggest win/loss, record transfer), manager legacy. |
| **StatsHub**    | Per-division: top scorers, avg rating (min 3 apps), discipline; row click opens PlayerProfile. |
| **SeasonSummary** | Season wrap-up: champions, promoted/relegated, awards, board assessment, “Commence next season”. |
| **SettingsHub** | Season year editor, global team name editor (inline), fast-forward season button. |
| **NewsFeed**    | Scrollable list of current-week messages, read state. |

### Issues / suggestions

- **PlayerProfile contract negotiation** – `handleNegotiate` uses `wageGap = (offeredWage - targetWage) / targetWage`. If `targetWage` is 0 (e.g. `player` missing or zero wage), this divides by zero. Guard with `if (!targetWage) return` or use a safe divisor.
- **PlayerMarket age inputs** – `minAge`/`maxAge` are string inputs; `parseInt(minAge || '17')` can yield NaN. Validate/clamp or use numeric state.
- **NewsFeed unused** – Component is never imported or rendered in `page.tsx`. The HUB shows “Weekly Headlines” inline, not NewsFeed. Either add a route/tab that uses NewsFeed or remove the component.
- **SettingsHub fast-forward** – Button calls `fastForwardSeason`, which is a no-op in the store (`() => {}`). Either implement (e.g. advance to week 38 and trigger season end) or hide/disable and document as TODO.
- **Team name overrides** – SettingsHub team name edits update in-memory state and localStorage overrides, but the store’s `saveGame` does not persist overrides; overrides are loaded only on initial load. Ensure overrides are saved (e.g. when user clicks “Commit Save” or a dedicated “Save database” in Settings) so renames survive reload.

---

## 3. UI components (`src/components/ui/`)

### Functionality

- Radix-based primitives: button, dialog, alert-dialog, dropdown-menu, select, tabs, table, input, label, checkbox, switch, slider, progress, toast, toaster, tooltip, accordion, card, avatar, badge, scroll-area, separator, sheet, form (React Hook Form), calendar, carousel, etc.
- Styling: CVA variants, `cn()` for class merging, theme-aligned.

### Issues / suggestions

- **Toast remove delay** – In `use-toast.ts`, `TOAST_REMOVE_DELAY = 1000000` (ms) so toasts are removed only after ~1000 seconds. Reduce to 5–10 seconds for normal auto-dismiss and to avoid unbounded memory use with many toasts.
- **useToast effect deps** – Effect uses `[state]` in the dependency array; the effect only needs to subscribe/unsubscribe. Using `[]` and reading `memoryState` when needed would avoid unnecessary re-runs (minor).

---

## 4. Lib (`src/lib/`)

### Functionality

- **store.tsx** – React context for full game state. Actions: startGame, loadGame, saveGame, simulateWeek, advanceWeek, setTactics, buyPlayer, sellPlayer, renewContract, shortlist/transfer list, acceptBid/rejectBid, hireStaff/fireStaff, lineup (toggle, swap, clear, autoPick), markMessageRead, applyForJob, resetFired, updateMidMatchResult, updateSeason, updateTeamName, fastForwardSeason, startNextSeason. Persists save and team name overrides to localStorage; uses toasts for feedback.
- **game-engine.ts** – Formations, zone strength (DEF/MID/ATT), match simulation (commentary, goals, ratings), league table, simulateRemainingMinutes. (See separate match-engine analysis for details.)
- **game-data.ts** – Division definitions, name pools, team definitions (20 named + 60 generated). generateFixtures (round-robin per division, 38 weeks), generateInitialData (teams, players, lineups, staff, cup entrants).
- **utils.ts** – `cn()` (clsx + tailwind-merge), `formatMoney()` (e.g. £1.25M).
- **placeholder-images.ts / .json** – Image list (id, description, imageUrl) for MatchSim and globals; external URLs (e.g. Firebase).

### Issues / suggestions

- **loadGame** – No try/catch around `JSON.parse(localStorage.getItem(...))`. Corrupt or non-JSON data can throw and crash the app. Wrap in try/catch and optionally show a toast or clear bad save.
- **saveGame** – No try/catch around `localStorage.setItem`. Large state can hit quota; consider try/catch and a “Save failed” toast.
- **fastForwardSeason** – Implemented as `() => {}`. Either implement or remove/disable in UI.
- **applyForJob** – Store may expose it; if UI allows “apply” but it’s a no-op, implement or hide.
- **generateFixtures** – Fixture pairing `(i + week) % divTeams.length`; confirm this yields a correct double round-robin for 20 teams (38 rounds). Document or add a test.
- **placeholder-images** – External URLs; if they break, no fallback. Consider env-based URLs or local fallbacks.

---

## 5. Types (`src/types/game.ts`)

### Functionality

- Central game types: Position, Side, PlayStyle, CompetitionType, QualificationType, Player (attributes, fitness, morale, contract, status, history), Team (squad, finances, formation, records), Fixture and result (events, ratings, scorers, cards, injuries), MatchEvent, ManagerPersonality, ManagerProfile, TeamRecords, TransferOffer, GameMessage, SeasonSummaryData, GameState.

### Issues / suggestions

- **Player.history** – Entry has both `goals` and `goalsScored`; PlayerProfile uses `goalsScored`. Unify to one field to avoid mistakes.
- **Team.isUserTeam** – Optional and not always set; ensure it’s set consistently when `userTeamId` is set so LeagueTable and others can rely on it.
- **Save validation** – No runtime validation (e.g. Zod) for loaded saves. Optional: validate in loadGame and reject or migrate outdated/corrupt shapes.

---

## 6. Hooks (`src/hooks/`)

### Functionality

- **use-toast.ts** – Global toast state (in-memory reducer), dispatch (ADD/UPDATE/DISMISS/REMOVE), `toast()` and `useToast()`; TOAST_LIMIT = 1.
- **use-mobile.tsx** – `useIsMobile()` via `window.matchMedia('(max-width: 767px)')`, syncs on resize; returns boolean (undefined on SSR then false).

### Issues / suggestions

- **TOAST_REMOVE_DELAY** – Same as above; reduce to a few seconds.
- **use-mobile SSR** – First render can be undefined then false; if layout depends on mobile, consider a default or skeleton to avoid layout shift.

---

## 7. AI (`src/ai/`)

### Functionality

- **genkit.ts** – Genkit with Google AI plugin, model `googleai/gemini-2.5-flash`.
- **dev.ts** – Placeholder comment (“Flows will be imported for their side effects”); no imports or flows.

### Issues / suggestions

- **No app integration** – No components or store call Genkit. Plan where to use it (e.g. news headlines, board messages, scout reports) and wire when ready.
- **API key** – Ensure `GOOGLE_GENAI_API_KEY` (or equivalent) is documented and not committed; add error handling for unavailable service.
- **dev.ts** – Add flow imports when implementing AI so they run in dev.

---

## Summary: critical issues

| Priority | Issue | Location |
|---------|--------|----------|
| High | Database Editor button does nothing (showSettings never renders UI) | app/page.tsx |
| High | loadGame/saveGame can throw (no try/catch) | lib/store.tsx |
| High | Division by zero in contract negotiation when targetWage is 0 | components/game/PlayerProfile.tsx |
| Medium | Toast never auto-removes (TOAST_REMOVE_DELAY = 1000000) | hooks/use-toast.ts |
| Medium | fastForwardSeason is no-op; button visible in SettingsHub | lib/store.tsx, SettingsHub.tsx |
| Medium | Team name overrides not persisted on “Commit Save” | lib/store.tsx |
| Low | NewsFeed component unused (dead code) | components/game/NewsFeed.tsx |
| Low | Player.history has both goals and goalsScored | types/game.ts, PlayerProfile |
| Low | External image URLs (Firebase) with no fallback | globals.css, placeholder-images |

---

## Summary: functionality by area

- **App** – Single-page game: start menu (name, philosophy, team, continue/settings) and in-game tabs (HUB, Squad, World, Market, Club) with match day, roster and player modals.
- **Game components** – Match sim, squad/tactics, league table, transfer market, player profile, finance, staff, manager info, records, stats, season summary, settings; NewsFeed exists but is unused.
- **UI** – Radix + Tailwind; toast has excessive remove delay.
- **Lib** – Full game state and actions in context; engine (formations, zones, match sim, table); game data (teams, players, fixtures); utils and placeholder images.
- **Types** – Complete game model; minor naming and optional-field consistency.
- **Hooks** – Toast (global state) and mobile breakpoint; toast delay is the main issue.
- **AI** – Genkit configured but not used in app; dev entry empty.
