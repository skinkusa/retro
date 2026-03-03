
export type Position = 'GK' | 'DF' | 'MF' | 'FW' | 'DM';
export type Side = 'L' | 'R' | 'C' | 'LC' | 'RC' | 'LR' | 'ALL';
export type PlayStyle = 'Long Ball' | 'Pass to Feet' | 'Counter-Attack' | 'Tiki-Taka' | 'Direct' | 'Park the Bus';
export type CompetitionType = 'LEAGUE' | 'CUP';
export type QualificationType = 'CHAMPIONS' | 'EUROPE' | 'PROMOTION' | 'RELEGATION' | null;

export interface PlayerStats {
  apps: number;
  goals: number;
  avgRating: number;
  yellowCards: number;
  redCards: number;
}

export interface Injury {
  type: string;
  weeksRemaining: number;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  position: Position;
  side: Side;
  attributes: {
    pace: number;
    stamina: number;
    skill: number;
    shooting: number;
    passing: number;
    heading: number;
    influence: number;
    goalkeeping: number;
    consistency: number;
    dirtiness: number;
    injuryProne: number;
    temperament: number;
    potential: number;
    professionalism: number;
  };
  fitness: number;
  morale: number;
  value: number;
  wage: number;
  contractYears: number;
  clubId: string | null;
  condition: number;
  status: 'FIT' | 'INJURED' | 'SUSPENDED' | 'TRANSFER_LISTED';
  isListed: boolean;
  isShortlisted?: boolean;
  suspensionWeeks: number;
  injury: Injury | null;
  seasonStats: PlayerStats;
  history: Array<{
    season: number;
    apps: number;
    goals: number;
    avgRating: number;
    goalsScored: number;
    clubName: string;
  }>;
}

export type StaffRole = 'COACH' | 'PHYSIO' | 'SCOUT';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  rating: number;
  wage: number;
}

export interface Team {
  id: string;
  name: string;
  stadium: string;
  stadiumCapacity: number;
  color: string;
  budget: number;
  weeklyWages: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  formation: string;
  playStyle: PlayStyle;
  preferredFormation: string;
  preferredStyle: PlayStyle;
  division: number;
  reputation: number;
  isUserTeam?: boolean;
  playedHistory: string[];
  staff: StaffMember[];
  lineup: string[];
  qualification?: QualificationType;
  finances: {
    gateReceipts: number;
    merchandise: number;
    wagesPaid: number;
    transfersIn: number;
    transfersOut: number;
    taxPaid: number;
  };
}

export interface Fixture {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  week: number;
  division?: number;
  competition: CompetitionType;
  cupRound?: string;
  result?: {
    homeGoals: number;
    awayGoals: number;
    homePens?: number;
    awayPens?: number;
    homeChances?: number;
    awayChances?: number;
    attendance: number;
    events: MatchEvent[];
    ratings: Record<string, number>;
    scorers: Array<{playerId: string, minute: number}>;
    cards: Array<{playerId: string, type: 'YELLOW' | 'RED', minute: number}>;
    injuries: Array<{playerId: string, type: string, weeks: number}>;
  };
}

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'YELLOW' | 'RED' | 'INJURY' | 'COMMENTARY' | 'PENALTY_SHOOTOUT';
  teamId?: string;
  playerId?: string;
  text: string;
}

export type ManagerPersonality = 'Analyst' | 'Motivator' | 'Economist' | 'Maverick' | 'Celebrity';

export interface ManagerProfile {
  name: string;
  personality: ManagerPersonality;
  reputation: number;
  seasonsManaged: number;
  trophies: string[];
  winPercentage: number;
  totalGames: number;
  totalWins: number;
}

export interface TeamRecordEntry {
  score: string;
  opponent: string;
  week: number;
  season: number;
}

export interface TeamRecords {
  biggestWin: TeamRecordEntry | null;
  biggestLoss: TeamRecordEntry | null;
  transferPaid: { amount: number; player: string } | null;
  transferReceived: { amount: number; player: string } | null;
}

export interface TransferOffer {
  id: string;
  playerId: string;
  fromTeamId: string;
  amount: number;
}

export interface GameMessage {
  id: string;
  title: string;
  content: string;
  date: number;
  week: number;
  read: boolean;
  type: 'URGENT' | 'INFO' | 'BOARD' | 'TRANSFER' | 'STAFF' | 'FINANCE' | 'CUP' | 'SEASON' | 'BOARD_MEETING';
  bidId?: string;
}

export interface SeasonSummaryData {
  season: number;
  champions: Record<number, string>;
  promoted: Record<number, string[]>;
  relegated: Record<number, string[]>;
  userPos: number;
  userTarget: number;
  topScorer: { name: string; goals: number; team: string } | null;
  bestPlayer: { name: string; rating: number; team: string } | null;
}

export interface GameState {
  currentWeek: number;
  season: number;
  userTeamId: string | null;
  manager: ManagerProfile | null;
  teams: Team[];
  players: Player[];
  fixtures: Fixture[];
  messages: GameMessage[];
  isGameStarted: boolean;
  isFired: boolean;
  isSeasonOver: boolean;
  seasonSummary: SeasonSummaryData | null;
  boardConfidence: number;
  boardExpectation: string;
  targetPosition: number;
  transferMarket: {
    listed: string[];
    incomingBids: TransferOffer[];
  };
  availableStaff: StaffMember[];
  jobMarket: string[];
  cupEntrants: string[];
  records: TeamRecords;
}
