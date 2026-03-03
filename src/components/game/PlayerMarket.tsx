
"use client"

import { useState, useMemo } from 'react';
import { useGame } from '@/lib/store';
import { Player, Position } from '@/types/game';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Info, Heart, FilterX, Radar, Trash2, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlayerProfile } from './PlayerProfile';
import { useToast } from '@/hooks/use-toast';
import { formatMoney } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function PlayerMarket() {
  const { state, buyPlayer, toggleShortlist } = useGame();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isScouting, setIsScouting] = useState(false);
  
  const [posFilter, setPosFilter] = useState<Position | 'ALL'>('ALL');
  const [minAge, setMinAge] = useState<string>('17');
  const [maxAge, setMaxAge] = useState<string>('40');
  const [minSkill, setMinSkill] = useState<string>('0');

  const userTeam = state.teams.find(t => t.id === state.userTeamId);
  const scout = userTeam?.staff.find(st => st.role === 'SCOUT');

  const filteredPlayers = useMemo(() => {
    return state.players.filter(p => {
      const matchesName = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesPos = posFilter === 'ALL' || p.position === posFilter;
      const matchesAge = p.age >= parseInt(minAge || '17') && p.age <= parseInt(maxAge || '40');
      const matchesSkill = scout ? p.attributes.skill >= parseInt(minSkill || '0') : true;
      const isNotUserTeam = p.clubId !== state.userTeamId;
      
      return isNotUserTeam && matchesName && matchesPos && matchesAge && matchesSkill;
    }).sort((a, b) => b.value - a.value).slice(0, 50);
  }, [state.players, state.userTeamId, search, posFilter, minAge, maxAge, minSkill, scout]);

  const shortlistedPlayers = state.players.filter(p => p.isShortlisted);

  const getPotentialGrade = (player: Player) => {
    const pot = player.attributes.potential;
    if (pot >= 18) return { label: 'A', color: 'text-accent', desc: 'ELITE POTENTIAL' };
    if (pot >= 15) return { label: 'B', color: 'text-primary', desc: 'HIGH POTENTIAL' };
    if (pot >= 12) return { label: 'C', color: 'text-yellow-500', desc: 'SOLID POTENTIAL' };
    if (pot >= 9) return { label: 'D', color: 'text-orange-500', desc: 'LIMITED POTENTIAL' };
    return { label: 'E', color: 'text-red-500', desc: 'NO GROWTH EXPECTED' };
  };

  const resetFilters = () => {
    setSearch('');
    setPosFilter('ALL');
    setMinAge('17');
    setMaxAge('40');
    setMinSkill('0');
  };

  const handleScoutSearch = () => {
    setIsScouting(true);
    setTimeout(() => {
      setIsScouting(false);
      toast({
        title: "SCOUTING COMPLETE",
        description: `Found ${filteredPlayers.length} suitable targets in the database.`,
      });
    }, 800);
  };

  const renderPlayerTable = (players: Player[], isShortlistTab = false) => (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-primary/30 bg-muted/40">
          <TableHead className="text-[11px] uppercase py-3 font-black tracking-tight">Name</TableHead>
          <TableHead className="text-[11px] uppercase py-3 font-black tracking-tight">Club</TableHead>
          <TableHead className="text-center text-[11px] uppercase py-3 font-black tracking-tight">Age</TableHead>
          <TableHead className="text-center text-[11px] uppercase py-3 font-black tracking-tight">Role</TableHead>
          <Tooltip>
            <TooltipTrigger asChild>
              <TableHead className="text-center text-[11px] uppercase py-3 font-black tracking-tight cursor-help">Skill</TableHead>
            </TooltipTrigger>
            <TooltipContent className="font-black">OVERALL TECHNICAL PROFICIENCY (1-20)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <TableHead className="text-center text-[11px] uppercase py-3 font-black tracking-tight cursor-help">Pot</TableHead>
            </TooltipTrigger>
            <TooltipContent className="font-black">SCOUT GRADE FOR FUTURE GROWTH</TooltipContent>
          </Tooltip>
          <TableHead className="text-right text-[11px] uppercase py-3 font-black tracking-tight">Value</TableHead>
          <TableHead className="text-right text-[11px] uppercase py-3 font-black tracking-tight">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((p) => {
          const club = state.teams.find(t => t.id === p.clubId);
          const canAfford = userTeam && userTeam.budget >= p.value;
          const isOwnPlayer = p.clubId === state.userTeamId;
          const potGrade = getPotentialGrade(p);

          return (
            <TableRow key={p.id} className="hover:bg-primary/10 transition-colors border-b border-primary/10 group">
              <TableCell className="text-[14px] font-black py-2.5">
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => toggleShortlist(p.id)}
                        className={cn(
                          "transition-all active:scale-90",
                          p.isShortlisted ? "text-black fill-black" : "text-muted-foreground opacity-30 hover:opacity-100"
                        )}
                      >
                        <Heart size={12} className={p.isShortlisted ? "fill-current" : ""} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="font-black">{p.isShortlisted ? 'REMOVE FROM SHORTLIST' : 'ADD TO SHORTLIST'}</TooltipContent>
                  </Tooltip>
                  <button 
                    onClick={() => setSelectedPlayer(p)}
                    className="hover:text-accent transition-colors text-left uppercase truncate max-w-[140px] text-white"
                  >
                    {p.name}
                  </button>
                </div>
              </TableCell>
              <TableCell className="text-[13px] text-muted-foreground truncate max-w-[100px] py-2.5 font-bold">{club?.name.toUpperCase()}</TableCell>
              <TableCell className="text-center text-[13px] font-mono font-bold py-2.5">{p.age}</TableCell>
              <TableCell className="text-center font-mono text-cyan text-[13px] font-black py-2.5 whitespace-nowrap">
                {p.position} ({p.side})
              </TableCell>
              <TableCell className="text-center text-[13px] font-mono text-primary font-black py-2.5">
                {scout ? p.attributes.skill : "?"}
              </TableCell>
              <TableCell className="text-center py-2.5">
                {scout ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={`font-black text-[13px] ${potGrade.color} cursor-help`}>{potGrade.label}</span>
                    </TooltipTrigger>
                    <TooltipContent className="font-black uppercase">{potGrade.desc}</TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-muted-foreground opacity-20 text-[13px] font-black">?</span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-[13px] font-black py-2.5 text-accent">{formatMoney(p.value)}</TableCell>
              <TableCell className="text-right py-2.5">
                <div className="flex justify-end gap-2">
                  {isShortlistTab && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => toggleShortlist(p.id)}
                          variant="outline"
                          className="h-7 w-7 p-0 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white retro-button"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="font-black">Remove from Shortlist</TooltipContent>
                    </Tooltip>
                  )}
                  <Button 
                    onClick={() => buyPlayer(p.id)} 
                    disabled={!canAfford || isOwnPlayer}
                    className="h-7 text-[10px] bg-accent/20 text-accent hover:bg-accent hover:text-accent-foreground retro-button px-3 uppercase font-black tracking-widest"
                  >
                    {isOwnPlayer ? 'OWNED' : 'BID'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {players.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-[11px] uppercase font-black italic tracking-widest opacity-50">
              {isShortlistTab ? "Your shortlist is empty." : "No players matching your criteria."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 bg-muted/40 p-4 border border-primary/20 shadow-inner rounded-xl">
        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-primary tracking-widest flex items-center gap-1.5">
            Name Search
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle size={10} className="text-primary/40 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="font-black">FILTER BY SURNAME OR FIRST NAME</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="PLAYER NAME..." 
              className="pl-8 bg-card border-primary/30 h-9 text-[13px] font-bold rounded-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-primary tracking-widest">Position</label>
          <Select value={posFilter} onValueChange={(v: any) => setPosFilter(v)}>
            <SelectTrigger className="bg-card border-primary/30 h-9 text-[13px] font-bold rounded-lg">
              <SelectValue placeholder="ALL" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ALL POSITIONS</SelectItem>
              <SelectItem value="GK">GOALKEEPERS</SelectItem>
              <SelectItem value="DF">DEFENDERS</SelectItem>
              <SelectItem value="MF">MIDFIELDERS</SelectItem>
              <SelectItem value="FW">FORWARDS</SelectItem>
              <SelectItem value="DM">DEF/MID HYBRIDS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-black uppercase text-primary tracking-widest">Age Range ({minAge}-{maxAge})</label>
          <div className="flex gap-2">
            <Input 
              type="number" 
              value={minAge} 
              onChange={e => setMinAge(e.target.value)} 
              className="bg-card border-primary/30 h-9 text-[13px] font-bold w-full rounded-lg" 
              placeholder="MIN"
            />
            <Input 
              type="number" 
              value={maxAge} 
              onChange={e => setMaxAge(e.target.value)} 
              className="bg-card border-primary/30 h-9 text-[13px] font-bold w-full rounded-lg" 
              placeholder="MAX"
            />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <Button onClick={resetFilters} variant="outline" className="h-9 text-[11px] px-3 retro-button flex-1 border-red-500/30 text-red-500 font-black rounded-lg">
            <FilterX size={14} className="mr-1.5" /> RESET
          </Button>
          <Button 
            onClick={handleScoutSearch}
            className="bg-accent text-accent-foreground h-9 flex items-center gap-2 flex-1 justify-center retro-button shadow-md rounded-lg"
            disabled={isScouting}
          >
            {isScouting ? (
              <span className="animate-pulse font-black">SCOUTING...</span>
            ) : (
              <>
                <Radar size={14} />
                <span className="text-[11px] uppercase font-black tracking-widest">Search</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-primary/10 border-l-4 border-primary p-3 flex items-center justify-between shadow-sm rounded-r-lg">
         <div className="flex items-center gap-2.5">
           <Info size={16} className="text-primary" />
           <span className="text-[13px] uppercase font-black text-primary tracking-tight">
             Transfer Budget: {formatMoney(userTeam?.budget || 0)} 
             {!scout && " | HIRE A SCOUT FOR FULL DATA"}
           </span>
         </div>
         <span className="text-[11px] text-white/50 uppercase font-bold">{filteredPlayers.length} MATCHES FOUND</span>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/50 border border-primary/20 h-10 gap-1 p-1 mb-4 rounded-xl">
          <TabsTrigger value="all" className="text-[12px] uppercase font-black tracking-widest px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Market Search</TabsTrigger>
          <TabsTrigger value="shortlist" className="text-[12px] uppercase font-black tracking-widest px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">Shortlist ({shortlistedPlayers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="m-0">
          <div className="border border-primary/20 bg-card/40 shadow-xl rounded-xl overflow-hidden">
            <TooltipProvider>
              {renderPlayerTable(filteredPlayers)}
            </TooltipProvider>
          </div>
        </TabsContent>

        <TabsContent value="shortlist" className="m-0">
          <div className="border border-primary/20 bg-card/40 shadow-xl rounded-xl overflow-hidden">
            <TooltipProvider>
              {renderPlayerTable(shortlistedPlayers, true)}
            </TooltipProvider>
          </div>
        </TabsContent>
      </Tabs>

      <PlayerProfile player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
    </div>
  );
}
