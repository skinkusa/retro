
"use client"

import { useState, useMemo } from 'react';
import { Player, Position } from '@/types/game';
import { useGame } from '@/lib/store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Trash2, Wand2, ShieldAlert, HeartPulse, Smile, RefreshCw, UserCircle } from 'lucide-react';
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
    assignments.forEach(a => {
      if (a.player) map.set(a.player.id, a.slot.label);
    });
    return map;
  }, [userTeam, players]);

  const categorizedPlayers = useMemo(() => {
    const starters = players.filter(p => userTeam?.lineup.slice(0, 11).includes(p.id));
    const bench = players.filter(p => userTeam?.lineup.slice(11, 16).includes(p.id));
    const reserves = players.filter(p => !userTeam?.lineup.includes(p.id));

    // Sort starters by tactical order
    const sortedStarters = (userTeam?.lineup.slice(0, 11) || [])
      .map(id => starters.find(p => p.id === id))
      .filter(Boolean) as Player[];

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
          "hover:bg-primary/5 transition-colors border-b border-primary/5 cursor-pointer",
          group === 'STARTER' ? 'bg-primary/10' : group === 'BENCH' ? 'bg-accent/5' : '',
          isBeingSwapped ? 'bg-accent/20 border-accent ring-2 ring-accent ring-inset' : ''
        )}
      >
        <TableCell className="p-2 text-center">
          <Checkbox 
            checked={isSelected} 
            disabled={!canPick && !isSelected}
            onClick={(e) => { e.stopPropagation(); togglePlayerLineup(p.id); }} 
            className="border-primary/50"
          />
        </TableCell>
        <TableCell className="py-2">
          <div className="flex flex-col">
            <span className="font-mono text-cyan text-[14px] font-black whitespace-nowrap leading-none mb-1">
              {p.position} ({p.side})
            </span>
            {group === 'STARTER' && assignedRole && (
              <span className="text-[11px] font-black text-accent uppercase tracking-tighter">ROLE: {assignedRole}</span>
            )}
            {group === 'BENCH' && (
              <span className="text-[11px] font-black text-primary uppercase tracking-tighter">SUB BENCH</span>
            )}
          </div>
        </TableCell>
        <TableCell className="text-[15px] font-black py-2">
          <div className="uppercase truncate max-w-[150px] text-white">
            {p.name}
          </div>
        </TableCell>
        <TableCell className="text-center py-2">
          {currentMatchRatings ? (
            <span className={cn(
              "font-mono text-[16px] font-black",
              matchRating && matchRating >= 7.5 ? 'text-accent' : matchRating && matchRating < 5.5 ? 'text-red-500' : 'text-white'
            )}>
              {matchRating?.toFixed(1) || '0.0'}
            </span>
          ) : (
            <div className="flex justify-center gap-1">
              {isSuspended && <Badge className="bg-red-600 font-black text-[10px]">SUSP</Badge>}
              {isInjured && <Badge className="bg-red-600 font-black text-[10px]">INJ</Badge>}
              {!isSuspended && !isInjured && <span className="text-[11px] font-black text-green-500 uppercase">READY</span>}
            </div>
          )}
        </TableCell>
        <TableCell className="text-center py-2">
          <div className="flex justify-center items-center gap-1">
            <Smile size={12} className={p.morale > 70 ? "text-green-500" : p.morale > 40 ? "text-yellow-500" : "text-red-500"} />
            <span className="text-[14px] font-mono font-black">{p.morale}%</span>
          </div>
        </TableCell>
        <TableCell className={cn("text-center text-[14px] font-mono font-black py-2", p.fitness < 80 ? 'text-red-500' : '')}>{p.fitness}%</TableCell>
        <TableCell className="text-center text-[16px] font-mono text-primary font-black py-2">{p.attributes.skill}</TableCell>
        <TableCell className="text-right py-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-accent" onClick={(e) => { e.stopPropagation(); setViewingPlayer(p); }}>
            <UserCircle size={18} />
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 px-3 py-2 bg-muted/50 border border-primary/10 rounded-lg">
        <div className="flex flex-wrap gap-1">
          {(['ALL', 'GK', 'DF', 'MF', 'FW', 'DM'] as const).map(pos => (
            <Button key={pos} onClick={() => setFilter(pos)} variant={filter === pos ? "default" : "outline"} className="h-7 text-[10px] px-3 retro-button font-black">{pos}</Button>
          ))}
        </div>
        
        {!currentMatchRatings && (
          <div className="flex items-center gap-2">
            <Button onClick={clearLineup} variant="outline" className="h-7 text-[10px] px-3 retro-button text-red-500 border-red-500/20 font-black"><Trash2 size={12} className="mr-1" /> CLEAR</Button>
            <Button onClick={autoPickLineup} variant="outline" className="h-7 text-[10px] px-3 retro-button text-accent border-accent/20 font-black"><Wand2 size={12} className="mr-1" /> AUTO PICK</Button>
            <div className={cn("text-[12px] font-black px-3 py-1 border rounded-md", selectedCount >= 11 ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5')}>
              {Math.min(11, selectedCount)}/11 XI • {Math.max(0, selectedCount - 11)}/5 BENCH
            </div>
          </div>
        )}
      </div>

      <div className="overflow-auto custom-scrollbar max-h-[60vh]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-primary/20 bg-black/20">
              <TableHead className="w-[45px] text-[11px] font-black uppercase">Pick</TableHead>
              <TableHead className="w-[120px] text-[11px] font-black uppercase">Role</TableHead>
              <TableHead className="text-[11px] font-black uppercase">Identity</TableHead>
              <TableHead className="text-center text-[11px] font-black uppercase">Status</TableHead>
              <TableHead className="text-center text-[11px] font-black uppercase">Morale</TableHead>
              <TableHead className="text-center text-[11px] font-black uppercase">Fit</TableHead>
              <TableHead className="text-center text-[11px] font-black uppercase">Skill</TableHead>
              <TableHead className="w-[45px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorizedPlayers.starters.filter(p => filter === 'ALL' || p.position === filter).map(p => renderPlayerRow(p, 'STARTER'))}
            {categorizedPlayers.bench.filter(p => filter === 'ALL' || p.position === filter).length > 0 && (
              <TableRow className="bg-primary/5 hover:bg-primary/5 border-y-2 border-primary/20"><TableCell colSpan={8} className="py-1 text-[10px] font-black text-primary uppercase text-center tracking-[0.5em]">Substitute Bench</TableCell></TableRow>
            )}
            {categorizedPlayers.bench.filter(p => filter === 'ALL' || p.position === filter).map(p => renderPlayerRow(p, 'BENCH'))}
            {categorizedPlayers.reserves.filter(p => filter === 'ALL' || p.position === filter).length > 0 && (
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-y-2 border-primary/20"><TableCell colSpan={8} className="py-1 text-[10px] font-black text-muted-foreground uppercase text-center tracking-[0.5em]">Reserve Pool</TableCell></TableRow>
            )}
            {categorizedPlayers.reserves.filter(p => filter === 'ALL' || p.position === filter).sort((a, b) => b.attributes.skill - a.attributes.skill).map(p => renderPlayerRow(p, 'RESERVE'))}
          </TableBody>
        </Table>
      </div>

      <PlayerProfile player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
    </div>
  );
}
