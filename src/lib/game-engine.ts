import { Team, Player, Fixture, MatchEvent, QualificationType, Position, ManagerPersonality } from '@/types/game';

const COMMENTARY = {
  ATTACK: [
    "{team} are pouring forward!", 
    "A dangerous cross into the box by {player}.", 
    "Great footwork by {player} to beat his man.",
    "{player} looks for an opening...",
    "Stunning run from {player}!",
    "{team} are piling on the pressure!",
    "A speculative effort from distance by {player}!",
    "The defense is stretched wide by {team}.",
    "Chaos in the penalty area!",
    "{player} is causing all sorts of problems for the defense."
  ],
  MIDFIELD: [
    "{player} controls the tempo in the middle.", 
    "{team} are patient with their build-up.", 
    "A crunching tackle in midfield by {player}!",
    "{player} sprays the ball out wide.",
    "Battle for possession in the center circle.",
    "{player} wins the ball back for {team}.",
    "Patient passing from {team} in the middle.",
    "A wayward pass from {player} ends that move.",
    "{player} looks to unlock the defense with a through ball.",
    "{team} are moving the ball well across the pitch."
  ],
  DEFENSE: [
    "{team} are under pressure here.", 
    "A vital clearance by {player}!", 
    "Solid defending from {team}.",
    "{player} tracks back well to stop the break.",
    "The offside trap works perfectly for {team}!",
    "Desperation defending now from {player}.",
    "{team} are sitting deep, inviting pressure.",
    "A towering header from {player} clears the danger.",
    "{player} intercepts the pass just in time.",
    "The keeper shouts instructions at his back four."
  ],
  SAVE: [
    "UNBELIEVABLE SAVE BY {player}!",
    "{player} tips it over the bar!",
    "A vital block by the keeper, {player}.",
    "The fans are on their feet after that save from {player}!",
    "Routine catch for {player}.",
    "Sharp reflexes shown there by {player}."
  ],
  MISS: [
    "{player} hits the post!",
    "High and wide from {player}. Poor effort.",
    "{player} should have scored there!",
    "Just wide of the upright from {player}!",
    "He's missed a sitter! {player} can't believe it.",
    "Straight at the keeper from {player}."
  ],
  GOAL: [
    "{player} fires into the bottom corner!",
    "What a strike! {player} smashes it home!",
    "A poacher's goal! {player} taps it in from close range.",
    "Scramble in the box... and {player} pokes it over the line!",
    "{player} rises highest to head into the top corner!",
    "GOAL! {player} finds the net with clinical precision!",
    "The crowd goes wild! {player} has scored for {team}!"
  ],
  FOUL: [
    "A reckless challenge from {player}!",
    "{player} goes into the book for that one.",
    "Nasty tackle by {player}. The referee isn't happy.",
    "{player} is lucky to stay on the pitch after that.",
    "The whistle blows. Foul by {player}."
  ],
  INJURY: [
    "{player} is down and looks in real pain.",
    "The physio is coming on for {player}.",
    "That looks like a serious one for {player}.",
    "{player} is being carried off the pitch."
  ]
};

export interface TacticalSlot {
  id: string;
  label: string;
  top: number;
  left: number;
  pos: Position;
}

export function getFormationSlots(formation: string): TacticalSlot[] {
  switch (formation) {
    case '4-3-3':
      return [
        { id: 'gk', label: 'GK', top: 90, left: 50, pos: 'GK' },
        { id: 'dl', label: 'DL', top: 72, left: 15, pos: 'DF' },
        { id: 'dc1', label: 'DC', top: 75, left: 38, pos: 'DF' },
        { id: 'dc2', label: 'DC', top: 75, left: 62, pos: 'DF' },
        { id: 'dr', label: 'DR', top: 72, left: 85, pos: 'DF' },
        { id: 'mc1', label: 'MC', top: 45, left: 25, pos: 'MF' },
        { id: 'mc2', label: 'MC', top: 45, left: 50, pos: 'MF' },
        { id: 'mc3', label: 'MC', top: 45, left: 75, pos: 'MF' },
        { id: 'fl', label: 'FL', top: 15, left: 20, pos: 'FW' },
        { id: 'fc', label: 'FC', top: 12, left: 50, pos: 'FW' },
        { id: 'fr', label: 'FR', top: 15, left: 80, pos: 'FW' },
      ];
    case '3-5-2':
      return [
        { id: 'gk', label: 'GK', top: 90, left: 50, pos: 'GK' },
        { id: 'dc1', label: 'DC', top: 75, left: 25, pos: 'DF' },
        { id: 'dc2', label: 'DC', top: 75, left: 50, pos: 'DF' },
        { id: 'dc3', label: 'DC', top: 75, left: 75, pos: 'DF' },
        { id: 'ml', label: 'ML', top: 45, left: 15, pos: 'MF' },
        { id: 'mc1', label: 'MC', top: 45, left: 35, pos: 'MF' },
        { id: 'mc2', label: 'MC', top: 45, left: 50, pos: 'MF' },
        { id: 'mc3', label: 'MC', top: 45, left: 65, pos: 'MF' },
        { id: 'mr', label: 'MR', top: 45, left: 85, pos: 'MF' },
        { id: 'fc1', label: 'FC', top: 15, left: 35, pos: 'FW' },
        { id: 'fc2', label: 'FC', top: 15, left: 65, pos: 'FW' },
      ];
    case '5-3-2':
      return [
        { id: 'gk', label: 'GK', top: 90, left: 50, pos: 'GK' },
        { id: 'dl', label: 'DL', top: 72, left: 15, pos: 'DF' },
        { id: 'dc1', label: 'DC', top: 75, left: 35, pos: 'DF' },
        { id: 'dc2', label: 'DC', top: 75, left: 50, pos: 'DF' },
        { id: 'dc3', label: 'DC', top: 75, left: 65, pos: 'DF' },
        { id: 'dr', label: 'DR', top: 72, left: 85, pos: 'DF' },
        { id: 'mc1', label: 'MC', top: 45, left: 30, pos: 'MF' },
        { id: 'mc2', label: 'MC', top: 45, left: 50, pos: 'MF' },
        { id: 'mc3', label: 'MC', top: 45, left: 70, pos: 'MF' },
        { id: 'fc1', label: 'FC', top: 15, left: 35, pos: 'FW' },
        { id: 'fc2', label: 'FC', top: 15, left: 65, pos: 'FW' },
      ];
    case '4-5-1':
      return [
        { id: 'gk', label: 'GK', top: 90, left: 50, pos: 'GK' },
        { id: 'dl', label: 'DL', top: 72, left: 15, pos: 'DF' },
        { id: 'dc1', label: 'DC', top: 75, left: 38, pos: 'DF' },
        { id: 'dc2', label: 'DC', top: 75, left: 62, pos: 'DF' },
        { id: 'dr', label: 'DR', top: 72, left: 85, pos: 'DF' },
        { id: 'ml', label: 'ML', top: 45, left: 15, pos: 'MF' },
        { id: 'mc1', label: 'MC', top: 48, left: 33, pos: 'MF' },
        { id: 'mc2', label: 'MC', top: 48, left: 50, pos: 'MF' },
        { id: 'mc3', label: 'MC', top: 48, left: 66, pos: 'MF' },
        { id: 'mr', label: 'MR', top: 45, left: 85, pos: 'MF' },
        { id: 'fc', label: 'FC', top: 15, left: 50, pos: 'FW' },
      ];
    case '4-4-2':
    default:
      return [
        { id: 'gk', label: 'GK', top: 90, left: 50, pos: 'GK' },
        { id: 'dl', label: 'DL', top: 72, left: 15, pos: 'DF' },
        { id: 'dc1', label: 'DC', top: 75, left: 38, pos: 'DF' },
        { id: 'dc2', label: 'DC', top: 75, left: 62, pos: 'DF' },
        { id: 'dr', label: 'DR', top: 72, left: 85, pos: 'DF' },
        { id: 'ml', label: 'ML', top: 45, left: 15, pos: 'MF' },
        { id: 'mc1', label: 'MC', top: 45, left: 38, pos: 'MF' },
        { id: 'mc2', label: 'MC', top: 45, left: 62, pos: 'MF' },
        { id: 'mr', label: 'MR', top: 45, left: 85, pos: 'MF' },
        { id: 'fc1', label: 'FC', top: 15, left: 35, pos: 'FW' },
        { id: 'fc2', label: 'FC', top: 15, left: 65, pos: 'FW' },
      ];
  }
}

export function getTacticalAssignments(formation: string, lineupPlayers: Player[]): Array<{ slot: TacticalSlot; player: Player | null }> {
  const slots = getFormationSlots(formation);
  // In manual mode, we respect the index of the lineup array.
  // The first 11 slots match the first 11 players in the team's lineup.
  const assignments: Array<{ slot: TacticalSlot; player: Player | null }> = [];

  slots.forEach((slot, i) => {
    assignments.push({ slot, player: lineupPlayers[i] || null });
  });

  return assignments;
}

export function getFormationRequirements(formation: string): Position[] {
  return getFormationSlots(formation).map(s => s.pos);
}

export function getZoneStrength(players: Player[], team: Team, zone: 'DEF' | 'MID' | 'ATT', personality?: ManagerPersonality) {
  const assignments = getTacticalAssignments(team.formation, players);

  const zoneAssignments = assignments.filter(a => {
    if (!a.player) return false;
    if (zone === 'DEF') return a.slot.pos === 'GK' || a.slot.pos === 'DF';
    if (zone === 'MID') return a.slot.pos === 'MF';
    return a.slot.pos === 'FW';
  });

  if (zoneAssignments.length === 0) return 5;
  
  const baseStrength = zoneAssignments.reduce((acc, { player: p, slot }) => {
    if (!p) return acc;
    let attrWeight = 0;
    if (zone === 'DEF') {
      attrWeight = (p.attributes.skill + p.attributes.pace + p.attributes.heading + p.attributes.stamina) / 4;
      if (p.position === 'GK') attrWeight = (p.attributes.goalkeeping * 1.5 + p.attributes.influence) / 2;
    } else if (zone === 'MID') {
      attrWeight = (p.attributes.skill + p.attributes.passing * 1.5 + p.attributes.stamina + p.attributes.influence) / 4.5;
    } else {
      attrWeight = (p.attributes.skill + p.attributes.shooting * 1.5 + p.attributes.pace + p.attributes.heading) / 4.5;
    }

    const consistencyRoll = Math.random() * 20;
    const consistencyFactor = consistencyRoll < p.attributes.consistency ? 1.0 : 0.85;

    const moraleFactor = 0.9 + (p.morale / 100) * 0.2;
    const fitnessFactor = 0.5 + (p.fitness / 100) * 0.5;
    
    // Position Compatibility logic:
    // DM is natural in DF and MF.
    // MF is natural in MF and FW.
    const isRoleMatch = 
      (p.position === slot.pos) || 
      (p.position === 'MF' && slot.pos === 'FW') ||
      (p.position === 'DM' && (slot.pos === 'DF' || slot.pos === 'MF'));

    const positionPenalty = isRoleMatch ? 1.0 : 0.7;
    
    return acc + (attrWeight * consistencyFactor * moraleFactor * fitnessFactor * positionPenalty);
  }, 0);

  const personalityMod = personality === 'Analyst' ? 1.05 : 1.0;
  return Math.round(baseStrength * personalityMod);
}

export function simulateMatch(
  homeTeam: Team, 
  awayTeam: Team, 
  homeStarters: Player[], 
  awayStarters: Player[], 
  homeSubs: Player[] = [], 
  awaySubs: Player[] = [],
  isKnockout: boolean = false, 
  startMin: number = 1, 
  currentResult: any = null,
  userPersonality?: ManagerPersonality
): Fixture['result'] {
  const events: MatchEvent[] = currentResult ? [...currentResult.events].filter(e => e.minute < startMin) : [];
  let homeGoals = currentResult ? currentResult.homeGoals : 0;
  let awayGoals = currentResult ? currentResult.awayGoals : 0;
  
  const ratings: Record<string, number> = currentResult ? { ...currentResult.ratings } : {};
  const scorers: Array<{playerId: string, minute: number}> = currentResult ? [...currentResult.scorers] : [];
  const cards: Array<{playerId: string, type: 'YELLOW' | 'RED', minute: number}> = currentResult ? [...currentResult.cards] : [];
  const injuries: Array<{playerId: string, type: string, weeks: number}> = currentResult ? [...currentResult.injuries] : [];
  
  const redCarded: Set<string> = new Set(cards.filter(c => c.type === 'RED').map(c => c.playerId));
  const injuredInMatch: Set<string> = new Set();
  
  let activeHome = [...homeStarters];
  let activeAway = [...awayStarters];

  [...activeHome, ...activeAway].forEach(p => {
    if (!ratings[p.id]) {
      ratings[p.id] = 6.0 + (Math.random() * 0.6) - 0.3;
    }
  });

  const attendance = currentResult ? currentResult.attendance : Math.floor(homeTeam.stadiumCapacity * (0.6 + (homeTeam.reputation / 250) + (Math.random() * 0.2)));
  const maverickMod = userPersonality === 'Maverick' ? 1.15 : 1.0;

  for (let min = startMin; min <= 90; min++) {
    const currentHome = activeHome.filter(p => !redCarded.has(p.id) && !injuredInMatch.has(p.id));
    const currentAway = activeAway.filter(p => !redCarded.has(p.id) && !injuredInMatch.has(p.id));

    if (currentHome.length === 0 || currentAway.length === 0) continue;

    const zones = {
      home: { 
        DEF: getZoneStrength(currentHome, homeTeam, 'DEF', homeTeam.isUserTeam ? userPersonality : undefined),
        MID: getZoneStrength(currentHome, homeTeam, 'MID', homeTeam.isUserTeam ? userPersonality : undefined),
        ATT: getZoneStrength(currentHome, homeTeam, 'ATT', homeTeam.isUserTeam ? userPersonality : undefined)
      },
      away: { 
        DEF: getZoneStrength(currentAway, awayTeam, 'DEF', awayTeam.isUserTeam ? userPersonality : undefined),
        MID: getZoneStrength(currentAway, awayTeam, 'MID', awayTeam.isUserTeam ? userPersonality : undefined),
        ATT: getZoneStrength(currentAway, awayTeam, 'ATT', awayTeam.isUserTeam ? userPersonality : undefined)
      }
    };

    const totalMid = zones.home.MID + zones.away.MID;
    
    if (min % 3 === 0) {
      const isHomeControl = Math.random() < (zones.home.MID / (totalMid || 1));
      const team = isHomeControl ? homeTeam : awayTeam;
      const players = isHomeControl ? currentHome : currentAway;
      const player = players[Math.floor(Math.random() * players.length)];
      
      const pool: Array<keyof typeof COMMENTARY> = ['MIDFIELD', 'MIDFIELD', 'DEFENSE', 'ATTACK'];
      const type = pool[Math.floor(Math.random() * pool.length)];

      events.push({
        minute: min,
        type: 'COMMENTARY',
        text: getCommentary(type, team, player),
        teamId: team.id
      });
    }

    const chanceProbability = (0.15 + (totalMid / 2500)) * maverickMod;
    if (Math.random() < chanceProbability) { 
      const isHome = Math.random() < (zones.home.MID / (totalMid || 1));
      const attackingPlayers = (isHome ? currentHome : currentAway).filter(p => p.position !== 'GK');
      const defendingPlayers = (isHome ? currentAway : currentHome);
      const opponentKeeper = defendingPlayers.find(p => p.position === 'GK');

      if (attackingPlayers.length > 0) {
        const player = attackingPlayers[Math.floor(Math.random() * attackingPlayers.length)];
        const attackPower = (player.attributes.shooting + player.attributes.skill) / 2;
        const defensePower = (isHome ? zones.away.DEF : zones.home.DEF) / (isHome ? currentAway.length : currentHome.length || 1);
        const keeperPower = opponentKeeper ? opponentKeeper.attributes.goalkeeping : 5;
        
        const goalProbability = (attackPower / (defensePower + keeperPower + 10)) * 0.9;
        
        if (Math.random() < goalProbability) {
          if (isHome) homeGoals++; else awayGoals++;
          ratings[player.id] = Math.min(10, (ratings[player.id] || 6) + 1.2);
          scorers.push({ playerId: player.id, minute: min });
          events.push({
            minute: min,
            type: 'GOAL',
            teamId: isHome ? homeTeam.id : awayTeam.id,
            playerId: player.id,
            text: getCommentary('GOAL', isHome ? homeTeam : awayTeam, player),
          });
        } else {
          const isSave = Math.random() > 0.4;
          const team = isSave ? (isHome ? awayTeam : homeTeam) : (isHome ? homeTeam : awayTeam);
          const subj = isSave ? (opponentKeeper || defendingPlayers[0]) : player;
          
          events.push({
            minute: min,
            type: 'COMMENTARY',
            text: getCommentary(isSave ? 'SAVE' : 'MISS', team, subj),
            teamId: team.id
          });
          if (isSave && opponentKeeper) ratings[opponentKeeper.id] = Math.min(10, (ratings[opponentKeeper.id] || 6) + 0.3);
        }
      }
    }
  }

  return { homeGoals, awayGoals, homeChances: homeGoals * 2, awayChances: awayGoals * 2, attendance, events, ratings, scorers, cards, injuries };
}

function getCommentary(type: keyof typeof COMMENTARY, team: Team, player?: Player) {
  const templates = COMMENTARY[type];
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace(/{team}/g, team.name).replace(/{player}/g, player?.name || 'A player');
}

export function simulateRemainingMinutes(currentResult: any, startMin: number, homeTeam: Team, awayTeam: Team, homePlayers: Player[], awayPlayers: Player[]) {
  return simulateMatch(
    homeTeam,
    awayTeam,
    homePlayers,
    awayPlayers,
    [], 
    [],
    false,
    startMin + 1,
    currentResult,
    homeTeam.isUserTeam ? undefined : undefined
  );
}

export function updateLeagueTable(teams: Team[], fixtures: Fixture[], division: number): Team[] {
  const divTeams = teams
    .filter((t) => t.division === division)
    .map((t) => ({
      ...t,
      played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, playedHistory: [],
    }));

  fixtures
    .filter((f) => f.division === division && f.competition === 'LEAGUE' && f.result)
    .forEach((f) => {
      const res = f.result!;
      const homeTeam = divTeams.find((t) => t.id === f.homeTeamId);
      const awayTeam = divTeams.find((t) => t.id === f.awayTeamId);

      if (homeTeam && awayTeam) {
        homeTeam.played++;
        awayTeam.played++;
        homeTeam.goalsFor += res.homeGoals;
        homeTeam.goalsAgainst += res.awayGoals;
        awayTeam.goalsFor += res.awayGoals;
        awayTeam.goalsAgainst += res.homeGoals;

        if (res.homeGoals > res.awayGoals) {
          homeTeam.won++;
          homeTeam.points += 3;
          awayTeam.lost++;
          homeTeam.playedHistory = [...homeTeam.playedHistory, 'W'].slice(-5);
          awayTeam.playedHistory = [...awayTeam.playedHistory, 'L'].slice(-5);
        } else if (res.homeGoals < res.awayGoals) {
          awayTeam.won++;
          awayTeam.points += 3;
          homeTeam.lost++;
          homeTeam.playedHistory = [...homeTeam.playedHistory, 'L'].slice(-5);
          awayTeam.playedHistory = [...awayTeam.playedHistory, 'W'].slice(-5);
        } else {
          homeTeam.drawn++;
          awayTeam.drawn++;
          homeTeam.points += 1;
          awayTeam.points += 1;
          homeTeam.playedHistory = [...homeTeam.playedHistory, 'D'].slice(-5);
          awayTeam.playedHistory = [...awayTeam.playedHistory, 'D'].slice(-5);
        }
      }
    });

  return divTeams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
  });
}
