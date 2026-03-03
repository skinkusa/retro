
"use client"

import { Team } from '@/types/game';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
          <span className={`${colors[result]} text-[10px] px-2 py-0.5 rounded-sm text-white font-black mr-0.5 cursor-help`}>{result}</span>
        </TooltipTrigger>
        <TooltipContent className="font-black">MATCH RESULT: {result === 'W' ? 'WIN' : result === 'D' ? 'DRAW' : 'LOSS'}</TooltipContent>
      </Tooltip>
    );
  };

  const getQualificationStyle = (team: Team) => {
    switch (team.qualification) {
      case 'CHAMPIONS': return 'border-l-4 border-l-cyan';
      case 'EUROPE': return 'border-l-4 border-l-blue-500';
      case 'PROMOTION': return 'border-l-4 border-l-green-500';
      case 'RELEGATION': return 'border-l-4 border-l-red-600';
      default: return 'border-l-4 border-l-transparent';
    }
  };

  return (
    <div className="space-y-4">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-primary/30 hover:bg-transparent">
              <TableHead className="w-[45px] text-[12px] uppercase font-black py-4">#</TableHead>
              <TableHead className="text-[12px] uppercase font-black py-4">Club Identity</TableHead>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableHead className="text-center text-[12px] uppercase font-black py-4 cursor-help">P</TableHead>
                </TooltipTrigger>
                <TooltipContent className="font-black">GAMES PLAYED</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableHead className="text-center text-[12px] uppercase font-black py-4 cursor-help">W</TableHead>
                </TooltipTrigger>
                <TooltipContent className="font-black">WINS</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableHead className="text-center text-[12px] uppercase font-black py-4 cursor-help">D</TableHead>
                </TooltipTrigger>
                <TooltipContent className="font-black">DRAWS</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableHead className="text-center text-[12px] uppercase font-black py-4 cursor-help">L</TableHead>
                </TooltipTrigger>
                <TooltipContent className="font-black">LOSSES</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableHead className="text-center text-[12px] uppercase font-black py-4 cursor-help">GD</TableHead>
                </TooltipTrigger>
                <TooltipContent className="font-black">GOAL DIFFERENCE</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TableHead className="text-center font-black text-[12px] uppercase text-cyan py-4 cursor-help">Pts</TableHead>
                </TooltipTrigger>
                <TooltipContent className="font-black">LEAGUE POINTS</TooltipContent>
              </Tooltip>
              <TableHead className="text-right text-[12px] uppercase font-black py-4 pr-4">Form</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((t, i) => (
              <TableRow 
                key={t.id} 
                onClick={() => onTeamClick?.(t.id)}
                className={`${t.isUserTeam ? "bg-primary/20" : ""} hover:bg-primary/10 cursor-pointer border-b border-primary/10 ${getQualificationStyle(t)} transition-colors`}
              >
                <TableCell className="font-mono text-[15px] py-4 font-black text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="text-[15px] font-black py-4 flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full shadow-md border border-white/20" style={{ backgroundColor: t.color }} />
                  <span className="truncate max-w-[180px] tracking-tight">{t.name.toUpperCase()}</span>
                </TableCell>
                <TableCell className="text-center text-[15px] font-mono py-4 font-bold">{t.played}</TableCell>
                <TableCell className="text-center text-[15px] font-mono py-4">{t.won}</TableCell>
                <TableCell className="text-center text-[15px] font-mono py-4">{t.drawn}</TableCell>
                <TableCell className="text-center text-[15px] font-mono py-4">{t.lost}</TableCell>
                <TableCell className="text-center text-[15px] font-mono py-4 text-muted-foreground">{(t.goalsFor - t.goalsAgainst)}</TableCell>
                <TableCell className="text-center font-black text-accent text-[18px] font-mono py-4">{t.points}</TableCell>
                <TableCell className="text-right py-4 pr-4">
                  <div className="flex justify-end">
                    {t.playedHistory.map((h, idx) => getFormBubble(h, idx))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TooltipProvider>
      
      <div className="flex flex-wrap gap-6 px-4 py-3 text-[11px] uppercase font-black text-muted-foreground border-t border-primary/10 bg-black/20 rounded-b-xl">
        <div className="flex items-center gap-2"><div className="w-4 h-1.5 bg-cyan shadow-[0_0_5px_rgba(0,255,255,0.5)]" /> Champions Cup</div>
        <div className="flex items-center gap-2"><div className="w-4 h-1.5 bg-blue-500" /> UEFA Cup</div>
        <div className="flex items-center gap-2"><div className="w-4 h-1.5 bg-green-500" /> Promotion</div>
        <div className="flex items-center gap-2"><div className="w-4 h-1.5 bg-red-600" /> Relegation</div>
      </div>
    </div>
  );
}
