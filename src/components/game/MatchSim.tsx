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
import { PlayerProfile } from './PlayerProfile';

export function MatchSim({ fixture, homeTeam, awayTeam, onFinish }: { 
  fixture: Fixture, 
  homeTeam: Team, 
  awayTeam: Team,
  onFinish: () => void 
}) {
  const { state, swapPlayers, setTactics, simulateWeek } = useGame();
  const [currentMinute, setCurrentMinute] = useState(0);
  const [showLineups, setShowLineups] = useState(true);
  const [activeAlert, setActiveAlert] = useState<MatchEvent | null>(null);
  const [activeEvent, setActiveEvent] = useState<MatchEvent | null>({ minute: 0, type: 'COMMENTARY', text: "THE TEAMS ARE COMING OUT..." });
  const [isFinished, setIsFinished] = useState(false);
  const [isHalfTime, setIsHalfTime] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGoalPaused, setIsGoalPaused] = useState(false);
  const [pausedForInjury, setPausedForInjury] = useState(false);
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  
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
    const hex1 = homeTeam.color.replace('#', '');
    const hex2 = awayTeam.color.replace('#', '');
    const useAwayKit = hex1.substring(0, 2) === hex2.substring(0, 2) || homeTeam.color.toLowerCase() === awayTeam.color.toLowerCase();
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
        if (nextMin === 45 && !isHalfTime && prev < 45) { setIsHalfTime(true); setActiveEvent({ minute: 45, type: 'COMMENTARY', text: "HALF TIME WHISTLE BLOWS." }); return 45; }
        if (nextMin >= 90) { setIsFinished(true); setActiveEvent({ minute: 90, type: 'COMMENTARY', text: "FULL TIME! THAT'S IT." }); return 90; }
        const minuteEvent = fixture.result!.events.find(e => e.minute === nextMin);
        if (minuteEvent) {
          setActiveEvent(minuteEvent);
          if (minuteEvent.type === 'GOAL') { setIsGoalPaused(true); setActiveAlert(minuteEvent); }
          if (minuteEvent.type === 'RED') { setIsGoalPaused(true); setActiveAlert(minuteEvent); }
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

  const handleResume = () => { setIsPaused(false); setSwapSourceId(null); setPausedForInjury(false); };
  const handleSwapInteraction = (pId: string) => {
    if (!swapSourceId) {
      setSwapSourceId(pId);
    } else {
      if (swapSourceId === pId) {
        setSwapSourceId(null);
      } else {
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

  const zones = useMemo(() => ({
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
  }), [homeLineup, awayLineup, homeTeam, awayTeam, state.manager?.personality]);

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

  const StrengthBar = ({ value, label, color }: { value: number, label: string, color?: string }) => (
    <div className="flex flex-col items-center gap-0.5 w-full max-w-[56px]">
      <span className="text-[12px] font-black text-white uppercase">{label}</span>
      <div className="w-full h-20 bg-black/80 border border-white/10 relative overflow-hidden flex flex-col justify-end rounded-md shadow-inner">
        <div className="w-full transition-all duration-700" style={{ height: `${Math.min(100, (value / 50) * 100)}%`, backgroundColor: color || '#26D975' }} />
      </div>
    </div>
  );

  const SummaryRatings = ({ teamPlayers, teamRatings }: { teamPlayers: Player[], teamRatings: Record<string, number> | undefined }) => (
    <div className="max-h-[45vh] min-h-[200px] max-md:max-h-[55vh] max-md:min-h-[120px] overflow-auto border border-white/10 rounded-xl bg-black/70">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-primary/40 bg-primary/25">
            <TableHead className="text-[12px] max-md:text-[10px] uppercase font-black py-3 max-md:py-1.5 text-white tracking-wide">Player</TableHead>
            <TableHead className="text-right text-[12px] max-md:text-[10px] uppercase font-black py-3 max-md:py-1.5 text-white tracking-wide">Rating</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamPlayers.map(p => (
            <TableRow key={p.id} className="border-b border-white/5 hover:bg-white/5">
              <TableCell className="py-2 max-md:py-1 text-xs max-md:text-[10px] font-bold uppercase truncate max-w-[120px]">{p.name}</TableCell>
              <TableCell className="py-2 max-md:py-1 text-right font-mono font-black text-accent text-xs max-md:text-[10px]">{teamRatings?.[p.id]?.toFixed(1) || '6.0'}</TableCell>
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
                  <TableCell className="py-2 px-3">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-black text-white uppercase truncate">{p.name}</span>
                      <span className="text-[9px] font-mono text-cyan uppercase">{p.position} ({p.side}) • SKL: {p.attributes.skill}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2 px-3">
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn("text-[12px] font-black", p.fitness < 80 ? "text-red-500" : "text-accent")}>{p.fitness}% FIT</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-white/80 uppercase">RTG:</span>
                        <span className="text-[12px] font-mono font-black text-white">{fixture.result?.ratings[p.id]?.toFixed(1) || '0.0'}</span>
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
          <div className="absolute inset-x-0 top-0 z-[300] flex items-center justify-center py-4 px-4 animate-in zoom-in duration-200" role="alert">
            <div className="w-full max-w-2xl rounded-2xl border-4 border-white/60 shadow-[0_0_40px_rgba(255,255,255,0.3)] py-5 px-6 text-center animate-pulse" style={{ backgroundColor: goalBannerColor ?? 'var(--accent)', color: goalBannerTeamId === homeTeam.id ? (homeTeam.homeTextColor ?? '#fff') : goalBannerTeamId === awayTeam.id ? awayKitText : '#fff' }}>
              <div className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.4em] opacity-90">Goal</div>
              <div className="text-2xl sm:text-4xl font-black uppercase tracking-tight mt-0.5">{activeAlert.minute}&apos; · {goalScorerName ?? 'Unknown'}</div>
            </div>
          </div>
        )}

        {showLineups && (
          <div className="absolute inset-0 z-[600] bg-background/95 backdrop-blur-2xl flex flex-col overflow-y-auto p-4 sm:p-6 animate-in fade-in duration-500">
            <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-center min-h-0 py-6 space-y-6">
              <div className="text-center space-y-2 shrink-0">
                <h2 className="text-primary font-black uppercase tracking-[0.4em] text-xl">Official Match Lineups</h2>
                <p className="text-white/90 uppercase font-black text-[12px]">{fixture.competition} • {homeTeam.stadium}</p>
              </div>
              <div className="grid grid-cols-2 gap-6 sm:gap-12 shrink-0">
                <div className="space-y-3">
                  <div className="h-11 flex items-center justify-center font-black text-lg sm:text-xl uppercase border-b-4 border-white/30" style={{ backgroundColor: homeTeam.color, color: homeTeam.homeTextColor ?? '#ffffff' }}>{homeTeam.name}</div>
                  <div className="space-y-1">
                    {homeLineup.map(p => (
                      <div key={p.id} className="flex justify-between text-[13px] sm:text-[14px] font-black border-b border-white/10 pb-1">
                        <span className="text-cyan w-8">{p.position}</span>
                        <span className="flex-1 uppercase truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-11 flex items-center justify-center font-black text-lg sm:text-xl uppercase border-b-4 border-white/30" style={{ backgroundColor: awayKitColor, color: awayKitText }}>{awayTeam.name}</div>
                  <div className="space-y-1">
                    {awayLineup.map(p => (
                      <div key={p.id} className="flex justify-between text-[13px] sm:text-[14px] font-black border-b border-white/10 pb-1">
                        <span className="text-cyan w-8">{p.position}</span>
                        <span className="flex-1 uppercase truncate">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-4 pb-4 shrink-0">
                <Button onClick={() => setShowLineups(false)} className="h-14 sm:h-16 px-12 sm:px-20 bg-accent text-accent-foreground font-black uppercase text-xl sm:text-2xl shadow-[8px_8px_0_0_rgba(38,217,117,0.3)] hover:scale-[1.05] transition-transform">KICK OFF MATCH</Button>
              </div>
            </div>
          </div>
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
              </div>
              <Button onClick={handleResume} className="bg-accent text-accent-foreground retro-button h-9 sm:h-10 px-6 sm:px-8 text-sm font-black uppercase shadow-xl hover:scale-105 transition-all shrink-0">Apply & Resume</Button>
            </div>
            
            <Tabs defaultValue="pitch" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-3 bg-black/70 h-10 sm:h-11 mb-2 border border-primary/20 rounded-lg gap-1 p-1 shadow-inner shrink-0">
                <TabsTrigger value="pitch" className="uppercase font-black tracking-widest text-[12px] sm:text-[13px] data-[state=active]:bg-primary py-2"><LayoutDashboard size={16} className="mr-1.5" /> Tactics</TabsTrigger>
                <TabsTrigger value="strategy" className="uppercase font-black tracking-widest text-[12px] sm:text-[13px] data-[state=active]:bg-primary py-2"><Swords size={16} className="mr-1.5" /> Strategy</TabsTrigger>
                <TabsTrigger value="personnel" className="uppercase font-black tracking-widest text-[12px] sm:text-[13px] data-[state=active]:bg-primary py-2"><UserCircle size={16} className="mr-1.5" /> Personnel</TabsTrigger>
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

        <div className="relative z-10 p-2.5 flex flex-col items-center gap-1 bg-black/85 border-b border-white/5 shrink-0">
          <div className="bg-primary text-primary-foreground px-4 py-0.5 text-[10px] font-black shadow-lg border border-white/20 uppercase tracking-[0.2em] rounded-md">{fixture.competition} - {homeTeam.stadium.toUpperCase()}</div>
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            <div className="bg-black/90 backdrop-blur-md px-4 py-2.5 text-[17px] sm:text-[18px] font-black flex-1 text-center uppercase tracking-tight shadow-2xl flex items-center justify-center min-h-[48px] rounded-lg border border-white/10" style={{ color: commentaryColor }}>
              {activeEvent?.text}
            </div>
            <Button onClick={() => setPlaybackSpeed(s => s === 1 ? 2 : 1)} className={cn("h-9 px-3 sm:px-4 text-sm font-black retro-button shrink-0 transition-all", playbackSpeed === 2 ? "bg-accent text-accent-foreground border-accent" : "bg-black/70 text-white border-white/30 hover:bg-white/10")} title={playbackSpeed === 2 ? "Switch to 1x speed" : "Play at 2x speed"}>×{playbackSpeed}</Button>
            <Button onClick={() => setIsPaused(true)} className="h-9 px-5 text-sm bg-red-600 hover:bg-red-700 text-white font-black retro-button shadow-lg transition-all active:scale-95 shrink-0"><Pause size={18} className="mr-1" /> PAUSE</Button>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center px-6 sm:px-10 mt-5 gap-4 flex-1 min-h-0">
          <div className="match-teams-row w-full flex items-center justify-between gap-4 sm:gap-8">
            <div className="flex-1 flex flex-col items-end min-w-0">
              <div className="match-team-name w-full min-h-[2.75rem] sm:min-h-[3rem] border-4 border-white/30 flex items-center justify-center font-black shadow-2xl rounded-lg uppercase leading-tight text-center px-1 overflow-hidden" style={{ backgroundColor: homeTeam.color, color: homeTeam.homeTextColor ?? '#ffffff' }}><span className="truncate block w-full">{homeTeam.name}</span></div>
              <div className="flex items-center gap-4 sm:gap-6 mt-2">
                <div className="flex flex-col items-end w-[200px] sm:w-[220px] shrink-0">
                  <span className="text-[13px] font-black text-white/90 uppercase">Shots: {homeShots}</span>
                  <div className="text-[10px] font-black text-accent uppercase text-right leading-tight w-full mt-1 min-h-[3.5rem] max-h-[3.5rem] overflow-y-auto overflow-x-hidden grid grid-cols-2 gap-x-2 gap-y-0.5 pr-0.5">
                    {fixture.result?.scorers.filter(s => homeLineup.some(p => p.id === s.playerId) && s.minute <= currentMinute).map(s => (
                      <div key={`${s.playerId}-${s.minute}`}>{state.players.find(p => p.id === s.playerId)?.name} {s.minute}&apos;</div>
                    ))}
                  </div>
                  <div className="text-[10px] font-black uppercase text-right leading-tight w-full mt-0.5 min-h-[2rem] max-h-[2.5rem] overflow-y-auto overflow-x-hidden grid grid-cols-2 gap-x-2 gap-y-0.5 pr-0.5">
                    {fixture.result?.cards?.filter(c => homeLineup.some(p => p.id === c.playerId) && c.minute <= currentMinute).map(c => (
                      <div key={`card-${c.playerId}-${c.minute}-${c.type}`} className={c.type === 'RED' ? 'text-red-400' : 'text-yellow-400'}>
                        {c.type} {c.minute}&apos; {state.players.find(p => p.id === c.playerId)?.name}
                      </div>
                    ))}
                  </div>
                </div>
                <span className="text-6xl sm:text-7xl max-md:text-sm font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] shrink-0">{currentHomeGoals}</span>
              </div>
            </div>
            
            <div className="bg-black border-4 border-accent p-3 max-md:p-1 max-md:rounded-md max-md:border-2 rounded-xl shadow-[0_0_30px_rgba(38,217,117,0.2)] shrink-0">
              <div className="text-4xl sm:text-5xl max-md:text-base max-md:w-8 font-black text-red-600 tabular-nums leading-none tracking-tighter w-[72px] sm:w-[85px] text-center">{currentMinute.toString().padStart(3, '0')}</div>
            </div>

            <div className="flex-1 flex flex-col items-start min-w-0">
              <div className="match-team-name w-full min-h-[2.75rem] sm:min-h-[3rem] border-4 border-white/30 flex items-center justify-center font-black shadow-2xl rounded-lg uppercase leading-tight text-center px-1 overflow-hidden" style={{ backgroundColor: awayKitColor, color: awayKitText }}><span className="truncate block w-full">{awayTeam.name}</span></div>
              <div className="flex items-center gap-4 sm:gap-6 mt-2">
                <span className="text-6xl sm:text-7xl max-md:text-sm font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] shrink-0">{currentAwayGoals}</span>
                <div className="flex flex-col items-start w-[200px] sm:w-[220px] shrink-0">
                  <span className="text-[13px] font-black text-white/90 uppercase">Shots: {awayShots}</span>
                  <div className="text-[10px] font-black text-accent uppercase text-left leading-tight w-full mt-1 min-h-[3.5rem] max-h-[3.5rem] overflow-y-auto overflow-x-hidden grid grid-cols-2 gap-x-2 gap-y-0.5 pl-0.5">
                    {fixture.result?.scorers.filter(s => awayLineup.some(p => p.id === s.playerId) && s.minute <= currentMinute).map(s => (
                      <div key={`${s.playerId}-${s.minute}`}>{state.players.find(p => p.id === s.playerId)?.name} {s.minute}&apos;</div>
                    ))}
                  </div>
                  <div className="text-[10px] font-black uppercase text-left leading-tight w-full mt-0.5 min-h-[2rem] max-h-[2.5rem] overflow-y-auto overflow-x-hidden grid grid-cols-2 gap-x-2 gap-y-0.5 pl-0.5">
                    {fixture.result?.cards?.filter(c => awayLineup.some(p => p.id === c.playerId) && c.minute <= currentMinute).map(c => (
                      <div key={`card-${c.playerId}-${c.minute}-${c.type}`} className={c.type === 'RED' ? 'text-red-400' : 'text-yellow-400'}>
                        {c.type} {c.minute}&apos; {state.players.find(p => p.id === c.playerId)?.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-4xl mt-2">
            <div className="h-4 w-full bg-black/80 border-2 border-white/20 rounded-full overflow-hidden flex shadow-2xl">
              <div className="h-full transition-all duration-1000 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.2)]" style={{ width: `${possession}%`, backgroundColor: homeTeam.color }} />
              <div className="h-full transition-all duration-1000" style={{ width: `${100-possession}%`, backgroundColor: awayKitColor }} />
            </div>
            <div className="flex justify-between px-3 mt-1 text-[12px] font-black text-white/80 uppercase tracking-widest">
              <span>POSSESSION: {possession.toFixed(0)}%</span>
              <span>{(100-possession).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-4 sm:p-6 grid grid-cols-2 gap-6 sm:gap-10 shrink-0 bg-black/70">
          <div className="flex justify-center w-full gap-6">
            <StrengthBar value={zones.home.DEF} label="DEF" color={homeTeam.color} />
            <StrengthBar value={zones.home.MID} label="MID" color={homeTeam.color} />
            <StrengthBar value={zones.home.ATT} label="ATT" color={homeTeam.color} />
          </div>
          <div className="flex justify-center w-full gap-6">
            <StrengthBar value={zones.away.DEF} label="DEF" color={awayKitColor} />
            <StrengthBar value={zones.away.MID} label="MID" color={awayKitColor} />
            <StrengthBar value={zones.away.ATT} label="ATT" color={awayKitColor} />
          </div>
        </div>

        {(isHalfTime || isFinished) && !isPaused && (
          <div className="absolute inset-0 z-[500] bg-black/98 backdrop-blur-xl flex flex-col p-2 max-md:p-2 sm:p-4 animate-in zoom-in duration-300 overflow-hidden">
            {/* Mobile/tablet (< lg): Tactical Review top LEFT, Kick off / Back to Hub top RIGHT — single row, never overlaps player lists */}
            <div className="max-lg:grid max-lg:grid-cols-2 max-lg:gap-2 max-lg:items-center max-lg:shrink-0 max-lg:min-h-[2.5rem] max-lg:py-1 max-lg:px-1 max-lg:w-full">
              <Button onClick={() => setIsPaused(true)} variant="outline" size="sm" className="max-lg:h-8 max-lg:text-[10px] max-lg:font-black max-lg:uppercase max-lg:border-primary/40 max-lg:hover:bg-primary/10 max-lg:justify-self-start lg:hidden">Tactical Review</Button>
              <Button onClick={isHalfTime ? () => setIsHalfTime(false) : onFinish} size="sm" className="max-lg:h-8 max-lg:text-[10px] max-lg:font-black max-lg:uppercase max-lg:bg-primary max-lg:text-primary-foreground max-lg:shadow-xl max-lg:justify-self-end lg:hidden">
                {isHalfTime ? 'KICK OFF SECOND HALF' : 'BACK TO HUB'}
              </Button>
            </div>
            <div className="max-w-5xl w-full flex-1 min-h-0 flex flex-col justify-center text-center gap-2 max-md:gap-1 sm:gap-4 relative overflow-auto pt-1">
              <div className="space-y-1 shrink-0 max-md:space-y-0">
                <h4 className="text-primary font-black uppercase tracking-[0.4em] text-lg sm:text-xl max-md:text-sm">{isFinished ? 'FULL TIME' : 'HALF TIME'}</h4>
                <div className="text-4xl max-md:text-2xl sm:text-7xl font-black text-accent drop-shadow-[0_0_20px_rgba(38,217,117,0.4)]">{currentHomeGoals} - {currentAwayGoals}</div>
                {isFinished && manOfTheMatch && (
                  <div className="pt-2 flex justify-center">
                    <div className="bg-primary/20 border-2 border-primary/40 px-4 py-2 rounded-xl inline-flex items-center gap-3">
                      <span className="text-[11px] sm:text-[12px] font-black text-primary uppercase tracking-widest">Man of the Match</span>
                      <span className="text-white font-black uppercase">{manOfTheMatch.player.name}</span>
                      <span className="text-accent font-mono font-black text-lg">{manOfTheMatch.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 max-md:gap-1.5 sm:gap-6 py-2 flex-1 min-h-0 overflow-auto">
                <SummaryRatings teamPlayers={homeLineup} teamRatings={fixture.result?.ratings} />
                <SummaryRatings teamPlayers={awayLineup} teamRatings={fixture.result?.ratings} />
              </div>

              {/* Desktop only (lg+): bottom buttons — hidden below 1024px so they never overlap player lists */}
              <div className="hidden lg:flex flex-col sm:flex-row justify-center gap-3 shrink-0">
                <Button onClick={() => setIsPaused(true)} variant="outline" className="h-12 sm:h-14 font-black uppercase text-base sm:text-lg border-primary/40 hover:bg-primary/10">Tactical Review</Button>
                <Button onClick={isHalfTime ? () => setIsHalfTime(false) : onFinish} className="h-12 sm:h-14 font-black uppercase text-base sm:text-lg bg-primary text-primary-foreground shadow-2xl hover:scale-[1.02] transition-transform">
                  {isHalfTime ? 'KICK OFF SECOND HALF' : 'BACK TO HUB'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <PlayerProfile player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
      </div>
    </div>
  );
}
