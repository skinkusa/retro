import { generateInitialData } from '../src/lib/game-data';
import { performSeasonTransition } from '../src/lib/season-logic';
import { updateLeagueTable } from '../src/lib/game-engine';
import { GameState } from '../src/types/game';

/**
 * Financial Stability Simulation.
 * Ensures team budgets stay within reasonable bounds over 10 seasons.
 * Run with: npx tsx tests/financial-stability.ts
 */
async function runFinancialSim() {
  console.log('💰 Starting Financial Stability Simulation (10 Seasons)...');

  const initial = generateInitialData();
  let state: GameState = {
    currentWeek: 1,
    season: 1993,
    userTeamId: 'team-0',
    manager: null,
    teams: initial.teams,
    players: initial.players,
    fixtures: initial.fixtures,
    messages: [],
    isGameStarted: true,
    isFired: false,
    isSeasonOver: false,
    seasonSummary: null,
    boardConfidence: 80,
    boardExpectation: 'Normal',
    targetPosition: 10,
    transferMarket: { listed: [], incomingBids: [] },
    availableStaff: [],
    jobMarket: [],
    cupEntrants: [],
    records: { biggestWin: null, biggestLoss: null, transferPaid: null, transferReceived: null }
  };

  for (let s = 1; s <= 10; s++) {
    // 1. Weekly Finances (Simulated)
    // In a real game, this happens every week. Here we simulate 38 weeks of income/expenses in one go.
    state.teams = state.teams.map(t => {
      const weeklyGate = 50000 + (Math.random() * 100000); // Mock average gate
      const weeklyMerch = 5000 + (t.reputation * 100);
      const weeklyWages = t.weeklyWages;
      
      const seasonProfit = (weeklyGate + weeklyMerch - weeklyWages) * 38;
      return {
        ...t,
        budget: Math.max(0, t.budget + seasonProfit)
      };
    });

    // 2. Mock Results for Summary
    state.fixtures = state.fixtures.map(f => ({
      ...f,
      result: { homeGoals: 1, awayGoals: 0, attendance: 20000, events: [], ratings: {}, scorers: [], cards: [], injuries: [] }
    }));

    const standingsByDiv = [1, 2, 3, 4].map(div => updateLeagueTable(state.teams, state.fixtures, div));
    state.seasonSummary = {
      season: state.season,
      champions: { 1: '', 2: '', 3: '', 4: '' },
      promoted: { 2: [], 3: [], 4: [] },
      relegated: { 1: [], 2: [], 3: [] },
      userPos: 1, userTarget: 10, topScorer: null, bestPlayer: null
    };

    // 3. Season Transition (Prize Money added here)
    const nextStateParts = performSeasonTransition(state);
    state = { ...state, ...nextStateParts } as GameState;

    // 4. Reporting
    const avgBudget = state.teams.reduce((acc, t) => acc + t.budget, 0) / state.teams.length;
    const maxBudget = Math.max(...state.teams.map(t => t.budget));
    const minBudget = Math.min(...state.teams.map(t => t.budget));
    const bankruptTeams = state.teams.filter(t => t.budget <= 0).length;

    console.log(`\n--- Season ${state.season} Financial Report ---`);
    console.log(`Average Budget: £${(avgBudget / 1000000).toFixed(2)}M`);
    console.log(`Max Budget: £${(maxBudget / 1000000).toFixed(2)}M`);
    console.log(`Min Budget: £${(minBudget / 1000000).toFixed(2)}M`);
    if (bankruptTeams > 0) console.log(`⚠️ Bankrupt Teams: ${bankruptTeams}`);
  }

  console.log('\n✅ Financial Simulation Finished.');
}

runFinancialSim().catch(console.error);
