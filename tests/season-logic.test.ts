import { describe, it, expect } from 'vitest';
import { performSeasonTransition } from '@/lib/season-logic';
import { generateFixtures } from '@/lib/game-data';
import type { GameState, Team, Player } from '@/types/game';

function makeTeam(id: string, name: string, division: number): Team {
  return {
    id,
    name,
    stadium: 'S',
    stadiumCapacity: 20000,
    color: '#000',
    awayColor: '#fff',
    budget: 5_000_000,
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

function makePlayer(id: string, clubId: string, age: number): Player {
  return {
    id,
    name: `Player ${id}`,
    nationality: 'England',
    age,
    position: 'MF',
    side: 'C',
    attributes: {
      pace: 10,
      stamina: 10,
      skill: 10,
      shooting: 10,
      passing: 10,
      heading: 10,
      influence: 10,
      goalkeeping: 5,
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

describe('performSeasonTransition', () => {
  it('returns empty when seasonSummary is null', () => {
    const state: GameState = {
      currentWeek: 38,
      season: 1993,
      userTeamId: 'team-0',
      manager: null,
      teams: [makeTeam('team-0', 'FC', 1)],
      players: [],
      fixtures: [],
      messages: [],
      isGameStarted: true,
      isFired: false,
      isSeasonOver: true,
      seasonSummary: null,
      boardConfidence: 80,
      boardExpectation: 'Mid-table',
      targetPosition: 10,
      transferMarket: { listed: [], incomingBids: [] },
      availableStaff: [],
      jobMarket: [],
      cupEntrants: [],
      records: { biggestWin: null, biggestLoss: null, transferPaid: null, transferReceived: null },
    };
    const result = performSeasonTransition(state);
    expect(result.teams).toBeUndefined();
    expect(result.season).toBeUndefined();
  });

  it('increments season and resets currentWeek when summary present', () => {
    const teams = [
      makeTeam('a', 'Team A', 1),
      makeTeam('b', 'Team B', 1),
    ];
    const fixtures = generateFixtures(teams, 1993).map(f => ({
      ...f,
      result: {
        homeGoals: 1,
        awayGoals: 0,
        attendance: 20000,
        events: [],
        ratings: {} as Record<string, number>,
        scorers: [],
        cards: [],
        injuries: [],
      },
    }));
    teams.forEach(t => {
      t.played = 38;
      t.points = 50;
    });
    const state: GameState = {
      currentWeek: 38,
      season: 1993,
      userTeamId: 'a',
      manager: null,
      teams,
      players: [makePlayer('p1', 'a', 25), makePlayer('p2', 'b', 26)],
      fixtures,
      messages: [],
      isGameStarted: true,
      isFired: false,
      isSeasonOver: true,
      seasonSummary: {
        season: 1993,
        champions: { 1: 'Team A', 2: '', 3: '', 4: '' },
        promoted: { 2: [], 3: [], 4: [] },
        relegated: { 1: [], 2: [], 3: [] },
        userPos: 1,
        userTarget: 10,
        topScorer: null,
        bestPlayer: null,
      },
      boardConfidence: 80,
      boardExpectation: 'Mid-table',
      targetPosition: 10,
      transferMarket: { listed: [], incomingBids: [] },
      availableStaff: [],
      jobMarket: [],
      cupEntrants: [],
      records: { biggestWin: null, biggestLoss: null, transferPaid: null, transferReceived: null },
    };

    const result = performSeasonTransition(state);
    expect(result.season).toBe(1994);
    expect(result.currentWeek).toBe(1);
    expect(result.isSeasonOver).toBe(false);
    expect(result.seasonSummary).toBeNull();
    expect(result.teams).toBeDefined();
    expect(result.fixtures).toBeDefined();
    expect(result!.fixtures!.length).toBeGreaterThan(0);
    expect(result!.fixtures![0].week).toBe(1);
  });

  it('promoted team moves to lower division number', () => {
    const teams = [
      makeTeam('a', 'Champions', 1),
      makeTeam('b', 'Promoted Up', 2),
      makeTeam('c', 'Relegated Down', 1),
    ];
    const fixtures = generateFixtures(teams.filter(t => t.division === 1), 1993).map(f => ({
      ...f,
      result: {
        homeGoals: 1,
        awayGoals: 0,
        attendance: 20000,
        events: [],
        ratings: {} as Record<string, number>,
        scorers: [],
        cards: [],
        injuries: [],
      },
    }));
    const state: GameState = {
      currentWeek: 38,
      season: 1993,
      userTeamId: 'a',
      manager: null,
      teams,
      players: teams.flatMap(t => [makePlayer(`${t.id}-1`, t.id, 25)]),
      fixtures,
      messages: [],
      isGameStarted: true,
      isFired: false,
      isSeasonOver: true,
      seasonSummary: {
        season: 1993,
        champions: { 1: 'Champions', 2: '', 3: '', 4: '' },
        promoted: { 2: ['Promoted Up'], 3: [], 4: [] },
        relegated: { 1: ['Relegated Down'], 2: [], 3: [] },
        userPos: 1,
        userTarget: 10,
        topScorer: null,
        bestPlayer: null,
      },
      boardConfidence: 80,
      boardExpectation: 'Mid-table',
      targetPosition: 10,
      transferMarket: { listed: [], incomingBids: [] },
      availableStaff: [],
      jobMarket: [],
      cupEntrants: [],
      records: { biggestWin: null, biggestLoss: null, transferPaid: null, transferReceived: null },
    };
    const result = performSeasonTransition(state);
    const promotedTeam = result.teams!.find(t => t.name === 'Promoted Up');
    const relegatedTeam = result.teams!.find(t => t.name === 'Relegated Down');
    expect(promotedTeam).toBeDefined();
    expect(promotedTeam!.division).toBe(1);
    expect(relegatedTeam).toBeDefined();
    expect(relegatedTeam!.division).toBe(2);
  });
});
