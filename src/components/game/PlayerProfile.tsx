
"use client"

import { Player, Position } from '@/types/game';
import { useGame } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Heart, DollarSign, Check, X, FileSearch, TrendingUp, TrendingDown, Clock, UserCircle, Activity, Briefcase, History, Megaphone } from 'lucide-react';
import { cn, formatMoney } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';

interface PlayerProfileProps {
  player: Player | null;
  onClose: () => void;
}

export function PlayerProfile({ player, onClose }: PlayerProfileProps) {
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
        <div className="flex justify-between items-center py-3 border-b border-white/10 cursor-help hover:bg-white/5 transition-colors px-2">
          <span className="text-[15px] uppercase text-muted-foreground font-black tracking-tight">{label}</span>
          <span className={`font-mono text-[18px] font-black ${value >= 15 ? 'text-accent' : value >= 10 ? 'text-primary' : 'text-white'}`}>
            {value}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-[13px] font-bold">{tooltip}</TooltipContent>
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
      <DialogContent className="bg-card border-primary p-0 overflow-hidden max-w-2xl font-mono rounded-2xl">
        <DialogHeader className="bg-primary p-5 shrink-0 rounded-t-xl">
          <DialogTitle className="text-primary-foreground uppercase flex justify-between items-center text-2xl font-black tracking-tight">
            <div className="flex items-center gap-4">
               <span>{player.name}</span>
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
                        <Heart size={24} className={player.isShortlisted ? "fill-current" : ""} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="font-black">Shortlist</TooltipContent>
                 </Tooltip>
               </TooltipProvider>
            </div>
            <span className="text-[14px] opacity-70 font-mono tracking-[0.2em]">PLAYER DOSSIER V.1993</span>
          </DialogTitle>
          <DialogDescription className="sr-only">Detailed player profile for {player.name}.</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="flex flex-col h-[70vh]">
          <TabsList className="bg-black/40 border-b border-primary/20 h-14 p-1 gap-1 rounded-none shrink-0">
            <TabsTrigger value="overview" className="flex-1 uppercase font-black tracking-widest text-[13px] rounded-lg data-[state=active]:bg-primary">
              <UserCircle size={16} className="mr-2" /> Overview
            </TabsTrigger>
            <TabsTrigger value="attributes" className="flex-1 uppercase font-black tracking-widest text-[13px] rounded-lg data-[state=active]:bg-primary">
              <Activity size={16} className="mr-2" /> Attributes
            </TabsTrigger>
            <TabsTrigger value="contract" className="flex-1 uppercase font-black tracking-widest text-[13px] rounded-lg data-[state=active]:bg-primary">
              <Briefcase size={16} className="mr-2" /> Contract
            </TabsTrigger>
            <TabsTrigger value="report" className="flex-1 uppercase font-black tracking-widest text-[13px] rounded-lg data-[state=active]:bg-primary">
              <FileSearch size={16} className="mr-2" /> Report
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="bg-black/60 p-4 border border-primary/20 rounded-xl shadow-inner">
                    <div className="text-[12px] text-muted-foreground uppercase font-black mb-1">Age</div>
                    <div className="text-3xl font-black text-white">{player.age}</div>
                  </div>
                  <div className="bg-black/60 p-4 border border-primary/20 rounded-xl shadow-inner">
                    <div className="text-[12px] text-muted-foreground uppercase font-black mb-1">Position</div>
                    <div className="text-[20px] font-black text-cyan leading-tight">{player.position}</div>
                    <div className="text-[10px] opacity-60 font-black">({player.side})</div>
                  </div>
                  <div className="bg-black/60 p-4 border border-primary/20 rounded-xl shadow-inner">
                    <div className="text-[12px] text-muted-foreground uppercase font-black mb-1">Value</div>
                    <div className="text-[20px] font-black text-accent">{formatMoney(player.value)}</div>
                  </div>
                  <div className="bg-black/60 p-4 border border-primary/20 rounded-xl shadow-inner">
                    <div className="text-[12px] text-muted-foreground uppercase font-black mb-1">Morale</div>
                    <div className={cn("text-[24px] font-black", player.morale > 70 ? "text-green-500" : "text-yellow-500")}>
                      {player.morale}%
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl space-y-4">
                  <h4 className="text-[14px] font-black text-primary uppercase border-b border-primary/10 pb-2">Status & Availability</h4>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <span className="text-[13px] text-muted-foreground uppercase font-bold">Physical Condition</span>
                       <div className="text-2xl font-black text-white">{player.fitness}% FIT</div>
                    </div>
                    <div className="space-y-2">
                       <span className="text-[13px] text-muted-foreground uppercase font-bold">Match Readiness</span>
                       <div className={cn("text-2xl font-black", player.status === 'FIT' ? "text-accent" : "text-red-500")}>
                         {player.status.toUpperCase()}
                       </div>
                    </div>
                  </div>
                  {player.injury && (
                    <div className="p-3 bg-red-600/10 border border-red-600/30 text-red-500 text-[14px] font-black uppercase text-center rounded-lg">
                      SIDELINED: {player.injury.type} ({player.injury.weeksRemaining} WEEKS)
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="attributes" className="mt-0">
                <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                  <div className="space-y-1">
                    <h4 className="text-[14px] font-black text-primary uppercase border-b-2 border-primary/30 mb-4 pb-2">Physical</h4>
                    {renderAttribute("Pace", player.attributes.pace, "Impacts speed and off-the-ball runs.")}
                    {renderAttribute("Stamina", player.attributes.stamina, "Affects how quickly fitness drops.")}
                    {renderAttribute("Heading", player.attributes.heading, "Quality of aerial duels.")}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[14px] font-black text-primary uppercase border-b-2 border-primary/30 mb-4 pb-2">Technical</h4>
                    {renderAttribute("Skill", player.attributes.skill, "Overall ball control quality.")}
                    {renderAttribute("Passing", player.attributes.passing, "Precision for distribution.")}
                    {renderAttribute("Shooting", player.attributes.shooting, "Accuracy of goal attempts.")}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[14px] font-black text-primary uppercase border-b-2 border-primary/30 mb-4 pb-2 mt-6">Mental</h4>
                    {renderAttribute("Influence", player.attributes.influence, "Leadership and impact.")}
                    {renderAttribute("Temper", player.attributes.temperament, "Discipline and composure.")}
                    {renderAttribute("Consistency", player.attributes.consistency, "Stability of performance.")}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[14px] font-black text-primary uppercase border-b-2 border-primary/30 mb-4 pb-2 mt-6">Special</h4>
                    {renderAttribute("Keeper", player.attributes.goalkeeping, "Primary shot-stopping ability.")}
                    {renderAttribute("Dirty", player.attributes.dirtiness, "Likelihood of fouls/cards.")}
                    {renderAttribute("Professional", player.attributes.professionalism, "Attitude in training.")}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contract" className="mt-0 space-y-6">
                <div className="bg-black/60 p-5 border border-primary/20 rounded-xl shadow-inner flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[12px] text-muted-foreground uppercase font-black">Current Wage</span>
                    <div className="text-2xl font-black text-white">{formatMoney(player.wage)}/wk</div>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[12px] text-muted-foreground uppercase font-black">Expiry</span>
                    <div className={cn("text-2xl font-black", player.contractYears <= 1 ? "text-red-500" : "text-white")}>
                      {player.contractYears} Seasons
                    </div>
                  </div>
                </div>

                {isOwnPlayer && (
                  <div className="bg-primary/10 border-2 border-primary/20 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", player.isListed ? "bg-accent/20 text-accent" : "bg-black/40 text-muted-foreground")}>
                        <Megaphone size={20} />
                      </div>
                      <div>
                        <div className="text-[12px] font-black text-white uppercase">Transfer Status</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{player.isListed ? 'Listed - Receiving Bids' : 'Not Listed'}</div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => toggleTransferList(player.id)}
                      className={cn(
                        "h-10 px-6 font-black text-[12px] uppercase retro-button",
                        player.isListed ? "bg-red-600 text-white" : "bg-accent text-accent-foreground"
                      )}
                    >
                      {player.isListed ? 'REMOVE FROM LIST' : 'LIST PLAYER'}
                    </Button>
                  </div>
                )}

                {activeOffer && (
                  <div className="bg-accent/10 border-2 border-accent p-6 space-y-4 rounded-xl shadow-lg">
                    <div className="text-[14px] font-black text-accent uppercase flex justify-between">
                      <span>Incoming Bid</span>
                      <span>OFFICIAL OFFER</span>
                    </div>
                    <p className="text-[18px] font-bold text-white leading-tight">
                      {state.teams.find(t => t.id === activeOffer.fromTeamId)?.name} have bid <span className="text-accent font-black">{formatMoney(activeOffer.amount)}</span>.
                    </p>
                    <div className="flex gap-4">
                      <Button onClick={() => { acceptBid(activeOffer.id); onClose(); }} className="flex-1 bg-accent text-accent-foreground retro-button h-12 text-[14px] font-black">
                        <Check size={20} className="mr-2" /> ACCEPT
                      </Button>
                      <Button onClick={() => rejectBid(activeOffer.id)} variant="destructive" className="flex-1 retro-button h-12 text-[14px] font-black">
                        <X size={20} className="mr-2" /> REJECT
                      </Button>
                    </div>
                  </div>
                )}

                {!isOwnPlayer && (
                  <Button 
                    onClick={() => buyPlayer(player.id)}
                    disabled={!canAfford}
                    className="w-full bg-accent text-accent-foreground font-black retro-button h-16 uppercase text-[16px] tracking-widest shadow-xl rounded-xl"
                  >
                    <DollarSign size={24} className="mr-2" /> PROPOSE TRANSFER BID
                  </Button>
                )}

                {isOwnPlayer && (
                  <div className="bg-primary/15 border-2 border-primary/30 p-6 space-y-6 rounded-xl shadow-inner">
                     <div className="flex justify-between items-center border-b border-primary/10 pb-3">
                       <span className="text-[14px] font-black text-primary uppercase tracking-widest">Negotiation Console</span>
                       <div className="flex items-center gap-2">
                          <span className="text-[12px] text-muted-foreground font-black">Patience:</span>
                          <div className="flex gap-1.5">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className={cn("w-4 h-4 rounded-full", i < patience ? "bg-accent shadow-[0_0_5px_rgba(38,217,117,0.5)]" : "bg-black/40")} />
                            ))}
                          </div>
                       </div>
                     </div>

                     {feedback && (
                       <div className="bg-black/80 p-4 border border-accent/20 text-center animate-in fade-in zoom-in duration-300 rounded-lg">
                          <p className="text-[15px] font-black text-accent italic uppercase">{feedback}</p>
                       </div>
                     )}

                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[12px] text-muted-foreground uppercase font-black">Term (Years)</label>
                          <div className="flex items-center gap-2">
                            <Button onClick={() => setOfferedYears(y => Math.max(1, y - 1))} className="h-12 w-12 retro-button bg-black/40"><TrendingDown size={24} /></Button>
                            <span className="flex-1 text-center font-black text-white text-xl">{offeredYears}Y</span>
                            <Button onClick={() => setOfferedYears(y => Math.min(5, y + 1))} className="h-12 w-12 retro-button bg-black/40"><TrendingUp size={24} /></Button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[12px] text-muted-foreground uppercase font-black">Weekly Wage</label>
                          <div className="relative">
                            <Input type="number" value={offeredWage} onChange={(e) => setOfferedWage(parseInt(e.target.value) || 0)} className="bg-black/40 border-primary/20 h-12 text-[18px] font-black pl-8 rounded-lg" />
                            <span className="absolute left-3 top-3 text-[16px] text-muted-foreground font-black">£</span>
                          </div>
                        </div>
                     </div>

                     <Button onClick={handleNegotiate} disabled={patience <= 0} className="w-full bg-primary text-primary-foreground font-black retro-button h-14 uppercase text-[14px] shadow-lg">
                       <Clock size={22} className="mr-2" /> SUBMIT CONTRACT OFFER
                     </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="report" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-primary/10 p-6 border border-primary/30 flex flex-col items-center gap-4 rounded-xl shadow-sm">
                    <div className="text-[13px] text-primary font-black uppercase tracking-widest border-b border-primary/20 w-full text-center pb-2">Scout Conclusion</div>
                    <div className="text-[18px] font-black text-white uppercase italic text-center leading-snug">{getPotentialHint()}</div>
                    <div className="bg-black/40 px-4 py-1.5 text-[12px] font-black text-accent uppercase tracking-tighter border border-accent/20 rounded-md">
                      Best Role: {getPositionLabel(player.position)}
                    </div>
                  </div>

                  <div className="bg-black/60 p-6 border border-primary/20 space-y-4 rounded-xl shadow-inner">
                    <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                      <FileSearch size={22} className="text-primary" />
                      <span className="text-[14px] font-black text-primary uppercase tracking-widest">Psychological Profile</span>
                    </div>
                    {scout ? (
                      <div className="space-y-4">
                        <div className="flex justify-between text-[15px] uppercase font-black tracking-tight">
                          <span className="text-muted-foreground">Focus:</span>
                          <span className={getHiddenTraitLabel('consistency').color}>{getHiddenTraitLabel('consistency').text}</span>
                        </div>
                        <div className="flex justify-between text-[15px] uppercase font-black tracking-tight">
                          <span className="text-muted-foreground">Durability:</span>
                          <span className={getHiddenTraitLabel('injuryProne').color}>{getHiddenTraitLabel('injuryProne').text}</span>
                        </div>
                        <div className="flex justify-between text-[15px] uppercase font-black tracking-tight">
                          <span className="text-muted-foreground">Integrity:</span>
                          <span className={getHiddenTraitLabel('professionalism').color}>{getHiddenTraitLabel('professionalism').text}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[13px] text-muted-foreground font-black italic text-center py-8 opacity-40">
                        HIRE A SCOUT TO ANALYZE TRAITS
                      </div>
                    )}
                  </div>
                </div>

                {player.history.length > 0 && (
                  <div className="bg-black/60 p-6 border border-primary/20 rounded-xl shadow-inner">
                    <div className="flex items-center gap-2 border-b border-primary/20 pb-3 mb-4">
                      <History size={20} className="text-primary" />
                      <h4 className="text-[14px] font-black text-primary uppercase tracking-widest">Career History</h4>
                    </div>
                    <div className="space-y-3">
                      {player.history.slice(-6).reverse().map((h, i) => (
                        <div key={i} className="grid grid-cols-[60px_1fr_45px_45px_40px] items-center text-[14px] font-black border-b border-white/5 pb-3 hover:bg-white/5 px-2 tracking-tight">
                          <span className="text-muted-foreground font-mono">{h.season}</span>
                          <span className="text-white truncate pr-2 uppercase">{h.clubName}</span>
                          <span className="text-center">{h.apps}A</span>
                          <span className="text-accent text-center">{h.goalsScored}G</span>
                          <span className="text-primary text-right">{h.avgRating.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
          
          <div className="p-4 bg-muted/20 border-t border-primary/20 shrink-0">
            <Button 
              onClick={onClose}
              className="w-full bg-primary text-primary-foreground font-black retro-button h-14 uppercase text-[16px] tracking-[0.4em] shadow-xl rounded-xl"
            >
              CLOSE FILE
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
