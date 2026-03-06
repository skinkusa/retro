"use client"

import { useState, useMemo } from 'react';
import { Player, Position } from '@/types/game';
import { useGame } from '@/lib/store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipPortal } from '@/components/ui/tooltip';
import {
  Trash2,
  Wand2,
  Smile,
  UserCircle,
  Eye,
  Search,
  Menu
} from 'lucide-react';
import { PlayerProfile } from './PlayerProfile';
import { getTacticalAssignments, getFormationSlots } from '@/lib/game-engine';
import { cn, getNaturalPositionLabel } from '@/lib/utils';

interface SquadListProps {
  players: Player[];
  currentMatchRatings?: Record<string, number>;
  onPlayerSwap?: (pId: string) => void;
  activeSwapId?: string | null;
  hideReserves?: boolean;
}

type PlayerGroup = 'STARTER' | 'BENCH' | 'RESERVE';

const FILTERS: readonly (Position | 'ALL')[] = ['ALL', 'GK', 'DF', 'MF', 'FW', 'DM'];

export function SquadList({
  players,
  currentMatchRatings,
  onPlayerSwap,
  activeSwapId,
  hideReserves = false
}: SquadListProps) {
  const { state, togglePlayerLineup, addPlayerToSlot, clearLineup, autoPickLineup } = useGame();
  const [filter, setFilter] = useState<Position | 'ALL'>('ALL');
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const [pinnedSlotIndex, setPinnedSlotIndex] = useState<number | null>(null);

  const userTeam = state.teams.find(t => t.id === state.userTeamId);

  const lineup = useMemo(() => userTeam?.lineup ?? [], [userTeam?.lineup]);

  const selectedCount = lineup.filter((id): id is string => id != null && id !== '').length;
  const starterCount = Math.min(11, selectedCount);
  const subCount = Math.min(5, Math.max(0, selectedCount - 11));

  const emptySlotIndices = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < 16; i++) {
      if (i >= lineup.length || lineup[i] == null || lineup[i] === '') out.push(i);
    }
    return out;
  }, [lineup]);

  const formationSlots = useMemo(
    () => getFormationSlots(userTeam?.formation ?? '4-4-2'),
    [userTeam?.formation]
  );

  const getEmptySlotLabel = (slotIdx: number) =>
    slotIdx < 11 ? (formationSlots[slotIdx]?.label ?? `#${slotIdx + 1}`) : `S${slotIdx - 10}`;

  const tacticalAssignments = useMemo(() => {
    if (!userTeam) return new Map<string, string>();

    const lineupPlayers = (userTeam.lineup.slice(0, 11) as (string | null)[]).map(id =>
      id ? players.find(p => p.id === id) ?? null : null
    );

    const assignments = getTacticalAssignments(userTeam.formation, lineupPlayers);
    const map = new Map<string, string>();

    assignments.forEach(a => {
      if (a.player) map.set(a.player.id, a.slot.label);
    });

    return map;
  }, [userTeam, players]);

  const categorizedPlayers = useMemo(() => {
    const l = userTeam?.lineup ?? [];
    const starterIds = l.slice(0, 11).filter((id): id is string => id != null && id !== '');
    const benchIds = l.slice(11, 16).filter((id): id is string => id != null && id !== '');
    const allSelectedIds = l.filter((id): id is string => id != null && id !== '');

    const starters = starterIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
    const bench = benchIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
    const reserves = players.filter(p => !allSelectedIds.includes(p.id));

    return { starters, bench, reserves };
  }, [players, userTeam]);

  const filteredStarters = categorizedPlayers.starters.filter(p => filter === 'ALL' || p.position === filter);
  const filteredBench = categorizedPlayers.bench.filter(p => filter === 'ALL' || p.position === filter);
  const filteredReserves = categorizedPlayers.reserves
    .filter(p => filter === 'ALL' || p.position === filter)
    .sort((a, b) => {
      const posOrder: Record<Position, number> = { GK: 0, DF: 1, DM: 2, MF: 3, FW: 4 };
      const posDiff = (posOrder[a.position] ?? 5) - (posOrder[b.position] ?? 5);
      return posDiff !== 0 ? posDiff : b.attributes.skill - a.attributes.skill;
    });

  const handleTogglePlayer = (p: Player, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      if (pinnedSlotIndex !== null) {
        addPlayerToSlot(p.id, pinnedSlotIndex);
        setPinnedSlotIndex(null);
      } else {
        togglePlayerLineup(p.id);
      }
    } else {
      togglePlayerLineup(p.id);
    }
  };

  const handleRowClick = (p: Player) => {
    if (!onPlayerSwap) return;
    if (currentMatchRatings) return;
    onPlayerSwap(p.id);
  };

  const getPlayerStatus = (p: Player) => {
    const isSuspended = p.suspensionWeeks > 0;
    const isInjured = !!p.injury;

    if (currentMatchRatings) {
      const matchRating = currentMatchRatings[p.id];
      return {
        label: matchRating?.toFixed(1) || '0.0',
        className:
          matchRating && matchRating >= 7.5
            ? 'text-accent'
            : matchRating && matchRating < 5.5
              ? 'text-red-500'
              : 'text-white'
      };
    }

    if (isSuspended) return { label: 'SUSP', className: 'text-red-500' };
    if (isInjured) return { label: 'INJ', className: 'text-red-500' };
    return { label: 'Fit', className: 'text-green-500' };
  };

  const getMoraleColor = (morale: number) => (
    morale > 70 ? 'text-green-500' : morale > 40 ? 'text-yellow-500' : 'text-red-500'
  );

  const getCardShellClass = (group: PlayerGroup, isBeingSwapped: boolean) =>
    cn(
      "rounded-2xl border shadow-xl transition-all",
      group === 'STARTER'
        ? 'border-primary/35 bg-[linear-gradient(180deg,rgba(24,56,96,0.34),rgba(0,0,0,0.72))]'
        : group === 'BENCH'
          ? 'border-accent/25 bg-[linear-gradient(180deg,rgba(24,56,96,0.18),rgba(0,0,0,0.72))]'
          : 'border-primary/20 bg-[linear-gradient(180deg,rgba(18,24,40,0.55),rgba(0,0,0,0.76))]',
      isBeingSwapped && 'ring-2 ring-accent border-accent/60'
    );

  const renderSectionLabel = (label: string, tone: 'accent' | 'muted' = 'muted') => (
    <div className={cn(
      "px-4 py-2 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] border-y",
      tone === 'accent'
        ? 'bg-accent/15 text-accent border-accent/25'
        : 'bg-black/45 text-white/50 border-primary/20'
    )}>
      {label}
    </div>
  );

  const renderDesktopRow = (p: Player, group: PlayerGroup) => {
    const isSelected = userTeam?.lineup.includes(p.id);
    const assignedRole = tacticalAssignments.get(p.id);
    const isSuspended = p.suspensionWeeks > 0;
    const isInjured = !!p.injury;
    const canPick = !isSuspended && !isInjured;
    const isBeingSwapped = activeSwapId === p.id;
    const status = getPlayerStatus(p);

    return (
      <TableRow
        key={p.id}
        onClick={() => handleRowClick(p)}
        className={cn(
          "border-b border-primary/10 cursor-pointer transition-colors hover:bg-primary/10",
          group === 'STARTER'
            ? 'bg-primary/10'
            : group === 'BENCH'
              ? 'bg-accent/5'
              : 'bg-black/20',
          isBeingSwapped && 'bg-accent/15 ring-2 ring-inset ring-accent'
        )}
      >
        <TableCell className="w-[54px] p-2 text-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            disabled={(!canPick && !isSelected) || !!currentMatchRatings}
            onCheckedChange={(checked: boolean | 'indeterminate') => handleTogglePlayer(p, checked)}
            className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </TableCell>

        <TableCell className="w-[120px] py-3">
          <div className="space-y-1">
            <div className="text-[13px] font-black uppercase text-cyan-300 leading-none">
              {getNaturalPositionLabel(p.position)} ({p.side})
            </div>
            {group === 'STARTER' && assignedRole && (
              <div className="text-[10px] font-black uppercase tracking-wider text-accent">
                {assignedRole}
              </div>
            )}
            {group === 'BENCH' && (
              <div className="text-[10px] font-black uppercase tracking-wider text-primary">
                Bench
              </div>
            )}
          </div>
        </TableCell>

        <TableCell className="py-3">
          <div className="min-w-0">
            <div className="text-[19px] font-black uppercase tracking-tight text-white truncate">
              {p.name}
            </div>
          </div>
        </TableCell>

        <TableCell className="w-[110px] text-center py-3">
          {currentMatchRatings ? (
            <span className={cn("text-[18px] font-black font-mono", status.className)}>
              {status.label}
            </span>
          ) : isSuspended ? (
            <Badge className="bg-red-600 text-[10px] font-black uppercase">SUSP</Badge>
          ) : isInjured ? (
            <Badge className="bg-red-600 text-[10px] font-black uppercase">INJ</Badge>
          ) : (
            <span className="text-[16px] font-black text-green-500 uppercase">Fit</span>
          )}
        </TableCell>

        <TableCell className="w-[110px] text-center py-3">
          <div className="flex items-center justify-center gap-1.5">
            <Smile size={14} className={getMoraleColor(p.morale)} />
            <span className="text-[16px] font-black font-mono text-white">{p.morale}%</span>
          </div>
        </TableCell>

        <TableCell className={cn(
          "w-[110px] text-center py-3 text-[16px] font-black font-mono",
          p.fitness < 80 ? 'text-red-500' : 'text-white'
        )}>
          {p.fitness}%
        </TableCell>

        <TableCell className="w-[90px] text-center py-3 text-[22px] font-black font-mono text-primary">
          {p.attributes.skill}
        </TableCell>

        <TableCell className="w-[72px] text-right py-3 pr-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full border border-primary/20 bg-black/30 text-white/80 hover:text-accent hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              setViewingPlayer(p);
            }}
          >
            <Eye size={18} />
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  const renderMobileCard = (p: Player, group: PlayerGroup) => {
    const isSelected = userTeam?.lineup.includes(p.id);
    const assignedRole = tacticalAssignments.get(p.id);
    const isSuspended = p.suspensionWeeks > 0;
    const isInjured = !!p.injury;
    const canPick = !isSuspended && !isInjured;
    const isBeingSwapped = activeSwapId === p.id;
    const status = getPlayerStatus(p);

    return (
      <div
        key={p.id}
        onClick={() => handleRowClick(p)}
        className={cn(getCardShellClass(group, isBeingSwapped), "p-3")}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              disabled={(!canPick && !isSelected) || !!currentMatchRatings}
              onCheckedChange={(checked: boolean | 'indeterminate') => handleTogglePlayer(p, checked)}
              className="border-primary/50 h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[12px] font-black uppercase text-cyan-300">
                  {getNaturalPositionLabel(p.position)} ({p.side})
                </div>
                <div className="text-[22px] leading-none font-black text-white tracking-tight truncate">
                  {p.name}
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {group === 'STARTER' && assignedRole && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-accent">
                      {assignedRole}
                    </span>
                  )}
                  {group === 'BENCH' && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                      Bench
                    </span>
                  )}
                  {group === 'RESERVE' && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/45">
                      Reserve
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingPlayer(p);
                }}
                className="shrink-0 h-9 px-3 rounded-xl border border-primary/25 bg-primary/10 text-white/90 hover:text-accent"
              >
                <span className="text-[11px] font-black uppercase tracking-widest">Profile</span>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-primary/15 bg-black/35 px-3 py-2">
                <div className="text-[10px] font-black uppercase text-white/50">Status</div>
                <div className={cn("text-[20px] font-black", status.className)}>{status.label}</div>
              </div>

              <div className="rounded-xl border border-primary/15 bg-black/35 px-3 py-2">
                <div className="text-[10px] font-black uppercase text-white/50">Skill</div>
                <div className="text-[22px] font-black text-primary">{p.attributes.skill}</div>
              </div>

              <div className="rounded-xl border border-primary/15 bg-black/35 px-3 py-2">
                <div className="text-[10px] font-black uppercase text-white/50">Morale</div>
                <div className="flex items-center gap-1">
                  <Smile size={13} className={getMoraleColor(p.morale)} />
                  <span className="text-[18px] font-black text-white">{p.morale}%</span>
                </div>
              </div>

              <div className="rounded-xl border border-primary/15 bg-black/35 px-3 py-2">
                <div className="text-[10px] font-black uppercase text-white/50">Fitness</div>
                <div className={cn("text-[18px] font-black", p.fitness < 80 ? 'text-red-500' : 'text-white')}>
                  {p.fitness}%
                </div>
              </div>
            </div>

            {!currentMatchRatings && (
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  className="flex-1 h-11 rounded-xl bg-accent text-accent-foreground font-black uppercase tracking-wider"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (pinnedSlotIndex !== null) {
                      addPlayerToSlot(p.id, pinnedSlotIndex);
                      setPinnedSlotIndex(null);
                    } else {
                      togglePlayerLineup(p.id);
                    }
                  }}
                  disabled={!canPick}
                >
                  {isSelected ? 'Selected' : 'Assign'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-primary/30 bg-primary/10 text-primary font-black uppercase tracking-wider"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingPlayer(p);
                  }}
                >
                  Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="squad-list-root space-y-3">
      {activeSwapId && !currentMatchRatings && (
        <div className="px-3 py-2 text-[11px] sm:text-xs font-black bg-accent/15 border border-accent/30 rounded-xl text-white">
          SWAP MODE: pick a second player to swap, or tap the first player again to cancel.
        </div>
      )}

      <div className="rounded-2xl border-2 border-primary/20 bg-black/70 shadow-inner overflow-hidden">
        <div className="p-2 sm:p-3 border-b border-primary/15">
          <div className="grid grid-cols-2 rounded-2xl border border-primary/20 bg-black/50 p-1 gap-1">
            <button
              type="button"
              className="h-11 sm:h-12 rounded-xl bg-primary text-primary-foreground text-sm sm:text-lg font-black uppercase tracking-wider"
            >
              Squad Selection
            </button>
            <button
              type="button"
              className="h-11 sm:h-12 rounded-xl text-white/65 text-sm sm:text-lg font-black uppercase tracking-wider hover:bg-white/5"
            >
              Tactical Hub
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map(pos => (
                  <Button
                    key={pos}
                    onClick={() => setFilter(pos)}
                    variant={filter === pos ? "default" : "outline"}
                    className={cn(
                      "h-9 sm:h-10 px-3 sm:px-4 rounded-xl font-black text-[11px] sm:text-sm uppercase tracking-wider",
                      filter === pos
                        ? "bg-primary text-primary-foreground"
                        : "border-primary/25 bg-black/40 text-white/85"
                    )}
                  >
                    {pos}
                  </Button>
                ))}
              </div>

              {!currentMatchRatings && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className={cn(
                    "h-9 px-3 rounded-xl border text-[11px] sm:text-sm font-black flex items-center",
                    starterCount >= 11
                      ? 'text-green-500 border-green-500/30 bg-green-500/10'
                      : 'text-red-500 border-red-500/30 bg-red-500/10'
                  )}>
                    {starterCount}/11 XI
                  </div>

                  <div className={cn(
                    "h-9 px-3 rounded-xl border text-[11px] sm:text-sm font-black flex items-center",
                    subCount >= 5
                      ? 'text-green-500 border-green-500/30 bg-green-500/10'
                      : 'text-red-500 border-red-500/30 bg-red-500/10'
                  )}>
                    {subCount}/5 Subs
                  </div>

                  <Button
                    onClick={clearLineup}
                    variant="outline"
                    className="h-9 px-3 rounded-xl border-red-500/30 bg-black/30 text-red-500 font-black uppercase text-[11px] sm:text-sm"
                  >
                    <Trash2 size={13} className="mr-1.5" />
                    Clear
                  </Button>

                  <Button
                    onClick={autoPickLineup}
                    variant="outline"
                    className="h-9 px-3 rounded-xl border-accent/30 bg-black/30 text-accent font-black uppercase text-[11px] sm:text-sm"
                  >
                    <Wand2 size={13} className="mr-1.5" />
                    Auto XI
                  </Button>
                </div>
              )}
            </div>

            {!currentMatchRatings && emptySlotIndices.length > 0 && (
              <div className="border-t border-primary/10 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] sm:text-xs font-black text-white/50 uppercase tracking-wider">
                    Assign to:
                  </span>

                  {emptySlotIndices.map((slotIdx) => (
                    <label
                      key={slotIdx}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-lg border cursor-pointer",
                        pinnedSlotIndex === slotIdx
                          ? 'border-primary/40 bg-primary/10'
                          : 'border-primary/15 bg-black/20'
                      )}
                    >
                      <Checkbox
                        checked={pinnedSlotIndex === slotIdx}
                        onCheckedChange={(checked: boolean | 'indeterminate') =>
                          setPinnedSlotIndex(checked === true ? slotIdx : null)
                        }
                        className="border-primary/50 h-4 w-4"
                      />
                      <span className="text-[11px] sm:text-xs font-black text-white/90">
                        {getEmptySlotLabel(slotIdx)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block rounded-2xl border border-primary/20 bg-black/65 shadow-inner overflow-hidden">
        <TooltipProvider>
          <div className="max-h-[62vh] overflow-auto custom-scrollbar">
            <Table>
              <TableHeader className="sticky top-0 z-10">
                <TableRow className="border-b-2 border-primary/40 bg-[rgba(25,53,89,0.92)] backdrop-blur">
                  <TableHead className="w-[54px] text-center py-3 text-xs font-black uppercase text-white tracking-widest">
                    Sel
                  </TableHead>
                  <TableHead className="w-[120px] py-3 text-xs font-black uppercase text-white tracking-widest">
                    Pos
                  </TableHead>
                  <TableHead className="py-3 text-xs font-black uppercase text-white tracking-widest">
                    Player
                  </TableHead>
                  <TableHead className="w-[110px] text-center py-3 text-xs font-black uppercase text-white tracking-widest">
                    Status
                  </TableHead>
                  <TableHead className="w-[110px] text-center py-3 text-xs font-black uppercase text-white tracking-widest">
                    Morale
                  </TableHead>
                  <TableHead className="w-[110px] text-center py-3 text-xs font-black uppercase text-white tracking-widest">
                    Fitness
                  </TableHead>
                  <TableHead className="w-[90px] text-center py-3 text-xs font-black uppercase text-white tracking-widest">
                    Skill
                  </TableHead>
                  <TableHead className="w-[72px] py-3" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredStarters.map(p => renderDesktopRow(p, 'STARTER'))}

                {filteredBench.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      {renderSectionLabel('Substitute Bench', 'accent')}
                    </TableCell>
                  </TableRow>
                )}

                {filteredBench.map(p => renderDesktopRow(p, 'BENCH'))}

                {!hideReserves && filteredReserves.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="p-0">
                      {renderSectionLabel('Reserve Pool')}
                    </TableCell>
                  </TableRow>
                )}

                {!hideReserves && filteredReserves.map(p => renderDesktopRow(p, 'RESERVE'))}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      </div>

      <div className="md:hidden space-y-3">
        {filteredStarters.length > 0 && (
          <>
            {renderSectionLabel('Starting XI', 'accent')}
            <div className="space-y-3">
              {filteredStarters.map(p => renderMobileCard(p, 'STARTER'))}
            </div>
          </>
        )}

        {filteredBench.length > 0 && (
          <>
            {renderSectionLabel('Substitute Bench', 'accent')}
            <div className="space-y-3">
              {filteredBench.map(p => renderMobileCard(p, 'BENCH'))}
            </div>
          </>
        )}

        {!hideReserves && filteredReserves.length > 0 && (
          <>
            {renderSectionLabel('Reserve Pool')}
            <div className="space-y-3">
              {filteredReserves.map(p => renderMobileCard(p, 'RESERVE'))}
            </div>
          </>
        )}
      </div>

      <PlayerProfile player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
    </div>
  );
}

---

## Refactor check — functionality

All current behaviour is preserved:

- **Props**: `players`, `currentMatchRatings`, `onPlayerSwap`, `activeSwapId`, `hideReserves` — all used; callers in `GameApp.tsx` and `MatchSim.tsx` need no changes.
- **Lineup**: `togglePlayerLineup`, `addPlayerToSlot`, `clearLineup`, `autoPickLineup`, `pinnedSlotIndex`, and the empty-slot “Assign to” pins.
- **Filter**: Position filter (ALL, GK, DF, MF, FW, DM).
- **Swap mode**: Row/card click calls `onPlayerSwap` when `!currentMatchRatings`; `activeSwapId` drives highlight and banner.
- **Match ratings**: Status shows rating or SUSP/INJ/Fit; checkbox and assign disabled when `currentMatchRatings` is set.
- **Sections**: Starters, Substitute Bench, Reserve Pool (`hideReserves` respected); reserves sorted by position then skill.
- **PlayerProfile**: Modal via `viewingPlayer`.
- **Actions**: XI/Subs counts, Clear, Auto XI.

## Fixes needed before applying

1. **Squad Selection / Tactical Hub buttons** — No state or `onClick`; they do nothing. Either add tab state (e.g. `activeTab: 'squad' | 'tactical'`) and conditional content, or remove the Tactical Hub button until that view exists.
2. **Unused imports** — Remove: `Tooltip`, `TooltipContent`, `TooltipTrigger`, `TooltipPortal` (keep `TooltipProvider` if you add tooltips later), and from lucide: `Search`, `Menu`, `UserCircle` (only `Eye` is used for the profile button).