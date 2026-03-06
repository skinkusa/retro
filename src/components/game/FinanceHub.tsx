"use client"

import { useGame } from '@/lib/store';
import { RetroWindow } from './RetroWindow';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export function FinanceHub() {
  const { state } = useGame();
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
      <RetroWindow title="SEASON ACCOUNTS" titleClassName="text-[14px] md:text-[15px]" contentClassName="p-5 md:p-6">
        <Table>
          <TableBody>
            {accounts.map((acc, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <TableRow className="border-b border-primary/5 cursor-help">
                    <TableCell className="text-[13px] md:text-[14px] uppercase text-white/90 font-semibold flex items-center gap-1 py-3">
                      {acc.label}
                      <Info size={14} className="text-white opacity-60" />
                    </TableCell>
                    <TableCell className={`text-right font-mono text-[15px] md:text-[16px] font-semibold py-3 ${acc.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {acc.type === 'income' ? '+' : '-'} £{formatCurrency(acc.value)}
                    </TableCell>
                  </TableRow>
                </TooltipTrigger>
                <TooltipContent className="text-[13px] max-w-[220px]">{acc.tooltip}</TooltipContent>
              </Tooltip>
            ))}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell className="text-[14px] uppercase font-bold text-primary py-3">NET BALANCE</TableCell>
              <TableCell className={`text-right font-mono text-[15px] md:text-[16px] font-bold py-3 ${(totalIncome - totalExpense) >= 0 ? 'text-cyan' : 'text-red-500'}`}>
                £{formatCurrency(totalIncome - totalExpense)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </RetroWindow>

      <RetroWindow title="FINANCIAL STATUS" titleClassName="text-[14px] md:text-[15px]" contentClassName="p-5 md:p-6">
        <div className="space-y-5 md:space-y-6">
          <div className="p-4 md:p-5 bg-muted border border-primary/20 text-center rounded-lg">
            <div className="text-[12px] md:text-[13px] text-white/80 uppercase font-semibold mb-1">Total Bank Balance</div>
            <div className="text-[28px] md:text-[34px] font-black font-mono text-cyan tabular-nums">£{formatCurrency(userTeam.budget)}</div>
          </div>
          <div className="text-[13px] md:text-[14px] text-white/90 uppercase font-semibold space-y-2">
            <div className="flex justify-between items-center">
              <span>Weekly Wage Bill:</span>
              <span className="text-white font-bold">£{formatCurrency(userTeam.weeklyWages)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Projected Annual Profit:</span>
              <span className="text-white font-bold">£{formatCurrency(totalIncome - totalExpense)}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-primary/10 italic text-[14px] md:text-[15px] text-white/95 text-center">
            &ldquo;THE BOARD IS {(totalIncome - totalExpense) > 0 ? 'SATISFIED' : 'CONCERNED'} WITH CURRENT FINANCIAL PERFORMANCE.&rdquo;
          </div>
        </div>
      </RetroWindow>
    </div>
  );
}
