"use client"

import { useState, useEffect, useMemo } from 'react';
import { Fixture, Team, Player, MatchEvent, PlayStyle } from '@/types/game';
import { Button } from '@/components/ui/button';
import { useGame } from '@/lib/store';
import { getZoneStrength } from '@/lib/game-engine';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipPortal } from '@/components/ui/tooltip';
import { SquadList } from './SquadList';
import { TacticsPitch } from './TacticsPitch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pause, UserCircle, Briefcase, LayoutDashboard, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isColorClash } from '@/lib/color-utils';
import { PlayerProfile } from './PlayerProfile';
import { MatchOverlayTemplate } from './MatchOverlayTemplate';
import { MatchPlayView } from './MatchPlayView';

export function MatchSim({ fixture, homeTeam, awayTeam, onFinish }: { 
  fixture: Fixture, 
  homeTeam: Team, 
  awayTeam: Team,
  onFinish: () => void 
}) {
  const { state, swapPlayers, setTactics, simulateWeek, updateMidMatchResult } = useGame();
  const [currentMinute, setCurrentMinute] = useState(0);
  const [showLineups, setShowLineups] = useState(true);
  const [activeAlert, setActiveAlert] = useState<MatchEvent | null>(null);
  const [activeEvent, setActiveEvent] = useState<MatchEvent | null>({ minute: 0, type: 'COMMENTARY', text: "THE TEAMS ARE COMING OUT..." });
  const [isFinished, setIsFinished] = useState(false);
  const [isHalfTime, setIsHalfTime] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGoalPaused, setIsGoalPaused] = useState(false);
  const [pausedForInjury, setPausedForInjury] = useState(false);
  const [pausedForRedCard, setPausedForRedCard] = useState(false);
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const [homeTeamTalk, setHomeTeamTalk] = useState<'ENCOURAGE' | 'CALM' | 'AGGRESSIVE' | null>(null);
  
  const stadiumOverlay = PlaceHolderImages.find(img => img.id === 'match-action-overlay')?.imageUrl;
  
  useEffect(() => {
    if (!fixture.result) {
      simulateWeek();
    }
  }, [fixture.result, simulateWeek]);

  const homeLineup = state.players.filter(p => homeTeam.lineup.slice(0, 11).includes(p.id));
  const awayLineup = state.players.filter(p => awayTeam.lineup.slice(0, 11).includes(p.id));
  const isUserHome = homeTeam.id === state.userTeamId;
  const activeUserTeam = isUserHome ? homeTeam : awayTeam;
  const userPlayers = state.players.filter(p => p.clubId === activeUserTeam.id);

  const { awayKitBg, awayKitText } = useMemo(() => {
    const useAwayKit = isColorClash(homeTeam.color, awayTeam.color);
    return {
      awayKitBg: useAwayKit ? awayTeam.awayColor : awayTeam.color,
      awayKitText: useAwayKit ? (awayTeam.awayTextColor ?? '#ffffff') : (awayTeam.homeTextColor ?? '#ffffff'),
    };
  }, [homeTeam.color, awayTeam.color, awayTeam.awayColor, awayTeam.awayTextColor, awayTeam.homeTextColor]);
  const awayKitColor = awayKitBg;

  const TICK_SPEED_BASE = 700;
  const tickSpeed = TICK_SPEED_BASE / playbackSpeed;

  useEffect(() => {
    if (showLineups || !fixture.result || isHalfTime || isFinished || isPaused || isGoalPaused) return;
    const timer = setInterval(() => {
      setCurrentMinute(prev => {
        const nextMin = prev + 1;
        if (nextMin === 45 && !isHalfTime && prev < 45) { 
          setIsHalfTime(true); 
          setActiveEvent({ minute: 45, type: 'COMMENTARY', text: "HALF TIME. THE MANAGER IS HEADING TO THE DRESSING ROOM..." }); 
          return 45; 
        }
        if (nextMin >= 90) { 
          setIsFinished(true); 
          setActiveEvent({ minute: 90, type: 'COMMENTARY', text: "FULL TIME! THAT'S IT." }); 
          return 90; 
        }
        const minuteEvent = fixture.result!.events.find(e => e.minute === nextMin);
        if (minuteEvent) {
          setActiveEvent(minuteEvent);
          if (minuteEvent.type === 'GOAL') { setIsGoalPaused(true); setActiveAlert(minuteEvent); }
          if (minuteEvent.type === 'RED') {
            setIsGoalPaused(true);
            setActiveAlert(minuteEvent);
            // Auto-open tactics if it's the USER's player who got sent off
            if (minuteEvent.teamId === activeUserTeam.id) {
              setTimeout(() => {
                setPausedForRedCard(true);
                setIsPaused(true);
              }, 2500);
            }
          }
          if (minuteEvent.type === 'INJURY') { setPausedForInjury(true); setIsPaused(true); setActiveAlert(minuteEvent); }
        }
        return nextMin;
      });
    }, tickSpeed);
    return () => clearInterval(timer); 
  }, [fixture.result, isHalfTime, isFinished, isPaused, isGoalPaused, showLineups, tickSpeed]);

  useEffect(() => {
    if (!activeAlert) return;
    const duration = activeAlert.type === 'GOAL' ? 3000 : 4000;
    const timer = setTimeout(() => {
      setActiveAlert(null);
      if (activeAlert.type !== 'INJURY') setIsGoalPaused(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  const handleResume = () => { setIsPaused(false); setSwapSourceId(null); setPausedForInjury(false); setPausedForRedCard(false); };
  
  const handleTeamTalk = (talk: 'ENCOURAGE' | 'CALM' | 'AGGRESSIVE') => {
    setHomeTeamTalk(talk);
    setIsHalfTime(false);
    
    let text = "";
    if (talk === 'ENCOURAGE') text = "ENCOURAGING WORDS. THE LADS LOOK INSPIRED!";
    else if (talk === 'AGGRESSIVE') text = "THE HAIRDRYER TREATMENT! THEY'RE FLYING OUT OF THE TUNNEL.";
    else text = "CALM AND COLLECTED. TACTICAL ADJUSTMENTS MADE.";
    
    setActiveEvent({ minute: 45, type: 'COMMENTARY', text });
  };

  const handleFlashResult = () => {
    updateMidMatchResult(fixture.id, currentMinute);
    setCurrentMinute(90);
    setIsFinished(true);
    setActiveEvent({ minute: 90, type: 'COMMENTARY', text: "FULL TIME! (MATCH FLASHED)" });
  };
  const handleSwapInteraction = (pId: string) => {
    if (!swapSourceId) {
      setSwapSourceId(pId);
    } else {
      if (swapSourceId === pId) {
        setSwapSourceId(null);
      } else {
        // Record substitution as a local event for the feed
        if (fixture.result) {
          const subEvent: MatchEvent = {
            minute: currentMinute,
            type: 'SUB',
            playerId: swapSourceId, // Off
            subPlayerId: pId,      // On
            teamId: activeUserTeam.id,
            text: `SUBSTITUTION: ${getPlayerName(swapSourceId)} OFF, ${getPlayerName(pId)} ON`
          };
          fixture.result.events.push(subEvent);
          setActiveEvent(subEvent);
        }
        
        swapPlayers(swapSourceId, pId);
        setSwapSourceId(null);
      }
    }
  };
  

  const currentHomeGoals = fixture.result?.scorers.filter(s => homeLineup.some(p => p.id === s.playerId) && s.minute <= currentMinute).length || 0;
  const currentAwayGoals = fixture.result?.scorers.filter(s => awayLineup.some(p => p.id === s.playerId) && s.minute <= currentMinute).length || 0;
  const rawHomeShots = fixture.result ? Math.floor((fixture.result.homeShots ?? fixture.result.homeChances ?? 0) * (currentMinute / 90)) : 0;
  const rawAwayShots = fixture.result ? Math.floor((fixture.result.awayShots ?? fixture.result.awayChances ?? 0) * (currentMinute / 90)) : 0;
  const homeShots = Math.max(currentHomeGoals, rawHomeShots);
  const awayShots = Math.max(currentAwayGoals, rawAwayShots);

  const zones = useMemo(() => {
    const rawZones = {
      home: {
        DEF: getZoneStrength(homeLineup, homeTeam, 'DEF', homeTeam.isUserTeam ? state.manager?.personality : undefined), 
        MID: getZoneStrength(homeLineup, homeTeam, 'MID', homeTeam.isUserTeam ? state.manager?.personality : undefined), 
        ATT: getZoneStrength(homeLineup, homeTeam, 'ATT', homeTeam.isUserTeam ? state.manager?.personality : undefined)
      },
      away: {
        DEF: getZoneStrength(awayLineup, awayTeam, 'DEF', awayTeam.isUserTeam ? state.manager?.personality : undefined), 
        MID: getZoneStrength(awayLineup, awayTeam, 'MID', awayTeam.isUserTeam ? state.manager?.personality : undefined), 
        ATT: getZoneStrength(awayLineup, awayTeam, 'ATT', awayTeam.isUserTeam ? state.manager?.personality : undefined)
      }
    };

    // Apply Team Talk Modifiers (Mental Buffs)
    let homeMod = 1.0;
    if (currentMinute > 45 && homeTeamTalk) {
      if (homeTeamTalk === 'ENCOURAGE') homeMod = 1.05;
      else if (homeTeamTalk === 'AGGRESSIVE') homeMod = 1.08;
      else homeMod = 1.03;
    }

    return {
      home: { 
        DEF: Math.round(rawZones.home.DEF * homeMod), 
        MID: Math.round(rawZones.home.MID * homeMod), 
        ATT: Math.round(rawZones.home.ATT * homeMod) 
      },
      away: { 
        DEF: rawZones.away.DEF, 
        MID: rawZones.away.MID, 
        ATT: rawZones.away.ATT 
      }
    };
  }, [homeLineup, awayLineup, homeTeam, awayTeam, state.manager?.personality, currentMinute, homeTeamTalk]);

  const possession = (zones.home.MID / (zones.home.MID + zones.away.MID || 1)) * 100;

  const manOfTheMatch = useMemo<{ player: Player; rating: number } | null>(() => {
    if (!fixture.result?.ratings || Object.keys(fixture.result.ratings).length === 0) return null;
    const allLineup = [...homeLineup, ...awayLineup];
    let best: { player: Player; rating: number } | null = null;
    allLineup.forEach(p => {
      const r = fixture.result!.ratings[p.id];
      if (r != null && (best === null || r > best!.rating)) best = { player: p, rating: r };
    });
    return best;
  }, [fixture.result, homeLineup, awayLineup]);

  const commentaryColor = activeEvent?.teamId === homeTeam.id
    ? homeTeam.color
    : activeEvent?.teamId === awayTeam.id
      ? awayKitColor
      : 'hsl(var(--accent))';

  const getPlayerName = (id: string) => state.players.find(p => p.id === id)?.name ?? 'Unknown';

  const TeamLineupTable = ({ teamPlayers, compact }: { teamPlayers: Player[], compact?: boolean }) => (
    <div className={cn(
      'overflow-auto border border-white/10 rounded-lg sm:rounded-xl bg-black/70',
      compact ? 'min-h-0 max-h-full' : 'max-h-[45vh] min-h-[200px] max-md:max-h-[55vh] max-md:min-h-[120px]'
    )}>
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-primary/40 bg-primary/25">
            <TableHead className={cn('uppercase font-black text-white tracking-wide w-12', compact ? 'text-xs max-[1300px]:text-[16px] py-1 max-[1300px]:py-2' : 'text-[12px] max-md:text-[10px] py-3 max-md:py-1.5')}>Pos</TableHead>
            <TableHead className={cn('uppercase font-black text-white tracking-wide', compact ? 'text-xs max-[1300px]:text-[16px] py-1 max-[1300px]:py-2' : 'text-[12px] max-md:text-[10px] py-3 max-md:py-1.5')}>Player</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamPlayers.map(p => (
            <TableRow key={p.id} className="border-b border-white/5 hover:bg-white/5">
              <TableCell className={cn('font-black text-cyan uppercase', compact ? 'py-1 max-[1300px]:py-2 text-[10px] sm:text-[12px] max-[1300px]:text-[16px]' : 'py-2 max-md:py-1 text-xs max-md:text-[10px]')}>{p.position}</TableCell>
              <TableCell className={cn('font-bold uppercase truncate', compact ? 'py-1 max-[1300px]:py-2 text-xs sm:text-sm max-[1300px]:text-[18px] max-w-[80px] sm:max-w-[120px] max-[1300px]:max-w-[200px]' : 'py-2 max-md:py-1 text-xs max-md:text-[10px] max-w-[120px]')}>{p.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const SummaryRatings = ({ teamPlayers, teamRatings, compact }: { teamPlayers: Player[], teamRatings: Record<string, number> | undefined; compact?: boolean }) => (
    <div className={cn(
      'overflow-auto border border-white/10 rounded-lg sm:rounded-xl bg-black/70',
      compact ? 'min-h-0 max-h-full' : 'max-h-[45vh] min-h-[200px] max-md:max-h-[55vh] max-md:min-h-[120px]'
    )}>
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-primary/40 bg-primary/25">
            <TableHead className={cn('uppercase font-black text-white tracking-wide', compact ? 'text-xs max-[1300px]:text-[16px] py-2 max-[1300px]:py-4' : 'text-[12px] max-md:text-[10px] py-3 max-md:py-1.5')}>Player</TableHead>
            <TableHead className={cn('text-right uppercase font-black text-white tracking-wide', compact ? 'text-xs max-[1300px]:text-[16px] py-2 max-[1300px]:py-4' : 'text-[12px] max-md:text-[10px] py-3 max-md:py-1.5')}>Rating</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamPlayers.map(p => (
            <TableRow key={p.id} className="border-b border-white/5 hover:bg-white/5">
              <TableCell className={cn('font-bold uppercase truncate', compact ? 'py-1.5 max-[1300px]:py-3 text-xs sm:text-sm max-[1300px]:text-[18px] max-w-[80px] sm:max-w-[120px] max-[1300px]:max-w-[200px]' : 'py-2 max-md:py-1 text-xs max-md:text-[10px] max-w-[120px]')}>{p.name}</TableCell>
              <TableCell className={cn('text-right font-mono font-black text-accent', compact ? 'py-1.5 max-[1300px]:py-3 text-xs sm:text-sm max-[1300px]:text-[18px]' : 'py-2 max-md:py-1 text-xs max-md:text-[10px]')}>{teamRatings?.[p.id]?.toFixed(1) || '6.0'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const BenchList = () => {
    const benchPlayers = userPlayers.filter(p => activeUserTeam.lineup.slice(11, 16).includes(p.id));
    return (
      <div className="bg-black/70 border border-primary/20 rounded-lg overflow-hidden shadow-2xl h-full flex flex-col">
        <div className="bg-primary/40 px-3 py-1.5 border-b border-primary/20 flex justify-between items-center shrink-0">
          <span className="text-[11px] font-black text-primary uppercase">Substitute Bench</span>
          <span className="text-[9px] font-black text-primary/90">{benchPlayers.length}/5</span>
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          <Table>
            <TableBody>
              {benchPlayers.map(p => (
                <TableRow 
                  key={p.id} 
                  onClick={() => handleSwapInteraction(p.id)}
                  className={cn(
                    "border-b border-white/5 hover:bg-primary/10 cursor-pointer transition-all",
                    swapSourceId === p.id ? "bg-accent/20 ring-2 ring-accent ring-inset" : ""
                  )}
                >
                  <TableCell className="py-2 px-3 max-[1300px]:py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] max-[1300px]:text-[18px] font-black text-white uppercase truncate">{p.name}</span>
                      <span className="text-[9px] max-[1300px]:text-[14px] font-mono text-cyan uppercase">{p.position} ({p.side}) • SKL: {p.attributes.skill}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2 px-3 max-[1300px]:py-4">
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn("text-[12px] max-[1300px]:text-[16px] font-black", p.fitness < 80 ? "text-red-500" : "text-accent")}>{p.fitness}% FIT</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] max-[1300px]:text-[14px] font-black text-white/80 uppercase">RTG:</span>
                        <span className="text-[12px] max-[1300px]:text-[18px] font-mono font-black text-white">{fixture.result?.ratings[p.id]?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {benchPlayers.length === 0 && (
                <TableRow><TableCell colSpan={2} className="text-center py-6 text-white/60 uppercase font-black italic text-[10px]">No substitutes selected</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  const goalBannerTeamId = activeAlert?.type === 'GOAL' ? activeAlert.teamId : null;
  const goalBannerColor = goalBannerTeamId === homeTeam.id ? homeTeam.color : goalBannerTeamId === awayTeam.id ? awayKitColor : undefined;
  const goalScorerName = activeAlert?.type === 'GOAL' && activeAlert.playerId ? state.players.find(p => p.id === activeAlert.playerId)?.name : null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-1 md:p-2 font-mono z-[100] backdrop-blur-sm">
      <div className="max-w-screen-2xl w-full max-h-[95vh] bg-black border-4 border-white/10 relative overflow-hidden flex flex-col shadow-2xl rounded-xl min-h-[85vh]">
        <div className="absolute inset-0 opacity-25 pointer-events-none mix-blend-overlay bg-cover bg-center" style={{ backgroundImage: stadiumOverlay ? `url("${stadiumOverlay}")` : 'none' }} />

        {activeAlert?.type === 'GOAL' && (
          <div className="absolute inset-x-0 top-0 z-[300] flex items-center justify-center py-4 px-4 max-[1300px]:py-10 animate-in zoom-in duration-200" role="alert">
            <div className="w-full max-w-2xl max-[1300px]:max-w-4xl rounded-2xl border-4 border-white/60 shadow-[0_0_40px_rgba(255,255,255,0.3)] py-5 px-6 max-[1300px]:py-10 max-[1300px]:px-12 text-center animate-pulse" style={{ backgroundColor: goalBannerColor ?? 'var(--accent)', color: goalBannerTeamId === homeTeam.id ? (homeTeam.homeTextColor ?? '#fff') : goalBannerTeamId === awayTeam.id ? awayKitText : '#fff' }}>
              <div className="text-[11px] sm:text-[12px] max-[1300px]:text-[20px] font-black uppercase tracking-[0.4em] opacity-90">Goal</div>
              <div className="text-2xl sm:text-4xl max-[1300px]:text-6xl font-black uppercase tracking-tight mt-0.5">{activeAlert.minute}&apos; · {goalScorerName ?? 'Unknown'}</div>
            </div>
          </div>
        )}

        {showLineups && (
          <MatchOverlayTemplate
            title="Lineups"
            zIndex="z-[600]"
            className="bg-black/98 animate-in fade-in duration-500"
            primaryButton={{ label: 'KICK OFF MATCH', onClick: () => setShowLineups(false) }}
            secondaryButton={{ label: 'Tactical Setup', onClick: () => setIsPaused(true) }}
          >
            <div className="flex flex-col gap-1 sm:gap-2 flex-1 min-h-0 overflow-auto">
              <div className="shrink-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center mb-2 max-[1300px]:mb-4">
                <span className="text-xs sm:text-sm md:text-base font-black text-white/90 uppercase truncate max-w-[40vw] sm:max-w-none px-4 py-1.5 sm:px-6 sm:py-2 border-b-4 border-white/30" style={{ backgroundColor: homeTeam.color, color: homeTeam.homeTextColor ?? '#ffffff' }}>{homeTeam.name}</span>
                <div className="text-xl sm:text-3xl md:text-4xl font-black text-accent tracking-tighter italic px-2">VS</div>
                <span className="text-xs sm:text-sm md:text-base font-black text-white/90 uppercase truncate max-w-[40vw] sm:max-w-none px-4 py-1.5 sm:px-6 sm:py-2 border-b-4 border-white/30" style={{ backgroundColor: awayKitColor, color: awayKitText }}>{awayTeam.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-4 max-[1300px]:gap-6 py-1 sm:py-2 flex-1 min-h-0 overflow-hidden text-sm max-[1300px]:text-[18px]">
                <TeamLineupTable teamPlayers={homeLineup} compact />
                <TeamLineupTable teamPlayers={awayLineup} compact />
              </div>
            </div>
          </MatchOverlayTemplate>
        )}

        {isPaused && (
          <div className="absolute inset-0 z-[400] bg-black/98 backdrop-blur-2xl flex flex-col p-2 sm:p-3 overflow-hidden animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-2 border-b-2 border-primary pb-2 shrink-0">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="bg-primary/50 p-1.5 border border-primary/40 rounded-md"><Briefcase size={20} className="text-primary" /></div>
                  <h3 className="text-lg sm:text-xl font-black text-primary uppercase tracking-tighter italic">Tactical Command Center</h3>
                </div>
                {pausedForInjury && (
                  <p className="text-[11px] sm:text-[12px] font-black text-amber-400 uppercase tracking-wide">A player was injured — make a substitution below if needed, then Apply &amp; Resume</p>
                )}
                {pausedForRedCard && (
                  <p className="text-[11px] sm:text-[12px] font-black text-red-400 uppercase tracking-wide">⚠ Player sent off — adjust your tactics below, then Apply &amp; Resume</p>
                )}
              </div>
              <Button onClick={handleResume} className="bg-accent text-accent-foreground retro-button h-9 sm:h-10 px-6 sm:px-8 text-sm font-black uppercase shadow-xl hover:scale-105 transition-all shrink-0">Apply & Resume</Button>
            </div>
            
            <Tabs defaultValue="pitch" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-3 bg-black/70 h-10 sm:h-11 max-[1300px]:h-20 mb-2 border border-primary/20 rounded-lg gap-1 p-1 shadow-inner shrink-0">
                <TabsTrigger value="pitch" className="uppercase font-black tracking-widest text-[12px] sm:text-[13px] max-[1300px]:text-[20px] data-[state=active]:bg-primary py-2"><LayoutDashboard size={16} className="mr-1.5 max-[1300px]:w-6 max-[1300px]:h-6" /> Tactics</TabsTrigger>
                <TabsTrigger value="strategy" className="uppercase font-black tracking-widest text-[12px] sm:text-[13px] max-[1300px]:text-[20px] data-[state=active]:bg-primary py-2"><Swords size={16} className="mr-1.5 max-[1300px]:w-6 max-[1300px]:h-6" /> Strategy</TabsTrigger>
                <TabsTrigger value="personnel" className="uppercase font-black tracking-widest text-[12px] sm:text-[13px] max-[1300px]:text-[20px] data-[state=active]:bg-primary py-2"><UserCircle size={16} className="mr-1.5 max-[1300px]:w-6 max-[1300px]:h-6" /> Personnel</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden min-h-0">
                <TabsContent value="pitch" className="m-0 h-full p-1.5 sm:p-2 overflow-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 min-h-full items-start">
                    <div className="bg-black/60 p-2 sm:p-3 border border-primary/20 rounded-xl shadow-inner h-full flex items-center justify-center min-h-[40vh] sm:min-h-[420px]">
                      <TacticsPitch 
                        team={activeUserTeam} 
                        players={userPlayers} 
                        onPlayerClick={(p) => handleSwapInteraction(p.id)} 
                        onPlayerProfile={(p) => setViewingPlayer(p)} 
                        activeSwapId={swapSourceId}
                        matchCards={fixture.result?.cards.filter(c => c.minute <= currentMinute)}
                        matchInjuries={fixture.result?.injuries}
                      />
                    </div>
                    <BenchList />
                  </div>
                </TabsContent>

                <TabsContent value="strategy" className="m-0 h-full overflow-auto p-2 sm:p-3">
                  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-card/20 border-2 border-primary/20 p-4 rounded-xl shadow-xl">
                      <h4 className="text-[14px] font-black text-primary mb-3 uppercase border-b-2 border-primary/10 pb-1.5 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Change Formation
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-5-1'].map(f => (
                          <Button 
                            key={f} 
                            onClick={() => setTactics(f, activeUserTeam.playStyle)} 
                            className={cn(
                              "h-10 text-base font-black rounded-lg transition-all", 
                              activeUserTeam.formation === f ? "bg-accent text-accent-foreground border-accent shadow-[0_0_15px_rgba(38,217,117,0.3)]" : "bg-black/70 text-white border-primary/20 hover:bg-primary/10"
                            )}
                          >
                            {f}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-card/20 border-2 border-primary/20 p-4 rounded-xl shadow-xl">
                      <h4 className="text-[14px] font-black text-primary mb-3 uppercase border-b-2 border-primary/10 pb-1.5 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" /> Team Mentality
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {(['Long Ball', 'Pass to Feet', 'Counter-Attack', 'Tiki-Taka', 'Direct', 'Park the Bus'] as PlayStyle[]).map(s => (
                          <Button 
                            key={s} 
                            onClick={() => setTactics(activeUserTeam.formation, s)} 
                            className={cn(
                              "h-10 text-[12px] font-black uppercase rounded-lg transition-all leading-tight text-center", 
                              activeUserTeam.playStyle === s ? "bg-accent text-accent-foreground border-accent shadow-[0_0_15px_rgba(38,217,117,0.3)]" : "bg-black/70 text-white border-primary/20 hover:bg-primary/10"
                            )}
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="personnel" className="m-0 h-full overflow-auto">
                  <div className="bg-black/60 border border-primary/20 p-2 sm:p-3 rounded-xl h-full shadow-inner">
                    <SquadList 
                      players={userPlayers} 
                      currentMatchRatings={fixture.result?.ratings} 
                      onPlayerSwap={handleSwapInteraction} 
                      activeSwapId={swapSourceId}
                      hideReserves={true}
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        <MatchPlayView 
          fixture={fixture}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          awayKitColor={awayKitColor}
          awayKitText={awayKitText}
          currentMinute={currentMinute}
          currentHomeGoals={currentHomeGoals}
          currentAwayGoals={currentAwayGoals}
          homeShots={homeShots}
          awayShots={awayShots}
          possession={50 + (zones.home.MID - (zones.away.MID || 0)) / 2}
          zones={zones}
          activeEventText={activeEvent?.text || ""}
          commentaryColor={activeEvent?.teamId === homeTeam.id ? homeTeam.color : (activeEvent?.teamId === awayTeam.id ? awayKitColor : "#ffffff")}
          playbackSpeed={playbackSpeed}
          onSpeedToggle={() => setPlaybackSpeed(s => s === 1 ? 2 : 1)}
          onPause={() => setIsPaused(true)}
          onFlashResult={handleFlashResult}
          getPlayerName={getPlayerName}
          allEvents={fixture.result?.events.filter(e => e.minute <= currentMinute) || []}
          isHalfTime={isHalfTime && isUserHome}
          onTeamTalk={handleTeamTalk}
        />

        {(isHalfTime || isFinished) && !isPaused && (
          <MatchOverlayTemplate
            title={isFinished ? 'FULL TIME' : 'HALF TIME'}
            zIndex="z-[500]"
            className="bg-black/98 animate-in zoom-in duration-300"
            primaryButton={{
              label: isHalfTime ? 'KICK OFF SECOND HALF' : 'BACK TO HUB',
              onClick: isHalfTime ? () => setIsHalfTime(false) : onFinish,
            }}
            secondaryButton={{ label: 'Tactical Review', onClick: () => setIsPaused(true) }}
          >
            <div className="flex flex-col gap-1 sm:gap-2 flex-1 min-h-0 overflow-auto">
              <div className="shrink-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-center">
                <span className="text-xs sm:text-sm md:text-base font-black text-white/90 uppercase truncate max-w-[40vw] sm:max-w-none">{homeTeam.name}</span>
                <div className="text-2xl sm:text-4xl md:text-5xl font-black text-accent drop-shadow-[0_0_20px_rgba(38,217,117,0.4)] tabular-nums">{currentHomeGoals} – {currentAwayGoals}</div>
                <span className="text-xs sm:text-sm md:text-base font-black text-white/90 uppercase truncate max-w-[40vw] sm:max-w-none">{awayTeam.name}</span>
              </div>
              {isFinished && manOfTheMatch && (
                <div className="shrink-0 pt-1 sm:pt-2 flex justify-center">
                  <div className="bg-primary/20 border-2 border-primary/40 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl inline-flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                    <span className="text-[10px] sm:text-[12px] font-black text-primary uppercase tracking-widest">Man of the Match</span>
                    <span className="text-white font-black uppercase text-xs sm:text-sm">{manOfTheMatch.player.name}</span>
                    <span className="text-accent font-mono font-black text-sm sm:text-lg">{manOfTheMatch.rating.toFixed(1)}</span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-4 max-[1300px]:gap-6 py-1 sm:py-2 flex-1 min-h-0 overflow-hidden text-sm max-[1300px]:text-[18px]">
                <SummaryRatings teamPlayers={homeLineup} teamRatings={fixture.result?.ratings} compact />
                <SummaryRatings teamPlayers={awayLineup} teamRatings={fixture.result?.ratings} compact />
              </div>
            </div>
          </MatchOverlayTemplate>
        )}

        <PlayerProfile player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
      </div>
    </div>
  );
}
