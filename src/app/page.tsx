"use client"

import Link from 'next/link';
import { PlayCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url(/retromanager.png)' }}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 max-w-2xl w-full">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white uppercase text-center drop-shadow-lg italic">
          Retro Manager
        </h1>

        <div className="w-full bg-black/80 backdrop-blur-sm border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl">
          <p className="text-amber-200 text-center text-base sm:text-lg font-bold leading-relaxed">
            This game is designed to be run in a desktop browser and is not yet optimized for mobile. For the best experience, please play on a computer or tablet.
          </p>
        </div>

        <Link
          href="/game"
          className="inline-flex items-center justify-center gap-3 h-16 px-12 bg-amber-500 hover:bg-amber-400 text-black font-black text-xl uppercase tracking-widest rounded-2xl shadow-[0_8px_0_0_rgba(180,83,9,0.5)] hover:shadow-[0_6px_0_0_rgba(180,83,9,0.5)] hover:translate-y-0.5 transition-all"
        >
          <PlayCircle size={28} />
          Play Game
        </Link>
      </div>
    </div>
  );
}
