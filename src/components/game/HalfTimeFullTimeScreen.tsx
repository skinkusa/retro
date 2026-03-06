"use client";

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Player } from '@/types/game';

/** Shared half-time / full-time screen. Fills viewport; score near top, large rating panels, buttons below. */
export interface HalfTimeFullTimeScreenProps {
  isFullTime: boolean;
  currentHomeGoals: number;
  currentAwayGoals: number;
  manOfTheMatch?: { player: Player; rating: number } | null;
  homeLineup: Player[];
  awayLineup: Player[];
  teamRatings: Record<string, number> | undefined;
  onTacticalReview: () => void;
  onPrimary: () => void;
  compact?: boolean;
  zIndex?: string;
  fullViewport?: boolean;
}

export function HalfTimeFullTimeScreen({
  isFullTime,
  currentHomeGoals,
  currentAwayGoals,
  manOfTheMatch,
  homeLineup,
  awayLineup,
  teamRatings,
  onTacticalReview,
  onPrimary,
  compact = false,
  zIndex = 'z-[500]',
  fullViewport = false,
}: HalfTimeFullTimeScreenProps) {
  const title = isFullTime ? 'FULL TIME' : 'HALF TIME';
  const primaryLabel = isFullTime ? 'BACK TO HUB' : 'KICK OFF SECOND HALF';

  return (
    <div
      className={`absolute inset-0 ${zIndex} bg-black/98 backdrop-blur-xl h-screen flex flex-col items-center overflow-hidden animate-in zoom-in duration-300`}
    >
      <div className="w-full max-w-[1200px] px-4 sm:px-6 flex flex-col items-center flex-1 min-h-0 py-4 sm:py-6">
        {/* Score area – near the top */}
        <div className="text-center space-y-1 sm:space-y-2 w-full shrink-0">
          <h2 className="text-primary font-bold uppercase tracking-[0.35em] text-[26px] sm:text-[28px] md:text-[30px] leading-tight">
            {title}
          </h2>
          <div className="text-[48px] sm:text-[56px] md:text-[60px] font-bold text-accent drop-shadow-[0_0_20px_rgba(38,217,117,0.4)] tabular-nums">
            {currentHomeGoals} – {currentAwayGoals}
          </div>
          {isFullTime && manOfTheMatch && (
            <div className="pt-1">
              <div className="bg-primary/20 border-2 border-primary/40 px-3 py-2 rounded-xl inline-flex items-center gap-3">
                <span className="text-[11px] sm:text-[13px] font-semibold text-primary uppercase tracking-widest">
                  Man of the Match
                </span>
                <span className="text-[14px] sm:text-[16px] text-white font-bold uppercase">
                  {manOfTheMatch.player.name}
                </span>
                <span className="text-accent font-mono font-semibold text-[16px] sm:text-[18px]">
                  {manOfTheMatch.rating.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Two rating panels – fill remaining height, scroll inside panel if needed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full flex-1 min-h-0 mt-6 sm:mt-8">
          <div className="w-full min-h-0 min-w-0 border-2 border-white/10 rounded-lg shadow-xl bg-black/70 flex flex-col overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-primary/40 bg-primary/25 hover:bg-primary/25">
                  <TableHead className="text-[14px] font-semibold uppercase tracking-wide py-3 text-white">Player</TableHead>
                  <TableHead className="text-right text-[14px] font-semibold uppercase tracking-wide py-3 text-white">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homeLineup.map((p) => (
                  <TableRow key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <TableCell className="py-3 text-[16px] font-semibold uppercase truncate text-white">{p.name}</TableCell>
                    <TableCell className="py-3 text-right font-mono font-semibold text-accent text-[16px] sm:text-[18px] tabular-nums">{teamRatings?.[p.id]?.toFixed(1) || '6.0'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="w-full min-h-0 min-w-0 border-2 border-white/10 rounded-lg shadow-xl bg-black/70 flex flex-col overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-primary/40 bg-primary/25 hover:bg-primary/25">
                  <TableHead className="text-[14px] font-semibold uppercase tracking-wide py-3 text-white">Player</TableHead>
                  <TableHead className="text-right text-[14px] font-semibold uppercase tracking-wide py-3 text-white">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awayLineup.map((p) => (
                  <TableRow key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <TableCell className="py-3 text-[16px] font-semibold uppercase truncate text-white">{p.name}</TableCell>
                    <TableCell className="py-3 text-right font-mono font-semibold text-accent text-[16px] sm:text-[18px] tabular-nums">{teamRatings?.[p.id]?.toFixed(1) || '6.0'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Buttons – always visible at bottom */}
        <div className="flex flex-row justify-center gap-4 sm:gap-6 w-full mt-6 sm:mt-8 pb-4 sm:pb-6 shrink-0 flex-wrap">
          <Button
            onClick={onTacticalReview}
            variant="outline"
            className="h-12 sm:h-14 px-8 text-[16px] font-semibold uppercase border-2 border-primary/40 hover:bg-primary/10"
          >
            Tactical Review
          </Button>
          <Button
            onClick={onPrimary}
            className="h-12 sm:h-14 px-8 text-[16px] font-semibold uppercase bg-primary text-primary-foreground shadow-[8px_8px_0_0_rgba(64,121,176,0.3)] hover:scale-[1.03] active:scale-[0.98] transition-transform"
          >
            {primaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
