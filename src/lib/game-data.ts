import { Player, Team, Position, Side, Fixture, PlayStyle, StaffMember } from '@/types/game';
import { DIVISIONS } from '@/data/divisions';
import { FIRSTNAME_POOL, SURNAME_POOL, NATIONALITY_POOLS } from '@/data/player-names';
import { TEAM_DEFINITIONS } from '@/data/teams';
import { STAFF_ROLES, generateStaffMember } from '@/data/staff-config';

export { NATIONALITY_POOLS };

/**
 * Round-robin fixture generation so every week 1..38 has valid fixtures (no empty weeks).
 * Uses circle method: fix team 0, rotate others. First N-1 weeks = single round-robin;
 * weeks N..38 repeat with home/away swapped (double round-robin).
 */
export function generateFixtures(teams: Team[], season: number) {
  const fixtures: Fixture[] = [];
  DIVISIONS.forEach(div => {
    const divTeams = teams.filter(t => t.division === div.id);
    const N = divTeams.length;
    if (N < 2) return; // no fixtures for empty or single-team division
    const roundsPerHalf = N - 1; // N-1 rounds for single round-robin
    for (let week = 1; week <= 38; week++) {
      const r = (week - 1) % roundsPerHalf; // round index 0 .. N-2
      const swapHomeAway = week > roundsPerHalf; // second half of season: reverse home/away
      // Circle method: position 0 = team 0; position j (1..N-1) = team (j-1+r) % (N-1) + 1
      // Pair position i with position N-1-i for i = 0 .. floor(N/2)-1 (each team plays once per round)
      for (let i = 0; i < Math.floor(N / 2); i++) {
        const rightPos = N - 1 - i;
        const leftIdx = i === 0 ? 0 : ((i - 1 + r) % (N - 1)) + 1;
        const rightIdx = ((rightPos - 1 + r) % (N - 1)) + 1;
        if (leftIdx === rightIdx) continue; // bye in odd-N case
        const homeIdx = swapHomeAway ? rightIdx : leftIdx;
        const awayIdx = swapHomeAway ? leftIdx : rightIdx;
        fixtures.push({
          id: `f-s${season}-div${div.id}-w${week}-${i}`,
          homeTeamId: divTeams[homeIdx].id,
          awayTeamId: divTeams[awayIdx].id,
          week,
          division: div.id,
          competition: 'LEAGUE',
        });
      }
    }
  });
  return fixtures;
}

export function generateInitialData() {
  const teams: Team[] = TEAM_DEFINITIONS.map((def, i) => {
    const staff: StaffMember[] = [];
    let staffWages = 0;
    STAFF_ROLES.forEach(rc => {
      for (let k = 0; k < rc.defaultPerTeam; k++) {
        const sm = generateStaffMember(rc.role, `team-${i}`, def.division, k);
        staff.push(sm);
        staffWages += sm.wage;
      }
    });
    // Dynamic budgets based on division bands
    let budget = 0;
    if (def.division === 1) budget = (20 + Math.random() * 40) * 1000000;
    else if (def.division === 2) budget = (5 + Math.random() * 10) * 1000000;
    else if (def.division === 3) budget = (1 + Math.random() * 2) * 1000000;
    else budget = (0.25 + Math.random() * 0.75) * 1000000;

    return {
      id: `team-${i}`,
      name: def.name,
      stadium: def.stadium ?? `${def.name} Stadium`,
      stadiumCapacity: def.stadiumCapacity,
      color: def.color,
      homeTextColor: def.homeTextColor,
      awayColor: def.awayColor,
      awayTextColor: def.awayTextColor,
      budget,
      weeklyWages: staffWages,
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
      playStyle: def.style || 'Pass to Feet',
      preferredFormation: def.formation || '4-4-2',
      preferredStyle: def.style || 'Pass to Feet',
      playedHistory: [],
      staff,
      lineup: [],
      finances: { gateReceipts: 0, merchandise: 0, wagesPaid: 0, transfersIn: 0, transfersOut: 0, taxPaid: 0 },
    };
  });

  const players: Player[] = [];
  const sideBias: Side[] = ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'L', 'R', 'LC', 'RC'];

  teams.forEach(team => {
    // Explicit positional blueprint: guarantees every side variant is represented.
    // Format: [position, side] — these are the GUARANTEED slots filled first.
    // Additional depth players are appended after.
    const blueprint: Array<[string, Side]> = [
      // Goalkeepers
      ['GK', 'C'], ['GK', 'C'],
      // Defenders: left, right, two centres
      ['DF', 'L'], ['DF', 'R'], ['DF', 'C'], ['DF', 'C'],
      // Defensive mid
      ['DM', 'C'],
      // Midfielders: left, right, two centres
      ['MF', 'L'], ['MF', 'R'], ['MF', 'C'], ['MF', 'C'],
      // Forwards: left, right, two centres
      ['FW', 'L'], ['FW', 'R'], ['FW', 'C'], ['FW', 'C'],
      // Extra bench depth
      ['DF', 'C'], ['MF', 'C'], ['FW', 'C'], ['DF', 'LC'], ['MF', 'RC'], ['FW', 'C'],
    ];

    const coverage = { GK: false, DF: false, MF: false, FW: false };

    blueprint.forEach(([pos, side], i) => {
      // Pick nationality (weighted toward England)
      const natKeys = Object.keys(NATIONALITY_POOLS);
      const isInternational = Math.random() < 0.45;
      const nationality = isInternational
        ? natKeys[Math.floor(Math.random() * (natKeys.length - 1)) + 1]
        : 'England';

      const pool = NATIONALITY_POOLS[nationality];
      const firstName = pool.firstNames[Math.floor(Math.random() * pool.firstNames.length)];
      const lastName = pool.lastNames[Math.floor(Math.random() * pool.lastNames.length)];

      const age = 17 + Math.floor(Math.random() * 18);

      // Specialist boost for first player of each core position
      const coverageKey = pos === 'DM' ? 'MF' : pos as keyof typeof coverage;
      const specialistBoost = !coverage[coverageKey] ? (coverage[coverageKey] = true, 2) : 0;

      const potential = 10 + Math.floor(Math.random() * 10) + (team.reputation / 20);
      const attrBase = Math.max(4, potential - (35 - age) / 2) - (team.division * 1.5) + specialistBoost;
      const attr = (isCore: boolean = false) => {
        const base = Math.floor(Math.random() * 5) + attrBase;
        return Math.max(1, isCore ? base + 2 : base);
      };

      const player: Player = {
        id: `p-${team.id}-${i}`,
        name: `${firstName} ${lastName}`,
        nationality,
        age,
        position: pos as Position,
        side,
        attributes: {
          pace: attr(),
          stamina: attr(),
          skill: attr(),
          shooting: attr(pos === 'FW'),
          passing: attr(pos === 'MF'),
          heading: attr(pos === 'DF'),
          influence: attr(),
          goalkeeping: pos === 'GK' ? Math.max(10, attrBase + 8) : 1,
          consistency: attr(),
          dirtiness: Math.floor(Math.random() * 20),
          injuryProne: Math.floor(Math.random() * 20),
          temperament: attr(),
          potential,
          professionalism: 5 + Math.floor(Math.random() * 15),
        },
        fitness: 90 + Math.floor(Math.random() * 10),
        morale: 70 + Math.floor(Math.random() * 30),
        condition: 100,
        status: 'FIT',
        value: (5 - team.division) * 1000000 + (team.reputation * 10000) + Math.floor(Math.random() * 1000000),
        wage: (5 - team.division) * 5000 + (team.reputation * 50) + Math.floor(Math.random() * 5000),
        contractYears: 1 + Math.floor(Math.random() * 4),
        clubId: team.id,
        isListed: false,
        suspensionWeeks: 0,
        injury: null,
        seasonStats: { apps: 0, goals: 0, avgRating: 0, yellowCards: 0, redCards: 0, shots: 0, shotsOnTarget: 0, cleanSheets: 0, minutesPlayed: 0, manOfTheMatch: 0 },
        history: [],
      };
      players.push(player);
      if (i < 16) team.lineup.push(player.id);
    });
    team.weeklyWages += players.filter(p => p.clubId === team.id).reduce((acc, p) => acc + p.wage, 0);
  });

  const availableStaff: StaffMember[] = [];
  const AVAILABLE_POOL_SIZE = 24;
  STAFF_ROLES.forEach(rc => {
    const perRole = Math.ceil(AVAILABLE_POOL_SIZE / STAFF_ROLES.length);
    for (let k = 0; k < perRole; k++) {
      const sm = generateStaffMember(rc.role, 'free', 1, k);
      sm.id = `staff-free-${rc.role}-${k}`;
      availableStaff.push(sm);
    }
  });

  return { teams, players, fixtures: generateFixtures(teams, 1993), availableStaff, cupEntrants: teams.slice(0, 32).map(t => t.id) };
}
