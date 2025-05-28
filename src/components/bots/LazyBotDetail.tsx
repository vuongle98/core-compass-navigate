
import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Bot } from '@/types/Bot';

// Lazy load the BotDetail component
const BotDetail = lazy(() => import('./BotDetail').then(module => ({ default: module.BotDetail })));

interface LazyBotDetailProps {
  bot: Bot;
  onRefresh: () => void;
}

const BotDetailSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-6">
        {/* Tab skeleton */}
        <div className="flex space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export function LazyBotDetail({ bot, onRefresh }: LazyBotDetailProps) {
  return (
    <Suspense fallback={<BotDetailSkeleton />}>
      <BotDetail bot={bot} onRefresh={onRefresh} />
    </Suspense>
  );
}
