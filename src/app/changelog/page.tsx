"use client"

import Link from 'next/link';
import { ArrowLeft, History, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChangelogPage() {
  const versions = [
    {
      version: "V1.5 - POLISH & BALANCING",
      date: "March 2026",
      changes: [
        "Calibrated match engine to historical 90s benchmarks (avg 1.35 goals/team).",
        "Balanced home advantage to realistic levels (~46% win rate for equal sides).",
        "Economic stabilization: Recalibrated wages and prize pools for long-term health.",
        "Added informational tooltips to Finance Hub and Player Profiles.",
        "Created comprehensive feature documentation (docs/features.md).",
        "Validated 20-season progression for financial stability."
      ]
    },
    {
      version: "V1.4 - MATCH DEPTH & ECONOMY",
      date: "March 2026",
      changes: [
        "Implemented Interactive Half-Time Team Talks with tactical modifiers.",
        "Added Stadium Expansion projects (Small, Medium, Large tiers).",
        "Integrated Finance Hub for club infrastructure management.",
        "Added dynamic attendance based on club reputation and division.",
        "Improved match commentary with half-time feedback."
      ]
    },
    {
      version: "V1.3 - PLAYER DEPTH",
      date: "March 2026",
      changes: [
        "Implemented Recent Form tracking (last 5 matches).",
        "Added Match Sharpness (Condition) mechanics and decay logic.",
        "Introduced Development Points for seasonal attribute growth/decline.",
        "Added Age-based evolution: youngsters grow, veterans decline.",
        "Enhanced Player Profile with in-depth stats and history."
      ]
    },
    {
      version: "V1.2 - SQUAD MANAGEMENT",
      date: "March 2026",
      changes: [
        "Developed full Squad List and Tactics Pitch interfaces.",
        "Implemented 16-player match-day squads (11 starters, 5 subs).",
        "Added Drag-and-drop lineup management.",
        "Introduced Player Market with AI transfer bidding.",
        "Standardized formations (4-4-2, 4-3-3, 5-3-2, etc.)."
      ]
    },
    {
      version: "V1.1 - CORE ENGINE",
      date: "February 2026",
      changes: [
        "Initial Match Engine development (Zone-based simulation).",
        "League Pyramid extraction (4 Divisions, 81 Teams).",
        "Implemented 38-week season schedule and League Table logic.",
        "Added Manager Persona and Board Expectations.",
        "Created Retro UI Foundation (1993 Aesthetic)."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans selection:bg-primary selection:text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b-4 border-primary/40 pb-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-2xl border-2 border-primary/40">
              <History size={40} className="text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Changelog</h1>
              <p className="text-primary font-mono text-sm tracking-widest mt-1 opacity-80">RETRO MANAGER 1993 - SYSTEM LOGS</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="h-12 px-6 font-black uppercase tracking-widest border-2 hover:bg-primary hover:text-black transition-all rounded-xl">
              <ArrowLeft className="mr-2" size={18} /> Exit
            </Button>
          </Link>
        </div>

        <div className="space-y-12">
          {versions.map((v, i) => (
            <div key={i} className="relative pl-8 border-l-2 border-primary/20 group">
              <div className="absolute -left-[9px] top-0 w-4 h-4 bg-black border-2 border-primary rounded-full group-hover:scale-125 transition-transform" />
              
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl shadow-2xl space-y-4 hover:bg-white/10 transition-all">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-2xl font-black italic text-primary uppercase tracking-tight">{v.version}</h2>
                  <span className="text-xs font-mono opacity-40">{v.date}</span>
                </div>
                
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {v.changes.map((change, ci) => (
                    <li key={ci} className="flex gap-2 text-sm leading-relaxed opacity-80">
                      <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-16 pb-8 opacity-30">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase">End of Logs // No further updates available</p>
        </div>
      </div>
    </div>
  );
}
