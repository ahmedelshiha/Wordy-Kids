/**
 * Jungle Collectibles Display Component
 * Shows collected stickers, gems, and fruits with progress tracking
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  useCollectibles,
  formatCollectibleRarity,
  getCollectibleRarityColor,
} from "@/lib/collectiblesSystem";
import { cn } from "@/lib/utils";
import { Star, Trophy, Gift, Target, Award } from "lucide-react";

interface JungleCollectiblesDisplayProps {
  className?: string;
  compact?: boolean;
  showRecent?: boolean;
}

export const JungleCollectiblesDisplay: React.FC<
  JungleCollectiblesDisplayProps
> = ({ className, compact = false, showRecent = false }) => {
  const {
    progress,
    getCollectedItems,
    getRecentItems,
    getCompletionStats,
    getAchievementBadges,
    getNextMilestone,
  } = useCollectibles();

  const [activeTab, setActiveTab] = useState("overview");
  const collectedItems = getCollectedItems();
  const recentItems = getRecentItems(5);
  const stats = getCompletionStats();
  const achievements = getAchievementBadges();
  const nextMilestone = getNextMilestone();

  if (compact) {
    return (
      <Card
        className={cn("jungle-card border-2 border-yellow-400/50", className)}
      >
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
              <div className="text-xs text-white font-bold">
                {progress.stickersCount}
              </div>
              <div className="text-xs text-white/80">Stickers</div>
            </div>
            <div className="jungle-card p-2 border border-purple-300/50">
              <div className="text-lg mb-1">💎</div>
              <div className="text-xs text-white font-bold">
                {progress.gemsCount}
              </div>
              <div className="text-xs text-white/80">Gems</div>
            </div>
            <div className="jungle-card p-2 border border-orange-300/50">
              <div className="text-lg mb-1">🥭</div>
              <div className="text-xs text-white font-bold">
                {progress.fruitsCount}
              </div>
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
  }

  if (showRecent) {
    return (
      <Card
        className={cn("jungle-card border-2 border-pink-400/50", className)}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            🌟 Recent Finds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentItems.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">🦜</div>
              <p className="text-xs text-white/80">
                Start exploring to find treasures!
              </p>
            </div>
          ) : (
            recentItems.map((item, index) => (
              <motion.div
                key={`${item.id}-${item.collectedAt.getTime()}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 bg-white/10 rounded-lg border border-white/20"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.emoji}</span>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-white/70">
                      {formatCollectibleRarity(item.rarity)}
                    </div>
                  </div>
                </div>
                {item.count > 1 && (
                  <Badge className="text-xs bg-yellow-500 text-yellow-900">
                    x{item.count}
                  </Badge>
                )}
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn("jungle-card border-4 border-yellow-400/50", className)}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-white flex items-center gap-3">
          <Gift className="w-6 h-6 text-yellow-400" />
          🎒 Jungle Collection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4 bg-white/10 p-1 rounded-lg">
            <TabsTrigger
              value="overview"
              className="text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              📊 Overview
            </TabsTrigger>
            <TabsTrigger
              value="items"
              className="text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              🎁 Items
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              🏆 Badges
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="text-xs data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              📈 Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="jungle-card p-3 text-center border-2 border-emerald-300/50">
                <div className="text-2xl mb-1">🎨</div>
                <div className="text-lg font-bold text-white">
                  {progress.stickersCount}
                </div>
                <div className="text-xs text-white/80">Stickers</div>
              </div>
              <div className="jungle-card p-3 text-center border-2 border-purple-300/50">
                <div className="text-2xl mb-1">💎</div>
                <div className="text-lg font-bold text-white">
                  {progress.gemsCount}
                </div>
                <div className="text-xs text-white/80">Gems</div>
              </div>
              <div className="jungle-card p-3 text-center border-2 border-orange-300/50">
                <div className="text-2xl mb-1">🥭</div>
                <div className="text-lg font-bold text-white">
                  {progress.fruitsCount}
                </div>
                <div className="text-xs text-white/80">Fruits</div>
              </div>
              <div className="jungle-card p-3 text-center border-2 border-yellow-300/50">
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-lg font-bold text-white">
                  {progress.totalPoints}
                </div>
                <div className="text-xs text-white/80">Points</div>
              </div>
            </div>

            {/* Next Milestone */}
            {nextMilestone && (
              <div className="jungle-card p-4 border-2 border-yellow-400/50">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  🎯 Next Goal
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium">
                      {nextMilestone.reward}
                    </span>
                    <Badge className="bg-yellow-500 text-yellow-900 font-bold">
                      {nextMilestone.progress}/{nextMilestone.target}
                    </Badge>
                  </div>
                  <Progress
                    value={
                      (nextMilestone.progress / nextMilestone.target) * 100
                    }
                    className="h-2"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            {collectedItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🦜</div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Start Your Adventure!
                </h3>
                <p className="text-white/80">
                  Explore and learn to discover amazing treasures!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {collectedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "jungle-card p-3 text-center border-2",
                      `bg-gradient-to-br ${getCollectibleRarityColor(item.rarity)}/20`,
                      "border-white/20 hover:border-white/40 transition-all duration-200",
                    )}
                  >
                    <div className="text-2xl mb-2">{item.emoji}</div>
                    <div className="text-xs font-bold text-white mb-1">
                      {item.name}
                    </div>
                    <div className="text-xs text-white/70 mb-2">
                      {formatCollectibleRarity(item.rarity)}
                    </div>
                    {item.count > 1 && (
                      <Badge className="text-xs bg-yellow-500 text-yellow-900">
                        x{item.count}
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-3">
            <div className="grid gap-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    achievement.unlocked
                      ? "jungle-card border-yellow-400/50 bg-yellow-400/10"
                      : "bg-white/5 border-white/20",
                  )}
                >
                  <div
                    className={cn(
                      "text-2xl",
                      achievement.unlocked ? "" : "grayscale",
                    )}
                  >
                    {achievement.emoji}
                  </div>
                  <div className="flex-1">
                    <div
                      className={cn(
                        "font-bold text-sm",
                        achievement.unlocked ? "text-white" : "text-white/50",
                      )}
                    >
                      {achievement.title}
                    </div>
                    <div
                      className={cn(
                        "text-xs",
                        achievement.unlocked
                          ? "text-white/80"
                          : "text-white/40",
                      )}
                    >
                      {achievement.description}
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <Badge className="bg-yellow-500 text-yellow-900 font-bold">
                      Unlocked!
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <span>🎨</span> Sticker Collection
                  </span>
                  <span className="text-xs text-white/80">
                    {stats.stickers.collected}/{stats.stickers.total}
                  </span>
                </div>
                <Progress value={stats.stickers.percentage} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <span>💎</span> Gem Collection
                  </span>
                  <span className="text-xs text-white/80">
                    {stats.gems.collected}/{stats.gems.total}
                  </span>
                </div>
                <Progress value={stats.gems.percentage} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <span>🥭</span> Fruit Collection
                  </span>
                  <span className="text-xs text-white/80">
                    {stats.fruits.collected}/{stats.fruits.total}
                  </span>
                </div>
                <Progress value={stats.fruits.percentage} className="h-2" />
              </div>

              <div className="pt-2 border-t border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Overall Progress
                  </span>
                  <span className="text-xs text-white/80">
                    {stats.overall.collected}/{stats.overall.total}
                  </span>
                </div>
                <Progress value={stats.overall.percentage} className="h-3" />
                <div className="text-center mt-2">
                  <Badge className="bg-yellow-500 text-yellow-900 font-bold">
                    {stats.overall.percentage}% Complete
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JungleCollectiblesDisplay;
