
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
    <div className="space-y-6 max-md:space-y-3">
      <RetroWindow title="CURRENT BACKROOM STAFF">
        <Table className="max-md:[&_th]:leading-none max-md:[&_td]:leading-none max-md:[&_thead_th]:h-auto max-md:[&_thead_th]:py-1 max-md:[&_td]:py-0.5">
          <TableHeader>
            <TableRow className="border-b-2 border-primary/40 bg-primary/20">
              <TableHead className="text-[12px] max-md:text-sm uppercase font-black text-white tracking-wide py-4 max-md:py-1">Name</TableHead>
              <TableHead className="text-[12px] max-md:text-sm uppercase font-black text-white tracking-wide py-4 max-md:py-1">Role</TableHead>
              <TableHead className="text-center text-[12px] max-md:text-sm uppercase font-black text-white tracking-wide py-4 max-md:py-1">Rating</TableHead>
              <TableHead className="text-right text-[12px] max-md:text-sm uppercase font-black text-white tracking-wide py-4 max-md:py-1">Wage</TableHead>
              <TableHead className="text-right text-[12px] max-md:text-sm uppercase font-black text-white tracking-wide py-4 max-md:py-1">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userTeam.staff.map((s) => (
              <TableRow key={s.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                <TableCell className="text-xs max-md:text-sm font-bold py-2.5 max-md:py-0.5">{s.name.toUpperCase()}</TableCell>
                <TableCell className="text-xs max-md:text-sm py-2.5 max-md:py-0.5">
                  <Badge variant="outline" className="text-[8px] max-md:text-xs h-4 max-md:h-5 uppercase">{s.role}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono text-cyan text-xs max-md:text-sm py-2.5 max-md:py-0.5">{s.rating}/20</TableCell>
                <TableCell className="text-right font-mono text-xs max-md:text-sm py-2.5 max-md:py-0.5">£{s.wage}</TableCell>
                <TableCell className="text-right py-2.5 max-md:py-0.5">
                  <Button 
                    onClick={() => fireStaff(s.id)} 
                    variant="destructive"
                    className="h-6 max-md:h-7 text-[8px] max-md:text-xs retro-button px-2"
                  >
                    DISMISS
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {userTeam.staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 max-md:py-2 text-white text-xs max-md:text-sm italic">
                  No staff employed. Team performance will suffer.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </RetroWindow>

      <RetroWindow title="STAFF JOB APPLICANTS">
        <Table className="max-md:[&_th]:leading-none max-md:[&_td]:leading-none max-md:[&_thead_th]:h-auto max-md:[&_thead_th]:py-1 max-md:[&_td]:py-0.5">
          <TableHeader>
            <TableRow className="border-b-2 border-primary/40 bg-primary/20">
              <TableHead className="text-[12px] max-md:text-sm uppercase font-black text-white tracking-wide py-4 max-md:py-1">Name</TableHead>
              <TableHead className="text-[12px] max-md:text-sm uppercase font-black text-white tracking-wide py-4 max-md:py-1">Role</TableHead>
              <TableHead className="text-center text-[12px] max-md:text-sm uppercase font-black text-white tracking-wide py-4 max-md:py-1">Rating</TableHead>
              <TableHead className="text-right text-[12px] max-md:text-sm uppercase font-black text-white tracking-wide py-4 max-md:py-1">Wage</TableHead>
              <TableHead className="text-right text-[12px] max-md:text-sm uppercase font-black text-white tracking-wide py-4 max-md:py-1">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.availableStaff.map((s) => (
              <TableRow key={s.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                <TableCell className="text-xs max-md:text-sm font-bold py-2.5 max-md:py-0.5">{s.name.toUpperCase()}</TableCell>
                <TableCell className="text-xs max-md:text-sm py-2.5 max-md:py-0.5">
                  <Badge variant="outline" className="text-[8px] max-md:text-xs h-4 max-md:h-5 uppercase">{s.role}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono text-cyan text-xs max-md:text-sm py-2.5 max-md:py-0.5">{s.rating}/20</TableCell>
                <TableCell className="text-right font-mono text-xs max-md:text-sm py-2.5 max-md:py-0.5">£{s.wage}</TableCell>
                <TableCell className="text-right py-2.5 max-md:py-0.5">
                  <Button 
                    onClick={() => hireStaff(s.id)} 
                    className="h-6 max-md:h-7 text-[8px] max-md:text-xs bg-accent/20 text-accent hover:bg-accent hover:text-accent-foreground retro-button px-2"
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
