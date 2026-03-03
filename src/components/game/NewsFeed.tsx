
"use client"

import { useGame } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

export function NewsFeed() {
  const { state, markMessageRead } = useGame();

  const currentWeekNews = useMemo(() => {
    return state.messages.filter(m => m.week === state.currentWeek);
  }, [state.messages, state.currentWeek]);

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-3">
        {currentWeekNews.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground italic text-[12px] uppercase font-black opacity-40">No news items for Week {state.currentWeek}.</div>
        ) : (
          currentWeekNews.map((m) => (
            <div 
              key={m.id} 
              onClick={() => markMessageRead(m.id)}
              className={`p-3 border border-primary/10 transition-all cursor-pointer ${m.read ? 'opacity-60 grayscale' : 'bg-primary/5 border-l-4 border-l-primary'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-[13px] font-black text-primary uppercase tracking-tight">{m.title}</h4>
                <Badge variant="outline" className="text-[8px] h-4 uppercase border-primary/30 font-black">
                  {m.type}
                </Badge>
              </div>
              <p className="text-[12px] text-foreground/80 leading-tight font-medium">{m.content}</p>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
