import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  BarChart3,
  Map,
  Gift,
  Settings,
  RefreshCw,
  Star,
  Crown,
  Sparkles,
} from "lucide-react";
import { EnhancedJungleAchievementSystem } from "@/components/EnhancedJungleAchievementSystem";
import { EnhancedJungleLearningAnalytics } from "@/components/EnhancedJungleLearningAnalytics";
import { EnhancedJungleRewardCelebration } from "@/components/EnhancedJungleRewardCelebration";
import { JungleBadges } from "@/components/ui/enhanced-badge";
import { audioService } from "@/lib/audioService";
import { AchievementTracker } from "@/lib/achievementTracker";
import { useAuth } from "@/hooks/useAuth";

interface JungleAdventureProgressSystemProps {
  initialTab?: "achievements" | "analytics" | "overview";
  mobileOptimized?: boolean;
  showAllFeatures?: boolean;
  onAchievementUnlock?: (achievement: any) => void;
  onRegionUnlock?: (region: string) => void;
  className?: string;
}

export const JungleAdventureProgressSystem: React.FC<
  JungleAdventureProgressSystemProps
> = ({
  initialTab = "overview",
  mobileOptimized = true,
  showAllFeatures = true,
  onAchievementUnlock,
  onRegionUnlock,
  className = "",
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [celebratingAchievement, setCelebratingAchievement] =
    useState<any>(null);
  const [celebratingRegion, setCelebratingRegion] = useState<any>(null);
  const [celebratingAnimalFriend, setCelebratingAnimalFriend] =
    useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [progressStats, setProgressStats] = useState({
    totalWords: 0,
    regionsExplored: 0,
    achievementsUnlocked: 0,
    currentStreak: 0,
    animalFriends: 0,
  });

  // Load progress stats
  useEffect(() => {
    loadProgressStats();
  }, [user?.id]);

  const loadProgressStats = async () => {
    try {
      const journeyProgress = AchievementTracker.getJourneyProgress();
      const achievements = AchievementTracker.getAchievements();

      setProgressStats({
        totalWords: journeyProgress.wordsLearned || 0,
        regionsExplored: Math.min(
          6,
          Math.floor((journeyProgress.wordsLearned || 0) / 15) + 1,
        ),
        achievementsUnlocked: achievements.filter((a) => a.unlocked).length,
        currentStreak: journeyProgress.streakDays || 0,
        animalFriends: Math.floor((journeyProgress.wordsLearned || 0) / 5),
      });
    } catch (error) {
      console.error("Error loading progress stats:", error);
    }
  };

  // Handle achievement unlock
  const handleAchievementUnlock = (achievement: any) => {
    setCelebratingAchievement(achievement);
    audioService.playCheerSound();
    onAchievementUnlock?.(achievement);

    // Auto-refresh stats after celebration
    setTimeout(() => {
      loadProgressStats();
    }, 1000);
  };

  // Handle region unlock
  const handleRegionUnlock = (regionId: string) => {
    const regions = [
      {
        id: "canopy",
        name: "Tree Canopy",
        icon: "🌳",
        description: "High up with the birds and flying creatures",
      },
      {
        id: "floor",
        name: "Forest Floor",
        icon: "🌿",
        description: "Among the roots and ground creatures",
      },
      {
        id: "undergrowth",
        name: "Dense Undergrowth",
        icon: "🌱",
        description: "Hidden paths and secret creatures",
      },
      {
        id: "river",
        name: "Jungle River",
        icon: "🏞️",
        description: "Water creatures and riverside adventures",
      },
      {
        id: "mountain",
        name: "Mountain Peak",
        icon: "⛰️",
        description: "High altitude challenges and sky creatures",
      },
      {
        id: "clearing",
        name: "Sacred Clearing",
        icon: "✨",
        description: "Magical center where adventures begin",
      },
    ];

    const region = regions.find((r) => r.id === regionId);
    if (region) {
      setCelebratingRegion(region);
      onRegionUnlock?.(regionId);
    }
  };

  // Handle animal friend unlock
  const handleAnimalFriendUnlock = (animalFriend: any) => {
    setCelebratingAnimalFriend(animalFriend);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    loadProgressStats();
    setTimeout(() => setLoading(false), 1000);
  };

  // Handle insight actions
  const handleInsightAction = (insight: any) => {
    if (insight.region) {
      setActiveTab("achievements");
      // Could scroll to region or filter by region
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-jungle-green via-jungle-light to-sunshine-yellow bg-clip-text text-transparent mb-3 leading-tight">
          🌿 Welcome to Your Jungle Adventure! 🏆
        </h2>
        <p className="text-gray-600 mb-6 text-sm md:text-lg max-w-2xl mx-auto">
          Explore magical jungle realms, learn amazing words, meet animal
          friends, and unlock incredible achievements on your learning journey!
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-1">
              {progressStats.totalWords}
            </div>
            <div className="text-xs md:text-sm opacity-90">
              Words Discovered
            </div>
            <div className="text-lg mt-1">🌿</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-1">
              {progressStats.regionsExplored}
            </div>
            <div className="text-xs md:text-sm opacity-90">
              Regions Explored
            </div>
            <div className="text-lg mt-1">🗺️</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-1">
              {progressStats.achievementsUnlocked}
            </div>
            <div className="text-xs md:text-sm opacity-90">Achievements</div>
            <div className="text-lg mt-1">🏆</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-1">
              {progressStats.currentStreak}
            </div>
            <div className="text-xs md:text-sm opacity-90">Day Streak</div>
            <div className="text-lg mt-1">🔥</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold mb-1">
              {progressStats.animalFriends}
            </div>
            <div className="text-xs md:text-sm opacity-90">Animal Friends</div>
            <div className="text-lg mt-1">🐾</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="hover:shadow-lg transition-all cursor-pointer"
          onClick={() => setActiveTab("achievements")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-yellow-600" />
              🏆 View Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Discover your unlocked achievements and see what incredible
              rewards await!
            </p>
            <JungleBadges.Explorer size="sm">
              Explore Now!
            </JungleBadges.Explorer>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-all cursor-pointer"
          onClick={() => setActiveTab("analytics")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              📊 Learning Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Analyze your learning patterns and discover insights about your
              jungle journey!
            </p>
            <JungleBadges.SafariGuide size="sm">
              View Analytics
            </JungleBadges.SafariGuide>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-all cursor-pointer"
          onClick={() => setActiveTab("achievements")}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Map className="w-5 h-5 text-green-600" />
              🗺️ Explore Regions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Discover new jungle regions, meet animal friends, and unlock
              hidden secrets!
            </p>
            <JungleBadges.JungleHero size="sm">
              Start Exploring
            </JungleBadges.JungleHero>
          </CardContent>
        </Card>
      </div>

      {/* Recent Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            🌟 Recent Adventures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌿</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Your Adventure Awaits!
            </h3>
            <p className="text-gray-600 mb-4">
              Start exploring the magical jungle to see your recent progress
              here.
            </p>
            <Button
              onClick={() => setActiveTab("achievements")}
              className="bg-gradient-to-r from-jungle-green to-jungle-light text-white"
            >
              Begin Your Journey! 🚀
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className={`jungle-achievement-system space-y-6 ${className}`}>
      {/* Celebration Modals */}
      {celebratingAchievement && (
        <EnhancedJungleRewardCelebration
          isVisible={true}
          type="achievement"
          achievement={celebratingAchievement}
          onComplete={() => setCelebratingAchievement(null)}
          duration={4000}
        />
      )}

      {celebratingRegion && (
        <EnhancedJungleRewardCelebration
          isVisible={true}
          type="region_unlock"
          region={celebratingRegion}
          onComplete={() => setCelebratingRegion(null)}
          duration={3500}
        />
      )}

      {celebratingAnimalFriend && (
        <EnhancedJungleRewardCelebration
          isVisible={true}
          type="animal_friend"
          animalFriend={celebratingAnimalFriend}
          onComplete={() => setCelebratingAnimalFriend(null)}
          duration={3000}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 md:w-8 md:h-8 text-jungle-green" />
            <span className="jungle-gradient-text">
              Jungle Adventure Progress
            </span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base">
            Track your amazing learning journey through the magical jungle! 🌟
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden md:inline ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="jungle-tab-list grid w-full grid-cols-3 gap-1">
          <TabsTrigger
            value="overview"
            className="jungle-tab-trigger flex flex-col md:flex-row items-center gap-1 md:gap-2"
          >
            <Star className="w-4 h-4" />
            <span className="hidden md:inline">🌟 Overview</span>
            <span className="md:hidden text-xs text-center">
              🌟
              <br />
              Overview
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="jungle-tab-trigger flex flex-col md:flex-row items-center gap-1 md:gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden md:inline">🏆 Achievements</span>
            <span className="md:hidden text-xs text-center">
              🏆
              <br />
              Achievements
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="jungle-tab-trigger flex flex-col md:flex-row items-center gap-1 md:gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden md:inline">📊 Analytics</span>
            <span className="md:hidden text-xs text-center">
              📊
              <br />
              Analytics
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <EnhancedJungleAchievementSystem
            onUnlock={handleAchievementUnlock}
            onRegionUnlock={handleRegionUnlock}
            onRefresh={loadProgressStats}
            mobileOptimized={mobileOptimized}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <EnhancedJungleLearningAnalytics
            onRegionSelect={(regionId) => {
              setActiveTab("achievements");
              // Could add region filtering here
            }}
            onInsightAction={handleInsightAction}
            mobileOptimized={mobileOptimized}
            showDetailedView={showAllFeatures}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JungleAdventureProgressSystem;
