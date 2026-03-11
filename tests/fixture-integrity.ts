import { generateInitialData } from '../src/lib/game-data';

/**
 * Fixture Integrity Test.
 * Ensures every team in every division plays exactly 38 games, 
 * with 19 home and 19 away, and no more than one game per week.
 * Run with: npx tsx tests/fixture-integrity.ts
 */
async function testFixtures() {
  console.log('📅 Starting Fixture Integrity Test...');

  const { teams, fixtures } = generateInitialData();
  const weeks = 38;
  let errors = 0;

  teams.forEach(team => {
    const teamFixtures = fixtures.filter(f => f.homeTeamId === team.id || f.awayTeamId === team.id);
    const homeGames = teamFixtures.filter(f => f.homeTeamId === team.id).length;
    const awayGames = teamFixtures.filter(f => f.awayTeamId === team.id).length;
    
    // 1. Total Games Check
    if (teamFixtures.length !== weeks) {
      console.error(`❌ Error: ${team.name} has ${teamFixtures.length} games (expected ${weeks})`);
      errors++;
    }

    // 2. Home/Away Balance Check
    if (homeGames !== 19 || awayGames !== 19) {
      console.error(`❌ Error: ${team.name} has unbalanced schedule (${homeGames}H, ${awayGames}A)`);
      errors++;
    }

    // 3. Weekly Consistency Check
    const playedWeeks = new Set(teamFixtures.map(f => f.week));
    if (playedWeeks.size !== weeks) {
      console.error(`❌ Error: ${team.name} has missing or duplicate weeks in schedule`);
      errors++;
    }
  });

  if (errors === 0) {
    console.log('✅ Fixture Integrity Verified: All 80 teams have a perfect 38-game balanced schedule.');
  } else {
    console.log(`\n❌ Fixture Integrity Failed with ${errors} errors.`);
    process.exit(1);
  }
}

testFixtures().catch(console.error);
