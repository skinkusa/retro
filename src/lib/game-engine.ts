import { Team, Player, Fixture, MatchEvent, QualificationType, Position, ManagerPersonality, PlayStyle } from '@/types/game';
import { mergeEngineConfig, type MatchEngineConfig } from '@/lib/engine-config';
import { getCommentary, type CommentaryType } from '@/lib/commentary';

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
        { id: 'gk', label: 'GK', top: 88, left: 50, pos: 'GK' },
        { id: 'dl', label: 'DL', top: 62, left: 15, pos: 'DF' },
        { id: 'dc1', label: 'DC', top: 64, left: 38, pos: 'DF' },
        { id: 'dc2', label: 'DC', top: 64, left: 62, pos: 'DF' },
        { id: 'dr', label: 'DR', top: 62, left: 85, pos: 'DF' },
        { id: 'mc1', label: 'MC', top: 38, left: 25, pos: 'MF' },
        { id: 'mc2', label: 'MC', top: 38, left: 50, pos: 'MF' },
        { id: 'mc3', label: 'MC', top: 38, left: 75, pos: 'MF' },
        { id: 'fl', label: 'FL', top: 15, left: 20, pos: 'FW' },
        { id: 'fc', label: 'FC', top: 12, left: 50, pos: 'FW' },
        { id: 'fr', label: 'FR', top: 15, left: 80, pos: 'FW' },
      ];
    case '3-5-2':
      return [
        { id: 'gk', label: 'GK', top: 88, left: 50, pos: 'GK' },
        { id: 'dc1', label: 'DC', top: 64, left: 25, pos: 'DF' },
        { id: 'dc2', label: 'DC', top: 64, left: 50, pos: 'DF' },
        { id: 'dc3', label: 'DC', top: 64, left: 75, pos: 'DF' },
        { id: 'ml', label: 'ML', top: 38, left: 15, pos: 'MF' },
        { id: 'mc1', label: 'MC', top: 38, left: 35, pos: 'MF' },
        { id: 'mc2', label: 'MC', top: 38, left: 50, pos: 'MF' },
        { id: 'mc3', label: 'MC', top: 38, left: 65, pos: 'MF' },
        { id: 'mr', label: 'MR', top: 38, left: 85, pos: 'MF' },
        { id: 'fc1', label: 'FC', top: 15, left: 35, pos: 'FW' },
        { id: 'fc2', label: 'FC', top: 15, left: 65, pos: 'FW' },
      ];
    case '5-3-2':
      return [
        { id: 'gk', label: 'GK', top: 88, left: 50, pos: 'GK' },
        { id: 'dl', label: 'DL', top: 62, left: 15, pos: 'DF' },
        { id: 'dc1', label: 'DC', top: 64, left: 35, pos: 'DF' },
        { id: 'dc2', label: 'DC', top: 64, left: 50, pos: 'DF' },
        { id: 'dc3', label: 'DC', top: 64, left: 75, pos: 'DF' },
        { id: 'dr', label: 'DR', top: 62, left: 85, pos: 'DF' },
        { id: 'mc1', label: 'MC', top: 38, left: 30, pos: 'MF' },
        { id: 'mc2', label: 'MC', top: 38, left: 50, pos: 'MF' },
        { id: 'mc3', label: 'MC', top: 38, left: 70, pos: 'MF' },
        { id: 'fc1', label: 'FC', top: 15, left: 35, pos: 'FW' },
        { id: 'fc2', label: 'FC', top: 15, left: 65, pos: 'FW' },
      ];
    case '4-5-1':
      return [
        { id: 'gk', label: 'GK', top: 88, left: 50, pos: 'GK' },
        { id: 'dl', label: 'DL', top: 62, left: 15, pos: 'DF' },
        { id: 'dc1', label: 'DC', top: 64, left: 38, pos: 'DF' },
        { id: 'dc2', label: 'DC', top: 64, left: 62, pos: 'DF' },
        { id: 'dr', label: 'DR', top: 62, left: 85, pos: 'DF' },
        { id: 'ml', label: 'ML', top: 38, left: 15, pos: 'MF' },
        { id: 'mc1', label: 'MC', top: 41, left: 33, pos: 'MF' },
        { id: 'mc2', label: 'MC', top: 41, left: 50, pos: 'MF' },
        { id: 'mc3', label: 'MC', top: 41, left: 66, pos: 'MF' },
        { id: 'mr', label: 'MR', top: 38, left: 85, pos: 'MF' },
        { id: 'fc', label: 'FC', top: 15, left: 50, pos: 'FW' },
      ];
    case '4-4-2':
    default:
      return [
        { id: 'gk', label: 'GK', top: 88, left: 50, pos: 'GK' },
        { id: 'dl', label: 'DL', top: 62, left: 15, pos: 'DF' },
        { id: 'dc1', label: 'DC', top: 64, left: 38, pos: 'DF' },
        { id: 'dc2', label: 'DC', top: 64, left: 62, pos: 'DF' },
        { id: 'dr', label: 'DR', top: 62, left: 85, pos: 'DF' },
        { id: 'ml', label: 'ML', top: 38, left: 15, pos: 'MF' },
        { id: 'mc1', label: 'MC', top: 38, left: 38, pos: 'MF' },
        { id: 'mc2', label: 'MC', top: 38, left: 62, pos: 'MF' },
        { id: 'mr', label: 'MR', top: 38, left: 85, pos: 'MF' },
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

function deterministicConsistency(playerId: string, minute: number, consistency: number): number {
  const hash = Math.abs((minute * 31 + playerId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 20);
  return hash < consistency ? 1.0 : 0.85;
}

export function getZoneStrength(players: Player[], team: Team, zone: 'DEF' | 'MID' | 'ATT', personality?: ManagerPersonality, minute?: number) {
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

    const consistencyFactor = minute !== undefined
      ? deterministicConsistency(p.id, minute, p.attributes.consistency)
      : (Math.random() * 20 < p.attributes.consistency ? 1.0 : 0.85);

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
  userPersonality?: ManagerPersonality,
  engineConfig?: Partial<MatchEngineConfig>
): Fixture['result'] {
  const cfg = mergeEngineConfig(engineConfig);
  const events: MatchEvent[] = currentResult ? [...currentResult.events].filter(e => e.minute < startMin) : [];
  let homeGoals = currentResult ? currentResult.homeGoals : 0;
  let awayGoals = currentResult ? currentResult.awayGoals : 0;
  let homeChances = currentResult?.homeChances ?? 0;
  let awayChances = currentResult?.awayChances ?? 0;
  let homeShots = currentResult?.homeShots ?? 0;
  let awayShots = currentResult?.awayShots ?? 0;
  let homeShotsOnTarget = currentResult?.homeShotsOnTarget ?? 0;
  let awayShotsOnTarget = currentResult?.awayShotsOnTarget ?? 0;

  const ratings: Record<string, number> = currentResult ? { ...currentResult.ratings } : {};
  const scorers: Array<{playerId: string, minute: number}> = currentResult ? [...currentResult.scorers] : [];
  const cards: Array<{playerId: string, type: 'YELLOW' | 'RED', minute: number}> = currentResult ? [...currentResult.cards] : [];
  const injuries: Array<{playerId: string, type: string, weeks: number}> = currentResult ? [...currentResult.injuries] : [];
  const shotTakers: Array<{playerId: string, minute: number}> = currentResult?.shotTakers ? [...currentResult.shotTakers] : [];
  const sotTakers: Array<{playerId: string, minute: number}> = currentResult?.sotTakers ? [...currentResult.sotTakers] : [];

  const redCarded: Set<string> = new Set(cards.filter(c => c.type === 'RED').map(c => c.playerId));
  const injuredInMatch: Set<string> = new Set(injuries.map(i => i.playerId));
  
  let activeHome = [...homeStarters];
  let activeAway = [...awayStarters];

  [...activeHome, ...activeAway].forEach(p => {
    if (!ratings[p.id]) {
      ratings[p.id] = 6.0 + (Math.random() * 0.6) - 0.3;
    }
  });

  const applyRating = (playerId: string, delta: number) => {
    const r = ratings[playerId] ?? 6;
    ratings[playerId] = Math.max(4, Math.min(10, r + delta));
  };

  const gkShotsFaced: Record<string, number> = {};
  const gkGoalsConceded: Record<string, number> = {};

  // attendance: base 60% capacity, plus reputation bonus, plus a dynamic "form/buzz" multiplier
  const formBuzz = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
  const attendance = currentResult ? currentResult.attendance : Math.round(homeTeam.stadiumCapacity * (0.55 + (homeTeam.reputation / 200)) * formBuzz);
  
  const maverickMod = userPersonality === 'Maverick' ? 1.15 : 1.0;
  const chanceProbStyleMod = (att: PlayStyle, def: PlayStyle) => {
    let mod = 1.0;
    if (att === 'Direct' || att === 'Long Ball') mod *= 1.04;
    if (def === 'Park the Bus') mod *= 0.92;
    return mod;
  };

  for (let min = startMin; min <= 90; min++) {
    const currentHome = activeHome.filter(p => !redCarded.has(p.id) && !injuredInMatch.has(p.id));
    const currentAway = activeAway.filter(p => !redCarded.has(p.id) && !injuredInMatch.has(p.id));

    if (currentHome.length === 0 || currentAway.length === 0) continue;

    // Red Card Structural Penalty (tactical strain of missing players)
    const homeRedCount = cards.filter(c => c.minute < min && c.type === 'RED' && activeHome.some(p => p.id === c.playerId)).length;
    const awayRedCount = cards.filter(c => c.minute < min && c.type === 'RED' && activeAway.some(p => p.id === c.playerId)).length;
    
    // Multipliers: 0 reds = 1.0, 1 red = 0.90, 2+ reds = 0.75
    const homeRedPenalty = homeRedCount === 0 ? 1.0 : homeRedCount === 1 ? 0.90 : 0.75;
    const awayRedPenalty = awayRedCount === 0 ? 1.0 : awayRedCount === 1 ? 0.90 : 0.75;

    const zones = {
      home: { 
        DEF: getZoneStrength(currentHome, homeTeam, 'DEF', homeTeam.isUserTeam ? userPersonality : undefined, min) * homeRedPenalty,
        MID: getZoneStrength(currentHome, homeTeam, 'MID', homeTeam.isUserTeam ? userPersonality : undefined, min) * homeRedPenalty,
        ATT: getZoneStrength(currentHome, homeTeam, 'ATT', homeTeam.isUserTeam ? userPersonality : undefined, min) * homeRedPenalty
      },
      away: { 
        DEF: getZoneStrength(currentAway, awayTeam, 'DEF', awayTeam.isUserTeam ? userPersonality : undefined, min) * awayRedPenalty,
        MID: getZoneStrength(currentAway, awayTeam, 'MID', awayTeam.isUserTeam ? userPersonality : undefined, min) * awayRedPenalty,
        ATT: getZoneStrength(currentAway, awayTeam, 'ATT', awayTeam.isUserTeam ? userPersonality : undefined, min) * awayRedPenalty
      }
    };

    const totalMid = zones.home.MID + zones.away.MID;
    const homeChanceMod = chanceProbStyleMod(homeTeam.playStyle, awayTeam.playStyle);
    const awayChanceMod = chanceProbStyleMod(awayTeam.playStyle, homeTeam.playStyle);
    let chanceProbability = (cfg.chanceProbabilityBase + (totalMid / cfg.chanceMidScale)) * maverickMod * (homeChanceMod + awayChanceMod) / 2;
    chanceProbability = Math.max(cfg.chanceProbabilityMin, Math.min(cfg.chanceProbabilityMax, chanceProbability));

    if (min % 3 === 0) {
      const isHomeControl = Math.random() < (zones.home.MID / (totalMid || 1));
      const team = isHomeControl ? homeTeam : awayTeam;
      const players = isHomeControl ? currentHome : currentAway;
      const player = players[Math.floor(Math.random() * players.length)];
      
      const pool: CommentaryType[] = ['MIDFIELD', 'MIDFIELD', 'DEFENSE', 'ATTACK'];
      const type = pool[Math.floor(Math.random() * pool.length)];

      events.push({
        minute: min,
        type: 'COMMENTARY',
        text: getCommentary(type, team, player),
        teamId: team.id
      });
    }

    if (Math.random() < chanceProbability) {
      const isHome = Math.random() < (zones.home.MID / (totalMid || 1));
      if (isHome) homeChances++; else awayChances++;
      const attackingPlayers = (isHome ? currentHome : currentAway).filter(p => p.position !== 'GK');
      const defendingPlayers = (isHome ? currentAway : currentHome);
      const opponentKeeper = defendingPlayers.find(p => p.position === 'GK');
      const attStyle = isHome ? homeTeam.playStyle : awayTeam.playStyle;

      if (attackingPlayers.length > 0) {
        const player = attackingPlayers[Math.floor(Math.random() * attackingPlayers.length)];
        const isShot = Math.random() < (cfg.shotProbabilityFromThreat ?? 0.68);
        if (!isShot) {
          /* threat but no shot (blocked, corner, etc.) */
        } else {
        if (isHome) homeShots++; else awayShots++;
        shotTakers.push({ playerId: player.id, minute: min });
        const isSOT = Math.random() < (cfg.sotProbabilityFromShot ?? 0.32);
        if (isSOT) {
          if (opponentKeeper) {
            gkShotsFaced[opponentKeeper.id] = (gkShotsFaced[opponentKeeper.id] || 0) + 1;
          }
          if (isHome) homeShotsOnTarget++; else awayShotsOnTarget++;
          sotTakers.push({ playerId: player.id, minute: min });
          const attackPower = (player.attributes.shooting + player.attributes.skill) / 2;
          const rawDef = (isHome ? zones.away.DEF : zones.home.DEF) / (isHome ? currentAway.length : currentHome.length || 1);
          const defensePower = Math.max(5, rawDef);
          const keeperPower = opponentKeeper ? opponentKeeper.attributes.goalkeeping : 5;
          const attackingATT = isHome ? zones.home.ATT : zones.away.ATT;
          const conversionStyleMod = attStyle === 'Tiki-Taka' ? 1.03 : 1.0;
          const denom = Math.max(15, defensePower + keeperPower + 10);
          let goalProbability = (attackPower / denom) * 0.9 * conversionStyleMod * Math.min(1.15, 0.85 + attackingATT / 100) * cfg.conversionMultiplier;
          goalProbability = Math.max(cfg.goalProbabilityMin, Math.min(cfg.goalProbabilityMax, goalProbability));

          if (Math.random() < goalProbability) {
            if (isHome) homeGoals++; else awayGoals++;
            applyRating(player.id, 1.2);
            scorers.push({ playerId: player.id, minute: min });
            events.push({
              minute: min,
              type: 'GOAL',
              teamId: isHome ? homeTeam.id : awayTeam.id,
              playerId: player.id,
              text: getCommentary('GOAL', isHome ? homeTeam : awayTeam, player),
            });
            if (opponentKeeper) {
              gkGoalsConceded[opponentKeeper.id] = (gkGoalsConceded[opponentKeeper.id] || 0) + 1;
              applyRating(opponentKeeper.id, -0.4);
            }
            defendingPlayers.forEach(p => {
              if (p.position === 'GK') return;
              if (p.position === 'DF') applyRating(p.id, -0.25);
              else if (p.position === 'MF' || p.position === 'DM') applyRating(p.id, -0.12);
            });
          } else {
            const isSave = Math.random() < cfg.saveVsMissProbability;
            const team = isSave ? (isHome ? awayTeam : homeTeam) : (isHome ? homeTeam : awayTeam);
            const subj = isSave ? (opponentKeeper || defendingPlayers[0]) : player;
            events.push({
              minute: min,
              type: 'COMMENTARY',
              text: getCommentary(isSave ? 'SAVE' : 'MISS', team, subj),
              teamId: team.id
            });
            if (isSave && opponentKeeper) applyRating(opponentKeeper.id, 0.3);
            else applyRating(player.id, -0.05);
          }
        } else {
          events.push({
            minute: min,
            type: 'COMMENTARY',
            text: getCommentary('MISS', isHome ? homeTeam : awayTeam, player),
            teamId: isHome ? homeTeam.id : awayTeam.id
          });
          applyRating(player.id, -0.05);
        }
        }
      }
    }

    if (Math.random() < cfg.cardCheckPerMinute) {
      const picked = pickPlayerForCard(currentHome, currentAway, homeTeam, awayTeam);
      if (picked && !redCarded.has(picked.player.id)) {
        const existingYellow = cards.some(c => c.playerId === picked.player.id && c.type === 'YELLOW');
        const isDirectRed = Math.random() < cfg.directRedProbability;
        if (isDirectRed || existingYellow) {
          cards.push({ playerId: picked.player.id, type: 'RED', minute: min });
          redCarded.add(picked.player.id);
          applyRating(picked.player.id, -0.8);
          events.push({
            minute: min,
            type: 'RED',
            teamId: picked.team.id,
            playerId: picked.player.id,
            text: getCommentary('FOUL', picked.team, picked.player),
          });
        } else {
          cards.push({ playerId: picked.player.id, type: 'YELLOW', minute: min });
          applyRating(picked.player.id, -0.3);
          events.push({
            minute: min,
            type: 'YELLOW',
            teamId: picked.team.id,
            playerId: picked.player.id,
            text: getCommentary('FOUL', picked.team, picked.player),
          });
        }
      }
    }

    const avgFitness = [...currentHome, ...currentAway].length > 0
      ? [...currentHome, ...currentAway].reduce((s, p) => s + p.fitness, 0) / (currentHome.length + currentAway.length)
      : 100;
    const injuryRateScaled = cfg.injuryCheckPerMinute * Math.max(0.3, Math.min(1.5, 1.5 - avgFitness / 100));
    if (Math.random() < injuryRateScaled) {
      const picked = pickPlayerForInjury(currentHome, currentAway, homeTeam, awayTeam);
      if (picked && !injuredInMatch.has(picked.player.id)) {
        const r = Math.random();
        let weeks: number;
        if (r < cfg.injuryMinorProbability) {
          weeks = 1 + Math.floor(Math.random() * 2); // 1-2
        } else if (r < cfg.injuryMinorProbability + (1 - cfg.injuryMinorProbability) * cfg.injuryModerateGivenNotMinorProbability) {
          weeks = 3 + Math.floor(Math.random() * 4); // 3-6
        } else {
          weeks = cfg.injuryWeeksSeriousMin + Math.floor(Math.random() * (cfg.injuryWeeksSeriousMax - cfg.injuryWeeksSeriousMin + 1));
        }
        if (picked.player.attributes.injuryProne > 12) weeks = Math.min(12, Math.ceil(weeks * 1.2));
        const injuryType = ['Muscle', 'Knock', 'Strain'][Math.floor(Math.random() * 3)];
        injuries.push({ playerId: picked.player.id, type: injuryType, weeks });
        injuredInMatch.add(picked.player.id);
        applyRating(picked.player.id, -0.15);
        events.push({
          minute: min,
          type: 'INJURY',
          teamId: picked.team.id,
          playerId: picked.player.id,
          text: getCommentary('INJURY', picked.team, picked.player),
        });
      }
    }
  }

  if (isKnockout && homeGoals === awayGoals) {
    const etTempoMod = 0.85;
    for (let min = 91; min <= 120; min++) {
      const currentHome = activeHome.filter(p => !redCarded.has(p.id) && !injuredInMatch.has(p.id));
      const currentAway = activeAway.filter(p => !redCarded.has(p.id) && !injuredInMatch.has(p.id));
      if (currentHome.length === 0 || currentAway.length === 0) break;
      const zones = {
        home: { DEF: getZoneStrength(currentHome, homeTeam, 'DEF', homeTeam.isUserTeam ? userPersonality : undefined, min), MID: getZoneStrength(currentHome, homeTeam, 'MID', homeTeam.isUserTeam ? userPersonality : undefined, min), ATT: getZoneStrength(currentHome, homeTeam, 'ATT', homeTeam.isUserTeam ? userPersonality : undefined, min) },
        away: { DEF: getZoneStrength(currentAway, awayTeam, 'DEF', awayTeam.isUserTeam ? userPersonality : undefined, min), MID: getZoneStrength(currentAway, awayTeam, 'MID', awayTeam.isUserTeam ? userPersonality : undefined, min), ATT: getZoneStrength(currentAway, awayTeam, 'ATT', awayTeam.isUserTeam ? userPersonality : undefined, min) }
      };
      const totalMid = zones.home.MID + zones.away.MID;
      if (min % 3 === 0) {
        const isHomeControl = Math.random() < (zones.home.MID / (totalMid || 1));
        const team = isHomeControl ? homeTeam : awayTeam;
        const players = isHomeControl ? currentHome : currentAway;
        const player = players[Math.floor(Math.random() * players.length)];
        const pool: CommentaryType[] = ['MIDFIELD', 'MIDFIELD', 'DEFENSE', 'ATTACK'];
        events.push({ minute: min, type: 'COMMENTARY', text: getCommentary(pool[Math.floor(Math.random() * pool.length)], team, player), teamId: team.id });
      }
      let chanceProbability = (cfg.chanceProbabilityBase + (totalMid / cfg.chanceMidScale)) * maverickMod * (chanceProbStyleMod(homeTeam.playStyle, awayTeam.playStyle) + chanceProbStyleMod(awayTeam.playStyle, homeTeam.playStyle)) / 2 * etTempoMod;
      chanceProbability = Math.max(cfg.chanceProbabilityMin, Math.min(cfg.chanceProbabilityMax, chanceProbability));
      if (Math.random() < chanceProbability) {
        const isHome = Math.random() < (zones.home.MID / (totalMid || 1));
        if (isHome) homeChances++; else awayChances++;
        const attackingPlayers = (isHome ? currentHome : currentAway).filter(p => p.position !== 'GK');
        const defendingPlayers = (isHome ? currentAway : currentHome);
        const opponentKeeper = defendingPlayers.find(p => p.position === 'GK');
        if (attackingPlayers.length > 0) {
          const player = attackingPlayers[Math.floor(Math.random() * attackingPlayers.length)];
          const isShot = Math.random() < (cfg.shotProbabilityFromThreat ?? 0.68);
          if (isShot) {
            if (isHome) homeShots++; else awayShots++;
            shotTakers.push({ playerId: player.id, minute: min });
            const isSOT = Math.random() < (cfg.sotProbabilityFromShot ?? 0.32);
            if (isSOT) {
              if (opponentKeeper) gkShotsFaced[opponentKeeper.id] = (gkShotsFaced[opponentKeeper.id] || 0) + 1;
              if (isHome) homeShotsOnTarget++; else awayShotsOnTarget++;
              sotTakers.push({ playerId: player.id, minute: min });
              const attackPower = (player.attributes.shooting + player.attributes.skill) / 2;
              const rawDef = (isHome ? zones.away.DEF : zones.home.DEF) / (isHome ? currentAway.length : currentHome.length || 1);
              const defensePower = Math.max(5, rawDef);
              const keeperPower = opponentKeeper ? opponentKeeper.attributes.goalkeeping : 5;
              const attackingATT = isHome ? zones.home.ATT : zones.away.ATT;
              const conversionStyleMod = (isHome ? homeTeam.playStyle : awayTeam.playStyle) === 'Tiki-Taka' ? 1.03 : 1.0;
              const denom = Math.max(15, defensePower + keeperPower + 10);
              let goalProbability = (attackPower / denom) * 0.9 * conversionStyleMod * Math.min(1.15, 0.85 + attackingATT / 100) * cfg.conversionMultiplier;
              goalProbability = Math.max(cfg.goalProbabilityMin, Math.min(cfg.goalProbabilityMax, goalProbability));
              if (Math.random() < goalProbability) {
                if (isHome) homeGoals++; else awayGoals++;
                applyRating(player.id, 1.2);
                scorers.push({ playerId: player.id, minute: min });
                events.push({ minute: min, type: 'GOAL', teamId: isHome ? homeTeam.id : awayTeam.id, playerId: player.id, text: getCommentary('GOAL', isHome ? homeTeam : awayTeam, player) });
                if (opponentKeeper) {
                  gkGoalsConceded[opponentKeeper.id] = (gkGoalsConceded[opponentKeeper.id] || 0) + 1;
                  applyRating(opponentKeeper.id, -0.4);
                }
                defendingPlayers.forEach(p => {
                  if (p.position === 'GK') return;
                  if (p.position === 'DF') applyRating(p.id, -0.25);
                  else if (p.position === 'MF' || p.position === 'DM') applyRating(p.id, -0.12);
                });
              }
            }
          }
        }
      }
      if (Math.random() < cfg.cardCheckPerMinute * etTempoMod) {
        const picked = pickPlayerForCard(currentHome, currentAway, homeTeam, awayTeam);
        if (picked && !redCarded.has(picked.player.id)) {
          const existingYellow = cards.some(c => c.playerId === picked.player.id && c.type === 'YELLOW');
          const isDirectRed = Math.random() < cfg.directRedProbability;
          if (isDirectRed || existingYellow) {
            cards.push({ playerId: picked.player.id, type: 'RED', minute: min });
            redCarded.add(picked.player.id);
            applyRating(picked.player.id, -0.6);
            events.push({ minute: min, type: 'RED', teamId: picked.team.id, playerId: picked.player.id, text: getCommentary('FOUL', picked.team, picked.player) });
          } else {
            cards.push({ playerId: picked.player.id, type: 'YELLOW', minute: min });
            applyRating(picked.player.id, -0.25);
            events.push({ minute: min, type: 'YELLOW', teamId: picked.team.id, playerId: picked.player.id, text: getCommentary('FOUL', picked.team, picked.player) });
          }
        }
      }
      const etInjuryRate = cfg.injuryCheckPerMinute * 0.7;
      const avgFitnessET = [...currentHome, ...currentAway].reduce((s, p) => s + p.fitness, 0) / (currentHome.length + currentAway.length);
      if (Math.random() < etInjuryRate * Math.max(0.3, Math.min(1.5, 1.5 - avgFitnessET / 100))) {
        const picked = pickPlayerForInjury(currentHome, currentAway, homeTeam, awayTeam);
        if (picked && !injuredInMatch.has(picked.player.id)) {
          const r = Math.random();
          let weeks: number;
          if (r < cfg.injuryMinorProbability) weeks = 1 + Math.floor(Math.random() * 2);
          else if (r < cfg.injuryMinorProbability + (1 - cfg.injuryMinorProbability) * cfg.injuryModerateGivenNotMinorProbability) weeks = 3 + Math.floor(Math.random() * 4);
          else weeks = cfg.injuryWeeksSeriousMin + Math.floor(Math.random() * (cfg.injuryWeeksSeriousMax - cfg.injuryWeeksSeriousMin + 1));
          if (picked.player.attributes.injuryProne > 12) weeks = Math.min(12, Math.ceil(weeks * 1.2));
          const injuryType = ['Muscle', 'Knock', 'Strain'][Math.floor(Math.random() * 3)];
          injuries.push({ playerId: picked.player.id, type: injuryType, weeks });
          injuredInMatch.add(picked.player.id);
          applyRating(picked.player.id, -0.15);
          events.push({ minute: min, type: 'INJURY', teamId: picked.team.id, playerId: picked.player.id, text: getCommentary('INJURY', picked.team, picked.player) });
        }
      }
    }
  }

  let homePens: number | undefined;
  let awayPens: number | undefined;
  if (isKnockout && homeGoals === awayGoals) {
    const penConv = cfg.penaltyShootoutConversion;
    let homeScore = 0, awayScore = 0;
    for (let i = 0; i < 5; i++) {
      if (Math.random() < penConv) homeScore++;
      if (Math.random() < penConv) awayScore++;
    }
    while (homeScore === awayScore) {
      homeScore += Math.random() < penConv ? 1 : 0;
      awayScore += Math.random() < penConv ? 1 : 0;
    }
    homePens = homeScore;
    awayPens = awayScore;
    events.push({ minute: 121, type: 'PENALTY_SHOOTOUT', text: `Penalties: ${homeTeam.name} ${homeScore}-${awayScore} ${awayTeam.name}`, teamId: homeTeam.id });
  }

  for (const gk of [...homeStarters, ...awayStarters].filter(p => p.position === 'GK')) {
    const shots = gkShotsFaced[gk.id] || 0;
    const conceded = gkGoalsConceded[gk.id] || 0;
    if (shots > 0) {
      const saveRate = (shots - conceded) / shots;
      applyRating(gk.id, (saveRate - 0.7) * 1.2);
    }
    const isHomeGK = homeStarters.some(p => p.id === gk.id);
    const teamGoalsConceded = isHomeGK ? awayGoals : homeGoals;
    if (teamGoalsConceded === 0) applyRating(gk.id, 0.25);
  }
  if (homeGoals === 0) {
    awayStarters.filter(p => p.position === 'DF').forEach(p => applyRating(p.id, 0.15));
  }
  if (awayGoals === 0) {
    homeStarters.filter(p => p.position === 'DF').forEach(p => applyRating(p.id, 0.15));
  }

  return {
    homeGoals, awayGoals,
    homeChances, awayChances,
    homeShots, awayShots,
    homeShotsOnTarget, awayShotsOnTarget,
    attendance, events, ratings, scorers, cards, injuries,
    shotTakers, sotTakers,
    ...(homePens !== undefined && { homePens, awayPens }),
  };
}

function pickPlayerForCard(
  currentHome: Player[], currentAway: Player[], homeTeam: Team, awayTeam: Team
): { player: Player; team: Team; isHome: boolean } | null {
  const outfieldHome = currentHome.filter(p => p.position !== 'GK');
  const outfieldAway = currentAway.filter(p => p.position !== 'GK');
  const pool: Array<{ p: Player; team: Team; isHome: boolean }> = [];
  outfieldHome.forEach(p => pool.push({ p, team: homeTeam, isHome: true }));
  outfieldAway.forEach(p => pool.push({ p, team: awayTeam, isHome: false }));
  if (pool.length === 0) return null;
  const totalWeight = pool.reduce((sum, { p }) => sum + (1 + p.attributes.dirtiness / 10), 0);
  let r = Math.random() * totalWeight;
  for (const entry of pool) {
    const w = 1 + entry.p.attributes.dirtiness / 10;
    if (r < w) return { player: entry.p, team: entry.team, isHome: entry.isHome };
    r -= w;
  }
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return { player: chosen.p, team: chosen.team, isHome: chosen.isHome };
}

function pickPlayerForInjury(
  currentHome: Player[], currentAway: Player[], homeTeam: Team, awayTeam: Team
): { player: Player; team: Team } | null {
  const outfieldHome = currentHome.filter(p => p.position !== 'GK');
  const outfieldAway = currentAway.filter(p => p.position !== 'GK');
  const pool: Array<{ p: Player; team: Team }> = [];
  outfieldHome.forEach(p => pool.push({ p, team: homeTeam }));
  outfieldAway.forEach(p => pool.push({ p, team: awayTeam }));
  if (pool.length === 0) return null;
  const totalWeight = pool.reduce((sum, { p }) => {
    const fitnessMod = 1 + (100 - p.fitness) / 100;
    return sum + (1 + p.attributes.injuryProne / 5) * fitnessMod;
  }, 0);
  let r = Math.random() * totalWeight;
  for (const entry of pool) {
    const fitnessMod = 1 + (100 - entry.p.fitness) / 100;
    const w = (1 + entry.p.attributes.injuryProne / 5) * fitnessMod;
    if (r < w) return { player: entry.p, team: entry.team };
    r -= w;
  }
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return { player: chosen.p, team: chosen.team };
}

export type MatchResult = NonNullable<Fixture['result']>;

export function simulateRemainingMinutes(
  currentResult: MatchResult,
  startMin: number,
  homeTeam: Team,
  awayTeam: Team,
  homePlayers: Player[],
  awayPlayers: Player[],
  userPersonality?: ManagerPersonality,
  engineConfig?: Partial<MatchEngineConfig>
) {
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
    userPersonality,
    engineConfig
  );
}

export function updateLeagueTable(teams: Team[], fixtures: Fixture[], division: number): Team[] {
  const divTeams = teams
    .filter((t) => t.division === division)
    .map((t) => ({
      ...t,
      played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, playedHistory: [] as string[],
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
