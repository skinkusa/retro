"use client"

import { useGame } from '@/lib/store';
import { RetroWindow } from './RetroWindow';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Truck, Building2, Landmark } from 'lucide-react';
import { formatMoney } from '@/lib/utils';

export function FinanceHub() {
  const { state, expandStadium } = useGame();
  const userTeam = state.teams.find(t => t.id === state.userTeamId);

  if (!userTeam) return null;

  const accounts = [
    { label: 'Gate Receipts', value: userTeam.finances.gateReceipts, type: 'income', tooltip: 'Revenue from match-day ticket sales.' },
    { label: 'Merchandise', value: userTeam.finances.merchandise, type: 'income', tooltip: 'Revenue from shirt sales and commercial deals.' },
    { label: 'Transfer Sales', value: userTeam.finances.transfersOut, type: 'income', tooltip: 'Total income from selling players this season.' },
    { label: 'Player Wages', value: userTeam.finances.wagesPaid, type: 'expense', tooltip: 'Total salaries paid out to players and staff.' },
    { label: 'Transfer Spending', value: userTeam.finances.transfersIn, type: 'expense', tooltip: 'Total capital spent on player acquisitions.' },
    { label: 'Tax Paid', value: userTeam.finances.taxPaid, type: 'expense', tooltip: 'Mandatory fiscal contributions (20% of profits).' },
  ];

  const totalIncome = accounts.filter(a => a.type === 'income').reduce((acc, a) => acc + a.value, 0);
  const totalExpense = accounts.filter(a => a.type === 'expense').reduce((acc, a) => acc + a.value, 0);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-GB', { maximumFractionDigits: 0 });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <RetroWindow title="SEASON ACCOUNTS">
        <Table>
          <TableBody>
            {accounts.map((acc, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <TableRow className="border-b border-primary/5 cursor-help">
                    <TableCell className="text-xs max-[1300px]:text-[18px] uppercase text-muted-foreground flex items-center gap-1 max-[1300px]:py-4">
                      {acc.label}
                      <Info size={10} className="opacity-30 max-[1300px]:w-4 max-[1300px]:h-4" />
                    </TableCell>
                    <TableCell className={`text-right font-mono text-xs max-[1300px]:text-[18px] ${acc.type === 'income' ? 'text-green-500' : 'text-red-500'} max-[1300px]:py-4`}>
                      {acc.type === 'income' ? '+' : '-'} £{formatCurrency(acc.value)}
                    </TableCell>
                  </TableRow>
                </TooltipTrigger>
                <TooltipContent className="text-[11px]">{acc.tooltip}</TooltipContent>
              </Tooltip>
            ))}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell className="text-xs max-[1300px]:text-[18px] uppercase text-primary max-[1300px]:py-5">NET BALANCE</TableCell>
              <TableCell className={`text-right font-mono text-sm max-[1300px]:text-[20px] ${(totalIncome - totalExpense) >= 0 ? 'text-cyan' : 'text-red-500'} max-[1300px]:py-5`}>
                £{formatCurrency(totalIncome - totalExpense)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </RetroWindow>

      <RetroWindow title="STADIUM & INFRASTRUCTURE">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-primary/10 pb-2">
            <div>
              <div className="flex items-center gap-1.5">
                <div className="text-[10px] max-[1300px]:text-[16px] uppercase text-muted-foreground font-black">Current Capacity</div>
                <Tooltip>
                  <TooltipTrigger><Info size={10} className="text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-[10px]">Total seating available at your home ground. Affects the ceiling of your match-day income.</TooltipContent>
                </Tooltip>
              </div>
              <div className="text-xl max-[1300px]:text-3xl font-black text-white">{userTeam.stadiumCapacity.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <Tooltip>
                  <TooltipTrigger><Info size={10} className="text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-[10px]">Income from your last home match. Revenue is driven by attendance, stadium size, and division level.</TooltipContent>
                </Tooltip>
                <div className="text-[10px] max-[1300px]:text-[16px] uppercase text-muted-foreground font-black">Match Revenue</div>
              </div>
              <div className="text-xl max-[1300px]:text-3xl font-black text-accent">{formatMoney(userTeam.finances.gateReceipts)}</div>
            </div>
          </div>

          {userTeam.stadiumExpansion ? (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <Truck className="text-primary" size={20} />
                </div>
                <div>
                  <div className="text-[11px] font-black text-primary uppercase tracking-widest">Expansion in Progress</div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Target: {userTeam.stadiumExpansion.targetCapacity.toLocaleString()} seats</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black uppercase text-white/60">
                  <span>Progress</span>
                  <span>{userTeam.stadiumExpansion.weeksRemaining} Weeks Left</span>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-primary transition-all" style={{ width: `${100 - (userTeam.stadiumExpansion.weeksRemaining / 10) * 100}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={() => expandStadium('small')}
                disabled={userTeam.budget < 2500000}
                className="flex flex-col h-auto py-3 bg-black/40 border border-primary/20 hover:bg-primary/10 group"
              >
                <Building2 size={16} className="mb-1 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase">Small</span>
                <span className="text-[8px] opacity-40">£2.5M / 4W</span>
              </Button>
              <Button 
                onClick={() => expandStadium('medium')}
                disabled={userTeam.budget < 7500000}
                className="flex flex-col h-auto py-3 bg-black/40 border border-primary/20 hover:bg-primary/10 group"
              >
                <Landmark size={16} className="mb-1 text-accent group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase">Medium</span>
                <span className="text-[8px] opacity-40">£7.5M / 8W</span>
              </Button>
              <Button 
                onClick={() => expandStadium('large')}
                disabled={userTeam.budget < 20000000}
                className="flex flex-col h-auto py-3 bg-black/40 border border-primary/20 hover:bg-primary/10 group"
              >
                <div className="relative mb-1">
                   <Landmark size={16} className="text-cyan group-hover:scale-110 transition-transform" />
                   <Building2 size={10} className="absolute -bottom-1 -right-1 text-cyan opacity-60" />
                </div>
                <span className="text-[10px] font-black uppercase">Large</span>
                <span className="text-[8px] opacity-40">£20M / 14W</span>
              </Button>
            </div>
          )}
          
          <p className="text-[9px] text-muted-foreground uppercase font-bold text-center italic leading-tight">
            &ldquo;EXPANDING YOUR STADIUM INCREASES LONG-TERM GATE RECEIPTS BUT REQUIRES SIGNIFICANT UPFRONT CAPITAL.&rdquo;
          </p>
        </div>
      </RetroWindow>

      <RetroWindow title="FINANCIAL STATUS">
        <div className="space-y-4">
          <div className="p-4 max-[1300px]:p-8 bg-muted border border-primary/20 text-center">
            <div className="text-[10px] max-[1300px]:text-[16px] uppercase text-muted-foreground mb-1">Total Bank Balance</div>
            <div className="text-2xl max-[1300px]:text-4xl font-mono text-cyan">£{formatCurrency(userTeam.budget)}</div>
          </div>
          <div className="text-[10px] max-[1300px]:text-[18px] text-muted-foreground uppercase space-y-2 max-[1300px]:space-y-4">
            <div className="flex justify-between">
              <span>Weekly Wage Bill:</span>
              <span className="text-foreground">£{formatCurrency(userTeam.weeklyWages)}</span>
            </div>
            <div className="flex justify-between">
              <span>Projected Annual Profit:</span>
              <span className="text-foreground">£{formatCurrency(totalIncome - totalExpense)}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-primary/10 italic text-[10px] max-[1300px]:text-[16px] text-muted-foreground text-center">
            &ldquo;THE BOARD IS {(totalIncome - totalExpense) > 0 ? 'SATISFIED' : 'CONCERNED'} WITH CURRENT FINANCIAL PERFORMANCE.&rdquo;
          </div>
        </div>
      </RetroWindow>
    </div>
  );
}
