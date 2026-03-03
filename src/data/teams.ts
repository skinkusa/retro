/**
 * Team definitions: names, colors, stadiums, capacity, division, style, formation.
 * Edit this file to add teams, change names, colors, or stadium names.
 * Omit stadium to use "{Team Name} Grounds" by default.
 */

import type { PlayStyle } from '@/types/game';

export interface TeamDefinition {
  name: string;
  color: string;
  awayColor: string;
  /** Stadium name; if omitted, defaults to "{name} Grounds". */
  stadium?: string;
  stadiumCapacity: number;
  division: number;
  style: PlayStyle;
  formation: string;
}

export const TEAM_DEFINITIONS: TeamDefinition[] = [
  { name: "North London Red", color: "#EF0107", awayColor: "#FFFFFF", stadium: "The Red Stadium", stadiumCapacity: 60000, division: 1, style: 'Tiki-Taka', formation: '4-3-3' },
  { name: "North London White", color: "#FFFFFF", awayColor: "#132257", stadium: "White Hart Lane", stadiumCapacity: 62000, division: 1, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Merseyside Red", color: "#C8102E", awayColor: "#FFFFFF", stadium: "Anfield", stadiumCapacity: 54000, division: 1, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Merseyside Blue", color: "#003399", awayColor: "#FFFFFF", stadium: "Goodison Park", stadiumCapacity: 40000, division: 1, style: 'Direct', formation: '4-4-2' },
  { name: "Manchester Red", color: "#DA291C", awayColor: "#FFFFFF", stadium: "Old Trafford", stadiumCapacity: 75000, division: 1, style: 'Direct', formation: '4-4-2' },
  { name: "Manchester Light Blue", color: "#6CABDD", awayColor: "#FFFFFF", stadium: "City Ground", stadiumCapacity: 53000, division: 1, style: 'Tiki-Taka', formation: '4-3-3' },
  { name: "West London Blue", color: "#034694", awayColor: "#FFFFFF", stadium: "Stamford Bridge", stadiumCapacity: 41000, division: 1, style: 'Tiki-Taka', formation: '4-3-3' },
  { name: "Birmingham Villa", color: "#670E36", awayColor: "#95BFE5", stadium: "Villa Park", stadiumCapacity: 42000, division: 1, style: 'Direct', formation: '4-4-2' },
  { name: "Newcastle Black & White", color: "#241F20", awayColor: "#FFFFFF", stadium: "St James' Park", stadiumCapacity: 52000, division: 1, style: 'Long Ball', formation: '4-4-2' },
  { name: "West Ham Maroon", color: "#7A263A", awayColor: "#1BB1E7", stadium: "London Stadium", stadiumCapacity: 60000, division: 1, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Leicester Blue", color: "#003090", awayColor: "#FFFFFF", stadium: "King Power Stadium", stadiumCapacity: 32000, division: 1, style: 'Counter-Attack', formation: '4-4-2' },
  { name: "Wolverhampton Gold", color: "#FDB913", awayColor: "#FFFFFF", stadium: "Molineux", stadiumCapacity: 31000, division: 1, style: 'Direct', formation: '4-3-3' },
  { name: "Brighton Blue & White", color: "#0057B8", awayColor: "#FFFF00", stadium: "Amex Stadium", stadiumCapacity: 30000, division: 1, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Crystal Palace Red & Blue", color: "#1B458F", awayColor: "#FFFFFF", stadium: "Selhurst Park", stadiumCapacity: 26000, division: 1, style: 'Counter-Attack', formation: '4-4-2' },
  { name: "Southampton Red & White", color: "#D71920", awayColor: "#FFFFFF", stadium: "St Mary's", stadiumCapacity: 32000, division: 1, style: 'Direct', formation: '4-4-2' },
  { name: "Fulham White", color: "#000000", awayColor: "#C0C0C0", stadium: "Craven Cottage", stadiumCapacity: 25000, division: 1, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Brentford Red & White", color: "#E30613", awayColor: "#000000", stadium: "Brentford Community Stadium", stadiumCapacity: 17000, division: 1, style: 'Direct', formation: '4-3-3' },
  { name: "Leeds White", color: "#FFFFFF", awayColor: "#FFCD00", stadium: "Elland Road", stadiumCapacity: 37000, division: 1, style: 'Direct', formation: '4-4-2' },
  { name: "Nottingham Forest Red", color: "#DD0000", awayColor: "#FFFFFF", stadium: "City Ground", stadiumCapacity: 30000, division: 1, style: 'Counter-Attack', formation: '4-5-1' },
  { name: "Sheffield Red & White", color: "#EE2737", awayColor: "#FFFFFF", stadium: "Bramall Lane", stadiumCapacity: 32000, division: 1, style: 'Park the Bus', formation: '5-3-2' },
  ...Array.from({ length: 60 }).map((_, i) => ({
    name: `Club ${i + 21}`,
    color: i % 2 === 0 ? "#4079b0" : "#26D975",
    awayColor: "#FFFFFF",
    stadium: undefined as string | undefined,
    stadiumCapacity: 5000 + Math.floor(Math.random() * 15000),
    division: i < 20 ? 2 : i < 40 ? 3 : 4,
    style: 'Pass to Feet' as PlayStyle,
    formation: '4-4-2',
  })),
];
