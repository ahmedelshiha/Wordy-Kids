import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { 
  Trophy, 
  Star, 
  BookOpen, 
  Target, 
  Zap, 
  Calendar,
  TrendingUp,
  Award
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
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({
  stats,
  userName = "Learner"
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
