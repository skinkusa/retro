"use client";

import { Fixture, Team, MatchEvent } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Pause, TrendingUp, Zap, Shield, Target, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

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
  onFlashResult: () => void;
  getPlayerName: (id: string) => string;
  allEvents: MatchEvent[];
  isHalfTime: boolean;
  onTeamTalk: (talk: 'ENCOURAGE' | 'CALM' | 'AGGRESSIVE') => void;
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
  onFlashResult,
  getPlayerName,
  allEvents,
  isHalfTime,
  onTeamTalk,
}: MatchPlayViewProps) {

  const filteredFeed = useMemo(() => {
    return allEvents
      .filter(e => e.type !== 'COMMENTARY')
      .sort((a, b) => b.minute - a.minute);
  }, [allEvents]);

  const StrengthBar = ({ value, label, icon: Icon, color, teamSide }: { value: number; label: string; icon: any; color: string; teamSide: 'home' | 'away' }) => (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-1.5 opacity-80">
          <Icon size={12} className="text-white/60" />
          <span className="text-[10px] sm:text-[12px] font-black text-white/70 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[10px] sm:text-[12px] font-mono font-black text-white/90">{value}</span>
      </div>
      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/10 p-[1px]">
        <div
          className="h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
          style={{ 
            width: `${Math.min(100, value)}%`, 
            backgroundColor: color,
            boxShadow: `0 0 12px ${color}44`
          }}
        />
      </div>
    </div>
  );

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'GOAL': return '⚽';
      case 'YELLOW': return '🟨';
      case 'RED': return '🟥';
      case 'SUB': return '🔁';
      case 'INJURY': return '✚';
      default: return '•';
    }
  };

  const homeName = homeTeam?.name || homeTeam?.id || 'Home';
  const awayName = awayTeam?.name || awayTeam?.id || 'Away';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#080a0c] text-white overflow-hidden relative">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(38,217,117,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* 1. TOP HEADER */}
      <div className="relative z-10 px-4 py-3 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-primary/80 tracking-[0.2em] uppercase leading-none">{fixture.competition}</span>
          <span className="text-[14px] sm:text-[16px] font-black text-white/90 uppercase mt-0.5 tracking-tight">{homeTeam.stadium}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onSpeedToggle}
            className={cn(
              'h-11 px-5 rounded-xl font-black transition-all border-2 text-[16px]',
              playbackSpeed === 2 
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(38,217,117,0.2)]' 
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            )}
          >
            ×{playbackSpeed}
          </Button>
          <Button
            onClick={onFlashResult}
            className="h-11 px-5 rounded-xl bg-accent/10 border-2 border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground font-black transition-all shadow-[0_4px_15px_rgba(38,217,117,0.2)] flex items-center gap-2"
          >
            <Zap size={18} fill="currentColor" />
            <span className="hidden sm:inline uppercase tracking-widest text-[14px]">Flash</span>
          </Button>
          <Button
            onClick={onPause}
            className="h-11 px-5 rounded-xl bg-red-500/10 border-2 border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white font-black transition-all shadow-[0_4px_15px_rgba(239,68,68,0.2)] flex items-center gap-2"
          >
            <Pause size={18} fill="currentColor" />
            <span className="hidden sm:inline uppercase tracking-widest text-[14px]">Pause</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-4 sm:space-y-6">
        
        {/* 2. SCOREBOARD BLOCK */}
        <div className="relative z-10 w-full max-w-3xl mx-auto bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-[28px] p-4 sm:p-5 shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
          
          <div className="relative flex items-center justify-between gap-2 sm:gap-4">
            {/* Home Side */}
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 min-w-0">
              <span className="text-[14px] sm:text-[18px] font-black uppercase text-right tracking-tight leading-tight truncate text-white lg:whitespace-normal lg:overflow-visible l-team">{homeName}</span>
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/10 flex items-center justify-center shadow-inner shrink-0"
                style={{ backgroundColor: homeTeam.color }}
              >
                <span className="text-lg sm:text-xl font-black text-white/20 select-none">{homeName[0]}</span>
              </div>
            </div>

            {/* Score Center */}
            <div className="flex flex-col items-center gap-1 shrink-0 px-2 sm:px-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-3xl sm:text-5xl font-black tabular-nums tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{currentHomeGoals}</span>
                <span className="text-lg sm:text-xl font-black text-white/20">-</span>
                <span className="text-3xl sm:text-5xl font-black tabular-nums tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{currentAwayGoals}</span>
              </div>
              {/* Clock Pill Integrated */}
              <div className="bg-primary/20 border border-primary/40 px-3 py-0.5 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(38,217,117,0.15)] flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[13px] sm:text-[15px] font-black text-primary tabular-nums tracking-widest">{currentMinute}&apos;</span>
              </div>
            </div>

            {/* Away Side */}
            <div className="flex-1 flex items-center justify-start gap-2 sm:gap-3 min-w-0">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/10 flex items-center justify-center shadow-inner shrink-0"
                style={{ backgroundColor: awayKitColor }}
              >
                <span className="text-lg sm:text-xl font-black text-white/20 select-none">{awayName[0]}</span>
              </div>
              <span className="text-[14px] sm:text-[18px] font-black uppercase text-left tracking-tight leading-tight truncate text-white lg:whitespace-normal lg:overflow-visible l-team">{awayName}</span>
            </div>
          </div>
        </div>

        {/* 3. EVENT FEED (Horizontal scrolling compact mode or vertical list) */}
        {filteredFeed.length > 0 && (
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 max-h-[140px] overflow-auto custom-scrollbar shadow-inner">
              <div className="space-y-2">
                {filteredFeed.map((e, idx) => (
                  <div key={`${e.minute}-${e.type}-${idx}`} className="flex items-center justify-between py-1.5 px-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors rounded-lg group/event">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-black text-white/40 tabular-nums w-8">{e.minute}&apos;</span>
                      <span className="text-[16px] sm:text-[17px] leading-none">{getEventIcon(e.type)}</span>
                      <span className="text-[14px] sm:text-[16px] font-black uppercase text-white/90 group-data-[team=away]:text-right">
                        {e.type === 'SUB' ? `${getPlayerName(e.playerId!)} → ${getPlayerName(e.subPlayerId!)}` : getPlayerName(e.playerId!)}
                      </span>
                    </div>
                    {e.teamId && (
                      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: e.teamId === homeTeam.id ? homeTeam.color : awayKitColor }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. COMMENTARY PANEL */}
        <div className="w-full max-w-3xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
          <div 
            className="relative bg-black/80 backdrop-blur-2xl border-2 border-white/10 rounded-2xl p-6 sm:p-8 flex items-center justify-center min-h-[100px] shadow-2xl"
            style={{ borderColor: `${commentaryColor}44` }}
          >
            <p 
              className="text-[18px] sm:text-[22px] font-black uppercase italic text-center tracking-tight leading-snug drop-shadow-lg transition-all"
              style={{ color: commentaryColor }}
            >
              &ldquo;{activeEventText}&rdquo;
            </p>
          </div>
        </div>

        {/* 5. POSSESSION */}
        <div className="w-full max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-black text-white">{possession.toFixed(0)}%</span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Home</span>
              </div>
              <span className="text-[12px] font-black text-white/20 uppercase tracking-[0.3em]">Possession</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Away</span>
                <span className="text-[14px] font-black text-white">{(100 - possession).toFixed(0)}%</span>
              </div>
          </div>
          <div className="h-2.5 w-full bg-white/5 border border-white/10 rounded-full overflow-hidden flex p-[1px] shadow-inner">
            <div
              className="h-full rounded-l-full transition-all duration-1000 shadow-[inset_-4px_0_8px_rgba(0,0,0,0.2)]"
              style={{ width: `${possession}%`, backgroundColor: homeTeam.color }}
            />
            <div
              className="h-full rounded-r-full transition-all duration-1000 shadow-[inset_4px_0_8px_rgba(0,0,0,0.2)]"
              style={{ width: `${100 - possession}%`, backgroundColor: awayKitColor }}
            />
          </div>
        </div>

        {/* 6. TEAM STRENGTH BARS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 max-w-4xl mx-auto pt-4 pb-8">
          {/* Home Strength */}
          <div className="space-y-4">
            <h4 className="px-1 text-[12px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
              <TrendingUp size={14} className="text-white/20" /> {homeName} Authority
            </h4>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
              <StrengthBar value={zones.home.DEF} label="Defense" icon={Shield} color={homeTeam.color} teamSide="home" />
              <StrengthBar value={zones.home.MID} label="Midfield" icon={Activity} color={homeTeam.color} teamSide="home" />
              <StrengthBar value={zones.home.ATT} label="Attack" icon={Zap} color={homeTeam.color} teamSide="home" />
            </div>
            <div className="flex justify-between px-2 pt-1 opacity-60">
                <span className="text-[10px] font-bold uppercase tracking-wider">Shots: <span className="text-white font-black">{homeShots}</span></span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Goals: <span className="text-white font-black">{currentHomeGoals}</span></span>
            </div>
          </div>

          {/* Away Strength */}
          <div className="space-y-4">
            <h4 className="px-1 text-[12px] font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2 md:justify-end">
              {awayName} Authority <TrendingUp size={14} className="text-white/20 scale-x-[-1]" />
            </h4>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl backdrop-blur-sm">
              <StrengthBar value={zones.away.DEF} label="Defense" icon={Shield} color={awayKitColor} teamSide="away" />
              <StrengthBar value={zones.away.MID} label="Midfield" icon={Activity} color={awayKitColor} teamSide="away" />
              <StrengthBar value={zones.away.ATT} label="Attack" icon={Zap} color={awayKitColor} teamSide="away" />
            </div>
            <div className="flex justify-between px-2 pt-1 opacity-60">
                <span className="text-[10px] font-bold uppercase tracking-wider">Goals: <span className="text-white font-black">{currentAwayGoals}</span></span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Shots: <span className="text-white font-black">{awayShots}</span></span>
            </div>
          </div>
        </div>

      {/* 7. HALF TIME OVERLAY */}
      {isHalfTime && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
          <div className="w-full max-w-lg space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-primary tracking-widest uppercase">Half Time Talk</h2>
              <p className="text-white/60 text-sm font-bold uppercase tracking-widest italic">The lads are waiting in the dressing room...</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => onTeamTalk('ENCOURAGE')}
                className="h-20 bg-primary/10 border-2 border-primary/40 hover:bg-primary hover:text-primary-foreground flex flex-col items-center justify-center gap-1 rounded-2xl group transition-all"
              >
                <span className="text-xl font-black uppercase">Encourage</span>
                <span className="text-[10px] opacity-60 font-bold uppercase group-hover:opacity-100 transition-opacity">&ldquo;You&apos;re doing great, keep it up!&rdquo;</span>
              </Button>
              
              <Button 
                onClick={() => onTeamTalk('CALM')}
                className="h-20 bg-white/5 border-2 border-white/20 hover:bg-white hover:text-black flex flex-col items-center justify-center gap-1 rounded-2xl group transition-all"
              >
                <span className="text-xl font-black uppercase">Calm</span>
                <span className="text-[10px] opacity-60 font-bold uppercase group-hover:opacity-100 transition-opacity">&ldquo;Stay focused, stick to the plan.&rdquo;</span>
              </Button>
              
              <Button 
                onClick={() => onTeamTalk('AGGRESSIVE')}
                className="h-20 bg-red-500/10 border-2 border-red-500/40 hover:bg-red-500 hover:text-white flex flex-col items-center justify-center gap-1 rounded-2xl group transition-all"
              >
                <span className="text-xl font-black uppercase">Aggressive</span>
                <span className="text-[10px] opacity-60 font-bold uppercase group-hover:opacity-100 transition-opacity">&ldquo;I want more effort in the second half!&rdquo;</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
