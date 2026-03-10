
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
              <TableHead className="text-[12px] max-[1300px]:text-[20px] uppercase font-black text-white tracking-wide py-5">Name</TableHead>
              <TableHead className="text-[12px] max-[1300px]:text-[20px] uppercase font-black text-white tracking-wide py-5">Role</TableHead>
              <TableHead className="text-center text-[12px] max-[1300px]:text-[20px] uppercase font-black text-white tracking-wide py-5">Rating</TableHead>
              <TableHead className="text-right text-[12px] max-[1300px]:text-[20px] uppercase font-black text-white tracking-wide py-5">Wage</TableHead>
              <TableHead className="text-right text-[12px] max-[1300px]:text-[20px] uppercase font-black text-white tracking-wide py-5">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userTeam.staff.map((s) => (
              <TableRow key={s.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                <TableCell className="text-xs max-[1300px]:text-[20px] font-bold py-5">{s.name.toUpperCase()}</TableCell>
                <TableCell className="text-xs max-[1300px]:py-5">
                  <Badge variant="outline" className="text-[8px] max-[1300px]:text-[14px] h-4 max-[1300px]:h-7 px-2 max-[1300px]:px-4 uppercase">{s.role}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono text-cyan text-xs max-[1300px]:text-[20px] py-5">{s.rating}/20</TableCell>
                <TableCell className="text-right font-mono text-xs max-[1300px]:text-[20px] py-5">£{s.wage}</TableCell>
                <TableCell className="text-right py-5">
                  <Button 
                    onClick={() => fireStaff(s.id)} 
                    variant="destructive"
                    className="h-6 max-[1300px]:h-10 text-[8px] max-[1300px]:text-[14px] retro-button px-2 max-[1300px]:px-4"
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
              <TableHead className="text-[12px] max-[1300px]:text-[20px] uppercase font-black text-white tracking-wide py-5">Name</TableHead>
              <TableHead className="text-[12px] max-[1300px]:text-[20px] uppercase font-black text-white tracking-wide py-5">Role</TableHead>
              <TableHead className="text-center text-[12px] max-[1300px]:text-[20px] uppercase font-black text-white tracking-wide py-5">Rating</TableHead>
              <TableHead className="text-right text-[12px] max-[1300px]:text-[20px] uppercase font-black text-white tracking-wide py-5">Wage</TableHead>
              <TableHead className="text-right text-[12px] max-[1300px]:text-[20px] uppercase font-black text-white tracking-wide py-5">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.availableStaff.map((s) => (
              <TableRow key={s.id} className="hover:bg-primary/5 transition-colors border-b border-primary/5">
                <TableCell className="text-xs max-[1300px]:text-[20px] font-bold py-5">{s.name.toUpperCase()}</TableCell>
                <TableCell className="text-xs max-[1300px]:py-5">
                  <Badge variant="outline" className="text-[8px] max-[1300px]:text-[14px] h-4 max-[1300px]:h-7 px-2 max-[1300px]:px-4 uppercase">{s.role}</Badge>
                </TableCell>
                <TableCell className="text-center font-mono text-cyan text-xs max-[1300px]:text-[20px] py-5">{s.rating}/20</TableCell>
                <TableCell className="text-right font-mono text-xs max-[1300px]:text-[20px] py-5">£{s.wage}</TableCell>
                <TableCell className="text-right py-5">
                  <Button 
                    onClick={() => hireStaff(s.id)} 
                    className="h-6 max-[1300px]:h-10 text-[8px] max-[1300px]:text-[14px] bg-accent/20 text-accent hover:bg-accent hover:text-accent-foreground retro-button px-2 max-[1300px]:px-4"
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
