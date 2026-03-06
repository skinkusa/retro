"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { GameProvider, useGame } from '@/lib/store';
import { RetroWindow } from '@/components/game/RetroWindow';
import { SquadList } from '@/components/game/SquadList';
import { LeagueTable } from '@/components/game/LeagueTable';
import { MatchSim } from '@/components/game/MatchSim';
import { PreMatchFixturesScreen } from '@/components/game/PreMatchFixturesScreen';
import { PlayerMarket } from '@/components/game/PlayerMarket';
import { ManagerInfo } from '@/components/game/ManagerInfo';
import { StaffManagement } from '@/components/game/StaffManagement';
import { FinanceHub } from '@/components/game/FinanceHub';
import { StatsHub } from '@/components/game/StatsHub';
import { TeamRoster } from '@/components/game/TeamRoster';
import { PlayerProfile } from '@/components/game/PlayerProfile';
import { TeamRecords } from '@/components/game/TeamRecords';
import { OfficeSubViewTemplate } from '@/components/game/OfficeSubViewTemplate';
import { TacticsPitch, TacticsPitchView } from '@/components/game/TacticsPitch';
import { SettingsHub } from '@/components/game/SettingsHub';
import { SeasonSummary } from '@/components/game/SeasonSummary';
import { ClubCrest } from '@/components/game/ClubCrest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster } from '@/components/ui/toaster';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipPortal } from '@/components/ui/tooltip';
import { LayoutDashboard, Users, Trophy, PlayCircle, Search, Briefcase, DollarSign, UserCircle, Globe2, Save, FileUp, Settings, LogOut } from 'lucide-react';
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
    <div className="start-menu-shell min-h-screen flex items-center justify-center p-4 max-md:px-1 max-md:py-2 font-mono">
      <RetroWindow
        title="RETRO MANAGER OS v1.0"
        titleClassName="text-[8px]"
        contentClassName="p-3 md:p-3 max-md:px-2 max-md:py-2"
        className="max-w-7xl w-full max-md:max-w-[99%] bg-card/90 backdrop-blur-xl border-primary/40 shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="start-menu-grid grid grid-cols-1 md:grid-cols-2 gap-8 max-md:gap-3 py-6 px-6 max-md:py-3 max-md:px-2 md:py-10 md:px-8">
          <div className="space-y-6 max-md:space-y-3">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter text-primary border-b-8 border-primary/20 pb-2 md:pb-4 uppercase leading-none italic max-md:text-2xl max-md:pb-1">
              Retro Manager
            </h1>

            <div className="space-y-6 max-md:space-y-3">
              {hasSave && (
                <div className="p-6 bg-accent/10 border-2 border-accent space-y-4 shadow-[8px_8px_0px_0px_rgba(38,217,117,0.3)] rounded-2xl max-md:p-3 max-md:space-y-2">
                  <h2 className="text-[18px] font-black text-accent uppercase tracking-widest text-center max-md:text-sm">
                    Active Career Detected
                  </h2>
                  <Button
                    onClick={loadGame}
                    className="w-full h-20 bg-accent text-accent-foreground font-black retro-button flex items-center justify-center gap-4 hover:opacity-90 transition-all text-2xl rounded-xl shadow-lg max-md:h-12 max-md:text-base"
                  >
                    <FileUp size={32} />
                    CONTINUE CAREER
                  </Button>
                </div>
              )}

              <div className="space-y-4 max-md:space-y-2">
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="w-full h-14 border-primary/40 text-primary font-black retro-button flex items-center justify-center gap-2 hover:bg-primary/10 bg-black/20 text-xl rounded-xl uppercase max-md:h-10 max-md:text-sm"
                >
                  <Settings size={22} className="max-md:w-4 max-md:h-4" />
                  Database Editor
                </Button>
              </div>

              <div className="pt-4 max-md:pt-2 md:pt-8 border-t-4 border-primary/10 space-y-6 max-md:space-y-3">
                <div>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-black/40 border-primary/30 h-10 max-md:h-9 md:h-16 text-base max-md:text-sm md:text-3xl font-black rounded-xl uppercase px-3 md:px-6 w-full text-left"
                    placeholder="ENTER MANAGER NAME..."
                  />
                </div>

                <div>
                  <label className="text-[16px] max-md:text-xs uppercase text-muted-foreground block font-black tracking-widest mb-2 max-md:mb-1">
                    Management Philosophy
                  </label>
                  <Select value={personality} onValueChange={(v: any) => setPersonality(v)}>
                    <SelectTrigger className="bg-black/40 border-primary/30 h-16 max-md:h-10 text-xl max-md:text-sm font-black rounded-xl uppercase px-6 max-md:px-3 w-full justify-start">
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
                  <div className="mt-4 p-5 bg-primary/10 border-2 border-primary/20 rounded-2xl shadow-inner max-md:mt-2 max-md:p-3 max-md:rounded-lg">
                    <p className="text-[18px] max-md:text-xs text-primary leading-tight font-black italic">
                      * {getPhilosophyDescription(personality)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 max-md:space-y-3">
            <div className="flex justify-between items-end border-b-4 border-primary/10 pb-3 max-md:pb-1 gap-2">
              <h2 className="text-xl max-md:text-sm font-black uppercase text-primary tracking-widest">
                Select Club
              </h2>

              <Select value={selectedDiv.toString()} onValueChange={(v) => { setSelectedDiv(parseInt(v)); setSelectedTeam(null); }}>
                <SelectTrigger className="h-12 max-md:h-9 w-48 max-md:w-28 text-[18px] max-md:text-xs font-black bg-black/40 border-primary/30 rounded-xl">
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

            <div className="max-h-[450px] max-md:max-h-[40vh] overflow-auto border-4 border-primary/20 p-2 max-md:p-1 bg-black/40 backdrop-blur-sm rounded-2xl shadow-inner custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {state.teams.filter(t => t.division === selectedDiv).map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTeam(t.id)}
                    className={cn(
                      "w-full text-left px-3 md:px-6 py-2 md:py-4 text-base max-md:text-sm md:text-xl border-4 border-transparent hover:bg-primary/20 transition-all flex justify-between items-center rounded-lg shadow-sm",
                      selectedTeam === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-black/20'
                    )}
                  >
                    <span className="font-black uppercase tracking-tight truncate min-w-0">{t.name}</span>
                    <span className="opacity-60 text-[14px] max-md:text-[10px] md:text-[16px] font-mono font-black shrink-0">
                      REP: {t.reputation}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              disabled={!name || !selectedTeam}
              onClick={() => startGame(name, selectedTeam!, personality)}
              className="w-full h-20 max-md:h-11 bg-primary text-primary-foreground font-black retro-button mt-6 uppercase tracking-[0.3em] text-3xl max-md:text-sm shadow-2xl hover:scale-[1.03] transition-transform rounded-2xl"
            >
              INITIALIZE CAREER
            </Button>
          </div>
        </div>
      </RetroWindow>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-3xl max-md:max-w-[98vw] max-md:max-h-[95dvh] max-md:p-2 max-h-[90vh] overflow-hidden flex flex-col bg-card border-primary/30">
          <DialogHeader className="max-md:pb-1 shrink-0">
            <DialogTitle className="text-primary font-black uppercase tracking-tight max-md:text-xs">
              Database Editor
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-md:space-y-2 overflow-auto flex-1 pr-1 max-md:pr-0.5 min-h-0">
            <div className="flex items-end gap-4 max-md:gap-2">
              <div className="flex-1 min-w-0 space-y-1">
                <label className="text-xs max-md:text-[10px] font-bold text-primary uppercase">
                  Starting season year (for new games)
                </label>
                <Input
                  type="number"
                  value={newSeason}
                  onChange={(e) => setNewSeason(e.target.value)}
                  className="bg-black/40 border-primary/20 h-10 max-md:h-8 max-md:text-sm font-mono"
                />
              </div>
              <Button
                onClick={handleSeasonChange}
                className="retro-button bg-accent text-accent-foreground h-10 max-md:h-8 px-6 max-md:px-3 font-bold max-md:text-xs shrink-0"
              >
                Update
              </Button>
            </div>

            <div>
              <h4 className="text-xs max-md:text-[10px] font-bold text-primary uppercase mb-2 max-md:mb-1">
                Team names (for new games)
              </h4>
              <div className="max-h-[300px] max-md:max-h-[45vh] overflow-auto border border-primary/20 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/20 border-b-2 border-primary/40">
                      <TableHead className="text-[13px] max-md:text-[10px] uppercase font-black py-3 max-md:py-1 text-white tracking-wide">
                        Team
                      </TableHead>
                      <TableHead className="text-right text-[13px] max-md:text-[10px] uppercase font-black py-3 max-md:py-1 text-white tracking-wide">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.teams.map((t) => (
                      <TableRow key={t.id} className="border-primary/10">
                        <TableCell className="py-2 max-md:py-1 max-md:text-xs">
                          {editingTeamId === t.id ? (
                            <Input
                              value={tempTeamName}
                              onChange={(e) => setTempTeamName(e.target.value)}
                              className="h-8 max-md:h-7 max-md:text-xs bg-black/40"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && saveTeamName()}
                            />
                          ) : (
                            <span className="font-bold text-sm max-md:text-xs uppercase truncate block">{t.name}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-2 max-md:py-1">
                          {editingTeamId === t.id ? (
                            <Button onClick={saveTeamName} size="sm" className="h-8 max-md:h-7 text-xs bg-accent text-accent-foreground">
                              Save
                            </Button>
                          ) : (
                            <Button onClick={() => startEditingTeam(t.id, t.name)} variant="outline" size="sm" className="h-8 max-md:h-7 text-xs">
                              Edit
                            </Button>
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
  const {
    state,
    advanceWeek,
    setTactics,
    saveGame,
    swapPlayers,
    startMatch,
    clearCurrentMatch,
    quitToMainMenu,
    setLastView
  } = useGame();

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
    setActiveTab(state.lastView.activeTab);
    setClubSubView(state.lastView.clubSubView);
    setWorldSubView(state.lastView.worldSubView);
    const d = state.lastView.viewingDiv;
    if (d >= 1 && d <= 4) setViewingDiv(d);
  }, [state.isGameStarted, state.lastView]);

  useEffect(() => {
    if (state.userTeamId && !state.lastView) {
      const ut = state.teams.find(t => t.id === state.userTeamId);
      if (ut) setViewingDiv(ut.division);
    }
  }, [state.userTeamId, state.teams, state.lastView]);

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

  const currentWeekNews = useMemo(
    () => state.messages.filter(m => m.week === state.currentWeek),
    [state.messages, state.currentWeek]
  );

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

  const userTeamOrNull =
    state.isGameStarted && state.userTeamId
      ? state.teams.find(t => t.id === state.userTeamId) ?? null
      : null;
  const divisionTeams = useMemo(
    () => (userTeamOrNull ? state.teams.filter(t => t.division === userTeamOrNull.division) : []),
    [state.teams, userTeamOrNull]
  );
  const userLeaguePosition = useMemo(() => {
    if (!userTeamOrNull || divisionTeams.length === 0) return 1;
    const sorted = [...divisionTeams].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.goalsFor - a.goalsAgainst;
      const gdB = b.goalsFor - b.goalsAgainst;
      return gdB - gdA;
    });
    return sorted.findIndex(t => t.id === userTeamOrNull.id) + 1;
  }, [divisionTeams, userTeamOrNull]);
  const divisionSnapshotRows = useMemo(() => {
    return [...divisionTeams]
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = a.goalsFor - a.goalsAgainst;
        const gdB = b.goalsFor - b.goalsAgainst;
        return gdB - gdA;
      })
      .slice(0, 4);
  }, [divisionTeams]);

  if (!state.isGameStarted || !state.userTeamId) return <StartMenu />;
  if (state.isSeasonOver) return <SeasonSummary />;

  const userTeam = state.teams.find(t => t.id === state.userTeamId)!;
  const userPlayers = state.players.filter(p => p.clubId === state.userTeamId);
  const nextFixture = state.fixtures.find(
    f => f.week === state.currentWeek && (f.homeTeamId === userTeam.id || f.awayTeamId === userTeam.id)
  );
  const isLineupValid = userTeam.lineup.filter((id): id is string => id != null && id !== '').length >= 11;
  const matchFixture = state.currentMatchFixtureId
    ? state.fixtures.find(f => f.id === state.currentMatchFixtureId)
    : null;

  if (matchFixture) {
    const homeTeam = state.teams.find(t => t.id === matchFixture.homeTeamId)!;
    const awayTeam = state.teams.find(t => t.id === matchFixture.awayTeamId)!;

    return (
      <MatchSim
        fixture={matchFixture}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        onFinish={() => {
          advanceWeek();
          clearCurrentMatch();
          goToTab('HUB');
        }}
      />
    );
  }

  const currentWeekFixtures = state.fixtures
    .filter(f => f.week === state.currentWeek && f.division === userTeam.division)
    .sort((a, b) => a.homeTeamId.localeCompare(b.homeTeamId));

  return (
    <div className="game-app-shell flex flex-col min-h-screen h-screen max-w-screen-2xl mx-auto border-x-4 border-primary/20 bg-transparent font-mono">
      {showMatchDayScreen && (
        <PreMatchFixturesScreen
          fixtures={currentWeekFixtures}
          userTeam={userTeam}
          getTeamName={(id) => state.teams.find((t) => t.id === id)?.name ?? 'Unknown'}
          isLineupValid={isLineupValid}
          currentWeek={state.currentWeek}
          onBack={() => setShowMatchDayScreen(false)}
          onPlayMatch={(fixtureId) => {
            startMatch(fixtureId);
            setShowMatchDayScreen(false);
          }}
        />
      )}

      <div className="game-header max-lg:hidden bg-[#0a1628] text-white py-2 px-4 sm:py-2.5 sm:px-6 flex justify-between items-center shrink-0 border-b-2 border-primary/50 shadow-lg z-50">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg sm:text-xl font-black tracking-tighter uppercase leading-none italic text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
            Retro Manager
          </span>
          <span className="text-[11px] sm:text-xs font-black text-white/80 tracking-[0.2em] uppercase">
            STATION OS v1.0
          </span>
        </div>
        <Link href="/" className="text-xs font-black uppercase text-white/70 hover:text-white transition-colors tracking-wider">
          ← Landing
        </Link>
      </div>

      <main
        className={cn(
          "flex-1 min-h-0 scrollbar-none pb-24 sm:pb-28 pt-3 max-md:pt-2 px-2 md:px-4 lg:px-5",
          activeTab === 'HUB' ? 'overflow-auto' : 'overflow-auto'
        )}
      >
        {activeTab === 'HUB' && (
          <div className="w-full max-w-screen-2xl mx-auto">
            <div className="hub-dashboard grid grid-cols-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(340px,1fr)] gap-3 md:gap-4 items-start">
              {/* LEFT COLUMN */}
              <div className="flex flex-col gap-3 md:gap-4 min-w-0 order-1">
                <section className="hub-club-panel retro-tile flex flex-col bg-black/40 backdrop-blur-xl border-2 border-primary/40 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-4 md:p-5 border-b border-white/10">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <span className="text-xs md:text-sm font-black text-primary uppercase tracking-widest block mb-0.5">
                          Info:
                        </span>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase tracking-tight truncate">
                          {userTeam.name}
                        </h2>
                      </div>
                      <span className="text-xs md:text-sm bg-black/60 px-3 py-1.5 rounded-lg font-black border border-white/10 uppercase shrink-0">
                        Season {state.season}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 md:p-5 flex flex-col sm:flex-row gap-4 md:gap-5">
                    <div className="shrink-0 mx-auto sm:mx-0 flex items-center justify-center w-20 h-[94px] md:w-24 md:h-[112px]">
                      <ClubCrest
                        teamName={userTeam.name}
                        primaryColor={userTeam.color}
                        secondaryColor={userTeam.awayColor}
                        width={96}
                        height={112}
                        className="w-full h-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="bg-black/60 border border-white/10 rounded-xl p-3 md:p-4">
                        <div className="text-[10px] sm:text-xs md:text-sm font-black text-white/80 uppercase mb-1">Week</div>
                        <div className="text-2xl md:text-3xl font-black text-accent tabular-nums">{state.currentWeek}</div>
                      </div>

                      <div className="bg-black/60 border border-white/10 rounded-xl p-3 md:p-4">
                        <div className="text-[10px] sm:text-xs md:text-sm font-black text-white/80 uppercase mb-1">
                          Board Confidence
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-3 md:h-4 bg-black/80 rounded-full overflow-hidden border border-white/10">
                            <div
                              className="h-full bg-primary rounded-full transition-all min-w-[2px]"
                              style={{ width: `${state.boardConfidence}%` }}
                            />
                          </div>
                          <span className={cn(
                            "text-base md:text-xl font-black tabular-nums",
                            state.boardConfidence > 50 ? 'text-green-500' : 'text-red-500'
                          )}>
                            {state.boardConfidence}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-black/60 border border-white/10 rounded-xl p-3 md:p-4">
                        <div className="text-[10px] sm:text-xs md:text-sm font-black text-white/80 uppercase mb-1">
                          League Position
                        </div>
                        <div className="text-2xl md:text-3xl font-black text-accent">
                          {userLeaguePosition}
                          {userLeaguePosition === 1 ? 'st' : userLeaguePosition === 2 ? 'nd' : userLeaguePosition === 3 ? 'rd' : 'th'}
                        </div>
                      </div>

                      <div className="bg-black/60 border border-white/10 rounded-xl p-3 md:p-4">
                        <div className="text-[10px] sm:text-xs md:text-sm font-black text-white/80 uppercase mb-1">Balance</div>
                        <div className="text-sm sm:text-base md:text-xl font-black text-white tabular-nums truncate">
                          {formatMoney(userTeam.budget)}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="hub-next-match retro-tile bg-black/50 border-2 border-primary/40 rounded-2xl shadow-2xl overflow-hidden order-1 xl:order-none">
                  <div className="p-4 md:p-6">
                    <h3 className="text-sm md:text-base font-black text-primary uppercase tracking-widest mb-4 md:mb-6">
                      Next Match
                    </h3>

                    {nextFixture ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6 mb-4 md:mb-6">
                          <div className="min-w-0 flex items-center justify-center py-3 md:py-4 px-4 md:px-5 rounded-xl bg-primary/20 border border-primary/30">
                            <span className="text-lg sm:text-xl md:text-2xl font-black uppercase text-white truncate">
                              {state.teams.find(t => t.id === nextFixture.homeTeamId)?.name}
                            </span>
                          </div>

                          <div className="vs-box shrink-0 bg-primary/30 px-4 py-2 md:px-6 md:py-3 rounded-xl border-2 border-primary/50 font-black text-primary text-lg md:text-2xl justify-self-center">
                            VS
                          </div>

                          <div className="min-w-0 flex items-center justify-center py-3 md:py-4 px-4 md:px-5 rounded-xl bg-primary/20 border border-primary/30">
                            <span className="text-lg sm:text-xl md:text-2xl font-black uppercase text-white truncate">
                              {state.teams.find(t => t.id === nextFixture.awayTeamId)?.name}
                            </span>
                          </div>
                        </div>

                        <p className="text-center text-xs md:text-sm text-white/80 font-bold mb-5 md:mb-6 leading-relaxed">
                          Venue: {state.teams.find(t => t.id === nextFixture.homeTeamId)?.name ?? 'Home'} Stadium • Attendance: 42,000 expected
                        </p>

                        <div className="flex justify-center">
                          <Button
                            onClick={() => nextFixture && startMatch(nextFixture.id)}
                            disabled={!isLineupValid}
                            className="h-12 md:h-16 px-6 md:px-12 bg-accent text-accent-foreground retro-button font-black text-base md:text-2xl rounded-xl shadow-xl hover:scale-[1.03] transition-transform border-2 border-accent/50"
                          >
                            <PlayCircle size={22} className="mr-2 md:mr-3 inline-block" />
                            PLAY MATCH
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 md:py-12 text-white/90 font-black text-lg md:text-2xl uppercase italic tracking-widest">
                        Season Concluded
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN: Headlines then Division Snapshot */}
              <div className="flex flex-col gap-3 md:gap-4 min-w-0 order-2">
                <section className="hub-headlines retro-tile bg-black/40 border-2 border-primary/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[200px] xl:min-h-0 xl:flex-1">
                  <div className="p-4 md:p-5 border-b border-white/10 shrink-0">
                    <h3 className="text-sm md:text-base font-black text-primary uppercase tracking-widest">
                      Weekly Headlines
                    </h3>
                  </div>

                  <div className="p-4 md:p-5 space-y-3 md:space-y-4 flex-1 min-h-0 overflow-auto custom-scrollbar pr-2">
                  {currentWeekNews.length > 0 ? currentWeekNews.map(m => {
                    const bid = m.bidId ? state.transferMarket.incomingBids.find(b => b.id === m.bidId) : null;
                    const offerPlayer = bid ? state.players.find(p => p.id === bid.playerId) : null;

                    return (
                      <div key={m.id} className="flex gap-3 p-3 md:p-4 border-l-4 border-primary bg-primary/10 rounded-r-xl">
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <span className="font-black block text-primary uppercase mb-1 text-sm md:text-lg">
                            {m.title}
                          </span>
                          <span className="text-white text-xs sm:text-sm md:text-base font-bold leading-snug block">
                            {getMessageDisplayContent(m, id => state.teams.find(t => t.id === id)?.name ?? 'Unknown')}
                          </span>

                          {offerPlayer && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingPlayer(offerPlayer);
                                setOpenToTab('contract');
                              }}
                              variant="outline"
                              size="sm"
                              className="mt-2 h-9 text-xs font-black uppercase border-primary/50 bg-primary/10 hover:bg-primary/30 text-primary rounded-lg"
                            >
                              View contract
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="text-center py-10 text-white/70 uppercase font-black text-sm md:text-base italic tracking-widest">
                      Silent week in the football world.
                    </div>
                  )}
                </div>
              </section>

                <section className="hub-division-panel retro-tile bg-black/40 border-2 border-primary/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col min-w-0 shrink-0">
                  <div className="p-3 md:p-4 border-b border-white/10 shrink-0">
                    <h3 className="text-sm md:text-base font-black text-primary uppercase tracking-widest">
                      Division {userTeam.division} Snapshot
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b-2 border-primary/40 bg-primary/20 hover:bg-primary/20">
                          <TableHead className="text-[10px] md:text-xs font-black uppercase text-white/90 w-8 py-2 md:py-3">#</TableHead>
                          <TableHead className="text-[10px] md:text-xs font-black uppercase text-white/90 py-2 md:py-3">Team</TableHead>
                          <TableHead className="text-[10px] md:text-xs font-black uppercase text-white/90 w-8 py-2 md:py-3 text-center">P</TableHead>
                          <TableHead className="text-[10px] md:text-xs font-black uppercase text-white/90 w-8 py-2 md:py-3 text-center">W</TableHead>
                          <TableHead className="text-[10px] md:text-xs font-black uppercase text-white/90 w-8 py-2 md:py-3 text-center">D</TableHead>
                          <TableHead className="text-[10px] md:text-xs font-black uppercase text-white/90 w-8 py-2 md:py-3 text-center">L</TableHead>
                          <TableHead className="text-[10px] md:text-xs font-black uppercase text-white/90 w-10 py-2 md:py-3 text-center">GD</TableHead>
                          <TableHead className="text-[10px] md:text-xs font-black uppercase text-white/90 w-10 py-2 md:py-3 text-right">PTS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {divisionSnapshotRows.map((t, i) => (
                          <TableRow
                            key={t.id}
                            className={cn(
                              "border-b border-white/5",
                              t.id === userTeam.id && "bg-accent/15 border-l-4 border-l-accent"
                            )}
                          >
                            <TableCell className="font-black text-xs md:text-sm py-2 md:py-2.5 tabular-nums">{i + 1}</TableCell>
                            <TableCell className={cn(
                              "font-black text-xs md:text-sm uppercase py-2 md:py-2.5 truncate max-w-[100px] md:max-w-[220px]",
                              t.id === userTeam.id ? "text-accent" : "text-white"
                            )}>
                              {t.name}
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs md:text-sm font-black py-2 md:py-2.5 tabular-nums">{t.played}</TableCell>
                            <TableCell className="text-center font-mono text-xs md:text-sm font-black py-2 md:py-2.5 tabular-nums">{t.won}</TableCell>
                            <TableCell className="text-center font-mono text-xs md:text-sm font-black py-2 md:py-2.5 tabular-nums">{t.drawn}</TableCell>
                            <TableCell className="text-center font-mono text-xs md:text-sm font-black py-2 md:py-2.5 tabular-nums">{t.lost}</TableCell>
                            <TableCell className="text-center font-mono text-xs md:text-sm font-black py-2 md:py-2.5 tabular-nums">
                              {t.goalsFor - t.goalsAgainst >= 0 ? '+' : ''}
                              {t.goalsFor - t.goalsAgainst}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs md:text-sm font-black py-2 md:py-2.5 tabular-nums text-accent">
                              {t.points}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SQUAD' && (
          <div className="squad-tab-container p-4 max-md:px-1 max-md:py-2 space-y-6 max-md:space-y-2 bg-black/40 rounded-2xl border border-primary/10">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="squad-tabs-list grid w-full grid-cols-2 bg-black/85 h-16 max-md:h-10 border-2 border-primary/25 rounded-2xl p-1 gap-1">
                <TabsTrigger value="list" className="text-lg max-md:text-xs uppercase font-black rounded-xl data-[state=active]:bg-primary">
                  Squad Selection
                </TabsTrigger>
                <TabsTrigger value="tactics" className="text-lg max-md:text-xs uppercase font-black rounded-xl data-[state=active]:bg-primary">
                  Tactical Hub
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="m-0 pt-3 max-md:pt-1.5">
                <SquadList players={userPlayers} onPlayerSwap={handlePlayerSwapInteraction} activeSwapId={swapSourceId} />
              </TabsContent>

              <TabsContent value="tactics" className="m-0 pt-3 max-md:pt-1.5">
                <div className="squad-tactics-grid grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 max-md:gap-2">
                  <TacticsPitchView
                    team={userTeam}
                    players={userPlayers}
                    onPlayerClick={(p) => handlePlayerSwapInteraction(p.id)}
                    onPlayerProfile={(p) => setViewingPlayer(p)}
                    activeSwapId={swapSourceId}
                  />

                  <RetroWindow title="STRATEGY ENGINE" className="rounded-2xl shadow-2xl bg-black/60" contentClassName="p-4 max-md:p-1.5">
                    <div className="space-y-10 max-md:space-y-2 py-6 max-md:py-1 px-4 max-md:px-1">
                      <div className="space-y-4 max-md:space-y-1">
                        <h4 className="text-[16px] max-md:text-[10px] font-black text-primary uppercase border-b-2 border-primary/20 pb-2 max-md:pb-0.5">
                          Core Formation
                        </h4>
                        <div className="grid grid-cols-2 gap-3 max-md:gap-1">
                          {['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-5-1'].map(f => (
                            <Button
                              key={f}
                              onClick={() => setTactics(f, userTeam.playStyle)}
                              className={cn(
                                "h-16 max-md:h-8 text-2xl max-md:text-sm font-black rounded-xl",
                                userTeam.formation === f
                                  ? "bg-accent text-accent-foreground border-accent shadow-xl"
                                  : "bg-black/70 text-white border-primary/20"
                              )}
                            >
                              {f}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 max-md:space-y-1">
                        <h4 className="text-[16px] max-md:text-[10px] font-black text-primary uppercase border-b-2 border-primary/20 pb-2 max-md:pb-0.5">
                          Team Mentality
                        </h4>
                        <div className="grid grid-cols-2 gap-3 max-md:gap-1">
                          {(['Long Ball', 'Pass to Feet', 'Counter-Attack', 'Tiki-Taka', 'Direct', 'Park the Bus'] as PlayStyle[]).map(s => (
                            <Button
                              key={s}
                              onClick={() => setTactics(userTeam.formation, s)}
                              className={cn(
                                "h-16 max-md:h-8 text-[16px] max-md:text-[10px] font-black uppercase rounded-xl leading-tight px-2 text-center",
                                userTeam.playStyle === s
                                  ? "bg-accent text-accent-foreground border-accent shadow-xl"
                                  : "bg-black/70 text-white border-primary/20"
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
        )}

        {activeTab === 'WORLD' && (
          <div className="world-tab-container p-4 max-md:px-1 max-md:py-2 space-y-6 max-md:space-y-2">
            <div className="world-div-buttons bg-black/70 p-2 max-md:p-1 border-2 border-primary/20 flex gap-2 max-md:gap-0.5 rounded-2xl shadow-inner">
              {[1, 2, 3, 4].map(div => (
                <Button
                  key={div}
                  onClick={() => goToViewingDiv(div)}
                  className={cn(
                    "flex-1 h-12 max-md:h-9 text-[17px] max-md:text-sm font-black uppercase rounded-xl transition-all",
                    viewingDiv === div ? "bg-primary text-primary-foreground shadow-lg" : "bg-transparent text-white hover:bg-white/10"
                  )}
                >
                  DIV {div}
                </Button>
              ))}
            </div>

            <div className="world-sub-buttons flex gap-3 max-md:gap-1">
              <Button
                onClick={() => goToWorldSubView('TABLE')}
                className={cn(
                  "h-14 max-md:h-10 text-[19px] max-md:text-sm font-black flex-1 rounded-xl uppercase tracking-widest transition-all text-white",
                  worldSubView === 'TABLE' ? 'bg-primary shadow-lg' : 'bg-black/70 border-2 border-primary/20'
                )}
              >
                Standings
              </Button>
              <Button
                onClick={() => goToWorldSubView('STATS')}
                className={cn(
                  "h-14 max-md:h-10 text-[19px] max-md:text-sm font-black flex-1 rounded-xl uppercase tracking-widest transition-all text-white",
                  worldSubView === 'STATS' ? 'bg-primary shadow-lg' : 'bg-black/70 border-2 border-primary/20'
                )}
              >
                Player Stats
              </Button>
              <Button
                onClick={() => goToWorldSubView('FIXTURES')}
                className={cn(
                  "h-14 max-md:h-10 text-[19px] max-md:text-sm font-black flex-1 rounded-xl uppercase tracking-widest transition-all text-white",
                  worldSubView === 'FIXTURES' ? 'bg-primary shadow-lg' : 'bg-black/70 border-2 border-primary/20'
                )}
              >
                Fixtures
              </Button>
            </div>

            {worldSubView === 'TABLE' && (
              <RetroWindow title={`DIV ${viewingDiv} LEAGUE STANDINGS`} noPadding className="bg-black/60 rounded-2xl shadow-2xl league-standings-window">
                <LeagueTable teams={state.teams.filter(t => t.division === viewingDiv)} onTeamClick={tId => setViewingTeam(state.teams.find(tx => tx.id === tId) || null)} />
              </RetroWindow>
            )}

            {worldSubView === 'STATS' && <StatsHub division={viewingDiv} />}

            {worldSubView === 'FIXTURES' && (
              <RetroWindow title={`DIV ${viewingDiv} FIXTURES`} noPadding className="bg-black/60 rounded-2xl shadow-2xl">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/25 border-b-2 border-primary/40">
                      <TableHead className="w-16 max-md:w-8 text-[13px] max-md:text-[9px] font-black uppercase text-white tracking-wide py-4 max-md:py-1">Wk</TableHead>
                      <TableHead className="text-[13px] max-md:text-[9px] font-black uppercase text-white tracking-wide py-4 max-md:py-1">Home</TableHead>
                      <TableHead className="text-center text-[13px] max-md:text-[9px] font-black uppercase text-white tracking-wide py-4 max-md:py-1">Res</TableHead>
                      <TableHead className="text-[13px] max-md:text-[9px] font-black uppercase text-white tracking-wide py-4 max-md:py-1">Away</TableHead>
                      <TableHead className="w-24 max-md:w-12 text-[13px] max-md:text-[9px] font-black uppercase text-white tracking-wide py-4 max-md:py-1 text-center">Play</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.fixtures.filter(f => f.division === viewingDiv).sort((a, b) => a.week - b.week).map(f => {
                      const h = state.teams.find(t => t.id === f.homeTeamId);
                      const a = state.teams.find(t => t.id === f.awayTeamId);
                      const isUserFixture = f.homeTeamId === userTeam.id || f.awayTeamId === userTeam.id;
                      const canPlay = isUserFixture && f.week === state.currentWeek && !f.result && isLineupValid;

                      return (
                        <TableRow key={f.id} className="border-b border-white/5 hover:bg-white/5">
                          <TableCell className="font-black text-lg max-md:text-[10px] tabular-nums opacity-60 py-2 max-md:py-0.5">{f.week}</TableCell>
                          <TableCell className={cn("font-black text-lg max-md:text-[10px] uppercase py-2 max-md:py-0.5 truncate max-w-[80px]", f.homeTeamId === userTeam.id ? "text-accent" : "text-white")}>
                            {h?.name}
                          </TableCell>
                          <TableCell className="text-center font-black text-xl max-md:text-xs tabular-nums py-2 max-md:py-0.5">
                            {f.result ? `${f.result.homeGoals}-${f.result.awayGoals}` : 'v'}
                          </TableCell>
                          <TableCell className={cn("font-black text-lg max-md:text-[10px] uppercase py-2 max-md:py-0.5 truncate max-w-[80px]", f.awayTeamId === userTeam.id ? "text-accent" : "text-white")}>
                            {a?.name}
                          </TableCell>
                          <TableCell className="text-center py-2 max-md:py-0.5">
                            {canPlay ? (
                              <Button size="sm" onClick={() => startMatch(f.id)} className="h-8 max-md:h-5 px-3 max-md:px-1.5 bg-accent text-accent-foreground font-black text-[10px] uppercase rounded-lg">
                                <PlayCircle size={12} className="mr-0.5 max-md:w-2.5 max-md:h-2.5" />
                                Play
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </RetroWindow>
            )}
          </div>
        )}

        {activeTab === 'MARKET' && (
          <div className="p-4 max-md:px-1 max-md:py-3 h-full">
            <RetroWindow title="GLOBAL TRANSFER DATABASE" titleClassName="text-[18px] font-bold tracking-wide uppercase" className="bg-black/20 rounded-2xl shadow-2xl">
              <PlayerMarket />
            </RetroWindow>
          </div>
        )}

        {activeTab === 'CLUB' && (
          <div className="p-4 max-md:px-1 max-md:py-3 space-y-6 max-md:space-y-3">
            {clubSubView === 'OFFICE' ? (
              <div className="grid grid-cols-2 gap-6 max-md:gap-2 auto-rows-fr">
                <button onClick={() => goToClubSubView('MANAGER')} className="retro-tile flex flex-col items-center justify-center gap-6 max-md:gap-2 py-16 max-md:py-6 hover:bg-primary/20 bg-black/40 border-2 border-primary/30 rounded-3xl transition-all shadow-2xl group">
                  <UserCircle size={72} className="text-primary max-md:w-12 max-md:h-12 group-hover:scale-110 transition-transform" />
                  <span className="text-2xl max-md:text-sm font-black uppercase text-white">Manager Profile</span>
                </button>
                <button onClick={() => goToClubSubView('FINANCE')} className="retro-tile flex flex-col items-center justify-center gap-6 max-md:gap-2 py-16 max-md:py-6 hover:bg-accent/20 bg-black/40 border-2 border-primary/30 rounded-3xl transition-all shadow-2xl group">
                  <DollarSign size={72} className="text-accent max-md:w-12 max-md:h-12 group-hover:scale-110 transition-transform" />
                  <span className="text-2xl max-md:text-sm font-black uppercase text-white">Financial Hub</span>
                </button>
                <button onClick={() => goToClubSubView('STAFF')} className="retro-tile flex flex-col items-center justify-center gap-6 max-md:gap-2 py-16 max-md:py-6 hover:bg-primary/20 bg-black/40 border-2 border-primary/30 rounded-3xl transition-all shadow-2xl group">
                  <Briefcase size={72} className="text-primary max-md:w-12 max-md:h-12 group-hover:scale-110 transition-transform" />
                  <span className="text-2xl max-md:text-sm font-black uppercase text-white">Staff Management</span>
                </button>
                <button onClick={() => goToClubSubView('RECORDS')} className="retro-tile flex flex-col items-center justify-center gap-6 max-md:gap-2 py-16 max-md:py-6 hover:bg-yellow-500/20 bg-black/40 border-2 border-primary/30 rounded-3xl transition-all shadow-2xl group">
                  <Trophy size={72} className="text-yellow-500 max-md:w-12 max-md:h-12" />
                  <span className="text-2xl max-md:text-sm font-black uppercase text-white">Legacy & Records</span>
                </button>
                <button onClick={() => goToClubSubView('SETTINGS')} className="retro-tile flex flex-col items-center justify-center gap-6 max-md:gap-2 py-16 max-md:py-6 border-2 border-white/10 hover:bg-white/10 bg-black/40 rounded-3xl transition-all shadow-2xl group">
                  <Settings size={72} className="text-muted-foreground max-md:w-12 max-md:h-12" />
                  <span className="text-2xl max-md:text-sm font-black uppercase text-white">OS Config</span>
                </button>
                <button onClick={saveGame} className="retro-tile flex flex-col items-center justify-center gap-6 max-md:gap-2 py-16 max-md:py-6 border-4 border-accent/40 bg-accent/5 hover:bg-accent/20 rounded-3xl transition-all shadow-2xl group">
                  <Save size={72} className="text-accent max-md:w-12 max-md:h-12 group-hover:animate-bounce" />
                  <span className="text-2xl max-md:text-sm font-black uppercase text-white">Commit Save</span>
                </button>
                <button onClick={quitToMainMenu} className="retro-tile flex flex-col items-center justify-center gap-6 max-md:gap-2 py-16 max-md:py-6 border-2 border-white/20 hover:bg-red-500/20 bg-black/40 rounded-3xl transition-all shadow-2xl group">
                  <LogOut size={72} className="text-white/80 max-md:w-12 max-md:h-12 group-hover:text-red-400 transition-colors" />
                  <span className="text-2xl max-md:text-sm font-black uppercase text-white">Quit to Main Menu</span>
                </button>
              </div>
            ) : (
              <div className="w-full max-w-[90%] sm:max-w-[85%] md:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 space-y-5 md:space-y-6">
                <div className="flex justify-start">
                  <Button variant="outline" onClick={() => goToClubSubView('OFFICE')} className="h-12 md:h-[48px] px-6 md:px-8 text-[14px] md:text-[16px] font-black retro-button bg-black/60 border-2 border-primary/40 rounded-xl hover:bg-primary hover:text-white transition-all uppercase">
                    ← Return to Main Office
                  </Button>
                </div>
                {clubSubView === 'MANAGER' && (
                  <OfficeSubViewTemplate title="Manager Profile">
                    <ManagerInfo />
                  </OfficeSubViewTemplate>
                )}
                {clubSubView === 'FINANCE' && (
                  <OfficeSubViewTemplate title="Financial Hub">
                    <FinanceHub />
                  </OfficeSubViewTemplate>
                )}
                {clubSubView === 'STAFF' && (
                  <OfficeSubViewTemplate title="Staff Management">
                    <StaffManagement />
                  </OfficeSubViewTemplate>
                )}
                {clubSubView === 'RECORDS' && (
                  <OfficeSubViewTemplate title="Legacy & Records">
                    <TeamRecords />
                  </OfficeSubViewTemplate>
                )}
                {clubSubView === 'SETTINGS' && (
                  <OfficeSubViewTemplate title="OS Config">
                    <SettingsHub />
                  </OfficeSubViewTemplate>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="game-nav fixed bottom-0 left-0 right-0 max-w-screen-2xl mx-auto bg-black/95 backdrop-blur-2xl border-t-4 border-primary/50 h-20 sm:h-24 max-md:h-auto flex items-stretch z-40 shadow-[0_-15px_40px_rgba(0,0,0,0.7)]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => goToTab('HUB')} className={cn("flex-1 flex flex-col items-center justify-center gap-1.5 transition-all py-2", activeTab === 'HUB' ? 'text-accent bg-accent/15 border-t-4 border-accent' : 'text-white/80 hover:text-primary hover:bg-white/5')}>
                <LayoutDashboard size={32} className="shrink-0" />
                <span className="text-[11px] uppercase font-black tracking-widest">Dashboard</span>
              </button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="font-black text-lg">HUB & NEWS</TooltipContent>
            </TooltipPortal>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => goToTab('SQUAD')} className={cn("flex-1 flex flex-col items-center justify-center gap-1.5 transition-all py-2", activeTab === 'SQUAD' ? 'text-accent bg-accent/15 border-t-4 border-accent' : 'text-white/80 hover:text-primary hover:bg-white/5')}>
                <Users size={32} className="shrink-0" />
                <span className="text-[11px] uppercase font-black tracking-widest">Team</span>
              </button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="font-black text-lg">SQUAD & TACTICS</TooltipContent>
            </TooltipPortal>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => goToTab('WORLD')} className={cn("flex-1 flex flex-col items-center justify-center gap-1.5 transition-all py-2", activeTab === 'WORLD' ? 'text-accent bg-accent/15 border-t-4 border-accent' : 'text-white/80 hover:text-primary hover:bg-white/5')}>
                <Globe2 size={32} className="shrink-0" />
                <span className="text-[11px] uppercase font-black tracking-widest">World</span>
              </button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="font-black text-lg">STANDINGS & FIXTURES</TooltipContent>
            </TooltipPortal>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => goToTab('MARKET')} className={cn("flex-1 flex flex-col items-center justify-center gap-1.5 transition-all py-2", activeTab === 'MARKET' ? 'text-accent bg-accent/15 border-t-4 border-accent' : 'text-white/80 hover:text-primary hover:bg-white/5')}>
                <Search size={32} className="shrink-0" />
                <span className="text-[11px] uppercase font-black tracking-widest">Market</span>
              </button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="font-black text-lg">TRANSFER DATABASE</TooltipContent>
            </TooltipPortal>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => goToTab('CLUB')} className={cn("flex-1 flex flex-col items-center justify-center gap-1.5 transition-all py-2", activeTab === 'CLUB' ? 'text-accent bg-accent/15 border-t-4 border-accent' : 'text-white/80 hover:text-primary hover:bg-white/5')}>
                <Briefcase size={32} className="shrink-0" />
                <span className="text-[11px] uppercase font-black tracking-widest">Office</span>
              </button>
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent className="font-black text-lg">CLUB MANAGEMENT</TooltipContent>
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

      <PlayerProfile
        player={viewingPlayer}
        onClose={() => { setViewingPlayer(null); setOpenToTab(null); }}
        defaultTab={openToTab ?? 'overview'}
        key={viewingPlayer ? `${viewingPlayer.id}-${openToTab ?? 'o'}` : 'closed'}
      />

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