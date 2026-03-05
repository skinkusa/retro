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
import { getTacticalAssignments, getFormationSlots } from '@/lib/game-engine';
import { cn, getNaturalPositionLabel } from '@/lib/utils';

interface SquadListProps {
  players: Player[];
  currentMatchRatings?: Record<string, number>;
  onPlayerSwap?: (pId: string) => void;
  activeSwapId?: string | null;
  hideReserves?: boolean;
}

export function SquadList({ players, currentMatchRatings, onPlayerSwap, activeSwapId, hideReserves = false }: SquadListProps) {
  const { state, togglePlayerLineup, addPlayerToSlot, clearLineup, autoPickLineup } = useGame();
  const [filter, setFilter] = useState<Position | 'ALL'>('ALL');
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const [pinnedSlotIndex, setPinnedSlotIndex] = useState<number | null>(null);

  const userTeam = state.teams.find(t => t.id === state.userTeamId);
  const lineup = userTeam?.lineup ?? [];
  const selectedCount = lineup.filter((id): id is string => id != null && id !== '').length;
  const emptySlotIndices = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < 16; i++) {
      if (i >= lineup.length || lineup[i] == null || lineup[i] === '') out.push(i);
    }
    return out;
  }, [lineup]);

  const formationSlots = useMemo(() => getFormationSlots(userTeam?.formation ?? '4-4-2'), [userTeam?.formation]);
  const getEmptySlotLabel = (slotIdx: number) =>
    slotIdx < 11 ? (formationSlots[slotIdx]?.label ?? `#${slotIdx + 1}`) : `S${slotIdx - 10}`;

  const tacticalAssignments = useMemo(() => {
    if (!userTeam) return new Map<string, string>();
    const lineupPlayers = (userTeam.lineup.slice(0, 11) as (string | null)[]).map(id => id ? players.find(p => p.id === id) ?? null : null);
    const assignments = getTacticalAssignments(userTeam.formation, lineupPlayers);
    const map = new Map<string, string>();
    assignments.forEach(a => { if (a.player) map.set(a.player.id, a.slot.label); });
    return map;
  }, [userTeam, players]);

  const categorizedPlayers = useMemo(() => {
    const l = userTeam?.lineup ?? [];
    const starterIds = l.slice(0, 11).filter((id): id is string => id != null && id !== '');
    const benchIds = l.slice(11, 16).filter((id): id is string => id != null && id !== '');
    const allSelectedIds = l.filter((id): id is string => id != null && id !== '');

    const starters = starterIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
    const bench = benchIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
    const reserves = players.filter(p => !allSelectedIds.includes(p.id));

    const sortedStarters = starters;
    const sortedBench = bench;

    return { starters: sortedStarters, bench: sortedBench, reserves };
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
        onClick={() => {
          if (!onPlayerSwap) return;
          if (currentMatchRatings) return;
          onPlayerSwap(p.id);
        }}
        className={cn(
          "hover:bg-primary/15 transition-colors border-b border-primary/10 cursor-pointer",
          group === 'STARTER' ? 'bg-primary/15' : group === 'BENCH' ? 'bg-accent/10' : 'bg-black/30',
          isBeingSwapped ? 'bg-accent/25 border-accent ring-2 ring-accent ring-inset' : ''
        )}
      >
        <TableCell className="p-2 max-md:p-1 text-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox 
            checked={isSelected} 
            disabled={(!canPick && !isSelected) || !!currentMatchRatings} 
            onCheckedChange={(checked: boolean | 'indeterminate') => {
              if (checked === true) {
                if (pinnedSlotIndex !== null) {
                  addPlayerToSlot(p.id, pinnedSlotIndex);
                  setPinnedSlotIndex(null);
                } else {
                  togglePlayerLineup(p.id);
                }
              } else {
                togglePlayerLineup(p.id);
              }
            }} 
            className="border-primary/50" 
          />
        </TableCell>
        <TableCell className="py-2">
          <div className="flex flex-col">
            <span className="font-mono text-cyan text-[13px] font-black uppercase leading-tight mb-0.5">{getNaturalPositionLabel(p.position)} ({p.side})</span>
            {group === 'STARTER' && assignedRole && <span className="text-[10px] font-black text-accent uppercase tracking-tighter">ROLE: {assignedRole}</span>}
            {group === 'BENCH' && <span className="text-[10px] font-black text-primary uppercase tracking-tighter">BENCH</span>}
          </div>
        </TableCell>
        <TableCell className="py-2 max-md:py-1">
          <div className="text-[15px] max-md:text-[13px] font-black uppercase text-white tracking-tight truncate max-w-[160px] max-md:max-w-[100px]">{p.name}</div>
        </TableCell>
        <TableCell className="text-center py-2 max-md:py-1">
          {currentMatchRatings ? (
            <span className={cn("font-mono text-[16px] font-black", matchRating && matchRating >= 7.5 ? 'text-accent' : matchRating && matchRating < 5.5 ? 'text-red-500' : 'text-white')}>{matchRating?.toFixed(1) || '0.0'}</span>
          ) : (
            <div className="flex justify-center gap-1">
              {isSuspended && <Badge className="bg-red-600 font-black text-[9px] h-4">SUSP</Badge>}
              {isInjured && <Badge className="bg-red-600 font-black text-[9px] h-4">INJ</Badge>}
              {!isSuspended && !isInjured && <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">FIT</span>}
            </div>
          )}
        </TableCell>
        <TableCell className="text-center py-2 max-md:py-1">
          <div className="flex justify-center items-center gap-1">
            <Smile size={12} className={cn("max-md:w-3 max-md:h-3", p.morale > 70 ? "text-green-500" : p.morale > 40 ? "text-yellow-500" : "text-red-500")} />
            <span className="text-[13px] max-md:text-[11px] font-mono font-black">{p.morale}%</span>
          </div>
        </TableCell>
        <TableCell className={cn("text-center text-[13px] max-md:text-[11px] font-mono font-black py-2 max-md:py-1", p.fitness < 80 ? 'text-red-500' : '')}>{p.fitness}%</TableCell>
        <TableCell className="text-center text-[16px] max-md:text-[13px] font-mono text-primary font-black py-2 max-md:py-1">{p.attributes.skill}</TableCell>
        <TableCell className="text-right py-2 max-md:py-1 pr-3 max-md:pr-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-accent" onClick={(e) => { e.stopPropagation(); setViewingPlayer(p); }}><UserCircle size={20} /></Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="squad-list-root space-y-2 max-md:space-y-1">
      {activeSwapId && !currentMatchRatings && (
        <div className="px-3 max-md:px-2 py-2 max-md:py-1 text-[11px] max-md:text-[10px] font-black bg-accent/15 border border-accent/30 rounded-xl">
          SWAP MODE: pick a second player to swap, or click the first player again to cancel.
        </div>
      )}
      <div className="flex flex-col gap-2 max-md:gap-1 px-3 max-md:px-2 py-2 max-md:py-1 bg-black/70 border border-primary/20 rounded-xl shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-2 max-md:gap-1">
          <div className="flex flex-wrap gap-1">
            {(['ALL', 'GK', 'DF', 'MF', 'FW', 'DM'] as const).map(pos => (
              <Button key={pos} onClick={() => setFilter(pos)} variant={filter === pos ? "default" : "outline"} className="h-7 max-md:h-6 text-[10px] max-md:text-[9px] px-3 max-md:px-2 retro-button font-black">{pos}</Button>
            ))}
          </div>
          {!currentMatchRatings && (
            <div className="flex flex-wrap items-center gap-2 max-md:gap-1">
              <div className={cn("text-[11px] font-black px-3 py-1 border-2 rounded-xl shadow-sm", selectedCount >= 11 ? 'text-green-500 border-green-500/20 bg-green-500/10' : 'text-red-500 border-red-500/20 bg-red-500/10')}>
                {Math.min(11, selectedCount)}/11 XI
              </div>
              <div className={cn("text-[11px] font-black px-3 py-1 border-2 rounded-xl shadow-sm", selectedCount >= 16 ? 'text-green-500 border-green-500/20 bg-green-500/10' : 'text-red-500 border-red-500/20 bg-red-500/10')}>
                {Math.min(5, Math.max(0, selectedCount - 11))}/5 SUBS
              </div>
              <Button onClick={clearLineup} variant="outline" className="h-7 text-[10px] px-3 retro-button text-red-500 border-red-500/30 font-black uppercase"><Trash2 size={12} className="mr-1.5" /> CLEAR</Button>
              <Button onClick={autoPickLineup} variant="outline" className="h-7 text-[10px] px-3 retro-button text-accent border-accent/30 font-black uppercase"><Wand2 size={12} className="mr-1.5" /> AUTO XI</Button>
            </div>
          )}
        </div>
        {!currentMatchRatings && emptySlotIndices.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 max-md:gap-1 pt-1 max-md:pt-0.5 border-t border-primary/10">
            <span className="text-[11px] max-md:text-[10px] font-black text-muted-foreground uppercase">Assign to:</span>
            {emptySlotIndices.map((slotIdx) => (
              <label key={slotIdx} className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox
                  checked={pinnedSlotIndex === slotIdx}
                  onCheckedChange={(checked: boolean | 'indeterminate') => setPinnedSlotIndex(checked === true ? slotIdx : null)}
                  className="border-primary/50 h-4 w-4"
                />
                <span className="text-[12px] font-black text-white/90">
                  {getEmptySlotLabel(slotIdx)}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="squad-list-scroll overflow-auto custom-scrollbar max-h-[55vh] max-md:max-h-[45vh] sm:max-h-[65vh] border border-primary/20 rounded-xl bg-black/65 shadow-inner">
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-primary/40 bg-primary/35">
                <TableHead className="w-[45px] max-md:w-9 text-[12px] max-md:text-[10px] font-black uppercase text-white tracking-widest text-center py-2 max-md:py-1">PK</TableHead>
                <TableHead className="w-[110px] max-md:w-20 text-[12px] max-md:text-[10px] font-black uppercase text-white tracking-widest py-2 max-md:py-1">TACTICS</TableHead>
                <TableHead className="text-[12px] max-md:text-[10px] font-black uppercase text-white tracking-widest py-2 max-md:py-1">IDENTITY</TableHead>
                <TableHead className="text-center text-[12px] max-md:text-[10px] font-black uppercase text-white tracking-widest py-2 max-md:py-1">STAT</TableHead>
                <TableHead className="text-center text-[12px] max-md:text-[10px] font-black uppercase text-white tracking-widest py-2 max-md:py-1">MORALE</TableHead>
                <TableHead className="text-center text-[12px] max-md:text-[10px] font-black uppercase text-white tracking-widest py-2 max-md:py-1">FIT</TableHead>
                <TableHead className="text-center text-[12px] max-md:text-[10px] font-black uppercase text-white tracking-widest py-2 max-md:py-1">SKL</TableHead>
                <TableHead className="w-[45px] max-md:w-9 py-2 max-md:py-1"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorizedPlayers.starters.filter(p => filter === 'ALL' || p.position === filter).map(p => renderPlayerRow(p, 'STARTER'))}
              {categorizedPlayers.bench.filter(p => filter === 'ALL' || p.position === filter).length > 0 && (
                <TableRow className="bg-accent/20 border-y border-accent/30"><TableCell colSpan={8} className="py-1 text-[10px] font-black text-accent uppercase text-center tracking-[0.4em]">Substitute Bench</TableCell></TableRow>
              )}
              {categorizedPlayers.bench.filter(p => filter === 'ALL' || p.position === filter).map(p => renderPlayerRow(p, 'BENCH'))}
              
              {!hideReserves && categorizedPlayers.reserves.filter(p => filter === 'ALL' || p.position === filter).length > 0 && (
                <TableRow className="bg-black/50 border-y border-primary/25"><TableCell colSpan={8} className="py-1 text-[10px] font-black text-muted-foreground uppercase text-center tracking-[0.4em]">Reserve Pool</TableCell></TableRow>
              )}
              {!hideReserves && categorizedPlayers.reserves
                .filter(p => filter === 'ALL' || p.position === filter)
                .sort((a, b) => {
                  const posOrder: Record<Position, number> = { GK: 0, DF: 1, DM: 2, MF: 3, FW: 4 };
                  const posDiff = (posOrder[a.position] ?? 5) - (posOrder[b.position] ?? 5);
                  return posDiff !== 0 ? posDiff : b.attributes.skill - a.attributes.skill;
                })
                .map(p => renderPlayerRow(p, 'RESERVE'))}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
      <PlayerProfile player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
    </div>
  );
}
