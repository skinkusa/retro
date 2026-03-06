
"use client"

import { useState } from 'react';
import { useGame } from '@/lib/store';
import { Player } from '@/types/game';
import { RetroWindow } from './RetroWindow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlayerProfile } from './PlayerProfile';
import { BarChart3, Target, Star, ShieldAlert } from 'lucide-react';

interface StatsHubProps {
  division: number;
}

export function StatsHub({ division }: StatsHubProps) {
  const { state } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const filteredPlayers = state.players.filter(p => {
    const team = state.teams.find(t => t.id === p.clubId);
    return team?.division === division;
  });

  const topScorers = [...filteredPlayers]
    .filter(p => p.seasonStats.goals > 0)
    .sort((a, b) => b.seasonStats.goals - a.seasonStats.goals)
    .slice(0, 20);

  const bestRated = [...filteredPlayers]
    .filter(p => p.seasonStats.apps >= 3)
    .sort((a, b) => b.seasonStats.avgRating - a.seasonStats.avgRating)
    .slice(0, 20);

  const badBoys = [...filteredPlayers]
    .filter(p => (p.seasonStats.yellowCards || 0) > 0 || (p.seasonStats.redCards || 0) > 0)
    .sort((a, b) => ((b.seasonStats.redCards || 0) * 3 + (b.seasonStats.yellowCards || 0)) - ((a.seasonStats.redCards || 0) * 3 + (a.seasonStats.yellowCards || 0)))
    .slice(0, 20);

  const seasonStatsList = [...filteredPlayers]
    .filter(p => p.seasonStats.apps >= 1)
    .sort((a, b) => b.seasonStats.apps - a.seasonStats.apps)
    .slice(0, 30);

  const getTeamName = (clubId: string | null) => state.teams.find(t => t.id === clubId)?.name || "Unknown";

  const renderSeasonStatsTable = (players: Player[]) => (
    <Table>
      <TableHeader>
        <TableRow className="border-b-2 border-primary/40 bg-primary/20">
          <TableHead className="w-10 max-md:w-8 text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">#</TableHead>
          <TableHead className="text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">Player</TableHead>
          <TableHead className="text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">Club</TableHead>
          <TableHead className="text-right text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">Apps</TableHead>
          <TableHead className="text-right text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">Goals</TableHead>
          <TableHead className="text-right text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">Shots</TableHead>
          <TableHead className="text-right text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">SOT</TableHead>
          <TableHead className="text-right text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">CS</TableHead>
          <TableHead className="text-right text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">Mins</TableHead>
          <TableHead className="text-right text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">Rating</TableHead>
          <TableHead className="text-right text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">MoM</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((p, i) => (
          <TableRow key={p.id} className="hover:bg-primary/5 border-b border-primary/5">
            <TableCell className="font-mono text-[18px] max-md:text-base font-black py-2.5 max-md:py-2 tabular-nums">{i + 1}</TableCell>
            <TableCell className="text-[17px] max-md:text-base font-bold py-2.5 max-md:py-2">
              <button
                onClick={() => setSelectedPlayer(p)}
                className="hover:text-accent transition-colors text-left uppercase"
              >
                {p.name}
              </button>
            </TableCell>
            <TableCell className="text-[16px] max-md:text-sm text-muted-foreground py-2.5 max-md:py-2">{getTeamName(p.clubId).toUpperCase()}</TableCell>
            <TableCell className="text-right font-mono text-[16px] max-md:text-sm py-2.5 max-md:py-2">{p.seasonStats.apps}</TableCell>
            <TableCell className="text-right font-mono text-[16px] max-md:text-sm py-2.5 max-md:py-2 text-cyan">{p.seasonStats.goals}</TableCell>
            <TableCell className="text-right font-mono text-[16px] max-md:text-sm py-2.5 max-md:py-2">{p.seasonStats.shots ?? '—'}</TableCell>
            <TableCell className="text-right font-mono text-[16px] max-md:text-sm py-2.5 max-md:py-2">{p.seasonStats.shotsOnTarget ?? '—'}</TableCell>
            <TableCell className="text-right font-mono text-[16px] max-md:text-sm py-2.5 max-md:py-2">
              {p.position === 'GK' ? (p.seasonStats.cleanSheets ?? '—') : '—'}
            </TableCell>
            <TableCell className="text-right font-mono text-[16px] max-md:text-sm py-2.5 max-md:py-2">{p.seasonStats.minutesPlayed ?? '—'}</TableCell>
            <TableCell className="text-right font-mono text-[16px] max-md:text-sm py-2.5 max-md:py-2 text-accent font-bold">{p.seasonStats.avgRating.toFixed(2)}</TableCell>
            <TableCell className="text-right font-mono text-[16px] max-md:text-sm py-2.5 max-md:py-2 text-primary font-bold">{p.seasonStats.manOfTheMatch ?? 0}</TableCell>
          </TableRow>
        ))}
        {players.length === 0 && (
          <TableRow>
            <TableCell colSpan={11} className="text-center py-8 max-md:py-6 text-muted-foreground text-sm max-md:text-xs uppercase italic">
              No appearances recorded for this division yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  const renderTable = (players: Player[], type: 'scorers' | 'ratings' | 'discipline') => (
    <Table>
      <TableHeader>
        <TableRow className="border-b-2 border-primary/40 bg-primary/20">
          <TableHead className="w-10 text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">#</TableHead>
          <TableHead className="text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">Player</TableHead>
          <TableHead className="text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2">Club</TableHead>
          <Tooltip>
            <TooltipTrigger asChild>
              <TableHead className="text-right text-[14px] max-md:text-xs uppercase font-black text-white tracking-wide py-3 max-md:py-2 cursor-help">
                {type === 'scorers' ? 'Goals' : type === 'ratings' ? 'Rating' : 'Y / R'}
              </TableHead>
            </TooltipTrigger>
            <TooltipContent className="font-black">
              {type === 'scorers' ? 'TOTAL GOALS SCORED' : type === 'ratings' ? 'AVERAGE PERFORMANCE RATING' : 'YELLOW CARDS / RED CARDS'}
            </TooltipContent>
          </Tooltip>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((p, i) => (
          <TableRow key={p.id} className="hover:bg-primary/5 border-b border-primary/5">
            <TableCell className="font-mono text-[18px] max-md:text-base font-black py-2.5 max-md:py-2 tabular-nums">{i + 1}</TableCell>
            <TableCell className="text-[17px] max-md:text-base font-bold py-2.5 max-md:py-2">
              <button 
                onClick={() => setSelectedPlayer(p)}
                className="hover:text-accent transition-colors text-left uppercase"
              >
                {p.name}
              </button>
            </TableCell>
            <TableCell className="text-[16px] max-md:text-sm text-muted-foreground py-2.5 max-md:py-2">{getTeamName(p.clubId).toUpperCase()}</TableCell>
            <TableCell className="text-right font-mono text-[16px] max-md:text-sm py-2.5 max-md:py-2">
              {type === 'scorers' && <span className="text-cyan font-bold">{p.seasonStats.goals}</span>}
              {type === 'ratings' && <span className="text-accent font-bold">{p.seasonStats.avgRating.toFixed(2)}</span>}
              {type === 'discipline' && (
                <>
                  <span className="text-yellow-500 font-bold">{p.seasonStats.yellowCards || 0}</span>
                  <span className="mx-2">/</span>
                  <span className="text-red-500 font-bold">{p.seasonStats.redCards || 0}</span>
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
        {players.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 max-md:py-6 text-muted-foreground text-sm max-md:text-xs uppercase italic">
              No data recorded for this division yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-4 max-md:space-y-2">
      <TooltipProvider>
        <Tabs defaultValue="scorers" className="space-y-4 max-md:space-y-2">
          <TabsList className="bg-muted border border-primary/20 h-12 max-md:h-10 gap-1.5 p-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="scorers" className="text-[14px] max-md:text-xs uppercase py-2 flex items-center gap-2 font-black">
                  <Target size={16} /> Top Scorers
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="font-black">LEAGUE GOLDEN BOOT RACE</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="ratings" className="text-[14px] max-md:text-xs uppercase py-2 flex items-center gap-2 font-black">
                  <Star size={16} /> Avg Ratings
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="font-black">PLAYER OF THE YEAR CANDIDATES</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="discipline" className="text-[14px] max-md:text-xs uppercase py-2 flex items-center gap-2 font-black">
                  <ShieldAlert size={16} /> Discipline
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="font-black">DIRTIEST PLAYERS (Reds weight heavier)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="season" className="text-[14px] max-md:text-xs uppercase py-2 flex items-center gap-2 font-black">
                  <BarChart3 size={16} /> Season Stats
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="font-black">APPS, GOALS, SHOTS, SOT, CLEAN SHEETS, MINS, RATING</TooltipContent>
            </Tooltip>
          </TabsList>

          <TabsContent value="scorers">
            <RetroWindow title={`TOP GOALSCORERS - DIVISION ${division}`} titleClassName="text-[16px] max-md:text-sm">
              {renderTable(topScorers, 'scorers')}
            </RetroWindow>
          </TabsContent>

          <TabsContent value="ratings">
            <RetroWindow title={`BEST AVERAGE RATINGS (MIN 3 APPS) - DIVISION ${division}`} titleClassName="text-[16px] max-md:text-sm">
              {renderTable(bestRated, 'ratings')}
            </RetroWindow>
          </TabsContent>

          <TabsContent value="discipline">
            <RetroWindow title={`DISCIPLINARY TABLE - DIVISION ${division}`} titleClassName="text-[16px] max-md:text-sm">
              {renderTable(badBoys, 'discipline')}
            </RetroWindow>
          </TabsContent>

          <TabsContent value="season">
            <RetroWindow title={`SEASON STATS (MIN 1 APP) - DIVISION ${division}`} titleClassName="text-[16px] max-md:text-sm">
              {renderSeasonStatsTable(seasonStatsList)}
            </RetroWindow>
          </TabsContent>
        </Tabs>
      </TooltipProvider>
      
      <PlayerProfile player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </div>
  );
}
