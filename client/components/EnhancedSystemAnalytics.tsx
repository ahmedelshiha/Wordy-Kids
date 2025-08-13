import React, { useState, useMemo, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Star,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Globe,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Target,
  Calendar,
  Filter,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Eye,
  Settings,
  Bell,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  MessageSquare,
  UserCheck,
  FileText,
  Hash,
  Layers,
} from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";

interface AnalyticsData {
  // Core Metrics
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowthRate: number;
  userRetentionRate: number;
  
  // Engagement Metrics
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  avgSessionDuration: number;
  totalSessions: number;
  sessionGrowthRate: number;
  bounceRate: number;
  
  // Content Metrics
  totalWords: number;
  wordsAddedThisMonth: number;
  contentApprovalRate: number;
  avgWordsPerSession: number;
  popularCategories: Array<{
    name: string;
    count: number;
    growth: number;
  }>;
  
  // Performance Metrics
  systemUptime: number;
  avgLoadTime: number;
  apiSuccessRate: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  
  // Support Metrics
  supportTickets: number;
  avgResponseTime: number;
  resolutionRate: number;
  satisfactionScore: number;
  
  // Geographic Data
  topCountries: Array<{
    country: string;
    users: number;
    percentage: number;
  }>;
  
  // Device Analytics
  deviceBreakdown: Array<{
    device: string;
    percentage: number;
    users: number;
  }>;
  
  // Revenue Metrics
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  conversionRate: number;
  churnRate: number;
}

interface TimeSeriesData {
  date: string;
  users: number;
  sessions: number;
  revenue: number;
  engagement: number;
}

interface EnhancedSystemAnalyticsProps {
  users?: any[];
  categories?: any[];
}

const EnhancedSystemAnalytics: React.FC<EnhancedSystemAnalyticsProps> = ({
  users = [],
  categories = [],
}) => {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("users");
  const [isRealTime, setIsRealTime] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Generate realistic analytics data
  const analyticsData: AnalyticsData = useMemo(() => {
    const totalUsers = users.length || 1247;
    const activeUsers = Math.floor(totalUsers * 0.68);
    const newUsers = Math.floor(totalUsers * 0.12);
    
    return {
      // Core Metrics
      totalUsers,
      activeUsers,
      newUsers,
      userGrowthRate: 23.5,
      userRetentionRate: 78.2,
      
      // Engagement Metrics
      dailyActiveUsers: Math.floor(activeUsers * 0.42),
      monthlyActiveUsers: Math.floor(activeUsers * 1.8),
      avgSessionDuration: 14.2,
      totalSessions: totalUsers * 8,
      sessionGrowthRate: 15.8,
      bounceRate: 23.4,
      
      // Content Metrics
      totalWords: categories.reduce((sum, cat) => sum + (cat.wordCount || 45), 0) || 2847,
      wordsAddedThisMonth: 156,
      contentApprovalRate: 92.1,
      avgWordsPerSession: 12.4,
      popularCategories: [
        { name: "Animals", count: 245, growth: 12.5 },
        { name: "Science", count: 189, growth: 8.7 },
        { name: "Math", count: 167, growth: 15.2 },
        { name: "History", count: 134, growth: -2.1 },
        { name: "Geography", count: 98, growth: 6.8 },
      ],
      
      // Performance Metrics
      systemUptime: 99.7,
      avgLoadTime: 2.1,
      apiSuccessRate: 99.2,
      errorRate: 0.8,
      memoryUsage: 67.3,
      cpuUsage: 34.2,
      
      // Support Metrics
      supportTickets: 23,
      avgResponseTime: 4.2,
      resolutionRate: 94.8,
      satisfactionScore: 4.6,
      
      // Geographic Data
      topCountries: [
        { country: "United States", users: Math.floor(totalUsers * 0.35), percentage: 35 },
        { country: "United Kingdom", users: Math.floor(totalUsers * 0.18), percentage: 18 },
        { country: "Canada", users: Math.floor(totalUsers * 0.12), percentage: 12 },
        { country: "Australia", users: Math.floor(totalUsers * 0.08), percentage: 8 },
        { country: "Germany", users: Math.floor(totalUsers * 0.07), percentage: 7 },
      ],
      
      // Device Analytics
      deviceBreakdown: [
        { device: "Desktop", percentage: 45, users: Math.floor(totalUsers * 0.45) },
        { device: "Mobile", percentage: 38, users: Math.floor(totalUsers * 0.38) },
        { device: "Tablet", percentage: 17, users: Math.floor(totalUsers * 0.17) },
      ],
      
      // Revenue Metrics
      totalRevenue: 24567.89,
      monthlyRecurringRevenue: 8945.32,
      conversionRate: 12.4,
      churnRate: 3.7,
    };
  }, [users, categories]);

  // Generate time series data
  const timeSeriesData: TimeSeriesData[] = useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const data: TimeSeriesData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(analyticsData.activeUsers * (0.8 + Math.random() * 0.4)),
        sessions: Math.floor(analyticsData.totalSessions / 30 * (0.8 + Math.random() * 0.4)),
        revenue: Math.floor(analyticsData.totalRevenue / 30 * (0.8 + Math.random() * 0.4)),
        engagement: Math.floor(60 + Math.random() * 40),
      });
    }
    
    return data;
  }, [timeRange, analyticsData]);

  // Real-time data simulation
  useEffect(() => {
    if (!isRealTime) return;
    
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isRealTime]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setRefreshing(false);
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getHealthStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return { status: "good", color: "text-green-600", icon: CheckCircle };
    if (value >= thresholds.warning) return { status: "warning", color: "text-yellow-600", icon: AlertTriangle };
    return { status: "critical", color: "text-red-600", icon: XCircle };
  };

  const exportAnalytics = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      timeRange,
      metrics: analyticsData,
      timeSeries: timeSeriesData,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">📊 System Analytics</h2>
          <p className="text-slate-600 mt-1">
            Comprehensive platform insights and performance metrics
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isRealTime ? 'Real-time' : 'Static'} • Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRealTime(!isRealTime)}
            className={isRealTime ? "bg-green-50 border-green-200 text-green-700" : ""}
          >
            <Activity className="w-4 h-4 mr-2" />
            {isRealTime ? 'Live' : 'Static'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetailDialog('users')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(analyticsData.userGrowthRate)}
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.userGrowthRate)}`}>
                  {analyticsData.userGrowthRate > 0 ? '+' : ''}{analyticsData.userGrowthRate}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold">
                <AnimatedCounter end={analyticsData.totalUsers} duration={2000} />
              </p>
              <p className="text-xs text-gray-500">
                {analyticsData.activeUsers.toLocaleString()} active users
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetailDialog('engagement')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(analyticsData.sessionGrowthRate)}
                <span className={`text-sm font-medium ${getTrendColor(analyticsData.sessionGrowthRate)}`}>
                  {analyticsData.sessionGrowthRate > 0 ? '+' : ''}{analyticsData.sessionGrowthRate}%
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
              <p className="text-2xl font-bold">
                <AnimatedCounter end={Math.round(analyticsData.activeUsers / analyticsData.totalUsers * 100)} duration={2000} />%
              </p>
              <p className="text-xs text-gray-500">
                {analyticsData.avgSessionDuration}min avg session
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetailDialog('content')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(15.2)}
                <span className="text-sm font-medium text-green-600">+15.2%</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Content Quality</p>
              <p className="text-2xl font-bold">
                <AnimatedCounter end={analyticsData.contentApprovalRate} duration={2000} decimals={1} />%
              </p>
              <p className="text-xs text-gray-500">
                {analyticsData.wordsAddedThisMonth} words added this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetailDialog('performance')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex items-center gap-1">
                {getHealthStatus(analyticsData.systemUptime, { good: 99.5, warning: 99.0 }).icon({ className: "w-4 h-4 " + getHealthStatus(analyticsData.systemUptime, { good: 99.5, warning: 99.0 }).color })}
                <span className={`text-sm font-medium ${getHealthStatus(analyticsData.systemUptime, { good: 99.5, warning: 99.0 }).color}`}>
                  {getHealthStatus(analyticsData.systemUptime, { good: 99.5, warning: 99.0 }).status}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">System Health</p>
              <p className="text-2xl font-bold">
                <AnimatedCounter end={analyticsData.systemUptime} duration={2000} decimals={1} />%
              </p>
              <p className="text-xs text-gray-500">
                {analyticsData.avgLoadTime}s avg load time
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  User Growth Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Daily Active Users</span>
                    <span className="font-bold text-blue-600">
                      {analyticsData.dailyActiveUsers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Monthly Active Users</span>
                    <span className="font-bold text-green-600">
                      {analyticsData.monthlyActiveUsers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>User Retention Rate</span>
                    <span className="font-bold text-purple-600">
                      {analyticsData.userRetentionRate}%
                    </span>
                  </div>
                  
                  {/* Simplified Chart Representation */}
                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Past {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}</span>
                      <span>Growth Trend</span>
                    </div>
                    <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 flex items-end justify-between">
                      {timeSeriesData.slice(-7).map((data, index) => (
                        <div key={index} className="flex flex-col items-center gap-1">
                          <div
                            className="bg-blue-500 rounded-t"
                            style={{
                              height: `${(data.users / Math.max(...timeSeriesData.map(d => d.users))) * 60}px`,
                              width: '8px'
                            }}
                          />
                          <span className="text-xs text-gray-500">
                            {new Date(data.date).getDate()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Engagement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Session Duration</span>
                      <span className="font-bold">{analyticsData.avgSessionDuration}min</span>
                    </div>
                    <Progress value={(analyticsData.avgSessionDuration / 30) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Bounce Rate</span>
                      <span className="font-bold">{analyticsData.bounceRate}%</span>
                    </div>
                    <Progress value={analyticsData.bounceRate} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Words per Session</span>
                      <span className="font-bold">{analyticsData.avgWordsPerSession}</span>
                    </div>
                    <Progress value={(analyticsData.avgWordsPerSession / 20) * 100} className="h-2" />
                  </div>

                  {/* Popular Categories */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Popular Categories</h4>
                    <div className="space-y-2">
                      {analyticsData.popularCategories.slice(0, 3).map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{category.count}</span>
                            <div className="flex items-center gap-1">
                              {getTrendIcon(category.growth)}
                              <span className={`text-xs ${getTrendColor(category.growth)}`}>
                                {category.growth > 0 ? '+' : ''}{category.growth}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                System Health Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Uptime</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {analyticsData.systemUptime}%
                  </div>
                  <Progress value={analyticsData.systemUptime} className="h-2" />
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Cpu className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">CPU</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {analyticsData.cpuUsage}%
                  </div>
                  <Progress value={analyticsData.cpuUsage} className="h-2" />
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <HardDrive className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Memory</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {analyticsData.memoryUsage}%
                  </div>
                  <Progress value={analyticsData.memoryUsage} className="h-2" />
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="font-medium">API Success</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {analyticsData.apiSuccessRate}%
                  </div>
                  <Progress value={analyticsData.apiSuccessRate} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Parents</span>
                    <span className="font-bold">
                      {users.filter(u => u.role === 'parent').length || Math.floor(analyticsData.totalUsers * 0.4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Children</span>
                    <span className="font-bold">
                      {users.filter(u => u.role === 'child').length || Math.floor(analyticsData.totalUsers * 0.45)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Teachers</span>
                    <span className="font-bold">
                      {users.filter(u => u.role === 'teacher').length || Math.floor(analyticsData.totalUsers * 0.12)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Administrators</span>
                    <span className="font-bold">
                      {users.filter(u => u.role === 'admin').length || Math.floor(analyticsData.totalUsers * 0.03)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.deviceBreakdown.map((device, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>{device.device}</span>
                        <span className="font-bold">{device.percentage}%</span>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                      <p className="text-xs text-gray-500">{device.users.toLocaleString()} users</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Words</span>
                    <span className="font-bold">{analyticsData.totalWords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Approval Rate</span>
                    <span className="font-bold text-green-600">{analyticsData.contentApprovalRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Added This Month</span>
                    <span className="font-bold text-blue-600">{analyticsData.wordsAddedThisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg Words/Session</span>
                    <span className="font-bold">{analyticsData.avgWordsPerSession}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.popularCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-500">{category.count} words</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(category.growth)}
                        <span className={`text-sm font-medium ${getTrendColor(category.growth)}`}>
                          {category.growth > 0 ? '+' : ''}{category.growth}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Average Load Time</span>
                      <span className="font-bold">{analyticsData.avgLoadTime}s</span>
                    </div>
                    <Progress value={(analyticsData.avgLoadTime / 5) * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>API Success Rate</span>
                      <span className="font-bold text-green-600">{analyticsData.apiSuccessRate}%</span>
                    </div>
                    <Progress value={analyticsData.apiSuccessRate} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Error Rate</span>
                      <span className="font-bold text-red-600">{analyticsData.errorRate}%</span>
                    </div>
                    <Progress value={analyticsData.errorRate} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Open Tickets</span>
                    <span className="font-bold">{analyticsData.supportTickets}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Avg Response Time</span>
                    <span className="font-bold">{analyticsData.avgResponseTime}h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Resolution Rate</span>
                    <span className="font-bold text-green-600">{analyticsData.resolutionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Satisfaction Score</span>
                    <span className="font-bold text-yellow-600">{analyticsData.satisfactionScore}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topCountries.map((country, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>{country.country}</span>
                      <span className="font-bold">{country.users.toLocaleString()} users</span>
                    </div>
                    <Progress value={country.percentage} className="h-2" />
                    <p className="text-xs text-gray-500">{country.percentage}% of total users</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialogs */}
      {showDetailDialog && (
        <Dialog open={!!showDetailDialog} onOpenChange={() => setShowDetailDialog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {showDetailDialog === 'users' && 'User Analytics Details'}
                {showDetailDialog === 'engagement' && 'Engagement Analytics Details'}
                {showDetailDialog === 'content' && 'Content Analytics Details'}
                {showDetailDialog === 'performance' && 'Performance Analytics Details'}
              </DialogTitle>
              <DialogDescription>
                Detailed breakdown and insights for the selected metric
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {showDetailDialog === 'users' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400">Total Users</p>
                      <p className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">Growth Rate</p>
                      <p className="text-2xl font-bold">+{analyticsData.userGrowthRate}%</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">User Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Active Users</span>
                        <span>{analyticsData.activeUsers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>New Users (This Month)</span>
                        <span>{analyticsData.newUsers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retention Rate</span>
                        <span>{analyticsData.userRetentionRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Add similar detail views for other metrics */}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedSystemAnalytics;
