
"use client"

import { useState } from 'react';
import { useGame } from '@/lib/store';
import { RetroWindow } from './RetroWindow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save, History, Edit2, Database, ShieldAlert, FastForward } from 'lucide-react';

export function SettingsHub() {
  const { state, updateSeason, updateTeamName, fastForwardSeason, setEnginePreset } = useGame();
  const [newSeason, setNewSeason] = useState(state.season.toString());
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [tempTeamName, setTempTeamName] = useState('');

  const handleSeasonChange = () => {
    const year = parseInt(newSeason);
    if (!isNaN(year)) {
      updateSeason(year);
    }
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

  return (
    <div className="space-y-6 md:space-y-8">
      <RetroWindow title="SIMULATION & TESTING TOOLS" titleClassName="text-[14px] md:text-[15px]" contentClassName="p-5 md:p-6">
        <div className="p-4 md:p-5 space-y-4 md:space-y-5 bg-red-950/20 border border-red-900/40 rounded-lg">
           <div className="flex items-center gap-3 text-red-500">
             <ShieldAlert size={22} />
             <h4 className="text-[13px] md:text-[15px] font-black uppercase tracking-widest">Advanced Debug Control</h4>
           </div>
           <p className="text-[14px] md:text-[15px] text-white/95 leading-snug italic">
             Simulate all remaining fixtures to week 38, then advance week to process results.
           </p>
           <Button 
            onClick={fastForwardSeason} 
            className="w-full h-12 md:h-14 bg-red-600 hover:bg-red-700 text-white text-[13px] md:text-[14px] font-bold retro-button flex items-center justify-center gap-2 shadow-lg uppercase"
           >
             <FastForward size={20} /> SKIP TO END OF SEASON
           </Button>
           <div className="pt-4 border-t border-red-900/40">
             <label className="text-[13px] md:text-[14px] font-bold text-white uppercase block mb-2">Match engine</label>
             <div className="flex gap-2">
               <Button
                 size="sm"
                 variant={state.enginePreset === 'realistic' ? 'default' : 'outline'}
                 className="flex-1 text-[13px] md:text-[14px] font-semibold"
                 onClick={() => setEnginePreset('realistic')}
               >
                 Realistic
               </Button>
               <Button
                 size="sm"
                 variant={state.enginePreset === 'arcade' ? 'default' : 'outline'}
                 className="flex-1 text-[13px] md:text-[14px] font-semibold"
                 onClick={() => setEnginePreset('arcade')}
               >
                 Arcade
               </Button>
             </div>
             <p className="text-[13px] md:text-[14px] text-white/80 mt-2">Realistic = lower scoring, fewer cards. Arcade = more goals & cards.</p>
           </div>
        </div>
      </RetroWindow>

      <RetroWindow title="CHRONOLOGICAL CONFIG" titleClassName="text-[14px] md:text-[15px]" contentClassName="p-5 md:p-6">
        <div className="flex items-end gap-6 p-2">
          <div className="flex-1 space-y-2">
            <label className="text-[13px] md:text-[14px] font-bold text-primary uppercase block">Current Season Starting Year</label>
            <Input 
              type="number" 
              value={newSeason} 
              onChange={(e) => setNewSeason(e.target.value)}
              className="bg-card border-primary/20 h-10 md:h-12 text-[15px] md:text-[16px] font-mono font-semibold"
            />
          </div>
          <Button onClick={handleSeasonChange} className="retro-button bg-accent text-accent-foreground h-10 md:h-12 px-6 text-[13px] md:text-[14px] font-bold uppercase">
            <History size={18} className="mr-2" /> UPDATE TIMELINE
          </Button>
        </div>
        <p className="text-[14px] md:text-[15px] text-white/90 italic px-2 pb-2 pt-1 leading-snug">
          * Warning: Changing the starting year will shift all historical records and fixture dates for your current career.
        </p>
      </RetroWindow>

      <RetroWindow title="GLOBAL DATABASE EDITOR: TEAM NAMES" titleClassName="text-[14px] md:text-[15px]" noPadding>
        <div className="p-4 md:p-5 bg-primary/5 border-b border-primary/20 flex items-center gap-3">
          <Database size={22} className="text-primary" />
          <p className="text-[14px] md:text-[15px] text-white leading-snug">
            Renaming teams here will update them in your current save AND for all <span className="text-primary font-bold">FUTURE NEW GAMES</span> you start.
          </p>
        </div>
        <div className="max-h-[500px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/20 border-b-2 border-primary/40 hover:bg-primary/20">
                <TableHead className="text-[14px] uppercase font-bold py-4 text-white tracking-wide">Original ID</TableHead>
                <TableHead className="text-[14px] uppercase font-bold py-4 text-white tracking-wide">Team Name</TableHead>
                <TableHead className="text-right text-[14px] uppercase font-bold py-4 text-white tracking-wide">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.teams.map((t) => (
                <TableRow key={t.id} className="border-b border-primary/5 hover:bg-primary/5">
                  <TableCell className="text-[15px] md:text-[16px] font-mono text-white/90 py-3">{t.id}</TableCell>
                  <TableCell className="text-[15px] md:text-[16px] font-bold py-3 text-white">
                    {editingTeamId === t.id ? (
                      <Input 
                        value={tempTeamName} 
                        onChange={(e) => setTempTeamName(e.target.value)}
                        className="h-9 md:h-10 text-[15px] md:text-[16px] bg-card border-accent font-bold"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveTeamName()}
                      />
                    ) : (
                      t.name.toUpperCase()
                    )}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    {editingTeamId === t.id ? (
                      <Button onClick={saveTeamName} className="h-9 md:h-10 text-[13px] md:text-[14px] font-bold bg-accent text-accent-foreground retro-button px-4 uppercase">
                        <Save size={14} className="mr-2" /> SAVE GLOBAL
                      </Button>
                    ) : (
                      <Button onClick={() => startEditingTeam(t.id, t.name)} variant="outline" className="h-9 md:h-10 text-[13px] md:text-[14px] font-bold retro-button px-4 uppercase">
                        <Edit2 size={14} className="mr-2" /> EDIT NAME
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </RetroWindow>
    </div>
  );
}
