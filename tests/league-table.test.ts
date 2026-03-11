import { describe, it, expect } from 'vitest';
import { updateLeagueTable } from '@/lib/game-engine';
import type { Team, Fixture } from '@/types/game';

function makeTeam(id: string, name: string, division: number): Team {
  return {
    id,
    name,
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
    formation: '4-4-2',
    playStyle: 'Pass to Feet',
    preferredFormation: '4-4-2',
    preferredStyle: 'Pass to Feet',
    division,
    reputation: 50,
    playedHistory: [],
    staff: [],
    lineup: [],
    finances: { gateReceipts: 0, merchandise: 0, wagesPaid: 0, transfersIn: 0, transfersOut: 0, taxPaid: 0 },
  };
}

function makeFixture(homeId: string, awayId: string, division: number, week: number, hg: number, ag: number): Fixture {
  return {
    id: `f-${homeId}-${awayId}-w${week}`,
    homeTeamId: homeId,
    awayTeamId: awayId,
    week,
    division,
    competition: 'LEAGUE',
    result: {
      homeGoals: hg,
      awayGoals: ag,
      attendance: 20000,
      events: [],
      ratings: {},
      scorers: [],
      cards: [],
      injuries: [],
    },
  };
}

describe('updateLeagueTable', () => {
  it('returns teams sorted by points then goal difference', () => {
    const teams: Team[] = [
      makeTeam('a', 'Team A', 1),
      makeTeam('b', 'Team B', 1),
      makeTeam('c', 'Team C', 1),
    ];
    const fixtures: Fixture[] = [
      makeFixture('a', 'b', 1, 1, 2, 0), // A wins
      makeFixture('a', 'c', 1, 2, 1, 0), // A wins
      makeFixture('b', 'c', 1, 3, 1, 1), // draw
    ];
    const table = updateLeagueTable(teams, fixtures, 1);
    expect(table).toHaveLength(3);
    expect(table[0].id).toBe('a');
    expect(table[0].points).toBe(6);
    expect(table[0].won).toBe(2);
    expect(table[0].goalsFor).toBe(3);
    expect(table[0].goalsAgainst).toBe(0);
    expect(table[1].id).toBe('c'); // C and B both 1 pt; C has better GD
    expect(table[1].points).toBe(1);
    expect(table[1].drawn).toBe(1);
    expect(table[2].id).toBe('b');
    expect(table[2].points).toBe(1);
    expect(table[2].lost).toBe(1);
  });

  it('points = 3*won + drawn for each team', () => {
    const teams: Team[] = [
      makeTeam('a', 'A', 1),
      makeTeam('b', 'B', 1),
    ];
    const fixtures: Fixture[] = [
      makeFixture('a', 'b', 1, 1, 1, 0), // A 3 pts, B 0
      makeFixture('b', 'a', 1, 2, 0, 0), // draw: A 1, B 1
    ];
    const table = updateLeagueTable(teams, fixtures, 1);
    const teamA = table.find(t => t.id === 'a')!;
    const teamB = table.find(t => t.id === 'b')!;
    expect(teamA.points).toBe(3 + 1);
    expect(teamB.points).toBe(0 + 1);
    expect(teamA.played).toBe(2);
    expect(teamB.played).toBe(2);
  });

  it('only includes fixtures for the given division and with result', () => {
    const teams: Team[] = [
      makeTeam('a', 'A', 1),
      makeTeam('b', 'B', 1),
      makeTeam('c', 'C', 2),
    ];
    const fixtures: Fixture[] = [
      makeFixture('a', 'b', 1, 1, 1, 0),
      makeFixture('c', 'c', 2, 1, 0, 0), // invalid self-game, but division 2
    ];
    const tableDiv1 = updateLeagueTable(teams, fixtures, 1);
    expect(tableDiv1).toHaveLength(2);
    expect(tableDiv1.find(t => t.id === 'a')?.played).toBe(1);

    const tableDiv2 = updateLeagueTable(teams, fixtures, 2);
    expect(tableDiv2).toHaveLength(1);
  });

  it('played = won + drawn + lost for each team', () => {
    const teams: Team[] = [
      makeTeam('a', 'A', 1),
      makeTeam('b', 'B', 1),
    ];
    const fixtures: Fixture[] = [
      makeFixture('a', 'b', 1, 1, 2, 1),
      makeFixture('b', 'a', 1, 2, 1, 2),
    ];
    const table = updateLeagueTable(teams, fixtures, 1);
    for (const t of table) {
      expect(t.played).toBe(t.won + t.drawn + t.lost);
    }
  });
});
