
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
    const lineupPlayers = userTeam.lineup.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
    const assignments = getTacticalAssignments(userTeam.formation, lineupPlayers);
    const map = new Map<string, string>();
    assignments.forEach(a => {
      if (a.player) map.set(a.player.id, a.slot.label);
    });
    return map;
  }, [userTeam, players]);

  const posPriority: Record<string, number> = { GK: 0, DF: 1, MF: 2, FW: 3, DM: 1 };

  const filteredPlayers = players
    .filter(p => filter === 'ALL' || p.position === filter)
    .sort((a, b) => {
      const isASelected = userTeam?.lineup.includes(a.id) ? 1 : 0;
      const isBSelected = userTeam?.lineup.includes(b.id) ? 1 : 0;
      if (isASelected !== isBSelected) return isBSelected - isASelected;
      if (posPriority[a.position] !== posPriority[b.position]) {
        return posPriority[a.position] - posPriority[b.position];
      }
      return b.attributes.skill - a.attributes.skill;
    });

  const handleCheckboxClick = (e: React.MouseEvent, pId: string) => {
    e.stopPropagation();
    togglePlayerLineup(pId);
  };

  const handleRowClick = (pId: string) => {
    if (onPlayerSwap) {
      onPlayerSwap(pId);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 px-3 py-2 bg-muted/50 border border-primary/10">
        <div className="flex flex-wrap gap-1">
          {(['ALL', 'GK', 'DF', 'MF', 'FW', 'DM'] as const).map(pos => (
            <Button
              key={pos}
              onClick={() => setFilter(pos)}
              variant={filter === pos ? "default" : "outline"}
              className="h-7 text-[10px] px-3 retro-button font-bold"
            >
              {pos}
            </Button>
          ))}
        </div>
        
        {!currentMatchRatings && (
          <div className="flex items-center gap-2">
            <Button onClick={clearLineup} variant="outline" className="h-7 text-[10px] px-3 retro-button text-red-500 border-red-500/20 font-bold">
              <Trash2 size={12} className="mr-1" /> CLEAR
            </Button>
            <Button onClick={autoPickLineup} variant="outline" className="h-7 text-[10px] px-3 retro-button text-accent border-accent/20 font-bold">
              <Wand2 size={12} className="mr-1" /> AUTO PICK
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    "text-[12px] font-bold px-3 py-1 border cursor-help",
                    selectedCount === 11 ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'
                  )}>
                    {selectedCount} / 11 SELECTED
                  </div>
                </TooltipTrigger>
                <TooltipContent className="font-black">YOU MUST SELECT EXACTLY 11 PLAYERS</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-primary/20 hover:bg-transparent">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableHead className="w-[45px] text-[11px] uppercase py-3 font-black tracking-tight cursor-help">Pick</TableHead>
                </TooltipTrigger>
                <TooltipContent className="font-black">SELECT FOR MATCH DAY LINEUP</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableHead className="w-[120px] text-[11px] uppercase py-3 font-black tracking-tight cursor-help">Tactical Role</TableHead>
                </TooltipTrigger>
                <TooltipContent className="font-black">NATURAL PROFILE & TEAM ASSIGNMENT</TooltipContent>
              </Tooltip>
              <TableHead className="text-[11px] uppercase py-3 font-black tracking-tight">Player Name</TableHead>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableHead className="text-center text-[11px] uppercase py-3 font-black tracking-tight cursor-help">Status</TableHead>
                </TooltipTrigger>
                <TooltipContent className="font-black">MATCH READINESS & DISCIPLINE</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableHead className="text-center text-[11px] uppercase py-3 font-black tracking-tight cursor-help">Morale</TableHead>
                </TooltipTrigger>
                <TooltipContent className="font-black">CURRENT PSYCHOLOGICAL STATE</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableHead className="text-center text-[11px] uppercase py-3 font-black tracking-tight cursor-help">Fit</TableHead>
                </TooltipTrigger>
                <TooltipContent className="font-black">PHYSICAL CONDITION PERCENTAGE</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableHead className="text-center text-[11px] uppercase py-3 font-black tracking-tight cursor-help">Skill</TableHead>
                </TooltipTrigger>
                <TooltipContent className="font-black">GLOBAL PERFORMANCE RATING (1-20)</TooltipContent>
              </Tooltip>
              <TableHead className="w-[45px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.map((p) => {
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
                  onClick={() => handleRowClick(p.id)}
                  className={cn(
                    "hover:bg-primary/5 transition-colors border-b border-primary/5 cursor-pointer",
                    isSelected ? 'bg-primary/10' : '',
                    isBeingSwapped ? 'bg-accent/20 border-accent ring-2 ring-accent ring-inset' : ''
                  )}
                >
                  <TableCell className="p-2 text-center">
                    <Checkbox 
                      checked={isSelected} 
                      disabled={!canPick && !isSelected}
                      onClick={(e) => handleCheckboxClick(e, p.id)} 
                      className="border-primary/50"
                    />
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex flex-col">
                      <span className="font-mono text-cyan text-[14px] font-black whitespace-nowrap leading-none mb-1">
                        {p.position} ({p.side})
                      </span>
                      {isSelected && assignedRole && (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] font-black text-accent uppercase tracking-tighter">ROLE: {assignedRole}</span>
                        </div>
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
                        {isSuspended && (
                          <Badge className="text-[10px] h-4 uppercase px-1.5 bg-red-600 border-none font-black">SUSP</Badge>
                        )}
                        {isInjured && (
                          <Badge className="text-[10px] h-4 uppercase px-1.5 bg-red-600 border-none font-black">INJ</Badge>
                        )}
                        {!isSuspended && !isInjured && <span className="text-[11px] font-black text-green-500 uppercase tracking-widest">READY</span>}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center py-2">
                    <div className="flex justify-center items-center gap-1">
                      <Smile size={12} className={p.morale > 70 ? "text-green-500" : p.morale > 40 ? "text-yellow-500" : "text-red-500"} />
                      <span className="text-[14px] font-mono font-bold">{p.morale}%</span>
                    </div>
                  </TableCell>
                  <TableCell className={cn("text-center text-[14px] font-mono font-bold py-2", p.fitness < 80 ? 'text-red-500' : '')}>{p.fitness}%</TableCell>
                  <TableCell className="text-center text-[16px] font-mono text-primary font-black py-2">{p.attributes.skill}</TableCell>
                  <TableCell className="text-right py-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-accent"
                          onClick={(e) => { e.stopPropagation(); setViewingPlayer(p); }}
                        >
                          <UserCircle size={18} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="font-black">VIEW PLAYER DOSSIER</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TooltipProvider>

      <PlayerProfile player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
    </div>
  );
}
