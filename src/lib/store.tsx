
"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, Team, Player, Fixture, GameMessage, ManagerProfile, StaffMember, PlayStyle, TeamRecords, Position, Side, TransferOffer, ManagerPersonality, MatchEvent, SeasonSummaryData } from '@/types/game';
import { generateInitialData, generateFixtures, FIRSTNAME_POOL, SURNAME_POOL } from '@/lib/game-data';
import { simulateMatch, updateLeagueTable, getFormationRequirements } from '@/lib/game-engine';
import { useToast } from '@/hooks/use-toast';
import { formatMoney } from '@/lib/utils';

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
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEY = 'retro_manager_save_v1.9.3';
const OVERRIDES_KEY = 'retro_manager_team_overrides_v1.9.3';

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [state, setState] = useState<GameState>({
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
    records: { biggestWin: null, biggestLoss: null, transferPaid: null, transferReceived: null }
  });

  useEffect(() => {
    const { teams, players, fixtures, availableStaff, cupEntrants } = generateInitialData();
    let finalTeams = [...teams];
    if (typeof window !== 'undefined') {
      const overridesRaw = localStorage.getItem(OVERRIDES_KEY);
      if (overridesRaw) {
        try {
          const overrides = JSON.parse(overridesRaw);
          finalTeams = teams.map(t => overrides[t.id] ? { ...t, name: overrides[t.id] } : t);
        } catch (e) {}
      }
    }
    setState(s => ({ ...s, teams: finalTeams, players, fixtures, availableStaff, cupEntrants }));
  }, []);

  const getBestSquadForTeam = useCallback((team: Team, allPlayers: Player[]): string[] => {
    const healthyPlayers = allPlayers.filter(p => p.clubId === team.id && p.suspensionWeeks === 0 && p.status !== 'INJURED');
    const requirements = getFormationRequirements(team.formation);
    const sortedAvail = [...healthyPlayers].sort((a, b) => b.attributes.skill - a.attributes.skill);
    const picked: string[] = [];
    const used = new Set<string>();

    requirements.forEach(pos => {
      const bestMatch = sortedAvail.find(p => (
        (p.position === pos) || 
        (p.position === 'MF' && pos === 'FW') ||
        (p.position === 'DM' && (pos === 'DF' || pos === 'MF'))
      ) && !used.has(p.id));
      if (bestMatch) { picked.push(bestMatch.id); used.add(bestMatch.id); }
    });

    sortedAvail.forEach(p => { if (picked.length < 16 && !used.has(p.id)) { picked.push(p.id); used.add(p.id); } });
    return picked;
  }, []);

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

  const startGame = useCallback((name: string, teamId: string, personality: ManagerPersonality) => {
    const { teams, players, fixtures, availableStaff, cupEntrants } = generateInitialData();
    const teamsWithBestLineups = teams.map(t => ({ ...t, lineup: getBestSquadForTeam(t, players) }));
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
      messages: [{ id: 'welcome', title: 'BOARD WELCOME', content: `Welcome, ${name}. Our expectation is that you ${expectation.toLowerCase()}. Good luck.`, date: Date.now(), week: 1, read: false, type: 'BOARD' }]
    }));
  }, [getBestSquadForTeam]);

  const toggleShortlist = useCallback((pId: string) => {
    setState(s => ({ ...s, players: s.players.map(p => p.id === pId ? { ...p, isShortlisted: !p.isShortlisted } : p) }));
  }, []);

  const toggleTransferList = useCallback((pId: string) => {
    setState(s => ({ ...s, players: s.players.map(p => p.id === pId ? { ...p, isListed: !p.isListed } : p) }));
  }, []);

  const acceptBid = useCallback((bidId: string) => {
    setState(s => {
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

  const startNextSeason = useCallback(() => {
    setState(s => {
      const yr = s.season + 1;
      const upTeams = s.teams.map(t => ({ ...t, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, playedHistory: [] }));
      const upPlayers = s.players.map(p => ({ ...p, age: p.age + 1, seasonStats: { apps: 0, goals: 0, avgRating: 0, yellowCards: 0, redCards: 0 }, history: [...p.history, { season: s.season, apps: p.seasonStats.apps, goals: p.seasonStats.goals, avgRating: p.seasonStats.avgRating, goalsScored: p.seasonStats.goals, clubName: s.teams.find(t => t.id === p.clubId)?.name || 'Unknown' }] }));
      setTimeout(() => toast({ title: "NEW SEASON", description: `${yr} fixtures generated.` }), 0);
      return { ...s, currentWeek: 1, season: yr, teams: upTeams, players: upPlayers, fixtures: generateFixtures(upTeams, yr), isSeasonOver: false, seasonSummary: null };
    });
  }, [toast]);

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
        const hStarters = s.players.filter(p => hTeam.lineup.slice(0, 11).includes(p.id));
        const aStarters = s.players.filter(p => aTeam.lineup.slice(0, 11).includes(p.id));
        const result = simulateMatch(hTeam, aTeam, hStarters, aStarters, [], [], false, 1, null, (f.homeTeamId === s.userTeamId || f.awayTeamId === s.userTeamId) ? s.manager?.personality : undefined);
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
      const statsToUpdate: Record<string, { apps: number, goals: number, rating: number, fitnessLoss: number }> = {};
      const weeklyFinances: Record<string, { gate: number, merchandise: number, wages: number }> = {};
      s.teams.forEach(t => { weeklyFinances[t.id] = { gate: 0, merchandise: 5000 + (t.reputation * 100), wages: t.weeklyWages * (t.id === s.userTeamId && s.manager?.personality === 'Economist' ? 0.9 : 1.0) }; });
      currentWeekFixtures.forEach(f => {
        if (!f.result) return;
        const hTeam = s.teams.find(t => t.id === f.homeTeamId)!;
        weeklyFinances[hTeam.id].gate += f.result.attendance * (5 - hTeam.division) * 10;
        Object.keys(f.result.ratings).forEach(pid => { statsToUpdate[pid] = { apps: 1, goals: 0, rating: f.result!.ratings[pid] || 6.0, fitnessLoss: 15 + Math.floor(Math.random() * 10) }; });
        f.result.scorers.forEach(sc => { if (statsToUpdate[sc.playerId]) statsToUpdate[sc.playerId].goals++; });
      });
      let allTeams = s.teams.map(t => {
        const fin = weeklyFinances[t.id]; if (!fin) return t;
        return { ...t, budget: t.budget + fin.gate + fin.merchandise - fin.wages, finances: { ...t.finances, gateReceipts: t.finances.gateReceipts + fin.gate, merchandise: t.finances.merchandise + fin.merchandise, wagesPaid: t.finances.wagesPaid + fin.wages } };
      });
      let allPlayers = s.players.map(p => {
        let up = { ...p };
        if (statsToUpdate[p.id]) {
          const m = statsToUpdate[p.id];
          up.fitness = Math.max(0, up.fitness - m.fitnessLoss);
          up.morale = Math.min(100, up.morale + (m.rating > 7 ? 5 : -2));
          const newAvg = parseFloat(((up.seasonStats.avgRating * up.seasonStats.apps + m.rating) / (up.seasonStats.apps + 1)).toFixed(2));
          up.seasonStats = { ...up.seasonStats, apps: up.seasonStats.apps + 1, goals: up.seasonStats.goals + m.goals, avgRating: newAvg };
        } else { up.fitness = Math.min(100, up.fitness + 15); }
        return up;
      });
      const nextBids: TransferOffer[] = [];
      const nextMessages = [...s.messages];
      const nextWeek = s.currentWeek + 1;
      
      // AI to AI Transfers
      if (Math.random() < 0.15) {
        const seller = allTeams[Math.floor(Math.random() * allTeams.length)];
        const buyer = allTeams.find(t => t.id !== seller.id && t.division === seller.division);
        if (seller && buyer) {
          const sellerPlayers = allPlayers.filter(p => p.clubId === seller.id);
          const p = sellerPlayers[Math.floor(Math.random() * sellerPlayers.length)];
          if (p && buyer.budget >= p.value) {
            allPlayers = allPlayers.map(x => x.id === p.id ? { ...x, clubId: buyer.id } : x);
            nextMessages.unshift({ id: `ai-tr-${Date.now()}`, title: 'TRANSFER BOMBSHELL', content: `${buyer.name} have completed the signing of ${p.name} from ${seller.name} for a fee of ${formatMoney(p.value)}.`, date: Date.now(), week: nextWeek, read: false, type: 'TRANSFER' });
          }
        }
      }

      // User Team Incoming Bids
      if (s.userTeamId && Math.random() < 0.1) {
        const userPlayers = allPlayers.filter(p => p.clubId === s.userTeamId);
        const listedPlayers = userPlayers.filter(p => p.isListed);
        const target = listedPlayers.length > 0 ? listedPlayers[0] : userPlayers[Math.floor(Math.random() * userPlayers.length)];
        if (target) {
          const bidder = allTeams.filter(t => t.id !== s.userTeamId)[Math.floor(Math.random() * allTeams.length)];
          if (bidder) {
            const bidId = `bid-${Date.now()}`;
            nextBids.push({ id: bidId, playerId: target.id, fromTeamId: bidder.id, amount: Math.floor(target.value * 0.95) });
            nextMessages.unshift({ id: `msg-${bidId}`, title: 'TRANSFER OFFER', content: `${bidder.name} have submitted an official bid of ${formatMoney(target.value)} for ${target.name}.`, date: Date.now(), week: nextWeek, read: false, type: 'TRANSFER', bidId });
          }
        }
      }

      if (nextWeek > 38) {
        const summary = prepareSeasonSummary({ ...s, teams: allTeams, players: allPlayers });
        setTimeout(() => toast({ title: "SEASON COMPLETE" }), 0);
        return { ...s, currentWeek: nextWeek, teams: allTeams, players: allPlayers, isSeasonOver: true, seasonSummary: summary, messages: nextMessages }; 
      }
      return { ...s, currentWeek: nextWeek, teams: allTeams, players: allPlayers, messages: nextMessages, transferMarket: { ...s.transferMarket, incomingBids: [...s.transferMarket.incomingBids, ...nextBids] } };
    });
  }, [prepareSeasonSummary, toast]);

  const buyPlayer = useCallback((pId: string) => {
    setState(s => {
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

  const contextValue = useMemo(() => ({
    state, startGame, simulateWeek, advanceWeek, 
    saveGame: () => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); toast({ title: "SAVED" }); }, 
    loadGame: () => { const sa = localStorage.getItem(STORAGE_KEY); if (sa) setState({ ...JSON.parse(sa), isGameStarted: true }); }, 
    setTactics: (f: string, s: PlayStyle) => setState(p => ({ ...p, teams: p.teams.map(t => t.id === p.userTeamId ? { ...t, formation: f, playStyle: s } : t) })),
    buyPlayer, sellPlayer: () => {}, 
    renewContract: (pId: string, yr: number, w: number) => setState(s => ({ ...s, players: s.players.map(x => x.id === pId ? { ...x, contractYears: yr, wage: w } : x) })), 
    toggleShortlist, toggleTransferList, 
    markMessageRead: (mId: string) => setState(s => ({ ...s, messages: s.messages.map(m => m.id === mId ? { ...m, read: true } : m) })), 
    hireStaff, fireStaff, 
    togglePlayerLineup: (pId: string) => setState(s => { const t = s.teams.find(x => x.id === s.userTeamId); if (!t) return s; const isS = t.lineup.includes(pId); const l = isS ? t.lineup.filter(x => x !== pId) : (t.lineup.length < 16 ? [...t.lineup, pId] : t.lineup); return { ...s, teams: s.teams.map(x => x.id === t.id ? { ...x, lineup: l } : x) }; }),
    swapPlayers: (p1: string, p2: string) => setState(s => { const t = s.teams.find(x => x.id === s.userTeamId); if (!t) return s; let l = [...t.lineup]; const i1 = l.indexOf(p1); const i2 = l.indexOf(p2); if (i1 !== -1 && i2 !== -1) { l[i1] = p2; l[i2] = p1; } else if (i1 !== -1) { l[i1] = p2; } return { ...s, teams: s.teams.map(x => x.id === t.id ? { ...x, lineup: l } : x) }; }), 
    clearLineup: () => setState(s => ({ ...s, teams: s.teams.map(t => t.id === s.userTeamId ? { ...t, lineup: [] } : t) })), 
    autoPickLineup: () => setState(s => { const t = s.teams.find(x => x.id === s.userTeamId); return { ...s, teams: s.teams.map(x => x.id === t?.id ? { ...x, lineup: getBestSquadForTeam(x, s.players) } : x) }; }),
    applyForJob: () => {}, resetFired: () => setState(s => ({ ...s, isFired: false, isGameStarted: false })), 
    acceptBid, rejectBid, updateMidMatchResult: () => {}, 
    updateSeason: (yr: number) => setState(s => ({ ...s, season: yr })), updateTeamName: (id: string, n: string) => setState(s => ({ ...s, teams: s.teams.map(t => t.id === id ? { ...t, name: n } : t) })), fastForwardSeason: () => {}, startNextSeason
  }), [state, startGame, simulateWeek, advanceWeek, buyPlayer, toggleShortlist, toggleTransferList, hireStaff, fireStaff, acceptBid, rejectBid, startNextSeason, toast, getBestSquadForTeam]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame error');
  return context;
}
