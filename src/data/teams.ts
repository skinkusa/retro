/**
 * Team definitions: names, colors, capacity, division, style, formation.
 * Every team has two home colors (color + homeTextColor) and two away colors (awayColor + awayTextColor).
 * homeColorCategory is used for clash detection: when both teams have the same category, the away team uses their away kit.
 */

import type { PlayStyle, KitColorCategory } from '@/types/game';

export interface TeamDefinition {
  name: string;
  /** Home kit primary (first of two home colors). */
  color: string;
  /** Home kit secondary/text (second of two home colors). */
  homeTextColor: string;
  /** Away kit primary (first of two away colors). */
  awayColor: string;
  /** Away kit secondary/text (second of two away colors). */
  awayTextColor: string;
  /** Category of home kit for clash detection (e.g. any shade of red => 'red'). */
  homeColorCategory: KitColorCategory;
  /** @deprecated Stadium is always "{name} Stadium". Kept for type compatibility. */
  stadium?: string;
  stadiumCapacity: number;
  division: number;
  style: PlayStyle;
  formation: string;
}

const WHITE = "#FFFFFF";

/** Fictional club names for divisions 2–4 (used in headlines, tables, etc.). */
const LOWER_LEAGUE_NAMES: string[] = [
  'Blackpool Rovers', 'Preston North', 'Burnley Town', 'Blackburn Athletic', 'Bolton Wanderers',
  'Wigan Athletic', 'Huddersfield Town', 'Middlesbrough Blue', 'Sunderland Red', 'Derby County',
  'Stoke City', 'Port Vale', 'Crewe Alexandra', 'Shrewsbury Town', 'Walsall FC',
  'Coventry Sky Blue', 'Luton Town', 'Watford Yellow', 'Reading Royals', 'Millwall Lions',
  'Charlton Athletic', 'Barnsley Reds', 'Rotherham United', 'Doncaster Rovers', 'Sheffield Wednesday',
  'Hull City', 'Grimsby Town', 'Lincoln City', 'Peterborough United', 'Cambridge United',
  'Ipswich Town', 'Norwich Canaries', 'Colchester United', 'Southend United', 'Gillingham FC',
  'Plymouth Argyle', 'Exeter City', 'Bristol Rovers', 'Swindon Town', 'Oxford United',
  'Portsmouth FC', 'Bournemouth Cherries', 'Cardiff Blue',
  'Swansea City', 'Newport County', 'Northampton Town', 'Wycombe Wanderers', 'MK Dons',
  'Leyton Orient', 'AFC Wimbledon', 'Sutton United', 'Harrogate Town', 'Scunthorpe United',
  'Fleetwood Town', 'Accrington Stanley', 'Morecambe FC', 'Barrow AFC', 'Carlisle United',
  'Rochdale AFC', 'Tranmere Rovers',
];

export const TEAM_DEFINITIONS: TeamDefinition[] = [
  { name: "North London Red", color: "#EF0107", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#132257", homeColorCategory: 'red', stadiumCapacity: 60000, division: 1, style: 'Tiki-Taka', formation: '4-3-3' },
  { name: "North London White", color: WHITE, homeTextColor: "#132257", awayColor: "#132257", awayTextColor: WHITE, homeColorCategory: 'white', stadiumCapacity: 62000, division: 1, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Merseyside Red", color: "#C8102E", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#C8102E", homeColorCategory: 'red', stadiumCapacity: 54000, division: 1, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Merseyside Blue", color: "#003399", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#003399", homeColorCategory: 'blue', stadiumCapacity: 40000, division: 1, style: 'Direct', formation: '4-4-2' },
  { name: "Manchester Red", color: "#DA291C", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#DA291C", homeColorCategory: 'red', stadiumCapacity: 75000, division: 1, style: 'Direct', formation: '4-4-2' },
  { name: "Manchester Light Blue", color: "#6CABDD", homeTextColor: "#1B2E5C", awayColor: WHITE, awayTextColor: "#1B2E5C", homeColorCategory: 'sky_blue', stadiumCapacity: 53000, division: 1, style: 'Tiki-Taka', formation: '4-3-3' },
  { name: "West London Blue", color: "#034694", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#034694", homeColorCategory: 'blue', stadiumCapacity: 41000, division: 1, style: 'Tiki-Taka', formation: '4-3-3' },
  { name: "Birmingham Villa", color: "#670E36", homeTextColor: WHITE, awayColor: "#95BFE5", awayTextColor: "#670E36", homeColorCategory: 'maroon', stadiumCapacity: 42000, division: 1, style: 'Direct', formation: '4-4-2' },
  { name: "Newcastle Black & White", color: "#241F20", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#241F20", homeColorCategory: 'black', stadiumCapacity: 52000, division: 1, style: 'Long Ball', formation: '4-4-2' },
  { name: "West Ham Maroon", color: "#7A263A", homeTextColor: WHITE, awayColor: "#1BB1E7", awayTextColor: "#0d3d56", homeColorCategory: 'maroon', stadiumCapacity: 60000, division: 1, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Leicester Blue", color: "#003090", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#003090", homeColorCategory: 'blue', stadiumCapacity: 32000, division: 1, style: 'Counter-Attack', formation: '4-4-2' },
  { name: "Wolverhampton Gold", color: "#FDB913", homeTextColor: "#241F20", awayColor: WHITE, awayTextColor: "#241F20", homeColorCategory: 'gold', stadiumCapacity: 31000, division: 1, style: 'Direct', formation: '4-3-3' },
  { name: "Brighton Blue & White", color: "#0057B8", homeTextColor: WHITE, awayColor: "#FFFF00", awayTextColor: "#0057B8", homeColorCategory: 'blue', stadiumCapacity: 30000, division: 1, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Crystal Palace Red & Blue", color: "#1B458F", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#1B458F", homeColorCategory: 'blue', stadiumCapacity: 26000, division: 1, style: 'Counter-Attack', formation: '4-4-2' },
  { name: "Southampton Red & White", color: "#D71920", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#D71920", homeColorCategory: 'red', stadiumCapacity: 32000, division: 1, style: 'Direct', formation: '4-4-2' },
  { name: "Fulham White", color: "#000000", homeTextColor: WHITE, awayColor: "#C0C0C0", awayTextColor: "#000000", homeColorCategory: 'black', stadiumCapacity: 25000, division: 1, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Brentford Red & White", color: "#E30613", homeTextColor: WHITE, awayColor: "#000000", awayTextColor: WHITE, homeColorCategory: 'red', stadiumCapacity: 17000, division: 1, style: 'Direct', formation: '4-3-3' },
  { name: "Leeds White", color: WHITE, homeTextColor: "#003366", awayColor: "#FFCD00", awayTextColor: "#003366", homeColorCategory: 'white', stadiumCapacity: 37000, division: 1, style: 'Direct', formation: '4-4-2' },
  { name: "Nottingham Forest Red", color: "#DD0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#DD0000", homeColorCategory: 'red', stadiumCapacity: 30000, division: 1, style: 'Counter-Attack', formation: '4-5-1' },
  { name: "Sheffield Red & White", color: WHITE, homeTextColor: "#EE2737", awayColor: "#EE2737", awayTextColor: WHITE, homeColorCategory: 'white', stadiumCapacity: 32000, division: 1, style: 'Park the Bus', formation: '5-3-2' },
  ...Array.from({ length: 60 }).map((_, i) => {
    const isBlue = i % 2 === 0;
    const homeColor = isBlue ? "#4079b0" : "#26D975";
    const homeText = WHITE;
    const awayColor = isBlue ? "#1a5c38" : "#0d3d56";
    const awayText = WHITE;
    const homeCategory: KitColorCategory = isBlue ? 'blue' : 'green';
    return {
      name: LOWER_LEAGUE_NAMES[i],
      color: homeColor,
      homeTextColor: homeText,
      awayColor,
      awayTextColor: awayText,
      homeColorCategory: homeCategory,
      stadiumCapacity: 5000 + Math.floor(Math.random() * 15000),
      division: i < 20 ? 2 : i < 40 ? 3 : 4,
      style: 'Pass to Feet' as PlayStyle,
      formation: '4-4-2',
    };
  }),
];
