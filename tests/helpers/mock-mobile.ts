import { BREAKPOINT_MD } from '@/lib/constants';

/**
 * Mocks window.innerWidth and window.matchMedia so useIsMobile() (and any
 * component depending on it) sees a mobile or desktop viewport.
 * Call before rendering components that use useIsMobile().
 * Requires test environment to be jsdom (window available).
 */
export function setViewportWidth(width: number): void {
  const w = typeof window !== 'undefined' ? window : (globalThis as unknown as Window);
  Object.defineProperty(w, 'innerWidth', { value: width, configurable: true, writable: true });
  (w as unknown as Window).matchMedia = (query: string) => ({
    get matches(): boolean {
      if (query.includes('max-width')) {
        const match = query.match(/max-width:\s*(\d+)px/);
        return match ? width <= parseInt(match[1], 10) : false;
      }
      return false;
    },
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
    media: query,
  } as MediaQueryList);
}

export function setMobileViewport(): void {
  setViewportWidth(BREAKPOINT_MD - 1);
}

export function setDesktopViewport(): void {
  setViewportWidth(BREAKPOINT_MD + 100);
}
