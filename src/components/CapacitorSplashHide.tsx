'use client';

import { useEffect } from 'react';

/**
 * Hides the native splash screen once the web app has mounted.
 * Prevents the black/white splash from staying on top in Capacitor (iOS/Android).
 */
export function CapacitorSplashHide() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const cap = (window as unknown as { Capacitor?: { Plugins?: { SplashScreen?: { hide: () => Promise<void> } } } }).Capacitor;
    cap?.Plugins?.SplashScreen?.hide?.();
  }, []);
  return null;
}
