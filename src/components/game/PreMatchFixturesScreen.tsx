"use client";

import { Button } from '@/components/ui/button';
import { Fixture, Team } from '@/types/game';
import { PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Pre-match fixtures screen: list of week fixtures with Play button for user's match. */
export interface PreMatchFixturesScreenProps {
  fixtures: Fixture[];
  userTeam: Team;
  getTeamName: (teamId: string) => string;
  isLineupValid: boolean;
  currentWeek: number;
  onBack: () => void;
  onPlayMatch: (fixtureId: string) => void;
}

export function PreMatchFixturesScreen({
  fixtures,
  userTeam,
  getTeamName,
  isLineupValid,
  currentWeek,
  onBack,
  onPlayMatch,
}: PreMatchFixturesScreenProps) {
  return (
    <div className="match-day-overlay fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-stretch justify-stretch p-0 animate-in fade-in duration-200 min-h-[100dvh]">
      <div className="match-day-modal w-full max-w-3xl max-md:max-w-none max-md:w-full max-md:min-h-[100dvh] max-md:h-full max-h-[100vh] flex flex-col bg-black/80 border-2 sm:border-4 border-primary/40 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden mx-auto sm:my-auto max-md:mx-0 max-md:my-0 max-md:flex-1">
        <div className="match-day-back-row bg-primary text-primary-foreground px-2 max-md:px-1.5 sm:px-4 py-1 sm:py-0.5 flex justify-between items-center gap-2 shrink-0 min-h-[2.25rem] sm:min-h-[2.5rem] flex-nowrap">
          <h2 className="match-day-title text-base max-md:text-xs sm:text-xl font-black uppercase tracking-widest truncate min-w-0">
            Match day — Week {currentWeek}
          </h2>
          <Button variant="outline" size="sm" className="match-day-back-btn border-white/50 text-white hover:bg-white/20 h-7 max-md:h-5 sm:h-9 font-black uppercase shrink-0 min-w-[2.5rem] text-[10px] max-md:text-[9px] sm:text-sm px-2 sm:px-3" onClick={onBack}>
            Back
          </Button>
        </div>
        <div className="match-day-list py-0 px-2 max-md:px-1 sm:py-1 sm:px-4 space-y-1 max-md:space-y-0.5 sm:space-y-2 flex-1 min-h-0 overflow-auto">
          {fixtures.length === 0 ? (
            <p className="text-center text-muted-foreground font-black uppercase py-2 sm:py-4 text-sm max-md:text-xs">No fixtures this week</p>
          ) : (
            fixtures.map((f) => {
              const isUserFixture = f.homeTeamId === userTeam.id || f.awayTeamId === userTeam.id;
              const canPlay = isUserFixture && !f.result && isLineupValid;
              return (
                <div
                  key={f.id}
                  className={cn('match-day-fixture-row flex items-center gap-1 max-md:gap-0.5 sm:gap-3 p-1.5 max-md:p-1 sm:p-3 rounded-md sm:rounded-xl border-2', isUserFixture ? 'bg-accent/10 border-accent/50' : 'bg-white/5 border-white/10')}
                >
                  <span className="match-day-wk w-10 max-md:w-7 text-center font-black text-muted-foreground tabular-nums text-sm max-md:text-[10px]">{f.week}</span>
                  <span className={cn('match-day-team flex-1 font-black uppercase text-right truncate text-sm max-md:text-xs sm:text-base', f.homeTeamId === userTeam.id && 'text-accent')}>{getTeamName(f.homeTeamId)}</span>
                  <span className="match-day-score text-center font-black text-base max-md:text-xs sm:text-lg w-10 sm:w-14 shrink-0">{f.result ? `${f.result.homeGoals}-${f.result.awayGoals}` : 'v'}</span>
                  <span className={cn('match-day-team flex-1 font-black uppercase text-left truncate text-sm max-md:text-xs sm:text-base', f.awayTeamId === userTeam.id && 'text-accent')}>{getTeamName(f.awayTeamId)}</span>
                  {isUserFixture && !f.result && (
                    <Button onClick={() => onPlayMatch(f.id)} disabled={!isLineupValid} className="match-day-play-btn h-8 max-md:h-6 sm:h-10 px-2 max-md:px-1.5 sm:px-4 text-xs max-md:text-[10px] sm:text-base bg-accent text-accent-foreground font-black uppercase shrink-0 rounded-md sm:rounded-lg hover:scale-105 transition-transform">
                      <PlayCircle size={14} className="mr-1 max-md:w-2.5 max-md:h-2.5 sm:mr-1.5 sm:w-[18px] sm:h-[18px]" /> Play
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
        {!isLineupValid && fixtures.some((f) => f.homeTeamId === userTeam.id || f.awayTeamId === userTeam.id) && (
          <div className="match-day-pick11 px-2 max-md:px-1 sm:px-4 py-0.5 max-md:py-0 shrink-0 text-center text-amber-400 text-[11px] max-md:text-[9px] sm:text-sm font-black uppercase">Pick at least 11 players in Squad before playing.</div>
        )}
      </div>
    </div>
  );
}
