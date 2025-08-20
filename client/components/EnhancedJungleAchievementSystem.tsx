import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Star,
  Target,
  BookOpen,
  Zap,
  Heart,
  Crown,
  Gem,
  Rocket,
  Sparkles,
  Gift,
  Lock,
  Check,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Calendar,
  TrendingUp,
  Award,
  TreePine,
  Leaf,
  Compass,
  Map,
} from "lucide-react";
import { audioService } from "@/lib/audioService";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { AchievementTracker } from "@/lib/achievementTracker";
import { EnhancedAchievementTracker } from "@/lib/enhancedAchievementTracker";
import { goalProgressTracker } from "@/lib/goalProgressTracker";
import { CategoryCompletionTracker } from "@/lib/categoryCompletionTracker";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "learning" | "streak" | "quiz" | "exploration" | "social";
  difficulty: "bronze" | "silver" | "gold" | "diamond";
  requirements: number;
  currentProgress: number;
  unlocked: boolean;
  dateUnlocked?: Date;
  reward?: {
    type: "avatar_accessory" | "theme" | "sound_effect" | "title" | "points";
    item: string;
    value?: number;
  };
}

interface UnlockableContent {
  id: string;
  name: string;
  type:
    | "avatar_hat"
    | "avatar_accessory"
    | "background_theme"
    | "sound_pack"
    | "special_effect";
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedBy?: string;
  previewUrl?: string;
}

interface LearningStats {
  totalWordsLearned: number;
  weeklyProgress: number[];
  categoryBreakdown: Array<{
    category: string;
    wordsLearned: number;
    accuracy: number;
    timeSpent: number;
  }>;
  difficultyProgress: Array<{
    difficulty: "easy" | "medium" | "hard";
    completed: number;
    total: number;
  }>;
  streakData: Array<{
    date: string;
    active: boolean;
    wordsLearned: number;
  }>;
  learningSpeed: number;
  currentAccuracy: number;
}

const getWeeklyProgressData = (userId: string): number[] => {
  const weeklyData: number[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    try {
      const dailyData = localStorage.getItem(
        `daily_progress_${userId}_${dateKey}`,
      );
      if (dailyData) {
        const parsed = JSON.parse(dailyData);
        weeklyData.push(parsed.words || 0);
      } else {
        weeklyData.push(0);
      }
    } catch (error) {
      weeklyData.push(0);
    }
  }

  return weeklyData;
};

const getStreakData = (
  userId: string,
): Array<{ date: string; active: boolean; wordsLearned: number }> => {
  const streakData: Array<{
    date: string;
    active: boolean;
    wordsLearned: number;
  }> = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    try {
      const dailyData = localStorage.getItem(
        `daily_progress_${userId}_${dateKey}`,
      );
      if (dailyData) {
        const parsed = JSON.parse(dailyData);
        streakData.push({
          date: dateKey,
          active: (parsed.words || 0) > 0,
          wordsLearned: parsed.words || 0,
        });
      } else {
        streakData.push({
          date: dateKey,
          active: false,
          wordsLearned: 0,
        });
      }
    } catch (error) {
      streakData.push({
        date: dateKey,
        active: false,
        wordsLearned: 0,
      });
    }
  }

  return streakData;
};

const jungleUnlockableContent: UnlockableContent[] = [
  {
    id: "jungle_explorer_hat",
    name: "Jungle Explorer Hat",
    type: "avatar_hat",
    description: "A safari hat for brave jungle explorers",
    icon: "🏕️",
    unlocked: false,
    unlockedBy: "word_collector",
  },
  {
    id: "tropical_paradise_theme",
    name: "Tropical Paradise Theme",
    type: "background_theme",
    description: "Lush jungle backgrounds with waterfall sounds",
    icon: "🌴",
    unlocked: false,
    unlockedBy: "vocabulary_master",
  },
  {
    id: "monkey_companion",
    name: "Monkey Companion",
    type: "avatar_accessory",
    description: "A friendly monkey that cheers you on!",
    icon: "🐵",
    unlocked: false,
    unlockedBy: "streak_starter",
  },
  {
    id: "parrot_sounds",
    name: "Tropical Bird Sounds",
    type: "sound_pack",
    description: "Beautiful jungle bird calls and nature sounds",
    icon: "🦜",
    unlocked: false,
    unlockedBy: "quiz_master",
  },
  {
    id: "vine_swing_effect",
    name: "Vine Swing Effect",
    type: "special_effect",
    description: "Swing through the jungle when you learn!",
    icon: "🌿",
    unlocked: false,
    unlockedBy: "dedication_champion",
  },
  {
    id: "jungle_crown",
    name: "King of the Jungle Crown",
    type: "avatar_hat",
    description: "The ultimate crown for jungle learning champions",
    icon: "👑",
    unlocked: false,
    unlockedBy: "jungle_master",
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "bronze":
      return "from-amber-500 to-orange-600";
    case "silver":
      return "from-gray-400 to-slate-600";
    case "gold":
      return "from-yellow-500 to-amber-600";
    case "diamond":
      return "from-cyan-400 to-emerald-500";
    default:
      return "from-gray-400 to-gray-600";
  }
};

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case "bronze":
      return <Trophy className="w-4 h-4 text-amber-600" />;
    case "silver":
      return <Star className="w-4 h-4 text-gray-600" />;
    case "gold":
      return <Crown className="w-4 h-4 text-yellow-600" />;
    case "diamond":
      return <Gem className="w-4 h-4 text-emerald-600" />;
    default:
      return <Trophy className="w-4 h-4" />;
  }
};

interface EnhancedJungleAchievementSystemProps {
  onUnlock?: (achievement: Achievement) => void;
  stats?: LearningStats;
  onRefresh?: () => void;
}

export function EnhancedJungleAchievementSystem({
  onUnlock,
  onRefresh,
}: EnhancedJungleAchievementSystemProps) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showUnlockables, setShowUnlockables] = useState(false);
  const [activeTab, setActiveTab] = useState("achievements");
  const [isLoading, setIsLoading] = useState(true);
  const [realStats, setRealStats] = useState<LearningStats | null>(null);
  const [realAchievements, setRealAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const loadRealData = async () => {
      try {
        setIsLoading(true);
        const userId = user?.id || "guest";

        let achievements, journeyProgress;
        try {
          achievements = EnhancedAchievementTracker.getAchievements();
          journeyProgress = EnhancedAchievementTracker.getJourneyProgress();
        } catch (error) {
          achievements = AchievementTracker.getAchievements();
          journeyProgress = AchievementTracker.getJourneyProgress();
        }

        achievements = achievements || [];
        journeyProgress = journeyProgress || {
          wordsLearned: 0,
          streakDays: 0,
          totalAccuracy: 85,
          difficultyStats: {
            easy: { completed: 0 },
            medium: { completed: 0 },
            hard: { completed: 0 },
          },
        };

        const categoryStats =
          CategoryCompletionTracker.getCurrentCategoryStats();
        const completionHistory =
          CategoryCompletionTracker.getCompletionHistory();

        let categoryBreakdown = [];
        if (categoryStats && typeof categoryStats === "object") {
          categoryBreakdown = [
            {
              category: "Current Session",
              wordsLearned: categoryStats.wordsReviewed || 0,
              accuracy: categoryStats.accuracy || 0,
              timeSpent: categoryStats.timeSpent || 0,
            },
          ];
        } else {
          const categoryMap = new Map();
          completionHistory.forEach((record: any) => {
            const categoryName = record.categoryId || "Unknown";
            if (categoryMap.has(categoryName)) {
              const existing = categoryMap.get(categoryName);
              existing.wordsLearned += record.wordsReviewed || 0;
              existing.timeSpent += record.timeSpent || 0;
              existing.totalSessions++;
              existing.totalAccuracy += record.accuracy || 0;
              existing.accuracy =
                existing.totalAccuracy / existing.totalSessions;
            } else {
              categoryMap.set(categoryName, {
                category:
                  categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
                wordsLearned: record.wordsReviewed || 0,
                accuracy: record.accuracy || 0,
                timeSpent: record.timeSpent || 0,
                totalSessions: 1,
                totalAccuracy: record.accuracy || 0,
              });
            }
          });

          categoryBreakdown = Array.from(categoryMap.values()).map((cat) => ({
            category: cat.category,
            wordsLearned: cat.wordsLearned,
            accuracy: Math.round(cat.accuracy),
            timeSpent: cat.timeSpent,
          }));

          if (categoryBreakdown.length === 0) {
            categoryBreakdown = [
              {
                category: "Getting Started",
                wordsLearned: 0,
                accuracy: 0,
                timeSpent: 0,
              },
            ];
          }
        }

        let progressData;
        try {
          progressData =
            await goalProgressTracker.fetchSystematicProgress(userId);
        } catch (error) {
          progressData = {
            totalWordsLearned: journeyProgress.wordsLearned,
            currentStreak: journeyProgress.streakDays,
            wordsLearnedToday: 0,
            wordsLearnedThisWeek: 0,
            categoriesProgress: {},
          };
        }

        const weeklyWords = getWeeklyProgressData(userId);
        const totalWeeklyWords = weeklyWords.reduce(
          (sum, count) => sum + count,
          0,
        );
        const avgWordsPerDay = totalWeeklyWords / 7;
        const learningSpeed = avgWordsPerDay * 2;
        const currentAccuracy = journeyProgress.totalAccuracy || 85;

        const realLearningStats: LearningStats = {
          totalWordsLearned:
            progressData.totalWordsLearned || journeyProgress.wordsLearned,
          weeklyProgress: weeklyWords,
          categoryBreakdown,
          difficultyProgress: [
            {
              difficulty: "easy",
              completed: journeyProgress.difficultyStats?.easy?.completed || 0,
              total: 50,
            },
            {
              difficulty: "medium",
              completed:
                journeyProgress.difficultyStats?.medium?.completed || 0,
              total: 50,
            },
            {
              difficulty: "hard",
              completed: journeyProgress.difficultyStats?.hard?.completed || 0,
              total: 30,
            },
          ],
          streakData: getStreakData(userId),
          learningSpeed: Math.max(learningSpeed, 1),
          currentAccuracy,
        };

        setRealStats(realLearningStats);
        setRealAchievements(achievements);
      } catch (error) {
        console.error("Error loading real data:", error);
        setRealStats({
          totalWordsLearned: 0,
          weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
          categoryBreakdown: [],
          difficultyProgress: [
            { difficulty: "easy", completed: 0, total: 50 },
            { difficulty: "medium", completed: 0, total: 50 },
            { difficulty: "hard", completed: 0, total: 30 },
          ],
          streakData: [],
          learningSpeed: 1,
          currentAccuracy: 0,
        });
        setRealAchievements([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadRealData();
  }, [user?.id]);

  const refreshData = () => {
    setIsLoading(true);
    const userId = user?.id || "guest";

    const loadData = async () => {
      try {
        let achievements, journeyProgress;
        try {
          achievements = EnhancedAchievementTracker.getAchievements();
          journeyProgress = EnhancedAchievementTracker.getJourneyProgress();
        } catch (error) {
          achievements = AchievementTracker.getAchievements();
          journeyProgress = AchievementTracker.getJourneyProgress();
        }

        achievements = achievements || [];
        journeyProgress = journeyProgress || {
          wordsLearned: 0,
          streakDays: 0,
          totalAccuracy: 85,
          difficultyStats: {
            easy: { completed: 0 },
            medium: { completed: 0 },
            hard: { completed: 0 },
          },
        };

        setRealAchievements(achievements);

        const weeklyWords = getWeeklyProgressData(userId);
        const totalWeeklyWords = weeklyWords.reduce(
          (sum, count) => sum + count,
          0,
        );
        const avgWordsPerDay = totalWeeklyWords / 7;
        const learningSpeed = avgWordsPerDay * 2;

        const realLearningStats: LearningStats = {
          totalWordsLearned: journeyProgress.wordsLearned,
          weeklyProgress: weeklyWords,
          categoryBreakdown: [],
          difficultyProgress: [
            {
              difficulty: "easy",
              completed: journeyProgress.difficultyStats?.easy?.completed || 0,
              total: 50,
            },
            {
              difficulty: "medium",
              completed:
                journeyProgress.difficultyStats?.medium?.completed || 0,
              total: 50,
            },
            {
              difficulty: "hard",
              completed: journeyProgress.difficultyStats?.hard?.completed || 0,
              total: 30,
            },
          ],
          streakData: getStreakData(userId),
          learningSpeed: Math.max(learningSpeed, 1),
          currentAccuracy: journeyProgress.totalAccuracy || 85,
        };

        setRealStats(realLearningStats);

        if (onRefresh) {
          onRefresh();
        }
      } catch (error) {
        console.error("Error refreshing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  };

  const stats = realStats;
  const achievements = realAchievements;

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-jungle-light to-green-50 rounded-2xl">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-jungle-DEFAULT border-t-transparent mx-auto mb-6"></div>
          <div className="text-2xl mb-2">🌿 Loading your jungle adventure...</div>
          <p className="text-jungle-dark/70">Discovering your achievements in the wild!</p>
        </div>
      </div>
    );
  }

  const categories = [
    { id: "all", name: "All Adventures", icon: "🌟", color: "from-jungle-DEFAULT to-emerald-500" },
    { id: "learning", name: "Word Discovery", icon: "📚", color: "from-blue-500 to-cyan-500" },
    { id: "streak", name: "Daily Quests", icon: "🔥", color: "from-orange-500 to-red-500" },
    { id: "quiz", name: "Brain Challenges", icon: "🧠", color: "from-purple-500 to-pink-500" },
    { id: "exploration", name: "Jungle Exploration", icon: "🗺️", color: "from-green-500 to-jungle-DEFAULT" },
  ];

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const totalPoints = unlockedAchievements.reduce((sum, a) => {
    const points =
      a.difficulty === "bronze"
        ? 10
        : a.difficulty === "silver"
          ? 25
          : a.difficulty === "gold"
            ? 50
            : 100;
    return sum + points;
  }, 0);

  const handleAchievementClick = (achievement: Achievement) => {
    if (achievement.unlocked) {
      audioService.playCheerSound();
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    return Math.min(
      (achievement.currentProgress / achievement.requirements) * 100,
      100,
    );
  };

  const renderJungleProgressOverview = () => (
    <div className="space-y-6">
      {/* Jungle Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 px-2 md:px-0">
        <Card className="bg-gradient-to-br from-jungle-DEFAULT to-emerald-600 text-white hover:scale-105 transition-all duration-300 shadow-lg border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-jungle-sparkle"></div>
          <CardContent className="p-3 md:p-6 text-center relative z-10">
            <div className="text-2xl mb-1 animate-jungle-float">🌿</div>
            <Brain className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 animate-pulse" />
            <div className="text-xl md:text-3xl font-bold mb-1">
              <AnimatedCounter value={stats.totalWordsLearned} />
            </div>
            <p className="text-xs md:text-sm opacity-90">Words Discovered!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sunshine-DEFAULT to-orange-500 text-white hover:scale-105 transition-all duration-300 shadow-lg border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-jungle-sparkle"></div>
          <CardContent className="p-3 md:p-6 text-center relative z-10">
            <div className="text-2xl mb-1 animate-jungle-sway">⚡</div>
            <Zap className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 animate-bounce" />
            <div className="text-xl md:text-3xl font-bold mb-1">
              <AnimatedCounter value={stats.learningSpeed} suffix="/hr" />
            </div>
            <p className="text-xs md:text-sm opacity-90">Jungle Speed!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-bright-orange to-coral-red text-white hover:scale-105 transition-all duration-300 shadow-lg border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-jungle-sparkle"></div>
          <CardContent className="p-3 md:p-6 text-center relative z-10">
            <div className="text-2xl mb-1 animate-jungle-celebration">🎯</div>
            <Target className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 animate-spin" style={{ animationDuration: "3s" }} />
            <div className="text-xl md:text-3xl font-bold mb-1">
              <AnimatedCounter value={stats.currentAccuracy} suffix="%" />
            </div>
            <p className="text-xs md:text-sm opacity-90">Explorer Accuracy!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-playful-purple to-profile-purple text-white hover:scale-105 transition-all duration-300 shadow-lg border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-jungle-sparkle"></div>
          <CardContent className="p-3 md:p-6 text-center relative z-10">
            <div className="text-2xl mb-1 animate-jungle-level-up">🏆</div>
            <Trophy className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 animate-pulse" />
            <div className="text-xl md:text-3xl font-bold mb-1">
              <AnimatedCounter value={unlockedAchievements.length} />
            </div>
            <p className="text-xs md:text-sm opacity-90">Jungle Treasures!</p>
          </CardContent>
        </Card>
      </div>

      {/* Jungle Weekly Progress */}
      <Card className="bg-gradient-to-br from-jungle-light to-emerald-50 mx-2 md:mx-0 border-2 border-jungle-DEFAULT/30 shadow-xl">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-jungle-dark text-lg md:text-xl">
            <TreePine className="w-5 h-5 md:w-6 md:h-6 text-jungle-DEFAULT" />
            🌟 Your Jungle Journey This Week!
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="grid grid-cols-7 gap-1 md:gap-2 h-24 md:h-32 mb-4">
            {stats.weeklyProgress.map((value, index) => {
              const maxValue = Math.max(...stats.weeklyProgress) || 1;
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
              const jungleEmojis = ["🌿", "🦜", "🐵", "🌺", "🦋", "🌴", "🏖️"];

              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex-1 flex flex-col justify-end">
                    <div
                      className="bg-gradient-to-t from-jungle-DEFAULT to-emerald-400 rounded-t-lg min-h-[8px] transition-all duration-1000 ease-bounce hover:scale-110 shadow-md"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <p className="text-xs text-jungle-dark/70 mt-1">{days[index]}</p>
                  <p className="text-sm md:text-lg">{jungleEmojis[index]}</p>
                  <p className="text-xs md:text-sm font-bold text-jungle-DEFAULT">
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-center text-jungle-dark font-semibold text-sm md:text-base">
            Keep exploring the jungle of knowledge! 🌺🦜
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderJungleCategoryFun = () => (
    <div className="space-y-4 md:space-y-6">
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 mx-2 md:mx-0 border-2 border-sunshine-DEFAULT/30 shadow-xl">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-sunshine-dark text-lg md:text-xl">
            <Leaf className="w-5 h-5 md:w-6 md:h-6 text-jungle-DEFAULT" />
            🎨 Your Learning Habitat!
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="space-y-3 md:space-y-4">
            {stats.categoryBreakdown.map((category, index) => {
              const jungleColors = [
                "from-jungle-DEFAULT to-emerald-400",
                "from-sky-DEFAULT to-blue-400",
                "from-sunshine-DEFAULT to-orange-400",
                "from-playful-purple to-purple-400",
                "from-coral-red to-pink-400",
                "from-bright-orange to-yellow-400",
              ];
              const jungleIcons = ["🌿", "🦜", "🐵", "🌺", "🦋", "🌴"];
              const color = jungleColors[index % jungleColors.length];
              const icon = jungleIcons[index % jungleIcons.length];

              return (
                <div key={category.category} className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div
                        className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r ${color} flex items-center justify-center text-white shadow-lg text-sm md:text-base animate-jungle-glow`}
                      >
                        {icon}
                      </div>
                      <div>
                        <span className="font-bold text-jungle-dark text-sm md:text-base">
                          {category.category}
                        </span>
                        <p className="text-xs text-jungle-DEFAULT/70 hidden md:block">
                          Exploring new territories! 🗺️
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-xs md:text-sm">
                      <span className="bg-jungle-DEFAULT/20 px-2 py-1 rounded-full text-jungle-DEFAULT font-semibold">
                        {category.wordsLearned} discoveries!
                      </span>
                      <span className="bg-emerald-500/20 px-2 py-1 rounded-full text-emerald-600 font-semibold">
                        {category.accuracy}% mastery!
                      </span>
                    </div>
                  </div>
                  <div className="bg-jungle-light/30 rounded-full h-3 overflow-hidden border border-jungle-DEFAULT/20">
                    <div
                      className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 rounded-full animate-jungle-glow`}
                      style={{
                        width: `${Math.max((category.wordsLearned / (stats.totalWordsLearned || 1)) * 100, 5)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderJungleStreakFun = () => (
    <div className="space-y-3 md:space-y-4 lg:space-y-6">
      <Card className="bg-gradient-to-br from-emerald-50 to-jungle-light mx-1 md:mx-0 border-2 border-jungle-DEFAULT/30 shadow-xl">
        <CardHeader className="pb-2 md:pb-3 lg:pb-6">
          <CardTitle className="flex items-center gap-2 text-jungle-dark text-base md:text-lg">
            <Map className="w-4 h-4 md:w-5 md:h-5 text-jungle-DEFAULT" />
            🔥 Jungle Expedition Map!
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 md:px-3 lg:px-6">
          <div className="space-y-2 md:space-y-3">
            <p className="text-center text-jungle-dark font-semibold text-xs md:text-sm">
              Your learning expedition! Each footprint marks a day of discovery! 🦶🗺️
            </p>

            <div className="grid grid-cols-10 gap-0.5 justify-center">
              {stats.streakData.map((day, index) => {
                const jungleEmojis = ["🌿", "🦜", "🐵", "🌺", "🦋"];
                const randomEmoji =
                  jungleEmojis[Math.floor(Math.random() * jungleEmojis.length)];

                return (
                  <div
                    key={index}
                    className={`w-4 h-4 md:w-5 md:h-5 rounded-md flex items-center justify-center text-xs font-bold transition-all hover:scale-110 cursor-pointer ${
                      day.active
                        ? day.wordsLearned > 8
                          ? "bg-gradient-to-br from-jungle-DEFAULT to-emerald-500 text-white shadow-lg animate-jungle-celebration"
                          : day.wordsLearned > 4
                            ? "bg-gradient-to-br from-sky-DEFAULT to-blue-500 text-white shadow-md animate-jungle-sparkle"
                            : "bg-gradient-to-br from-sunshine-DEFAULT to-orange-500 text-white shadow-sm animate-jungle-glow"
                        : "bg-jungle-light/50 text-jungle-DEFAULT/40 hover:bg-jungle-light/70 border border-jungle-DEFAULT/20"
                    }`}
                    title={`${day.date}: ${day.active ? `${day.wordsLearned} jungle discoveries! ${randomEmoji}` : "Rest day in the village 🏕️"}`}
                  >
                    {day.active
                      ? day.wordsLearned > 8
                        ? "🏆"
                        : day.wordsLearned > 4
                          ? "⭐"
                          : "✨"
                      : "🏕️"}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 md:flex md:items-center md:justify-center gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-jungle-light/50 border border-jungle-DEFAULT/20 rounded-sm flex items-center justify-center text-xs">
                  🏕️
                </div>
                <span className="text-jungle-DEFAULT/70">Village rest</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-sunshine-DEFAULT rounded-sm flex items-center justify-center text-white text-xs">
                  ✨
                </div>
                <span className="text-sunshine-dark font-semibold">
                  Exploring
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-sky-DEFAULT rounded-sm flex items-center justify-center text-white text-xs">
                  ⭐
                </div>
                <span className="text-sky-dark font-semibold">
                  Great trek
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-jungle-DEFAULT rounded-sm flex items-center justify-center text-white text-xs">
                  🏆
                </div>
                <span className="text-jungle-dark font-semibold">
                  Epic adventure!
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 bg-gradient-to-br from-light-background to-jungle-light/30 min-h-screen p-4 rounded-2xl">
      {/* Jungle Adventure Header */}
      <div className="text-center px-4 relative">
        <div className="absolute -top-2 left-1/4 text-2xl animate-jungle-float">🌿</div>
        <div className="absolute -top-1 right-1/4 text-2xl animate-jungle-sway">🦜</div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-jungle-DEFAULT via-emerald-500 to-sky-DEFAULT bg-clip-text text-transparent mb-2 leading-tight animate-jungle-glow">
          🌟 Your Jungle Learning Adventure! 🏆
        </h2>
        <p className="text-jungle-dark/80 mb-4 text-sm md:text-lg px-2">
          Explore the wild world of words and unlock amazing jungle treasures! 🌺🦋
        </p>
        <div className="flex justify-center gap-2 text-xl animate-jungle-celebration">
          <span>🐵</span>
          <span>🌴</span>
          <span>🦋</span>
        </div>
      </div>

      {/* Jungle Adventure Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 md:gap-0 bg-gradient-to-r from-jungle-DEFAULT/10 to-emerald-500/10 h-auto p-1 border-2 border-jungle-DEFAULT/20 rounded-xl shadow-lg">
          <TabsTrigger
            value="achievements"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-jungle-DEFAULT data-[state=active]:text-white text-xs md:text-sm py-2 md:py-3 px-1 md:px-3 rounded-lg transition-all duration-300"
          >
            <Trophy className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden md:inline">🏆 Treasures</span>
            <span className="md:hidden text-center">
              🏆
              <br />
              Treasures
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs md:text-sm py-2 md:py-3 px-1 md:px-3 rounded-lg transition-all duration-300"
          >
            <TrendingUp className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden md:inline">📈 Journey</span>
            <span className="md:hidden text-center">
              📈
              <br />
              Journey
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-sunshine-DEFAULT data-[state=active]:text-white text-xs md:text-sm py-2 md:py-3 px-1 md:px-3 rounded-lg transition-all duration-300"
          >
            <PieChart className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden md:inline">🎨 Habitats</span>
            <span className="md:hidden text-center">
              🎨
              <br />
              Habitats
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="streaks"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-bright-orange data-[state=active]:text-white text-xs md:text-sm py-2 md:py-3 px-1 md:px-3 rounded-lg transition-all duration-300"
          >
            <Activity className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden md:inline">🔥 Expedition</span>
            <span className="md:hidden text-center">
              🔥
              <br />
              Expedition
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          {renderJungleProgressOverview()}
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          {renderJungleCategoryFun()}
        </TabsContent>

        <TabsContent value="streaks" className="mt-6">
          {renderJungleStreakFun()}
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="space-y-6">
            {/* Jungle Achievement Stats */}
            <div className="flex justify-center gap-2 md:gap-4 mb-4 md:mb-6 px-2">
              <Card className="bg-gradient-to-r from-jungle-DEFAULT to-emerald-500 text-white hover:scale-105 transition-all duration-300 flex-1 max-w-[150px] shadow-xl border-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-jungle-sparkle"></div>
                <CardContent className="p-3 md:p-4 text-center relative z-10">
                  <div className="text-xl md:text-2xl font-bold">
                    {unlockedAchievements.length}
                  </div>
                  <div className="text-xs md:text-sm opacity-90">
                    🏆 Jungle Treasures!
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-sunshine-DEFAULT to-bright-orange text-white hover:scale-105 transition-all duration-300 flex-1 max-w-[150px] shadow-xl border-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-jungle-sparkle"></div>
                <CardContent className="p-3 md:p-4 text-center relative z-10">
                  <div className="text-xl md:text-2xl font-bold">
                    {totalPoints}
                  </div>
                  <div className="text-xs md:text-sm opacity-90">
                    ⭐ Adventure Points!
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Jungle Category Filters */}
            <div className="flex justify-center gap-1 md:gap-2 flex-wrap px-2 md:px-0">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center gap-1 md:gap-2 hover:scale-105 transition-all duration-300 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 rounded-lg shadow-md border-2",
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg`
                      : "border-jungle-DEFAULT/30 hover:border-jungle-DEFAULT/50 bg-white/80 text-jungle-dark"
                  )}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </Button>
              ))}
              <Button
                variant={showUnlockables ? "default" : "outline"}
                size="sm"
                onClick={() => setShowUnlockables(!showUnlockables)}
                className={cn(
                  "flex items-center gap-1 md:gap-2 hover:scale-105 transition-all duration-300 text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 rounded-lg shadow-md border-2",
                  showUnlockables
                    ? "bg-gradient-to-r from-playful-purple to-profile-purple text-white border-transparent shadow-lg"
                    : "border-jungle-DEFAULT/30 hover:border-jungle-DEFAULT/50 bg-white/80 text-jungle-dark"
                )}
              >
                <Gift className="w-4 h-4" />
                🎁 Rewards
              </Button>
            </div>

            {/* Jungle Achievements Grid */}
            {!showUnlockables && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 px-2 md:px-0">
                {filteredAchievements.map((achievement) => {
                  const progressPercentage = getProgressPercentage(achievement);
                  const isComplete = progressPercentage >= 100;

                  return (
                    <Card
                      key={achievement.id}
                      className={`cursor-pointer transition-all duration-300 md:hover:scale-105 shadow-lg border-2 ${
                        achievement.unlocked
                          ? `bg-gradient-to-br ${getDifficultyColor(achievement.difficulty)} text-white shadow-xl border-transparent animate-jungle-glow`
                          : "bg-white/90 border-dashed border-jungle-DEFAULT/40 hover:border-jungle-DEFAULT/60 hover:bg-white/95"
                      }`}
                      onClick={() => handleAchievementClick(achievement)}
                    >
                      {/* Mobile Compact Layout */}
                      <div className="block md:hidden">
                        <div className="flex items-center gap-2 p-2">
                          <div className="text-2xl flex-shrink-0 animate-jungle-sway">
                            {achievement.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3
                                className={`text-sm font-semibold truncate ${
                                  achievement.unlocked
                                    ? "text-white"
                                    : "text-jungle-dark"
                                }`}
                              >
                                {achievement.name}
                              </h3>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {getDifficultyIcon(achievement.difficulty)}
                                {achievement.unlocked && (
                                  <Check className="w-3 h-3 text-green-300 animate-jungle-celebration" />
                                )}
                                {!achievement.unlocked && isComplete && (
                                  <Sparkles className="w-3 h-3 text-sunshine-DEFAULT animate-pulse" />
                                )}
                                {!achievement.unlocked && !isComplete && (
                                  <Lock className="w-3 h-3 text-jungle-DEFAULT/60" />
                                )}
                              </div>
                            </div>
                            <p
                              className={`text-xs leading-tight mb-2 ${
                                achievement.unlocked
                                  ? "text-white/90"
                                  : "text-jungle-dark/70"
                              }`}
                            >
                              {achievement.description}
                            </p>
                            {!achievement.unlocked && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-jungle-DEFAULT/70">
                                    Progress
                                  </span>
                                  <span className="font-semibold text-jungle-dark">
                                    {achievement.currentProgress}/
                                    {achievement.requirements}
                                  </span>
                                </div>
                                <Progress
                                  value={progressPercentage}
                                  className="h-1.5"
                                />
                                {isComplete && (
                                  <Badge className="bg-jungle-DEFAULT text-white text-xs px-1 py-0.5 animate-jungle-celebration">
                                    Ready! 🎉
                                  </Badge>
                                )}
                              </div>
                            )}
                            {achievement.unlocked && achievement.reward && (
                              <div className="bg-white/20 rounded px-2 py-1">
                                <div className="text-xs text-white">
                                  🎁 {achievement.reward.item}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden md:block">
                        <CardHeader className="pb-2 px-6 pt-6">
                          <div className="flex items-center justify-between">
                            <div className="text-4xl animate-jungle-float">{achievement.icon}</div>
                            <div className="flex items-center gap-1">
                              {getDifficultyIcon(achievement.difficulty)}
                              {achievement.unlocked && (
                                <Check className="w-4 h-4 text-green-300 animate-jungle-celebration" />
                              )}
                              {!achievement.unlocked && isComplete && (
                                <Sparkles className="w-4 h-4 text-sunshine-DEFAULT animate-pulse" />
                              )}
                              {!achievement.unlocked && !isComplete && (
                                <Lock className="w-4 h-4 text-jungle-DEFAULT/60" />
                              )}
                            </div>
                          </div>
                          <CardTitle
                            className={`text-lg ${
                              achievement.unlocked
                                ? "text-white"
                                : "text-jungle-dark"
                            }`}
                          >
                            {achievement.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 px-6 pb-6">
                          <p
                            className={`text-sm ${
                              achievement.unlocked
                                ? "text-white/90"
                                : "text-jungle-dark/70"
                            }`}
                          >
                            {achievement.description}
                          </p>

                          {!achievement.unlocked && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-jungle-DEFAULT/70">Progress</span>
                                <span className="font-semibold text-jungle-dark">
                                  {achievement.currentProgress}/
                                  {achievement.requirements}
                                </span>
                              </div>
                              <Progress
                                value={progressPercentage}
                                className="h-2"
                              />
                              {isComplete && (
                                <div className="text-center">
                                  <Badge className="bg-jungle-DEFAULT text-white animate-pulse">
                                    Ready to Unlock! 🎉
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )}

                          {achievement.unlocked && achievement.reward && (
                            <div className="bg-white/20 rounded-lg p-2">
                              <div className="text-xs font-semibold text-white/90 mb-1">
                                Treasure Unlocked:
                              </div>
                              <div className="text-sm text-white">
                                🎁 {achievement.reward.item}
                              </div>
                            </div>
                          )}

                          {achievement.unlocked && achievement.dateUnlocked && (
                            <div className="text-xs text-white/70">
                              Discovered:{" "}
                              {achievement.dateUnlocked.toLocaleDateString()}
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Jungle Unlockable Content */}
            {showUnlockables && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-jungle-dark mb-2">
                    🎁 Jungle Treasure Vault
                  </h3>
                  <p className="text-jungle-dark/70">
                    Complete achievements to unlock these amazing jungle treasures!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 px-2 md:px-0">
                  {jungleUnlockableContent.map((content) => (
                    <Card
                      key={content.id}
                      className={`text-center transition-all duration-300 hover:scale-105 border-2 shadow-lg ${
                        content.unlocked
                          ? "bg-gradient-to-br from-jungle-DEFAULT to-emerald-500 text-white border-transparent shadow-xl"
                          : "bg-jungle-light/50 border-dashed border-jungle-DEFAULT/40 hover:border-jungle-DEFAULT/60"
                      }`}
                    >
                      <CardContent className="p-3 md:p-4">
                        <div className="text-3xl md:text-4xl mb-2 animate-jungle-sway">
                          {content.icon}
                        </div>
                        <h4
                          className={`font-semibold mb-2 text-sm md:text-base ${
                            content.unlocked ? "text-white" : "text-jungle-dark"
                          }`}
                        >
                          {content.name}
                        </h4>
                        <p
                          className={`text-xs md:text-sm mb-3 ${
                            content.unlocked ? "text-white/90" : "text-jungle-dark/70"
                          }`}
                        >
                          {content.description}
                        </p>

                        {!content.unlocked && content.unlockedBy && (
                          <Badge variant="outline" className="text-xs border-jungle-DEFAULT/50 text-jungle-dark">
                            <Lock className="w-3 h-3 mr-1" />
                            Complete "
                            {
                              achievements.find(
                                (a) => a.id === content.unlockedBy,
                              )?.name
                            }
                            "
                          </Badge>
                        )}

                        {content.unlocked && (
                          <Badge className="bg-white/20 text-white">
                            <Check className="w-3 h-3 mr-1" />
                            Unlocked!
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
