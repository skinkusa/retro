import { describe, it, expect } from 'vitest';
import { simulateMatch, simulateRemainingMinutes } from './game-engine';
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
    awayColor: '#fff',
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
        expect(result!.ratings[s.playerId]).toBeGreaterThanOrEqual(6.5);
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
});
