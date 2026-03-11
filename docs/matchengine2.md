The perfect Retro Manager engine
For your game, the ideal engine is:
deterministic enough to feel fair, variable enough to feel alive, lightweight enough for mobile/web, and compatible with your current TypeScript structure.
The best version is a 5-layer match engine:
1. Team Identity Layer
This defines how a team wants to play before the match even starts.
Inputs:
formation
playStyle
manager personality
overall squad quality
morale
fitness
home advantage
recent form
discipline tendency
This layer should produce pre-match values like:
tempo
width
directness
pressing
defensive line
creativity
risk
foul tendency
finishing sharpness
So instead of only:
"Tiki-Taka"
"Long Ball"
"Park the Bus"
you translate those into engine modifiers.
Example:
interface TeamStyleProfile {
  tempo: number;         // 0.8 - 1.2
  directness: number;    // 0.8 - 1.2
  width: number;         // 0.8 - 1.2
  pressing: number;      // 0.8 - 1.2
  defensiveLine: number; // 0.8 - 1.2
  creativity: number;    // 0.8 - 1.2
  discipline: number;    // 0.8 - 1.2
  finishing: number;     // 0.8 - 1.2
}
This is important because it stops style from being just a tiny probability tweak and makes it shape the whole match.
2. Territory / Control Layer
This decides who is controlling the flow of the match.
Right now you mostly use midfield strength to decide chances. That is directionally correct, but the perfect engine separates:
possession/control
territory
chance creation
chance quality
A team can dominate possession but create little.
A direct team can lose possession but create better chances.
So per minute, or better per phase, calculate:
control share
territory share
pressure
transition threat
Suggested derived values:
control = midfield + passing + stamina + tactical fit
territory = control + width/directness adjustments
pressure = attacking intent + tempo + home momentum
resistance = opponent defense + shape + discipline
Then the match feels more realistic:
one team can “have the ball”
the other can still be dangerous
3. Attack Phase Layer
This is the heart of the engine.
Instead of:
chance -> shot -> shot on target -> goal
the perfect engine does:
possession phase -> entry -> attack type -> shot context -> shot outcome
That still stays lightweight, but it gives much better realism.
Recommended flow
For each attack:
team wins the phase
attack enters one of these channels:
central build-up
wide attack
counter attack
set piece
long shot sequence
defense reacts
result becomes one of:
no chance
blocked attack
corner
foul in danger area
offside
shot
if shot:
assign shot quality
resolve on target
resolve save / goal / block / miss
That is the biggest improvement you can make.
4. Event Context Layer
This makes the match feel dramatic and football-like instead of statistically flat.
The engine should track match state:
current score
minute
red cards
fatigue drift
momentum
crowd pressure
tactical urgency
Example effects:
trailing team after 70' increases tempo/risk
leading team after 80' lowers tempo, increases defensive shape
red card reduces width and attacking support
tired players lower pressing and recovery
home crowd gives slight late pressure boost
This is where the game begins to feel like a real match sim.
5. Outcome / Presentation Layer
This resolves:
scorers
assists
ratings
cards
injuries
commentary
stats line
match story
This layer should be driven by what actually happened, not bolted on afterward.
For example:
defenders with repeated blocks get decent ratings even in 0 goal games
keepers gain rating from saves vs shot quality
midfielders gain rating from chance involvement
scorers get boosts, but not automatically Man of the Match if otherwise invisible
The ideal benchmark targets
For Retro Manager, I’d tune toward these combined match averages:
Stat	Target
Shots	22–26
Shots on target	8–10
Goals	2.4–2.8
Corners	8–11
Fouls	20–24
Yellow cards	3–4
Red cards	0.10–0.18
Offsides	2–4
Per team average:
shots: 11–13
shots on target: 4–5
goals: 1.2–1.4
yellows: 1.5–2.2
Your engine should aim for these over large sample sizes, not every single match.
What is good in your current engine
You already have several correct ideas:
Good things already present
getZoneStrength() is the right concept
formation slots are simple and usable
morale / fitness / consistency matter
red cards alter structure
play style already influences chance creation
ET and penalties are handled
ratings are event-driven
injuries are fitness-sensitive
That means you do not need a ground-up rewrite.
What is missing from the current engine
Here are the biggest limitations.
1. Midfield controls too much
At the moment, midfield heavily determines whether chances happen.
That causes matches to feel too linear:
midfield wins -> chance
then random shot logic
Realistically:
midfield affects control
attack affects danger
defense affects suppression
style affects where attacks happen
context affects how risky teams become
2. Chances are too abstract
Your chanceProbability is basically a global tick chance.
That works, but it makes all attacks feel similar.
You want attacks to have types.
3. Shot quality is too flat
Currently goal probability is mostly:
shooter power
defense power
keeper power
ATT strength
Good, but incomplete.
You want shot context:
close range
wide angle
header
through ball
rebound
counter
set piece
speculative long shot
That will massively improve realism.
4. Corners and fouls are under-modeled
You track corners and fouls, but they are not deeply integrated into attack generation.
Corners should come naturally from:
blocked crosses
blocked shots
defensive pressure
Fouls should come from:
pressure situations
dirtiness
fatigue
desperation
5. No real momentum/state machine
Your engine is minute-based, but it lacks a proper match-state drift:
early cagey
mid-match rhythm
late urgency
game management while leading
desperation chasing
That’s the missing ingredient.
The perfect engine design compatible with your current code
I would keep your public API almost exactly the same.
Keep these signatures
Keep:
simulateMatch(...)
simulateRemainingMinutes(...)
getZoneStrength(...)
getFormationSlots(...)
getTacticalAssignments(...)
Then internally add a richer pipeline.
Recommended internal architecture
Step 1: Build derived team match profiles
Add a helper:
interface TeamMatchProfile {
  attack: number;
  midfield: number;
  defense: number;
  keeping: number;
  tempo: number;
  directness: number;
  width: number;
  pressing: number;
  discipline: number;
  creativity: number;
  defensiveShape: number;
  setPieceThreat: number;
}
function buildTeamMatchProfile(
  team: Team,
  players: Player[],
  minute: number,
  personality?: ManagerPersonality
): TeamMatchProfile
This should derive everything from:
zone strengths
style
formation balance
morale
fitness
home/away
red cards
This becomes the true engine input each minute.
Step 2: Replace raw minute chance checks with attack phases
Instead of one big if (Math.random() < chanceProbability), do:
type AttackType = 'BUILD_UP' | 'WIDE' | 'COUNTER' | 'SET_PIECE' | 'LONG_SHOT';

interface AttackPhase {
  attackingTeamId: string;
  defendingTeamId: string;
  attackType: AttackType;
  shotTaken: boolean;
  shotQuality?: number;
  shooterId?: string;
  assisterId?: string;
  wonCorner?: boolean;
  offside?: boolean;
  foulWon?: boolean;
}
Then:
function simulateAttackPhase(...) => AttackPhase
This lets the match create richer stories without changing the rest of your app much.
Step 3: Add shot quality instead of flat shot probability
Use a simple xG-like value internally, even if you never expose xG in the UI.
Example:
interface ShotContext {
  type: 'FOOT' | 'HEADER' | 'LONG_RANGE' | 'ONE_ON_ONE' | 'SET_PIECE';
  distanceFactor: number;
  angleFactor: number;
  pressureFactor: number;
  assistQualityFactor: number;
  shooterQualityFactor: number;
  keeperDifficultyFactor: number;
  defensivePressureFactor: number;
}
Then:
function getShotQuality(ctx: ShotContext): number
Output:
0.03 long-range weak attempt
0.08 average chance
0.18 good box chance
0.30 major one-on-one
0.12 header from corner
Then:
isOnTarget depends on shot type + shooter composure/skill
goal depends on shot quality + keeper quality
This is the single best way to improve realism.
The perfect flow for each simulated phase
Here’s the exact model I’d use.
A. Determine phase control
Using midfield, passing, stamina, shape, and pressure.
B. Determine whether control becomes penetration
Using directness, width, creativity, opponent shape, pressing resistance.
C. Determine attack type
Weighted by style:
Tiki-Taka -> build-up, cutbacks, central combinations
Direct -> counters, through balls, faster attacks
Long Ball -> aerials, second balls, headers
Park the Bus -> fewer attacks, more counters/set pieces
D. Determine attack result
Possible outcomes:
broken down
offside
foul won
corner won
low-quality shot
high-quality shot
E. Resolve shot
Outcomes:
blocked
off target
saved
goal
rebound corner
The best stat model for your current game
Team strength buckets
Keep your three core buckets, but refine them:
Defense
Use:
defenders’ skill
heading
pace
stamina
positioning proxy
goalkeeper support
discipline/shape
Midfield
Use:
passing
skill
stamina
influence
tactical fit
Attack
Use:
shooting
skill
pace
heading
composure proxy
creativity support
You already do this loosely. The improvement is not the categories — it’s what you do with them.
Best playstyle effects
Here’s how I’d define them.
Tiki-Taka
more possession
more control
slightly more short-pass chance creation
slightly fewer offsides
slightly fewer headers
slightly higher shot quality
slightly lower raw shot volume than chaos football
Direct
less possession
faster transition attacks
more counters
more through-ball chances
more volatility
Long Ball
fewer total controlled phases
more aerial duels
more headers
more second balls
more offsides
lower average shot quality, but can create chaos
Park the Bus
low attacking volume
high defensive suppression
more low block resilience
more late clearances/corners conceded
more counter-attacking spikes
Best manager personality effects
Since you already use personality, I’d make it more meaningful.
Analyst
better tactical coherence
slightly better control
slightly reduced randomness
better defensive organization
Motivator
morale matters more
better comeback factor
less late collapse
slightly better stamina resilience
Maverick
more risk
more shot volume
more chaos
higher ceiling, lower floor
Economist
maybe no in-match boost, or a small discipline/stamina efficiency edge
Celebrity
home attendance boost
morale/crowd boost
maybe weaker tactical consistency
How to improve commentary quality
Right now commentary is event-based, which is fine. The perfect version adds context tags.
Example event tags:
late_winner_chance
derby_tension
against_run_of_play
keeper_masterclass
scrappy_midfield
desperate_defending
Then commentary can reflect the actual story.
Examples:
“Against the run of play, they’ve broken through!”
“The keeper is keeping them alive here.”
“This is turning into a war of attrition in midfield.”
That will make matches feel far smarter without much extra code.
The perfect rating model
Your rating system should reward:
Attackers
goals
shots on target
key involvement
winning fouls
assists
dangerous dribbles/phases
Midfielders
chance involvement
control dominance
defensive recoveries
assist chains
work rate over time
Defenders
clean sheets
suppression of attacks
blocks
aerial wins
avoiding errors/cards
Goalkeepers
save difficulty
volume of saves
clean sheet
errors leading to goals against
Right now yours is decent but still a bit event-spiky. Add a small accumulation model:
every strong involvement +0.03 to +0.10
major event larger bonus/penalty
That produces more believable 6.8 / 7.2 / 7.6 distributions.
My recommended “perfect but compatible” upgrade path
Phase 1 — keep structure, improve realism
Do this first.
Add:
team match profile builder
attack types
shot quality model
state-based late-game modifiers
better corner generation
better foul generation
Keep:
same exported functions
same result object
same events structure
This gives the biggest gain with least breakage.
Phase 2 — enrich player roles
Add hidden roles based on attributes and position:
poacher
target man
creator
ball winner
runner
stopper
sweeper keeper
These don’t need a UI at first. They can be inferred.
That improves who gets chances and how they arise.
Phase 3 — tactical instructions
Later, add optional team instructions:
pressing: low / medium / high
tempo: slow / normal / fast
width: narrow / balanced / wide
passing: short / mixed / direct
mentality: defensive / balanced / attacking
Then style becomes more user-driven and less hardcoded.
If I were rewriting your core logic, this would be the conceptual engine
for each minute:
  updateMatchState()

  homeProfile = buildTeamMatchProfile(...)
  awayProfile = buildTeamMatchProfile(...)

  controlWinner = resolveControl(homeProfile, awayProfile, matchState)
  if (!controlWinner) continue

  attackPhase = simulateAttackPhase(controlWinner, opponent, matchState)

  if (attackPhase.offside) recordOffside()
  else if (attackPhase.foulWon) recordFoulOrSetPiece()
  else if (attackPhase.wonCorner) recordCorner()
  else if (attackPhase.shotTaken) {
    shotOutcome = resolveShot(attackPhase, ...)
    recordShotOutcome(shotOutcome)
  }

  maybeRecordCommentary()
  maybeRecordCards()
  maybeRecordInjuries()
That is the ideal model for Retro Manager.
What I would specifically change in your current file
1. Replace single global chance abstraction
Your current:
if (Math.random() < chanceProbability) { ... }
Replace with:
phase control chance
attack progression chance
attack type selection
shot or non-shot event
That alone will make matches feel far more organic.
2. Make corners real
You track corners, but they are barely produced.
You should generate corners from:
blocked shots
pressured wide attacks
defensive clearances
And corners should themselves generate:
no event
header
scramble shot
foul on keeper
clearance recycled into attack
3. Separate shot volume from shot quality
A team can have:
many bad shots
fewer but better shots
This is one of the biggest realism gaps in simple engines.
4. Add match-state tactical drift
At minimum:
leading after 70’ -> lower tempo, lower shot volume, higher defense
trailing after 70’ -> higher tempo, more directness, more fouls, more risk
level after 80’ -> more cautious unless one side much stronger
5. Add formation shape modifiers
4-3-3 should not behave the same as 5-3-2 with merely different players in slots.
Examples:
4-3-3: width + press
3-5-2: central overload
5-3-2: defensive compactness, lower width
4-5-1: midfield control, lower support to striker
4-4-2: balanced, crossing friendly
The ideal result for Retro Manager
When this is working well, you should get match stories like:
dominant 1-0s
chaotic 3-2s
sterile 0-0s
smash-and-grab away wins
late equalizers from pressure
low-block teams conceding corners but not many clear chances
direct teams with fewer attacks but strong counters
That is the real target.
My verdict on your current engine
Your current engine is:
better than a basic arcade sim
structurally sound
salvageable
already close enough to evolve instead of replace
I would not scrap it.
I would turn it into:
“Retro Manager Match Engine v2”
with:
richer possession phases
attack types
shot quality
tactical drift
formation identity
event context
while keeping your public API and result format intact.
If you want, I can turn this into a drop-in technical spec for your codebase next — with exact function names, new interfaces, and a step-by-step refactor plan that matches your current TypeScript file.

Retro Manager Match Engine v2
Compatible refactor spec for current TypeScript engine
Goal
Upgrade your existing engine from:
zone strength
minute tick chance generation
shot/on-target/goal resolution
to a more realistic model with:
team identity
match state
attack phases
shot quality
formation behavior
richer ratings and commentary
without breaking:
simulateMatch(...)
simulateRemainingMinutes(...)
Fixture['result']
your current event system
your UI screens relying on current stats
1. Keep these existing exports
These should remain public and usable:
getFormationSlots
getTacticalAssignments
getFormationRequirements
canPlay
getBestSquadForTeam
normalizeLineupForTeam
getZoneStrength
simulateMatch
simulateRemainingMinutes
updateLeagueTable
You can improve internals, but keep signatures unless you intentionally do a broader refactor.
2. Add new internal engine layers
I’d add these internal helpers:
buildTeamMatchProfile()
buildMatchState()
updateMatchState()
resolvePhaseControl()
simulateAttackPhase()
resolveShotOutcome()
resolveSetPiecePhase()
applyMatchStateTacticalDrift()
applyFatigueDrift()
applyEventRatingImpact()
These can all live in the same file at first if you want minimal disruption. Later you can split them into:
match-profile.ts
match-state.ts
attack-phase.ts
shot-model.ts
ratings.ts
For now, staying in one file is fine.
3. New internal interfaces
Team match profile
interface TeamMatchProfile {
  attack: number;
  midfield: number;
  defense: number;
 keeping: number;

  tempo: number;            // 0.8 - 1.2
  directness: number;       // 0.8 - 1.2
  width: number;            // 0.8 - 1.2
  pressing: number;         // 0.8 - 1.2
  defensiveLine: number;    // 0.8 - 1.2
  creativity: number;       // 0.8 - 1.2
  discipline: number;       // 0.8 - 1.2
  setPieceThreat: number;   // 0.8 - 1.2
  transitionThreat: number; // 0.8 - 1.2
  finishing: number;        // 0.8 - 1.2
  tacticalFit: number;      // 0.8 - 1.2
}
Match state
interface MatchState {
  minute: number;
  homeGoals: number;
  awayGoals: number;
  homeRedCount: number;
  awayRedCount: number;
  homeMomentum: number;     // -1.0 to 1.0
  awayMomentum: number;     // -1.0 to 1.0
  homeUrgency: number;      // 0.8 - 1.3
  awayUrgency: number;      // 0.8 - 1.3
  gameState: 'LEVEL' | 'HOME_LEAD' | 'AWAY_LEAD';
  phaseTempoMod: number;    // early/calm, normal, late frantic
}
Attack type
type AttackType =
  | 'BUILD_UP'
  | 'WIDE_ATTACK'
  | 'COUNTER'
  | 'SET_PIECE'
  | 'LONG_SHOT';
Attack phase result
interface AttackPhaseResult {
  attackingTeamId: string;
  defendingTeamId: string;
  attackType: AttackType;

  shooter?: Player;
  assister?: Player | null;

  becameShot: boolean;
  wonCorner: boolean;
  wasOffside: boolean;
  foulWon: boolean;
  penaltyWon: boolean;

  shotContext?: ShotContext;
}
Shot context
interface ShotContext {
  type: 'FOOT' | 'HEADER' | 'LONG_RANGE' | 'ONE_ON_ONE' | 'SET_PIECE';
  baseQuality: number;         // internal xG-like value: 0.02 - 0.45
  onTargetChance: number;      // 0 - 1
  goalChance: number;          // 0 - 1
  pressureFactor: number;      // 0.7 - 1.2
  distanceFactor: number;      // 0.6 - 1.3
  angleFactor: number;         // 0.6 - 1.2
  assistFactor: number;        // 0.8 - 1.2
  shooterFactor: number;       // 0.8 - 1.2
  keeperFactor: number;        // 0.8 - 1.2
}
Shot outcome
type ShotOutcomeType = 'GOAL' | 'SAVE' | 'MISS' | 'BLOCKED' | 'WOODWORK';

interface ShotOutcome {
  type: ShotOutcomeType;
  isOnTarget: boolean;
  isGoal: boolean;
  leadsToCorner: boolean;
}
4. Add formation identity modifiers
Right now formations mostly affect slot placement. That’s not enough.
Add a helper:
interface FormationModifier {
  width: number;
  centralControl: number;
  defensiveCompactness: number;
  supportToStriker: number;
  pressingShape: number;
  crossingBias: number;
}
function getFormationModifier(formation: string): FormationModifier
Suggested values:
4-4-2
{
  width: 1.00,
  centralControl: 0.98,
  defensiveCompactness: 1.00,
  supportToStriker: 1.05,
  pressingShape: 1.00,
  crossingBias: 1.05
}
4-3-3
{
  width: 1.10,
  centralControl: 1.02,
  defensiveCompactness: 0.98,
  supportToStriker: 1.08,
  pressingShape: 1.08,
  crossingBias: 1.00
}
3-5-2
{
  width: 0.96,
  centralControl: 1.10,
  defensiveCompactness: 1.02,
  supportToStriker: 1.06,
  pressingShape: 1.00,
  crossingBias: 0.94
}
5-3-2
{
  width: 0.94,
  centralControl: 1.00,
  defensiveCompactness: 1.12,
  supportToStriker: 0.95,
  pressingShape: 0.92,
  crossingBias: 0.96
}
4-5-1
{
  width: 1.00,
  centralControl: 1.08,
  defensiveCompactness: 1.04,
  supportToStriker: 0.90,
  pressingShape: 0.98,
  crossingBias: 0.97
}
These numbers should influence profile construction, not directly decide outcomes.
5. Build team profiles per minute
Add this function:
function buildTeamMatchProfile(
  team: Team,
  players: Player[],
  minute: number,
  userPersonality?: ManagerPersonality,
  isHome: boolean = false,
  redCardCount: number = 0
): TeamMatchProfile
Inputs it should use
Existing data
formation
playStyle
current active players
morale
fitness
consistency
manager personality
home/away
red cards
Derived buckets
attack from current ATT zone
midfield from MID zone
defense from DEF zone
keeping from GK
Then apply:
formation modifier
play style modifier
personality modifier
home advantage
red card penalty
fatigue drift
Style mapping
Add:
function getPlayStyleProfile(style: PlayStyle): Partial<TeamMatchProfile>
Example:
Tiki-Taka
{
  tempo: 0.98,
  directness: 0.88,
  width: 1.00,
  pressing: 1.05,
  defensiveLine: 1.03,
  creativity: 1.08,
  discipline: 1.00,
  setPieceThreat: 0.96,
  transitionThreat: 0.92,
  finishing: 1.02
}
Direct
{
  tempo: 1.08,
  directness: 1.12,
  width: 1.00,
  pressing: 0.98,
  defensiveLine: 0.98,
  creativity: 0.98,
  discipline: 0.98,
  setPieceThreat: 1.00,
  transitionThreat: 1.10,
  finishing: 1.00
}
Long Ball
{
  tempo: 1.05,
  directness: 1.18,
  width: 0.96,
  pressing: 0.94,
  defensiveLine: 0.95,
  creativity: 0.92,
  discipline: 0.98,
  setPieceThreat: 1.08,
  transitionThreat: 1.05,
  finishing: 0.97
}
Park the Bus
{
  tempo: 0.86,
  directness: 1.02,
  width: 0.95,
  pressing: 0.88,
  defensiveLine: 0.86,
  creativity: 0.90,
  discipline: 1.06,
  setPieceThreat: 1.02,
  transitionThreat: 1.08,
  finishing: 0.96
}
6. Add match state logic
Add:
function buildMatchState(
  minute: number,
  homeGoals: number,
  awayGoals: number,
  homeRedCount: number,
  awayRedCount: number
): MatchState
Then:
function applyMatchStateTacticalDrift(
  profile: TeamMatchProfile,
  matchState: MatchState,
  isHome: boolean
): TeamMatchProfile
Tactical drift rules
If drawing
1–25 mins: slightly calmer
26–70 mins: neutral
71–90 mins: slightly more aggressive if stronger side at home
If leading
lower tempo
lower directness unless counter style
slightly stronger defense/discipline
slightly lower attacking commitment
If trailing
increase tempo
increase directness
increase attacking risk
reduce shape/discipline slightly
more shots, more fouls, more exposure
If down to 10 men
lower width
lower attacking support
lower pressing
stronger low-block bias
This one change will make matches feel dramatically more alive.
7. Replace global chance roll with phase control
Right now:
minute tick
chance roll
shot roll
Replace with:
Step A: Resolve whether this minute has a meaningful attacking phase
function resolvePhaseControl(
  home: TeamMatchProfile,
  away: TeamMatchProfile,
  matchState: MatchState,
  cfg: MatchEngineConfig
): 'HOME' | 'AWAY' | null
This should use:
midfield
tempo
pressing
momentum
urgency
home advantage already baked into profile
Suggested logic
most minutes return null
some minutes return HOME
some return AWAY
This gives you better pacing than “everyone gets a chance every tick.”
Step B: Convert control into penetration
function resolveAttackProgression(
  attacking: TeamMatchProfile,
  defending: TeamMatchProfile,
  matchState: MatchState,
  cfg: MatchEngineConfig
): boolean
This should consider:
attacking creativity
directness
width
transition threat
defending shape
defending discipline
defending pressing resistance
If false:
maybe log midfield / defensive commentary
maybe create a foul
maybe no visible event
If true:
move to attack phase
8. Simulate attack phases
Add:
function simulateAttackPhase(
  attackingTeam: Team,
  defendingTeam: Team,
  attackers: Player[],
  defenders: Player[],
  attackingProfile: TeamMatchProfile,
  defendingProfile: TeamMatchProfile,
  minute: number,
  cfg: MatchEngineConfig
): AttackPhaseResult
Choose attack type based on style + formation + game state
Tiki-Taka
BUILD_UP: high
WIDE_ATTACK: medium
COUNTER: low
LONG_SHOT: low
SET_PIECE: low
Direct
BUILD_UP: medium
WIDE_ATTACK: medium
COUNTER: high
LONG_SHOT: medium
SET_PIECE: low
Long Ball
BUILD_UP: low
WIDE_ATTACK: medium
COUNTER: medium
LONG_SHOT: medium
SET_PIECE: medium
Park the Bus
BUILD_UP: low
WIDE_ATTACK: low
COUNTER: high
LONG_SHOT: low
SET_PIECE: medium
Attack phase outcomes
From the attack phase, allow:
broken up by defense
offside
foul won
penalty won
corner won
shot created
This is where corners and fouls become natural.
9. Make corners real
You already track corners. Now they need proper sources.
Corners should arise from:
blocked wide attacks
crosses cut out
blocked shots
save pushed behind
panic clearances
Add:
function resolveSetPiecePhase(
  attackingTeam: Team,
  defendingTeam: Team,
  attackers: Player[],
  defenders: Player[],
  attackingProfile: TeamMatchProfile,
  defendingProfile: TeamMatchProfile,
  minute: number,
  cfg: MatchEngineConfig
): AttackPhaseResult | null
From a corner, outcomes can be:
no shot
header
second-ball shot
foul on keeper
recycled pressure
clearance ending phase
This will improve realism a lot.
10. Add shot quality model
This is the most important football improvement.
Add:
function buildShotContext(
  attackType: AttackType,
  shooter: Player,
  assister: Player | null,
  attackingProfile: TeamMatchProfile,
  defendingProfile: TeamMatchProfile,
  defenderCount: number,
  keeper: Player | undefined,
  minute: number
): ShotContext
Shot base quality by attack type
Suggested starting points:
BUILD_UP: 0.10
WIDE_ATTACK: 0.09
COUNTER: 0.14
SET_PIECE: 0.11
LONG_SHOT: 0.04
Then modify using:
shooter shooting/skill
assister passing/skill
defending shape
pressing pressure
keeper quality
attack type
header vs foot
formation support
fatigue late in match
Clamp roughly between:
0.02 and 0.40
You do not need to display xG. Just use it internally.
On-target chance
Use shot type + shooter skill.
Suggested starting points:
one-on-one: 0.62
close-range foot shot: 0.48
header: 0.34
long-range: 0.24
set-piece direct effort: 0.30
Then modify by:
shooting
consistency
morale
fatigue
defensive pressure
Goal chance
Use:
shot quality
keeper power
shot type
pressure
angle/distance factors
This is much better than flat conversion from SOT.
11. Resolve shot outcome
Add:
function resolveShotOutcome(
  ctx: ShotContext,
  shooter: Player,
  keeper: Player | undefined,
  defenders: Player[],
  cfg: MatchEngineConfig
): ShotOutcome
Possible outcomes
BLOCKED
MISS
SAVE
GOAL
WOODWORK
Recommended order
maybe blocked if high defensive pressure
if not blocked, determine on target
if not on target -> miss or woodwork
if on target -> save or goal
some saves / blocks can become corners
This alone creates much richer shot stories.
12. Improve player selection for events
Right now event player selection is mostly random. Make it weighted.
Add:
function pickShooter(players: Player[], attackType: AttackType): Player
function pickAssister(players: Player[], shooterId: string, attackType: AttackType): Player | null
Shooter weighting ideas
BUILD_UP
Prefer:
FW
attacking MF
high skill/shooting
WIDE_ATTACK
Prefer:
FW
wide MF / wide FW
good heading for crosses
COUNTER
Prefer:
pace
FW
advanced MF
SET_PIECE
Prefer:
heading
influence
DF on corners
shooting for direct free kicks
LONG_SHOT
Prefer:
MF / FW
skill + shooting
This produces believable scorer distributions.
13. Improve cards and fouls model
Right now card checks are mostly separate from attack context. Keep that, but also tie fouls to danger.
Add foul generation in attack phases
For example, when an attack reaches dangerous territory:
chance of tactical foul
chance of yellow
chance of free kick
small chance of penalty in box entries
Use:
dirtiness
fatigue
match urgency
red card avoidance
defending pressure
Benchmarks
Aim for:
fouls total: 20–24
yellows total: 3–4
reds total: 0.10–0.18
14. Improve injuries without overcomplicating
Your current injury logic is okay. Keep most of it.
Add only:
slightly higher risk for high-tempo / trailing frantic matches
small extra risk for tired players after 70'
slight increase for counters / sprints if you want flavor later
Do not overbuild this yet.
15. Improve ratings model
Keep your ratings object shape, but calculate in two layers:
A. Micro adjustments during match
Small increments:
shot: +0.03
shot on target: +0.08
key attacking phase: +0.05
goal: +1.0 to +1.3
assist: +0.35 to +0.6
save: +0.10 to +0.25
major save: +0.30
yellow: -0.2 to -0.35
red: -0.8
injury forced off: -0.15
defensive block/clearance event: +0.03 to +0.08
B. End-of-match normalization
At end:
clean sheet boost for defenders/GK
volume suppression boost for defenders
poor conversion penalty for wasteful forwards
keeper save-rate adjustment
This avoids ratings feeling too scorer-biased.
16. Commentary upgrade path
You already have:
getCommentary(type, team, player)
Keep it.
But add optional contextual tags internally:
type CommentaryContextTag =
  | 'LATE_DRAMA'
  | 'AGAINST_RUN'
  | 'DOMINANT_PRESSURE'
  | 'SCRAPPY'
  | 'KEEPER_ON_FIRE'
  | 'TENSE'
  | 'COMEBACK_PUSH';
Then later you can add:
getContextualCommentary(type, team, player, tags)
For now, even just selecting commentary type from attack phase is enough.
17. What to add to MatchEngineConfig
You already have config. Expand it, don’t replace it.
Add fields like:
interface MatchEngineConfig {
  chanceProbabilityBase: number;
  chanceProbabilityMin: number;
  chanceProbabilityMax: number;
  chanceMidScale: number;

  shotProbabilityFromThreat: number;
  sotProbabilityFromShot: number;
  conversionMultiplier: number;
  goalProbabilityMin: number;
  goalProbabilityMax: number;

  offsideProbabilityPerMinute: number;
  cardCheckPerMinute: number;
  directRedProbability: number;
  injuryCheckPerMinute: number;

  injuryMinorProbability: number;
  injuryModerateGivenNotMinorProbability: number;
  injuryWeeksSeriousMin: number;
  injuryWeeksSeriousMax: number;
  saveVsMissProbability: number;
  penaltyShootoutConversion: number;
  goalScoringOverallScale: number;

  // New v2
  phaseControlBase: number;
  attackProgressionBase: number;
  cornerFromBlockedCrossProbability: number;
  cornerFromSavedShotProbability: number;
  penaltyFromBoxFoulProbability: number;
  longShotBaseProbability: number;
  counterAttackBonus: number;
  trailingUrgencyBoost: number;
  leadingGameManagementDrop: number;
  fatigueDecayStartMinute: number;
  fatigueDecayPerMinute: number;
  lateGameChaosBoost: number;
  woodworkProbability: number;
  blockBaseProbability: number;
}
This lets you calibrate without touching logic every time.
18. Exact refactor plan in safe order
Step 1
Add new interfaces and helper functions with no behavior changes yet.
Step 2
Add:
getFormationModifier
getPlayStyleProfile
buildTeamMatchProfile
Then plug team profile generation into current simulateMatch while still using your current chance logic.
Step 3
Replace current global chance generation with:
resolvePhaseControl
resolveAttackProgression
Still keep old shot resolution at first.
Step 4
Add:
simulateAttackPhase
attack types
natural corner/offside/foul outcomes
Step 5
Replace shot logic with:
buildShotContext
resolveShotOutcome
Step 6
Tune ratings and commentary context.
This way you never break everything at once.
19. Pseudocode for the new simulateMatch
Here is the shape I would use.
for (let min = startMin; min <= finalMinute; min++) {
  const currentHome = getAvailablePlayers(...)
  const currentAway = getAvailablePlayers(...)

  const matchState = buildMatchState(
    min,
    homeGoals,
    awayGoals,
    homeRedCount,
    awayRedCount
  )

  let homeProfile = buildTeamMatchProfile(homeTeam, currentHome, min, ...)
  let awayProfile = buildTeamMatchProfile(awayTeam, currentAway, min, ...)

  homeProfile = applyMatchStateTacticalDrift(homeProfile, matchState, true)
  awayProfile = applyMatchStateTacticalDrift(awayProfile, matchState, false)

  const controller = resolvePhaseControl(homeProfile, awayProfile, matchState, cfg)

  maybeAddAmbientCommentary(...)

  if (!controller) {
    maybeProcessCards(...)
    maybeProcessInjuries(...)
    continue
  }

  const isHomeAttack = controller === 'HOME'
  const attackingTeam = isHomeAttack ? homeTeam : awayTeam
  const defendingTeam = isHomeAttack ? awayTeam : homeTeam
  const attackingPlayers = isHomeAttack ? currentHome : currentAway
  const defendingPlayers = isHomeAttack ? currentAway : currentHome
  const attackingProfile = isHomeAttack ? homeProfile : awayProfile
  const defendingProfile = isHomeAttack ? awayProfile : homeProfile

  const progressed = resolveAttackProgression(
    attackingProfile,
    defendingProfile,
    matchState,
    cfg
  )

  if (!progressed) {
    maybeLogDefensiveCommentary(...)
    maybeProcessCards(...)
    maybeProcessInjuries(...)
    continue
  }

  const phase = simulateAttackPhase(
    attackingTeam,
    defendingTeam,
    attackingPlayers,
    defendingPlayers,
    attackingProfile,
    defendingProfile,
    min,
    cfg
  )

  if (phase.wasOffside) recordOffside(...)
  else if (phase.penaltyWon) recordPenalty(...)
  else if (phase.foulWon) recordFoul(...)
  else if (phase.wonCorner) {
    recordCorner(...)
    maybeResolveCorner(...)
  }
  else if (phase.becameShot && phase.shotContext && phase.shooter) {
    const outcome = resolveShotOutcome(...)
    recordShotOutcome(...)
  }

  maybeProcessCards(...)
  maybeProcessInjuries(...)
}
That is the ideal evolution path.
20. Calibration targets for testing
When you sim 1,000+ matches, aim for:
Combined per match
shots: 22–26
shots on target: 8–10
goals: 2.4–2.8
corners: 8–11
fouls: 20–24
yellows: 3–4
reds: 0.10–0.18
offsides: 2–4
Scoreline feel
You want a believable spread:
0-0 occasional, not constant
1-0 / 1-1 common
2-1 / 2-0 common
3-2 occasional
4+ goals less common but not rare
big blowouts only when quality gap is meaningful
21. My recommendation for your codebase specifically
For Retro Manager, I would create this as:
File layout later
game-engine.ts → public exports
engine-profile.ts → profile builders
engine-state.ts → match state + drift
engine-attack.ts → attack phases
engine-shot.ts → shot context + outcome
engine-ratings.ts → rating adjustments
But for now, keep it in one file and refactor safely.
22. Best immediate next move
The best first implementation step is:
Build these first
getFormationModifier()
getPlayStyleProfile()
buildTeamMatchProfile()
buildMatchState()
applyMatchStateTacticalDrift()
Then wire those into your current loop before touching attack logic.
That gives you an improved base without breaking your current engine.