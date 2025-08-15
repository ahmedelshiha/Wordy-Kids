import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Calendar,
  Clock,
  ChartBar,
  Download,
  CheckCircle,
  BookOpen,
  Target,
  Zap,
  Trophy,
  User,
  TrendingUp,
  AlertTriangle,
  Heart,
  Star,
  Users,
  Activity,
  Award,
  BarChart3,
  Eye,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

interface Student {
  id: string;
  name: string;
  age?: number;
  level?: number;
}

interface ReportData {
  report_id: string;
  student_id: string;
  student_name: string;
  report_date_range: string;
  key_metrics: {
    learning_time_minutes: number;
    words_learned: number;
    accuracy_percentage: number;
    day_streak: number;
  };
  quick_overview: {
    overall_performance_percentage: number;
    learning_goal: string;
  };
  strengths_progress: {
    strong_categories: Array<{ name: string; icon: string }>;
    mastered_words: Array<{ word: string; icon: string }>;
  };
  areas_for_growth: {
    practice_categories: Array<{ name: string; icon: string }>;
    words_to_practice: Array<{ word: string; icon: string }>;
  };
  category_mastery_progress: Array<{
    category_name: string;
    current_percentage: number;
    status: string;
    target_percentage: number;
  }>;
  parent_insights_recommendations: {
    key_strengths: string[];
    growth_opportunities: string[];
    recommended_actions: string[];
  };
  recent_achievements: Array<{
    title: string;
    description: string;
    date: string;
    icon: string;
  }>;
}

interface EnhancedLearningReportsProps {
  students?: Student[];
  onExport?: (reportId: string) => void;
}

export const EnhancedLearningReports: React.FC<
  EnhancedLearningReportsProps
> = ({ students = [], onExport }) => {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [reportType, setReportType] = useState<string>("Quick Summary");
  const [timePeriod, setTimePeriod] = useState<string>("Last Week");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(
    null,
  );
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // Sample students if none provided
  const defaultStudents: Student[] = [
    { id: "demo-child-1", name: "Fahd", age: 8, level: 2 },
  ];

  const availableStudents = students.length > 0 ? students : defaultStudents;

  // Set default selected student
  useEffect(() => {
    if (availableStudents.length > 0 && !selectedStudent) {
      setSelectedStudent(availableStudents[0].id);
    }
  }, [availableStudents, selectedStudent]);

  // Handle time period selection
  const handleTimePeriodChange = (value: string) => {
    setTimePeriod(value);
    setShowCustomDatePicker(value === "Custom Date Range");
  };

  // Generate sample report data
  const generateSampleReport = (studentId: string): ReportData => {
    const student = availableStudents.find((s) => s.id === studentId);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      report_id: `report-${Date.now()}`,
      student_id: studentId,
      student_name: student?.name || "Student",
      report_date_range: `${oneWeekAgo.toLocaleDateString()} - ${now.toLocaleDateString()}`,
      key_metrics: {
        learning_time_minutes: 100,
        words_learned: 70,
        accuracy_percentage: 89,
        day_streak: 9,
      },
      quick_overview: {
        overall_performance_percentage: 89,
        learning_goal: "70/20",
      },
      strengths_progress: {
        strong_categories: [
          { name: "Animals", icon: "lightning" },
          { name: "Science", icon: "lightning" },
          { name: "Colors", icon: "lightning" },
        ],
        mastered_words: [
          { word: "Elephant", icon: "book" },
          { word: "Microscope", icon: "book" },
          { word: "Rainbow", icon: "book" },
          { word: "Volcano", icon: "book" },
          { word: "Constellation", icon: "book" },
        ],
      },
      areas_for_growth: {
        practice_categories: [
          { name: "Food", icon: "target" },
          { name: "Transportation", icon: "target" },
        ],
        words_to_practice: [
          { word: "Helicopter", icon: "book" },
          { word: "Restaurant", icon: "book" },
          { word: "Apartment", icon: "book" },
          { word: "Orchestra", icon: "book" },
        ],
      },
      category_mastery_progress: [
        {
          category_name: "Animals",
          current_percentage: 92,
          status: "Mastered",
          target_percentage: 80,
        },
        {
          category_name: "Science",
          current_percentage: 87,
          status: "Improving",
          target_percentage: 80,
        },
        {
          category_name: "Colors",
          current_percentage: 94,
          status: "Mastered",
          target_percentage: 80,
        },
        {
          category_name: "Food",
          current_percentage: 65,
          status: "Needs Practice",
          target_percentage: 80,
        },
        {
          category_name: "Transportation",
          current_percentage: 73,
          status: "Stable",
          target_percentage: 80,
        },
      ],
      parent_insights_recommendations: {
        key_strengths: [
          "Excellent vocabulary retention in science topics",
          "Strong pattern recognition skills",
          "Consistent daily learning habits",
        ],
        growth_opportunities: [
          "Focus on food-related vocabulary practice",
          "Improve pronunciation accuracy",
          "Expand transportation category knowledge",
        ],
        recommended_actions: [
          "Schedule 15-minute daily practice sessions",
          "Use visual aids for transportation words",
          "Celebrate achievements to maintain motivation",
        ],
      },
      recent_achievements: [
        {
          title: "Vocabulary Star",
          description: "Learned 50+ new words",
          date: "2025-01-13",
          icon: "trophy",
        },
        {
          title: "Science Explorer",
          description: "Mastered science category",
          date: "2025-01-12",
          icon: "trophy",
        },
        {
          title: "Streak Master",
          description: "9-day learning streak",
          date: "2025-01-11",
          icon: "trophy",
        },
      ],
    };
  };

  // Handle report generation
  const handleGenerateReport = async () => {
    if (!selectedStudent) return;

    setIsGenerating(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const reportData = generateSampleReport(selectedStudent);
    setGeneratedReport(reportData);
    setIsGenerating(false);
  };

  // Handle export
  const handleExport = () => {
    if (generatedReport && onExport) {
      onExport(generatedReport.report_id);
    } else {
      // Simulate export
      const blob = new Blob([JSON.stringify(generatedReport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedReport?.student_name}_learning_report.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "mastered":
        return {
          color: "text-green-600",
          icon: CheckCircle,
          bgColor: "bg-green-50",
        };
      case "improving":
        return {
          color: "text-blue-600",
          icon: TrendingUp,
          bgColor: "bg-blue-50",
        };
      case "stable":
        return {
          color: "text-yellow-600",
          icon: Activity,
          bgColor: "bg-yellow-50",
        };
      case "needs practice":
        return {
          color: "text-orange-600",
          icon: AlertTriangle,
          bgColor: "bg-orange-50",
        };
      default:
        return {
          color: "text-gray-600",
          icon: Activity,
          bgColor: "bg-gray-50",
        };
    }
  };

  if (generatedReport) {
    return (
      <div className="space-y-6">
        {/* Export Button and Success Message */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-lg font-semibold text-green-700">
              Report Generated Successfully!
            </span>
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Report Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {generatedReport.student_name}'s Learning Report
            </CardTitle>
            <p className="text-gray-600">{generatedReport.report_date_range}</p>
          </CardHeader>
        </Card>

        {/* Key Metrics Cards - Enhanced for mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 sm:p-4 text-center">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700">
                <AnimatedCounter
                  value={generatedReport.key_metrics.learning_time_minutes}
                />
                m
              </div>
              <p className="text-blue-600 font-medium text-xs sm:text-sm">Learning Time</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 sm:p-4 text-center">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700">
                <AnimatedCounter
                  value={generatedReport.key_metrics.words_learned}
                />
              </div>
              <p className="text-green-600 font-medium text-xs sm:text-sm">Words Learned</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3 sm:p-4 text-center">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-700">
                <AnimatedCounter
                  value={generatedReport.key_metrics.accuracy_percentage}
                />
                %
              </div>
              <p className="text-purple-600 font-medium text-xs sm:text-sm">Accuracy</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-3 sm:p-4 text-center">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-1 sm:mb-2" />
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-700">
                <AnimatedCounter
                  value={generatedReport.key_metrics.day_streak}
                />{" "}
                <span className="text-sm sm:text-base">Day</span>
              </div>
              <p className="text-orange-600 font-medium text-xs sm:text-sm">Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Quick Overview
            </CardTitle>
            <p className="text-gray-600">Overall Performance</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Overall Performance</span>
                <span className="text-2xl font-bold">
                  {
                    generatedReport.quick_overview
                      .overall_performance_percentage
                  }
                  %
                </span>
              </div>
              <Progress
                value={
                  generatedReport.quick_overview.overall_performance_percentage
                }
                className="h-3"
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Learning Goal</span>
              <span className="font-semibold">
                {generatedReport.quick_overview.learning_goal}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-green-600" />
              Strengths & Progress
            </CardTitle>
            <p className="text-gray-600">
              Areas where {generatedReport.student_name} excels
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                Strong Categories (
                {
                  generatedReport.strengths_progress.strong_categories.length
                }{" "}
                areas)
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedReport.strengths_progress.strong_categories.map(
                  (category, index) => (
                    <Badge
                      key={index}
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {category.name}
                    </Badge>
                  ),
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-green-600" />
                Mastered Words (
                {generatedReport.strengths_progress.mastered_words.length}{" "}
                words)
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedReport.strengths_progress.mastered_words.map(
                  (word, index) => (
                    <Badge
                      key={index}
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      {word.word}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Areas for Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-600" />
              Areas for Growth
            </CardTitle>
            <p className="text-gray-600">Focus areas for improvement</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-600" />
                Practice Categories (
                {
                  generatedReport.areas_for_growth.practice_categories.length
                }{" "}
                areas)
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedReport.areas_for_growth.practice_categories.map(
                  (category, index) => (
                    <Badge
                      key={index}
                      className="bg-orange-100 text-orange-800 border-orange-300"
                    >
                      <Target className="w-3 h-3 mr-1" />
                      {category.name}
                    </Badge>
                  ),
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-orange-600" />
                Words to Practice (
                {generatedReport.areas_for_growth.words_to_practice.length}{" "}
                words)
              </h4>
              <div className="flex flex-wrap gap-2">
                {generatedReport.areas_for_growth.words_to_practice.map(
                  (word, index) => (
                    <Badge
                      key={index}
                      className="bg-orange-100 text-orange-800 border-orange-300"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      {word.word}
                    </Badge>
                  ),
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Mastery Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Category Mastery Progress
            </CardTitle>
            <p className="text-gray-600">Learning progress by subject area</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedReport.category_mastery_progress.map(
              (category, index) => {
                const statusInfo = getStatusInfo(category.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {category.category_name}
                        </span>
                        <Badge
                          className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {category.status}
                        </Badge>
                      </div>
                      <span className="font-semibold">
                        {category.current_percentage}%
                      </span>
                    </div>
                    <Progress
                      value={category.current_percentage}
                      className="h-2"
                    />
                    <p className="text-sm text-gray-600">
                      Target: {category.target_percentage}% mastery
                    </p>
                  </div>
                );
              },
            )}
          </CardContent>
        </Card>

        {/* Parent Insights & Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-600" />
              Parent Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                Key Strengths
              </h4>
              <ul className="space-y-2">
                {generatedReport.parent_insights_recommendations.key_strengths.map(
                  (strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-700">
                <Target className="w-4 h-4" />
                Growth Opportunities
              </h4>
              <ul className="space-y-2">
                {generatedReport.parent_insights_recommendations.growth_opportunities.map(
                  (opportunity, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{opportunity}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-700">
                <Heart className="w-4 h-4" />
                Recommended Actions
              </h4>
              <ul className="space-y-2">
                {generatedReport.parent_insights_recommendations.recommended_actions.map(
                  (action, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{action}</span>
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
              <Trophy className="w-5 h-5 text-yellow-600" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedReport.recent_achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <Trophy className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-800">
                      {achievement.title}
                    </h4>
                    <p className="text-gray-700 mb-1">
                      {achievement.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Back to Generate New Report */}
        <div className="flex justify-center">
          <Button
            onClick={() => setGeneratedReport(null)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Generate New Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Learning Reports Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Learning Reports</h2>
        <p className="text-gray-600">
          Generate detailed progress reports for your children
        </p>
      </div>

      {/* Report Generation Buttons - Enhanced for mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg">Weekly Summary</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Quick weekly overview</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setReportType("Weekly Summary");
                setTimePeriod("Last Week");
                handleGenerateReport();
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-sm sm:text-base h-10 sm:h-12"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs sm:text-sm">Generating...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Weekly Summary</span>
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ChartBar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg">Monthly Report</h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Comprehensive monthly analysis
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setReportType("Monthly Report");
                setTimePeriod("Last Month");
                handleGenerateReport();
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-sm sm:text-base h-10 sm:h-12"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs sm:text-sm">Generating...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Monthly Report</span>
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Generate Custom Report Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Generate Custom Report
          </CardTitle>
          <p className="text-gray-600">Create detailed learning analytics</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student Selection */}
          {availableStudents.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">
                      {availableStudents.find((s) => s.id === selectedStudent)
                        ?.name || "Select Student"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Selected for report generation
                    </p>
                  </div>
                </div>
                {availableStudents.length > 1 && (
                  <div className="mt-4">
                    <Label htmlFor="student-select">Select Student</Label>
                    <Select
                      value={selectedStudent}
                      onValueChange={setSelectedStudent}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStudents.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Report Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <ChartBar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Quick Summary">Quick Summary</SelectItem>
                  <SelectItem value="Detailed Analysis">
                    Detailed Analysis
                  </SelectItem>
                  <SelectItem value="Progress Over Time">
                    Progress Over Time
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-period">Time Period</Label>
              <Select value={timePeriod} onValueChange={handleTimePeriodChange}>
                <SelectTrigger>
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Last Week">Last Week</SelectItem>
                  <SelectItem value="Last Month">Last Month</SelectItem>
                  <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
                  <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
                  <SelectItem value="Last Year">Last Year</SelectItem>
                  <SelectItem value="Custom Date Range">
                    Custom Date Range
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date Range */}
          {showCustomDatePicker && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Generate Report Button */}
          <Button
            onClick={handleGenerateReport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            disabled={isGenerating || !selectedStudent}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Report...
              </div>
            ) : (
              <>
                <BarChart3 className="w-5 h-5 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
