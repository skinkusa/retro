
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
    <div className="space-y-6 md:space-y-8">
      <RetroWindow title="CURRENT BACKROOM STAFF" titleClassName="text-[14px] md:text-[15px]" contentClassName="p-5 md:p-6">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-primary/40 bg-primary/20 hover:bg-primary/20">
              <TableHead className="text-[14px] uppercase font-bold text-white tracking-wide py-4">Name</TableHead>
              <TableHead className="text-[14px] uppercase font-bold text-white tracking-wide py-4">Role</TableHead>
              <TableHead className="text-center text-[14px] uppercase font-bold text-white tracking-wide py-4">Rating</TableHead>
              <TableHead className="text-right text-[14px] uppercase font-bold text-white tracking-wide py-4">Wage</TableHead>
              <TableHead className="text-right text-[14px] uppercase font-bold text-white tracking-wide py-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userTeam.staff.map((s) => (
              <TableRow key={s.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                <TableCell className="text-[15px] md:text-[16px] font-bold py-3 text-white">{s.name.toUpperCase()}</TableCell>
                <TableCell className="py-3">
                  <Badge variant="outline" className="text-[12px] md:text-[13px] h-6 md:h-7 uppercase font-semibold">{s.role}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono text-cyan text-[15px] md:text-[16px] font-semibold py-3">{s.rating}/20</TableCell>
                <TableCell className="text-right font-mono text-[15px] md:text-[16px] py-3">£{s.wage}</TableCell>
                <TableCell className="text-right py-3">
                  <Button 
                    onClick={() => fireStaff(s.id)} 
                    variant="destructive"
                    className="h-9 md:h-10 text-[13px] md:text-[14px] font-bold retro-button px-4 uppercase"
                  >
                    DISMISS
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {userTeam.staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 md:py-16 text-white/70 text-[15px] md:text-[16px] italic">
                  No staff employed. Team performance will suffer.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </RetroWindow>

      <RetroWindow title="STAFF JOB APPLICANTS" titleClassName="text-[14px] md:text-[15px]" contentClassName="p-5 md:p-6">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-primary/40 bg-primary/20 hover:bg-primary/20">
              <TableHead className="text-[14px] uppercase font-bold text-white tracking-wide py-4">Name</TableHead>
              <TableHead className="text-[14px] uppercase font-bold text-white tracking-wide py-4">Role</TableHead>
              <TableHead className="text-center text-[14px] uppercase font-bold text-white tracking-wide py-4">Rating</TableHead>
              <TableHead className="text-right text-[14px] uppercase font-bold text-white tracking-wide py-4">Wage</TableHead>
              <TableHead className="text-right text-[14px] uppercase font-bold text-white tracking-wide py-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.availableStaff.map((s) => (
              <TableRow key={s.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                <TableCell className="text-[15px] md:text-[16px] font-bold py-3 text-white">{s.name.toUpperCase()}</TableCell>
                <TableCell className="py-3">
                  <Badge variant="outline" className="text-[12px] md:text-[13px] h-6 md:h-7 uppercase font-semibold">{s.role}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono text-cyan text-[15px] md:text-[16px] font-semibold py-3">{s.rating}/20</TableCell>
                <TableCell className="text-right font-mono text-[15px] md:text-[16px] py-3">£{s.wage}</TableCell>
                <TableCell className="text-right py-3">
                  <Button 
                    onClick={() => hireStaff(s.id)} 
                    className="h-9 md:h-10 text-[13px] md:text-[14px] font-bold bg-accent/20 text-accent hover:bg-accent hover:text-accent-foreground retro-button px-4 uppercase"
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
