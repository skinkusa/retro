
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
      <DialogContent className="bg-card border-primary p-0 overflow-hidden max-w-4xl max-h-[90vh] flex flex-col font-mono rounded-2xl">
        <DialogHeader className="bg-primary p-5 shrink-0 rounded-t-xl">
          <DialogTitle className="text-primary-foreground uppercase flex justify-between items-center text-xl font-black tracking-tight">
            <div className="flex items-center gap-4">
               <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: team.color }} />
               <span>{team.name} Squad</span>
            </div>
            <span className="text-[12px] opacity-70 font-mono tracking-[0.2em]">SCOUTING ROSTER</span>
          </DialogTitle>
          <DialogDescription className="sr-only">Roster for {team.name}.</DialogDescription>
        </DialogHeader>
        
        <div className="p-4 space-y-4 flex-1 min-h-0 overflow-auto">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-2 px-3 py-2 bg-muted/50 border border-primary/10 rounded-xl">
            <div className="flex flex-wrap gap-1">
              {(['ALL', 'GK', 'DF', 'MF', 'FW', 'DM'] as const).map(pos => (
                <Button
                  key={pos}
                  onClick={() => setFilter(pos)}
                  variant={filter === pos ? "default" : "outline"}
                  className="h-8 text-[10px] px-3 retro-button font-black uppercase tracking-widest rounded-lg"
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
                    <TableHead className="text-[13px] uppercase py-4 font-black tracking-wide text-white">Role</TableHead>
                    <TableHead className="text-[13px] uppercase py-4 font-black tracking-wide text-white">Player Identity</TableHead>
                    <TableHead className="text-center text-[13px] uppercase py-4 font-black tracking-wide text-white">Age</TableHead>
                    <TableHead className="text-center text-[13px] uppercase py-4 font-black tracking-wide text-white">Morale</TableHead>
                    <TableHead className="text-center text-[13px] uppercase py-4 font-black tracking-wide text-white">Fit</TableHead>
                    <TableHead className="text-center text-[13px] uppercase py-4 font-black tracking-wide text-white">Skill</TableHead>
                    <TableHead className="text-right text-[13px] uppercase py-4 font-black tracking-wide text-white">Value</TableHead>
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
                        <TableCell className="py-3">
                           <div className="flex flex-col">
                            <span className="font-mono text-cyan text-[13px] font-black leading-none uppercase">
                              {p.position} ({p.side})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[14px] font-black py-3">
                          <div className="flex items-center gap-2">
                            <span className="uppercase text-white group-hover:text-accent transition-colors truncate max-w-[140px]">{p.name}</span>
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
                        <TableCell className="text-center text-[13px] font-mono font-bold py-3 text-white/80">{p.age}</TableCell>
                        <TableCell className="text-center py-3">
                          <div className="flex justify-center items-center gap-1.5">
                            <Smile size={12} className={p.morale > 70 ? "text-green-500" : p.morale > 40 ? "text-yellow-500" : "text-red-500"} />
                            <span className="text-[12px] font-mono font-bold">{p.morale}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          <div className="flex justify-center items-center gap-1.5">
                            <HeartPulse size={12} className={p.fitness > 80 ? "text-accent" : "text-red-500"} />
                            <span className="text-[12px] font-mono font-bold">{p.fitness}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-[15px] font-mono text-primary font-black py-3">{p.attributes.skill}</TableCell>
                        <TableCell className="text-right font-mono text-[13px] font-black py-3 text-accent">{formatMoney(p.value)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        </div>

        <div className="p-4 bg-muted/20 border-t border-primary/20 shrink-0">
          <Button 
            onClick={onClose}
            className="w-full bg-primary text-primary-foreground font-black retro-button h-14 uppercase text-[15px] tracking-[0.3em] rounded-xl shadow-lg"
          >
            DISMISS PROFILE
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
