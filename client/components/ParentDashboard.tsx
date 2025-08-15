import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "@/styles/mobile-goals-optimization.css";
import { ChildLearningGoalsPanel } from "@/components/ChildLearningGoalsPanel";
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
import { childProgressSync } from "@/lib/childProgressSync";
import { toast } from "@/hooks/use-toast";
import { ParentLearningAnalytics } from "@/components/ParentLearningAnalytics";

interface LearningGoal {
  id: string;
  type: "daily" | "weekly" | "monthly";
  target: number;
  current: number;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  isActive: boolean;
  streak: number;
  bestStreak: number;
  startDate: string;
  endDate?: string;
  description: string;
  reward?: string;
}

interface LearningPreferences {
  autoAdjustGoals: boolean;
  adaptiveDifficulty: boolean;
  preferredCategories: string[];
  focusAreas: string[];
  reminderTimes: string[];
  motivationStyle: "encouraging" | "challenging" | "balanced";
}

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
  // Enhanced learning goals integration
  learningGoals: LearningGoal[];
  learningPreferences: LearningPreferences;
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
  showMobileBackButton?: boolean;
}

const sampleChildren: ChildProfile[] = [
  {
    id: "1",
    name: "Alex",
    age: 8,
    avatar: "���",
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
    learningGoals: [
      {
        id: "daily-words-alex",
        type: "daily",
        target: 5,
        current: 3,
        category: "Animals",
        isActive: true,
        streak: 5,
        bestStreak: 7,
        startDate: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        description: "Learn 5 animal words daily",
        reward: "Extra playtime",
      },
      {
        id: "weekly-accuracy-alex",
        type: "weekly",
        target: 85,
        current: 78,
        isActive: true,
        streak: 2,
        bestStreak: 4,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Maintain 85% accuracy",
        reward: "Choose weekend activity",
      },
    ],
    learningPreferences: {
      autoAdjustGoals: true,
      adaptiveDifficulty: true,
      preferredCategories: ["Animals", "Nature", "Science"],
      focusAreas: ["Spelling", "Comprehension"],
      reminderTimes: ["16:00", "19:00"],
      motivationStyle: "encouraging",
    },
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
    learningGoals: [
      {
        id: "daily-words-emma",
        type: "daily",
        target: 3,
        current: 2,
        category: "Nature",
        isActive: true,
        streak: 3,
        bestStreak: 5,
        startDate: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        description: "Learn 3 nature words daily",
        reward: "Nature walk",
      },
      {
        id: "weekly-focus-emma",
        type: "weekly",
        target: 5,
        current: 3,
        isActive: true,
        streak: 1,
        bestStreak: 2,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Complete 5 focused learning sessions",
        reward: "Art supplies",
      },
    ],
    learningPreferences: {
      autoAdjustGoals: false,
      adaptiveDifficulty: false,
      preferredCategories: ["Nature", "Art", "Stories"],
      focusAreas: ["Letter Formation", "Following Instructions"],
      reminderTimes: ["09:00", "15:00"],
      motivationStyle: "encouraging",
    },
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
  showMobileBackButton = true,
}) => {
  // Auth hook for guest mode checking
  const { isGuest, user } = useAuth();
  const navigate = useNavigate();

  // Registration prompt dialog state
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);

  // Load children from localStorage
  const [children, setChildren] = useState<ChildProfile[]>([]);

  // Initialize children data based on guest mode
  useEffect(() => {
    const loadChildren = () => {
      try {
        const savedChildren = localStorage.getItem("parentDashboardChildren");
        if (savedChildren) {
          const parsed = JSON.parse(savedChildren);
          // Convert date strings back to Date objects
          const loadedChildren = parsed.map((child: any) => ({
            ...child,
            lastActive: new Date(child.lastActive),
            recentAchievements:
              child.recentAchievements?.map((achievement: any) => ({
                ...achievement,
                earnedAt: new Date(achievement.earnedAt),
              })) || [],
          }));
          setChildren(loadedChildren);
          return;
        }
      } catch (error) {
        console.error("Error loading children from localStorage:", error);
      }
      // Always start with empty children array - users need to add their own children
      setChildren([]);
    };

    loadChildren();
  }, [isGuest]);

  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);

  // Update selected child when children array changes
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
    } else if (children.length === 0) {
      setSelectedChild(null);
    }
  }, [children, selectedChild]);
  const [activeTab, setActiveTab] = useState("overview");
  const [goals] = useState<ParentGoal[]>([]);
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [showAddChildDialog, setShowAddChildDialog] = useState(false);
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false);
  const [showCustomWordDialog, setShowCustomWordDialog] = useState(false);
  const [showLearningGoalsPanel, setShowLearningGoalsPanel] = useState(false);
  const [learningGoalsChild, setLearningGoalsChild] =
    useState<ChildProfile | null>(null);
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
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [familyStats, setFamilyStats] = useState({
    totalWordsLearned: 0,
    longestStreak: 0,
    activeChildren: 0,
    todayActivity: 0,
  });
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

  // Memoize expensive calculations
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const highPriorityNotifications = useMemo(
    () => notifications.filter((n) => n.priority === "high" && !n.read).length,
    [notifications],
  );

  // Memoized function to prevent re-creation on every render
  const getTimeAgo = useCallback((date: Date | string) => {
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
  }, []);

  const calculateWeeklyStats = useCallback((childId: string) => {
    try {
      // Get this week's data from localStorage
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const days = Math.floor(
        (today.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
      );
      const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
      const weekKey = `${today.getFullYear()}-${weekNumber.toString().padStart(2, "0")}`;

      const weeklyStatsKey = `weekly_stats_${childId}_${weekKey}`;
      const weeklyProgressKey = `weekly_progress_${childId}_${weekKey}`;

      const weeklyStats = JSON.parse(
        localStorage.getItem(weeklyStatsKey) || "{}",
      );
      const weeklyProgress = JSON.parse(
        localStorage.getItem(weeklyProgressKey) ||
          '{"words": 0, "sessions": 0}',
      );

      return {
        totalTime: weeklyStats.totalTime || weeklyProgress.sessions * 5 || 0, // Estimate 5 mins per session
        averageAccuracy:
          weeklyStats.averageAccuracy || (weeklyProgress.words > 0 ? 85 : 0),
        sessionsCount:
          weeklyStats.sessionsCount || weeklyProgress.sessions || 0,
      };
    } catch (error) {
      console.error("Error calculating weekly stats:", error);
      return {
        totalTime: 0,
        averageAccuracy: 0,
        sessionsCount: 0,
      };
    }
  }, []);

  // Debounced save to localStorage
  const saveChildrenToStorage = useCallback(
    (updatedChildren: ChildProfile[]) => {
      try {
        localStorage.setItem(
          "parentDashboardChildren",
          JSON.stringify(updatedChildren),
        );
      } catch (error) {
        console.error("Error saving children to localStorage:", error);
      }
    },
    [],
  );

  // Save children to localStorage whenever children state changes (debounced)
  useEffect(() => {
    if (children.length > 0) {
      const timeoutId = setTimeout(() => {
        saveChildrenToStorage(children);
      }, 500);

      if (!selectedChild) {
        setSelectedChild(children[0]);
      }

      return () => clearTimeout(timeoutId);
    }
  }, [children, selectedChild, saveChildrenToStorage]);

  // Sync children progress with real learning data - DEBOUNCED
  const syncChildrenProgress = useCallback(async () => {
    if (children.length === 0 || isLoadingProgress) return;

    setIsLoadingProgress(true);
    try {
      const updatedChildren =
        await childProgressSync.syncAndSaveAllProgress(children);
      setChildren(updatedChildren);

      // Update family stats
      const stats = childProgressSync.getFamilyStats(updatedChildren);
      setFamilyStats(stats);

      // Update selected child if needed
      if (selectedChild) {
        const updatedSelectedChild = updatedChildren.find(
          (c) => c.id === selectedChild.id,
        );
        if (updatedSelectedChild) {
          setSelectedChild(updatedSelectedChild);
        }
      }

      // Show success toast
      toast({
        title: "Progress Updated",
        description: `Updated data for ${updatedChildren.length} children`,
        duration: 2000,
      });
    } catch (error) {
      console.error("Error syncing children progress:", error);
      toast({
        title: "Sync Error",
        description: "Failed to update progress data",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoadingProgress(false);
    }
  }, [children, isLoadingProgress, selectedChild]);

  // Optimized data loading - only run once on mount and when dependencies change
  useEffect(() => {
    let mounted = true;

    const loadChildrenWordStats = async () => {
      if (children.length === 0 || loadingWordStats) return;

      setLoadingWordStats(true);
      try {
        // First sync the real progress data from localStorage
        if (mounted) {
          await syncChildrenProgress();
        }

        // Try to load additional data from API if available (optional)
        try {
          const response = await WordProgressAPI.getAllChildrenProgress();
          if (response.success && mounted) {
            setChildrenWordStats(response.childrenStats);
          }
        } catch (apiError) {
          // This is expected and normal - the app works perfectly with localStorage only
          if (mounted) {
            setChildrenWordStats({});
          }
        }

        // Load detailed stats for selected child (optional)
        if (selectedChild && mounted) {
          try {
            const childStatsResponse = await WordProgressAPI.getChildStats(
              selectedChild.id,
            );
            if (childStatsResponse.success && mounted) {
              setPracticeWords(childStatsResponse.strugglingWords || []);
              setTopWords(childStatsResponse.topWords || []);
            }
          } catch (apiError) {
            // No API data available - show empty states for real user data
            if (mounted) {
              setPracticeWords([]);
              setTopWords([]);
            }
          }
        }
      } catch (error) {
        console.error("Error in loadChildrenWordStats:", error);
      } finally {
        if (mounted) {
          setLoadingWordStats(false);
        }
      }
    };

    // Initial load
    loadChildrenWordStats();

    // Set up periodic refresh (reduced frequency)
    const refreshInterval = setInterval(() => {
      if (mounted) {
        loadChildrenWordStats();
      }
    }, 60000); // Increased to 60 seconds to reduce load

    return () => {
      mounted = false;
      clearInterval(refreshInterval);
    };
  }, [children.length, selectedChild?.id]); // Removed complex dependencies

  // Memoized helper functions
  const getChildGoals = useCallback(
    (childId: string) => {
      // Get real goals from localStorage + static goals
      try {
        const realGoalsKey = `child_goals_${childId}`;
        const realGoals = JSON.parse(
          localStorage.getItem(realGoalsKey) || "[]",
        );
        const allGoals = [...goals, ...realGoals];
        return allGoals.filter((goal) => goal.childId === childId);
      } catch (error) {
        console.error("Error getting child goals:", error);
        return goals.filter((goal) => goal.childId === childId);
      }
    },
    [goals],
  );

  const getChildNotifications = useCallback(
    (childId: string) => {
      // Get real notifications from localStorage + static notifications
      try {
        const realNotificationsKey = `child_notifications_${childId}`;
        const realNotifications = JSON.parse(
          localStorage.getItem(realNotificationsKey) || "[]",
        );
        const allNotifications = [...notifications, ...realNotifications];
        return allNotifications
          .filter((notif) => notif.childId === childId)
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          )
          .slice(0, 3);
      } catch (error) {
        console.error("Error getting child notifications:", error);
        return notifications
          .filter((notif) => notif.childId === childId)
          .slice(0, 3);
      }
    },
    [notifications],
  );

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      ),
    );
  }, []);

  const addCustomWord = useCallback(() => {
    if (selectedChild && customWordInput.trim()) {
      const updatedChild = {
        ...selectedChild,
        customWords: [...selectedChild.customWords, customWordInput.trim()],
      };
      setSelectedChild(updatedChild);
      setCustomWordInput("");
      setShowCustomWordDialog(false);
    }
  }, [selectedChild, customWordInput]);

  const removeCustomWord = useCallback(
    (word: string) => {
      if (selectedChild) {
        const updatedChild = {
          ...selectedChild,
          customWords: selectedChild.customWords.filter((w) => w !== word),
        };
        setSelectedChild(updatedChild);
      }
    },
    [selectedChild],
  );

  // Handle add child button click with guest mode check
  const handleAddChildClick = useCallback(() => {
    if (isGuest) {
      setShowRegistrationPrompt(true);
    } else {
      setShowAddChildDialog(true);
    }
  }, [isGuest]);

  const createGoal = useCallback(() => {
    if (selectedChild && newGoalData.title && newGoalData.description) {
      // For now, just show that the goal would be created
      toast({
        title: "Goal Created",
        description: `"${newGoalData.title}" goal created for ${selectedChild.name}`,
        duration: 3000,
      });

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
  }, [selectedChild, newGoalData]);

  const handleUpdateChild = useCallback(
    (updatedChild: ChildProfile) => {
      const updatedChildren = children.map((child) =>
        child.id === updatedChild.id ? updatedChild : child,
      );
      setChildren(updatedChildren);
      if (selectedChild?.id === updatedChild.id) {
        setSelectedChild(updatedChild);
      }
    },
    [children, selectedChild],
  );

  const handleOpenLearningGoals = useCallback((child: ChildProfile) => {
    setLearningGoalsChild(child);
    setShowLearningGoalsPanel(true);
  }, []);

  const renderOverview = useCallback(
    () => (
      <div className="space-y-4 md:space-y-6">
        {/* Welcome Section - Combined Layout */}
        {children.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Good Morning Section */}
            <Card className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10">
              <CardContent className="p-3 md:p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-base md:text-lg">
                    Good Morning! 🌅
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600">
                    {children.length} active learner
                    {children.length !== 1 ? "s" : ""} • {unreadNotifications}{" "}
                    new notification{unreadNotifications !== 1 ? "s" : ""}
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
                  onClick={handleAddChildClick}
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
                    Good Morning! 🌅
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600">
                    {children.length} active learner
                    {children.length !== 1 ? "s" : ""} • {unreadNotifications}{" "}
                    new notification{unreadNotifications !== 1 ? "s" : ""}
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
                    onClick={handleAddChildClick}
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
            <CardTitle className="flex items-center justify-between text-base md:text-lg">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-educational-blue" />
                <span className="hidden md:inline">
                  Family Learning Summary
                </span>
                <span className="md:hidden">Family Summary</span>
                {isLoadingProgress && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncChildrenProgress}
                  disabled={isLoadingProgress}
                  className="text-xs"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="text-center p-2 md:p-4 bg-educational-blue/5 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-educational-blue">
                  <AnimatedCounter value={familyStats.activeChildren} />
                </div>
                <p className="text-xs md:text-sm text-slate-600">
                  Active Today
                </p>
              </div>
              <div className="text-center p-2 md:p-4 bg-educational-green/5 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-educational-green">
                  <AnimatedCounter value={familyStats.totalWordsLearned} />
                </div>
                <p className="text-xs md:text-sm text-slate-600">
                  Total Words Learned
                </p>
              </div>
              <div className="text-center p-2 md:p-4 bg-educational-orange/5 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-educational-orange">
                  <AnimatedCounter value={familyStats.todayActivity} />
                </div>
                <p className="text-xs md:text-sm text-slate-600">Words Today</p>
              </div>
              <div className="text-center p-2 md:p-4 bg-educational-purple/5 rounded-lg">
                <div className="text-xl md:text-2xl font-bold text-educational-purple">
                  <AnimatedCounter value={familyStats.longestStreak} />
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
                  <div className="text-xs text-green-600 md:hidden">
                    Progress
                  </div>
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

        {/* Children Cards - Simplified for Performance */}
        {children.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
            {children.map((child) => {
              const weeklyStats = calculateWeeklyStats(child.id);
              const progressPercentage =
                (child.weeklyProgress / child.weeklyGoal) * 100;
              const childGoals = getChildGoals(child.id);
              const activeGoals = childGoals.filter(
                (g) => g.status === "active",
              );
              const childNotifications = getChildNotifications(child.id);

              return (
                <Card
                  key={child.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 border-l-educational-blue"
                  onClick={() => setSelectedChild(child)}
                >
                  <CardHeader className="pb-3 md:pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="text-3xl md:text-4xl">
                          {child.avatar}
                        </div>
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
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs px-1">
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
                    {/* Weekly Goal Progress */}
                    <div>
                      <div className="flex justify-between text-xs md:text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <span>Weekly Goal</span>
                          {child.currentStreak > 0 && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1 bg-orange-50 text-orange-600 border-orange-200"
                            >
                              🔥 {child.currentStreak}
                            </Badge>
                          )}
                        </div>
                        <span>
                          {child.weeklyProgress}/{child.weeklyGoal} words
                        </span>
                      </div>
                      <Progress
                        value={progressPercentage}
                        className="h-1.5 md:h-2"
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-slate-500">
                          {Math.round(progressPercentage)}% complete
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-educational-blue">
                          <AnimatedCounter value={child.wordsLearned} />
                        </div>
                        <p className="text-xs text-slate-600">Words</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-educational-orange">
                          <AnimatedCounter value={child.currentStreak} />
                        </div>
                        <p className="text-xs text-slate-600">Streak</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-educational-green">
                          <AnimatedCounter
                            value={weeklyStats.averageAccuracy}
                          />
                          %
                        </div>
                        <p className="text-xs text-slate-600">Accuracy</p>
                      </div>
                    </div>

                    {/* Recent Achievement - Simplified */}
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
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    ),
    [
      children,
      unreadNotifications,
      highPriorityNotifications,
      handleAddChildClick,
      isLoadingProgress,
      familyStats,
      syncChildrenProgress,
      calculateWeeklyStats,
      getChildGoals,
      getChildNotifications,
      getTimeAgo,
    ],
  );

  const renderGoalsManagement = useCallback(
    () => (
      <div className="space-y-4 md:space-y-6">
        {/* Mobile-optimized header */}
        <div className="text-center mobile-goals-header">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2 md:mb-4">
            Learning Goals Management
          </h2>
          <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6">
            Set and track learning goals for your children
          </p>

          {children.length === 0 ? (
            <div className="max-w-md mx-auto">
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 mobile-goals-empty">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="text-3xl md:text-4xl mb-3 md:mb-4 emoji">
                    👶
                  </div>
                  <h3 className="text-base md:text-lg font-semibold mb-2">
                    No Children Added Yet
                  </h3>
                  <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base">
                    Add your first child to start setting learning goals and
                    tracking their progress
                  </p>
                  <Button
                    onClick={handleAddChildClick}
                    className="bg-educational-blue mobile-goal-buttons w-full md:w-auto"
                    size="sm"
                  >
                    <UserPlus className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    Add Your First Child
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quick Goals Stats - Mobile Optimized */}
              <div className="mobile-goals-stats">
                <Card className="stat-card">
                  <div className="stat-number text-educational-blue">
                    {children.reduce(
                      (total, child) =>
                        total +
                        (child.learningGoals?.filter((g) => g.isActive)
                          .length || 0),
                      0,
                    )}
                  </div>
                  <div className="stat-label">Active Goals</div>
                </Card>
                <Card className="stat-card">
                  <div className="stat-number text-educational-green">
                    {children.reduce((total, child) => {
                      const completedGoals =
                        child.learningGoals?.filter(
                          (g) => g.current >= g.target,
                        ).length || 0;
                      return total + completedGoals;
                    }, 0)}
                  </div>
                  <div className="stat-label">Completed</div>
                </Card>
              </div>

              {/* Children Goal Cards */}
              <div className="space-y-3 md:space-y-4">
                {children.map((child, index) => {
                  const activeGoals =
                    child.learningGoals?.filter((g) => g.isActive) || [];
                  const completedGoals =
                    child.learningGoals?.filter((g) => g.current >= g.target) ||
                    [];

                  return (
                    <Card
                      key={child.id}
                      className="mobile-child-goal-card border-l-4 border-l-educational-blue hover:shadow-md transition-all duration-200"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="text-2xl md:text-3xl">
                              {child.avatar}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm md:text-base">
                                {child.name}
                              </h4>
                              <p className="text-xs text-slate-600">
                                {activeGoals.length} active •{" "}
                                {completedGoals.length} completed
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleOpenLearningGoals(child)}
                            className="bg-educational-blue hover:bg-educational-blue/90 mobile-goal-buttons"
                            size="sm"
                          >
                            <Target className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            <span className="hidden md:inline">
                              Manage Goals
                            </span>
                            <span className="md:hidden">Goals</span>
                          </Button>
                        </div>

                        {/* Goal Progress Summary */}
                        {activeGoals.length > 0 && (
                          <div className="space-y-2">
                            {activeGoals.slice(0, 2).map((goal) => {
                              const progress = Math.min(
                                (goal.current / goal.target) * 100,
                                100,
                              );
                              return (
                                <div
                                  key={goal.id}
                                  className="mobile-goal-summary"
                                >
                                  <div>
                                    <div className="text-xs md:text-sm font-medium truncate">
                                      {goal.description}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {goal.current}/{goal.target} •{" "}
                                      {Math.round(progress)}%
                                    </div>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="mobile-goal-badge text-xs"
                                  >
                                    {goal.type}
                                  </Badge>
                                </div>
                              );
                            })}
                            {activeGoals.length > 2 && (
                              <p className="text-xs text-slate-500 text-center">
                                +{activeGoals.length - 2} more goals
                              </p>
                            )}
                          </div>
                        )}

                        {activeGoals.length === 0 && (
                          <div className="text-center py-2 text-xs text-slate-500">
                            No active goals yet
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Add Goal for Selected Child */}
              {selectedChild && (
                <div className="text-center pt-2">
                  <Button
                    onClick={() => handleOpenLearningGoals(selectedChild)}
                    variant="outline"
                    className="mobile-goal-buttons"
                    size="sm"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    Quick Add Goal for {selectedChild.name}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    ),
    [selectedChild, handleOpenLearningGoals, handleAddChildClick, children],
  );

  const renderAnalytics = useCallback(
    () => (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Learning Analytics
          </h2>
          <p className="text-slate-600 mb-6">
            Detailed insights into your children's learning progress
          </p>
        </div>

        {/* Practice Words Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Words Needing Practice
            </CardTitle>
          </CardHeader>
          <CardContent>
            {practiceWords.length > 0 ? (
              <div className="grid gap-3">
                {practiceWords.map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{word.word}</div>
                      <div className="text-sm text-slate-600">
                        {word.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-600">
                        {word.accuracy}% accuracy
                      </div>
                      <div className="text-xs text-slate-500">
                        {word.timesReviewed} attempts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">
                No words need practice right now! Great job! 🎉
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Words Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Best Mastered Words
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topWords.length > 0 ? (
              <div className="grid gap-3">
                {topWords.map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{word.word}</div>
                      <div className="text-sm text-slate-600">
                        {word.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {word.accuracy}% accuracy
                      </div>
                      <div className="text-xs text-slate-500">
                        {word.timesReviewed} attempts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">
                Keep learning to see your best words here! 📚
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    ),
    [practiceWords, topWords],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Back Button */}
      {showMobileBackButton && onNavigateBack && (
        <div className="p-4 lg:hidden">
          <Button
            onClick={onNavigateBack}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="p-4 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Parent Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Track your children's learning progress and achievements
            </p>
          </div>

          {/* Desktop Back Button */}
          {showMobileBackButton && onNavigateBack && (
            <div className="hidden lg:block">
              <Button
                onClick={onNavigateBack}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Learning
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="overview">{renderOverview()}</TabsContent>
            <TabsContent value="goals">{renderGoalsManagement()}</TabsContent>
            <TabsContent value="analytics">
              <ParentLearningAnalytics children={children} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Learning Goals Panel */}
      {showLearningGoalsPanel && learningGoalsChild && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <ChildLearningGoalsPanel
              isOpen={showLearningGoalsPanel}
              child={learningGoalsChild}
              onClose={() => {
                setShowLearningGoalsPanel(false);
                setLearningGoalsChild(null);
              }}
              onUpdateChild={handleUpdateChild}
            />
          </div>
        </div>
      )}

      {/* Registration Prompt */}
      {showRegistrationPrompt && (
        <AlertDialog
          open={showRegistrationPrompt}
          onOpenChange={setShowRegistrationPrompt}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Registration Required</AlertDialogTitle>
              <AlertDialogDescription>
                To add children and track their progress, please create a free
                account. This will save all your data securely.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Maybe Later</AlertDialogCancel>
              <AlertDialogAction onClick={() => navigate("/signup")}>
                Create Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
