"use client"

import { Team, Player, Position } from '@/types/game';
import { cn, getNaturalPositionLabel } from '@/lib/utils';
import { useMemo } from 'react';
import { ShieldAlert } from 'lucide-react';
import { getTacticalAssignments } from '@/lib/game-engine';

/** Shared container class so Squad tactics and match-day command center use identical pitch visuals */
export const TACTICS_PITCH_CONTAINER_CLASS =
  "bg-black/60 p-3 border border-primary/20 rounded-xl shadow-inner h-full flex items-center justify-center min-h-[320px] sm:min-h-[420px]";

interface TacticsPitchProps {
  team: Team;
  players: Player[];
  onPlayerClick: (player: Player) => void;
  onPlayerProfile?: (player: Player) => void;
  activeSwapId?: string | null;
  sentOffPlayerIds?: Set<string>;
}

export function TacticsPitch({ team, players, onPlayerClick, onPlayerProfile, activeSwapId, sentOffPlayerIds }: TacticsPitchProps) {
  const lineupPlayers = useMemo(() => {
    return (team.lineup.slice(0, 11) as (string | null)[]).map(id =>
      id ? (players.find(p => p.id === id) ?? null) : null
    );
  }, [players, team.lineup]);

  const assignedSlots = useMemo(() => {
    return getTacticalAssignments(team.formation, lineupPlayers);
  }, [team.formation, lineupPlayers]);

  const getPositionColor = (player: Player, slotPos: Position, slotLabel: string) => {
    const isRoleMatch = 
      (player.position === slotPos) || 
      (player.position === 'MF' && slotPos === 'FW') ||
      (player.position === 'DM' && (slotPos === 'DF' || slotPos === 'MF'));
    
    let slotSide = 'C';
    if (slotLabel.endsWith('L')) slotSide = 'L';
    else if (slotLabel.endsWith('R')) slotSide = 'R';

    let isSideMatch = false;
    if (player.side === 'ALL') {
      isSideMatch = true;
    } else if (slotSide === 'L') {
      isSideMatch = ['L', 'LC', 'LR'].includes(player.side);
    } else if (slotSide === 'R') {
      isSideMatch = ['R', 'RC', 'LR'].includes(player.side);
    } else if (slotSide === 'C') {
      isSideMatch = ['C', 'LC', 'RC'].includes(player.side);
    }

    if (!isRoleMatch) return 'bg-red-600'; 
    if (!isSideMatch) return 'bg-yellow-500'; 
    return 'bg-green-600'; 
  };

  return (
    <div className="relative w-full aspect-[4/5] bg-green-950 border-2 border-primary/30 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] mx-auto max-w-2xl rounded-xl overflow-hidden h-full max-h-[55vh] sm:max-h-[450px] md:max-h-[600px]">
      {/* Pitch Markings */}
      <div className="absolute inset-2 border border-white/10 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white/10 rounded-full" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b border-x border-white/10" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t border-x border-white/10" />
      </div>

      {/* Slots & Players */}
      {assignedSlots.map(({ slot, player }) => {
        const markerColor = player ? getPositionColor(player, slot.pos, slot.label) : '';
        const isProblematic = player && (markerColor === 'bg-red-600' || markerColor === 'bg-yellow-500');
        const isBeingSwapped = player && activeSwapId === player.id;
        const isSentOff = player && sentOffPlayerIds?.has(player.id);
        const isInjured = player && (player.status === 'INJURED' || player.injury != null);
        
        return (
          <div
            key={slot.id}
            style={{ top: `${slot.top}%`, left: `${slot.left}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
          >
            {player ? (
              <div className="flex flex-col items-center">
                <button
                  onClick={() => !isSentOff && onPlayerClick(player)}
                  disabled={!!isSentOff}
                  className={cn(
                    "group flex flex-col items-center transition-all active:scale-95",
                    isBeingSwapped ? "animate-pulse" : "",
                    isSentOff && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/50 shadow-xl flex items-center justify-center text-[16px] md:text-[18px] font-black text-white relative",
                    markerColor,
                    isBeingSwapped ? "ring-4 ring-accent ring-offset-2 ring-offset-black" : "",
                    isSentOff && "ring-2 ring-red-500"
                  )}>
                    {slot.label}
                    {isProblematic && (
                      <div className="absolute -top-1 -right-1 bg-black p-0.5 border border-white animate-pulse rounded-full">
                        <ShieldAlert size={14} className={markerColor === 'bg-red-600' ? 'text-red-500' : 'text-yellow-500'} />
                      </div>
                    )}
                    {isInjured && (
                      <span className="absolute -top-1.5 -left-1 bg-red-600 text-white text-[8px] md:text-[9px] font-black px-1 rounded border border-white/50 leading-tight">
                        INJ
                      </span>
                    )}
                  </div>
                  <div className={cn(
                    "bg-black/98 px-2 py-1 backdrop-blur-sm border border-white/20 mt-1 rounded-md shadow-2xl min-w-[80px] md:min-w-[90px] text-center",
                    markerColor === 'bg-red-600' && "border-red-600/50",
                    markerColor === 'bg-yellow-500' && "border-yellow-500/50",
                    isBeingSwapped && "border-accent"
                  )}>
                    <span className="text-[10px] md:text-[12px] uppercase font-black text-white leading-none truncate block">
                      {player.name}
                    </span>
                    <span className={cn(
                      "text-[16px] md:text-[18px] block font-black mt-0.5 tracking-tight uppercase",
                      markerColor === 'bg-red-600' ? "text-red-500" : 
                      markerColor === 'bg-yellow-500' ? "text-yellow-400" : "text-accent"
                    )}>
                      {getNaturalPositionLabel(player.position)} {player.side}
                    </span>
                    {isSentOff && (
                      <span className="text-[8px] font-black text-red-500 uppercase block mt-0.5">SENT OFF</span>
                    )}
                    {isInjured && (
                      <span className="text-[8px] font-black text-orange-400 uppercase block mt-0.5">INJ</span>
                    )}
                  </div>
                </button>
              </div>
            ) : (
              <div className="w-10 h-10 border-2 border-dashed border-white/20 flex items-center justify-center rounded-full bg-black/50">
                <span className="text-[14px] text-white/80 font-black">{slot.label}</span>
              </div>
            )}
          </div>
        );
      })}

      {lineupPlayers.filter(Boolean).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-black/95 backdrop-blur-md rounded-xl">
          <p className="text-[18px] uppercase font-black text-primary animate-pulse leading-tight tracking-[0.3em]">
            ASSIGN 11 PLAYERS<br/>IN SQUAD VIEW
          </p>
        </div>
      )}

      {/* HUD Info */}
      <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1.5 z-20">
        <div className="bg-black/98 px-3 py-1 text-[10px] font-black text-white border border-white/20 uppercase tracking-[0.2em] rounded-lg shadow-xl">
          {team.formation} / {team.playStyle}
        </div>
      </div>
    </div>
  );
}

/**
 * Pitch + shared container. Use this in both Squad tab and match-day tactical command center
 * so the tactics view looks identical in both places.
 */
export function TacticsPitchView(props: TacticsPitchProps) {
  return (
    <div className={TACTICS_PITCH_CONTAINER_CLASS}>
      <TacticsPitch {...props} />
    </div>
  );
}
