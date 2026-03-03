"use client"

import { useState, useMemo } from 'react';
import { Player, Position } from '@/types/game';
import { useGame } from '@/lib/store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipPortal } from '@/components/ui/tooltip';
import { Trash2, Wand2, ShieldAlert, HeartPulse, Smile, RefreshCw, UserCircle, Info } from 'lucide-react';
import { PlayerProfile } from './PlayerProfile';
import { getTacticalAssignments } from '@/lib/game-engine';
import { cn } from '@/lib/utils';

interface SquadListProps {
  players: Player[];
  currentMatchRatings?: Record<string, number>;
  onPlayerSwap?: (pId: string) => void;
  activeSwapId?: string | null;
}

export function SquadList({ players, currentMatchRatings, onPlayerSwap, activeSwapId }: SquadListProps) {
  const { state, togglePlayerLineup, clearLineup, autoPickLineup } = useGame();
  const [filter, setFilter] = useState<Position | 'ALL'>('ALL');
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  
  const userTeam = state.teams.find(t => t.id === state.userTeamId);
  const selectedCount = userTeam?.lineup.length || 0;

  const tacticalAssignments = useMemo(() => {
    if (!userTeam) return new Map<string, string>();
    const lineupPlayers = userTeam.lineup.slice(0, 11).map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
    const assignments = getTacticalAssignments(userTeam.formation, lineupPlayers);
    const map = new Map<string, string>();
    assignments.forEach(a => { if (a.player) map.set(a.player.id, a.slot.label); });
    return map;
  }, [userTeam, players]);

  const categorizedPlayers = useMemo(() => {
    const starters = players.filter(p => userTeam?.lineup.slice(0, 11).includes(p.id));
    const bench = players.filter(p => userTeam?.lineup.slice(11, 16).includes(p.id));
    const reserves = players.filter(p => !userTeam?.lineup.includes(p.id));
    const sortedStarters = (userTeam?.lineup.slice(0, 11) || []).map(id => starters.find(p => p.id === id)).filter(Boolean) as Player[];
    return { starters: sortedStarters, bench, reserves };
  }, [players, userTeam]);

  const renderPlayerRow = (p: Player, group: 'STARTER' | 'BENCH' | 'RESERVE') => {
    const isSelected = userTeam?.lineup.includes(p.id);
    const assignedRole = tacticalAssignments.get(p.id);
    const isSuspended = p.suspensionWeeks > 0;
    const isInjured = !!p.injury;
    const canPick = !isSuspended && !isInjured;
    const matchRating = currentMatchRatings ? currentMatchRatings[p.id] : null;
    const isBeingSwapped = activeSwapId === p.id;

    return (
      <TableRow 
        key={p.id} 
        onClick={() => onPlayerSwap?.(p.id)}
        className={cn(
          "hover:bg-primary/10 transition-colors border-b border-primary/5 cursor-pointer",
          group === 'STARTER' ? 'bg-primary/5' : group === 'BENCH' ? 'bg-accent/5' : '',
          isBeingSwapped ? 'bg-accent/20 border-accent ring-2 ring-accent ring-inset' : ''
        )}
      >
        <TableCell className="p-3 text-center">
          <Checkbox checked={isSelected} disabled={!canPick && !isSelected} onClick={(e) => { e.stopPropagation(); togglePlayerLineup(p.id); }} className="border-primary/50" />
        </TableCell>
        <TableCell className="py-3">
          <div className="flex flex-col">
            <span className="font-mono text-cyan text-[14px] font-black uppercase leading-tight mb-1">{p.position} ({p.side})</span>
            {group === 'STARTER' && assignedRole && <span className="text-[11px] font-black text-accent uppercase tracking-tighter">ROLE: {assignedRole}</span>}
            {group === 'BENCH' && <span className="text-[11px] font-black text-primary uppercase tracking-tighter">BENCH</span>}
          </div>
        </TableCell>
        <TableCell className="py-3">
          <div className="text-[16px] font-black uppercase text-white tracking-tight truncate max-w-[180px]">{p.name}</div>
        </TableCell>
        <TableCell className="text-center py-3">
          {currentMatchRatings ? (
            <span className={cn("font-mono text-[18px] font-black", matchRating && matchRating >= 7.5 ? 'text-accent' : matchRating && matchRating < 5.5 ? 'text-red-500' : 'text-white')}>{matchRating?.toFixed(1) || '0.0'}</span>
          ) : (
            <div className="flex justify-center gap-1">
              {isSuspended && <Badge className="bg-red-600 font-black text-[10px]">SUSP</Badge>}
              {isInjured && <Badge className="bg-red-600 font-black text-[10px]">INJ</Badge>}
              {!isSuspended && !isInjured && <span className="text-[11px] font-black text-green-500 uppercase tracking-widest">FIT</span>}
            </div>
          )}
        </TableCell>
        <TableCell className="text-center py-3">
          <div className="flex justify-center items-center gap-1.5">
            <Smile size={14} className={p.morale > 70 ? "text-green-500" : p.morale > 40 ? "text-yellow-500" : "text-red-500"} />
            <span className="text-[15px] font-mono font-black">{p.morale}%</span>
          </div>
        </TableCell>
        <TableCell className={cn("text-center text-[15px] font-mono font-black py-3", p.fitness < 80 ? 'text-red-500' : '')}>{p.fitness}%</TableCell>
        <TableCell className="text-center text-[18px] font-mono text-primary font-black py-3">{p.attributes.skill}</TableCell>
        <TableCell className="text-right py-3 pr-4">
          <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-accent" onClick={(e) => { e.stopPropagation(); setViewingPlayer(p); }}><UserCircle size={22} /></Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 px-4 py-3 bg-muted/50 border border-primary/20 rounded-xl shadow-inner">
        <div className="flex flex-wrap gap-1">
          {(['ALL', 'GK', 'DF', 'MF', 'FW', 'DM'] as const).map(pos => (
            <Button key={pos} onClick={() => setFilter(pos)} variant={filter === pos ? "default" : "outline"} className="h-8 text-[11px] px-4 retro-button font-black">{pos}</Button>
          ))}
        </div>
        {!currentMatchRatings && (
          <div className="flex items-center gap-3">
            <Button onClick={clearLineup} variant="outline" className="h-8 text-[11px] px-4 retro-button text-red-500 border-red-500/30 font-black uppercase"><Trash2 size={14} className="mr-2" /> CLEAR</Button>
            <Button onClick={autoPickLineup} variant="outline" className="h-8 text-[11px] px-4 retro-button text-accent border-accent/30 font-black uppercase"><Wand2 size={14} className="mr-2" /> AUTO XI</Button>
            <div className={cn("text-[13px] font-black px-4 py-1.5 border-2 rounded-xl shadow-sm", selectedCount >= 11 ? 'text-green-500 border-green-500/20 bg-green-500/10' : 'text-red-500 border-red-500/20 bg-red-500/10')}>
              {Math.min(11, selectedCount)}/11 XI • {Math.max(0, selectedCount - 11)}/5 SUBS
            </div>
          </div>
        )}
      </div>

      <div className="overflow-auto custom-scrollbar max-h-[65vh] border border-primary/10 rounded-xl bg-black/20 shadow-inner">
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-primary/30 bg-black/40">
                <TableHead className="w-[50px] text-[11px] font-black uppercase text-primary tracking-widest text-center">PK</TableHead>
                <TableHead className="w-[130px] text-[11px] font-black uppercase text-primary tracking-widest">TACTICS</TableHead>
                <TableHead className="text-[11px] font-black uppercase text-primary tracking-widest">IDENTITY</TableHead>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-center text-[11px] font-black uppercase text-primary tracking-widest cursor-help">STAT</TableHead>
                  </TooltipTrigger>
                  <TooltipPortal><TooltipContent className="font-black">MATCH PERFORMANCE RATING</TooltipContent></TooltipPortal>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-center text-[11px] font-black uppercase text-primary tracking-widest cursor-help">MORALE</TableHead>
                  </TooltipTrigger>
                  <TooltipPortal><TooltipContent className="font-black">PLAYER HAPPINESS & COMPOSURE</TooltipContent></TooltipPortal>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-center text-[11px] font-black uppercase text-primary tracking-widest cursor-help">FIT</TableHead>
                  </TooltipTrigger>
                  <TooltipPortal><TooltipContent className="font-black">PHYSICAL CONDITION PERCENTAGE</TooltipContent></TooltipPortal>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TableHead className="text-center text-[11px] font-black uppercase text-primary tracking-widest cursor-help">SKL</TableHead>
                  </TooltipTrigger>
                  <TooltipPortal><TooltipContent className="font-black">OVERALL TECHNICAL ABILITY</TooltipContent></TooltipPortal>
                </Tooltip>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorizedPlayers.starters.filter(p => filter === 'ALL' || p.position === filter).map(p => renderPlayerRow(p, 'STARTER'))}
              {categorizedPlayers.bench.filter(p => filter === 'ALL' || p.position === filter).length > 0 && (
                <TableRow className="bg-accent/10 border-y-2 border-accent/20"><TableCell colSpan={8} className="py-2 text-[11px] font-black text-accent uppercase text-center tracking-[0.6em]">Substitute Bench</TableCell></TableRow>
              )}
              {categorizedPlayers.bench.filter(p => filter === 'ALL' || p.position === filter).map(p => renderPlayerRow(p, 'BENCH'))}
              {categorizedPlayers.reserves.filter(p => filter === 'ALL' || p.position === filter).length > 0 && (
                <TableRow className="bg-muted/40 border-y-2 border-primary/20"><TableCell colSpan={8} className="py-2 text-[11px] font-black text-muted-foreground uppercase text-center tracking-[0.6em]">Reserve Pool</TableCell></TableRow>
              )}
              {categorizedPlayers.reserves.filter(p => filter === 'ALL' || p.position === filter).sort((a, b) => b.attributes.skill - a.attributes.skill).map(p => renderPlayerRow(p, 'RESERVE'))}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
      <PlayerProfile player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
    </div>
  );
}
