"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Fixture, Team, Player } from '@/types/game';
import { getNaturalPositionLabel } from '@/lib/utils';

/** Reference size for scale-to-fit; content scales down when viewport is smaller. */
const REFERENCE_WIDTH = 1200;
const REFERENCE_HEIGHT = 880;

/** Pre-match lineup screen: Official Match Lineups with KICK OFF MATCH. Scales to fit viewport, responsive layout. */
export interface PreMatchLineupScreenProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  homeLineup: Player[];
  awayLineup: Player[];
  awayKitColor: string;
  awayKitText: string;
  onKickOff: () => void;
  fullViewport?: boolean;
}

export function PreMatchLineupScreen({
  fixture,
  homeTeam,
  awayTeam,
  homeLineup,
  awayLineup,
  awayKitColor,
  awayKitText,
  onKickOff,
  fullViewport = false,
}: PreMatchLineupScreenProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      if (typeof window === 'undefined') return;
      const s = Math.min(
        window.innerWidth / REFERENCE_WIDTH,
        window.innerHeight / REFERENCE_HEIGHT,
        1
      );
      setScale(s);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="absolute inset-0 z-[600] bg-background/95 backdrop-blur-2xl flex items-center justify-center overflow-hidden animate-in fade-in duration-500">
      <div
        className="flex flex-col items-center justify-center origin-center"
        style={{
          width: REFERENCE_WIDTH,
          minHeight: REFERENCE_HEIGHT,
          transform: `scale(${scale})`,
        }}
      >
      <div className="w-full max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] xl:max-w-[min(1200px,78%)] flex flex-col items-center justify-center gap-8 md:gap-10 lg:gap-12 py-6 md:py-10 flex-1">
        {/* Header block */}
        <div className="text-center space-y-2 w-full">
          <h2 className="text-primary font-black uppercase tracking-[0.35em] text-[28px] sm:text-[30px] md:text-[32px] lg:text-[34px] leading-tight">
            Official Match Lineups
          </h2>
          <p className="text-white/70 uppercase font-semibold text-[12px] sm:text-[13px] md:text-[14px] tracking-widest">
            {fixture.competition} • {homeTeam.stadium}
          </p>
        </div>

        {/* Two lineup panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:gap-10 w-full max-w-5xl">
          <div className="flex flex-col min-w-0 rounded-lg overflow-hidden border-2 border-white/10 shadow-xl">
            <div
              className="h-14 sm:h-16 md:h-[4.5rem] flex items-center justify-center font-black uppercase border-b-4 border-white/30 text-[22px] sm:text-[24px] md:text-[26px] lg:text-[28px] px-4"
              style={{ backgroundColor: homeTeam.color, color: homeTeam.homeTextColor ?? '#ffffff' }}
            >
              {homeTeam.name}
            </div>
            <div className="bg-black/40 p-4 sm:p-5 space-y-2 sm:space-y-2.5">
              {homeLineup.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 text-white border-b border-white/10 pb-2.5 sm:pb-3 last:border-0"
                >
                  <span className="text-cyan font-bold text-[16px] sm:text-[17px] md:text-[18px] w-12 shrink-0 tabular-nums">
                    {getNaturalPositionLabel(p.position)}
                  </span>
                  <span className="flex-1 uppercase truncate font-semibold text-[18px] sm:text-[19px] md:text-[20px]">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col min-w-0 rounded-lg overflow-hidden border-2 border-white/10 shadow-xl">
            <div
              className="h-14 sm:h-16 md:h-[4.5rem] flex items-center justify-center font-black uppercase border-b-4 border-white/30 text-[22px] sm:text-[24px] md:text-[26px] lg:text-[28px] px-4"
              style={{ backgroundColor: awayKitColor, color: awayKitText }}
            >
              {awayTeam.name}
            </div>
            <div className="bg-black/40 p-4 sm:p-5 space-y-2 sm:space-y-2.5">
              {awayLineup.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 text-white border-b border-white/10 pb-2.5 sm:pb-3 last:border-0"
                >
                  <span className="text-cyan font-bold text-[16px] sm:text-[17px] md:text-[18px] w-12 shrink-0 tabular-nums">
                    {getNaturalPositionLabel(p.position)}
                  </span>
                  <span className="flex-1 uppercase truncate font-semibold text-[18px] sm:text-[19px] md:text-[20px]">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kick Off button */}
        <div className="flex justify-center pt-2 sm:pt-4 w-full">
          <Button
            onClick={onKickOff}
            className="h-14 sm:h-16 md:h-[4.5rem] px-10 sm:px-16 md:px-24 text-[22px] sm:text-[24px] md:text-[26px] lg:text-[28px] font-black uppercase bg-accent text-accent-foreground shadow-[8px_8px_0_0_rgba(38,217,117,0.3)] hover:scale-[1.03] active:scale-[0.98] transition-transform"
          >
            KICK OFF MATCH
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
}
