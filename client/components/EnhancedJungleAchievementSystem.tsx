import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
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
  TreePine,
  Leaf,
  Sun,
  Moon,
  Mountain,
  Fish,
  Bird,
} from "lucide-react";
import { audioService } from "@/lib/audioService";
import { enhancedAudioService } from "@/lib/enhancedAudioService";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { AchievementTracker } from "@/lib/achievementTracker";
import { EnhancedAchievementTracker } from "@/lib/enhancedAchievementTracker";
import { goalProgressTracker } from "@/lib/goalProgressTracker";
import { CategoryCompletionTracker } from "@/lib/categoryCompletionTracker";
import { useAuth } from "@/hooks/useAuth";
import { useOptimizedMobilePerformance, useAnimationPreferences } from "@/hooks/use-optimized-mobile-performance";
import { cn } from "@/lib/utils";

// Jungle-themed achievement interface
interface JungleAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  jungleIcon: string; // Additional jungle-themed icon
  category: "exploration" | "gathering" | "wisdom" | "adventure" | "friendship";
  difficulty: "sapling" | "growing" | "mighty" | "ancient";
  requirements: number;
  currentProgress: number;
  unlocked: boolean;
  dateUnlocked?: Date;
  reward?: {
    type: "jungle_companion" | "magic_item" | "special_power" | "treasure" | "badge";
    item: string;
    value?: number;
    icon?: string;
  };
  jungleStory?: string; // Optional story element
}

// Jungle-themed unlockable content
interface JungleUnlockable {
  id: string;
  name: string;
  type: "companion" | "magical_item" | "jungle_theme" | "special_effect" | "treasure";
  description: string;
  icon: string;
  jungleIcon: string;
  unlocked: boolean;
  unlockedBy?: string;
  previewUrl?: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  jungleStory?: string;
}

// Enhanced learning stats with jungle theme
interface JungleLearningStats {
  totalWordsExplored: number;
  weeklyAdventures: number[];
  jungleRegions: Array<{
    region: string;
    wordsDiscovered: number;
    treasuresFound: number;
    timeSpent: number;
    icon: string;
  }>;
  difficultyTrails: Array<{
    difficulty: "easy" | "medium" | "hard";
    pathsCompleted: number;
    totalPaths: number;
  }>;
  adventureMap: Array<{
    date: string;
    explored: boolean;
    discoveries: number;
  }>;
  explorationSpeed: number;
  wisdomLevel: number;
  currentStreak: number;
}

// Helper functions for jungle-themed data
const getWeeklyAdventureData = (userId: string): number[] => {
  const weeklyData: number[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    try {
      const dailyData = localStorage.getItem(`daily_progress_${userId}_${dateKey}`);
      if (dailyData) {
        const parsed = JSON.parse(dailyData);
        weeklyData.push(parsed.words || 0);
      } else {
        weeklyData.push(0);
      }
    } catch (error) {
      weeklyData.push(0);
    }
  }

  return weeklyData;
};

const getAdventureMapData = (userId: string): Array<{ date: string; explored: boolean; discoveries: number }> => {
  const mapData: Array<{ date: string; explored: boolean; discoveries: number }> = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];

    try {
      const dailyData = localStorage.getItem(`daily_progress_${userId}_${dateKey}`);
      if (dailyData) {
        const parsed = JSON.parse(dailyData);
        mapData.push({
          date: dateKey,
          explored: (parsed.words || 0) > 0,
          discoveries: parsed.words || 0,
        });
      } else {
        mapData.push({
          date: dateKey,
          explored: false,
          discoveries: 0,
        });
      }
    } catch (error) {
      mapData.push({
        date: dateKey,
        explored: false,
        discoveries: 0,
      });
    }
  }

  return mapData;
};

// Jungle-themed unlockables
const jungleUnlockables: JungleUnlockable[] = [
  {
    id: "monkey_companion",
    name: "Wise Monkey Guide",
    type: "companion",
    description: "A clever monkey who helps you learn new words!",
    icon: "🐒",
    jungleIcon: "🌿",
    unlocked: false,
    unlockedBy: "word_explorer",
    rarity: "common",
    jungleStory: "Found swinging through the treetops, this wise monkey loves sharing knowledge!"
  },
  {
    id: "golden_leaf",
    name: "Golden Learning Leaf",
    type: "magical_item",
    description: "A magical leaf that sparkles when you learn!",
    icon: "🍃",
    jungleIcon: "✨",
    unlocked: false,
    unlockedBy: "vocabulary_guardian",
    rarity: "rare",
    jungleStory: "Legend says this leaf fell from the Ancient Tree of Wisdom!"
  },
  {
    id: "jungle_crown",
    name: "Crown of the Jungle",
    type: "treasure",
    description: "The ultimate treasure for jungle learning champions!",
    icon: "👑",
    jungleIcon: "🌳",
    unlocked: false,
    unlockedBy: "jungle_master",
    rarity: "legendary",
    jungleStory: "Only the greatest jungle explorers can claim this magnificent crown!"
  },
  {
    id: "firefly_trail",
    name: "Magical Firefly Trail",
    type: "special_effect",
    description: "Fireflies follow you as you learn, lighting up your path!",
    icon: "✨",
    jungleIcon: "🌙",
    unlocked: false,
    unlockedBy: "streak_master",
    rarity: "epic",
    jungleStory: "These mystical fireflies are drawn to dedicated learners!"
  },
];

// Difficulty styling for jungle theme
const getDifficultyJungleStyle = (difficulty: string) => {
  switch (difficulty) {
    case "sapling":
      return {
        gradient: "from-green-400 to-green-600",
        icon: "🌱",
        bgGlow: "shadow-green-500/20",
        borderGlow: "border-green-400/30"
      };
    case "growing":
      return {
        gradient: "from-emerald-400 to-emerald-600", 
        icon: "🌿",
        bgGlow: "shadow-emerald-500/20",
        borderGlow: "border-emerald-400/30"
      };
    case "mighty":
      return {
        gradient: "from-jungle to-jungle-dark",
        icon: "🌳",
        bgGlow: "shadow-jungle/20",
        borderGlow: "border-jungle/30"
      };
    case "ancient":
      return {
        gradient: "from-yellow-400 via-jungle to-emerald-600",
        icon: "🏛️",
        bgGlow: "shadow-yellow-500/20",
        borderGlow: "border-yellow-400/30"
      };
    default:
      return {
        gradient: "from-gray-400 to-gray-600",
        icon: "🌱",
        bgGlow: "shadow-gray-500/20",
        borderGlow: "border-gray-400/30"
      };
  }
};

const getRarityStyle = (rarity: string) => {
  switch (rarity) {
    case "common":
      return {
        gradient: "from-gray-400 to-gray-600",
        glow: "shadow-gray-500/20",
        border: "border-gray-400/30"
      };
    case "rare":
      return {
        gradient: "from-blue-400 to-blue-600",
        glow: "shadow-blue-500/20", 
        border: "border-blue-400/30"
      };
    case "epic":
      return {
        gradient: "from-purple-400 to-purple-600",
        glow: "shadow-purple-500/20",
        border: "border-purple-400/30"
      };
    case "legendary":
      return {
        gradient: "from-yellow-400 via-orange-400 to-red-500",
        glow: "shadow-orange-500/30",
        border: "border-orange-400/50"
      };
    default:
      return {
        gradient: "from-gray-400 to-gray-600",
        glow: "shadow-gray-500/20",
        border: "border-gray-400/30"
      };
  }
};

interface EnhancedJungleAchievementSystemProps {
  onUnlock?: (achievement: JungleAchievement) => void;
  onRefresh?: () => void;
}

export function EnhancedJungleAchievementSystem({
  onUnlock,
  onRefresh,
}: EnhancedJungleAchievementSystemProps) {
  const { user } = useAuth();
  const mobilePerf = useOptimizedMobilePerformance();
  const animPrefs = useAnimationPreferences();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showUnlockables, setShowUnlockables] = useState(false);
  const [activeTab, setActiveTab] = useState("achievements");
  const [isLoading, setIsLoading] = useState(true);
  const [jungleStats, setJungleStats] = useState<JungleLearningStats | null>(null);
  const [jungleAchievements, setJungleAchievements] = useState<JungleAchievement[]>([]);
  const [celebrating, setCelebrating] = useState<JungleAchievement | null>(null);

  // Load real data on component mount
  useEffect(() => {
    const loadJungleData = async () => {
      try {
        setIsLoading(true);
        const userId = user?.id || "guest";

        // Get real achievement data
        let achievements, journeyProgress;
        try {
          achievements = EnhancedAchievementTracker.getAchievements();
          journeyProgress = EnhancedAchievementTracker.getJourneyProgress();
        } catch (error) {
          achievements = AchievementTracker.getAchievements();
          journeyProgress = AchievementTracker.getJourneyProgress();
        }

        // Transform achievements to jungle theme
        const transformedAchievements: JungleAchievement[] = (achievements || []).map(achievement => ({
          ...achievement,
          jungleIcon: getJungleIcon(achievement.category),
          category: mapToJungleCategory(achievement.category),
          difficulty: mapToJungleDifficulty(achievement.difficulty),
          jungleStory: getJungleStory(achievement.id),
        }));

        // Get category completion data
        const categoryStats = CategoryCompletionTracker.getCurrentCategoryStats();
        const completionHistory = CategoryCompletionTracker.getCompletionHistory();

        // Build jungle regions from real data
        let jungleRegions = [];
        if (categoryStats && typeof categoryStats === "object") {
          jungleRegions = [{
            region: "Current Expedition",
            wordsDiscovered: categoryStats.wordsReviewed || 0,
            treasuresFound: Math.floor((categoryStats.wordsReviewed || 0) / 5),
            timeSpent: categoryStats.timeSpent || 0,
            icon: "🗺️"
          }];
        } else {
          const regionMap = new Map();
          completionHistory.forEach((record: any) => {
            const regionName = getJungleRegionName(record.categoryId || "Unknown");
            if (regionMap.has(regionName)) {
              const existing = regionMap.get(regionName);
              existing.wordsDiscovered += record.wordsReviewed || 0;
              existing.treasuresFound += Math.floor((record.wordsReviewed || 0) / 5);
              existing.timeSpent += record.timeSpent || 0;
            } else {
              regionMap.set(regionName, {
                region: regionName,
                wordsDiscovered: record.wordsReviewed || 0,
                treasuresFound: Math.floor((record.wordsReviewed || 0) / 5),
                timeSpent: record.timeSpent || 0,
                icon: getRegionIcon(regionName),
              });
            }
          });

          jungleRegions = Array.from(regionMap.values());
          if (jungleRegions.length === 0) {
            jungleRegions = [{
              region: "Starting Grove",
              wordsDiscovered: 0,
              treasuresFound: 0,
              timeSpent: 0,
              icon: "🌱"
            }];
          }
        }

        // Calculate jungle learning stats
        const weeklyAdventures = getWeeklyAdventureData(userId);
        const totalWeeklyDiscoveries = weeklyAdventures.reduce((sum, count) => sum + count, 0);
        const avgDiscoveriesPerDay = totalWeeklyDiscoveries / 7;
        const explorationSpeed = avgDiscoveriesPerDay * 2;

        const jungleLearningStats: JungleLearningStats = {
          totalWordsExplored: journeyProgress?.wordsLearned || 0,
          weeklyAdventures,
          jungleRegions,
          difficultyTrails: [
            {
              difficulty: "easy",
              pathsCompleted: journeyProgress?.difficultyStats?.easy?.completed || 0,
              totalPaths: 50,
            },
            {
              difficulty: "medium", 
              pathsCompleted: journeyProgress?.difficultyStats?.medium?.completed || 0,
              totalPaths: 50,
            },
            {
              difficulty: "hard",
              pathsCompleted: journeyProgress?.difficultyStats?.hard?.completed || 0,
              totalPaths: 30,
            },
          ],
          adventureMap: getAdventureMapData(userId),
          explorationSpeed: Math.max(explorationSpeed, 1),
          wisdomLevel: journeyProgress?.totalAccuracy || 85,
          currentStreak: journeyProgress?.streakDays || 0,
        };

        setJungleStats(jungleLearningStats);
        setJungleAchievements(transformedAchievements);

        console.log("Jungle Achievement System loaded:", {
          totalExplored: jungleLearningStats.totalWordsExplored,
          achievementsCount: transformedAchievements.length,
          unlockedCount: transformedAchievements.filter(a => a.unlocked).length,
        });
      } catch (error) {
        console.error("Error loading jungle data:", error);
        // Fallback data
        setJungleStats({
          totalWordsExplored: 0,
          weeklyAdventures: [0, 0, 0, 0, 0, 0, 0],
          jungleRegions: [],
          difficultyTrails: [
            { difficulty: "easy", pathsCompleted: 0, totalPaths: 50 },
            { difficulty: "medium", pathsCompleted: 0, totalPaths: 50 },
            { difficulty: "hard", pathsCompleted: 0, totalPaths: 30 },
          ],
          adventureMap: [],
          explorationSpeed: 1,
          wisdomLevel: 0,
          currentStreak: 0,
        });
        setJungleAchievements([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadJungleData();
  }, [user?.id]);

  // Helper functions
  const getJungleIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      learning: "🌿",
      streak: "🔥",
      quiz: "🧠",
      exploration: "🗺️",
      social: "🐾",
    };
    return iconMap[category] || "🌳";
  };

  const mapToJungleCategory = (category: string): "exploration" | "gathering" | "wisdom" | "adventure" | "friendship" => {
    const categoryMap: Record<string, "exploration" | "gathering" | "wisdom" | "adventure" | "friendship"> = {
      learning: "gathering",
      streak: "adventure", 
      quiz: "wisdom",
      exploration: "exploration",
      social: "friendship",
    };
    return categoryMap[category] || "exploration";
  };

  const mapToJungleDifficulty = (difficulty: string): "sapling" | "growing" | "mighty" | "ancient" => {
    const difficultyMap: Record<string, "sapling" | "growing" | "mighty" | "ancient"> = {
      bronze: "sapling",
      silver: "growing", 
      gold: "mighty",
      diamond: "ancient",
    };
    return difficultyMap[difficulty] || "sapling";
  };

  const getJungleStory = (achievementId: string): string => {
    const stories: Record<string, string> = {
      word_collector: "Deep in the jungle, you've discovered amazing words hidden in ancient trees!",
      vocabulary_master: "The jungle animals whisper your name as the great word master!",
      streak_starter: "Your dedication lights up the jungle path like magical fireflies!",
      dedication_champion: "The entire jungle celebrates your incredible learning journey!"
    };
    return stories[achievementId] || "Your jungle adventure continues to grow stronger!";
  };

  const getJungleRegionName = (categoryId: string): string => {
    const regionNames: Record<string, string> = {
      animals: "Animal Kingdom",
      nature: "Enchanted Forest",
      food: "Tropical Grove",
      colors: "Rainbow Falls",
      numbers: "Crystal Caves",
      family: "Village of Friends",
    };
    return regionNames[categoryId] || `${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Territory`;
  };

  const getRegionIcon = (regionName: string): string => {
    const iconMap: Record<string, string> = {
      "Animal Kingdom": "🦁",
      "Enchanted Forest": "🌳",
      "Tropical Grove": "🍃",
      "Rainbow Falls": "🌈",
      "Crystal Caves": "💎",
      "Village of Friends": "🏘️",
    };
    return iconMap[regionName] || "🗺️";
  };

  // Play jungle sound effects
  const playJungleSound = useCallback((type: 'unlock' | 'click' | 'explore') => {
    try {
      switch (type) {
        case 'unlock':
          enhancedAudioService.playSuccessSound();
          break;
        case 'click':
          audioService.playCheerSound();
          break;
        case 'explore':
          // Play exploration sound
          break;
      }
    } catch (error) {
      console.log("Jungle sound not available:", error);
    }
  }, []);

  // Show loading state with jungle theme
  if (isLoading || !jungleStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-16 w-16 border-4 border-jungle/20 border-t-jungle mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div className="text-4xl mb-4 animate-bounce">🌳</motion.div>
          <p className="text-jungle-dark font-semibold">Exploring the jungle of learning...</p>
        </motion.div>
      </div>
    );
  }

  const jungleCategories = [
    { id: "all", name: "All Adventures", icon: "🌍", jungleIcon: "🗺️" },
    { id: "exploration", name: "Exploration", icon: "🗺️", jungleIcon: "🧭" },
    { id: "gathering", name: "Word Gathering", icon: "📚", jungleIcon: "🌿" },
    { id: "wisdom", name: "Ancient Wisdom", icon: "🧠", jungleIcon: "🦉" },
    { id: "adventure", name: "Epic Adventures", icon: "🔥", jungleIcon: "⚡" },
    { id: "friendship", name: "Jungle Friends", icon: "🐾", jungleIcon: "🦋" },
  ];

  const filteredAchievements = selectedCategory === "all"
    ? jungleAchievements
    : jungleAchievements.filter(a => a.category === selectedCategory);

  const unlockedAchievements = jungleAchievements.filter(a => a.unlocked);
  const totalTreasurePoints = unlockedAchievements.reduce((sum, a) => {
    const points = a.difficulty === "sapling" ? 10
      : a.difficulty === "growing" ? 25
      : a.difficulty === "mighty" ? 50
      : 100;
    return sum + points;
  }, 0);

  const handleJungleAchievementClick = (achievement: JungleAchievement) => {
    if (achievement.unlocked) {
      setCelebrating(achievement);
      playJungleSound('unlock');
      setTimeout(() => setCelebrating(null), 4000);
    } else {
      playJungleSound('click');
    }
  };

  const getProgressPercentage = (achievement: JungleAchievement) => {
    return Math.min((achievement.currentProgress / achievement.requirements) * 100, 100);
  };

  // Jungle-themed progress overview
  const renderJungleProgress = () => (
    <div className="space-y-6">
      {/* Jungle Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-2 md:px-0">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card className="bg-gradient-to-br from-jungle to-jungle-dark text-white shadow-xl border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent" />
            <CardContent className="p-4 text-center relative z-10">
              <motion.div 
                className="text-3xl mb-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🌳
              </motion.div>
              <div className="text-2xl md:text-3xl font-bold mb-1">
                <AnimatedCounter value={jungleStats.totalWordsExplored} />
              </div>
              <p className="text-sm opacity-90">Words Discovered!</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card className="bg-gradient-to-br from-sunshine to-sunshine-dark text-white shadow-xl border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent" />
            <CardContent className="p-4 text-center relative z-10">
              <motion.div 
                className="text-3xl mb-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⚡
              </motion.div>
              <div className="text-2xl md:text-3xl font-bold mb-1">
                <AnimatedCounter value={jungleStats.explorationSpeed} suffix="/hr" />
              </div>
              <p className="text-sm opacity-90">Exploration Speed!</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card className="bg-gradient-to-br from-sky to-sky-dark text-white shadow-xl border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent" />
            <CardContent className="p-4 text-center relative z-10">
              <motion.div 
                className="text-3xl mb-2"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🦉
              </motion.div>
              <div className="text-2xl md:text-3xl font-bold mb-1">
                <AnimatedCounter value={jungleStats.wisdomLevel} suffix="%" />
              </div>
              <p className="text-sm opacity-90">Wisdom Level!</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card className="bg-gradient-to-br from-playful-purple to-purple-600 text-white shadow-xl border-0 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent" />
            <CardContent className="p-4 text-center relative z-10">
              <motion.div 
                className="text-3xl mb-2"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                🏆
              </motion.div>
              <div className="text-2xl md:text-3xl font-bold mb-1">
                <AnimatedCounter value={unlockedAchievements.length} />
              </div>
              <p className="text-sm opacity-90">Trophies Earned!</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Adventure Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-jungle/5 border-jungle/20 shadow-xl mx-2 md:mx-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-jungle-dark text-xl">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📊
              </motion.div>
              🌟 Your Weekly Jungle Adventures!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 h-32 md:h-40 mb-4">
              {jungleStats.weeklyAdventures.map((discoveries, index) => {
                const maxDiscoveries = Math.max(...jungleStats.weeklyAdventures) || 1;
                const height = maxDiscoveries > 0 ? (discoveries / maxDiscoveries) * 100 : 0;
                const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                const jungleEmojis = ["🌱", "🌿", "🍃", "🌳", "🦋", "🌺", "🦜"];

                return (
                  <motion.div 
                    key={index} 
                    className="flex flex-col items-center"
                    whileHover={{ scale: 1.1 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex-1 flex flex-col justify-end">
                      <motion.div
                        className="bg-gradient-to-t from-jungle to-jungle-light rounded-t-lg min-h-[8px] shadow-lg"
                        style={{ height: `${height}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                    <p className="text-xs text-jungle mt-1 font-medium">{days[index]}</p>
                    <motion.p 
                      className="text-lg"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      {jungleEmojis[index]}
                    </motion.p>
                    <p className="text-sm font-bold text-jungle-dark">{discoveries}</p>
                  </motion.div>
                );
              })}
            </div>
            <p className="text-center text-jungle font-semibold">
              Keep exploring the jungle of knowledge! 🗺️✨
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  // Jungle regions overview
  const renderJungleRegions = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 border-sunshine/20 shadow-xl mx-2 md:mx-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-sunshine-dark text-xl">
              <motion.div 
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                🗺️
              </motion.div>
              🌍 Your Jungle Territory Map!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jungleStats.jungleRegions.map((region, index) => {
                const colors = [
                  "from-jungle to-green-600",
                  "from-sunshine to-orange-500",
                  "from-sky to-blue-600",
                  "from-playful-purple to-purple-600",
                  "from-coral-red to-red-500",
                  "from-emerald-400 to-emerald-600",
                ];
                const gradientClass = colors[index % colors.length];

                return (
                  <motion.div 
                    key={region.region} 
                    className="space-y-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg text-white`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <span className="text-xl">{region.icon}</span>
                        </motion.div>
                        <div>
                          <span className="font-bold text-gray-800 text-lg">{region.region}</span>
                          <p className="text-sm text-gray-600">A magical place of discovery! ✨</p>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row gap-2 text-sm">
                        <motion.span 
                          className="bg-jungle/20 px-3 py-1 rounded-full text-jungle font-semibold"
                          whileHover={{ scale: 1.05 }}
                        >
                          {region.wordsDiscovered} words!
                        </motion.span>
                        <motion.span 
                          className="bg-sunshine/20 px-3 py-1 rounded-full text-sunshine-dark font-semibold"
                          whileHover={{ scale: 1.05 }}
                        >
                          {region.treasuresFound} treasures!
                        </motion.span>
                      </div>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${gradientClass} rounded-full shadow-lg`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(region.wordsDiscovered / jungleStats.totalWordsExplored) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  // Adventure map (streak visualization)
  const renderAdventureMap = () => (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 border-sky/20 shadow-xl mx-1 md:mx-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-sky-dark text-lg">
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🗺️
              </motion.div>
              🧭 Your Adventure Trail Map!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-center text-purple-600 font-semibold text-sm">
                Each step shows your learning journey! 🥾✨
              </p>

              <div className="grid grid-cols-10 gap-1 justify-center">
                {jungleStats.adventureMap.map((day, index) => {
                  const trailEmojis = ["🥾", "🌿", "🦋", "🌺", "🍃"];
                  const randomEmoji = trailEmojis[Math.floor(Math.random() * trailEmojis.length)];

                  return (
                    <motion.div
                      key={index}
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer transition-all relative",
                        day.explored
                          ? day.discoveries > 8
                            ? "bg-gradient-to-br from-jungle to-jungle-dark text-white shadow-lg"
                            : day.discoveries > 4
                              ? "bg-gradient-to-br from-sky to-sky-dark text-white shadow-md"
                              : "bg-gradient-to-br from-sunshine to-sunshine-dark text-white shadow-sm"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      )}
                      title={`${day.date}: ${day.explored ? `${day.discoveries} discoveries! ${randomEmoji}` : "Unexplored territory 😴"}`}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                    >
                      {day.explored
                        ? day.discoveries > 8
                          ? "🏆"
                          : day.discoveries > 4
                            ? "⭐"
                            : "✨"
                        : "💤"}
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 md:flex md:justify-center gap-3 text-sm">
                {[
                  { icon: "💤", bg: "bg-gray-100", label: "Resting", color: "text-gray-600" },
                  { icon: "✨", bg: "bg-sunshine", label: "Exploring", color: "text-white" },
                  { icon: "⭐", bg: "bg-sky", label: "Great Day", color: "text-white" },
                  { icon: "🏆", bg: "bg-jungle", label: "Epic Adventure!", color: "text-white" }
                ].map((item, index) => (
                  <motion.div 
                    key={item.label}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className={`w-5 h-5 ${item.bg} rounded-md flex items-center justify-center text-xs ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className={item.color.replace('text-white', 'text-gray-700')} style={{color: item.color === 'text-white' ? '#374151' : undefined}}>{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-jungle/5",
      "jungle-achievement-system",
      animPrefs.getAnimationClass('high')
    )}>
      <div className="space-y-6 relative">
        {/* Decorative jungle elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            className="absolute top-10 left-10 text-4xl opacity-20"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🌿
          </motion.div>
          <motion.div 
            className="absolute top-20 right-20 text-3xl opacity-20"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🦋
          </motion.div>
          <motion.div 
            className="absolute bottom-20 left-20 text-5xl opacity-10"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            🌳
          </motion.div>
        </div>

        {/* Jungle-themed Header */}
        <motion.div 
          className="text-center px-4 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-jungle via-sunshine to-sky bg-clip-text text-transparent mb-4 leading-tight"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏆 Your Jungle Learning Adventure! 🌳
          </motion.h2>
          <motion.p 
            className="text-gray-700 mb-6 text-lg px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Explore the magical jungle and discover amazing words! 🗺️✨
          </motion.p>
        </motion.div>

        {/* Enhanced Jungle Tabs */}
        <div className="relative z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-gradient-to-r from-jungle/10 via-sunshine/10 to-sky/10 h-auto p-2 rounded-2xl">
              {[
                { value: "achievements", icon: "🏆", label: "Trophies", gradient: "from-jungle to-jungle-dark" },
                { value: "progress", icon: "📊", label: "Progress", gradient: "from-sky to-sky-dark" },
                { value: "regions", icon: "🗺️", label: "Regions", gradient: "from-sunshine to-sunshine-dark" },
                { value: "adventures", icon: "🧭", label: "Adventures", gradient: "from-playful-purple to-purple-600" }
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "flex flex-col md:flex-row items-center gap-2 transition-all duration-300",
                    "data-[state=active]:text-white text-sm py-3 px-3 rounded-xl",
                    activeTab === tab.value 
                      ? `bg-gradient-to-r ${tab.gradient} shadow-lg scale-105` 
                      : "hover:scale-105"
                  )}
                >
                  <motion.span 
                    className="text-lg"
                    animate={activeTab === tab.value ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {tab.icon}
                  </motion.span>
                  <span className="font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="progress" className="mt-8">
              {renderJungleProgress()}
            </TabsContent>

            <TabsContent value="regions" className="mt-8">
              {renderJungleRegions()}
            </TabsContent>

            <TabsContent value="adventures" className="mt-8">
              {renderAdventureMap()}
            </TabsContent>

            <TabsContent value="achievements" className="mt-8">
              <div className="space-y-6 relative z-10">
                {/* Achievement Stats with Jungle Theme */}
                <div className="flex justify-center gap-4 mb-6 px-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card className="bg-gradient-to-r from-jungle to-jungle-dark text-white shadow-xl border-0">
                      <CardContent className="p-4 text-center">
                        <motion.div 
                          className="text-3xl font-bold mb-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, type: "spring" }}
                        >
                          {unlockedAchievements.length}
                        </motion.div>
                        <div className="text-sm opacity-90">🏆 Jungle Trophies!</div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card className="bg-gradient-to-r from-sunshine to-sunshine-dark text-white shadow-xl border-0">
                      <CardContent className="p-4 text-center">
                        <motion.div 
                          className="text-3xl font-bold mb-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
                        >
                          {totalTreasurePoints}
                        </motion.div>
                        <div className="text-sm opacity-90">💎 Treasure Points!</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Category Filters with Jungle Theme */}
                <div className="flex justify-center gap-2 flex-wrap px-2">
                  {jungleCategories.map((category) => (
                    <motion.div
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          playJungleSound('click');
                        }}
                        className={cn(
                          "flex items-center gap-2 transition-all text-sm px-4 py-2 rounded-xl",
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-jungle to-jungle-dark text-white shadow-lg"
                            : "hover:bg-jungle/10 hover:border-jungle/30"
                        )}
                      >
                        <span>{category.jungleIcon}</span>
                        {category.name}
                      </Button>
                    </motion.div>
                  ))}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={showUnlockables ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setShowUnlockables(!showUnlockables);
                        playJungleSound('explore');
                      }}
                      className={cn(
                        "flex items-center gap-2 transition-all text-sm px-4 py-2 rounded-xl",
                        showUnlockables
                          ? "bg-gradient-to-r from-playful-purple to-purple-600 text-white shadow-lg"
                          : "hover:bg-purple-100 hover:border-purple-300"
                      )}
                    >
                      <Gift className="w-4 h-4" />
                      🎁 Jungle Treasures
                    </Button>
                  </motion.div>
                </div>

                {/* Achievements Grid with Enhanced Jungle Theme */}
                {!showUnlockables && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2 md:px-0">
                    <AnimatePresence>
                      {filteredAchievements.map((achievement, index) => {
                        const progressPercentage = getProgressPercentage(achievement);
                        const isComplete = progressPercentage >= 100;
                        const difficultyStyle = getDifficultyJungleStyle(achievement.difficulty);

                        return (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Card
                              className={cn(
                                "cursor-pointer border-2 overflow-hidden relative jungle-achievement-card",
                                !mobilePerf.isMobile && "transition-all duration-300",
                                achievement.unlocked
                                  ? `bg-gradient-to-br ${difficultyStyle.gradient} text-white shadow-2xl ${difficultyStyle.bgGlow} border-transparent unlocked`
                                  : `bg-white hover:bg-green-50 border-dashed ${difficultyStyle.borderGlow} hover:border-jungle/30 hover:shadow-lg`,
                                mobilePerf.reducedMotion && "motion-reduce"
                              )}
                              onClick={() => handleJungleAchievementClick(achievement)}
                            >
                              {/* Magical particles for unlocked achievements - optimized for performance */}
                              {achievement.unlocked && !mobilePerf.isMobile && animPrefs.maxAnimationComplexity === 'high' && (
                                <div className="absolute inset-0 jungle-particles">
                                  {[...Array(mobilePerf.isLowEndDevice ? 2 : 5)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="absolute w-1 h-1 bg-white/30 rounded-full jungle-particle"
                                      style={{
                                        left: `${20 + i * 15}%`,
                                        top: `${20 + i * 10}%`,
                                      }}
                                      animate={!mobilePerf.reducedMotion ? {
                                        y: [0, -10, 0],
                                        opacity: [0.3, 1, 0.3],
                                      } : {}}
                                      transition={{
                                        duration: animPrefs.getTransitionDuration(2000),
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                      }}
                                    />
                                  ))}
                                </div>
                              )}

                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <motion.div 
                                      className="text-4xl"
                                      animate={achievement.unlocked ? { rotate: [0, 10, -10, 0] } : {}}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      {achievement.icon}
                                    </motion.div>
                                    <motion.div 
                                      className="text-2xl"
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                    >
                                      {achievement.jungleIcon}
                                    </motion.div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{difficultyStyle.icon}</span>
                                    {achievement.unlocked && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", duration: 0.5 }}
                                      >
                                        <Check className="w-5 h-5 text-green-300" />
                                      </motion.div>
                                    )}
                                    {!achievement.unlocked && isComplete && (
                                      <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                      >
                                        <Sparkles className="w-5 h-5 text-yellow-500" />
                                      </motion.div>
                                    )}
                                    {!achievement.unlocked && !isComplete && (
                                      <Lock className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                                <CardTitle className={cn(
                                  "text-lg leading-tight",
                                  achievement.unlocked ? "text-white" : "text-gray-800"
                                )}>
                                  {achievement.name}
                                </CardTitle>
                              </CardHeader>

                              <CardContent className="space-y-4">
                                <p className={cn(
                                  "text-sm leading-relaxed",
                                  achievement.unlocked ? "text-white/90" : "text-gray-600"
                                )}>
                                  {achievement.description}
                                </p>

                                {achievement.jungleStory && (
                                  <motion.div 
                                    className={cn(
                                      "text-xs italic p-2 rounded-lg",
                                      achievement.unlocked 
                                        ? "bg-white/20 text-white/80" 
                                        : "bg-green-50 text-green-700"
                                    )}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    📖 {achievement.jungleStory}
                                  </motion.div>
                                )}

                                {!achievement.unlocked && (
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Progress</span>
                                      <span className="font-semibold text-gray-800">
                                        {achievement.currentProgress}/{achievement.requirements}
                                      </span>
                                    </div>
                                    <div className="relative">
                                      <Progress value={progressPercentage} className="h-3" />
                                      {progressPercentage > 0 && (
                                        <motion.div
                                          className="absolute top-0 left-0 h-3 bg-gradient-to-r from-jungle/20 to-transparent rounded-full"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${progressPercentage}%` }}
                                          transition={{ duration: 1, delay: 0.5 }}
                                        />
                                      )}
                                    </div>
                                    {isComplete && (
                                      <motion.div 
                                        className="text-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", duration: 0.5 }}
                                      >
                                        <Badge className="bg-jungle text-white animate-pulse shadow-lg">
                                          Ready to Unlock! 🎉
                                        </Badge>
                                      </motion.div>
                                    )}
                                  </div>
                                )}

                                {achievement.unlocked && achievement.reward && (
                                  <motion.div 
                                    className="bg-white/20 rounded-lg p-3"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                  >
                                    <div className="text-xs font-semibold text-white/90 mb-1">
                                      🎁 Jungle Reward Unlocked:
                                    </div>
                                    <div className="text-sm text-white flex items-center gap-2">
                                      {achievement.reward.icon && (
                                        <span className="text-lg">{achievement.reward.icon}</span>
                                      )}
                                      {achievement.reward.item}
                                    </div>
                                  </motion.div>
                                )}

                                {achievement.unlocked && achievement.dateUnlocked && (
                                  <div className="text-xs text-white/70">
                                    🗓️ Discovered: {achievement.dateUnlocked.toLocaleDateString()}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}

                {/* Jungle Unlockables */}
                {showUnlockables && (
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-center">
                      <motion.h3 
                        className="text-3xl font-bold text-jungle-dark mb-4"
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        🎁 Magical Jungle Treasures
                      </motion.h3>
                      <motion.p 
                        className="text-gray-600 text-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        Complete adventures to unlock these amazing jungle treasures! ✨
                      </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2 md:px-0">
                      {jungleUnlockables.map((treasure, index) => {
                        const rarityStyle = getRarityStyle(treasure.rarity);
                        
                        return (
                          <motion.div
                            key={treasure.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -10 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Card className={cn(
                              "text-center transition-all duration-300 border-2 overflow-hidden relative",
                              treasure.unlocked
                                ? `bg-gradient-to-br ${rarityStyle.gradient} text-white shadow-2xl ${rarityStyle.glow}`
                                : `bg-white hover:bg-green-50 border-dashed ${rarityStyle.border} hover:shadow-lg`
                            )}>
                              {/* Treasure sparkles */}
                              {treasure.unlocked && (
                                <div className="absolute inset-0">
                                  {[...Array(8)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="absolute w-1 h-1 bg-white/40 rounded-full"
                                      style={{
                                        left: `${10 + Math.random() * 80}%`,
                                        top: `${10 + Math.random() * 80}%`,
                                      }}
                                      animate={{
                                        scale: [0, 1, 0],
                                        opacity: [0, 1, 0],
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: Math.random() * 2,
                                      }}
                                    />
                                  ))}
                                </div>
                              )}

                              <CardContent className="p-5 relative z-10">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                  <motion.div 
                                    className="text-5xl"
                                    animate={treasure.unlocked ? { rotate: [0, 10, -10, 0] } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    {treasure.icon}
                                  </motion.div>
                                  <motion.div 
                                    className="text-3xl"
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                  >
                                    {treasure.jungleIcon}
                                  </motion.div>
                                </div>

                                <Badge 
                                  className={cn(
                                    "mb-3 text-xs px-2 py-1",
                                    treasure.rarity === "legendary" && "bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse",
                                    treasure.rarity === "epic" && "bg-gradient-to-r from-purple-500 to-purple-700 text-white",
                                    treasure.rarity === "rare" && "bg-gradient-to-r from-blue-500 to-blue-700 text-white",
                                    treasure.rarity === "common" && "bg-gray-500 text-white"
                                  )}
                                >
                                  {treasure.rarity.toUpperCase()}
                                </Badge>

                                <h4 className={cn(
                                  "font-bold mb-3 text-lg",
                                  treasure.unlocked ? "text-white" : "text-gray-800"
                                )}>
                                  {treasure.name}
                                </h4>

                                <p className={cn(
                                  "text-sm mb-4 leading-relaxed",
                                  treasure.unlocked ? "text-white/90" : "text-gray-600"
                                )}>
                                  {treasure.description}
                                </p>

                                {treasure.jungleStory && (
                                  <motion.div 
                                    className={cn(
                                      "text-xs italic p-2 rounded-lg mb-4",
                                      treasure.unlocked 
                                        ? "bg-white/20 text-white/80" 
                                        : "bg-green-50 text-green-700"
                                    )}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    ✨ {treasure.jungleStory}
                                  </motion.div>
                                )}

                                {!treasure.unlocked && treasure.unlockedBy && (
                                  <Badge variant="outline" className="text-xs mb-2">
                                    <Lock className="w-3 h-3 mr-1" />
                                    Complete "{
                                      jungleAchievements.find(a => a.id === treasure.unlockedBy)?.name || "Mystery Quest"
                                    }"
                                  </Badge>
                                )}

                                {treasure.unlocked && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                  >
                                    <Badge className="bg-white/20 text-white border-white/30">
                                      <Check className="w-3 h-3 mr-1" />
                                      Treasure Claimed!
                                    </Badge>
                                  </motion.div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Celebration Animation */}
        <AnimatePresence>
          {celebrating && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCelebrating(null)}
            >
              <motion.div
                className="bg-gradient-to-br from-jungle to-jungle-dark text-white p-8 rounded-3xl shadow-2xl max-w-md mx-4 text-center relative overflow-hidden"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", duration: 0.8 }}
              >
                {/* Celebration particles */}
                <div className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        y: [0, -50],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>

                <motion.div 
                  className="text-8xl mb-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {celebrating.icon}
                </motion.div>

                <motion.h3 
                  className="text-2xl font-bold mb-4"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  🎉 Achievement Unlocked! 🎉
                </motion.h3>

                <motion.p 
                  className="text-xl font-semibold mb-2"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {celebrating.name}
                </motion.p>

                <motion.p 
                  className="text-white/90 mb-6"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {celebrating.description}
                </motion.p>

                {celebrating.reward && (
                  <motion.div 
                    className="bg-white/20 rounded-lg p-4 mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                  >
                    <div className="text-sm font-semibold mb-1">🎁 Jungle Reward:</div>
                    <div className="text-lg">{celebrating.reward.item}</div>
                  </motion.div>
                )}

                <motion.button
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full transition-all"
                  onClick={() => setCelebrating(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  Continue Adventure! 🗺️
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
