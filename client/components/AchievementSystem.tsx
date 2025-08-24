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
} from "lucide-react";
import { audioService } from "@/lib/audioService";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { AchievementTracker } from "@/lib/achievementTracker";
import { EnhancedAchievementTracker } from "@/lib/enhancedAchievementTracker";
import { goalProgressTracker } from "@/lib/goalProgressTracker";
import { CategoryCompletionTracker } from "@/lib/categoryCompletionTracker";
import { useAuth } from "@/hooks/useAuth";

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
  unlockedBy?: string; // achievement id
  previewUrl?: string;
}

// Learning progress data
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

// Helper function to calculate weekly progress from localStorage
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

// Helper function to get streak data from localStorage
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

// Real achievements will be loaded from AchievementTracker

const unlockableContent: UnlockableContent[] = [
  {
    id: "scholar_cap",
    name: "Scholar Cap",
    type: "avatar_hat",
    description: "A wise graduation cap for dedicated learners",
    icon: "🎓",
    unlocked: false,
    unlockedBy: "word_collector",
  },
  {
    id: "golden_theme",
    name: "Golden Theme",
    type: "background_theme",
    description: "Sparkly golden backgrounds for champions",
    icon: "✨",
    unlocked: false,
    unlockedBy: "vocabulary_master",
  },
  {
    id: "fire_trail",
    name: "Fire Trail",
    type: "special_effect",
    description: "Leave a trail of fire when you learn!",
    icon: "🔥",
    unlocked: false,
    unlockedBy: "streak_starter",
  },
  {
    id: "champion_crown",
    name: "Champion Crown",
    type: "avatar_hat",
    description: "The ultimate crown for learning champions",
    icon: "👑",
    unlocked: false,
    unlockedBy: "dedication_champion",
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "bronze":
      return "from-amber-400 to-amber-600";
    case "silver":
      return "from-gray-400 to-gray-600";
    case "gold":
      return "from-yellow-400 to-yellow-600";
    case "diamond":
      return "from-cyan-400 to-blue-600";
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
      return <Gem className="w-4 h-4 text-cyan-600" />;
    default:
      return <Trophy className="w-4 h-4" />;
  }
};

interface AchievementSystemProps {
  onUnlock?: (achievement: Achievement) => void;
  stats?: LearningStats;
  onRefresh?: () => void;
}

export function AchievementSystem({
  onUnlock,
  onRefresh,
}: AchievementSystemProps) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showUnlockables, setShowUnlockables] = useState(false);
  const [activeTab, setActiveTab] = useState("achievements");
  const [isLoading, setIsLoading] = useState(true);
  const [realStats, setRealStats] = useState<LearningStats | null>(null);
  const [realAchievements, setRealAchievements] = useState<Achievement[]>([]);

  // Load real data on component mount
  useEffect(() => {
    const loadRealData = async () => {
      try {
        setIsLoading(true);
        const userId = user?.id || "guest";

        // Get real achievement data - try enhanced tracker first
        let achievements, journeyProgress;
        try {
          achievements = EnhancedAchievementTracker.getAchievements();
          journeyProgress = EnhancedAchievementTracker.getJourneyProgress();
        } catch (error) {
          // Fallback to basic achievement tracker
          achievements = AchievementTracker.getAchievements();
          journeyProgress = AchievementTracker.getJourneyProgress();
        }

        // Ensure we have valid data structures
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

        // Get category completion data
        const categoryStats =
          CategoryCompletionTracker.getCurrentCategoryStats();
        const completionHistory =
          CategoryCompletionTracker.getCompletionHistory();

        // Build category breakdown from real data
        let categoryBreakdown = [];
        if (categoryStats && typeof categoryStats === "object") {
          // If we have current session stats, create a single category entry
          categoryBreakdown = [
            {
              category: "Current Session",
              wordsLearned: categoryStats.wordsReviewed || 0,
              accuracy: categoryStats.accuracy || 0,
              timeSpent: categoryStats.timeSpent || 0,
            },
          ];
        } else {
          // Build from completion history if no current session
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

          // If no categories found, provide a default empty state
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

        // Get progress data from GoalProgressTracker
        let progressData;
        try {
          progressData =
            await goalProgressTracker.fetchSystematicProgress(userId);
        } catch (error) {
          console.warn("Could not fetch systematic progress:", error);
          progressData = {
            totalWordsLearned: journeyProgress.wordsLearned,
            currentStreak: journeyProgress.streakDays,
            wordsLearnedToday: 0,
            wordsLearnedThisWeek: 0,
            categoriesProgress: {},
          };
        }

        // Calculate learning speed (words per hour estimation)
        const weeklyWords = getWeeklyProgressData(userId);
        const totalWeeklyWords = weeklyWords.reduce(
          (sum, count) => sum + count,
          0,
        );
        const avgWordsPerDay = totalWeeklyWords / 7;
        const learningSpeed = avgWordsPerDay * 2; // Rough estimation: 2 hours average daily study

        // Calculate current accuracy from journey progress
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

        console.log("Journey component loaded real data:", {
          totalWords: realLearningStats.totalWordsLearned,
          weeklyProgress: realLearningStats.weeklyProgress,
          achievementsCount: achievements.length,
          unlockedCount: achievements.filter((a) => a.unlocked).length,
        });
      } catch (error) {
        console.error("Error loading real data:", error);
        // Fallback to basic data if loading fails
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

  // Refresh function to reload data
  const refreshData = () => {
    setIsLoading(true);
    // Re-run the data loading
    const userId = user?.id || "guest";

    const loadData = async () => {
      try {
        // Get real achievement data - try enhanced tracker first
        let achievements, journeyProgress;
        try {
          achievements = EnhancedAchievementTracker.getAchievements();
          journeyProgress = EnhancedAchievementTracker.getJourneyProgress();
        } catch (error) {
          // Fallback to basic achievement tracker
          achievements = AchievementTracker.getAchievements();
          journeyProgress = AchievementTracker.getJourneyProgress();
        }

        // Ensure we have valid data structures
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

        // Re-calculate stats with fresh data
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

  // Use real data or loading state
  const stats = realStats;
  const achievements = realAchievements;

  // Show loading state
  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-educational-blue mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  const categories = [
    { id: "all", name: "All", icon: "🏆" },
    { id: "learning", name: "Learning", icon: "📚" },
    { id: "streak", name: "Streaks", icon: "🔥" },
    { id: "quiz", name: "Quizzes", icon: "🧠" },
    { id: "exploration", name: "Explorer", icon: "🗺️" },
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
      // Old celebration modal disabled - keeping only the enhanced achievement system
      // setCelebratingAchievement(achievement);
      audioService.playCheerSound();
      // setTimeout(() => setCelebratingAchievement(null), 3000);
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    return Math.min(
      (achievement.currentProgress / achievement.requirements) * 100,
      100,
    );
  };

  const renderProgressOverview = () => (
    <div className="space-y-6">
      {/* Fun Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 px-2 md:px-0">
        <Card className="bg-gradient-to-br from-educational-blue to-educational-purple text-white hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-6 text-center">
            <Brain className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 animate-pulse" />
            <div className="text-xl md:text-3xl font-bold mb-1">
              <AnimatedCounter value={stats.totalWordsLearned} />
            </div>
            <p className="text-xs md:text-sm opacity-90">Words Learned! 🎯</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-educational-green to-educational-blue text-white hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-6 text-center">
            <Zap className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 animate-bounce" />
            <div className="text-xl md:text-3xl font-bold mb-1">
              <AnimatedCounter value={stats.learningSpeed} suffix="/hr" />
            </div>
            <p className="text-xs md:text-sm opacity-90">Learning Speed! ⚡</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-educational-orange to-educational-pink text-white hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-6 text-center">
            <Target
              className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <div className="text-xl md:text-3xl font-bold mb-1">
              <AnimatedCounter value={stats.currentAccuracy} suffix="%" />
            </div>
            <p className="text-xs md:text-sm opacity-90">Accuracy! 🎪</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-educational-purple to-educational-pink text-white hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-6 text-center">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-1 md:mb-2 animate-pulse" />
            <div className="text-xl md:text-3xl font-bold mb-1">
              <AnimatedCounter value={unlockedAchievements.length} />
            </div>
            <p className="text-xs md:text-sm opacity-90">Achievements! 🏆</p>
          </CardContent>
        </Card>
      </div>

      {/* Fun Weekly Progress - Mobile Optimized */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 mx-2 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-educational-blue text-lg md:text-xl">
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6" />
            🌟 Your Amazing Week!
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="grid grid-cols-7 gap-1 md:gap-2 h-24 md:h-32 mb-4">
            {stats.weeklyProgress.map((value, index) => {
              const maxValue = Math.max(...stats.weeklyProgress) || 1; // Prevent division by zero
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
              const emojis = ["🌟", "⭐", "✨", "🎯", "🔥", "🎉", "🚀"];

              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex-1 flex flex-col justify-end">
                    <div
                      className="bg-gradient-to-t from-educational-blue to-educational-purple rounded-t-lg min-h-[8px] transition-all duration-1000 ease-bounce hover:scale-110"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{days[index]}</p>
                  <p className="text-sm md:text-lg">{emojis[index]}</p>
                  <p className="text-xs md:text-sm font-bold text-educational-blue">
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-center text-educational-purple font-semibold text-sm md:text-base">
            Keep up the fantastic work! 🎊
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderCategoryFun = () => (
    <div className="space-y-4 md:space-y-6">
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 mx-2 md:mx-0">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-educational-orange text-lg md:text-xl">
            <PieChart className="w-5 h-5 md:w-6 md:h-6" />
            🎨 Your Learning Rainbow!
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="space-y-3 md:space-y-4">
            {stats.categoryBreakdown.map((category, index) => {
              const colors = [
                "from-educational-blue to-blue-400",
                "from-educational-green to-green-400",
                "from-educational-orange to-orange-400",
                "from-educational-purple to-purple-400",
                "from-educational-pink to-pink-400",
                "from-educational-yellow to-yellow-400",
              ];
              const icons = ["🐾", "🌿", "🔬", "🍎", "⚽", "🎪"];
              const color = colors[index % colors.length];
              const icon = icons[index % icons.length];

              return (
                <div key={category.category} className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div
                        className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r ${color} flex items-center justify-center text-white shadow-lg text-sm md:text-base`}
                      >
                        {icon}
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 text-sm md:text-base">
                          {category.category}
                        </span>
                        <p className="text-xs text-gray-500 hidden md:block">
                          You're doing amazing! 🌟
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-1 md:gap-4 text-xs md:text-sm">
                      <span className="bg-educational-blue/20 px-2 py-1 rounded-full text-educational-blue font-semibold">
                        {category.wordsLearned} words!
                      </span>
                      <span className="bg-educational-green/20 px-2 py-1 rounded-full text-educational-green font-semibold">
                        {category.accuracy}% perfect!
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 rounded-full`}
                      style={{
                        width: `${(category.wordsLearned / stats.totalWordsLearned) * 100}%`,
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

  const renderStreakFun = () => (
    <div className="space-y-3 md:space-y-4 lg:space-y-6">
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 mx-1 md:mx-0">
        <CardHeader className="pb-2 md:pb-3 lg:pb-6">
          <CardTitle className="flex items-center gap-2 text-educational-green text-base md:text-lg">
            <Activity className="w-4 h-4 md:w-5 md:h-5" />
            🔥 Learning Adventure Map!
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 md:px-3 lg:px-6">
          <div className="space-y-2 md:space-y-3">
            <p className="text-center text-educational-purple font-semibold text-xs md:text-sm">
              Your learning adventure! Each square is a day! 🗺️
            </p>

            <div className="grid grid-cols-10 gap-0.5 justify-center">
              {stats.streakData.map((day, index) => {
                const emojis = ["💫", "⭐", "🌟", "✨", "🎊"];
                const randomEmoji =
                  emojis[Math.floor(Math.random() * emojis.length)];

                return (
                  <div
                    key={index}
                    className={`w-4 h-4 md:w-5 md:h-5 rounded-md flex items-center justify-center text-xs font-bold transition-all hover:scale-110 cursor-pointer ${
                      day.active
                        ? day.wordsLearned > 8
                          ? "bg-gradient-to-br from-educational-green to-green-400 text-white shadow-lg"
                          : day.wordsLearned > 4
                            ? "bg-gradient-to-br from-educational-blue to-blue-400 text-white shadow-md"
                            : "bg-gradient-to-br from-educational-orange to-orange-400 text-white shadow-sm"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                    title={`${day.date}: ${day.active ? `${day.wordsLearned} words learned! ${randomEmoji}` : "Rest day 😴"}`}
                  >
                    {day.active
                      ? day.wordsLearned > 8
                        ? "🏆"
                        : day.wordsLearned > 4
                          ? "⭐"
                          : "✨"
                      : "💤"}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 md:flex md:items-center md:justify-center gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-100 rounded-sm flex items-center justify-center text-xs">
                  💤
                </div>
                <span className="text-gray-600">Rest day</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-educational-orange rounded-sm flex items-center justify-center text-white text-xs">
                  ✨
                </div>
                <span className="text-educational-orange font-semibold">
                  Learning day
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-educational-blue rounded-sm flex items-center justify-center text-white text-xs">
                  ⭐
                </div>
                <span className="text-educational-blue font-semibold">
                  Great day
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-educational-green rounded-sm flex items-center justify-center text-white text-xs">
                  🏆
                </div>
                <span className="text-educational-green font-semibold">
                  Amazing day!
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Kid-Friendly Header - Mobile Optimized */}
      <div className="text-center px-4">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink bg-clip-text text-transparent mb-2 leading-tight">
          🏆 Your Learning Journey! 🌟
        </h2>
        <p className="text-gray-600 mb-4 text-sm md:text-lg px-2">
          See how amazing you are at learning new words! 🎉
        </p>
      </div>

      {/* Fun Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 md:gap-0 bg-gradient-to-r from-educational-blue/10 to-educational-purple/10 h-auto p-1">
          <TabsTrigger
            value="achievements"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-educational-blue data-[state=active]:text-white text-xs md:text-sm py-2 md:py-3 px-1 md:px-3"
          >
            <Trophy className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden md:inline">🏆 Trophies</span>
            <span className="md:hidden text-center">
              🏆
              <br />
              Trophies
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-educational-green data-[state=active]:text-white text-xs md:text-sm py-2 md:py-3 px-1 md:px-3"
          >
            <TrendingUp className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden md:inline">📈 My Stats</span>
            <span className="md:hidden text-center">
              📈
              <br />
              Stats
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-educational-orange data-[state=active]:text-white text-xs md:text-sm py-2 md:py-3 px-1 md:px-3"
          >
            <PieChart className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden md:inline">🎨 Topics</span>
            <span className="md:hidden text-center">
              🎨
              <br />
              Topics
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="streaks"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-educational-purple data-[state=active]:text-white text-xs md:text-sm py-2 md:py-3 px-1 md:px-3"
          >
            <Activity className="w-4 h-4 md:w-4 md:h-4" />
            <span className="hidden md:inline">🔥 Adventure</span>
            <span className="md:hidden text-center">
              🔥
              <br />
              Adventure
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-6">
          {renderProgressOverview()}
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          {renderCategoryFun()}
        </TabsContent>

        <TabsContent value="streaks" className="mt-6">
          {renderStreakFun()}
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="space-y-6">
            {/* Achievement Stats - Mobile Optimized */}
            <div className="flex justify-center gap-2 md:gap-4 mb-4 md:mb-6 px-2">
              <Card className="bg-gradient-to-r from-educational-blue to-educational-purple text-white hover:scale-105 transition-all flex-1 max-w-[150px]">
                <CardContent className="p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold">
                    {unlockedAchievements.length}
                  </div>
                  <div className="text-xs md:text-sm opacity-90">
                    🏆 Trophies Won!
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-educational-orange to-educational-pink text-white hover:scale-105 transition-all flex-1 max-w-[150px]">
                <CardContent className="p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold">
                    {totalPoints}
                  </div>
                  <div className="text-xs md:text-sm opacity-90">
                    ⭐ Trophy Points!
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Filters - Mobile Optimized */}
            <div className="flex justify-center gap-1 md:gap-2 flex-wrap px-2 md:px-0">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-1 md:gap-2 hover:scale-105 transition-all text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
                >
                  <span>{category.icon}</span>
                  {category.name}
                </Button>
              ))}
              <Button
                variant={showUnlockables ? "default" : "outline"}
                size="sm"
                onClick={() => setShowUnlockables(!showUnlockables)}
                className="flex items-center gap-1 md:gap-2 hover:scale-105 transition-all text-xs md:text-sm px-2 md:px-3 py-1 md:py-2"
              >
                <Gift className="w-4 h-4" />
                🎁 Rewards
              </Button>
            </div>

            {/* Achievements Grid - Mobile Optimized */}
            {!showUnlockables && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 px-2 md:px-0">
                {filteredAchievements.map((achievement) => {
                  const progressPercentage = getProgressPercentage(achievement);
                  const isComplete = progressPercentage >= 100;

                  return (
                    <Card
                      key={achievement.id}
                      className={`cursor-pointer transition-all duration-300 md:hover:scale-105 ${
                        achievement.unlocked
                          ? `bg-gradient-to-br ${getDifficultyColor(achievement.difficulty)} text-white shadow-lg`
                          : "bg-white border-2 border-dashed border-gray-300 hover:border-educational-blue"
                      }`}
                      onClick={() => handleAchievementClick(achievement)}
                    >
                      {/* Mobile Compact Layout */}
                      <div className="block md:hidden">
                        <div className="flex items-center gap-2 p-2">
                          <div className="text-2xl flex-shrink-0">
                            {achievement.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3
                                className={`text-sm font-semibold truncate ${
                                  achievement.unlocked
                                    ? "text-white"
                                    : "text-gray-800"
                                }`}
                              >
                                {achievement.name}
                              </h3>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {getDifficultyIcon(achievement.difficulty)}
                                {achievement.unlocked && (
                                  <Check className="w-3 h-3 text-green-300" />
                                )}
                                {!achievement.unlocked && isComplete && (
                                  <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
                                )}
                                {!achievement.unlocked && !isComplete && (
                                  <Lock className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                            </div>
                            <p
                              className={`text-xs leading-tight mb-2 ${
                                achievement.unlocked
                                  ? "text-white/90"
                                  : "text-gray-600"
                              }`}
                            >
                              {achievement.description}
                            </p>
                            {!achievement.unlocked && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">
                                    Progress
                                  </span>
                                  <span className="font-semibold text-gray-800">
                                    {achievement.currentProgress}/
                                    {achievement.requirements}
                                  </span>
                                </div>
                                <Progress
                                  value={progressPercentage}
                                  className="h-1.5"
                                />
                                {isComplete && (
                                  <Badge className="bg-educational-green text-white text-xs px-1 py-0.5">
                                    Ready! 🎉
                                  </Badge>
                                )}
                              </div>
                            )}
                            {achievement.unlocked && achievement.reward && (
                              <div className="bg-white/70 rounded px-2 py-1 shadow-sm">
                                <div className="text-xs text-gray-800 font-semibold">
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
                            <div className="text-4xl">{achievement.icon}</div>
                            <div className="flex items-center gap-1">
                              {getDifficultyIcon(achievement.difficulty)}
                              {achievement.unlocked && (
                                <Check className="w-4 h-4 text-green-300" />
                              )}
                              {!achievement.unlocked && isComplete && (
                                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                              )}
                              {!achievement.unlocked && !isComplete && (
                                <Lock className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                          <CardTitle
                            className={`text-lg ${
                              achievement.unlocked
                                ? "text-white"
                                : "text-gray-800"
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
                                : "text-gray-600"
                            }`}
                          >
                            {achievement.description}
                          </p>

                          {!achievement.unlocked && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-semibold text-gray-800">
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
                                  <Badge className="bg-educational-green text-white animate-pulse">
                                    Ready to Unlock! 🎉
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )}

                          {achievement.unlocked && achievement.reward && (
                            <div className="bg-white/70 rounded-lg p-2 shadow-sm">
                              <div className="text-xs font-semibold text-gray-800 mb-1">
                                Reward Unlocked:
                              </div>
                              <div className="text-sm text-gray-800">
                                🎁 {achievement.reward.item}
                              </div>
                            </div>
                          )}

                          {achievement.unlocked && achievement.dateUnlocked && (
                            <div className="text-xs text-gray-600">
                              Unlocked:{" "}
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

            {/* Unlockable Content */}
            {showUnlockables && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    🎁 Unlockable Rewards
                  </h3>
                  <p className="text-gray-600">
                    Complete achievements to unlock these amazing rewards!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-2 md:px-0">
                  {unlockableContent.map((content) => (
                    <Card
                      key={content.id}
                      className={`text-center transition-all duration-300 hover:scale-105 ${
                        content.unlocked
                          ? "bg-gradient-to-br from-educational-green to-educational-blue text-white"
                          : "bg-gray-100 border-2 border-dashed border-gray-300"
                      }`}
                    >
                      <CardContent className="p-3 md:p-4">
                        <div className="text-3xl md:text-4xl mb-2">
                          {content.icon}
                        </div>
                        <h4
                          className={`font-semibold mb-2 text-sm md:text-base ${
                            content.unlocked ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {content.name}
                        </h4>
                        <p
                          className={`text-xs md:text-sm mb-3 ${
                            content.unlocked ? "text-white/90" : "text-gray-600"
                          }`}
                        >
                          {content.description}
                        </p>

                        {!content.unlocked && content.unlockedBy && (
                          <Badge variant="outline" className="text-xs">
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
                          <Badge className="bg-emerald-500 text-white shadow-sm">
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

      {/* OLD ACHIEVEMENT CELEBRATION MODAL COMPLETELY REMOVED */}
      {/* Only using the new enhanced orange achievement popup system */}
    </div>
  );
}
