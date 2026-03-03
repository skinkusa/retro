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
import { Toaster } from '@/components/ui/toaster';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, TooltipPortal } from '@/components/ui/tooltip';
import { LayoutDashboard, Users, Trophy, PlayCircle, Search, Briefcase, DollarSign, UserCircle, Globe2, History, ListFilter, Save, FileUp, Settings, HelpCircle, Swords, RefreshCw, Info } from 'lucide-react';
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
      <RetroWindow title="RETRO MANAGER OS v1.9.3" className="max-w-4xl w-full bg-card/70 backdrop-blur-xl border-primary/40 shadow-2xl rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 px-8">
          <div className="space-y-8">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-primary border-b-8 border-primary/20 pb-4 uppercase leading-none italic">Retro Manager</h1>
            <div className="space-y-6">
              {hasSave && (
                <div className="p-6 bg-accent/10 border-2 border-accent space-y-4 shadow-[8px_8px_0px_0px_rgba(38,217,117,0.3)] rounded-2xl">
                  <h2 className="text-[18px] font-black text-accent uppercase tracking-widest text-center">Active Career Detected</h2>
                  <Button onClick={loadGame} className="w-full h-20 bg-accent text-accent-foreground font-black retro-button flex items-center justify-center gap-4 hover:opacity-90 transition-all text-2xl rounded-xl shadow-lg"><FileUp size={32} /> CONTINUE CAREER</Button>
                </div>
              )}
              <div className="space-y-4">
                <Button onClick={() => setShowSettings(true)} variant="outline" className="w-full h-14 border-primary/40 text-primary font-black retro-button flex items-center justify-center gap-2 hover:bg-primary/10 bg-black/20 text-xl rounded-xl uppercase"><Settings size={22} /> Database Editor</Button>
              </div>
              <div className="pt-8 border-t-4 border-primary/10 space-y-6">
                <div>
                  <label className="text-[16px] uppercase text-muted-foreground mb-2 block font-black tracking-widest">Manager Identity</label>
                  <Input value={name} onChange={e => setName(e.target.value)} className="bg-black/40 border-primary/30 h-16 text-3xl font-black rounded-xl uppercase px-6" placeholder="ENTER NAME..." />
                </div>
                <div>
                  <label className="text-[16px] uppercase text-muted-foreground block font-black tracking-widest mb-2">Management Philosophy</label>
                  <Select value={personality} onValueChange={(v: any) => setPersonality(v)}>
                    <SelectTrigger className="bg-black/40 border-primary/30 h-16 text-xl font-black rounded-xl uppercase px-6"><SelectValue placeholder="Select Philosophy" /></SelectTrigger>
                    <SelectContent><SelectItem value="Analyst">THE ANALYST (+TACTICS)</SelectItem><SelectItem value="Motivator">THE MOTIVATOR (+MORALE)</SelectItem><SelectItem value="Economist">THE ECONOMIST (-WAGES)</SelectItem><SelectItem value="Maverick">THE MAVERICK (GOALS!)</SelectItem><SelectItem value="Celebrity">THE CELEBRITY (+REP)</SelectItem></SelectContent>
                  </Select>
                  <div className="mt-4 p-5 bg-primary/10 border-2 border-primary/20 rounded-2xl shadow-inner"><p className="text-[18px] text-primary leading-tight font-black italic">* {getPhilosophyDescription(personality)}</p></div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b-4 border-primary/10 pb-3">
              <h2 className="text-xl font-black uppercase text-primary tracking-widest">Select Club</h2>
              <Select value={selectedDiv.toString()} onValueChange={(v) => { setSelectedDiv(parseInt(v)); setSelectedTeam(null); }}>
                <SelectTrigger className="h-12 w-48 text-[18px] font-black bg-black/40 border-primary/30 rounded-xl"><SelectValue placeholder="Division" /></SelectTrigger>
                <SelectContent><SelectItem value="1">DIVISION 1</SelectItem><SelectItem value="2">DIVISION 2</SelectItem><SelectItem value="3">DIVISION 3</SelectItem><SelectItem value="4">DIVISION 4</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="max-h-[450px] overflow-auto border-4 border-primary/20 p-2 space-y-1.5 bg-black/40 backdrop-blur-sm rounded-2xl shadow-inner custom-scrollbar">
              {state.teams.filter(t => t.division === selectedDiv).map(t => (
                <button key={t.id} onClick={() => setSelectedTeam(t.id)} className={`w-full text-left px-6 py-5 text-2xl border-4 border-transparent hover:bg-primary/20 transition-all flex justify-between items-center rounded-xl shadow-sm ${selectedTeam === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-black/20'}`}>
                  <span className="font-black uppercase tracking-tight">{t.name}</span>
                  <span className="opacity-60 text-[16px] font-mono font-black">REP: {t.reputation}</span>
                </button>
              ))}
            </div>
            <Button disabled={!name || !selectedTeam} onClick={() => startGame(name, selectedTeam!, personality)} className="w-full h-20 bg-primary text-primary-foreground font-black retro-button mt-6 uppercase tracking-[0.3em] text-3xl shadow-2xl hover:scale-[1.03] transition-transform rounded-2xl">INITIALIZE CAREER</Button>
          </div>
        </div>
      </RetroWindow>
    </div>
  );
}

function GameContent() {
  const { state, simulateWeek, advanceWeek, setTactics, saveGame, swapPlayers } = useGame();
  const [activeTab, setActiveTab] = useState<'HUB' | 'SQUAD' | 'WORLD' | 'MARKET' | 'CLUB'>('HUB');
  const [clubSubView, setClubSubView] = useState<'OFFICE' | 'STAFF' | 'FINANCE' | 'MANAGER' | 'RECORDS' | 'SETTINGS'>('OFFICE');
  const [worldSubView, setWorldSubView] = useState<'TABLE' | 'STATS' | 'FIXTURES'>('TABLE');
  const [viewingDiv, setViewingDiv] = useState<number>(1);
  const [isMatchDay, setIsMatchDay] = useState(false);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);

  useEffect(() => { if (state.userTeamId) { const ut = state.teams.find(t => t.id === state.userTeamId); if (ut) setViewingDiv(ut.division); } }, [state.userTeamId, state.teams]);

  const currentWeekNews = useMemo(() => state.messages.filter(m => m.week === state.currentWeek), [state.messages, state.currentWeek]);
  const handlePlayerSwapInteraction = (pId: string) => { if (!swapSourceId) { setSwapSourceId(pId); } else { if (swapSourceId === pId) { setSwapSourceId(null); } else { swapPlayers(swapSourceId, pId); setSwapSourceId(null); } } };

  if (!state.isGameStarted || !state.userTeamId) return <StartMenu />;
  if (state.isSeasonOver) return <SeasonSummary />;

  const userTeam = state.teams.find(t => t.id === state.userTeamId)!;
  const userPlayers = state.players.filter(p => p.clubId === state.userTeamId);
  const nextFixture = state.fixtures.find(f => f.week === state.currentWeek && (f.homeTeamId === userTeam.id || f.awayTeamId === userTeam.id));
  const isLineupValid = userTeam.lineup.length >= 11;

  if (isMatchDay && nextFixture) {
    return (
      <MatchSim fixture={nextFixture} homeTeam={state.teams.find(t => t.id === nextFixture.homeTeamId)!} awayTeam={state.teams.find(t => t.id === nextFixture.awayTeamId)!} onFinish={() => { advanceWeek(); setIsMatchDay(false); setActiveTab('HUB'); }} />
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-screen-xl mx-auto border-x-4 border-primary/20 bg-transparent font-mono">
      <div className="bg-primary text-primary-foreground py-4 px-8 flex justify-between items-center shrink-0 border-b-4 border-black/40 shadow-2xl z-50">
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tighter uppercase leading-none italic drop-shadow-md">Retro Manager</span>
          <span className="text-[14px] opacity-90 font-black">STATION OS v1.9.3</span>
        </div>
        <div className="flex items-center gap-12">
          <TooltipProvider>
            <Tooltip><TooltipTrigger asChild><div className="flex flex-col items-end cursor-help"><span className="text-[11px] uppercase font-black tracking-widest opacity-80 mb-1">WEEK</span><span className="text-3xl font-black leading-none text-accent tabular-nums">{state.currentWeek}</span></div></TooltipTrigger><TooltipPortal><TooltipContent className="font-black">CURRENT MATCH WEEK (38 TOTAL)</TooltipContent></TooltipPortal></Tooltip>
            <Tooltip><TooltipTrigger asChild><div className="flex flex-col items-end cursor-help"><span className="text-[11px] uppercase font-black tracking-widest opacity-80 mb-1">BALANCE</span><span className="text-3xl font-black text-white leading-none tabular-nums">{formatMoney(userTeam.budget)}</span></div></TooltipTrigger><TooltipPortal><TooltipContent className="font-black">TOTAL CLUB CAPITAL</TooltipContent></TooltipPortal></Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <main className="flex-1 overflow-auto scrollbar-none pb-28 pt-4 px-2">
        {activeTab === 'HUB' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div className="retro-tile flex flex-col bg-black/30 backdrop-blur-xl border-2 border-primary/40 p-4 rounded-2xl shadow-2xl h-fit">
              <div className="flex justify-between items-center mb-3 border-b-2 border-primary/10 pb-3">
                <div className="flex items-center gap-4"><h3 className="text-[14px] font-black text-primary uppercase">Team Identity:</h3><span className="text-xl font-black text-white uppercase tracking-tight italic">{userTeam.name}</span></div>
                <span className="text-[12px] bg-black/60 px-4 py-1.5 rounded-full font-black border border-white/10 uppercase">Season {state.season}</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-black/40 p-3 rounded-xl border border-white/5"><div className="text-[10px] font-black text-muted-foreground uppercase mb-1">Board Confidence</div><div className={`text-2xl font-black ${state.boardConfidence > 50 ? 'text-green-500' : 'text-red-500'}`}>{state.boardConfidence}%</div></div>
                <div className="flex-1 bg-black/40 p-3 rounded-xl border border-white/5"><div className="text-[10px] font-black text-muted-foreground uppercase mb-1">League Points</div><div className="text-2xl font-black text-accent">{userTeam.points} PTS</div></div>
              </div>
            </div>
            <div className="retro-tile bg-black/30 border-2 border-primary/40 p-4 rounded-2xl shadow-2xl">
              <h3 className="text-[14px] font-black text-primary uppercase mb-3 border-b-2 border-primary/10 pb-2">Division {userTeam.division} Snapshot</h3>
              <div className="space-y-2">
                {state.teams.filter(t => t.division === userTeam.division).slice(0, 3).map((t, i) => (
                  <div key={t.id} className={`flex justify-between items-center py-2 px-4 rounded-xl border ${t.id === userTeam.id ? 'bg-accent/10 border-accent text-accent font-black' : 'bg-black/20 border-white/5'}`}>
                    <span className="text-[16px] uppercase font-black truncate">{i + 1}. {t.name}</span><span className="font-black text-[16px]">{t.points} PTS</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="retro-tile col-span-1 md:col-span-2 bg-primary/5 border-2 border-primary/40 p-6 rounded-2xl shadow-2xl flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-6 border-b-2 border-primary/20 pb-4">
                <h3 className="text-[16px] font-black text-primary uppercase tracking-widest">Next Fixture Intel</h3>
                <span className="text-[14px] font-black text-muted-foreground">WEEK {state.currentWeek}</span>
              </div>
              {nextFixture ? (
                <div className="w-full flex flex-col md:flex-row items-center gap-10">
                  <div className="flex-1 flex justify-center items-center gap-12">
                    <span className="text-3xl font-black uppercase text-white truncate text-right flex-1 tracking-tighter">{state.teams.find(t => t.id === nextFixture.homeTeamId)?.name}</span>
                    <div className="bg-primary/20 px-6 py-2 rounded-xl border-2 border-primary/40 font-black text-primary text-xl">VS</div>
                    <span className="text-3xl font-black uppercase text-white truncate text-left flex-1 tracking-tighter">{state.teams.find(t => t.id === nextFixture.awayTeamId)?.name}</span>
                  </div>
                  <Button onClick={() => setIsMatchDay(true)} disabled={!isLineupValid} className="w-full md:w-64 h-16 bg-accent text-accent-foreground retro-button font-black text-2xl rounded-2xl shadow-2xl hover:scale-[1.05] transition-transform animate-pulse"><PlayCircle size={32} className="mr-3" /> PLAY MATCH</Button>
                </div>
              ) : <div className="text-xl font-black text-muted-foreground uppercase italic py-8 tracking-[0.3em]">Season Concluded</div>}
            </div>
            <div className="retro-tile col-span-1 md:col-span-2 bg-black/30 border-2 border-primary/40 p-6 rounded-2xl shadow-2xl">
              <h3 className="text-[16px] font-black text-primary uppercase mb-4 border-b-2 border-primary/10 pb-2">Weekly Headlines</h3>
              <div className="space-y-4 max-h-[250px] overflow-auto custom-scrollbar pr-2">
                {currentWeekNews.length > 0 ? currentWeekNews.map(m => (
                  <div key={m.id} className="p-4 border-l-8 border-primary bg-primary/10 rounded-r-2xl"><span className="font-black block text-primary uppercase mb-1 text-[18px] italic underline">{m.title}</span><span className="text-white text-[16px] font-bold leading-tight line-clamp-3">{m.content}</span></div>
                )) : <div className="text-center py-12 text-muted-foreground uppercase font-black opacity-40 italic tracking-[0.2em]">Silent week in the football world.</div>}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'SQUAD' && (
          <div className="p-4 space-y-6">
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/40 h-16 border-2 border-primary/20 rounded-2xl p-1 gap-1"><TabsTrigger value="list" className="text-lg uppercase font-black rounded-xl data-[state=active]:bg-primary">Squad Selection</TabsTrigger><TabsTrigger value="tactics" className="text-lg uppercase font-black rounded-xl data-[state=active]:bg-primary">Tactical HUD</TabsTrigger></TabsList>
              <TabsContent value="list" className="m-0 pt-4"><SquadList players={userPlayers} onPlayerSwap={handlePlayerSwapInteraction} activeSwapId={swapSourceId} /></TabsContent>
              <TabsContent value="tactics" className="m-0 pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
                  <RetroWindow title="PITCH COMMAND" className="rounded-2xl shadow-2xl bg-black/20"><div className="flex justify-center py-6"><TacticsPitch team={userTeam} players={userPlayers} onPlayerClick={(p) => handlePlayerSwapInteraction(p.id)} onPlayerProfile={(p) => setViewingPlayer(p)} activeSwapId={swapSourceId} /></div></RetroWindow>
                  <RetroWindow title="STRATEGY ENGINE" className="rounded-2xl shadow-2xl bg-black/20">
                    <div className="space-y-10 py-6 px-4">
                      <div className="space-y-4"><h4 className="text-[16px] font-black text-primary uppercase border-b-2 border-primary/20 pb-2">Core Formation</h4><div className="grid grid-cols-2 gap-3">{['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-5-1'].map(f => (<Button key={f} onClick={() => setTactics(f, userTeam.playStyle)} className={cn("h-16 text-2xl font-black rounded-xl", userTeam.formation === f ? "bg-accent text-accent-foreground border-accent shadow-xl" : "bg-black/40 text-white border-primary/20")}>{f}</Button>))}</div></div>
                      <div className="space-y-4"><h4 className="text-[16px] font-black text-primary uppercase border-b-2 border-primary/20 pb-2">Team Mentality</h4><div className="grid grid-cols-2 gap-3">{(['Long Ball', 'Pass to Feet', 'Counter-Attack', 'Tiki-Taka', 'Direct', 'Park the Bus'] as PlayStyle[]).map(s => (<Button key={s} onClick={() => setTactics(userTeam.formation, s)} className={cn("h-16 text-[16px] font-black uppercase rounded-xl leading-tight px-2 text-center", userTeam.playStyle === s ? "bg-accent text-accent-foreground border-accent shadow-xl" : "bg-black/40 text-white border-primary/20")}>{s}</Button>))}</div></div>
                    </div>
                  </RetroWindow>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        {activeTab === 'WORLD' && (
          <div className="p-4 space-y-6">
            <div className="bg-black/40 p-2 border-2 border-primary/20 flex gap-2 rounded-2xl shadow-inner">{[1, 2, 3, 4].map(div => (<Button key={div} onClick={() => setViewingDiv(div)} className={cn("flex-1 h-12 text-lg font-black uppercase rounded-xl transition-all", viewingDiv === div ? "bg-primary text-primary-foreground shadow-lg" : "bg-transparent text-white hover:bg-white/5")}>DIV {div}</Button>))}</div>
            <div className="flex gap-3"><Button onClick={() => setWorldSubView('TABLE')} className={cn("h-14 text-lg font-black flex-1 rounded-xl uppercase tracking-widest transition-all", worldSubView === 'TABLE' ? 'bg-primary shadow-lg' : 'bg-black/40 border-2 border-primary/20')}>Standings</Button><Button onClick={() => setWorldSubView('STATS')} className={cn("h-14 text-lg font-black flex-1 rounded-xl uppercase tracking-widest transition-all", worldSubView === 'STATS' ? 'bg-primary shadow-lg' : 'bg-black/40 border-2 border-primary/20')}>Athletes</Button><Button onClick={() => setWorldSubView('FIXTURES')} className={cn("h-14 text-lg font-black flex-1 rounded-xl uppercase tracking-widest transition-all", worldSubView === 'FIXTURES' ? 'bg-primary shadow-lg' : 'bg-black/40 border-2 border-primary/20')}>Schedule</Button></div>
            {worldSubView === 'TABLE' && <RetroWindow title={`DIV ${viewingDiv} LEAGUE STANDINGS`} noPadding className="bg-black/20 rounded-2xl shadow-2xl"><LeagueTable teams={state.teams.filter(t => t.division === viewingDiv)} onTeamClick={tId => setViewingTeam(state.teams.find(tx => tx.id === tId) || null)} /></RetroWindow>}
            {worldSubView === 'STATS' && <StatsHub division={viewingDiv} />}
            {worldSubView === 'FIXTURES' && (
              <RetroWindow title={`DIV ${viewingDiv} MATCH SCHEDULE`} noPadding className="bg-black/20 rounded-2xl shadow-2xl">
                <Table><TableHeader><TableRow className="bg-black/40 border-b-2 border-primary/20"><TableHead className="w-16 font-black uppercase">Wk</TableHead><TableHead className="font-black uppercase">Home</TableHead><TableHead className="text-center font-black uppercase">Res</TableHead><TableHead className="text-right font-black uppercase">Away</TableHead></TableRow></TableHeader><TableBody>{state.fixtures.filter(f => f.division === viewingDiv).sort((a, b) => a.week - b.week).map(f => {
                  const h = state.teams.find(t => t.id === f.homeTeamId); const a = state.teams.find(t => t.id === f.awayTeamId);
                  return (<TableRow key={f.id} className="border-b border-white/5 hover:bg-white/5"><TableCell className="font-black text-lg tabular-nums opacity-60">{f.week}</TableCell><TableCell className={cn("font-black text-lg uppercase", f.homeTeamId === userTeam.id ? "text-accent" : "text-white")}>{h?.name}</TableCell><TableCell className="text-center font-black text-xl tabular-nums">{f.result ? `${f.result.homeGoals}-${f.result.awayGoals}` : 'v'}</TableCell><TableCell className={cn("text-right font-black text-lg uppercase", f.awayTeamId === userTeam.id ? "text-accent" : "text-white")}>{a?.name}</TableCell></TableRow>);
                })}</TableBody></Table>
              </RetroWindow>
            )}
          </div>
        )}
        {activeTab === 'MARKET' && <div className="p-4 h-full"><RetroWindow title="GLOBAL TRANSFER DATABASE" className="bg-black/20 rounded-2xl shadow-2xl"><PlayerMarket /></RetroWindow></div>}
        {activeTab === 'CLUB' && (
          <div className="p-4 space-y-6">
            {clubSubView === 'OFFICE' ? (
              <div className="grid grid-cols-2 gap-6 auto-rows-fr">
                <button onClick={() => setClubSubView('MANAGER')} className="retro-tile flex flex-col items-center justify-center gap-6 py-16 hover:bg-primary/20 bg-black/40 border-2 border-primary/30 rounded-3xl transition-all shadow-2xl group"><UserCircle size={72} className="text-primary group-hover:scale-110 transition-transform" /><span className="text-2xl font-black uppercase text-white">Manager Profile</span></button>
                <button onClick={() => setClubSubView('FINANCE')} className="retro-tile flex flex-col items-center justify-center gap-6 py-16 hover:bg-accent/20 bg-black/40 border-2 border-primary/30 rounded-3xl transition-all shadow-2xl group"><DollarSign size={72} className="text-accent group-hover:scale-110 transition-transform" /><span className="text-2xl font-black uppercase text-white">Financial Hub</span></button>
                <button onClick={() => setClubSubView('STAFF')} className="retro-tile flex flex-col items-center justify-center gap-6 py-16 hover:bg-primary/20 bg-black/40 border-2 border-primary/30 rounded-3xl transition-all shadow-2xl group"><Briefcase size={72} className="text-primary group-hover:scale-110 transition-transform" /><span className="text-2xl font-black uppercase text-white">Staff Management</span></button>
                <button onClick={() => setClubSubView('RECORDS')} className="retro-tile flex flex-col items-center justify-center gap-6 py-16 hover:bg-yellow-500/20 bg-black/40 border-2 border-primary/30 rounded-3xl transition-all shadow-2xl group"><Trophy size={72} className="text-yellow-500" /><span className="text-2xl font-black uppercase text-white">Legacy & Records</span></button>
                <button onClick={() => setClubSubView('SETTINGS')} className="retro-tile flex flex-col items-center justify-center gap-6 py-16 border-2 border-white/10 hover:bg-white/10 bg-black/40 rounded-3xl transition-all shadow-2xl group"><Settings size={72} className="text-muted-foreground" /><span className="text-2xl font-black uppercase text-white">OS Config</span></button>
                <button onClick={saveGame} className="retro-tile flex flex-col items-center justify-center gap-6 py-16 border-4 border-accent/40 bg-accent/5 hover:bg-accent/20 rounded-3xl transition-all shadow-2xl group"><Save size={72} className="text-accent group-hover:animate-bounce" /><span className="text-2xl font-black uppercase text-white">Commit Save</span></button>
              </div>
            ) : (
              <div className="space-y-6"><Button variant="outline" onClick={() => setClubSubView('OFFICE')} className="h-14 text-lg font-black mb-4 retro-button bg-black/60 px-10 border-2 border-primary/40 rounded-xl hover:bg-primary hover:text-white transition-all uppercase">← Return to Main Office</Button>
                {clubSubView === 'MANAGER' && <ManagerInfo />} {clubSubView === 'FINANCE' && <FinanceHub />} {clubSubView === 'STAFF' && <StaffManagement />} {clubSubView === 'RECORDS' && <TeamRecords />} {clubSubView === 'SETTINGS' && <SettingsHub />}
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-screen-xl mx-auto bg-black/90 backdrop-blur-2xl border-t-4 border-primary/40 h-24 flex items-stretch z-40 shadow-[0_-15px_40px_rgba(0,0,0,0.7)]">
        <TooltipProvider>
          <Tooltip><TooltipTrigger asChild><button onClick={() => setActiveTab('HUB')} className={cn("flex-1 flex flex-col items-center justify-center gap-2 transition-all", activeTab === 'HUB' ? 'text-accent bg-accent/10 border-t-8 border-accent' : 'text-white/60 hover:text-primary hover:bg-primary/5')}><LayoutDashboard size={36} /><span className="text-[12px] uppercase font-black tracking-widest">Dashboard</span></button></TooltipTrigger><TooltipPortal><TooltipContent className="font-black text-lg">HUB & NEWS</TooltipContent></TooltipPortal></Tooltip>
          <Tooltip><TooltipTrigger asChild><button onClick={() => setActiveTab('SQUAD')} className={cn("flex-1 flex flex-col items-center justify-center gap-2 transition-all", activeTab === 'SQUAD' ? 'text-accent bg-accent/10 border-t-8 border-accent' : 'text-white/60 hover:text-primary hover:bg-primary/5')}><Users size={36} /><span className="text-[12px] uppercase font-black tracking-widest">Team</span></button></TooltipTrigger><TooltipPortal><TooltipContent className="font-black text-lg">SQUAD & TACTICS</TooltipContent></TooltipPortal></Tooltip>
          <Tooltip><TooltipTrigger asChild><button onClick={() => setActiveTab('WORLD')} className={cn("flex-1 flex flex-col items-center justify-center gap-2 transition-all", activeTab === 'WORLD' ? 'text-accent bg-accent/10 border-t-8 border-accent' : 'text-white/60 hover:text-primary hover:bg-primary/5')}><Globe2 size={36} /><span className="text-[12px] uppercase font-black tracking-widest">World</span></button></TooltipTrigger><TooltipPortal><TooltipContent className="font-black text-lg">STANDINGS & SCHEDULE</TooltipContent></TooltipPortal></Tooltip>
          <Tooltip><TooltipTrigger asChild><button onClick={() => setActiveTab('MARKET')} className={cn("flex-1 flex flex-col items-center justify-center gap-2 transition-all", activeTab === 'MARKET' ? 'text-accent bg-accent/10 border-t-8 border-accent' : 'text-white/60 hover:text-primary hover:bg-primary/5')}><Search size={36} /><span className="text-[12px] uppercase font-black tracking-widest">Market</span></button></TooltipTrigger><TooltipPortal><TooltipContent className="font-black text-lg">TRANSFER DATABASE</TooltipContent></TooltipPortal></Tooltip>
          <Tooltip><TooltipTrigger asChild><button onClick={() => setActiveTab('CLUB')} className={cn("flex-1 flex flex-col items-center justify-center gap-2 transition-all", activeTab === 'CLUB' ? 'text-accent bg-accent/10 border-t-8 border-accent' : 'text-white/60 hover:text-primary hover:bg-primary/5')}><Briefcase size={36} /><span className="text-[12px] uppercase font-black tracking-widest">Office</span></button></TooltipTrigger><TooltipPortal><TooltipContent className="font-black text-lg">CLUB MANAGEMENT</TooltipContent></TooltipPortal></Tooltip>
        </TooltipProvider>
      </nav>

      <TeamRoster team={viewingTeam} players={state.players.filter(p => p.clubId === viewingTeam?.id)} onClose={() => setViewingTeam(null)} onPlayerClick={(p) => setViewingPlayer(p)} />
      <PlayerProfile player={viewingPlayer} onClose={() => setViewingPlayer(null)} />
      <Toaster />
    </div>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <TooltipProvider>
        <GameContent />
      </TooltipProvider>
    </GameProvider>
  );
}
