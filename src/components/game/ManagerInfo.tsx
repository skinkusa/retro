"use client"

import { useGame } from '@/lib/store';
import { RetroWindow } from './RetroWindow';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserCircle, ShieldAlert, HelpCircle } from 'lucide-react';

export function ManagerInfo() {
  const { state, applyForJob } = useGame();
  const manager = state.manager;

  if (!manager) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RetroWindow title="MANAGER PHILOSOPHY">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase">Name</span>
              <span className="text-sm font-bold text-primary">{manager.name.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground uppercase">Philosophy</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={10} className="text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="text-[11px] max-w-[200px]">
                    Your chosen core management style, fixed at career start.
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-bold text-accent">{manager.personality.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase">Reputation</span>
              <span className="text-sm font-bold">{manager.reputation} / 100</span>
            </div>
            <div className="mt-2 p-3 bg-primary/5 border border-primary/20">
               <h4 className="text-[10px] font-bold text-primary uppercase mb-1">Philosophy Traits</h4>
               <p className="text-[10px] italic leading-tight text-muted-foreground">
                 {manager.personality === 'Analyst' && "Tactical Master: Provides a +5% strength boost to all areas of the pitch through superior preparation."}
                 {manager.personality === 'Motivator' && "Man Management: Maintains a positive dressing room with 25% faster morale recovery rates."}
                 {manager.personality === 'Economist' && "Financial Prudence: Reduces the club's weekly wage bill by 10% through strict contract management."}
                 {manager.personality === 'Maverick' && "Entertainer: Focuses on aggressive attacking football, increasing goal probabilities by 15% for both teams."}
                 {manager.personality === 'Celebrity' && "Star Profile: Starts with higher reputation but faces 20% harsher board scrutiny on poor results."}
               </p>
            </div>
          </div>
        </RetroWindow>

        <RetroWindow title="CAREER STATISTICS">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted p-2 border border-primary/10 text-center">
                <div className="text-[8px] text-muted-foreground uppercase">Games Played</div>
                <div className="text-lg font-mono text-cyan">{manager.totalGames}</div>
              </div>
              <div className="bg-muted p-2 border border-primary/10 text-center">
                <div className="text-[8px] text-muted-foreground uppercase">Win %</div>
                <div className="text-lg font-mono text-cyan">{manager.winPercentage.toFixed(1)}%</div>
              </div>
            </div>
            <div className="pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1 cursor-help">
                    <div className="flex justify-between text-[10px] uppercase">
                      <span className="flex items-center gap-1 font-bold">
                        Board Confidence
                      </span>
                      <span className={state.boardConfidence > 50 ? "text-green-500" : "text-red-500"}>
                        {state.boardConfidence}%
                      </span>
                    </div>
                    <Progress value={state.boardConfidence} className="h-2 rounded-none bg-primary/10" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-[11px] max-w-[200px]">How much the board trusts your leadership. Drops on losses or failing targets.</TooltipContent>
              </Tooltip>
              <div className="mt-3 p-2 bg-primary/5 border border-primary/10">
                <div className="text-[8px] text-muted-foreground uppercase mb-1">Board Expectations</div>
                <div className="text-[10px] font-bold text-primary uppercase">{state.boardExpectation}</div>
                <div className="text-[8px] text-muted-foreground italic mt-1">Minimum Position: {state.targetPosition}th</div>
              </div>
            </div>
          </div>
        </RetroWindow>
      </div>

      <RetroWindow title="JOB MARKET: VACANCIES">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-primary/40 bg-primary/20">
              <TableHead className="text-[12px] uppercase font-black text-white tracking-wide">Club</TableHead>
              <TableHead className="text-[12px] uppercase font-black text-white tracking-wide">Division</TableHead>
              <TableHead className="text-center text-[12px] uppercase font-black text-white tracking-wide">Reputation</TableHead>
              <TableHead className="text-right text-[12px] uppercase font-black text-white tracking-wide">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.jobMarket.map(teamId => {
              const team = state.teams.find(t => t.id === teamId);
              if (!team) return null;
              return (
                <TableRow key={teamId} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                  <TableCell className="text-xs font-bold">{team.name.toUpperCase()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">DIV {team.division}</TableCell>
                  <TableCell className="text-center font-mono text-cyan text-xs">{team.reputation}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => applyForJob(team.id)} 
                      className="h-6 text-[8px] bg-accent/20 text-accent hover:bg-accent hover:text-accent-foreground retro-button px-2"
                    >
                      APPLY
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {state.jobMarket.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground text-xs italic">
                  NO VACANCIES CURRENTLY ADVERTISED.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </RetroWindow>
    </div>
  );
}
