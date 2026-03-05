
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
    <div className="space-y-6 max-md:space-y-3">
      <RetroWindow title="SIMULATION & TESTING TOOLS">
        <div className="p-4 max-md:p-2 space-y-4 max-md:space-y-2 bg-red-950/20 border-b border-red-900/40">
           <div className="flex items-center gap-3 max-md:gap-2 text-red-500">
             <ShieldAlert size={20} className="max-md:w-4 max-md:h-4" />
             <h4 className="text-[12px] max-md:text-sm font-black uppercase tracking-widest">Advanced Debug Control</h4>
           </div>
           <p className="text-[11px] max-md:text-sm text-white leading-tight italic">
             Simulate all remaining fixtures to week 38, then advance week to process results.
           </p>
           <Button 
            onClick={fastForwardSeason} 
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-black retro-button flex items-center justify-center gap-2 shadow-lg"
           >
             <FastForward size={20} /> SKIP TO END OF SEASON
           </Button>
           <div className="pt-3 border-t border-red-900/40">
             <label className="text-[11px] max-md:text-sm font-bold text-white uppercase block mb-2">Match engine</label>
             <div className="flex gap-2">
               <Button
                 size="sm"
                 variant={state.enginePreset === 'realistic' ? 'default' : 'outline'}
                 className="flex-1"
                 onClick={() => setEnginePreset('realistic')}
               >
                 Realistic
               </Button>
               <Button
                 size="sm"
                 variant={state.enginePreset === 'arcade' ? 'default' : 'outline'}
                 className="flex-1"
                 onClick={() => setEnginePreset('arcade')}
               >
                 Arcade
               </Button>
             </div>
             <p className="text-[10px] max-md:text-sm text-white mt-1">Realistic = lower scoring, fewer cards. Arcade = more goals & cards.</p>
           </div>
        </div>
      </RetroWindow>

      <RetroWindow title="CHRONOLOGICAL CONFIG">
        <div className="flex items-end gap-6 max-md:gap-2 p-3 max-md:p-2">
          <div className="flex-1 space-y-2 max-md:space-y-1">
            <label className="text-[12px] max-md:text-sm font-bold text-primary uppercase">Current Season Starting Year</label>
            <Input 
              type="number" 
              value={newSeason} 
              onChange={(e) => setNewSeason(e.target.value)}
              className="bg-card border-primary/20 h-10 max-md:h-11 text-[14px] max-md:text-base font-mono"
            />
          </div>
          <Button onClick={handleSeasonChange} className="retro-button bg-accent text-accent-foreground h-10 px-6 font-bold">
            <History size={18} className="mr-2" /> UPDATE TIMELINE
          </Button>
        </div>
        <p className="text-[11px] max-md:text-sm text-white italic px-3 pb-3 leading-tight">
          * Warning: Changing the starting year will shift all historical records and fixture dates for your current career.
        </p>
      </RetroWindow>

      <RetroWindow title="GLOBAL DATABASE EDITOR: TEAM NAMES" noPadding>
        <div className="p-4 max-md:p-2 bg-primary/5 border-b border-primary/20 flex items-center gap-3 max-md:gap-2">
          <Database size={20} className="text-primary max-md:w-4 max-md:h-4" />
          <p className="text-[12px] max-md:text-sm text-white leading-tight">
            Renaming teams here will update them in your current save AND for all <span className="text-primary font-bold">FUTURE NEW GAMES</span> you start.
          </p>
        </div>
        <div className="max-h-[500px] overflow-auto">
          <Table className="max-md:[&_th]:leading-none max-md:[&_td]:leading-none max-md:[&_thead_th]:h-auto max-md:[&_thead_th]:py-1 max-md:[&_td]:py-0.5">
            <TableHeader>
              <TableRow className="bg-primary/20 border-b-2 border-primary/40">
                <TableHead className="text-[13px] max-md:text-sm uppercase font-black py-4 max-md:py-1 text-white tracking-wide">Original ID</TableHead>
                <TableHead className="text-[13px] max-md:text-sm uppercase font-black py-4 max-md:py-1 text-white tracking-wide">Team Name</TableHead>
                <TableHead className="text-right text-[13px] max-md:text-sm uppercase font-black py-4 max-md:py-1 text-white tracking-wide">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.teams.map((t) => (
                <TableRow key={t.id} className="border-b border-primary/5 hover:bg-primary/5">
                  <TableCell className="text-[11px] max-md:text-sm font-mono text-white py-3 max-md:py-0.5">{t.id}</TableCell>
                  <TableCell className="text-[13px] max-md:text-sm font-bold py-3 max-md:py-0.5">
                    {editingTeamId === t.id ? (
                      <Input 
                        value={tempTeamName} 
                        onChange={(e) => setTempTeamName(e.target.value)}
                        className="h-8 max-md:h-9 text-[13px] max-md:text-sm bg-card border-accent font-bold"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveTeamName()}
                      />
                    ) : (
                      t.name.toUpperCase()
                    )}
                  </TableCell>
                  <TableCell className="text-right py-3 max-md:py-0.5">
                    {editingTeamId === t.id ? (
                      <Button onClick={saveTeamName} className="h-8 text-[10px] max-md:text-[11px] bg-accent text-accent-foreground retro-button px-4 font-bold">
                        <Save size={14} className="mr-2" /> SAVE GLOBAL
                      </Button>
                    ) : (
                      <Button onClick={() => startEditingTeam(t.id, t.name)} variant="outline" className="h-8 max-md:h-9 text-[10px] max-md:text-sm retro-button px-4 font-bold">
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
