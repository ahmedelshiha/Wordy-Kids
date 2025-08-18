import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { PracticeWordsCard } from "@/components/PracticeWordsCard";
import {
  InteractiveDashboardWordCard,
  SessionStats,
} from "@/components/InteractiveDashboardWordCard";
import { AIEnhancedInteractiveDashboardWordCard } from "@/components/AIEnhancedInteractiveDashboardWordCard";
import { useAuth } from "@/hooks/useAuth";
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
  dailyGoalProgress?: number;
  dailyGoalTarget?: number;
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
  forgottenWordsCount?: number;
  rememberedWordsCount?: number;
  onRequestNewWords?: () => void;
  onSessionProgress?: (stats: SessionStats) => void;
  // Systematic word generation props
  dashboardSession?: any; // DashboardWordSession
  onGenerateNewSession?: () => void;
  // Learning goals integration
  currentProgress?: {
    wordsLearned: number;
    wordsRemembered: number;
    sessionCount: number;
    accuracy: number;
  };
  learningGoals?: any[];
  // AI Enhancement props
  userId?: string;
  enableAIEnhancement?: boolean;
  selectedCategory?: string;
  userProgress?: {
    rememberedWords: Set<number>;
    forgottenWords: Set<number>;
    excludedWordIds: Set<number>;
  };
  onSessionComplete?: (sessionData: any) => void;
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
  forgottenWordsCount = 0,
  rememberedWordsCount = 0,
  onRequestNewWords,
  onSessionProgress,
  dashboardSession,
  onGenerateNewSession,
  currentProgress = {
    wordsLearned: 0,
    wordsRemembered: 0,
    sessionCount: 0,
    accuracy: 0,
  },
  learningGoals = [],
  // AI Enhancement props
  userId,
  enableAIEnhancement = false,
  selectedCategory,
  userProgress,
  onSessionComplete,
}) => {
  const [useAIEnhancement, setUseAIEnhancement] =
    React.useState(enableAIEnhancement);
  const { isGuest } = useAuth();

  const completionPercentage = Math.round(
    (stats.wordsLearned / stats.totalWords) * 100,
  );
  const weeklyPercentage = Math.round(
    (stats.weeklyProgress / stats.weeklyGoal) * 100,
  );

  // Use the higher value between API stats and local progress to prevent regression
  const actualWordsLearned = Math.max(
    childStats?.wordsRemembered || 0,
    stats.weeklyProgress || 0,
  );
  const actualGoal = stats.weeklyGoal;
  const actualPercentage = Math.round((actualWordsLearned / actualGoal) * 100);

  // Debug logging for progress tracking
  console.log("Progress Debug:", {
    childStatsWordsRemembered: childStats?.wordsRemembered,
    statsWeeklyProgress: stats.weeklyProgress,
    actualWordsLearned,
    actualGoal,
    actualPercentage,
    // Additional debug info
    rememberedWordsCount,
    forgottenWordsCount,
    calculation: `max(${childStats?.wordsRemembered || 0}, ${stats.weeklyProgress || 0}) = ${actualWordsLearned}`,
  });

  // Kid-friendly messages based on progress
  const getProgressMessage = (
    percentage: number,
    wordsLearned: number,
    goal: number,
  ) => {
    if (wordsLearned >= goal) {
      if (wordsLearned >= goal * 2) return "🌟 SUPERSTAR! Amazing effort!";
      if (wordsLearned >= goal * 1.5) return "🚀 Beyond awesome! Keep going!";
      return "🎉 Goal achieved! You're incredible!";
    }
    if (percentage >= 90) return "🌟 Almost there, superstar!";
    if (percentage >= 75) return "🚀 You're doing great!";
    if (percentage >= 50) return "💪 Keep going, champion!";
    if (percentage >= 25) return "🌱 Nice start!";
    return "🌟 Ready for an adventure?";
  };

  const getProgressEmoji = (
    percentage: number,
    wordsLearned: number,
    goal: number,
  ) => {
    if (wordsLearned >= goal) {
      if (wordsLearned >= goal * 2) return "⭐";
      if (wordsLearned >= goal * 1.5) return "🚀";
      return "🏆";
    }
    if (percentage >= 90) return "⭐";
    if (percentage >= 75) return "🎯";
    if (percentage >= 50) return "💪";
    return "🌟";
  };

  return (
    <div className="space-y-4">
      {/* Interactive Word Learning Hub - PRIMARY FEATURE */}
      {availableWords.length > 0 && onWordProgress ? (
        <>
          {useAIEnhancement && userId && userProgress ? (
            <AIEnhancedInteractiveDashboardWordCard
              userId={userId}
              userProgress={userProgress}
              childStats={childStats}
              onWordProgress={onWordProgress}
              onQuickQuiz={onQuickQuiz || (() => console.log("Quick quiz"))}
              onAdventure={onAdventure || (() => console.log("Adventure"))}
              onPracticeForgotten={
                onPracticeForgotten || (() => console.log("Practice forgotten"))
              }
              dailyGoal={{
                target: stats.dailyGoalTarget || stats.weeklyGoal, // Use daily goal if available
                completed: stats.dailyGoalProgress || stats.weeklyProgress,
                streak: stats.currentStreak,
              }}
              currentLevel={stats.level}
              totalPoints={stats.totalPoints}
              selectedCategory={selectedCategory}
              onSessionComplete={onSessionComplete}
              onToggleAIEnhancement={(enabled) => {
                setUseAIEnhancement(enabled);
                // Update localStorage settings
                if (typeof window !== "undefined") {
                  localStorage.setItem(
                    "aiEnhancementEnabled",
                    JSON.stringify(enabled),
                  );
                }
              }}
            />
          ) : (
            <InteractiveDashboardWordCard
              words={availableWords}
              onWordProgress={onWordProgress}
              onQuickQuiz={onQuickQuiz || (() => console.log("Quick quiz"))}
              onAdventure={onAdventure || (() => console.log("Adventure"))}
              onPracticeForgotten={
                onPracticeForgotten || (() => console.log("Practice forgotten"))
              }
              dailyGoal={{
                target: stats.dailyGoalTarget || stats.weeklyGoal, // Use daily goal if available
                completed: stats.dailyGoalProgress || stats.weeklyProgress,
                streak: stats.currentStreak,
              }}
              currentLevel={stats.level}
              totalPoints={stats.totalPoints}
              forgottenWordsCount={forgottenWordsCount}
              rememberedWordsCount={rememberedWordsCount}
              onRequestNewWords={onRequestNewWords}
              onSessionProgress={onSessionProgress}
              dashboardSession={dashboardSession}
              onGenerateNewSession={onGenerateNewSession}
            />
          )}
        </>
      ) : (
        // Fallback welcome section if no words available
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-slate-600 mb-6">
            Ready to continue your learning journey?
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

      {/* Compact Stats Row - Hidden */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </div> */}

      {/* Compact Progress and Achievement Row - Hidden */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div> */}

      {/* Recent Achievements - Hidden */}
      {/* <Card>
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
      </Card> */}
    </div>
  );
};
