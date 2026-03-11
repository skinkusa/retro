import { generateInitialData } from '../src/lib/game-data';
import { performSeasonTransition } from '../src/lib/season-logic';
import { updateLeagueTable } from '../src/lib/game-engine';
import { GameState } from '../src/types/game';

/**
 * Simulation script to verify Phase 1: Season Lifecycle.
 * Run with: npx tsx scripts/test-season-transition.ts
 */
async function runSimulation() {
  console.log('🚀 Starting Season Transition Simulation...');

  // 1. Initialize Game Data
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
    boardExpectation: 'Mid-table',
    targetPosition: 10,
    transferMarket: { listed: [], incomingBids: [] },
    availableStaff: [],
    jobMarket: [],
    cupEntrants: [],
    records: { biggestWin: null, biggestLoss: null, transferPaid: null, transferReceived: null }
  };

  console.log(`\n--- Initial State (Season ${state.season}) ---`);
  console.log(`Total Players: ${state.players.length}`);
  console.log(`Average Age: ${(state.players.reduce((acc, p) => acc + p.age, 0) / state.players.length).toFixed(2)}`);

  // Simulate 3 Seasons
  for (let s = 1; s <= 3; s++) {
    console.log(`\n--- Simulating End of Season ${state.season} ---`);

    // Mock fixtures as "played" so summary logic works
    state.fixtures = state.fixtures.map(f => ({
      ...f,
      result: {
        homeGoals: Math.floor(Math.random() * 3),
        awayGoals: Math.floor(Math.random() * 3),
        attendance: 20000,
        events: [],
        ratings: {},
        scorers: [],
        cards: [],
        injuries: []
      }
    }));

    // Generate Summary
    const standingsByDiv = [1, 2, 3, 4].map(div => updateLeagueTable(state.teams, state.fixtures, div));
    state.seasonSummary = {
      season: state.season,
      champions: { 1: standingsByDiv[0][0].name, 2: standingsByDiv[1][0].name, 3: standingsByDiv[2][0].name, 4: standingsByDiv[3][0].name },
      promoted: { 
        2: [standingsByDiv[1][0].name, standingsByDiv[1][1].name], 
        3: [standingsByDiv[2][0].name, standingsByDiv[2][1].name], 
        4: [standingsByDiv[3][0].name, standingsByDiv[3][1].name] 
      },
      relegated: { 
        1: [standingsByDiv[0][19].name, standingsByDiv[0][18].name], 
        2: [standingsByDiv[1][19].name, standingsByDiv[1][18].name], 
        3: [standingsByDiv[2][19].name, standingsByDiv[2][18].name] 
      },
      userPos: 1, userTarget: 10, topScorer: null, bestPlayer: null
    };

    const relegatedD1names = state.seasonSummary.relegated[1];
    const promotedD2names = state.seasonSummary.promoted[2];
    
    console.log(`Relegated from D1: ${relegatedD1names.join(', ')}`);
    console.log(`Promoted to D1: ${promotedD2names.join(', ')}`);

    // Record some old players to check for retirements/age
    const oldPlayerIds = state.players.filter(p => p.age >= 34).map(p => p.id);
    const beforeCount = state.players.length;

    // PERFORM TRANSITION
    const nextStateParts = performSeasonTransition(state);
    state = { ...state, ...nextStateParts } as GameState;

    // VERIFICATION
    console.log(`\nTransition to Season ${state.season} Complete.`);
    
    // Check Promotion/Relegation
    const teamsInD1 = state.teams.filter(t => t.division === 1).map(t => t.name);
    const prSuccess = promotedD2names.every(n => teamsInD1.includes(n)) && relegatedD1names.every(n => !teamsInD1.includes(n));
    console.log(`Promotion/Relegation Success: ${prSuccess ? '✅' : '❌'}`);

    // Check Ages
    const avgAge = state.players.reduce((acc, p) => acc + p.age, 0) / state.players.length;
    console.log(`Average Age: ${avgAge.toFixed(2)}`);

    // Check Retirements and Youth Intake
    const retiredCount = oldPlayerIds.filter(id => !state.players.find(p => p.id === id)).length;
    const youthCount = state.players.filter(p => p.age <= 17).length;
    console.log(`Confirmed Retirements: ${retiredCount}`);
    console.log(`Youth Players (<18): ${youthCount}`);
    console.log(`Total Players: ${state.players.length} (Delta: ${state.players.length - beforeCount})`);

    // Integrity Check: Squad Sizes
    const smallSquads = state.teams.filter(t => state.players.filter(p => p.clubId === t.id).length < 20);
    if (smallSquads.length > 0) {
      console.log(`⚠️ Warning: ${smallSquads.length} teams have squads under 20 players.`);
    } else {
      console.log(`✅ All teams have healthy squad sizes.`);
    }
  }

  console.log('\n✅ Simulation Finished.');
}

runSimulation().catch(console.error);
