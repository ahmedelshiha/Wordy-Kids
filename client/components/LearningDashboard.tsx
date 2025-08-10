import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { PracticeWordsCard } from '@/components/PracticeWordsCard';
import { ChildWordStats } from '@shared/api';
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
  AlertCircle
} from 'lucide-react';

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
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({
  stats,
  userName = "Learner",
  childStats
}) => {
  const completionPercentage = Math.round((stats.wordsLearned / stats.totalWords) * 100);
  const weeklyPercentage = Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Welcome back, {userName}! 🌟
        </h1>
        <p className="text-slate-600">
          Ready to continue your word adventure?
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Words Learned */}
        <Card className="bg-gradient-to-br from-educational-blue to-educational-blue-light text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Words Learned</p>
                <AnimatedCounter
                  value={stats.wordsLearned}
                  className="text-3xl font-bold"
                />
                <p className="text-xs opacity-80">of {stats.totalWords}</p>
              </div>
              <BookOpen className="w-8 h-8 opacity-80" />
            </div>
            <Progress 
              value={completionPercentage} 
              className="mt-3 bg-white/20"
            />
            <p className="text-xs mt-1">{completionPercentage}% Complete</p>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="bg-gradient-to-br from-educational-orange to-educational-orange-light text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Current Streak</p>
                <AnimatedCounter
                  value={stats.currentStreak}
                  className="text-3xl font-bold"
                />
                <p className="text-xs opacity-80">days</p>
              </div>
              <Zap className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        {/* Weekly Goal */}
        <Card className="bg-gradient-to-br from-educational-green to-educational-green-light text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Weekly Goal</p>
                <AnimatedCounter
                  value={stats.weeklyProgress}
                  className="text-3xl font-bold"
                />
                <p className="text-xs opacity-80">of {stats.weeklyGoal} words</p>
              </div>
              <Target className="w-8 h-8 opacity-80" />
            </div>
            <Progress 
              value={weeklyPercentage} 
              className="mt-3 bg-white/20"
            />
            <p className="text-xs mt-1">{weeklyPercentage}% of goal</p>
          </CardContent>
        </Card>

        {/* Accuracy Rate */}
        <Card className="bg-gradient-to-br from-educational-purple to-educational-purple-light text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Accuracy</p>
                <AnimatedCounter
                  value={stats.accuracyRate}
                  suffix="%"
                  className="text-3xl font-bold"
                />
                <p className="text-xs opacity-80">average</p>
              </div>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level and Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Level Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-yellow-500" />
              Level {stats.level}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {stats.level + 1}</span>
                <span>{stats.totalPoints} points</span>
              </div>
              <Progress value={75} className="h-3" />
              <p className="text-xs text-slate-600">
                325 more points to reach Level {stats.level + 1}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Favorite Category */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-educational-orange" />
              Favorite Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Badge 
                className="text-lg px-4 py-2 bg-educational-blue text-white"
              >
                {stats.favoriteCategory}
              </Badge>
              <p className="text-sm text-slate-600 mt-2">
                You've mastered the most words in this category!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Word Progress Statistics */}
      {childStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-500" />
              Word Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Progress */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Overall Progress
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Words Learned</span>
                    <span className="font-semibold">{childStats.totalWordsLearned}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Accuracy</span>
                    <span className="font-semibold">{childStats.averageAccuracy}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Review Sessions</span>
                    <span className="font-semibold">{childStats.totalReviewSessions}</span>
                  </div>
                </div>
              </div>

              {/* Words Status */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Word Status
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Remembered</span>
                    </div>
                    <span className="font-semibold text-green-600">{childStats.wordsRemembered}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Need Practice</span>
                    </div>
                    <span className="font-semibold text-orange-600">{childStats.wordsNeedingPractice}</span>
                  </div>
                  <Progress
                    value={childStats.totalWordsLearned > 0 ? (childStats.wordsRemembered / childStats.totalWordsLearned) * 100 : 0}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Category Performance */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Category Performance
                </h4>
                <div className="space-y-2">
                  {childStats.strongestCategories.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Strongest Categories:</p>
                      <div className="flex flex-wrap gap-1">
                        {childStats.strongestCategories.slice(0, 2).map((category) => (
                          <Badge key={category} className="bg-green-100 text-green-800 text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {childStats.weakestCategories.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Focus Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {childStats.weakestCategories.slice(0, 2).map((category) => (
                          <Badge key={category} className="bg-orange-100 text-orange-800 text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category Mastery Details */}
            {childStats.masteryByCategory.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-4">Category Mastery</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {childStats.masteryByCategory.map((category) => (
                    <div key={category.category} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium text-sm">{category.category}</h5>
                        <span className="text-xs text-gray-600">{category.averageAccuracy}%</span>
                      </div>
                      <Progress value={category.averageAccuracy} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{category.masteredWords} mastered</span>
                        <span>{category.needsPracticeWords} need practice</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-educational-purple" />
            Achievement Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.badges.map((badge) => (
              <div
                key={badge.id}
                className={`text-center p-4 rounded-lg transition-all ${
                  badge.earned
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h4 className="font-semibold text-sm">{badge.name}</h4>
                <p className="text-xs mt-1 opacity-90">{badge.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
