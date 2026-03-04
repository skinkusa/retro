# Retro Manager – Feature List

A full list of current features by area. (Version 1.9.3.)

---

## Start / Career

- **New career** – Enter manager name, choose management philosophy (Analyst, Motivator, Economist, Maverick, Celebrity), pick division and club, set season year (Database Editor), then start.
- **Continue career** – Load saved game from localStorage when a save exists.
- **Database Editor** – Adjust season year and edit team names before or outside a career.
- **Manager philosophy** – Each personality has a gameplay effect (e.g. Analyst +5% zone strength, Economist −10% wages, Maverick +15% goal probability).

---

## Main navigation (tabs)

- **Dashboard (Hub)** – News, next fixture, league snapshot, play match entry point.
- **Team (Squad)** – Squad selection and Tactical Hub (pitch + strategy).
- **World** – Standings, Player Stats, Fixtures (all divisions).
- **Market** – Transfer database (search, filters, shortlist).
- **Office (Club)** – Manager profile, Finance, Staff, Records, OS Config, Save, Quit to main menu.

---

## Hub (Dashboard)

- **League snapshot** – Top of table for user’s division (team names + points).
- **Next Fixture Intel** – Current week, home vs away, and **PLAY MATCH** (opens Match Day screen).
- **Match Day screen** – Overlay listing all fixtures for the current week in your division; your fixture has a **Play** button (requires valid lineup). Back to return to hub.
- **Weekly Headlines** – Current-week messages (transfers, bids, results, etc.) with “View contract” where relevant.

---

## Squad

- **Squad Selection**
  - Position filter (All, GK, DF, MF, FW, DM).
  - XI/Subs counts (0/11 XI, 0/5 SUBS), **CLEAR** and **AUTO XI**.
  - “Assign to” row: empty-slot checkboxes (formation labels + S1–S5) to assign a selected player to a specific slot.
  - Player table: checkbox to toggle lineup or assign to pinned slot, position, morale, fitness, skill, profile button. Row click swaps two players (when not in match view).
  - Swap mode hint bar when a swap is in progress.
  - Players grouped as starters, bench (by lineup order), reserves.
- **Tactical Hub**
  - **Pitch** – Formation view with draggable/clickable players; click to swap, profile icon to open player.
  - **Strategy** – Formation (4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-5-1) and team mentality (Long Ball, Pass to Feet, Counter-Attack, Tiki-Taka, Direct, Park the Bus).

---

## World

- **Division selector** – DIV 1–4.
- **Standings** – League table (P, W, D, L, GD, Pts), form indicators, qualification styling. Team name click opens **Team Roster**.
- **Player Stats** – Top scorers, best average ratings (min 3 apps), disciplinary table, season stats; row click opens **Player Profile**.
- **Fixtures** – All division fixtures (week, home, result/v, away). **Play** button on the user’s current-week unplayed fixture when lineup is valid.

---

## Market (Transfers)

- **Global Transfer Database** – Search and filters (position, age range, skill).
- **Shortlist** – Toggle per player; shortlist tab to view and act on shortlisted players.
- **Scout search** – Timed search with toast when “ready”.
- **Player rows** – Open **Player Profile** (buy, shortlist, transfer list, contract).

---

## Player Profile (modal)

- **Overview** – Name, age, position, value, wage, contract, fitness, morale, attributes (pace, stamina, skill, shooting, passing, heading, influence, goalkeeping, consistency, etc.), season stats (apps, goals, avg rating, cards).
- **Contract** – Renew (years, wage, patience), transfer list toggle. If there’s an incoming bid: accept/reject. If not your player: **Buy** (when budget allows).
- **History** – Season-by-season apps, goals, avg rating, club name.

---

## Team Roster (modal)

- Lists a selected team’s squad (e.g. from standings click).
- Position filter, sort by skill.
- Row click opens **Player Profile**. Dismiss profile / roster actions.

---

## Club (Office)

- **Main Office** – Tiles: Manager Profile, Financial Hub, Staff Management, Legacy & Records, OS Config, Commit Save, Quit to Main Menu.
- **Manager Profile** – Philosophy description, career stats (games, wins, win %), board confidence and expectation, job market (vacancies and apply).
- **Financial Hub** – Season finances (gate, merchandise, wages, transfers, tax), net balance, board message.
- **Staff Management** – Current staff (hire/fire), staff applicants (hire with toast).
- **Legacy & Records** – Biggest win/loss, record transfer in/out.
- **OS Config (Settings)** – Season year, fast-forward season button, global team name editor.
- **Commit Save** – Persist career to localStorage.
- **Quit to Main Menu** – Return to start screen (no save prompt).

---

## Match (MatchSim)

- **Pre-match** – Official lineups (home/away), Kick Off.
- **In-match**
  - Competition and stadium in header.
  - Live commentary bar (team-coloured text).
  - **×1 / ×2** speed toggle and **PAUSE**.
  - Score and minute; shots and scorers per team; cards (yellow/red) per team.
  - Zone strength bars (DEF / MID / ATT) for both teams.
  - Possession bar.
- **Events**
  - **Goal** – Flashing goal banner (scorer, minute, team colour), 3s pause, commentary.
  - **Red card** – Pause and commentary; player removed from sim; card shown in sidebar.
  - **Injury** – Pause and open **Tactical Command Center** with “Player injured – make a substitution” hint; user can change personnel then **Apply & Resume**.
- **Pause (Tactical Command Center)** – Tabs: Tactics (pitch + bench, swap players), Strategy (formation, mentality), Personnel (squad list with ratings). **Apply & Resume** to continue.
- **Half-time / Full-time** – Overlay with score, Man of the Match (full-time), summary ratings for both teams, **Tactical Review** or **Kick Off Second Half** / **Back to Hub**.

---

## Match engine (under the hood)

- **Formations** – 4-4-2, 4-3-3, 3-5-2, 5-3-2, 4-5-1 with zone strengths (DEF/MID/ATT).
- **Play styles** – Affect chance probability and conversion (e.g. Tiki-Taka conversion bonus, Park the Bus defensive mod).
- **Events** – Goals, yellow/red cards (second yellow = red), injuries (minor/moderate/serious). Red-carded and injured players removed from play.
- **Outputs** – Goals, shots, shots on target, chances, ratings, scorers, cards, injuries; applied to table and player stats.

---

## Data and persistence

- **Save** – Full game state to localStorage (teams, players, fixtures, manager, week, season, messages, transfer market, etc.).
- **Load** – Restore from save; team name overrides from separate key.
- **Season flow** – Advance week after match; season summary at end of season; next season with promotions/relegations and roll of honour.

---

## UI and polish

- **Retro styling** – Mono font, primary/accent colours, retro windows and buttons.
- **Toasts** – Feedback for transfers, staff, saves, errors.
- **Tooltips** – On nav and key controls.
- **Responsive layout** – Tabs and content adapt to smaller screens.
