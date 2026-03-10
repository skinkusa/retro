
"use client"

import { useGame } from '@/lib/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';
import { getMessageDisplayContent } from '@/lib/utils';

interface NewsFeedProps {
  /** When provided, transfer-offer items show a "View contract" button that calls this with the player id. */
  onOpenPlayerContract?: (playerId: string) => void;
}

export function NewsFeed({ onOpenPlayerContract }: NewsFeedProps = {}) {
  const { state, markMessageRead } = useGame();

  const getTeamName = useMemo(() => (id: string) => state.teams.find(t => t.id === id)?.name ?? 'Unknown', [state.teams]);

  const currentWeekNews = useMemo(() => {
    return state.messages.filter(m => m.week === state.currentWeek);
  }, [state.messages, state.currentWeek]);

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-3">
        {currentWeekNews.length === 0 ? (
          <div className="text-center py-10 max-[1300px]:py-20 text-muted-foreground italic text-[12px] max-[1300px]:text-[18px] uppercase font-black opacity-40">No news items for Week {state.currentWeek}.</div>
        ) : (
          currentWeekNews.map((m) => {
            const bid = m.bidId ? state.transferMarket.incomingBids.find(b => b.id === m.bidId) : null;
            return (
              <div
                key={m.id}
                onClick={() => markMessageRead(m.id)}
                className={`p-3 border border-primary/10 transition-all cursor-pointer ${m.read ? 'opacity-60 grayscale' : 'bg-primary/5 border-l-4 border-l-primary'}`}
              >
                <div className="flex justify-between items-start mb-1 max-[1300px]:mb-3">
                  <h4 className="text-[13px] max-[1300px]:text-[20px] font-black text-primary uppercase tracking-tight">{m.title}</h4>
                  <Badge variant="outline" className="text-[8px] max-[1300px]:text-[14px] h-4 max-[1300px]:h-6 uppercase border-primary/30 font-black">
                    {m.type}
                  </Badge>
                </div>
                <p className="text-[12px] max-[1300px]:text-[18px] text-foreground/80 leading-tight font-medium">{getMessageDisplayContent(m, getTeamName)}</p>
                {bid && onOpenPlayerContract && (
                  <Button onClick={(e) => { e.stopPropagation(); onOpenPlayerContract(bid.playerId); }} variant="outline" size="sm" className="mt-2 max-[1300px]:mt-4 h-8 max-[1300px]:h-12 text-[10px] max-[1300px]:text-[16px] font-black uppercase border-primary/50 bg-primary/10 hover:bg-primary/30 text-primary rounded-lg">View contract</Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
