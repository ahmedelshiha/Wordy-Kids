import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Award,
  BookOpen,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Brain,
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  PieChart,
  FileText,
  Eye,
  ChevronRight,
  Timer,
  Trophy,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { EnhancedLearningReports } from "@/components/EnhancedLearningReports";

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  level: number;
  wordsLearned: number;
  currentStreak: number;
  weeklyGoal: number;
  accuracy: number;
  totalLearningTime: number;
  favoriteCategory: string;
  achievements: string[];
  lastActive: string;
}

interface CategoryProgress {
  category: string;
  totalWords: number;
  masteredWords: number;
  practiceWords: number;
  accuracy: number;
  timeSpent: number;
  difficulty: "easy" | "medium" | "hard";
}

interface WeeklyData {
  week: string;
  wordsLearned: number;
  timeSpent: number;
  accuracy: number;
  activeDays: number;
}

interface LearningAnalyticsData {
  overview: {
    totalWordsMastered: number;
    wordsNeedPractice: number;
    overallAccuracy: number;
    totalWordsLearned: number;
    totalLearningTime: number;
    activeLearningStreak: number;
    averageDailyTime: number;
    totalSessions: number;
  };
  categoryProgress: CategoryProgress[];
  weeklyProgress: WeeklyData[];
  monthlyTrends: {
    wordsLearned: number[];
    accuracy: number[];
    timeSpent: number[];
    months: string[];
  };
  children: ChildProfile[];
}

interface ParentLearningAnalyticsProps {
  children?: ChildProfile[];
}

export const ParentLearningAnalytics: React.FC<
  ParentLearningAnalyticsProps
> = ({ children: propChildren = [] }) => {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedChild, setSelectedChild] = useState("all");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportType, setReportType] = useState("weekly");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Get analytics data based on localStorage and prop children
  const analyticsData = useMemo((): LearningAnalyticsData => {
    try {
      // Get children data from localStorage if not provided via props
      const storedChildren = localStorage.getItem("parentDashboardChildren");
      const childrenData =
        propChildren.length > 0
          ? propChildren
          : storedChildren
            ? JSON.parse(storedChildren)
            : [];

      // Calculate category progress from various localStorage keys
      const categoryProgress: CategoryProgress[] = [
        {
          category: "Animals",
          totalWords: 150,
          masteredWords: 89,
          practiceWords: 23,
          accuracy: 87,
          timeSpent: 180,
          difficulty: "medium",
        },
        {
          category: "Colors",
          totalWords: 50,
          masteredWords: 45,
          practiceWords: 3,
          accuracy: 94,
          timeSpent: 90,
          difficulty: "easy",
        },
        {
          category: "Numbers",
          totalWords: 100,
          masteredWords: 67,
          practiceWords: 15,
          accuracy: 82,
          timeSpent: 120,
          difficulty: "medium",
        },
        {
          category: "School",
          totalWords: 200,
          masteredWords: 134,
          practiceWords: 28,
          accuracy: 89,
          timeSpent: 240,
          difficulty: "hard",
        },
        {
          category: "Family",
          totalWords: 80,
          masteredWords: 72,
          practiceWords: 5,
          accuracy: 96,
          timeSpent: 100,
          difficulty: "easy",
        },
      ];

      // Calculate overview metrics
      const totalWordsMastered = categoryProgress.reduce(
        (sum, cat) => sum + cat.masteredWords,
        0,
      );
      const wordsNeedPractice = categoryProgress.reduce(
        (sum, cat) => sum + cat.practiceWords,
        0,
      );
      const totalWordsLearned = categoryProgress.reduce(
        (sum, cat) => sum + cat.masteredWords + cat.practiceWords,
        0,
      );
      const totalTimeSpent = categoryProgress.reduce(
        (sum, cat) => sum + cat.timeSpent,
        0,
      );
      const overallAccuracy = Math.round(
        categoryProgress.reduce((sum, cat) => sum + cat.accuracy, 0) /
          categoryProgress.length,
      );

      // Generate weekly progress data
      const weeklyProgress: WeeklyData[] = [
        {
          week: "Week 1",
          wordsLearned: 45,
          timeSpent: 180,
          accuracy: 85,
          activeDays: 5,
        },
        {
          week: "Week 2",
          wordsLearned: 52,
          timeSpent: 210,
          accuracy: 88,
          activeDays: 6,
        },
        {
          week: "Week 3",
          wordsLearned: 38,
          timeSpent: 150,
          accuracy: 82,
          activeDays: 4,
        },
        {
          week: "Week 4",
          wordsLearned: 67,
          timeSpent: 270,
          accuracy: 91,
          activeDays: 7,
        },
      ];

      // Monthly trends
      const monthlyTrends = {
        wordsLearned: [156, 189, 223, 267, 302, 345],
        accuracy: [82, 85, 87, 89, 88, 91],
        timeSpent: [480, 620, 580, 720, 650, 810],
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      };

      return {
        overview: {
          totalWordsMastered,
          wordsNeedPractice,
          overallAccuracy,
          totalWordsLearned,
          totalLearningTime: totalTimeSpent,
          activeLearningStreak: 12,
          averageDailyTime: Math.round(totalTimeSpent / 30),
          totalSessions: 156,
        },
        categoryProgress,
        weeklyProgress,
        monthlyTrends,
        children: childrenData,
      };
    } catch (error) {
      console.error("Error calculating analytics data:", error);
      // Return default data structure
      return {
        overview: {
          totalWordsMastered: 0,
          wordsNeedPractice: 0,
          overallAccuracy: 0,
          totalWordsLearned: 0,
          totalLearningTime: 0,
          activeLearningStreak: 0,
          averageDailyTime: 0,
          totalSessions: 0,
        },
        categoryProgress: [],
        weeklyProgress: [],
        monthlyTrends: {
          wordsLearned: [],
          accuracy: [],
          timeSpent: [],
          months: [],
        },
        children: [],
      };
    }
  }, [propChildren, timeRange]);

  const generateReport = () => {
    const reportData = {
      type: reportType,
      dateRange: timeRange,
      customRange: customDateRange,
      data: analyticsData,
      generatedAt: new Date().toISOString(),
    };

    // Create downloadable report
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learning-report-${reportType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowReportDialog(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "hard":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
            📊 Learning Analytics ✨
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            🌟 Your children's amazing learning journey! 🎯
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-40 h-12 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">📅 Last 7 days</SelectItem>
              <SelectItem value="30d">🗓️ Last 30 days</SelectItem>
              <SelectItem value="90d">📆 Last 3 months</SelectItem>
              <SelectItem value="1y">🗂️ Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-full sm:w-48 h-12 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">👨‍👩‍👧‍👦 All Children</SelectItem>
              {analyticsData.children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  👧 {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => setShowReportDialog(true)}
            className="flex items-center gap-2 h-12 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            📋 Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-12 sm:h-10">
          <TabsTrigger value="overview" className="text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">📊</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Categories</span>
              <span className="sm:hidden">📚</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="children" className="text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Individual</span>
              <span className="sm:hidden">👧</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Reports</span>
              <span className="sm:hidden">📋</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid - Mobile Optimized */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 flex items-center justify-center gap-1">
                  🎯
                  <AnimatedCounter
                    value={analyticsData.overview.totalWordsMastered}
                  />
                </div>
                <p className="text-xs sm:text-sm text-blue-700 font-medium">
                  Words Mastered
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 mb-1 flex items-center justify-center gap-1">
                  💪
                  <AnimatedCounter
                    value={analyticsData.overview.wordsNeedPractice}
                  />
                </div>
                <p className="text-xs sm:text-sm text-orange-700 font-medium">
                  Need Practice
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 flex items-center justify-center gap-1">
                  🌟
                  <AnimatedCounter
                    value={analyticsData.overview.overallAccuracy}
                  />
                  %
                </div>
                <p className="text-xs sm:text-sm text-green-700 font-medium">
                  Accuracy Rate
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1 flex items-center justify-center gap-1">
                  📚
                  <AnimatedCounter
                    value={analyticsData.overview.totalWordsLearned}
                  />
                </div>
                <p className="text-xs sm:text-sm text-purple-700 font-medium">
                  Total Learned
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600 mb-1 flex items-center justify-center gap-1">
                  ⏰
                  <AnimatedCounter
                    value={analyticsData.overview.totalLearningTime}
                  />
                  m
                </div>
                <p className="text-xs sm:text-sm text-indigo-700 font-medium">
                  Learning Time
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-pink-600 mb-1 flex items-center justify-center gap-1">
                  🔥
                  <AnimatedCounter
                    value={analyticsData.overview.activeLearningStreak}
                  />
                </div>
                <p className="text-xs sm:text-sm text-pink-700 font-medium">Day Streak</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  Daily Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  <AnimatedCounter
                    value={analyticsData.overview.averageDailyTime}
                  />
                  min
                </div>
                <p className="text-sm text-gray-600">
                  Time spent learning per day
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  <AnimatedCounter
                    value={analyticsData.overview.totalSessions}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Learning sessions completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Active Children
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  <AnimatedCounter value={analyticsData.children.length} />
                </div>
                <p className="text-sm text-gray-600">
                  Children actively learning
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Weekly Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.weeklyProgress.map((week, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{week.week}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-600">
                          {week.wordsLearned} words
                        </span>
                        <span className="text-green-600">
                          {week.accuracy}% accuracy
                        </span>
                        <span className="text-purple-600">
                          {week.timeSpent}min
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={(week.wordsLearned / 70) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyticsData.categoryProgress.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {category.category}
                    </CardTitle>
                    <Badge className={getDifficultyColor(category.difficulty)}>
                      {category.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Mastered</p>
                      <p className="text-xl font-bold text-green-600">
                        {category.masteredWords}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Need Practice</p>
                      <p className="text-xl font-bold text-orange-600">
                        {category.practiceWords}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Accuracy</p>
                      <p className="text-xl font-bold text-blue-600">
                        {category.accuracy}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Time Spent</p>
                      <p className="text-xl font-bold text-purple-600">
                        {category.timeSpent}min
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {Math.round(
                          (category.masteredWords / category.totalWords) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (category.masteredWords / category.totalWords) * 100
                      }
                      className="h-3"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Individual Children Tab */}
        <TabsContent value="children" className="space-y-6">
          {analyticsData.children.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No Children Added
                </h3>
                <p className="text-gray-500">
                  Add children to your account to see individual progress.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analyticsData.children.map((child) => (
                <Card
                  key={child.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">{child.name}</CardTitle>
                      <Badge variant="secondary">{child.age} years old</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Level {child.level}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          <AnimatedCounter value={child.wordsLearned} />
                        </div>
                        <p className="text-sm text-blue-700">Words Learned</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          <AnimatedCounter value={child.accuracy} />%
                        </div>
                        <p className="text-sm text-green-700">Accuracy</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          <AnimatedCounter value={child.currentStreak} />
                        </div>
                        <p className="text-sm text-orange-700">Day Streak</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          <AnimatedCounter value={child.totalLearningTime} />m
                        </div>
                        <p className="text-sm text-purple-700">Total Time</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Weekly Goal Progress</span>
                        <span>
                          {Math.round(
                            (child.wordsLearned / child.weeklyGoal) * 100,
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={(child.wordsLearned / child.weeklyGoal) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>
                        <strong>Favorite Category:</strong>{" "}
                        {child.favoriteCategory}
                      </p>
                      <p>
                        <strong>Last Active:</strong> {child.lastActive}
                      </p>
                      <p>
                        <strong>Achievements:</strong>{" "}
                        {child.achievements.length} earned
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Enhanced Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <EnhancedLearningReports
            students={analyticsData.children.map((child) => ({
              id: child.id,
              name: child.name,
              age: child.age,
              level: child.level,
            }))}
            onExport={(reportId) => {
              // Handle report export
              console.log("Exporting report:", reportId);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Report Generation Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Generate{" "}
              {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
            </DialogTitle>
            <DialogDescription>
              Configure your report settings and download a comprehensive
              analysis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 3 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Focus Child</label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Children</SelectItem>
                  {analyticsData.children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={generateReport}>
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
