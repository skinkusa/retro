
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
import { Pause, Play, ChevronRight, AlertTriangle, ShieldAlert, Swords, RefreshCw } from 'lucide-react';
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
  
  const homeLineup = state.players.filter(p => homeTeam.lineup.slice(0, 11).includes(p.id));
  const awayLineup = state.players.filter(p => awayTeam.lineup.slice(0, 11).includes(p.id));
  const homeBench = state.players.filter(p => homeTeam.lineup.slice(11, 16).includes(p.id));
  const awayBench = state.players.filter(p => awayTeam.lineup.slice(11, 16).includes(p.id));

  const isUserHome = homeTeam.id === state.userTeamId;
  const activeUserTeam = isUserHome ? homeTeam : awayTeam;

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
          else if (['RED', 'INJURY'].includes(minuteEvent.type)) { setActiveAlert(minuteEvent); }
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

  const handleResume = () => {
    setIsPaused(false);
    setSwapSourceId(null);
  };

  const handleSwapInteraction = (pId: string) => {
    if (!swapSourceId) { setSwapSourceId(pId); }
    else { if (swapSourceId === pId) { setSwapSourceId(null); } else { swapPlayers(swapSourceId, pId); setSwapSourceId(null); } }
  };

  const currentHomeGoals = fixture.result?.scorers.filter(s => homeLineup.some(p => p.id === s.playerId) && s.minute <= currentMinute).length || 0;
  const currentAwayGoals = fixture.result?.scorers.filter(s => awayLineup.some(p => p.id === s.playerId) && s.minute <= currentMinute).length || 0;
  const homeShots = fixture.result ? Math.floor((fixture.result.homeChances || 0) * (currentMinute / 90)) : 0;
  const awayShots = fixture.result ? Math.floor((fixture.result.awayChances || 0) * (currentMinute / 90)) : 0;

  const StrengthBar = ({ value, label, color }: { value: number, label: string, color?: string }) => (
    <div className="flex flex-col items-center gap-1 w-full max-w-[60px]">
      <span className="text-[10px] font-black text-white uppercase">{label}</span>
      <div className="w-full h-20 bg-black/80 border border-white/10 relative overflow-hidden flex flex-col justify-end rounded-md">
        <div className="w-full transition-all duration-700" style={{ height: `${Math.min(100, (value / 50) * 100)}%`, backgroundColor: color || '#26D975' }} />
      </div>
    </div>
  );

  const LineupColumn = ({ team, players, bench }: { team: Team, players: Player[], bench: Player[] }) => (
    <div className="flex-1 flex flex-col gap-1 min-h-0">
      <div className="p-1.5 border-2 border-white/10 text-white font-black text-sm mb-1 rounded-md" style={{ backgroundColor: team.color }}>{team.name.toUpperCase()}</div>
      <div className="bg-black/85 border border-white/10 p-1.5 space-y-0.5 flex-1 overflow-auto rounded-lg">
        {players.map((p) => (
          <div key={p.id} className="grid grid-cols-[60px_1fr_30px] items-center py-1 px-1 hover:bg-white/10">
            <span className="text-[10px] text-cyan font-black uppercase">{p.position}</span>
            <span className="text-[13px] font-black text-white uppercase truncate">{p.name}</span>
            <div className="text-[12px] font-black text-right text-white">---</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/10 flex items-center justify-center p-2 md:p-4 font-mono z-[100] backdrop-blur-sm">
      <div className="max-w-5xl w-full aspect-video bg-black border-4 border-white/10 relative overflow-hidden flex flex-col shadow-2xl rounded-xl">
        <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay bg-cover bg-center" style={{ backgroundImage: stadiumOverlay ? `url("${stadiumOverlay}")` : 'none' }} />

        {showLineups && (
          <div className="absolute inset-0 z-[300] bg-black/95 backdrop-blur-md flex flex-col p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-8 border-b-4 border-primary pb-4">
              <h3 className="text-2xl font-black text-primary uppercase tracking-tighter flex items-center gap-4"><Swords size={32} /> Pre-Match Intelligence</h3>
              <Button onClick={() => setShowLineups(false)} className="bg-accent text-accent-foreground retro-button h-12 px-12 font-black uppercase shadow-xl animate-pulse">Kick Off Match</Button>
            </div>
            <div className="grid grid-cols-2 gap-12 flex-1 min-h-0">
              <LineupColumn team={homeTeam} players={homeLineup} bench={homeBench} />
              <LineupColumn team={awayTeam} players={awayLineup} bench={awayBench} />
            </div>
          </div>
        )}

        {isPaused && (
          <div className="absolute inset-0 z-[400] bg-black/95 backdrop-blur-2xl flex flex-col p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-6 border-b-4 border-primary pb-4">
              <h3 className="text-xl font-black text-primary uppercase tracking-tighter">Tactical Command Center</h3>
              <Button onClick={handleResume} className="bg-accent text-accent-foreground retro-button h-12 px-12 font-black uppercase shadow-xl">Apply Changes & Resume</Button>
            </div>
            <Tabs defaultValue="strategy" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-3 bg-black/40 h-12 mb-6 border border-primary/20 rounded-xl">
                <TabsTrigger value="strategy" className="uppercase font-black tracking-widest">Strategy</TabsTrigger>
                <TabsTrigger value="squad" className="uppercase font-black tracking-widest">Personnel</TabsTrigger>
                <TabsTrigger value="pitch" className="uppercase font-black tracking-widest">Tactics Pitch</TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-hidden">
                <TabsContent value="strategy" className="m-0 h-full overflow-auto">
                  <div className="max-w-2xl mx-auto space-y-8 py-4">
                    <div className="bg-card/20 border-2 border-primary/20 p-6 rounded-xl">
                      <h4 className="text-[14px] font-black text-primary mb-6 uppercase border-b border-primary/10 pb-2">Formation</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-5-1'].map(f => (
                          <Button key={f} onClick={() => setTactics(f, activeUserTeam.playStyle)} className={cn("h-14 font-mono font-black", activeUserTeam.formation === f ? "bg-accent text-accent-foreground border-accent" : "bg-black/40 text-white border-primary/20")}>{f}</Button>
                        ))}
                      </div>
                      <h4 className="text-[14px] font-black text-primary mt-10 mb-6 uppercase border-b border-primary/10 pb-2">Style</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {(['Long Ball', 'Pass to Feet', 'Counter-Attack', 'Tiki-Taka', 'Direct', 'Park the Bus'] as PlayStyle[]).map(s => (
                          <Button key={s} onClick={() => setTactics(activeUserTeam.formation, s)} className={cn("h-14 text-[14px] font-mono font-black uppercase", activeUserTeam.playStyle === s ? "bg-accent text-accent-foreground border-accent" : "bg-black/40 text-white border-primary/20")}>{s}</Button>
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
                <TabsContent value="pitch" className="m-0 h-full overflow-auto">
                  <div className="bg-card/20 border-2 border-primary/20 p-4 rounded-xl h-full flex flex-col items-center">
                    <TacticsPitch team={activeUserTeam} players={state.players.filter(p => p.clubId === activeUserTeam.id)} onPlayerClick={(p) => handleSwapInteraction(p.id)} onPlayerProfile={(p) => setViewingPlayer(p)} activeSwapId={swapSourceId} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        <div className="relative z-10 p-3 flex flex-col items-center gap-1">
          <div className="bg-primary/90 text-primary-foreground px-6 py-1 text-[10px] font-bold shadow-lg border border-white/20 uppercase tracking-widest rounded-md">{fixture.competition} - {homeTeam.stadium.toUpperCase()}</div>
          <div className="bg-black/90 backdrop-blur-md px-4 py-1.5 text-sm md:text-base font-black w-full text-center uppercase tracking-tight shadow-xl flex items-center justify-center min-h-[36px] rounded-lg" style={{ color: 'hsl(var(--accent))' }}>{activeEvent?.text}</div>
        </div>

        <div className="relative z-10 flex flex-col items-center px-12 mt-4 gap-4 flex-1">
          <div className="w-full flex items-center justify-between gap-4">
            <div className="flex-1 flex flex-col items-end">
              <div className="w-full h-12 border-4 border-white/20 text-white flex items-center justify-center font-black text-xl shadow-xl rounded-lg" style={{ backgroundColor: homeTeam.color }}>{homeTeam.name.toUpperCase()}</div>
              <div className="flex items-center gap-4 mt-2"><span className="text-[12px] font-black text-muted-foreground uppercase">Shots: {homeShots}</span><span className="text-5xl font-black text-white tabular-nums">{currentHomeGoals}</span></div>
            </div>
            <div className="bg-black border-4 border-accent/40 p-3 rounded-xl"><div className="text-4xl font-black text-red-600 tabular-nums leading-none tracking-tighter">{currentMinute.toString().padStart(3, '0')}</div></div>
            <div className="flex-1 flex flex-col items-start">
              <div className="w-full h-12 border-4 border-white/20 text-white flex items-center justify-center font-black text-xl shadow-xl rounded-lg" style={{ backgroundColor: awayTeam.color }}>{awayTeam.name.toUpperCase()}</div>
              <div className="flex items-center gap-4 mt-2"><span className="text-5xl font-black text-white tabular-nums">{currentAwayGoals}</span><span className="text-[12px] font-black text-muted-foreground uppercase">Shots: {awayShots}</span></div>
            </div>
          </div>
          <div className="w-full max-w-2xl mt-4">
            <div className="h-4 w-full bg-black/40 border-2 border-white/10 rounded-full overflow-hidden flex">
              <div className="h-full transition-all duration-1000" style={{ width: `50%`, backgroundColor: homeTeam.color }} />
              <div className="h-full transition-all duration-1000" style={{ width: `50%`, backgroundColor: awayTeam.color }} />
            </div>
          </div>
        </div>

        <div className="relative z-10 p-6 grid grid-cols-2 gap-8 shrink-0">
          <div className="flex justify-center w-full gap-4"><StrengthBar value={25} label="DEF" color={homeTeam.color} /><StrengthBar value={25} label="MID" color={homeTeam.color} /><StrengthBar value={25} label="ATT" color={homeTeam.color} /></div>
          <div className="flex justify-center w-full gap-4"><StrengthBar value={25} label="DEF" color={awayTeam.color} /><StrengthBar value={25} label="MID" color={awayTeam.color} /><StrengthBar value={25} label="ATT" color={awayTeam.color} /></div>
        </div>

        {(isHalfTime || isFinished) && (
          <div className="absolute inset-0 z-[250] bg-black/95 backdrop-blur-xl flex flex-col p-6 overflow-hidden">
            <div className="flex flex-col items-center mb-4"><h4 className="text-primary font-black uppercase tracking-widest">{isFinished ? 'FULL TIME' : 'HALF TIME'}</h4><div className="text-4xl font-black text-accent">{currentHomeGoals} - {currentAwayGoals}</div></div>
            <div className="mt-4 flex gap-4"><Button onClick={() => setIsPaused(true)} variant="outline" className="flex-1 font-black">TACTICS</Button><Button onClick={isHalfTime ? () => setIsHalfTime(false) : onFinish} className="flex-[1.5] bg-primary font-black">{isHalfTime ? 'KICK OFF SECOND HALF' : 'BACK TO OFFICE'}</Button></div>
          </div>
        )}

        <PlayerProfile player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
      </div>
    </div>
  );
}
