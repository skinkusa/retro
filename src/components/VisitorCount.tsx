'use client';

import { useEffect, useState } from 'react';

export function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
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
