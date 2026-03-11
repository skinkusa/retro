import { describe, it, expect } from 'vitest';
import { generateInitialData, generateFixtures } from '@/lib/game-data';
import { DIVISIONS } from '@/data/divisions';
import { TEAM_DEFINITIONS } from '@/data/teams';
import type { Team } from '@/types/game';

describe('generateInitialData', () => {
  it('returns teams, players, fixtures, availableStaff, cupEntrants', () => {
    const data = generateInitialData();
    expect(data).toHaveProperty('teams');
    expect(data).toHaveProperty('players');
    expect(data).toHaveProperty('fixtures');
    expect(data).toHaveProperty('availableStaff');
    expect(data).toHaveProperty('cupEntrants');
  });

  it('teams length matches TEAM_DEFINITIONS', () => {
    const data = generateInitialData();
    expect(data.teams.length).toBe(TEAM_DEFINITIONS.length);
  });

  it('no duplicate player IDs', () => {
    const data = generateInitialData();
    const ids = data.players.map(p => p.id);
    const set = new Set(ids);
    expect(set.size).toBe(ids.length);
  });

  it('every player has required fields and valid position', () => {
    const data = generateInitialData();
    const positions = ['GK', 'DF', 'MF', 'FW', 'DM'];
    for (const p of data.players) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.nationality).toBeTruthy();
      expect(positions).toContain(p.position);
      expect(p.age).toBeGreaterThanOrEqual(16);
      expect(p.age).toBeLessThanOrEqual(45);
      expect(p.seasonStats).toBeDefined();
      expect(p.seasonStats.apps).toBe(0);
      expect(p.seasonStats.avgRating).toBe(0);
      expect(typeof p.attributes.skill).toBe('number');
      expect(p.clubId).toBeTruthy();
    }
  });

  it('every team has 16 players in lineup and valid division', () => {
    const data = generateInitialData();
    const divisionIds = DIVISIONS.map(d => d.id);
    for (const t of data.teams) {
      expect(divisionIds).toContain(t.division);
      expect(t.lineup.length).toBe(16);
      const teamPlayerIds = new Set(data.players.filter(p => p.clubId === t.id).map(p => p.id));
      t.lineup.forEach(id => {
        expect(id).toBeTruthy();
        expect(teamPlayerIds.has(id)).toBe(true);
      });
    }
  });

  it('fixtures have 38 weeks per division and valid structure', () => {
    const data = generateInitialData();
    const divIds = [...new Set(data.teams.map(t => t.division))];
    for (const div of divIds) {
      const divFixtures = data.fixtures.filter(f => f.division === div);
      const weeks = new Set(divFixtures.map(f => f.week));
      expect(weeks.size).toBe(38);
      divFixtures.forEach(f => {
        expect(f.homeTeamId).toBeTruthy();
        expect(f.awayTeamId).toBeTruthy();
        expect(f.homeTeamId).not.toBe(f.awayTeamId);
        expect(f.week).toBeGreaterThanOrEqual(1);
        expect(f.week).toBeLessThanOrEqual(38);
        expect(f.competition).toBe('LEAGUE');
      });
    }
  });
});

describe('generateFixtures', () => {
  it('with two teams generates 38 fixtures (19 each)', () => {
    const teams: Team[] = [
      { id: 'a', name: 'A', stadium: 'S', stadiumCapacity: 20000, color: '#000', awayColor: '#fff', budget: 0, weeklyWages: 0, points: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, formation: '4-4-2', playStyle: 'Pass to Feet', preferredFormation: '4-4-2', preferredStyle: 'Pass to Feet', division: 1, reputation: 50, playedHistory: [], staff: [], lineup: [], finances: { gateReceipts: 0, merchandise: 0, wagesPaid: 0, transfersIn: 0, transfersOut: 0, taxPaid: 0 } } as Team,
      { id: 'b', name: 'B', stadium: 'S', stadiumCapacity: 20000, color: '#000', awayColor: '#fff', budget: 0, weeklyWages: 0, points: 0, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, formation: '4-4-2', playStyle: 'Pass to Feet', preferredFormation: '4-4-2', preferredStyle: 'Pass to Feet', division: 1, reputation: 50, playedHistory: [], staff: [], lineup: [], finances: { gateReceipts: 0, merchandise: 0, wagesPaid: 0, transfersIn: 0, transfersOut: 0, taxPaid: 0 } } as Team,
    ];
    const fixtures = generateFixtures(teams, 1993);
    expect(fixtures.length).toBe(38);
    const aHome = fixtures.filter(f => f.homeTeamId === 'a').length;
    const aAway = fixtures.filter(f => f.awayTeamId === 'a').length;
    expect(aHome).toBe(19);
    expect(aAway).toBe(19);
  });
});
