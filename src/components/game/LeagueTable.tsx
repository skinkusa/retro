"use client"

import { Team } from '@/types/game';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipPortal } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface LeagueTableProps {
  teams: Team[];
  onTeamClick?: (teamId: string) => void;
}

export function LeagueTable({ teams, onTeamClick }: LeagueTableProps) {
  const getFormBubble = (result: string, index: number) => {
    const colors: Record<string, string> = { 'W': 'bg-green-600', 'D': 'bg-yellow-600', 'L': 'bg-red-600' };
    return (
      <Tooltip key={`form-${index}-${result}`}>
        <TooltipTrigger asChild>
          <span className={`${colors[result]} text-[11px] px-2 py-1 rounded-sm text-white font-black mr-1 cursor-help shadow-sm`}>{result}</span>
        </TooltipTrigger>
        <TooltipPortal><TooltipContent className="font-black">MATCH RESULT: {result === 'W' ? 'WIN' : result === 'D' ? 'DRAW' : 'LOSS'}</TooltipContent></TooltipPortal>
      </Tooltip>
    );
  };

  const getQualificationStyle = (team: Team) => {
    switch (team.qualification) {
      case 'CHAMPIONS': return 'border-l-8 border-l-cyan';
      case 'EUROPE': return 'border-l-8 border-l-blue-500';
      case 'PROMOTION': return 'border-l-8 border-l-green-500';
      case 'RELEGATION': return 'border-l-8 border-l-red-600';
      default: return 'border-l-8 border-l-transparent';
    }
  };

  return (
    <div className="space-y-4">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow className="border-b-4 border-primary/30 hover:bg-transparent bg-black/40">
              <TableHead className="w-[60px] text-[13px] uppercase font-black py-5 text-center">#</TableHead>
              <TableHead className="text-[13px] uppercase font-black py-5">Club Identity</TableHead>
              {['P', 'W', 'D', 'L', 'GD'].map(h => (
                <Tooltip key={h}>
                  <TooltipTrigger asChild><TableHead className="text-center text-[13px] uppercase font-black py-5 cursor-help">{h}</TableHead></TooltipTrigger>
                  <TooltipPortal><TooltipContent className="font-black">{h === 'P' ? 'PLAYED' : h === 'W' ? 'WINS' : h === 'D' ? 'DRAWS' : h === 'L' ? 'LOSSES' : 'GOAL DIFF'}</TooltipContent></TooltipPortal>
                </Tooltip>
              ))}
              <Tooltip>
                <TooltipTrigger asChild><TableHead className="text-center font-black text-[14px] uppercase text-cyan py-5 cursor-help">Pts</TableHead></TooltipTrigger>
                <TooltipPortal><TooltipContent className="font-black">LEAGUE POINTS</TooltipContent></TooltipPortal>
              </Tooltip>
              <TableHead className="text-right text-[13px] uppercase font-black py-5 pr-6">Recent Form</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((t, i) => (
              <TableRow key={t.id} onClick={() => onTeamClick?.(t.id)} className={cn("hover:bg-primary/15 cursor-pointer border-b-2 border-primary/10 transition-colors", t.isUserTeam ? "bg-primary/20" : "", getQualificationStyle(t))}>
                <TableCell className="font-black text-xl py-5 text-center tabular-nums text-white/60">{i + 1}</TableCell>
                <TableCell className="text-lg font-black py-5 flex items-center gap-4">
                  <div className="w-5 h-5 rounded-full shadow-2xl border-2 border-white/30" style={{ backgroundColor: t.color }} />
                  <span className="truncate max-w-[220px] tracking-tighter uppercase italic">{t.name}</span>
                </TableCell>
                <TableCell className="text-center text-lg font-black py-5 tabular-nums">{t.played}</TableCell>
                <TableCell className="text-center text-lg font-black py-5 tabular-nums">{t.won}</TableCell>
                <TableCell className="text-center text-lg font-black py-5 tabular-nums">{t.drawn}</TableCell>
                <TableCell className="text-center text-lg font-black py-5 tabular-nums">{t.lost}</TableCell>
                <TableCell className="text-center text-lg font-black py-5 tabular-nums text-white/50">{(t.goalsFor - t.goalsAgainst)}</TableCell>
                <TableCell className="text-center font-black text-accent text-2xl py-5 tabular-nums">{t.points}</TableCell>
                <TableCell className="text-right py-5 pr-6"><div className="flex justify-end">{t.playedHistory.map((h, idx) => getFormBubble(h, idx))}</div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>
      <div className="flex flex-wrap gap-8 px-6 py-4 text-[12px] uppercase font-black text-muted-foreground border-t-2 border-primary/20 bg-black/40 rounded-b-2xl">
        <div className="flex items-center gap-2"><div className="w-5 h-2 bg-cyan shadow-[0_0_10px_rgba(0,255,255,0.5)]" /> Champions Cup</div>
        <div className="flex items-center gap-2"><div className="w-5 h-2 bg-blue-500" /> UEFA Cup</div>
        <div className="flex items-center gap-2"><div className="w-5 h-2 bg-green-500" /> Promotion</div>
        <div className="flex items-center gap-2"><div className="w-5 h-2 bg-red-600" /> Relegation Zone</div>
      </div>
    </div>
  );
}
