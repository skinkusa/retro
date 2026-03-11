import type { GameState, Fixture, Player } from '@/types/game';
import LZString from 'lz-string';

const KEEP_EVENT_TYPES = new Set(['GOAL', 'RED', 'INJURY', 'SUB', 'PENALTY_SHOOTOUT']);

export function slimFixtures(fixtures: Fixture[]): Fixture[] {
  return fixtures.map(f => {
    if (!f.result) return f;
    return {
      ...f,
      result: {
        homeGoals: f.result.homeGoals,
        awayGoals: f.result.awayGoals,
        ...(f.result.homePens !== undefined && { homePens: f.result.homePens, awayPens: f.result.awayPens }),
        attendance: f.result.attendance,
        scorers: f.result.scorers,
        cards: f.result.cards,
        injuries: [],
        ratings: {},
        events: f.result.events?.filter(e => KEEP_EVENT_TYPES.has(e.type)) ?? [],
        shotTakers: undefined,
        sotTakers: undefined,
      }
    };
  });
}

export function slimPlayers(players: Player[]): Player[] {
  return players.map(p => ({ ...p, history: p.history ? p.history.slice(-5) : [] }));
}

export function buildSaveable(state: GameState): GameState {
  return { ...state, fixtures: slimFixtures(state.fixtures), players: slimPlayers(state.players) };
}

export function compressedSave(data: GameState): string {
  return LZString.compressToUTF16(JSON.stringify(buildSaveable(data)));
}

export function parseStoredSave(raw: string): GameState {
  const decompressed = LZString.decompressFromUTF16(raw);
  if (decompressed !== null) {
    try {
      return JSON.parse(decompressed) as GameState;
    } catch {
      // Not valid JSON: raw may be legacy plain JSON mis-decoded as compressed
    }
  }
  return JSON.parse(raw) as GameState;
}
