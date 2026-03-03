⚽ Normal Statistical Ranges (Per Match)
These are based on modern professional leagues (Premier League–level average).

**Tuning in code:** The match engine uses `src/lib/engine-config.ts`. Defaults are aligned with the ranges below. Pass `engineConfig?: Partial<MatchEngineConfig>` into `simulateMatch` (or `simulateRemainingMinutes`) to override (e.g. for an "arcade" preset).
🥅 Goals
Typical Total Goals (both teams combined):
🔹 0–1 goals → Low scoring (defensive grind)
🔹 2–3 goals → Most common range ✅
🔹 4–5 goals → Open / exciting
🔹 6+ goals → Rare chaos
League Average:
👉 ~2.5–3.0 total goals per match
Suggested Engine Distribution
Total Goals	% of Matches
0–1	20%
2–3	50%
4–5	25%
6+	5%
If your game averages 4+ goals every match, it will feel arcade-y.
🎯 Shots
Total Shots (both teams):
18–28 combined is normal
30+ = very open game
<15 = very defensive game
Per Team Average:
8–15 shots
3–7 shots on target
Conversion Rate:
8–15% of total shots become goals
25–35% of shots are on target
Suggested Engine Ratios
Shots per goal ≈ 8–12
Shots on target per goal ≈ 2–4
If 1 shot = 1 goal, your simulation will feel broken.
🟨 Yellow Cards
2–6 total per match is normal
0–1 = very calm match
7+ = heated rivalry
Average:
👉 3–4 yellows per match
Good Engine Balance
65% chance of 2–4 yellows
20% chance of 5–6
10% chance of 0–1
5% chance of 7+
🟥 Red Cards
0 in most matches
1 red in ~10–20% of matches
2 reds = rare chaos
Average:
👉 ~0.15–0.25 per match
Engine Rule:
If yellow_count > 5 → red probability slightly increases
🤕 Injuries
Very important for realism.
Real life:
Minor knocks: fairly common
Serious injuries: rare
Per Match Probabilities
Injury Type	Probability
Minor knock (1–2 weeks)	10–20% chance one occurs
Moderate (3–6 weeks)	5–8%
Serious (2+ months)	1–3%
Meaning:
Most matches → 0 injuries
Occasionally → 1 player injured
Rarely → season-changing injury
If every match produces injuries, players will hate your game.
⚡ Fouls
18–28 total fouls per match
9–15 per team
Cards should come from fouls, not random.

Normal penalty ranges (per match)
Penalties awarded (both teams combined)
0: most matches ✅
1: sometimes
2+: rare chaos
A good “feels real” target:
~0.20–0.35 penalties per match (so roughly 1 penalty every 3–5 matches)
Simple distribution you can use
0 pens: 70–80% of matches
1 pen: 18–28%
2+ pens: 1–3%
That will feel like: “yeah, penalties happen” without becoming a meme.
Penalty conversion
Once awarded, real-world conversion is high:
Scored: ~70–85%
Missed (saved/off target): ~15–30%
A clean engine default:
80% scored
10% saved
10% missed/wide/post
How to make penalties “earned” (recommended)
Don’t make them random. Tie them to:
Time spent in the box (final third / penalty area pulses)
Dribbles / crosses into the box
Defender tackling aggression + fatigue
Ref strictness
Wet pitch / bad visibility (optional modifier)
Quick pulse-engine implementation idea
When the ball is in the penalty area (or “danger zone”):
Each pulse, roll for foul-in-box with a tiny probability, e.g.
Base: 0.15% – 0.40% per pulse in-box
Multiply by: aggression, pressure, low composure, tired legs, etc.
This gives you the nice behavior where:
A team camped in the box for 10–15 pulses can draw a pen
A match with zero box action almost never gets one
Extra realism knobs
Penalty at 80–95 mins should be possible but still rare (don’t suppress late drama too much).
If you already have high foul counts, don’t auto-inflate pens; keep pens specifically tied to box events.
If a match has 6+ yellows, slightly increase pen chance (more reckless defending).