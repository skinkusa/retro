/**
 * Modular staff configuration. Each team starts with defaultPerTeam of each role.
 * To add a new role: add it to StaffRole in types/game.ts and add an entry here.
 */

import type { StaffRole } from '@/types/game';
import { FIRSTNAME_POOL, SURNAME_POOL } from '@/data/player-names';

export interface StaffRoleConfig {
  role: StaffRole;
  label: string;
  defaultPerTeam: number;
  /** Base wage multiplier by division (higher div = lower base). */
  baseWageDivisor: number;
  /** Rating range [min, max] for generated staff. */
  ratingRange: [number, number];
}

export const STAFF_ROLES: StaffRoleConfig[] = [
  { role: 'COACH', label: 'Coach', defaultPerTeam: 2, baseWageDivisor: 800, ratingRange: [8, 16] },
  { role: 'PHYSIO', label: 'Physio', defaultPerTeam: 1, baseWageDivisor: 600, ratingRange: [8, 15] },
  { role: 'SCOUT', label: 'Scout', defaultPerTeam: 1, baseWageDivisor: 500, ratingRange: [7, 14] },
];

export function generateStaffMember(
  role: StaffRole,
  teamId: string,
  division: number,
  index: number
): { id: string; name: string; role: StaffRole; rating: number; wage: number } {
  const config = STAFF_ROLES.find(c => c.role === role)!;
  const [minR, maxR] = config.ratingRange;
  const rating = minR + Math.floor(Math.random() * (maxR - minR + 1));
  const baseWage = (5 - division) * 400 + 200 + Math.floor(Math.random() * 500);
  const wage = Math.round((baseWage * rating) / config.baseWageDivisor);
  const name = `${FIRSTNAME_POOL[Math.floor(Math.random() * FIRSTNAME_POOL.length)]} ${SURNAME_POOL[Math.floor(Math.random() * SURNAME_POOL.length)]}`;
  return {
    id: `staff-${teamId}-${role}-${index}`,
    name,
    role,
    rating,
    wage: Math.max(100, wage),
  };
}
