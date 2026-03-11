"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, Team, Player, Fixture, GameMessage, ManagerProfile, StaffMember, PlayStyle, TeamRecords, Position, Side, TransferOffer, ManagerPersonality, MatchEvent, SeasonSummaryData, LastView } from '@/types/game';
import { generateInitialData, generateFixtures, generatePlayer } from '@/lib/game-data';
import { performSeasonTransition } from '@/lib/season-logic';
import { simulateMatch, updateLeagueTable, getFormationRequirements, simulateRemainingMinutes, getBestSquadForTeam, normalizeLineupForTeam, isTransferWindowOpen, calculateBoardConfidenceDelta } from '@/lib/game-engine';
import { ARCADE_ENGINE_CONFIG } from '@/lib/engine-config';
import { useToast } from '@/hooks/use-toast';
import { formatMoney } from '@/lib/utils';
import { STORAGE_KEY, OVERRIDES_KEY } from '@/lib/constants';
import LZString from 'lz-string';
import { STAFF_ROLES } from '@/data/staff-config';
import { NATIONALITY_POOLS } from '@/data/player-names';

interface GameContextType {
  state: GameState;
  startGame: (name: string, teamId: string, personality: ManagerPersonality) => void;
  simulateWeek: () => void;
  advanceWeek: () => void;
  saveGame: () => void;
  loadGame: () => void;
  setTactics: (formation: string, playStyle: PlayStyle) => void;
  buyPlayer: (playerId: string) => void;
  sellPlayer: (playerId: string) => void;
  renewContract: (playerId: string, years: number, wage: number) => void;
  toggleShortlist: (playerId: string) => void;
  toggleTransferList: (playerId: string) => void;
  markMessageRead: (messageId: string) => void;
  hireStaff: (staffId: string) => void;
  fireStaff: (staffId: string) => void;
  togglePlayerLineup: (playerId: string) => void;
  swapPlayers: (player1Id: string, player2Id: string) => void;
  addPlayerToSlot: (playerId: string, slotIndex: number) => void;
  clearLineup: () => void;
  autoPickLineup: () => void;
  applyForJob: (teamId: string) => void;
  resetFired: () => void;
  acceptBid: (bidId: string) => void;
  rejectBid: (bidId: string) => void;
  updateMidMatchResult: (fixtureId: string, currentMinute: number) => void;
  updateSeason: (year: number) => void;
  updateTeamName: (teamId: string, name: string) => void;
  fastForwardSeason: () => void;
  startNextSeason: () => void;
  setEnginePreset: (preset: 'realistic' | 'arcade') => void;
  startMatch: (fixtureId: string) => void;
  clearCurrentMatch: () => void;
  quitToMainMenu: () => void;
  setLastView: (view: LastView) => void;
  expandStadium: (tier: 'small' | 'medium' | 'large') => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const DEFAULT_STATE: GameState = {
  currentWeek: 1,
  season: 1993,
  userTeamId: null,
  manager: null,
  teams: [],
  players: [],
  fixtures: [],
  messages: [],
  isGameStarted: false,
  isFired: false,
  isSeasonOver: false,
  seasonSummary: null,
  boardConfidence: 75,
  boardExpectation: 'No target set',
  targetPosition: 10,
  transferMarket: { listed: [], incomingBids: [] },
  availableStaff: [],
  jobMarket: [],
  cupEntrants: [],
  records: { biggestWin: null, biggestLoss: null, transferPaid: null, transferReceived: null },
  enginePreset: 'realistic',
  currentMatchFixtureId: null,
  lastView: null
};

function getInitialState(): GameState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_STATE;
    const data = JSON.parse(saved);
    const teams = (data.teams || []).map((t: Team) => ({ ...t, isUserTeam: t.id === data.userTeamId }));
    const natKeys = Object.keys(NATIONALITY_POOLS);
    const players = (data.players || []).map((p: Player) => {
      if (p.nationality) return p;
      const seed = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const isInt = (seed % 100) < 35;
      const nat = isInt ? natKeys[(seed % (natKeys.length - 1)) + 1] : 'England';
      return { ...p, nationality: nat };
    });
    return { ...data, isGameStarted: true, teams, players, enginePreset: data.enginePreset ?? 'realistic', currentMatchFixtureId: null };
  } catch {
    return DEFAULT_STATE;
  }
}


// ---------------------------------------------------------------------------
// Save helpers — keep localStorage well under the ~5MB quota
// ---------------------------------------------------------------------------
const KEEP_EVENT_TYPES = new Set(['GOAL', 'RED', 'INJURY', 'SUB', 'PENALTY_SHOOTOUT']);

function slimFixtures(fixtures: Fixture[]): Fixture[] {
  return fixtures.map(f => {
    if (!f.result) return f;
    return {
      ...f,
      result: {
        homeGoals: f.result.homeGoals,
        awayGoals: f.result.awayGoals,
        ...(f.result.homePens !== undefined && { homePens: f.result.homePens, awayPens: f.result.awayPens }),
        attendance: f.result.attendance,
        scorers: f.result.scorers,
        cards: f.result.cards,
        injuries: [],
        ratings: {},
        events: f.result.events?.filter(e => KEEP_EVENT_TYPES.has(e.type)) ?? [],
        shotTakers: undefined,
        sotTakers: undefined,
      }
    };
  });
}

function slimPlayers(players: Player[]): Player[] {
  return players.map(p => ({ ...p, history: p.history ? p.history.slice(-5) : [] }));
}

function buildSaveable(state: GameState): GameState {
  return { ...state, fixtures: slimFixtures(state.fixtures), players: slimPlayers(state.players) };
}

function compressedSave(data: GameState): string {
  return LZString.compressToUTF16(JSON.stringify(buildSaveable(data)));
}

function parseStoredSave(raw: string): GameState {
  // New format: LZ-compressed
  const decompressed = LZString.decompressFromUTF16(raw);
  if (decompressed) return JSON.parse(decompressed) as GameState;
  // Legacy format: plain JSON — parse and we'll re-save as compressed
  return JSON.parse(raw) as GameState;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [state, setState] = useState<GameState>(getInitialState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = parseStoredSave(raw);
        const teams = (data.teams || []).map((t: Team) => ({ ...t, isUserTeam: t.id === data.userTeamId }));
        const natKeys = Object.keys(NATIONALITY_POOLS);
        const players = (data.players || []).map((p: Player) => {
          if (p.nationality) return p;
          const seed = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const isInt = (seed % 100) < 35;
          const nat = isInt ? natKeys[(seed % (natKeys.length - 1)) + 1] : 'England';
          return { ...p, nationality: nat };
        });
        // Slim and re-save immediately in case this is an old bloated save
        const migratedState: GameState = { ...data, isGameStarted: true, teams, players: slimPlayers(players), fixtures: slimFixtures(data.fixtures || []), enginePreset: data.enginePreset ?? 'realistic', currentMatchFixtureId: null };
        try { localStorage.setItem(STORAGE_KEY, compressedSave(migratedState)); } catch (_) { /* quota: will retry on next autosave */ }
        setState(migratedState);
        return;
      } catch (_e) { /* corrupted save: fall through to fresh data */ }
    }
    const { teams, players, fixtures, availableStaff, cupEntrants } = generateInitialData();
    let finalTeams = [...teams];
    const overridesRaw = localStorage.getItem(OVERRIDES_KEY);
    if (overridesRaw) {
      try {
        const overrides = JSON.parse(overridesRaw);
        finalTeams = teams.map(t => overrides[t.id] ? { ...t, name: overrides[t.id] } : t);
      } catch (_e) {}
    }
    setState(s => ({ ...s, teams: finalTeams, players, fixtures, availableStaff, cupEntrants }));
  }, []);

  // Auto-save: slim + compress before writing to keep well under the ~5MB quota
  useEffect(() => {
    if (typeof window === 'undefined' || !state.isGameStarted || !state.userTeamId) return;
    try {
      localStorage.setItem(STORAGE_KEY, compressedSave(state));
      const overrides = Object.fromEntries(state.teams.map(t => [t.id, t.name]));
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        // Last-resort attempt with maximum stripping
        try {
          const minimal = { ...state, fixtures: state.fixtures.map(f => f.result ? { ...f, result: { homeGoals: f.result.homeGoals, awayGoals: f.result.awayGoals, attendance: f.result.attendance, scorers: [], cards: [], injuries: [], ratings: {}, events: [] } } : f), players: state.players.map(p => ({ ...p, history: [] })) };
          localStorage.setItem(STORAGE_KEY, LZString.compressToUTF16(JSON.stringify(minimal)));
          console.warn('[AutoSave] Quota tight — saved minimal state.');
        } catch (_e2) {
          console.error('[AutoSave] Could not save even minimal state.');
        }
      } else {
        console.error('[AutoSave] Unexpected save error:', e);
      }
    }
  }, [state]);


  const togglePlayerLineup = useCallback((pId: string) => {
    setState(s => {
      const t = s.teams.find(x => x.id === s.userTeamId);
      if (!t) return s;

      const p = s.players.find(x => x.id === pId);
      if (!p) return s;

      const currentLineup = [...t.lineup];
      const pIdx = currentLineup.indexOf(pId);

      const blocked = !!(p.injury || p.suspensionWeeks > 0 || p.status === 'INJURED' || p.status === 'SUSPENDED');

      if (pIdx !== -1) {
        currentLineup[pIdx] = null;
        return { ...s, teams: s.teams.map(x => x.id === t.id ? { ...x, lineup: currentLineup } : x) };
      }

      if (blocked) return s;

      const firstEmpty = currentLineup.indexOf(null);
      if (firstEmpty !== -1) {
        currentLineup[firstEmpty] = pId;
        return { ...s, teams: s.teams.map(x => x.id === t.id ? { ...x, lineup: currentLineup } : x) };
      }

      const benchIndices = [11, 12, 13, 14, 15];
      const benchPlayers = benchIndices
        .map(idx => currentLineup[idx])
        .filter(Boolean)
        .map(id => s.players.find(pp => pp.id === id))
        .filter(Boolean) as Player[];

      if (benchPlayers.length > 0) {
        const worstBench = [...benchPlayers].sort((a, b) => a.attributes.skill - b.attributes.skill)[0];
        const worstIdx = currentLineup.indexOf(worstBench.id);
        currentLineup[worstIdx] = pId;
        return { ...s, teams: s.teams.map(x => x.id === t.id ? { ...x, lineup: currentLineup } : x) };
      }

      return s;
    });
  }, [normalizeLineupForTeam]);

  const addPlayerToSlot = useCallback((playerId: string, slotIndex: number) => {
    setState(s => {
      const t = s.teams.find(x => x.id === s.userTeamId);
      if (!t) return s;
      const p = s.players.find(x => x.id === playerId);
      if (!p) return s;
      const blocked = !!(p.injury || p.suspensionWeeks > 0 || p.status === 'INJURED' || p.status === 'SUSPENDED');
      if (blocked) return s;
      if (slotIndex < 0 || slotIndex > 15) return s;

      const lineup = [...t.lineup];
      if (lineup.length < 16) while(lineup.length < 16) lineup.push(null);
      
      // Remove from any existing slot
      for(let i=0; i<16; i++) if (lineup[i] === playerId) lineup[i] = null;
      
      lineup[slotIndex] = playerId;

      return { ...s, teams: s.teams.map(x => x.id === t.id ? { ...x, lineup } : x) };
    });
  }, []);

  const swapPlayers = useCallback((p1: string, p2: string) => {
    setState(s => {
      const t = s.teams.find(x => x.id === s.userTeamId);
      if (!t) return s;

      const lineup = [...t.lineup];
      const i1 = lineup.indexOf(p1);
      const i2 = lineup.indexOf(p2);

      if (i1 !== -1 && i2 !== -1) {
        [lineup[i1], lineup[i2]] = [lineup[i2], lineup[i1]];
        return { ...s, teams: s.teams.map(x => x.id === t.id ? { ...x, lineup } : x) };
      }

      if (i1 !== -1 && i2 === -1) {
        const pIn = s.players.find(pp => pp.id === p2);
        if (!pIn) return s;
        const blocked = !!(pIn.injury || pIn.suspensionWeeks > 0 || pIn.status === 'INJURED' || pIn.status === 'SUSPENDED');
        if (blocked) return s;
        lineup[i1] = p2;
        return { ...s, teams: s.teams.map(x => x.id === t.id ? { ...x, lineup } : x) };
      }

      return s;
    });
  }, []);

  const autoPickLineup = useCallback(() => {
    setState(s => {
      const t = s.teams.find(x => x.id === s.userTeamId);
      if (!t) return s;

      const healthy = s.players.filter(p =>
        p.clubId === t.id &&
        p.suspensionWeeks === 0 &&
        !p.injury &&
        p.status !== 'INJURED' &&
        p.status !== 'SUSPENDED'
      );

      const best16 = [...healthy]
        .sort((a, b) => b.attributes.skill - a.attributes.skill)
        .slice(0, 16)
        .map(p => p.id);

      const next = normalizeLineupForTeam(t, s.players, best16);
      return { ...s, teams: s.teams.map(x => x.id === t.id ? { ...x, lineup: next } : x) };
    });
  }, [normalizeLineupForTeam]);

  const toggleShortlist = useCallback((pId: string) => {
    setState(s => ({ ...s, players: s.players.map(p => p.id === pId ? { ...p, isShortlisted: !p.isShortlisted } : p) }));
  }, []);

  const toggleTransferList = useCallback((pId: string) => {
    setState(s => ({ ...s, players: s.players.map(p => p.id === pId ? { ...p, isListed: !p.isListed } : p) }));
  }, []);

  const acceptBid = useCallback((bidId: string) => {
    setState(s => {
      if (!isTransferWindowOpen(s.currentWeek)) {
        setTimeout(() => toast({ title: "TRANSFER WINDOW CLOSED", description: "You can only sell players during active windows.", variant: "destructive" }), 0);
        return s;
      }
      const bid = s.transferMarket.incomingBids.find(b => b.id === bidId);
      if (!bid) return s;
      const p = s.players.find(x => x.id === bid.playerId);
      if (!p) return s;
      setTimeout(() => toast({ title: "TRANSFER COMPLETE", description: `${p.name} sold.` }), 0);
      return { 
        ...s, 
        teams: s.teams.map(t => t.id === s.userTeamId ? { ...t, budget: t.budget + bid.amount, weeklyWages: t.weeklyWages - p.wage } : t), 
        players: s.players.map(x => x.id === p.id ? { ...x, clubId: bid.fromTeamId, isListed: false } : x), 
        transferMarket: { ...s.transferMarket, incomingBids: s.transferMarket.incomingBids.filter(b => b.id !== bidId) } 
      };
    });
  }, [toast]);

  const rejectBid = useCallback((bidId: string) => {
    setState(s => ({ ...s, transferMarket: { ...s.transferMarket, incomingBids: s.transferMarket.incomingBids.filter(b => b.id !== bidId) } }));
    setTimeout(() => toast({ title: "BID REJECTED", description: "Offer declined." }), 0);
  }, [toast]);

  const prepareSeasonSummary = useCallback((currentState: GameState): SeasonSummaryData => {
    const standingsByDiv = [1, 2, 3, 4].map(div => updateLeagueTable(currentState.teams, currentState.fixtures, div));
    const userTeam = currentState.userTeamId ? currentState.teams.find(t => t.id === currentState.userTeamId) : null;
    let userPos = 0; let userTarget = currentState.targetPosition;
    if (userTeam) {
      const userDivStanding = standingsByDiv[userTeam.division - 1];
      if (userDivStanding) userPos = userDivStanding.findIndex(t => t.id === currentState.userTeamId) + 1;
    }
    const targetDivision = userTeam?.division || 1;
    const divPlayers = currentState.players.filter(p => currentState.teams.find(t => t.id === p.clubId)?.division === targetDivision);
    const topScorerPlayer = [...divPlayers].sort((a, b) => (b.seasonStats.goals || 0) - (a.seasonStats.goals || 0))[0];
    const bestRatedPlayer = [...divPlayers].filter(p => p.seasonStats.apps > 5).sort((a, b) => (b.seasonStats.avgRating || 0) - (a.seasonStats.avgRating || 0))[0];

    return {
      season: currentState.season,
      champions: { 1: standingsByDiv[0][0]?.name || 'N/A', 2: standingsByDiv[1][0]?.name || 'N/A', 3: standingsByDiv[2][0]?.name || 'N/A', 4: standingsByDiv[3][0]?.name || 'N/A' },
      promoted: { 2: [standingsByDiv[1][0]?.name, standingsByDiv[1][1]?.name, standingsByDiv[1][2]?.name].filter(Boolean) as string[], 3: [standingsByDiv[2][0]?.name, standingsByDiv[2][1]?.name, standingsByDiv[2][2]?.name].filter(Boolean) as string[], 4: [standingsByDiv[3][0]?.name, standingsByDiv[3][1]?.name].filter(Boolean) as string[] },
      relegated: { 1: [standingsByDiv[0][19]?.name, standingsByDiv[0][18]?.name, standingsByDiv[0][17]?.name].filter(Boolean) as string[], 2: [standingsByDiv[1][19]?.name, standingsByDiv[1][18]?.name, standingsByDiv[1][17]?.name].filter(Boolean) as string[], 3: [standingsByDiv[2][19]?.name, standingsByDiv[2][18]?.name, standingsByDiv[2][17]?.name].filter(Boolean) as string[] },
      userPos, userTarget,
      topScorer: topScorerPlayer ? { name: topScorerPlayer.name, goals: topScorerPlayer.seasonStats.goals, team: currentState.teams.find(t => t.id === topScorerPlayer.clubId)?.name || 'Unknown' } : null,
      bestPlayer: bestRatedPlayer ? { name: bestRatedPlayer.name, rating: bestRatedPlayer.seasonStats.avgRating, team: currentState.teams.find(t => t.id === bestRatedPlayer.clubId)?.name || 'Unknown' } : null
    };
  }, []);

  const startNextSeason = useCallback(() => {
    setState(s => {
      const nextState = performSeasonTransition(s);
      if (Object.keys(nextState).length === 0) return s;
      
      const newYr = nextState.season || s.season;
      setTimeout(() => toast({ title: "NEW SEASON STARTED", description: `${newYr} fixtures generated.` }), 0);
      
      return { ...s, ...nextState };
    });
  }, [toast]);

  const startGame = useCallback((name: string, teamId: string, personality: ManagerPersonality) => {
    const { teams, players, fixtures, availableStaff, cupEntrants } = generateInitialData();
    let finalTeams = [...teams];
    if (typeof window !== 'undefined') {
      try {
        const overridesRaw = localStorage.getItem(OVERRIDES_KEY);
        if (overridesRaw) {
          const overrides = JSON.parse(overridesRaw);
          // Database Editor renames: apply so "for new games" persists with modular team data
          finalTeams = teams.map(t => overrides[t.id] ? { ...t, name: overrides[t.id] } : t);
        }
      } catch (e) {}
    }
    const teamsWithBestLineups = finalTeams.map(t => ({ ...t, lineup: getBestSquadForTeam(t, players), isUserTeam: t.id === teamId }));
    const team = teamsWithBestLineups.find(t => t.id === teamId);
    let targetPos = 10; let expectation = 'Finish in mid-table';
    if (team) {
      if (team.division === 1) {
        if (team.reputation >= 85) { targetPos = 1; expectation = 'Win the Premier League'; }
        else if (team.reputation >= 75) { targetPos = 4; expectation = 'Qualify for Champions Cup'; }
        else { targetPos = 17; expectation = 'Avoid Relegation'; }
      } else {
        if (team.reputation >= 60) { targetPos = 3; expectation = 'Challenge for Promotion'; }
        else { targetPos = 12; expectation = 'Mid-table stability'; }
      }
    }
setState(s => ({
      ...s, currentWeek: 1, season: 1993, userTeamId: teamId, teams: teamsWithBestLineups, players, fixtures, availableStaff, cupEntrants,
      manager: { name, personality, reputation: personality === 'Celebrity' ? 25 : 10, seasonsManaged: 0, trophies: [], winPercentage: 0, totalGames: 0, totalWins: 0 },
      isGameStarted: true, isFired: false, isSeasonOver: false, boardConfidence: personality === 'Celebrity' ? 55 : 75, boardExpectation: expectation, targetPosition: targetPos,
      messages: [{ id: 'welcome', title: 'BOARD WELCOME', content: `Welcome, ${name}. Our expectation is that you ${expectation.toLowerCase()}. Good luck.`, date: Date.now(), week: 1, read: false, type: 'BOARD' }],
      currentMatchFixtureId: null
    }));
  }, [getBestSquadForTeam]);

  const simulateWeek = useCallback(() => {
    setState(s => {
      const currentWeekFixtures = s.fixtures.filter(f => f.week === s.currentWeek && !f.result);
      if (currentWeekFixtures.length === 0) return s;
      const updatedFixtures = [...s.fixtures];
      const updatedTeamsMap = new Map(s.teams.map(t => [t.id, { ...t }]));
      currentWeekFixtures.forEach(f => {
        const hTeam = updatedTeamsMap.get(f.homeTeamId)!;
        const aTeam = updatedTeamsMap.get(f.awayTeamId)!;
        if (hTeam.id !== s.userTeamId) hTeam.lineup = getBestSquadForTeam(hTeam, s.players);
        if (aTeam.id !== s.userTeamId) aTeam.lineup = getBestSquadForTeam(aTeam, s.players);
        const hStarters = s.players.filter(p => hTeam.lineup.slice(0, 11).filter((id): id is string => id !== null).includes(p.id));
        const aStarters = s.players.filter(p => aTeam.lineup.slice(0, 11).filter((id): id is string => id !== null).includes(p.id));
        const result = simulateMatch(hTeam, aTeam, hStarters, aStarters, [], [], false, 1, null, (f.homeTeamId === s.userTeamId || f.awayTeamId === s.userTeamId) ? s.manager?.personality : undefined, s.enginePreset === 'arcade' ? ARCADE_ENGINE_CONFIG : undefined);
        const fIdx = updatedFixtures.findIndex(uf => uf.id === f.id);
        updatedFixtures[fIdx] = { ...f, result };
      });
      return { ...s, fixtures: updatedFixtures, teams: Array.from(updatedTeamsMap.values()) };
    });
  }, [getBestSquadForTeam]);

  const advanceWeek = useCallback(() => {
    setState(s => {
      if (s.currentWeek > 38) return s;
      const currentWeekFixtures = s.fixtures.filter(f => f.week === s.currentWeek);
      const statsToUpdate: Record<string, { apps: number, goals: number, rating: number, fitnessLoss: number, yellowCards: number, redCards: number, shots: number, shotsOnTarget: number, cleanSheets: number, minutesPlayed: number }> = {};
      const newSuspensions: Set<string> = new Set();
      const newInjuries: Record<string, { type: string; weeks: number }> = {};
      const weeklyFinances: Record<string, { gate: number, merchandise: number, wages: number }> = {};
      s.teams.forEach(t => { weeklyFinances[t.id] = { gate: 0, merchandise: 5000 + (t.reputation * 100), wages: t.weeklyWages * (t.id === s.userTeamId && s.manager?.personality === 'Economist' ? 0.9 : 1.0) }; });
      currentWeekFixtures.forEach(f => {
        if (!f.result) return;
        const hTeam = s.teams.find(t => t.id === f.homeTeamId)!;
        weeklyFinances[hTeam.id].gate += f.result.attendance * (5 - hTeam.division) * 10;
        Object.keys(f.result.ratings).forEach(pid => { statsToUpdate[pid] = { apps: 1, goals: 0, rating: f.result!.ratings[pid] || 6.0, fitnessLoss: 15 + Math.floor(Math.random() * 10), yellowCards: 0, redCards: 0, shots: 0, shotsOnTarget: 0, cleanSheets: 0, minutesPlayed: 90 }; });
        f.result.scorers.forEach(sc => { if (statsToUpdate[sc.playerId]) statsToUpdate[sc.playerId].goals++; });
        f.result.shotTakers?.forEach(st => { if (statsToUpdate[st.playerId]) statsToUpdate[st.playerId].shots++; });
        f.result.sotTakers?.forEach(st => { if (statsToUpdate[st.playerId]) statsToUpdate[st.playerId].shotsOnTarget++; });
        const homeGkId = s.players.find(p => p.clubId === f.homeTeamId && p.position === 'GK' && f.result!.ratings[p.id] != null)?.id;
        const awayGkId = s.players.find(p => p.clubId === f.awayTeamId && p.position === 'GK' && f.result!.ratings[p.id] != null)?.id;
        if (f.result!.awayGoals === 0 && homeGkId && statsToUpdate[homeGkId]) statsToUpdate[homeGkId].cleanSheets = 1;
        if (f.result!.homeGoals === 0 && awayGkId && statsToUpdate[awayGkId]) statsToUpdate[awayGkId].cleanSheets = 1;
        f.result.cards.forEach(c => {
          if (!statsToUpdate[c.playerId]) statsToUpdate[c.playerId] = { apps: 0, goals: 0, rating: 6.0, fitnessLoss: 0, yellowCards: 0, redCards: 0, shots: 0, shotsOnTarget: 0, cleanSheets: 0, minutesPlayed: 0 };
          if (c.type === 'YELLOW') statsToUpdate[c.playerId].yellowCards++;
          if (c.type === 'RED') { statsToUpdate[c.playerId].redCards++; newSuspensions.add(c.playerId); }
        });
        f.result.injuries.forEach(inj => { newInjuries[inj.playerId] = { type: inj.type, weeks: inj.weeks }; });
      });
      const momCounts: Record<string, number> = {};
      currentWeekFixtures.forEach(f => {
        if (!f.result?.ratings || Object.keys(f.result.ratings).length === 0) return;
        const entries = Object.entries(f.result.ratings);
        const best = entries.reduce((a, [pid, r]) => (r > a.rating ? { id: pid, rating: r } : a), { id: entries[0][0], rating: entries[0][1] });
        momCounts[best.id] = (momCounts[best.id] || 0) + 1;
      });
      // Apply current week results to team standings (points, played, won, drawn, lost, goalsFor, goalsAgainst, playedHistory)
      const teamStandingsDelta: Record<string, { played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number; result: 'W' | 'D' | 'L' }> = {};
      currentWeekFixtures.forEach(f => {
        if (!f.result) return;
        const res = f.result;
        const homeTeam = s.teams.find(t => t.id === f.homeTeamId)!;
        const awayTeam = s.teams.find(t => t.id === f.awayTeamId)!;
        if (!homeTeam || !awayTeam) return;
        const homeResult = res.homeGoals > res.awayGoals ? 'W' as const : res.homeGoals < res.awayGoals ? 'L' as const : 'D' as const;
        const awayResult = res.homeGoals < res.awayGoals ? 'W' as const : res.homeGoals > res.awayGoals ? 'L' as const : 'D' as const;
        const homePoints = homeResult === 'W' ? 3 : homeResult === 'D' ? 1 : 0;
        const awayPoints = awayResult === 'W' ? 3 : awayResult === 'D' ? 1 : 0;
        if (!teamStandingsDelta[homeTeam.id]) teamStandingsDelta[homeTeam.id] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, result: 'D' };
        if (!teamStandingsDelta[awayTeam.id]) teamStandingsDelta[awayTeam.id] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, result: 'D' };
        const h = teamStandingsDelta[homeTeam.id];
        const a = teamStandingsDelta[awayTeam.id];
        h.played++; a.played++;
        h.goalsFor += res.homeGoals; h.goalsAgainst += res.awayGoals;
        a.goalsFor += res.awayGoals; a.goalsAgainst += res.homeGoals;
        h.points += homePoints; a.points += awayPoints;
        if (homeResult === 'W') { h.won++; a.lost++; } else if (homeResult === 'D') { h.drawn++; a.drawn++; } else { h.lost++; a.won++; }
        h.result = homeResult; a.result = awayResult;
      });
      let allTeams = s.teams.map(t => {
        const fin = weeklyFinances[t.id];
        const delta = teamStandingsDelta[t.id];
        let next = t;
        if (fin) next = { ...next, budget: next.budget + fin.gate + fin.merchandise - fin.wages, finances: { ...next.finances, gateReceipts: next.finances.gateReceipts + fin.gate, merchandise: next.finances.merchandise + fin.merchandise, wagesPaid: next.finances.wagesPaid + fin.wages } };
        if (delta) next = { ...next, played: next.played + delta.played, won: next.won + delta.won, drawn: next.drawn + delta.drawn, lost: next.lost + delta.lost, goalsFor: next.goalsFor + delta.goalsFor, goalsAgainst: next.goalsAgainst + delta.goalsAgainst, points: next.points + delta.points, playedHistory: [...next.playedHistory, delta.result].slice(-5) };
        return next;
      });
      let allPlayers = s.players.map(p => {
        let up = { ...p };
        // Find current team for staff bonuses
        const team = allTeams.find(t => t.id === p.clubId);
        const coach = team?.staff.find(st => st.role === 'COACH');
        const physio = team?.staff.find(st => st.role === 'PHYSIO');
        const coachRating = coach?.rating ?? 5;
        const physioRating = physio?.rating ?? 5;

        if (statsToUpdate[p.id]) {
          const m = statsToUpdate[p.id];
          up.fitness = Math.max(0, up.fitness - m.fitnessLoss);
          up.morale = Math.min(100, up.morale + (m.rating > 7 ? 5 : (m.rating < 6 ? -2 : 0)));
          
          // Update Recent Form (last 5)
          up.recentForm = [...(up.recentForm || []), m.rating].slice(-5);
          
          // Match Sharpness (Condition) gain
          up.condition = Math.min(100, up.condition + 15);

          const newAvg = parseFloat(((up.seasonStats.avgRating * up.seasonStats.apps + m.rating) / (up.seasonStats.apps + 1)).toFixed(2));
          const prevShots = up.seasonStats.shots ?? 0;
          const prevSOT = up.seasonStats.shotsOnTarget ?? 0;
          const prevCS = up.seasonStats.cleanSheets ?? 0;
          const prevMins = up.seasonStats.minutesPlayed ?? 0;
          up.seasonStats = {
            ...up.seasonStats,
            apps: up.seasonStats.apps + 1,
            goals: up.seasonStats.goals + m.goals,
            avgRating: newAvg,
            yellowCards: (up.seasonStats.yellowCards || 0) + m.yellowCards,
            redCards: (up.seasonStats.redCards || 0) + m.redCards,
            shots: prevShots + (m.shots ?? 0),
            shotsOnTarget: prevSOT + (m.shotsOnTarget ?? 0),
            cleanSheets: prevCS + (m.cleanSheets ?? 0),
            minutesPlayed: prevMins + (m.minutesPlayed ?? 90),
            manOfTheMatch: (up.seasonStats.manOfTheMatch ?? 0) + (momCounts[p.id] ?? 0),
          };
          if (newSuspensions.has(p.id)) { up.suspensionWeeks = 3; up.status = 'SUSPENDED'; }
        } else { 
          // Recovery: Baseline 12 + up to 10 from Physio
          const recovery = 12 + (physioRating);
          up.fitness = Math.min(100, up.fitness + recovery); 
          // Sharpness (Condition) decay if not playing: Baseline -7, mitigated by Coach
          const decay = Math.max(0, 10 - (coachRating / 2));
          up.condition = Math.max(0, up.condition - decay);
        }

        // Development Points Accumulation
        // Gain based on potential, professionalism, and coach quality
        const devGain = (up.attributes.potential / 25) * (coachRating / 10) * (up.attributes.professionalism / 20);
        up.developmentPoints = (up.developmentPoints || 0) + devGain;

        if (newInjuries[p.id]) { up.status = 'INJURED'; up.injury = { type: newInjuries[p.id].type, weeksRemaining: newInjuries[p.id].weeks }; }
        else if (up.injury) {
          const newWeeks = up.injury.weeksRemaining - 1;
          if (newWeeks <= 0) up.injury = null; else up.injury = { ...up.injury, weeksRemaining: newWeeks };
        }
        if (!newSuspensions.has(p.id) && up.suspensionWeeks > 0) up.suspensionWeeks = up.suspensionWeeks - 1;
        up.status = up.injury ? 'INJURED' : (up.suspensionWeeks > 0 ? 'SUSPENDED' : 'FIT');
        return up;
      });
      const nextBids: TransferOffer[] = [];
      const nextMessages = [...s.messages];
      const nextWeek = s.currentWeek + 1;
      
      // Update Stadium Expansion Progress
      let finalTeams = allTeams.map(t => {
        if (t.stadiumExpansion) {
          const nextExp = { ...t.stadiumExpansion, weeksRemaining: t.stadiumExpansion.weeksRemaining - 1 };
          if (nextExp.weeksRemaining <= 0) {
            nextMessages.unshift({ id: `stadium-${Date.now()}`, title: 'CONSTRUCTION COMPLETE', content: `The expansion of ${t.stadium} is finished. New capacity: ${nextExp.targetCapacity.toLocaleString()}.`, date: Date.now(), week: nextWeek, read: false, type: 'INFO' });
            return { ...t, stadiumCapacity: nextExp.targetCapacity, stadiumExpansion: null };
          }
          return { ...t, stadiumExpansion: nextExp };
        }
        return t;
      });

      // AI Transfer Market Logic (only during window)
      if (isTransferWindowOpen(s.currentWeek) && Math.random() < 0.15) {
        const seller = allTeams[Math.floor(Math.random() * allTeams.length)];
        const buyer = allTeams.find(t => t.id !== seller.id && t.division === seller.division);
        if (seller && buyer) {
          const sellerPlayers = allPlayers.filter(p => p.clubId === seller.id);
          const p = sellerPlayers[Math.floor(Math.random() * sellerPlayers.length)];
          if (p && buyer.budget >= p.value) {
            allPlayers = allPlayers.map(x => x.id === p.id ? { ...x, clubId: buyer.id } : x);
            nextMessages.unshift({ id: `ai-tr-${Date.now()}`, title: 'TRANSFER BOMBSHELL', content: '', date: Date.now(), week: nextWeek, read: false, type: 'TRANSFER', buyerId: buyer.id, sellerId: seller.id, playerName: p.name, transferValue: p.value });
          }
        }
      }

      // User Team Incoming Bids (only during window)
      if (s.userTeamId && isTransferWindowOpen(s.currentWeek) && Math.random() < 0.1) {
        const userPlayers = allPlayers.filter(p => p.clubId === s.userTeamId);
        const listedPlayers = userPlayers.filter(p => p.isListed);
        const target = listedPlayers.length > 0 ? listedPlayers[0] : userPlayers[Math.floor(Math.random() * userPlayers.length)];
        if (target) {
          const bidder = allTeams.filter(t => t.id !== s.userTeamId)[Math.floor(Math.random() * allTeams.length)];
          if (bidder) {
            const bidId = `bid-${Date.now()}`;
            nextBids.push({ id: bidId, playerId: target.id, fromTeamId: bidder.id, amount: Math.floor(target.value * 0.95) });
            nextMessages.unshift({ id: `msg-${bidId}`, title: 'TRANSFER OFFER', content: '', date: Date.now(), week: nextWeek, read: false, type: 'TRANSFER', bidId, fromTeamId: bidder.id, playerName: target.name, transferValue: target.value });
          }
        }
      }

      // Strip away all verbose fixture data now that stats have been accumulated.
      // We only keep the minimal fields needed for league table and match history display.
      const slimmedFixtures = s.fixtures.map(f => {
        // Only slim this week's played fixtures
        if (f.week !== s.currentWeek || !f.result) return f;
        return {
          ...f,
          result: {
            homeGoals: f.result.homeGoals,
            awayGoals: f.result.awayGoals,
            ...(f.result.homePens !== undefined && { homePens: f.result.homePens, awayPens: f.result.awayPens }),
            attendance: f.result.attendance,
            scorers: f.result.scorers,  // Needed for top scorer display
            cards: f.result.cards,       // Needed for suspension history display
            injuries: [],                // Already applied to players
            ratings: {},                 // Accumulated to seasonStats, no longer needed
            events: [],                  // Commentary already shown, discard
          }
        };
      });

      // Board Confidence & Sacking Logic
      let newConfidence = s.boardConfidence;
      let isFired = s.isFired;
      let nextJobMarket = [...s.jobMarket];
      const userTeam = allTeams.find(t => t.id === s.userTeamId);
      
      if (userTeam && s.currentWeek <= 38 && !s.isFired) {
        const standings = updateLeagueTable(allTeams, s.fixtures, userTeam.division);
        const currentRank = standings.findIndex(t => t.id === s.userTeamId) + 1;
        const delta = calculateBoardConfidenceDelta(currentRank, s.targetPosition);
        newConfidence = Math.max(0, Math.min(100, s.boardConfidence + delta));

        if (newConfidence <= 15) {
          isFired = true;
          nextJobMarket.push(userTeam.id); // Old job is now vacant
          nextMessages.unshift({
            id: `fired-${Date.now()}`,
            title: 'SACKED',
            content: `The board has lost patience with your performance. You have been relieved of your duties as manager of ${userTeam.name}.`,
            date: Date.now(),
            week: nextWeek,
            read: false,
            type: 'BOARD'
          });
          setTimeout(() => toast({ title: "SACKED", description: "You have been fired.", variant: "destructive" }), 0);
        }
      }

      // Dynamic Job Market Updates (AI Sackings)
      if (s.currentWeek % 4 === 0 || Math.random() < 0.1) {
        const allStandings = [1, 2, 3, 4].flatMap(div => updateLeagueTable(allTeams, s.fixtures, div));
        // Bottom teams might fire managers
        const candidates = allStandings.filter(t => t.id !== s.userTeamId && t.played >= 4 && t.points / t.played < 0.75 && Math.random() < 0.25);
        candidates.forEach(c => {
          if (!nextJobMarket.includes(c.id)) nextJobMarket.push(c.id);
        });
        // Occasionally clean up
        if (nextJobMarket.length > 6 && Math.random() < 0.3) {
          nextJobMarket.splice(Math.floor(Math.random() * nextJobMarket.length), 1);
        }
      }

      if (nextWeek > 38) {
        const summary = prepareSeasonSummary({ ...s, teams: allTeams, players: allPlayers });
        setTimeout(() => toast({ title: "SEASON COMPLETE" }), 0);
        return { ...s, currentWeek: nextWeek, teams: allTeams, players: allPlayers, fixtures: slimmedFixtures, isSeasonOver: true, seasonSummary: summary, messages: nextMessages, boardConfidence: newConfidence, isFired, jobMarket: nextJobMarket }; 
      }
      return { ...s, currentWeek: nextWeek, teams: allTeams, players: allPlayers, fixtures: slimmedFixtures, messages: nextMessages, boardConfidence: newConfidence, isFired, jobMarket: nextJobMarket, transferMarket: { ...s.transferMarket, incomingBids: [...s.transferMarket.incomingBids, ...nextBids] } };
    });
  }, [prepareSeasonSummary, toast]);


  const buyPlayer = useCallback((pId: string) => {
    setState(s => {
      if (!isTransferWindowOpen(s.currentWeek)) {
        setTimeout(() => toast({ title: "TRANSFER WINDOW CLOSED", description: "You can only sign players during active windows.", variant: "destructive" }), 0);
        return s;
      }
      const p = s.players.find(x => x.id === pId);
      if (!p || !s.userTeamId) return s;
      setTimeout(() => toast({ title: "TRANSFER COMPLETE", description: `Signed ${p.name}.` }), 0);
      return { ...s, teams: s.teams.map(t => t.id === s.userTeamId ? { ...t, budget: t.budget - p.value, weeklyWages: t.weeklyWages + p.wage } : t), players: s.players.map(x => x.id === pId ? { ...x, clubId: s.userTeamId } : x) };
    });
  }, [toast]);

  const hireStaff = useCallback((stId: string) => {
    setState(s => {
      const st = s.availableStaff.find(x => x.id === stId);
      if (!st || !s.userTeamId) return s;
      setTimeout(() => toast({ title: "STAFF APPOINTED", description: `${st.name} joined.` }), 0);
      return { ...s, teams: s.teams.map(t => t.id === s.userTeamId ? { ...t, staff: [...t.staff, st], weeklyWages: t.weeklyWages + st.wage } : t), availableStaff: s.availableStaff.filter(x => x.id !== stId) };
    });
  }, [toast]);

  const fireStaff = useCallback((stId: string) => {
    setState(s => {
      const t = s.teams.find(x => x.id === s.userTeamId);
      const st = t?.staff.find(x => x.id === stId);
      setTimeout(() => toast({ title: "STAFF DISMISSED", description: "Contract terminated." }), 0);
      return { ...s, teams: s.teams.map(x => x.id === s.userTeamId ? { ...x, staff: x.staff.filter(y => y.id !== stId), weeklyWages: x.weeklyWages - (st?.wage || 0) } : x) };
    });
  }, [toast]);

  const fastForwardSeason = useCallback(() => {
    setState(s => {
      const fixtures = [...s.fixtures];
      const teamsMap = new Map(s.teams.map(t => [t.id, { ...t }]));
      for (let week = s.currentWeek; week <= 38; week++) {
        const weekFixtures = fixtures.filter(f => f.week === week && !f.result);
        weekFixtures.forEach(f => {
          const homeTeam = teamsMap.get(f.homeTeamId)!;
          const awayTeam = teamsMap.get(f.awayTeamId)!;
          if (homeTeam.id !== s.userTeamId) homeTeam.lineup = getBestSquadForTeam(homeTeam, s.players).slice(0, 11);
          if (awayTeam.id !== s.userTeamId) awayTeam.lineup = getBestSquadForTeam(awayTeam, s.players).slice(0, 11);
          const hStarters = s.players.filter(p => p.clubId === f.homeTeamId && (homeTeam.lineup as (string | null)[]).slice(0, 11).includes(p.id));
          const aStarters = s.players.filter(p => p.clubId === f.awayTeamId && (awayTeam.lineup as (string | null)[]).slice(0, 11).includes(p.id));
          const result = simulateMatch(homeTeam, awayTeam, hStarters, aStarters, [], [], false, 1, null, (f.homeTeamId === s.userTeamId || f.awayTeamId === s.userTeamId) ? s.manager?.personality : undefined, s.enginePreset === 'arcade' ? ARCADE_ENGINE_CONFIG : undefined);
          const idx = fixtures.findIndex(x => x.id === f.id);
          if (idx >= 0) fixtures[idx] = { ...f, result };
        });
      }
      setTimeout(() => toast({ title: "Fast-forward complete", description: "All remaining fixtures simulated. Advance week to process results." }), 0);
      return { ...s, fixtures, teams: Array.from(teamsMap.values()), currentWeek: 38 };
    });
  }, [getBestSquadForTeam, toast]);

  const updateMidMatchResult = useCallback((fixtureId: string, currentMinute: number) => {
    setState(s => {
      const fIdx = s.fixtures.findIndex(f => f.id === fixtureId);
      const f = fIdx >= 0 ? s.fixtures[fIdx] : null;
      const existingResult = f?.result;
      if (fIdx === -1 || !f || !existingResult) return s;
      const homeTeam = s.teams.find(t => t.id === f.homeTeamId)!;
      const awayTeam = s.teams.find(t => t.id === f.awayTeamId)!;
      const homePlayers = s.players.filter(p => p.clubId === f.homeTeamId && homeTeam.lineup.slice(0, 11).includes(p.id));
      const awayPlayers = s.players.filter(p => p.clubId === f.awayTeamId && awayTeam.lineup.slice(0, 11).includes(p.id));
      const res = simulateRemainingMinutes(existingResult, currentMinute, homeTeam, awayTeam, homePlayers, awayPlayers, s.manager?.personality, s.enginePreset === 'arcade' ? ARCADE_ENGINE_CONFIG : undefined);
      const nextFixtures = [...s.fixtures];
      nextFixtures[fIdx] = { ...f, result: res };
      return { ...s, fixtures: nextFixtures };
    });
  }, []);

  const setEnginePreset = useCallback((preset: 'realistic' | 'arcade') => {
    setState(s => ({ ...s, enginePreset: preset }));
  }, []);

  const startMatch = useCallback((fixtureId: string) => {
    setState(s => ({ ...s, currentMatchFixtureId: fixtureId }));
  }, []);

  const clearCurrentMatch = useCallback(() => {
    setState(s => ({ ...s, currentMatchFixtureId: null }));
  }, []);

  const contextValue = useMemo(() => ({
    state, startGame, simulateWeek, advanceWeek,
    saveGame: () => {
      try {
        localStorage.setItem(STORAGE_KEY, compressedSave(state));
        const overrides = Object.fromEntries(state.teams.map(t => [t.id, t.name]));
        localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
        toast({ title: "SAVED" });
      } catch (e) {
        toast({ title: "Save failed", description: "Storage full or unavailable." });
      }
    },
    loadGame: () => {
      try {
        const sa = localStorage.getItem(STORAGE_KEY);
        if (!sa) return;
        const data = JSON.parse(sa);
        const teams = (data.teams || []).map((t: Team) => ({ ...t, isUserTeam: t.id === data.userTeamId }));
        setState({ ...data, isGameStarted: true, teams, enginePreset: data.enginePreset ?? 'realistic', currentMatchFixtureId: null });
      } catch (e) {
        toast({ title: "Save corrupted", description: "Could not load career." });
      }
    }, 
    setTactics: (f: string, s: PlayStyle) => setState(p => ({ ...p, teams: p.teams.map(t => t.id === p.userTeamId ? { ...t, formation: f, playStyle: s } : t) })),
    buyPlayer, sellPlayer: () => {}, 
    renewContract: (pId: string, yr: number, w: number) => setState(s => ({ ...s, players: s.players.map(x => x.id === pId ? { ...x, contractYears: yr, wage: w } : x) })), 
    toggleShortlist, toggleTransferList, 
    markMessageRead: (mId: string) => setState(s => ({ ...s, messages: s.messages.map(m => m.id === mId ? { ...m, read: true } : m) })), 
    hireStaff, fireStaff, 
    togglePlayerLineup, swapPlayers, addPlayerToSlot,
    clearLineup: () => setState(s => ({ ...s, teams: s.teams.map(t => t.id === s.userTeamId ? { ...t, lineup: Array(16).fill(null) } : t) })),
    autoPickLineup,
    applyForJob: (teamId: string) => {
      setState(s => {
        const team = s.teams.find(t => t.id === teamId);
        if (!team) return s;
        let targetPos = 10; let expectation = 'Finish in mid-table';
        if (team.division === 1) {
          if (team.reputation >= 85) { targetPos = 1; expectation = 'Win the Premier League'; }
          else if (team.reputation >= 75) { targetPos = 4; expectation = 'Qualify for Champions Cup'; }
          else { targetPos = 17; expectation = 'Avoid Relegation'; }
        } else {
          if (team.reputation >= 60) { targetPos = 3; expectation = 'Challenge for Promotion'; }
          else { targetPos = 12; expectation = 'Mid-table stability'; }
        }
        const nextMessages = [...s.messages];
        nextMessages.unshift({ id: `welcome-${Date.now()}`, title: 'WELCOME', content: `Welcome to ${team.name.toUpperCase()}. Our expectation is that you ${expectation.toLowerCase()}. Good luck.`, date: Date.now(), week: s.currentWeek, read: false, type: 'BOARD' });
        setTimeout(() => toast({ title: "NEW JOB", description: `You are now managing ${team.name}.` }), 0);
        return {
          ...s, userTeamId: teamId, boardConfidence: 75, boardExpectation: expectation, targetPosition: targetPos, isFired: false, messages: nextMessages, 
          jobMarket: s.jobMarket.filter(id => id !== teamId),
          teams: s.teams.map(t => t.isUserTeam ? { ...t, isUserTeam: false } : (t.id === teamId ? { ...t, isUserTeam: true } : t))
        };
      });
    }, 
    resetFired: () => setState(s => ({ ...s, isFired: false, isGameStarted: false })),
    quitToMainMenu: () => setState(s => ({ ...s, isGameStarted: false, currentMatchFixtureId: null })),
    setLastView: (view: LastView) => setState(s => ({ ...s, lastView: view })),
    acceptBid, rejectBid, updateMidMatchResult, 
    expandStadium: (tier: 'small' | 'medium' | 'large') => {
      setState(s => {
        const team = s.teams.find(t => t.id === s.userTeamId);
        if (!team || team.stadiumExpansion) return s;
        
        let cost = 0; let capacityIncrease = 0; let weeks = 0;
        if (tier === 'small') { cost = 2500000; capacityIncrease = 2000; weeks = 4; }
        else if (tier === 'medium') { cost = 7500000; capacityIncrease = 6000; weeks = 8; }
        else { cost = 20000000; capacityIncrease = 15000; weeks = 14; }

        if (team.budget < cost) {
          setTimeout(() => toast({ title: "INSUFFICIENT FUNDS", description: `You need ${formatMoney(cost)} for this project.` }), 0);
          return s;
        }

        const nextExpansion = { targetCapacity: team.stadiumCapacity + capacityIncrease, weeksRemaining: weeks, cost };
        setTimeout(() => toast({ title: "PROJECT STARTED", description: `Construction at ${team.stadium} has begun.` }), 0);

        return {
          ...s,
          teams: s.teams.map(t => t.id === s.userTeamId ? { ...t, budget: t.budget - cost, stadiumExpansion: nextExpansion } : t)
        };
      });
    },
    updateSeason: (yr: number) => setState(s => ({ ...s, season: yr })), updateTeamName: (id: string, n: string) => setState(s => ({ ...s, teams: s.teams.map(t => t.id === id ? { ...t, name: n } : t) })), fastForwardSeason, startNextSeason, setEnginePreset, startMatch, clearCurrentMatch
  }), [state, startGame, simulateWeek, advanceWeek, buyPlayer, toggleShortlist, toggleTransferList, hireStaff, fireStaff, acceptBid, rejectBid, updateMidMatchResult, fastForwardSeason, startNextSeason, setEnginePreset, startMatch, clearCurrentMatch, toast, togglePlayerLineup, swapPlayers, addPlayerToSlot, autoPickLineup]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame error');
  return context;
}
