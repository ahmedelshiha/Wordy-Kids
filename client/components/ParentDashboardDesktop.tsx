import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronRight,
  Palette,
  Shield,
  AlertCircle,
  CheckCircle,
  Home,
  Activity,
  GraduationCap,
  Trophy,
  Maximize2,
  Minimize2,
  RefreshCw,
  MoreHorizontal,
  Grid3x3,
  List,
  Layout,
  Menu,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { WordProgressAPI } from "@/lib/wordProgressApi";
import { ChildWordStats } from "@shared/api";
import { SmartWordSelector } from "@/lib/smartWordSelection";
import { childProgressSync } from "@/lib/childProgressSync";
import { toast } from "@/hooks/use-toast";
import { ParentLearningAnalytics } from "@/components/ParentLearningAnalytics";
import { cn } from "@/lib/utils";

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

interface ParentDashboardDesktopProps {
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
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Learn 5 animal words daily",
        reward: "Extra playtime",
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
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Learn 3 nature words daily",
        reward: "Nature walk",
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

export const ParentDashboardDesktop: React.FC<ParentDashboardDesktopProps> = ({
  children: propChildren,
  sessions = [],
  onNavigateBack,
}) => {
  const { isGuest, user } = useAuth();
  const navigate = useNavigate();

  // State
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showLearningGoalsPanel, setShowLearningGoalsPanel] = useState(false);
  const [learningGoalsChild, setLearningGoalsChild] = useState<ChildProfile | null>(null);
  const [showAddChildDialog, setShowAddChildDialog] = useState(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  
  // Quick actions state
  const [quickActionsVisible, setQuickActionsVisible] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Analytics state
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("30d");
  
  // New child data
  const [newChildData, setNewChildData] = useState({
    name: "",
    age: 6,
    avatar: "👶",
    preferredLearningTime: "",
    difficultyPreference: "easy" as const,
  });

  // Stats
  const [familyStats, setFamilyStats] = useState({
    totalWordsLearned: 0,
    longestStreak: 0,
    activeChildren: 0,
    todayActivity: 0,
  });

  // Initialize children data
  useEffect(() => {
    const loadChildren = () => {
      try {
        const savedChildren = localStorage.getItem("parentDashboardChildren");
        if (savedChildren) {
          const parsed = JSON.parse(savedChildren);
          const loadedChildren = parsed.map((child: any) => ({
            ...child,
            lastActive: new Date(child.lastActive),
            recentAchievements: child.recentAchievements?.map((achievement: any) => ({
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
      setChildren([]);
    };

    loadChildren();
  }, [isGuest]);

  // Update selected child when children array changes
  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
    } else if (children.length === 0) {
      setSelectedChild(null);
    }
  }, [children, selectedChild]);

  // Save children to localStorage
  const saveChildrenToStorage = useCallback((updatedChildren: ChildProfile[]) => {
    try {
      localStorage.setItem("parentDashboardChildren", JSON.stringify(updatedChildren));
    } catch (error) {
      console.error("Error saving children to localStorage:", error);
    }
  }, []);

  // Save children whenever they change
  useEffect(() => {
    if (children.length > 0) {
      const timeoutId = setTimeout(() => {
        saveChildrenToStorage(children);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [children, saveChildrenToStorage]);

  // Sync children progress
  const syncChildrenProgress = useCallback(async () => {
    if (children.length === 0 || isLoadingProgress) return;

    setIsLoadingProgress(true);
    try {
      const updatedChildren = await childProgressSync.syncAndSaveAllProgress(children);
      setChildren(updatedChildren);

      const stats = childProgressSync.getFamilyStats(updatedChildren);
      setFamilyStats(stats);

      if (selectedChild) {
        const updatedSelectedChild = updatedChildren.find(c => c.id === selectedChild.id);
        if (updatedSelectedChild) {
          setSelectedChild(updatedSelectedChild);
        }
      }

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

  // Get time ago helper
  const getTimeAgo = useCallback((date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "Unknown";

    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }, []);

  // Handle add child
  const handleAddChildClick = useCallback(() => {
    if (isGuest) {
      setShowRegistrationPrompt(true);
    } else {
      setShowAddChildDialog(true);
    }
  }, [isGuest]);

  // Handle add child form
  const addChild = useCallback(() => {
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
        preferredLearningTime: newChildData.preferredLearningTime,
        difficultyPreference: newChildData.difficultyPreference,
        parentNotes: "",
        customWords: [],
        weeklyTarget: 15,
        monthlyTarget: 60,
        recentAchievements: [],
        learningStrengths: [],
        areasForImprovement: [],
        motivationalRewards: [],
        learningGoals: [],
        learningPreferences: {
          autoAdjustGoals: true,
          adaptiveDifficulty: true,
          preferredCategories: ["Animals"],
          focusAreas: [],
          reminderTimes: ["16:00"],
          motivationStyle: "encouraging",
        },
      };

      setChildren(prev => [...prev, newChild]);
      setSelectedChild(newChild);
      setNewChildData({
        name: "",
        age: 6,
        avatar: "👶",
        preferredLearningTime: "",
        difficultyPreference: "easy",
      });
      setShowAddChildDialog(false);

      toast({
        title: "Child Added",
        description: `${newChild.name} has been added to your dashboard`,
        duration: 3000,
      });
    }
  }, [newChildData]);

  // Handle learning goals
  const handleOpenLearningGoals = useCallback((child: ChildProfile) => {
    setLearningGoalsChild(child);
    setShowLearningGoalsPanel(true);
  }, []);

  const handleUpdateChild = useCallback((updatedChild: ChildProfile) => {
    const updatedChildren = children.map(child =>
      child.id === updatedChild.id ? updatedChild : child
    );
    setChildren(updatedChildren);
    if (selectedChild?.id === updatedChild.id) {
      setSelectedChild(updatedChild);
    }
  }, [children, selectedChild]);

  // Sidebar navigation items
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home, badge: null },
    { id: "analytics", label: "Analytics", icon: BarChart3, badge: null },
    { id: "goals", label: "Goals", icon: Target, badge: children.reduce((total, child) => total + (child.learningGoals?.filter(g => g.isActive).length || 0), 0) },
    { id: "achievements", label: "Achievements", icon: Trophy, badge: null },
    { id: "settings", label: "Settings", icon: Settings, badge: null },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveTab("overview");
            break;
          case '2':
            e.preventDefault();
            setActiveTab("analytics");
            break;
          case '3':
            e.preventDefault();
            setActiveTab("goals");
            break;
          case 'n':
            e.preventDefault();
            handleAddChildClick();
            break;
          case 'r':
            e.preventDefault();
            syncChildrenProgress();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddChildClick, syncChildrenProgress]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Desktop Sidebar */}
        <div className={cn(
          "fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-40",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div>
                  <h2 className="font-bold text-lg text-slate-800">Parent Hub</h2>
                  <p className="text-sm text-slate-600">Learning Dashboard</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <div className="p-2">
            {sidebarItems.map((item) => (
              <Tooltip key={item.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start mb-1 h-10",
                      sidebarCollapsed && "px-2 justify-center"
                    )}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className={cn("h-4 w-4", !sidebarCollapsed && "mr-3")} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                {sidebarCollapsed && (
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>

          {/* Quick Stats in Sidebar */}
          {!sidebarCollapsed && (
            <div className="p-4 mt-4 border-t border-slate-200">
              <h3 className="font-medium text-sm text-slate-700 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Active Children</span>
                  <Badge variant="outline">{children.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Total Words</span>
                  <Badge variant="outline">{familyStats.totalWordsLearned}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Best Streak</span>
                  <Badge variant="outline">{familyStats.longestStreak}</Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}>
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {onNavigateBack && (
                  <Button variant="ghost" size="sm" onClick={onNavigateBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Learning
                  </Button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    {sidebarItems.find(item => item.id === activeTab)?.label || "Dashboard"}
                  </h1>
                  <p className="text-slate-600">
                    {children.length} active learner{children.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Time Range Selector */}
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Refresh Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={syncChildrenProgress}
                      disabled={isLoadingProgress}
                    >
                      <RefreshCw className={cn("h-4 w-4", isLoadingProgress && "animate-spin")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh Data (Ctrl+R)</p>
                  </TooltipContent>
                </Tooltip>

                {/* Add Child Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleAddChildClick}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Child
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add New Child (Ctrl+N)</p>
                  </TooltipContent>
                </Tooltip>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                        {user?.email?.[0]?.toUpperCase() || 'P'}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Parent Dashboard</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || "Guest User"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Export Data</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {isGuest ? (
                      <DropdownMenuItem onClick={() => navigate("/signup")}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Create Account</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Family Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Active Learners</p>
                          <div className="text-3xl font-bold text-blue-700">
                            <AnimatedCounter value={children.length} />
                          </div>
                        </div>
                        <Users className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-600">Words Learned</p>
                          <div className="text-3xl font-bold text-green-700">
                            <AnimatedCounter value={familyStats.totalWordsLearned} />
                          </div>
                        </div>
                        <BookOpen className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-600">Longest Streak</p>
                          <div className="text-3xl font-bold text-orange-700">
                            <AnimatedCounter value={familyStats.longestStreak} />
                          </div>
                        </div>
                        <Zap className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">Today's Activity</p>
                          <div className="text-3xl font-bold text-purple-700">
                            <AnimatedCounter value={familyStats.todayActivity} />
                          </div>
                        </div>
                        <Activity className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Children Grid/List View */}
                {children.length === 0 ? (
                  <Card className="bg-gradient-to-r from-slate-50 to-blue-50">
                    <CardContent className="p-12 text-center">
                      <div className="text-6xl mb-4">👶</div>
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        No Children Added Yet
                      </h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Get started by adding your first child to track their learning progress and achievements
                      </p>
                      <Button onClick={handleAddChildClick} size="lg">
                        <UserPlus className="h-5 w-5 mr-2" />
                        Add Your First Child
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className={cn(
                    "gap-6",
                    viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "space-y-4"
                  )}>
                    {children.map((child) => (
                      <Card
                        key={child.id}
                        className={cn(
                          "cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500",
                          selectedChild?.id === child.id && "ring-2 ring-blue-500 ring-opacity-50"
                        )}
                        onClick={() => setSelectedChild(child)}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-3xl">{child.avatar}</div>
                              <div>
                                <CardTitle className="text-lg">{child.name}</CardTitle>
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
                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Weekly Goal</span>
                              <span>{child.weeklyProgress}/{child.weeklyGoal} words</span>
                            </div>
                            <Progress 
                              value={(child.weeklyProgress / child.weeklyGoal) * 100} 
                              className="h-2"
                            />
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-blue-600">
                                <AnimatedCounter value={child.wordsLearned} />
                              </div>
                              <p className="text-xs text-slate-600">Words</p>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-orange-600">
                                <AnimatedCounter value={child.currentStreak} />
                              </div>
                              <p className="text-xs text-slate-600">Streak</p>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-600">
                                {child.level}
                              </div>
                              <p className="text-xs text-slate-600">Level</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenLearningGoals(child);
                              }}
                            >
                              <Target className="h-4 w-4 mr-1" />
                              Goals
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab("analytics");
                                setSelectedChild(child);
                              }}
                            >
                              <BarChart3 className="h-4 w-4 mr-1" />
                              Analytics
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <ParentLearningAnalytics children={children} />
              </div>
            )}

            {activeTab === "goals" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Learning Goals</h2>
                    <p className="text-slate-600">Manage and track learning objectives for your children</p>
                  </div>
                  {selectedChild && (
                    <Button onClick={() => handleOpenLearningGoals(selectedChild)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Goal for {selectedChild.name}
                    </Button>
                  )}
                </div>

                {children.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Target className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        No Children Added Yet
                      </h3>
                      <p className="text-slate-600 mb-6">
                        Add children to start setting learning goals
                      </p>
                      <Button onClick={handleAddChildClick}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Child
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {children.map((child) => {
                      const activeGoals = child.learningGoals?.filter(g => g.isActive) || [];
                      const completedGoals = child.learningGoals?.filter(g => g.current >= g.target) || [];

                      return (
                        <Card key={child.id} className="border-l-4 border-l-blue-500">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="text-3xl">{child.avatar}</div>
                                <div>
                                  <CardTitle>{child.name}</CardTitle>
                                  <p className="text-sm text-slate-600">
                                    {activeGoals.length} active • {completedGoals.length} completed
                                  </p>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleOpenLearningGoals(child)}
                                size="sm"
                              >
                                <Target className="h-4 w-4 mr-2" />
                                Manage
                              </Button>
                            </div>
                          </CardHeader>
                          
                          <CardContent>
                            {activeGoals.length > 0 ? (
                              <div className="space-y-3">
                                {activeGoals.slice(0, 3).map((goal) => {
                                  const progress = Math.min((goal.current / goal.target) * 100, 100);
                                  return (
                                    <div key={goal.id} className="p-3 bg-slate-50 rounded-lg">
                                      <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{goal.description}</p>
                                          <p className="text-xs text-slate-600">
                                            {goal.current}/{goal.target} • {Math.round(progress)}%
                                          </p>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                          {goal.type}
                                        </Badge>
                                      </div>
                                      <Progress value={progress} className="h-2" />
                                    </div>
                                  );
                                })}
                                {activeGoals.length > 3 && (
                                  <p className="text-xs text-slate-500 text-center">
                                    +{activeGoals.length - 3} more goals
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-slate-500">
                                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No active goals yet</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "achievements" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Achievements & Milestones</h2>
                  <p className="text-slate-600">Celebrate your children's learning successes</p>
                </div>

                {children.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Trophy className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        No Achievements Yet
                      </h3>
                      <p className="text-slate-600 mb-6">
                        Add children to start tracking their achievements
                      </p>
                      <Button onClick={handleAddChildClick}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Child
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {children.map((child) => (
                      <Card key={child.id} className="border-l-4 border-l-yellow-500">
                        <CardHeader>
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl">{child.avatar}</div>
                            <div>
                              <CardTitle>{child.name}</CardTitle>
                              <p className="text-sm text-slate-600">
                                {child.recentAchievements.length} achievement{child.recentAchievements.length !== 1 ? 's' : ''} earned
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {child.recentAchievements.length > 0 ? (
                            <div className="space-y-3">
                              {child.recentAchievements.map((achievement) => (
                                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                                  <div className="text-2xl">{achievement.icon}</div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{achievement.title}</p>
                                    <p className="text-xs text-slate-600">{achievement.description}</p>
                                    <p className="text-xs text-slate-500">{getTimeAgo(achievement.earnedAt)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-slate-500">
                              <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No achievements yet</p>
                              <p className="text-xs">Keep learning to unlock achievements!</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Dashboard Settings</h2>
                  <p className="text-slate-600">Customize your parent dashboard experience</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dashboard Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Collapsed Sidebar</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        >
                          {sidebarCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Quick Actions Visible</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuickActionsVisible(!quickActionsVisible)}
                        >
                          {quickActionsVisible ? <Eye className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isGuest ? (
                        <div className="text-center py-6">
                          <p className="text-slate-600 mb-4">
                            Create an account to access additional settings and save your data permanently.
                          </p>
                          <Button onClick={() => navigate("/signup")}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create Account
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <Label>Email</Label>
                            <Input value={user?.email || ""} disabled />
                          </div>
                          <Button variant="outline" className="w-full">
                            <Download className="h-4 w-4 mr-2" />
                            Export All Data
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Child Dialog */}
        <Dialog open={showAddChildDialog} onOpenChange={setShowAddChildDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Child</DialogTitle>
              <DialogDescription>
                Add a child to start tracking their learning progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newChildData.name}
                  onChange={(e) => setNewChildData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter child's name"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Select
                  value={newChildData.age.toString()}
                  onValueChange={(value) => setNewChildData(prev => ({ ...prev, age: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(age => (
                      <SelectItem key={age} value={age.toString()}>{age} years old</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="avatar">Avatar</Label>
                <div className="flex gap-2 mt-2">
                  {["👶", "👧", "👦", "🧒", "👴", "👵"].map(emoji => (
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
              <div>
                <Label htmlFor="learningTime">Preferred Learning Time</Label>
                <Select
                  value={newChildData.preferredLearningTime}
                  onValueChange={(value) => setNewChildData(prev => ({ ...prev, preferredLearningTime: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning (7-9 AM)">Morning (7-9 AM)</SelectItem>
                    <SelectItem value="Mid-Morning (9-11 AM)">Mid-Morning (9-11 AM)</SelectItem>
                    <SelectItem value="After school (3-5 PM)">After school (3-5 PM)</SelectItem>
                    <SelectItem value="Evening (6-8 PM)">Evening (6-8 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddChildDialog(false)}>
                Cancel
              </Button>
              <Button onClick={addChild} disabled={!newChildData.name.trim()}>
                Add Child
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
          <AlertDialog open={showRegistrationPrompt} onOpenChange={setShowRegistrationPrompt}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Registration Required</AlertDialogTitle>
                <AlertDialogDescription>
                  To add children and track their progress, please create a free account. 
                  This will save all your data securely.
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
    </TooltipProvider>
  );
};
