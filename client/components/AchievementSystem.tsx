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

const learningStats: LearningStats = {
  totalWordsLearned: 127,
  weeklyProgress: [5, 8, 12, 7, 15, 10, 18],
  categoryBreakdown: [
    { category: "Animals", wordsLearned: 28, accuracy: 92, timeSpent: 45 },
    { category: "Nature", wordsLearned: 24, accuracy: 88, timeSpent: 38 },
    { category: "Science", wordsLearned: 21, accuracy: 85, timeSpent: 52 },
    { category: "Food", wordsLearned: 19, accuracy: 94, timeSpent: 31 },
    { category: "General", wordsLearned: 18, accuracy: 87, timeSpent: 42 },
    { category: "Sports", wordsLearned: 17, accuracy: 90, timeSpent: 28 },
  ],
  difficultyProgress: [
    { difficulty: "easy", completed: 68, total: 80 },
    { difficulty: "medium", completed: 42, total: 70 },
    { difficulty: "hard", completed: 17, total: 50 },
  ],
  streakData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    active: Math.random() > 0.3,
    wordsLearned: Math.floor(Math.random() * 12) + 1,
  })),
  learningSpeed: 5.2,
  currentAccuracy: 91,
};

const achievements: Achievement[] = [
  {
    id: "first_steps",
    name: "First Steps",
    description: "Learn your first 10 words!",
    icon: "🎯",
    category: "learning",
    difficulty: "bronze",
    requirements: 10,
    currentProgress: 7,
    unlocked: false,
    reward: { type: "avatar_accessory", item: "Beginner Badge" },
  },
  {
    id: "word_collector",
    name: "Word Collector",
    description: "Learn 20 words and build your vocabulary!",
    icon: "📚",
    category: "learning",
    difficulty: "silver",
    requirements: 20,
    currentProgress: 7,
    unlocked: false,
    reward: { type: "title", item: "Word Collector" },
  },
  {
    id: "vocabulary_master",
    name: "Vocabulary Master",
    description: "Amazing! You've learned 50 words!",
    icon: "🏆",
    category: "learning",
    difficulty: "gold",
    requirements: 50,
    currentProgress: 7,
    unlocked: false,
    reward: { type: "theme", item: "Golden Theme" },
  },
  {
    id: "streak_starter",
    name: "Streak Starter",
    description: "Keep learning for 3 days in a row!",
    icon: "🔥",
    category: "streak",
    difficulty: "bronze",
    requirements: 3,
    currentProgress: 2,
    unlocked: false,
    reward: { type: "sound_effect", item: "Fire Trail" },
  },
  {
    id: "dedication_champion",
    name: "Dedication Champion",
    description: "Incredible! 30 days of learning!",
    icon: "👑",
    category: "streak",
    difficulty: "diamond",
    requirements: 30,
    currentProgress: 2,
    unlocked: false,
    reward: { type: "title", item: "Learning Champion" },
  },
  {
    id: "quiz_ace",
    name: "Quiz Ace",
    description: "Score 100% on 5 quizzes!",
    icon: "🧠",
    category: "quiz",
    difficulty: "silver",
    requirements: 5,
    currentProgress: 2,
    unlocked: false,
    reward: { type: "sound_effect", item: "Success Fanfare" },
  },
  {
    id: "category_explorer",
    name: "Category Explorer",
    description: "Explore 5 different word categories!",
    icon: "🗺️",
    category: "exploration",
    difficulty: "silver",
    requirements: 5,
    currentProgress: 3,
    unlocked: false,
    reward: { type: "avatar_accessory", item: "Explorer Badge" },
  },
  {
    id: "pronunciation_pro",
    name: "Pronunciation Pro",
    description: "Listen to 25 word pronunciations!",
    icon: "🔊",
    category: "learning",
    difficulty: "bronze",
    requirements: 25,
    currentProgress: 12,
    unlocked: false,
    reward: { type: "sound_effect", item: "Robot Voice Pack" },
  },
];

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
}

export function AchievementSystem({
  onUnlock,
  stats = learningStats,
}: AchievementSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showUnlockables, setShowUnlockables] = useState(false);
  // OLD ACHIEVEMENT CELEBRATION SYSTEM REMOVED
  // const [celebratingAchievement, setCelebratingAchievement] =
  //   useState<Achievement | null>(null);
  const [activeTab, setActiveTab] = useState("achievements");

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
      {/* Fun Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-educational-blue to-educational-purple text-white hover:scale-105 transition-all">
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter value={stats.totalWordsLearned} />
            </div>
            <p className="text-sm opacity-90">Words Learned! 🎯</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-educational-green to-educational-blue text-white hover:scale-105 transition-all">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 animate-bounce" />
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter value={stats.learningSpeed} suffix="/hr" />
            </div>
            <p className="text-sm opacity-90">Learning Speed! ⚡</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-educational-orange to-educational-pink text-white hover:scale-105 transition-all">
          <CardContent className="p-6 text-center">
            <Target
              className="w-8 h-8 mx-auto mb-2 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter value={stats.currentAccuracy} suffix="%" />
            </div>
            <p className="text-sm opacity-90">Accuracy! 🎪</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-educational-purple to-educational-pink text-white hover:scale-105 transition-all">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            <div className="text-3xl font-bold mb-1">
              <AnimatedCounter value={unlockedAchievements.length} />
            </div>
            <p className="text-sm opacity-90">Achievements! 🏆</p>
          </CardContent>
        </Card>
      </div>

      {/* Fun Weekly Progress */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-educational-blue">
            <BarChart3 className="w-6 h-6" />
            🌟 Your Amazing Week!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 h-32 mb-4">
            {stats.weeklyProgress.map((value, index) => {
              const maxValue = Math.max(...stats.weeklyProgress);
              const height = (value / maxValue) * 100;
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
                  <p className="text-xs text-slate-600 mt-2">{days[index]}</p>
                  <p className="text-lg">{emojis[index]}</p>
                  <p className="text-sm font-bold text-educational-blue">
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-center text-educational-purple font-semibold">
            Keep up the fantastic work! 🎊
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderCategoryFun = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-educational-orange">
            <PieChart className="w-6 h-6" />
            🎨 Your Learning Rainbow!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                <div key={category.category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full bg-gradient-to-r ${color} flex items-center justify-center text-white shadow-lg`}
                      >
                        {icon}
                      </div>
                      <div>
                        <span className="font-bold text-gray-800">
                          {category.category}
                        </span>
                        <p className="text-xs text-gray-500">
                          You're doing amazing! 🌟
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
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
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-educational-green">
            <Activity className="w-6 h-6" />
            🔥 Your Learning Adventure Map!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-educational-purple font-semibold">
              Look at all the days you've been learning! Each square is a day of
              adventure! 🗺️
            </p>

            <div className="grid grid-cols-10 gap-1 justify-center">
              {stats.streakData.map((day, index) => {
                const emojis = ["💫", "⭐", "🌟", "✨", "🎊"];
                const randomEmoji =
                  emojis[Math.floor(Math.random() * emojis.length)];

                return (
                  <div
                    key={index}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:scale-125 cursor-pointer ${
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

            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded-sm flex items-center justify-center">
                  💤
                </div>
                <span className="text-gray-600">Rest day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-educational-orange rounded-sm flex items-center justify-center text-white">
                  ✨
                </div>
                <span className="text-educational-orange font-semibold">
                  Learning day
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-educational-blue rounded-sm flex items-center justify-center text-white">
                  ⭐
                </div>
                <span className="text-educational-blue font-semibold">
                  Great day
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-educational-green rounded-sm flex items-center justify-center text-white">
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
      {/* Kid-Friendly Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink bg-clip-text text-transparent mb-2">
          🏆 Your Learning Journey! 🌟
        </h2>
        <p className="text-gray-600 mb-4 text-lg">
          See how amazing you are at learning new words! 🎉
        </p>
      </div>

      {/* Fun Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-educational-blue/10 to-educational-purple/10">
          <TabsTrigger
            value="achievements"
            className="flex items-center gap-2 data-[state=active]:bg-educational-blue data-[state=active]:text-white"
          >
            <Trophy className="w-4 h-4" />
            🏆 Trophies
          </TabsTrigger>
          <TabsTrigger
            value="progress"
            className="flex items-center gap-2 data-[state=active]:bg-educational-green data-[state=active]:text-white"
          >
            <TrendingUp className="w-4 h-4" />
            📈 My Stats
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="flex items-center gap-2 data-[state=active]:bg-educational-orange data-[state=active]:text-white"
          >
            <PieChart className="w-4 h-4" />
            🎨 Topics
          </TabsTrigger>
          <TabsTrigger
            value="streaks"
            className="flex items-center gap-2 data-[state=active]:bg-educational-purple data-[state=active]:text-white"
          >
            <Activity className="w-4 h-4" />
            🔥 Adventure
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
            {/* Achievement Stats */}
            <div className="flex justify-center gap-4 mb-6">
              <Card className="bg-gradient-to-r from-educational-blue to-educational-purple text-white hover:scale-105 transition-all">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {unlockedAchievements.length}
                  </div>
                  <div className="text-sm opacity-90">🏆 Trophies Won!</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-educational-orange to-educational-pink text-white hover:scale-105 transition-all">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{totalPoints}</div>
                  <div className="text-sm opacity-90">⭐ Trophy Points!</div>
                </CardContent>
              </Card>
            </div>

            {/* Category Filters */}
            <div className="flex justify-center gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <span>{category.icon}</span>
                  {category.name}
                </Button>
              ))}
              <Button
                variant={showUnlockables ? "default" : "outline"}
                size="sm"
                onClick={() => setShowUnlockables(!showUnlockables)}
                className="flex items-center gap-2 hover:scale-105 transition-all"
              >
                <Gift className="w-4 h-4" />
                🎁 Rewards
              </Button>
            </div>

            {/* Achievements Grid */}
            {!showUnlockables && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements.map((achievement) => {
                  const progressPercentage = getProgressPercentage(achievement);
                  const isComplete = progressPercentage >= 100;

                  return (
                    <Card
                      key={achievement.id}
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                        achievement.unlocked
                          ? `bg-gradient-to-br ${getDifficultyColor(achievement.difficulty)} text-white shadow-lg`
                          : "bg-white border-2 border-dashed border-gray-300 hover:border-educational-blue"
                      }`}
                      onClick={() => handleAchievementClick(achievement)}
                    >
                      <CardHeader className="pb-2">
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
                      <CardContent className="space-y-3">
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
                          <div className="bg-white/20 rounded-lg p-2">
                            <div className="text-xs font-semibold text-white/90 mb-1">
                              Reward Unlocked:
                            </div>
                            <div className="text-sm text-white">
                              🎁 {achievement.reward.item}
                            </div>
                          </div>
                        )}

                        {achievement.unlocked && achievement.dateUnlocked && (
                          <div className="text-xs text-white/70">
                            Unlocked:{" "}
                            {achievement.dateUnlocked.toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {unlockableContent.map((content) => (
                    <Card
                      key={content.id}
                      className={`text-center transition-all duration-300 hover:scale-105 ${
                        content.unlocked
                          ? "bg-gradient-to-br from-educational-green to-educational-blue text-white"
                          : "bg-gray-100 border-2 border-dashed border-gray-300"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="text-4xl mb-2">{content.icon}</div>
                        <h4
                          className={`font-semibold mb-2 ${
                            content.unlocked ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {content.name}
                        </h4>
                        <p
                          className={`text-sm mb-3 ${
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

      {/* OLD ACHIEVEMENT CELEBRATION MODAL COMPLETELY REMOVED */}
      {/* Only using the new enhanced orange achievement popup system */}
    </div>
  );
}
