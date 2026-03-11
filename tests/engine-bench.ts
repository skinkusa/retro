import { generateInitialData } from '../src/lib/game-data';
import { simulateMatch, getBestSquadForTeam, getZoneStrength } from '../src/lib/game-engine';
import { Team, Player } from '../src/types/game';

/**
 * Match Engine Benchmark Script.
 * Simulates 1000 matches between two teams to verify statistical distributions.
 * Run with: npx tsx tests/engine-bench.ts
 */
async function runBench() {
  const ITERATIONS = 1000;
  console.log(`🧪 Benchmarking Match Engine (${ITERATIONS} matches)...`);

  const { teams, players } = generateInitialData();
  
  // Pick the SAME team for both to isolate home advantage
  const homeTeam = teams.find(t => t.name === "North London Red")!;
  const awayTeam = { ...homeTeam, id: 'away-copy' }; // Copy but different ID

  const homeLineupIds = getBestSquadForTeam(homeTeam, players);
  const awayLineupIds = [...homeLineupIds];

  const homeStarters = homeLineupIds.slice(0, 11).map(id => players.find(p => p.id === id)!);
  const awayStarters = awayLineupIds.slice(0, 11).map(id => players.find(p => p.id === id)!);

  // LOG RAW STRENGTHS (no multipliers)
  const homeRaw = {
    DEF: getZoneStrength(homeStarters, homeTeam, 'DEF'),
    MID: getZoneStrength(homeStarters, homeTeam, 'MID'),
    ATT: getZoneStrength(homeStarters, homeTeam, 'ATT')
  };
  const awayRaw = {
    DEF: getZoneStrength(awayStarters, awayTeam, 'DEF'),
    MID: getZoneStrength(awayStarters, awayTeam, 'MID'),
    ATT: getZoneStrength(awayStarters, awayTeam, 'ATT')
  };
  console.log(`🏠 Home Raw: DEF:${homeRaw.DEF} MID:${homeRaw.MID} ATT:${homeRaw.ATT}`);
  console.log(`🚌 Away Raw: DEF:${awayRaw.DEF} MID:${awayRaw.MID} ATT:${awayRaw.ATT}`);

  const stats = {
    totalHomeGoals: 0,
    totalAwayGoals: 0,
    homeWins: 0,
    awayWins: 0,
    draws: 0,
    totalShots: 0,
    totalSOT: 0,
    totalCards: 0,
    totalInjuries: 0,
    totalCorners: 0,
    totalFouls: 0,
    totalOffsides: 0,
    cleanSheets: 0,
    scorelines: {} as Record<string, number>
  };

  for (let i = 0; i < ITERATIONS; i++) {
    const result = simulateMatch(homeTeam, awayTeam, homeStarters, awayStarters);
    
    if (!result) continue;

    stats.totalHomeGoals += result.homeGoals;
    stats.totalAwayGoals += result.awayGoals;
    stats.totalShots += (result.homeShots || 0) + (result.awayShots || 0);
    stats.totalSOT += (result.homeShotsOnTarget || 0) + (result.awayShotsOnTarget || 0);
    stats.totalCards += result.cards.length;
    stats.totalInjuries += result.injuries.length;
    stats.totalCorners += (result.homeCorners || 0) + (result.awayCorners || 0);
    stats.totalFouls += (result.homeFouls || 0) + (result.awayFouls || 0);
    stats.totalOffsides += (result.homeOffsides || 0) + (result.awayOffsides || 0);

    if (result.homeGoals > result.awayGoals) stats.homeWins++;
    else if (result.awayGoals > result.homeGoals) stats.awayWins++;
    else stats.draws++;

    if (result.homeGoals === 0 || result.awayGoals === 0) stats.cleanSheets++;

    const score = `${result.homeGoals}-${result.awayGoals}`;
    stats.scorelines[score] = (stats.scorelines[score] || 0) + 1;
  }

  const avgGoals = (stats.totalHomeGoals + stats.totalAwayGoals) / (ITERATIONS * 2);
  const avgShots = stats.totalShots / (ITERATIONS * 2);
  const avgSOT = stats.totalSOT / (ITERATIONS * 2);
  const avgCorners = stats.totalCorners / (ITERATIONS * 2);
  const avgFouls = stats.totalFouls / (ITERATIONS * 2);
  const avgCards = stats.totalCards / (ITERATIONS * 2);
  const avgOffsides = stats.totalOffsides / (ITERATIONS * 2);

  const check = (val: number, min: number, max: number) => (val >= min && val <= max) ? '✅' : '❌';

  console.log(`\n--- Benchmark Results (Per Team) ---`);
  console.log(`Shots:      ${avgShots.toFixed(1)} ${check(avgShots, 11, 13)} (Target: 11-13)`);
  console.log(`SOT:        ${avgSOT.toFixed(1)} ${check(avgSOT, 4, 5)} (Target: 4-5)`);
  console.log(`Goals:      ${avgGoals.toFixed(2)} ${check(avgGoals, 1.2, 1.4)} (Target: 1.2-1.4)`);
  console.log(`Corners:    ${avgCorners.toFixed(1)} ${check(avgCorners, 4.5, 5.5)} (Target: 5)`);
  console.log(`Fouls:      ${avgFouls.toFixed(1)} ${check(avgFouls, 10, 13)} (Target: 11-12)`);
  console.log(`Cards (Y):  ${avgCards.toFixed(2)} ${check(avgCards, 1.5, 2.1)} (Target: 1.8)`);
  console.log(`Offsides:   ${avgOffsides.toFixed(1)} ${check(avgOffsides, 1.5, 2.5)} (Target: 2)`);

  console.log(`\n--- Win Distribution ---`);
  console.log(`Home Win %: ${((stats.homeWins / ITERATIONS) * 100).toFixed(1)}%`);
  console.log(`Away Win %: ${((stats.awayWins / ITERATIONS) * 100).toFixed(1)}%`);
  console.log(`Draw %: ${((stats.draws / ITERATIONS) * 100).toFixed(1)}%`);
  
  console.log(`\nTop Scorelines:`);
  Object.entries(stats.scorelines)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([score, count]) => {
      console.log(`  ${score}: ${((count / ITERATIONS) * 100).toFixed(1)}%`);
    });

  console.log('\n✅ Benchmark Finished.');
}

runBench().catch(console.error);
