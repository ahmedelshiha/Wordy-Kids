import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Calendar,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Zap,
  Award,
  Download,
  Filter,
  TreePine,
  Leaf,
  Compass,
  Map,
  Sparkles,
  Star,
  Crown,
  Gem,
  Heart,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { cn } from "@/lib/utils";

interface LearningData {
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
  learningVelocity: Array<{
    week: string;
    wordsPerHour: number;
    accuracy: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: Date;
    rarity: "common" | "rare" | "epic" | "legendary";
  }>;
  jungleStats?: {
    animalsDiscovered: number;
    plantsLearned: number;
    expeditionsCompleted: number;
    treasuresFound: number;
    friendshipLevel: number;
  };
}

const jungleSampleData: LearningData = {
  totalWordsLearned: 127,
  weeklyProgress: [5, 8, 12, 7, 15, 10, 18],
  categoryBreakdown: [
    {
      category: "Jungle Animals",
      wordsLearned: 35,
      accuracy: 94,
      timeSpent: 52,
    },
    {
      category: "Tropical Plants",
      wordsLearned: 28,
      accuracy: 91,
      timeSpent: 45,
    },
    {
      category: "Adventure Gear",
      wordsLearned: 24,
      accuracy: 88,
      timeSpent: 38,
    },
    {
      category: "Weather & Climate",
      wordsLearned: 21,
      accuracy: 85,
      timeSpent: 35,
    },
    {
      category: "Jungle Sounds",
      wordsLearned: 19,
      accuracy: 96,
      timeSpent: 31,
    },
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
    active: Math.random() > 0.25,
    wordsLearned: Math.floor(Math.random() * 15) + 1,
  })),
  learningVelocity: [
    { week: "Jungle Week 1", wordsPerHour: 3.2, accuracy: 85 },
    { week: "Canopy Week 2", wordsPerHour: 4.1, accuracy: 87 },
    { week: "River Week 3", wordsPerHour: 4.8, accuracy: 89 },
    { week: "Summit Week 4", wordsPerHour: 5.2, accuracy: 91 },
  ],
  achievements: [
    {
      id: "jungle-explorer",
      title: "Jungle Explorer",
      description: "Discovered 100+ jungle words",
      icon: "🌿",
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      rarity: "epic",
    },
    {
      id: "animal-whisperer",
      title: "Animal Whisperer",
      description: "Perfect score on animal vocabulary",
      icon: "🐵",
      unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      rarity: "rare",
    },
    {
      id: "canopy-climber",
      title: "Canopy Climber",
      description: "Reached the treetops with 7-day streak",
      icon: "🌳",
      unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      rarity: "legendary",
    },
  ],
  jungleStats: {
    animalsDiscovered: 23,
    plantsLearned: 18,
    expeditionsCompleted: 12,
    treasuresFound: 8,
    friendshipLevel: 85,
  },
};

interface JungleLearningAnalyticsProps {
  data?: LearningData;
  timeRange?: "week" | "month" | "quarter" | "year";
}

export const EnhancedJungleLearningAnalytics: React.FC<
  JungleLearningAnalyticsProps
> = ({ data = jungleSampleData, timeRange = "month" }) => {
  const [selectedMetric, setSelectedMetric] = useState<
    "words" | "time" | "accuracy"
  >("words");
  const [activeView, setActiveView] = useState<"overview" | "detailed">(
    "overview",
  );

  const getJungleRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-slate-500";
      case "rare":
        return "bg-sky-DEFAULT";
      case "epic":
        return "bg-jungle-DEFAULT";
      case "legendary":
        return "bg-sunshine-DEFAULT";
      default:
        return "bg-slate-500";
    }
  };

  const getDifficultyJungleTheme = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return {
          name: "Jungle Floor",
          icon: "🌱",
          color: "from-jungle-DEFAULT to-emerald-400",
          description: "Safe ground level exploration",
        };
      case "medium":
        return {
          name: "Canopy Level",
          icon: "🌳",
          color: "from-sunshine-DEFAULT to-orange-400",
          description: "Climbing through the treetops",
        };
      case "hard":
        return {
          name: "Mountain Peak",
          icon: "⛰️",
          color: "from-coral-red to-red-500",
          description: "Conquering the highest challenges",
        };
      default:
        return {
          name: "Unknown",
          icon: "❓",
          color: "from-gray-400 to-gray-500",
          description: "Unexplored territory",
        };
    }
  };

  const renderJungleOverview = () => (
    <div className="space-y-6">
      {/* Jungle Explorer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-jungle-DEFAULT to-emerald-500 text-white hover:scale-105 transition-all duration-300 shadow-xl border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-jungle-sparkle"></div>
          <CardContent className="p-3 md:p-6 text-center relative z-10">
            <TreePine className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 animate-jungle-sway" />
            <div className="text-xl md:text-2xl font-bold">
              <AnimatedCounter value={data.totalWordsLearned} />
            </div>
            <p className="text-xs md:text-sm opacity-90">Words Discovered</p>
            <div className="text-lg mt-1">🌿</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sunshine-DEFAULT to-orange-500 text-white hover:scale-105 transition-all duration-300 shadow-xl border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-jungle-sparkle"></div>
          <CardContent className="p-3 md:p-6 text-center relative z-10">
            <Zap className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 animate-bounce" />
            <div className="text-xl md:text-2xl font-bold">
              <AnimatedCounter
                value={
                  data.learningVelocity[data.learningVelocity.length - 1]
                    ?.wordsPerHour || 0
                }
                suffix="/hr"
              />
            </div>
            <p className="text-xs md:text-sm opacity-90">Expedition Speed</p>
            <div className="text-lg mt-1">⚡</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sky-DEFAULT to-blue-500 text-white hover:scale-105 transition-all duration-300 shadow-xl border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-jungle-sparkle"></div>
          <CardContent className="p-3 md:p-6 text-center relative z-10">
            <Target
              className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <div className="text-xl md:text-2xl font-bold">
              <AnimatedCounter
                value={
                  data.learningVelocity[data.learningVelocity.length - 1]
                    ?.accuracy || 0
                }
                suffix="%"
              />
            </div>
            <p className="text-xs md:text-sm opacity-90">Precision Rate</p>
            <div className="text-lg mt-1">🎯</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-playful-purple to-profile-purple text-white hover:scale-105 transition-all duration-300 shadow-xl border-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-jungle-sparkle"></div>
          <CardContent className="p-3 md:p-6 text-center relative z-10">
            <Award className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 animate-jungle-celebration" />
            <div className="text-xl md:text-2xl font-bold">
              <AnimatedCounter value={data.achievements.length} />
            </div>
            <p className="text-xs md:text-sm opacity-90">Jungle Trophies</p>
            <div className="text-lg mt-1">🏆</div>
          </CardContent>
        </Card>
      </div>

      {/* Special Jungle Stats */}
      {data.jungleStats && (
        <Card className="bg-gradient-to-br from-emerald-50 to-jungle-light border-2 border-jungle-DEFAULT/30 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-jungle-dark">
              <Compass className="w-5 h-5 text-jungle-DEFAULT" />
              🌟 Jungle Explorer Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-white/80 rounded-lg border border-jungle-DEFAULT/20">
                <div className="text-2xl mb-1">🐵</div>
                <div className="text-lg font-bold text-jungle-dark">
                  {data.jungleStats.animalsDiscovered}
                </div>
                <div className="text-xs text-jungle-DEFAULT/70">
                  Animals Met
                </div>
              </div>
              <div className="text-center p-3 bg-white/80 rounded-lg border border-jungle-DEFAULT/20">
                <div className="text-2xl mb-1">🌺</div>
                <div className="text-lg font-bold text-jungle-dark">
                  {data.jungleStats.plantsLearned}
                </div>
                <div className="text-xs text-jungle-DEFAULT/70">
                  Plants Found
                </div>
              </div>
              <div className="text-center p-3 bg-white/80 rounded-lg border border-jungle-DEFAULT/20">
                <div className="text-2xl mb-1">🗺️</div>
                <div className="text-lg font-bold text-jungle-dark">
                  {data.jungleStats.expeditionsCompleted}
                </div>
                <div className="text-xs text-jungle-DEFAULT/70">
                  Expeditions
                </div>
              </div>
              <div className="text-center p-3 bg-white/80 rounded-lg border border-jungle-DEFAULT/20">
                <div className="text-2xl mb-1">💎</div>
                <div className="text-lg font-bold text-jungle-dark">
                  {data.jungleStats.treasuresFound}
                </div>
                <div className="text-xs text-jungle-DEFAULT/70">Treasures</div>
              </div>
              <div className="text-center p-3 bg-white/80 rounded-lg border border-jungle-DEFAULT/20">
                <div className="text-2xl mb-1">❤️</div>
                <div className="text-lg font-bold text-jungle-dark">
                  {data.jungleStats.friendshipLevel}%
                </div>
                <div className="text-xs text-jungle-DEFAULT/70">Friendship</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jungle Expedition Progress Chart */}
      <Card className="bg-gradient-to-br from-jungle-light to-emerald-50 border-2 border-jungle-DEFAULT/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-jungle-dark">
            <BarChart3 className="w-5 h-5 text-jungle-DEFAULT" />
            🗺️ Weekly Jungle Expedition Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center gap-2 md:gap-4 mb-4 flex-wrap">
              {["words", "time", "accuracy"].map((metric) => (
                <Button
                  key={metric}
                  variant={selectedMetric === metric ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMetric(metric as any)}
                  className={cn(
                    "capitalize transition-all duration-300",
                    selectedMetric === metric
                      ? "bg-gradient-to-r from-jungle-DEFAULT to-emerald-500 text-white shadow-lg"
                      : "border-jungle-DEFAULT/30 hover:border-jungle-DEFAULT/50",
                  )}
                >
                  {metric === "words" && "🌿 "}
                  {metric === "time" && "⏰ "}
                  {metric === "accuracy" && "🎯 "}
                  {metric}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 md:gap-2 h-32 md:h-40">
              {data.weeklyProgress.map((value, index) => {
                const maxValue = Math.max(...data.weeklyProgress) || 1;
                const height = (value / maxValue) * 100;
                const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                const jungleEmojis = ["🌿", "🦜", "🐵", "🌺", "🦋", "🌴", "🏖️"];
                const expeditionNames = [
                  "Base Camp",
                  "River Cross",
                  "Canopy Climb",
                  "Valley Trek",
                  "Peak Ascent",
                  "Waterfall",
                  "Summit!",
                ];

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className="bg-gradient-to-t from-jungle-DEFAULT to-emerald-400 rounded-t-lg min-h-[8px] transition-all duration-1000 ease-bounce hover:scale-110 shadow-md animate-jungle-glow"
                        style={{ height: `${height}%` }}
                        title={`${expeditionNames[index]}: ${value} words discovered!`}
                      />
                    </div>
                    <p className="text-xs text-jungle-dark/70 mt-1">
                      {days[index]}
                    </p>
                    <p
                      className="text-sm md:text-lg"
                      title={expeditionNames[index]}
                    >
                      {jungleEmojis[index]}
                    </p>
                    <p className="text-xs md:text-sm font-bold text-jungle-DEFAULT">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <p className="text-jungle-dark font-semibold text-sm md:text-base">
                Your weekly jungle expedition map! 🗺️🌟
              </p>
              <p className="text-jungle-DEFAULT/70 text-xs md:text-sm">
                Each day brings new discoveries in the word jungle!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderJungleCategoryBreakdown = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-sunshine-light to-orange-50 border-2 border-sunshine-DEFAULT/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sunshine-dark">
            <PieChart className="w-5 h-5 text-sunshine-DEFAULT" />
            🎨 Jungle Territory Exploration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.categoryBreakdown.map((category, index) => {
              const jungleColors = [
                "from-jungle-DEFAULT to-emerald-400",
                "from-sky-DEFAULT to-blue-400",
                "from-sunshine-DEFAULT to-orange-400",
                "from-playful-purple to-purple-400",
                "from-coral-red to-pink-400",
                "from-bright-orange to-yellow-400",
              ];
              const jungleIcons = ["🐵", "🌿", "🎒", "🌦️", "🎵"];
              const territoryNames = [
                "Animal Kingdom",
                "Plant Paradise",
                "Explorer's Cache",
                "Weather Wisdom",
                "Sound Safari",
              ];
              const color = jungleColors[index % jungleColors.length];
              const icon = jungleIcons[index % jungleIcons.length];
              const territory = territoryNames[index] || category.category;

              return (
                <div key={category.category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r ${color} flex items-center justify-center text-white shadow-lg text-lg md:text-xl animate-jungle-glow`}
                      >
                        {icon}
                      </div>
                      <div>
                        <span className="font-bold text-jungle-dark text-sm md:text-base">
                          {territory}
                        </span>
                        <p className="text-xs text-jungle-DEFAULT/70 hidden md:block">
                          Exploring the {category.category.toLowerCase()}{" "}
                          region! 🗺️
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
                      <span className="bg-sky-DEFAULT/20 px-2 py-1 rounded-full text-sky-DEFAULT font-semibold hidden md:inline">
                        {category.timeSpent}min expedition
                      </span>
                    </div>
                  </div>
                  <div className="bg-jungle-light/30 rounded-full h-3 overflow-hidden border border-jungle-DEFAULT/20">
                    <div
                      className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 rounded-full animate-jungle-glow`}
                      style={{
                        width: `${Math.max((category.wordsLearned / (data.totalWordsLearned || 1)) * 100, 5)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Jungle Difficulty Levels */}
      <Card className="bg-gradient-to-br from-light-background to-jungle-light border-2 border-jungle-DEFAULT/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-jungle-dark">
            <Crown className="w-5 h-5 text-jungle-DEFAULT" />
            ⛰️ Jungle Altitude Mastery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.difficultyProgress.map((difficulty) => {
              const percentage =
                (difficulty.completed / difficulty.total) * 100;
              const theme = getDifficultyJungleTheme(difficulty.difficulty);

              return (
                <div key={difficulty.difficulty} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-r ${theme.color} flex items-center justify-center text-white text-xl shadow-lg animate-jungle-sway`}
                      >
                        {theme.icon}
                      </div>
                      <div>
                        <Badge
                          className={`bg-gradient-to-r ${theme.color} text-white border-0 capitalize text-sm px-3 py-1`}
                        >
                          {theme.name}
                        </Badge>
                        <p className="text-xs text-jungle-DEFAULT/70 mt-1">
                          {theme.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-jungle-dark font-semibold">
                      {difficulty.completed}/{difficulty.total} territories
                      conquered
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={percentage}
                      className="h-4 bg-jungle-light/50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-jungle-dark">
                        {Math.round(percentage)}% explored
                      </span>
                    </div>
                  </div>
                  {percentage === 100 && (
                    <div className="text-center">
                      <Badge className="bg-emerald-500 text-white animate-jungle-celebration">
                        🎉 Territory Conquered! Master Explorer! 🏆
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderJungleStreakAnalysis = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-emerald-50 to-jungle-light border-2 border-jungle-DEFAULT/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-jungle-dark">
            <Activity className="w-5 h-5 text-jungle-DEFAULT" />
            🗺️ Jungle Expedition Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-jungle-dark/80 text-center">
              Track your jungle adventures over the past 30 days! 🌿🦜
            </p>

            <div className="grid grid-cols-10 gap-1 justify-center">
              {data.streakData.map((day, index) => {
                const expeditionTypes = [
                  {
                    threshold: 12,
                    icon: "🏆",
                    name: "Epic Expedition",
                    color: "from-sunshine-DEFAULT to-orange-500",
                  },
                  {
                    threshold: 8,
                    icon: "⭐",
                    name: "Great Adventure",
                    color: "from-jungle-DEFAULT to-emerald-500",
                  },
                  {
                    threshold: 4,
                    icon: "🌿",
                    name: "Forest Walk",
                    color: "from-sky-DEFAULT to-blue-500",
                  },
                  {
                    threshold: 1,
                    icon: "👣",
                    name: "First Steps",
                    color: "from-bright-orange to-orange-400",
                  },
                ];

                const expedition = expeditionTypes.find(
                  (exp) => day.wordsLearned >= exp.threshold,
                );
                const isRestDay = !day.active;

                return (
                  <div
                    key={index}
                    className={cn(
                      "w-5 h-5 md:w-6 md:h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all hover:scale-110 cursor-pointer border-2 relative",
                      isRestDay
                        ? "bg-jungle-light/50 text-jungle-DEFAULT/40 border-jungle-DEFAULT/20 hover:bg-jungle-light/70"
                        : `bg-gradient-to-br ${expedition?.color || "from-gray-400 to-gray-500"} text-white border-white shadow-lg animate-jungle-sparkle`,
                    )}
                    title={`${day.date}: ${
                      isRestDay
                        ? "Rest day at base camp 🏕️"
                        : `${expedition?.name || "Unknown"}: ${day.wordsLearned} words discovered! 🌟`
                    }`}
                  >
                    {isRestDay ? "🏕️" : expedition?.icon || "❓"}
                    {day.wordsLearned >= 12 && !isRestDay && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-sunshine-DEFAULT rounded-full flex items-center justify-center border border-white">
                        <Sparkles className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 md:flex md:items-center md:justify-center gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-jungle-light/50 border border-jungle-DEFAULT/20 rounded-sm flex items-center justify-center text-xs">
                  🏕️
                </div>
                <span className="text-jungle-DEFAULT/70">Base camp rest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-bright-orange to-orange-400 rounded-sm flex items-center justify-center text-white text-xs">
                  👣
                </div>
                <span className="text-bright-orange font-semibold">
                  First steps
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-sky-DEFAULT to-blue-500 rounded-sm flex items-center justify-center text-white text-xs">
                  🌿
                </div>
                <span className="text-sky-DEFAULT font-semibold">
                  Forest walk
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-jungle-DEFAULT to-emerald-500 rounded-sm flex items-center justify-center text-white text-xs">
                  ⭐
                </div>
                <span className="text-jungle-DEFAULT font-semibold">
                  Great adventure
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-sunshine-DEFAULT to-orange-500 rounded-sm flex items-center justify-center text-white text-xs">
                  🏆
                </div>
                <span className="text-sunshine-dark font-semibold">
                  Epic expedition!
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jungle Learning Velocity */}
      <Card className="bg-gradient-to-br from-sky-light to-blue-50 border-2 border-sky-DEFAULT/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sky-dark">
            <TrendingUp className="w-5 h-5 text-sky-DEFAULT" />
            🚀 Expedition Speed Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.learningVelocity.map((expedition, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/90 rounded-xl border border-sky-DEFAULT/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-sky-DEFAULT to-blue-500 rounded-full flex items-center justify-center text-white text-lg animate-jungle-float">
                    {index === 0
                      ? "🌱"
                      : index === 1
                        ? "🌿"
                        : index === 2
                          ? "🌳"
                          : "⛰️"}
                  </div>
                  <div>
                    <p className="font-bold text-jungle-dark">
                      {expedition.week}
                    </p>
                    <p className="text-sm text-jungle-DEFAULT/70">
                      Jungle expedition phase
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-sky-DEFAULT">
                    {expedition.wordsPerHour} words/hour
                  </p>
                  <p className="text-sm text-emerald-600 font-semibold">
                    {expedition.accuracy}% precision rate
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3",
                          i < Math.floor(expedition.accuracy / 20)
                            ? "text-sunshine-DEFAULT fill-current"
                            : "text-gray-300",
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderJungleAchievements = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-sunshine-light to-orange-50 border-2 border-sunshine-DEFAULT/30 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sunshine-dark">
            <Award className="w-5 h-5 text-sunshine-DEFAULT" />
            🏆 Jungle Trophy Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className="bg-gradient-to-r from-jungle-light to-emerald-50 border border-jungle-DEFAULT/30 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl md:text-5xl animate-jungle-celebration">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-jungle-dark">
                          {achievement.title}
                        </h4>
                        <Badge
                          className={`${getJungleRarityColor(achievement.rarity)} text-white text-xs border-0 px-2 py-1`}
                        >
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-jungle-dark/80 mb-2">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-jungle-DEFAULT/70">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Discovered{" "}
                          {new Date(
                            achievement.unlockedAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 bg-gradient-to-br from-light-background to-jungle-light/30 min-h-screen p-4 rounded-2xl">
      {/* Jungle Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          <div className="flex justify-center gap-4 mb-2">
            <span className="text-2xl animate-jungle-float">🌿</span>
            <span className="text-2xl animate-jungle-sway">🦜</span>
            <span className="text-2xl animate-jungle-celebration">🐵</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-jungle-DEFAULT via-emerald-500 to-sky-DEFAULT bg-clip-text text-transparent animate-jungle-glow">
            🌟 Jungle Learning Analytics 📊
          </h2>
          <p className="text-jungle-dark/80 text-sm md:text-lg">
            Explore your amazing journey through the word jungle! 🗺️✨
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-jungle-DEFAULT/30 hover:border-jungle-DEFAULT/50"
          >
            <Filter className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Filter</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-jungle-DEFAULT/30 hover:border-jungle-DEFAULT/50"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Jungle Adventure Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 bg-gradient-to-r from-jungle-DEFAULT/10 to-emerald-500/10 p-1 border-2 border-jungle-DEFAULT/20 rounded-xl shadow-lg">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 data-[state=active]:bg-jungle-DEFAULT data-[state=active]:text-white transition-all duration-300 rounded-lg"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="hidden md:inline">🌟 Overview</span>
            <span className="md:hidden">🌟</span>
          </TabsTrigger>
          <TabsTrigger
            value="territories"
            className="flex items-center gap-2 data-[state=active]:bg-sunshine-DEFAULT data-[state=active]:text-white transition-all duration-300 rounded-lg"
          >
            <PieChart className="w-4 h-4" />
            <span className="hidden md:inline">🗺️ Territories</span>
            <span className="md:hidden">🗺️</span>
          </TabsTrigger>
          <TabsTrigger
            value="expeditions"
            className="flex items-center gap-2 data-[state=active]:bg-sky-DEFAULT data-[state=active]:text-white transition-all duration-300 rounded-lg"
          >
            <Activity className="w-4 h-4" />
            <span className="hidden md:inline">🚀 Expeditions</span>
            <span className="md:hidden">🚀</span>
          </TabsTrigger>
          <TabsTrigger
            value="trophies"
            className="flex items-center gap-2 data-[state=active]:bg-bright-orange data-[state=active]:text-white transition-all duration-300 rounded-lg"
          >
            <Award className="w-4 h-4" />
            <span className="hidden md:inline">🏆 Trophies</span>
            <span className="md:hidden">🏆</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderJungleOverview()}
        </TabsContent>

        <TabsContent value="territories" className="mt-6">
          {renderJungleCategoryBreakdown()}
        </TabsContent>

        <TabsContent value="expeditions" className="mt-6">
          {renderJungleStreakAnalysis()}
        </TabsContent>

        <TabsContent value="trophies" className="mt-6">
          {renderJungleAchievements()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
