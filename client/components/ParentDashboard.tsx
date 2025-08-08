import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  Clock,
  Award,
  Target,
  Settings,
  Plus,
  Download,
  Eye,
  MessageCircle,
  Bell
} from 'lucide-react';
import { AnimatedCounter } from '@/components/AnimatedCounter';

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  level: number;
  totalPoints: number;
  wordsLearned: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  favoriteCategory: string;
  lastActive: Date;
  recentAchievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: Date;
  }>;
}

interface LearningSession {
  id: string;
  childId: string;
  activity: string;
  duration: number; // in minutes
  wordsLearned: number;
  accuracy: number;
  completedAt: Date;
}

interface ParentDashboardProps {
  children: ChildProfile[];
  sessions: LearningSession[];
}

const sampleChildren: ChildProfile[] = [
  {
    id: '1',
    name: 'Alex',
    age: 8,
    avatar: '👦',
    level: 3,
    totalPoints: 1250,
    wordsLearned: 47,
    currentStreak: 5,
    weeklyGoal: 15,
    weeklyProgress: 12,
    favoriteCategory: 'Animals',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    recentAchievements: [
      {
        id: 'streak-5',
        title: 'Streak Master',
        description: '5-day learning streak',
        icon: '🔥',
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'words-50',
        title: 'Word Collector',
        description: 'Learned 50 words',
        icon: '📚',
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]
  },
  {
    id: '2',
    name: 'Emma',
    age: 6,
    avatar: '👧',
    level: 2,
    totalPoints: 850,
    wordsLearned: 32,
    currentStreak: 3,
    weeklyGoal: 10,
    weeklyProgress: 8,
    favoriteCategory: 'Nature',
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    recentAchievements: [
      {
        id: 'first-quiz',
        title: 'Quiz Rookie',
        description: 'Completed first quiz',
        icon: '🎯',
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]
  }
];

const sampleSessions: LearningSession[] = [
  {
    id: '1',
    childId: '1',
    activity: 'Word Cards',
    duration: 15,
    wordsLearned: 5,
    accuracy: 90,
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '2',
    childId: '1',
    activity: 'Quiz Challenge',
    duration: 8,
    wordsLearned: 0,
    accuracy: 85,
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    childId: '2',
    activity: 'Matching Game',
    duration: 12,
    wordsLearned: 3,
    accuracy: 95,
    completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  }
];

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  children = sampleChildren,
  sessions = sampleSessions
}) => {
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(children[0] || null);
  const [activeTab, setActiveTab] = useState('overview');

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getChildSessions = (childId: string) => {
    return sessions.filter(session => session.childId === childId);
  };

  const calculateWeeklyStats = (childId: string) => {
    const childSessions = getChildSessions(childId);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = childSessions.filter(s => s.completedAt >= weekAgo);
    
    return {
      totalTime: recentSessions.reduce((sum, s) => sum + s.duration, 0),
      averageAccuracy: recentSessions.length > 0 
        ? Math.round(recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length)
        : 0,
      sessionsCount: recentSessions.length
    };
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Family Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-educational-blue" />
            Family Learning Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-educational-blue/5 rounded-lg">
              <div className="text-2xl font-bold text-educational-blue">
                <AnimatedCounter value={children.length} />
              </div>
              <p className="text-sm text-slate-600">Active Learners</p>
            </div>
            <div className="text-center p-4 bg-educational-green/5 rounded-lg">
              <div className="text-2xl font-bold text-educational-green">
                <AnimatedCounter value={children.reduce((sum, child) => sum + child.wordsLearned, 0)} />
              </div>
              <p className="text-sm text-slate-600">Total Words Learned</p>
            </div>
            <div className="text-center p-4 bg-educational-orange/5 rounded-lg">
              <div className="text-2xl font-bold text-educational-orange">
                <AnimatedCounter value={children.reduce((sum, child) => sum + child.totalPoints, 0)} />
              </div>
              <p className="text-sm text-slate-600">Total Points Earned</p>
            </div>
            <div className="text-center p-4 bg-educational-purple/5 rounded-lg">
              <div className="text-2xl font-bold text-educational-purple">
                <AnimatedCounter value={Math.max(...children.map(child => child.currentStreak))} />
              </div>
              <p className="text-sm text-slate-600">Longest Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child) => {
          const weeklyStats = calculateWeeklyStats(child.id);
          const progressPercentage = (child.weeklyProgress / child.weeklyGoal) * 100;

          return (
            <Card 
              key={child.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => setSelectedChild(child)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{child.avatar}</div>
                    <div>
                      <CardTitle className="text-xl">{child.name}</CardTitle>
                      <p className="text-sm text-slate-600">
                        {child.age} years old • Level {child.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {getTimeAgo(child.lastActive)}
                    </Badge>
                    <p className="text-xs text-slate-500">Last active</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Weekly Goal Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Weekly Goal</span>
                    <span>{child.weeklyProgress}/{child.weeklyGoal} words</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-educational-blue">
                      {child.wordsLearned}
                    </div>
                    <p className="text-xs text-slate-600">Words</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-educational-orange">
                      {child.currentStreak}
                    </div>
                    <p className="text-xs text-slate-600">Streak</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-educational-green">
                      {weeklyStats.averageAccuracy}%
                    </div>
                    <p className="text-xs text-slate-600">Accuracy</p>
                  </div>
                </div>

                {/* Recent Achievement */}
                {child.recentAchievements.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{child.recentAchievements[0].icon}</span>
                      <div>
                        <p className="font-medium text-sm">{child.recentAchievements[0].title}</p>
                        <p className="text-xs text-slate-600">
                          {getTimeAgo(child.recentAchievements[0].earnedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderChildDetails = () => {
    if (!selectedChild) return null;

    const childSessions = getChildSessions(selectedChild.id);
    const weeklyStats = calculateWeeklyStats(selectedChild.id);

    return (
      <div className="space-y-6">
        {/* Child Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{selectedChild.avatar}</div>
                <div>
                  <h2 className="text-3xl font-bold">{selectedChild.name}</h2>
                  <p className="text-slate-600">
                    {selectedChild.age} years old • Level {selectedChild.level}
                  </p>
                  <Badge className="bg-educational-blue text-white mt-2">
                    {selectedChild.favoriteCategory} Enthusiast
                  </Badge>
                </div>
              </div>
              <div className="text-right space-y-2">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 text-educational-blue mx-auto mb-2" />
              <div className="text-2xl font-bold">
                <AnimatedCounter value={selectedChild.wordsLearned} />
              </div>
              <p className="text-sm text-slate-600">Words Learned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-educational-green mx-auto mb-2" />
              <div className="text-2xl font-bold">
                <AnimatedCounter value={weeklyStats.totalTime} suffix="m" />
              </div>
              <p className="text-sm text-slate-600">This Week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-educational-orange mx-auto mb-2" />
              <div className="text-2xl font-bold">
                <AnimatedCounter value={weeklyStats.averageAccuracy} suffix="%" />
              </div>
              <p className="text-sm text-slate-600">Avg Accuracy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-educational-purple mx-auto mb-2" />
              <div className="text-2xl font-bold">
                <AnimatedCounter value={selectedChild.recentAchievements.length} />
              </div>
              <p className="text-sm text-slate-600">Recent Badges</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Learning Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {childSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-educational-blue/10 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-educational-blue" />
                    </div>
                    <div>
                      <p className="font-medium">{session.activity}</p>
                      <p className="text-sm text-slate-600">
                        {getTimeAgo(session.completedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-4 text-sm">
                      <span className="text-slate-600">
                        {session.duration}m
                      </span>
                      <span className="text-educational-green font-medium">
                        {session.accuracy}%
                      </span>
                      {session.wordsLearned > 0 && (
                        <span className="text-educational-blue font-medium">
                          +{session.wordsLearned} words
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedChild.recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <h4 className="font-semibold">{achievement.title}</h4>
                    <p className="text-sm text-slate-600">{achievement.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {getTimeAgo(achievement.earnedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Parent Dashboard</h1>
          <p className="text-slate-600">Monitor your children's learning progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Child
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Detailed View
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="detailed">
          {selectedChild ? renderChildDetails() : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-600">Select a child from the overview to see detailed information</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Communication Center</h3>
              <p className="text-slate-600 mb-4">
                Stay connected with your children's learning journey
              </p>
              <Button className="bg-educational-blue text-white">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
