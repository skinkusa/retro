
"use client"

import { useGame } from '@/lib/store';
import { RetroWindow } from './RetroWindow';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, TrendingDown, Target, Star, Goal, ArrowRightCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SeasonSummary() {
  const { state, startNextSeason } = useGame();
  const summary = state.seasonSummary;

  if (!summary) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 font-mono overflow-auto">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center space-y-2 border-b-4 border-primary pb-4">
          <h1 className="text-5xl font-black text-primary tracking-tighter uppercase leading-none">
            SEASON {summary.season} WRAP-UP
          </h1>
          <p className="text-[14px] text-muted-foreground font-bold tracking-[0.3em] uppercase">
            Official League Record & Performance Review
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
          <RetroWindow title="ROLL OF HONOUR: CHAMPIONS">
            <div className="space-y-4 p-2 h-full">
              {Object.entries(summary.champions).map(([div, team]) => (
                <div key={div} className="flex items-center gap-4 bg-primary/5 p-3 border border-primary/20">
                  <div className="bg-yellow-500/20 p-2 border border-yellow-500/40">
                    <Trophy className="text-yellow-500" size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground font-black uppercase">Division {div}</div>
                    <div className="text-[18px] font-black text-white uppercase italic">{team}</div>
                  </div>
                </div>
              ))}
            </div>
          </RetroWindow>

          <RetroWindow title="MANAGEMENT REVIEW">
            <div className="space-y-4 p-2 flex flex-col h-full">
              <div className="bg-card p-4 border-2 border-primary/20 space-y-4 flex-1">
                <div className="flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-muted-foreground uppercase">Final Position</span>
                      <span className="text-3xl font-black text-white">{summary.userPos}th</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black text-muted-foreground uppercase">Board Target</span>
                      <span className="text-3xl font-black text-primary">{summary.userTarget}th</span>
                   </div>
                </div>
                
                <div className="pt-4 border-t border-primary/10">
                   <div className="text-[11px] font-black text-primary uppercase mb-1">Board Assessment</div>
                   <p className="text-[13px] leading-tight italic text-white/80">
                      {summary.userPos <= summary.userTarget 
                        ? `"Excellent work this season. You exceeded our expectations and the fans are delighted with the progress."`
                        : summary.userPos <= summary.userTarget + 5
                        ? `"A satisfactory campaign overall, though we had hoped for a slightly stronger finish. The board remains supportive."`
                        : `"A disappointing set of results. We expected much more and your position is under serious review."`}
                   </p>
                </div>

                <div className="flex justify-between items-center bg-primary/10 p-3 mt-4">
                   <div className="flex items-center gap-2">
                      <Target size={16} className="text-primary" />
                      <span className="text-[11px] font-black uppercase">Board Confidence</span>
                   </div>
                   <span className={cn("text-[15px] font-black", state.boardConfidence > 50 ? "text-green-500" : "text-red-500")}>
                      {state.boardConfidence}%
                   </span>
                </div>
              </div>
            </div>
          </RetroWindow>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
           <RetroWindow title="PROMOTED">
              <div className="space-y-3 p-1">
                 {Object.entries(summary.promoted).map(([div, teams]) => (
                    <div key={div} className="space-y-1">
                       <div className="text-[9px] font-black text-green-500 uppercase px-2">To Div {parseInt(div)-1}</div>
                       {teams.map(t => (
                          <div key={t} className="flex items-center gap-2 bg-green-500/5 px-2 py-1.5 border-l-2 border-green-500">
                             <TrendingUp size={10} className="text-green-500" />
                             <span className="text-[11px] font-black text-white uppercase truncate">{t}</span>
                          </div>
                       ))}
                    </div>
                 ))}
              </div>
           </RetroWindow>

           <RetroWindow title="RELEGATED">
              <div className="space-y-3 p-1">
                 {Object.entries(summary.relegated).map(([div, teams]) => (
                    <div key={div} className="space-y-1">
                       <div className="text-[9px] font-black text-red-500 uppercase px-2">From Div {div}</div>
                       {teams.map(t => (
                          <div key={t} className="flex items-center gap-2 bg-red-500/5 px-2 py-1.5 border-l-2 border-red-500">
                             <TrendingDown size={10} className="text-red-500" />
                             <span className="text-[11px] font-black text-white uppercase truncate">{t}</span>
                          </div>
                       ))}
                    </div>
                 ))}
              </div>
           </RetroWindow>

           <RetroWindow title="DIV AWARD WINNERS">
              <div className="space-y-4 p-2">
                 <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase">
                       <Goal size={12} /> Golden Boot
                    </div>
                    <div className="bg-black/20 p-2 border border-primary/10">
                       <div className="text-[13px] font-black text-white uppercase">{summary.topScorer?.name || 'N/A'}</div>
                       <div className="text-[9px] text-accent font-black uppercase">{summary.topScorer?.goals} Goals ({summary.topScorer?.team})</div>
                    </div>
                 </div>

                 <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase">
                       <Star size={12} /> Player of the Year
                    </div>
                    <div className="bg-black/20 p-2 border border-primary/10">
                       <div className="text-[13px] font-black text-white uppercase">{summary.bestPlayer?.name || 'N/A'}</div>
                       <div className="text-[9px] text-accent font-black uppercase">{summary.bestPlayer?.rating.toFixed(2)} Rating ({summary.bestPlayer?.team})</div>
                    </div>
                 </div>
              </div>
           </RetroWindow>
        </div>

        <div className="pt-6">
           <Button 
            onClick={startNextSeason}
            className="w-full h-16 bg-primary text-primary-foreground font-black retro-button text-xl tracking-[0.2em] shadow-[8px_8px_0_0_rgba(64,121,176,0.3)] hover:scale-[1.02] transition-transform"
           >
             COMMENCE NEXT SEASON <ArrowRightCircle size={24} className="ml-4" />
           </Button>
        </div>
      </div>
    </div>
  );
}
