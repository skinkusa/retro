
"use client"

import { useState, useMemo } from 'react';
import { Team, Player, Position } from '@/types/game';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Smile, HeartPulse, ShieldAlert } from 'lucide-react';
import { formatMoney } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TeamRosterProps {
  team: Team | null;
  players: Player[];
  onClose: () => void;
  onPlayerClick: (player: Player) => void;
}

export function TeamRoster({ team, players, onClose, onPlayerClick }: TeamRosterProps) {
  const [filter, setFilter] = useState<Position | 'ALL'>('ALL');

  const filteredPlayers = useMemo(() => {
    return players
      .filter(p => filter === 'ALL' || p.position === filter)
      .sort((a, b) => b.attributes.skill - a.attributes.skill);
  }, [players, filter]);

  if (!team) return null;

  return (
    <Dialog open={!!team} onOpenChange={onClose}>
      <DialogContent className="bg-card border-primary p-0 overflow-hidden max-w-4xl max-md:max-w-[96vw] max-md:max-h-[95dvh] max-h-[90vh] flex flex-col font-mono rounded-2xl max-md:rounded-lg">
        <DialogHeader className="bg-primary p-5 max-md:p-2 shrink-0 rounded-t-xl">
          <DialogTitle className="text-primary-foreground uppercase flex justify-between items-center text-xl max-md:text-sm font-black tracking-tight">
            <div className="flex items-center gap-4 max-md:gap-2">
               <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: team.color }} />
               <span>{team.name} Squad</span>
            </div>
            <span className="text-[12px] opacity-70 font-mono tracking-[0.2em]">SCOUTING ROSTER</span>
          </DialogTitle>
          <DialogDescription className="sr-only">Roster for {team.name}.</DialogDescription>
        </DialogHeader>
        
        <div className="p-4 max-md:p-2 space-y-4 max-md:space-y-2 flex-1 min-h-0 overflow-auto">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 max-md:gap-1 px-3 max-md:px-2 py-2 max-md:py-1 bg-muted/50 border border-primary/10 rounded-xl">
            <div className="flex flex-wrap gap-1">
              {(['ALL', 'GK', 'DF', 'MF', 'FW', 'DM'] as const).map(pos => (
                <Button
                  key={pos}
                  onClick={() => setFilter(pos)}
                  variant={filter === pos ? "default" : "outline"}
                  className="h-8 max-md:h-6 text-[10px] max-md:text-[9px] px-3 max-md:px-2 retro-button font-black uppercase tracking-widest rounded-lg"
                >
                  {pos}
                </Button>
              ))}
            </div>
            <div className="text-[12px] font-black text-primary uppercase tracking-widest px-3 py-1 border border-primary/20 rounded-lg bg-black/20">
              {filteredPlayers.length} ATHLETES FOUND
            </div>
          </div>

          <div className="border border-primary/20 bg-black/20 rounded-2xl overflow-hidden shadow-inner">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-primary/40 bg-primary/20 hover:bg-primary/20">
                    <TableHead className="text-[13px] max-md:text-[10px] uppercase py-4 max-md:py-1.5 font-black tracking-wide text-white">Role</TableHead>
                    <TableHead className="text-[13px] max-md:text-[10px] uppercase py-4 max-md:py-1.5 font-black tracking-wide text-white">Player Identity</TableHead>
                    <TableHead className="text-center text-[13px] max-md:text-[10px] uppercase py-4 max-md:py-1.5 font-black tracking-wide text-white">Age</TableHead>
                    <TableHead className="text-center text-[13px] max-md:text-[10px] uppercase py-4 max-md:py-1.5 font-black tracking-wide text-white">Morale</TableHead>
                    <TableHead className="text-center text-[13px] max-md:text-[10px] uppercase py-4 max-md:py-1.5 font-black tracking-wide text-white">Fit</TableHead>
                    <TableHead className="text-center text-[13px] max-md:text-[10px] uppercase py-4 max-md:py-1.5 font-black tracking-wide text-white">Skill</TableHead>
                    <TableHead className="text-right text-[13px] max-md:text-[10px] uppercase py-4 max-md:py-1.5 font-black tracking-wide text-white">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlayers.map(p => {
                    const isSuspended = p.suspensionWeeks > 0;
                    const isInjured = !!p.injury;

                    return (
                      <TableRow 
                        key={p.id} 
                        onClick={() => onPlayerClick(p)}
                        className="hover:bg-primary/15 cursor-pointer border-b border-primary/5 group transition-colors"
                      >
                        <TableCell className="py-3 max-md:py-1">
                           <div className="flex flex-col">
                            <span className="font-mono text-cyan text-[13px] max-md:text-[11px] font-black leading-none uppercase">
                              {p.position} ({p.side})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[14px] max-md:text-xs font-black py-3 max-md:py-1">
                          <div className="flex items-center gap-2 max-md:gap-1">
                            <span className="uppercase text-white group-hover:text-accent transition-colors truncate max-w-[140px] max-md:max-w-[80px]">{p.name}</span>
                            <div className="flex gap-1">
                              {isSuspended && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge className="bg-red-600 border-none text-[8px] h-3.5 px-1 font-black"><ShieldAlert size={10} /></Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Suspended</TooltipContent>
                                </Tooltip>
                              )}
                              {isInjured && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge className="bg-red-600 border-none text-[8px] h-3.5 px-1 font-black"><HeartPulse size={10} /></Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Injured</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-[13px] max-md:text-[11px] font-mono font-bold py-3 max-md:py-1 text-white/80">{p.age}</TableCell>
                        <TableCell className="text-center py-3 max-md:py-1">
                          <div className="flex justify-center items-center gap-1.5 max-md:gap-1">
                            <Smile size={12} className={cn("max-md:w-3 max-md:h-3", p.morale > 70 ? "text-green-500" : p.morale > 40 ? "text-yellow-500" : "text-red-500")} />
                            <span className="text-[12px] max-md:text-[10px] font-mono font-bold">{p.morale}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-3 max-md:py-1">
                          <div className="flex justify-center items-center gap-1.5 max-md:gap-1">
                            <HeartPulse size={12} className={cn("max-md:w-3 max-md:h-3", p.fitness > 80 ? "text-accent" : "text-red-500")} />
                            <span className="text-[12px] max-md:text-[10px] font-mono font-bold">{p.fitness}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-[15px] max-md:text-xs font-mono text-primary font-black py-3 max-md:py-1">{p.attributes.skill}</TableCell>
                        <TableCell className="text-right font-mono text-[13px] max-md:text-[11px] font-black py-3 max-md:py-1 text-accent">{formatMoney(p.value)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </div>

        <div className="p-4 max-md:p-2 bg-muted/20 border-t border-primary/20 shrink-0">
          <Button 
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground font-black retro-button h-14 max-md:h-10 uppercase text-[15px] max-md:text-xs tracking-[0.3em] rounded-xl shadow-lg"
          >
            DISMISS PROFILE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
