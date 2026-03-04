'use client';

import { useEffect, useState } from 'react';

function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}

export function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (isCapacitorNative()) return;
    fetch('/api/visit')
      .then((res) => res.json())
      .then((data: { count: number }) => setCount(data.count))
      .catch(() => setCount(null));
  }, []);

  if (count === null || count === undefined) return null;

  return (
    <span className="text-xs text-muted-foreground/80 tabular-nums">
      {count.toLocaleString()} visits
    </span>
  );
}
