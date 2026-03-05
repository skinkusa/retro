
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
          <div className="retro-tile flex items-start gap-3 max-md:gap-2 h-full min-h-[80px] max-md:min-h-[60px] cursor-help">
            <div className={`p-2 max-md:p-1.5 bg-muted border border-primary/10 ${color}`}>
              <Icon size={18} className="max-md:w-4 max-md:h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[8px] max-md:text-xs text-white uppercase font-bold">{title}</div>
              <div className="text-[10px] max-md:text-sm font-bold truncate uppercase">{value || 'NO RECORD'}</div>
              <div className="text-[7px] max-md:text-xs text-white italic truncate uppercase">{sub}</div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent className="font-black uppercase">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-4 max-md:space-y-2">
      <RetroWindow title="CLUB PERFORMANCE RECORDS">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-md:gap-2 auto-rows-fr">
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

      <RetroWindow title="MANAGER LEGACY">
        <div className="space-y-2 max-md:space-y-1 py-2 max-md:py-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between items-center text-[10px] max-md:text-sm uppercase border-b border-primary/5 pb-1 cursor-help">
                   <span className="text-white font-bold">Total Games Managed</span>
                   <span className="font-bold text-cyan">{state.manager?.totalGames}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-black">AGGREGATE CAREER MATCH COUNT</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between items-center text-[10px] max-md:text-sm uppercase border-b border-primary/5 pb-1 cursor-help">
                   <span className="text-white font-bold">Career Win Rate</span>
                   <span className="font-bold text-accent">{state.manager?.winPercentage.toFixed(1)}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-black">TOTAL CAREER PERFORMANCE METRIC</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between items-center text-[10px] max-md:text-sm uppercase border-b border-primary/5 pb-1 cursor-help">
                   <span className="text-white font-bold">Seasons Completed</span>
                   <span className="font-bold">{state.manager?.seasonsManaged}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="font-black">TOTAL COMPLETED CAMPAIGNS</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </RetroWindow>
    </div>
  );
}
