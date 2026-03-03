"use client"

import { Team, Player, Position } from '@/types/game';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { ShieldAlert, UserCircle } from 'lucide-react';
import { getTacticalAssignments } from '@/lib/game-engine';

interface TacticsPitchProps {
  team: Team;
  players: Player[];
  onPlayerClick: (player: Player) => void;
  onPlayerProfile?: (player: Player) => void;
  activeSwapId?: string | null;
}

export function TacticsPitch({ team, players, onPlayerClick, onPlayerProfile, activeSwapId }: TacticsPitchProps) {
  const lineupPlayers = useMemo(() => {
    // In manual mode, lineupPlayers must match the order in the team.lineup array
    return team.lineup.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
  }, [players, team.lineup]);

  const assignedSlots = useMemo(() => {
    return getTacticalAssignments(team.formation, lineupPlayers);
  }, [team.formation, lineupPlayers]);

  const getPositionColor = (player: Player, slotPos: Position, slotLabel: string) => {
    // Natural match logic:
    // DM: DF and MF. MF: MF and FW.
    const isRoleMatch = 
      (player.position === slotPos) || 
      (player.position === 'MF' && slotPos === 'FW') ||
      (player.position === 'DM' && (slotPos === 'DF' || slotPos === 'MF'));
    
    // Determine slot side
    let slotSide = 'C';
    if (slotLabel.endsWith('L')) slotSide = 'L';
    else if (slotLabel.endsWith('R')) slotSide = 'R';

    // Determine side compatibility
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

  const getFullPositionLabel = (pos: Position) => {
    switch(pos) {
      case 'GK': return 'GOALKEEPER';
      case 'DF': return 'DEFENDER';
      case 'MF': return 'MIDFIELDER';
      case 'FW': return 'FORWARD';
      case 'DM': return 'DEF/MID';
      default: return pos;
    }
  };

  return (
    <div className="relative w-full aspect-[4/5] bg-green-950 border-2 border-primary/30 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] mx-auto max-w-2xl rounded-xl overflow-hidden">
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
        
        return (
          <div
            key={slot.id}
            style={{ top: `${slot.top}%`, left: `${slot.left}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10"
          >
            {player ? (
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onPlayerClick(player)}
                  className={cn(
                    "group flex flex-col items-center transition-all active:scale-95",
                    isBeingSwapped ? "animate-pulse" : ""
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-full border-2 border-white/50 shadow-xl flex items-center justify-center text-[20px] font-black text-white relative",
                    markerColor,
                    isBeingSwapped ? "ring-4 ring-accent ring-offset-2 ring-offset-black" : ""
                  )}>
                    {slot.label}
                    {isProblematic && (
                      <div className="absolute -top-1 -right-1 bg-black p-0.5 border border-white animate-pulse rounded-full">
                        <ShieldAlert size={16} className={markerColor === 'bg-red-600' ? 'text-red-500' : 'text-yellow-500'} />
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "bg-black/95 px-3 py-1.5 backdrop-blur-sm border border-white/20 mt-1.5 rounded-md shadow-2xl min-w-[110px] text-center",
                    markerColor === 'bg-red-600' && "border-red-600/50",
                    markerColor === 'bg-yellow-500' && "border-yellow-500/50",
                    isBeingSwapped && "border-accent"
                  )}>
                    <span className="text-[14px] uppercase font-black text-white leading-none truncate block">
                      {player.name.split(' ').pop()}
                    </span>
                    <span className={cn(
                      "text-[11px] block font-black mt-1 tracking-tight uppercase",
                      markerColor === 'bg-red-600' ? "text-red-500" : 
                      markerColor === 'bg-yellow-500' ? "text-yellow-400" : "text-accent"
                    )}>
                      {getFullPositionLabel(player.position)}
                    </span>
                  </div>
                </button>
                {onPlayerProfile && (
                  <button 
                    onClick={() => onPlayerProfile(player)}
                    className="mt-1 p-1 bg-black/40 hover:bg-black/80 text-white/50 hover:text-white rounded-full transition-colors"
                  >
                    <UserCircle size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-12 h-12 border-2 border-dashed border-white/20 flex items-center justify-center rounded-full bg-black/20">
                <span className="text-[16px] text-white/40 font-black">{slot.label}</span>
              </div>
            )}
          </div>
        );
      })}

      {lineupPlayers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-black/80 backdrop-blur-md rounded-xl">
          <p className="text-[18px] uppercase font-black text-primary animate-pulse leading-tight tracking-[0.3em]">
            ASSIGN 11 PLAYERS<br/>IN SQUAD VIEW
          </p>
        </div>
      )}

      {/* HUD Info */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2 z-20">
        <div className="bg-black/90 px-4 py-1.5 text-[11px] font-black text-white border border-white/20 uppercase tracking-[0.2em] rounded-lg shadow-xl">
          {team.formation} / {team.playStyle}
        </div>
      </div>
    </div>
  );
}
