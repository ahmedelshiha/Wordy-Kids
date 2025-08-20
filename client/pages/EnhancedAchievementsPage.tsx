import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Star,
  Target,
  BookOpen,
  Zap,
  Heart,
  Crown,
  Gem,
  Rocket,
  Sparkles,
  Gift,
  Lock,
  Check,
  BarChart3,
  PieChart,
  Activity,
  Brain,
  Calendar,
  TrendingUp,
  Award,
  Medal,
  ChevronRight,
  ArrowLeft,
  Leaf,
  TreePine,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { enhancedAchievementSystem } from "@/lib/enhancedAchievementSystem";
import { enhancedBadgeSystem } from "@/lib/enhancedBadgeSystem";
import { enhancedLearningAnalytics } from "@/lib/enhancedLearningAnalytics";
import { enhancedRewardCelebration } from "@/lib/enhancedRewardCelebration";
import type { 
  EnhancedAchievement, 
  LearningJourney 
} from "@/lib/enhancedAchievementSystem";
import type { 
  EnhancedBadge, 
  BadgeCollection 
} from "@/lib/enhancedBadgeSystem";
import type { 
  JungleProgressReport 
} from "@/lib/enhancedLearningAnalytics";

interface EnhancedAchievementsPageProps {
  onBack?: () => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "bronze":
      return "from-amber-400 to-amber-600";
    case "silver":
      return "from-gray-400 to-gray-600";
    case "gold":
      return "from-yellow-400 to-yellow-600";
    case "diamond":
      return "from-cyan-400 to-blue-600";
    case "legendary":
      return "from-pink-400 to-purple-600";
    default:
      return "from-gray-400 to-gray-600";
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "bronze":
      return "border-orange-400 bg-orange-50/20";
    case "silver":
      return "border-gray-400 bg-gray-50/20";
    case "gold":
      return "border-yellow-400 bg-yellow-50/20";
    case "platinum":
      return "border-purple-400 bg-purple-50/20";
    case "diamond":
      return "border-cyan-400 bg-cyan-50/20";
    case "legendary":
      return "border-pink-400 bg-pink-50/20";
    default:
      return "border-gray-300 bg-gray-50/20";
  }
};

export function EnhancedAchievementsPage({ onBack }: EnhancedAchievementsPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [learningJourney, setLearningJourney] = useState<LearningJourney | null>(null);
  const [badgeCollection, setBadgeCollection] = useState<BadgeCollection | null>(null);
  const [progressReport, setProgressReport] = useState<JungleProgressReport | null>(null);
  const [achievements, setAchievements] = useState<EnhancedAchievement[]>([]);
  const [badges, setBadges] = useState<EnhancedBadge[]>([]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load learning journey
        const journey = await enhancedAchievementSystem.getLearningJourney("current_user");
        setLearningJourney(journey);
        
        // Load achievements
        const achievementsList = enhancedAchievementSystem.getAchievements();
        setAchievements(achievementsList);
        
        // Load badge collection
        const collection = enhancedBadgeSystem.getBadgeCollection();
        setBadgeCollection(collection);
        
        // Load all badges
        const allBadges = enhancedBadgeSystem.getAllBadges();
        setBadges(allBadges);
        
        // Load progress report
        const report = enhancedLearningAnalytics.getJungleProgressReport();
        setProgressReport(report);
        
      } catch (error) {
        console.error("Error loading achievements data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const categories = [
    { id: "all", name: "All", icon: "🏆" },
    { id: "learning", name: "Learning", icon: "📚" },
    { id: "streak", name: "Streaks", icon: "🔥" },
    { id: "quiz", name: "Quizzes", icon: "🧠" },
    { id: "exploration", name: "Explorer", icon: "🗺️" },
    { id: "mastery", name: "Mastery", icon: "👑" },
  ];

  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalAchievementPoints = enhancedAchievementSystem.getTotalAchievementPoints();

  if (isLoading) {
    return (
      <div className="min-h-screen jungle-pattern-bg jungle-mobile-optimized flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-jungle mx-auto mb-4"></div>
          <p className="text-jungle-dark font-semibold">Loading your jungle adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen jungle-pattern-bg jungle-mobile-optimized">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-40 backdrop-blur-lg bg-white/10 border-b border-jungle/20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="jungle-card text-jungle-dark hover:bg-jungle/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-jungle-dark flex items-center gap-2">
                  <TreePine className="w-8 h-8 text-jungle" />
                  Jungle Adventure Progress
                </h1>
                <p className="text-jungle-dark/70 text-sm md:text-base">
                  Track your amazing learning journey through the jungle
                </p>
              </div>
            </div>
            
            {/* Level Badge */}
            {learningJourney && (
              <div className="jungle-card p-3 text-center">
                <div className="text-2xl font-bold text-jungle-dark">
                  Level {learningJourney.level}
                </div>
                <div className="text-xs text-jungle-dark/70">Jungle Hero</div>
                <Progress 
                  value={(learningJourney.experience / learningJourney.nextLevelThreshold) * 100} 
                  className="h-2 mt-1 bg-jungle/20"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-white/10 backdrop-blur-lg p-2 mb-6">
            <TabsTrigger
              value="overview"
              className="jungle-card data-[state=active]:bg-jungle data-[state=active]:text-white flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="jungle-card data-[state=active]:bg-jungle data-[state=active]:text-white flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden md:inline">Achievements</span>
            </TabsTrigger>
            <TabsTrigger
              value="badges"
              className="jungle-card data-[state=active]:bg-jungle data-[state=active]:text-white flex items-center gap-2"
            >
              <Medal className="w-4 h-4" />
              <span className="hidden md:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="jungle-card data-[state=active]:bg-jungle data-[state=active]:text-white flex items-center gap-2"
            >
              <PieChart className="w-4 h-4" />
              <span className="hidden md:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="jungle-card bg-gradient-to-r from-jungle/5 to-sunshine/5 hover:scale-105 transition-all">
                  <CardContent className="p-4 text-center">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-jungle animate-pulse" />
                    <div className="text-2xl font-bold text-jungle-dark">
                      {learningJourney?.totalWordsLearned || 0}
                    </div>
                    <p className="text-sm text-jungle-dark/70">Words Rescued</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="jungle-card bg-gradient-to-r from-jungle/5 to-sunshine/5 hover:scale-105 transition-all">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-sunshine animate-bounce" />
                    <div className="text-2xl font-bold text-jungle-dark">
                      {learningJourney?.streakDays || 0}
                    </div>
                    <p className="text-sm text-jungle-dark/70">Day Streak</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="jungle-card bg-gradient-to-r from-jungle/5 to-sunshine/5 hover:scale-105 transition-all">
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-sunshine animate-pulse" />
                    <div className="text-2xl font-bold text-jungle-dark">
                      {unlockedAchievements.length}
                    </div>
                    <p className="text-sm text-jungle-dark/70">Achievements</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="jungle-card bg-gradient-to-r from-jungle/5 to-sunshine/5 hover:scale-105 transition-all">
                  <CardContent className="p-4 text-center">
                    <Medal className="w-8 h-8 mx-auto mb-2 text-jungle animate-pulse" />
                    <div className="text-2xl font-bold text-jungle-dark">
                      {badgeCollection?.earnedBadges || 0}
                    </div>
                    <p className="text-sm text-jungle-dark/70">Badges Earned</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Progress Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Weekly Progress */}
              <Card className="jungle-card bg-gradient-to-br from-jungle/5 to-sunshine/5">
                <CardHeader>
                  <CardTitle className="text-jungle-dark flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Weekly Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 h-32 mb-4">
                    {learningJourney?.weeklyProgress.map((value, index) => {
                      const maxValue = Math.max(...(learningJourney?.weeklyProgress || [1]));
                      const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                      const emojis = ["🌱", "🌿", "🍃", "🌳", "🦋", "🌺", "🏆"];

                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div className="flex-1 flex flex-col justify-end">
                            <motion.div
                              className="bg-gradient-to-t from-jungle to-sunshine rounded-t-lg min-h-[4px]"
                              style={{ height: `${height}%` }}
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ delay: index * 0.1, duration: 0.8 }}
                            />
                          </div>
                          <p className="text-xs text-jungle-dark/70 mt-1">{days[index]}</p>
                          <p className="text-lg">{emojis[index]}</p>
                          <p className="text-xs font-bold text-jungle-dark">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-center text-jungle-dark font-semibold text-sm">
                    Keep exploring the jungle! 🌿
                  </p>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="jungle-card bg-gradient-to-br from-jungle/5 to-sunshine/5">
                <CardHeader>
                  <CardTitle className="text-jungle-dark flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Recent Victories
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {unlockedAchievements.slice(0, 4).map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white/20 backdrop-blur-sm"
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-jungle-dark text-sm">
                          {achievement.name}
                        </div>
                        <div className="text-xs text-jungle-dark/70">
                          {achievement.description}
                        </div>
                      </div>
                      <Badge className="bg-jungle text-white text-xs">
                        {achievement.difficulty}
                      </Badge>
                    </motion.div>
                  ))}
                  
                  {unlockedAchievements.length === 0 && (
                    <div className="text-center text-jungle-dark/70 py-4">
                      <Leaf className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Start your jungle adventure to unlock achievements!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            {/* Achievement Stats */}
            <div className="flex justify-center gap-4 mb-6">
              <Card className="jungle-card bg-gradient-to-r from-jungle to-sunshine text-white hover:scale-105 transition-all">
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold">{unlockedAchievements.length}</div>
                  <div className="text-xs opacity-90">Unlocked</div>
                </CardContent>
              </Card>
              <Card className="jungle-card bg-gradient-to-r from-sunshine to-jungle text-white hover:scale-105 transition-all">
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold">{totalAchievementPoints}</div>
                  <div className="text-xs opacity-90">Points</div>
                </CardContent>
              </Card>
            </div>

            {/* Category Filters */}
            <div className="flex justify-center gap-2 flex-wrap mb-6">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "hover:scale-105 transition-all text-xs px-3 py-2",
                    selectedCategory === category.id 
                      ? "bg-jungle text-white hover:bg-jungle-dark"
                      : "jungle-card text-jungle-dark hover:bg-jungle/10"
                  )}
                >
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredAchievements.map((achievement, index) => {
                  const progressPercentage = Math.min(
                    (achievement.currentProgress / achievement.requirements.threshold) * 100,
                    100
                  );

                  return (
                    <motion.div
                      key={achievement.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={cn(
                          "jungle-card cursor-pointer transition-all duration-300 hover:scale-105",
                          achievement.unlocked
                            ? `bg-gradient-to-br ${getDifficultyColor(achievement.difficulty)} text-white shadow-lg`
                            : "bg-gradient-to-br from-jungle/5 to-sunshine/5 border-dashed border-jungle/30"
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-3xl">{achievement.icon}</div>
                            <div className="flex items-center gap-1">
                              {achievement.unlocked ? (
                                <Check className="w-4 h-4 text-green-300" />
                              ) : progressPercentage >= 100 ? (
                                <Sparkles className="w-4 h-4 text-sunshine animate-pulse" />
                              ) : (
                                <Lock className="w-4 h-4 text-jungle-dark/50" />
                              )}
                            </div>
                          </div>

                          <h3 className={cn(
                            "font-bold text-sm mb-2",
                            achievement.unlocked ? "text-white" : "text-jungle-dark"
                          )}>
                            {achievement.name}
                          </h3>

                          <p className={cn(
                            "text-xs mb-3 leading-tight",
                            achievement.unlocked ? "text-white/90" : "text-jungle-dark/70"
                          )}>
                            {achievement.description}
                          </p>

                          {!achievement.unlocked && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-jungle-dark/70">Progress</span>
                                <span className="font-semibold text-jungle-dark">
                                  {achievement.currentProgress}/{achievement.requirements.threshold}
                                </span>
                              </div>
                              <Progress
                                value={progressPercentage}
                                className="h-2 bg-jungle/20"
                              />
                              {progressPercentage >= 100 && (
                                <Badge className="bg-sunshine text-white text-xs animate-pulse">
                                  Ready to unlock! 🎉
                                </Badge>
                              )}
                            </div>
                          )}

                          {achievement.unlocked && achievement.reward && (
                            <div className="bg-white/20 rounded-lg p-2 mt-3">
                              <div className="text-xs font-semibold text-white/90 mb-1">
                                Reward:
                              </div>
                              <div className="text-sm text-white flex items-center gap-2">
                                <Gift className="w-3 h-3" />
                                {achievement.reward.item}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredAchievements.length === 0 && (
              <div className="text-center py-12">
                <TreePine className="w-16 h-16 mx-auto mb-4 text-jungle/50" />
                <p className="text-jungle-dark/70">No achievements found in this category.</p>
              </div>
            )}
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "jungle-card transition-all duration-300 hover:scale-105",
                      badge.earned
                        ? `${getTierColor(badge.tier)} border-2`
                        : "bg-gradient-to-br from-jungle/5 to-sunshine/5 opacity-60"
                    )}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="relative mb-4">
                        <div
                          className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl",
                            badge.earned
                              ? "bg-gradient-to-r from-sunshine to-jungle"
                              : "bg-jungle/20"
                          )}
                        >
                          {badge.earned ? badge.icon : "🔒"}
                        </div>

                        {badge.earned && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-jungle rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <h3 className={cn(
                        "text-sm font-bold mb-2",
                        badge.earned ? "text-jungle-dark" : "text-jungle-dark/50"
                      )}>
                        {badge.name}
                      </h3>

                      <p className={cn(
                        "text-xs mb-3",
                        badge.earned ? "text-jungle-dark/70" : "text-jungle-dark/40"
                      )}>
                        {badge.description}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs capitalize",
                            badge.tier === "bronze" ? "border-orange-400 text-orange-600" :
                            badge.tier === "silver" ? "border-gray-400 text-gray-600" :
                            badge.tier === "gold" ? "border-yellow-400 text-yellow-600" :
                            badge.tier === "platinum" ? "border-purple-400 text-purple-600" :
                            "border-cyan-400 text-cyan-600"
                          )}
                        >
                          {badge.tier}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {badge.category}
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className={badge.earned ? "text-jungle" : "text-jungle-dark/50"}>
                            {badge.earned ? "Completed!" : "Progress"}
                          </span>
                          <span className={badge.earned ? "text-jungle" : "text-jungle-dark/50"}>
                            {badge.currentProgress}/{badge.requirements.threshold}
                          </span>
                        </div>
                        <Progress
                          value={(badge.currentProgress / badge.requirements.threshold) * 100}
                          className={cn(
                            "h-2",
                            badge.earned ? "bg-jungle/20" : "bg-jungle/10"
                          )}
                        />
                      </div>

                      {/* Rewards */}
                      <div className="mt-3 pt-3 border-t border-jungle/20">
                        <div className="text-xs text-jungle-dark/70 mb-1">Rewards</div>
                        <div className="flex justify-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-sunshine">🪙</span>
                            <span>{badge.rewards.coins}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-jungle" />
                            <span>{badge.rewards.xp} XP</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {progressReport && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Jungle Exploration Map */}
                <Card className="jungle-card bg-gradient-to-br from-jungle/5 to-sunshine/5 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-jungle-dark flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Jungle Exploration Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-jungle-dark">
                          {progressReport.jungleExplorationMap.visitedAreas.length}
                        </div>
                        <div className="text-sm text-jungle-dark/70">Areas Explored</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-jungle-dark">
                          {progressReport.jungleExplorationMap.completedQuests.length}
                        </div>
                        <div className="text-sm text-jungle-dark/70">Quests Completed</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-jungle-dark">
                          {progressReport.jungleExplorationMap.discoveredSecrets}
                        </div>
                        <div className="text-sm text-jungle-dark/70">Secrets Found</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-jungle-dark">
                          {progressReport.jungleExplorationMap.rescuedCreatures}
                        </div>
                        <div className="text-sm text-jungle-dark/70">Words Rescued</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parental Insights */}
                <Card className="jungle-card bg-gradient-to-br from-jungle/5 to-sunshine/5">
                  <CardHeader>
                    <CardTitle className="text-jungle-dark flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      Progress Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-jungle-dark capitalize">
                        {progressReport.parentalInsights.engagementLevel}
                      </div>
                      <div className="text-sm text-jungle-dark/70">Engagement Level</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-jungle-dark">
                        {Math.round(progressReport.parentalInsights.consistencyRating)}%
                      </div>
                      <div className="text-sm text-jungle-dark/70">Consistency</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-jungle-dark capitalize">
                        {progressReport.parentalInsights.progressVelocity.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-jungle-dark/70">Progress Pace</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
