# Potential New Features (Low–Medium Complexity)

Ideas that could be added without major system changes. Each is scoped to stay manageable.

---

## Match & match day

- **Skip to result** – Button during match (e.g. next to Pause) to “Simulate rest of match” and jump to full-time. Reuses existing `simulateRemainingMinutes` or advance minute to 90 and show result.
- **Match speed ×3** – Extend the existing ×1/×2 control to ×3 (e.g. 233 ms per minute) for quicker play-through.
- **Last 5 / form in fixtures** – In the fixtures table or Match Day, show a small “form” string (e.g. WDWLL) for each team from recent results. Data already exists (team form or last N results); only need to derive and display.
- **Your next 3 fixtures on Hub** – Under “Next Fixture Intel”, show the following two fixtures (e.g. “Next: Team A (H), Team B (A), Team C (H)”). Improves planning without new systems.

---

## Squad & tactics

- **Favourite formation / style** – Remember last-used formation and play style per save (or globally) and pre-select on load. Pure persistence of existing options.
- **Squad number column** – Optional column in Squad Selection showing shirt number (e.g. 1–11 for XI, 12–16 for subs). Could be derived from lineup index or a simple `squadNumber` on player/lineup.
- **“Best XI” hint** – A small label or tooltip on AUTO XI explaining it picks by skill (or one sentence in UI copy). No logic change.

---

## Transfers & contracts

- **Expiring contracts filter** – In Market or Squad, filter “Contract ≤ 1 year” so you can renew or sell before expiry. Uses existing `contractYears`.
- **Bid history on profile** – In Player Profile, show “Last bid: £X by Team Y (rejected)” when relevant. Store last bid on message or transfer market; display in contract tab.
- **Shortlist limit (e.g. 10)** – Cap shortlist size and show “Shortlist full – remove one” when at limit. Prevents endless list; single counter + guard in `toggleShortlist`.

---

## World & stats

- **Top scorers / ratings in division header** – On Standings or Fixtures view, a one-line “Top scorer: Player (N goals)” and “Best rating: Player (X.X)”. Reuse StatsHub logic, minimal new UI.
- **Fixture result tooltip** – Hover on a result (e.g. 2-1) to see scorers. Store scorers on fixture result; tooltip component.
- **“Your form” on Hub** – e.g. “Form: W D W L W” from last 5 user-team results. Read from fixtures + user team; small string on dashboard.

---

## Club & office

- **Confirmation before Quit to Main Menu** – “Unsaved changes will be lost. Quit anyway?” when there are unsaved changes (or always). Simple confirm dialog.
- **Save reminder** – If user hasn’t saved for N weeks (e.g. 5) or N actions, show a toast: “Remember to Commit Save.” One “last saved week” in state or localStorage.
- **Board confidence trend** – In Manager Profile, show “↑” / “↓” or “+5 from last month” next to board confidence. Store previous value or a short history; one extra field or array.

---

## Start & career

- **Quick start** – “Continue” + “New career” only (hide Database Editor by default), with “Advanced options” expanding to season/team name edit. Reduces clutter.
- **Team preview on select** – When picking a club, show one line: “Stadium: X, Reputation: Y” or “Squad size: Z.” Uses existing team data; no new systems.

---

## Accessibility & UX

- **Keyboard shortcut for Pause** – e.g. Space toggles pause in match. Single `useEffect` with keydown.
- **Focus trap in modals** – Keep focus inside Player Profile / Team Roster / Match Day until closed. Improves keyboard and screen-reader use.
- **High-contrast or larger text option** – In OS Config, toggle a CSS class (e.g. `data-contrast="high"` or `data-font="large"`) that increases contrast or font size. No new screens.

---

## Data & balance

- **Engine preset label** – In match or OS Config, show “Engine: Realistic” or “Arcade” so users know which preset is active. Already in state; just display it.
- **Season stats in Player Profile** – “Season: 1993 – 12 apps, 3 goals, 6.8 avg” from existing `seasonStats` and optional `history`. Display only.
- **Injury history on profile** – One line: “Last injury: Muscle (2 weeks) – Week 15.” Store last injury on player or in history; optional, low complexity.

---

## Small content additions

- **Random pre-match line** – One of several phrases at kick-off (“The teams are out…”, “Crowd in good voice…”) chosen at random. Array of strings + `events` or commentary.
- **Two or three post-match headlines** – After a match, add 1–2 extra messages (e.g. “X scores brace”, “Y sees red”) in addition to the existing result message. Simple message generation.
- **Cup round name on fixture** – If `fixture.cupRound` exists, show it in Match Day and Fixtures (e.g. “FA Cup R3”). Display only.

---

## Implementation priority (suggested)

| Priority | Feature | Reason |
|----------|---------|--------|
| High     | Skip to result | Big time-saver; logic exists |
| High     | Confirmation before Quit | Avoids accidental loss |
| Medium   | Expiring contracts filter | Very useful for squad planning |
| Medium   | Your next 3 fixtures on Hub | Low effort, high clarity |
| Medium   | Save reminder toast | Prevents lost progress |
| Low      | ×3 speed | Trivial extension of ×2 |
| Low      | Form (last 5) on Hub / fixtures | Reuses data |
| Low      | Engine preset label | One line of UI |

All of the above can be implemented incrementally without large new systems or refactors.
