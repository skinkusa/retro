
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
import { Pause, Play, ChevronRight, Swords, RefreshCw, Activity, Settings, UserCircle, ListFilter } from 'lucide-react';
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
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  
  const stadiumOverlay = PlaceHolderImages.find(img => img.id === 'match-action-overlay')?.imageUrl;
  
  // Ensure we have a result generated if we just started
  useEffect(() => {
    if (!fixture.result) {
      simulateWeek();
    }
  }, [fixture.result, simulateWeek]);

  const homeLineup = state.players.filter(p => homeTeam.lineup.slice(0, 11).includes(p.id));
  const awayLineup = state.players.filter(p => awayTeam.lineup.slice(0, 11).includes(p.id));
  const isUserHome = homeTeam.id === state.userTeamId;
  const activeUserTeam = isUserHome ? homeTeam : awayTeam;

  // Away Color Logic: If colors clash or just use away color for away team
  const awayKitColor = useMemo(() => {
    const hex1 = homeTeam.color.replace('#', '');
    const hex2 = awayTeam.color.replace('#', '');
    // Simple clash detection
    if (hex1.substring(0, 2) === hex2.substring(0, 2) || homeTeam.color.toLowerCase() === awayTeam.color.toLowerCase()) {
      return awayTeam.awayColor;
    }
    return awayTeam.color;
  }, [homeTeam.color, awayTeam.color, awayTeam.awayColor]);

  const TICK_SPEED = 700; 

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
        }
        return nextMin;
      });
    }, TICK_SPEED);
    return () => clearInterval(timer); 
  }, [fixture.result, isHalfTime, isFinished, isPaused, isGoalPaused, showLineups]);

  useEffect(() => {
    if (!activeAlert) return;
    const duration = activeAlert.type === 'GOAL' ? 3000 : 4000;
    const timer = setTimeout(() => { setActiveAlert(null); setIsGoalPaused(false); }, duration);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  const handleResume = () => { setIsPaused(false); setSwapSourceId(null); };
  const handleSwapInteraction = (pId: string) => {
    if (!swapSourceId) { setSwapSourceId(pId); }
    else { if (swapSourceId === pId) { setSwapSourceId(null); } else { swapPlayers(swapSourceId, pId); setSwapSourceId(null); } }
  };

  const currentHomeGoals = fixture.result?.scorers.filter(s => homeLineup.some(p => p.id === s.playerId) && s.minute <= currentMinute).length || 0;
  const currentAwayGoals = fixture.result?.scorers.filter(s => awayLineup.some(p => p.id === s.playerId) && s.minute <= currentMinute).length || 0;
  const homeShots = fixture.result ? Math.floor((fixture.result.homeChances || 0) * (currentMinute / 90)) : 0;
  const awayShots = fixture.result ? Math.floor((fixture.result.awayChances || 0) * (currentMinute / 90)) : 0;

  const zones = useMemo(() => ({
    home: { DEF: getZoneStrength(homeLineup, homeTeam, 'DEF', state.manager?.personality), MID: getZoneStrength(homeLineup, homeTeam, 'MID', state.manager?.personality), ATT: getZoneStrength(homeLineup, homeTeam, 'ATT', state.manager?.personality) },
    away: { DEF: getZoneStrength(awayLineup, awayTeam, 'DEF'), MID: getZoneStrength(awayLineup, awayTeam, 'MID'), ATT: getZoneStrength(awayLineup, awayTeam, 'ATT') }
  }), [homeLineup, awayLineup, homeTeam, awayTeam, state.manager?.personality]);

  const possession = (zones.home.MID / (zones.home.MID + zones.away.MID || 1)) * 100;

  const StrengthBar = ({ value, label, color }: { value: number, label: string, color?: string }) => (
    <div className="flex flex-col items-center gap-1 w-full max-w-[60px]">
      <span className="text-[10px] font-black text-white uppercase">{label}</span>
      <div className="w-full h-20 bg-black/80 border border-white/10 relative overflow-hidden flex flex-col justify-end rounded-md shadow-inner">
        <div className="w-full transition-all duration-700" style={{ height: `${Math.min(100, (value / 50) * 100)}%`, backgroundColor: color || '#26D975' }} />
      </div>
    </div>
  );

  const SummaryRatings = ({ teamPlayers, teamRatings }: { teamPlayers: Player[], teamRatings: Record<string, number> | undefined }) => (
    <div className="max-h-[300px] overflow-auto border border-white/10 rounded-xl bg-black/40">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/10 bg-black/60">
            <TableHead className="text-[10px] uppercase font-black py-2">Player</TableHead>
            <TableHead className="text-right text-[10px] uppercase font-black py-2">Rating</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamPlayers.map(p => (
            <TableRow key={p.id} className="border-b border-white/5 hover:bg-white/5">
              <TableCell className="py-2 text-xs font-bold uppercase truncate max-w-[120px]">{p.name.split(' ').pop()}</TableCell>
              <TableCell className="py-2 text-right font-mono font-black text-accent">{teamRatings?.[p.id]?.toFixed(1) || '6.0'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-2 md:p-4 font-mono z-[100] backdrop-blur-sm">
      <div className="max-w-5xl w-full aspect-video bg-black border-4 border-white/10 relative overflow-hidden flex flex-col shadow-2xl rounded-xl">
        <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay bg-cover bg-center" style={{ backgroundImage: stadiumOverlay ? `url("${stadiumOverlay}")` : 'none' }} />

        {showLineups && (
          <div className="absolute inset-0 z-[600] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="max-w-4xl w-full space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-primary font-black uppercase tracking-[0.4em] text-xl">Official Match Lineups</h2>
                <p className="text-white/60 uppercase font-black text-[12px]">{fixture.competition} • {homeTeam.stadium}</p>
              </div>
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="h-12 flex items-center justify-center font-black text-xl uppercase border-b-4 border-white/30" style={{ backgroundColor: homeTeam.color }}>{homeTeam.name}</div>
                  <div className="space-y-1.5">
                    {homeLineup.map(p => (
                      <div key={p.id} className="flex justify-between text-[14px] font-black border-b border-white/10 pb-1">
                        <span className="text-cyan w-8">{p.position}</span>
                        <span className="flex-1 uppercase">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-12 flex items-center justify-center font-black text-xl uppercase border-b-4 border-white/30" style={{ backgroundColor: awayKitColor }}>{awayTeam.name}</div>
                  <div className="space-y-1.5">
                    {awayLineup.map(p => (
                      <div key={p.id} className="flex justify-between text-[14px] font-black border-b border-white/10 pb-1">
                        <span className="text-cyan w-8">{p.position}</span>
                        <span className="flex-1 uppercase">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-6">
                <Button onClick={() => setShowLineups(false)} className="h-16 px-20 bg-accent text-accent-foreground font-black uppercase text-2xl shadow-[8px_8px_0_0_rgba(38,217,117,0.3)] hover:scale-[1.05] transition-transform">KICK OFF MATCH</Button>
              </div>
            </div>
          </div>
        )}

        {isPaused && (
          <div className="absolute inset-0 z-[400] bg-black/95 backdrop-blur-2xl flex flex-col p-4 overflow-hidden animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6 border-b-4 border-primary pb-4">
              <h3 className="text-xl font-black text-primary uppercase tracking-tighter">Tactical Command Center</h3>
              <Button onClick={handleResume} className="bg-accent text-accent-foreground retro-button h-12 px-12 font-black uppercase shadow-xl">Apply & Resume</Button>
            </div>
            <Tabs defaultValue="strategy" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-3 bg-black/40 h-14 mb-6 border border-primary/20 rounded-xl gap-1 p-1">
                <TabsTrigger value="strategy" className="uppercase font-black tracking-widest text-[14px] data-[state=active]:bg-primary">Strategy</TabsTrigger>
                <TabsTrigger value="squad" className="uppercase font-black tracking-widest text-[14px] data-[state=active]:bg-primary">Personnel</TabsTrigger>
                <TabsTrigger value="pitch" className="uppercase font-black tracking-widest text-[14px] data-[state=active]:bg-primary">Tactics Pitch</TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-hidden">
                <TabsContent value="strategy" className="m-0 h-full overflow-auto p-2">
                  <div className="max-w-2xl mx-auto space-y-8">
                    <div className="bg-card/20 border-2 border-primary/20 p-6 rounded-xl">
                      <h4 className="text-[14px] font-black text-primary mb-6 uppercase border-b border-primary/10 pb-2">Formation</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-5-1'].map(f => (
                          <Button key={f} onClick={() => setTactics(f, activeUserTeam.playStyle)} className={cn("h-14 font-mono font-black rounded-lg", activeUserTeam.formation === f ? "bg-accent text-accent-foreground border-accent shadow-lg" : "bg-black/40 text-white border-primary/20")}>{f}</Button>
                        ))}
                      </div>
                      <h4 className="text-[14px] font-black text-primary mt-10 mb-6 uppercase border-b border-primary/10 pb-2">Style</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {(['Long Ball', 'Pass to Feet', 'Counter-Attack', 'Tiki-Taka', 'Direct', 'Park the Bus'] as PlayStyle[]).map(s => (
                          <Button key={s} onClick={() => setTactics(activeUserTeam.formation, s)} className={cn("h-14 text-[14px] font-mono font-black uppercase rounded-lg", activeUserTeam.playStyle === s ? "bg-accent text-accent-foreground border-accent shadow-lg" : "bg-black/40 text-white border-primary/20")}>{s}</Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="squad" className="m-0 h-full overflow-auto">
                  <div className="bg-card/20 border-2 border-primary/20 p-4 rounded-xl h-full">
                    <SquadList players={state.players.filter(p => p.clubId === activeUserTeam.id)} currentMatchRatings={fixture.result?.ratings} onPlayerSwap={handleSwapInteraction} activeSwapId={swapSourceId} />
                  </div>
                </TabsContent>
                <TabsContent value="pitch" className="m-0 h-full overflow-auto flex flex-col items-center p-4">
                  <TacticsPitch team={activeUserTeam} players={state.players.filter(p => p.clubId === activeUserTeam.id)} onPlayerClick={(p) => handleSwapInteraction(p.id)} onPlayerProfile={(p) => setViewingPlayer(p)} activeSwapId={swapSourceId} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        <div className="relative z-10 p-3 flex flex-col items-center gap-1 bg-black/60 border-b border-white/5">
          <div className="bg-primary text-primary-foreground px-6 py-1 text-[10px] font-black shadow-lg border border-white/20 uppercase tracking-[0.3em] rounded-md mb-2">{fixture.competition} - {homeTeam.stadium.toUpperCase()}</div>
          <div className="flex items-center gap-4 w-full">
            <div className="bg-black/90 backdrop-blur-md px-4 py-2 text-[16px] font-black flex-1 text-center uppercase tracking-tight shadow-2xl flex items-center justify-center min-h-[44px] rounded-lg border border-white/10" style={{ color: 'hsl(var(--accent))' }}>
              {activeEvent?.text}
            </div>
            <Button onClick={() => setIsPaused(true)} className="h-11 px-8 bg-red-600 hover:bg-red-700 text-white font-black retro-button shadow-lg"><Pause size={20} className="mr-2" /> PAUSE & TACTICS</Button>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center px-12 mt-6 gap-6 flex-1">
          <div className="w-full flex items-center justify-between gap-8">
            <div className="flex-1 flex flex-col items-end">
              <div className="w-full h-14 border-4 border-white/30 text-white flex items-center justify-center font-black text-2xl shadow-2xl rounded-xl uppercase" style={{ backgroundColor: homeTeam.color }}>{homeTeam.name}</div>
              <div className="flex items-center gap-6 mt-3">
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-black text-white/60 uppercase">Shots: {homeShots}</span>
                  <div className="text-[10px] font-black text-accent uppercase text-right leading-tight max-w-[140px] mt-1 space-y-0.5">
                    {fixture.result?.scorers.filter(s => homeLineup.some(p => p.id === s.playerId) && s.minute <= currentMinute).map(s => (
                      <div key={`${s.playerId}-${s.minute}`}>{state.players.find(p => p.id === s.playerId)?.name.split(' ').pop()} {s.minute}'</div>
                    ))}
                  </div>
                </div>
                <span className="text-7xl font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{currentHomeGoals}</span>
              </div>
            </div>
            
            <div className="bg-black border-4 border-accent p-4 rounded-2xl shadow-[0_0_30px_rgba(38,217,117,0.2)]">
              <div className="text-5xl font-black text-red-600 tabular-nums leading-none tracking-tighter w-[85px] text-center">{currentMinute.toString().padStart(3, '0')}</div>
            </div>

            <div className="flex-1 flex flex-col items-start">
              <div className="w-full h-14 border-4 border-white/30 text-white flex items-center justify-center font-black text-2xl shadow-2xl rounded-xl uppercase" style={{ backgroundColor: awayKitColor }}>{awayTeam.name}</div>
              <div className="flex items-center gap-6 mt-3">
                <span className="text-7xl font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{currentAwayGoals}</span>
                <div className="flex flex-col items-start">
                  <span className="text-[11px] font-black text-white/60 uppercase">Shots: {awayShots}</span>
                  <div className="text-[10px] font-black text-accent uppercase text-left leading-tight max-w-[140px] mt-1 space-y-0.5">
                    {fixture.result?.scorers.filter(s => awayLineup.some(p => p.id === s.playerId) && s.minute <= currentMinute).map(s => (
                      <div key={`${s.playerId}-${s.minute}`}>{state.players.find(p => p.id === s.playerId)?.name.split(' ').pop()} {s.minute}'</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-3xl mt-4">
            <div className="h-5 w-full bg-black/60 border-2 border-white/20 rounded-full overflow-hidden flex shadow-2xl">
              <div className="h-full transition-all duration-1000 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.2)]" style={{ width: `${possession}%`, backgroundColor: homeTeam.color }} />
              <div className="h-full transition-all duration-1000" style={{ width: `${100-possession}%`, backgroundColor: awayKitColor }} />
            </div>
            <div className="flex justify-between px-4 mt-2 text-[11px] font-black text-white/80 uppercase tracking-widest">
              <span>POSSESSION: {possession.toFixed(0)}%</span>
              <span>{(100-possession).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-8 grid grid-cols-2 gap-12 shrink-0 bg-black/40">
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

        {(isHalfTime || isFinished) && (
          <div className="absolute inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in duration-300">
            <div className="max-w-4xl w-full text-center space-y-8">
              <div className="space-y-2">
                <h4 className="text-primary font-black uppercase tracking-[0.4em] text-xl">{isFinished ? 'FULL TIME' : 'HALF TIME'}</h4>
                <div className="text-7xl font-black text-accent drop-shadow-[0_0_20px_rgba(38,217,117,0.4)]">{currentHomeGoals} - {currentAwayGoals}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 py-4">
                <SummaryRatings teamPlayers={homeLineup} teamRatings={fixture.result?.ratings} />
                <SummaryRatings teamPlayers={awayLineup} teamRatings={fixture.result?.ratings} />
              </div>

              <div className="flex flex-col gap-4">
                <Button onClick={() => setIsPaused(true)} variant="outline" className="h-14 font-black uppercase text-lg border-primary/40 hover:bg-primary/10">Tactical Review</Button>
                <Button onClick={isHalfTime ? () => setIsHalfTime(false) : onFinish} className="h-16 bg-primary text-primary-foreground font-black uppercase text-xl shadow-2xl hover:scale-[1.02] transition-transform">
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
