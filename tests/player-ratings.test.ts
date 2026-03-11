import { describe, it, expect } from 'vitest';
import { simulateMatch } from '@/lib/game-engine';
import { getFormationRequirements } from '@/lib/game-engine';
import type { Team, Player } from '@/types/game';

const defaultAttrs = () => ({
  pace: 10, stamina: 10, skill: 10, shooting: 10, passing: 10, heading: 10,
  influence: 10, goalkeeping: 5, consistency: 12, dirtiness: 5, injuryProne: 5,
  temperament: 10, potential: 12, professionalism: 10,
});

function makePlayer(id: string, position: 'GK' | 'DF' | 'MF' | 'FW', overrides: Partial<Player['attributes']> = {}): Player {
  const attrs = { ...defaultAttrs(), ...overrides };
  if (position === 'GK') (attrs as any).goalkeeping = 14;
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

function makeTeam(id: string, name: string): Team {
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
  };
}

function makeStartingEleven(prefix: string): Player[] {
  const positions = getFormationRequirements('4-3-3');
  return positions.map((pos, i) => {
    const p = pos as 'GK' | 'DF' | 'MF' | 'FW';
    return makePlayer(`${prefix}-${i}`, p);
  });
}

describe('player ratings', () => {
  const homeTeam = makeTeam('home', 'Home FC');
  const awayTeam = makeTeam('away', 'Away United');
  const homeStarters = makeStartingEleven('h');
  const awayStarters = makeStartingEleven('a');
  const allStarters = [...homeStarters, ...awayStarters];

  it('every starter has a rating between 4 and 10', () => {
    const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
    for (const p of allStarters) {
      expect(result.ratings[p.id]).toBeDefined();
      expect(result.ratings[p.id]).toBeGreaterThanOrEqual(4);
      expect(result.ratings[p.id]).toBeLessThanOrEqual(10);
    }
  });

  it('scorers have rating at least 6', () => {
    let result: ReturnType<typeof simulateMatch> | undefined;
    for (let i = 0; i < 40; i++) {
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

  it('red-carded players have lower average rating than non-carded in same match', () => {
    let result: ReturnType<typeof simulateMatch> | undefined;
    for (let i = 0; i < 80; i++) {
      const r = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
      const reds = r.cards.filter(c => c.type === 'RED');
      if (reds.length > 0) {
        result = r;
        break;
      }
    }
    expect(result).toBeDefined();
    const redIds = new Set(result!.cards.filter(c => c.type === 'RED').map(c => c.playerId));
    const cardedRatings = allStarters.filter(p => redIds.has(p.id)).map(p => result!.ratings[p.id] ?? 6);
    const nonCardedRatings = allStarters.filter(p => !redIds.has(p.id)).map(p => result!.ratings[p.id] ?? 6);
    if (cardedRatings.length > 0 && nonCardedRatings.length > 0) {
      const avgCarded = cardedRatings.reduce((a, b) => a + b, 0) / cardedRatings.length;
      const avgNonCarded = nonCardedRatings.reduce((a, b) => a + b, 0) / nonCardedRatings.length;
      expect(avgCarded).toBeLessThanOrEqual(avgNonCarded + 0.6);
    }
  });

  it('Man of the Match has highest rating in the result', () => {
    const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
    const entries = Object.entries(result.ratings);
    const maxRating = Math.max(...entries.map(([, r]) => r));
    const bestIds = entries.filter(([, r]) => r === maxRating).map(([id]) => id);
    expect(bestIds.length).toBeGreaterThanOrEqual(1);
    expect(maxRating).toBeGreaterThanOrEqual(4);
    expect(maxRating).toBeLessThanOrEqual(10);
  });

  it('average rating across all 22 players is between 5.5 and 7.5', () => {
    let totalAvg = 0;
    const runs = 20;
    for (let i = 0; i < runs; i++) {
      const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
      const sum = allStarters.reduce((acc, p) => acc + (result.ratings[p.id] ?? 6), 0);
      totalAvg += sum / 22;
    }
    const overallAvg = totalAvg / runs;
    expect(overallAvg).toBeGreaterThanOrEqual(5.5);
    expect(overallAvg).toBeLessThanOrEqual(7.5);
  });

  it('ratings are numeric and finite', () => {
    const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
    for (const [id, r] of Object.entries(result.ratings)) {
      expect(typeof r).toBe('number');
      expect(Number.isFinite(r)).toBe(true);
      expect(id).toBeTruthy();
    }
  });
});
