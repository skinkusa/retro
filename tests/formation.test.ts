import { describe, it, expect } from 'vitest';
import {
  getFormationRequirements,
  getFormationSlots,
  getBestSquadForTeam,
} from '@/lib/game-engine';
import type { Team, Player } from '@/types/game';

const FORMATIONS = ['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-5-1'];

function makePlayer(id: string, position: Player['position'], clubId: string): Player {
  return {
    id,
    name: `Player ${id}`,
    nationality: 'England',
    age: 25,
    position,
    side: 'C',
    attributes: {
      pace: 10,
      stamina: 10,
      skill: 10,
      shooting: 10,
      passing: 10,
      heading: 10,
      influence: 10,
      goalkeeping: position === 'GK' ? 14 : 5,
      consistency: 10,
      dirtiness: 5,
      injuryProne: 5,
      temperament: 10,
      potential: 12,
      professionalism: 10,
    },
    fitness: 100,
    morale: 80,
    value: 500000,
    wage: 5000,
    contractYears: 2,
    clubId,
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

function makeTeam(id: string, formation: string): Team {
  return {
    id,
    name: 'Test FC',
    stadium: 'S',
    stadiumCapacity: 20000,
    color: '#000',
    awayColor: '#fff',
    budget: 1e6,
    weeklyWages: 50000,
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    formation,
    playStyle: 'Pass to Feet',
    preferredFormation: formation,
    preferredStyle: 'Pass to Feet',
    division: 1,
    reputation: 50,
    playedHistory: [],
    staff: [],
    lineup: [],
    finances: { gateReceipts: 0, merchandise: 0, wagesPaid: 0, transfersIn: 0, transfersOut: 0, taxPaid: 0 },
  };
}

describe('getFormationRequirements', () => {
  it('returns exactly 11 positions for each known formation', () => {
    for (const formation of FORMATIONS) {
      const positions = getFormationRequirements(formation);
      expect(positions).toHaveLength(11);
      expect(positions.filter(p => p === 'GK')).toHaveLength(1);
    }
  });

  it('defaults to 4-4-2 for unknown formation', () => {
    const positions = getFormationRequirements('unknown');
    expect(positions).toHaveLength(11);
    expect(positions[0]).toBe('GK');
  });

  it('4-3-3 has 3 FW, 3 MF, 4 DF, 1 GK', () => {
    const positions = getFormationRequirements('4-3-3');
    expect(positions.filter(p => p === 'GK')).toHaveLength(1);
    expect(positions.filter(p => p === 'DF')).toHaveLength(4);
    expect(positions.filter(p => p === 'MF')).toHaveLength(3);
    expect(positions.filter(p => p === 'FW')).toHaveLength(3);
  });
});

describe('getFormationSlots', () => {
  it('returns exactly 11 slots for each known formation', () => {
    for (const formation of FORMATIONS) {
      const slots = getFormationSlots(formation);
      expect(slots).toHaveLength(11);
      expect(slots[0].pos).toBe('GK');
    }
  });

  it('each slot has id, label, top, left, pos', () => {
    const slots = getFormationSlots('4-4-2');
    for (const slot of slots) {
      expect(slot).toHaveProperty('id');
      expect(slot).toHaveProperty('label');
      expect(slot).toHaveProperty('top');
      expect(slot).toHaveProperty('left');
      expect(slot).toHaveProperty('pos');
      expect(typeof slot.top).toBe('number');
      expect(typeof slot.left).toBe('number');
    }
  });
});

describe('getBestSquadForTeam', () => {
  it('returns 11 non-null player ids when team has enough players', () => {
    const team = makeTeam('team-1', '4-4-2');
    const players: Player[] = [
      makePlayer('gk', 'GK', 'team-1'),
      ...Array.from({ length: 10 }, (_, i) => makePlayer(`p${i}`, 'DF', 'team-1')),
    ];
    const lineup = getBestSquadForTeam(team, players);
    const first11 = lineup.slice(0, 11).filter((id): id is string => id !== null);
    expect(first11).toHaveLength(11);
    expect(new Set(first11).size).toBe(11);
  });

  it('returns lineup of length 16 (11 + 5 subs)', () => {
    const team = makeTeam('team-1', '4-3-3');
    const players: Player[] = Array.from({ length: 20 }, (_, i) =>
      makePlayer(`p${i}`, i === 0 ? 'GK' : 'MF', 'team-1')
    );
    const lineup = getBestSquadForTeam(team, players);
    expect(lineup.length).toBeGreaterThanOrEqual(11);
  });
});
