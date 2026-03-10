"use client"

import { Team, Player, Position } from '@/types/game';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { ShieldAlert, UserCircle, Square, Activity } from 'lucide-react';
import { getTacticalAssignments } from '@/lib/game-engine';

interface TacticsPitchProps {
  team: Team;
  players: Player[];
  onPlayerClick: (player: Player) => void;
  onPlayerProfile?: (player: Player) => void;
  activeSwapId?: string | null;
  /** Cards from the current match (up to current minute). */
  matchCards?: Array<{ playerId: string; type: 'YELLOW' | 'RED'; minute: number }>;
  /** Injuries that occurred in the current match. */
  matchInjuries?: Array<{ playerId: string; type: string; weeks: number }>;
}

export function TacticsPitch({ team, players, onPlayerClick, onPlayerProfile, activeSwapId, matchCards, matchInjuries }: TacticsPitchProps) {
  const lineupPlayers = useMemo(() => {
    return team.lineup.slice(0, 11).map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
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

  const getNaturalPositionLabel = (pos: Position, side: string) => {
    let posPart = '';
    switch(pos) {
      case 'GK': posPart = 'GK'; break;
      case 'DF': posPart = 'Def'; break;
      case 'MF': posPart = 'Mid'; break;
      case 'FW': posPart = 'Fwd'; break;
      case 'DM': posPart = 'DM'; break;
      default: posPart = pos;
    }
    
    let sidePart = side;
    if (side === 'LR') sidePart = 'RL';
    else if (side === 'ALL') sidePart = 'All';
    
    if (pos === 'GK') return 'GK';
    return `${posPart} ${sidePart}`;
  };

  return (
    <div className="relative w-full aspect-[4/5] bg-green-950 border-2 border-primary/30 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] mx-auto max-w-2xl max-[1300px]:max-w-[100%] rounded-xl overflow-hidden h-full max-h-[55vh] sm:max-h-[450px] md:max-h-[600px] max-[1300px]:max-h-[500px]">
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
        const isSentOff = player && matchCards?.some(c => c.playerId === player.id && c.type === 'RED');
        const isMatchInjured = player && matchInjuries?.some(i => i.playerId === player.id);
        
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
                    "w-10 h-10 md:w-12 md:h-12 max-[1300px]:w-14 max-[1300px]:h-14 rounded-full border-2 shadow-xl flex items-center justify-center text-[16px] md:text-[18px] max-[1300px]:text-[20px] font-black relative",
                    isSentOff ? "bg-gray-700 border-gray-500 text-gray-400 opacity-60" : `${markerColor} border-white/50 text-white`,
                    isBeingSwapped ? "ring-4 ring-accent ring-offset-2 ring-offset-black" : ""
                  )}>
                    {slot.label}
                    {isProblematic && !isSentOff && (
                      <div className="absolute -top-1 -right-1 bg-black p-0.5 border border-white animate-pulse rounded-full">
                        <ShieldAlert size={14} className={markerColor === 'bg-red-600' ? 'text-red-500' : 'text-yellow-500'} />
                      </div>
                    )}
                    {isSentOff && (
                      <div className="absolute -top-2 -right-2 bg-red-600 rounded-sm border-2 border-white shadow-lg animate-pulse" title="Sent Off">
                        <Square size={14} className="text-white fill-white" />
                      </div>
                    )}
                    {isMatchInjured && !isSentOff && (
                      <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full border-2 border-white shadow-lg" title="Injured">
                        <Activity size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "bg-black/98 px-2 py-1 backdrop-blur-sm border border-white/20 mt-1 rounded-md shadow-2xl min-w-[80px] md:min-w-[90px] max-[1300px]:min-w-[110px] text-center",
                    markerColor === 'bg-red-600' && "border-red-600/50",
                    markerColor === 'bg-yellow-500' && "border-yellow-500/50",
                    isBeingSwapped && "border-accent"
                  )}>
                    <span className={cn("text-[10px] md:text-[12px] max-[1300px]:text-[15px] uppercase font-black leading-none truncate block", isSentOff ? "text-gray-400 line-through" : "text-white")}>
                      {player.name}
                    </span>
                    <span className={cn(
                      "text-[8px] md:text-[9px] max-[1300px]:text-[15px] block font-black mt-0.5 tracking-tight uppercase",
                      markerColor === 'bg-red-600' ? "text-red-500" : 
                      markerColor === 'bg-yellow-500' ? "text-yellow-400" : "text-accent"
                    )}>
                      {getNaturalPositionLabel(player.position, player.side)}
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="w-10 h-10 max-[1300px]:w-14 max-[1300px]:h-14 border-2 border-dashed border-white/20 flex items-center justify-center rounded-full bg-black/50">
                <span className="text-[14px] max-[1300px]:text-[18px] text-white/80 font-black">{slot.label}</span>
              </div>
            )}
          </div>
        );
      })}

      {lineupPlayers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-black/95 backdrop-blur-md rounded-xl">
          <p className="text-[18px] max-[1300px]:text-[28px] uppercase font-black text-primary animate-pulse leading-tight tracking-[0.3em]">
            ASSIGN 11 PLAYERS<br/>IN SQUAD VIEW
          </p>
        </div>
      )}

      {/* HUD Info */}
      <div className="absolute bottom-3 right-3 flex flex-col items-end gap-1.5 z-20">
        <div className="bg-black/98 px-3 py-1 max-[1300px]:px-5 max-[1300px]:py-3 text-[10px] max-[1300px]:text-[16px] font-black text-white border border-white/20 uppercase tracking-[0.2em] rounded-lg shadow-xl">
          {team.formation} / {team.playStyle}
        </div>
      </div>
    </div>
  );
}
