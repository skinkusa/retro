import { describe, it, expect } from 'vitest';
import { compressedSave, parseStoredSave, buildSaveable } from '@/lib/save-utils';
import { generateInitialData } from '@/lib/game-data';
import type { GameState } from '@/types/game';

function getMinimalGameState(): GameState {
  const { teams, players, fixtures, availableStaff, cupEntrants } = generateInitialData();
  return {
    currentWeek: 1,
    season: 1993,
    userTeamId: teams[0].id,
    manager: { name: 'Test', personality: 'Analyst', reputation: 10, seasonsManaged: 0, trophies: [], winPercentage: 0, totalGames: 0, totalWins: 0 },
    teams: teams.map(t => ({ ...t, isUserTeam: t.id === teams[0].id })),
    players,
    fixtures,
    messages: [],
    isGameStarted: true,
    isFired: false,
    isSeasonOver: false,
    seasonSummary: null,
    boardConfidence: 75,
    boardExpectation: 'Mid-table',
    targetPosition: 10,
    transferMarket: { listed: [], incomingBids: [] },
    availableStaff,
    jobMarket: [],
    cupEntrants,
    records: { biggestWin: null, biggestLoss: null, transferPaid: null, transferReceived: null },
    currentMatchFixtureId: null,
  };
}

describe('save-utils round-trip', () => {
  it('compressedSave then parseStoredSave yields equivalent core state', () => {
    const state = getMinimalGameState();
    const raw = compressedSave(state);
    expect(raw).toBeTruthy();
    expect(typeof raw).toBe('string');

    const loaded = parseStoredSave(raw);
    expect(loaded.currentWeek).toBe(state.currentWeek);
    expect(loaded.season).toBe(state.season);
    expect(loaded.userTeamId).toBe(state.userTeamId);
    expect(loaded.teams).toHaveLength(state.teams.length);
    expect(loaded.players).toHaveLength(state.players.length);
    expect(loaded.fixtures).toHaveLength(state.fixtures.length);
    expect(loaded.isGameStarted).toBe(state.isGameStarted);
  });

  it('loaded state has slimmed fixtures (no ratings on results)', () => {
    const state = getMinimalGameState();
    state.fixtures[0].result = {
      homeGoals: 1,
      awayGoals: 0,
      attendance: 20000,
      events: [],
      ratings: { 'p-1': 7.5 },
      scorers: [],
      cards: [],
      injuries: [],
    };
    const raw = compressedSave(state);
    const loaded = parseStoredSave(raw);
    const firstWithResult = loaded.fixtures.find(f => f.result);
    expect(firstWithResult?.result?.ratings).toEqual({});
    expect(firstWithResult?.result?.homeGoals).toBe(1);
    expect(firstWithResult?.result?.scorers).toBeDefined();
  });

  it('loaded players have at most 5 history entries each', () => {
    const state = getMinimalGameState();
    state.players.forEach((p, i) => {
      if (i < 3) {
        p.history = Array.from({ length: 10 }, (_, j) => ({
          season: 1990 + j,
          apps: 30,
          goals: 5,
          avgRating: 7,
          clubName: 'Test FC',
        }));
      }
    });
    const raw = compressedSave(state);
    const loaded = parseStoredSave(raw);
    const withHistory = loaded.players.filter(p => p.history && p.history.length > 0);
    withHistory.forEach(p => {
      expect(p.history!.length).toBeLessThanOrEqual(5);
    });
  });

  it('parseStoredSave accepts legacy plain JSON', () => {
    const state = getMinimalGameState();
    const plain = JSON.stringify(buildSaveable(state));
    const loaded = parseStoredSave(plain);
    expect(loaded.season).toBe(state.season);
    expect(loaded.players.length).toBe(state.players.length);
  });
});
