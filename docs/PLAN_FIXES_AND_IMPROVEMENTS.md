# Plan: Fixes, Enhancements & Improvements (from Codebase Review)

This plan is derived from [docs/CODEBASE_REVIEW.md](docs/CODEBASE_REVIEW.md). It groups work into **fixes**, **enhancements**, and **game-event propagation** so that all match and game events are reflected correctly across the app.

---

## Part A: Game event propagation (ensure events reflect everywhere)

Match results now include **cards** and **injuries** (from the match engine corrections). These and other result fields must be applied when advancing the week and must be visible wherever relevant.

### A1. Apply cards and injuries in `advanceWeek`

**File:** [src/lib/store.tsx](src/lib/store.tsx)

**Current behaviour:** `advanceWeek` uses `f.result.ratings` and `f.result.scorers` to update player stats (apps, goals, avgRating, fitness, morale). It does **not** process `f.result.cards` or `f.result.injuries`.

**Required changes:**

- After building `statsToUpdate` from ratings/scorers, iterate `f.result.cards` for each fixture:
  - For each card: if `type === 'YELLOW'`, ensure the player is in `statsToUpdate` (create entry if missing, e.g. from ratings) and increment `seasonStats.yellowCards`.
  - For each card with `type === 'RED'`: increment `seasonStats.redCards`, and set `suspensionWeeks = 3` and `status = 'SUSPENDED'` on that player in the final `allPlayers` update.
- Iterate `f.result.injuries` for each fixture:
  - For each injury entry: set the player’s `status = 'INJURED'`, `injury = { type: inj.type, weeksRemaining: inj.weeks }` in the final `allPlayers` update.
- Ensure the player update loop (that produces `allPlayers`) runs **after** these aggregates are computed, and applies:
  - Suspensions (red cards): `suspensionWeeks`, `status = 'SUSPENDED'`.
  - Injuries: `status = 'INJURED'`, `injury: { type, weeksRemaining }`.
  - Season stats: `seasonStats.yellowCards`, `seasonStats.redCards` (in addition to existing apps, goals, avgRating).

**Result:** SquadList, TeamRoster (suspended/injured badges), getBestSquadForTeam (excludes suspended/injured), StatsHub discipline tab, and PlayerProfile will all reflect cards and injuries.

### A2. Decay suspension and injury week-by-week

**File:** [src/lib/store.tsx](src/lib/store.tsx)

- In `advanceWeek`, when building `allPlayers`:
  - If a player has `suspensionWeeks > 0`, decrement by 1; when it reaches 0, set `status = 'FIT'` (unless injured).
  - If a player has `injury` with `weeksRemaining > 0`, decrement by 1; when it reaches 0, set `injury = null` and `status = 'FIT'` (unless suspended).

**Result:** Suspensions and injuries clear over time; lineup and availability stay correct.

### A3. Confirm existing reflections (no code change if already true)

- **Goals / scorers:** Already applied in `advanceWeek` via `statsToUpdate` and `seasonStats.goals`. StatsHub top scorers and season summary use this.
- **Ratings:** Already applied; `seasonStats.avgRating` and `apps` drive StatsHub ratings and season summary.
- **MatchSim / RED & INJURY events:** UI already shows alerts for `type === 'RED'` and `type === 'INJURY'`; ensure these event types are emitted by the engine (already done in match engine corrections).

---

## Part B: Critical fixes (from Codebase Review)

### B1. Database Editor button does nothing

**File:** [src/app/page.tsx](src/app/page.tsx)

- **Issue:** "Database Editor" sets `showSettings(true)` but no UI is rendered when `showSettings` is true.
- **Fix (choose one):**
  - **Option A:** When `showSettings` is true, render a modal/dialog that contains the same content as SettingsHub (season year editor, global team name table). Reuse or inline the SettingsHub form so the user can edit before starting a career.
  - **Option B:** Remove the "Database Editor" button and state if pre-game editing is not required.

### B2. loadGame / saveGame can throw

**File:** [src/lib/store.tsx](src/lib/store.tsx)

- **loadGame:** Wrap `JSON.parse(localStorage.getItem(STORAGE_KEY))` in try/catch. On parse error, show a toast (e.g. "Save data corrupted or invalid") and do not call `setState` (or clear the bad key). Prevents crash on corrupt/invalid JSON.
- **saveGame:** Wrap `localStorage.setItem(STORAGE_KEY, JSON.stringify(state))` in try/catch. On quota or other error, show a toast (e.g. "Save failed – storage full or unavailable"). Optionally keep in-memory state unchanged.

### B3. Division by zero in contract negotiation

**File:** [src/components/game/PlayerProfile.tsx](src/components/game/PlayerProfile.tsx)

- **Issue:** `handleNegotiate` uses `wageGap = (offeredWage - targetWage) / targetWage`. If `targetWage` is 0, this throws or produces NaN/Infinity.
- **Fix:** At the start of `handleNegotiate`, if `!targetWage || targetWage <= 0` return early (and optionally show a short toast). Otherwise compute `wageGap` as before.

---

## Part C: Medium-priority fixes and enhancements

### C1. Toast auto-remove delay

**File:** [src/hooks/use-toast.ts](src/hooks/use-toast.ts)

- Change `TOAST_REMOVE_DELAY` from `1000000` to a sensible value (e.g. 5000–10000 ms) so toasts auto-dismiss and memory does not grow unbounded.

### C2. fastForwardSeason is a no-op

**Files:** [src/lib/store.tsx](src/lib/store.tsx), [src/components/game/SettingsHub.tsx](src/components/game/SettingsHub.tsx)

- **Option A:** Implement `fastForwardSeason`: e.g. set `currentWeek` to 38, run all remaining fixtures with a simplified sim (or existing `simulateMatch`), then run season-end logic (promotion/relegation, summary). Same player/finance updates as a normal advance.
- **Option B:** If not implementing soon: hide or disable the "Fast-forward season" button in SettingsHub and add a short comment or TODO in code.

### C3. Team name overrides not persisted on "Commit Save"

**File:** [src/lib/store.tsx](src/lib/store.tsx)

- **Issue:** Team name overrides are stored in state and read from `OVERRIDES_KEY` on initial load; `saveGame` only writes `STORAGE_KEY` (full state) and does not write overrides.
- **Fix:** In `saveGame`, after (or before) writing the main save, build the current overrides map from `state.teams` (e.g. `teamId -> name` for teams that differ from initial names if you track that, or persist all user-edited names) and call `localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))`. Ensure the initial `useEffect` that loads overrides continues to run so that after reload, renames are restored.

### C4. PlayerMarket age inputs can be NaN

**File:** [src/components/game/PlayerMarket.tsx](src/components/game/PlayerMarket.tsx)

- Validate/clamp `minAge` and `maxAge`: e.g. `parseInt(minAge || '17', 10)` and ensure result is in 17–50 or similar; use a fallback (e.g. 17) when NaN. Same for max. Prevents filter bugs from invalid input.

---

## Part D: Lower-priority / consistency

### D1. Save key and overrides key in one place

**Files:** [src/app/page.tsx](src/app/page.tsx), [src/lib/store.tsx](src/lib/store.tsx)

- Introduce a small module (e.g. [src/lib/constants.ts](src/lib/constants.ts)) exporting `STORAGE_KEY` and `OVERRIDES_KEY` (and optionally version). Use these in both page and store so the key is defined once and easy to change for future save-format versions.

### D2. NewsFeed unused

**File:** [src/components/game/NewsFeed.tsx](src/components/game/NewsFeed.tsx), [src/app/page.tsx](src/app/page.tsx)

- **Option A:** Use NewsFeed somewhere (e.g. a "News" tab or a section in the HUB that renders `<NewsFeed />` instead of or in addition to the inline "Weekly Headlines").
- **Option B:** Remove the NewsFeed component and any dead import if it is not part of the product.

### D3. Player.history: goals vs goalsScored

**File:** [src/types/game.ts](src/types/game.ts), [src/lib/store.tsx](src/lib/store.tsx), [src/components/game/PlayerProfile.tsx](src/components/game/PlayerProfile.tsx)

- Unify naming: either use only `goals` or only `goalsScored` in the history entry type and everywhere that reads it (e.g. PlayerProfile). Update the place that writes history (e.g. in store when starting next season) to use the chosen field name so stats and UI stay consistent.

### D4. Team.isUserTeam set consistently

**File:** [src/lib/store.tsx](src/lib/store.tsx) (and any place that creates or updates teams)

- Whenever `userTeamId` is set or teams are loaded, set `isUserTeam: true` on the team whose `id === userTeamId` and `isUserTeam: false` (or omit) on others. Ensures LeagueTable and any component that uses `isUserTeam` behave correctly.

### D5. useToast effect dependency

**File:** [src/hooks/use-toast.ts](src/hooks/use-toast.ts)

- The effect that subscribes to toast state can use an empty dependency array `[]` and read `memoryState` when needed, to avoid unnecessary re-runs. Minor optimisation.

### D6. External image fallbacks

**Files:** [src/app/globals.css](src/app/globals.css), [src/lib/placeholder-images.json](src/lib/placeholder-images.json) / usage

- Document or add a fallback when the Firebase (or other) image URL fails (e.g. fallback background colour or local asset). Reduces dependency on external host availability.

---

## Part E: Optional / future

- **generateFixtures:** Verify or document that the round-robin logic yields a correct 38-week schedule for 20 teams per division; add a unit test if desired.
- **applyForJob:** Implement or hide in UI if exposed.
- **Save validation:** Optional Zod (or similar) schema for loaded save shape in `loadGame`; reject or migrate old/corrupt data.
- **AI (Genkit):** Plan integration points (e.g. news, board messages, scout text) and error handling; document API key and env.

---

## Implementation order (suggested)

| Phase | Items | Rationale |
|-------|--------|-----------|
| 1 | **A1, A2** | Match events (cards, injuries) must apply in advanceWeek and decay so the rest of the game reflects them. |
| 2 | **B1, B2, B3** | Critical UX and stability: Database Editor, load/save safety, contract divide-by-zero. |
| 3 | **C1, C3** | Quick wins: toast delay, persist overrides on Commit Save. |
| 4 | **C2, C4** | fastForwardSeason implement or hide; PlayerMarket age validation. |
| 5 | **D1–D6** | Consistency: constants, NewsFeed, history field, isUserTeam, toast deps, image fallback. |
| 6 | **E** | As needed: fixtures test, applyForJob, save validation, AI. |

---

## Checklist: where game events must reflect

After implementing Part A, confirm:

- **advanceWeek:** Applies ratings, scorers, **cards** (yellow/red, suspensions), **injuries** (status, weeks); decrements suspension and injury weeks each week.
- **SquadList / TeamRoster:** Show suspended/injured (already use `suspensionWeeks`, `injury`).
- **getBestSquadForTeam:** Excludes suspended and injured (already uses `suspensionWeeks === 0` and `status !== 'INJURED'`).
- **StatsHub:** Top scorers (goals), ratings (avgRating, apps), discipline (yellowCards, redCards) all from seasonStats.
- **PlayerProfile:** Shows injury, contract, stats; no divide-by-zero on contract negotiation.
- **MatchSim:** Shows RED/INJURY events from `fixture.result.events` (already supported).
- **Season summary:** Uses seasonStats and history; history uses consistent goal field (after D3).

This plan ensures all match and season events propagate correctly and the codebase review items are addressed in a logical order.
