import { describe, it, expect } from 'vitest';
import { isTransferWindowOpen, calculateBoardConfidenceDelta } from '@/lib/game-engine';

describe('isTransferWindowOpen', () => {
  it('returns true for summer window (weeks 1-4)', () => {
    expect(isTransferWindowOpen(1)).toBe(true);
    expect(isTransferWindowOpen(2)).toBe(true);
    expect(isTransferWindowOpen(4)).toBe(true);
  });

  it('returns true for winter window (weeks 20-22)', () => {
    expect(isTransferWindowOpen(20)).toBe(true);
    expect(isTransferWindowOpen(21)).toBe(true);
    expect(isTransferWindowOpen(22)).toBe(true);
  });

  it('returns false outside windows', () => {
    expect(isTransferWindowOpen(5)).toBe(false);
    expect(isTransferWindowOpen(19)).toBe(false);
    expect(isTransferWindowOpen(23)).toBe(false);
    expect(isTransferWindowOpen(38)).toBe(false);
  });
});

describe('calculateBoardConfidenceDelta', () => {
  it('returns positive when current rank is better than target (overperforming)', () => {
    expect(calculateBoardConfidenceDelta(1, 10)).toBeGreaterThan(0);
    expect(calculateBoardConfidenceDelta(5, 10)).toBeGreaterThan(0);
    expect(calculateBoardConfidenceDelta(10, 10)).toBeGreaterThanOrEqual(0);
  });

  it('returns negative when current rank is worse than target (underperforming)', () => {
    expect(calculateBoardConfidenceDelta(15, 10)).toBeLessThan(0);
    expect(calculateBoardConfidenceDelta(20, 10)).toBeLessThan(0);
  });

  it('caps gain when well above target', () => {
    const delta = calculateBoardConfidenceDelta(1, 20);
    expect(delta).toBeLessThanOrEqual(5);
  });
});
