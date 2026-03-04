"use client"

import dynamic from 'next/dynamic';

const GameApp = dynamic(() => import('./GameApp'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background font-mono">
      <div className="text-center text-primary font-black uppercase tracking-widest text-lg">
        Loading Retro Manager…
      </div>
    </div>
  ),
});

export default function GamePage() {
  return <GameApp />;
}
