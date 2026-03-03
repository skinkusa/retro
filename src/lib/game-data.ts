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
  // Division 1
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
  
  // Division 2
  { name: "Sheffield Blue & White", color: "#0054A6", division: 2, capacity: 34000, style: 'Long Ball', formation: '4-4-2' },
  { name: "Norwich Yellow & Green", color: "#FFF200", division: 2, capacity: 27000, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "West Brom Navy & White", color: "#122F67", division: 2, capacity: 26000, style: 'Direct', formation: '4-4-2' },
  { name: "Watford Yellow", color: "#FBEE23", division: 2, capacity: 22000, style: 'Counter-Attack', formation: '4-3-3' },
  { name: "Burnley Claret", color: "#6C1D45", division: 2, capacity: 21000, style: 'Direct', formation: '4-4-2' },
  { name: "Middlesbrough Red", color: "#E21E26", division: 2, capacity: 34000, style: 'Long Ball', formation: '4-4-2' },
  { name: "Sunderland Red & White", color: "#FF0000", division: 2, capacity: 49000, style: 'Direct', formation: '4-4-2' },
  { name: "Hull Tiger Orange", color: "#F5A122", division: 2, capacity: 25000, style: 'Counter-Attack', formation: '4-3-3' },
  { name: "Coventry Sky Blue", color: "#00AEEF", division: 2, capacity: 32000, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Bristol City Red", color: "#ED1C24", division: 2, capacity: 27000, style: 'Direct', formation: '4-4-2' },
  { name: "Swansea White", color: "#000000", division: 2, capacity: 21000, style: 'Tiki-Taka', formation: '4-3-3' },
  { name: "Cardiff Blue", color: "#0070B5", division: 2, capacity: 33000, style: 'Direct', formation: '4-4-2' },
  { name: "Preston White", color: "#002D56", division: 2, capacity: 23000, style: 'Long Ball', formation: '4-4-2' },
  { name: "Stoke Red & White", color: "#E03A3E", division: 2, capacity: 30000, style: 'Park the Bus', formation: '5-3-2' },
  { name: "Blackburn Blue & White", color: "#009EE0", division: 2, capacity: 31000, style: 'Direct', formation: '4-4-2' },
  { name: "Millwall Navy", color: "#002147", division: 2, capacity: 20000, style: 'Long Ball', formation: '4-4-2' },
  { name: "QPR Blue & White", color: "#0054A6", division: 2, capacity: 18000, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Birmingham Blue", color: "#0000FF", division: 2, capacity: 29000, style: 'Direct', formation: '4-4-2' },
  { name: "Huddersfield Blue & White", color: "#0072CE", division: 2, capacity: 24000, style: 'Direct', formation: '4-4-2' },
  { name: "Plymouth Green", color: "#00563F", division: 2, capacity: 17000, style: 'Long Ball', formation: '4-4-2' },

  // Division 3
  { name: "Portsmouth Blue", color: "#0000FF", division: 3, capacity: 20000, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Derby White", color: "#FFFFFF", division: 3, capacity: 33000, style: 'Direct', formation: '4-4-2' },
  { name: "Bolton White", color: "#FFFFFF", division: 3, capacity: 28000, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Peterborough Blue", color: "#0000FF", division: 3, capacity: 15000, style: 'Counter-Attack', formation: '4-3-3' },
  { name: "Barnsley Red", color: "#FF0000", division: 3, capacity: 23000, style: 'Direct', formation: '4-4-2' },
  { name: "Oxford Yellow", color: "#FFFF00", division: 3, capacity: 12500, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Lincoln Red & White", color: "#FF0000", division: 3, capacity: 10000, style: 'Long Ball', formation: '4-4-2' },
  { name: "Blackpool Tangerine", color: "#FF8800", division: 3, capacity: 16000, style: 'Direct', formation: '4-4-2' },
  { name: "Stevenage Red", color: "#FF0000", division: 3, capacity: 7000, style: 'Park the Bus', formation: '4-5-1' },
  { name: "Wycombe Blue", color: "#000088", division: 3, capacity: 10000, style: 'Long Ball', formation: '4-4-2' },
  { name: "Leyton Red", color: "#FF0000", division: 3, capacity: 9000, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Wigan Blue & White", color: "#0000FF", division: 3, capacity: 25000, style: 'Direct', formation: '4-4-2' },
  { name: "Exeter Red & White", color: "#FF0000", division: 3, capacity: 8000, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Northampton Maroon", color: "#800000", division: 3, capacity: 7500, style: 'Direct', formation: '4-4-2' },
  { name: "Bristol Blue & White", color: "#0000FF", division: 3, capacity: 12000, style: 'Long Ball', formation: '4-4-2' },
  { name: "Charlton Red", color: "#FF0000", division: 3, capacity: 27000, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Reading Blue & White", color: "#0000FF", division: 3, capacity: 24000, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Cambridge Amber & Black", color: "#FFBF00", division: 3, capacity: 8000, style: 'Direct', formation: '4-4-2' },
  { name: "Shrewsbury Blue & Amber", color: "#0000FF", division: 3, capacity: 10000, style: 'Long Ball', formation: '4-5-1' },
  { name: "Cheltenham Red & White", color: "#FF0000", division: 3, capacity: 7000, style: 'Direct', formation: '4-4-2' },

  // Division 4
  { name: "Stockport Blue", color: "#0000FF", division: 4, capacity: 10000, style: 'Direct', formation: '4-4-2' },
  { name: "Mansfield Amber & Blue", color: "#FFBF00", division: 4, capacity: 9000, style: 'Direct', formation: '4-4-2' },
  { name: "Wrexham Red", color: "#FF0000", division: 4, capacity: 12000, style: 'Direct', formation: '4-3-3' },
  { name: "Milton Keynes White", color: "#FFFFFF", division: 4, capacity: 30000, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Crewe Red", color: "#FF0000", division: 4, capacity: 10000, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Barrow Blue", color: "#0000FF", division: 4, capacity: 5000, style: 'Long Ball', formation: '4-4-2' },
  { name: "Crawley Red", color: "#FF0000", division: 4, capacity: 6000, style: 'Counter-Attack', formation: '4-3-3' },
  { name: "Gillingham Blue", color: "#0000FF", division: 4, capacity: 11000, style: 'Direct', formation: '4-4-2' },
  { name: "Morecambe Red", color: "#FF0000", division: 4, capacity: 6000, style: 'Long Ball', formation: '4-4-2' },
  { name: "Harrogate Yellow & Black", color: "#FFFF00", division: 4, capacity: 5000, style: 'Direct', formation: '4-4-2' },
  { name: "Walsall Red", color: "#FF0000", division: 4, capacity: 11000, style: 'Direct', formation: '4-4-2' },
  { name: "Wimbledon Blue & Yellow", color: "#0000FF", division: 4, capacity: 9000, style: 'Direct', formation: '4-4-2' },
  { name: "Newport Amber & Black", color: "#FFBF00", division: 4, capacity: 7800, style: 'Long Ball', formation: '4-4-2' },
  { name: "Doncaster Red & White", color: "#FF0000", division: 4, capacity: 15000, style: 'Direct', formation: '4-4-2' },
  { name: "Notts Black & White", color: "#000000", division: 4, capacity: 19000, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Tranmere White", color: "#FFFFFF", division: 4, capacity: 16000, style: 'Direct', formation: '4-4-2' },
  { name: "Accrington Red", color: "#FF0000", division: 4, capacity: 5000, style: 'Direct', formation: '4-4-2' },
  { name: "Swindon Red", color: "#FF0000", division: 4, capacity: 15000, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Grimsby Black & White", color: "#000000", division: 4, capacity: 9000, style: 'Long Ball', formation: '4-4-2' },
  { name: "Forest Green Green", color: "#00FF00", division: 4, capacity: 5000, style: 'Pass to Feet', formation: '4-3-3' }
];

export function generateFixtures(teams: Team[], season: number) {
  const fixtures: Fixture[] = [];
  DIVISIONS.forEach(div => {
    const divTeams = teams.filter(t => t.division === div.id);
    for (let week = 1; week <= 38; week++) {
      const used = new Set();
      for (let i = 0; i < divTeams.length; i++) {
        if (used.has(divTeams[i].id)) continue;
        const opponentIndex = (i + week) % divTeams.length;
        const opponent = divTeams[opponentIndex];
        if (used.has(opponent.id) || opponent.id === divTeams[i].id) continue;
        
        fixtures.push({
          id: `f-s${season}-div${div.id}-w${week}-${i}`,
          homeTeamId: divTeams[i].id,
          awayTeamId: opponent.id,
          week,
          division: div.id,
          competition: 'LEAGUE'
        });
        used.add(divTeams[i].id);
        used.add(opponent.id);
      }
    }
  });
  return fixtures;
}

export function generateInitialData() {
  const teams: Team[] = [];
  
  TEAM_DEFINITIONS.forEach((def, i) => {
    const staff: StaffMember[] = [
      { id: `s-${i}-c`, name: `${FIRSTNAME_POOL[i % 20]} ${SURNAME_POOL[i % 20]}`, role: 'COACH', rating: 10 + Math.floor(Math.random() * 5), wage: 2000 },
      { id: `s-${i}-p`, name: `${FIRSTNAME_POOL[(i+1) % 20]} ${SURNAME_POOL[(i+1) % 20]}`, role: 'PHYSIO', rating: 10 + Math.floor(Math.random() * 5), wage: 1500 },
      { id: `s-${i}-s`, name: `${FIRSTNAME_POOL[(i+2) % 20]} ${SURNAME_POOL[(i+2) % 20]}`, role: 'SCOUT', rating: 10 + Math.floor(Math.random() * 5), wage: 1000 }
    ];

    teams.push({
      id: `team-${i}`,
      name: def.name,
      stadium: `${def.name} Grounds`,
      stadiumCapacity: Math.floor(def.capacity || 20000),
      color: def.color,
      budget: (5 - def.division) * 10000000 + Math.random() * 10000000,
      weeklyWages: 0,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      division: def.division,
      reputation: 90 - (def.division * 15) + Math.floor(Math.random() * 10),
      formation: def.formation || '4-4-2',
      playStyle: (def.style as PlayStyle) || 'Pass to Feet',
      preferredFormation: def.formation || '4-4-2',
      preferredStyle: (def.style as PlayStyle) || 'Pass to Feet',
      playedHistory: [],
      staff: staff,
      lineup: [], 
      finances: {
        gateReceipts: 0,
        merchandise: 0,
        wagesPaid: 0,
        transfersIn: 0,
        transfersOut: 0,
        taxPaid: 0
      }
    });
  });

  const players: Player[] = [];
  // Heavily bias towards 'C' (Central) players as requested. 10/14 central options.
  const sideBias: Side[] = ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'L', 'R', 'LC', 'RC'];

  teams.forEach(team => {
    let teamWages = 0;
    const positions = ['GK', 'GK', 'DF', 'DF', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW', 'FW', 'DM', 'DF', 'MF', 'FW'];
    
    positions.forEach((pos, i) => {
      const age = 17 + Math.floor(Math.random() * 18);
      const potential = 10 + Math.floor(Math.random() * 10);
      const attrBase = Math.max(5, potential - (35 - age) / 2) - (team.division * 2);
      const attr = () => Math.max(1, Math.floor(Math.random() * 5) + attrBase);
      
      let preferredSide: Side = 'C';
      if (pos === 'GK') preferredSide = 'C';
      else {
        preferredSide = sideBias[Math.floor(Math.random() * sideBias.length)];
      }

      const player: Player = {
        id: `p-${team.id}-${i}`,
        name: `${FIRSTNAME_POOL[Math.floor(Math.random() * FIRSTNAME_POOL.length)]} ${SURNAME_POOL[Math.floor(Math.random() * SURNAME_POOL.length)]}`,
        age,
        position: pos as Position,
        side: preferredSide,
        attributes: {
          pace: attr(),
          stamina: attr(),
          skill: attr(),
          shooting: attr(),
          passing: attr(),
          heading: attr(),
          influence: attr(),
          goalkeeping: pos === 'GK' ? attr() + 6 : 1,
          consistency: attr(),
          dirtiness: Math.floor(Math.random() * 20),
          injuryProne: Math.floor(Math.random() * 20),
          temperament: attr(),
          potential: potential,
          professionalism: 5 + Math.floor(Math.random() * 15),
        },
        fitness: 90 + Math.floor(Math.random() * 10),
        morale: 70 + Math.floor(Math.random() * 30),
        condition: 100,
        status: 'FIT',
        value: (5 - team.division) * 1000000 + Math.floor(Math.random() * 1000000),
        wage: (5 - team.division) * 5000 + Math.floor(Math.random() * 5000),
        contractYears: 1 + Math.floor(Math.random() * 4),
        clubId: team.id,
        isListed: false,
        suspensionWeeks: 0,
        injury: null,
        seasonStats: { apps: 0, goals: 0, avgRating: 0, yellowCards: 0, redCards: 0 },
        history: []
      };
      players.push(player);
      teamWages += player.wage;
      
      if (i < 11) {
        team.lineup.push(player.id);
      }
    });
    team.weeklyWages = teamWages + team.staff.reduce((acc, s) => acc + s.wage, 0);
  });

  const fixtures = generateFixtures(teams, 1993);

  const availableStaff: StaffMember[] = Array.from({ length: 15 }).map((_, i) => ({
    id: `avail-s-${i}`,
    name: `${FIRSTNAME_POOL[i % 20]} ${SURNAME_POOL[(i+5) % 20]}`,
    role: (['COACH', 'PHYSIO', 'SCOUT'][i % 3]) as StaffRole,
    rating: 5 + Math.floor(Math.random() * 15),
    wage: 500 + Math.floor(Math.random() * 3000)
  }));

  return { teams, players, fixtures, availableStaff, cupEntrants: teams.slice(0, 32).map(t => t.id) };
}
