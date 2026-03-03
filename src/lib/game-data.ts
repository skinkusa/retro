import { Player, Team, Position, Side, Fixture, StaffMember, StaffRole, PlayStyle } from '@/types/game';

const DIVISIONS = [
  { id: 1, name: "Premier League", teams: 20 },
  { id: 2, name: "Division One", teams: 20 },
  { id: 3, name: "Division Two", teams: 20 },
  { id: 4, name: "Division Three", teams: 20 }
];

export const SURNAME_POOL = ["Smith", "Jones", "Brown", "Taylor", "Wilson", "Davies", "Evans", "Thomas", "Johnson", "Roberts", "Walker", "Wright", "Robinson", "Thompson", "White", "Hughes", "Edwards", "Green", "Hall", "Wood"];
export const FIRSTNAME_POOL = ["David", "James", "Peter", "Alan", "Gary", "Kevin", "Ian", "Paul", "Chris", "Mark", "Steve", "Tony", "Brian", "Lee", "Nigel", "Rob", "Mick", "Dave", "Terry", "Ray"];

const TEAM_DEFINITIONS = [
  { name: "North London Red", color: "#EF0107", division: 1, capacity: 60000, style: 'Tiki-Taka', formation: '4-3-3' },
  { name: "North London White", color: "#FFFFFF", division: 1, capacity: 62000, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Merseyside Red", color: "#C8102E", division: 1, capacity: 54000, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Merseyside Blue", color: "#003399", division: 1, capacity: 40000, style: 'Direct', formation: '4-4-2' },
  { name: "Manchester Red", color: "#DA291C", division: 1, capacity: 75000, style: 'Direct', formation: '4-4-2' },
  { name: "Manchester Light Blue", color: "#6CABDD", division: 1, capacity: 53000, style: 'Tiki-Taka', formation: '4-3-3' },
  { name: "West London Blue", color: "#034694", division: 1, capacity: 41000, style: 'Tiki-Taka', formation: '4-3-3' },
  { name: "Birmingham Villa", color: "#670E36", division: 1, capacity: 42000, style: 'Direct', formation: '4-4-2' },
  { name: "Newcastle Black & White", color: "#241F20", division: 1, capacity: 52000, style: 'Long Ball', formation: '4-4-2' },
  { name: "West Ham Maroon", color: "#7A263A", division: 1, capacity: 60000, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Leicester Blue", color: "#003090", division: 1, capacity: 32000, style: 'Counter-Attack', formation: '4-4-2' },
  { name: "Wolverhampton Gold", color: "#FDB913", division: 1, capacity: 31000, style: 'Direct', formation: '4-3-3' },
  { name: "Brighton Blue & White", color: "#0057B8", division: 1, capacity: 30000, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Crystal Palace Red & Blue", color: "#1B458F", division: 1, capacity: 26000, style: 'Counter-Attack', formation: '4-4-2' },
  { name: "Southampton Red & White", color: "#D71920", division: 1, capacity: 32000, style: 'Direct', formation: '4-4-2' },
  { name: "Fulham White", color: "#000000", division: 1, capacity: 25000, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Brentford Red & White", color: "#E30613", division: 1, capacity: 17000, style: 'Direct', formation: '4-3-3' },
  { name: "Leeds White", color: "#FFCD00", division: 1, capacity: 37000, style: 'Direct', formation: '4-4-2' },
  { name: "Nottingham Forest Red", color: "#DD0000", division: 1, capacity: 30000, style: 'Counter-Attack', formation: '4-5-1' },
  { name: "Sheffield Red & White", color: "#EE2737", division: 1, capacity: 32000, style: 'Park the Bus', formation: '5-3-2' },
  // Div 2+ omitted for brevity in generation... same pattern applies.
  ...Array.from({ length: 60 }).map((_, i) => ({ name: `Club ${i + 21}`, color: "#4079b0", division: i < 20 ? 2 : i < 40 ? 3 : 4, capacity: 15000, style: 'Pass to Feet', formation: '4-4-2' }))
];

export function generateFixtures(teams: Team[], season: number) {
  const fixtures: Fixture[] = [];
  DIVISIONS.forEach(div => {
    const divTeams = teams.filter(t => t.division === div.id);
    for (let week = 1; week <= 38; week++) {
      const used = new Set();
      for (let i = 0; i < divTeams.length; i++) {
        if (used.has(divTeams[i].id)) continue;
        const oppIdx = (i + week) % divTeams.length;
        const opp = divTeams[oppIdx];
        if (used.has(opp.id) || opp.id === divTeams[i].id) continue;
        fixtures.push({ id: `f-s${season}-div${div.id}-w${week}-${i}`, homeTeamId: divTeams[i].id, awayTeamId: opp.id, week, division: div.id, competition: 'LEAGUE' });
        used.add(divTeams[i].id); used.add(opp.id);
      }
    }
  });
  return fixtures;
}

export function generateInitialData() {
  const teams: Team[] = TEAM_DEFINITIONS.map((def, i) => ({
    id: `team-${i}`, name: def.name, stadium: `${def.name} Grounds`, stadiumCapacity: def.capacity, color: def.color, budget: (5 - def.division) * 10000000 + Math.random() * 10000000, weeklyWages: 0, points: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, division: def.division, reputation: 90 - (def.division * 15) + Math.floor(Math.random() * 10), formation: def.formation || '4-4-2', playStyle: (def.style as PlayStyle) || 'Pass to Feet', preferredFormation: def.formation || '4-4-2', preferredStyle: (def.style as PlayStyle) || 'Pass to Feet', playedHistory: [], staff: [], lineup: [], finances: { gateReceipts: 0, merchandise: 0, wagesPaid: 0, transfersIn: 0, transfersOut: 0, taxPaid: 0 }
  }));

  const players: Player[] = [];
  const sideBias: Side[] = ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'L', 'R', 'LC', 'RC']; // Heavily Central bias

  teams.forEach(team => {
    const positions = ['GK', 'GK', 'DF', 'DF', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW', 'FW', 'DM', 'DF', 'MF', 'FW'];
    positions.forEach((pos, i) => {
      const age = 17 + Math.floor(Math.random() * 18);
      const potential = 10 + Math.floor(Math.random() * 10);
      const attrBase = Math.max(5, potential - (35 - age) / 2) - (team.division * 2);
      const attr = () => Math.max(1, Math.floor(Math.random() * 5) + attrBase);
      const player: Player = {
        id: `p-${team.id}-${i}`, name: `${FIRSTNAME_POOL[Math.floor(Math.random() * FIRSTNAME_POOL.length)]} ${SURNAME_POOL[Math.floor(Math.random() * SURNAME_POOL.length)]}`, age, position: pos as Position, side: pos === 'GK' ? 'C' : sideBias[Math.floor(Math.random() * sideBias.length)], attributes: { pace: attr(), stamina: attr(), skill: attr(), shooting: attr(), passing: attr(), heading: attr(), influence: attr(), goalkeeping: pos === 'GK' ? attr() + 6 : 1, consistency: attr(), dirtiness: Math.floor(Math.random() * 20), injuryProne: Math.floor(Math.random() * 20), temperament: attr(), potential, professionalism: 5 + Math.floor(Math.random() * 15) }, fitness: 90 + Math.floor(Math.random() * 10), morale: 70 + Math.floor(Math.random() * 30), condition: 100, status: 'FIT', value: (5 - team.division) * 1000000 + Math.floor(Math.random() * 1000000), wage: (5 - team.division) * 5000 + Math.floor(Math.random() * 5000), contractYears: 1 + Math.floor(Math.random() * 4), clubId: team.id, isListed: false, suspensionWeeks: 0, injury: null, seasonStats: { apps: 0, goals: 0, avgRating: 0, yellowCards: 0, redCards: 0 }, history: []
      };
      players.push(player);
      if (i < 16) team.lineup.push(player.id);
    });
    team.weeklyWages = players.filter(p => p.clubId === team.id).reduce((acc, p) => acc + p.wage, 0);
  });

  return { teams, players, fixtures: generateFixtures(teams, 1993), availableStaff: [], cupEntrants: teams.slice(0, 32).map(t => t.id) };
}
