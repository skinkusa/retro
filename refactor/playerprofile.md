"use client"

import { Player } from '@/types/game';
import { useGame } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Heart,
  DollarSign,
  Check,
  X,
  FileSearch,
  TrendingUp,
  TrendingDown,
  Clock,
  UserCircle,
  Activity,
  Briefcase,
  History,
  Megaphone,
  MoreVertical,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import { cn, formatMoney, getNaturalPositionLabel } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';

interface PlayerProfileProps {
  player: Player | null;
  onClose: () => void;
  defaultTab?: string;
}

type HiddenTraitKey = 'injuryProne' | 'consistency' | 'professionalism';

export function PlayerProfile({
  player,
  onClose,
  defaultTab = 'overview',
}: PlayerProfileProps) {
  const {
    state,
    toggleShortlist,
    toggleTransferList,
    buyPlayer,
    renewContract,
    acceptBid,
    rejectBid,
  } = useGame();

  const userTeam = state.teams.find(t => t.id === state.userTeamId);
  const scout = userTeam?.staff.find(st => st.role === 'SCOUT');
  const isOwnPlayer = player?.clubId === state.userTeamId;
  const canAfford = userTeam && player && userTeam.budget >= player.value;

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

  const getPotentialHint = () => {
    const pot = player.attributes.potential;
    if (player.age > 28) return "VETERAN. REACHED FULL POTENTIAL.";
    if (pot >= 18) return "WONDERKID. DESTINED FOR GREATNESS.";
    if (pot >= 15) return "HIGH POTENTIAL. COULD BE A STAR.";
    if (pot >= 12) return "SOLID PROSPECT. WILL IMPROVE.";
    return "LACKS CEILING. UNLIKELY TO IMPROVE.";
  };

  const getHiddenTraitLabel = (attr: HiddenTraitKey) => {
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

  const renderAttribute = (label: string, value: number, tooltip: string) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 py-3 border-b border-primary/12 cursor-help hover:bg-white/[0.03] transition-colors px-3 rounded-md">
          <span className="text-[12px] md:text-[13px] uppercase text-white/55 font-black tracking-wide">
            {label}
          </span>
          <span
            className={cn(
              "font-mono text-[18px] md:text-[20px] font-black tabular-nums",
              value >= 15 ? 'text-accent' : value >= 10 ? 'text-primary' : 'text-white'
            )}
          >
            {value}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-[13px] font-bold">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );

  const panelClass =
    "rounded-2xl border border-primary/25 bg-[linear-gradient(180deg,rgba(34,48,67,0.96),rgba(21,28,39,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]";

  const statCardClass =
    "rounded-2xl border border-primary/18 bg-black/45 shadow-inner px-4 py-4";

  return (
    <Dialog open={!!player} onOpenChange={onClose}>
      <DialogContent className="max-w-[760px] w-[96vw] md:w-full max-h-[92vh] p-0 gap-0 overflow-hidden border-primary/50 bg-[#10161f] text-white rounded-2xl md:rounded-3xl font-mono shadow-[0_20px_80px_rgba(0,0,0,0.65)]">
        <DialogHeader className="shrink-0 border-b border-primary/25 bg-[linear-gradient(180deg,#4e87c4,#4a82bf)] px-4 py-4 md:px-5 md:py-5">
          <DialogTitle className="flex items-center justify-between gap-4 text-primary-foreground">
            <div className="flex items-center gap-3 min-w-0">
              <span className="truncate text-[18px] md:text-[22px] uppercase font-black tracking-tight">
                {player.name}
              </span>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleShortlist(player.id)}
                      className={cn(
                        "transition-all active:scale-90 p-1 rounded-full",
                        player.isShortlisted
                          ? "text-black fill-black"
                          : "text-primary-foreground/60 hover:text-primary-foreground"
                      )}
                    >
                      <Heart size={22} className={player.isShortlisted ? "fill-current" : ""} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="font-black">
                    Shortlist
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="hidden md:flex items-center gap-4 shrink-0">
              <span className="text-[12px] md:text-[13px] opacity-80 font-black tracking-[0.22em] uppercase whitespace-nowrap">
                Player Profile V.1993
              </span>
              <button
                onClick={onClose}
                className="text-primary-foreground/80 hover:text-primary-foreground text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="md:hidden flex items-center gap-2 shrink-0">
              <button
                onClick={onClose}
                className="text-primary-foreground/80 hover:text-primary-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <MoreVertical size={16} className="opacity-75" />
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed player profile for {player.name}.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="flex flex-col min-h-0 flex-1">
          <TabsList className="grid grid-cols-4 shrink-0 h-14 md:h-[66px] rounded-none border-b border-primary/20 bg-[#0b1118] px-2 md:px-4 py-2 gap-1 md:gap-2">
            <TabsTrigger
              value="overview"
              className="h-full rounded-xl uppercase font-black tracking-widest text-[10px] md:text-[13px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <UserCircle size={14} className="mr-1.5 md:mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="attributes"
              className="h-full rounded-xl uppercase font-black tracking-widest text-[10px] md:text-[13px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Activity size={14} className="mr-1.5 md:mr-2" />
              Attributes
            </TabsTrigger>
            <TabsTrigger
              value="contract"
              className="h-full rounded-xl uppercase font-black tracking-widest text-[10px] md:text-[13px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Briefcase size={14} className="mr-1.5 md:mr-2" />
              Contract
            </TabsTrigger>
            <TabsTrigger
              value="report"
              className="h-full rounded-xl uppercase font-black tracking-widest text-[10px] md:text-[13px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileSearch size={14} className="mr-1.5 md:mr-2" />
              Report
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-3 md:p-5">
              <TabsContent value="overview" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-[1.12fr_1fr] gap-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className={statCardClass}>
                        <div className="text-[10px] md:text-[11px] text-white/45 uppercase font-black mb-1 tracking-wider">
                          Age
                        </div>
                        <div className="text-3xl md:text-[38px] leading-none font-black text-white">
                          {player.age}
                        </div>
                      </div>

                      <div className={statCardClass}>
                        <div className="text-[10px] md:text-[11px] text-white/45 uppercase font-black mb-1 tracking-wider">
                          Position
                        </div>
                        <div className="text-[26px] md:text-[30px] leading-none font-black text-cyan-300 uppercase">
                          {player.position}
                        </div>
                        <div className="text-[10px] opacity-65 font-black mt-1 uppercase">
                          ({player.side})
                        </div>
                      </div>

                      <div className={statCardClass}>
                        <div className="text-[10px] md:text-[11px] text-white/45 uppercase font-black mb-1 tracking-wider">
                          Value
                        </div>
                        <div className="text-[24px] md:text-[30px] leading-none font-black text-accent">
                          {formatMoney(player.value)}
                        </div>
                      </div>

                      <div className={statCardClass}>
                        <div className="text-[10px] md:text-[11px] text-white/45 uppercase font-black mb-1 tracking-wider">
                          Morale
                        </div>
                        <div
                          className={cn(
                            "text-[24px] md:text-[30px] leading-none font-black",
                            player.morale > 70
                              ? "text-green-500"
                              : player.morale > 40
                                ? "text-yellow-500"
                                : "text-red-500"
                          )}
                        >
                          {player.morale}%
                        </div>
                      </div>
                    </div>

                    {player.seasonStats.apps > 0 && (
                      <div className={panelClass}>
                        <div className="px-4 py-3 border-b border-primary/15">
                          <h4 className="text-[12px] md:text-[13px] font-black text-primary uppercase tracking-[0.18em]">
                            This Season
                          </h4>
                        </div>
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <div className="text-[10px] text-white/45 uppercase font-black">Apps</div>
                            <div className="text-lg font-black">{player.seasonStats.apps}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-white/45 uppercase font-black">Goals</div>
                            <div className="text-lg font-black text-cyan-300">{player.seasonStats.goals}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-white/45 uppercase font-black">Shots</div>
                            <div className="text-lg font-black">{player.seasonStats.shots ?? '—'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-white/45 uppercase font-black">SOT</div>
                            <div className="text-lg font-black">{player.seasonStats.shotsOnTarget ?? '—'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-white/45 uppercase font-black">Minutes</div>
                            <div className="text-lg font-black">{player.seasonStats.minutesPlayed ?? '—'}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-white/45 uppercase font-black">Rating</div>
                            <div className="text-lg font-black text-accent">
                              {player.seasonStats.avgRating.toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-white/45 uppercase font-black">MoM</div>
                            <div className="text-lg font-black text-primary">
                              {player.seasonStats.manOfTheMatch ?? 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-white/45 uppercase font-black">CS</div>
                            <div className="text-lg font-black">
                              {player.position === 'GK'
                                ? (player.seasonStats.cleanSheets ?? '—')
                                : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className={panelClass}>
                      <div className="px-4 py-3 border-b border-primary/15">
                        <h4 className="text-[12px] md:text-[13px] font-black text-primary uppercase tracking-[0.18em]">
                          Status & Availability
                        </h4>
                      </div>

                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-primary/15 bg-black/25 px-4 py-4">
                          <div className="flex items-center gap-2 mb-2 text-white/55">
                            <Stethoscope size={14} />
                            <span className="text-[11px] uppercase font-black tracking-wide">
                              Physical Condition
                            </span>
                          </div>
                          <div className="text-[28px] md:text-[34px] leading-none font-black text-white">
                            {player.fitness}%
                          </div>
                          <div className="mt-1 text-[18px] font-black text-white">
                            FIT
                          </div>
                        </div>

                        <div className="rounded-xl border border-primary/15 bg-black/25 px-4 py-4">
                          <div className="flex items-center gap-2 mb-2 text-white/55">
                            <ShieldCheck size={14} />
                            <span className="text-[11px] uppercase font-black tracking-wide">
                              Match Readiness
                            </span>
                          </div>
                          <div className={cn(
                            "text-[28px] md:text-[34px] leading-none font-black",
                            player.status === 'FIT' ? 'text-accent' : 'text-red-500'
                          )}>
                            {player.status.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {player.injury && (
                        <div className="px-4 pb-4">
                          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-[12px] md:text-[13px] font-black uppercase text-center">
                            Sidelined: {player.injury.type} ({player.injury.weeksRemaining} weeks)
                          </div>
                        </div>
                      )}
                    </div>

                    <div className={panelClass}>
                      <div className="px-4 py-3 border-b border-primary/15">
                        <h4 className="text-[12px] md:text-[13px] font-black text-primary uppercase tracking-[0.18em]">
                          Snapshot
                        </h4>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] text-white/45 uppercase font-black mb-1">
                            Natural Role
                          </div>
                          <div className="text-[18px] font-black text-white uppercase">
                            {getNaturalPositionLabel(player.position)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-white/45 uppercase font-black mb-1">
                            Wage
                          </div>
                          <div className="text-[18px] font-black text-white">
                            {formatMoney(player.wage)}/wk
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-white/45 uppercase font-black mb-1">
                            Contract
                          </div>
                          <div className={cn(
                            "text-[18px] font-black",
                            player.contractYears <= 1 ? "text-red-500" : "text-white"
                          )}>
                            {player.contractYears} Seasons
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-white/45 uppercase font-black mb-1">
                            Club
                          </div>
                          <div className="text-[18px] font-black text-white uppercase truncate">
                            {state.teams.find(t => t.id === player.clubId)?.name ?? 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attributes" className="mt-0">
                <div className={panelClass}>
                  <div className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-5">
                    <div className="space-y-0">
                      <h4 className="text-[12px] font-black text-primary uppercase border-b border-primary/25 mb-2 pb-2 tracking-[0.16em]">
                        Physical
                      </h4>
                      {renderAttribute("Pace", player.attributes.pace, "Impacts speed and off-the-ball runs.")}
                      {renderAttribute("Stamina", player.attributes.stamina, "Affects how quickly fitness drops.")}
                      {renderAttribute("Heading", player.attributes.heading, "Quality of aerial duels.")}
                    </div>

                    <div className="space-y-0">
                      <h4 className="text-[12px] font-black text-primary uppercase border-b border-primary/25 mb-2 pb-2 tracking-[0.16em]">
                        Technical
                      </h4>
                      {renderAttribute("Skill", player.attributes.skill, "Overall ball control quality.")}
                      {renderAttribute("Passing", player.attributes.passing, "Precision for distribution.")}
                      {renderAttribute("Shooting", player.attributes.shooting, "Accuracy of goal attempts.")}
                    </div>

                    <div className="space-y-0">
                      <h4 className="text-[12px] font-black text-primary uppercase border-b border-primary/25 mb-2 pb-2 tracking-[0.16em]">
                        Mental
                      </h4>
                      {renderAttribute("Influence", player.attributes.influence, "Leadership and impact.")}
                      {renderAttribute("Temper", player.attributes.temperament, "Discipline and composure.")}
                      {renderAttribute("Consistency", player.attributes.consistency, "Stability of performance.")}
                    </div>

                    <div className="space-y-0">
                      <h4 className="text-[12px] font-black text-primary uppercase border-b border-primary/25 mb-2 pb-2 tracking-[0.16em]">
                        Special
                      </h4>
                      {renderAttribute("Keeper", player.attributes.goalkeeping, "Primary shot-stopping ability.")}
                      {renderAttribute("Dirty", player.attributes.dirtiness, "Likelihood of fouls/cards.")}
                      {renderAttribute("Professional", player.attributes.professionalism, "Attitude in training.")}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contract" className="mt-0 space-y-4">
                <div className="rounded-2xl border border-primary/20 bg-black/45 shadow-inner px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] text-white/45 uppercase font-black tracking-wider">
                      Current Wage
                    </span>
                    <div className="text-[26px] md:text-[36px] font-black text-white">
                      {formatMoney(player.wage)}/wk
                    </div>
                  </div>
                  <div className="sm:text-right space-y-1">
                    <span className="text-[11px] text-white/45 uppercase font-black tracking-wider">
                      Expiry
                    </span>
                    <div className={cn(
                      "text-[26px] md:text-[36px] font-black",
                      player.contractYears <= 1 ? "text-red-500" : "text-white"
                    )}>
                      {player.contractYears} Seasons
                    </div>
                  </div>
                </div>

                {isOwnPlayer && (
                  <div className={panelClass}>
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-xl border",
                          player.isListed
                            ? "bg-accent/10 text-accent border-accent/30"
                            : "bg-black/40 text-white/50 border-primary/20"
                        )}>
                          <Megaphone size={18} />
                        </div>
                        <div>
                          <div className="text-[12px] font-black text-white uppercase tracking-wide">
                            Transfer Status
                          </div>
                          <div className="text-[10px] text-white/45 uppercase font-black tracking-wider">
                            {player.isListed ? 'Listed - Receiving Bids' : 'Not Listed'}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => toggleTransferList(player.id)}
                        className={cn(
                          "h-10 px-6 font-black text-[12px] uppercase rounded-xl",
                          player.isListed
                            ? "bg-red-600 text-white"
                            : "bg-accent text-accent-foreground"
                        )}
                      >
                        {player.isListed ? 'Remove From List' : 'List Player'}
                      </Button>
                    </div>
                  </div>
                )}

                {activeOffer && (
                  <div className="rounded-2xl border-2 border-accent/50 bg-accent/10 p-5 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13px] md:text-[14px] font-black text-accent uppercase tracking-wider">
                        Incoming Bid
                      </span>
                      <span className="text-[11px] md:text-[12px] font-black text-accent uppercase tracking-[0.18em]">
                        Official Offer
                      </span>
                    </div>

                    <p className="text-[16px] md:text-[18px] font-bold text-white leading-tight">
                      {state.teams.find(t => t.id === activeOffer.fromTeamId)?.name} have bid{" "}
                      <span className="text-accent font-black">{formatMoney(activeOffer.amount)}</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => {
                          acceptBid(activeOffer.id);
                          onClose();
                        }}
                        className="flex-1 bg-accent text-accent-foreground h-12 text-[13px] font-black uppercase rounded-xl"
                      >
                        <Check size={18} className="mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => rejectBid(activeOffer.id)}
                        variant="destructive"
                        className="flex-1 h-12 text-[13px] font-black uppercase rounded-xl"
                      >
                        <X size={18} className="mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {!isOwnPlayer && (
                  <Button
                    onClick={() => buyPlayer(player.id)}
                    disabled={!canAfford}
                    className="w-full bg-accent text-accent-foreground font-black h-14 md:h-16 uppercase text-[13px] md:text-[15px] tracking-[0.16em] rounded-xl"
                  >
                    <DollarSign size={22} className="mr-2" />
                    Propose Transfer Bid
                  </Button>
                )}

                {isOwnPlayer && (
                  <div className={panelClass}>
                    <div className="p-5 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-primary/12 pb-3">
                        <span className="text-[13px] md:text-[14px] font-black text-primary uppercase tracking-[0.16em]">
                          Negotiation Console
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-white/45 font-black uppercase">
                            Patience:
                          </span>
                          <div className="flex gap-1.5">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-4 h-4 rounded-full",
                                  i < patience
                                    ? "bg-accent shadow-[0_0_7px_rgba(38,217,117,0.55)]"
                                    : "bg-black/40"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {feedback && (
                        <div className="rounded-xl bg-black/80 border border-accent/20 px-4 py-4 text-center animate-in fade-in zoom-in duration-300">
                          <p className="text-[14px] md:text-[15px] font-black text-accent italic uppercase">
                            {feedback}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-3">
                          <label className="text-[11px] text-white/45 uppercase font-black tracking-wider">
                            Term (Years)
                          </label>
                          <div className="grid grid-cols-[48px_1fr_48px] items-center gap-3">
                            <Button
                              onClick={() => setOfferedYears(y => Math.max(1, y - 1))}
                              className="h-12 w-12 rounded-xl bg-black/40 border border-primary/15"
                            >
                              <TrendingDown size={18} />
                            </Button>
                            <div className="text-center font-black text-white text-2xl">
                              {offeredYears}Y
                            </div>
                            <Button
                              onClick={() => setOfferedYears(y => Math.min(5, y + 1))}
                              className="h-12 w-12 rounded-xl bg-black/40 border border-primary/15"
                            >
                              <TrendingUp size={18} />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[11px] text-white/45 uppercase font-black tracking-wider">
                            Weekly Wage
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={offeredWage}
                              onChange={(e) => setOfferedWage(parseInt(e.target.value) || 0)}
                              className="bg-black/40 border-primary/20 h-12 text-[18px] font-black pl-8 rounded-xl"
                            />
                            <span className="absolute left-3 top-3 text-[16px] text-white/45 font-black">
                              £
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={handleNegotiate}
                        disabled={patience <= 0}
                        className="w-full bg-primary text-primary-foreground font-black h-14 uppercase text-[13px] tracking-[0.14em] rounded-xl"
                      >
                        <Clock size={18} className="mr-2" />
                        Submit Contract Offer
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="report" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className={panelClass}>
                    <div className="p-5 h-full flex flex-col items-center justify-center gap-4 text-center min-h-[210px]">
                      <div className="w-full border-b border-primary/15 pb-3">
                        <div className="text-[12px] md:text-[13px] font-black text-primary uppercase tracking-[0.18em]">
                          Scout Conclusion
                        </div>
                      </div>

                      <div className="text-[22px] md:text-[28px] font-black text-white uppercase italic leading-snug max-w-[18ch]">
                        {getPotentialHint()}
                      </div>

                      <div className="rounded-md border border-accent/25 bg-black/35 px-4 py-2 text-[11px] md:text-[12px] font-black text-accent uppercase tracking-wide">
                        Best Role: {getNaturalPositionLabel(player.position)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/20 bg-black/55 shadow-inner p-5 space-y-4 min-h-[210px]">
                    <div className="flex items-center gap-2 border-b border-primary/15 pb-3">
                      <Sparkles size={18} className="text-primary" />
                      <span className="text-[12px] md:text-[13px] font-black text-primary uppercase tracking-[0.18em]">
                        Psychological Profile
                      </span>
                    </div>

                    {scout ? (
                      <div className="space-y-4">
                        <div className="flex justify-between text-[13px] md:text-[15px] uppercase font-black tracking-tight">
                          <span className="text-white/55">Focus:</span>
                          <span className={getHiddenTraitLabel('consistency').color}>
                            {getHiddenTraitLabel('consistency').text}
                          </span>
                        </div>
                        <div className="flex justify-between text-[13px] md:text-[15px] uppercase font-black tracking-tight">
                          <span className="text-white/55">Durability:</span>
                          <span className={getHiddenTraitLabel('injuryProne').color}>
                            {getHiddenTraitLabel('injuryProne').text}
                          </span>
                        </div>
                        <div className="flex justify-between text-[13px] md:text-[15px] uppercase font-black tracking-tight">
                          <span className="text-white/55">Integrity:</span>
                          <span className={getHiddenTraitLabel('professionalism').color}>
                            {getHiddenTraitLabel('professionalism').text}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[13px] text-white/35 font-black italic text-center py-8">
                        HIRE A SCOUT TO ANALYZE TRAITS
                      </div>
                    )}
                  </div>
                </div>

                {(player.seasonStats.apps > 0 || (player.history?.length ?? 0) > 0) && (
                  <div className="rounded-2xl border border-primary/20 bg-black/55 shadow-inner p-5">
                    <div className="flex items-center gap-2 border-b border-primary/15 pb-3 mb-4">
                      <History size={18} className="text-primary" />
                      <h4 className="text-[12px] md:text-[13px] font-black text-primary uppercase tracking-[0.18em]">
                        Stats
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] md:text-[12px] font-black border-b border-white/8 pb-3 mb-3">
                      <span className="text-white/45 uppercase">This season</span>
                      <span className="text-white">{player.seasonStats.apps} apps</span>
                      <span className="text-accent">{player.seasonStats.goals} goals</span>
                      <span className="text-primary">{player.seasonStats.avgRating.toFixed(2)} avg</span>
                      <span className="text-cyan-300">{player.seasonStats.shots ?? 0} shots</span>
                      <span className="text-cyan-300">{player.seasonStats.shotsOnTarget ?? 0} SOT</span>
                      {player.position === 'GK' && (
                        <span className="text-green-500">{player.seasonStats.cleanSheets ?? 0} CS</span>
                      )}
                      <span className="text-white/45">{player.seasonStats.minutesPlayed ?? 0} mins</span>
                      <span className="text-primary">{player.seasonStats.manOfTheMatch ?? 0} MoM</span>
                    </div>

                    {player.history && player.history.length > 0 && (
                      <>
                        <div className="text-[10px] md:text-[11px] font-black text-white/45 uppercase mb-2 tracking-wider">
                          Career History
                        </div>
                        <div className="space-y-2">
                          {player.history.slice(-6).reverse().map((h, i) => (
                            <div
                              key={i}
                              className="grid grid-cols-[60px_1fr_44px_44px_52px] items-center text-[12px] md:text-[14px] font-black border-b border-white/5 pb-3 px-2 tracking-tight"
                            >
                              <span className="text-white/45 font-mono">{h.season}</span>
                              <span className="text-white truncate pr-2 uppercase">{h.clubName}</span>
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
          </ScrollArea>

          <div className="shrink-0 border-t border-primary/20 bg-white/[0.02] p-3 md:p-4">
            <Button
              onClick={onClose}
              className="w-full bg-primary text-primary-foreground font-black h-12 md:h-14 uppercase text-[12px] md:text-[14px] tracking-[0.32em] rounded-xl"
            >
              Close File
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

---

## Refactor check — functionality preserved

All current behaviour and call-sites remain valid:

- **Props**: `player`, `onClose`, `defaultTab` — unchanged. Callers (GameApp with `defaultTab={openToTab ?? 'overview'}`, MatchSim, SquadList, PlayerMarket, StatsHub) pass `player` and `onClose`; GameApp also passes `defaultTab`.
- **Store**: `toggleShortlist`, `toggleTransferList`, `buyPlayer`, `renewContract`, `acceptBid`, `rejectBid` — all used in the proposed code.
- **State**: `offeredYears`, `offeredWage`, `patience`, `feedback` — same; reset in `useEffect` when `player`/`targetWage` change.
- **Derived**: `userTeam`, `scout`, `isOwnPlayer`, `canAfford`, `targetWage`, `activeOffer` — same logic.
- **Overview tab**: Age, Position, Value, Morale cards; “This Season” (apps, goals, shots, SOT, minutes, rating, MoM, CS) when `player.seasonStats.apps > 0`; Status & Availability (fitness, match readiness, injury); proposed adds “Snapshot” (Natural Role, Wage, Contract, Club) — extra only.
- **Attributes tab**: Physical (Pace, Stamina, Heading), Technical (Skill, Passing, Shooting), Mental (Influence, Temper, Consistency), Special (Keeper, Dirty, Professional) with tooltips — same.
- **Contract tab**: Current wage/expiry; own player: transfer list toggle, incoming bid accept/reject, negotiation console (patience, feedback, term, wage, submit); other club: “Propose Transfer Bid” with `canAfford` disable — same.
- **Report tab**: Scout conclusion (`getPotentialHint`, best role), Psychological Profile (scout: consistency / injuryProne / professionalism labels; else “HIRE A SCOUT…”); Stats (this season + career history slice) — same.
- **Header**: Shortlist heart, close (× / X), “Player Profile V.1993” — same. Proposed adds `MoreVertical` on mobile and refines layout.
- **Footer**: “Close File” button calling `onClose` — same.
- **Dialog**: `open={!!player}`, `onOpenChange={onClose}` — same.
- **Types**: Proposed narrows `getHiddenTraitLabel` to `HiddenTraitKey` ('injuryProne' | 'consistency' | 'professionalism'); behaviour unchanged.

**Conclusion**: The refactor is a drop-in replacement; no call-site or behaviour changes required. Styling and layout are updated; functionality is preserved or expanded (Snapshot in Overview).