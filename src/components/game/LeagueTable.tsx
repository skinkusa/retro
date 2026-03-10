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
          <span className={`${colors[result]} text-[11px] max-[1300px]:text-[16px] px-2 max-[1300px]:px-3 py-1 max-[1300px]:py-2 rounded-sm text-white font-black mr-1 max-[1300px]:mr-2 cursor-help shadow-sm`}>{result}</span>
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
            <TableRow className="border-b-4 border-primary/40 hover:bg-transparent bg-primary/25">
              <TableHead className="w-[60px] max-[1300px]:w-[80px] text-[14px] max-[1300px]:text-[20px] uppercase font-black py-5 max-[1300px]:py-8 text-center text-white tracking-wide">#</TableHead>
              <TableHead className="text-[14px] max-[1300px]:text-[20px] uppercase font-black py-5 max-[1300px]:py-8 text-white tracking-wide px-2 max-[1300px]:px-4">Club Identity</TableHead>
              {['P', 'W', 'D', 'L', 'GD'].map(h => (
                <Tooltip key={h}>
                  <TooltipTrigger asChild><TableHead className="text-center text-[14px] max-[1300px]:text-[20px] uppercase font-black py-5 max-[1300px]:py-8 cursor-help text-white tracking-wide px-2 max-[1300px]:px-2">{h}</TableHead></TooltipTrigger>
                  <TooltipPortal><TooltipContent className="font-black">{h === 'P' ? 'PLAYED' : h === 'W' ? 'WINS' : h === 'D' ? 'DRAWS' : h === 'L' ? 'LOSSES' : 'GOAL DIFF'}</TooltipContent></TooltipPortal>
                </Tooltip>
              ))}
              <Tooltip>
                <TooltipTrigger asChild><TableHead className="text-center font-black text-[14px] max-[1300px]:text-[20px] uppercase text-cyan py-5 max-[1300px]:py-8 cursor-help tracking-wide px-2 max-[1300px]:px-2">Pts</TableHead></TooltipTrigger>
                <TooltipPortal><TooltipContent className="font-black">LEAGUE POINTS</TooltipContent></TooltipPortal>
              </Tooltip>
              <TableHead className="text-right text-[14px] max-[1300px]:text-[20px] uppercase font-black py-5 max-[1300px]:py-8 pr-6 max-[1300px]:pr-10 text-white tracking-wide">Form</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((t, i) => (
              <TableRow key={t.id} onClick={() => onTeamClick?.(t.id)} className={cn("hover:bg-primary/15 cursor-pointer border-b-2 border-primary/10 transition-colors", t.isUserTeam ? "bg-primary/20" : "", getQualificationStyle(t))}>
                <TableCell className="font-black text-xl max-[1300px]:text-3xl py-5 max-[1300px]:py-8 text-center tabular-nums text-white/60 px-2 max-[1300px]:px-4">{i + 1}</TableCell>
                <TableCell className="text-base max-[1300px]:text-xl font-black py-5 max-[1300px]:py-8 flex items-center gap-4 max-[1300px]:gap-3 px-2 max-[1300px]:px-4">
                  <div className="w-5 h-5 max-[1300px]:w-7 max-[1300px]:h-7 rounded-full shadow-2xl border-2 border-white/30 shrink-0" style={{ backgroundColor: t.color }} />
                  <span className="truncate max-w-[220px] max-[1300px]:max-w-[280px] tracking-tighter uppercase italic">{t.name}</span>
                </TableCell>
                <TableCell className="text-center text-lg max-[1300px]:text-2xl font-black py-5 max-[1300px]:py-8 tabular-nums px-2 max-[1300px]:px-2">{t.played}</TableCell>
                <TableCell className="text-center text-lg max-[1300px]:text-2xl font-black py-5 max-[1300px]:py-8 tabular-nums px-2 max-[1300px]:px-2">{t.won}</TableCell>
                <TableCell className="text-center text-lg max-[1300px]:text-2xl font-black py-5 max-[1300px]:py-8 tabular-nums px-2 max-[1300px]:px-2">{t.drawn}</TableCell>
                <TableCell className="text-center text-lg max-[1300px]:text-2xl font-black py-5 max-[1300px]:py-8 tabular-nums px-2 max-[1300px]:px-2">{t.lost}</TableCell>
                <TableCell className="text-center text-lg max-[1300px]:text-2xl font-black py-5 max-[1300px]:py-8 tabular-nums text-white/50 px-2 max-[1300px]:px-2">{(t.goalsFor - t.goalsAgainst)}</TableCell>
                <TableCell className="text-center font-black text-accent text-lg max-[1300px]:text-2xl py-5 max-[1300px]:py-8 tabular-nums px-2 max-[1300px]:px-2">{t.points}</TableCell>
                <TableCell className="text-right py-5 max-[1300px]:py-8 pr-6 max-[1300px]:pr-10 pl-2 max-[1300px]:pl-4"><div className="flex justify-end">{t.playedHistory.map((h, idx) => getFormBubble(h, idx))}</div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>
      <div className="flex flex-wrap gap-8 max-[1300px]:gap-12 px-6 max-[1300px]:px-10 py-4 max-[1300px]:py-6 text-[12px] max-[1300px]:text-[16px] uppercase font-black text-muted-foreground border-t-2 border-primary/20 bg-black/70 rounded-b-2xl">
        <div className="flex items-center gap-2 max-[1300px]:gap-3"><div className="w-5 max-[1300px]:w-8 h-2 max-[1300px]:h-3 bg-cyan shadow-[0_0_10px_rgba(0,255,255,0.5)]" /> Champions Cup</div>
        <div className="flex items-center gap-2 max-[1300px]:gap-3"><div className="w-5 max-[1300px]:w-8 h-2 max-[1300px]:h-3 bg-blue-500" /> UEFA Cup</div>
        <div className="flex items-center gap-2 max-[1300px]:gap-3"><div className="w-5 max-[1300px]:w-8 h-2 max-[1300px]:h-3 bg-green-500" /> Promotion</div>
        <div className="flex items-center gap-2 max-[1300px]:gap-3"><div className="w-5 max-[1300px]:w-8 h-2 max-[1300px]:h-3 bg-red-600" /> Relegation Zone</div>
      </div>
    </div>
  );
}
