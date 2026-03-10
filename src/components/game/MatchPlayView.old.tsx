"use client";

import { Fixture, Team } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MatchPlayViewProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  awayKitColor: string;
  awayKitText: string;
  currentMinute: number;
  currentHomeGoals: number;
  currentAwayGoals: number;
  homeShots: number;
  awayShots: number;
  possession: number;
  zones: { home: { DEF: number; MID: number; ATT: number }; away: { DEF: number; MID: number; ATT: number } };
  commentaryColor: string;
  activeEventText: string;
  playbackSpeed: 1 | 2;
  onSpeedToggle: () => void;
  onPause: () => void;
  getPlayerName: (id: string) => string;
  homeScorers: Array<{ playerId: string; minute: number }>;
  awayScorers: Array<{ playerId: string; minute: number }>;
  homeCards: Array<{ playerId: string; minute: number; type: string }>;
  awayCards: Array<{ playerId: string; minute: number; type: string }>;
}

export function MatchPlayView({
  fixture,
  homeTeam,
  awayTeam,
  awayKitColor,
  awayKitText,
  currentMinute,
  currentHomeGoals,
  currentAwayGoals,
  homeShots,
  awayShots,
  possession,
  zones,
  commentaryColor,
  activeEventText,
  playbackSpeed,
  onSpeedToggle,
  onPause,
  getPlayerName,
  homeScorers,
  awayScorers,
  homeCards,
  awayCards,
}: MatchPlayViewProps) {
  const StrengthBar = ({ value, label, color }: { value: number; label: string; color?: string }) => (
    <div className="flex flex-col items-center gap-0.5 w-full max-w-[56px] md:max-w-[72px] max-[1300px]:max-w-[80px]">
      <span className="text-[12px] md:text-base max-[1300px]:text-[18px] font-black text-white uppercase">{label}</span>
      <div className="w-full h-20 md:h-24 max-[1300px]:h-32 bg-black/80 border border-white/10 relative overflow-hidden flex flex-col justify-end rounded-md shadow-inner">
        <div
          className="w-full transition-all duration-700"
          style={{ height: `${Math.min(100, (value / 50) * 100)}%`, backgroundColor: color || '#26D975' }}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Match header: league + stadium (left/center); controls (right). On mobile, commentary in same row. */}
      <div className="relative z-10 p-2.5 md:p-3 max-[1300px]:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-2 bg-black/85 border-b border-white/5 shrink-0">
        <div className="bg-primary text-primary-foreground px-4 py-0.5 text-[10px] md:text-lg max-[1300px]:text-[20px] font-black shadow-lg border border-white/20 uppercase tracking-[0.2em] rounded-md opacity-90 md:opacity-90 w-fit">
          {fixture.competition} – {homeTeam.stadium.toUpperCase()}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto md:flex-initial">
          <div
            className={cn(
              'bg-black/90 backdrop-blur-md px-4 py-2.5 font-black flex-1 text-center uppercase tracking-tight shadow-2xl flex items-center justify-center min-h-[48px] max-[1300px]:min-h-[70px] rounded-lg border border-white/10',
              'text-[17px] sm:text-[18px] max-[1300px]:text-[24px] md:hidden'
            )}
            style={{ color: commentaryColor }}
          >
            {activeEventText}
          </div>
          <Button
            onClick={onSpeedToggle}
            className={cn(
              'h-9 md:h-10 max-[1300px]:h-14 px-3 md:px-4 max-[1300px]:px-6 text-sm md:text-base max-[1300px]:text-[20px] font-black retro-button shrink-0 transition-all',
              playbackSpeed === 2 ? 'bg-accent text-accent-foreground border-accent' : 'bg-black/70 text-white border-white/30 hover:bg-white/10'
            )}
            title={playbackSpeed === 2 ? 'Switch to 1x speed' : 'Play at 2x speed'}
          >
            ×{playbackSpeed}
          </Button>
          <Button
            onClick={onPause}
            className="h-9 md:h-10 max-[1300px]:h-14 px-5 max-[1300px]:px-8 text-sm md:text-base max-[1300px]:text-[20px] bg-red-600 hover:bg-red-700 text-white font-black retro-button shadow-lg transition-all active:scale-95 shrink-0"
          >
            <Pause size={18} className="mr-1 max-[1300px]:w-6 max-[1300px]:h-6" /> PAUSE
          </Button>
        </div>
      </div>

      {/* 2. Scoreboard – visual center; on md: score 56–64px, time under score, team names 22–26px */}
      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 md:px-8 mt-3 md:mt-3 gap-3 md:gap-2 flex-1 min-h-0">
        <div className="match-teams-row w-full flex items-center justify-between gap-4 sm:gap-6 md:gap-8">
          <div className="flex-1 flex flex-col items-end min-w-0">
            <div
              className="match-team-name w-full min-h-[2.75rem] sm:min-h-[3rem] max-[1300px]:min-h-[5rem] border-4 border-white/30 flex items-center justify-center font-black shadow-2xl rounded-lg uppercase leading-tight text-center px-1 overflow-hidden md:text-2xl max-[1300px]:text-3xl md:min-h-[2.5rem]"
              style={{ backgroundColor: homeTeam.color, color: homeTeam.homeTextColor ?? '#ffffff' }}
            >
              <span className="truncate block w-full">{homeTeam.name}</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 mt-2 gap-2 md:gap-3 max-[1300px]:gap-5">
              <div className="flex flex-col items-end w-[200px] sm:w-[220px] max-[1300px]:w-[320px] shrink-0">
                <span className="text-[13px] md:text-base max-[1300px]:text-[20px] font-black text-white/90 uppercase">Shots: {homeShots}</span>
                <div className="text-[10px] md:text-xs max-[1300px]:text-[16px] font-black text-accent uppercase text-right leading-tight w-full mt-1 min-h-[3.5rem] max-h-[5rem] max-[1300px]:max-h-[8rem] md:max-h-[6rem] overflow-y-auto overflow-x-hidden grid grid-cols-2 gap-x-2 gap-y-0.5 pr-0.5">
                  {homeScorers.map((s) => (
                    <div key={`${s.playerId}-${s.minute}`}>
                      {getPlayerName(s.playerId)} {s.minute}&apos;
                    </div>
                  ))}
                </div>
                <div className="text-[10px] md:text-xs max-[1300px]:text-[16px] font-black uppercase text-right leading-tight w-full mt-0.5 min-h-[2rem] max-h-[3rem] max-[1300px]:max-h-[5rem] md:max-h-[4rem] overflow-y-auto overflow-x-hidden grid grid-cols-2 gap-x-2 gap-y-0.5 pr-0.5">
                  {homeCards.map((c) => (
                    <div
                      key={`card-${c.playerId}-${c.minute}-${c.type}`}
                      className={c.type === 'RED' ? 'text-red-400' : 'text-yellow-400'}
                    >
                      {c.type} {c.minute}&apos; {getPlayerName(c.playerId)}
                    </div>
                  ))}
                </div>
              </div>
              <span className="text-6xl sm:text-7xl max-md:text-sm max-[1300px]:text-5xl md:hidden font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] shrink-0">
                {currentHomeGoals}
              </span>
            </div>
          </div>

          {/* Center: on mobile = minute only; on desktop = score + minute */}
          <div className="flex flex-col items-center shrink-0 gap-0.5">
            <div className="hidden md:block bg-black border-4 border-accent p-3 rounded-xl shadow-[0_0_30px_rgba(38,217,117,0.2)]">
              <div className="text-[56px] md:text-[60px] font-black text-white tabular-nums leading-none tracking-tighter text-center">
                {currentHomeGoals} – {currentAwayGoals}
              </div>
            </div>
            <div className="bg-black border-4 border-accent p-3 max-md:p-1 max-md:rounded-md max-md:border-2 rounded-xl shadow-[0_0_30px_rgba(38,217,117,0.2)] md:border-0 md:bg-transparent md:shadow-none md:p-0">
              <div className="text-4xl sm:text-5xl max-md:text-base max-md:w-8 font-black text-red-600 md:text-[22px] md:text-white tabular-nums leading-none tracking-tighter w-[72px] sm:w-[85px] md:w-auto text-center">
                {currentMinute.toString().padStart(3, '0')}&apos;
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-start min-w-0">
            <div
              className="match-team-name w-full min-h-[2.75rem] sm:min-h-[3rem] max-[1300px]:min-h-[5rem] border-4 border-white/30 flex items-center justify-center font-black shadow-2xl rounded-lg uppercase leading-tight text-center px-1 overflow-hidden md:text-2xl max-[1300px]:text-3xl md:min-h-[2.5rem]"
              style={{ backgroundColor: awayKitColor, color: awayKitText }}
            >
              <span className="truncate block w-full">{awayTeam.name}</span>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 mt-2 gap-2 md:gap-3 max-[1300px]:gap-5">
              <span className="text-6xl sm:text-7xl max-md:text-sm max-[1300px]:text-5xl md:hidden font-black text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] shrink-0">
                {currentAwayGoals}
              </span>
              <div className="flex flex-col items-start w-[200px] sm:w-[220px] max-[1300px]:w-[320px] shrink-0">
                <span className="text-[13px] md:text-base max-[1300px]:text-[20px] font-black text-white/90 uppercase">Shots: {awayShots}</span>
                <div className="text-[10px] md:text-xs max-[1300px]:text-[16px] font-black text-accent uppercase text-left leading-tight w-full mt-1 min-h-[3.5rem] max-h-[5rem] max-[1300px]:max-h-[8rem] md:max-h-[6rem] overflow-y-auto overflow-x-hidden grid grid-cols-2 gap-x-2 gap-y-0.5 pl-0.5">
                  {awayScorers.map((s) => (
                    <div key={`${s.playerId}-${s.minute}`}>
                      {getPlayerName(s.playerId)} {s.minute}&apos;
                    </div>
                  ))}
                </div>
                <div className="text-[10px] md:text-xs max-[1300px]:text-[16px] font-black uppercase text-left leading-tight w-full mt-0.5 min-h-[2rem] max-h-[3rem] max-[1300px]:max-h-[5rem] md:max-h-[4rem] overflow-y-auto overflow-x-hidden grid grid-cols-2 gap-x-2 gap-y-0.5 pl-0.5">
                  {awayCards.map((c) => (
                    <div
                      key={`card-${c.playerId}-${c.minute}-${c.type}`}
                      className={c.type === 'RED' ? 'text-red-400' : 'text-yellow-400'}
                    >
                      {c.type} {c.minute}&apos; {getPlayerName(c.playerId)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Commentary panel – desktop only, below scoreboard; pushed down to give more room for scorers */}
        <div
          className="hidden md:block w-full max-w-4xl mt-6 md:mt-8 py-3 px-4 bg-black/90 border border-primary/20 rounded-lg ring-1 ring-white/10 min-h-0 max-h-[4rem] flex items-center justify-center"
          style={{ color: commentaryColor }}
        >
          <span className="text-xl font-black uppercase tracking-tight text-center truncate w-full">
            {activeEventText}
          </span>
        </div>

        {/* 4. Possession bar – pushed down to give more room for scorers */}
        <div className="w-full max-w-4xl mt-4 md:mt-6">
          <div className="h-4 md:h-5 w-full bg-black/80 border-2 border-white/20 rounded-full overflow-hidden flex shadow-2xl">
            <div
              className="h-full transition-all duration-1000 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.2)]"
              style={{ width: `${possession}%`, backgroundColor: homeTeam.color }}
            />
            <div
              className="h-full transition-all duration-1000"
              style={{ width: `${100 - possession}%`, backgroundColor: awayKitColor }}
            />
          </div>
          <div className="flex justify-between px-3 mt-1 text-[12px] md:text-base max-[1300px]:text-[20px] font-black text-white/80 uppercase tracking-widest items-baseline">
            <span>POSSESSION: <span className="md:text-lg max-[1300px]:text-2xl">{possession.toFixed(0)}%</span></span>
            <span className="md:text-lg max-[1300px]:text-2xl">{(100 - possession).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* 5. Team strength bars – grouped under HOME / AWAY on desktop */}
      <div className="relative z-10 p-4 sm:p-6 md:p-3 grid grid-cols-2 gap-6 sm:gap-10 md:gap-8 shrink-0 bg-black/70">
        <div className="flex flex-col items-center gap-2">
          <span className="hidden md:block text-base font-black text-white/90 uppercase tracking-wider">HOME</span>
          <div className="flex justify-center w-full gap-4 md:gap-6">
            <StrengthBar value={zones.home.DEF} label="DEF" color={homeTeam.color} />
            <StrengthBar value={zones.home.MID} label="MID" color={homeTeam.color} />
            <StrengthBar value={zones.home.ATT} label="ATT" color={homeTeam.color} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="hidden md:block text-base font-black text-white/90 uppercase tracking-wider">AWAY</span>
          <div className="flex justify-center w-full gap-4 md:gap-6">
            <StrengthBar value={zones.away.DEF} label="DEF" color={awayKitColor} />
            <StrengthBar value={zones.away.MID} label="MID" color={awayKitColor} />
            <StrengthBar value={zones.away.ATT} label="ATT" color={awayKitColor} />
          </div>
        </div>
      </div>
    </>
  );
}
