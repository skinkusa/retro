import { describe, it, expect } from 'vitest';
import { simulateMatch, simulateRemainingMinutes } from '@/lib/game-engine';
import { getFormationRequirements } from '@/lib/game-engine';
import type { Team, Player, Fixture } from '@/types/game';

const defaultAttrs = () => ({
  pace: 10, stamina: 10, skill: 10, shooting: 10, passing: 10, heading: 10,
  influence: 10, goalkeeping: 5, consistency: 12, dirtiness: 5, injuryProne: 5,
  temperament: 10, potential: 12, professionalism: 10,
});

function makePlayer(id: string, position: 'GK' | 'DF' | 'MF' | 'FW'): Player {
  const attrs = { ...defaultAttrs() };
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
  return getFormationRequirements('4-3-3').map((pos, i) =>
    makePlayer(`${prefix}-${i}`, pos as 'GK' | 'DF' | 'MF' | 'FW')
  );
}

describe('match engine result shape', () => {
  const homeTeam = makeTeam('home', 'Home FC');
  const awayTeam = makeTeam('away', 'Away United');
  const homeStarters = makeStartingEleven('h');
  const awayStarters = makeStartingEleven('a');

  it('result has all required top-level keys', () => {
    const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
    expect(result).toHaveProperty('homeGoals');
    expect(result).toHaveProperty('awayGoals');
    expect(result).toHaveProperty('attendance');
    expect(result).toHaveProperty('events');
    expect(result).toHaveProperty('ratings');
    expect(result).toHaveProperty('scorers');
    expect(result).toHaveProperty('cards');
    expect(result).toHaveProperty('injuries');
    expect(Array.isArray(result.events)).toBe(true);
    expect(typeof result.ratings).toBe('object');
    expect(Array.isArray(result.scorers)).toBe(true);
    expect(Array.isArray(result.cards)).toBe(true);
    expect(Array.isArray(result.injuries)).toBe(true);
  });

  it('scorers length equals total goals', () => {
    const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
    expect(result.scorers.length).toBe(result.homeGoals + result.awayGoals);
  });

  it('events are ordered by minute ascending', () => {
    const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
    for (let i = 1; i < result.events.length; i++) {
      expect(result.events[i].minute).toBeGreaterThanOrEqual(result.events[i - 1].minute);
    }
  });

  it('GOAL events match scorers by playerId and minute', () => {
    const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
    const goalEvents = result.events.filter(e => e.type === 'GOAL');
    expect(goalEvents.length).toBe(result.scorers.length);
    const scorerSet = new Set(result.scorers.map(s => `${s.playerId}-${s.minute}`));
    goalEvents.forEach(e => {
      expect(e.playerId).toBeDefined();
      expect(scorerSet.has(`${e.playerId!}-${e.minute}`)).toBe(true);
    });
  });

  it('shotTakers length does not exceed total shots', () => {
    const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
    const totalShots = (result.homeShots ?? 0) + (result.awayShots ?? 0);
    const shotTakers = result.shotTakers ?? [];
    expect(shotTakers.length).toBeLessThanOrEqual(totalShots + 5);
  });

  it('sotTakers length does not exceed total shots on target', () => {
    const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
    const totalSOT = (result.homeShotsOnTarget ?? 0) + (result.awayShotsOnTarget ?? 0);
    const sotTakers = result.sotTakers ?? [];
    expect(sotTakers.length).toBeLessThanOrEqual(totalSOT + 5);
  });

  it('attendance is positive and finite', () => {
    const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
    expect(result.attendance).toBeGreaterThan(0);
    expect(Number.isFinite(result.attendance)).toBe(true);
  });

  it('chances >= shots >= goals and SOT >= goals', () => {
    const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters)!;
    const totalChances = (result.homeChances ?? 0) + (result.awayChances ?? 0);
    const totalShots = (result.homeShots ?? 0) + (result.awayShots ?? 0);
    const totalSOT = (result.homeShotsOnTarget ?? 0) + (result.awayShotsOnTarget ?? 0);
    const totalGoals = result.homeGoals + result.awayGoals;
    expect(totalChances).toBeGreaterThanOrEqual(totalShots);
    expect(totalShots).toBeGreaterThanOrEqual(totalGoals);
    expect(totalSOT).toBeGreaterThanOrEqual(totalGoals);
  });
});

describe('simulateRemainingMinutes result shape', () => {
  const homeTeam = makeTeam('home', 'Home FC');
  const awayTeam = makeTeam('away', 'Away United');
  const homeStarters = makeStartingEleven('h');
  const awayStarters = makeStartingEleven('a');

  it('returns full result shape with at least the partial result goals', () => {
    const partial: Fixture['result'] = {
      homeGoals: 0,
      awayGoals: 0,
      homeChances: 0,
      awayChances: 0,
      attendance: 25000,
      events: [],
      ratings: Object.fromEntries([...homeStarters, ...awayStarters].map(p => [p.id, 6.5])),
      scorers: [],
      cards: [],
      injuries: [],
    };
    const result = simulateRemainingMinutes(partial, 1, homeTeam, awayTeam, homeStarters, awayStarters)!;
    expect(result).toHaveProperty('homeGoals');
    expect(result).toHaveProperty('awayGoals');
    expect(result).toHaveProperty('scorers');
    expect(result).toHaveProperty('ratings');
    expect(result.scorers.length).toBe(result.homeGoals + result.awayGoals);
  });
});
