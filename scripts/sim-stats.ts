/**
 * Run many match simulations and print aggregate stats (avg score, shots, home/away/draw %, etc.).
 * Also runs comparison sims to show that strength, formation, and style affect outcomes.
 * Run: npx tsx scripts/sim-stats.ts
 */
import { simulateMatch, getFormationRequirements } from '../src/lib/game-engine';
import type { Team, Player } from '../src/types/game';

const defaultAttrs = () => ({
  pace: 10, stamina: 10, skill: 10, shooting: 10, passing: 10, heading: 10,
  influence: 10, goalkeeping: 5, consistency: 12, dirtiness: 5, injuryProne: 5,
  temperament: 10, potential: 12, professionalism: 10,
});

function makePlayer(
  id: string,
  position: 'GK' | 'DF' | 'MF' | 'FW',
  overrides: Partial<Player['attributes']> = {}
): Player {
  const attrs = { ...defaultAttrs(), ...overrides };
  if (position === 'GK') attrs.goalkeeping = 14;
  return {
    id,
    name: `Player ${id}`,
    nationality: 'England',
    age: 25,
    position,
    side: 'C',
    attributes: attrs,
    fitness: 100,
    morale: 80,
    value: 500_000,
    wage: 5000,
    contractYears: 2,
    clubId: null,
    condition: 100,
    recentForm: [],
    developmentPoints: 0,
    status: 'FIT',
    isListed: false,
    suspensionWeeks: 0,
    injury: null,
    seasonStats: { apps: 0, goals: 0, avgRating: 0, yellowCards: 0, redCards: 0 },
    history: [],
  };
}

function makeTeam(id: string, name: string, overrides: Partial<Team> = {}): Team {
  return {
    id,
    name,
    stadium: 'Stadium',
    stadiumCapacity: 30000,
    color: '#000',
    homeTextColor: '#fff',
    awayColor: '#fff',
    awayTextColor: '#000',
    budget: 1_000_000,
    weeklyWages: 50_000,
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    formation: '4-3-3',
    playStyle: 'Pass to Feet',
    preferredFormation: '4-3-3',
    preferredStyle: 'Pass to Feet',
    division: 1,
    reputation: 100,
    playedHistory: [],
    staff: [],
    lineup: [],
    finances: { gateReceipts: 0, merchandise: 0, wagesPaid: 0, transfersIn: 0, transfersOut: 0, taxPaid: 0 },
    ...overrides,
  };
}

function makeStartingEleven(prefix: string): Player[] {
  return [
    makePlayer(`${prefix}-gk`, 'GK'),
    makePlayer(`${prefix}-dl`, 'DF'),
    makePlayer(`${prefix}-dc1`, 'DF'),
    makePlayer(`${prefix}-dc2`, 'DF'),
    makePlayer(`${prefix}-dr`, 'DF'),
    makePlayer(`${prefix}-mc1`, 'MF'),
    makePlayer(`${prefix}-mc2`, 'MF'),
    makePlayer(`${prefix}-mc3`, 'MF'),
    makePlayer(`${prefix}-fl`, 'FW'),
    makePlayer(`${prefix}-fc`, 'FW'),
    makePlayer(`${prefix}-fr`, 'FW'),
  ];
}

function makePlayerWithLevel(id: string, position: string, level: number): Player {
  const pos = position as 'GK' | 'DF' | 'MF' | 'FW' | 'DM';
  const attrs = {
    pace: level, stamina: level, skill: level, shooting: level, passing: level, heading: level,
    influence: level, goalkeeping: pos === 'GK' ? Math.max(level, 12) : level, consistency: Math.min(20, level + 2),
    dirtiness: 5, injuryProne: 5, temperament: 10, potential: 12, professionalism: 10,
  };
  return {
    id,
    name: `Player ${id}`,
    nationality: 'England',
    age: 25,
    position: pos,
    side: 'C',
    attributes: attrs,
    fitness: 100,
    morale: 80,
    value: 500_000,
    wage: 5000,
    contractYears: 2,
    clubId: null,
    condition: 100,
    recentForm: [],
    developmentPoints: 0,
    status: 'FIT',
    isListed: false,
    suspensionWeeks: 0,
    injury: null,
    seasonStats: { apps: 0, goals: 0, avgRating: 0, yellowCards: 0, redCards: 0 },
    history: [],
  };
}

function makeSquadWithLevel(prefix: string, level: number, formation: string): Player[] {
  const positions = getFormationRequirements(formation);
  return positions.map((pos, i) => makePlayerWithLevel(`${prefix}-${pos}-${i}`, pos, level));
}

const N = 2000;
const homeTeam = makeTeam('home', 'Home FC');
const awayTeam = makeTeam('away', 'Away United');
const homeStarters = makeStartingEleven('h');
const awayStarters = makeStartingEleven('a');

const stats = {
  games: 0,
  homeGoals: 0,
  awayGoals: 0,
  homeShots: 0,
  awayShots: 0,
  homeChances: 0,
  awayChances: 0,
  homeSot: 0,
  awaySot: 0,
  homeWins: 0,
  awayWins: 0,
  draws: 0,
  yellowCards: 0,
  redCards: 0,
  injuries: 0,
  totalGoals: 0,
};

console.log(`Running ${N} simulations...`);
for (let i = 0; i < N; i++) {
  const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters);
  if (!result) continue;
  stats.games++;
  stats.homeGoals += result.homeGoals;
  stats.awayGoals += result.awayGoals;
  stats.totalGoals += result.homeGoals + result.awayGoals;
  stats.homeShots += result.homeShots ?? 0;
  stats.awayShots += result.awayShots ?? 0;
  stats.homeChances += result.homeChances ?? 0;
  stats.awayChances += result.awayChances ?? 0;
  stats.homeSot += result.homeShotsOnTarget ?? 0;
  stats.awaySot += result.awayShotsOnTarget ?? 0;
  if (result.homeGoals > result.awayGoals) stats.homeWins++;
  else if (result.awayGoals > result.homeGoals) stats.awayWins++;
  else stats.draws++;
  stats.yellowCards += result.cards.filter(c => c.type === 'YELLOW').length;
  stats.redCards += result.cards.filter(c => c.type === 'RED').length;
  stats.injuries += result.injuries.length;
}

const g = stats.games;
const table: Array<[string, string]> = [
  ['**Metric**', '**Value**'],
  ['Games simulated', String(N)],
  ['', ''],
  ['**Score**', ''],
  ['Avg goals per game (total)', (stats.totalGoals / g).toFixed(2)],
  ['Avg home goals per game', (stats.homeGoals / g).toFixed(2)],
  ['Avg away goals per game', (stats.awayGoals / g).toFixed(2)],
  ['', ''],
  ['**Outcomes**', ''],
  ['Home wins', `${stats.homeWins} (${(100 * stats.homeWins / g).toFixed(1)}%)`],
  ['Away wins', `${stats.awayWins} (${(100 * stats.awayWins / g).toFixed(1)}%)`],
  ['Draws', `${stats.draws} (${(100 * stats.draws / g).toFixed(1)}%)`],
  ['', ''],
  ['**Shots**', ''],
  ['Avg home shots per game', (stats.homeShots / g).toFixed(2)],
  ['Avg away shots per game', (stats.awayShots / g).toFixed(2)],
  ['Avg total shots per game', ((stats.homeShots + stats.awayShots) / g).toFixed(2)],
  ['Avg home shots on target', (stats.homeSot / g).toFixed(2)],
  ['Avg away shots on target', (stats.awaySot / g).toFixed(2)],
  ['', ''],
  ['**Chances (threats)**', ''],
  ['Avg home chances per game', (stats.homeChances / g).toFixed(2)],
  ['Avg away chances per game', (stats.awayChances / g).toFixed(2)],
  ['', ''],
  ['**Discipline & injuries**', ''],
  ['Yellow cards per game', (stats.yellowCards / g).toFixed(2)],
  ['Red cards per game', (stats.redCards / g).toFixed(2)],
  ['Injuries per game', (stats.injuries / g).toFixed(2)],
];

function fmtRow(a: string, b: string, colWidth: number[]) {
  return '| ' + a.padEnd(colWidth[0]) + ' | ' + b.padEnd(colWidth[1]) + ' |';
}
const col0 = Math.max(...table.map(([a]) => a.length), 10);
const col1 = Math.max(...table.map(([, b]) => b.length), 10);
const sep = '|' + '-'.repeat(col0 + 2) + '|' + '-'.repeat(col1 + 2) + '|';
console.log('\n' + fmtRow('Metric', 'Value', [col0, col1]));
console.log(sep);
for (let i = 1; i < table.length; i++) {
  const [a, b] = table[i];
  if (a === '' && b === '') continue;
  console.log(fmtRow(a.replace(/\*\*/g, ''), b, [col0, col1]));
}
console.log('');

// --- Mechanics impact: do strength, formation, style affect outcomes? ---
const N_COMPARE = 500;
console.log('--- MECHANICS IMPACT (each scenario ' + N_COMPARE + ' games) ---\n');

// 1. Strong vs Weak
const strongTeam = makeTeam('strong', 'Strong FC', { formation: '4-3-3', playStyle: 'Pass to Feet' });
const weakTeam = makeTeam('weak', 'Weak FC', { formation: '4-3-3', playStyle: 'Pass to Feet' });
const strongSquad = makeSquadWithLevel('s', 14, '4-3-3');
const weakSquad = makeSquadWithLevel('w', 6, '4-3-3');
let strongWins = 0, weakWins = 0, draws = 0, goalDiffSum = 0;
for (let i = 0; i < N_COMPARE; i++) {
  const r = simulateMatch(strongTeam, weakTeam, strongSquad, weakSquad)!;
  goalDiffSum += r.homeGoals - r.awayGoals;
  if (r.homeGoals > r.awayGoals) strongWins++; else if (r.awayGoals > r.homeGoals) weakWins++; else draws++;
}
console.log('1. STRONG (level 14) vs WEAK (level 6) – same formation & style');
console.log('   Strong win %: ' + (100 * strongWins / N_COMPARE).toFixed(1) + '  |  Weak win %: ' + (100 * weakWins / N_COMPARE).toFixed(1) + '  |  Draw %: ' + (100 * draws / N_COMPARE).toFixed(1));
console.log('   Avg goal diff (Strong - Weak): ' + (goalDiffSum / N_COMPARE).toFixed(2) + '  (positive = stronger team ahead)\n');

// 2. Formation: 4-3-3 vs 4-5-1 (same player level)
const team433 = makeTeam('a', '4-3-3 FC', { formation: '4-3-3', playStyle: 'Pass to Feet' });
const team451 = makeTeam('b', '4-5-1 FC', { formation: '4-5-1', playStyle: 'Pass to Feet' });
const squad433 = makeSquadWithLevel('a', 10, '4-3-3');
const squad451 = makeSquadWithLevel('b', 10, '4-5-1');
let goals433 = 0, goals451 = 0;
for (let i = 0; i < N_COMPARE; i++) {
  const r1 = simulateMatch(team433, team451, squad433, squad451)!;
  goals433 += r1.homeGoals;
  goals451 += r1.awayGoals;
  const r2 = simulateMatch(team451, team433, squad451, squad433)!;
  goals451 += r2.homeGoals;
  goals433 += r2.awayGoals;
}
const avg433 = goals433 / (N_COMPARE * 2), avg451 = goals451 / (N_COMPARE * 2);
console.log('2. FORMATION: 4-3-3 vs 4-5-1 (same player level 10)');
console.log('   Avg goals per game – 4-3-3: ' + avg433.toFixed(2) + '  |  4-5-1: ' + avg451.toFixed(2) + '  (formation changes outcome)\n');

// 3. Style: Tiki-Taka vs Pass to Feet (same squad)
const tikiTeam = makeTeam('t', 'Tiki FC', { formation: '4-3-3', playStyle: 'Tiki-Taka' });
const passTeam = makeTeam('p', 'Pass FC', { formation: '4-3-3', playStyle: 'Pass to Feet' });
const squad = makeSquadWithLevel('x', 10, '4-3-3');
let tikiGoals = 0, passGoals = 0;
for (let i = 0; i < N_COMPARE; i++) {
  const r1 = simulateMatch(tikiTeam, passTeam, squad, squad)!;
  tikiGoals += r1.homeGoals;
  passGoals += r1.awayGoals;
  const r2 = simulateMatch(passTeam, tikiTeam, squad, squad)!;
  passGoals += r2.homeGoals;
  tikiGoals += r2.awayGoals;
}
const avgTiki = tikiGoals / (N_COMPARE * 2), avgPass = passGoals / (N_COMPARE * 2);
console.log('3. STYLE: Tiki-Taka vs Pass to Feet (same squad, level 10)');
console.log('   Avg goals per game – Tiki-Taka: ' + avgTiki.toFixed(2) + '  |  Pass to Feet: ' + avgPass.toFixed(2) + '  (style affects conversion)\n');
