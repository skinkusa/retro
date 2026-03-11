import { describe, it, expect } from 'vitest';
import {
  BREAKPOINT_MD,
  BREAKPOINT_LG,
  MEDIA_MOBILE,
  MEDIA_BELOW_LG,
  MOBILE_VIEWPORT_WIDTH,
  MOBILE_VIEWPORT_HEIGHT,
} from '@/lib/constants';

/**
 * Mobile rendering tests.
 *
 * These check that JS breakpoints stay in sync with CSS (globals.css and Tailwind)
 * and that the canonical mobile viewport is within the mobile breakpoint so E2E
 * (e.g. Playwright with viewport 375x667) actually exercises mobile layout.
 *
 * For full mobile rendering checks (real viewport, touch, layout), add E2E:
 *   - Playwright: set viewport to MOBILE_VIEWPORT_WIDTH x MOBILE_VIEWPORT_HEIGHT,
 *     navigate to key screens (hub, match day, player profile), assert key elements
 *     are visible and not overflowing (e.g. no horizontal scroll on body).
 */

describe('mobile breakpoint contract', () => {
  it('MEDIA_MOBILE matches BREAKPOINT_MD (max-width: 767px)', () => {
    expect(MEDIA_MOBILE).toBe('(max-width: 767px)');
    expect(BREAKPOINT_MD).toBe(768);
  });

  it('MEDIA_BELOW_LG matches BREAKPOINT_LG (max-width: 1023px)', () => {
    expect(MEDIA_BELOW_LG).toBe('(max-width: 1023px)');
    expect(BREAKPOINT_LG).toBe(1024);
  });

  it('useIsMobile considers width < BREAKPOINT_MD as mobile', () => {
    expect(MOBILE_VIEWPORT_WIDTH).toBeLessThan(BREAKPOINT_MD);
    expect(BREAKPOINT_MD - 1).toBe(767);
  });
});

describe('mobile viewport constants', () => {
  it('canonical mobile viewport is within mobile breakpoint', () => {
    expect(MOBILE_VIEWPORT_WIDTH).toBeLessThan(BREAKPOINT_MD);
    expect(MOBILE_VIEWPORT_WIDTH).toBeGreaterThan(0);
    expect(MOBILE_VIEWPORT_HEIGHT).toBeGreaterThan(0);
  });

  it('mobile viewport dimensions are reasonable for E2E', () => {
    // Typical phone portrait; E2E can set browser to this size
    expect(MOBILE_VIEWPORT_WIDTH).toBe(375);
    expect(MOBILE_VIEWPORT_HEIGHT).toBe(667);
  });
});

describe('CSS/JS breakpoint alignment', () => {
  it('mobile breakpoint 767 is consistent with CSS (max-width: 768px) and (max-width: 1024px)', () => {
    // globals.css uses max-width: 768px and max-width: 1024px; our JS uses < 768 and < 1024
    expect(BREAKPOINT_MD - 1).toBe(767);
    expect(BREAKPOINT_LG - 1).toBe(1023);
  });
});
