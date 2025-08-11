import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { PracticeWordsCard } from "@/components/PracticeWordsCard";
import { InteractiveDashboardWordCard } from "@/components/InteractiveDashboardWordCard";
import { ChildWordStats } from "@shared/api";
import {
  Trophy,
  Star,
  BookOpen,
  Target,
  Zap,
  Calendar,
  TrendingUp,
  Award,
  Brain,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface LearningStats {
  wordsLearned: number;
  totalWords: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  accuracyRate: number;
  favoriteCategory: string;
  totalPoints: number;
  level: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    earned: boolean;
    description: string;
  }>;
}

interface LearningDashboardProps {
  stats: LearningStats;
  userName?: string;
  childStats?: ChildWordStats | null;
  onStartPractice?: () => void;
  practiceWords?: any[];
  // Interactive word card props
  availableWords?: any[];
  onWordProgress?: (
    word: any,
    status: "remembered" | "needs_practice" | "skipped",
  ) => void;
  onQuickQuiz?: () => void;
  onAdventure?: () => void;
  onPracticeForgotten?: () => void;
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({
  stats,
  userName = "Learner",
  childStats,
  onStartPractice,
  practiceWords = [],
  availableWords = [],
  onWordProgress,
  onQuickQuiz,
  onAdventure,
  onPracticeForgotten,
}) => {
  const completionPercentage = Math.round(
    (stats.wordsLearned / stats.totalWords) * 100,
  );
  const weeklyPercentage = Math.round(
    (stats.weeklyProgress / stats.weeklyGoal) * 100,
  );

  return (
    <div className="space-y-8">
      {/* Interactive Word Learning Hub - PRIMARY FEATURE */}
      {availableWords.length > 0 && onWordProgress ? (
        <InteractiveDashboardWordCard
          words={availableWords}
          onWordProgress={onWordProgress}
          onQuickQuiz={onQuickQuiz || (() => console.log("Quick quiz"))}
          onAdventure={onAdventure || (() => console.log("Adventure"))}
          onPracticeForgotten={
            onPracticeForgotten || (() => console.log("Practice forgotten"))
          }
          dailyGoal={{
            target: stats.weeklyGoal, // Using weekly goal as daily for demo
            completed: stats.weeklyProgress,
            streak: stats.currentStreak,
          }}
          currentLevel={stats.level}
          totalPoints={stats.totalPoints}
        />
      ) : (
        // Fallback welcome section if no words available
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-slate-600 mb-6">
            Ready to continue your word adventure?
          </p>

          {/* Practice Words Card - Fallback */}
          {practiceWords.length > 0 && onStartPractice && (
            <PracticeWordsCard
              practiceWords={practiceWords}
              onStartPractice={onStartPractice}
              childName={userName}
            />
          )}
        </div>
      )}

      {/* Compact Stats Row - Secondary Information */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Compact Stats Cards */}
        <Card className="bg-gradient-to-br from-educational-blue to-educational-blue-light text-white">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-6 h-6 mx-auto mb-1 opacity-80" />
            <AnimatedCounter
              value={stats.wordsLearned}
              className="text-2xl font-bold block"
            />
            <p className="text-xs opacity-90">Words Learned</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-educational-orange to-educational-orange-light text-white">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-1 opacity-80" />
            <AnimatedCounter
              value={stats.currentStreak}
              className="text-2xl font-bold block"
            />
            <p className="text-xs opacity-90">Day Streak</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-educational-green to-educational-green-light text-white">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-1 opacity-80" />
            <AnimatedCounter
              value={stats.weeklyProgress}
              className="text-2xl font-bold block"
            />
            <p className="text-xs opacity-90">Weekly Goal</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-educational-purple to-educational-purple-light text-white">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1 opacity-80" />
            <AnimatedCounter
              value={stats.accuracyRate}
              suffix="%"
              className="text-2xl font-bold block"
            />
            <p className="text-xs opacity-90">Accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Compact Progress and Achievement Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5" />
                  <span className="font-bold text-lg">Level {stats.level}</span>
                </div>
                <p className="text-sm opacity-90">{stats.totalPoints} points</p>
              </div>
              <div className="text-right">
                <Progress value={75} className="h-2 w-24 bg-white/20" />
                <p className="text-xs opacity-90 mt-1">Next level</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold text-lg">Top Category</span>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  {stats.favoriteCategory}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compact Word Progress Summary */}
      {childStats && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {childStats.wordsRemembered}
                </div>
                <div className="text-sm text-gray-600">Remembered</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {childStats.wordsNeedingPractice}
                </div>
                <div className="text-sm text-gray-600">Need Practice</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {childStats.averageAccuracy}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Achievements - Compact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-5 h-5 text-educational-purple" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {stats.badges
              .filter((badge) => badge.earned)
              .slice(0, 6)
              .map((badge) => (
                <div
                  key={badge.id}
                  className="text-center p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg min-w-[80px] flex-shrink-0"
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <h4 className="font-semibold text-xs">{badge.name}</h4>
                </div>
              ))}
            {stats.badges.filter((badge) => badge.earned).length === 0 && (
              <div className="text-center text-gray-500 w-full py-4">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-sm">
                  Start learning to earn your first badge!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
