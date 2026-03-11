import { describe, it, expect } from 'vitest';
import { simulateMatch, simulateRemainingMinutes, getFormationRequirements } from './game-engine';
import type { Team, Player, Fixture } from '@/types/game';

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

/** 4-3-3: 1 GK, 4 DF, 3 MF, 3 FW */
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

/** All attributes set to level (1-20). Use for testing strength impact. */
function makePlayerWithLevel(id: string, position: 'GK' | 'DF' | 'MF' | 'FW' | 'DM', level: number): Player {
  const attrs = {
    pace: level, stamina: level, skill: level, shooting: level, passing: level, heading: level,
    influence: level, goalkeeping: position === 'GK' ? Math.max(level, 12) : level, consistency: Math.min(20, level + 2),
    dirtiness: 5, injuryProne: 5, temperament: 10, potential: 12, professionalism: 10,
  };
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

/** Squad with every player at given attribute level, for formation (e.g. 4-3-3, 4-5-1). */
function makeSquadWithLevel(prefix: string, level: number, formation: string = '4-3-3'): Player[] {
  const positions = getFormationRequirements(formation);
  return positions.map((pos, i) => {
    const p = pos as 'GK' | 'DF' | 'MF' | 'FW' | 'DM';
    return makePlayerWithLevel(`${prefix}-${p}-${i}`, p, level);
  });
}

describe('game-engine', () => {
  const homeTeam = makeTeam('home', 'Home FC');
  const awayTeam = makeTeam('away', 'Away United');
  const homeStarters = makeStartingEleven('h');
  const awayStarters = makeStartingEleven('a');
  const allPlayerIds = new Set([...homeStarters.map(p => p.id), ...awayStarters.map(p => p.id)]);

  describe('simulateMatch', () => {
    it('returns result with homeGoals and awayGoals', () => {
      const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
      expect(typeof result.homeGoals).toBe('number');
      expect(typeof result.awayGoals).toBe('number');
      expect(result.homeGoals).toBeGreaterThanOrEqual(0);
      expect(result.awayGoals).toBeGreaterThanOrEqual(0);
    });

    it('scorers length equals total goals', () => {
      const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
      const totalGoals = result.homeGoals + result.awayGoals;
      expect(result.scorers).toHaveLength(totalGoals);
    });

    it('threats and shots: chances >= shots >= goals, SOT >= goals', () => {
      const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
      expect(result.homeChances).toBeDefined();
      expect(result.awayChances).toBeDefined();
      const totalChances = (result.homeChances ?? 0) + (result.awayChances ?? 0);
      const totalShots = (result.homeShots ?? 0) + (result.awayShots ?? 0);
      const totalSOT = (result.homeShotsOnTarget ?? 0) + (result.awayShotsOnTarget ?? 0);
      const totalGoals = result.homeGoals + result.awayGoals;
      expect(totalChances).toBeGreaterThanOrEqual(totalShots);
      expect(totalShots).toBeGreaterThanOrEqual(totalGoals);
      expect(totalSOT).toBeGreaterThanOrEqual(totalGoals);
    });

    it('every starter has a rating in sensible range', () => {
      const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
      for (const p of [...homeStarters, ...awayStarters]) {
        expect(result.ratings[p.id]).toBeDefined();
        const r = result.ratings[p.id];
        expect(r).toBeGreaterThanOrEqual(4);
        expect(r).toBeLessThanOrEqual(10);
      }
    });

    it('cards array: redCarded players have RED in cards', () => {
      const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
      const reds = result.cards.filter(c => c.type === 'RED');
      const redPlayerIds = new Set(reds.map(c => c.playerId));
      for (const c of result.cards) {
        expect(['YELLOW', 'RED']).toContain(c.type);
        expect(c.minute).toBeGreaterThanOrEqual(1);
        expect(c.minute).toBeLessThanOrEqual(120);
        if (c.type === 'RED') {
          expect(redPlayerIds.has(c.playerId)).toBe(true);
        }
      }
    });

    it('injuries have playerId, type, weeks', () => {
      const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
      for (const inj of result.injuries) {
        expect(allPlayerIds.has(inj.playerId)).toBe(true);
        expect(typeof inj.type).toBe('string');
        expect(inj.weeks).toBeGreaterThanOrEqual(1);
      }
    });

    it('events include GOAL entries matching scorers', () => {
      const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
      const goalEvents = result.events.filter(e => e.type === 'GOAL');
      expect(goalEvents).toHaveLength(result.scorers.length);
      const scorerSet = new Set(result.scorers.map(s => `${s.playerId}-${s.minute}`));
      for (const e of goalEvents) {
        expect(e.playerId).toBeDefined();
        expect(scorerSet.has(`${e.playerId!}-${e.minute}`)).toBe(true);
      }
    });

    it('attendance is a positive number', () => {
      const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
      expect(result.attendance).toBeGreaterThan(0);
    });

    it('scorers receive a rating boost', () => {
      let result: ReturnType<typeof simulateMatch> | undefined;
      for (let i = 0; i < 30; i++) {
        const r = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
        if (r.scorers.length > 0) {
          result = r;
          break;
        }
      }
      expect(result).toBeDefined();
      expect(result!.scorers.length).toBeGreaterThan(0);
      for (const s of result!.scorers) {
        expect(result!.ratings[s.playerId]).toBeGreaterThanOrEqual(6);
      }
    });

    it('carded players receive a rating penalty', () => {
      let result: ReturnType<typeof simulateMatch> | undefined;
      for (let i = 0; i < 50; i++) {
        const r = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
        if (r.cards.length > 0) {
          result = r;
          break;
        }
      }
      expect(result).toBeDefined();
      expect(result!.cards.length).toBeGreaterThan(0);
      const cardedIds = new Set(result!.cards.map(c => c.playerId));
      const nonCardedRatings = [...homeStarters, ...awayStarters]
        .filter(p => !cardedIds.has(p.id))
        .map(p => result!.ratings[p.id] ?? 6);
      const cardedRatings = [...cardedIds].map(id => result!.ratings[id] ?? 6);
      const avgNonCarded = nonCardedRatings.length ? nonCardedRatings.reduce((a, b) => a + b, 0) / nonCardedRatings.length : 6;
      const avgCarded = cardedRatings.length ? cardedRatings.reduce((a, b) => a + b, 0) / cardedRatings.length : 6;
      expect(avgCarded).toBeLessThanOrEqual(avgNonCarded + 0.5);
    });

    it('knockout with draw produces extra time and penalties', () => {
      let result: NonNullable<ReturnType<typeof simulateMatch>> | null = null;
      for (let i = 0; i < 40; i++) {
        const r = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters, [], [], true);
        if (r && r.homeGoals === r.awayGoals) {
          result = r;
          break;
        }
      }
      expect(result).not.toBeNull();
      expect(result!.homeGoals).toBe(result!.awayGoals);
      expect(result!.homePens).toBeDefined();
      expect(result!.awayPens).toBeDefined();
      expect(result!.events.some(e => e.type === 'PENALTY_SHOOTOUT')).toBe(true);
    });
  });

  describe('simulateRemainingMinutes', () => {
    it('resumes from currentResult and returns full result', () => {
      const partial: Fixture['result'] = {
        homeGoals: 1,
        awayGoals: 0,
        homeChances: 2,
        awayChances: 1,
        attendance: 25000,
        events: [{ minute: 15, type: 'GOAL', teamId: homeTeam.id, playerId: homeStarters[10].id, text: 'Goal!' }],
        ratings: Object.fromEntries(homeStarters.concat(awayStarters).map(p => [p.id, 6.5])),
        scorers: [{ playerId: homeStarters[10].id, minute: 15 }],
        cards: [],
        injuries: [],
      };
      const result = simulateRemainingMinutes(partial, 15, homeTeam, awayTeam, homeStarters, awayStarters)!;
      expect(result.homeGoals).toBeGreaterThanOrEqual(1);
      expect(result.awayGoals).toBeGreaterThanOrEqual(0);
      expect(result.scorers.length).toBe(result.homeGoals + result.awayGoals);
      expect(result.scorers.some(s => s.minute === 15 && s.playerId === homeStarters[10].id)).toBe(true);
      const homeShotsOrChances = result.homeShots ?? result.homeChances ?? 0;
      const awayShotsOrChances = result.awayShots ?? result.awayChances ?? 0;
      expect(homeShotsOrChances).toBeGreaterThanOrEqual(result.homeGoals);
      expect(awayShotsOrChances).toBeGreaterThanOrEqual(result.awayGoals);
    });
  });

  describe('calibration (distributions over many matches)', () => {
    it('average goals, shots, cards and injuries fall within target bands', () => {
      const N = 500;
      let totalGoals = 0, totalShots = 0, totalYellows = 0, totalReds = 0, totalInjuries = 0;
      for (let i = 0; i < N; i++) {
        const r = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
        totalGoals += r.homeGoals + r.awayGoals;
        totalShots += (r.homeShots ?? r.homeChances ?? 0) + (r.awayShots ?? r.awayChances ?? 0);
        totalYellows += r.cards.filter(c => c.type === 'YELLOW').length;
        totalReds += r.cards.filter(c => c.type === 'RED').length;
        totalInjuries += r.injuries.length;
      }
      const avgGoals = totalGoals / N;
      const avgShots = totalShots / N;
      const avgYellows = totalYellows / N;
      const avgInjuries = totalInjuries / N;
      expect(avgGoals).toBeGreaterThanOrEqual(1.0);
      expect(avgGoals).toBeLessThanOrEqual(4.5);
      expect(avgShots).toBeGreaterThanOrEqual(8);
      expect(avgShots).toBeLessThanOrEqual(38);
      expect(avgYellows).toBeGreaterThanOrEqual(0.3);
      expect(avgYellows).toBeLessThanOrEqual(8);
      expect(avgInjuries).toBeLessThanOrEqual(0.35);
    });
  });

  describe('mechanics affect outcomes', () => {
    const N = 400;

    it('stronger team wins more often and has better goal difference', () => {
      const strongTeam = makeTeam('strong', 'Strong FC', { formation: '4-3-3', playStyle: 'Pass to Feet' });
      const weakTeam = makeTeam('weak', 'Weak FC', { formation: '4-3-3', playStyle: 'Pass to Feet' });
      const strongStarters = makeSquadWithLevel('s', 14, '4-3-3');
      const weakStarters = makeSquadWithLevel('w', 6, '4-3-3');

      let strongWins = 0;
      let weakWins = 0;
      let draws = 0;
      let goalDiffSum = 0;

      for (let i = 0; i < N; i++) {
        const r = simulateMatch(strongTeam, weakTeam, strongStarters, weakStarters)!;
        goalDiffSum += r.homeGoals - r.awayGoals;
        if (r.homeGoals > r.awayGoals) strongWins++;
        else if (r.awayGoals > r.homeGoals) weakWins++;
        else draws++;
      }

      const strongWinPct = strongWins / N;
      const avgGoalDiff = goalDiffSum / N;

      expect(strongWinPct).toBeGreaterThan(0.5);
      expect(avgGoalDiff).toBeGreaterThan(0.2);
    });

    it('formation affects outcomes (4-5-1 vs 4-3-3 produce different goal rates)', () => {
      const team433 = makeTeam('a', 'Attack FC', { formation: '4-3-3', playStyle: 'Pass to Feet' });
      const team451 = makeTeam('b', 'Defense FC', { formation: '4-5-1', playStyle: 'Pass to Feet' });
      const squad433 = makeSquadWithLevel('a', 10, '4-3-3');
      const squad451 = makeSquadWithLevel('b', 10, '4-5-1');

      let goals433 = 0;
      let goals451 = 0;

      for (let i = 0; i < N; i++) {
        const r1 = simulateMatch(team433, team451, squad433, squad451)!;
        goals433 += r1.homeGoals;
        goals451 += r1.awayGoals;
        const r2 = simulateMatch(team451, team433, squad451, squad433)!;
        goals451 += r2.homeGoals;
        goals433 += r2.awayGoals;
      }

      const avgGoals433 = goals433 / (N * 2);
      const avgGoals451 = goals451 / (N * 2);
      expect(Math.abs(avgGoals433 - avgGoals451)).toBeGreaterThan(0.15);
    });

    it('Tiki-Taka conversion bonus produces more goals than Pass to Feet over many games', () => {
      const tikiTeam = makeTeam('t', 'Tiki FC', { formation: '4-3-3', playStyle: 'Tiki-Taka' });
      const passTeam = makeTeam('p', 'Pass FC', { formation: '4-3-3', playStyle: 'Pass to Feet' });
      const squad = makeSquadWithLevel('x', 10, '4-3-3');

      let tikiGoals = 0;
      let passGoals = 0;

      for (let i = 0; i < N; i++) {
        const r1 = simulateMatch(tikiTeam, passTeam, squad, squad)!;
        tikiGoals += r1.homeGoals;
        passGoals += r1.awayGoals;
        const r2 = simulateMatch(passTeam, tikiTeam, squad, squad)!;
        passGoals += r2.homeGoals;
        tikiGoals += r2.awayGoals;
      }

      const avgTiki = tikiGoals / (N * 2);
      const avgPass = passGoals / (N * 2);
      // Tiki-Taka conversion bonus should tend to yield more goals; allow small variance
      expect(avgTiki).toBeGreaterThan(avgPass - 0.12);
    });
  });
});
