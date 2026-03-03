"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, Team, Player, Fixture, GameMessage, ManagerProfile, StaffMember, PlayStyle, TeamRecords, Position, Side, TransferOffer, ManagerPersonality, MatchEvent, SeasonSummaryData } from '@/types/game';
import { generateInitialData, generateFixtures, FIRSTNAME_POOL, SURNAME_POOL } from '@/lib/game-data';
import { simulateMatch, updateLeagueTable, getFormationRequirements, simulateRemainingMinutes } from '@/lib/game-engine';
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

const INITIAL_RECORDS: TeamRecords = {
  biggestWin: null,
  biggestLoss: null,
  transferPaid: null,
  transferReceived: null
};

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
    records: INITIAL_RECORDS
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
        } catch (e) {
          console.error("Failed to parse global team overrides", e);
        }
      }
    }

    setState(s => ({ ...s, teams: finalTeams, players, fixtures, availableStaff, cupEntrants }));
  }, []);

  const getBest11ForTeam = useCallback((team: Team, allPlayers: Player[], userTeamId: string | null): string[] => {
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
      
      if (bestMatch) {
        picked.push(bestMatch.id);
        used.add(bestMatch.id);
      }
    });

    sortedAvail.forEach(p => {
      if (picked.length < 11 && !used.has(p.id)) {
        picked.push(p.id);
        used.add(p.id);
      }
    });

    return picked;
  }, []);

  const prepareSeasonSummary = useCallback((currentState: GameState): SeasonSummaryData => {
    const standingsByDiv = [1, 2, 3, 4].map(div => updateLeagueTable(currentState.teams, currentState.fixtures, div));
    const userTeam = currentState.userTeamId ? currentState.teams.find(t => t.id === currentState.userTeamId) : null;
    
    let userPos = 0;
    let userTarget = 0;
    let targetDivision = 1;

    if (userTeam) {
      targetDivision = userTeam.division;
      const userDivStanding = standingsByDiv[userTeam.division - 1];
      if (userDivStanding) {
        userPos = userDivStanding.findIndex(t => t.id === currentState.userTeamId) + 1;
      }
      userTarget = currentState.targetPosition;
    }

    const divPlayers = currentState.players.filter(p => {
      const team = currentState.teams.find(t => t.id === p.clubId);
      return team?.division === targetDivision;
    });

    const topScorerPlayer = [...divPlayers].sort((a, b) => (b.seasonStats.goals || 0) - (a.seasonStats.goals || 0))[0];
    const bestRatedPlayer = [...divPlayers].filter(p => p.seasonStats.apps > 5).sort((a, b) => (b.seasonStats.avgRating || 0) - (a.seasonStats.avgRating || 0))[0];

    const summary: SeasonSummaryData = {
      season: currentState.season,
      champions: {
        1: standingsByDiv[0][0]?.name || 'N/A',
        2: standingsByDiv[1][0]?.name || 'N/A',
        3: standingsByDiv[2][0]?.name || 'N/A',
        4: standingsByDiv[3][0]?.name || 'N/A',
      },
      promoted: {
        2: [standingsByDiv[1][0]?.name, standingsByDiv[1][1]?.name, standingsByDiv[1][2]?.name].filter(Boolean) as string[],
        3: [standingsByDiv[2][0]?.name, standingsByDiv[2][1]?.name, standingsByDiv[2][2]?.name].filter(Boolean) as string[],
        4: [standingsByDiv[3][0]?.name, standingsByDiv[3][1]?.name].filter(Boolean) as string[],
      },
      relegated: {
        1: [standingsByDiv[0][19]?.name, standingsByDiv[0][18]?.name, standingsByDiv[0][17]?.name].filter(Boolean) as string[],
        2: [standingsByDiv[1][19]?.name, standingsByDiv[1][18]?.name, standingsByDiv[1][17]?.name].filter(Boolean) as string[],
        3: [standingsByDiv[2][19]?.name, standingsByDiv[2][18]?.name].filter(Boolean) as string[],
      },
      userPos,
      userTarget,
      topScorer: topScorerPlayer ? { name: topScorerPlayer.name, goals: topScorerPlayer.seasonStats.goals, team: currentState.teams.find(t => t.id === topScorerPlayer.clubId)?.name || 'Unknown' } : null,
      bestPlayer: bestRatedPlayer ? { name: bestRatedPlayer.name, rating: bestRatedPlayer.seasonStats.avgRating, team: currentState.teams.find(t => t.id === bestRatedPlayer.clubId)?.name || 'Unknown' } : null
    };

    return summary;
  }, []);

  const startGame = useCallback((name: string, teamId: string, personality: ManagerPersonality) => {
    const { teams, players, fixtures, availableStaff, cupEntrants } = generateInitialData();
    
    let finalTeams = [...teams];
    if (typeof window !== 'undefined') {
      const overridesRaw = localStorage.getItem(OVERRIDES_KEY);
      if (overridesRaw) {
        try {
          const overrides = JSON.parse(overridesRaw);
          finalTeams = teams.map(t => overrides[t.id] ? { ...t, name: overrides[t.id] } : t);
        } catch (e) { console.error(e); }
      }
    }

    const teamsWithBestLineups = finalTeams.map(t => ({
      ...t, lineup: getBest11ForTeam(t, players, null)
    }));

    const team = teamsWithBestLineups.find(t => t.id === teamId);
    let targetPos = 10; let expectation = 'Finish in mid-table';
    if (team) {
      if (team.division === 1) {
        if (team.reputation >= 85) { targetPos = 1; expectation = 'Win the Premier League'; }
        else if (team.reputation >= 75) { targetPos = 4; expectation = 'Qualify for Champions Cup'; }
        else if (team.reputation >= 65) { targetPos = 10; expectation = 'Mid-table finish'; }
        else { targetPos = 17; expectation = 'Avoid Relegation'; }
      } else {
        if (team.reputation >= 60) { targetPos = 3; expectation = 'Challenge for Promotion'; }
        else { targetPos = 12; expectation = 'Mid-table stability'; }
      }
    }
    const startingRep = personality === 'Celebrity' ? 25 : 10;
    const startingConfidence = personality === 'Celebrity' ? 55 : 75;

    setState(s => ({
      ...s, currentWeek: 1, season: 1993, userTeamId: teamId, teams: teamsWithBestLineups, players, fixtures, availableStaff, cupEntrants,
      manager: { name, personality, reputation: startingRep, seasonsManaged: 0, trophies: [], winPercentage: 0, totalGames: 0, totalWins: 0 },
      isGameStarted: true, isFired: false, isSeasonOver: false, boardConfidence: startingConfidence, boardExpectation: expectation, targetPosition: targetPos,
      records: INITIAL_RECORDS, messages: [{ id: 'welcome', title: 'BOARD WELCOME', content: `Welcome, ${name}. Our expectation is that you ${expectation.toLowerCase()}. Good luck.`, date: Date.now(), week: 1, read: false, type: 'BOARD' }]
    }));
  }, [getBest11ForTeam]);

  const simulateWeek = useCallback(() => {
    setState(s => {
      const currentWeekFixtures = s.fixtures.filter(f => f.week === s.currentWeek && !f.result);
      if (currentWeekFixtures.length === 0) return s;
      
      const updatedFixtures = [...s.fixtures];
      const updatedTeamsMap = new Map(s.teams.map(t => [t.id, { ...t }]));

      currentWeekFixtures.forEach(f => {
        const homeTeam = updatedTeamsMap.get(f.homeTeamId)!;
        const awayTeam = updatedTeamsMap.get(f.awayTeamId)!;
        
        if (homeTeam.id !== s.userTeamId) homeTeam.lineup = getBest11ForTeam(homeTeam, s.players, s.userTeamId);
        if (awayTeam.id !== s.userTeamId) awayTeam.lineup = getBest11ForTeam(awayTeam, s.players, s.userTeamId);
        
        const homeStarters = s.players.filter(p => homeTeam.lineup.includes(p.id));
        const awayStarters = s.players.filter(p => awayTeam.lineup.includes(p.id));

        const result = simulateMatch(
          homeTeam, awayTeam, homeStarters, awayStarters, [], [], f.competition === 'CUP', 1, null, 
          (f.homeTeamId === s.userTeamId || f.awayTeamId === s.userTeamId) ? s.manager?.personality : undefined
        );
        const fIdx = updatedFixtures.findIndex(uf => uf.id === f.id);
        updatedFixtures[fIdx] = { ...f, result };
      });

      return { ...s, fixtures: updatedFixtures, teams: Array.from(updatedTeamsMap.values()) };
    });
  }, [state.userTeamId, state.manager?.personality, getBest11ForTeam]);

  const advanceWeek = useCallback(() => {
    let seasonJustEnded = false;
    let summaryForState = null;

    setState(s => {
      if (s.currentWeek > 38) return s;
      
      const currentWeekFixtures = s.fixtures.filter(f => f.week === s.currentWeek);
      const statsToUpdate: Record<string, { apps: number, goals: number, rating: number, yellows: number, reds: number, fitnessLoss: number }> = {};
      const newInjuries: Record<string, { type: string, weeks: number }> = {};
      
      const weeklyFinances: Record<string, { gate: number, merchandise: number, wages: number }> = {};
      s.teams.forEach(t => {
        const wageMod = (t.id === s.userTeamId && s.manager?.personality === 'Economist') ? 0.9 : 1.0;
        weeklyFinances[t.id] = { gate: 0, merchandise: 5000 + (t.reputation * 100), wages: t.weeklyWages * wageMod };
      });

      currentWeekFixtures.forEach(f => {
        if (!f.result) return;
        const homeTeam = s.teams.find(t => t.id === f.homeTeamId)!;
        const ticketPrice = (5 - homeTeam.division) * 10;
        const gateIncome = f.result.attendance * ticketPrice;
        if (weeklyFinances[homeTeam.id]) weeklyFinances[homeTeam.id].gate += gateIncome;

        Object.keys(f.result.ratings).forEach(pid => {
          const matchRating = f.result!.ratings[pid] || 6.0;
          statsToUpdate[pid] = { apps: 1, goals: 0, rating: matchRating, yellows: 0, reds: 0, fitnessLoss: 15 + Math.floor(Math.random() * 10) }; 
        });
        f.result.scorers.forEach(sc => { if (statsToUpdate[sc.playerId]) statsToUpdate[sc.playerId].goals++; });
        f.result.cards.forEach(c => {
          if (statsToUpdate[c.playerId]) {
            if (c.type === 'YELLOW') statsToUpdate[c.playerId].yellows++;
            else statsToUpdate[c.playerId].reds++;
          }
        });
        f.result.injuries.forEach(inj => { newInjuries[inj.playerId] = { type: inj.type, weeks: inj.weeks }; });
      });

      let allUpdatedTeams: Team[] = [];
      [1, 2, 3, 4].forEach(div => {
        const divResults = updateLeagueTable(s.teams, s.fixtures, div);
        allUpdatedTeams = [...allUpdatedTeams, ...divResults];
      });

      allUpdatedTeams = allUpdatedTeams.map(t => {
        const fin = weeklyFinances[t.id];
        if (!fin) return t;
        return { ...t, budget: Math.floor(t.budget + fin.gate + fin.merchandise - fin.wages), finances: { ...t.finances, gateReceipts: Math.floor(t.finances.gateReceipts + fin.gate), merchandise: Math.floor(t.finances.merchandise + fin.merchandise), wagesPaid: Math.floor(t.finances.wagesPaid + fin.wages) } };
      });

      let allPlayers = s.players.map(p => {
        let updatedPlayer = { ...p };
        const team = allUpdatedTeams.find(t => t.id === p.clubId);
        const physio = team?.staff.find(st => st.role === 'PHYSIO');

        if (statsToUpdate[p.id]) {
          const m = statsToUpdate[p.id];
          updatedPlayer.fitness = Math.max(0, updatedPlayer.fitness - m.fitnessLoss);
          const moraleMod = (p.clubId === s.userTeamId && s.manager?.personality === 'Motivator') ? 8 : 5;
          updatedPlayer.morale = Math.min(100, updatedPlayer.morale + (m.rating > 7 ? moraleMod : -2));
          const oldApps = p.seasonStats.apps;
          const oldAvg = p.seasonStats.avgRating;
          const newAvg = parseFloat(((oldAvg * oldApps + m.rating) / (oldApps + 1)).toFixed(2));
          updatedPlayer.seasonStats = { ...p.seasonStats, apps: oldApps + 1, goals: p.seasonStats.goals + m.goals, avgRating: newAvg, yellowCards: (p.seasonStats.yellowCards || 0) + m.yellows, redCards: (p.seasonStats.redCards || 0) + m.reds };
          if (m.reds > 0) { updatedPlayer.suspensionWeeks = 3; updatedPlayer.status = 'SUSPENDED'; }
        } else {
          const recoveryRate = physio ? 15 + (physio.rating / 2) : 10;
          updatedPlayer.fitness = Math.min(100, updatedPlayer.fitness + recoveryRate);
          updatedPlayer.morale = Math.max(0, updatedPlayer.morale - 1);
        }
        if (updatedPlayer.injury) {
          const newWeeks = updatedPlayer.injury.weeksRemaining - 1;
          if (newWeeks <= 0) { updatedPlayer.injury = null; updatedPlayer.status = 'FIT'; }
          else updatedPlayer.injury = { ...updatedPlayer.injury, weeksRemaining: newWeeks };
        }
        if (newInjuries[p.id]) { updatedPlayer.status = 'INJURED'; updatedPlayer.injury = { type: newInjuries[p.id].type, weeksRemaining: newInjuries[p.id].weeks }; }
        if (updatedPlayer.suspensionWeeks > 0) { updatedPlayer.suspensionWeeks--; if (updatedPlayer.suspensionWeeks === 0) updatedPlayer.status = 'FIT'; }
        return updatedPlayer;
      });

      const nextBids: TransferOffer[] = [];
      const nextMessages = [...s.messages];
      const nextWeek = s.currentWeek + 1;
      
      // User Team Bid Generation (Realistic spasming frequency)
      if (s.userTeamId) {
        const userPlayers = allPlayers.filter(p => p.clubId === s.userTeamId);
        userPlayers.forEach(p => {
          const baseChance = p.isListed ? 0.20 : 0.02;
          if (Math.random() < baseChance) {
            const otherTeams = allUpdatedTeams.filter(t => t.id !== s.userTeamId);
            const bidder = otherTeams[Math.floor(Math.random() * otherTeams.length)];
            const bidAmount = Math.floor(p.value * (0.8 + Math.random() * 0.5));
            const bidId = `bid-${Date.now()}-${p.id}`;
            nextBids.push({ id: bidId, playerId: p.id, fromTeamId: bidder.id, amount: bidAmount });
            nextMessages.unshift({ 
              id: `msg-${bidId}`, 
              title: 'TRANSFER OFFER RECEIVED', 
              content: `${bidder.name} have submitted an official bid of ${formatMoney(bidAmount)} for ${p.name}.`, 
              date: Date.now(), 
              week: nextWeek,
              read: false, 
              type: 'TRANSFER', 
              bidId 
            });
          }
        });
      }

      // AI-to-AI Transfer Simulation (10% chance per week)
      if (Math.random() < 0.10) {
        const aiTeams = allUpdatedTeams.filter(t => t.id !== s.userTeamId);
        if (aiTeams.length >= 2) {
          const buyer = aiTeams[Math.floor(Math.random() * aiTeams.length)];
          const seller = aiTeams.filter(t => t.id !== buyer.id)[Math.floor(Math.random() * (aiTeams.length - 1))];
          const sellerPlayers = allPlayers.filter(p => p.clubId === seller.id);
          const target = sellerPlayers[Math.floor(Math.random() * sellerPlayers.length)];
          
          if (target && buyer.budget >= target.value) {
            allPlayers = allPlayers.map(p => p.id === target.id ? { ...p, clubId: buyer.id, isListed: false } : p);
            allUpdatedTeams = allUpdatedTeams.map(t => {
              if (t.id === buyer.id) return { ...t, budget: t.budget - target.value, weeklyWages: t.weeklyWages + target.wage };
              if (t.id === seller.id) return { ...t, budget: t.budget + target.value, weeklyWages: t.weeklyWages - target.wage };
              return t;
            });
            nextMessages.unshift({
              id: `ai-trans-${Date.now()}`,
              title: 'TRANSFER NEWS: AI DEAL',
              content: `${buyer.name} have completed the signing of ${target.name} from ${seller.name} for ${formatMoney(target.value)}.`,
              date: Date.now(),
              week: nextWeek,
              read: false,
              type: 'TRANSFER'
            });
          }
        }
      }

      // Dynamic News Story Generation
      if (Math.random() < 0.3) {
        const randomTeam = allUpdatedTeams[Math.floor(Math.random() * allUpdatedTeams.length)];
        const newsTypes = ['STREAK', 'INJURY', 'CLASH', 'FINANCE'];
        const type = newsTypes[Math.floor(Math.random() * newsTypes.length)];
        
        let newsTitle = '';
        let newsContent = '';

        switch(type) {
          case 'STREAK':
            const isWinning = Math.random() > 0.5;
            newsTitle = isWinning ? 'UNSTOPPABLE FORM' : 'CRISIS AT THE CLUB';
            newsContent = isWinning 
              ? `${randomTeam.name} are flying high after a string of impressive results. Fans are dreaming of glory.`
              : `${randomTeam.name} are struggling to find form. The board is reportedly losing patience with recent results.`;
            break;
          case 'INJURY':
            const star = allPlayers.find(p => p.clubId === randomTeam.id && p.attributes.skill > 12);
            if (star) {
              newsTitle = 'STAR PLAYER SIDELINED';
              newsContent = `Disaster for ${randomTeam.name} as star player ${star.name} is reported to be carrying a knock.`;
            }
            break;
          case 'CLASH':
            newsTitle = 'BIG MATCH PREVIEW';
            newsContent = `All eyes are on the upcoming clash between ${randomTeam.name} and their rivals this weekend.`;
            break;
          case 'FINANCE':
            newsTitle = 'FINANCIAL REPORT';
            newsContent = `${randomTeam.name} have reported ${Math.random() > 0.5 ? 'healthy profits' : 'growing concerns'} in their latest annual fiscal review.`;
            break;
        }

        if (newsTitle) {
          nextMessages.unshift({
            id: `news-${Date.now()}`,
            title: newsTitle,
            content: newsContent,
            date: Date.now(),
            week: nextWeek,
            read: false,
            type: 'INFO'
          });
        }
      }

      const isSeasonOver = nextWeek > 38;
      let seasonSummary = null;

      if (isSeasonOver) {
        seasonSummary = prepareSeasonSummary({ ...s, teams: allUpdatedTeams, players: allPlayers });
        seasonJustEnded = true;
        summaryForState = seasonSummary;
      }

      return { 
        ...s, currentWeek: nextWeek, teams: allUpdatedTeams, players: allPlayers,
        messages: nextMessages, isSeasonOver, seasonSummary,
        transferMarket: { ...s.transferMarket, incomingBids: [...s.transferMarket.incomingBids, ...nextBids] }
      };
    });

    if (seasonJustEnded) {
      toast({ title: "SEASON COMPLETE", description: "The campaign has concluded. View the wrap-up report." });
    }
  }, [prepareSeasonSummary, state.userTeamId, state.manager?.personality, toast]);

  const acceptBid = useCallback((bidId: string) => {
    let soldName = '';
    let amount = 0;
    
    setState(s => {
      const bid = s.transferMarket.incomingBids.find(b => b.id === bidId);
      if (!bid || !s.userTeamId) return s;
      const player = s.players.find(p => p.id === bid.playerId);
      if (!player) return s;
      
      soldName = player.name;
      amount = bid.amount;
      
      const nextTeams = s.teams.map(t => t.id === s.userTeamId ? { ...t, budget: t.budget + bid.amount, weeklyWages: t.weeklyWages - player.wage } : t);
      const nextPlayers = s.players.map(p => p.id === player.id ? { ...p, clubId: bid.fromTeamId, isShortlisted: false, isListed: false } : p);
      const nextBids = s.transferMarket.incomingBids.filter(b => b.id !== bidId);
      return { ...s, teams: nextTeams, players: nextPlayers, transferMarket: { ...s.transferMarket, incomingBids: nextBids } };
    });
    
    if (soldName) {
      toast({ title: "TRANSFER ACCEPTED", description: `${soldName} has left for ${formatMoney(amount)}.` });
    }
  }, [toast]);

  const rejectBid = useCallback((bidId: string) => {
    setState(s => ({ ...s, transferMarket: { ...s.transferMarket, incomingBids: s.transferMarket.incomingBids.filter(b => b.id !== bidId) } }));
    toast({ title: "BID REJECTED", description: "Transfer proposal declined." });
  }, [toast]);

  const updateMidMatchResult = useCallback((fixtureId: string, currentMinute: number) => {
    setState(s => {
      const fIdx = s.fixtures.findIndex(f => f.id === fixtureId);
      if (fIdx === -1 || !s.fixtures[fIdx].result) return s;
      const f = s.fixtures[fIdx];
      const res = simulateRemainingMinutes(f.result, currentMinute, s.teams.find(t => t.id === f.homeTeamId)!, s.teams.find(t => t.id === f.awayTeamId)!, s.players.filter(p => p.clubId === f.homeTeamId && s.teams.find(t => t.id === f.homeTeamId)!.lineup.includes(p.id)), s.players.filter(p => p.clubId === f.awayTeamId && s.teams.find(t => t.id === f.awayTeamId)!.lineup.includes(p.id)));
      const nextF = [...s.fixtures]; nextF[fIdx] = { ...f, result: res };
      return { ...s, fixtures: nextF };
    });
  }, []);

  const fastForwardSeason = useCallback(() => {
    setState(s => {
      const nextFixtures = s.fixtures.map(f => {
        if (f.result) return f;
        const hGoals = Math.floor(Math.random() * 4);
        const aGoals = Math.floor(Math.random() * 3);
        const homePlayers = s.players.filter(p => p.clubId === f.homeTeamId).slice(0, 11);
        const awayPlayers = s.players.filter(p => p.clubId === f.awayTeamId).slice(0, 11);
        const ratings: Record<string, number> = {};
        [...homePlayers, ...awayPlayers].forEach(p => { ratings[p.id] = 6.0 + Math.random(); });
        return {
          ...f, result: { homeGoals: hGoals, awayGoals: aGoals, attendance: 15000, events: [{ minute: 45, type: 'COMMENTARY' as const, text: 'The referee blows for half time.' }], ratings, scorers: [], cards: [], injuries: [] }
        };
      });
      const updatedState = { ...s, fixtures: nextFixtures, currentWeek: 38 };
      const summary = prepareSeasonSummary(updatedState);
      return { ...updatedState, isSeasonOver: true, seasonSummary: summary };
    });
    toast({ title: "SIMULATION COMPLETE", description: "Season skipped to Week 38." });
  }, [prepareSeasonSummary, toast]);

  const saveGame = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      toast({ title: "GAME SAVED", description: `Progress saved successfully.` });
    }
  }, [state, toast]);

  const loadGame = useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { 
        const parsed = JSON.parse(saved);
        setState({ ...parsed, isGameStarted: true });
        toast({ title: "GAME LOADED", description: "Career progress restored." }); 
      }
    }
  }, [toast]);

  const buyPlayer = useCallback((pId: string) => {
    const p = state.players.find(x => x.id === pId);
    const team = state.teams.find(t => t.id === state.userTeamId);
    if (!p || !team || team.budget < p.value) return;
    
    setState(s => {
      const nextTeams = s.teams.map(t => t.id === team.id ? { ...t, budget: t.budget - p.value, weeklyWages: t.weeklyWages + p.wage } : t);
      const nextPlayers = s.players.map(x => x.id === pId ? { ...x, clubId: team.id, isShortlisted: false } : x);
      return { ...s, teams: nextTeams, players: nextPlayers };
    });
    toast({ title: "TRANSFER COMPLETE", description: `Signed ${p.name}.` });
  }, [state.players, state.teams, state.userTeamId, toast]);

  const renewContract = useCallback((pId: string, yrs: number, wage: number) => {
    const p = state.players.find(x => x.id === pId);
    const team = state.teams.find(t => t.id === state.userTeamId);
    if (!p || !team) return;
    
    setState(s => {
      const nextPlayers = s.players.map(x => x.id === pId ? { ...x, contractYears: yrs, wage: wage } : x);
      const nextTeams = s.teams.map(t => t.id === team.id ? { ...t, weeklyWages: t.weeklyWages - p.wage + wage } : t);
      return { ...s, players: nextPlayers, teams: nextTeams };
    });
    toast({ title: "CONTRACT SIGNED", description: `${p.name} extended for ${yrs} years.` });
  }, [state.players, state.teams, state.userTeamId, toast]);

  const hireStaff = useCallback((stId: string) => {
    const staff = state.availableStaff.find(x => x.id === stId);
    const team = state.teams.find(t => t.id === state.userTeamId);
    if (!staff || !team) return;
    
    setState(s => {
      const nextTeams = s.teams.map(t => t.id === team.id ? { ...t, staff: [...t.staff, staff], weeklyWages: t.weeklyWages + staff.wage } : t);
      const nextAvail = s.availableStaff.filter(x => x.id !== stId);
      return { ...s, teams: nextTeams, availableStaff: nextAvail };
    });
    toast({ title: "STAFF APPOINTED", description: `${staff.name} joined as ${staff.role}.` });
  }, [state.availableStaff, state.teams, state.userTeamId, toast]);

  const fireStaff = useCallback((stId: string) => {
    const team = state.teams.find(t => t.id === state.userTeamId);
    if (!team) return;
    const staff = team.staff.find(x => x.id === stId);
    
    setState(s => {
      const nextTeams = s.teams.map(t => t.id === team.id ? { ...t, staff: t.staff.filter(x => x.id !== stId), weeklyWages: t.weeklyWages - (staff?.wage || 0) } : t);
      return { ...s, teams: nextTeams };
    });
    toast({ title: "STAFF DISMISSED", description: "Contract terminated." });
  }, [state.teams, state.userTeamId, toast]);

  const togglePlayerLineup = useCallback((pId: string) => {
    setState(s => {
      const team = s.teams.find(t => t.id === s.userTeamId);
      if (!team) return s;
      const isSelected = team.lineup.includes(pId);
      const lineup = isSelected ? team.lineup.filter(x => x !== pId) : (team.lineup.length < 11 ? [...team.lineup, pId] : team.lineup);
      return { ...s, teams: s.teams.map(t => t.id === team.id ? { ...t, lineup } : t) };
    });
  }, []);

  const swapPlayers = useCallback((p1Id: string, p2Id: string) => {
    const team = state.teams.find(t => t.id === state.userTeamId);
    if (!team) return;

    const p1In = team.lineup.includes(p1Id);
    const p2In = team.lineup.includes(p2Id);

    setState(s => {
      const team = s.teams.find(t => t.id === state.userTeamId);
      if (!team) return s;
      let lineup = [...team.lineup];
      const p1Idx = lineup.indexOf(p1Id);
      const p2Idx = lineup.indexOf(p2Id);

      if (p1Idx !== -1 && p2Idx !== -1) {
        lineup[p1Idx] = p2Id;
        lineup[p2Idx] = p1Id;
      } else if (p2Idx !== -1) {
        lineup[p2Idx] = p1Id;
      } else if (p1Idx !== -1) {
        lineup[p1Idx] = p2Id;
      }
      return { ...s, teams: s.teams.map(t => t.id === team.id ? { ...t, lineup } : t) };
    });

    if (p1In && p2In) {
      toast({ title: "POSITIONAL SWAP", description: "Players exchanged positions." });
    } else {
      toast({ title: "SUBSTITUTION", description: "Player brought into lineup." });
    }
  }, [state.teams, state.userTeamId, toast]);

  const autoPickLineup = useCallback(() => {
    setState(s => {
      const team = s.teams.find(t => t.id === s.userTeamId);
      if (!team) return s;
      const lineup = getBest11ForTeam(team, s.players, null);
      return { ...s, teams: s.teams.map(t => t.id === team.id ? { ...t, lineup } : t) };
    });
    toast({ title: "AUTO-SELECT", description: "The strongest 11 have been picked." });
  }, [getBest11ForTeam, toast]);

  const toggleShortlist = useCallback((pId: string) => {
    setState(s => ({ ...s, players: s.players.map(p => p.id === pId ? { ...p, isShortlisted: !p.isShortlisted } : p) }));
  }, []);

  const toggleTransferList = useCallback((pId: string) => {
    setState(s => {
      const isListed = s.players.find(p => p.id === pId)?.isListed;
      const nextPlayers = s.players.map(p => p.id === pId ? { ...p, isListed: !p.isListed } : p);
      const nextListed = !isListed 
        ? [...s.transferMarket.listed, pId] 
        : s.transferMarket.listed.filter(id => id !== pId);
      
      return { ...s, players: nextPlayers, transferMarket: { ...s.transferMarket, listed: nextListed } };
    });
    toast({ title: "MARKET STATUS UPDATED", description: "Transfer listing preference changed." });
  }, [toast]);

  const updateTeamName = useCallback((tId: string, name: string) => {
    setState(s => {
      const nextTeams = s.teams.map(t => t.id === tId ? { ...t, name } : t);
      if (typeof window !== 'undefined') {
        const overrides = JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}');
        overrides[tId] = name; localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
      }
      return { ...s, teams: nextTeams };
    });
    toast({ title: "DATABASE UPDATED", description: "Global team name saved." });
  }, [toast]);

  const startNextSeason = useCallback(() => {
    setState(s => {
      if (!s.seasonSummary) return s;
      const nextSeasonYear = s.season + 1;

      const updatedTeams = s.teams.map(t => ({
        ...t,
        played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, playedHistory: []
      }));

      const updatedPlayers = s.players.map(p => {
        const team = updatedTeams.find(t => t.id === p.clubId);
        return {
          ...p,
          age: p.age + 1,
          seasonStats: { apps: 0, goals: 0, avgRating: 0, yellowCards: 0, redCards: 0 },
          history: [...p.history, {
            season: s.season,
            apps: p.seasonStats.apps,
            goals: p.seasonStats.goals,
            avgRating: p.seasonStats.avgRating,
            goalsScored: p.seasonStats.goals,
            clubName: team?.name || 'Unknown'
          }]
        };
      });

      const nextFixtures = generateFixtures(updatedTeams, nextSeasonYear);

      return {
        ...s,
        currentWeek: 1,
        season: nextSeasonYear,
        teams: updatedTeams,
        players: updatedPlayers,
        fixtures: nextFixtures,
        isSeasonOver: false,
        seasonSummary: null,
        messages: [{
          id: `season-${nextSeasonYear}`,
          title: `SEASON ${nextSeasonYear} COMMENCES`,
          content: `Welcome to the new campaign. The board expects you to reach the target of ${s.targetPosition}th.`,
          date: Date.now(),
          week: 1,
          read: false,
          type: 'SEASON' as const
        }, ...s.messages]
      };
    });
    toast({ title: "NEW SEASON STARTED", description: "All standings reset. Good luck!" });
  }, [toast]);

  const contextValue = useMemo(() => ({
    state, startGame, simulateWeek, advanceWeek, saveGame, loadGame, setTactics: (f: string, s: PlayStyle) => setState(prev => ({ ...prev, teams: prev.teams.map(t => t.id === prev.userTeamId ? { ...t, formation: f, playStyle: s } : t) })),
    buyPlayer, sellPlayer: () => {}, renewContract, toggleShortlist, toggleTransferList, markMessageRead: (mId: string) => setState(s => ({ ...s, messages: s.messages.map(m => m.id === mId ? { ...m, read: true } : m) })),
    hireStaff, fireStaff, togglePlayerLineup, swapPlayers, clearLineup: () => setState(s => ({ ...s, teams: s.teams.map(t => t.id === s.userTeamId ? { ...t, lineup: [] } : t) })),
    autoPickLineup, applyForJob: () => {}, resetFired: () => setState(s => ({ ...s, isFired: false, isGameStarted: false })), 
    acceptBid, rejectBid,
    updateMidMatchResult, updateSeason: (y: number) => setState(s => ({ ...s, season: y })), updateTeamName, fastForwardSeason,
    startNextSeason
  }), [state, startGame, simulateWeek, advanceWeek, saveGame, loadGame, buyPlayer, renewContract, toggleShortlist, toggleTransferList, hireStaff, fireStaff, togglePlayerLineup, swapPlayers, updateMidMatchResult, updateTeamName, fastForwardSeason, startNextSeason, acceptBid, rejectBid]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
