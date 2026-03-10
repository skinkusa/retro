/**
 * Team definitions: names, colors, stadiums, capacity, division, style, formation.
 * Edit this file to add teams, change names, colors, or stadium names.
 * Omit stadium to use "{Team Name} Grounds" by default.
 */

import type { PlayStyle } from '@/types/game';

export interface TeamDefinition {
  name: string;
  /** Home kit background color. */
  color: string;
  /** Home kit text color (contrast with color). */
  homeTextColor: string;
  /** Away kit background color. */
  awayColor: string;
  /** Away kit text color (contrast with awayColor). */
  awayTextColor: string;
  /** Stadium name; if omitted, defaults to "{name} Grounds". */
  stadium?: string;
  stadiumCapacity: number;
  division: number;
  style: PlayStyle;
  formation: string;
  /** Optional explicit reputation (0-100). If omitted, game-data.ts calculates a default. */
  reputation?: number;
}

const WHITE = "#FFFFFF";

export const TEAM_DEFINITIONS: TeamDefinition[] = [
  // DIVISION 1 — reputations set to reflect real relative strength
  { name: "North London Red",       color: "#EF0107", homeTextColor: WHITE, awayColor: WHITE,     awayTextColor: "#132257", stadium: "The Red Stadium",               stadiumCapacity: 60000, division: 1, reputation: 95, style: 'Tiki-Taka',       formation: '4-3-3' },
  { name: "North London White",     color: WHITE,     homeTextColor: "#132257", awayColor: "#132257", awayTextColor: WHITE,     stadium: "White Hart Lane",              stadiumCapacity: 62000, division: 1, reputation: 82, style: 'Pass to Feet',   formation: '4-4-2' },
  { name: "Merseyside Red",         color: "#C8102E", homeTextColor: WHITE, awayColor: WHITE,     awayTextColor: "#C8102E", stadium: "Anfield",                      stadiumCapacity: 54000, division: 1, reputation: 93, style: 'Pass to Feet',   formation: '4-3-3' },
  { name: "Merseyside Blue",        color: "#003399", homeTextColor: WHITE, awayColor: WHITE,     awayTextColor: "#003399", stadium: "Goodison Park",                 stadiumCapacity: 40000, division: 1, reputation: 72, style: 'Direct',         formation: '4-4-2' },
  { name: "Manchester Red",         color: "#DA291C", homeTextColor: WHITE, awayColor: WHITE,     awayTextColor: "#DA291C", stadium: "Old Trafford",                  stadiumCapacity: 75000, division: 1, reputation: 85, style: 'Direct',         formation: '4-4-2' },
  { name: "Manchester Light Blue",  color: "#6CABDD", homeTextColor: "#1B2E5C", awayColor: WHITE, awayTextColor: "#1B2E5C", stadium: "City Ground",                  stadiumCapacity: 53000, division: 1, reputation: 97, style: 'Tiki-Taka',       formation: '4-3-3' },
  { name: "West London Blue",       color: "#034694", homeTextColor: WHITE, awayColor: WHITE,     awayTextColor: "#034694", stadium: "Stamford Bridge",               stadiumCapacity: 41000, division: 1, reputation: 87, style: 'Tiki-Taka',       formation: '4-3-3' },
  { name: "Birmingham Villa",       color: "#670E36", homeTextColor: WHITE, awayColor: "#95BFE5", awayTextColor: "#670E36", stadium: "Villa Park",                   stadiumCapacity: 42000, division: 1, reputation: 80, style: 'Direct',         formation: '4-4-2' },
  { name: "Newcastle Black & White",color: "#241F20", homeTextColor: WHITE, awayColor: WHITE,     awayTextColor: "#241F20", stadium: "St James' Park",               stadiumCapacity: 52000, division: 1, reputation: 83, style: 'Long Ball',      formation: '4-4-2' },
  { name: "West Ham Maroon",        color: "#7A263A", homeTextColor: WHITE, awayColor: "#1BB1E7", awayTextColor: "#0d3d56", stadium: "London Stadium",               stadiumCapacity: 60000, division: 1, reputation: 73, style: 'Pass to Feet',   formation: '4-4-2' },
  { name: "Leicester Blue",         color: "#003090", homeTextColor: WHITE, awayColor: WHITE,     awayTextColor: "#003090", stadium: "King Power Stadium",            stadiumCapacity: 32000, division: 1, reputation: 71, style: 'Counter-Attack', formation: '4-4-2' },
  { name: "Wolverhampton Gold",     color: "#FDB913", homeTextColor: "#241F20", awayColor: WHITE, awayTextColor: "#241F20", stadium: "Molineux",                    stadiumCapacity: 31000, division: 1, reputation: 74, style: 'Direct',         formation: '4-3-3' },
  { name: "Brighton Blue & White",  color: "#0057B8", homeTextColor: WHITE, awayColor: "#FFFF00", awayTextColor: "#0057B8", stadium: "Amex Stadium",                stadiumCapacity: 30000, division: 1, reputation: 76, style: 'Pass to Feet',   formation: '4-3-3' },
  { name: "Crystal Palace Red & Blue", color: "#1B458F", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#1B458F", stadium: "Selhurst Park",               stadiumCapacity: 26000, division: 1, reputation: 67, style: 'Counter-Attack', formation: '4-4-2' },
  { name: "Southampton Red & White",color: "#D71920", homeTextColor: WHITE, awayColor: WHITE,     awayTextColor: "#D71920", stadium: "St Mary's",                    stadiumCapacity: 32000, division: 1, reputation: 62, style: 'Direct',         formation: '4-4-2' },
  { name: "Fulham White",           color: "#000000", homeTextColor: WHITE, awayColor: "#C0C0C0", awayTextColor: "#000000", stadium: "Craven Cottage",              stadiumCapacity: 25000, division: 1, reputation: 70, style: 'Pass to Feet',   formation: '4-3-3' },
  { name: "Brentford Red & White",  color: "#E30613", homeTextColor: WHITE, awayColor: "#000000", awayTextColor: WHITE,     stadium: "Brentford Community Stadium", stadiumCapacity: 17000, division: 1, reputation: 68, style: 'Direct',         formation: '4-3-3' },
  { name: "Leeds White",            color: WHITE,     homeTextColor: "#003366", awayColor: "#FFCD00", awayTextColor: "#003366", stadium: "Elland Road",            stadiumCapacity: 37000, division: 1, reputation: 70, style: 'Direct',         formation: '4-4-2' },
  { name: "Nottingham Forest Red",  color: "#DD0000", homeTextColor: WHITE, awayColor: WHITE,     awayTextColor: "#DD0000", stadium: "City Ground",                  stadiumCapacity: 30000, division: 1, reputation: 72, style: 'Counter-Attack', formation: '4-5-1' },
  { name: "Sheffield Red & White",  color: WHITE,     homeTextColor: "#EE2737", awayColor: "#EE2737", awayTextColor: WHITE, stadium: "Bramall Lane",             stadiumCapacity: 32000, division: 1, reputation: 63, style: 'Park the Bus',   formation: '5-3-2' },
  // DIVISION 2
  { name: "Yorkshire White", color: WHITE, homeTextColor: "#1d428a", awayColor: "#ffcd00", awayTextColor: "#1d428a", stadiumCapacity: 37890, division: 2, style: 'Direct', formation: '4-4-2' },
  { name: "Leicester Fox", color: "#003090", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#003090", stadiumCapacity: 32261, division: 2, style: 'Pass to Feet', formation: '4-2-3-1' },
  { name: "Southampton Red & White", color: "#d71920", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#d71920", stadiumCapacity: 32384, division: 2, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Middlesbrough Red", color: "#e30613", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#e30613", stadiumCapacity: 34742, division: 2, style: 'Direct', formation: '4-4-2' },
  { name: "Norfolk Yellow", color: "#fff200", homeTextColor: "#00a651", awayColor: "#00a651", awayTextColor: WHITE, stadiumCapacity: 27244, division: 2, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "West Bromwich Striped", color: "#002d56", homeTextColor: WHITE, awayColor: "#002d56", awayTextColor: WHITE, stadiumCapacity: 26850, division: 2, style: 'Long Ball', formation: '4-4-2' },
  { name: "Sunderland Red & White", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 49000, division: 2, style: 'Direct', formation: '4-4-2' },
  { name: "Stoke Red & White", color: "#e03a3e", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#e03a3e", stadiumCapacity: 30089, division: 2, style: 'Long Ball', formation: '4-4-2' },
  { name: "Swansea White", color: WHITE, homeTextColor: "#000000", awayColor: "#ff0000", awayTextColor: WHITE, stadiumCapacity: 21088, division: 2, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Watford Yellow", color: "#fff200", homeTextColor: "#000000", awayColor: "#000000", awayTextColor: "#fbdb24", stadiumCapacity: 22220, division: 2, style: 'Counter-Attack', formation: '4-3-3' },
  { name: "Coventry Sky Blue", color: "#add8e6", homeTextColor: "#00008b", awayColor: "#00008b", awayTextColor: WHITE, stadiumCapacity: 32609, division: 2, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Hull Tiger", color: "#ff9b00", homeTextColor: "#000000", awayColor: "#000000", awayTextColor: "#ff9b00", stadiumCapacity: 25400, division: 2, style: 'Direct', formation: '4-3-3' },
  { name: "Bristol Red", color: "#e30613", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#e30613", stadiumCapacity: 27000, division: 2, style: 'Direct', formation: '4-4-2' },
  { name: "Preston Deepdale", color: WHITE, homeTextColor: "#000033", awayColor: "#000033", awayTextColor: WHITE, stadiumCapacity: 23404, division: 2, style: 'Long Ball', formation: '4-4-2' },
  { name: "Derby White & Black", color: WHITE, homeTextColor: "#000000", awayColor: "#000000", awayTextColor: WHITE, stadiumCapacity: 33597, division: 2, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Portsmouth Blue", color: "#0000ff", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#0000ff", stadiumCapacity: 20621, division: 2, style: 'Counter-Attack', formation: '4-4-2' },
  { name: "Queens Park Hoops", color: "#0000ff", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#0000ff", stadiumCapacity: 18435, division: 2, style: 'Direct', formation: '4-3-3' },
  { name: "Millwall Den", color: "#000033", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#000033", stadiumCapacity: 20146, division: 2, style: 'Long Ball', formation: '4-4-2' },
  { name: "Burnley Claret", color: "#6c1d45", homeTextColor: "#99d6ea", awayColor: "#99d6ea", awayTextColor: "#6c1d45", stadiumCapacity: 21944, division: 2, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Blackburn Blue & White", color: "#0055a3", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#0055a3", stadiumCapacity: 31367, division: 2, style: 'Direct', formation: '4-4-2' },

  // DIVISION 3
  { name: "Charlton Red", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 27111, division: 3, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Reading Blue & White", color: "#0000ff", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#0000ff", stadiumCapacity: 24161, division: 3, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Huddersfield Blue & White", color: "#0072ce", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#0072ce", stadiumCapacity: 24500, division: 3, style: 'Direct', formation: '4-3-3' },
  { name: "Bolton White", color: WHITE, homeTextColor: "#122f67", awayColor: "#122f67", awayTextColor: WHITE, stadiumCapacity: 28723, division: 3, style: 'Long Ball', formation: '4-4-2' },
  { name: "Wigan Blue & White", color: "#0038a8", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#0038a8", stadiumCapacity: 25133, division: 3, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Peterborough Blue", color: "#0000ff", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#0000ff", stadiumCapacity: 15314, division: 3, style: 'Direct', formation: '4-3-3' },
  { name: "Barnsley Red", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 23287, division: 3, style: 'Long Ball', formation: '4-4-2' },
  { name: "Blackpool Tangerine", color: "#f68712", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#f68712", stadiumCapacity: 16127, division: 3, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Oxford Yellow", color: "#ffff00", homeTextColor: "#000044", awayColor: "#000044", awayTextColor: WHITE, stadiumCapacity: 12500, division: 3, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Lincoln Red", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 10120, division: 3, style: 'Direct', formation: '4-4-2' },
  { name: "Shrewsbury Blue & Amber", color: "#0000ff", homeTextColor: "#ffbf00", awayColor: "#ffbf00", awayTextColor: "#0000ff", stadiumCapacity: 9875, division: 3, style: 'Long Ball', formation: '4-4-2' },
  { name: "Exeter Red & White", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 8696, division: 3, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Stevenage Red & White", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 7800, division: 3, style: 'Direct', formation: '4-4-2' },
  { name: "Leyton Red", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 9271, division: 3, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Cambridge Amber", color: "#ffbf00", homeTextColor: "#000000", awayColor: "#000000", awayTextColor: "#ffbf00", stadiumCapacity: 8127, division: 3, style: 'Direct', formation: '4-4-2' },
  { name: "Northampton Claret", color: "#950130", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#950130", stadiumCapacity: 7798, division: 3, style: 'Long Ball', formation: '4-4-2' },
  { name: "Wycombe Blue", color: "#00008b", homeTextColor: "#add8e6", awayColor: "#add8e6", awayTextColor: "#00008b", stadiumCapacity: 10137, division: 3, style: 'Direct', formation: '4-4-2' },
  { name: "Rotherham Red & White", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 12021, division: 3, style: 'Long Ball', formation: '4-4-2' },
  { name: "Stockport Blue", color: "#0000ff", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#0000ff", stadiumCapacity: 10852, division: 3, style: 'Direct', formation: '4-3-3' },
  { name: "Mansfield Amber & Blue", color: "#ffbf00", homeTextColor: "#0000ff", awayColor: "#0000ff", awayTextColor: "#ffbf00", stadiumCapacity: 9186, division: 3, style: 'Pass to Feet', formation: '4-4-2' },

  // DIVISION 4
  { name: "Wrexham Red", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 12600, division: 4, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Notts County Black & White", color: "#000000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#000000", stadiumCapacity: 19888, division: 4, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Milton Keynes White", color: WHITE, homeTextColor: "#000000", awayColor: "#000000", awayTextColor: WHITE, stadiumCapacity: 30500, division: 4, style: 'Direct', formation: '4-3-3' },
  { name: "Doncaster Red & White", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 15231, division: 4, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Gillingham Blue", color: "#0000ff", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#0000ff", stadiumCapacity: 11582, division: 4, style: 'Direct', formation: '4-4-2' },
  { name: "Bradford Claret & Amber", color: "#ffbf00", homeTextColor: "#800000", awayColor: "#800000", awayTextColor: "#ffbf00", stadiumCapacity: 25136, division: 4, style: 'Long Ball', formation: '4-4-2' },
  { name: "Salford City Red", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 5108, division: 4, style: 'Direct', formation: '4-3-3' },
  { name: "Crewe Red & White", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 10153, division: 4, style: 'Pass to Feet', formation: '5-3-2' },
  { name: "Tranmere White", color: WHITE, homeTextColor: "#0000ff", awayColor: "#0000ff", awayTextColor: WHITE, stadiumCapacity: 16587, division: 4, style: 'Long Ball', formation: '4-4-2' },
  { name: "Wimbledon Blue & Yellow", color: "#0000ff", homeTextColor: "#ffff00", awayColor: "#ffff00", awayTextColor: "#0000ff", stadiumCapacity: 9300, division: 4, style: 'Direct', formation: '4-4-2' },
  { name: "Grimsby Black & White", color: "#000000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#000000", stadiumCapacity: 9052, division: 4, style: 'Long Ball', formation: '4-4-2' },
  { name: "Carlisle Blue", color: "#306eff", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#306eff", stadiumCapacity: 17949, division: 4, style: 'Counter-Attack', formation: '4-4-2' },
  { name: "Colchester Blue & White", color: "#0000ff", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#0000ff", stadiumCapacity: 10105, division: 4, style: 'Pass to Feet', formation: '4-3-3' },
  { name: "Swindon Red", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 15728, division: 4, style: 'Pass to Feet', formation: '4-4-2' },
  { name: "Newport Amber", color: "#ffbf00", homeTextColor: "#000000", awayColor: "#000000", awayTextColor: "#ffbf00", stadiumCapacity: 7850, division: 4, style: 'Long Ball', formation: '4-4-2' },
  { name: "Barrow Blue", color: "#0000ff", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#0000ff", stadiumCapacity: 5045, division: 4, style: 'Long Ball', formation: '4-4-2' },
  { name: "Cheltenham Red & White", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 7066, division: 4, style: 'Direct', formation: '4-4-2' },
  { name: "Harrogate Yellow", color: "#ffff00", homeTextColor: "#000000", awayColor: "#000000", awayTextColor: "#ffff00", stadiumCapacity: 5000, division: 4, style: 'Counter-Attack', formation: '4-4-2' },
  { name: "Fleetwood Red & White", color: "#ff0000", homeTextColor: WHITE, awayColor: WHITE, awayTextColor: "#ff0000", stadiumCapacity: 5327, division: 4, style: 'Direct', formation: '4-3-3' },
  { name: "Bromley White & Black", color: WHITE, homeTextColor: "#000000", awayColor: "#000000", awayTextColor: WHITE, stadiumCapacity: 5150, division: 4, style: 'Direct', formation: '4-4-2' },
];
