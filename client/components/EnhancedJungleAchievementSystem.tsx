import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedBadge, JungleBadges } from "@/components/ui/enhanced-badge";
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
  Map,
  Compass,
  TreePine,
  Leaf,
  Sun,
  Moon,
  Mountain,
  River,
  Binoculars,
  Backpack,
} from "lucide-react";
import { audioService } from "@/lib/audioService";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { AchievementTracker } from "@/lib/achievementTracker";
import { EnhancedAchievementTracker } from "@/lib/enhancedAchievementTracker";
import { goalProgressTracker } from "@/lib/goalProgressTracker";
import { CategoryCompletionTracker } from "@/lib/categoryCompletionTracker";
import { useAuth } from "@/hooks/useAuth";
import { RewardCelebration } from "@/components/RewardCelebration";

interface JungleAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "learning" | "streak" | "quiz" | "exploration" | "social" | "jungle_adventure";
  difficulty: "sapling" | "growing" | "mighty" | "ancient" | "legendary";
  rarity: "common" | "rare" | "epic" | "legendary";
  requirements: number;
  currentProgress: number;
  unlocked: boolean;
  dateUnlocked?: Date;
  region?: "canopy" | "floor" | "undergrowth" | "river" | "mountain" | "clearing";
  reward?: {
    type: "avatar_accessory" | "jungle_theme" | "sound_effect" | "title" | "points" | "animal_companion";
    item: string;
    value?: number;
    preview?: string;
  };
  criteria?: Array<{
    type: string;
    target: number;
    operator?: string;
    timeFrame?: string;
  }>;
  storyline?: {
    unlockText: string;
    celebrationText: string;
    nextHint?: string;
  };
}

interface JungleExploration {
  regions: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    unlocked: boolean;
    progress: number;
    discoveries: number;
    animals: string[];
    bgColor: string;
  }>;
  totalExplored: number;
  currentRegion: string;
  discoveries: string[];
  animalFriends: string[];
}

interface JungleLearningStats {
  totalWordsLearned: number;
  weeklyProgress: number[];
  regionBreakdown: Array<{
    region: string;
    wordsLearned: number;
    accuracy: number;
    timeSpent: number;
    discoveries: number;
  }>;
  difficultyProgress: Array<{
    difficulty: "easy" | "medium" | "hard";
    completed: number;
    total: number;
  }>;
  adventureMap: Array<{
    date: string;
    active: boolean;
    wordsLearned: number;
    region: string;
    discoveries: string[];
  }>;
  expeditionSpeed: number;
  explorationAccuracy: number;
  animalEncounters: number;
  secretsFound: number;
}

interface JungleAchievementSystemProps {
  onUnlock?: (achievement: JungleAchievement) => void;
  onRegionUnlock?: (region: string) => void;
  stats?: JungleLearningStats;
  onRefresh?: () => void;
  mobileOptimized?: boolean;
}

export function EnhancedJungleAchievementSystem({
  onUnlock,
  onRegionUnlock,
  onRefresh,
  mobileOptimized = true,
}: JungleAchievementSystemProps) {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [showUnlockables, setShowUnlockables] = useState(false);
  const [activeTab, setActiveTab] = useState("achievements");
  const [isLoading, setIsLoading] = useState(true);
  const [realStats, setRealStats] = useState<JungleLearningStats | null>(null);
  const [realAchievements, setRealAchievements] = useState<JungleAchievement[]>([]);
  const [exploration, setExploration] = useState<JungleExploration | null>(null);
  const [celebratingAchievement, setCelebratingAchievement] = useState<JungleAchievement | null>(null);
  const [recentUnlocks, setRecentUnlocks] = useState<JungleAchievement[]>([]);
  const achievementRef = useRef<HTMLDivElement>(null);

  // Jungle regions configuration
  const jungleRegions = [
    {
      id: "canopy",
      name: "Tree Canopy",
      icon: "🌳",
      description: "High up in the treetops with colorful birds",
      bgColor: "from-green-400 to-emerald-500",
      animals: ["🦜", "🐒", "🦋", "🐿️"],
      words: ["high", "fly", "bird", "tree", "leaves"],
    },
    {
      id: "floor",
      name: "Forest Floor",
      icon: "🌿",
      description: "Among the roots and fallen leaves",
      bgColor: "from-emerald-600 to-green-700",
      animals: ["🦔", "🐰", "🐸", "🐛"],
      words: ["ground", "walk", "quiet", "small", "hidden"],
    },
    {
      id: "undergrowth",
      name: "Dense Undergrowth",
      icon: "🌱",
      description: "Thick bushes and mysterious shadows",
      bgColor: "from-green-700 to-emerald-800",
      animals: ["🐍", "🕷️", "🦎", "🐝"],
      words: ["dark", "thick", "crawl", "mystery", "grow"],
    },
    {
      id: "river",
      name: "Jungle River",
      icon: "🏞️",
      description: "Crystal clear water flowing through the jungle",
      bgColor: "from-blue-400 to-cyan-500",
      animals: ["🐟", "🦆", "🐢", "🦢"],
      words: ["water", "swim", "flow", "fresh", "clear"],
    },
    {
      id: "mountain",
      name: "Mountain Peak",
      icon: "⛰️",
      description: "High above the jungle with amazing views",
      bgColor: "from-gray-500 to-slate-600",
      animals: ["🦅", "🐐", "🦋", "🐿️"],
      words: ["high", "view", "climb", "strong", "peak"],
    },
    {
      id: "clearing",
      name: "Sacred Clearing",
      icon: "✨",
      description: "A magical place where all adventures begin",
      bgColor: "from-yellow-400 to-orange-500",
      animals: ["🦄", "🧚", "🌟", "🦋"],
      words: ["magic", "special", "begin", "wonder", "bright"],
    },
  ];

  // Enhanced achievement definitions with jungle theming
  const enhancedJungleAchievements: JungleAchievement[] = [
    // Sapling Level (Beginner)
    {
      id: "first_jungle_steps",
      name: "First Jungle Steps",
      description: "Take your first steps into the amazing jungle!",
      icon: "🌱",
      category: "jungle_adventure",
      difficulty: "sapling",
      rarity: "common",
      requirements: 5,
      currentProgress: 0,
      unlocked: false,
      region: "clearing",
      reward: {
        type: "animal_companion",
        item: "Baby Monkey Friend 🐒",
        preview: "A cute baby monkey will follow you on adventures!",
      },
      storyline: {
        unlockText: "Welcome to the jungle, young explorer! Your adventure has just begun!",
        celebrationText: "🌟 Amazing! You've taken your first steps into this magical world!",
        nextHint: "Keep exploring to meet more animal friends!",
      },
    },
    {
      id: "canopy_discoverer",
      name: "Canopy Discoverer",
      description: "Explore the treetops and learn 15 sky-high words!",
      icon: "🦜",
      category: "exploration",
      difficulty: "growing",
      rarity: "common",
      requirements: 15,
      currentProgress: 0,
      unlocked: false,
      region: "canopy",
      reward: {
        type: "avatar_accessory",
        item: "Colorful Feather Hat",
        preview: "A beautiful hat made of colorful bird feathers!",
      },
      storyline: {
        unlockText: "The birds welcome you to their high kingdom!",
        celebrationText: "🦜 Fantastic! You're now a friend of the canopy creatures!",
        nextHint: "Try exploring the forest floor next!",
      },
    },
    {
      id: "river_navigator",
      name: "River Navigator",
      description: "Follow the jungle river and learn 20 water words!",
      icon: "🐟",
      category: "exploration",
      difficulty: "growing",
      rarity: "rare",
      requirements: 20,
      currentProgress: 0,
      unlocked: false,
      region: "river",
      reward: {
        type: "jungle_theme",
        item: "Flowing River Theme",
        preview: "Beautiful water animations for your learning!",
      },
      storyline: {
        unlockText: "The river fish guide you to hidden treasures!",
        celebrationText: "🐟 Incredible! You've mastered the waterways!",
        nextHint: "The mountain peak awaits your courage!",
      },
    },
    // Mighty Level (Intermediate)
    {
      id: "jungle_protector",
      name: "Jungle Protector",
      description: "Master 50 words to become a true jungle guardian!",
      icon: "🛡️",
      category: "learning",
      difficulty: "mighty",
      rarity: "epic",
      requirements: 50,
      currentProgress: 0,
      unlocked: false,
      region: "undergrowth",
      reward: {
        type: "title",
        item: "Guardian of the Green",
        preview: "A prestigious title showing your jungle mastery!",
      },
      storyline: {
        unlockText: "The jungle spirits recognize your dedication!",
        celebrationText: "🛡️ Magnificent! You are now a true jungle protector!",
        nextHint: "Ancient secrets await in the mountain peaks!",
      },
    },
    {
      id: "mountain_climber",
      name: "Peak Conqueror",
      description: "Reach the highest peaks and learn 30 mountain words!",
      icon: "⛰️",
      category: "exploration",
      difficulty: "mighty",
      rarity: "epic",
      requirements: 30,
      currentProgress: 0,
      unlocked: false,
      region: "mountain",
      reward: {
        type: "animal_companion",
        item: "Majestic Eagle Companion 🦅",
        preview: "A proud eagle will soar beside you!",
      },
      storyline: {
        unlockText: "The mountain eagles welcome a fellow adventurer!",
        celebrationText: "⛰️ Outstanding! You've conquered the highest peaks!",
        nextHint: "The sacred clearing holds the greatest mysteries!",
      },
    },
    // Ancient Level (Advanced)
    {
      id: "jungle_sage",
      name: "Jungle Sage",
      description: "Learn 100 words and become wise in the ways of the jungle!",
      icon: "🧙‍♂️",
      category: "learning",
      difficulty: "ancient",
      rarity: "legendary",
      requirements: 100,
      currentProgress: 0,
      unlocked: false,
      region: "clearing",
      reward: {
        type: "jungle_theme",
        item: "Mystical Jungle Theme",
        preview: "Magical particles and ancient symbols!",
      },
      storyline: {
        unlockText: "Ancient wisdom flows through you!",
        celebrationText: "🧙‍♂️ Extraordinary! You are now a jungle sage!",
        nextHint: "Your wisdom will guide other explorers!",
      },
    },
    // Legendary Level (Master)
    {
      id: "jungle_master",
      name: "Master of All Realms",
      description: "Explore every region and learn 200+ words to become the ultimate jungle master!",
      icon: "👑",
      category: "jungle_adventure",
      difficulty: "legendary",
      rarity: "legendary",
      requirements: 200,
      currentProgress: 0,
      unlocked: false,
      reward: {
        type: "title",
        item: "Supreme Jungle Master",
        preview: "The highest honor in all the jungle realms!",
      },
      storyline: {
        unlockText: "All creatures of the jungle bow before your mastery!",
        celebrationText: "👑 LEGENDARY! You are the ultimate jungle master!",
        nextHint: "Your legend will inspire future adventurers!",
      },
    },
  ];

  // Load real data on component mount
  useEffect(() => {
    const loadRealData = async () => {
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

        // Merge with jungle achievements
        const jungleAchievements = enhancedJungleAchievements.map(ja => {
          const existingAchievement = achievements.find(a => a.id === ja.id);
          return existingAchievement ? { ...ja, ...existingAchievement } : ja;
        });

        // Update progress based on real data
        jungleAchievements.forEach(achievement => {
          switch (achievement.id) {
            case "first_jungle_steps":
              achievement.currentProgress = Math.min(journeyProgress.wordsLearned, achievement.requirements);
              break;
            case "canopy_discoverer":
              achievement.currentProgress = Math.min(journeyProgress.wordsLearned, achievement.requirements);
              break;
            case "river_navigator":
              achievement.currentProgress = Math.min(journeyProgress.wordsLearned, achievement.requirements);
              break;
            case "jungle_protector":
              achievement.currentProgress = Math.min(journeyProgress.wordsLearned, achievement.requirements);
              break;
            case "mountain_climber":
              achievement.currentProgress = Math.min(journeyProgress.wordsLearned, achievement.requirements);
              break;
            case "jungle_sage":
              achievement.currentProgress = Math.min(journeyProgress.wordsLearned, achievement.requirements);
              break;
            case "jungle_master":
              achievement.currentProgress = Math.min(journeyProgress.wordsLearned, achievement.requirements);
              break;
          }

          // Auto-unlock if progress meets requirements
          if (achievement.currentProgress >= achievement.requirements && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.dateUnlocked = new Date();
            setRecentUnlocks(prev => [...prev, achievement]);
          }
        });

        // Create exploration data
        const explorationData: JungleExploration = {
          regions: jungleRegions.map(region => ({
            ...region,
            unlocked: journeyProgress.wordsLearned >= (region.id === "clearing" ? 0 : 10),
            progress: Math.min((journeyProgress.wordsLearned / 50) * 100, 100),
            discoveries: Math.floor(journeyProgress.wordsLearned / 10),
          })),
          totalExplored: Math.min((journeyProgress.wordsLearned / 200) * 100, 100),
          currentRegion: journeyProgress.wordsLearned < 10 ? "clearing" : 
                        journeyProgress.wordsLearned < 30 ? "canopy" :
                        journeyProgress.wordsLearned < 60 ? "floor" :
                        journeyProgress.wordsLearned < 100 ? "river" :
                        journeyProgress.wordsLearned < 150 ? "mountain" : "clearing",
          discoveries: [],
          animalFriends: [],
        };

        // Create enhanced stats
        const weeklyData = getWeeklyProgressData(userId);
        const jungleStats: JungleLearningStats = {
          totalWordsLearned: journeyProgress.wordsLearned,
          weeklyProgress: weeklyData,
          regionBreakdown: jungleRegions.map(region => ({
            region: region.name,
            wordsLearned: Math.floor(journeyProgress.wordsLearned / jungleRegions.length),
            accuracy: journeyProgress.totalAccuracy || 85,
            timeSpent: Math.floor(Math.random() * 60) + 20,
            discoveries: Math.floor(journeyProgress.wordsLearned / 20),
          })),
          difficultyProgress: [
            { difficulty: "easy", completed: journeyProgress.difficultyStats?.easy?.completed || 0, total: 50 },
            { difficulty: "medium", completed: journeyProgress.difficultyStats?.medium?.completed || 0, total: 50 },
            { difficulty: "hard", completed: journeyProgress.difficultyStats?.hard?.completed || 0, total: 30 },
          ],
          adventureMap: getAdventureMapData(userId),
          expeditionSpeed: Math.max(weeklyData.reduce((sum, count) => sum + count, 0) / 7 * 2, 1),
          explorationAccuracy: journeyProgress.totalAccuracy || 85,
          animalEncounters: Math.floor(journeyProgress.wordsLearned / 5),
          secretsFound: Math.floor(journeyProgress.wordsLearned / 15),
        };

        setRealStats(jungleStats);
        setRealAchievements(jungleAchievements);
        setExploration(explorationData);
        
      } catch (error) {
        console.error("Error loading jungle data:", error);
        // Fallback data
        setRealStats({
          totalWordsLearned: 0,
          weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
          regionBreakdown: [],
          difficultyProgress: [
            { difficulty: "easy", completed: 0, total: 50 },
            { difficulty: "medium", completed: 0, total: 50 },
            { difficulty: "hard", completed: 0, total: 30 },
          ],
          adventureMap: [],
          expeditionSpeed: 1,
          explorationAccuracy: 0,
          animalEncounters: 0,
          secretsFound: 0,
        });
        setRealAchievements(enhancedJungleAchievements);
      } finally {
        setIsLoading(false);
      }
    };

    loadRealData();
  }, [user?.id]);

  // Show celebration for recent unlocks
  useEffect(() => {
    if (recentUnlocks.length > 0) {
      const achievement = recentUnlocks[0];
      setCelebratingAchievement(achievement);
      audioService.playCheerSound();
      
      setTimeout(() => {
        setCelebratingAchievement(null);
        setRecentUnlocks(prev => prev.slice(1));
      }, 4000);
    }
  }, [recentUnlocks]);

  // Helper functions
  const getWeeklyProgressData = (userId: string): number[] => {
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

  const getAdventureMapData = (userId: string) => {
    const mapData = [];
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
            active: (parsed.words || 0) > 0,
            wordsLearned: parsed.words || 0,
            region: getRegionForDay(parsed.words || 0),
            discoveries: [],
          });
        } else {
          mapData.push({
            date: dateKey,
            active: false,
            wordsLearned: 0,
            region: "clearing",
            discoveries: [],
          });
        }
      } catch (error) {
        mapData.push({
          date: dateKey,
          active: false,
          wordsLearned: 0,
          region: "clearing",
          discoveries: [],
        });
      }
    }

    return mapData;
  };

  const getRegionForDay = (wordsLearned: number): string => {
    if (wordsLearned >= 10) return "mountain";
    if (wordsLearned >= 7) return "river";
    if (wordsLearned >= 5) return "canopy";
    if (wordsLearned >= 3) return "floor";
    if (wordsLearned >= 1) return "undergrowth";
    return "clearing";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "sapling": return "from-green-300 to-green-500";
      case "growing": return "from-green-500 to-emerald-600";
      case "mighty": return "from-emerald-600 to-green-800";
      case "ancient": return "from-amber-500 to-orange-600";
      case "legendary": return "from-purple-500 to-pink-600 via-yellow-500";
      default: return "from-gray-400 to-gray-600";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "common": return "border-gray-300";
      case "rare": return "border-blue-400 shadow-blue-200";
      case "epic": return "border-purple-400 shadow-purple-200";
      case "legendary": return "border-yellow-400 shadow-yellow-200 animate-pulse";
      default: return "border-gray-300";
    }
  };

  const categories = [
    { id: "all", name: "All Adventures", icon: "🌍" },
    { id: "jungle_adventure", name: "Jungle Quest", icon: "🌿" },
    { id: "exploration", name: "Exploration", icon: "🗺️" },
    { id: "learning", name: "Learning", icon: "📚" },
    { id: "streak", name: "Streaks", icon: "🔥" },
    { id: "quiz", name: "Quizzes", icon: "🧠" },
  ];

  const regions = [
    { id: "all", name: "All Regions", icon: "🌍" },
    ...jungleRegions.map(r => ({ id: r.id, name: r.name, icon: r.icon })),
  ];

  if (isLoading) {
    return (
      <div className="jungle-loading min-h-[400px] bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="jungle-loading-spinner mb-6"></div>
          <h3 className="text-2xl font-bold text-jungle-green mb-2">🌿 Loading Your Jungle Adventure</h3>
          <p className="text-jungle-green/80 text-center max-w-md">
            Preparing your amazing journey through the magical jungle realms...
          </p>
        </div>
      </div>
    );
  }

  const stats = realStats!;
  const achievements = realAchievements;

  const filteredAchievements = achievements.filter(a => {
    const categoryMatch = selectedCategory === "all" || a.category === selectedCategory;
    const regionMatch = selectedRegion === "all" || a.region === selectedRegion;
    return categoryMatch && regionMatch;
  });

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  const renderJungleOverview = () => (
    <div className="space-y-6">
      {/* Jungle Explorer Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="bg-gradient-to-br from-jungle-green to-jungle-light text-white hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-6 text-center">
            <TreePine className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 animate-jungle-sway" />
            <div className="text-xl md:text-3xl font-bold mb-1">
              <AnimatedCounter value={stats.totalWordsLearned} />
            </div>
            <p className="text-xs md:text-sm opacity-90">Words Discovered! 🌿</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sunshine-yellow to-sunshine-light text-jungle-dark hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-6 text-center">
            <Compass className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 animate-spin" style={{ animationDuration: "4s" }} />
            <div className="text-xl md:text-3xl font-bold mb-1">
              <AnimatedCounter value={stats.animalEncounters} />
            </div>
            <p className="text-xs md:text-sm opacity-90">Animal Friends! 🦁</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-sky-blue to-sky-light text-white hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-6 text-center">
            <Binoculars className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 animate-jungle-float" />
            <div className="text-xl md:text-3xl font-bold mb-1">
              <AnimatedCounter value={stats.secretsFound} />
            </div>
            <p className="text-xs md:text-sm opacity-90">Secrets Found! 🔍</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-playful-purple to-coral-red text-white hover:scale-105 transition-all">
          <CardContent className="p-3 md:p-6 text-center">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 animate-bounce" />
            <div className="text-xl md:text-3xl font-bold mb-1">
              <AnimatedCounter value={unlockedAchievements.length} />
            </div>
            <p className="text-xs md:text-sm opacity-90">Achievements! 🏆</p>
          </CardContent>
        </Card>
      </div>

      {/* Jungle Exploration Map */}
      {exploration && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-jungle-green">
              <Map className="w-6 h-6" />
              🗺️ Your Jungle Exploration Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {exploration.regions.map((region, index) => (
                <div
                  key={region.id}
                  className={`relative p-4 rounded-xl bg-gradient-to-br ${region.bgColor} text-white transform transition-all hover:scale-105 ${
                    region.unlocked ? 'cursor-pointer shadow-lg' : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl mb-2">{region.icon}</div>
                    <h3 className="font-bold text-sm md:text-base mb-1">{region.name}</h3>
                    <p className="text-xs opacity-90 mb-3">{region.description}</p>
                    
                    {region.unlocked ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Explored</span>
                          <span>{Math.round(region.progress)}%</span>
                        </div>
                        <Progress value={region.progress} className="h-2 bg-white/20" />
                        <div className="flex justify-center gap-1">
                          {region.animals.slice(0, region.discoveries).map((animal, i) => (
                            <span key={i} className="text-lg animate-bounce" style={{ animationDelay: `${i * 200}ms` }}>
                              {animal}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Lock className="w-6 h-6 opacity-60" />
                      </div>
                    )}
                  </div>

                  {region.unlocked && region.progress === 100 && (
                    <div className="absolute -top-2 -right-2">
                      <JungleBadges.Completed size="sm">Complete!</JungleBadges.Completed>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adventure Timeline */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Calendar className="w-6 h-6" />
            🗓️ Your Adventure Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-center text-orange-700 font-semibold">
              Track your daily jungle adventures! 🌟
            </p>

            <div className="grid grid-cols-10 gap-1 justify-center max-w-lg mx-auto">
              {stats.adventureMap.slice(-30).map((day, index) => {
                const regionData = jungleRegions.find(r => r.id === day.region);
                const regionIcon = regionData?.icon || "🌿";

                return (
                  <div
                    key={index}
                    className={`adventure-day ${day.active ? 'explored' : ''} ${
                      day.active
                        ? day.wordsLearned > 8
                          ? "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg"
                          : day.wordsLearned > 4
                            ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-md"
                            : "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    title={`${day.date}: ${day.active ? `${day.wordsLearned} words in ${regionData?.name || 'Unknown Region'} ${regionIcon}` : "Rest day 😴"}`}
                  >
                    {day.active ? regionIcon : "💤"}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 md:flex md:justify-center gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded-sm flex items-center justify-center">💤</div>
                <span className="text-gray-600">Rest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center text-white">🌿</div>
                <span className="text-orange-600">Exploring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded-sm flex items-center justify-center text-white">🌳</div>
                <span className="text-green-600">Great Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-500 rounded-sm flex items-center justify-center text-white">🏆</div>
                <span className="text-emerald-600">Epic Adventure!</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAchievementsTab = () => (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <div className="flex justify-center gap-2 md:gap-4 mb-6">
        <Card className="bg-gradient-to-r from-jungle-green to-jungle-light text-white hover:scale-105 transition-all flex-1 max-w-[150px]">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-xl md:text-2xl font-bold">
              {unlockedAchievements.length}
            </div>
            <div className="text-xs md:text-sm opacity-90">🏆 Unlocked</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-sunshine-yellow to-sunshine-light text-jungle-dark hover:scale-105 transition-all flex-1 max-w-[150px]">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="text-xl md:text-2xl font-bold">
              {achievements.length - unlockedAchievements.length}
            </div>
            <div className="text-xs md:text-sm opacity-90">🎯 To Unlock</div>
          </CardContent>
        </Card>
      </div>

      {/* Category and Region Filters */}
      <div className="space-y-3">
        <div className="flex justify-center gap-1 md:gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-1 md:gap-2 hover:scale-105 transition-all text-xs md:text-sm px-2 md:px-3"
            >
              <span>{category.icon}</span>
              <span className="hidden md:inline">{category.name}</span>
            </Button>
          ))}
        </div>

        <div className="flex justify-center gap-1 md:gap-2 flex-wrap">
          {regions.map(region => (
            <Button
              key={region.id}
              variant={selectedRegion === region.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRegion(region.id)}
              className="flex items-center gap-1 hover:scale-105 transition-all text-xs px-2"
            >
              <span>{region.icon}</span>
              <span className="hidden md:inline">{region.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => {
          const progressPercentage = Math.min(
            (achievement.currentProgress / achievement.requirements) * 100,
            100
          );
          const isComplete = progressPercentage >= 100;

          return (
            <Card
              key={achievement.id}
              className={`jungle-achievement-card relative transition-all duration-300 hover:shadow-xl ${
                achievement.unlocked
                  ? `bg-gradient-to-br ${getDifficultyColor(achievement.difficulty)} text-white shadow-lg unlocked`
                  : `bg-white ${getRarityBorder(achievement.rarity)} hover:border-jungle-green`
              } ${getRarityBorder(achievement.rarity)}`}
              ref={achievement.unlocked ? achievementRef : undefined}
            >
              {/* Rarity indicator */}
              {achievement.rarity !== "common" && (
                <div className="absolute top-2 right-2">
                  <JungleBadges.Diamond size="sm">{achievement.rarity}</JungleBadges.Diamond>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-4xl">{achievement.icon}</div>
                  <div className="flex items-center gap-1">
                    {achievement.unlocked && <Check className="w-5 h-5 text-green-300" />}
                    {!achievement.unlocked && isComplete && <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />}
                    {!achievement.unlocked && !isComplete && <Lock className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
                <CardTitle className={`text-lg ${achievement.unlocked ? "text-white" : "text-gray-800"}`}>
                  {achievement.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className={`text-sm ${achievement.unlocked ? "text-white/90" : "text-gray-600"}`}>
                  {achievement.description}
                </p>

                {/* Region indicator */}
                {achievement.region && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-75">Region:</span>
                    <JungleBadges.Explorer size="sm">
                      {jungleRegions.find(r => r.id === achievement.region)?.name || achievement.region}
                    </JungleBadges.Explorer>
                  </div>
                )}

                {!achievement.unlocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={achievement.unlocked ? "text-white/80" : "text-gray-600"}>
                        Progress
                      </span>
                      <span className={`font-semibold ${achievement.unlocked ? "text-white" : "text-gray-800"}`}>
                        {achievement.currentProgress}/{achievement.requirements}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2 jungle-progress-bar" />
                    {isComplete && (
                      <div className="text-center">
                        <JungleBadges.NewUnlock>Ready to Unlock! 🎉</JungleBadges.NewUnlock>
                      </div>
                    )}
                  </div>
                )}

                {achievement.unlocked && achievement.reward && (
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-xs font-semibold text-white/90 mb-1">
                      🎁 Reward Unlocked:
                    </div>
                    <div className="text-sm text-white">
                      {achievement.reward.item}
                    </div>
                    {achievement.reward.preview && (
                      <div className="text-xs text-white/80 mt-1">
                        {achievement.reward.preview}
                      </div>
                    )}
                  </div>
                )}

                {achievement.storyline && achievement.unlocked && (
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-xs text-white/90 mb-1">📖 Story:</div>
                    <div className="text-sm text-white italic">
                      "{achievement.storyline.celebrationText}"
                    </div>
                    {achievement.storyline.nextHint && (
                      <div className="text-xs text-white/80 mt-2">
                        💡 {achievement.storyline.nextHint}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 jungle-achievement-system" ref={achievementRef}>
      {/* Celebration Modal */}
      {celebratingAchievement && (
        <RewardCelebration
          isVisible={true}
          type="achievement"
          title={celebratingAchievement.storyline?.unlockText || "🏆 Achievement Unlocked!"}
          message={celebratingAchievement.storyline?.celebrationText || celebratingAchievement.name}
          points={50}
          onComplete={() => setCelebratingAchievement(null)}
          duration={4000}
        />
      )}

      {/* Header */}
      <div className="text-center px-4">
        <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-jungle-green via-jungle-light to-sunshine-yellow bg-clip-text text-transparent mb-2 leading-tight">
          🌿 Jungle Adventure Progress! 🏆
        </h2>
        <p className="text-gray-600 mb-4 text-sm md:text-lg">
          Explore magical realms and unlock amazing achievements! 🗺️✨
        </p>
      </div>

      {/* Adventure Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 gap-1 md:gap-0 bg-gradient-to-r from-jungle-green/10 to-sunshine-yellow/10 h-auto p-1">
          <TabsTrigger
            value="overview"
            className="jungle-tab flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-jungle-green data-[state=active]:text-white text-xs md:text-sm py-2 md:py-3"
          >
            <Map className="w-4 h-4" />
            <span className="hidden md:inline">🗺️ Overview</span>
            <span className="md:hidden text-center">🗺️<br />Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="jungle-tab flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-sunshine-yellow data-[state=active]:text-jungle-dark text-xs md:text-sm py-2 md:py-3"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden md:inline">🏆 Achievements</span>
            <span className="md:hidden text-center">🏆<br />Achievements</span>
          </TabsTrigger>
          <TabsTrigger
            value="exploration"
            className="jungle-tab flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-sky-blue data-[state=active]:text-white text-xs md:text-sm py-2 md:py-3"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden md:inline">🧭 Exploration</span>
            <span className="md:hidden text-center">🧭<br />Exploration</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderJungleOverview()}
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          {renderAchievementsTab()}
        </TabsContent>

        <TabsContent value="exploration" className="mt-6">
          {exploration && renderJungleOverview()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EnhancedJungleAchievementSystem;
