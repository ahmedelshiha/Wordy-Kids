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
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  BookOpen,
  Activity,
  Calendar,
  Download,
  Eye,
  Timer,
  Trophy,
  FileText,
  PieChart,
  LineChart,
  Maximize2,
  Minimize2,
  RefreshCw,
  Filter,
  Grid3x3,
  List,
  Star,
  Award,
  Zap,
  Brain,
  Heart,
  Sparkles,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { EnhancedLearningReports } from "@/components/EnhancedLearningReports";
import { cn } from "@/lib/utils";

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
  trend: "up" | "down" | "stable";
  weeklyProgress: number[];
}

interface WeeklyData {
  week: string;
  wordsLearned: number;
  timeSpent: number;
  accuracy: number;
  activeDays: number;
  sessionsCompleted: number;
  averageSessionTime: number;
}

interface MonthlyData {
  month: string;
  wordsLearned: number;
  accuracy: number;
  timeSpent: number;
  streakDays: number;
  achievements: number;
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
    improvementRate: number;
    engagementScore: number;
  };
  categoryProgress: CategoryProgress[];
  weeklyProgress: WeeklyData[];
  monthlyTrends: MonthlyData[];
  children: ChildProfile[];
  insights: string[];
  recommendations: string[];
}

interface ParentLearningAnalyticsDesktopProps {
  children?: ChildProfile[];
}

export const ParentLearningAnalyticsDesktop: React.FC<
  ParentLearningAnalyticsDesktopProps
> = ({ children: propChildren = [] }) => {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedChild, setSelectedChild] = useState("all");
  const [viewMode, setViewMode] = useState<"detailed" | "overview">("detailed");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportType, setReportType] = useState("comprehensive");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [selectedMetric, setSelectedMetric] = useState("wordsLearned");

  // Enhanced analytics data with desktop-specific insights
  const analyticsData = useMemo((): LearningAnalyticsData => {
    try {
      const storedChildren = localStorage.getItem("parentDashboardChildren");
      const childrenData =
        propChildren.length > 0
          ? propChildren
          : storedChildren
            ? JSON.parse(storedChildren)
            : [];

      // Enhanced category progress with trends
      const categoryProgress: CategoryProgress[] = [
        {
          category: "Animals",
          totalWords: 150,
          masteredWords: 89,
          practiceWords: 23,
          accuracy: 87,
          timeSpent: 180,
          difficulty: "medium",
          trend: "up",
          weeklyProgress: [12, 15, 18, 21, 24, 27, 30],
        },
        {
          category: "Colors",
          totalWords: 50,
          masteredWords: 45,
          practiceWords: 3,
          accuracy: 94,
          timeSpent: 90,
          difficulty: "easy",
          trend: "stable",
          weeklyProgress: [8, 10, 12, 14, 15, 16, 18],
        },
        {
          category: "Numbers",
          totalWords: 100,
          masteredWords: 67,
          practiceWords: 15,
          accuracy: 82,
          timeSpent: 120,
          difficulty: "medium",
          trend: "up",
          weeklyProgress: [10, 14, 18, 22, 25, 28, 32],
        },
        {
          category: "School",
          totalWords: 200,
          masteredWords: 134,
          practiceWords: 28,
          accuracy: 89,
          timeSpent: 240,
          difficulty: "hard",
          trend: "down",
          weeklyProgress: [45, 48, 50, 52, 54, 55, 56],
        },
        {
          category: "Family",
          totalWords: 80,
          masteredWords: 72,
          practiceWords: 5,
          accuracy: 96,
          timeSpent: 100,
          difficulty: "easy",
          trend: "stable",
          weeklyProgress: [20, 22, 24, 26, 28, 30, 32],
        },
        {
          category: "Science",
          totalWords: 120,
          masteredWords: 45,
          practiceWords: 35,
          accuracy: 78,
          timeSpent: 160,
          difficulty: "hard",
          trend: "up",
          weeklyProgress: [5, 8, 12, 18, 25, 32, 40],
        },
      ];

      // Enhanced weekly progress with more metrics
      const weeklyProgress: WeeklyData[] = [
        {
          week: "Week 1",
          wordsLearned: 45,
          timeSpent: 180,
          accuracy: 85,
          activeDays: 5,
          sessionsCompleted: 12,
          averageSessionTime: 15,
        },
        {
          week: "Week 2",
          wordsLearned: 52,
          timeSpent: 210,
          accuracy: 88,
          activeDays: 6,
          sessionsCompleted: 15,
          averageSessionTime: 14,
        },
        {
          week: "Week 3",
          wordsLearned: 38,
          timeSpent: 150,
          accuracy: 82,
          activeDays: 4,
          sessionsCompleted: 10,
          averageSessionTime: 15,
        },
        {
          week: "Week 4",
          wordsLearned: 67,
          timeSpent: 270,
          accuracy: 91,
          activeDays: 7,
          sessionsCompleted: 18,
          averageSessionTime: 15,
        },
      ];

      // Monthly trends with additional metrics
      const monthlyTrends: MonthlyData[] = [
        {
          month: "Jan",
          wordsLearned: 156,
          accuracy: 82,
          timeSpent: 480,
          streakDays: 15,
          achievements: 3,
        },
        {
          month: "Feb",
          wordsLearned: 189,
          accuracy: 85,
          timeSpent: 620,
          streakDays: 22,
          achievements: 5,
        },
        {
          month: "Mar",
          wordsLearned: 223,
          accuracy: 87,
          timeSpent: 580,
          streakDays: 28,
          achievements: 4,
        },
        {
          month: "Apr",
          wordsLearned: 267,
          accuracy: 89,
          timeSpent: 720,
          streakDays: 25,
          achievements: 6,
        },
        {
          month: "May",
          wordsLearned: 302,
          accuracy: 88,
          timeSpent: 650,
          streakDays: 30,
          achievements: 7,
        },
        {
          month: "Jun",
          wordsLearned: 345,
          accuracy: 91,
          timeSpent: 810,
          streakDays: 28,
          achievements: 8,
        },
      ];

      // Calculate enhanced overview metrics
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

      // Calculate improvement rate (trend analysis)
      const recentWeeks = weeklyProgress.slice(-2);
      const improvementRate =
        recentWeeks.length === 2
          ? Math.round(
              ((recentWeeks[1].wordsLearned - recentWeeks[0].wordsLearned) /
                recentWeeks[0].wordsLearned) *
                100,
            )
          : 0;

      // Calculate engagement score based on multiple factors
      const avgActiveDays =
        weeklyProgress.reduce((sum, week) => sum + week.activeDays, 0) /
        weeklyProgress.length;
      const avgAccuracy =
        weeklyProgress.reduce((sum, week) => sum + week.accuracy, 0) /
        weeklyProgress.length;
      const engagementScore = Math.round(
        (avgActiveDays / 7) * 40 + (avgAccuracy / 100) * 60,
      );

      // Generate AI-like insights
      const insights = [
        `Your children are showing strong improvement in ${categoryProgress.find((c) => c.trend === "up")?.category || "learning"} with a ${improvementRate > 0 ? improvementRate : 15}% increase this week.`,
        `The overall engagement score of ${engagementScore}% indicates excellent learning consistency.`,
        `Most productive learning happens during ${totalTimeSpent > 500 ? "longer" : "shorter"} sessions with an average accuracy of ${overallAccuracy}%.`,
        `${categoryProgress.filter((c) => c.accuracy > 90).length} categories have achieved mastery level (90%+ accuracy).`,
      ];

      // Generate personalized recommendations
      const recommendations = [
        wordsNeedPractice > 20
          ? `Focus on reviewing ${wordsNeedPractice} words that need practice to improve retention.`
          : "Great job! Very few words need additional practice.",
        engagementScore < 70
          ? "Consider varying learning activities to boost engagement and maintain interest."
          : "Excellent engagement! Continue with the current learning approach.",
        overallAccuracy < 85
          ? "Try shorter, more frequent sessions to improve accuracy and reduce fatigue."
          : "Outstanding accuracy! Ready for more challenging content.",
        `Consider exploring ${categoryProgress.find((c) => c.masteredWords < 50)?.category || "new"} category for broader vocabulary development.`,
      ];

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
          improvementRate,
          engagementScore,
        },
        categoryProgress,
        weeklyProgress,
        monthlyTrends,
        children: childrenData,
        insights,
        recommendations,
      };
    } catch (error) {
      console.error("Error calculating analytics data:", error);
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
          improvementRate: 0,
          engagementScore: 0,
        },
        categoryProgress: [],
        weeklyProgress: [],
        monthlyTrends: [],
        children: [],
        insights: [],
        recommendations: [],
      };
    }
  }, [propChildren, timeRange]);

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const generateReport = () => {
    const reportData = {
      type: reportType,
      dateRange: timeRange,
      data: analyticsData,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learning-analytics-${reportType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowReportDialog(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "hard":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category.toLowerCase()) {
      case "animals":
        return "🐶";
      case "colors":
        return "🎨";
      case "numbers":
        return "🔢";
      case "school":
        return "🏫";
      case "family":
        return "👨‍👩‍👧‍👦";
      case "science":
        return "🔬";
      case "food":
        return "🍎";
      default:
        return "📚";
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white rounded-lg p-6 shadow-sm border">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Learning Analytics Dashboard
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </h2>
            <p className="text-gray-600 mt-1">
              Comprehensive insights into your children's learning journey
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-full sm:w-48">
                <Users className="w-4 h-4 mr-2" />
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

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "overview" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("overview")}
                className="rounded-r-none"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "detailed" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("detailed")}
                className="rounded-l-none"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={() => setShowReportDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              key: "totalWordsMastered",
              label: "Words Mastered",
              value: analyticsData.overview.totalWordsMastered,
              icon: Trophy,
              color: "blue",
              suffix: "",
            },
            {
              key: "wordsNeedPractice",
              label: "Need Practice",
              value: analyticsData.overview.wordsNeedPractice,
              icon: Target,
              color: "orange",
              suffix: "",
            },
            {
              key: "overallAccuracy",
              label: "Accuracy Rate",
              value: analyticsData.overview.overallAccuracy,
              icon: Star,
              color: "green",
              suffix: "%",
            },
            {
              key: "improvementRate",
              label: "Improvement",
              value: analyticsData.overview.improvementRate,
              icon: TrendingUp,
              color: "purple",
              suffix: "%",
            },
            {
              key: "engagementScore",
              label: "Engagement",
              value: analyticsData.overview.engagementScore,
              icon: Heart,
              color: "pink",
              suffix: "%",
            },
          ].map((metric) => (
            <Tooltip key={metric.key}>
              <TooltipTrigger asChild>
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105",
                    selectedMetric === metric.key &&
                      "ring-2 ring-blue-500 ring-opacity-50",
                  )}
                  onClick={() => setSelectedMetric(metric.key)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon
                        className={cn("h-5 w-5", {
                          "text-blue-600": metric.color === "blue",
                          "text-orange-600": metric.color === "orange",
                          "text-green-600": metric.color === "green",
                          "text-purple-600": metric.color === "purple",
                          "text-pink-600": metric.color === "pink",
                        })}
                      />
                      {metric.key === "improvementRate" && (
                        <Badge
                          variant={metric.value > 0 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {metric.value > 0 ? "↑" : "→"}
                        </Badge>
                      )}
                    </div>
                    <div
                      className={cn("text-2xl font-bold mb-1", {
                        "text-blue-700": metric.color === "blue",
                        "text-orange-700": metric.color === "orange",
                        "text-green-700": metric.color === "green",
                        "text-purple-700": metric.color === "purple",
                        "text-pink-700": metric.color === "pink",
                      })}
                    >
                      <AnimatedCounter value={metric.value} />
                      {metric.suffix}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">
                      {metric.label}
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Click to view detailed {metric.label.toLowerCase()} analysis
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Insights & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-green-600" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="children" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Individual
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyticsData.categoryProgress.map((category, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => toggleCardExpansion(`category-${index}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getCategoryEmoji(category.category)}{" "}
                        {category.category}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(category.trend)}
                        <Badge
                          className={getDifficultyColor(category.difficulty)}
                        >
                          {category.difficulty}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCardExpansion(`category-${index}`);
                          }}
                        >
                          {expandedCards.has(`category-${index}`) ? (
                            <Minimize2 className="h-4 w-4" />
                          ) : (
                            <Maximize2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-green-600">
                          {category.masteredWords}
                        </div>
                        <p className="text-xs text-green-700">Mastered</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-orange-600">
                          {category.practiceWords}
                        </div>
                        <p className="text-xs text-orange-700">Practice</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-semibold">
                          {Math.round(
                            (category.masteredWords / category.totalWords) *
                              100,
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

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{category.timeSpent}min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{category.accuracy}%</span>
                      </div>
                    </div>

                    {expandedCards.has(`category-${index}`) && (
                      <div className="mt-4 space-y-3 border-t pt-3">
                        <h4 className="font-medium text-sm">Weekly Progress</h4>
                        <div className="grid grid-cols-7 gap-1">
                          {category.weeklyProgress.map((progress, i) => (
                            <div
                              key={i}
                              className="h-8 bg-blue-100 rounded flex items-center justify-center text-xs font-medium"
                              style={{
                                backgroundColor: `hsl(${240}, 100%, ${95 - (progress / Math.max(...category.weeklyProgress)) * 20}%)`,
                              }}
                            >
                              {progress}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>7 days ago</span>
                          <span>Today</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Enhanced Weekly Tab */}
          <TabsContent value="weekly" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analyticsData.weeklyProgress.map((week, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        {week.week}
                      </span>
                      <Badge variant="outline">{week.activeDays}/7 days</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          <AnimatedCounter value={week.wordsLearned} />
                        </div>
                        <p className="text-xs text-blue-700">Words Learned</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">
                          <AnimatedCounter value={week.accuracy} />%
                        </div>
                        <p className="text-xs text-green-700">Accuracy</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          Total Time
                        </span>
                        <span className="font-medium">{week.timeSpent}min</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-gray-500" />
                          Sessions
                        </span>
                        <span className="font-medium">
                          {week.sessionsCompleted}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-gray-500" />
                          Avg Session
                        </span>
                        <span className="font-medium">
                          {week.averageSessionTime}min
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Enhanced Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-purple-600" />
                  Monthly Learning Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analyticsData.monthlyTrends.map((month, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-lg">
                          {month.month}
                        </span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-yellow-500" />
                            {month.achievements} achievements
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-orange-500" />
                            {month.streakDays} day streak
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            <AnimatedCounter value={month.wordsLearned} />
                          </div>
                          <p className="text-sm text-blue-700">Words Learned</p>
                          <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-1000"
                              style={{
                                width: `${(month.wordsLearned / 400) * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            <AnimatedCounter value={month.accuracy} />%
                          </div>
                          <p className="text-sm text-green-700">
                            Accuracy Rate
                          </p>
                          <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-600 transition-all duration-1000"
                              style={{ width: `${month.accuracy}%` }}
                            />
                          </div>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 mb-1">
                            <AnimatedCounter value={month.timeSpent} />m
                          </div>
                          <p className="text-sm text-purple-700">Time Spent</p>
                          <div className="mt-2 h-2 bg-purple-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-600 transition-all duration-1000"
                              style={{
                                width: `${(month.timeSpent / 1000) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Individual Children Tab */}
          <TabsContent value="children" className="space-y-6">
            {analyticsData.children.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No Children Added Yet
                  </h3>
                  <p className="text-gray-500">
                    Add children to your account to see their detailed analytics
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
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                            {child.name[0]}
                          </div>
                          {child.name}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          Level {child.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {child.age} years old • {child.achievements.length}{" "}
                        achievements
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            <AnimatedCounter value={child.wordsLearned} />
                          </div>
                          <p className="text-sm text-blue-700">Words Learned</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            <AnimatedCounter value={child.accuracy} />%
                          </div>
                          <p className="text-sm text-green-700">Accuracy</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Weekly Goal Progress</span>
                          <span className="font-semibold">
                            {Math.round(
                              (child.wordsLearned / child.weeklyGoal) * 100,
                            )}
                            %
                          </span>
                        </div>
                        <Progress
                          value={(child.wordsLearned / child.weeklyGoal) * 100}
                          className="h-3"
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-orange-500" />
                            Current Streak
                          </span>
                          <span className="font-medium">
                            {child.currentStreak} days
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-pink-500" />
                            Favorite Category
                          </span>
                          <span className="font-medium">
                            {child.favoriteCategory}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            Total Time
                          </span>
                          <span className="font-medium">
                            {child.totalLearningTime}min
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Report Generation Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generate Analytics Report
              </DialogTitle>
              <DialogDescription>
                Create a comprehensive learning analytics report for download.
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
                    <SelectItem value="comprehensive">
                      Comprehensive Report
                    </SelectItem>
                    <SelectItem value="summary">Executive Summary</SelectItem>
                    <SelectItem value="trends">Trends Analysis</SelectItem>
                    <SelectItem value="individual">
                      Individual Progress
                    </SelectItem>
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
    </TooltipProvider>
  );
};
