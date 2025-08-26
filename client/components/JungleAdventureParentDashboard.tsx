import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InteractiveJungleMap } from "./InteractiveJungleMap";
import { FamilyAchievementsTimeline } from "./FamilyAchievementsTimeline";
import { JungleGuideFallback } from "./JungleGuideFallback";
import {
  parentDashboardAnalytics,
  withPerformanceTracking,
} from "@/lib/parentDashboardAnalytics";
import { featureFlagManager } from "@/lib/featureFlags";
import { JungleAdventureStorage } from "@/lib/jungleAdventureStorage";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "./common/ErrorBoundary";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TreePine,
  Leaf,
  Sun,
  Star,
  Trophy,
  Target,
  Heart,
  Crown,
  Compass,
  Binoculars,
  Bird,
  Rabbit,
  Butterfly,
  Flower,
  Mountain,
  Waves,
  Users,
  Settings,
  Calendar,
  TrendingUp,
  Map,
  Award,
  Shield,
  Clock,
  BookOpen,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Download,
  Share,
  ChevronRight,
  Plus,
  AlertCircle,
  CheckCircle,
  Zap,
  Sparkles,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/jungle-adventure-parent-dashboard.css";

interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  level: number;
  wordsLearned: number;
  streakDays: number;
  lastActive: string;
  favoriteCategory: string;
  achievements: string[];
  weeklyProgress: number[];
  goals: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  skills: {
    reading: number;
    vocabulary: number;
    comprehension: number;
    pronunciation: number;
  };
}

interface JungleAdventureParentDashboardProps {
  onBack: () => void;
  className?: string;
}

export const JungleAdventureParentDashboard: React.FC<
  JungleAdventureParentDashboardProps
> = ({ onBack, className }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("week");
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Error handling and feature flags
  const [mapError, setMapError] = useState<string | null>(null);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [dashboardLoadTime, setDashboardLoadTime] = useState<number | null>(
    null,
  );

  // Get feature flag states
  featureFlagManager.setUserContext(user?.uid || "anonymous", "parent");
  const isJungleMapEnabled = featureFlagManager.isEnabled("jungleAnimations");
  const isTimelineEnabled = featureFlagManager.isEnabled("advancedAnalytics");
  const isAnalyticsEnabled = featureFlagManager.isEnabled("performanceOptimizations");

  // Get user preference for jungle map (from parental controls)
  const userSettings = JungleAdventureStorage.getSettings();
  const userMapPreference = userSettings.family?.jungleMapEnabled !== false;

  // Sample data - replace with real data
  const children: Child[] = [
    {
      id: "1",
      name: "Emma",
      age: 4,
      avatar: "🌸",
      level: 12,
      wordsLearned: 156,
      streakDays: 7,
      lastActive: "2 hours ago",
      favoriteCategory: "Animals",
      achievements: ["First Word", "Jungle Explorer", "Reading Star"],
      weeklyProgress: [3, 5, 4, 6, 5, 7, 4],
      goals: { daily: 5, weekly: 30, monthly: 120 },
      skills: {
        reading: 85,
        vocabulary: 78,
        comprehension: 82,
        pronunciation: 75,
      },
    },
    {
      id: "2",
      name: "Leo",
      age: 5,
      avatar: "🦁",
      level: 18,
      wordsLearned: 234,
      streakDays: 12,
      lastActive: "1 hour ago",
      favoriteCategory: "Adventure",
      achievements: ["Word Master", "Adventure Guide", "Vocabulary King"],
      weeklyProgress: [5, 7, 6, 8, 7, 9, 6],
      goals: { daily: 7, weekly: 45, monthly: 180 },
      skills: {
        reading: 92,
        vocabulary: 88,
        comprehension: 90,
        pronunciation: 85,
      },
    },
  ];

  const totalChildren = children.length;
  const totalWordsLearned = children.reduce(
    (sum, child) => sum + child.wordsLearned,
    0,
  );
  const averageProgress =
    children.reduce(
      (sum, child) =>
        sum +
        (child.skills.reading +
          child.skills.vocabulary +
          child.skills.comprehension +
          child.skills.pronunciation) /
          4,
      0,
    ) / totalChildren;

  // Jungle themed floating elements
  const [floatingElements, setFloatingElements] = useState<
    Array<{ id: number; emoji: string; x: number; y: number; delay: number }>
  >([]);

  useEffect(() => {
    const loadStartTime = performance.now();

    // Initialize floating elements
    const elements = [
      { id: 1, emoji: "🦋", x: 10, y: 20, delay: 0 },
      { id: 2, emoji: "🌿", x: 80, y: 40, delay: 1 },
      { id: 3, emoji: "🌺", x: 20, y: 70, delay: 2 },
      { id: 4, emoji: "🦜", x: 90, y: 15, delay: 3 },
      { id: 5, emoji: "🍃", x: 60, y: 85, delay: 4 },
    ];
    setFloatingElements(elements);

    // Track dashboard load performance
    const loadTime = performance.now() - loadStartTime;
    setDashboardLoadTime(loadTime);

    if (isAnalyticsEnabled) {
      parentDashboardAnalytics.trackDashboardLoad(loadTime);
    }
  }, [isAnalyticsEnabled]);

  const quickActions = [
    { icon: Settings, label: "Family Settings", color: "bg-jungle" },
    { icon: Calendar, label: "Schedule Learning", color: "bg-sunshine" },
    { icon: Award, label: "View Achievements", color: "bg-profile-purple" },
    { icon: TrendingUp, label: "Progress Reports", color: "bg-coral-red" },
    { icon: Download, label: "Export Data", color: "bg-playful-purple" },
    { icon: Share, label: "Share Progress", color: "bg-bright-orange" },
  ];

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-jungle-light/10 via-sunshine-light/5 to-sky-light/10 relative overflow-hidden",
        className,
      )}
    >
      {/* Jungle Background Pattern */}
      <div className="absolute inset-0 jungle-pattern-bg opacity-30" />

      {/* Floating Jungle Elements */}
      <AnimatePresence>
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute text-2xl pointer-events-none select-none"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [0.8, 1.2, 0.8],
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: element.delay,
              ease: "easeInOut",
            }}
          >
            {element.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header */}
      <motion.header
        className="relative z-10 bg-white/90 backdrop-blur-lg border-b border-jungle/20 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="jungle-button text-jungle-dark border-jungle/30 hover:bg-jungle/10"
              >
                <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
                Back to Adventure
              </Button>

              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <TreePine className="w-8 h-8 text-jungle animate-jungle-sway" />
                  <Sparkles className="w-4 h-4 text-sunshine absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-jungle-dark">
                    🏡 Family Zone
                  </h1>
                  <p className="text-sm text-jungle-dark/70">
                    Welcome to your jungle adventure control center!
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowQuickActions(!showQuickActions)}
                variant="outline"
                size="sm"
                className="jungle-button text-jungle-dark border-jungle/30 hover:bg-jungle/10"
              >
                <Zap className="w-4 h-4 mr-2" />
                Quick Actions
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="jungle-button text-sunshine-dark border-sunshine/30 hover:bg-sunshine/10"
                  >
                    <Gift className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Family Rewards & Surprises</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Quick Actions Panel */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            className="fixed top-20 right-6 z-50 bg-white/95 backdrop-blur-lg border border-jungle/20 rounded-2xl shadow-2xl p-4"
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
          >
            <div className="grid gap-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl text-white font-medium transition-all hover:scale-105",
                    action.color,
                  )}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <action.icon className="w-4 h-4" />
                  <span className="text-sm">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Overview Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="jungle-card hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-jungle-dark/70 mb-1">
                    Total Children
                  </p>
                  <p className="text-3xl font-bold text-jungle">
                    {totalChildren}
                  </p>
                </div>
                <div className="bg-jungle/10 p-3 rounded-full">
                  <Users className="w-6 h-6 text-jungle" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-coral-red" />
                <span className="text-sm text-jungle-dark/70">
                  Adventure companions
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="jungle-card hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-jungle-dark/70 mb-1">
                    Words Discovered
                  </p>
                  <p className="text-3xl font-bold text-sunshine">
                    {totalWordsLearned}
                  </p>
                </div>
                <div className="bg-sunshine/10 p-3 rounded-full">
                  <BookOpen className="w-6 h-6 text-sunshine" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-sunshine" />
                <span className="text-sm text-jungle-dark/70">
                  Vocabulary treasures
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="jungle-card hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-jungle-dark/70 mb-1">
                    Average Progress
                  </p>
                  <p className="text-3xl font-bold text-profile-purple">
                    {Math.round(averageProgress)}%
                  </p>
                </div>
                <div className="bg-profile-purple/10 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-profile-purple" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={averageProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm border border-jungle/20 p-1 mb-8">
              <TabsTrigger
                value="overview"
                className="jungle-tab data-[state=active]:bg-jungle data-[state=active]:text-white"
              >
                <Compass className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="children"
                className="jungle-tab data-[state=active]:bg-sunshine data-[state=active]:text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Children
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="jungle-tab data-[state=active]:bg-profile-purple data-[state=active]:text-white"
              >
                <Map className="w-4 h-4 mr-2" />
                Adventure Map
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="jungle-tab data-[state=active]:bg-coral-red data-[state=active]:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Recent Activity */}
              <Card className="jungle-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-jungle-dark">
                    <Clock className="w-5 h-5 text-jungle" />
                    🌟 Recent Jungle Adventures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {children.map((child, index) => (
                      <motion.div
                        key={child.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-jungle/5 to-sunshine/5 rounded-lg border border-jungle/10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{child.avatar}</div>
                          <div>
                            <p className="font-medium text-jungle-dark">
                              {child.name}
                            </p>
                            <p className="text-sm text-jungle-dark/70">
                              Last active: {child.lastActive}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-jungle/10 text-jungle border-jungle/20">
                            Level {child.level}
                          </Badge>
                          <Badge className="bg-sunshine/10 text-sunshine-dark border-sunshine/20">
                            🔥 {child.streakDays} days
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Family Goals */}
              <Card className="jungle-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-jungle-dark">
                    <Target className="w-5 h-5 text-coral-red" />
                    🎯 Family Adventure Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-jungle-dark">
                            Weekly Words
                          </span>
                          <span className="text-sm text-jungle-dark/70">
                            156/200
                          </span>
                        </div>
                        <Progress
                          value={78}
                          className="h-2 jungle-progress-bar"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-jungle-dark">
                            Reading Time
                          </span>
                          <span className="text-sm text-jungle-dark/70">
                            42/60 mins
                          </span>
                        </div>
                        <Progress
                          value={70}
                          className="h-2 jungle-progress-bar"
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-jungle/10 to-sunshine/10 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-5 h-5 text-sunshine" />
                        <span className="font-medium text-jungle-dark">
                          Weekly Challenge
                        </span>
                      </div>
                      <p className="text-sm text-jungle-dark/70 mb-3">
                        Explore 3 new word categories together!
                      </p>
                      <div className="flex gap-2">
                        <Badge className="bg-jungle text-white">
                          Animals ✓
                        </Badge>
                        <Badge className="bg-sunshine text-white">
                          Nature ✓
                        </Badge>
                        <Badge variant="outline" className="border-jungle/30">
                          Adventure
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Children Tab */}
          <TabsContent value="children">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {children.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card className="jungle-card hover:scale-105 transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-jungle/10 to-sunshine/10">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{child.avatar}</div>
                        <div className="flex-1">
                          <CardTitle className="text-jungle-dark">
                            {child.name}
                          </CardTitle>
                          <p className="text-sm text-jungle-dark/70">
                            Age {child.age} • Level {child.level}
                          </p>
                        </div>
                        <Badge className="bg-jungle text-white">
                          🏆 {child.achievements.length}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                      {/* Progress Skills */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-jungle-dark flex items-center gap-2">
                          <Star className="w-4 h-4 text-sunshine" />
                          Adventure Skills
                        </h4>

                        {Object.entries(child.skills).map(([skill, value]) => (
                          <div key={skill}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm capitalize text-jungle-dark/70">
                                {skill}
                              </span>
                              <span className="text-sm font-medium text-jungle-dark">
                                {value}%
                              </span>
                            </div>
                            <Progress value={value} className="h-2" />
                          </div>
                        ))}
                      </div>

                      {/* Recent Achievements */}
                      <div>
                        <h4 className="font-medium text-jungle-dark mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4 text-coral-red" />
                          Latest Treasures
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {child.achievements.map((achievement) => (
                            <Badge
                              key={achievement}
                              variant="outline"
                              className="border-jungle/30 text-jungle-dark text-xs"
                            >
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="jungle-button flex-1">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Start Adventure
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-jungle/30"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="jungle-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-jungle-dark">
                    <Map className="w-5 h-5 text-profile-purple" />
                    🗺️ Interactive Adventure Map
                  </CardTitle>
                  <p className="text-sm text-jungle-dark/70 mt-2">
                    Explore your child's learning journey through the magical
                    jungle! Click on markers to see progress details.
                  </p>
                </CardHeader>
                <CardContent className="p-0">
                  {isJungleMapEnabled && userMapPreference ? (
                    <div className="relative">
                      {mapError ? (
                        <JungleGuideFallback
                          error={mapError}
                          onRetry={() => {
                            setMapError(null);
                            if (isAnalyticsEnabled) {
                              parentDashboardAnalytics.trackFeatureUsage(
                                "jungle-map",
                                "retry_after_error",
                              );
                            }
                          }}
                          retryText="Reload Map"
                          showBasicStats={true}
                        />
                      ) : (
                        <div
                          onError={(error) => {
                            const errorMessage =
                              error instanceof Error
                                ? error.message
                                : "Map failed to load";
                            setMapError(errorMessage);
                            if (isAnalyticsEnabled) {
                              parentDashboardAnalytics.trackError(
                                "map",
                                errorMessage,
                              );
                            }
                          }}
                        >
                          <ErrorBoundary
                            fallbackType="kid"
                            componentName="InteractiveJungleMap"
                          >
                            <InteractiveJungleMap
                              className="w-full"
                              onMarkerClick={(marker) => {
                                if (isAnalyticsEnabled) {
                                  parentDashboardAnalytics.trackMapInteraction(
                                    "marker_click",
                                    {
                                      markerId: marker.id,
                                      markerType: marker.type,
                                    },
                                  );
                                }
                                console.log("Marker clicked:", marker);
                              }}
                            />
                          </ErrorBoundary>
                        </div>
                      )}
                    </div>
                  ) : (
                    <JungleGuideFallback
                      error={
                        !userMapPreference
                          ? "Interactive map disabled in settings"
                          : "Map feature not available"
                      }
                      onRetry={
                        !userMapPreference
                          ? undefined
                          : () => {
                              if (isAnalyticsEnabled) {
                                parentDashboardAnalytics.trackFeatureUsage(
                                  "jungle-map",
                                  "enable_attempt",
                                );
                              }
                            }
                      }
                      retryText={!userMapPreference ? undefined : "Enable Map"}
                      showBasicStats={true}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats Below Map */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="jungle-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-jungle-dark/70">Completed</p>
                        <p className="text-lg font-semibold text-jungle-dark">
                          3 Milestones
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="jungle-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-500 w-8 h-8 rounded-full flex items-center justify-center">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-jungle-dark/70">
                          In Progress
                        </p>
                        <p className="text-lg font-semibold text-jungle-dark">
                          1 Challenge
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="jungle-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-jungle-dark/70">Unlocked</p>
                        <p className="text-lg font-semibold text-jungle-dark">
                          2 Areas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Family Achievements Timeline */}
              {isTimelineEnabled ? (
                timelineError ? (
                  <JungleGuideFallback
                    error={timelineError}
                    onRetry={() => {
                      setTimelineError(null);
                      if (isAnalyticsEnabled) {
                        parentDashboardAnalytics.trackFeatureUsage(
                          "timeline",
                          "retry_after_error",
                        );
                      }
                    }}
                    retryText="Reload Timeline"
                    showBasicStats={false}
                  />
                ) : (
                  <div
                    onError={(error) => {
                      const errorMessage =
                        error instanceof Error
                          ? error.message
                          : "Timeline failed to load";
                      setTimelineError(errorMessage);
                      if (isAnalyticsEnabled) {
                        parentDashboardAnalytics.trackError(
                          "timeline",
                          errorMessage,
                        );
                      }
                    }}
                  >
                    <ErrorBoundary
                      fallbackType="parent"
                      componentName="FamilyAchievementsTimeline"
                    >
                      <FamilyAchievementsTimeline
                        className="w-full"
                        onEventClick={(event) => {
                          if (isAnalyticsEnabled) {
                            parentDashboardAnalytics.trackTimelineEventClick(
                              event.type,
                              {
                                eventId: event.id,
                                category: event.category,
                              },
                            );
                          }
                          console.log("Timeline event clicked:", event);
                        }}
                      />
                    </ErrorBoundary>
                  </div>
                )
              ) : (
                <Card className="jungle-card">
                  <CardContent className="p-8 text-center">
                    <p className="text-jungle-dark/70">
                      🌟 Family Timeline feature coming soon! Keep exploring
                      your learning adventure.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="jungle-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-jungle-dark">
                    <Settings className="w-5 h-5 text-coral-red" />
                    ⚙️ Family Adventure Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Family Mode Settings */}
                  <div>
                    <h4 className="font-medium text-jungle-dark mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-jungle" />
                      Family Safety & Controls
                    </h4>
                    <div className="space-y-4 pl-6">
                      <Button className="jungle-button w-full justify-start">
                        <Users className="w-4 h-4 mr-3" />
                        Manage Children Profiles
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-jungle/30"
                      >
                        <Clock className="w-4 h-4 mr-3" />
                        Set Learning Time Limits
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-jungle/30"
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        Privacy & Data Settings
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </div>
                  </div>

                  {/* Learning Preferences */}
                  <div>
                    <h4 className="font-medium text-jungle-dark mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sunshine" />
                      Adventure Learning Preferences
                    </h4>
                    <div className="space-y-4 pl-6">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-sunshine/30"
                      >
                        <Target className="w-4 h-4 mr-3" />
                        Set Family Goals
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-sunshine/30"
                      >
                        <Calendar className="w-4 h-4 mr-3" />
                        Schedule Learning Sessions
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-sunshine/30"
                      >
                        <Award className="w-4 h-4 mr-3" />
                        Customize Rewards System
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </div>
                  </div>

                  {/* Export & Sharing */}
                  <div>
                    <h4 className="font-medium text-jungle-dark mb-4 flex items-center gap-2">
                      <Share className="w-4 h-4 text-profile-purple" />
                      Reports & Sharing
                    </h4>
                    <div className="space-y-4 pl-6">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-profile-purple/30"
                      >
                        <Download className="w-4 h-4 mr-3" />
                        Export Progress Reports
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-profile-purple/30"
                      >
                        <Share className="w-4 h-4 mr-3" />
                        Share with Teachers
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default JungleAdventureParentDashboard;
