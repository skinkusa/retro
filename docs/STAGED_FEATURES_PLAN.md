# Staged Features Roadmap: Retro Manager

This roadmap builds upon the existing `PLAN_FIXES_AND_IMPROVEMENTS.md` by adding a multi-season lifecycle, deeper management mechanics, and improved match immersion.

---

## Phase 1: The Circle of Life (Season Lifecycle)
*Goal: Ensure the game world evolves beyond a single season.*

1.  **Retirements & Youth Intake**
    *   **Logic:** In `startNextSeason`, check player ages. 35+ has a 25% chance to retire, 38+ is 100%.
    *   **Replacement:** Each retiring player triggers a "Youth Prospect" (16-17, high potential) to be generated for their club to maintain squad sizes.
2.  **Contract Expiry**
    *   **Logic:** Players with `contractYears: 0` at season end are removed (or become Free Agents).
    *   **UI:** Add "Contract Running Out" alerts to the Hub.
3.  **Active Promotion & Relegation**
    *   **Logic:** Update `startNextSeason` to actually swap the `division` property on teams based on the `seasonSummary` rankings from the previous year.
4.  **Financial Reset**
    *   **Prize Money:** Award budget bonuses based on final league position (e.g., £20M for winning D1, £500k for D4).

---

## Phase 2: Accountability & Pressure (The Sacking Mechanic)
*Goal: Make the manager's job feel precarious and consequential.*

1.  **Board Expectations & Sacking**
    *   **Logic:** If `boardConfidence` drops below 30%, or the team is 5+ spots below `targetPosition` by Week 30, the user is fired.
    *   **Game Over:** Reset state or return to the "Career Start" screen.
2.  **Transfer Windows**
    *   **Logic:** Lock the `buyPlayer` and `sellPlayer` functions except during Weeks 1-4 (Summer) and Week 20 (Winter).
3.  **Job Market**
    *   **Logic:** If you are fired, or if your reputation is high enough, you can "Apply for Job" at other clubs in the Hub.

---

## Phase 3: Player Growth & Decline
*Goal: Make squad building a long-term strategy.*

1.  **Attribute Evolution**
    *   **Growth:** In `startNextSeason`, players < 23 with high `potential` get +1 to core attributes.
    *   **Decline:** Players > 31 get -1 to `pace` and `stamina` each year.
2.  **Player Form Modifier**
    *   **Logic:** Store a `recentForm` value (avg of last 3 match ratings).
    *   **Impact:** A form of 8.0+ gives a +5% boost to effectiveness; < 5.0 gives a -5% penalty.

---

## Phase 4: Match Depth & Economy
*Goal: Add more "levers" for the user to pull.*

1.  **Half-Time Team Talks**
    *   **UI/Logic:** A modal appears during the match sim at HT. Choices like "Demand More" (+morale but risk anger) or "Encourage" (+fitness recovery).
2.  **Stadium Expansion**
    *   **Logic:** A menu in the Hub to pay £10M-£50M to increase `stadiumCapacity`.
    *   **Payoff:** Increased gate receipts for every home game thereafter.

---

## Implementation Progress

| Feature | Phase | Status |
|---------|-------|--------|
| Multi-decimal attributes | N/A | ✅ Done |
| Position coverage | N/A | ✅ Done |
| Team reputations | N/A | ✅ Done |
| **Retirement & Youth** | 1 | ⏳ Next |
| **Active Promotion/Relegated** | 1 | ⏳ Next |
| **Contract Expiry** | 1 | 📅 Planned |
| **Board Sacking** | 2 | 📅 Planned |
