"use client"

import { useState, useEffect, useMemo } from 'react';
import { GameProvider, useGame } from '@/lib/store';
import { RetroWindow } from '@/components/game/RetroWindow';
import { SquadList } from '@/components/game/SquadList';
import { LeagueTable } from '@/components/game/LeagueTable';
import { MatchSim } from '@/components/game/MatchSim';
import { PlayerMarket } from '@/components/game/PlayerMarket';
import { ManagerInfo } from '@/components/game/ManagerInfo';
import { StaffManagement } from '@/components/game/StaffManagement';
import { FinanceHub } from '@/components/game/FinanceHub';
import { StatsHub } from '@/components/game/StatsHub';
import { TeamRoster } from '@/components/game/TeamRoster';
import { PlayerProfile } from '@/components/game/PlayerProfile';
import { TeamRecords } from '@/components/game/TeamRecords';
import { TacticsPitch } from '@/components/game/TacticsPitch';
import { SettingsHub } from '@/components/game/SettingsHub';
import { SeasonSummary } from '@/components/game/SeasonSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/toaster';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipPortal } from '@/components/ui/tooltip';
import { 
  LayoutDashboard, Users, Trophy, PlayCircle, Search, 
  Briefcase, DollarSign, UserCircle, Globe2, History, ListFilter,
  ShieldCheck, Target, Save, FileUp, Settings, HelpCircle, Swords, RefreshCw, Info
} from 'lucide-react';
import { Team, Player, PlayStyle, ManagerPersonality } from '@/types/game';
import { formatMoney, cn } from '@/lib/utils';

function StartMenu() {
  const { state, startGame, loadGame } = useGame();
  const [name, setName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedDiv, setSelectedDiv] = useState<number>(1);
  const [personality, setPersonality] = useState<ManagerPersonality>('Analyst');
  const [hasSave, setHasSave] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('retro_manager_save_v1.9.3');
      setHasSave(!!saved);
    }
  }, []);

  const getPhilosophyDescription = (p: ManagerPersonality) => {
    switch (p) {
      case 'Analyst': return "Mastery of tactical positioning provides a +5% boost to all pitch zones.";
      case 'Motivator': return "Expert man-management leads to faster morale recovery after matches.";
      case 'Economist': return "Thrifty nature reduces your total weekly wage bill by 10%.";
      case 'Maverick': return "Chaos factor increases goal probability for both teams by 15%.";
      case 'Celebrity': return "High profile starts with 25 Reputation, but the Board has less patience.";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-mono">
      <RetroWindow title="RETRO MANAGER OS v1.9.3" className="max-w-4xl w-full bg-card/70 backdrop-blur-xl border-primary/40 shadow-2xl rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 px-6">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-primary border-b-4 border-primary/20 pb-4 uppercase leading-none">Retro Manager</h1>
            
            <div className="space-y-6">
              {hasSave && (
                <div className="p-6 bg-accent/10 border-2 border-accent space-y-4 shadow-[6px_6px_0px_0px_rgba(38,217,117,0.3)] rounded-xl">
                  <h2 className="text-[16px] font-black text-accent uppercase tracking-widest text-center">Active Career Detected</h2>
                  <Button 
                    onClick={loadGame} 
                    className="w-full h-16 bg-accent text-accent-foreground font-black retro-button flex items-center justify-center gap-3 hover:opacity-90 transition-all text-[22px]"
                  >
                    <FileUp size={28} /> CONTINUE SAVED CAREER
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[16px] font-black text-primary uppercase tracking-wider">Global Configuration</h2>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle size={22} className="text-primary/40 cursor-help hover:text-primary transition-colors" />
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent className="text-[14px] max-w-[240px]">
                          Modify the starting year or edit team names across all new saves.
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button 
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="w-full h-14 border-primary/40 text-primary font-black retro-button flex items-center justify-center gap-2 hover:bg-primary/10 bg-black/20 text-[20px]"
                >
                  <Settings size={22} /> OPEN DATABASE EDITOR
                </Button>
              </div>

              <div className="pt-8 border-t-2 border-primary/10 space-y-6">
                <div>
                  <label className="text-[16px] uppercase text-muted-foreground mb-2 block font-black tracking-wide">Manager Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="bg-black/40 border-primary/20 h-16 text-[24px] font-bold rounded-xl" placeholder="ENTER NAME..." />
                </div>

                <div>
                  <label className="text-[16px] uppercase text-muted-foreground block font-black tracking-wide mb-2">Management Philosophy</label>
                  <Select value={personality} onValueChange={(v: any) => setPersonality(v)}>
                    <SelectTrigger className="bg-black/40 border-primary/20 h-16 text-[20px] font-black rounded-xl">
                      <SelectValue placeholder="Select Philosophy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Analyst">THE ANALYST (+TACTICS)</SelectItem>
                      <SelectItem value="Motivator">THE MOTIVATOR (+MORALE)</SelectItem>
                      <SelectItem value="Economist">THE ECONOMIST (-WAGES)</SelectItem>
                      <SelectItem value="Maverick">THE MAVERICK (GOALS!)</SelectItem>
                      <SelectItem value="Celebrity">THE CELEBRITY (+REP)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-4 p-5 bg-primary/5 border border-primary/20 rounded-xl">
                    <p className="text-[18px] text-primary leading-tight font-black italic">
                      * {getPhilosophyDescription(personality)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end border-b-2 border-primary/10 pb-2">
              <h2 className="text-[16px] font-black uppercase text-primary tracking-wider">Select Club</h2>
              <Select value={selectedDiv.toString()} onValueChange={(v) => { setSelectedDiv(parseInt(v)); setSelectedTeam(null); }}>
                <SelectTrigger className="h-10 w-44 text-[16px] font-black bg-black/40 border-primary/20 rounded-xl">
                  <SelectValue placeholder="Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">DIVISION 1</SelectItem>
                  <SelectItem value="2">DIVISION 2</SelectItem>
                  <SelectItem value="3">DIVISION 3</SelectItem>
                  <SelectItem value="4">DIVISION 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="max-h-[400px] overflow-auto border-2 border-primary/20 p-2 space-y-1 bg-black/40 backdrop-blur-sm rounded-xl">
              {state.teams.filter(t => t.division === selectedDiv).map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeam(t.id)}
                  className={`w-full text-left px-5 py-4 text-[22px] border-2 border-transparent hover:bg-primary/20 transition-all flex justify-between items-center rounded-xl ${selectedTeam === t.id ? 'bg-primary text-primary-foreground border-primary' : ''}`}
                >
                  <span className="font-black uppercase tracking-tight">{t.name}</span>
                  <span className="opacity-50 text-[16px] font-mono font-black">REP: {t.reputation}</span>
                </button>
              ))}
            </div>
            <Button 
              disabled={!name || !selectedTeam} 
              onClick={() => startGame(name, selectedTeam!, personality)} 
              className="w-full h-18 bg-primary text-primary-foreground font-black retro-button mt-6 uppercase tracking-[0.2em] text-[24px] shadow-2xl hover:scale-[1.02] transition-transform rounded-2xl"
            >
              INITIALIZE CAREER
            </Button>
          </div>
        </div>
      </RetroWindow>
    </div>
  );
}

function FiredScreen() {
  const { resetFired } = useGame();
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/80 backdrop-blur-lg p-4 font-mono text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="flex justify-center text-red-500 animate-pulse">
          <Globe2 size={80} />
        </div>
        <h1 className="text-5xl font-black text-red-500 uppercase tracking-tighter">Terminated</h1>
        <p className="text-[18px] text-muted-foreground italic px-8 leading-tight font-black">
          &ldquo;Results speak louder than words, and yours have been deafeningly poor. You are no longer required at this club.&rdquo;
        </p>
        <Button onClick={resetFired} className="w-full bg-red-600 text-white font-black retro-button py-10 text-2xl rounded-2xl">
          RETURN TO MAIN MENU
        </Button>
      </div>
    </div>
  );
}

type NavView = 'HUB' | 'SQUAD' | 'WORLD' | 'MARKET' | 'CLUB';
type ClubSubView = 'OFFICE' | 'STAFF' | 'FINANCE' | 'MANAGER' | 'RECORDS' | 'SETTINGS';
type WorldSubView = 'TABLE' | 'STATS' | 'FIXTURES';

function GameContent() {
  const { state, simulateWeek, advanceWeek, setTactics, saveGame, togglePlayerLineup, swapPlayers } = useGame();
  const [activeTab, setActiveTab] = useState<NavView>('HUB');
  const [clubSubView, setClubSubView] = useState<ClubSubView>('OFFICE');
  const [worldSubView, setWorldSubView] = useState<WorldSubView>('TABLE');
  const [viewingDiv, setViewingDiv] = useState<number>(1);
  const [isMatchDay, setIsMatchDay] = useState(false);
  
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);

  // Swap State Management
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);

  useEffect(() => {
    if (state.userTeamId) {
      const userTeam = state.teams.find(t => t.id === state.userTeamId);
      if (userTeam) setViewingDiv(userTeam.division);
    }
  }, [state.userTeamId, state.teams]);

  const currentWeekNews = useMemo(() => {
    return state.messages.filter(m => m.week === state.currentWeek);
  }, [state.messages, state.currentWeek]);

  const handlePlayerSwapInteraction = (pId: string) => {
    if (!swapSourceId) {
      setSwapSourceId(pId);
    } else {
      if (swapSourceId === pId) {
        setSwapSourceId(null);
      } else {
        swapPlayers(swapSourceId, pId);
        setSwapSourceId(null);
      }
    }
  };

  const renderCore = () => {
    if (state.isFired) return <FiredScreen />;
    if (!state.isGameStarted || !state.userTeamId) return <StartMenu />;
    if (state.isSeasonOver) return <SeasonSummary />;

    const userTeam = state.teams.find(t => t.id === state.userTeamId)!;
    const userPlayers = state.players.filter(p => p.clubId === state.userTeamId);
    const nextFixture = state.fixtures.find(f => f.week === state.currentWeek && (f.homeTeamId === userTeam.id || f.awayTeamId === userTeam.id));
    const isLineupValid = userTeam.lineup.length === 11;

    const handlePlayMatch = () => {
      simulateWeek();
      setIsMatchDay(true);
    };

    const handleTeamClick = (teamId: string) => {
      const team = state.teams.find(t => t.id === teamId);
      if (team) setViewingTeam(team);
    };

    if (isMatchDay && nextFixture) {
      const homeTeam = state.teams.find(t => t.id === nextFixture.homeTeamId)!;
      const awayTeam = state.teams.find(t => t.id === nextFixture.awayTeamId)!;
      
      return (
        <div className="fixed inset-0 z-50 bg-background/20 flex flex-col p-2 md:p-8 font-mono">
          <MatchSim 
            fixture={nextFixture} 
            homeTeam={homeTeam} 
            awayTeam={awayTeam} 
            onFinish={() => {
              advanceWeek();
              setIsMatchDay(false);
              setActiveTab('HUB');
            }}
          />
        </div>
      );
    }

    const renderView = () => {
      switch (activeTab) {
        case 'HUB':
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              <div className="retro-tile flex flex-col bg-black/20 backdrop-blur-md border-primary/30 p-2 rounded-xl shadow-lg h-fit">
                <div className="flex justify-between items-center mb-1.5 border-b border-primary/10 pb-1.5 px-1">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <h3 className="text-[12px] font-black text-primary uppercase shrink-0">Team:</h3>
                    <span className="text-[15px] font-black text-white uppercase truncate tracking-tight">{userTeam.name}</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest bg-black/40 px-3 py-1 rounded shrink-0 ml-2 cursor-help">S{state.season}</span>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent className="font-black">CURRENT SEASON YEAR</TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1 flex justify-between items-center bg-black/30 px-2 py-1.5 rounded-lg border border-primary/10 cursor-help">
                          <div className="text-[9px] text-muted-foreground uppercase font-black">Bank</div>
                          <div className="text-[14px] font-black text-accent">{formatMoney(userTeam.budget)}</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent className="font-black">TOTAL TRANSFER & WAGE BUDGET</TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1 flex justify-between items-center bg-black/30 px-2 py-1.5 rounded-lg border border-primary/10 cursor-help">
                          <div className="text-[9px] text-muted-foreground uppercase font-black">Board</div>
                          <div className={`text-[14px] font-black ${state.boardConfidence > 50 ? 'text-green-500' : 'text-red-500'}`}>{state.boardConfidence}%</div>
                        </div>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent className="font-black">BOARD CONFIDENCE LEVEL</TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="retro-tile bg-black/20 backdrop-blur-md border-primary/30 p-2 rounded-xl shadow-lg h-fit">
                <div className="flex items-center gap-2 mb-1.5 border-b border-primary/10 pb-1.5">
                  <h3 className="text-[12px] font-black text-primary uppercase">League Snapshot</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info size={12} className="text-primary/40 cursor-help" />
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent className="font-black">TOP 3 TEAMS IN YOUR DIVISION</TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="space-y-1 text-[13px]">
                  {state.teams.filter(t => t.division === userTeam.division).slice(0, 3).map((t, i) => (
                    <div key={t.id} className={`flex justify-between items-center py-0.5 ${t.id === userTeam.id ? 'text-accent font-black bg-accent/5 px-2 rounded' : 'text-white/80 px-2'}`}>
                      <span className="truncate flex-1 pr-4 font-black uppercase tracking-tight">{i + 1}. {t.name}</span>
                      <span className="font-mono shrink-0 font-black">{t.points} PTS</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="retro-tile col-span-1 md:col-span-2 bg-black/20 backdrop-blur-md border-primary/30 flex flex-col justify-center p-4 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-3 border-b border-primary/10 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[12px] font-black text-primary uppercase">Next Fixture Intelligence</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={12} className="text-primary/40 cursor-help" />
                        </TooltipTrigger>
                        <TooltipPortal>
                          <TooltipContent className="font-black">PRE-MATCH ANALYSIS & KICK-OFF</TooltipContent>
                        </TooltipPortal>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {nextFixture && <span className="text-[11px] font-mono text-muted-foreground uppercase font-black">Week {state.currentWeek}</span>}
                </div>
                {nextFixture ? (
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 flex justify-center items-center gap-6 md:gap-12 py-3">
                      <span className="text-[18px] md:text-2xl font-black uppercase text-white truncate text-right flex-1 tracking-tighter">
                        {state.teams.find(t => t.id === nextFixture.homeTeamId)?.name}
                      </span>
                      <div className="bg-primary/20 p-2 rounded-sm px-5 flex items-center gap-3">
                        <Swords size={20} className="text-primary" />
                        <span className="text-[14px] text-primary font-black">VS</span>
                      </div>
                      <span className="text-[18px] md:text-2xl font-black uppercase text-white truncate text-left flex-1 tracking-tighter">
                        {state.teams.find(t => t.id === nextFixture.awayTeamId)?.name}
                      </span>
                    </div>
                    <Button 
                        onClick={handlePlayMatch} 
                        disabled={!isLineupValid}
                        className="w-full md:w-56 h-12 md:h-14 bg-accent text-accent-foreground retro-button font-black text-[18px] rounded-xl shadow-lg hover:scale-[1.05] transition-transform"
                    >
                        <PlayCircle size={24} className="mr-3" /> PLAY MATCH
                    </Button>
                  </div>
                ) : <div className="text-[12px] italic text-muted-foreground text-center py-6 uppercase font-black tracking-widest">Season Complete</div>}
              </div>

              <div className="retro-tile col-span-1 md:col-span-2 min-h-[200px] bg-black/20 backdrop-blur-md border-primary/30 rounded-xl p-4">
                 <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-2">
                   <h3 className="text-[14px] font-black text-primary uppercase">Weekly Headlines</h3>
                   <span className="text-[12px] bg-primary text-primary-foreground px-3 py-1 font-black rounded-full">{currentWeekNews.length} NEW</span>
                 </div>
                 <div className="space-y-3 max-h-[160px] overflow-auto pr-2 custom-scrollbar">
                   {currentWeekNews.length > 0 ? currentWeekNews.map(m => (
                     <div key={m.id} className={`text-[14px] border-l-4 pl-4 py-3 rounded-r-lg ${m.read ? 'border-primary/20 bg-primary/5 opacity-60' : 'border-primary bg-primary/10'}`}>
                       <span className="font-black block text-primary uppercase mb-1 tracking-tight text-[15px]">{m.title}</span>
                       <span className="text-white/90 line-clamp-2 leading-tight font-bold text-[14px]">{m.content}</span>
                     </div>
                   )) : (
                     <div className="text-center py-10 text-muted-foreground italic text-[12px] uppercase font-black opacity-40">No news reported this week.</div>
                   )}
                 </div>
              </div>
            </div>
          );
        case 'SQUAD':
          return (
            <div className="p-4 space-y-4">
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-black/40 h-12 mb-4 border border-primary/20 rounded-xl">
                  <TabsTrigger value="list" className="text-[15px] uppercase font-black tracking-widest rounded-lg">Selection</TabsTrigger>
                  <TabsTrigger value="tactics" className="text-[15px] uppercase font-black tracking-widest rounded-lg">Tactics</TabsTrigger>
                </TabsList>
                <TabsContent value="list" className="m-0">
                  <div className="space-y-4">
                    {swapSourceId && (
                      <div className="p-3 bg-accent/20 border-2 border-accent text-accent font-black uppercase flex items-center justify-center gap-3 animate-pulse rounded-xl">
                        <RefreshCw size={20} className="animate-spin" /> 
                        SWAP MODE ACTIVE: SELECT PLAYER TO EXCHANGE WITH {state.players.find(p => p.id === swapSourceId)?.name.toUpperCase()}
                      </div>
                    )}
                    <RetroWindow title={`First Team Squad (${userTeam.lineup.length}/11 SELECTED)`} noPadding className="bg-black/20 backdrop-blur-md rounded-2xl">
                      <SquadList 
                        players={userPlayers} 
                        onPlayerSwap={handlePlayerSwapInteraction}
                        activeSwapId={swapSourceId}
                      />
                    </RetroWindow>
                  </div>
                </TabsContent>
                <TabsContent value="tactics" className="m-0">
                  <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
                    <div className="space-y-4">
                      {swapSourceId && (
                        <div className="p-3 bg-accent/20 border-2 border-accent text-accent font-black uppercase flex items-center justify-center gap-3 animate-pulse rounded-xl">
                          <RefreshCw size={20} className="animate-spin" /> 
                          MANUAL POSITIONING ACTIVE
                        </div>
                      )}
                      <RetroWindow title="TACTICS" className="bg-black/20 backdrop-blur-md rounded-2xl">
                        <div className="flex justify-center py-4">
                          <TacticsPitch 
                            team={userTeam} 
                            players={userPlayers} 
                            onPlayerClick={(p) => handlePlayerSwapInteraction(p.id)} 
                            onPlayerProfile={(p) => setViewingPlayer(p)}
                            activeSwapId={swapSourceId}
                          />
                        </div>
                      </RetroWindow>
                    </div>
                    <RetroWindow title="STRATEGY & PLAY STYLE" className="bg-black/20 backdrop-blur-md rounded-2xl">
                      <div className="space-y-8 py-4 px-2">
                        <div className="space-y-3">
                          <h4 className="text-[14px] font-black text-primary uppercase border-b border-primary/20 pb-2">Formation</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-5-1'].map(f => (
                              <Button 
                                key={f} 
                                onClick={() => setTactics(f, userTeam.playStyle)}
                                className={cn(
                                  "h-14 text-[18px] font-mono retro-button font-black rounded-xl",
                                  userTeam.formation === f 
                                    ? "bg-accent text-accent-foreground border-accent shadow-[0_0_15px_rgba(38,217,117,0.4)]" 
                                    : "bg-black/40 text-white border-primary/20 hover:bg-primary/20"
                                )}
                              >
                                {f}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-[14px] font-black text-primary uppercase border-b border-primary/20 pb-2">Play Style</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {(['Long Ball', 'Pass to Feet', 'Counter-Attack', 'Tiki-Taka', 'Direct', 'Park the Bus'] as PlayStyle[]).map(s => (
                              <Button 
                                key={s} 
                                onClick={() => setTactics(userTeam.formation, s)}
                                className={cn(
                                  "h-14 text-[15px] font-mono retro-button font-black uppercase rounded-xl leading-tight",
                                  userTeam.playStyle === s 
                                    ? "bg-accent text-accent-foreground border-accent shadow-[0_0_15px_rgba(38,217,117,0.4)]" 
                                    : "bg-black/40 text-white border-primary/20 hover:bg-primary/20"
                                )}
                              >
                                {s}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </RetroWindow>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          );
        case 'WORLD':
          return (
            <div className="p-4 space-y-4">
               <div className="bg-black/40 p-2 border border-primary/20 flex gap-2 mb-3 rounded-xl">
                  {[1, 2, 3, 4].map(div => (
                    <Button 
                      key={div} 
                      onClick={() => setViewingDiv(div)} 
                      variant={viewingDiv === div ? 'default' : 'ghost'}
                      className="flex-1 h-10 text-[13px] font-black uppercase retro-button rounded-lg"
                    >
                      DIV {div}
                    </Button>
                  ))}
               </div>

               <div className="flex gap-2 mb-4">
                  <Button onClick={() => setWorldSubView('TABLE')} variant={worldSubView === 'TABLE' ? 'default' : 'outline'} className="h-12 text-[14px] uppercase px-5 retro-button font-black flex-1 tracking-widest bg-black/20 rounded-xl">
                     <Trophy size={22} className="mr-2" /> League Table
                  </Button>
                  <Button onClick={() => setWorldSubView('STATS')} variant={worldSubView === 'STATS' ? 'default' : 'outline'} className="h-12 text-[14px] uppercase px-5 retro-button font-black flex-1 tracking-widest bg-black/20 rounded-xl">
                     <ListFilter size={22} className="mr-2" /> Player Stats
                  </Button>
                  <Button onClick={() => setWorldSubView('FIXTURES')} variant={worldSubView === 'FIXTURES' ? 'default' : 'outline'} className="h-12 text-[14px] uppercase px-5 retro-button font-black flex-1 tracking-widest bg-black/20 rounded-xl">
                     <History size={22} className="mr-2" /> Fixtures
                  </Button>
               </div>
               
               {worldSubView === 'TABLE' && (
                  <RetroWindow title={`Division ${viewingDiv} Standings`} noPadding className="bg-black/20 backdrop-blur-md rounded-2xl">
                     <LeagueTable teams={state.teams.filter(t => t.division === viewingDiv)} onTeamClick={handleTeamClick} />
                  </RetroWindow>
               )}
               
               {worldSubView === 'STATS' && <StatsHub division={viewingDiv} />}
               
               {worldSubView === 'FIXTURES' && (
                 <RetroWindow title={`Full Fixture List - Div ${viewingDiv}`} noPadding className="bg-black/20 backdrop-blur-md rounded-2xl">
                   <Table>
                      <TableHeader>
                        <TableRow className="border-b border-primary/20 bg-black/40">
                          <TableHead className="w-14 text-[12px] uppercase font-black">Wk</TableHead>
                          <TableHead className="text-[12px] uppercase font-black">Home Team</TableHead>
                          <TableHead className="text-center text-[12px] uppercase font-black">Result</TableHead>
                          <TableHead className="text-right text-[12px] uppercase font-black">Away Team</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {state.fixtures
                          .filter(f => f.division === viewingDiv)
                          .sort((a, b) => a.week - b.week)
                          .map(f => {
                           const home = state.teams.find(t => t.id === f.homeTeamId);
                           const away = state.teams.find(t => t.id === f.awayTeamId);
                           return (
                             <TableRow key={f.id} className="border-b border-primary/5 hover:bg-primary/10">
                               <TableCell className="text-[15px] font-mono text-white/70 font-black">{f.week}</TableCell>
                               <TableCell className={`text-[16px] font-black uppercase ${f.homeTeamId === userTeam.id ? 'text-accent' : 'text-white'}`}>{home?.name}</TableCell>
                               <TableCell className="text-center text-[16px] font-mono font-black text-white">
                                 {f.result ? `${f.result.homeGoals}-${f.result.awayGoals}` : 'v'}
                               </TableCell>
                               <TableCell className={`text-[16px] font-black text-right uppercase ${f.awayTeamId === userTeam.id ? 'text-accent' : 'text-white'}`}>{away?.name}</TableCell>
                             </TableRow>
                           );
                        })}
                      </TableBody>
                   </Table>
                 </RetroWindow>
               )}
            </div>
          );
        case 'MARKET':
          return (
            <div className="p-4 h-full">
              <RetroWindow title="TRANSFER & SCOUTING SEARCH" className="bg-black/20 backdrop-blur-md rounded-2xl">
                 <PlayerMarket />
              </RetroWindow>
            </div>
          );
        case 'CLUB':
          return (
            <div className="p-4 space-y-4">
              {clubSubView === 'OFFICE' ? (
                <div className="grid grid-cols-2 gap-4 auto-rows-fr">
                  <button onClick={() => setClubSubView('MANAGER')} className="retro-tile flex flex-col items-center justify-center gap-4 py-12 hover:bg-primary/20 bg-black/40 backdrop-blur-md border-primary/30 rounded-2xl">
                    <UserCircle size={56} className="text-primary" />
                    <span className="text-[18px] font-black uppercase tracking-tight text-white">Manager Profile</span>
                  </button>
                  <button onClick={() => setClubSubView('FINANCE')} className="retro-tile flex flex-col items-center justify-center gap-4 py-12 hover:bg-accent/20 bg-black/40 backdrop-blur-md border-primary/30 rounded-2xl">
                    <DollarSign size={56} className="text-accent" />
                    <span className="text-[18px] font-black uppercase tracking-tight text-white">Finance Hub</span>
                  </button>
                  <button onClick={() => setClubSubView('STAFF')} className="retro-tile flex flex-col items-center justify-center gap-4 py-12 hover:bg-primary/20 bg-black/40 backdrop-blur-md border-primary/30 rounded-2xl">
                    <Briefcase size={56} className="text-primary" />
                    <span className="text-[18px] font-black uppercase tracking-tight text-white">Backroom Staff</span>
                  </button>
                  <button onClick={() => setClubSubView('RECORDS')} className="retro-tile flex flex-col items-center justify-center gap-4 py-12 hover:bg-yellow-500/20 bg-black/40 backdrop-blur-md border-primary/30 rounded-2xl">
                    <Trophy size={56} className="text-yellow-500" />
                    <span className="text-[18px] font-black uppercase tracking-tight text-white">Club Records</span>
                  </button>
                  <button onClick={() => setClubSubView('SETTINGS')} className="retro-tile flex flex-col items-center justify-center gap-4 py-12 border-primary/20 hover:bg-muted bg-black/40 backdrop-blur-md rounded-2xl">
                    <Settings size={56} className="text-muted-foreground" />
                    <span className="text-[18px] font-black uppercase tracking-tight text-white">System Settings</span>
                  </button>
                  <button onClick={saveGame} className="retro-tile flex flex-col items-center justify-center gap-4 py-12 border-accent/40 bg-accent/5 hover:bg-accent/10 backdrop-blur-md rounded-2xl">
                    <Save size={56} className="text-accent" />
                    <span className="text-[18px] font-black uppercase tracking-tight text-white">Save Career</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button variant="outline" onClick={() => setClubSubView('OFFICE')} className="h-12 text-[14px] uppercase font-black mb-3 retro-button bg-black/60 px-8 border-primary/30 rounded-xl">
                    ← BACK TO OFFICE
                  </Button>
                  {clubSubView === 'MANAGER' && <ManagerInfo />}
                  {clubSubView === 'FINANCE' && <FinanceHub />}
                  {clubSubView === 'STAFF' && <StaffManagement />}
                  {clubSubView === 'RECORDS' && <TeamRecords />}
                  {clubSubView === 'SETTINGS' && <SettingsHub />}
                </div>
              )}
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="flex flex-col h-screen max-w-screen-xl mx-auto border-x border-primary/20 bg-transparent">
        <div className="bg-primary text-primary-foreground py-3 px-6 flex justify-between items-center shrink-0 border-b-2 border-black/40 shadow-2xl z-50">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[20px] font-black tracking-tighter uppercase leading-none italic drop-shadow-md">Retro Manager</span>
              <span className="text-[12px] opacity-90 font-mono font-black">OS v1.9.3</span>
            </div>
          </div>
          <div className="flex items-center gap-10 text-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-end cursor-help">
                    <span className="text-[10px] uppercase opacity-90 font-black tracking-widest leading-none mb-1">WEEK</span>
                    <span className="text-[22px] font-black leading-none font-mono text-accent">{state.currentWeek}</span>
                  </div>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent className="font-black">CURRENT WEEK OF THE 38-WEEK SEASON</TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-end cursor-help">
                    <span className="text-[10px] uppercase opacity-90 font-black tracking-widest leading-none mb-1">BALANCE</span>
                    <span className="text-[20px] font-black text-white leading-none font-mono drop-shadow-sm">{formatMoney(userTeam.budget)}</span>
                  </div>
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent className="font-black">TOTAL LIQUID CAPITAL AVAILABLE</TooltipContent>
                </TooltipPortal>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <main className="flex-1 overflow-auto scrollbar-none pb-24">
          {renderView()}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 max-w-screen-xl mx-auto bg-black/80 backdrop-blur-md border-t border-primary/40 h-22 flex items-stretch z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setActiveTab('HUB')} className={`flex-1 flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'HUB' ? 'text-accent border-t-4 border-accent bg-accent/10' : 'text-white/70 hover:text-primary hover:bg-primary/5'}`}>
                  <LayoutDashboard size={32} />
                  <span className="text-[12px] uppercase font-black tracking-widest">Dashboard</span>
                </button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent className="font-black text-[14px]">Main dashboard and career summary</TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setActiveTab('SQUAD')} className={`flex-1 flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'SQUAD' ? 'text-accent border-t-4 border-accent bg-accent/10' : 'text-white/70 hover:text-primary hover:bg-primary/5'}`}>
                  <Users size={32} />
                  <span className="text-[12px] uppercase font-black tracking-widest">Squad</span>
                </button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent className="font-black text-[14px]">Manage lineup and team tactics</TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setActiveTab('WORLD')} className={`flex-1 flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'WORLD' ? 'text-accent border-t-4 border-accent bg-accent/10' : 'text-white/70 hover:text-primary hover:bg-primary/5'}`}>
                  <Globe2 size={32} />
                  <span className="text-[12px] uppercase font-black tracking-widest">World</span>
                </button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent className="font-black text-[14px]">League tables, results and fixtures</TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setActiveTab('MARKET')} className={`flex-1 flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'MARKET' ? 'text-accent border-t-4 border-accent bg-accent/10' : 'text-white/70 hover:text-primary hover:bg-primary/5'}`}>
                  <Search size={32} />
                  <span className="text-[12px] uppercase font-black tracking-widest">Transfers</span>
                </button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent className="font-black text-[14px]">Search for players and scout targets</TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setActiveTab('CLUB')} className={`flex-1 flex flex-col items-center justify-center gap-2 transition-all ${activeTab === 'CLUB' ? 'text-accent border-t-4 border-accent bg-accent/10' : 'text-white/70 hover:text-primary hover:bg-primary/5'}`}>
                  <Briefcase size={32} />
                  <span className="text-[12px] uppercase font-black tracking-widest">Club</span>
                </button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent className="font-black text-[14px]">Staff, finance and system settings</TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </TooltipProvider>
        </nav>

        <TeamRoster 
          team={viewingTeam} 
          players={state.players.filter(p => p.clubId === viewingTeam?.id)} 
          onClose={() => setViewingTeam(null)}
          onPlayerClick={(p) => setViewingPlayer(p)}
        />
        <PlayerProfile player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
        <Toaster />
      </div>
    );
  };

  return (
    <TooltipProvider>
      {renderCore()}
    </TooltipProvider>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
