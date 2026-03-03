
"use client"

import { useState } from 'react';
import { useGame } from '@/lib/store';
import { Player } from '@/types/game';
import { RetroWindow } from './RetroWindow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlayerProfile } from './PlayerProfile';
import { Info, Target, Star, ShieldAlert } from 'lucide-react';

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

  const getTeamName = (clubId: string) => state.teams.find(t => t.id === clubId)?.name || "Unknown";

  const renderTable = (players: Player[], type: 'scorers' | 'ratings' | 'discipline') => (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-primary/20 bg-muted/30">
          <TableHead className="w-8 text-[10px] uppercase">#</TableHead>
          <TableHead className="text-[10px] uppercase">Player</TableHead>
          <TableHead className="text-[10px] uppercase">Club</TableHead>
          <Tooltip>
            <TooltipTrigger asChild>
              <TableHead className="text-right text-[10px] uppercase cursor-help">
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
            <TableCell className="font-mono text-xs">{i + 1}</TableCell>
            <TableCell className="text-xs font-bold">
              <button 
                onClick={() => setSelectedPlayer(p)}
                className="hover:text-accent transition-colors text-left uppercase"
              >
                {p.name}
              </button>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{getTeamName(p.clubId).toUpperCase()}</TableCell>
            <TableCell className="text-right font-mono text-xs">
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
            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-[10px] uppercase italic">
              No data recorded for this division yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-4">
      <TooltipProvider>
        <Tabs defaultValue="scorers" className="space-y-4">
          <TabsList className="bg-muted border border-primary/20 h-10 gap-1 p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="scorers" className="text-[10px] uppercase py-1 flex items-center gap-2">
                  <Target size={14} /> Top Scorers
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="font-black">LEAGUE GOLDEN BOOT RACE</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="ratings" className="text-[10px] uppercase py-1 flex items-center gap-2">
                  <Star size={14} /> Avg Ratings
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="font-black">PLAYER OF THE YEAR CANDIDATES</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="discipline" className="text-[10px] uppercase py-1 flex items-center gap-2">
                  <ShieldAlert size={14} /> Discipline
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent className="font-black">DIRTIEST PLAYERS (Reds weight heavier)</TooltipContent>
            </Tooltip>
          </TabsList>

          <TabsContent value="scorers">
            <RetroWindow title={`TOP GOALSCORERS - DIVISION ${division}`}>
              {renderTable(topScorers, 'scorers')}
            </RetroWindow>
          </TabsContent>

          <TabsContent value="ratings">
            <RetroWindow title={`BEST AVERAGE RATINGS (MIN 3 APPS) - DIVISION ${division}`}>
              {renderTable(bestRated, 'ratings')}
            </RetroWindow>
          </TabsContent>

          <TabsContent value="discipline">
            <RetroWindow title={`DISCIPLINARY TABLE - DIVISION ${division}`}>
              {renderTable(badBoys, 'discipline')}
            </RetroWindow>
          </TabsContent>
        </Tabs>
      </TooltipProvider>
      
      <PlayerProfile player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </div>
  );
}
