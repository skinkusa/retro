
"use client"

import { Player, Position } from '@/types/game';
import { useGame } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Heart, DollarSign, Check, X, FileSearch, TrendingUp, TrendingDown, Clock, UserCircle, Activity, Briefcase, History, Megaphone } from 'lucide-react';
import { cn, formatMoney } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';

interface PlayerProfileProps {
  player: Player | null;
  onClose: () => void;
  /** Open profile on this tab (e.g. 'contract'). */
  defaultTab?: string;
}

export function PlayerProfile({ player, onClose, defaultTab = 'overview' }: PlayerProfileProps) {
  const { state, toggleShortlist, toggleTransferList, buyPlayer, renewContract, acceptBid, rejectBid } = useGame();
  
  const userTeam = state.teams.find(t => t.id === state.userTeamId);
  const scout = userTeam?.staff.find(st => st.role === 'SCOUT');
  const isOwnPlayer = player?.clubId === state.userTeamId;
  const canAfford = userTeam && player && userTeam.budget >= player.value;

  // Negotiation State
  const [offeredYears, setOfferedYears] = useState(3);
  const [offeredWage, setOfferedWage] = useState(0);
  const [patience, setPatience] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);

  const targetWage = useMemo(() => {
    if (!player) return 0;
    const base = 500;
    const skillMult = player.attributes.skill * 1.5;
    const potMult = 1 + (player.attributes.potential / 20);
    return Math.floor(base * skillMult * potMult);
  }, [player]);

  useEffect(() => {
    if (player) {
      setOfferedWage(targetWage);
      setOfferedYears(3);
      setPatience(3);
      setFeedback(null);
    }
  }, [player, targetWage]);

  const activeOffer = useMemo(() => {
    if (!player || !isOwnPlayer) return null;
    return state.transferMarket.incomingBids.find(b => b.playerId === player.id);
  }, [player, state.transferMarket.incomingBids, isOwnPlayer]);

  if (!player) return null;

  const handleNegotiate = () => {
    if (patience <= 0) {
      setFeedback("I'VE HAD ENOUGH. WE'LL TALK NEXT WEEK.");
      return;
    }
    if (!targetWage) return;

    const wageGap = (offeredWage - targetWage) / targetWage;
    const yearWeight = (offeredYears - 3) * 0.05;
    const totalScore = wageGap + yearWeight;

    if (totalScore >= -0.05) {
      renewContract(player.id, offeredYears, offeredWage);
      setFeedback("DONE DEAL. WHERE DO I SIGN?");
      setTimeout(onClose, 1500);
    } else {
      setPatience(p => p - 1);
      if (wageGap < -0.2) {
        setFeedback("THAT WAGE IS INSULTING. I'M A PROFESSIONAL!");
      } else if (offeredYears < 2) {
        setFeedback("I'M LOOKING FOR MORE SECURITY IN MY CONTRACT.");
      } else {
        setFeedback("WE'RE GETTING CLOSER, BUT I WANT A BETTER DEAL.");
      }
    }
  };

  const getPositionLabel = (pos: Position) => {
    switch(pos) {
      case 'GK': return 'GOALKEEPER';
      case 'DF': return 'DEFENDER';
      case 'MF': return 'MIDFIELDER';
      case 'FW': return 'FORWARD';
      case 'DM': return 'DEF/MID HYBRID';
      default: return pos;
    }
  };

  const renderAttribute = (label: string, value: number, tooltip: string) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex justify-between items-center py-1 max-[1300px]:py-1.5 border-b border-white/5 cursor-help hover:bg-white/5 transition-colors px-1">
          <span className="text-[11px] max-[1300px]:text-[14px] uppercase text-muted-foreground font-black tracking-tight">{label}</span>
          <span className={`font-mono text-[13px] max-[1300px]:text-[18px] font-black ${value >= 15 ? 'text-accent' : value >= 10 ? 'text-primary' : 'text-white'}`}>
            {typeof value === 'number' ? value.toFixed(1) : value}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-[11px] max-[1300px]:text-[14px] font-bold">{tooltip}</TooltipContent>
    </Tooltip>
  );

  const getPotentialHint = () => {
    const pot = player.attributes.potential;
    if (player.age > 28) return "VETERAN. REACHED FULL POTENTIAL.";
    if (pot >= 18) return "WONDERKID. DESTINED FOR GREATNESS.";
    if (pot >= 15) return "HIGH POTENTIAL. COULD BE A STAR.";
    if (pot >= 12) return "SOLID PROSPECT. WILL IMPROVE.";
    return "LACKS CEILING. UNLIKELY TO IMPROVE.";
  };

  const getHiddenTraitLabel = (attr: keyof typeof player.attributes) => {
    const val = player.attributes[attr];
    if (attr === 'injuryProne') {
      if (val > 15) return { text: 'HIGH RISK', color: 'text-red-500' };
      if (val > 10) return { text: 'OCCASIONAL', color: 'text-yellow-500' };
      return { text: 'DURABLE', color: 'text-green-500' };
    }
    if (attr === 'consistency') {
      if (val > 15) return { text: 'RELIABLE', color: 'text-green-500' };
      if (val > 10) return { text: 'AVERAGE', color: 'text-white' };
      return { text: 'MERCURIAL', color: 'text-orange-500' };
    }
    if (attr === 'professionalism') {
      if (val > 15) return { text: 'MODEL PRO', color: 'text-accent' };
      if (val > 10) return { text: 'COMMITTED', color: 'text-white' };
      return { text: 'DIFFICULT', color: 'text-red-500' };
    }
    return { text: 'UNKNOWN', color: 'text-muted-foreground' };
  };

  return (
    <Dialog open={!!player} onOpenChange={onClose}>
      <DialogContent className="bg-card border-primary p-0 overflow-hidden w-[95vw] max-w-[1600px] h-[95vh] max-h-[95vh] flex flex-col font-mono rounded-2xl">
        <DialogHeader className="bg-primary p-2 max-[1300px]:p-2 shrink-0 rounded-t-xl">
          <DialogTitle className="text-primary-foreground uppercase flex justify-between items-center text-lg max-[1300px]:text-lg font-black tracking-tight">
            <div className="flex items-center gap-1.5 max-[1300px]:gap-2">
                <div className="flex flex-col">
                  <span className="leading-none">{player.name}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[12px] max-[1300px]:text-[16px] opacity-70 font-black tracking-widest">
                      {(player.nationality || 'England').toUpperCase()}
                    </span>
                    <span className="text-[14px] max-[1300px]:text-[20px]">
                      {player.nationality === 'France' ? '🇫🇷' : 
                       player.nationality === 'Germany' ? '🇩🇪' : 
                       player.nationality === 'Spain' ? '🇪🇸' : 
                       player.nationality === 'Italy' ? '🇮🇹' : 
                       player.nationality === 'Brazil' ? '🇧🇷' : 
                       player.nationality === 'Netherlands' ? '🇳🇱' : '🏴󠁧󠁢󠁥󠁮󠁧󠁿'}
                    </span>
                  </div>
                </div>
               <TooltipProvider>
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                        onClick={() => toggleShortlist(player.id)}
                        className={cn(
                          "transition-all active:scale-90 p-1 rounded-full",
                          player.isShortlisted ? "text-black fill-black" : "text-primary-foreground/50 hover:text-primary-foreground"
                        )}
                    >
                        <Heart size={24} className={cn("max-[1300px]:w-8 max-[1300px]:h-8", player.isShortlisted ? "fill-current" : "")} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="font-black">Shortlist</TooltipContent>
                 </Tooltip>
               </TooltipProvider>
            </div>
            <span className="text-[12px] max-[1300px]:text-[14px] opacity-70 font-mono tracking-[0.1em] hidden sm:inline">PLAYER PROFILE V.1993</span>
          </DialogTitle>
          <DialogDescription className="sr-only">Detailed player profile for {player.name}.</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="flex flex-col flex-1 min-h-0">
          <TabsList className="bg-black/40 border-b border-primary/20 h-9 max-[1300px]:h-11 p-0.5 gap-0.5 rounded-none shrink-0">
            <TabsTrigger value="overview" className="flex-1 uppercase font-black tracking-tight text-[10px] max-[1300px]:text-[12px] rounded-md data-[state=active]:bg-primary h-full">
              <UserCircle size={12} className="mr-1 max-[1300px]:w-4 max-[1300px]:h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="attributes" className="flex-1 uppercase font-black tracking-tight text-[10px] max-[1300px]:text-[12px] rounded-md data-[state=active]:bg-primary h-full">
              <Activity size={12} className="mr-1 max-[1300px]:w-4 max-[1300px]:h-4" /> Attributes
            </TabsTrigger>
            <TabsTrigger value="contract" className="flex-1 uppercase font-black tracking-tight text-[10px] max-[1300px]:text-[12px] rounded-md data-[state=active]:bg-primary h-full">
              <Briefcase size={12} className="mr-1 max-[1300px]:w-4 max-[1300px]:h-4" /> Contract
            </TabsTrigger>
            <TabsTrigger value="report" className="flex-1 uppercase font-black tracking-tight text-[10px] max-[1300px]:text-[12px] rounded-md data-[state=active]:bg-primary h-full">
              <FileSearch size={12} className="mr-1 max-[1300px]:w-4 max-[1300px]:h-4" /> Report
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 overflow-auto">
            <div className="p-2 md:p-3">
              <TabsContent value="overview" className="mt-0 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-full max-h-[calc(95vh-220px)] min-h-0">
                  <div className="flex flex-col gap-2 min-h-0">
                    <div className="grid grid-cols-4 gap-1.5 text-center shrink-0">
                      <div className="bg-black/60 p-2 max-[1300px]:p-2 border border-primary/20 rounded-lg shadow-inner">
                        <div className="text-[9px] max-[1300px]:text-[12px] text-muted-foreground uppercase font-black mb-0.5 tracking-tighter">Age</div>
                        <div className="text-xl max-[1300px]:text-2xl font-black text-white">{player.age}</div>
                      </div>
                      <div className="bg-black/60 p-2 max-[1300px]:p-2 border border-primary/20 rounded-lg shadow-inner">
                        <div className="text-[9px] max-[1300px]:text-[12px] text-muted-foreground uppercase font-black mb-0.5 tracking-tighter">Pos</div>
                        <div className="text-base max-[1300px]:text-xl font-black text-cyan leading-tight">{player.position}</div>
                        <div className="text-[8px] max-[1300px]:text-[10px] opacity-60 font-black">({player.side})</div>
                      </div>
                      <div className="bg-black/60 p-2 max-[1300px]:p-2 border border-primary/20 rounded-lg shadow-inner">
                        <div className="text-[9px] max-[1300px]:text-[12px] text-muted-foreground uppercase font-black mb-0.5 tracking-tighter">Value</div>
                        <div className="text-base max-[1300px]:text-xl font-black text-accent">{formatMoney(player.value)}</div>
                      </div>
                      <div className="bg-black/60 p-2 max-[1300px]:p-2 border border-primary/20 rounded-lg shadow-inner">
                        <div className="text-[9px] max-[1300px]:text-[12px] text-muted-foreground uppercase font-black mb-0.5 tracking-tighter">Morale</div>
                        <div className={cn("text-lg max-[1300px]:text-xl font-black", player.morale > 70 ? "text-green-500" : "text-yellow-500")}>{player.morale}%</div>
                      </div>
                    </div>
                    {player.seasonStats.apps > 0 && (
                      <div className="bg-black/60 p-2 max-[1300px]:p-3 border border-primary/20 rounded-lg shadow-inner shrink-0">
                        <h4 className="text-[10px] max-[1300px]:text-[14px] font-black text-primary uppercase border-b border-primary/10 pb-1 mb-2">Season Stats</h4>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
                          <div><div className="text-[8px] max-[1300px]:text-[10px] text-muted-foreground uppercase font-black">App</div><div className="text-sm max-[1300px]:text-base font-black text-white">{player.seasonStats.apps}</div></div>
                          <div><div className="text-[8px] max-[1300px]:text-[10px] text-muted-foreground uppercase font-black">Gls</div><div className="text-sm max-[1300px]:text-base font-black text-cyan">{player.seasonStats.goals}</div></div>
                          <div><div className="text-[8px] max-[1300px]:text-[10px] text-muted-foreground uppercase font-black">Shot</div><div className="text-sm max-[1300px]:text-base font-black text-white">{player.seasonStats.shots ?? '—'}</div></div>
                          <div><div className="text-[8px] max-[1300px]:text-[10px] text-muted-foreground uppercase font-black">SOT</div><div className="text-sm max-[1300px]:text-base font-black text-white">{player.seasonStats.shotsOnTarget ?? '—'}</div></div>
                          <div><div className="text-[8px] max-[1300px]:text-[10px] text-muted-foreground uppercase font-black">CS</div><div className="text-sm max-[1300px]:text-base font-black text-white">{player.position === 'GK' ? (player.seasonStats.cleanSheets ?? '—') : '—'}</div></div>
                          <div><div className="text-[8px] max-[1300px]:text-[10px] text-muted-foreground uppercase font-black">Min</div><div className="text-sm max-[1300px]:text-base font-black text-white">{player.seasonStats.minutesPlayed ?? '—'}</div></div>
                          <div><div className="text-[8px] max-[1300px]:text-[10px] text-muted-foreground uppercase font-black">Rat</div><div className="text-sm max-[1300px]:text-base font-black text-accent">{player.seasonStats.avgRating.toFixed(2)}</div></div>
                          <div><div className="text-[8px] max-[1300px]:text-[10px] text-muted-foreground uppercase font-black">MoM</div><div className="text-sm max-[1300px]:text-base font-black text-primary">{player.seasonStats.manOfTheMatch ?? 0}</div></div>
                        </div>
                      </div>
                    )}
                    {/* Recent Form Display */}
                    <div className="bg-black/40 p-2 max-[1300px]:p-3 border border-primary/20 rounded-lg shrink-0 mt-1">
                      <h4 className="text-[10px] max-[1300px]:text-[14px] font-black text-primary uppercase border-b border-primary/10 pb-1 mb-1.5 flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span>Recent Form</span>
                          <Tooltip>
                            <TooltipTrigger><Info size={10} className="text-muted-foreground" /></TooltipTrigger>
                            <TooltipContent className="max-w-[200px] text-[10px]">Average of the last 5 match ratings. High form provides a morale and performance boost.</TooltipContent>
                          </Tooltip>
                        </div>
                        <TrendingUp size={12} className="opacity-50" />
                      </h4>
                      <div className="flex gap-1.5">
                        {player.recentForm?.length > 0 ? (
                          player.recentForm.map((rating, i) => (
                            <div key={i} className={cn(
                              "flex-1 text-center py-1 rounded text-[11px] font-black",
                              rating >= 7.5 ? "bg-accent/20 text-accent border border-accent/30" :
                              rating >= 6.5 ? "bg-primary/20 text-primary border border-primary/30" :
                              "bg-red-500/20 text-red-500 border border-red-500/30"
                            )}>
                              {rating.toFixed(1)}
                            </div>
                          ))
                        ) : (
                          <div className="text-[10px] text-muted-foreground italic">No recent matches</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/20 p-2 max-[1300px]:p-3 rounded-lg shrink-0 lg:shrink flex flex-col gap-2">
                    <h4 className="text-[10px] max-[1300px]:text-[14px] font-black text-primary uppercase border-b border-primary/10 pb-1">Availability</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="space-y-0.5"><span className="text-[9px] max-[1300px]:text-[12px] text-muted-foreground uppercase font-bold">Fitness</span><div className="text-base max-[1300px]:text-xl font-black text-white">{player.fitness}%</div></div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] max-[1300px]:text-[12px] text-muted-foreground uppercase font-bold">Sharpness</span>
                          <Tooltip>
                            <TooltipTrigger><Info size={10} className="text-muted-foreground" /></TooltipTrigger>
                            <TooltipContent className="max-w-[200px] text-[10px]">Physical readiness for competitive play. Sharpness decays without game time and penalizes attributes if below 80%.</TooltipContent>
                          </Tooltip>
                        </div>
                        <div className={cn("text-base max-[1300px]:text-xl font-black", player.condition >= 80 ? "text-cyan" : "text-orange-500")}>{player.condition}%</div>
                      </div>
                      <div className="space-y-0.5"><span className="text-[9px] max-[1300px]:text-[12px] text-muted-foreground uppercase font-bold">Status</span><div className={cn("text-base max-[1300px]:text-xl font-black", player.status === 'FIT' ? "text-accent" : "text-red-500")}>{player.status.toUpperCase()}</div></div>
                    </div>
                    {player.injury && (
                      <div className="p-1.5 bg-red-600/10 border border-red-600/30 text-red-500 text-[10px] max-[1300px]:text-[14px] font-black uppercase text-center rounded mt-auto">SIDELINED: {player.injury.type} ({player.injury.weeksRemaining}W)</div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attributes" className="mt-0">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 max-[1300px]:gap-x-10 gap-y-4 max-[1300px]:gap-y-8">
                  <div className="space-y-0">
                    <h4 className="text-[12px] max-[1300px]:text-[18px] font-black text-primary uppercase border-b-2 border-primary/30 mb-2 pb-1">Physical</h4>
                    {renderAttribute("Pace", player.attributes.pace, "Impacts speed and off-the-ball runs.")}
                    {renderAttribute("Stamina", player.attributes.stamina, "Affects how quickly fitness drops.")}
                    {renderAttribute("Heading", player.attributes.heading, "Quality of aerial duels.")}
                  </div>
                  <div className="space-y-0">
                    <h4 className="text-[12px] max-[1300px]:text-[18px] font-black text-primary uppercase border-b-2 border-primary/30 mb-2 pb-1">Technical</h4>
                    {renderAttribute("Skill", player.attributes.skill, "Overall ball control quality.")}
                    {renderAttribute("Passing", player.attributes.passing, "Precision for distribution.")}
                    {renderAttribute("Shooting", player.attributes.shooting, "Accuracy of goal attempts.")}
                  </div>
                  <div className="space-y-0">
                    <h4 className="text-[12px] max-[1300px]:text-[18px] font-black text-primary uppercase border-b-2 border-primary/30 mb-2 pb-1">Mental</h4>
                    {renderAttribute("Influence", player.attributes.influence, "Leadership and impact.")}
                    {renderAttribute("Temper", player.attributes.temperament, "Discipline and composure.")}
                    {renderAttribute("Consistency", player.attributes.consistency, "Stability of performance.")}
                  </div>
                  <div className="space-y-0">
                    <h4 className="text-[12px] max-[1300px]:text-[18px] font-black text-primary uppercase border-b-2 border-primary/30 mb-2 pb-1">Special</h4>
                    {renderAttribute("Keeper", player.attributes.goalkeeping, "Primary shot-stopping ability.")}
                    {renderAttribute("Dirty", player.attributes.dirtiness, "Likelihood of fouls/cards.")}
                    {renderAttribute("Professional", player.attributes.professionalism, "Attitude in training.")}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contract" className="mt-0 space-y-2">
                <div className="bg-black/60 p-3 max-[1300px]:p-4 border border-primary/20 rounded-lg shadow-inner flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] max-[1300px]:text-[14px] text-muted-foreground uppercase font-black">Wage</span>
                    <div className="text-xl max-[1300px]:text-2xl font-black text-white">{formatMoney(player.wage)}/wk</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] max-[1300px]:text-[14px] text-muted-foreground uppercase font-black">Expiry</span>
                    <div className={cn("text-xl max-[1300px]:text-2xl font-black", player.contractYears <= 1 ? "text-red-500" : "text-white")}>
                      {player.contractYears} Seasons
                    </div>
                  </div>
                </div>

                {isOwnPlayer && (
                  <div className="bg-primary/10 border border-primary/20 p-2 max-[1300px]:p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 max-[1300px]:p-2 rounded-md", player.isListed ? "bg-accent/20 text-accent" : "bg-black/40 text-muted-foreground")}>
                        <Megaphone size={16} className="max-[1300px]:w-5 max-[1300px]:h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] max-[1300px]:text-[14px] font-black text-white uppercase">Transfer Status</div>
                        <div className="text-[8px] max-[1300px]:text-[10px] text-muted-foreground uppercase">{player.isListed ? 'Listed' : 'Not Listed'}</div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => toggleTransferList(player.id)}
                      className={cn(
                        "h-8 max-[1300px]:h-10 px-4 max-[1300px]:px-6 font-black text-[10px] max-[1300px]:text-[14px] uppercase retro-button",
                        player.isListed ? "bg-red-600 text-white" : "bg-accent text-accent-foreground"
                      )}
                    >
                      {player.isListed ? 'UNLIST' : 'LIST'}
                    </Button>
                  </div>
                )}

                {activeOffer && (
                  <div className="bg-accent/10 border border-accent p-3 max-[1300px]:p-4 space-y-2 max-[1300px]:space-y-3 rounded-lg shadow-lg">
                    <div className="text-[11px] max-[1300px]:text-[14px] font-black text-accent uppercase flex justify-between">
                      <span>Incoming Bid</span>
                      <span>OFFICIAL OFFER</span>
                    </div>
                    <p className="text-base max-[1300px]:text-lg font-bold text-white leading-tight">
                      {state.teams.find(t => t.id === activeOffer.fromTeamId)?.name} bid <span className="text-accent font-black">{formatMoney(activeOffer.amount)}</span>.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => { acceptBid(activeOffer.id); onClose(); }} className="flex-1 bg-accent text-accent-foreground retro-button h-9 max-[1300px]:h-11 text-[11px] max-[1300px]:text-[14px] font-black">
                        <Check size={16} className="mr-1.5 max-[1300px]:w-4 max-[1300px]:h-4" /> ACCEPT
                      </Button>
                      <Button onClick={() => rejectBid(activeOffer.id)} variant="destructive" className="flex-1 retro-button h-9 max-[1300px]:h-11 text-[11px] max-[1300px]:text-[14px] font-black">
                        <X size={16} className="mr-1.5 max-[1300px]:w-4 max-[1300px]:h-4" /> REJECT
                      </Button>
                    </div>
                  </div>
                )}

                {!isOwnPlayer && (
                  <Button 
                    onClick={() => buyPlayer(player.id)}
                    disabled={!canAfford}
                    className="w-full bg-accent text-accent-foreground font-black retro-button h-12 max-[1300px]:h-16 uppercase text-[12px] max-[1300px]:text-[18px] tracking-widest shadow-xl rounded-lg"
                  >
                    <DollarSign size={20} className="mr-1.5 max-[1300px]:w-6 max-[1300px]:h-6" /> PROPOSE TRANSFER BID
                  </Button>
                )}

                {isOwnPlayer && (
                  <div className="bg-primary/15 border border-primary/20 p-3 max-[1300px]:p-4 space-y-3 max-[1300px]:space-y-4 rounded-lg shadow-inner">
                     <div className="flex justify-between items-center border-b border-primary/10 pb-1.5 max-[1300px]:pb-2">
                       <span className="text-[11px] max-[1300px]:text-[14px] font-black text-primary uppercase tracking-tight">Negotiation Console</span>
                       <div className="flex items-center gap-1.5">
                          <span className="text-[10px] max-[1300px]:text-[12px] text-muted-foreground font-black">Patience:</span>
                          <div className="flex gap-1 max-[1300px]:gap-2">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className={cn("w-3 h-3 max-[1300px]:w-4 max-[1300px]:h-4 rounded-full", i < patience ? "bg-accent shadow-[0_0_5px_rgba(38,217,117,0.5)]" : "bg-black/40")} />
                            ))}
                          </div>
                       </div>
                     </div>

                     {feedback && (
                       <div className="bg-black/80 p-2 max-[1300px]:p-3 border border-accent/20 text-center animate-in fade-in zoom-in duration-300 rounded-lg">
                          <p className="text-[12px] max-[1300px]:text-[16px] font-black text-accent italic uppercase">{feedback}</p>
                       </div>
                     )}
 
                     <div className="grid grid-cols-2 gap-4 max-[1300px]:gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] max-[1300px]:text-[12px] text-muted-foreground uppercase font-black">Term (Years)</label>
                          <div className="flex items-center gap-1.5 max-[1300px]:gap-2">
                            <Button onClick={() => setOfferedYears(y => Math.max(1, y - 1))} className="h-8 w-8 max-[1300px]:h-10 max-[1300px]:w-10 retro-button bg-black/40"><TrendingDown size={14} className="max-[1300px]:w-4 max-[1300px]:h-4" /></Button>
                            <span className="flex-1 text-center font-black text-white text-base max-[1300px]:text-xl">{offeredYears}Y</span>
                            <Button onClick={() => setOfferedYears(y => Math.min(5, y + 1))} className="h-8 w-8 max-[1300px]:h-10 max-[1300px]:w-10 retro-button bg-black/40"><TrendingUp size={14} className="max-[1300px]:w-4 max-[1300px]:h-4" /></Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] max-[1300px]:text-[12px] text-muted-foreground uppercase font-black">Weekly Wage</label>
                          <div className="relative">
                            <Input type="number" value={offeredWage} onChange={(e) => setOfferedWage(parseInt(e.target.value) || 0)} className="bg-black/40 border-primary/20 h-8 max-[1300px]:h-10 text-[12px] max-[1300px]:text-[16px] font-black pl-5 max-[1300px]:pl-7 rounded-md" />
                            <span className="absolute left-2 max-[1300px]:left-2.5 top-2 max-[1300px]:top-2.5 text-[10px] max-[1300px]:text-[14px] text-muted-foreground font-black">£</span>
                          </div>
                        </div>
                     </div>
 
                     <Button onClick={handleNegotiate} disabled={patience <= 0} className="w-full bg-primary text-primary-foreground font-black retro-button h-10 max-[1300px]:h-12 uppercase text-[11px] max-[1300px]:text-[14px] shadow-lg">
                       <Clock size={16} className="mr-1.5 max-[1300px]:w-4 max-[1300px]:h-4" /> SUBMIT OFFER
                     </Button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-[1300px]:gap-3">
                  <div className="bg-primary/10 p-3 max-[1300px]:p-4 border border-primary/30 flex flex-col items-center gap-2 max-[1300px]:gap-3 rounded-lg shadow-sm">
                    <div className="text-[11px] max-[1300px]:text-[14px] text-primary font-black uppercase tracking-tight border-b border-primary/10 w-full text-center pb-1">Scout Conclusion</div>
                    <div className="text-base max-[1300px]:text-xl font-black text-white uppercase italic text-center leading-tight">{getPotentialHint()}</div>
                    <div className="bg-black/40 px-3 py-1 max-[1300px]:py-2 text-[10px] max-[1300px]:text-[14px] font-black text-accent uppercase tracking-tighter border border-accent/20 rounded">
                      Best Role: {getPositionLabel(player.position)}
                    </div>
                  </div>

                  <div className="bg-black/60 p-3 max-[1300px]:p-4 border border-primary/20 space-y-2 max-[1300px]:space-y-3 rounded-lg shadow-inner">
                    <div className="flex items-center gap-1.5 border-b border-primary/20 pb-1">
                      <TrendingUp size={18} className="text-primary max-[1300px]:w-5 max-[1300px]:h-5" />
                      <span className="text-[11px] max-[1300px]:text-[14px] font-black text-primary uppercase tracking-tight">Development</span>
                    </div>
                    {scout ? (
                      <div className="space-y-2 max-[1300px]:space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-[11px] max-[1300px]:text-[14px] uppercase font-black text-muted-foreground">Progression:</span>
                            <div className="flex-1 max-w-[100px] h-2 bg-black/40 rounded-full mx-3 overflow-hidden border border-white/5">
                               <div 
                                className="h-full bg-accent transition-all duration-500" 
                                style={{ width: `${Math.min(100, (player.developmentPoints / 150) * 100)}%` }} 
                               />
                            </div>
                            <span className="text-[11px] max-[1300px]:text-[14px] font-black text-white">{Math.min(100, Math.floor((player.developmentPoints / 150) * 100))}%</span>
                         </div>
                         <p className="text-[10px] max-[1300px]:text-[12px] text-muted-foreground italic leading-tight uppercase font-black">
                            {player.age < 23 ? "Great growth potential." : 
                             player.age >= 31 ? "Physical decline with age." :
                             "Reached peak performance."}
                         </p>
                      </div>
                    ) : (
                      <div className="text-[11px] max-[1300px]:text-[14px] text-muted-foreground font-black italic text-center py-4 max-[1300px]:py-6 opacity-40">
                        HIRE SCOUT
                      </div>
                    )}
                  </div>

                  <div className="bg-black/60 p-3 max-[1300px]:p-4 border border-primary/20 space-y-2 max-[1300px]:space-y-3 rounded-lg shadow-inner">
                    <div className="flex items-center gap-1.5 border-b border-primary/20 pb-1">
                      <FileSearch size={18} className="text-primary max-[1300px]:w-5 max-[1300px]:h-5" />
                      <span className="text-[11px] max-[1300px]:text-[14px] font-black text-primary uppercase tracking-tight">Psych Profile</span>
                    </div>
                    {scout ? (
                      <div className="space-y-2 max-[1300px]:space-y-3">
                        <div className="flex justify-between text-[11px] max-[1300px]:text-[14px] uppercase font-black tracking-tight">
                          <span className="text-muted-foreground">Focus:</span>
                          <span className={getHiddenTraitLabel('consistency').color}>{getHiddenTraitLabel('consistency').text}</span>
                        </div>
                        <div className="flex justify-between text-[11px] max-[1300px]:text-[14px] uppercase font-black tracking-tight">
                          <span className="text-muted-foreground">Durability:</span>
                          <span className={getHiddenTraitLabel('injuryProne').color}>{getHiddenTraitLabel('injuryProne').text}</span>
                        </div>
                        <div className="flex justify-between text-[11px] max-[1300px]:text-[14px] uppercase font-black tracking-tight">
                          <span className="text-muted-foreground">Integrity:</span>
                          <span className={getHiddenTraitLabel('professionalism').color}>{getHiddenTraitLabel('professionalism').text}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] max-[1300px]:text-[14px] text-muted-foreground font-black italic text-center py-4 max-[1300px]:py-6 opacity-40">
                        HIRE SCOUT
                      </div>
                    )}
                  </div>
                </div>
                 )}
                  </div>
                </div>

                {(player.seasonStats.apps > 0 || (player.history?.length ?? 0) > 0) && (
                  <div className="bg-black/60 p-3 max-[1300px]:p-4 border border-primary/20 rounded-lg shadow-inner mt-2">
                    <div className="flex items-center gap-1.5 border-b border-primary/20 pb-1.5 mb-2 max-[1300px]:pb-2 max-[1300px]:mb-3">
                      <History size={16} className="text-primary max-[1300px]:w-5 max-[1300px]:h-5" />
                      <h4 className="text-[11px] max-[1300px]:text-[14px] font-black text-primary uppercase tracking-tight">Career Stats</h4>
                    </div>
                    <div className="flex flex-wrap gap-x-3 max-[1300px]:gap-x-4 gap-y-0.5 text-[10px] max-[1300px]:text-[12px] font-black border-b border-white/5 pb-1.5 mb-2 max-[1300px]:pb-2 max-[1300px]:mb-3">
                      <span className="text-muted-foreground uppercase">Current:</span>
                      <span className="text-white">{player.seasonStats.apps}A</span>
                      <span className="text-accent">{player.seasonStats.goals}G</span>
                      <span className="text-primary">{player.seasonStats.avgRating.toFixed(2)}R</span>
                      <span className="text-cyan">{player.seasonStats.shots ?? 0}S</span>
                      {player.position === 'GK' && <span className="text-green-500">{player.seasonStats.cleanSheets ?? 0}CS</span>}
                      <span className="text-primary">{player.seasonStats.manOfTheMatch ?? 0}MoM</span>
                    </div>
                {player.history && player.history.length > 0 && (
                    <>
                    <div className="space-y-1.5 max-[1300px]:space-y-2">
                      {player.history.slice(-4).reverse().map((h, i) => (
                        <div key={i} className="grid grid-cols-[45px_1fr_35px_35px_35px] max-[1300px]:grid-cols-[60px_1fr_45px_45px_45px] items-center text-[11px] max-[1300px]:text-[14px] font-black border-b border-white/5 pb-1 max-[1300px]:pb-1.5 hover:bg-white/5 px-1 tracking-tighter">
                          <span className="text-muted-foreground font-mono">{h.season}</span>
                          <span className="text-white truncate uppercase">{h.clubName}</span>
                          <span className="text-center">{h.apps}A</span>
                          <span className="text-accent text-center">{h.goals}G</span>
                          <span className="text-primary text-right">{h.avgRating.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    </>
                )}
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
          
          <div className="p-1 max-[1300px]:p-1.5 bg-muted/20 border-t border-primary/20 shrink-0">
            <Button 
              onClick={onClose}
              className="w-full bg-primary text-primary-foreground font-black retro-button h-9 max-[1300px]:h-11 uppercase text-[12px] max-[1300px]:text-[16px] tracking-[0.1em] shadow-xl rounded-xl"
            >
              CLOSE FILE
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
