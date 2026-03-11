import { GameState, Team, Player, SeasonSummaryData, Position, Side } from '@/types/game';
import { generateFixtures, generatePlayer } from '@/lib/game-data';
import { updateLeagueTable } from '@/lib/game-engine';

/**
 * Pure function to handle the transition from one season to the next.
 * This is extracted from the store to allow for unit testing.
 */
export function performSeasonTransition(s: GameState): Partial<GameState> {
  const yr = s.season + 1;
  const summary = s.seasonSummary;
  if (!summary) return {};

  // 1. Handle Promotion and Relegation
  const upTeams = s.teams.map(t => {
    let newDiv = t.division;
    // Check if promoted from lower division
    if (t.division > 1 && summary.promoted[t.division]?.includes(t.name)) {
      newDiv = t.division - 1;
    }
    // Check if relegated from higher division
    if (t.division < 4 && summary.relegated[t.division]?.includes(t.name)) {
      newDiv = t.division + 1;
    }

    // 2. Award Prize Money based on position
    const divStandings = updateLeagueTable(s.teams, s.fixtures, t.division);
    const pos = divStandings.findIndex(st => st.id === t.id) + 1;
    let prize = 0;
    if (t.division === 1) prize = Math.max(1000000, 12000000 - (pos - 1) * 600000);
    else if (t.division === 2) prize = Math.max(500000, 6000000 - (pos - 1) * 300000);
    else if (t.division === 3) prize = Math.max(250000, 3000000 - (pos - 1) * 150000);
    else prize = Math.max(100000, 1500000 - (pos - 1) * 75000);

    return { 
      ...t, 
      division: newDiv,
      budget: t.budget + prize,
      played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, playedHistory: [],
      finances: { ...t.finances, gateReceipts: 0, merchandise: 0, wagesPaid: 0, transfersIn: 0, transfersOut: 0, taxPaid: 0 }
    };
  });

  // 3. Process Players (Age, Retirements, Contracts, History)
  const nextPlayers: Player[] = [];
  const retirees: { clubId: string | null, pos: string, side: Side }[] = [];

  s.players.forEach(p => {
    const newAge = p.age + 1;
    const retireChance = newAge >= 38 ? 1.0 : newAge >= 35 ? 0.35 : 0;
    const isRetiring = Math.random() < retireChance;
    const isContractExpired = p.contractYears <= 0;

    if (isRetiring || isContractExpired) {
      retirees.push({ clubId: p.clubId, pos: p.position, side: p.side });
      return;
    }

    // --- Attribute Evolution ---
    const attrs = { ...p.attributes };
    let devPoints = p.developmentPoints || 0;
    
    // 1. Growth for Youngsters (Age < 23)
    if (newAge < 23) {
      if (devPoints > 80 || (Math.random() < 0.15)) {
        if (p.position === 'GK') attrs.goalkeeping = Math.min(20, attrs.goalkeeping + 1);
        else if (p.position === 'DF') attrs.heading = Math.min(20, attrs.heading + 1);
        else if (p.position === 'FW') attrs.shooting = Math.min(20, attrs.shooting + 1);
        else attrs.passing = Math.min(20, attrs.passing + 1);
        
        if (Math.random() < 0.4) attrs.pace = Math.min(20, attrs.pace + 1);
        if (Math.random() < 0.4) attrs.stamina = Math.min(20, attrs.stamina + 1);
        devPoints = Math.max(0, devPoints - 100);
      }
    }
    // 2. Decline for Veterans (Age > 31)
    else if (newAge > 31) {
      const declineChance = (newAge - 30) * 0.12; 
      if (Math.random() < declineChance) {
        attrs.pace = Math.max(5, attrs.pace - 1);
        attrs.stamina = Math.max(5, attrs.stamina - 1);
      }
    }
    // 3. Peak Stability / Refinement (Age 23-31)
    else {
      if (devPoints > 120 && attrs.skill < p.attributes.potential) {
        attrs.skill = Math.min(20, attrs.skill + 1);
        devPoints = Math.max(0, devPoints - 150);
      }
    }

    nextPlayers.push({
      ...p,
      age: newAge,
      attributes: attrs,
      developmentPoints: devPoints,
      contractYears: p.contractYears - 1,
      seasonStats: { apps: 0, goals: 0, avgRating: 0, yellowCards: 0, redCards: 0, shots: 0, shotsOnTarget: 0, cleanSheets: 0, minutesPlayed: 0, manOfTheMatch: 0 },
      history: [...p.history, { 
        season: s.season, 
        apps: p.seasonStats.apps, 
        goals: p.seasonStats.goals, 
        avgRating: p.seasonStats.avgRating, 
        clubName: s.teams.find(t => t.id === p.clubId)?.name || 'Unknown' 
      }]
    });
  });

  // 4. Generate Youth Intake (Replace departed players)
  retirees.forEach((r, idx) => {
    if (!r.clubId) return;
    const team = upTeams.find(t => t.id === r.clubId);
    if (!team) return;
    const youth = generatePlayer(team.id, 100 + idx, r.pos, r.side, team.division, team.reputation, true);
    nextPlayers.push(youth);
  });

  // 5. Cleanup lineups (remove dead IDs)
  const finalTeams = upTeams.map(t => ({
    ...t,
    lineup: t.lineup.map(id => id && nextPlayers.find(np => np.id === id) ? id : null)
  }));

  return {
    currentWeek: 1,
    season: yr,
    teams: finalTeams,
    players: nextPlayers,
    fixtures: generateFixtures(finalTeams, yr),
    isSeasonOver: false,
    seasonSummary: null,
    currentMatchFixtureId: null
  };
}
