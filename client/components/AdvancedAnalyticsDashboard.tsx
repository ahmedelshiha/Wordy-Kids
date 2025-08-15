import React, { useState, useEffect } from "react";
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
import {
  analyticsDataService,
  RealTimeAnalyticsData,
  AnalyticsMetric,
  UsagePattern,
  LearningOutcome,
  GeographicData,
  DeviceAnalytics
} from "@/lib/analyticsDataService";


const AdvancedAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<RealTimeAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsDataService.getAnalyticsData(timeRange);
      setAnalyticsData(data);
    } catch (err) {
      setError("Failed to load analytics data");
      console.error("Analytics data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    analyticsDataService.refreshData();
    loadAnalyticsData();
  };

  // Add icons to metrics data
  const enrichMetricsWithIcons = (metrics: AnalyticsMetric[]): AnalyticsMetric[] => {
    const iconMap: Record<string, React.ReactNode> = {
      active_users: <Users className="w-6 h-6" />,
      learning_sessions: <BookOpen className="w-6 h-6" />,
      avg_session_time: <Clock className="w-6 h-6" />,
      completion_rate: <Target className="w-6 h-6" />,
      user_satisfaction: <Star className="w-6 h-6" />,
      retention_rate: <Heart className="w-6 h-6" />
    };

    return metrics.map(metric => ({
      ...metric,
      icon: iconMap[metric.id] || <Activity className="w-6 h-6" />
    }));
  };

  // Add icons to device analytics
  const enrichDeviceAnalyticsWithIcons = (devices: DeviceAnalytics[]): DeviceAnalytics[] => {
    const iconMap: Record<string, React.ReactNode> = {
      Mobile: <Smartphone className="w-5 h-5" />,
      Desktop: <Monitor className="w-5 h-5" />,
      Tablet: <Tablet className="w-5 h-5" />
    };

    return devices.map(device => ({
      ...device,
      icon: iconMap[device.device] || <Monitor className="w-5 h-5" />
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              Advanced Analytics Dashboard
            </h2>
            <p className="text-slate-600">Loading real-time analytics data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              Advanced Analytics Dashboard
            </h2>
            <p className="text-slate-600 text-red-600">{error}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  const keyMetrics = enrichMetricsWithIcons(analyticsData.keyMetrics);
  const usagePatterns = analyticsData.usagePatterns;
  const learningOutcomes = analyticsData.learningOutcomes;
  const geographicData = analyticsData.geographicData;
  const deviceAnalytics = enrichDeviceAnalyticsWithIcons(analyticsData.deviceAnalytics);

  // Fallback data for static sections (will be replaced with real data as available)
  const fallbackKeyMetrics: AnalyticsMetric[] = [
      {
        id: "active_users",
        name: "Active Users",
        value: 0,
        previousValue: 0,
        unit: "",
        trend: "stable" as const,
        changePercent: 0,
        icon: <Users className="w-6 h-6" />,
        color: "text-blue-600",
      },
      {
        id: "learning_sessions",
        name: "Learning Sessions",
        value: 0,
        previousValue: 0,
        unit: "",
        trend: "stable" as const,
        changePercent: 0,
        icon: <BookOpen className="w-6 h-6" />,
        color: "text-green-600",
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
                  vs {metric.previousValue.toLocaleString()} {metric.unit} last
                  period
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
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <span className="font-medium w-20">
                      {pattern.timeOfDay}
                    </span>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {pattern.sessions.toLocaleString()} sessions
                        </span>
                        <span>{pattern.completionRate}% completion</span>
                        <span>{pattern.avgDuration}min avg</span>
                      </div>
                      <Progress
                        value={usagePatterns.length > 0 ?
                          (pattern.sessions / Math.max(...usagePatterns.map(p => p.sessions))) * 100 : 0}
                        className="h-2"
                      />
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
                      <span>
                        {Math.round(
                          (outcome.masteredWords / outcome.totalWords) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(outcome.masteredWords / outcome.totalWords) * 100}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Avg Accuracy</span>
                      <p className="font-semibold">
                        {outcome.averageAccuracy}%
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600">Improvement</span>
                      <p className="font-semibold text-green-600">
                        +{outcome.improvementRate}%
                      </p>
                    </div>
                  </div>
                  {outcome.strugglingAreas.length > 0 && (
                    <div>
                      <span className="text-xs text-slate-600">
                        Needs attention:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {outcome.strugglingAreas.map((area, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
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
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
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
                    <Progress value={geographicData.length > 0 ?
                      (region.users / Math.max(...geographicData.map(r => r.users))) * 100 : 0} />
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
              <div className="text-xs text-blue-600 mt-1">
                +23% vs last week
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">8,420</div>
              <p className="text-sm text-green-800">Returning Users</p>
              <div className="text-xs text-green-600 mt-1">
                +12% vs last week
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">73.2%</div>
              <p className="text-sm text-purple-800">7-Day Retention</p>
              <div className="text-xs text-purple-600 mt-1">
                +1.9% vs last week
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">45.8%</div>
              <p className="text-sm text-orange-800">30-Day Retention</p>
              <div className="text-xs text-orange-600 mt-1">
                +3.2% vs last month
              </div>
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
                <h4 className="font-semibold text-red-800">
                  Audio Loading Failures
                </h4>
                <p className="text-sm text-red-600">
                  23 incidents in the last 7 days
                </p>
              </div>
              <Badge className="bg-red-100 text-red-800">High Priority</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-yellow-800">
                  Slow Image Loading
                </h4>
                <p className="text-sm text-yellow-600">
                  12 reports from mobile users
                </p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                Medium Priority
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-green-800">
                  Score Sync Issues
                </h4>
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
