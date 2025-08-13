import React, { useState, useEffect } from "react";
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
  UserPlus,
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
  Palette,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { WordProgressAPI } from "@/lib/wordProgressApi";
import { ChildWordStats } from "@shared/api";
import { SmartWordSelector } from "@/lib/smartWordSelection";

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
  difficultyPreference: "easy" | "medium" | "hard";
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
  type: "daily" | "weekly" | "monthly";
  status: "active" | "completed" | "paused";
  reward: string;
}

interface ParentNotification {
  id: string;
  type: "achievement" | "goal_progress" | "milestone" | "reminder" | "concern";
  title: string;
  message: string;
  childId: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high";
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
    difficultyPreference: "medium",
    parentNotes:
      "Loves animal facts. Struggles with spelling but excels at comprehension.",
    customWords: [
      "dinosaur",
      "paleontologist",
      "prehistoric",
      "excavation",
      "tyrannosaurus",
      "archeologist",
      "fossil",
      "museum",
      "discovery",
    ],
    weeklyTarget: 20,
    monthlyTarget: 80,
    learningStrengths: [
      "Visual Learning",
      "Pattern Recognition",
      "Memory Games",
    ],
    areasForImprovement: [
      "Spelling Accuracy",
      "Reading Speed",
      "Pronunciation",
    ],
    motivationalRewards: [
      "Extra playtime",
      "Choose weekend activity",
      "New book",
    ],
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
    difficultyPreference: "easy",
    parentNotes:
      "Very enthusiastic learner. Loves nature and outdoor activities.",
    customWords: [
      "butterfly",
      "flowers",
      "garden",
      "rainbow",
      "sunshine",
      "petals",
      "pollination",
      "caterpillar",
      "meadow",
      "blossom",
      "nature",
    ],
    weeklyTarget: 15,
    monthlyTarget: 60,
    learningStrengths: [
      "Curiosity",
      "Attention to Detail",
      "Creative Thinking",
    ],
    areasForImprovement: [
      "Focus Duration",
      "Following Instructions",
      "Letter Formation",
    ],
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
    description:
      "Learn 20 new words this week through various games and activities",
    targetValue: 20,
    currentValue: 12,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    type: "weekly",
    status: "active",
    reward: "Extra 30 minutes of screen time",
  },
  {
    id: "goal-2",
    childId: "2",
    title: "Perfect Week",
    description: "Complete learning activities 7 days in a row",
    targetValue: 7,
    currentValue: 3,
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    type: "weekly",
    status: "active",
    reward: "Choose family movie night film",
  },
  {
    id: "goal-3",
    childId: "1",
    title: "Reading Champion",
    description: "Achieve 95% accuracy in reading games",
    targetValue: 95,
    currentValue: 95,
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    type: "daily",
    status: "completed",
    reward: "Special sticker collection",
  },
  {
    id: "goal-4",
    childId: "2",
    title: "Spelling Bee Prep",
    description: "Master 50 spelling words for the school spelling bee",
    targetValue: 50,
    currentValue: 15,
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    type: "monthly",
    status: "active",
    reward: "New book of choice",
  },
  {
    id: "goal-5",
    childId: "1",
    title: "Adventure Completion",
    description: "Complete the Ocean Adventure learning path",
    targetValue: 10,
    currentValue: 3,
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    type: "weekly",
    status: "active",
    reward: "Family trip to aquarium",
  },
];

const sampleNotifications: ParentNotification[] = [
  {
    id: "notif-1",
    type: "achievement",
    title: "Achievement Unlocked!",
    message: "Alex earned 'Streak Master' badge! 5 days in a row.",
    childId: "1",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    priority: "medium",
  },
  {
    id: "notif-2",
    type: "goal_progress",
    title: "Goal Update",
    message: "Emma 80% complete! Only 2 words to go.",
    childId: "2",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    priority: "low",
  },
  {
    id: "notif-3",
    type: "concern",
    title: "Practice Alert",
    message: "Alex struggling with spelling. Needs practice.",
    childId: "1",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
    priority: "high",
  },
];

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  children: propChildren,
  sessions = [],
  onNavigateBack,
}) => {
  // Load children from localStorage or use empty array
  const [children, setChildren] = useState<ChildProfile[]>(() => {
    const savedChildren = localStorage.getItem("parentDashboardChildren");
    if (savedChildren) {
      const parsed = JSON.parse(savedChildren);
      // Convert date strings back to Date objects
      return parsed.map((child: any) => ({
        ...child,
        lastActive: new Date(child.lastActive),
        recentAchievements:
          child.recentAchievements?.map((achievement: any) => ({
            ...achievement,
            earnedAt: new Date(achievement.earnedAt),
          })) || [],
      }));
    }
    return [];
  });

  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(
    children[0] || null,
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [goals, setGoals] = useState<ParentGoal[]>(sampleGoals);
  const [notifications, setNotifications] =
    useState<ParentNotification[]>(sampleNotifications);
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
    type: "weekly" as const,
    reward: "",
    deadline: "",
  });
  const [customWordInput, setCustomWordInput] = useState("");
  const [childrenWordStats, setChildrenWordStats] = useState<
    Record<string, ChildWordStats>
  >({});
  const [loadingWordStats, setLoadingWordStats] = useState(false);
  const [practiceWords, setPracticeWords] = useState<
    Array<{
      word: string;
      category: string;
      accuracy: number;
      timesReviewed: number;
    }>
  >([]);
  const [topWords, setTopWords] = useState<
    Array<{
      word: string;
      category: string;
      accuracy: number;
      timesReviewed: number;
    }>
  >([]);

  // Save children to localStorage whenever children state changes
  useEffect(() => {
    localStorage.setItem("parentDashboardChildren", JSON.stringify(children));
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
    }
  }, [children, selectedChild]);

  // Load children's word progress data
  useEffect(() => {
    const loadChildrenWordStats = async () => {
      if (children.length === 0) return;

      setLoadingWordStats(true);
      try {
        const response = await WordProgressAPI.getAllChildrenProgress();
        if (response.success) {
          setChildrenWordStats(response.childrenStats);
        }

        // Load detailed stats for selected child
        if (selectedChild) {
          try {
            const childStatsResponse = await WordProgressAPI.getChildStats(
              selectedChild.id,
            );
            if (childStatsResponse.success) {
              setPracticeWords(childStatsResponse.strugglingWords || []);
              setTopWords(childStatsResponse.topWords || []);
            }
          } catch (error) {
            console.error("Failed to load child detailed stats:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load children word stats:", error);
      } finally {
        setLoadingWordStats(false);
      }
    };

    loadChildrenWordStats();

    // Set up real-time refresh every 30 seconds for active sessions
    const refreshInterval = setInterval(() => {
      loadChildrenWordStats();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [children.length, selectedChild]);

  // Load detailed stats when selected child changes
  useEffect(() => {
    const loadSelectedChildStats = async () => {
      if (!selectedChild) return;

      try {
        const response = await WordProgressAPI.getChildStats(selectedChild.id);
        if (response.success) {
          setPracticeWords(response.strugglingWords || []);
          setTopWords(response.topWords || []);
        }
      } catch (error) {
        console.error("Failed to load selected child stats:", error);
        // Set fallback data for demo
        setPracticeWords([
          {
            word: "helicopter",
            category: "Transportation",
            accuracy: 45,
            timesReviewed: 3,
          },
          {
            word: "encyclopedia",
            category: "Education",
            accuracy: 30,
            timesReviewed: 2,
          },
          {
            word: "microscope",
            category: "Science",
            accuracy: 55,
            timesReviewed: 4,
          },
        ]);
        setTopWords([
          {
            word: "rainbow",
            category: "Nature",
            accuracy: 95,
            timesReviewed: 5,
          },
          {
            word: "butterfly",
            category: "Animals",
            accuracy: 90,
            timesReviewed: 3,
          },
          {
            word: "elephant",
            category: "Animals",
            accuracy: 85,
            timesReviewed: 4,
          },
        ]);
      }
    };

    loadSelectedChildStats();
  }, [selectedChild]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportType, setReportType] = useState<
    "summary" | "detailed" | "progress"
  >("detailed");
  const [reportDateRange, setReportDateRange] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const highPriorityNotifications = notifications.filter(
    (n) => n.priority === "high" && !n.read,
  ).length;

  const getTimeAgo = (date: Date | string) => {
    // Ensure we have a valid Date object
    const dateObj = date instanceof Date ? date : new Date(date);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Unknown";
    }

    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60),
    );
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
    return goals.filter((goal) => goal.childId === childId);
  };

  const getChildNotifications = (childId: string) => {
    return notifications
      .filter((notif) => notif.childId === childId)
      .slice(0, 3);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );
  };

  const addCustomWord = () => {
    if (selectedChild && customWordInput.trim()) {
      // In a real app, this would update the backend
      const updatedChild = {
        ...selectedChild,
        customWords: [...selectedChild.customWords, customWordInput.trim()],
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
        customWords: selectedChild.customWords.filter((w) => w !== word),
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
        status: "active",
        reward: newGoalData.reward,
      };
      setGoals((prev) => [...prev, newGoal]);
      setNewGoalData({
        title: "",
        description: "",
        targetValue: 10,
        type: "weekly",
        reward: "",
        deadline: "",
      });
      setShowAddGoalDialog(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Section - Combined Layout */}
      {children.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Good Morning Section */}
          <Card className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10">
            <CardContent className="p-3 md:p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-base md:text-lg">
                  Good Morning! 👋
                </h3>
                <p className="text-xs md:text-sm text-slate-600">
                  {children.length} active learner
                  {children.length !== 1 ? "s" : ""} •{unreadNotifications} new
                  notification{unreadNotifications !== 1 ? "s" : ""}
                  {highPriorityNotifications > 0 && (
                    <span className="ml-2 text-red-600 font-medium">
                      {highPriorityNotifications} urgent
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* No Children Section */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="text-3xl md:text-4xl mb-2">👶</div>
              <h3 className="text-sm md:text-base font-semibold mb-1">
                No Children Added Yet
              </h3>
              <p className="text-gray-600 mb-3 text-xs md:text-sm">
                Add your first child to start tracking their learning progress
              </p>
              <Button
                onClick={() => setShowAddChildDialog(true)}
                className="bg-educational-blue text-xs md:text-sm w-full"
                size="sm"
              >
                <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Add Your First Child</span>
                <span className="md:hidden">Add Child</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
              <div>
                <h3 className="font-semibold text-base md:text-lg">
                  Good Morning! 👋
                </h3>
                <p className="text-xs md:text-sm text-slate-600">
                  {children.length} active learner
                  {children.length !== 1 ? "s" : ""} •{unreadNotifications} new
                  notification{unreadNotifications !== 1 ? "s" : ""}
                  {highPriorityNotifications > 0 && (
                    <span className="ml-2 text-red-600 font-medium">
                      {highPriorityNotifications} urgent
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddChildDialog(true)}
                  className="text-xs md:text-sm px-2 md:px-3"
                >
                  <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Add Child</span>
                  <span className="md:hidden">Add</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Summary - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-educational-blue" />
            <span className="hidden md:inline">Family Learning Summary</span>
            <span className="md:hidden">Family Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div className="text-center p-2 md:p-4 bg-educational-blue/5 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-educational-blue">
                <AnimatedCounter value={children.length} />
              </div>
              <p className="text-xs md:text-sm text-slate-600">
                Active Learners
              </p>
            </div>
            <div className="text-center p-2 md:p-4 bg-educational-green/5 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-educational-green">
                <AnimatedCounter
                  value={children.reduce(
                    (sum, child) => sum + child.wordsLearned,
                    0,
                  )}
                />
              </div>
              <p className="text-xs md:text-sm text-slate-600">
                Total Words Learned
              </p>
            </div>
            <div className="text-center p-2 md:p-4 bg-educational-orange/5 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-educational-orange">
                <AnimatedCounter
                  value={children.reduce(
                    (sum, child) => sum + child.totalPoints,
                    0,
                  )}
                />
              </div>
              <p className="text-xs md:text-sm text-slate-600">
                Total Points Earned
              </p>
            </div>
            <div className="text-center p-2 md:p-4 bg-educational-purple/5 rounded-lg">
              <div className="text-xl md:text-2xl font-bold text-educational-purple">
                <AnimatedCounter
                  value={Math.max(
                    ...children.map((child) => child.currentStreak),
                  )}
                />
              </div>
              <p className="text-xs md:text-sm text-slate-600">
                Longest Streak
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Mobile Optimized */}
      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Zap className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <Button
              onClick={() => setActiveTab("analytics")}
              variant="outline"
              className="h-16 md:h-20 flex flex-col items-center gap-1 md:gap-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 relative text-xs md:text-sm"
            >
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
              <div className="text-center">
                <div className="font-semibold text-orange-700">
                  Practice Words
                </div>
                <div className="text-xs text-orange-600 hidden md:block">
                  View words that need help
                </div>
                <div className="text-xs text-orange-600 md:hidden">
                  Need help
                </div>
              </div>
              {children.length > 0 &&
                Object.values(childrenWordStats).some(
                  (stats) => stats.wordsNeedingPractice > 0,
                ) && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2">
                    {Object.values(childrenWordStats).reduce(
                      (total, stats) =>
                        total + (stats.wordsNeedingPractice || 0),
                      0,
                    )}
                  </Badge>
                )}
            </Button>

            <Button
              onClick={() => setActiveTab("analytics")}
              variant="outline"
              className="h-16 md:h-20 flex flex-col items-center gap-1 md:gap-2 border-green-200 hover:border-green-300 hover:bg-green-50 text-xs md:text-sm"
            >
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
              <div className="text-center">
                <div className="font-semibold text-green-700">
                  Mastered Words
                </div>
                <div className="text-xs text-green-600 hidden md:block">
                  See progress & achievements
                </div>
                <div className="text-xs text-green-600 md:hidden">Progress</div>
              </div>
            </Button>

            <Button
              onClick={() => setActiveTab("goals")}
              variant="outline"
              className="h-16 md:h-20 flex flex-col items-center gap-1 md:gap-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-xs md:text-sm"
            >
              <Target className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              <div className="text-center">
                <div className="font-semibold text-blue-700">Set Goals</div>
                <div className="text-xs text-blue-600 hidden md:block">
                  Create learning objectives
                </div>
                <div className="text-xs text-blue-600 md:hidden">
                  Objectives
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Children Cards with Enhanced Information - Mobile Optimized */}
      {children.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
          {children.map((child) => {
            const weeklyStats = calculateWeeklyStats(child.id);
            const progressPercentage =
              (child.weeklyProgress / child.weeklyGoal) * 100;
            const childGoals = getChildGoals(child.id);
            const activeGoals = childGoals.filter((g) => g.status === "active");
            const childNotifications = getChildNotifications(child.id);

            return (
              <Card
                key={child.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 md:hover:scale-[1.02] border-l-4 border-l-educational-blue"
                onClick={() => setSelectedChild(child)}
              >
                <CardHeader className="pb-3 md:pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="text-3xl md:text-4xl">{child.avatar}</div>
                      <div>
                        <CardTitle className="text-lg md:text-xl">
                          {child.name}
                        </CardTitle>
                        <p className="text-xs md:text-sm text-slate-600">
                          {child.age} years old • Level {child.level}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {child.preferredLearningTime}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1 text-xs px-1">
                        {getTimeAgo(child.lastActive)}
                      </Badge>
                      <p className="text-xs text-slate-500 hidden md:block">
                        Last active
                      </p>
                      <p className="text-xs text-slate-500 md:hidden">Last</p>
                      {activeGoals.length > 0 && (
                        <Badge className="bg-educational-purple text-white text-xs mt-1 px-1">
                          {activeGoals.length} goal
                          {activeGoals.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 px-3 md:px-6">
                  {/* Weekly Goal Progress - Mobile Optimized */}
                  <div>
                    <div className="flex justify-between text-xs md:text-sm mb-2">
                      <span>Weekly Goal</span>
                      <span>
                        {child.weeklyProgress}/{child.weeklyGoal} words
                      </span>
                    </div>
                    <Progress
                      value={progressPercentage}
                      className="h-1.5 md:h-2"
                    />
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
                        <span className="text-sm font-medium">
                          Recent Updates
                        </span>
                      </div>
                      {childNotifications.slice(0, 1).map((notif) => (
                        <div key={notif.id} className="text-sm text-slate-600">
                          {notif.message}
                        </div>
                      ))}
                      {childNotifications.length > 1 && (
                        <p className="text-xs text-slate-500 mt-1">
                          +{childNotifications.length - 1} more update
                          {childNotifications.length - 1 !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Recent Achievement */}
                  {child.recentAchievements.length > 0 && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {child.recentAchievements[0].icon}
                        </span>
                        <div>
                          <p className="font-medium text-sm">
                            {child.recentAchievements[0].title}
                          </p>
                          <p className="text-xs text-slate-600">
                            {getTimeAgo(child.recentAchievements[0].earnedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Word Progress Summary */}
                  {childrenWordStats[child.id] && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-sm">
                          Word Progress
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600">Remembered:</span>
                          </div>
                          <span className="font-semibold text-green-600">
                            {childrenWordStats[child.id].wordsRemembered}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-gray-600">Practice:</span>
                          </div>
                          <span className="font-semibold text-orange-600">
                            {childrenWordStats[child.id].wordsNeedingPractice}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">Accuracy</span>
                          <span className="font-semibold">
                            {childrenWordStats[child.id].averageAccuracy}%
                          </span>
                        </div>
                        <Progress
                          value={childrenWordStats[child.id].averageAccuracy}
                          className="h-2"
                        />
                      </div>
                      {childrenWordStats[child.id].strongestCategories.length >
                        0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-600">
                            Strong in:{" "}
                          </span>
                          <span className="text-xs font-medium text-green-600">
                            {childrenWordStats[child.id].strongestCategories
                              .slice(0, 2)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderGoalsManagement = () => (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Mobile-optimized header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            Goal Management
          </h2>
          <p className="text-sm md:text-base text-slate-600">
            Set and track learning objectives for your children
          </p>
        </div>
        <Button
          onClick={() => setShowAddGoalDialog(true)}
          className="bg-educational-blue hover:bg-educational-blue/90 w-full md:w-auto text-sm md:text-base py-3 md:py-2"
          disabled={children.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* No goals state - enhanced for mobile */}
      {children.length === 0 ? (
        <Card className="text-center py-12 mx-auto max-w-md">
          <CardContent className="space-y-4">
            <div className="text-6xl animate-gentle-bounce">🎯</div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-700">
              No Goals Yet
            </h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Add children first to create personalized learning goals
            </p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-educational-blue/10 rounded-full text-educational-blue text-xs font-medium">
                <div className="w-2 h-2 bg-educational-blue rounded-full animate-pulse"></div>
                Get started by adding a child profile
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Goals summary card for mobile */}
          <div className="md:hidden">
            <Card className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10 border-educational-blue/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Active Goals
                    </h3>
                    <p className="text-xs text-slate-600">
                      Across all children
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-educational-blue">
                      {children.reduce(
                        (total, child) =>
                          total + getChildGoals(child.id).length,
                        0,
                      )}
                    </div>
                    <p className="text-xs text-slate-600">Total goals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Goals by Child - Mobile optimized */}
          <div className="space-y-4">
            {children.map((child) => {
              const childGoals = getChildGoals(child.id);
              const activeGoals = childGoals.filter(
                (g) => g.status === "active",
              ).length;
              const completedGoals = childGoals.filter(
                (g) => g.status === "completed",
              ).length;

              return (
                <Card key={child.id} className="overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-slate-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-base md:text-lg">
                        <span className="text-2xl md:text-3xl">
                          {child.avatar}
                        </span>
                        <div>
                          <div>{child.name}'s Goals</div>
                          <p className="text-xs md:text-sm font-normal text-slate-600">
                            {activeGoals} active • {completedGoals} completed
                          </p>
                        </div>
                      </CardTitle>
                      {childGoals.length > 0 && (
                        <div className="text-right">
                          <div className="text-lg md:text-xl font-bold text-educational-blue">
                            {Math.round(
                              (completedGoals / childGoals.length) * 100,
                            )}
                            %
                          </div>
                          <p className="text-xs text-slate-500">Complete</p>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  {childGoals.length === 0 ? (
                    <CardContent className="py-8 text-center">
                      <div className="text-3xl mb-2">📝</div>
                      <p className="text-slate-600 text-sm">No goals set yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setShowAddGoalDialog(true)}
                      >
                        Create First Goal
                      </Button>
                    </CardContent>
                  ) : (
                    <CardContent className="p-3 md:p-6">
                      <div className="space-y-3 md:space-y-4">
                        {childGoals.map((goal) => {
                          const progressPercentage = Math.min(
                            (goal.currentValue / goal.targetValue) * 100,
                            100,
                          );
                          const isCompleted = goal.status === "completed";
                          const isOverdue =
                            new Date() > goal.deadline && !isCompleted;
                          const isNearDeadline =
                            !isCompleted &&
                            !isOverdue &&
                            (goal.deadline.getTime() - new Date().getTime()) /
                              (1000 * 60 * 60 * 24) <=
                              3;

                          return (
                            <div
                              key={goal.id}
                              className={`p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${
                                isCompleted
                                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-100/50"
                                  : isOverdue
                                    ? "bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-red-100/50"
                                    : isNearDeadline
                                      ? "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 shadow-orange-100/50"
                                      : "bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200 shadow-slate-100/50"
                              } shadow-lg`}
                            >
                              {/* Mobile-first goal header */}
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-2">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-slate-800 text-sm md:text-base leading-snug">
                                        {goal.title}
                                      </h4>
                                      {goal.description && (
                                        <p className="text-xs md:text-sm text-slate-600 mt-1 line-clamp-2">
                                          {goal.description}
                                        </p>
                                      )}
                                    </div>
                                    {isCompleted && (
                                      <div className="text-green-500 animate-gentle-bounce">
                                        <CheckCircle className="w-5 h-5" />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 md:flex-col md:items-end">
                                  <Badge
                                    className={`text-xs px-2 py-1 ${
                                      isCompleted
                                        ? "bg-green-500 hover:bg-green-600 text-white"
                                        : isOverdue
                                          ? "bg-red-500 hover:bg-red-600 text-white"
                                          : isNearDeadline
                                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                                            : "bg-educational-blue hover:bg-educational-blue/90 text-white"
                                    }`}
                                  >
                                    {isCompleted
                                      ? "Completed"
                                      : isOverdue
                                        ? "Overdue"
                                        : isNearDeadline
                                          ? "Due Soon"
                                          : "Active"}
                                  </Badge>
                                  <p className="text-xs text-slate-500 whitespace-nowrap">
                                    Due: {goal.deadline.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              {/* Enhanced progress section for mobile */}
                              <div className="mb-3">
                                <div className="flex justify-between items-center text-sm mb-2">
                                  <span className="font-medium text-slate-700">
                                    Progress
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-600">
                                      {goal.currentValue}/{goal.targetValue}
                                    </span>
                                    <span className="font-semibold text-educational-blue">
                                      {Math.round(progressPercentage)}%
                                    </span>
                                  </div>
                                </div>
                                <Progress
                                  value={progressPercentage}
                                  className="h-3 md:h-2 bg-slate-200"
                                />
                              </div>

                              {/* Reward section with better mobile styling */}
                              {goal.reward && (
                                <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                  <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                  <span className="text-sm text-slate-700 font-medium">
                                    Reward: {goal.reward}
                                  </span>
                                </div>
                              )}

                              {/* Mobile action buttons */}
                              <div className="md:hidden mt-3 flex gap-2">
                                {!isCompleted && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs"
                                    onClick={() => {
                                      // Update progress logic
                                    }}
                                  >
                                    Update Progress
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="px-3"
                                >
                                  <div className="w-4 h-4">⋯</div>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Quick action buttons for mobile */}
          <div className="md:hidden fixed bottom-20 right-4 z-40">
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setShowAddGoalDialog(true)}
                className="w-14 h-14 rounded-full bg-educational-blue hover:bg-educational-blue/90 shadow-lg"
                disabled={children.length === 0}
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderCustomWords = () => (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Mobile-optimized header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            Custom Vocabulary
          </h2>
          <p className="text-sm md:text-base text-slate-600">
            Add personalized words for your children's learning
          </p>
        </div>
        <Button
          onClick={() => setShowCustomWordDialog(true)}
          className="bg-educational-green hover:bg-educational-green/90 w-full md:w-auto text-sm md:text-base py-3 md:py-2"
          disabled={!selectedChild}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Word
        </Button>
      </div>

      {/* Child selector for mobile */}
      {children.length > 1 && (
        <div className="md:hidden">
          <Card className="bg-gradient-to-r from-educational-green/10 to-educational-blue/10 border-educational-green/20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-800 mb-3">
                Select Child
              </h3>
              <div className="flex gap-2 flex-wrap">
                {children.map((child) => (
                  <Button
                    key={child.id}
                    variant={
                      selectedChild?.id === child.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedChild(child)}
                    className={`${
                      selectedChild?.id === child.id
                        ? "bg-educational-green hover:bg-educational-green/90"
                        : "hover:bg-educational-green/10 hover:text-educational-green hover:border-educational-green"
                    }`}
                  >
                    <span className="mr-2">{child.avatar}</span>
                    {child.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No child selected state */}
      {!selectedChild ? (
        <Card className="text-center py-12 mx-auto max-w-md">
          <CardContent className="space-y-4">
            <div className="text-6xl animate-gentle-bounce">📚</div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-700">
              Select a Child
            </h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Choose a child profile to manage their custom vocabulary
            </p>
            {children.length === 0 && (
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-educational-green/10 rounded-full text-educational-green text-xs font-medium">
                  <div className="w-2 h-2 bg-educational-green rounded-full animate-pulse"></div>
                  Add a child profile first
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Stats overview for mobile */}
          <div className="md:hidden">
            <Card className="bg-gradient-to-r from-educational-green/10 to-educational-purple/10 border-educational-green/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {selectedChild.name}'s Words
                    </h3>
                    <p className="text-xs text-slate-600">
                      Custom vocabulary collection
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-educational-green">
                      {selectedChild.customWords.length}
                    </div>
                    <p className="text-xs text-slate-600">Total words</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom words content */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-educational-green/5 to-educational-blue/5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-base md:text-lg">
                  <span className="text-2xl md:text-3xl">
                    {selectedChild.avatar}
                  </span>
                  <div>
                    <div>{selectedChild.name}'s Custom Words</div>
                    <p className="text-xs md:text-sm font-normal text-slate-600">
                      {selectedChild.customWords.length} words in collection
                    </p>
                  </div>
                </CardTitle>
                <div className="hidden md:block">
                  <Button
                    size="sm"
                    onClick={() => setShowCustomWordDialog(true)}
                    className="bg-educational-green hover:bg-educational-green/90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Word
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-3 md:p-6">
              {selectedChild.customWords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 animate-gentle-bounce">📖</div>
                  <h3 className="text-lg md:text-xl font-semibold mb-3 text-slate-700">
                    No Custom Words Yet
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base mb-6 leading-relaxed max-w-md mx-auto">
                    Add words that are meaningful to {selectedChild.name}'s
                    interests, family names, or everyday experiences to make
                    learning more personal
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowCustomWordDialog(true)}
                      className="bg-educational-green hover:bg-educational-green/90 w-full md:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Word
                    </Button>
                    <div className="text-xs text-slate-500">
                      Suggestions: family names, pets, favorite foods, hobbies
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quick stats bar for desktop */}
                  <div className="hidden md:flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BookMarked className="w-4 h-4 text-educational-green" />
                      <span className="text-sm font-medium">
                        {selectedChild.customWords.length} Total Words
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-educational-blue" />
                      <span className="text-sm text-slate-600">
                        Personalized Learning
                      </span>
                    </div>
                  </div>

                  {/* Enhanced word grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedChild.customWords.map((word, index) => (
                      <div
                        key={index}
                        className="group relative p-4 bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 hover:border-educational-green/30 hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-800 text-lg md:text-base capitalize">
                              {word}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Custom word #{index + 1}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeCustomWord(word)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 opacity-60 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Visual enhancement for mobile */}
                        <div className="md:hidden mt-3 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-educational-green/20 rounded-full">
                            <div className="h-1 bg-educational-green rounded-full w-full"></div>
                          </div>
                          <span className="text-xs text-educational-green font-medium">
                            Added
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bulk actions for mobile */}
                  <div className="md:hidden mt-6 p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Quick Actions
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCustomWordDialog(true)}
                        className="flex-1"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add More
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-slate-600"
                        onClick={() => {
                          // Export functionality could be added here
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggestions card for better UX */}
          {selectedChild.customWords.length < 10 && (
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">
                      Word Suggestions
                    </h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Try adding these types of words that are meaningful to{" "}
                      {selectedChild.name}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Family names",
                        "Pet names",
                        "Favorite foods",
                        "Hobbies",
                        "Places visited",
                      ].map((suggestion) => (
                        <span
                          key={suggestion}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
                        >
                          {suggestion}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Floating action button for mobile */}
      {selectedChild && (
        <div className="md:hidden fixed bottom-20 right-4 z-40">
          <Button
            onClick={() => setShowCustomWordDialog(true)}
            className="w-14 h-14 rounded-full bg-educational-green hover:bg-educational-green/90 shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );

  const renderDetailedAnalytics = () => {
    console.log("Rendering analytics - selectedChild:", selectedChild);
    console.log("Children array length:", children.length);

    if (!selectedChild) {
      return (
        <div className="space-y-4 md:space-y-6">
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-600">
                No Child Selected
              </h3>
              <p className="text-slate-500 mb-6">
                {children.length === 0
                  ? "Add a child profile first to view learning analytics."
                  : "Select a child to view their detailed analytics."}
              </p>
              {children.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">Available children:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {children.map((child) => (
                      <Button
                        key={child.id}
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedChild(child)}
                        className="flex items-center gap-2"
                      >
                        <span className="text-lg">{child.avatar}</span>
                        {child.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {children.length === 0 && (
                <Button
                  onClick={() => setShowAddChildDialog(true)}
                  className="bg-educational-blue"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Your First Child
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              Learning Analytics
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              In-depth insights for {selectedChild.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs md:text-sm px-2 md:px-3"
            >
              <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Export Report</span>
              <span className="md:hidden">Export</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs md:text-sm px-2 md:px-3"
            >
              <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Email Summary</span>
              <span className="md:hidden">Email</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Learning Path Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-3 md:p-4 text-center">
              <CheckCircle className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-green-600" />
              <div className="text-xl md:text-2xl font-bold text-green-700">
                <AnimatedCounter
                  value={
                    childrenWordStats[selectedChild.id]?.wordsRemembered || 0
                  }
                />
              </div>
              <p className="text-xs md:text-sm text-green-600 font-medium">
                Words Mastered
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-3 md:p-4 text-center">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-xl md:text-2xl font-bold text-orange-700">
                <AnimatedCounter
                  value={
                    childrenWordStats[selectedChild.id]?.wordsNeedingPractice ||
                    0
                  }
                />
              </div>
              <p className="text-xs md:text-sm text-orange-600 font-medium">
                Need Practice
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-3 md:p-4 text-center">
              <Target className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-xl md:text-2xl font-bold text-blue-700">
                <AnimatedCounter
                  value={
                    childrenWordStats[selectedChild.id]?.averageAccuracy || 0
                  }
                  suffix="%"
                />
              </div>
              <p className="text-xs md:text-sm text-blue-600 font-medium">
                Accuracy Rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-3 md:p-4 text-center">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-xl md:text-2xl font-bold text-purple-700">
                <AnimatedCounter
                  value={
                    childrenWordStats[selectedChild.id]?.totalWordsLearned || 0
                  }
                />
              </div>
              <p className="text-xs md:text-sm text-purple-600 font-medium">
                Total Learned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Word Progress Tracking Section */}
        {childrenWordStats[selectedChild.id] && (
          <Card>
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                Learning Path Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Words That Need Practice - Enhanced with Real Data */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                      <h3 className="text-base md:text-lg font-semibold text-orange-700">
                        Practice Needed
                      </h3>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 text-xs">
                      {childrenWordStats[selectedChild.id]
                        ?.wordsNeedingPractice || 0}{" "}
                      words
                    </Badge>
                  </div>
                  <div className="bg-orange-50 p-3 md:p-4 rounded-lg">
                    <p className="text-xs md:text-sm text-gray-600 mb-3">
                      Words marked as "I Forgot" or with low accuracy rates.
                      Focus practice here:
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {practiceWords.length > 0 ? (
                        practiceWords.slice(0, 5).map((wordData) => (
                          <div
                            key={wordData.word}
                            className="flex items-center justify-between bg-white p-2 md:p-3 rounded border hover:border-orange-300 transition-colors cursor-pointer"
                          >
                            <div>
                              <span className="font-medium text-sm md:text-base">
                                {wordData.word}
                              </span>
                              <div className="text-xs text-gray-500">
                                {wordData.category} • Reviewed{" "}
                                {wordData.timesReviewed} times
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`text-xs ${
                                  wordData.accuracy < 30
                                    ? "bg-red-100 text-red-700"
                                    : wordData.accuracy < 50
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {wordData.accuracy}% accuracy
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs px-2 py-1 h-auto"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log(
                                    "Starting practice for:",
                                    wordData.word,
                                  );
                                }}
                              >
                                Practice
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <p className="text-sm">
                            No words need practice right now!
                          </p>
                          <p className="text-xs">
                            Great job staying on top of learning!
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t flex flex-col md:flex-row justify-between items-center gap-2">
                      <span className="text-xs md:text-sm text-orange-600 font-medium">
                        🎯{" "}
                        {childrenWordStats[selectedChild.id]
                          ?.wordsNeedingPractice || 0}{" "}
                        words need focused practice
                      </span>
                      {practiceWords.length > 0 && (
                        <Button
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1"
                          onClick={() => {
                            console.log(
                              "Starting focused practice session with words:",
                              practiceWords.map((w) => w.word),
                            );
                          }}
                        >
                          <Target className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          <span className="hidden md:inline">
                            Start Practice Session
                          </span>
                          <span className="md:hidden">Practice</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Words Well Remembered - Enhanced with Real Data */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                      <h3 className="text-base md:text-lg font-semibold text-green-700">
                        Words Mastered
                      </h3>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      {childrenWordStats[selectedChild.id]?.wordsRemembered ||
                        0}{" "}
                      words
                    </Badge>
                  </div>
                  <div className="bg-green-50 p-3 md:p-4 rounded-lg">
                    <p className="text-xs md:text-sm text-gray-600 mb-3">
                      Words consistently remembered with high accuracy:
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {topWords.length > 0 ? (
                        topWords.slice(0, 5).map((wordData) => (
                          <div
                            key={wordData.word}
                            className="flex items-center justify-between bg-white p-2 md:p-3 rounded border hover:border-green-300 transition-colors"
                          >
                            <div>
                              <span className="font-medium text-sm md:text-base">
                                {wordData.word}
                              </span>
                              <div className="text-xs text-gray-500">
                                {wordData.category} • Reviewed{" "}
                                {wordData.timesReviewed} times
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                {wordData.accuracy}% accuracy
                              </Badge>
                              <div className="text-green-500">
                                <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                          <p className="text-sm">
                            Keep learning to see mastered words here!
                          </p>
                          <p className="text-xs">
                            Words with 80%+ accuracy will appear here.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t text-center">
                      <span className="text-xs md:text-sm text-green-600 font-medium">
                        🎉{" "}
                        {childrenWordStats[selectedChild.id]?.wordsRemembered ||
                          0}{" "}
                        words mastered total!
                      </span>
                      {topWords.length > 5 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Showing top 5 out of {topWords.length} mastered words
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">
                    {childrenWordStats[selectedChild.id]?.totalWordsLearned ||
                      0}
                  </div>
                  <div className="text-sm text-blue-600">Total Words</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">
                    {childrenWordStats[selectedChild.id]?.wordsRemembered || 0}
                  </div>
                  <div className="text-sm text-green-600">Remembered</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-700">
                    {childrenWordStats[selectedChild.id]
                      ?.wordsNeedingPractice || 0}
                  </div>
                  <div className="text-sm text-orange-600">Need Practice</div>
                </div>
                <div className="bg-purple-50 p-3 md:p-4 rounded-lg text-center">
                  <Target className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-xl md:text-2xl font-bold text-purple-700">
                    {childrenWordStats[selectedChild.id]?.averageAccuracy || 0}%
                  </div>
                  <div className="text-xs md:text-sm text-purple-600">
                    Accuracy
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Based on Analytics */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg text-indigo-700">
              <Zap className="w-5 h-5 md:w-6 md:h-6" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {practiceWords.length > 0 && (
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white h-auto py-3 flex flex-col items-center gap-2"
                  onClick={() => {
                    console.log(
                      "Starting targeted practice:",
                      practiceWords.slice(0, 5).map((w) => w.word),
                    );
                    // This would navigate to the main learning component with specific words
                  }}
                >
                  <AlertCircle className="w-5 h-5" />
                  <div className="text-center">
                    <div className="font-semibold text-sm">Start Practice</div>
                    <div className="text-xs opacity-90">
                      {practiceWords.length} words need help
                    </div>
                  </div>
                </Button>
              )}

              {childrenWordStats[selectedChild.id]?.averageAccuracy &&
                childrenWordStats[selectedChild.id].averageAccuracy > 85 && (
                  <Button
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50 h-auto py-3 flex flex-col items-center gap-2"
                    onClick={() => {
                      console.log("Adding new words challenge");
                    }}
                  >
                    <BookOpen className="w-5 h-5" />
                    <div className="text-center">
                      <div className="font-semibold text-sm">Add New Words</div>
                      <div className="text-xs opacity-90">
                        High accuracy - ready for more!
                      </div>
                    </div>
                  </Button>
                )}

              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 h-auto py-3 flex flex-col items-center gap-2"
                onClick={() => {
                  console.log("Generating progress report");
                }}
              >
                <FileText className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-semibold text-sm">Generate Report</div>
                  <div className="text-xs opacity-90">Share with teachers</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

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
                <div
                  key={index}
                  className="p-3 bg-yellow-50 rounded-lg text-center"
                >
                  <span className="font-medium">{reward}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold">Alerts</h2>
          <p className="text-slate-600 text-xs md:text-sm hidden md:block">
            Learning updates
          </p>
        </div>
        <div className="flex gap-1 md:gap-2">
          <Button variant="outline" size="sm" className="text-xs px-2 h-7">
            <Settings className="w-3 h-3 mr-1" />
            <span className="hidden md:inline">Settings</span>
          </Button>
          <Button variant="outline" size="sm" className="text-xs px-2 h-7">
            <span className="hidden md:inline">Mark Read</span>
            <span className="md:hidden">✓</span>
          </Button>
        </div>
      </div>

      <div className="space-y-1 md:space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white border rounded-lg p-2 cursor-pointer transition-all hover:shadow-sm ${
              !notification.read
                ? "border-l-2 border-l-educational-blue bg-blue-50/20"
                : "border-slate-200"
            }`}
            onClick={() => markNotificationAsRead(notification.id)}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.type === "achievement"
                    ? "bg-yellow-100 text-yellow-600"
                    : notification.type === "goal_progress"
                      ? "bg-blue-100 text-blue-600"
                      : notification.type === "concern"
                        ? "bg-red-100 text-red-600"
                        : notification.type === "milestone"
                          ? "bg-green-100 text-green-600"
                          : "bg-slate-100 text-slate-600"
                }`}
              >
                {notification.type === "achievement" && (
                  <Award className="w-3 h-3" />
                )}
                {notification.type === "goal_progress" && (
                  <Target className="w-3 h-3" />
                )}
                {notification.type === "concern" && (
                  <BellRing className="w-3 h-3" />
                )}
                {notification.type === "milestone" && (
                  <Star className="w-3 h-3" />
                )}
                {notification.type === "reminder" && (
                  <Bell className="w-3 h-3" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-slate-900 truncate">
                    {notification.message}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs px-1 py-0 h-4 shrink-0"
                  >
                    {children.find((c) => c.id === notification.childId)?.name}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-slate-500">
                  {getTimeAgo(notification.timestamp)}
                </span>
                <div
                  className={`w-1 h-1 rounded-full ${
                    notification.priority === "high"
                      ? "bg-red-500"
                      : notification.priority === "medium"
                        ? "bg-yellow-500"
                        : "bg-slate-400"
                  }`}
                ></div>
                {!notification.read && (
                  <div className="w-1.5 h-1.5 bg-educational-blue rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Helper function to generate comprehensive learning report
  const generateLearningReport = async (
    child: ChildProfile,
    dateRange: string,
    reportType: string,
  ) => {
    setGeneratingReport(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const now = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
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
        strengthCategories: ["Animals", "Science", "Colors"],
        strugglingCategories: ["Food", "Transportation"],
        masteredWords: [
          "elephant",
          "microscope",
          "rainbow",
          "volcano",
          "constellation",
        ],
        practiceNeeded: ["helicopter", "restaurant", "apartment", "orchestra"],
        recommendedActivities: [
          "Focus on transportation vocabulary through picture matching",
          "Practice food words using cooking-themed games",
          "Reinforce helicopter/orchestra pronunciation with audio exercises",
        ],
      },
      progressAnalytics: {
        weeklyTrends: [
          { week: "Week 1", accuracy: 78, wordsLearned: 12, timeSpent: 145 },
          { week: "Week 2", accuracy: 82, wordsLearned: 15, timeSpent: 160 },
          { week: "Week 3", accuracy: 85, wordsLearned: 18, timeSpent: 175 },
          { week: "Week 4", accuracy: 88, wordsLearned: 22, timeSpent: 190 },
        ],
        categoryProgress: [
          {
            category: "Animals",
            mastery: 92,
            timeSpent: 45,
            trend: "improving",
          },
          { category: "Science", mastery: 87, timeSpent: 38, trend: "stable" },
          { category: "Colors", mastery: 95, timeSpent: 25, trend: "mastered" },
          {
            category: "Food",
            mastery: 65,
            timeSpent: 42,
            trend: "needs_focus",
          },
          {
            category: "Transportation",
            mastery: 58,
            timeSpent: 35,
            trend: "challenging",
          },
        ],
      },
      achievements: [
        {
          title: "Vocabulary Star",
          description: "Learned 50+ new words",
          earnedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Streak Champion",
          description: "10-day learning streak",
          earnedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          title: "Animal Expert",
          description: "Mastered all animal words",
          earnedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      ],
      parentInsights: {
        keyStrengths: [
          "Excellent visual memory - retains information well through pictures",
          "High engagement with interactive content",
          "Consistent daily practice habits",
        ],
        areasForGrowth: [
          "Spelling accuracy could improve with more writing practice",
          "Pronunciation of complex words needs attention",
          "Speed of word recognition in timed activities",
        ],
        recommendations: [
          "Introduce spelling games to reinforce visual learning",
          "Use audio repetition for difficult pronunciations",
          "Gradually increase difficulty in timed exercises",
          "Celebrate transportation vocabulary progress to boost confidence",
        ],
      },
    };

    setReportData(report);
    setGeneratingReport(false);
    return report;
  };

  // Helper functions for dynamic content
  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      Animals: "���",
      Science: "🔬",
      Colors: "🌈",
      Food: "��",
      Transportation: "🚗",
      Nature: "🌲",
      Sports: "⚽",
      Music: "🎵",
    };
    return emojis[category] || "📚";
  };

  const getTrendEmoji = (trend: string) => {
    const emojis: Record<string, string> = {
      improving: "📈",
      stable: "➡️",
      mastered: "🏆",
      needs_focus: "🎯",
      challenging: "💪",
    };
    return emojis[trend] || "📊";
  };

  const getTrendBadgeClass = (trend: string) => {
    if (trend === "improving" || trend === "mastered") return "badge-green";
    if (trend === "stable") return "badge badge-blue";
    return "badge-orange";
  };

  const getProgressClass = (mastery: number) => {
    if (mastery >= 90) return "progress-excellent";
    if (mastery >= 75) return "progress-good";
    if (mastery >= 60) return "progress-average";
    return "progress-needs-work";
  };

  // Export report as PDF-friendly HTML with attractive design
  const exportReport = () => {
    if (!reportData) return;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportData.child.name} - Learning Progress Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 40px 20px;
        }

        .report-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
        }

        .header::before {
            content: '✨📚📖🌟';
            position: absolute;
            top: 15px;
            left: 40px;
            font-size: 24px;
            opacity: 0.7;
        }

        .header::after {
            content: '🎯🚀⭐';
            position: absolute;
            top: 15px;
            right: 40px;
            font-size: 24px;
            opacity: 0.7;
        }

        .child-avatar {
            font-size: 64px;
            margin-bottom: 15px;
            display: block;
        }

        .header h1 {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .report-meta {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 5px;
        }

        .generated-date {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            display: inline-block;
            margin-top: 15px;
        }

        .content {
            padding: 40px;
        }

        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }

        .section-title {
            font-size: 24px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding-bottom: 10px;
            border-bottom: 3px solid #e2e8f0;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            margin: 25px 0;
        }

        .stat-card {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #cbd5e1;
        }

        .stat-icon {
            font-size: 36px;
            margin-bottom: 10px;
            display: block;
        }

        .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
        }

        .category-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 25px 0;
        }

        .category-section {
            background: #f8fafc;
            padding: 25px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }

        .category-header {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .badge-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
        }

        .badge-green {
            background: #dcfce7;
            color: #166534;
            border: 1px solid #bbf7d0;
        }

        .badge-orange {
            background: #fed7aa;
            color: #9a3412;
            border: 1px solid #fdba74;
        }

        .progress-bar {
            background: #e2e8f0;
            height: 12px;
            border-radius: 6px;
            overflow: hidden;
            margin: 8px 0;
        }

        .progress-fill {
            height: 100%;
            border-radius: 6px;
            transition: width 0.3s ease;
        }

        .progress-excellent { background: linear-gradient(90deg, #10b981 0%, #059669 100%); }
        .progress-good { background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%); }
        .progress-average { background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%); }
        .progress-needs-work { background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%); }

        .insights-list {
            list-style: none;
            margin: 20px 0;
        }

        .insights-list li {
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: flex-start;
            gap: 12px;
        }

        .insights-list li:last-child {
            border-bottom: none;
        }

        .achievement-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 25px 0;
        }

        .achievement-card {
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #f59e0b;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .achievement-icon {
            font-size: 32px;
        }

        .achievement-content h4 {
            font-weight: 600;
            margin-bottom: 5px;
            color: #92400e;
        }

        .achievement-content p {
            font-size: 13px;
            color: #b45309;
            margin-bottom: 3px;
        }

        .achievement-date {
            font-size: 12px;
            color: #d97706;
        }

        .footer {
            background: #f8fafc;
            padding: 30px 40px;
            text-align: center;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }

        .footer-content {
            font-size: 14px;
            line-height: 1.6;
        }

        .decorative-emoji {
            font-size: 20px;
            margin: 0 5px;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .report-container {
                box-shadow: none;
                border-radius: 0;
            }

            .header::before,
            .header::after {
                display: none;
            }
        }

        @page {
            margin: 1in;
            size: A4;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <span class="child-avatar">${reportData.child.avatar}</span>
            <h1>${reportData.child.name}'s Learning Progress Report</h1>
            <div class="report-meta">
                📅 ${reportData.period.range.toUpperCase()} Report Period: ${reportData.period.start.toLocaleDateString()} - ${reportData.period.end.toLocaleDateString()}
            </div>
            <div class="report-meta">
                👶 Age: ${reportData.child.age} years old
            </div>
            <div class="generated-date">
                📊 Generated on ${reportData.generatedAt.toLocaleDateString()}
            </div>
        </div>

        <div class="content">
            <!-- Summary Statistics -->
            <div class="section">
                <h2 class="section-title">
                    📈 Learning Summary
                </h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-icon">⏰</span>
                        <div class="stat-value">${reportData.summary.totalLearningTime}m</div>
                        <div class="stat-label">Learning Time</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-icon">📚</span>
                        <div class="stat-value">${reportData.summary.wordsLearned}</div>
                        <div class="stat-label">Words Learned</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-icon">🎯</span>
                        <div class="stat-value">${reportData.summary.averageAccuracy}%</div>
                        <div class="stat-label">Accuracy Rate</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-icon">🔥</span>
                        <div class="stat-value">${reportData.summary.streakDays}</div>
                        <div class="stat-label">Day Streak</div>
                    </div>
                </div>
            </div>

            <!-- Learning Path Analysis -->
            <div class="section">
                <h2 class="section-title">
                    🛤️ Learning Path Analysis
                </h2>
                <div class="category-grid">
                    <div class="category-section">
                        <div class="category-header">
                            �� Strengths & Mastered Areas
                        </div>
                        <h4 style="margin: 15px 0 10px 0; color: #059669;">💪 Strong Categories</h4>
                        <div class="badge-container">
                            ${reportData.learningPath.strengthCategories.map((cat) => `<span class="badge badge-green">${cat}</span>`).join("")}
                        </div>
                        <h4 style="margin: 15px 0 10px 0; color: #059669;">✅ Mastered Words</h4>
                        <div class="badge-container">
                            ${reportData.learningPath.masteredWords.map((word) => `<span class="badge badge-green">${word}</span>`).join("")}
                        </div>
                    </div>

                    <div class="category-section">
                        <div class="category-header">
                            🎯 Growth Opportunities
                        </div>
                        <h4 style="margin: 15px 0 10px 0; color: #d97706;">📖 Practice Categories</h4>
                        <div class="badge-container">
                            ${reportData.learningPath.strugglingCategories.map((cat) => `<span class="badge badge-orange">${cat}</span>`).join("")}
                        </div>
                        <h4 style="margin: 15px 0 10px 0; color: #d97706;">🔄 Words to Practice</h4>
                        <div class="badge-container">
                            ${reportData.learningPath.practiceNeeded.map((word) => `<span class="badge badge-orange">${word}</span>`).join("")}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Category Progress -->
            <div class="section">
                <h2 class="section-title">
                    📊 Category Mastery Progress
                </h2>
                ${reportData.progressAnalytics.categoryProgress
                  .map(
                    (category) => `
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-weight: 600;">${getCategoryEmoji(category.category)} ${category.category}</span>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 14px; color: #64748b;">${category.mastery}%</span>
                                <span class="badge ${getTrendBadgeClass(category.trend)}">${getTrendEmoji(category.trend)} ${category.trend.replace("_", " ")}</span>
                            </div>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill ${getProgressClass(category.mastery)}" style="width: ${category.mastery}%;"></div>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>

            <!-- Parent Insights -->
            <div class="section">
                <h2 class="section-title">
                    💡 Parent Insights & Recommendations
                </h2>

                <div style="margin-bottom: 30px;">
                    <h3 style="color: #059669; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        ⭐ Key Strengths
                    </h3>
                    <ul class="insights-list">
                        ${reportData.parentInsights.keyStrengths
                          .map(
                            (strength) => `
                            <li>
                                <span style="color: #10b981; font-size: 16px;">���</span>
                                <span>${strength}</span>
                            </li>
                        `,
                          )
                          .join("")}
                    </ul>
                </div>

                <div style="margin-bottom: 30px;">
                    <h3 style="color: #d97706; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        �� Growth Opportunities
                    </h3>
                    <ul class="insights-list">
                        ${reportData.parentInsights.areasForGrowth
                          .map(
                            (area) => `
                            <li>
                                <span style="color: #f59e0b; font-size: 16px;">��</span>
                                <span>${area}</span>
                            </li>
                        `,
                          )
                          .join("")}
                    </ul>
                </div>

                <div>
                    <h3 style="color: #7c3aed; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        💡 Recommended Actions
                    </h3>
                    <ul class="insights-list">
                        ${reportData.parentInsights.recommendations
                          .map(
                            (rec) => `
                            <li>
                                <span style="color: #8b5cf6; font-size: 16px;">��</span>
                                <span>${rec}</span>
                            </li>
                        `,
                          )
                          .join("")}
                    </ul>
                </div>
            </div>

            <!-- Achievements -->
            <div class="section">
                <h2 class="section-title">
                    �� Recent Achievements
                </h2>
                <div class="achievement-grid">
                    ${reportData.achievements
                      .map(
                        (achievement) => `
                        <div class="achievement-card">
                            <div class="achievement-icon">🏆</div>
                            <div class="achievement-content">
                                <h4>${achievement.title}</h4>
                                <p>${achievement.description}</p>
                                <div class="achievement-date">📅 ${achievement.earnedAt.toLocaleDateString()}</div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="footer-content">
                <p><span class="decorative-emoji">✨</span> Generated by Wordy's Adventure Learning Platform <span class="decorative-emoji">✨</span></p>
                <p>Keep up the amazing work, ${reportData.child.name}! <span class="decorative-emoji">🌟</span></p>
                <p style="margin-top: 10px; font-size: 12px;">This report shows ${reportData.child.name}'s progress and achievements during the ${reportData.period.range} period.</p>
            </div>
        </div>
    </div>

    <script>
        // Auto-print functionality
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (confirm('🖨️ Would you like to print or save this report as PDF?')) {
                    window.print();
                }
            }, 1000);
        });
    </script>
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportData.child.name}_Learning_Report_${reportData.period.range}_${reportData.generatedAt.toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Also open in new window for immediate viewing/printing
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  const renderDetailedReports = () => (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Mobile-optimized header */}
      <div className="text-center md:text-left">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center justify-center md:justify-start gap-2">
          <FileText className="w-5 h-5 md:w-6 md:h-6" />
          Learning Reports
        </h2>
        <p className="text-sm md:text-base text-slate-600 mt-1">
          Generate detailed progress reports for your children
        </p>
      </div>

      {/* Quick Report Templates for Mobile */}
      <div className="md:hidden grid grid-cols-2 gap-3">
        <Button
          onClick={() => {
            if (selectedChild) {
              setReportType("summary");
              setReportDateRange("week");
              generateLearningReport(selectedChild, "week", "summary");
            }
          }}
          disabled={!selectedChild || generatingReport}
          className="h-20 flex-col bg-educational-blue hover:bg-educational-blue/90 text-white"
          variant="default"
        >
          <Clock className="w-5 h-5 mb-1" />
          <span className="text-xs">Weekly Summary</span>
        </Button>
        <Button
          onClick={() => {
            if (selectedChild) {
              setReportType("detailed");
              setReportDateRange("month");
              generateLearningReport(selectedChild, "month", "detailed");
            }
          }}
          disabled={!selectedChild || generatingReport}
          className="h-20 flex-col bg-educational-green hover:bg-educational-green/90 text-white"
          variant="default"
        >
          <TrendingUp className="w-5 h-5 mb-1" />
          <span className="text-xs">Monthly Report</span>
        </Button>
      </div>

      {/* Report Configuration Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <FileText className="w-5 h-5 text-educational-blue" />
            <div>
              <div>Generate Custom Report</div>
              <p className="text-xs md:text-sm font-normal text-slate-600 mt-1">
                Create detailed learning analytics
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 space-y-4">
          {/* Child selector for mobile */}
          {children.length > 1 && (
            <div className="md:hidden">
              <Label className="text-sm font-semibold">Select Child</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {children.map((child) => (
                  <Button
                    key={child.id}
                    variant={
                      selectedChild?.id === child.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedChild(child)}
                    className={`justify-start h-12 ${
                      selectedChild?.id === child.id
                        ? "bg-educational-blue hover:bg-educational-blue/90"
                        : "hover:bg-educational-blue/10 hover:text-educational-blue hover:border-educational-blue"
                    }`}
                  >
                    <span className="text-xl mr-3">{child.avatar}</span>
                    <div className="text-left">
                      <div className="font-medium">{child.name}</div>
                      <div className="text-xs text-slate-500">
                        Age {child.age} • Level {child.level}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop configuration */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="report-child">Select Child</Label>
              <Select
                value={selectedChild?.id || ""}
                onValueChange={(value) =>
                  setSelectedChild(children.find((c) => c.id === value) || null)
                }
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
              <Select
                value={reportType}
                onValueChange={(value: any) => setReportType(value)}
              >
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
              <Select
                value={reportDateRange}
                onValueChange={(value: any) => setReportDateRange(value)}
              >
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

          {/* Mobile configuration */}
          <div className="md:hidden space-y-4">
            {selectedChild && (
              <div className="p-3 bg-educational-blue/5 rounded-lg border border-educational-blue/20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedChild.avatar}</span>
                  <div>
                    <div className="font-semibold text-educational-blue">
                      {selectedChild.name}
                    </div>
                    <div className="text-xs text-slate-600">
                      Selected for report generation
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Report Type</Label>
                <Select
                  value={reportType}
                  onValueChange={(value: any) => setReportType(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">📊 Quick Summary</SelectItem>
                    <SelectItem value="detailed">
                      📈 Detailed Analysis
                    </SelectItem>
                    <SelectItem value="progress">
                      🎯 Progress Tracking
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Time Period</Label>
                <Select
                  value={reportDateRange}
                  onValueChange={(value: any) => setReportDateRange(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">📅 Last Week</SelectItem>
                    <SelectItem value="month">📆 Last Month</SelectItem>
                    <SelectItem value="quarter">🗓️ Last 3 Months</SelectItem>
                    <SelectItem value="year">📈 Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              onClick={() =>
                selectedChild &&
                generateLearningReport(
                  selectedChild,
                  reportDateRange,
                  reportType,
                )
              }
              disabled={!selectedChild || generatingReport}
              className="bg-educational-blue hover:bg-educational-blue/90 text-white w-full md:w-auto h-12 md:h-auto"
            >
              {generatingReport ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Report...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Generate Report
                </div>
              )}
            </Button>

            {reportData && (
              <Button
                variant="outline"
                onClick={exportReport}
                className="w-full md:w-auto h-12 md:h-auto hover:bg-educational-green/10 hover:text-educational-green hover:border-educational-green"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            )}
          </div>

          {/* No child selected state */}
          {!selectedChild && children.length > 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">👨‍👩‍👧‍👦</div>
              <h3 className="font-semibold text-slate-700 mb-2">
                Select a Child
              </h3>
              <p className="text-sm text-slate-600">
                Choose a child profile to generate their learning report
              </p>
            </div>
          )}

          {/* No children state */}
          {children.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold text-slate-700 mb-2">
                No Children Added
              </h3>
              <p className="text-sm text-slate-600">
                Add child profiles first to generate learning reports
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Report Display */}
      {reportData && (
        <div className="space-y-4 md:space-y-6">
          {/* Mobile Report Header with Success Animation */}
          <Card className="overflow-hidden border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-green-500 animate-gentle-bounce">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="font-semibold text-green-800">
                  Report Generated Successfully!
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl md:text-2xl">
                    {reportData.child.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-800">
                      {reportData.child.name}'s Learning Report
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-xs md:text-sm text-slate-600">
                      <span className="font-medium uppercase text-educational-blue">
                        {reportData.period.range} Report
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span>
                        {reportData.period.start.toLocaleDateString()} -{" "}
                        {reportData.period.end.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 w-fit">
                  {reportData.generatedAt.toLocaleDateString()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Summary Stats for Mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-3 md:p-4 text-center">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-blue-500 mx-auto mb-2 animate-gentle-float" />
                <div className="text-xl md:text-2xl font-bold text-blue-700">
                  <AnimatedCounter
                    value={reportData.summary.totalLearningTime}
                    suffix="m"
                  />
                </div>
                <div className="text-xs md:text-sm text-blue-600 font-medium">
                  Learning Time
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-3 md:p-4 text-center">
                <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-green-500 mx-auto mb-2 animate-gentle-float" />
                <div className="text-xl md:text-2xl font-bold text-green-700">
                  <AnimatedCounter value={reportData.summary.wordsLearned} />
                </div>
                <div className="text-xs md:text-sm text-green-600 font-medium">
                  Words Learned
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-3 md:p-4 text-center">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-purple-500 mx-auto mb-2 animate-gentle-float" />
                <div className="text-xl md:text-2xl font-bold text-purple-700">
                  <AnimatedCounter
                    value={reportData.summary.averageAccuracy}
                    suffix="%"
                  />
                </div>
                <div className="text-xs md:text-sm text-purple-600 font-medium">
                  Accuracy
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-3 md:p-4 text-center">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-orange-500 mx-auto mb-2 animate-gentle-float" />
                <div className="text-xl md:text-2xl font-bold text-orange-700">
                  <AnimatedCounter value={reportData.summary.streakDays} />
                </div>
                <div className="text-xs md:text-sm text-orange-600 font-medium">
                  Day Streak
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile-first Progress Overview */}
          <Card className="md:hidden bg-gradient-to-r from-educational-blue/5 to-educational-purple/5">
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-educational-blue" />
                Quick Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">
                    Overall Performance
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-educational-blue rounded-full transition-all duration-1000"
                        style={{
                          width: `${reportData.summary.averageAccuracy}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-educational-blue">
                      {reportData.summary.averageAccuracy}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Learning Goal</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-educational-green rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min((reportData.summary.wordsLearned / 20) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-educational-green">
                      {reportData.summary.wordsLearned}/20
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Learning Path Analysis for Mobile */}
          <div className="space-y-4 md:space-y-6">
            {/* Mobile-first Strengths Card */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <div>Strengths & Progress</div>
                    <p className="text-xs md:text-sm font-normal text-slate-600 mt-1">
                      Areas where {reportData.child.name} excels
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800">
                      Strong Categories
                    </h4>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-300"
                    >
                      {reportData.learningPath.strengthCategories.length} areas
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                    {reportData.learningPath.strengthCategories.map(
                      (category: string) => (
                        <Badge
                          key={category}
                          className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors justify-center py-2 md:py-1"
                        >
                          ✨ {category}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800">
                      Mastered Words
                    </h4>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-300"
                    >
                      {reportData.learningPath.masteredWords.length} words
                    </Badge>
                  </div>
                  {reportData.learningPath.masteredWords.length > 0 ? (
                    <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                      {reportData.learningPath.masteredWords
                        .slice(0, 8)
                        .map((word: string) => (
                          <Badge
                            key={word}
                            variant="outline"
                            className="text-green-600 border-green-300 hover:bg-green-50 transition-colors justify-center py-2 md:py-1 capitalize"
                          >
                            📚 {word}
                          </Badge>
                        ))}
                      {reportData.learningPath.masteredWords.length > 8 && (
                        <Badge
                          variant="outline"
                          className="text-slate-500 border-slate-300 justify-center py-2 md:py-1"
                        >
                          +{reportData.learningPath.masteredWords.length - 8}{" "}
                          more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500 text-sm">
                      No words fully mastered yet - keep practicing!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-yellow-50">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Target className="w-5 h-5 text-orange-500" />
                  <div>
                    <div>Areas for Growth</div>
                    <p className="text-xs md:text-sm font-normal text-slate-600 mt-1">
                      Focus areas for improvement
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800">
                      Practice Categories
                    </h4>
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-300"
                    >
                      {reportData.learningPath.strugglingCategories.length}{" "}
                      areas
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                    {reportData.learningPath.strugglingCategories.map(
                      (category: string) => (
                        <Badge
                          key={category}
                          className="bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors justify-center py-2 md:py-1"
                        >
                          🎯 {category}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800">
                      Words to Practice
                    </h4>
                    <Badge
                      variant="outline"
                      className="text-orange-600 border-orange-300"
                    >
                      {reportData.learningPath.practiceNeeded.length} words
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                    {reportData.learningPath.practiceNeeded
                      .slice(0, 8)
                      .map((word: string) => (
                        <Badge
                          key={word}
                          variant="outline"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50 transition-colors justify-center py-2 md:py-1 capitalize"
                        >
                          🔄 {word}
                        </Badge>
                      ))}
                    {reportData.learningPath.practiceNeeded.length > 8 && (
                      <Badge
                        variant="outline"
                        className="text-slate-500 border-slate-300 justify-center py-2 md:py-1"
                      >
                        +{reportData.learningPath.practiceNeeded.length - 8}{" "}
                        more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Category Progress for Mobile */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-blue-50">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BarChart3 className="w-5 h-5 text-educational-blue" />
                <div>
                  <div>Category Mastery Progress</div>
                  <p className="text-xs md:text-sm font-normal text-slate-600 mt-1">
                    Learning progress by subject area
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <div className="space-y-4">
                {reportData.progressAnalytics.categoryProgress.map(
                  (category: any) => (
                    <div key={category.category} className="space-y-3">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">
                            {category.category}
                          </span>
                          <Badge
                            className={`text-xs ${
                              category.trend === "improving"
                                ? "bg-green-100 text-green-800"
                                : category.trend === "stable"
                                  ? "bg-blue-100 text-blue-800"
                                  : category.trend === "mastered"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {category.trend === "improving"
                              ? "📈 Improving"
                              : category.trend === "stable"
                                ? "➡️ Stable"
                                : category.trend === "mastered"
                                  ? "🏆 Mastered"
                                  : "🔄 Needs Practice"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm md:text-base font-semibold text-educational-blue">
                            {category.mastery}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress
                          value={category.mastery}
                          className="h-3 md:h-2"
                        />
                        <div className="text-xs text-slate-500 text-right">
                          Target: 80% mastery
                        </div>
                      </div>
                    </div>
                  ),
                )}
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
                  {reportData.parentInsights.keyStrengths.map(
                    (strength: string, index: number) => (
                      <li
                        key={index}
                        className="text-sm text-slate-700 flex items-start gap-2"
                      >
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {strength}
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Growth Opportunities
                </h4>
                <ul className="space-y-1">
                  {reportData.parentInsights.areasForGrowth.map(
                    (area: string, index: number) => (
                      <li
                        key={index}
                        className="text-sm text-slate-700 flex items-start gap-2"
                      >
                        <Target className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        {area}
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-500" />
                  Recommended Actions
                </h4>
                <ul className="space-y-1">
                  {reportData.parentInsights.recommendations.map(
                    (recommendation: string, index: number) => (
                      <li
                        key={index}
                        className="text-sm text-slate-700 flex items-start gap-2"
                      >
                        <Heart className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        {recommendation}
                      </li>
                    ),
                  )}
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
                {reportData.achievements.map(
                  (achievement: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg"
                    >
                      <div className="text-2xl">🏆</div>
                      <div>
                        <h4 className="font-semibold text-sm">
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-slate-600">
                          {achievement.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {achievement.earnedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enhanced Empty State for Mobile */}
      {!reportData && !generatingReport && (
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="text-6xl md:text-8xl mb-4 animate-gentle-bounce">
              📊
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-3 text-slate-700">
              No Report Generated Yet
            </h3>
            <p className="text-slate-500 mb-6 text-sm md:text-base leading-relaxed">
              {selectedChild
                ? `Ready to generate ${selectedChild.name}'s learning report!`
                : "Select a child and generate their learning report to see detailed analytics."}
            </p>
            {selectedChild && (
              <div className="space-y-3">
                <Button
                  onClick={() =>
                    generateLearningReport(selectedChild, "week", "summary")
                  }
                  className="bg-educational-blue hover:bg-educational-blue/90 w-full md:w-auto"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Quick Report
                </Button>
                <div className="text-xs text-slate-500">
                  Get a weekly summary in seconds
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mobile Floating Action Button for Reports */}
      {selectedChild && !generatingReport && (
        <div className="md:hidden fixed bottom-20 right-4 z-40">
          <div className="flex flex-col gap-2">
            <Button
              onClick={() =>
                generateLearningReport(selectedChild, "week", "summary")
              }
              className="w-14 h-14 rounded-full bg-educational-blue hover:bg-educational-blue/90 shadow-lg"
              title="Quick Report"
            >
              <Clock className="w-6 h-6" />
            </Button>
            <Button
              onClick={() =>
                generateLearningReport(selectedChild, "month", "detailed")
              }
              className="w-14 h-14 rounded-full bg-educational-green hover:bg-educational-green/90 shadow-lg"
              title="Detailed Report"
            >
              <TrendingUp className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
        <div className="flex items-center gap-2 md:gap-4">
          {onNavigateBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateBack}
              className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Back to Main</span>
              <span className="md:hidden">Back</span>
            </Button>
          )}
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-slate-800">
              Parent Dashboard
            </h1>
            <p className="text-xs md:text-base text-slate-600 hidden md:block">
              Comprehensive learning management for your family
            </p>
            <p className="text-xs text-slate-600 md:hidden">
              Manage your family's learning
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1 md:gap-0 h-auto p-1">
          <TabsTrigger
            value="overview"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3 px-1 md:px-3"
          >
            <Users className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Overview</span>
            <span className="md:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger
            value="goals"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3 px-1 md:px-3"
          >
            <Target className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Goals</span>
            <span className="md:hidden">Goals</span>
          </TabsTrigger>
          <TabsTrigger
            value="custom-words"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3 px-1 md:px-3"
          >
            <BookMarked className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Custom Words</span>
            <span className="md:hidden">Words</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 relative text-xs md:text-sm py-2 md:py-3 px-1 md:px-3"
          >
            <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Analytics</span>
            <span className="md:hidden">Stats</span>
            {Object.values(childrenWordStats).some(
              (stats) => stats.wordsNeedingPractice > 0,
            ) && (
              <Badge className="bg-orange-500 text-white text-xs px-1 ml-0 md:ml-1 absolute -top-1 -right-1 md:relative md:top-0 md:right-0">
                {Object.values(childrenWordStats).reduce(
                  (total, stats) => total + (stats.wordsNeedingPractice || 0),
                  0,
                )}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3 px-1 md:px-3"
          >
            <Bell className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Alerts</span>
            <span className="md:hidden">Alerts</span>
            {unreadNotifications > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-1 ml-0 md:ml-1 absolute -top-1 -right-1 md:relative md:top-0 md:right-0">
                {unreadNotifications}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-xs md:text-sm py-2 md:py-3 px-1 md:px-3"
          >
            <FileText className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Reports</span>
            <span className="md:hidden">Reports</span>
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
                onChange={(e) =>
                  setNewChildData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter child's name"
              />
            </div>
            <div>
              <Label htmlFor="childAge">Age</Label>
              <Select
                value={newChildData.age.toString()}
                onValueChange={(value) =>
                  setNewChildData((prev) => ({ ...prev, age: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
                    <SelectItem key={age} value={age.toString()}>
                      {age} years old
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="avatar">Avatar</Label>
              <div className="flex gap-2 mt-2">
                {["👦", "👧", "🧒", "👶", "🦸‍♂️", "🦸‍♀️", "🧑‍🎓", "👨‍🎓", "👩‍🎓"].map(
                  (emoji) => (
                    <Button
                      key={emoji}
                      variant={
                        newChildData.avatar === emoji ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setNewChildData((prev) => ({ ...prev, avatar: emoji }))
                      }
                    >
                      {emoji}
                    </Button>
                  ),
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddChildDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (newChildData.name.trim()) {
                  const newChild: ChildProfile = {
                    id: Date.now().toString(),
                    name: newChildData.name.trim(),
                    age: newChildData.age,
                    avatar: newChildData.avatar,
                    level: 1,
                    totalPoints: 0,
                    wordsLearned: 0,
                    currentStreak: 0,
                    weeklyGoal: 10,
                    weeklyProgress: 0,
                    favoriteCategory: "Animals",
                    lastActive: new Date(),
                    preferredLearningTime:
                      newChildData.preferredLearningTime ||
                      "After school (4-6 PM)",
                    difficultyPreference: newChildData.difficultyPreference,
                    parentNotes: "",
                    customWords: [],
                    weeklyTarget: 15,
                    monthlyTarget: 60,
                    recentAchievements: [],
                    learningStrengths: [],
                    areasForImprovement: [],
                    motivationalRewards: [],
                  };

                  const updatedChildren = [...children, newChild];
                  setChildren(updatedChildren);
                  setSelectedChild(newChild);
                  setShowAddChildDialog(false);
                  setNewChildData({
                    name: "",
                    age: 6,
                    avatar: "👶",
                    preferredLearningTime: "",
                    difficultyPreference: "easy",
                  });
                }
              }}
              className="bg-educational-blue"
              disabled={!newChildData.name.trim()}
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
                onChange={(e) =>
                  setNewGoalData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Weekly Word Challenge"
              />
            </div>
            <div>
              <Label htmlFor="goalDescription">Description</Label>
              <Textarea
                id="goalDescription"
                value={newGoalData.description}
                onChange={(e) =>
                  setNewGoalData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
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
                  onChange={(e) =>
                    setNewGoalData((prev) => ({
                      ...prev,
                      targetValue: parseInt(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="goalType">Goal Type</Label>
                <Select
                  value={newGoalData.type}
                  onValueChange={(value: any) =>
                    setNewGoalData((prev) => ({ ...prev, type: value }))
                  }
                >
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
                onChange={(e) =>
                  setNewGoalData((prev) => ({
                    ...prev,
                    reward: e.target.value,
                  }))
                }
                placeholder="What reward will they earn?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddGoalDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={createGoal} className="bg-educational-blue">
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Word Dialog */}
      <Dialog
        open={showCustomWordDialog}
        onOpenChange={setShowCustomWordDialog}
      >
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
              Ideas: Family names, pet names, favorite places, hobby terms,
              school subjects
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCustomWordDialog(false)}
            >
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
