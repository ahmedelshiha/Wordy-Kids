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
  TreePine,
  Leaf,
  Compass,
  Map,
  Sparkles,
  Gift,
} from "lucide-react";
import { Badge as AdventureBadge, WordHero } from "@shared/adventure";
import { cn } from "@/lib/utils";

interface BadgeSystemProps {
  hero: WordHero;
  onClaimReward?: (badgeId: string) => void;
}

// Enhanced jungle-themed badge definitions
const JUNGLE_BADGE_DEFINITIONS = {
  // Jungle Explorer Badges (Word Rescue)
  word_saver_5: {
    id: "word_saver_5",
    name: "Jungle Scout",
    description: "Rescued 5 words lost in the jungle",
    icon: "🏕️",
    tier: "bronze" as const,
    category: "rescue",
    requirements: { type: "words_rescued", threshold: 5 },
    rewards: { coins: 25, xp: 50, jungleCoins: 5 },
    jungleTheme: "Deep in the Amazon, you discovered your first hidden words!",
  },
  word_saver_10: {
    id: "word_saver_10",
    name: "Jungle Ranger",
    description: "Rescued 10 words from the wild vines",
    icon: "🌿",
    tier: "silver" as const,
    category: "rescue",
    requirements: { type: "words_rescued", threshold: 10 },
    rewards: { coins: 50, xp: 100, jungleCoins: 10 },
    jungleTheme: "You've become a skilled navigator of the word jungle!",
  },
  word_saver_25: {
    id: "word_saver_25",
    name: "Jungle Guardian",
    description: "Protected 25 words from being forgotten",
    icon: "🦜",
    tier: "gold" as const,
    category: "rescue",
    requirements: { type: "words_rescued", threshold: 25 },
    rewards: { coins: 100, xp: 200, jungleCoins: 25 },
    jungleTheme: "The jungle animals celebrate your word-saving heroics!",
  },
  word_saver_50: {
    id: "word_saver_50",
    name: "Jungle Legend",
    description: "Became a legendary protector of 50+ words",
    icon: "👑",
    tier: "platinum" as const,
    category: "rescue",
    requirements: { type: "words_rescued", threshold: 50 },
    rewards: { coins: 200, xp: 400, jungleCoins: 50 },
    jungleTheme: "Your name echoes through the jungle as the ultimate word guardian!",
  },

  // Wildlife Expert Badges (Skill)
  perfectionist_1: {
    id: "perfectionist_1",
    name: "Eagle Eye",
    description: "Achieved perfect accuracy like a hunting eagle",
    icon: "🦅",
    tier: "bronze" as const,
    category: "skill",
    requirements: { type: "perfect_games", threshold: 1 },
    rewards: { coins: 20, xp: 40, jungleCoins: 4 },
    jungleTheme: "Your sharp eyes spot every detail in the jungle!",
  },
  perfectionist_10: {
    id: "perfectionist_10",
    name: "Jungle Sniper",
    description: "Perfect precision in 10 word hunts",
    icon: "🎯",
    tier: "silver" as const,
    category: "skill",
    requirements: { type: "perfect_games", threshold: 10 },
    rewards: { coins: 75, xp: 150, jungleCoins: 15 },
    jungleTheme: "You never miss your target in the dense jungle!",
  },
  speed_runner_1: {
    id: "speed_runner_1",
    name: "Cheetah Sprint",
    description: "Fast as a cheetah - completed rescue in 15 seconds",
    icon: "🐆",
    tier: "bronze" as const,
    category: "speed",
    requirements: { type: "speed_record", threshold: 15 },
    rewards: { coins: 30, xp: 60, jungleCoins: 6 },
    jungleTheme: "You move through words with cheetah-like speed!",
  },
  speed_runner_5: {
    id: "speed_runner_5",
    name: "Lightning Monkey",
    description: "Swung through 5 speed challenges like a monkey",
    icon: "🐵",
    tier: "silver" as const,
    category: "speed",
    requirements: { type: "speed_record", threshold: 5 },
    rewards: { coins: 80, xp: 160, jungleCoins: 16 },
    jungleTheme: "You swing from word to word faster than any jungle monkey!",
  },

  // Tribal Warrior Badges (Streak)
  daily_warrior_3: {
    id: "daily_warrior_3",
    name: "Jungle Apprentice",
    description: "Trained with the tribe for 3 consecutive days",
    icon: "🏹",
    tier: "bronze" as const,
    category: "streak",
    requirements: { type: "streak_days", threshold: 3 },
    rewards: { coins: 40, xp: 80, jungleCoins: 8 },
    jungleTheme: "The jungle tribe welcomes you as an apprentice warrior!",
  },
  daily_warrior_7: {
    id: "daily_warrior_7",
    name: "Jungle Warrior",
    description: "Proven yourself as a true jungle warrior for a week",
    icon: "⚔️",
    tier: "silver" as const,
    category: "streak",
    requirements: { type: "streak_days", threshold: 7 },
    rewards: { coins: 100, xp: 200, jungleCoins: 20 },
    jungleTheme: "The tribal elders recognize your dedication and strength!",
  },
  daily_warrior_30: {
    id: "daily_warrior_30",
    name: "Jungle Chief",
    description: "Led the tribe for 30 days - now you're the chief!",
    icon: "👑",
    tier: "gold" as const,
    category: "streak",
    requirements: { type: "streak_days", threshold: 30 },
    rewards: { coins: 300, xp: 600, jungleCoins: 60 },
    jungleTheme: "The entire jungle bows to your unwavering leadership!",
  },

  // Discovery Badges (Special Achievement)
  first_rescue: {
    id: "first_rescue",
    name: "First Steps",
    description: "Took your first brave steps into the word jungle",
    icon: "👣",
    tier: "bronze" as const,
    category: "milestone",
    requirements: { type: "words_rescued", threshold: 1 },
    rewards: { coins: 15, xp: 30, jungleCoins: 3 },
    jungleTheme: "Your jungle adventure begins with a single step!",
  },
  level_up_5: {
    id: "level_up_5",
    name: "Jungle Climber",
    description: "Climbed to the jungle canopy - Level 5!",
    icon: "🌳",
    tier: "bronze" as const,
    category: "progression",
    requirements: { type: "level_reached", threshold: 5 },
    rewards: { coins: 50, xp: 100, jungleCoins: 10 },
    jungleTheme: "You've climbed high enough to see the entire jungle!",
  },
  level_up_10: {
    id: "level_up_10",
    name: "Canopy Master",
    description: "Mastered the highest branches - Level 10!",
    icon: "🦋",
    tier: "silver" as const,
    category: "progression",
    requirements: { type: "level_reached", threshold: 10 },
    rewards: { coins: 150, xp: 300, jungleCoins: 30 },
    jungleTheme: "Butterflies guide your way through the highest canopy!",
  },
  coin_collector_100: {
    id: "coin_collector_100",
    name: "Treasure Hunter",
    description: "Discovered 100 golden jungle coins",
    icon: "🪙",
    tier: "bronze" as const,
    category: "wealth",
    requirements: { type: "coins_earned", threshold: 100 },
    rewards: { coins: 25, xp: 50, jungleCoins: 5 },
    jungleTheme: "You've found your first jungle treasure cache!",
  },
  coin_collector_500: {
    id: "coin_collector_500",
    name: "Jungle Millionaire",
    description: "Amassed 500 coins like a jungle trading chief",
    icon: "💰",
    tier: "silver" as const,
    category: "wealth",
    requirements: { type: "coins_earned", threshold: 500 },
    rewards: { coins: 100, xp: 200, jungleCoins: 20 },
    jungleTheme: "Your wealth rivals that of the greatest jungle chiefs!",
  },

  // Special Jungle Badges
  parrot_friend: {
    id: "parrot_friend",
    name: "Parrot Whisperer",
    description: "Befriended the wise jungle parrots",
    icon: "🦜",
    tier: "gold" as const,
    category: "social",
    requirements: { type: "perfect_pronunciation", threshold: 20 },
    rewards: { coins: 200, xp: 300, jungleCoins: 40 },
    jungleTheme: "The colorful parrots sing your praises throughout the jungle!",
  },
  monkey_companion: {
    id: "monkey_companion",
    name: "Monkey's Best Friend",
    description: "Gained the trust of the playful jungle monkeys",
    icon: "🐵",
    tier: "gold" as const,
    category: "social",
    requirements: { type: "consecutive_wins", threshold: 15 },
    rewards: { coins: 180, xp: 280, jungleCoins: 35 },
    jungleTheme: "The monkey tribe adopted you as one of their own!",
  },
  tiger_courage: {
    id: "tiger_courage",
    name: "Tiger's Courage",
    description: "Showed the bravery of a jungle tiger",
    icon: "🐅",
    tier: "platinum" as const,
    category: "courage",
    requirements: { type: "hard_words_mastered", threshold: 25 },
    rewards: { coins: 300, xp: 500, jungleCoins: 75 },
    jungleTheme: "Your courage echoes the mighty roar of the jungle tiger!",
  },
};

type JungleBadgeCategory =
  | "rescue"
  | "skill"
  | "speed"
  | "streak"
  | "milestone"
  | "progression"
  | "wealth"
  | "social"
  | "courage";

const getJungleCategoryInfo = (category: JungleBadgeCategory) => {
  const categoryMap = {
    rescue: { 
      name: "Jungle Explorer", 
      icon: TreePine, 
      color: "text-jungle-DEFAULT",
      gradient: "from-jungle-DEFAULT to-emerald-500",
      bgColor: "bg-jungle-light"
    },
    skill: { 
      name: "Wildlife Expert", 
      icon: Target, 
      color: "text-sunshine-DEFAULT",
      gradient: "from-sunshine-DEFAULT to-orange-500",
      bgColor: "bg-yellow-50"
    },
    speed: { 
      name: "Speed Demon", 
      icon: Zap, 
      color: "text-bright-orange",
      gradient: "from-bright-orange to-coral-red",
      bgColor: "bg-orange-50"
    },
    streak: { 
      name: "Tribal Warrior", 
      icon: Flame, 
      color: "text-coral-red",
      gradient: "from-coral-red to-red-500",
      bgColor: "bg-red-50"
    },
    milestone: { 
      name: "First Discoveries", 
      icon: Compass, 
      color: "text-sky-DEFAULT",
      gradient: "from-sky-DEFAULT to-blue-500",
      bgColor: "bg-sky-50"
    },
    progression: { 
      name: "Jungle Climber", 
      icon: Crown, 
      color: "text-playful-purple",
      gradient: "from-playful-purple to-profile-purple",
      bgColor: "bg-purple-50"
    },
    wealth: { 
      name: "Treasure Hunter", 
      icon: Trophy, 
      color: "text-sunshine-dark",
      gradient: "from-sunshine-DEFAULT to-yellow-600",
      bgColor: "bg-amber-50"
    },
    social: { 
      name: "Animal Friend", 
      icon: Heart, 
      color: "text-pink-500",
      gradient: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50"
    },
    courage: { 
      name: "Fearless Hero", 
      icon: Shield, 
      color: "text-navy-DEFAULT",
      gradient: "from-navy-DEFAULT to-indigo-600",
      bgColor: "bg-indigo-50"
    },
  };
  return categoryMap[category];
};

const getJungleTierColor = (tier: string) => {
  switch (tier) {
    case "bronze":
      return {
        border: "border-amber-500",
        bg: "bg-gradient-to-br from-amber-50 to-orange-100",
        shadow: "shadow-amber-200",
        glow: "animate-jungle-glow"
      };
    case "silver":
      return {
        border: "border-gray-400",
        bg: "bg-gradient-to-br from-gray-50 to-slate-100",
        shadow: "shadow-gray-200",
        glow: "animate-jungle-sparkle"
      };
    case "gold":
      return {
        border: "border-yellow-500",
        bg: "bg-gradient-to-br from-yellow-50 to-amber-100",
        shadow: "shadow-yellow-200",
        glow: "animate-jungle-celebration"
      };
    case "platinum":
      return {
        border: "border-purple-500",
        bg: "bg-gradient-to-br from-purple-50 to-indigo-100",
        shadow: "shadow-purple-200",
        glow: "animate-jungle-level-up"
      };
    default:
      return {
        border: "border-gray-300",
        bg: "bg-gray-50",
        shadow: "shadow-gray-100",
        glow: ""
      };
  }
};

export const EnhancedJungleBadgeSystem: React.FC<BadgeSystemProps> = ({
  hero,
  onClaimReward,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    JungleBadgeCategory | "all"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Calculate badge progress
  const calculateBadgeProgress = (badgeId: string) => {
    const badge = JUNGLE_BADGE_DEFINITIONS[badgeId as keyof typeof JUNGLE_BADGE_DEFINITIONS];
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
        current = hero.badges.filter((b) =>
          b.id.includes("perfectionist"),
        ).length;
        break;
      case "speed_record":
        current = 0; // Would need tracking
        break;
      case "streak_days":
        current = 0; // Would need tracking
        break;
      case "perfect_pronunciation":
        current = 0; // Would need tracking
        break;
      case "consecutive_wins":
        current = 0; // Would need tracking
        break;
      case "hard_words_mastered":
        current = 0; // Would need tracking
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
  const badgesByCategory = Object.values(JUNGLE_BADGE_DEFINITIONS).reduce(
    (acc, badge) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    },
    {} as Record<
      JungleBadgeCategory,
      (typeof JUNGLE_BADGE_DEFINITIONS)[keyof typeof JUNGLE_BADGE_DEFINITIONS][]
    >,
  );

  // Filter badges based on selected category
  const filteredBadges =
    selectedCategory === "all"
      ? Object.values(JUNGLE_BADGE_DEFINITIONS)
      : badgesByCategory[selectedCategory] || [];

  const earnedBadgesCount = hero.badges.length;
  const totalBadgesCount = Object.keys(JUNGLE_BADGE_DEFINITIONS).length;
  const totalJungleCoins = hero.badges.reduce((sum, badge) => {
    const badgeDefinition = JUNGLE_BADGE_DEFINITIONS[badge.id as keyof typeof JUNGLE_BADGE_DEFINITIONS];
    return sum + (badgeDefinition?.rewards?.jungleCoins || 0);
  }, 0);

  return (
    <div className="space-y-6 bg-gradient-to-br from-light-background to-jungle-light/30 min-h-screen p-4 rounded-2xl">
      {/* Jungle Header */}
      <div className="text-center relative">
        <div className="absolute -top-2 left-1/4 text-2xl animate-jungle-float">🌿</div>
        <div className="absolute -top-1 right-1/4 text-2xl animate-jungle-sway">🦜</div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-jungle-DEFAULT via-emerald-500 to-sunshine-DEFAULT bg-clip-text text-transparent mb-2 animate-jungle-glow">
          🏆 Jungle Badge Collection 🌟
        </h2>
        <p className="text-jungle-dark/80 mb-4 text-sm md:text-lg">
          Earn amazing badges by exploring the jungle and mastering words! 🐵🌺
        </p>
        
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-jungle-DEFAULT to-emerald-500 text-white shadow-xl border-0">
            <CardContent className="p-4 md:p-6 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 animate-jungle-celebration" />
              <div className="text-2xl md:text-3xl font-bold mb-1">
                {earnedBadgesCount}/{totalBadgesCount}
              </div>
              <p className="text-sm opacity-90">Jungle Badges Earned</p>
              <Progress
                value={(earnedBadgesCount / totalBadgesCount) * 100}
                className="mt-3 h-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-sunshine-DEFAULT to-orange-500 text-white shadow-xl border-0">
            <CardContent className="p-4 md:p-6 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 animate-jungle-sparkle" />
              <div className="text-2xl md:text-3xl font-bold mb-1">
                {totalJungleCoins}
              </div>
              <p className="text-sm opacity-90">Jungle Coins Earned</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-playful-purple to-profile-purple text-white shadow-xl border-0">
            <CardContent className="p-4 md:p-6 text-center">
              <Crown className="w-8 h-8 mx-auto mb-2 animate-jungle-level-up" />
              <div className="text-2xl md:text-3xl font-bold mb-1">
                Level {hero.level}
              </div>
              <p className="text-sm opacity-90">Jungle Explorer Rank</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Filter and View Mode */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-jungle-DEFAULT/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                onClick={() => setSelectedCategory("all")}
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                className={cn(
                  "transition-all duration-300",
                  selectedCategory === "all"
                    ? "bg-gradient-to-r from-jungle-DEFAULT to-emerald-500 text-white shadow-lg"
                    : "hover:bg-jungle-light border-jungle-DEFAULT/30"
                )}
              >
                🌟 All Adventures
              </Button>
              {Object.keys(badgesByCategory).map((category) => {
                const categoryInfo = getJungleCategoryInfo(category as JungleBadgeCategory);
                const CategoryIcon = categoryInfo.icon;
                const earnedInCategory = badgesByCategory[category as JungleBadgeCategory].filter((badge) =>
                  hero.badges.some((heroB) => heroB.id === badge.id),
                ).length;

                return (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category as JungleBadgeCategory)}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 transition-all duration-300 relative",
                      selectedCategory === category
                        ? `bg-gradient-to-r ${categoryInfo.gradient} text-white shadow-lg`
                        : "hover:bg-jungle-light border-jungle-DEFAULT/30"
                    )}
                  >
                    <CategoryIcon className="w-4 h-4" />
                    <span className="hidden md:inline">{categoryInfo.name}</span>
                    <span className="md:hidden">{categoryInfo.name.split(' ')[0]}</span>
                    {earnedInCategory > 0 && (
                      <Badge className="bg-white/20 text-xs px-1 py-0">
                        {earnedInCategory}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode("grid")}
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                className="p-2"
              >
                <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                className="p-2"
              >
                <div className="space-y-0.5 w-4 h-4">
                  <div className="bg-current h-1 rounded-sm"></div>
                  <div className="bg-current h-1 rounded-sm"></div>
                  <div className="bg-current h-1 rounded-sm"></div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBadges.map((badge) => {
            const progress = calculateBadgeProgress(badge.id);
            const categoryInfo = getJungleCategoryInfo(badge.category as JungleBadgeCategory);
            const tierStyles = getJungleTierColor(badge.tier);
            const CategoryIcon = categoryInfo.icon;

            return (
              <Card
                key={badge.id}
                className={cn(
                  "transition-all duration-300 hover:scale-105 border-2 shadow-lg relative overflow-hidden",
                  progress.earned
                    ? `${tierStyles.border} ${tierStyles.bg} ${tierStyles.shadow} ${tierStyles.glow}`
                    : "border-jungle-DEFAULT/30 bg-white/80 opacity-75 hover:opacity-90"
                )}
              >
                {/* Jungle Background Pattern for Earned Badges */}
                {progress.earned && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50">
                    <div className="absolute top-2 right-2 text-jungle-DEFAULT/20 text-4xl animate-jungle-float">🌿</div>
                    <div className="absolute bottom-2 left-2 text-jungle-DEFAULT/20 text-3xl animate-jungle-sway">🦋</div>
                  </div>
                )}

                <CardContent className="p-4 md:p-6 text-center relative z-10">
                  <div className="relative mb-4">
                    <div
                      className={cn(
                        "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto text-3xl md:text-4xl border-4 transition-all duration-300",
                        progress.earned
                          ? `bg-gradient-to-r ${categoryInfo.gradient} border-white text-white shadow-2xl ${tierStyles.glow}`
                          : "bg-jungle-light/50 border-jungle-DEFAULT/30 text-jungle-DEFAULT/60"
                      )}
                    >
                      {progress.earned ? badge.icon : "🔒"}
                    </div>

                    {progress.earned && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-jungle-celebration">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {!progress.earned && progress.current === progress.max && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-sunshine-DEFAULT rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  <h3
                    className={cn(
                      "text-lg md:text-xl font-bold mb-2",
                      progress.earned ? "text-jungle-dark" : "text-jungle-DEFAULT/60"
                    )}
                  >
                    {badge.name}
                  </h3>

                  <p
                    className={cn(
                      "text-sm mb-3",
                      progress.earned ? "text-jungle-dark/80" : "text-jungle-DEFAULT/50"
                    )}
                  >
                    {badge.description}
                  </p>

                  {/* Jungle Theme Text */}
                  {progress.earned && (
                    <div className="bg-white/90 rounded-lg p-2 mb-4 border border-jungle-DEFAULT/20">
                      <p className="text-xs text-jungle-dark/70 italic">
                        {badge.jungleTheme}
                      </p>
                    </div>
                  )}

                  {/* Category and Tier */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <CategoryIcon className={`w-4 h-4 ${categoryInfo.color}`} />
                      <span className="text-xs text-jungle-DEFAULT/70">
                        {categoryInfo.name}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize",
                        badge.tier === "bronze" && "border-amber-500 text-amber-600",
                        badge.tier === "silver" && "border-gray-500 text-gray-600",
                        badge.tier === "gold" && "border-yellow-500 text-yellow-600",
                        badge.tier === "platinum" && "border-purple-500 text-purple-600"
                      )}
                    >
                      {badge.tier}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span
                        className={
                          progress.earned ? "text-emerald-600 font-semibold" : "text-jungle-DEFAULT/70"
                        }
                      >
                        {progress.earned ? "Achieved!" : "Progress"}
                      </span>
                      <span
                        className={
                          progress.earned ? "text-emerald-600 font-semibold" : "text-jungle-DEFAULT/70"
                        }
                      >
                        {progress.current}/{progress.max}
                      </span>
                    </div>
                    <Progress
                      value={(progress.current / progress.max) * 100}
                      className={cn(
                        "h-2",
                        progress.earned ? "bg-emerald-100" : "bg-jungle-light/50"
                      )}
                    />
                  </div>

                  {/* Rewards */}
                  <div className="pt-3 border-t border-jungle-DEFAULT/20">
                    <div className="text-xs text-jungle-DEFAULT/70 mb-2">Jungle Rewards</div>
                    <div className="flex justify-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-sunshine-DEFAULT">🪙</span>
                        <span className="font-semibold">{badge.rewards.coins}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-sky-DEFAULT" />
                        <span className="font-semibold">{badge.rewards.xp}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-jungle-DEFAULT">💎</span>
                        <span className="font-semibold">{badge.rewards.jungleCoins}</span>
                      </div>
                    </div>
                  </div>

                  {/* Claim Button */}
                  {progress.earned && onClaimReward && (
                    <Button
                      onClick={() => onClaimReward(badge.id)}
                      className={cn(
                        "mt-4 w-full text-white shadow-lg transition-all duration-300 hover:scale-105",
                        `bg-gradient-to-r ${categoryInfo.gradient} hover:shadow-xl`
                      )}
                      size="sm"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Claim Jungle Reward
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredBadges.map((badge) => {
            const progress = calculateBadgeProgress(badge.id);
            const categoryInfo = getJungleCategoryInfo(badge.category as JungleBadgeCategory);
            const CategoryIcon = categoryInfo.icon;

            return (
              <Card
                key={badge.id}
                className={cn(
                  "transition-all duration-300 hover:scale-[1.02] border-2",
                  progress.earned
                    ? `border-jungle-DEFAULT bg-gradient-to-r from-jungle-light to-emerald-50 shadow-lg`
                    : "border-jungle-DEFAULT/30 bg-white/80"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Badge Icon */}
                    <div
                      className={cn(
                        "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-2xl md:text-3xl border-2 flex-shrink-0",
                        progress.earned
                          ? `bg-gradient-to-r ${categoryInfo.gradient} border-white text-white shadow-lg`
                          : "bg-jungle-light/50 border-jungle-DEFAULT/30 text-jungle-DEFAULT/60"
                      )}
                    >
                      {progress.earned ? badge.icon : "🔒"}
                    </div>

                    {/* Badge Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={cn(
                            "text-lg font-bold truncate",
                            progress.earned ? "text-jungle-dark" : "text-jungle-DEFAULT/60"
                          )}
                        >
                          {badge.name}
                        </h3>
                        <CategoryIcon className={`w-4 h-4 ${categoryInfo.color} flex-shrink-0`} />
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs capitalize",
                            badge.tier === "bronze" && "border-amber-500 text-amber-600",
                            badge.tier === "silver" && "border-gray-500 text-gray-600",
                            badge.tier === "gold" && "border-yellow-500 text-yellow-600",
                            badge.tier === "platinum" && "border-purple-500 text-purple-600"
                          )}
                        >
                          {badge.tier}
                        </Badge>
                        {progress.earned && (
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>

                      <p
                        className={cn(
                          "text-sm mb-2",
                          progress.earned ? "text-jungle-dark/80" : "text-jungle-DEFAULT/50"
                        )}
                      >
                        {badge.description}
                      </p>

                      {/* Progress and Rewards Row */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{progress.current}/{progress.max}</span>
                            <span>{Math.round((progress.current / progress.max) * 100)}%</span>
                          </div>
                          <Progress
                            value={(progress.current / progress.max) * 100}
                            className="h-2"
                          />
                        </div>

                        <div className="flex items-center gap-4 text-sm flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <span className="text-sunshine-DEFAULT">🪙</span>
                            <span>{badge.rewards.coins}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-sky-DEFAULT" />
                            <span>{badge.rewards.xp}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-jungle-DEFAULT">💎</span>
                            <span>{badge.rewards.jungleCoins}</span>
                          </div>
                        </div>

                        {progress.earned && onClaimReward && (
                          <Button
                            onClick={() => onClaimReward(badge.id)}
                            size="sm"
                            className={`bg-gradient-to-r ${categoryInfo.gradient} text-white`}
                          >
                            <Award className="w-4 h-4 mr-1" />
                            Claim
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Jungle Statistics */}
      <Card className="bg-gradient-to-r from-jungle-light to-emerald-50 border-2 border-jungle-DEFAULT/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-jungle-dark">
            <Trophy className="w-6 h-6 text-jungle-DEFAULT" />
            🌟 Jungle Badge Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Object.entries(badgesByCategory).map(([category, badges]) => {
              const categoryInfo = getJungleCategoryInfo(category as JungleBadgeCategory);
              const CategoryIcon = categoryInfo.icon;
              const earnedInCategory = badges.filter((badge) =>
                hero.badges.some((heroB) => heroB.id === badge.id),
              ).length;

              return (
                <div
                  key={category}
                  className={cn(
                    "text-center p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105",
                    categoryInfo.bgColor,
                    earnedInCategory > 0 ? "border-jungle-DEFAULT/50" : "border-jungle-DEFAULT/20"
                  )}
                >
                  <CategoryIcon
                    className={`w-8 h-8 mx-auto mb-2 ${categoryInfo.color}`}
                  />
                  <div className="font-bold text-lg text-jungle-dark">
                    {earnedInCategory}/{badges.length}
                  </div>
                  <div className="text-sm text-jungle-dark/70">
                    {categoryInfo.name}
                  </div>
                  <Progress
                    value={(earnedInCategory / badges.length) * 100}
                    className="mt-2 h-2"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
