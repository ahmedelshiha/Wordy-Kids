import React, { useState } from "react";
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
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ChevronUp,
  ChevronDown,
  Star,
  Zap,
  Brain,
  Heart,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: "up" | "down" | "stable";
  changePercent: number;
  icon: React.ReactNode;
  color: string;
}

interface UsagePattern {
  timeOfDay: string;
  sessions: number;
  completionRate: number;
  avgDuration: number;
}

interface LearningOutcome {
  category: string;
  totalWords: number;
  masteredWords: number;
  averageAccuracy: number;
  improvementRate: number;
  strugglingAreas: string[];
}

interface GeographicData {
  region: string;
  users: number;
  sessions: number;
  performance: number;
  growth: number;
}

interface DeviceAnalytics {
  device: string;
  percentage: number;
  sessions: number;
  avgDuration: number;
  icon: React.ReactNode;
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("overview");

  // Sample data - in production this would come from APIs
  const keyMetrics: AnalyticsMetric[] = [
    {
      id: "active_users",
      name: "Active Users",
      value: 15420,
      previousValue: 13200,
      unit: "",
      trend: "up",
      changePercent: 16.8,
      icon: <Users className="w-6 h-6" />,
      color: "text-blue-600",
    },
    {
      id: "learning_sessions",
      name: "Learning Sessions",
      value: 98750,
      previousValue: 87300,
      unit: "",
      trend: "up",
      changePercent: 13.1,
      icon: <BookOpen className="w-6 h-6" />,
      color: "text-green-600",
    },
    {
      id: "avg_session_time",
      name: "Avg Session Time",
      value: 18.5,
      previousValue: 16.2,
      unit: "min",
      trend: "up",
      changePercent: 14.2,
      icon: <Clock className="w-6 h-6" />,
      color: "text-purple-600",
    },
    {
      id: "completion_rate",
      name: "Completion Rate",
      value: 87.3,
      previousValue: 84.1,
      unit: "%",
      trend: "up",
      changePercent: 3.8,
      icon: <Target className="w-6 h-6" />,
      color: "text-orange-600",
    },
    {
      id: "user_satisfaction",
      name: "User Satisfaction",
      value: 4.7,
      previousValue: 4.5,
      unit: "/5",
      trend: "up",
      changePercent: 4.4,
      icon: <Star className="w-6 h-6" />,
      color: "text-yellow-600",
    },
    {
      id: "retention_rate",
      name: "7-Day Retention",
      value: 73.2,
      previousValue: 71.8,
      unit: "%",
      trend: "up",
      changePercent: 1.9,
      icon: <Heart className="w-6 h-6" />,
      color: "text-red-600",
    },
  ];

  const usagePatterns: UsagePattern[] = [
    { timeOfDay: "6-9 AM", sessions: 2840, completionRate: 89, avgDuration: 15.2 },
    { timeOfDay: "9-12 PM", sessions: 1420, completionRate: 92, avgDuration: 22.1 },
    { timeOfDay: "12-3 PM", sessions: 3200, completionRate: 85, avgDuration: 18.7 },
    { timeOfDay: "3-6 PM", sessions: 8750, completionRate: 88, avgDuration: 19.3 },
    { timeOfDay: "6-9 PM", sessions: 12300, completionRate: 91, avgDuration: 21.5 },
    { timeOfDay: "9 PM+", sessions: 1890, completionRate: 78, avgDuration: 16.8 },
  ];

  const learningOutcomes: LearningOutcome[] = [
    {
      category: "Animals",
      totalWords: 145,
      masteredWords: 127,
      averageAccuracy: 89.3,
      improvementRate: 12.5,
      strugglingAreas: ["Pronunciation", "Spelling"],
    },
    {
      category: "Nature",
      totalWords: 98,
      masteredWords: 82,
      averageAccuracy: 85.7,
      improvementRate: 8.9,
      strugglingAreas: ["Definition recall"],
    },
    {
      category: "Food",
      totalWords: 167,
      masteredWords: 142,
      averageAccuracy: 91.2,
      improvementRate: 15.3,
      strugglingAreas: ["Complex words"],
    },
    {
      category: "Objects",
      totalWords: 203,
      masteredWords: 165,
      averageAccuracy: 87.1,
      improvementRate: 10.7,
      strugglingAreas: ["Technical terms", "Pronunciation"],
    },
  ];

  const geographicData: GeographicData[] = [
    { region: "North America", users: 8420, sessions: 45200, performance: 88.5, growth: 12.3 },
    { region: "Europe", users: 4320, sessions: 23800, performance: 91.2, growth: 18.7 },
    { region: "Asia Pacific", users: 2180, sessions: 12400, performance: 85.9, growth: 25.4 },
    { region: "Latin America", users: 520, sessions: 2890, performance: 83.7, growth: 31.2 },
    { region: "Others", users: 80, sessions: 420, performance: 79.2, growth: 8.9 },
  ];

  const deviceAnalytics: DeviceAnalytics[] = [
    {
      device: "Mobile",
      percentage: 64.2,
      sessions: 63420,
      avgDuration: 16.8,
      icon: <Smartphone className="w-5 h-5" />,
    },
    {
      device: "Desktop",
      percentage: 24.7,
      sessions: 24390,
      avgDuration: 23.5,
      icon: <Monitor className="w-5 h-5" />,
    },
    {
      device: "Tablet",
      percentage: 11.1,
      sessions: 10940,
      avgDuration: 19.2,
      icon: <Tablet className="w-5 h-5" />,
    },
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {keyMetrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${metric.color}`}>{metric.icon}</div>
                <div className="flex items-center gap-1">
                  {metric.trend === "up" ? (
                    <ChevronUp className="w-4 h-4 text-green-600" />
                  ) : metric.trend === "down" ? (
                    <ChevronDown className="w-4 h-4 text-red-600" />
                  ) : null}
                  <span
                    className={`text-sm font-medium ${
                      metric.trend === "up"
                        ? "text-green-600"
                        : metric.trend === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {metric.changePercent > 0 ? "+" : ""}
                    {metric.changePercent}%
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-slate-600">{metric.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-800">
                    <AnimatedCounter value={metric.value} />
                  </span>
                  <span className="text-slate-500">{metric.unit}</span>
                </div>
                <p className="text-xs text-slate-500">
                  vs {metric.previousValue.toLocaleString()} {metric.unit} last period
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Daily Usage Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {usagePatterns.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-medium w-20">{pattern.timeOfDay}</span>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{pattern.sessions.toLocaleString()} sessions</span>
                        <span>{pattern.completionRate}% completion</span>
                        <span>{pattern.avgDuration}min avg</span>
                      </div>
                      <Progress value={(pattern.sessions / 12300) * 100} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Outcomes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Learning Outcomes by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningOutcomes.map((outcome, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{outcome.category}</h4>
                  <Badge variant="outline">
                    {outcome.masteredWords}/{outcome.totalWords} mastered
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Mastery Progress</span>
                      <span>{Math.round((outcome.masteredWords / outcome.totalWords) * 100)}%</span>
                    </div>
                    <Progress value={(outcome.masteredWords / outcome.totalWords) * 100} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Avg Accuracy</span>
                      <p className="font-semibold">{outcome.averageAccuracy}%</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Improvement</span>
                      <p className="font-semibold text-green-600">+{outcome.improvementRate}%</p>
                    </div>
                  </div>
                  {outcome.strugglingAreas.length > 0 && (
                    <div>
                      <span className="text-xs text-slate-600">Needs attention:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {outcome.strugglingAreas.map((area, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderUserInsightsTab = () => (
    <div className="space-y-6">
      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {geographicData.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{region.region}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{region.users.toLocaleString()} users</span>
                      <span>{region.sessions.toLocaleString()} sessions</span>
                      <Badge
                        className={
                          region.growth > 20
                            ? "bg-green-100 text-green-800"
                            : region.growth > 10
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        +{region.growth}% growth
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Performance: {region.performance}%</span>
                      <span>{Math.round((region.users / 15520) * 100)}% of total users</span>
                    </div>
                    <Progress value={(region.users / 15520) * 100} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Device Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Device Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {deviceAnalytics.map((device, index) => (
              <div key={index} className="text-center p-6 border rounded-lg">
                <div className="flex justify-center mb-4">{device.icon}</div>
                <h3 className="font-semibold mb-2">{device.device}</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {device.percentage}%
                </div>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>{device.sessions.toLocaleString()} sessions</p>
                  <p>{device.avgDuration}min avg duration</p>
                </div>
                <div className="mt-3">
                  <Progress value={device.percentage} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Cohort Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Cohort Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">2,840</div>
              <p className="text-sm text-blue-800">New Users (7d)</p>
              <div className="text-xs text-blue-600 mt-1">+23% vs last week</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">8,420</div>
              <p className="text-sm text-green-800">Returning Users</p>
              <div className="text-xs text-green-600 mt-1">+12% vs last week</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">73.2%</div>
              <p className="text-sm text-purple-800">7-Day Retention</p>
              <div className="text-xs text-purple-600 mt-1">+1.9% vs last week</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">45.8%</div>
              <p className="text-sm text-orange-800">30-Day Retention</p>
              <div className="text-xs text-orange-600 mt-1">+3.2% vs last month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* System Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-yellow-600">2.1s</div>
            <p className="text-sm text-slate-600">Avg Load Time</p>
            <div className="text-xs text-green-600 mt-1">-0.3s improvement</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-600">99.8%</div>
            <p className="text-sm text-slate-600">System Uptime</p>
            <div className="text-xs text-green-600 mt-1">+0.1% this month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-blue-600">99.2%</div>
            <p className="text-sm text-slate-600">API Success Rate</p>
            <div className="text-xs text-blue-600 mt-1">Stable</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Monitor className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-purple-600">156MB</div>
            <p className="text-sm text-slate-600">Memory Usage</p>
            <div className="text-xs text-purple-600 mt-1">Optimal range</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Error Tracking & Resolution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-red-800">Audio Loading Failures</h4>
                <p className="text-sm text-red-600">23 incidents in the last 7 days</p>
              </div>
              <Badge className="bg-red-100 text-red-800">High Priority</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-yellow-800">Slow Image Loading</h4>
                <p className="text-sm text-yellow-600">12 reports from mobile users</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Medium Priority</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-green-800">Score Sync Issues</h4>
                <p className="text-sm text-green-600">5 incidents - resolved</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Resolved</Badge>
            </div>
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            Advanced Analytics Dashboard
          </h2>
          <p className="text-slate-600">
            Comprehensive insights into platform performance and user behavior
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Insights
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverviewTab()}</TabsContent>
        <TabsContent value="users">{renderUserInsightsTab()}</TabsContent>
        <TabsContent value="performance">{renderPerformanceTab()}</TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
