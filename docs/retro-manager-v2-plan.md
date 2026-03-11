# Retro Manager V2 – Master Plan

This document merges the **feature expansion** from `futurefeatures.md` and the **match engine v2** design from `matchengine2.md` into a single roadmap for Retro Manager V2.

---

## Vision

- **Match engine**: Deterministic enough to feel fair, variable enough to feel alive, lightweight for web/mobile. Evolve the current engine into a 5-layer model (identity → control → attack → context → outcome) without breaking the public API.
- **Game world**: Richer player and club identity, narrative systems (awards, legends, career), and deeper simulation (rivalries, fan mood, AI sackings).

---

## Complexity and risk

- **Complexity** (per phase): **Low** — small surface area, few integrations, little new state. **Medium** — moderate surface area or integration with store/engine. **High** — large surface area, many code paths, or significant new state.
- **Risks** (per phase): Examples — regression in existing match results; save corruption or load failure; UI breakage; performance (simulation time); stat distribution drift.
- **Mitigation**: Test-first where possible; keep public API stable; run existing engine tests and simulation scripts after each phase.

---

## Testing strategy

- **Location**: All new V2 tests live under **`tests/`** for future use:
  - **`tests/engine-v2/`** — engine v2 units (profile, state, control, attack, shot, ratings). Use `*.test.ts` so Vitest runs them.
  - **`tests/storage/`** — save/load, compression, pruning, schema version. Use `*.test.ts` for units; optional `*.ts` script for full save round-trip if desired.
  - **`tests/features/`** — feature-specific tests (rivalries, fan mood, awards, news, etc.) as they are added. Use `*.test.ts`.
- **Runner**: Vitest `include` is `['src/**/*.test.ts', 'tests/**/*.test.ts']`. Existing `tests/*.ts` scripts (season-simulation, financial-stability, etc.) stay as `npm run test:sim` etc. Default `npm test` runs all unit tests including `tests/**/*.test.ts`.
- **Conventions**: One test file per logical module (e.g. `profile.test.ts`, `attack-phase.test.ts`); use describe/it/expect; shared fixtures/helpers in `tests/helpers/` or at top of file; simulation/calibration tests in `tests/engine-v2/calibration.test.ts` or a script that asserts stat bands.

---

### Principles

- Keep existing exports: `simulateMatch`, `simulateRemainingMinutes`, `getZoneStrength`, formation/lineup helpers, and `Fixture['result']` shape.
- Add new behaviour via internal layers; no breaking changes for UI or store.

### Phase A1 – Foundation (no behaviour change)

**Complexity:** Low. New code is not wired; no change to existing match flow.

**Risks:** None functional (helpers are additive). Minor risk of interface drift if types change later.

**Testing:**
- **Scope:** Profile builder returns valid modifiers for all formations; play-style profile returns valid numbers; `buildTeamMatchProfile` / `buildMatchState` / `applyMatchStateTacticalDrift` return valid shapes and respect inputs.
- **Type:** Unit (fast, isolated).
- **Files:** `tests/engine-v2/profile.test.ts`, `tests/engine-v2/match-state.test.ts`.
- **Gate:** Phase not done until these tests exist and pass; existing `game-engine.test.ts` and `test:sim` still pass.

1. **New interfaces** (internal only)
   - `TeamMatchProfile` – tempo, directness, width, pressing, defensive line, creativity, discipline, set-piece/transition threat, finishing, tactical fit.
   - `MatchState` – minute, score, reds, momentum, urgency, game state (LEVEL / HOME_LEAD / AWAY_LEAD), phase tempo mod.
   - `AttackType` – BUILD_UP, WIDE_ATTACK, COUNTER, SET_PIECE, LONG_SHOT.
   - `AttackPhaseResult` – attacking/defending team, shooter/assister, becameShot, wonCorner, offside, foulWon, penaltyWon, shotContext.
   - `ShotContext` – type (FOOT/HEADER/LONG_RANGE/ONE_ON_ONE/SET_PIECE), baseQuality (xG-like), onTargetChance, goalChance, pressure/distance/angle/assist/shooter/keeper factors.
   - `ShotOutcome` – GOAL, SAVE, MISS, BLOCKED, WOODWORK; isOnTarget, isGoal, leadsToCorner.
   - `FormationModifier` – width, centralControl, defensiveCompactness, supportToStriker, pressingShape, crossingBias per formation.

2. **New helpers** (implement, not yet wired)
   - `getFormationModifier(formation)`
   - `getPlayStyleProfile(style)` – map Tiki-Taka, Direct, Long Ball, Park the Bus (etc.) to profile modifiers.
   - `buildTeamMatchProfile(team, players, minute, personality?, isHome?, redCardCount)` – zone strengths + formation + style + personality + home + reds + fatigue.
   - `buildMatchState(minute, homeGoals, awayGoals, homeReds, awayReds)`
   - `applyMatchStateTacticalDrift(profile, matchState, isHome)` – leading/trailing/level and late-game behaviour.

### Phase A2 – Control & penetration

**Complexity:** Medium. Touches the main match loop and chance generation.

**Risks:** Change in match outcome distribution (more/fewer chances); subtle regression in result shape or ratings.

**Testing:**
- **Scope:** `resolvePhaseControl` / `resolveAttackProgression` return correct types and plausible distribution over many minutes; `simulateMatch` still returns valid `Fixture['result']` shape.
- **Type:** Unit for resolve functions; integration for full match result shape.
- **Files:** `tests/engine-v2/control.test.ts`. Keep existing `src/lib/game-engine.test.ts` passing.
- **Gate:** New tests pass; existing engine tests and `test:sim` still pass.

3. **Replace single global chance roll**
   - `resolvePhaseControl(homeProfile, awayProfile, matchState, cfg)` → 'HOME' | 'AWAY' | null (most minutes null).
   - `resolveAttackProgression(attackingProfile, defendingProfile, matchState, cfg)` → boolean (control becomes penetration).
   - Wire into current `simulateMatch` loop: only when controller and progression are set do we generate an attack; keep existing shot resolution temporarily.

### Phase A3 – Attack phases & set pieces

**Complexity:** High. New attack-type and set-piece code paths; corners/fouls/offsides generated from phases.

**Risks:** Corners/fouls/offsides diverge from targets; new bugs in phase outcome handling; integration with current loop breaks.

**Testing:**
- **Scope:** `simulateAttackPhase` outcome shape and allowed outcomes; corner/set-piece source counts; integration with main loop still produces valid result.
- **Type:** Unit for phase outcome; integration for loop.
- **Files:** `tests/engine-v2/attack-phase.test.ts`.
- **Gate:** Tests pass; calibration bands for corners/fouls/offsides (optional script or calibration.test.ts).

4. **Attack phases**
   - `simulateAttackPhase(attackingTeam, defendingTeam, attackers, defenders, attackingProfile, defendingProfile, minute, cfg)` → `AttackPhaseResult`.
   - Attack type chosen by style + formation + state; outcomes: broken up, offside, foul, penalty, corner, shot.
   - Corners generated from blocked crosses, blocked shots, saves, clearances (not only a flat probability).

5. **Set pieces**
   - `resolveSetPiecePhase(...)` for corners: no shot, header, second ball, foul on keeper, recycled pressure, clearance.

### Phase A4 – Shot quality & outcome

**Complexity:** High. New shot-context and outcome resolution; affects goals and ratings.

**Risks:** Goal rate or shot distribution change; regression in ratings; performance if shot model is heavy.

**Testing:**
- **Scope:** `buildShotContext` / `resolveShotOutcome` return valid ranges (e.g. quality 0.02–0.40); calibration run (e.g. 500+ matches) asserting shots/goals/corners in plan bands.
- **Type:** Unit for context/outcome; simulation for calibration.
- **Files:** `tests/engine-v2/shot.test.ts`, `tests/engine-v2/calibration.test.ts` (or script).
- **Gate:** Unit tests pass; calibration within bands or documented tolerance.

6. **Shot model**
   - `buildShotContext(attackType, shooter, assister, attackingProfile, defendingProfile, defenderCount, keeper, minute)` → `ShotContext`.
   - Base quality by attack type; modify by shooter/assister/defence/keeper; clamp ~0.02–0.40.
   - `resolveShotOutcome(ctx, shooter, keeper, defenders, cfg)` → `ShotOutcome` (blocked, miss, save, goal, woodwork; some saves/blocks → corner).

7. **Player selection**
   - `pickShooter(players, attackType)` and `pickAssister(players, shooterId, attackType)` – weighted by position and attributes (e.g. BUILD_UP favour FW/AM, COUNTER favour pace, SET_PIECE favour heading).

### Phase A5 – Polish

**Complexity:** Medium. Cards/fouls and ratings logic; commentary tags.

**Risks:** Rating distribution shift; card/foul rate change; commentary regressions.

**Testing:**
- **Scope:** Rating deltas and end-of-match normalization; card/foul counts in band (e.g. fouls 20–24, yellows 3–4).
- **Type:** Unit for rating helpers; simulation for card/foul bands.
- **Files:** `tests/engine-v2/ratings.test.ts`.
- **Gate:** Tests pass; existing engine and sim tests still pass.

8. **Cards & fouls**
   - Fouls tied to attack phases (danger, dirtiness, fatigue, urgency); benchmarks: fouls 20–24, yellows 3–4, reds 0.10–0.18 per match.

9. **Ratings**
   - Micro adjustments during match (shot, SOT, key phase, goal, assist, save, card, block, etc.); end-of-match normalization (clean sheet, volume suppression, wasteful forward penalty, keeper save rate).

10. **Commentary**
    - Optional context tags (LATE_DRAMA, AGAINST_RUN, DOMINANT_PRESSURE, SCRAPPY, KEEPER_ON_FIRE, etc.); `getContextualCommentary(type, team, player, tags)` later.

### Calibration targets (per match, large sample)

| Stat           | Target    |
|----------------|-----------|
| Shots          | 22–26     |
| Shots on target| 8–10      |
| Goals          | 2.4–2.8   |
| Corners        | 8–11      |
| Fouls          | 20–24     |
| Yellows         | 3–4       |
| Reds           | 0.10–0.18 |
| Offsides       | 2–4       |

---

## Part B – Feature expansion (from futurefeatures.md)

### Phase B1 – Identity & matchday (aligns with Engine V2)

**Complexity:** Medium. UI + engine hooks for momentum/derby; PoM display; optional portraits/radar.

**Risks:** Momentum/derby modifiers skew balance; PoM missing or wrong; UI regressions.

**Testing:**
- **Scope:** Momentum/derby modifiers applied when conditions met; PoM present in result and displayable; optional: portrait/radar render or data shape.
- **Type:** Unit for modifier logic; integration for PoM in result.
- **Files:** `tests/features/matchday.test.ts` (momentum, derby, PoM).
- **Gate:** Tests pass; existing flows unchanged.

- **Momentum meter** – Display and feed into engine (momentum in `MatchState`).
- **Injury-time drama** – Slight increase in defensive errors, long balls, late goals; commentary for 90+2' etc.
- **Derby modifier** – Rivalry matches: higher aggression, attendance, home advantage; “Derby Day” tag.
- **Player portraits** – Procedural retro-style faces (hair, facial hair, skin, age, nationality hints).
- **Radar charts** – Visual stat display in profile, transfers, scouting.
- **Player of the Match** – Already in engine; ensure it’s shown after each game (e.g. “Man of the Match Garcia – 8.8”).

### Phase B2 – Player behaviour & club identity

**Complexity:** Medium–High. New state (traits, rivalries, fan mood); many integration points.

**Risks:** Trait application bugs; rivalry/flags wrong; attendance/fan mood drift or overflow; save size growth.

**Testing:**
- **Scope:** Trait application affects development/morale/consistency as specified; rivalry flags set for correct pairs; attendance and fan mood within bounds and consistent with rules.
- **Type:** Unit for trait/rivalry/mood logic; integration for attendance.
- **Files:** `tests/features/rivalries.test.ts`, `tests/features/fan-mood.test.ts`, `tests/features/traits.test.ts`.
- **Gate:** Tests pass; no regressions in existing league/attendance.

- **Hot/cold streaks** – Form streaks (e.g. last 5: goals/form) affecting performance (already have recentForm; extend to streak bonuses/penalties).
- **Player personality traits** – Hidden: Professional, Lazy, Leader, Temperamental, Big Match Player, Injury Prone; affect development, morale, consistency.
- **Nicknames** – “El Toro”, “The Hammer” from goals, longevity, popularity.
- **Rivalries** – Predefined rival clubs; derby matches, media, attendance.
- **Fan mood** – Furious / Concerned / Happy / Delighted; affects attendance and board pressure.
- **Attendance** – Form, rivalries, fan mood, capacity (foundation for gate receipts).

### Phase B3 – World simulation & news

**Complexity:** Medium. AI sackings, new manager bounce, talent pools, news events.

**Risks:** Sack logic too aggressive or stale; news duplicates or missing; regional pools unbalance squads.

**Testing:**
- **Scope:** Sack conditions and bounce applied; news events generated and deduplicated; regional modifiers applied in generation.
- **Type:** Unit for sack/bounce/news logic; integration for world state.
- **Files:** `tests/features/sackings.test.ts`, `tests/features/news.test.ts`.
- **Gate:** Tests pass; existing season/league invariants hold.

- **Manager sackings (AI)** – Other clubs can fire managers; news item.
- **New manager bounce** – Short-term morale boost for AI (and optionally user) after hiring.
- **Regional talent pools** – e.g. Brazil +skill, Germany +stamina, England +heading in generation.
- **News expansion** – Hat-trick hero, giant killing, debut, injury return, derby hype, etc.

### Phase B4 – Awards & history

**Complexity:** Medium. New state (awards, legends, timeline, Hall of Fame); display and persistence.

**Risks:** Award criteria wrong; legends/timeline missing entries or wrong order; save growth.

**Testing:**
- **Scope:** Awards computed from correct stats and seasons; legends/timeline entries added and ordered correctly; Hall of Fame ranks by trophies.
- **Type:** Unit for award/legend/timeline logic; integration for persistence.
- **Files:** `tests/features/awards.test.ts`, `tests/features/legends-timeline.test.ts`.
- **Gate:** Tests pass; minimal extra save payload.

- **Seasonal awards** – Player of the Year, Young Player, Golden Boot, Manager of the Year.
- **Manager of the Month** – From monthly results.
- **Club legends page** – Apps, goals, tenure.
- **Career timeline** – Appointed, promotion, title, etc.
- **Manager Hall of Fame** – Best managers by trophies.

### Phase B5 – QoL & depth

**Complexity:** Low–Medium. Suspensions, bonuses, rumours, milestones, season review, sponsorship.

**Risks:** Yellow accumulation wrong; sponsorship balance or save size; milestone/review display bugs.

**Testing:**
- **Scope:** Yellow accumulation and suspension trigger; clean-sheet bonus applied; rumours/milestones generated; season review data correct; sponsorship amounts and persistence.
- **Type:** Unit for each subsystem; integration for review/sponsorship.
- **Files:** `tests/features/suspensions.test.ts`, `tests/features/season-review.test.ts`, `tests/features/sponsorship.test.ts`.
- **Gate:** Tests pass; existing advanceWeek/save unchanged.

- **Suspensions** – Yellow accumulation (already have red suspensions).
- **Clean sheet bonuses** – GK morale boost.
- **Transfer rumours** – Media speculation.
- **Milestones** – e.g. 100 matches managed.
- **Season review screen** – Position, top scorer, best player, record signing.
- **Sponsorship** – Yearly deals; better teams = larger sponsors.

### Phase B6 – Long-term (future expansion)

**Complexity:** High when implemented. Youth academy, wonderkids, weather affect many systems.

**Risks:** Academy unbalance; wonderkid discovery too rare or too common; weather effects break calibration.

**Testing:**
- **Scope:** Academy intake rules and caps; wonderkid distribution; weather modifiers within bounds.
- **Type:** Unit for rules; simulation for distribution.
- **Files:** `tests/features/youth-academy.test.ts`, `tests/features/weather.test.ts`.
- **Gate:** Tests pass; calibration and balance preserved.

- **Youth academy** – Annual intake.
- **Wonderkids** – Hidden high-potential players.
- **Weather** – Slight match effects.

---

## Recommended implementation order

| Order | Item | Source | Complexity | Test gate |
|-------|------|--------|------------|-----------|
| 1 | Match Engine V2 – interfaces + profile/state builders (A1) | matchengine2 | Low | `tests/engine-v2/profile.test.ts`, `tests/engine-v2/match-state.test.ts` |
| 2 | Match Engine V2 – phase control & progression (A2) | matchengine2 | Medium | `tests/engine-v2/control.test.ts` |
| 3 | Momentum meter + injury-time + derby (B1) | futurefeatures + engine | Medium | `tests/features/matchday.test.ts` |
| 4 | Match Engine V2 – attack phases & set pieces (A3) | matchengine2 | High | `tests/engine-v2/attack-phase.test.ts` |
| 5 | Match Engine V2 – shot quality & outcome (A4–A5) | matchengine2 | High | `tests/engine-v2/shot.test.ts`, `tests/engine-v2/calibration.test.ts`, `tests/engine-v2/ratings.test.ts` |
| 6 | Player portraits + radar charts + PoM display (B1) | futurefeatures | Medium | (covered by matchday / B1) |
| 7 | Rivalries + fan mood + attendance (B2) | futurefeatures | Medium–High | `tests/features/rivalries.test.ts`, `tests/features/fan-mood.test.ts` |
| 8 | Hot/cold streaks + personality traits (B2) | futurefeatures | Medium–High | `tests/features/traits.test.ts` |
| 9 | AI sackings + new manager bounce + news (B3) | futurefeatures | Medium | `tests/features/sackings.test.ts`, `tests/features/news.test.ts` |
| 10 | Awards + legends + timeline + Hall of Fame (B4) | futurefeatures | Medium | `tests/features/awards.test.ts`, `tests/features/legends-timeline.test.ts` |
| 11 | QoL: suspensions, bonuses, rumours, milestones, season review (B5) | futurefeatures | Low–Medium | `tests/features/suspensions.test.ts`, `tests/features/season-review.test.ts` |
| 12 | Sponsorship (B5) | futurefeatures | Low–Medium | `tests/features/sponsorship.test.ts` |
| 13 | Youth / wonderkids / weather (B6) | futurefeatures | High | `tests/features/youth-academy.test.ts`, `tests/features/weather.test.ts` |

**Test gates:** Before marking a step complete: run `npm test` (all Vitest tests including `tests/**/*.test.ts`) and, where applicable, `npm run test:sim` / `test:finance` / `test:fixture`. New tests for that step must exist in the `tests/` folder and be committed.

---

## Success criteria for V2

- **Engine**: Matches produce believable stories (dominant 1–0s, chaotic 3–2s, sterile 0–0s, late equalisers, low-block teams conceding corners but few clear chances); stats hit calibration targets over large samples; public API unchanged.
- **Features**: Players and clubs feel more distinct (portraits, traits, nicknames, legends); world feels alive (sackings, news, awards); progression is visible (timeline, milestones, season review).

---

## File layout (later refactor)

**Engine (src):**
- `game-engine.ts` – public API only (or re-export from v2).
- `engine-profile.ts` – profile builders.
- `engine-state.ts` – match state + tactical drift.
- `engine-attack.ts` – attack phases + set pieces.
- `engine-shot.ts` – shot context + outcome.
- `engine-ratings.ts` – rating adjustments.

**Tests (tests/):**
- `tests/engine-v2/` – engine v2 unit and calibration tests (`profile.test.ts`, `match-state.test.ts`, `control.test.ts`, `attack-phase.test.ts`, `shot.test.ts`, `calibration.test.ts`, `ratings.test.ts`).
- `tests/storage/` – save/load, schema, pruning tests (`save-schema.test.ts`, `fixture-pruning.test.ts`, `tiered-pruning.test.ts`, `indexed-db.test.ts`).
- `tests/features/` – feature tests (matchday, rivalries, fan-mood, traits, sackings, news, awards, legends-timeline, suspensions, season-review, sponsorship, youth-academy, weather).
- `tests/helpers/` – shared fixtures and helpers for tests.

Until Engine V2 is stable, keep all engine logic in one file and refactor into the above when convenient.

---

## Part C – Browser storage: maintain data, minimize footprint

Goal: keep full game state restorable while staying well under the ~5 MB localStorage limit (and typical mobile constraints). Preserve what matters for continuity; drop or shrink what can be recomputed or summarized.

### What we already do

- **LZString** – `compressToUTF16` before writing; decompress on load. Handles legacy plain JSON.
- **Slim fixtures** – Persist only: `homeGoals`, `awayGoals`, `attendance`, `scorers`, `cards`; drop `ratings`, `shotTakers`, `sotTakers`, `injuries` from saved result; keep events only for `GOAL`, `RED`, `INJURY`, `SUB`, `PENALTY_SHOOTOUT`.
- **Slim players** – Keep only last 5 entries in `history[]` per player.
- **Quota fallback** – On `QuotaExceededError`, save a minimal state (no ratings/scorers/events, empty history) and warn.

### Strategies to add or tighten

**1. Short keys in save blob only**  
Use a compact schema only when serializing to string: e.g. `apps` → `a`, `avgRating` → `r`, `seasonStats` → `s`, `homeGoals` → `hg`. Expand back to full keys on parse. One shared mapping (e.g. `SAVE_KEY_MAP`) keeps the rest of the app unchanged. Saves a lot of bytes over hundreds of players and fixtures.

**2. Omit defaults**  
Don’t write properties that equal the default (e.g. `0`, `[]`, `null`, `"FIT"`). Restore them when loading. Cuts redundant keys and values.

**3. Don’t persist derived data**  
Anything that can be recomputed from other saved state should not be stored (or only cached for performance if needed). Examples: league table from fixtures; “current form” from recent results if we store enough fixture summary. Reduces size and avoids drift.

**4. Prune by age / importance**  
- **Fixtures**: Keep full result detail only for the current season (and optionally last season). For older seasons, persist only a compact summary per fixture (e.g. `[week, hg, ag, homeId, awayId]`) or per-season aggregates (final table, top scorers). Drop full events/cards/scorers for old seasons.
- **Player history**: Already last 5; could make it 3 for “very old” saves when near quota, or cap to “this season + previous” for display and store only that.
- **Messages / news**: Cap count (e.g. last 50), or drop read/old items; keep only unread and recent.

**5. Compact representation of repeated structures**  
- **Attributes**: Store as array in fixed order instead of object (e.g. `[12,14,10,...]` with a single key) in the save blob.
- **Enums**: Map to single chars or small integers in the blob (`FIT`→0, `INJURED`→1; position codes).
- **IDs**: Keep as-is (needed for references); avoid storing long redundant strings (e.g. shared prefixes once in a header if we ever add a custom format).

**6. Compression and storage backend**  
- Keep **LZString** as default (no extra deps, good for JSON). Optionally try `compressToBase64` or `compressToEncodedURIComponent` and pick whichever gives smaller length for your typical save.
- If a single blob still hits limits: **split save** into 2–3 chunks (e.g. “core” + “players” + “fixtures”). Save core always; save players/fixtures in rotation or with stronger pruning when near quota. On load, merge chunks; if one is missing, fall back to last good full save or minimal state.
- **IndexedDB** (e.g. via idb or native): use for “full” or “backup” saves when available (much larger quota). Keep a small **localStorage** “last session” summary (e.g. season, week, userTeamId, save version) for fast “resume last game” and to re-fetch from IndexedDB. Prefer one source of truth (e.g. IndexedDB) when both are used.

**7. Quota awareness**  
- Before `setItem`, optionally estimate size (e.g. `compressSave(state).length` or a rough JSON length). If above a threshold (e.g. 4 MB), apply stronger pruning (e.g. drop all fixture results except current season, or drop events everywhere) then retry.
- Bump `STORAGE_KEY` version when the schema changes; avoid keeping multiple versions of huge saves. Optionally keep one backup key (e.g. `retro_manager_save_backup`) and overwrite only on successful main save.

**8. V2-specific rules**  
- **Match engine v2**: Persist only what’s needed to resume (e.g. no full attack-phase log per minute). Same as now: result (goals, scorers, cards, maybe ratings if needed for stats), not intermediate engine state.
- **New features**:  
  - **Legends / timeline / awards**: Store minimal (e.g. player/team IDs, season, award type, one number). Rebuild display from current entities + these records.  
  - **News / messages**: IDs + type + timestamp + minimal payload; cap total count.  
  - **Rivalries / fan mood**: Small structures (e.g. rivalry pairs, one mood value per team); avoid storing long text or redundant copies.

### Suggested implementation order (storage)

| Step | Action |
|------|--------|
| 1 | Introduce a **save schema version** and a single **short-key map** for the save blob; serialize/parse via helper so app still uses full keys. |
| 2 | Add **omit-defaults** when building the object-to-string payload (and restore defaults on load). |
| 3 | Add **fixture pruning**: full result only for current (and optionally previous) season; older seasons → compact summary or aggregates only. |
| 4 | Add **pre-write size check** and **tiered pruning** (normal → slim → minimal) on quota or when size > threshold. |
| 5 | (Optional) **IndexedDB** for full/backup save with localStorage “last session” pointer for fast resume. |

**Per-step complexity, risk, and testing**

- **Step 1 (schema + short keys)** — **Complexity:** Medium. **Risks:** Load failure if key expansion wrong; legacy saves must still parse. **Testing:** Round-trip (save then load) produces equivalent state; key expansion restores full keys. **Files:** `tests/storage/save-schema.test.ts`. **Gate:** Tests pass; existing load still works.
- **Step 2 (omit defaults)** — **Complexity:** Low. **Risks:** Missing defaults break UI or logic if not restored. **Testing:** Omitted defaults restored on load; round-trip for state with many defaults. **Files:** `tests/storage/save-schema.test.ts` (extend) or `tests/storage/omit-defaults.test.ts`. **Gate:** Tests pass.
- **Step 3 (fixture pruning)** — **Complexity:** Medium. **Risks:** Losing data needed for history/display; wrong season boundary. **Testing:** Current season full result present; older seasons compact or aggregated; load correctness for league table and player history. **Files:** `tests/storage/fixture-pruning.test.ts`. **Gate:** Tests pass; no required data lost.
- **Step 4 (tiered pruning)** — **Complexity:** Medium. **Risks:** Over-pruning loses too much; under-pruning still hits quota. **Testing:** Size threshold triggers stronger pruning; fallback path produces loadable state. **Files:** `tests/storage/tiered-pruning.test.ts`. **Gate:** Tests pass.
- **Step 5 (IndexedDB)** — **Complexity:** High. **Risks:** Backup/restore inconsistency; localStorage pointer wrong; browser support. **Testing:** Backup written to IndexedDB; restore from IndexedDB matches state; localStorage “last session” points to valid save. **Files:** `tests/storage/indexed-db.test.ts`. **Gate:** Tests pass (or skip in envs without IndexedDB).

This keeps data intact for gameplay continuity while minimizing storage and staying within browser limits.
