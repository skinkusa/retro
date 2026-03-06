"use client"

import { useGame } from '@/lib/store';
import { RetroWindow } from './RetroWindow';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export function ManagerInfo() {
  const { state, applyForJob } = useGame();
  const manager = state.manager;

  if (!manager) return null;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Two-column upper: Philosophy + Career Statistics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6">
        <RetroWindow title="MANAGER PHILOSOPHY" titleClassName="text-[14px] md:text-[15px]" contentClassName="p-5 md:p-6">
          <div className="space-y-5 md:space-y-6">
            <div className="flex justify-between items-center gap-4">
              <span className="text-[13px] md:text-[14px] text-white/90 uppercase font-semibold">Name</span>
              <span className="text-[18px] md:text-[22px] font-bold text-primary uppercase truncate">{manager.name.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[13px] md:text-[14px] text-white/90 uppercase font-semibold">Philosophy</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={14} className="text-white/70 cursor-help shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent className="text-[13px] max-w-[220px]">
                    Your chosen core management style, fixed at career start.
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-[20px] md:text-[26px] font-black text-accent uppercase">{manager.personality.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-[13px] md:text-[14px] text-white/90 uppercase font-semibold">Reputation</span>
              <span className="text-[22px] md:text-[28px] font-black text-cyan tabular-nums">{manager.reputation} / 100</span>
            </div>
            <div className="mt-4 p-4 md:p-5 bg-primary/10 border-2 border-primary/20 rounded-lg">
              <h4 className="text-[13px] md:text-[15px] font-black text-primary uppercase tracking-wide mb-2">Philosophy Traits</h4>
              <p className="text-[14px] md:text-[15px] leading-snug text-white/95">
                {manager.personality === 'Analyst' && "Tactical Master: Provides a +5% strength boost to all areas of the pitch through superior preparation."}
                {manager.personality === 'Motivator' && "Man Management: Maintains a positive dressing room with 25% faster morale recovery rates."}
                {manager.personality === 'Economist' && "Financial Prudence: Reduces the club's weekly wage bill by 10% through strict contract management."}
                {manager.personality === 'Maverick' && "Entertainer: Focuses on aggressive attacking football, increasing goal probabilities by 15% for both teams."}
                {manager.personality === 'Celebrity' && "Star Profile: Starts with higher reputation but faces 20% harsher board scrutiny on poor results."}
              </p>
            </div>
          </div>
        </RetroWindow>

        <RetroWindow title="CAREER STATISTICS" titleClassName="text-[14px] md:text-[15px]" contentClassName="p-5 md:p-6">
          <div className="space-y-5 md:space-y-6">
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              <div className="bg-muted/80 p-4 md:p-5 border-2 border-primary/15 rounded-lg text-center">
                <div className="text-[12px] md:text-[13px] text-white/80 uppercase font-semibold mb-1">Games Played</div>
                <div className="text-[28px] md:text-[34px] font-black font-mono text-cyan tabular-nums">{manager.totalGames}</div>
              </div>
              <div className="bg-muted/80 p-4 md:p-5 border-2 border-primary/15 rounded-lg text-center">
                <div className="text-[12px] md:text-[13px] text-white/80 uppercase font-semibold mb-1">Win %</div>
                <div className="text-[28px] md:text-[34px] font-black font-mono text-cyan tabular-nums">{manager.winPercentage.toFixed(1)}%</div>
              </div>
            </div>
            <div className="pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-2 cursor-help">
                    <div className="flex justify-between items-center text-[13px] md:text-[14px] uppercase font-bold">
                      <span>Board Confidence</span>
                      <span className={state.boardConfidence > 50 ? "text-green-500 font-black tabular-nums" : "text-red-500 font-black tabular-nums"}>
                        {state.boardConfidence}%
                      </span>
                    </div>
                    <Progress value={state.boardConfidence} className="h-3 md:h-4 rounded-none bg-primary/20" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="text-[13px] max-w-[240px]">How much the board trusts your leadership. Drops on losses or failing targets.</TooltipContent>
              </Tooltip>
              <div className="mt-4 p-4 md:p-5 bg-primary/10 border-2 border-primary/15 rounded-lg">
                <div className="text-[12px] md:text-[13px] text-white/80 uppercase font-semibold mb-2">Board Expectations</div>
                <div className="text-[15px] md:text-[17px] font-bold text-primary uppercase leading-snug">{state.boardExpectation}</div>
                <div className="text-[13px] md:text-[14px] text-white/80 mt-2">Minimum Position: {state.targetPosition}th</div>
              </div>
            </div>
          </div>
        </RetroWindow>
      </div>

      {/* Job Market / Vacancies */}
      <RetroWindow title="JOB MARKET: VACANCIES" titleClassName="text-[14px] md:text-[15px]" contentClassName="p-5 md:p-6">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-primary/40 bg-primary/20 hover:bg-primary/20">
              <TableHead className="text-[14px] uppercase font-bold text-white tracking-wide py-4">Club</TableHead>
              <TableHead className="text-[14px] uppercase font-bold text-white tracking-wide py-4">Division</TableHead>
              <TableHead className="text-center text-[14px] uppercase font-bold text-white tracking-wide py-4">Reputation</TableHead>
              <TableHead className="text-right text-[14px] uppercase font-bold text-white tracking-wide py-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.jobMarket.map(teamId => {
              const team = state.teams.find(t => t.id === teamId);
              if (!team) return null;
              return (
                <TableRow key={teamId} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                  <TableCell className="text-[15px] md:text-[16px] font-bold py-3 text-white">{team.name.toUpperCase()}</TableCell>
                  <TableCell className="text-[15px] md:text-[16px] text-white py-3">DIV {team.division}</TableCell>
                  <TableCell className="text-center font-mono text-cyan text-[15px] md:text-[16px] font-semibold py-3">{team.reputation}</TableCell>
                  <TableCell className="text-right py-3">
                    <Button
                      onClick={() => applyForJob(team.id)}
                      className="h-9 md:h-10 text-[13px] md:text-[14px] font-bold bg-accent/20 text-accent hover:bg-accent hover:text-accent-foreground retro-button px-4 uppercase"
                    >
                      APPLY
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {state.jobMarket.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 md:py-16 text-white/70 text-[15px] md:text-[16px] italic">
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
