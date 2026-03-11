"use client"

import Link from 'next/link';
import { PlayCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div
      className="min-h-screen min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/retromanager.png)', backgroundColor: 'hsl(210 16% 10%)' }}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      {/* Mobile: safe-area padding; desktop: unchanged */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 max-w-2xl w-full px-2 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] md:px-0 md:pt-0 md:pb-0 md:gap-8">
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase text-center drop-shadow-lg italic max-md:leading-tight md:text-4xl sm:text-5xl md:text-6xl">
          Retro Manager
        </h1>

        <div className="w-full bg-black/80 backdrop-blur-sm border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl max-md:p-4 max-md:rounded-xl">
          <p className="text-amber-200 text-center text-base sm:text-lg font-bold leading-relaxed max-md:text-sm max-md:leading-snug italic">
            Experience the golden era of football management. Now optimized for desktop, tablet, and mobile browsers.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full max-w-sm md:max-w-none">
          <Link
            href="/game"
            className="inline-flex items-center justify-center gap-3 h-16 px-12 bg-amber-500 hover:bg-amber-400 active:bg-amber-400 text-black font-black text-xl uppercase tracking-widest rounded-2xl shadow-[0_8px_0_0_rgba(180,83,9,0.5)] hover:shadow-[0_6px_0_0_rgba(180,83,9,0.5)] hover:translate-y-0.5 transition-all w-full md:w-auto md:min-h-0"
          >
            <PlayCircle className="max-md:w-6 max-md:h-6 md:w-7 md:h-7" />
            Play Game
          </Link>
          
          <Link 
            href="/changelog"
            className="text-amber-500/60 hover:text-amber-400 font-black uppercase tracking-widest text-xs transition-colors"
          >
            View Changelog
          </Link>
        </div>
      </div>
    </div>
  );
}
