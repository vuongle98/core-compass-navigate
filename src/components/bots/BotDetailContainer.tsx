
import React from 'react';
import { useLazyLoading } from '@/hooks/use-lazy-loading';
import { LazyBotDetail } from './LazyBotDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot } from '@/types/Bot';

interface BotDetailContainerProps {
  bot: Bot;
  onRefresh: () => void;
}

export function BotDetailContainer({ bot, onRefresh }: BotDetailContainerProps) {
  const { elementRef, isVisible } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '100px',
  });

  return (
    <div ref={elementRef} className="min-h-[200px]">
      {isVisible ? (
        <LazyBotDetail bot={bot} onRefresh={onRefresh} />
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      )}
    </div>
  );
}
