
"use client"

import { useGame } from '@/lib/store';
import { RetroWindow } from './RetroWindow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function StaffManagement() {
  const { state, hireStaff, fireStaff } = useGame();
  const userTeam = state.teams.find(t => t.id === state.userTeamId);

  if (!userTeam) return null;

  return (
    <div className="space-y-6">
      <RetroWindow title="CURRENT BACKROOM STAFF">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-primary/40 bg-primary/20">
              <TableHead className="text-[12px] uppercase font-black text-white tracking-wide">Name</TableHead>
              <TableHead className="text-[12px] uppercase font-black text-white tracking-wide">Role</TableHead>
              <TableHead className="text-center text-[12px] uppercase font-black text-white tracking-wide">Rating</TableHead>
              <TableHead className="text-right text-[12px] uppercase font-black text-white tracking-wide">Wage</TableHead>
              <TableHead className="text-right text-[12px] uppercase font-black text-white tracking-wide">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userTeam.staff.map((s) => (
              <TableRow key={s.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                <TableCell className="text-xs font-bold">{s.name.toUpperCase()}</TableCell>
                <TableCell className="text-xs">
                  <Badge variant="outline" className="text-[8px] h-4 uppercase">{s.role}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono text-cyan text-xs">{s.rating}/20</TableCell>
                <TableCell className="text-right font-mono text-xs">£{s.wage}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    onClick={() => fireStaff(s.id)} 
                    variant="destructive"
                    className="h-6 text-[8px] retro-button px-2"
                  >
                    DISMISS
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {userTeam.staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground text-xs italic">
                  No staff employed. Team performance will suffer.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </RetroWindow>

      <RetroWindow title="STAFF JOB APPLICANTS">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-primary/40 bg-primary/20">
              <TableHead className="text-[12px] uppercase font-black text-white tracking-wide">Name</TableHead>
              <TableHead className="text-[12px] uppercase font-black text-white tracking-wide">Role</TableHead>
              <TableHead className="text-center text-[12px] uppercase font-black text-white tracking-wide">Rating</TableHead>
              <TableHead className="text-right text-[12px] uppercase font-black text-white tracking-wide">Wage</TableHead>
              <TableHead className="text-right text-[12px] uppercase font-black text-white tracking-wide">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.availableStaff.map((s) => (
              <TableRow key={s.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                <TableCell className="text-xs font-bold">{s.name.toUpperCase()}</TableCell>
                <TableCell className="text-xs">
                  <Badge variant="outline" className="text-[8px] h-4 uppercase">{s.role}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono text-cyan text-xs">{s.rating}/20</TableCell>
                <TableCell className="text-right font-mono text-xs">£{s.wage}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    onClick={() => hireStaff(s.id)} 
                    className="h-6 text-[8px] bg-accent/20 text-accent hover:bg-accent hover:text-accent-foreground retro-button px-2"
                  >
                    APPOINT
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </RetroWindow>
    </div>
  );
}
