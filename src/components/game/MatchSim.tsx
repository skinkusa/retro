
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
import { Pause, Play, ChevronRight, AlertTriangle, ShieldAlert, Swords, Trophy, Activity, RefreshCw, Target, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerProfile } from './PlayerProfile';

export function MatchSim({ fixture, homeTeam, awayTeam, onFinish }: { 
  fixture: Fixture, 
  homeTeam: Team, 
  awayTeam: Team,
  onFinish: () => void 
}) {
  const { state, updateMidMatchResult, swapPlayers, setTactics } = useGame();
  const [currentMinute, setCurrentMinute] = useState(0);
  const [showLineups, setShowLineups] = useState(true);
  const [activeAlert, setActiveAlert] = useState<MatchEvent | null>(null);
  const [activeEvent, setActiveEvent] = useState<MatchEvent | null>({
    minute: 0,
    type: 'COMMENTARY',
    text: "THE TEAMS ARE COMING OUT..."
  });
  const [isFinished, setIsFinished] = useState(false);
  const [isHalfTime, setIsHalfTime] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGoalPaused, setIsGoalPaused] = useState(false);
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  
  const stadiumOverlay = PlaceHolderImages.find(img => img.id === 'match-action-overlay')?.imageUrl;
  
  const homeLineup = state.players.filter(p => homeTeam.lineup.includes(p.id));
  const awayLineup = state.players.filter(p => awayTeam.lineup.includes(p.id));

  // Determine user team role
  const isUserHome = homeTeam.id === state.userTeamId;
  const activeUserTeam = isUserHome ? homeTeam : awayTeam;

  const TICK_SPEED = 700; 

  const homeStrength = useMemo(() => ({
    DEF: getZoneStrength(homeLineup, homeTeam, 'DEF', isUserHome ? state.manager?.personality : undefined),
    MID: getZoneStrength(homeLineup, homeTeam, 'MID', isUserHome ? state.manager?.personality : undefined),
    ATT: getZoneStrength(homeLineup, homeTeam, 'ATT', isUserHome ? state.manager?.personality : undefined)
  }), [homeLineup, homeTeam, isUserHome, state.manager?.personality]);

  const awayStrength = useMemo(() => ({
    DEF: getZoneStrength(awayLineup, awayTeam, 'DEF', !isUserHome ? state.manager?.personality : undefined),
    MID: getZoneStrength(awayLineup, awayTeam, 'MID', !isUserHome ? state.manager?.personality : undefined),
    ATT: getZoneStrength(awayLineup, awayTeam, 'ATT', !isUserHome ? state.manager?.personality : undefined)
  }), [awayLineup, awayTeam, isUserHome, state.manager?.personality]);

  const possession = useMemo(() => {
    const totalMid = homeStrength.MID + awayStrength.MID;
    if (totalMid === 0) return 50;
    return Math.round((homeStrength.MID / totalMid) * 100);
  }, [homeStrength.MID, awayStrength.MID]);

  const commentaryColor = useMemo(() => {
    if (!activeEvent || !activeEvent.teamId) return 'hsl(var(--accent))'; 
    const team = activeEvent.teamId === homeTeam.id ? homeTeam : awayTeam;
    return team.color;
  }, [activeEvent, homeTeam, awayTeam]);

  useEffect(() => {
    if (showLineups || !fixture.result || isHalfTime || isFinished || isPaused || isGoalPaused) return;

    const timer = setInterval(() => {
      setCurrentMinute(prev => {
        const nextMin = prev + 1;
        
        if (nextMin === 45 && !isHalfTime && prev < 45) {
          setIsHalfTime(true);
          setActiveEvent({ minute: 45, type: 'COMMENTARY', text: "HALF TIME WHISTLE BLOWS." });
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
          if (minuteEvent.type === 'GOAL') {
            setIsGoalPaused(true);
            setActiveAlert(minuteEvent);
          } else if (['RED', 'INJURY'].includes(minuteEvent.type)) {
            setActiveAlert(minuteEvent);
          }
        }

        return nextMin;
      });
    }, TICK_SPEED);

    return () => clearInterval(timer); 
  }, [fixture.result, isHalfTime, isFinished, isPaused, isGoalPaused, TICK_SPEED, showLineups]);

  useEffect(() => {
    if (!activeAlert) return;
    const duration = activeAlert.type === 'GOAL' ? 3000 : 4000;
    const timer = setTimeout(() => {
      setActiveAlert(null);
      setIsGoalPaused(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  const handleResume = () => {
    if (activeUserTeam.lineup.length !== 11) return;
    updateMidMatchResult(fixture.id, currentMinute);
    setIsPaused(false);
    setSwapSourceId(null);
  };

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
  
  const homeScorers = fixture.result?.scorers.filter(s => homeLineup.some(p => p.id === s.playerId) && s.minute <= currentMinute) || [];
  const awayScorers = fixture.result?.scorers.filter(s => awayLineup.some(p => p.id === s.playerId) && s.minute <= currentMinute) || [];

  const homeShots = fixture.result ? Math.floor((fixture.result.homeChances || 0) * (currentMinute / 90)) : 0;
  const awayShots = fixture.result ? Math.floor((fixture.result.awayChances || 0) * (currentMinute / 90)) : 0;

  const StrengthBar = ({ value, label, color }: { value: number, label: string, color?: string }) => {
    const height = Math.min(100, (value / 50) * 100);
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-1 w-full max-w-[60px] cursor-help">
              <span className="text-[12px] font-black text-white uppercase tracking-tighter mb-1.5 bg-black px-2 py-0.5 border-2 border-primary/40 whitespace-nowrap z-20 shadow-xl rounded-sm">
                {label}
              </span>
              <div className="w-full h-24 bg-black/80 border border-white/10 relative overflow-hidden flex flex-col justify-end shadow-inner rounded-md">
                <div className="w-full transition-all duration-700" style={{ height: `${height}%`, backgroundColor: color || '#26D975' }} />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent className="text-[11px] font-black uppercase">{label} ZONE STRENGTH: {value.toFixed(1)}</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const LineupColumn = ({ team, players, ratings }: { team: Team, players: Player[], ratings?: Record<string, number> }) => (
    <div className="flex-1 flex flex-col gap-1 min-h-0">
      <div className="p-1.5 border-4 border-white/10 text-white font-black text-sm shadow-lg mb-1 shrink-0 rounded-md" style={{ backgroundColor: team.color }}>
        {team.name.toUpperCase()}
      </div>
      <div className="bg-black/85 border border-white/10 p-1.5 space-y-0.5 flex-1 overflow-auto custom-scrollbar backdrop-blur-md rounded-lg">
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase border-b border-white/10 pb-1 mb-1.5">
          <span>{team.formation}</span>
          <span>{team.playStyle}</span>
        </div>
        <div className="grid grid-cols-[80px_1fr_40px] text-[10px] font-black text-primary uppercase px-1 mb-0.5 border-b border-white/10">
          <span>Role</span>
          <span>Player</span>
          <span className="text-right">Rating</span>
        </div>
        {players.map((p) => {
          const rating = ratings ? ratings[p.id] : null;
          return (
            <div key={p.id} className="grid grid-cols-[80px_1fr_40px] items-center py-2 px-1 hover:bg-white/10 transition-colors">
              <span className="text-[11px] text-cyan font-mono font-black uppercase">{p.position} ({p.side})</span>
              <span className="text-[14px] font-black text-white uppercase truncate pr-2">{p.name}</span>
              <div className={cn(
                "text-[13px] font-mono font-black text-right px-1 py-0.5 border border-transparent rounded-sm",
                !rating ? "text-white/40" :
                rating >= 7.5 ? "text-accent bg-accent/10 border-accent/20" : 
                rating < 5.5 ? "text-red-500 bg-red-500/10 border-red-500/20" : 
                "text-white bg-white/5"
              )}>
                {rating ? rating.toFixed(1) : '---'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center p-2 md:p-4 font-mono z-[100] backdrop-blur-sm">
      <div className="max-w-5xl w-full h-[90vh] md:h-auto md:aspect-video bg-black/20 border-4 border-white/10 relative overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)] rounded-xl">
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay bg-cover bg-center"
          style={{ backgroundImage: stadiumOverlay ? `url("${stadiumOverlay}")` : 'none' }}
        />

        {showLineups && (
          <div className="absolute inset-0 z-[300] bg-black/85 backdrop-blur-md flex flex-col p-6 md:p-12 overflow-hidden">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8 border-b-4 border-primary pb-4 shrink-0">
              <h3 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tighter flex items-center gap-4">
                <Swords size={32} className="shrink-0" /> Pre-Match Intelligence
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-4">
                <Button onClick={() => setIsPaused(true)} variant="outline" className="h-10 md:h-12 px-4 md:px-8 font-black uppercase text-xs md:text-sm border-white/20 text-white hover:bg-white/10 bg-black/40">
                  Tactics
                </Button>
                <Button onClick={() => setShowLineups(false)} className="bg-accent text-accent-foreground retro-button h-10 md:h-12 px-6 md:px-12 font-black uppercase text-xs md:text-sm shadow-xl animate-pulse hover:scale-105 transition-transform flex-1 md:flex-none">
                  Kick Off Match <ChevronRight size={20} className="ml-2" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 flex-1 min-h-0">
              <LineupColumn team={homeTeam} players={homeLineup} />
              <LineupColumn team={awayTeam} players={awayLineup} />
            </div>
          </div>
        )}

        {activeAlert && (
          <div className="absolute inset-0 z-[150] flex items-center justify-center pointer-events-none animate-in zoom-in duration-300">
            {activeAlert.type === 'GOAL' ? (
              <div className="w-full h-40 md:h-64 animate-goal-strobe flex flex-col items-center justify-center shadow-[0_0_200px_rgba(38,217,117,0.8)]">
                <div className="text-7xl md:text-9xl font-black tracking-tighter uppercase drop-shadow-[8px_8px_0px_rgba(0,0,0,1)] animate-bounce text-white">
                  GOAL!!!
                </div>
              </div>
            ) : (
              <div className={cn(
                "p-10 border-4 flex flex-col items-center gap-4 shadow-2xl backdrop-blur-xl rounded-lg",
                activeAlert.type === 'RED' ? 'bg-red-600/95 border-white text-white' : 
                'bg-yellow-600/95 border-white text-white'
              )}>
                {activeAlert.type === 'RED' && <ShieldAlert size={80} className="animate-pulse" />}
                {activeAlert.type === 'INJURY' && <AlertTriangle size={80} className="animate-pulse" />}
                <div className="text-6xl font-black uppercase tracking-tighter">{activeAlert.type}!</div>
              </div>
            )}
          </div>
        )}

        <div className="relative z-10 p-3 flex flex-col items-center gap-1">
          <div className="flex items-center gap-6">
            <div className="bg-primary/90 text-primary-foreground px-6 py-1 text-[10px] font-bold shadow-lg border border-white/20 uppercase tracking-widest rounded-md">
              {fixture.competition} - {homeTeam.stadium.toUpperCase()}
            </div>
            {!isFinished && !isHalfTime && !showLineups && (
               <Button 
                onClick={() => setIsPaused(!isPaused)} 
                className="bg-white text-black hover:bg-white/80 h-8 px-5 retro-button text-[10px] font-bold shadow-[4px_4px_0_0_rgba(38,217,117,0.5)]"
               >
                 {isPaused ? <Play size={12} className="mr-2" /> : <Pause size={12} className="mr-2" />}
                 {isPaused ? 'RESUME' : 'TACTICS'}
               </Button>
            )}
          </div>

          <div className="h-14 w-full max-w-4xl flex items-center justify-center px-4">
            <div 
              className="bg-black/90 backdrop-blur-md px-4 py-1.5 text-sm md:text-base font-black w-full text-center uppercase tracking-tight shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center min-h-[36px] leading-tight rounded-lg"
              style={{ color: commentaryColor }}
            >
              {activeEvent?.text}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 md:px-12 mt-2 gap-4 flex-1">
          <div className="w-full max-w-4xl flex items-center justify-between gap-4">
            <div className="flex-1 flex flex-col items-end">
              <div className="w-full h-12 border-4 border-white/20 text-white flex items-center justify-center font-black text-base md:text-xl shadow-xl text-center rounded-lg" style={{ backgroundColor: homeTeam.color }}>
                {homeTeam.name.toUpperCase()}
              </div>
              <div className="flex items-center gap-4 mt-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-[12px] font-black text-muted-foreground uppercase cursor-help">Shots: {homeShots}</span>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent className="font-black">TOTAL ATTEMPTS ON GOAL</TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,1)] tabular-nums">{currentHomeGoals}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center px-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-black/95 border-4 border-accent/40 p-2 md:p-3 shadow-[0_0_50px_rgba(38,217,117,0.4)] rounded-xl cursor-help">
                      <div className="text-2xl md:text-4xl font-black text-red-600 tabular-nums leading-none tracking-tighter">
                        {currentMinute.toString().padStart(3, '0')}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipPortal>
                    <TooltipContent className="font-black">ELAPSED MATCH TIME (MINUTES)</TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex-1 flex flex-col items-start">
              <div className="w-full h-12 border-4 border-white/20 text-white flex items-center justify-center font-black text-base md:text-xl shadow-xl text-center rounded-lg" style={{ backgroundColor: awayTeam.color }}>
                {awayTeam.name.toUpperCase()}
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,1)] tabular-nums">{currentAwayGoals}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-[12px] font-black text-muted-foreground uppercase cursor-help">Shots: {awayShots}</span>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent className="font-black">TOTAL ATTEMPTS ON GOAL</TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <div className="w-full max-w-2xl mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex justify-between text-[11px] font-black uppercase text-white mb-1.5 px-1 cursor-help">
                    <span>Possession: {possession}%</span>
                    <span>{100 - possession}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent className="font-black">CONTROL OF THE MIDFIELD BATTLE</TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
            <div className="h-4 w-full bg-black/40 border-2 border-white/10 rounded-full overflow-hidden flex">
              <div className="h-full transition-all duration-1000" style={{ width: `${possession}%`, backgroundColor: homeTeam.color }} />
              <div className="h-full transition-all duration-1000" style={{ width: `${100 - possession}%`, backgroundColor: awayTeam.color }} />
            </div>
          </div>

          <div className="grid grid-cols-2 w-full max-w-4xl gap-8 mt-4">
            <div className="space-y-1 text-right">
              {homeScorers.map((s, idx) => (
                <div key={idx} className="text-[13px] font-black text-accent uppercase leading-none">
                  {state.players.find(p => p.id === s.playerId)?.name.split(' ').pop()} ({s.minute}')
                </div>
              ))}
            </div>
            <div className="space-y-1 text-left">
              {awayScorers.map((s, idx) => (
                <div key={idx} className="text-[13px] font-black text-accent uppercase leading-none">
                  {state.players.find(p => p.id === s.playerId)?.name.split(' ').pop()} ({s.minute}')
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 p-4 md:p-6 grid grid-cols-2 gap-8 bg-gradient-to-t from-black/60 to-transparent shrink-0">
          <div className="flex justify-center w-full gap-4">
            <StrengthBar value={homeStrength.DEF} label="DEF" color={homeTeam.color} />
            <StrengthBar value={homeStrength.MID} label="MID" color={homeTeam.color} />
            <StrengthBar value={homeStrength.ATT} label="ATT" color={homeTeam.color} />
          </div>
          <div className="flex justify-center w-full gap-4">
            <StrengthBar value={awayStrength.DEF} label="DEF" color={awayTeam.color} />
            <StrengthBar value={awayStrength.MID} label="MID" color={awayTeam.color} />
            <StrengthBar value={awayStrength.ATT} label="ATT" color={awayTeam.color} />
          </div>
        </div>

        {(isHalfTime || isFinished) && (
          <div className="absolute inset-0 z-[250] bg-black/85 backdrop-blur-xl flex flex-col p-4 md:p-6 overflow-hidden">
            <div className="flex flex-col items-center mb-1 shrink-0">
              <h4 className="text-[11px] font-black text-primary tracking-widest uppercase leading-none mb-1 opacity-70">
                {isFinished ? 'FULL TIME RESULT' : 'HALF TIME SCORE'}
              </h4>
              
              <div className="w-full max-w-2xl flex justify-center items-center gap-6 bg-white/5 py-2 px-6 mb-2 rounded-lg">
                <div className="text-right flex-1 min-w-0">
                   <div className="text-lg font-black text-white uppercase truncate drop-shadow-lg">{homeTeam.name}</div>
                   <div className="text-[11px] text-accent uppercase font-black truncate tracking-widest leading-none mt-1">
                     {homeScorers.slice(0, 2).map(s => `${state.players.find(p => p.id === s.playerId)?.name.split(' ').pop()} ${s.minute}'`).join(', ')}
                   </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-black text-accent font-mono tabular-nums bg-black px-5 py-1.5 border-2 border-accent/40 shadow-[0_0_40px_rgba(38,217,117,0.4)] rounded-lg">
                    {currentHomeGoals} - {currentAwayGoals}
                  </div>
                </div>

                <div className="text-left flex-1 min-w-0">
                   <div className="text-lg font-black text-white uppercase truncate drop-shadow-lg">{awayTeam.name}</div>
                   <div className="text-[11px] text-accent uppercase font-black truncate tracking-widest leading-none mt-1">
                     {awayScorers.slice(0, 2).map(s => `${state.players.find(p => p.id === s.playerId)?.name.split(' ').pop()} ${s.minute}'`).join(', ')}
                   </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-0 overflow-hidden mt-2">
              <LineupColumn team={homeTeam} players={homeLineup} ratings={fixture.result?.ratings} />
              <LineupColumn team={awayTeam} players={awayLineup} />
            </div>

            <div className="mt-4 flex gap-4 shrink-0">
               <Button 
                onClick={() => setIsPaused(true)} 
                variant="outline"
                className="flex-1 border-white/20 text-white retro-button font-black h-10 text-xs uppercase tracking-widest hover:bg-white/10"
              >
                <Trophy className="mr-2" size={16} /> Tactics
              </Button>
              <Button 
                onClick={isHalfTime ? () => setIsHalfTime(false) : onFinish} 
                className="flex-[1.5] bg-primary text-primary-foreground retro-button font-black h-10 text-sm uppercase shadow-2xl tracking-[0.4em] hover:scale-[1.02] transition-transform"
              >
                {isHalfTime ? 'KICK OFF SECOND HALF' : 'BACK TO OFFICE'} <ChevronRight size={20} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {isPaused && (
          <div className="absolute inset-0 z-[400] bg-black/90 backdrop-blur-2xl flex flex-col p-8 overflow-auto">
            <div className="flex justify-between items-center mb-8 border-b-4 border-primary pb-4 shrink-0">
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">Tactical Command Center</h3>
                {swapSourceId && (
                  <div className="text-accent font-black uppercase text-[12px] animate-pulse flex items-center gap-2 mt-1">
                    <RefreshCw size={14} className="animate-spin" /> Swap Mode Active
                  </div>
                )}
              </div>
              <Button 
                onClick={handleResume} 
                disabled={activeUserTeam.lineup.length !== 11}
                className="bg-accent text-accent-foreground retro-button h-12 px-12 font-black uppercase text-sm shadow-xl hover:scale-105 transition-transform"
              >
                Apply Changes & Resume <ChevronRight size={20} className="ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1.2fr] gap-6 flex-1 overflow-hidden">
              <div className="space-y-6 overflow-auto custom-scrollbar">
                <div className="bg-card/20 border-2 border-primary/20 p-4 shadow-inner rounded-lg">
                  <h4 className="text-xs font-black text-primary mb-4 uppercase border-b border-primary/10 pb-2">Formation</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-5-1'].map(f => (
                      <Button 
                        key={f} 
                        onClick={() => setTactics(f, activeUserTeam.playStyle)}
                        className={cn(
                          "h-10 text-[14px] font-mono retro-button font-black rounded-md",
                          activeUserTeam.formation === f 
                            ? "bg-accent text-accent-foreground border-accent" 
                            : "bg-black/40 text-white border-primary/20 hover:bg-primary/20"
                        )}
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                  <h4 className="text-xs font-black text-primary mt-6 mb-4 uppercase border-b border-primary/10 pb-2">Play Style</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {(['Long Ball', 'Pass to Feet', 'Counter-Attack', 'Tiki-Taka', 'Direct', 'Park the Bus'] as PlayStyle[]).map(s => (
                      <Button 
                        key={s} 
                        onClick={() => setTactics(activeUserTeam.formation, s)}
                        className={cn(
                          "h-10 text-[12px] font-mono retro-button font-black uppercase rounded-md",
                          activeUserTeam.playStyle === s 
                            ? "bg-accent text-accent-foreground border-accent" 
                            : "bg-black/40 text-white border-primary/20 hover:bg-primary/20"
                        )}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 overflow-auto custom-scrollbar">
                <div className="bg-card/20 border-2 border-primary/20 p-4 shadow-inner rounded-lg h-full">
                  <h4 className="text-xs font-black text-primary mb-4 uppercase flex justify-between">
                    Personnel <span>{activeUserTeam.lineup.length}/11 SELECTED</span>
                  </h4>
                  <SquadList 
                    players={state.players.filter(p => p.clubId === activeUserTeam.id)} 
                    onPlayerSwap={handleSwapInteraction}
                    activeSwapId={swapSourceId}
                  />
                </div>
              </div>

              <div className="space-y-6 overflow-auto custom-scrollbar">
                 <div className="bg-card/20 border-2 border-primary/20 p-6 shadow-inner rounded-lg h-full">
                    <h4 className="text-xs font-black text-primary mb-4 uppercase">Pitch Positioning</h4>
                    <TacticsPitch 
                      team={activeUserTeam} 
                      players={state.players.filter(p => p.clubId === activeUserTeam.id)} 
                      onPlayerClick={(p) => handleSwapInteraction(p.id)} 
                      onPlayerProfile={(p) => setViewingPlayer(p)}
                      activeSwapId={swapSourceId}
                    />
                 </div>
              </div>
            </div>
          </div>
        )}
        <PlayerProfile player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
      </div>
    </div>
  );
}
