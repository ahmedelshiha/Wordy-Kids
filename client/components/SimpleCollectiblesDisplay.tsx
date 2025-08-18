/**
 * Simple Collectibles Display Component
 * Shows collected items without complex React hooks
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCollectiblesData } from '@/lib/collectiblesSystem';
import { cn } from '@/lib/utils';
import { Gift } from 'lucide-react';

interface SimpleCollectiblesDisplayProps {
  className?: string;
}

export const SimpleCollectiblesDisplay: React.FC<SimpleCollectiblesDisplayProps> = ({
  className
}) => {
  const [collectiblesData, setCollectiblesData] = useState(() => getCollectiblesData());

  // Update data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCollectiblesData(getCollectiblesData());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { progress, getNextMilestone } = collectiblesData;
  const nextMilestone = getNextMilestone();

  return (
    <Card className={cn("jungle-card border-2 border-yellow-400/50", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Gift className="w-4 h-4" />
            🎒 My Collection
          </h3>
          <Badge className="jungle-collectible">
            {progress.totalCollected} items
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="jungle-card p-2 border border-emerald-300/50">
            <div className="text-lg mb-1">🎨</div>
            <div className="text-xs text-white font-bold">{progress.stickersCount}</div>
            <div className="text-xs text-white/80">Stickers</div>
          </div>
          <div className="jungle-card p-2 border border-purple-300/50">
            <div className="text-lg mb-1">💎</div>
            <div className="text-xs text-white font-bold">{progress.gemsCount}</div>
            <div className="text-xs text-white/80">Gems</div>
          </div>
          <div className="jungle-card p-2 border border-orange-300/50">
            <div className="text-lg mb-1">🥭</div>
            <div className="text-xs text-white font-bold">{progress.fruitsCount}</div>
            <div className="text-xs text-white/80">Fruits</div>
          </div>
        </div>

        {nextMilestone && (
          <div className="mt-3 p-2 bg-yellow-400/20 rounded-lg border border-yellow-400/30">
            <div className="text-xs text-white/90 mb-1">Next Goal:</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-bold truncate mr-2">
                {nextMilestone.reward}
              </span>
              <Badge className="text-xs bg-yellow-500 text-yellow-900">
                {nextMilestone.progress}/{nextMilestone.target}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleCollectiblesDisplay;
