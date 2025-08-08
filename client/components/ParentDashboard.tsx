import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Bell,
  ArrowLeft,
  Edit,
  Trash2,
  PieChart,
  BarChart3,
  Star,
  Check,
  X,
  BellRing,
  Mail,
  FileText,
  Lightbulb,
  BookMarked,
  Calendar as CalendarIcon,
  Zap,
  Heart,
  Filter,
  Search,
  ChevronDown,
  UserPlus,
  Palette,
  Shield,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

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
  preferredLearningTime: string;
  difficultyPreference: 'easy' | 'medium' | 'hard';
  parentNotes: string;
  customWords: string[];
  weeklyTarget: number;
  monthlyTarget: number;
  recentAchievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: Date;
  }>;
  learningStrengths: string[];
  areasForImprovement: string[];
  motivationalRewards: string[];
}

interface LearningSession {
  id: string;
  childId: string;
  activity: string;
  duration: number;
  wordsLearned: number;
  accuracy: number;
  completedAt: Date;
  category: string;
  difficulty: string;
  mistakePatterns: string[];
}

interface ParentGoal {
  id: string;
  childId: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  deadline: Date;
  type: 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'completed' | 'paused';
  reward: string;
}

interface ParentNotification {
  id: string;
  type: 'achievement' | 'goal_progress' | 'milestone' | 'reminder' | 'concern';
  title: string;
  message: string;
  childId: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface ParentDashboardProps {
  children?: ChildProfile[];
  sessions?: LearningSession[];
  onNavigateBack?: () => void;
}

const sampleChildren: ChildProfile[] = [
  {
    id: "1",
    name: "Alex",
    age: 8,
    avatar: "👦",
    level: 3,
    totalPoints: 1250,
    wordsLearned: 47,
    currentStreak: 5,
    weeklyGoal: 15,
    weeklyProgress: 12,
    favoriteCategory: "Animals",
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    preferredLearningTime: "After school (4-6 PM)",
    difficultyPreference: 'medium',
    parentNotes: "Loves animal facts. Struggles with spelling but excels at comprehension.",
    customWords: ["dinosaur", "paleontologist", "prehistoric", "excavation"],
    weeklyTarget: 20,
    monthlyTarget: 80,
    learningStrengths: ["Visual Learning", "Pattern Recognition", "Memory Games"],
    areasForImprovement: ["Spelling Accuracy", "Reading Speed", "Pronunciation"],
    motivationalRewards: ["Extra playtime", "Choose weekend activity", "New book"],
    recentAchievements: [
      {
        id: "streak-5",
        title: "Streak Master",
        description: "5-day learning streak",
        icon: "🔥",
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: "words-50",
        title: "Word Collector",
        description: "Learned 50 words",
        icon: "📚",
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  },
  {
    id: "2",
    name: "Emma",
    age: 6,
    avatar: "👧",
    level: 2,
    totalPoints: 850,
    wordsLearned: 32,
    currentStreak: 3,
    weeklyGoal: 10,
    weeklyProgress: 8,
    favoriteCategory: "Nature",
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    preferredLearningTime: "Morning (9-11 AM)",
    difficultyPreference: 'easy',
    parentNotes: "Very enthusiastic learner. Loves nature and outdoor activities.",
    customWords: ["butterfly", "flowers", "garden", "rainbow"],
    weeklyTarget: 15,
    monthlyTarget: 60,
    learningStrengths: ["Curiosity", "Attention to Detail", "Creative Thinking"],
    areasForImprovement: ["Focus Duration", "Following Instructions", "Letter Formation"],
    motivationalRewards: ["Nature walk", "Art supplies", "Story time"],
    recentAchievements: [
      {
        id: "first-quiz",
        title: "Quiz Rookie",
        description: "Completed first quiz",
        icon: "🎯",
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  },
];

const sampleGoals: ParentGoal[] = [
  {
    id: "goal-1",
    childId: "1",
    title: "Weekly Word Mastery",
    description: "Learn 20 new words this week",
    targetValue: 20,
    currentValue: 12,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    type: 'weekly',
    status: 'active',
    reward: "Extra 30 minutes of screen time"
  },
  {
    id: "goal-2",
    childId: "2",
    title: "Perfect Week",
    description: "Complete learning activities 7 days in a row",
    targetValue: 7,
    currentValue: 3,
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    type: 'weekly',
    status: 'active',
    reward: "Choose family movie night film"
  }
];

const sampleNotifications: ParentNotification[] = [
  {
    id: "notif-1",
    type: 'achievement',
    title: "New Achievement Unlocked!",
    message: "Alex earned the 'Streak Master' badge for learning 5 days in a row!",
    childId: "1",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    priority: 'medium'
  },
  {
    id: "notif-2",
    type: 'goal_progress',
    title: "Goal Progress Update",
    message: "Emma is 80% complete with her weekly goal - only 2 more words to go!",
    childId: "2",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    priority: 'low'
  },
  {
    id: "notif-3",
    type: 'concern',
    title: "Learning Pattern Alert",
    message: "Alex has been struggling with spelling activities. Consider additional practice.",
    childId: "1",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
    priority: 'high'
  }
];

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  children = sampleChildren,
  sessions = [],
  onNavigateBack,
}) => {
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(children[0] || null);
  const [activeTab, setActiveTab] = useState("overview");
  const [goals, setGoals] = useState<ParentGoal[]>(sampleGoals);
  const [notifications, setNotifications] = useState<ParentNotification[]>(sampleNotifications);
  const [showAddChildDialog, setShowAddChildDialog] = useState(false);
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false);
  const [showCustomWordDialog, setShowCustomWordDialog] = useState(false);
  const [newChildData, setNewChildData] = useState({
    name: "",
    age: 6,
    avatar: "👶",
    preferredLearningTime: "",
    difficultyPreference: "easy" as const,
  });
  const [newGoalData, setNewGoalData] = useState({
    title: "",
    description: "",
    targetValue: 10,
    type: 'weekly' as const,
    reward: "",
    deadline: ""
  });
  const [customWordInput, setCustomWordInput] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'progress'>('detailed');
  const [reportDateRange, setReportDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const highPriorityNotifications = notifications.filter(n => n.priority === 'high' && !n.read).length;

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const calculateWeeklyStats = (childId: string) => {
    return {
      totalTime: 45,
      averageAccuracy: 87,
      sessionsCount: 8,
    };
  };

  const getChildGoals = (childId: string) => {
    return goals.filter(goal => goal.childId === childId);
  };

  const getChildNotifications = (childId: string) => {
    return notifications.filter(notif => notif.childId === childId).slice(0, 3);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const addCustomWord = () => {
    if (selectedChild && customWordInput.trim()) {
      // In a real app, this would update the backend
      const updatedChild = {
        ...selectedChild,
        customWords: [...selectedChild.customWords, customWordInput.trim()]
      };
      setSelectedChild(updatedChild);
      setCustomWordInput("");
      setShowCustomWordDialog(false);
    }
  };

  const removeCustomWord = (word: string) => {
    if (selectedChild) {
      const updatedChild = {
        ...selectedChild,
        customWords: selectedChild.customWords.filter(w => w !== word)
      };
      setSelectedChild(updatedChild);
    }
  };

  const createGoal = () => {
    if (selectedChild && newGoalData.title && newGoalData.description) {
      const newGoal: ParentGoal = {
        id: `goal-${Date.now()}`,
        childId: selectedChild.id,
        title: newGoalData.title,
        description: newGoalData.description,
        targetValue: newGoalData.targetValue,
        currentValue: 0,
        deadline: new Date(newGoalData.deadline),
        type: newGoalData.type,
        status: 'active',
        reward: newGoalData.reward
      };
      setGoals(prev => [...prev, newGoal]);
      setNewGoalData({
        title: "",
        description: "",
        targetValue: 10,
        type: 'weekly',
        reward: "",
        deadline: ""
      });
      setShowAddGoalDialog(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <Card className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Good Morning! 👋</h3>
              <p className="text-sm text-slate-600">
                {children.length} active learner{children.length !== 1 ? 's' : ''} • 
                {unreadNotifications} new notification{unreadNotifications !== 1 ? 's' : ''}
                {highPriorityNotifications > 0 && (
                  <span className="ml-2 text-red-600 font-medium">
                    {highPriorityNotifications} urgent
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowAddChildDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Child
              </Button>
              <Button size="sm" className="bg-educational-blue">
                <Download className="w-4 h-4 mr-2" />
                Weekly Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <AnimatedCounter
                  value={children.reduce((sum, child) => sum + child.wordsLearned, 0)}
                />
              </div>
              <p className="text-sm text-slate-600">Total Words Learned</p>
            </div>
            <div className="text-center p-4 bg-educational-orange/5 rounded-lg">
              <div className="text-2xl font-bold text-educational-orange">
                <AnimatedCounter
                  value={children.reduce((sum, child) => sum + child.totalPoints, 0)}
                />
              </div>
              <p className="text-sm text-slate-600">Total Points Earned</p>
            </div>
            <div className="text-center p-4 bg-educational-purple/5 rounded-lg">
              <div className="text-2xl font-bold text-educational-purple">
                <AnimatedCounter
                  value={Math.max(...children.map((child) => child.currentStreak))}
                />
              </div>
              <p className="text-sm text-slate-600">Longest Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children Cards with Enhanced Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children.map((child) => {
          const weeklyStats = calculateWeeklyStats(child.id);
          const progressPercentage = (child.weeklyProgress / child.weeklyGoal) * 100;
          const childGoals = getChildGoals(child.id);
          const activeGoals = childGoals.filter(g => g.status === 'active');
          const childNotifications = getChildNotifications(child.id);

          return (
            <Card
              key={child.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-educational-blue"
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
                      <Badge variant="outline" className="text-xs mt-1">
                        {child.preferredLearningTime}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {getTimeAgo(child.lastActive)}
                    </Badge>
                    <p className="text-xs text-slate-500">Last active</p>
                    {activeGoals.length > 0 && (
                      <Badge className="bg-educational-purple text-white text-xs mt-1">
                        {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
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
                  <p className="text-xs text-slate-500 mt-1">
                    {Math.round(progressPercentage)}% complete
                  </p>
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

                {/* Recent Notifications */}
                {childNotifications.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-4 h-4 text-educational-blue" />
                      <span className="text-sm font-medium">Recent Updates</span>
                    </div>
                    {childNotifications.slice(0, 1).map(notif => (
                      <div key={notif.id} className="text-sm text-slate-600">
                        {notif.message}
                      </div>
                    ))}
                    {childNotifications.length > 1 && (
                      <p className="text-xs text-slate-500 mt-1">
                        +{childNotifications.length - 1} more update{childNotifications.length - 1 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}

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

  const renderGoalsManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goal Management</h2>
          <p className="text-slate-600">Set and track learning objectives for your children</p>
        </div>
        <Button onClick={() => setShowAddGoalDialog(true)} className="bg-educational-blue">
          <Plus className="w-4 h-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Goals by Child */}
      {children.map(child => {
        const childGoals = getChildGoals(child.id);
        if (childGoals.length === 0) return null;

        return (
          <Card key={child.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-2xl">{child.avatar}</span>
                {child.name}'s Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {childGoals.map(goal => {
                  const progressPercentage = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                  const isCompleted = goal.status === 'completed';
                  const isOverdue = new Date() > goal.deadline && !isCompleted;

                  return (
                    <div key={goal.id} className={`p-4 rounded-lg border ${
                      isCompleted ? 'bg-green-50 border-green-200' :
                      isOverdue ? 'bg-red-50 border-red-200' :
                      'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{goal.title}</h4>
                          <p className="text-sm text-slate-600">{goal.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            isCompleted ? 'bg-green-500' :
                            isOverdue ? 'bg-red-500' :
                            'bg-educational-blue'
                          }>
                            {goal.status}
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">
                            Due: {goal.deadline.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{goal.currentValue}/{goal.targetValue}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>

                      {goal.reward && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Star className="w-4 h-4 text-yellow-500" />
                          Reward: {goal.reward}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderCustomWords = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Vocabulary</h2>
          <p className="text-slate-600">Add personalized words for your children's learning</p>
        </div>
        <Button onClick={() => setShowCustomWordDialog(true)} className="bg-educational-green">
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Word
        </Button>
      </div>

      {selectedChild && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-2xl">{selectedChild.avatar}</span>
              {selectedChild.name}'s Custom Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedChild.customWords.length === 0 ? (
              <div className="text-center p-8">
                <BookMarked className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Custom Words Yet</h3>
                <p className="text-slate-600 mb-4">
                  Add words that are meaningful to your child's interests and experiences
                </p>
                <Button onClick={() => setShowCustomWordDialog(true)} className="bg-educational-green">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Word
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedChild.customWords.map((word, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium">{word}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCustomWord(word)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDetailedAnalytics = () => (
    selectedChild && (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Detailed Analytics</h2>
            <p className="text-slate-600">In-depth insights for {selectedChild.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Email Summary
            </Button>
          </div>
        </div>

        {/* Learning Strengths & Areas for Improvement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Zap className="w-5 h-5" />
                Learning Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedChild.learningStrengths.map((strength, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Target className="w-5 h-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedChild.areasForImprovement.map((area, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4 text-orange-500 rotate-45" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Parent Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Parent Notes & Observations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-slate-700">{selectedChild.parentNotes}</p>
            </div>
            <Button variant="outline" size="sm" className="mt-3">
              <Edit className="w-4 h-4 mr-2" />
              Edit Notes
            </Button>
          </CardContent>
        </Card>

        {/* Motivational Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Motivational Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {selectedChild.motivationalRewards.map((reward, index) => (
                <div key={index} className="p-3 bg-yellow-50 rounded-lg text-center">
                  <span className="font-medium">{reward}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications & Alerts</h2>
          <p className="text-slate-600">
            Stay informed about your children's learning progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Notification Settings
          </Button>
          <Button variant="outline" size="sm">
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map(notification => (
          <Card key={notification.id} className={`cursor-pointer transition-all ${
            !notification.read ? 'border-l-4 border-l-educational-blue bg-blue-50/30' : ''
          }`} onClick={() => markNotificationAsRead(notification.id)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    notification.type === 'achievement' ? 'bg-yellow-100 text-yellow-600' :
                    notification.type === 'goal_progress' ? 'bg-blue-100 text-blue-600' :
                    notification.type === 'concern' ? 'bg-red-100 text-red-600' :
                    notification.type === 'milestone' ? 'bg-green-100 text-green-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {notification.type === 'achievement' && <Award className="w-4 h-4" />}
                    {notification.type === 'goal_progress' && <Target className="w-4 h-4" />}
                    {notification.type === 'concern' && <BellRing className="w-4 h-4" />}
                    {notification.type === 'milestone' && <Star className="w-4 h-4" />}
                    {notification.type === 'reminder' && <Bell className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-semibold">{notification.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {children.find(c => c.id === notification.childId)?.name}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {getTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    notification.priority === 'high' ? 'bg-red-500' :
                    notification.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-slate-500'
                  }>
                    {notification.priority}
                  </Badge>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-educational-blue rounded-full"></div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Helper function to generate comprehensive learning report
  const generateLearningReport = async (child: ChildProfile, dateRange: string, reportType: string) => {
    setGeneratingReport(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const now = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Generate detailed learning analytics
    const report = {
      generatedAt: now,
      period: { start: startDate, end: now, range: dateRange },
      child: child,
      summary: {
        totalLearningTime: Math.floor(Math.random() * 120) + 60, // 60-180 minutes
        sessionsCompleted: Math.floor(Math.random() * 30) + 15,
        wordsLearned: Math.floor(Math.random() * 50) + 25,
        averageAccuracy: Math.floor(Math.random() * 20) + 75, // 75-95%
        streakDays: Math.floor(Math.random() * 15) + 5,
        levelUps: Math.floor(Math.random() * 3) + 1,
      },
      learningPath: {
        strengthCategories: ['Animals', 'Science', 'Colors'],
        strugglingCategories: ['Food', 'Transportation'],
        masteredWords: ['elephant', 'microscope', 'rainbow', 'volcano', 'constellation'],
        practiceNeeded: ['helicopter', 'restaurant', 'apartment', 'orchestra'],
        recommendedActivities: [
          'Focus on transportation vocabulary through picture matching',
          'Practice food words using cooking-themed games',
          'Reinforce helicopter/orchestra pronunciation with audio exercises'
        ]
      },
      progressAnalytics: {
        weeklyTrends: [
          { week: 'Week 1', accuracy: 78, wordsLearned: 12, timeSpent: 145 },
          { week: 'Week 2', accuracy: 82, wordsLearned: 15, timeSpent: 160 },
          { week: 'Week 3', accuracy: 85, wordsLearned: 18, timeSpent: 175 },
          { week: 'Week 4', accuracy: 88, wordsLearned: 22, timeSpent: 190 }
        ],
        categoryProgress: [
          { category: 'Animals', mastery: 92, timeSpent: 45, trend: 'improving' },
          { category: 'Science', mastery: 87, timeSpent: 38, trend: 'stable' },
          { category: 'Colors', mastery: 95, timeSpent: 25, trend: 'mastered' },
          { category: 'Food', mastery: 65, timeSpent: 42, trend: 'needs_focus' },
          { category: 'Transportation', mastery: 58, timeSpent: 35, trend: 'challenging' }
        ]
      },
      achievements: [
        { title: 'Vocabulary Star', description: 'Learned 50+ new words', earnedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
        { title: 'Streak Champion', description: '10-day learning streak', earnedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
        { title: 'Animal Expert', description: 'Mastered all animal words', earnedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      ],
      parentInsights: {
        keyStrengths: [
          'Excellent visual memory - retains information well through pictures',
          'High engagement with interactive content',
          'Consistent daily practice habits'
        ],
        areasForGrowth: [
          'Spelling accuracy could improve with more writing practice',
          'Pronunciation of complex words needs attention',
          'Speed of word recognition in timed activities'
        ],
        recommendations: [
          'Introduce spelling games to reinforce visual learning',
          'Use audio repetition for difficult pronunciations',
          'Gradually increase difficulty in timed exercises',
          'Celebrate transportation vocabulary progress to boost confidence'
        ]
      }
    };

    setReportData(report);
    setGeneratingReport(false);
    return report;
  };

  // Export report as PDF-like content
  const exportReport = () => {
    if (!reportData) return;

    const reportContent = `
LEARNING PROGRESS REPORT
========================

Child: ${reportData.child.name}
Age: ${reportData.child.age}
Report Period: ${reportData.period.range.toUpperCase()} (${reportData.period.start.toLocaleDateString()} - ${reportData.period.end.toLocaleDateString()})
Generated: ${reportData.generatedAt.toLocaleDateString()}

SUMMARY
-------
Total Learning Time: ${reportData.summary.totalLearningTime} minutes
Sessions Completed: ${reportData.summary.sessionsCompleted}
Words Learned: ${reportData.summary.wordsLearned}
Average Accuracy: ${reportData.summary.averageAccuracy}%
Current Streak: ${reportData.summary.streakDays} days
Level Progress: +${reportData.summary.levelUps} levels

LEARNING PATH ANALYSIS
----------------------
Strong Categories: ${reportData.learningPath.strengthCategories.join(', ')}
Needs Practice: ${reportData.learningPath.strugglingCategories.join(', ')}

Mastered Words: ${reportData.learningPath.masteredWords.join(', ')}
Practice Needed: ${reportData.learningPath.practiceNeeded.join(', ')}

RECOMMENDATIONS
---------------
${reportData.learningPath.recommendedActivities.map((activity, i) => `${i + 1}. ${activity}`).join('\n')}

PARENT INSIGHTS
---------------
Key Strengths:
${reportData.parentInsights.keyStrengths.map((strength, i) => `• ${strength}`).join('\n')}

Areas for Growth:
${reportData.parentInsights.areasForGrowth.map((area, i) => `• ${area}`).join('\n')}

Recommendations:
${reportData.parentInsights.recommendations.map((rec, i) => `• ${rec}`).join('\n')}

ACHIEVEMENTS
------------
${reportData.achievements.map(achievement => `🏆 ${achievement.title}: ${achievement.description} (${achievement.earnedAt.toLocaleDateString()})`).join('\n')}
`;

    // Create downloadable file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.child.name}_Learning_Report_${reportData.period.range}_${reportData.generatedAt.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderDetailedReports = () => (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Learning Progress Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="report-child">Select Child</Label>
              <Select
                value={selectedChild?.id || ''}
                onValueChange={(value) => setSelectedChild(children.find(c => c.id === value) || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose child" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.avatar} {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Quick Summary</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                  <SelectItem value="progress">Progress Tracking</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-range">Time Period</Label>
              <Select value={reportDateRange} onValueChange={(value: any) => setReportDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last 3 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => selectedChild && generateLearningReport(selectedChild, reportDateRange, reportType)}
              disabled={!selectedChild || generatingReport}
              className="bg-educational-blue text-white"
            >
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </Button>

            {reportData && (
              <Button variant="outline" onClick={exportReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Report Display */}
      {reportData && (
        <div className="space-y-6">
          {/* Report Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{reportData.child.avatar}</div>
                  <div>
                    <h3>{reportData.child.name}'s Learning Report</h3>
                    <p className="text-sm text-slate-600 font-normal">
                      {reportData.period.range.toUpperCase()} Report • {reportData.period.start.toLocaleDateString()} - {reportData.period.end.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Generated {reportData.generatedAt.toLocaleDateString()}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{reportData.summary.totalLearningTime}m</div>
                <div className="text-sm text-slate-600">Learning Time</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{reportData.summary.wordsLearned}</div>
                <div className="text-sm text-slate-600">Words Learned</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{reportData.summary.averageAccuracy}%</div>
                <div className="text-sm text-slate-600">Accuracy</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{reportData.summary.streakDays}</div>
                <div className="text-sm text-slate-600">Day Streak</div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Path Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Strengths & Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Strong Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {reportData.learningPath.strengthCategories.map((category: string) => (
                      <Badge key={category} className="bg-green-100 text-green-800">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Mastered Words</h4>
                  <div className="flex flex-wrap gap-2">
                    {reportData.learningPath.masteredWords.map((word: string) => (
                      <Badge key={word} variant="outline" className="text-green-600 border-green-300">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-orange-500" />
                  Areas for Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Practice Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {reportData.learningPath.strugglingCategories.map((category: string) => (
                      <Badge key={category} className="bg-orange-100 text-orange-800">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Words to Practice</h4>
                  <div className="flex flex-wrap gap-2">
                    {reportData.learningPath.practiceNeeded.map((word: string) => (
                      <Badge key={word} variant="outline" className="text-orange-600 border-orange-300">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Category Mastery Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.progressAnalytics.categoryProgress.map((category: any) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{category.mastery}%</span>
                        <Badge className={
                          category.trend === 'improving' ? 'bg-green-100 text-green-800' :
                          category.trend === 'stable' ? 'bg-blue-100 text-blue-800' :
                          category.trend === 'mastered' ? 'bg-purple-100 text-purple-800' :
                          'bg-orange-100 text-orange-800'
                        }>
                          {category.trend.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={category.mastery} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parent Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Parent Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Key Strengths
                </h4>
                <ul className="space-y-1">
                  {reportData.parentInsights.keyStrengths.map((strength: string, index: number) => (
                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Growth Opportunities
                </h4>
                <ul className="space-y-1">
                  {reportData.parentInsights.areasForGrowth.map((area: string, index: number) => (
                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                      <Target className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-500" />
                  Recommended Actions
                </h4>
                <ul className="space-y-1">
                  {reportData.parentInsights.recommendations.map((recommendation: string, index: number) => (
                    <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportData.achievements.map((achievement: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      <p className="text-xs text-slate-600">{achievement.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{achievement.earnedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !generatingReport && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-slate-600">No Report Generated</h3>
            <p className="text-slate-500 mb-4">
              Select a child and click "Generate Report" to create a detailed learning analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onNavigateBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Main
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Parent Dashboard</h1>
            <p className="text-slate-600">Comprehensive learning management for your family</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="relative"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[20px] h-5">
                {unreadNotifications}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="custom-words" className="flex items-center gap-2">
            <BookMarked className="w-4 h-4" />
            Custom Words
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alerts
            {unreadNotifications > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-1 ml-1">
                {unreadNotifications}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverview()}</TabsContent>
        <TabsContent value="goals">{renderGoalsManagement()}</TabsContent>
        <TabsContent value="custom-words">{renderCustomWords()}</TabsContent>
        <TabsContent value="analytics">{renderDetailedAnalytics()}</TabsContent>
        <TabsContent value="notifications">{renderNotifications()}</TabsContent>
        <TabsContent value="reports">{renderDetailedReports()}</TabsContent>
      </Tabs>

      {/* Add Child Dialog */}
      <Dialog open={showAddChildDialog} onOpenChange={setShowAddChildDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Child Profile</DialogTitle>
            <DialogDescription>
              Create a learning profile for your child
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="childName">Name</Label>
              <Input
                id="childName"
                value={newChildData.name}
                onChange={(e) => setNewChildData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter child's name"
              />
            </div>
            <div>
              <Label htmlFor="childAge">Age</Label>
              <Select value={newChildData.age.toString()} onValueChange={(value) => 
                setNewChildData(prev => ({ ...prev, age: parseInt(value) }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(age => (
                    <SelectItem key={age} value={age.toString()}>{age} years old</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="avatar">Avatar</Label>
              <div className="flex gap-2 mt-2">
                {['👦', '👧', '🧒', '👶', '🦸‍♂️', '🦸‍♀️', '🧑‍🎓', '👨‍🎓', '👩‍🎓'].map(emoji => (
                  <Button
                    key={emoji}
                    variant={newChildData.avatar === emoji ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewChildData(prev => ({ ...prev, avatar: emoji }))}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddChildDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // In a real app, this would create the child profile
                setShowAddChildDialog(false);
                setNewChildData({ name: "", age: 6, avatar: "👶", preferredLearningTime: "", difficultyPreference: "easy" });
              }}
              className="bg-educational-blue"
            >
              Create Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={showAddGoalDialog} onOpenChange={setShowAddGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Learning Goal</DialogTitle>
            <DialogDescription>
              Set a new learning objective for {selectedChild?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goalTitle">Goal Title</Label>
              <Input
                id="goalTitle"
                value={newGoalData.title}
                onChange={(e) => setNewGoalData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Weekly Word Challenge"
              />
            </div>
            <div>
              <Label htmlFor="goalDescription">Description</Label>
              <Textarea
                id="goalDescription"
                value={newGoalData.description}
                onChange={(e) => setNewGoalData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the goal..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetValue">Target Value</Label>
                <Input
                  id="targetValue"
                  type="number"
                  value={newGoalData.targetValue}
                  onChange={(e) => setNewGoalData(prev => ({ ...prev, targetValue: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="goalType">Goal Type</Label>
                <Select value={newGoalData.type} onValueChange={(value: any) => 
                  setNewGoalData(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="reward">Reward</Label>
              <Input
                id="reward"
                value={newGoalData.reward}
                onChange={(e) => setNewGoalData(prev => ({ ...prev, reward: e.target.value }))}
                placeholder="What reward will they earn?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGoalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createGoal} className="bg-educational-blue">
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Word Dialog */}
      <Dialog open={showCustomWordDialog} onOpenChange={setShowCustomWordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Word</DialogTitle>
            <DialogDescription>
              Add a personalized word for {selectedChild?.name}'s vocabulary
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customWord">Word</Label>
              <Input
                id="customWord"
                value={customWordInput}
                onChange={(e) => setCustomWordInput(e.target.value)}
                placeholder="Enter a custom word..."
              />
            </div>
            <div className="text-sm text-slate-600">
              <Lightbulb className="w-4 h-4 inline mr-2" />
              Ideas: Family names, pet names, favorite places, hobby terms, school subjects
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomWordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addCustomWord} className="bg-educational-green">
              Add Word
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
