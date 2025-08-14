import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Star,
  Trophy,
  Zap,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Flame,
  Brain,
  BookOpen,
  Timer,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GoalProgressData {
  id: string;
  title: string;
  type: "daily" | "weekly" | "monthly";
  target: number;
  current: number;
  unit: string;
  category?: string;
  streak: number;
  bestStreak: number;
  completionRate: number;
  isActive: boolean;
  difficulty: "easy" | "medium" | "hard";
  daysRemaining?: number;
}

interface StreakData {
  current: number;
  best: number;
  weeklyStreaks: number[];
  monthlyAverage: number;
}

interface CategoryProgress {
  name: string;
  progress: number;
  wordsLearned: number;
  accuracy: number;
  emoji: string;
  color: string;
}

interface GoalProgressDashboardProps {
  goals: GoalProgressData[];
  streakData: StreakData;
  categoryProgress: CategoryProgress[];
  overallStats: {
    totalWordsLearned: number;
    averageAccuracy: number;
    totalSessions: number;
    learningTime: number;
  };
  className?: string;
}

export const GoalProgressDashboard: React.FC<GoalProgressDashboardProps> = ({
  goals,
  streakData,
  categoryProgress,
  overallStats,
  className,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "day" | "week" | "month"
  >("week");
  const [animationEnabled, setAnimationEnabled] = useState(true);

  // Animation effect for progress bars
  useEffect(() => {
    const timer = setTimeout(() => setAnimationEnabled(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getGoalStatus = (goal: GoalProgressData) => {
    const progress = (goal.current / goal.target) * 100;

    if (progress >= 100) {
      return {
        status: "completed",
        color: "text-green-600",
        bg: "bg-green-50 border-green-200",
        icon: CheckCircle,
      };
    }
    if (progress >= 75) {
      return {
        status: "on-track",
        color: "text-blue-600",
        bg: "bg-blue-50 border-blue-200",
        icon: Target,
      };
    }
    if (progress >= 50) {
      return {
        status: "behind",
        color: "text-yellow-600",
        bg: "bg-yellow-50 border-yellow-200",
        icon: AlertCircle,
      };
    }
    return {
      status: "critical",
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      icon: AlertCircle,
    };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "hard":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const activeGoals = goals.filter((goal) => goal.isActive);
  const completedGoals = goals.filter((goal) => goal.current >= goal.target);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3 text-center">
            <BookOpen className="w-5 h-5 mx-auto mb-1 text-blue-600" />
            <div className="text-lg font-bold text-blue-700">
              {overallStats.totalWordsLearned}
            </div>
            <div className="text-xs text-blue-600">Words Learned</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-3 text-center">
            <Target className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <div className="text-lg font-bold text-green-700">
              {Math.round(overallStats.averageAccuracy)}%
            </div>
            <div className="text-xs text-green-600">Avg Accuracy</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-3 text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-600" />
            <div className="text-lg font-bold text-orange-700">
              {streakData.current}
            </div>
            <div className="text-xs text-orange-600">Day Streak</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-3 text-center">
            <Activity className="w-5 h-5 mx-auto mb-1 text-purple-600" />
            <div className="text-lg font-bold text-purple-700">
              {overallStats.totalSessions}
            </div>
            <div className="text-xs text-purple-600">Sessions</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-educational-blue" />
            Active Goals
            <Badge variant="outline" className="ml-auto">
              {activeGoals.length} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeGoals.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                No active goals. Create one to start tracking!
              </p>
            </div>
          ) : (
            activeGoals.map((goal) => {
              const status = getGoalStatus(goal);
              const progress = Math.min(
                (goal.current / goal.target) * 100,
                100,
              );
              const StatusIcon = status.icon;

              return (
                <Card
                  key={goal.id}
                  className={cn("transition-all duration-300", status.bg)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-xl",
                            status.color.includes("green")
                              ? "bg-green-100"
                              : status.color.includes("blue")
                                ? "bg-blue-100"
                                : status.color.includes("yellow")
                                  ? "bg-yellow-100"
                                  : "bg-red-100",
                          )}
                        >
                          <StatusIcon className={cn("w-4 h-4", status.color)} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">
                            {goal.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                getDifficultyColor(goal.difficulty),
                              )}
                            >
                              {goal.difficulty}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {goal.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {goal.current}/{goal.target} {goal.unit}
                        </div>
                        <div className="text-xs text-gray-600">
                          {Math.round(progress)}% complete
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <Progress
                        value={progress}
                        className={cn(
                          "h-2 transition-all duration-1000",
                          animationEnabled && "animate-pulse",
                        )}
                      />
                    </div>

                    {/* Goal Details */}
                    <div className="grid grid-cols-3 gap-4 text-center text-xs">
                      <div>
                        <div className="font-bold text-orange-600">
                          {goal.streak}
                        </div>
                        <div className="text-gray-600">Streak</div>
                      </div>
                      <div>
                        <div className="font-bold text-green-600">
                          {goal.bestStreak}
                        </div>
                        <div className="text-gray-600">Best</div>
                      </div>
                      <div>
                        <div className="font-bold text-purple-600">
                          {goal.daysRemaining ? `${goal.daysRemaining}d` : "∞"}
                        </div>
                        <div className="text-gray-600">Remaining</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Category Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PieChart className="w-5 h-5 text-educational-purple" />
            Category Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categoryProgress.map((category) => (
            <div key={category.name} className="flex items-center gap-3">
              <span className="text-xl">{category.emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {category.wordsLearned} words
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        category.accuracy >= 80
                          ? "text-green-600 border-green-200"
                          : category.accuracy >= 60
                            ? "text-yellow-600 border-yellow-200"
                            : "text-red-600 border-red-200",
                      )}
                    >
                      {category.accuracy}%
                    </Badge>
                  </div>
                </div>
                <Progress value={category.progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{category.progress}% mastery</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Streak Analytics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-educational-orange" />
            Streak Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
              <Flame className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-700">
                {streakData.current}
              </div>
              <div className="text-sm text-orange-600">Current Streak</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-700">
                {streakData.best}
              </div>
              <div className="text-sm text-yellow-600">Best Streak</div>
            </div>
          </div>

          {/* Weekly Streak Visualization */}
          <div>
            <h4 className="text-sm font-medium mb-2">Weekly Streak Pattern</h4>
            <div className="flex justify-between items-end h-16 mb-2">
              {streakData.weeklyStreaks.map((streak, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-4 rounded-t transition-all duration-500",
                      streak > 0 ? "bg-orange-500" : "bg-gray-200",
                    )}
                    style={{
                      height: `${Math.max((streak / Math.max(...streakData.weeklyStreaks)) * 48, 4)}px`,
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {["M", "T", "W", "T", "F", "S", "S"][index]}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-600 text-center">
              Monthly Average: {streakData.monthlyAverage} days
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      {completedGoals.length > 0 && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-yellow-600" />
              Recent Achievements
              <Badge className="ml-auto bg-yellow-500 text-white">
                {completedGoals.length} completed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {completedGoals.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center gap-3 p-2 bg-white/60 rounded-lg"
                >
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{goal.title}</div>
                    <div className="text-xs text-gray-600">
                      Completed {goal.type} goal • {goal.current} {goal.unit}
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Insights */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-purple-600" />
            Learning Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-sm font-medium">Peak Learning Time</div>
                <div className="text-xs text-gray-600">
                  Most productive between 9:00 AM - 11:00 AM
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">Accuracy Improving</div>
                <div className="text-xs text-gray-600">
                  +12% improvement this week
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
              <Heart className="w-4 h-4 text-pink-600" />
              <div>
                <div className="text-sm font-medium">Favorite Category</div>
                <div className="text-xs text-gray-600">
                  {
                    categoryProgress.reduce((prev, curr) =>
                      prev.progress > curr.progress ? prev : curr,
                    ).name
                  }{" "}
                  (
                  {
                    categoryProgress.reduce((prev, curr) =>
                      prev.progress > curr.progress ? prev : curr,
                    ).progress
                  }
                  % mastery)
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
