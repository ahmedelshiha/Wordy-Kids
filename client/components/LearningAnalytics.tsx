import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Filter
} from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';

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
    difficulty: 'easy' | 'medium' | 'hard';
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
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }>;
}

const sampleData: LearningData = {
  totalWordsLearned: 127,
  weeklyProgress: [5, 8, 12, 7, 15, 10, 18],
  categoryBreakdown: [
    { category: 'Animals', wordsLearned: 28, accuracy: 92, timeSpent: 45 },
    { category: 'Nature', wordsLearned: 24, accuracy: 88, timeSpent: 38 },
    { category: 'Science', wordsLearned: 21, accuracy: 85, timeSpent: 52 },
    { category: 'Food', wordsLearned: 19, accuracy: 94, timeSpent: 31 },
    { category: 'General', wordsLearned: 18, accuracy: 87, timeSpent: 42 },
    { category: 'Sports', wordsLearned: 17, accuracy: 90, timeSpent: 28 }
  ],
  difficultyProgress: [
    { difficulty: 'easy', completed: 68, total: 80 },
    { difficulty: 'medium', completed: 42, total: 70 },
    { difficulty: 'hard', completed: 17, total: 50 }
  ],
  streakData: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: Math.random() > 0.3,
    wordsLearned: Math.floor(Math.random() * 12) + 1
  })),
  learningVelocity: [
    { week: 'Week 1', wordsPerHour: 3.2, accuracy: 85 },
    { week: 'Week 2', wordsPerHour: 4.1, accuracy: 87 },
    { week: 'Week 3', wordsPerHour: 4.8, accuracy: 89 },
    { week: 'Week 4', wordsPerHour: 5.2, accuracy: 91 }
  ],
  achievements: [
    {
      id: 'first-100',
      title: 'Century Club',
      description: 'Learned 100 words',
      icon: '💯',
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      rarity: 'epic'
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: '7-day learning streak',
      icon: '🔥',
      unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      rarity: 'rare'
    },
    {
      id: 'perfect-quiz',
      title: 'Perfect Score',
      description: '100% on quiz',
      icon: '🎯',
      unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      rarity: 'common'
    }
  ]
};

interface LearningAnalyticsProps {
  data?: LearningData;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

export const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({
  data = sampleData,
  timeRange = 'month'
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'words' | 'time' | 'accuracy'>('words');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-slate-500';
      case 'rare': return 'bg-educational-blue';
      case 'epic': return 'bg-educational-purple';
      case 'legendary': return 'bg-educational-orange';
      default: return 'bg-slate-500';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 text-educational-blue mx-auto mb-2" />
            <div className="text-2xl font-bold text-educational-blue">
              <AnimatedCounter value={data.totalWordsLearned} />
            </div>
            <p className="text-sm text-slate-600">Total Words</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-educational-orange mx-auto mb-2" />
            <div className="text-2xl font-bold text-educational-orange">
              <AnimatedCounter 
                value={data.learningVelocity[data.learningVelocity.length - 1]?.wordsPerHour || 0} 
                suffix="/hr"
              />
            </div>
            <p className="text-sm text-slate-600">Learning Speed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-educational-green mx-auto mb-2" />
            <div className="text-2xl font-bold text-educational-green">
              <AnimatedCounter 
                value={data.learningVelocity[data.learningVelocity.length - 1]?.accuracy || 0}
                suffix="%"
              />
            </div>
            <p className="text-sm text-slate-600">Accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-educational-purple mx-auto mb-2" />
            <div className="text-2xl font-bold text-educational-purple">
              <AnimatedCounter value={data.achievements.length} />
            </div>
            <p className="text-sm text-slate-600">Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Weekly Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center gap-4 mb-4">
              {['words', 'time', 'accuracy'].map((metric) => (
                <Button
                  key={metric}
                  variant={selectedMetric === metric ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetric(metric as any)}
                  className="capitalize"
                >
                  {metric}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2 h-40">
              {data.weeklyProgress.map((value, index) => {
                const maxValue = Math.max(...data.weeklyProgress);
                const height = (value / maxValue) * 100;
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className="bg-educational-blue rounded-t-lg min-h-[4px] transition-all duration-1000 ease-out"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{days[index]}</p>
                    <p className="text-xs font-semibold">{value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCategoryBreakdown = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Learning by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.categoryBreakdown.map((category, index) => {
              const colors = [
                'bg-educational-blue',
                'bg-educational-green', 
                'bg-educational-orange',
                'bg-educational-purple',
                'bg-educational-pink',
                'bg-educational-yellow'
              ];
              const color = colors[index % colors.length];
              
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${color}`} />
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-slate-600">{category.wordsLearned} words</span>
                      <span className="text-educational-green font-medium">{category.accuracy}%</span>
                      <span className="text-slate-500">{category.timeSpent}m</span>
                    </div>
                  </div>
                  <Progress 
                    value={(category.wordsLearned / data.totalWordsLearned) * 100} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progress by Difficulty</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.difficultyProgress.map((difficulty) => {
              const percentage = (difficulty.completed / difficulty.total) * 100;
              const colors = {
                easy: 'bg-educational-green',
                medium: 'bg-educational-orange', 
                hard: 'bg-educational-pink'
              };
              
              return (
                <div key={difficulty.difficulty} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`${colors[difficulty.difficulty]} text-white capitalize`}>
                        {difficulty.difficulty}
                      </Badge>
                    </div>
                    <span className="text-sm text-slate-600">
                      {difficulty.completed}/{difficulty.total} words
                    </span>
                  </div>
                  <Progress value={percentage} className="h-3" />
                  <p className="text-xs text-slate-500 text-right">
                    {Math.round(percentage)}% complete
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStreakAnalysis = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Learning Streak Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Track your daily learning consistency over the past 30 days
            </p>
            
            <div className="grid grid-cols-10 gap-1">
              {data.streakData.map((day, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-medium transition-all hover:scale-110 ${
                    day.active 
                      ? day.wordsLearned > 8 
                        ? 'bg-educational-green text-white' 
                        : day.wordsLearned > 4
                        ? 'bg-educational-blue text-white'
                        : 'bg-educational-orange text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                  title={`${day.date}: ${day.active ? `${day.wordsLearned} words` : 'No activity'}`}
                >
                  {day.active ? day.wordsLearned : ''}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Less activity</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-slate-100 rounded-sm" />
                <div className="w-3 h-3 bg-educational-orange rounded-sm" />
                <div className="w-3 h-3 bg-educational-blue rounded-sm" />
                <div className="w-3 h-3 bg-educational-green rounded-sm" />
              </div>
              <span>More activity</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Velocity */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Velocity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.learningVelocity.map((week, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{week.week}</p>
                  <p className="text-sm text-slate-600">Learning efficiency</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-educational-blue">
                    {week.wordsPerHour} words/hour
                  </p>
                  <p className="text-sm text-educational-green">
                    {week.accuracy}% accuracy
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievement Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.achievements.map((achievement) => (
              <Card key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <Badge className={`${getRarityColor(achievement.rarity)} text-white text-xs`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{achievement.description}</p>
                      <p className="text-xs text-slate-500">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Learning Analytics</h2>
          <p className="text-slate-600">Detailed insights into your vocabulary learning journey</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="streaks" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          {renderCategoryBreakdown()}
        </TabsContent>

        <TabsContent value="streaks" className="mt-6">
          {renderStreakAnalysis()}
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          {renderAchievements()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
