"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import { Toaster } from '@/components/ui/toaster';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipPortal } from '@/components/ui/tooltip';
import { LayoutDashboard, Users, Trophy, PlayCircle, Search, Briefcase, DollarSign, UserCircle, Globe2, Save, FileUp, Settings, LogOut, ShieldAlert, History, FileText } from 'lucide-react';
import { Team, Player, PlayStyle, ManagerPersonality } from '@/types/game';
import { formatMoney, cn, getMessageDisplayContent } from '@/lib/utils';
import { STORAGE_KEY } from '@/lib/constants';
import Link from 'next/link';

function StartMenu() {
  const { state, startGame, loadGame, updateSeason, updateTeamName } = useGame();
  const [name, setName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedDiv, setSelectedDiv] = useState<number>(1);
  const [personality, setPersonality] = useState<ManagerPersonality>('Analyst');
  const [hasSave, setHasSave] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newSeason, setNewSeason] = useState(state.season.toString());
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [tempTeamName, setTempTeamName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      setHasSave(!!saved);
    }
  }, []);
  useEffect(() => {
    if (showSettings) setNewSeason(state.season.toString());
  }, [showSettings, state.season]);

  const handleSeasonChange = () => {
    const year = parseInt(newSeason, 10);
    if (!isNaN(year) && year >= 1990 && year <= 2100) updateSeason(year);
  };
  const startEditingTeam = (teamId: string, currentName: string) => {
    setEditingTeamId(teamId);
    setTempTeamName(currentName);
  };
  const saveTeamName = () => {
    if (editingTeamId && tempTeamName.trim()) {
      updateTeamName(editingTeamId, tempTeamName.trim());
      setEditingTeamId(null);
    }
  };

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
    <div className="start-menu-shell min-h-screen flex items-center justify-center p-4 font-mono">
      <RetroWindow title="RETRO MANAGER OS v1.0" titleClassName="text-[8px]" className="max-w-5xl w-full bg-card/90 backdrop-blur-xl border-primary/40 shadow-2xl rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 px-6 md:py-10 md:px-8">
          <div className="space-y-6 max-md:space-y-4">
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter text-primary border-b-8 border-primary/20 pb-2 md:pb-4 uppercase leading-none italic">Retro Manager</h1>
            <div className="space-y-6 max-md:space-y-4">
              {hasSave && (
                <div className="p-4 max-[1300px]:p-5 bg-accent/10 border-2 border-accent space-y-4 shadow-[8px_8px_0px_0px_rgba(38,217,117,0.3)] rounded-2xl">
                  <h2 className="text-[16px] max-[1300px]:text-[20px] font-black text-accent uppercase tracking-widest text-center leading-tight">Active Career Detected</h2>
                  <Button onClick={loadGame} className="w-full h-16 max-[1300px]:h-20 bg-accent text-accent-foreground font-black retro-button flex items-center justify-center gap-4 hover:opacity-90 transition-all text-xl max-[1300px]:text-[24px] rounded-xl shadow-lg"><FileUp size={24} className="max-[1300px]:w-8 max-[1300px]:h-8" /> CONTINUE CAREER</Button>
                </div>
              )}
              <div className="space-y-4">
                <Button onClick={() => setShowSettings(true)} variant="outline" className="w-full h-12 max-[1300px]:h-16 border-primary/40 text-primary font-black retro-button flex items-center justify-center gap-2 hover:bg-primary/10 bg-black/20 text-lg max-[1300px]:text-[20px] rounded-xl uppercase"><Settings size={18} className="max-[1300px]:w-6 max-[1300px]:h-6" /> Database Editor</Button>
              </div>
              <div className="pt-4 md:pt-8 border-t-4 border-primary/10 space-y-6 max-md:space-y-4">
                <div>
                  <Input value={name} onChange={e => setName(e.target.value)} className="bg-black/40 border-primary/30 h-12 md:h-16 max-[1300px]:h-14 text-xl md:text-3xl max-[1300px]:text-[20px] font-black rounded-xl uppercase px-4 md:px-6" placeholder="MANAGER NAME..." />
                </div>
                <div>
                  <label className="text-[16px] max-[1300px]:text-[20px] uppercase text-muted-foreground block font-black tracking-widest mb-2">Management Philosophy</label>
                  <Select value={personality} onValueChange={(v: any) => setPersonality(v)}>
                    <SelectTrigger className="bg-black/40 border-primary/30 h-12 md:h-16 max-[1300px]:h-14 text-xl max-[1300px]:text-[18px] font-black rounded-xl uppercase px-6"><SelectValue placeholder="Select Philosophy" /></SelectTrigger>
                    <SelectContent><SelectItem value="Analyst">THE ANALYST (+TACTICS)</SelectItem><SelectItem value="Motivator">THE MOTIVATOR (+MORALE)</SelectItem><SelectItem value="Economist">THE ECONOMIST (-WAGES)</SelectItem><SelectItem value="Maverick">THE MAVERICK (GOALS!)</SelectItem><SelectItem value="Celebrity">THE CELEBRITY (+REP)</SelectItem></SelectContent>
                  </Select>
                  <div className="mt-4 p-4 max-[1300px]:p-5 bg-primary/10 border-2 border-primary/20 rounded-2xl shadow-inner min-h-[5rem]"><p className="text-[14px] max-[1300px]:text-[18px] text-primary leading-tight font-black italic">* {getPhilosophyDescription(personality)}</p></div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b-4 border-primary/10 pb-3">
              <h2 className="text-xl font-black uppercase text-primary tracking-widest">Select Club</h2>
              <Select value={selectedDiv.toString()} onValueChange={(v) => { setSelectedDiv(parseInt(v)); setSelectedTeam(null); }}>
                <SelectTrigger className="h-10 w-40 text-[14px] max-[1300px]:text-[16px] font-black bg-black/40 border-primary/30 rounded-xl"><SelectValue placeholder="Division" /></SelectTrigger>
                <SelectContent><SelectItem value="1">DIVISION 1</SelectItem><SelectItem value="2">DIVISION 2</SelectItem><SelectItem value="3">DIVISION 3</SelectItem><SelectItem value="4">DIVISION 4</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="max-h-[300px] max-[1300px]:max-h-[250px] overflow-auto border-4 border-primary/20 p-2 space-y-0.5 md:space-y-1 bg-black/40 backdrop-blur-sm rounded-2xl shadow-inner custom-scrollbar">
              {state.teams.filter(t => t.division === selectedDiv).map(t => (
                <button key={t.id} onClick={() => setSelectedTeam(t.id)} className={`w-full text-left px-3 md:px-6 py-2 md:py-3 text-base md:text-xl border-4 border-transparent hover:bg-primary/20 transition-all flex justify-between items-center rounded-xl shadow-sm ${selectedTeam === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-black/20'}`}>
                  <span className="font-black uppercase tracking-tight truncate flex-1 min-w-0 max-[1300px]:text-[18px]">{t.name}</span>
                  <span className="opacity-60 text-[12px] md:text-[16px] max-[1300px]:text-[14px] font-mono font-black shrink-0 ml-2">REP: {t.reputation}</span>
                </button>
              ))}
            </div>
            <Button disabled={!name || !selectedTeam} onClick={() => startGame(name, selectedTeam!, personality)} className="w-full h-16 max-[1300px]:h-20 bg-primary text-primary-foreground font-black retro-button mt-4 uppercase tracking-[0.2em] max-[1300px]:tracking-tight text-2xl max-[1300px]:text-[18px] shadow-2xl hover:scale-[1.03] transition-transform rounded-2xl leading-none">INITIALIZE CAREER</Button>
          </div>
        </div>
      </RetroWindow>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-primary font-black uppercase tracking-tight">Database Editor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-auto flex-1 pr-2">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Starting season year (for new games)</label>
                <Input type="number" value={newSeason} onChange={(e) => setNewSeason(e.target.value)} className="bg-black/40 border-primary/20 h-10 font-mono" />
              </div>
              <Button onClick={handleSeasonChange} className="retro-button bg-accent text-accent-foreground h-10 px-6 font-bold">Update</Button>
            </div>
            <div>
              <h4 className="text-xs font-bold text-primary uppercase mb-2">Team names (for new games)</h4>
              <div className="max-h-[300px] overflow-auto border border-primary/20 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/20 border-b-2 border-primary/40">
                      <TableHead className="text-[13px] uppercase font-black py-3 text-white tracking-wide">Team</TableHead>
                      <TableHead className="text-right text-[13px] uppercase font-black py-3 text-white tracking-wide">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.teams.map((t) => (
                      <TableRow key={t.id} className="border-primary/10">
                        <TableCell className="py-2">
                          {editingTeamId === t.id ? (
                            <Input value={tempTeamName} onChange={(e) => setTempTeamName(e.target.value)} className="h-8 text-sm bg-black/40" autoFocus onKeyDown={(e) => e.key === 'Enter' && saveTeamName()} />
                          ) : (
                            <span className="font-bold text-sm uppercase">{t.name}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-2">
                          {editingTeamId === t.id ? (
                            <Button onClick={saveTeamName} size="sm" className="h-8 text-xs bg-accent text-accent-foreground">Save</Button>
                          ) : (
                            <Button onClick={() => startEditingTeam(t.id, t.name)} variant="outline" size="sm" className="h-8 text-xs">Edit</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GameContent() {
  const { state, advanceWeek, setTactics, saveGame, swapPlayers, startMatch, clearCurrentMatch, quitToMainMenu, setLastView } = useGame();
  const [activeTab, setActiveTab] = useState<'HUB' | 'SQUAD' | 'WORLD' | 'MARKET' | 'CLUB'>('HUB');
  const [clubSubView, setClubSubView] = useState<'OFFICE' | 'STAFF' | 'FINANCE' | 'MANAGER' | 'RECORDS' | 'SETTINGS'>('OFFICE');
  const [worldSubView, setWorldSubView] = useState<'TABLE' | 'STATS' | 'FIXTURES'>('TABLE');
  const [viewingDiv, setViewingDiv] = useState<number>(1);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const [openToTab, setOpenToTab] = useState<'overview' | 'contract' | null>(null);
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);
  const [showMatchDayScreen, setShowMatchDayScreen] = useState(false);
  const restoredLastViewRef = useRef(false);

  useEffect(() => {
    if (!state.isGameStarted || !state.lastView || restoredLastViewRef.current) return;
    restoredLastViewRef.current = true;
    setActiveTab(state.lastView!.activeTab);
    setClubSubView(state.lastView!.clubSubView);
    setWorldSubView(state.lastView!.worldSubView);
    const d = state.lastView!.viewingDiv;
    if (d >= 1 && d <= 4) setViewingDiv(d);
  }, [state.isGameStarted, state.lastView]);

  useEffect(() => { if (state.userTeamId && !state.lastView) { const ut = state.teams.find(t => t.id === state.userTeamId); if (ut) setViewingDiv(ut.division); } }, [state.userTeamId, state.teams, state.lastView]);

  const goToTab = useCallback((tab: 'HUB' | 'SQUAD' | 'WORLD' | 'MARKET' | 'CLUB') => {
    setActiveTab(tab);
    setLastView({ activeTab: tab, clubSubView, worldSubView, viewingDiv });
  }, [clubSubView, worldSubView, viewingDiv, setLastView]);

  const goToClubSubView = useCallback((sub: 'OFFICE' | 'STAFF' | 'FINANCE' | 'MANAGER' | 'RECORDS' | 'SETTINGS') => {
    setClubSubView(sub);
    setLastView({ activeTab, clubSubView: sub, worldSubView, viewingDiv });
  }, [activeTab, worldSubView, viewingDiv, setLastView]);

  const goToWorldSubView = useCallback((sub: 'TABLE' | 'STATS' | 'FIXTURES') => {
    setWorldSubView(sub);
    setLastView({ activeTab, clubSubView, worldSubView: sub, viewingDiv });
  }, [activeTab, clubSubView, viewingDiv, setLastView]);

  const goToViewingDiv = useCallback((div: number) => {
    setViewingDiv(div);
    setLastView({ activeTab, clubSubView, worldSubView, viewingDiv: div });
  }, [activeTab, clubSubView, worldSubView, setLastView]);

  const currentWeekNews = useMemo(() => state.messages.filter(m => m.week === state.currentWeek), [state.messages, state.currentWeek]);
  const handlePlayerSwapInteraction = (pId: string) => { if (!swapSourceId) { setSwapSourceId(pId); } else { if (swapSourceId === pId) { setSwapSourceId(null); } else { swapPlayers(swapSourceId, pId); setSwapSourceId(null); } } };

  if (!state.isGameStarted || !state.userTeamId) return <StartMenu />;
  if (state.isSeasonOver) return <SeasonSummary />;

  const userTeam = state.teams.find(t => t.id === state.userTeamId)!;
  const userPlayers = state.players.filter(p => p.clubId === state.userTeamId);
  const nextFixture = state.fixtures.find(f => f.week === state.currentWeek && (f.homeTeamId === userTeam.id || f.awayTeamId === userTeam.id));
  const isLineupValid = userTeam.lineup.length >= 11;
  const matchFixture = state.currentMatchFixtureId ? state.fixtures.find(f => f.id === state.currentMatchFixtureId) : null;

  if (matchFixture) {
    const homeTeam = state.teams.find(t => t.id === matchFixture.homeTeamId)!;
    const awayTeam = state.teams.find(t => t.id === matchFixture.awayTeamId)!;
    return (
      <MatchSim fixture={matchFixture} homeTeam={homeTeam} awayTeam={awayTeam} onFinish={() => { advanceWeek(); clearCurrentMatch(); goToTab('HUB'); }} />
    );
  }

  const currentWeekFixtures = state.fixtures.filter(f => f.week === state.currentWeek && f.division === userTeam.division).sort((a, b) => a.homeTeamId.localeCompare(b.homeTeamId));

  return (
    <div className="game-app-shell w-full flex flex-col min-h-screen h-screen max-w-screen-2xl mx-auto border-x-4 border-primary/20 bg-transparent font-mono">
      {state.isFired && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500">
          <RetroWindow title="TERMINATION OF CONTRACT" className="max-w-xl w-full border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)] bg-black/90">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-red-500 animate-pulse">
                <ShieldAlert size={40} className="text-red-500" />
              </div>
              <h2 className="text-3xl font-black text-red-500 uppercase tracking-tighter italic">You have been sacked!</h2>
              <p className="text-lg text-white font-bold leading-tight uppercase tracking-tight opacity-90">The board has terminated your contract following a period of unacceptable results.</p>
              <div className="pt-4 border-t-2 border-white/10">
                <p className="text-xs text-muted-foreground uppercase mb-4">You must find a new position to continue your career.</p>
                <Button
                  onClick={() => { goToTab('CLUB'); goToClubSubView('MANAGER'); }}
                  className="w-full h-16 bg-accent text-accent-foreground font-black text-xl uppercase tracking-widest rounded-xl shadow-2xl hover:scale-105 transition-transform"
                >
                  Enter Job Market
                </Button>
              </div>
            </div>
          </RetroWindow>
        </div>
      )}
      {showMatchDayScreen && (
        <div className="match-day-overlay fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-stretch p-0 animate-in fade-in duration-200">
          <div className="match-day-modal w-full max-w-3xl max-h-[100vh] flex flex-col bg-black/80 border-2 sm:border-4 border-primary/40 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden mx-auto sm:my-auto">
            <div className="bg-primary text-primary-foreground px-2 sm:px-4 py-2 sm:py-0.5 flex justify-between items-center shrink-0 min-h-[3rem] sm:min-h-[2.5rem]">
              <h2 className="text-xl sm:text-xl font-black uppercase tracking-widest truncate">Match day — Week {state.currentWeek}</h2>
              <Button variant="outline" size="sm" className="border-white/50 text-white hover:bg-white/10 h-9 sm:h-9 font-black uppercase shrink-0 text-sm sm:text-sm px-3 sm:px-3" onClick={() => setShowMatchDayScreen(false)}>Back</Button>
            </div>
            <div className="match-day-list py-2 px-2 sm:py-1 sm:px-4 space-y-2 sm:space-y-2 flex-1 min-h-0 overflow-auto">
              {currentWeekFixtures.length === 0 ? (
                <p className="text-center text-muted-foreground font-black uppercase py-4 sm:py-4 text-sm max-[1300px]:text-lg">No fixtures this week</p>
              ) : (
                currentWeekFixtures.map(f => {
                  const home = state.teams.find(t => t.id === f.homeTeamId);
                  const away = state.teams.find(t => t.id === f.awayTeamId);
                  const isUserFixture = f.homeTeamId === userTeam.id || f.awayTeamId === userTeam.id;
                  const canPlay = isUserFixture && !f.result && isLineupValid;
                  return (
                    <div key={f.id} className={cn("flex items-center gap-2 sm:gap-3 p-3 sm:p-3 rounded-xl sm:rounded-xl border-2", isUserFixture ? "bg-accent/10 border-accent/50" : "bg-white/5 border-white/10")}>
                      <span className="w-12 text-center font-black text-muted-foreground tabular-nums text-base max-[1300px]:text-xl">{f.week}</span>
                      <span className={cn("flex-1 min-w-0 font-black uppercase text-right truncate text-sm sm:text-base max-[1300px]:text-xl", f.homeTeamId === userTeam.id && "text-accent")}>{home?.name}</span>
                      <span className="text-center font-black text-lg sm:text-lg w-10 sm:w-14 shrink-0 max-[1300px]:text-2xl">{f.result ? `${f.result.homeGoals}-${f.result.awayGoals}` : 'v'}</span>
                      <span className={cn("flex-1 min-w-0 font-black uppercase text-left truncate text-sm sm:text-base max-[1300px]:text-xl", f.awayTeamId === userTeam.id && "text-accent")}>{away?.name}</span>
                      {isUserFixture && !f.result && (
                        <Button onClick={() => { startMatch(f.id); setShowMatchDayScreen(false); }} disabled={!isLineupValid} className="h-10 sm:h-10 px-4 sm:px-4 text-base sm:text-base bg-accent text-accent-foreground font-black uppercase shrink-0 rounded-lg sm:rounded-lg hover:scale-105 transition-transform"><PlayCircle size={18} className="mr-1.5 sm:mr-1.5" /> Play</Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            {!isLineupValid && nextFixture && (
              <div className="px-2 sm:px-4 py-0.5 shrink-0 text-center text-amber-400 text-[11px] sm:text-sm font-black uppercase">Pick at least 11 players in Squad before playing.</div>
            )}
          </div>
        </div>
      )}
      <div className="game-header max-lg:hidden bg-primary text-primary-foreground py-1.5 px-3 sm:py-2 sm:px-6 flex justify-between items-center shrink-0 border-b-2 border-black/40 shadow-lg z-50">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-base sm:text-lg font-black tracking-tighter uppercase leading-none italic drop-shadow-md truncate">Retro Manager</span>
          <span className="text-[10px] sm:text-[11px] opacity-90 font-black whitespace-nowrap">STATION OS v1.0</span>
        </div>
        <Link href="/" className="text-[11px] font-black uppercase text-primary-foreground/80 hover:text-white transition-colors">← Landing</Link>
      </div>

      <main className="flex-1 min-h-0 overflow-auto scrollbar-none pb-24 sm:pb-28 pt-4 px-2 md:px-5">
        {activeTab === 'HUB' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1 py-3 md:p-4">
            <div className="hub-identity-card retro-tile flex flex-col bg-black/30 backdrop-blur-xl border-2 border-primary/40 p-4 rounded-2xl shadow-2xl h-fit">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b-2 border-primary/10 pb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h3 className="text-[12px] sm:text-[14px] max-[1300px]:text-[18px] font-black text-primary uppercase shrink-0 max-[1300px]:hidden">Team Identity:</h3>
                  <span className="text-lg sm:text-xl max-[1300px]:text-[24px] font-black text-white uppercase tracking-tight italic truncate">{userTeam.name}</span>
                </div>
                <span className="text-[11px] max-[1300px]:text-[16px] bg-black/60 px-3 py-1 rounded-full font-black border border-white/10 uppercase shrink-0">Season {state.season}</span>
              </div>
              <div className="hub-stats-grid grid grid-cols-2 lg:grid-cols-4 gap-2 min-w-0">
                <TooltipProvider>
                  <Tooltip><TooltipTrigger asChild><div className="bg-black/40 p-2.5 max-[1300px]:p-4 rounded-xl border border-white/5 min-w-0"><div className="text-[9px] sm:text-[10px] max-[1300px]:text-[14px] font-black text-muted-foreground uppercase mb-0.5">Week</div><div className="text-lg sm:text-xl max-[1300px]:text-[24px] font-black text-accent tabular-nums">{state.currentWeek}</div></div></TooltipTrigger><TooltipPortal><TooltipContent className="font-black">CURRENT MATCH WEEK (38 TOTAL)</TooltipContent></TooltipPortal></Tooltip>
                </TooltipProvider>
                <div className="bg-black/40 p-2.5 max-[1300px]:p-4 rounded-xl border border-white/5 min-w-0"><div className="text-[9px] sm:text-[10px] max-[1300px]:text-[14px] font-black text-muted-foreground uppercase mb-0.5">Board Confidence</div><div className={`text-lg sm:text-xl max-[1300px]:text-[24px] font-black ${state.boardConfidence > 50 ? 'text-green-500' : 'text-red-500'}`}>{state.boardConfidence}%</div></div>
                <div className="bg-black/40 p-2.5 max-[1300px]:p-4 rounded-xl border border-white/5 min-w-0"><div className="text-[9px] sm:text-[10px] max-[1300px]:text-[14px] font-black text-muted-foreground uppercase mb-0.5">League Points</div><div className="text-lg sm:text-xl max-[1300px]:text-[24px] font-black text-accent">{userTeam.points} PTS</div></div>
                <TooltipProvider>
                  <Tooltip><TooltipTrigger asChild><div className="bg-black/40 p-2.5 max-[1300px]:p-4 rounded-xl border border-white/5 min-w-0"><div className="text-[9px] sm:text-[10px] max-[1300px]:text-[14px] font-black text-muted-foreground uppercase mb-0.5">Balance</div><div className="text-base sm:text-lg max-[1300px]:text-[22px] font-black text-white tabular-nums truncate">{formatMoney(userTeam.budget)}</div></div></TooltipTrigger><TooltipPortal><TooltipContent className="font-black">TOTAL CLUB CAPITAL</TooltipContent></TooltipPortal></Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="hub-division-card retro-tile bg-black/30 border-2 border-primary/40 p-3 max-[1300px]:p-5 rounded-2xl shadow-2xl">
              <h3 className="text-[13px] max-[1300px]:text-[18px] font-black text-primary uppercase mb-2 border-b-2 border-primary/10 pb-1.5">Division {userTeam.division} Snapshot</h3>
              <div className="space-y-2 max-[1300px]:space-y-4">
                {state.teams.filter(t => t.division === userTeam.division).slice(0, 3).map((t, i) => (
                  <div key={t.id} className={`flex justify-between items-center py-2 px-4 max-[1300px]:py-3 max-[1300px]:px-6 rounded-xl border ${t.id === userTeam.id ? 'bg-accent/10 border-accent text-accent font-black' : 'bg-black/20 border-white/5'}`}>
                    <span className="text-[16px] max-[1300px]:text-[18px] uppercase font-black truncate min-w-0 flex-1">{i + 1}. {t.name}</span>
                    <span className="font-black text-[16px] max-[1300px]:text-[18px] whitespace-nowrap shrink-0 ml-4">{t.points} PTS</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="retro-tile col-span-1 md:col-span-2 bg-primary/5 border-2 border-primary/40 p-4 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2 sm:mb-4 border-b border-primary/30 pb-1.5 sm:pb-2">
                <h3 className="text-xs sm:text-[14px] max-[1300px]:text-[20px] font-black text-primary uppercase tracking-widest">Next Fixture Intel</h3>
                <span className="text-[10px] sm:text-[12px] max-[1300px]:text-[18px] font-black text-muted-foreground tabular-nums">WEEK {state.currentWeek}</span>
              </div>
              {nextFixture ? (
                <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-4 md:gap-10">
                  <div className="flex-1 flex justify-center items-center gap-4 sm:gap-4 md:gap-6 min-w-0 py-2 sm:py-1">
                    <span className="text-base sm:text-lg md:text-xl lg:text-3xl font-black uppercase text-white truncate text-right flex-1 min-w-0 tracking-tighter">{state.teams.find(t => t.id === nextFixture.homeTeamId)?.name}</span>
                    <div className="bg-primary/20 px-3 py-1 sm:px-3 sm:py-1 md:px-4 md:py-1.5 rounded-lg sm:rounded-lg md:rounded-xl border border-primary/40 sm:border-2 font-black text-primary text-sm sm:text-sm md:text-base shrink-0">VS</div>
                    <span className="text-base sm:text-lg md:text-xl lg:text-3xl font-black uppercase text-white truncate text-left flex-1 min-w-0 tracking-tighter">{state.teams.find(t => t.id === nextFixture.awayTeamId)?.name}</span>
                  </div>
                  <Button onClick={() => startMatch(nextFixture.id)} disabled={!isLineupValid} className="w-full sm:w-auto sm:max-w-[25%] md:w-56 md:max-w-none h-12 sm:h-9 md:h-14 max-[1300px]:h-24 bg-accent text-accent-foreground retro-button font-black text-base md:text-xl max-[1300px]:text-[28px] rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl hover:scale-[1.05] transition-transform animate-pulse shrink-0 px-4 md:px-4"><PlayCircle size={24} className="mr-2 md:mr-2 w-6 h-6 md:w-8 md:h-8 shrink-0 inline-block md:block" /> PLAY MATCH</Button>
                </div>
              ) : <div className="text-base sm:text-xl max-[1300px]:text-3xl font-black text-muted-foreground uppercase italic py-4 sm:py-8 tracking-[0.3em]">Season Concluded</div>}
            </div>
            <div className="retro-tile col-span-1 md:col-span-2 bg-black/30 border-2 border-primary/40 p-4 rounded-2xl shadow-2xl">
              <h3 className="text-[14px] max-[1300px]:text-[20px] font-black text-primary uppercase mb-3 border-b-2 border-primary/10 pb-1.5">Weekly Headlines</h3>
              <div className="headlines-scroll space-y-3 max-[1300px]:space-y-5 max-h-[220px] max-[1300px]:max-h-[400px] overflow-auto custom-scrollbar pr-2">
                {currentWeekNews.length > 0 ? currentWeekNews.map(m => {
                  const bid = m.bidId ? state.transferMarket.incomingBids.find(b => b.id === m.bidId) : null;
                  const offerPlayer = bid ? state.players.find(p => p.id === bid.playerId) : null;
                  return (
                    <div key={m.id} className="p-4 max-[1300px]:p-6 border-l-8 border-primary bg-primary/10 rounded-r-2xl">
                      <span className="font-black block text-primary uppercase mb-1 text-[18px] max-[1300px]:text-[24px] italic underline">{m.title}</span>
                      <span className="text-white text-[16px] max-[1300px]:text-[20px] font-bold leading-tight line-clamp-3">{getMessageDisplayContent(m, id => state.teams.find(t => t.id === id)?.name ?? 'Unknown')}</span>
                      {offerPlayer && (
                        <Button onClick={(e) => { e.stopPropagation(); setViewingPlayer(offerPlayer); setOpenToTab('contract'); }} variant="outline" size="sm" className="mt-2 h-9 max-[1300px]:h-12 text-[11px] max-[1300px]:text-[16px] font-black uppercase border-primary/50 bg-primary/10 hover:bg-primary/30 text-primary rounded-lg">View contract</Button>
                      )}
                    </div>
                  );
                }) : <div className="text-center py-12 text-muted-foreground uppercase font-black opacity-40 italic tracking-[0.2em] max-[1300px]:text-xl">Silent week in the football world.</div>}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'SQUAD' && (
          <div className="p-4 max-md:px-1 max-md:py-3 space-y-6 bg-black/40 rounded-2xl border border-primary/10">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/85 h-16 border-2 border-primary/25 rounded-2xl p-1 gap-1"><TabsTrigger value="list" className="text-lg uppercase font-black rounded-xl data-[state=active]:bg-primary">Squad Selection</TabsTrigger><TabsTrigger value="tactics" className="text-lg uppercase font-black rounded-xl data-[state=active]:bg-primary">Tactical Hub</TabsTrigger></TabsList>
              <TabsContent value="list" className="m-0 pt-4"><SquadList players={userPlayers} onPlayerSwap={handlePlayerSwapInteraction} activeSwapId={swapSourceId} /></TabsContent>
              <TabsContent value="tactics" className="m-0 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
                  <RetroWindow title="PITCH COMMAND" noPadding className="rounded-2xl shadow-2xl bg-black/60"><div className="flex justify-center py-6 max-[1300px]:py-2"><TacticsPitch team={userTeam} players={userPlayers} onPlayerClick={(p) => handlePlayerSwapInteraction(p.id)} onPlayerProfile={(p) => setViewingPlayer(p)} activeSwapId={swapSourceId} /></div></RetroWindow>
                  <RetroWindow title="STRATEGY ENGINE" className="rounded-2xl shadow-2xl bg-black/60">
                    <div className="space-y-10 py-6 px-4">
                      <div className="space-y-4"><h4 className="text-[16px] font-black text-primary uppercase border-b-2 border-primary/20 pb-2">Core Formation</h4><div className="grid grid-cols-2 gap-3">{['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-5-1'].map(f => (<Button key={f} onClick={() => setTactics(f, userTeam.playStyle)} className={cn("h-16 text-2xl font-black rounded-xl", userTeam.formation === f ? "bg-accent text-accent-foreground border-accent shadow-xl" : "bg-black/70 text-white border-primary/20")}>{f}</Button>))}</div></div>
                      <div className="space-y-4"><h4 className="text-[16px] font-black text-primary uppercase border-b-2 border-primary/20 pb-2">Team Mentality</h4><div className="grid grid-cols-2 gap-3">{(['Long Ball', 'Pass to Feet', 'Counter-Attack', 'Tiki-Taka', 'Direct', 'Park the Bus'] as PlayStyle[]).map(s => (<Button key={s} onClick={() => setTactics(userTeam.formation, s)} className={cn("h-16 text-[16px] font-black uppercase rounded-xl leading-tight px-2 text-center", userTeam.playStyle === s ? "bg-accent text-accent-foreground border-accent shadow-xl" : "bg-black/70 text-white border-primary/20")}>{s}</Button>))}</div></div>
                    </div>
                  </RetroWindow>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        {activeTab === 'WORLD' && (
          <div className="p-4 max-md:px-1 max-md:py-3 space-y-6">
            <div className="bg-black/70 p-2 border-2 border-primary/20 flex gap-2 rounded-2xl shadow-inner">{[1, 2, 3, 4].map(div => (<Button key={div} onClick={() => goToViewingDiv(div)} className={cn("flex-1 h-12 max-[1300px]:h-16 text-lg max-[1300px]:text-[22px] font-black uppercase rounded-xl transition-all", viewingDiv === div ? "bg-primary text-primary-foreground shadow-lg" : "bg-transparent text-white hover:bg-white/10")}>DIV {div}</Button>))}</div>
            <div className="flex gap-3"><Button onClick={() => goToWorldSubView('TABLE')} className={cn("h-14 max-[1300px]:h-20 text-lg max-[1300px]:text-[24px] font-black flex-1 rounded-xl uppercase tracking-widest transition-all text-white", worldSubView === 'TABLE' ? 'bg-primary shadow-lg' : 'bg-black/70 border-2 border-primary/20')}>Standings</Button><Button onClick={() => goToWorldSubView('STATS')} className={cn("h-14 max-[1300px]:h-20 text-lg max-[1300px]:text-[24px] font-black flex-1 rounded-xl uppercase tracking-widest transition-all text-white", worldSubView === 'STATS' ? 'bg-primary shadow-lg' : 'bg-black/70 border-2 border-primary/20')}>Player Stats</Button><Button onClick={() => goToWorldSubView('FIXTURES')} className={cn("h-14 max-[1300px]:h-20 text-lg max-[1300px]:text-[24px] font-black flex-1 rounded-xl uppercase tracking-widest transition-all text-white", worldSubView === 'FIXTURES' ? 'bg-primary shadow-lg' : 'bg-black/70 border-2 border-primary/20')}>Fixtures</Button></div>
            {worldSubView === 'TABLE' && <RetroWindow title={`DIV ${viewingDiv} LEAGUE STANDINGS`} noPadding className="bg-black/60 rounded-2xl shadow-2xl"><LeagueTable teams={state.teams.filter(t => t.division === viewingDiv)} onTeamClick={tId => setViewingTeam(state.teams.find(tx => tx.id === tId) || null)} /></RetroWindow>}
            {worldSubView === 'STATS' && <StatsHub division={viewingDiv} />}
            {worldSubView === 'FIXTURES' && (
              <RetroWindow title={`DIV ${viewingDiv} FIXTURES`} noPadding className="bg-black/60 rounded-2xl shadow-2xl">
                <Table><TableHeader><TableRow className="bg-primary/25 border-b-2 border-primary/40"><TableHead className="w-16 text-[13px] font-black uppercase text-white tracking-wide py-4">Wk</TableHead><TableHead className="text-[13px] font-black uppercase text-white tracking-wide py-4">Home</TableHead><TableHead className="text-center text-[13px] font-black uppercase text-white tracking-wide py-4">Res</TableHead><TableHead className="text-right text-[13px] font-black uppercase text-white tracking-wide py-4">Away</TableHead><TableHead className="w-24 text-[13px] font-black uppercase text-white tracking-wide py-4 text-center">Play</TableHead></TableRow></TableHeader><TableBody>{state.fixtures.filter(f => f.division === viewingDiv).sort((a, b) => a.week - b.week).map(f => {
                  const h = state.teams.find(t => t.id === f.homeTeamId); const a = state.teams.find(t => t.id === f.awayTeamId);
                  const isUserFixture = f.homeTeamId === userTeam.id || f.awayTeamId === userTeam.id;
                  const canPlay = isUserFixture && f.week === state.currentWeek && !f.result && isLineupValid;
                  return (<TableRow key={f.id} className="border-b border-white/5 hover:bg-white/5"><TableCell className="font-black text-lg tabular-nums opacity-60">{f.week}</TableCell><TableCell className={cn("font-black text-lg uppercase", f.homeTeamId === userTeam.id ? "text-accent" : "text-white")}>{h?.name}</TableCell><TableCell className="text-center font-black text-xl tabular-nums">{f.result ? `${f.result.homeGoals}-${f.result.awayGoals}` : 'v'}</TableCell><TableCell className={cn("text-right font-black text-lg uppercase", f.awayTeamId === userTeam.id ? "text-accent" : "text-white")}>{a?.name}</TableCell><TableCell className="text-center">{canPlay ? <Button size="sm" onClick={() => startMatch(f.id)} className="h-8 px-3 bg-accent text-accent-foreground font-black text-xs uppercase rounded-lg"><PlayCircle size={14} className="mr-1" />Play</Button> : null}</TableCell></TableRow>);
                })}</TableBody></Table>
              </RetroWindow>
            )}
          </div>
        )}
        {activeTab === 'MARKET' && <div className="p-4 max-md:px-1 max-md:py-3 h-full"><RetroWindow title="GLOBAL TRANSFER DATABASE" className="bg-black/20 rounded-2xl shadow-2xl"><PlayerMarket /></RetroWindow></div>}
        {activeTab === 'CLUB' && (
          <div className="p-4 max-md:px-1 max-md:py-3 space-y-6">
            {clubSubView === 'OFFICE' ? (
              <div className="grid grid-cols-2 gap-6 max-md:gap-3 auto-rows-fr">
                <button onClick={() => goToClubSubView('MANAGER')} className="retro-tile flex flex-col items-center justify-center gap-6 max-[1300px]:gap-4 py-16 max-[1300px]:py-10 hover:bg-primary/20 bg-black/40 border-2 border-primary/30 rounded-3xl transition-all shadow-2xl group"><UserCircle size={72} className="text-primary group-hover:scale-110 transition-transform max-[1300px]:w-14 max-[1300px]:h-14" /><span className="text-2xl max-[1300px]:text-[22px] font-black uppercase text-white">Manager Profile</span></button>
                <button onClick={() => goToClubSubView('FINANCE')} className="retro-tile flex flex-col items-center justify-center gap-6 max-[1300px]:gap-4 py-16 max-[1300px]:py-10 hover:bg-accent/20 bg-black/40 border-2 border-primary/30 rounded-3xl transition-all shadow-2xl group"><DollarSign size={72} className="text-accent group-hover:scale-110 transition-transform max-[1300px]:w-14 max-[1300px]:h-14" /><span className="text-2xl max-[1300px]:text-[22px] font-black uppercase text-white">Financial Hub</span></button>
                <button onClick={() => goToClubSubView('STAFF')} className="retro-tile flex flex-col items-center justify-center gap-6 max-[1300px]:gap-4 py-16 max-[1300px]:py-10 hover:bg-primary/20 bg-black/40 border-2 border-primary/30 rounded-3xl transition-all shadow-2xl group"><Briefcase size={72} className="text-primary group-hover:scale-110 transition-transform max-[1300px]:w-14 max-[1300px]:h-14" /><span className="text-2xl max-[1300px]:text-[22px] font-black uppercase text-white">Staff Management</span></button>
                <button onClick={() => goToClubSubView('RECORDS')} className="retro-tile flex flex-col items-center justify-center gap-6 max-[1300px]:gap-4 py-16 max-[1300px]:py-10 hover:bg-yellow-500/20 bg-black/40 border-2 border-primary/30 rounded-3xl transition-all shadow-2xl group"><Trophy size={72} className="text-yellow-500 max-[1300px]:w-14 max-[1300px]:h-14" /><span className="text-2xl max-[1300px]:text-[22px] font-black uppercase text-white">Legacy & Records</span></button>
                <button onClick={() => goToClubSubView('SETTINGS')} className="retro-tile flex flex-col items-center justify-center gap-6 max-[1300px]:gap-4 py-16 max-[1300px]:py-10 border-2 border-white/10 hover:bg-white/10 bg-black/40 rounded-3xl transition-all shadow-2xl group"><Settings size={72} className="text-muted-foreground max-[1300px]:w-14 max-[1300px]:h-14" /><span className="text-2xl max-[1300px]:text-[22px] font-black uppercase text-white">OS Config</span></button>
                <button onClick={saveGame} className="retro-tile flex flex-col items-center justify-center gap-6 max-[1300px]:gap-4 py-16 max-[1300px]:py-10 border-4 border-accent/40 bg-accent/5 hover:bg-accent/20 rounded-3xl transition-all shadow-2xl group"><Save size={72} className="text-accent group-hover:animate-bounce max-[1300px]:w-14 max-[1300px]:h-14" /><span className="text-2xl max-[1300px]:text-[22px] font-black uppercase text-white">Commit Save</span></button>
                <Link href="/changelog" className="retro-tile flex flex-col items-center justify-center gap-6 max-[1300px]:gap-4 py-16 max-[1300px]:py-10 border-2 border-primary/20 hover:bg-primary/10 bg-black/40 rounded-3xl transition-all shadow-2xl group">
                  <History size={72} className="text-primary/60 group-hover:scale-110 transition-transform max-[1300px]:w-14 max-[1300px]:h-14" />
                  <span className="text-2xl max-[1300px]:text-[22px] font-black uppercase text-white">System Logs</span>
                </Link>
                <button onClick={quitToMainMenu} className="retro-tile flex flex-col items-center justify-center gap-6 max-[1300px]:gap-4 py-16 max-[1300px]:py-10 border-2 border-white/20 hover:bg-red-500/20 bg-black/40 rounded-3xl transition-all shadow-2xl group"><LogOut size={72} className="text-white/80 group-hover:text-red-400 transition-colors max-[1300px]:w-14 max-[1300px]:h-14" /><span className="text-2xl max-[1300px]:text-[22px] font-black uppercase text-white">Quit to Main Menu</span></button>
              </div>
            ) : (
              <div className="space-y-6"><Button variant="outline" onClick={() => goToClubSubView('OFFICE')} className="h-14 text-lg font-black mb-4 retro-button bg-black/60 px-10 border-2 border-primary/40 rounded-xl hover:bg-primary hover:text-white transition-all uppercase">← Return to Main Office</Button>
                {clubSubView === 'MANAGER' && <ManagerInfo />} {clubSubView === 'FINANCE' && <FinanceHub />} {clubSubView === 'STAFF' && <StaffManagement />} {clubSubView === 'RECORDS' && <TeamRecords />} {clubSubView === 'SETTINGS' && <SettingsHub />}
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="game-nav w-full fixed bottom-0 left-0 right-0 max-w-screen-2xl mx-auto bg-black/90 backdrop-blur-2xl border-t-4 border-primary/40 h-20 sm:h-24 max-[1300px]:h-32 flex items-stretch z-40 shadow-[0_-15px_40px_rgba(0,0,0,0.7)]">
        <TooltipProvider>
          <Tooltip><TooltipTrigger asChild><button onClick={() => goToTab('HUB')} className={cn("flex-1 flex flex-col items-center justify-center gap-2 transition-all", activeTab === 'HUB' ? 'text-accent bg-accent/10 border-t-8 max-[1300px]:border-t-[12px] border-accent' : 'text-white/90 hover:text-primary hover:bg-primary/5')}><LayoutDashboard size={36} className="max-[1300px]:w-14 max-[1300px]:h-14" /><span className="text-[12px] max-[1300px]:text-[18px] uppercase font-black tracking-widest">Dashboard</span></button></TooltipTrigger><TooltipPortal><TooltipContent className="font-black text-lg">HUB & NEWS</TooltipContent></TooltipPortal></Tooltip>
          <Tooltip><TooltipTrigger asChild><button onClick={() => goToTab('SQUAD')} className={cn("flex-1 flex flex-col items-center justify-center gap-2 transition-all", activeTab === 'SQUAD' ? 'text-accent bg-accent/10 border-t-8 max-[1300px]:border-t-[12px] border-accent' : 'text-white/90 hover:text-primary hover:bg-primary/5')}><Users size={36} className="max-[1300px]:w-14 max-[1300px]:h-14" /><span className="text-[12px] max-[1300px]:text-[18px] uppercase font-black tracking-widest">Team</span></button></TooltipTrigger><TooltipPortal><TooltipContent className="font-black text-lg">SQUAD & TACTICS</TooltipContent></TooltipPortal></Tooltip>
          <Tooltip><TooltipTrigger asChild><button onClick={() => goToTab('WORLD')} className={cn("flex-1 flex flex-col items-center justify-center gap-2 transition-all", activeTab === 'WORLD' ? 'text-accent bg-accent/10 border-t-8 max-[1300px]:border-t-[12px] border-accent' : 'text-white/90 hover:text-primary hover:bg-primary/5')}><Globe2 size={36} className="max-[1300px]:w-14 max-[1300px]:h-14" /><span className="text-[12px] max-[1300px]:text-[18px] uppercase font-black tracking-widest">World</span></button></TooltipTrigger><TooltipPortal><TooltipContent className="font-black text-lg">STANDINGS & FIXTURES</TooltipContent></TooltipPortal></Tooltip>
          <Tooltip><TooltipTrigger asChild><button onClick={() => goToTab('MARKET')} className={cn("flex-1 flex flex-col items-center justify-center gap-2 transition-all", activeTab === 'MARKET' ? 'text-accent bg-accent/10 border-t-8 max-[1300px]:border-t-[12px] border-accent' : 'text-white/90 hover:text-primary hover:bg-primary/5')}><Search size={36} className="max-[1300px]:w-14 max-[1300px]:h-14" /><span className="text-[12px] max-[1300px]:text-[18px] uppercase font-black tracking-widest">Market</span></button></TooltipTrigger><TooltipPortal><TooltipContent className="font-black text-lg">TRANSFER DATABASE</TooltipContent></TooltipPortal></Tooltip>
          <Tooltip><TooltipTrigger asChild><button onClick={() => goToTab('CLUB')} className={cn("flex-1 flex flex-col items-center justify-center gap-2 transition-all", activeTab === 'CLUB' ? 'text-accent bg-accent/10 border-t-8 max-[1300px]:border-t-[12px] border-accent' : 'text-white/90 hover:text-primary hover:bg-primary/5')}><Briefcase size={36} className="max-[1300px]:w-14 max-[1300px]:h-14" /><span className="text-[12px] max-[1300px]:text-[18px] uppercase font-black tracking-widest">Office</span></button></TooltipTrigger><TooltipPortal><TooltipContent className="font-black text-lg">CLUB MANAGEMENT</TooltipContent></TooltipPortal></Tooltip>
        </TooltipProvider>
      </nav>

      <TeamRoster team={viewingTeam} players={state.players.filter(p => p.clubId === viewingTeam?.id)} onClose={() => setViewingTeam(null)} onPlayerClick={(p) => setViewingPlayer(p)} />
      <PlayerProfile player={viewingPlayer} onClose={() => { setViewingPlayer(null); setOpenToTab(null); }} defaultTab={openToTab ?? 'overview'} key={viewingPlayer ? `${viewingPlayer.id}-${openToTab ?? 'o'}` : 'closed'} />
      <Toaster />
    </div>
  );
}

export default function GameApp() {
  return (
    <GameProvider>
      <TooltipProvider>
        <GameContent />
      </TooltipProvider>
    </GameProvider>
  );
}
