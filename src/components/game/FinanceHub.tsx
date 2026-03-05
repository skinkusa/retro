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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-md:gap-2">
      <RetroWindow title="SEASON ACCOUNTS">
        <Table>
          <TableBody>
            {accounts.map((acc, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <TableRow className="border-b border-primary/5 cursor-help">
                    <TableCell className="text-xs max-md:text-sm uppercase text-white flex items-center gap-1 py-2.5 max-md:py-0.5">
                      {acc.label}
                      <Info size={10} className="text-white opacity-60" />
                    </TableCell>
                    <TableCell className={`text-right font-mono text-xs max-md:text-sm py-2.5 max-md:py-0.5 ${acc.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {acc.type === 'income' ? '+' : '-'} £{formatCurrency(acc.value)}
                    </TableCell>
                  </TableRow>
                </TooltipTrigger>
                <TooltipContent className="text-[11px]">{acc.tooltip}</TooltipContent>
              </Tooltip>
            ))}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell className="text-xs max-md:text-sm uppercase text-primary py-2.5 max-md:py-0.5">NET BALANCE</TableCell>
              <TableCell className={`text-right font-mono text-sm max-md:text-sm py-2.5 max-md:py-0.5 ${(totalIncome - totalExpense) >= 0 ? 'text-cyan' : 'text-red-500'}`}>
                £{formatCurrency(totalIncome - totalExpense)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </RetroWindow>

      <RetroWindow title="FINANCIAL STATUS">
        <div className="space-y-4 max-md:space-y-2">
          <div className="p-4 max-md:p-2 bg-muted border border-primary/20 text-center">
            <div className="text-[10px] max-md:text-sm uppercase text-white mb-1">Total Bank Balance</div>
            <div className="text-2xl max-md:text-2xl font-mono text-cyan">£{formatCurrency(userTeam.budget)}</div>
          </div>
          <div className="text-[10px] max-md:text-sm text-white uppercase space-y-2 max-md:space-y-1">
            <div className="flex justify-between">
              <span>Weekly Wage Bill:</span>
              <span className="text-white">£{formatCurrency(userTeam.weeklyWages)}</span>
            </div>
            <div className="flex justify-between">
              <span>Projected Annual Profit:</span>
              <span className="text-white">£{formatCurrency(totalIncome - totalExpense)}</span>
            </div>
          </div>
          <div className="pt-4 border-t border-primary/10 italic text-[10px] max-md:text-sm text-white text-center">
            &ldquo;THE BOARD IS {(totalIncome - totalExpense) > 0 ? 'SATISFIED' : 'CONCERNED'} WITH CURRENT FINANCIAL PERFORMANCE.&rdquo;
          </div>
        </div>
      </RetroWindow>
    </div>
  );
}
