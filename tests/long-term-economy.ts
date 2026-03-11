import { generateInitialData } from '../src/lib/game-data';
import { performSeasonTransition } from '../src/lib/season-logic';
import { GameState, Team, Player } from '../src/types/game';

/**
 * 20-Season Stability Simulation.
 * Monitors team budgets and squad averages over two decades.
 * Run with: npx tsx tests/long-term-economy.ts
 */
async function runLongTermSim() {
  console.log("🚀 Starting 20-Season Stability Simulation...");

  const data = generateInitialData();
  let state: GameState = {
    season: 1993,
    currentWeek: 1,
    teams: data.teams,
    players: data.players,
    fixtures: data.fixtures,
    userTeamId: data.teams[0].id,
    messages: [],
    isGameStarted: true,
    isSeasonOver: false,
    seasonSummary: null,
    jobMarket: [],
    transferBids: [],
    boardConfidence: 80,
    boardExpectation: 'Mid-table',
    targetPosition: 10
  } as any;

  for (let s = 0; s < 20; s++) {
    const currentSeason = state.season;
    
    // Simulate a full season worth of finances (roughly)
    state.teams = state.teams.map(t => {
      const homeGames = 19;
      const att = Math.round(t.stadiumCapacity * (0.55 + (t.reputation / 200)));
      const gate = homeGames * att * (5 - t.division) * 10;
      const merch = 38 * (5000 + (t.reputation * 100));
      const wages = 52 * (t.weeklyWages || 50000);
      
      let budget = t.budget + gate + merch - wages;

      // Realistic AI Spend (Transfers/Maintenance)
      const maintenance = budget > 0 ? budget * 0.05 : 0;
      const transferSpend = budget > 2000000 ? (budget * 0.15) : 0;
      budget -= (maintenance + transferSpend);
      
      // Auto-invest in stadium if budget is high
      let expansion = t.stadiumExpansion;
      if (!expansion && budget > 15000000 && Math.random() < 0.2) {
        budget -= 7500000; // Medium expansion
        expansion = { targetCapacity: t.stadiumCapacity + 6000, weeksRemaining: 0, cost: 7500000 };
      }

      if (expansion && expansion.weeksRemaining <= 0) {
        budget += (Math.random() * 5000000); // Represent selling players back
        return { ...t, budget, stadiumCapacity: expansion.targetCapacity, stadiumExpansion: null };
      }

      return { ...t, budget };
    });

    // Mock season summary for transition
    state.seasonSummary = {
      promoted: { 2: [], 3: [], 4: [] },
      relegated: { 1: [], 2: [], 3: [] },
      champions: { 1: state.teams[0].name, 2: '', 3: '', 4: '' },
      winners: []
    } as any;

    // Transition
    const nextState = performSeasonTransition(state);
    state = { ...state, ...nextState };

    // Stats Check
    const avgBudget = state.teams.reduce((acc, t) => acc + t.budget, 0) / state.teams.length;
    const maxBudget = Math.max(...state.teams.map(t => t.budget));
    const minBudget = Math.min(...state.teams.map(t => t.budget));
    const avgCapacity = state.teams.reduce((acc, t) => acc + t.stadiumCapacity, 0) / state.teams.length;
    
    console.log(`Season ${currentSeason} Summary:`);
    console.log(`  Avg Budget: £${(avgBudget / 1000000).toFixed(1)}M (Max: £${(maxBudget / 1000000).toFixed(1)}M, Min: £${(minBudget / 1000000).toFixed(1)}M)`);
    console.log(`  Avg Stadium: ${Math.round(avgCapacity).toLocaleString()}`);
    
    if (avgBudget < 0) {
        console.log("❌ CRITICAL: League Average Budget went negative! Economy is crashing.");
        // process.exit(1);
    }
    if (avgBudget > 500000000) {
        console.log("⚠️ WARNING: Hyperinflation detected! Teams are too rich.");
    }
  }

  console.log("\n✅ 20-Season Simulation Complete.");
}

runLongTermSim();
