
"use client"

import { useGame } from '@/lib/store';
import { RetroWindow } from './RetroWindow';
import { Trophy, TrendingUp, TrendingDown, DollarSign, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function TeamRecords() {
  const { state } = useGame();
  const records = state.records;

  const RecordTile = ({ title, value, sub, icon: Icon, color, tooltip }: any) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="retro-tile flex items-start gap-3 md:gap-4 h-full min-h-[90px] md:min-h-[100px] cursor-help p-2">
            <div className={`p-2.5 md:p-3 bg-muted border border-primary/10 rounded-lg ${color}`}>
              <Icon size={22} className="md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] md:text-[13px] text-white/80 uppercase font-semibold mb-0.5">{title}</div>
              <div className="text-[15px] md:text-[18px] font-bold truncate uppercase text-white">{value || 'NO RECORD'}</div>
              <div className="text-[13px] md:text-[14px] text-white/70 italic truncate uppercase">{sub}</div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-[13px] font-black uppercase max-w-[240px]">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <RetroWindow title="CLUB PERFORMANCE RECORDS" titleClassName="text-[14px] md:text-[15px]" contentClassName="p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 auto-rows-fr">
          <RecordTile 
            title="Biggest Victory" 
            value={records.biggestWin?.score} 
            sub={records.biggestWin ? `vs ${records.biggestWin.opponent} (S${records.biggestWin.season})` : 'Awaiting first win...'}
            icon={TrendingUp}
            color="text-accent"
            tooltip="BEST LEAGUE MARGIN OF VICTORY"
          />
          <RecordTile 
            title="Heaviest Defeat" 
            value={records.biggestLoss?.score} 
            sub={records.biggestLoss ? `vs ${records.biggestLoss.opponent} (S${records.biggestLoss.season})` : 'Invincible so far!'}
            icon={TrendingDown}
            color="text-red-500"
            tooltip="WORST LEAGUE MARGIN OF DEFEAT"
          />
          <RecordTile 
            title="Record Transfer Paid" 
            value={records.transferPaid ? `£${(records.transferPaid.amount / 1000000).toFixed(1)}M` : '£0'} 
            sub={records.transferPaid ? `For ${records.transferPaid.player}` : 'No major signings.'}
            icon={DollarSign}
            color="text-primary"
            tooltip="HIGHEST CAPITAL OUTLAY FOR A PLAYER"
          />
          <RecordTile 
            title="Trophies Won" 
            value={state.manager?.trophies.length.toString()} 
            sub={`${state.manager?.trophies.join(', ') || 'No silverware yet.'}`}
            icon={Trophy}
            color="text-yellow-500"
            tooltip="ALL-TIME MAJOR COMPETITION HONOURS"
          />
        </div>
      </RetroWindow>

      <RetroWindow title="MANAGER LEGACY" titleClassName="text-[14px] md:text-[15px]" contentClassName="p-5 md:p-6">
        <div className="space-y-3 md:space-y-4 py-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between items-center text-[13px] md:text-[14px] uppercase font-semibold border-b border-primary/5 pb-3 cursor-help">
                   <span className="text-white/90">Total Games Managed</span>
                   <span className="font-bold text-cyan tabular-nums">{state.manager?.totalGames}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-[13px] font-black uppercase max-w-[240px]">AGGREGATE CAREER MATCH COUNT</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between items-center text-[13px] md:text-[14px] uppercase font-semibold border-b border-primary/5 pb-3 cursor-help">
                   <span className="text-white/90">Career Win Rate</span>
                   <span className="font-bold text-accent tabular-nums">{state.manager?.winPercentage.toFixed(1)}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-[13px] font-black uppercase max-w-[240px]">TOTAL CAREER PERFORMANCE METRIC</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between items-center text-[13px] md:text-[14px] uppercase font-semibold border-b border-primary/5 pb-3 cursor-help">
                   <span className="text-white/90">Seasons Completed</span>
                   <span className="font-bold text-white tabular-nums">{state.manager?.seasonsManaged}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-[13px] font-black uppercase max-w-[240px]">TOTAL COMPLETED CAMPAIGNS</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </RetroWindow>
    </div>
  );
}
