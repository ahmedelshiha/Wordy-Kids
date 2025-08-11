import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Star,
  Shield,
  Crown,
  Zap,
  Target,
  Clock,
  Heart,
  Award,
  TrendingUp,
  Users,
  Calendar,
  Flame,
  Lock,
  CheckCircle,
} from "lucide-react";
import { Badge as AdventureBadge, WordHero } from "@shared/adventure";

interface BadgeSystemProps {
  hero: WordHero;
  onClaimReward?: (badgeId: string) => void;
}

// Extended badge definitions with requirements and rewards
const BADGE_DEFINITIONS = {
  // Word Rescue Badges
  word_saver_5: {
    id: "word_saver_5",
    name: "Word Saver",
    description: "Rescued 5 forgotten words",
    icon: "🛡️",
    tier: "bronze" as const,
    category: "rescue",
    requirements: { type: "words_rescued", threshold: 5 },
    rewards: { coins: 25, xp: 50 },
  },
  word_saver_10: {
    id: "word_saver_10",
    name: "Word Guardian",
    description: "Rescued 10 forgotten words",
    icon: "🛡️",
    tier: "silver" as const,
    category: "rescue",
    requirements: { type: "words_rescued", threshold: 10 },
    rewards: { coins: 50, xp: 100 },
  },
  word_saver_25: {
    id: "word_saver_25",
    name: "Word Champion",
    description: "Rescued 25 forgotten words",
    icon: "🛡️",
    tier: "gold" as const,
    category: "rescue",
    requirements: { type: "words_rescued", threshold: 25 },
    rewards: { coins: 100, xp: 200 },
  },
  word_saver_50: {
    id: "word_saver_50",
    name: "Word Master",
    description: "Rescued 50 forgotten words",
    icon: "🛡️",
    tier: "platinum" as const,
    category: "rescue",
    requirements: { type: "words_rescued", threshold: 50 },
    rewards: { coins: 200, xp: 400 },
  },

  // Skill Badges
  perfectionist_1: {
    id: "perfectionist_1",
    name: "Perfectionist",
    description: "Achieved a perfect score in a rescue game",
    icon: "⭐",
    tier: "bronze" as const,
    category: "skill",
    requirements: { type: "perfect_games", threshold: 1 },
    rewards: { coins: 20, xp: 40 },
  },
  perfectionist_10: {
    id: "perfectionist_10",
    name: "Precision Master",
    description: "Achieved 10 perfect scores",
    icon: "⭐",
    tier: "silver" as const,
    category: "skill",
    requirements: { type: "perfect_games", threshold: 10 },
    rewards: { coins: 75, xp: 150 },
  },
  speed_runner_1: {
    id: "speed_runner_1",
    name: "Quick Draw",
    description: "Completed a rescue in under 15 seconds",
    icon: "⚡",
    tier: "bronze" as const,
    category: "speed",
    requirements: { type: "speed_record", threshold: 15 },
    rewards: { coins: 30, xp: 60 },
  },
  speed_runner_5: {
    id: "speed_runner_5",
    name: "Lightning Hero",
    description: "Completed 5 rescues in under 15 seconds",
    icon: "⚡",
    tier: "silver" as const,
    category: "speed",
    requirements: { type: "speed_record", threshold: 5 },
    rewards: { coins: 80, xp: 160 },
  },

  // Streak Badges
  daily_warrior_3: {
    id: "daily_warrior_3",
    name: "Daily Warrior",
    description: "Completed daily missions for 3 days in a row",
    icon: "🔥",
    tier: "bronze" as const,
    category: "streak",
    requirements: { type: "streak_days", threshold: 3 },
    rewards: { coins: 40, xp: 80 },
  },
  daily_warrior_7: {
    id: "daily_warrior_7",
    name: "Weekly Champion",
    description: "Completed daily missions for 7 days in a row",
    icon: "🔥",
    tier: "silver" as const,
    category: "streak",
    requirements: { type: "streak_days", threshold: 7 },
    rewards: { coins: 100, xp: 200 },
  },
  daily_warrior_30: {
    id: "daily_warrior_30",
    name: "Dedication Master",
    description: "Completed daily missions for 30 days in a row",
    icon: "🔥",
    tier: "gold" as const,
    category: "streak",
    requirements: { type: "streak_days", threshold: 30 },
    rewards: { coins: 300, xp: 600 },
  },

  // Special Achievement Badges
  first_rescue: {
    id: "first_rescue",
    name: "First Rescue",
    description: "Completed your very first word rescue",
    icon: "🌟",
    tier: "bronze" as const,
    category: "milestone",
    requirements: { type: "words_rescued", threshold: 1 },
    rewards: { coins: 15, xp: 30 },
  },
  level_up_5: {
    id: "level_up_5",
    name: "Rising Hero",
    description: "Reached Level 5",
    icon: "👑",
    tier: "bronze" as const,
    category: "progression",
    requirements: { type: "level_reached", threshold: 5 },
    rewards: { coins: 50, xp: 100 },
  },
  level_up_10: {
    id: "level_up_10",
    name: "Elite Hero",
    description: "Reached Level 10",
    icon: "👑",
    tier: "silver" as const,
    category: "progression",
    requirements: { type: "level_reached", threshold: 10 },
    rewards: { coins: 150, xp: 300 },
  },
  coin_collector_100: {
    id: "coin_collector_100",
    name: "Coin Collector",
    description: "Earned 100 coins",
    icon: "🪙",
    tier: "bronze" as const,
    category: "wealth",
    requirements: { type: "coins_earned", threshold: 100 },
    rewards: { coins: 25, xp: 50 },
  },
  coin_collector_500: {
    id: "coin_collector_500",
    name: "Treasure Hunter",
    description: "Earned 500 coins",
    icon: "🪙",
    tier: "silver" as const,
    category: "wealth",
    requirements: { type: "coins_earned", threshold: 500 },
    rewards: { coins: 100, xp: 200 },
  },
};

type BadgeCategory =
  | "rescue"
  | "skill"
  | "speed"
  | "streak"
  | "milestone"
  | "progression"
  | "wealth";

const getCategoryInfo = (category: BadgeCategory) => {
  const categoryMap = {
    rescue: { name: "Word Rescue", icon: Shield, color: "text-blue-600" },
    skill: { name: "Skill Mastery", icon: Star, color: "text-yellow-600" },
    speed: { name: "Speed Records", icon: Zap, color: "text-purple-600" },
    streak: { name: "Daily Streaks", icon: Flame, color: "text-red-600" },
    milestone: { name: "Milestones", icon: Target, color: "text-green-600" },
    progression: { name: "Hero Growth", icon: Crown, color: "text-indigo-600" },
    wealth: { name: "Coin Collection", icon: Trophy, color: "text-orange-600" },
  };
  return categoryMap[category];
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "bronze":
      return "border-orange-400 bg-orange-50";
    case "silver":
      return "border-gray-400 bg-gray-50";
    case "gold":
      return "border-yellow-400 bg-yellow-50";
    case "platinum":
      return "border-purple-400 bg-purple-50";
    default:
      return "border-gray-300 bg-gray-50";
  }
};

export const BadgeSystem: React.FC<BadgeSystemProps> = ({
  hero,
  onClaimReward,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    BadgeCategory | "all"
  >("all");

  // Calculate badge progress
  const calculateBadgeProgress = (badgeId: string) => {
    const badge = BADGE_DEFINITIONS[badgeId as keyof typeof BADGE_DEFINITIONS];
    if (!badge) return { current: 0, max: 1, earned: false };

    const earned = hero.badges.some((b) => b.id === badgeId);
    let current = 0;

    switch (badge.requirements.type) {
      case "words_rescued":
        current = hero.rescued_words_count;
        break;
      case "level_reached":
        current = hero.level;
        break;
      case "coins_earned":
        current = hero.coins;
        break;
      case "perfect_games":
        // Would need to track this separately
        current = hero.badges.filter((b) =>
          b.id.includes("perfectionist"),
        ).length;
        break;
      case "speed_record":
        // Would need to track this separately
        current = 0;
        break;
      case "streak_days":
        // Would need to track this separately
        current = 0;
        break;
      default:
        current = 0;
    }

    return {
      current: Math.min(current, badge.requirements.threshold),
      max: badge.requirements.threshold,
      earned,
    };
  };

  // Group badges by category
  const badgesByCategory = Object.values(BADGE_DEFINITIONS).reduce(
    (acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    },
    {} as Record<
      BadgeCategory,
      (typeof BADGE_DEFINITIONS)[keyof typeof BADGE_DEFINITIONS][]
    >,
  );

  // Filter badges based on selected category
  const filteredBadges =
    selectedCategory === "all"
      ? Object.values(BADGE_DEFINITIONS)
      : badgesByCategory[selectedCategory] || [];

  const earnedBadgesCount = hero.badges.length;
  const totalBadgesCount = Object.keys(BADGE_DEFINITIONS).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🏆 Badge Collection
        </h2>
        <p className="text-gray-600">
          Earn badges by completing achievements and rescue missions!
        </p>
        <div className="mt-4">
          <div className="text-2xl font-bold text-purple-600">
            {earnedBadgesCount} / {totalBadgesCount}
          </div>
          <Progress
            value={(earnedBadgesCount / totalBadgesCount) * 100}
            className="max-w-xs mx-auto mt-2"
          />
        </div>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={() => setSelectedCategory("all")}
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
            >
              All Categories
            </Button>
            {Object.keys(badgesByCategory).map((category) => {
              const categoryInfo = getCategoryInfo(category as BadgeCategory);
              const CategoryIcon = categoryInfo.icon;

              return (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category as BadgeCategory)}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CategoryIcon className="w-4 h-4" />
                  {categoryInfo.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const progress = calculateBadgeProgress(badge.id);
          const categoryInfo = getCategoryInfo(badge.category as BadgeCategory);
          const CategoryIcon = categoryInfo.icon;

          return (
            <Card
              key={badge.id}
              className={`transition-all duration-300 hover:scale-105 border-2 ${
                progress.earned
                  ? getTierColor(badge.tier)
                  : "border-gray-200 bg-gray-50 opacity-75"
              }`}
            >
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl ${
                      progress.earned
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                        : "bg-gray-300"
                    }`}
                  >
                    {progress.earned ? badge.icon : "🔒"}
                  </div>

                  {progress.earned && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                <h3
                  className={`text-lg font-bold mb-2 ${
                    progress.earned ? "text-gray-800" : "text-gray-500"
                  }`}
                >
                  {badge.name}
                </h3>

                <p
                  className={`text-sm mb-4 ${
                    progress.earned ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {badge.description}
                </p>

                {/* Category and Tier */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <CategoryIcon className={`w-4 h-4 ${categoryInfo.color}`} />
                    <span className="text-xs text-gray-500">
                      {categoryInfo.name}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${
                      badge.tier === "bronze"
                        ? "border-orange-400 text-orange-600"
                        : badge.tier === "silver"
                          ? "border-gray-400 text-gray-600"
                          : badge.tier === "gold"
                            ? "border-yellow-400 text-yellow-600"
                            : "border-purple-400 text-purple-600"
                    }`}
                  >
                    {badge.tier}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span
                      className={
                        progress.earned ? "text-green-600" : "text-gray-500"
                      }
                    >
                      {progress.earned ? "Completed!" : "Progress"}
                    </span>
                    <span
                      className={
                        progress.earned ? "text-green-600" : "text-gray-500"
                      }
                    >
                      {progress.current}/{progress.max}
                    </span>
                  </div>
                  <Progress
                    value={(progress.current / progress.max) * 100}
                    className={`h-2 ${
                      progress.earned ? "bg-green-100" : "bg-gray-200"
                    }`}
                  />
                </div>

                {/* Rewards */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">Rewards</div>
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">🪙</span>
                      <span>{badge.rewards.coins}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span>{badge.rewards.xp} XP</span>
                    </div>
                  </div>
                </div>

                {/* Claim Button */}
                {progress.earned && onClaimReward && (
                  <Button
                    onClick={() => onClaimReward(badge.id)}
                    className="mt-4 w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                    size="sm"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Claim Reward
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-600" />
            Badge Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(badgesByCategory).map(([category, badges]) => {
              const categoryInfo = getCategoryInfo(category as BadgeCategory);
              const CategoryIcon = categoryInfo.icon;
              const earnedInCategory = badges.filter((badge) =>
                hero.badges.some((heroB) => heroB.id === badge.id),
              ).length;

              return (
                <div
                  key={category}
                  className="text-center p-4 bg-white rounded-lg"
                >
                  <CategoryIcon
                    className={`w-8 h-8 mx-auto mb-2 ${categoryInfo.color}`}
                  />
                  <div className="font-bold text-lg">
                    {earnedInCategory}/{badges.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {categoryInfo.name}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
