import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  Crown,
  Gem,
  Sparkles,
  X,
  Share,
  ChevronRight,
  Target,
  Calendar,
  Zap,
  Heart,
  BookOpen,
  MapPin
} from "lucide-react";

// Types and interfaces
interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  requirement: number;
  category: "mastery" | "streak" | "exploration" | "social" | "time";
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: Date;
  progress?: number;
  isNew?: boolean;
}

interface PlayerStats {
  totalScore: number;
  currentStreak: number;
  maxStreak: number;
  jungleGems: number;
  sparkleSeeds: number;
  masteredWordsCount: number;
  favoriteWordsCount: number;
  achievementsCount: number;
  totalPlayTime: number;
  wordsReviewedToday: number;
  categoriesUnlocked: number;
  level: number;
  experience: number;
}

interface JungleAchievementPopupProps {
  isOpen: boolean;
  onClose: () => void;
  recentAchievements: string[];
  gameStats: PlayerStats;
  accessibilitySettings?: {
    highContrast?: boolean;
    largeText?: boolean;
    reducedMotion?: boolean;
  };
  onShareAchievement?: (achievement: Achievement) => void;
  onViewAllAchievements?: () => void;
}

// Achievement configurations
const ACHIEVEMENT_LIBRARY: { [key: string]: Achievement } = {
  "first-word": {
    id: "first-word",
    name: "First Word Explorer",
    description: "Mastered your first jungle word!",
    emoji: "🌟",
    color: "from-yellow-400 to-orange-500",
    requirement: 1,
    category: "mastery",
    rarity: "common"
  },
  "word-master": {
    id: "word-master", 
    name: "Word Master",
    description: "Mastered 10 jungle words!",
    emoji: "🏆",
    color: "from-gold-400 to-yellow-500",
    requirement: 10,
    category: "mastery",
    rarity: "rare"
  },
  "jungle-explorer": {
    id: "jungle-explorer",
    name: "Jungle Explorer",
    description: "Mastered 25 jungle words!",
    emoji: "🗺️",
    color: "from-green-400 to-emerald-500",
    requirement: 25,
    category: "mastery",
    rarity: "epic"
  },
  "word-champion": {
    id: "word-champion",
    name: "Word Champion", 
    description: "Mastered 50 jungle words!",
    emoji: "👑",
    color: "from-purple-400 to-pink-500",
    requirement: 50,
    category: "mastery",
    rarity: "legendary"
  },
  "streak-starter": {
    id: "streak-starter",
    name: "Streak Starter",
    description: "Achieved a 5-word streak!",
    emoji: "🔥",
    color: "from-red-400 to-orange-500",
    requirement: 5,
    category: "streak",
    rarity: "common"
  },
  "streak-master": {
    id: "streak-master",
    name: "Streak Master",
    description: "Achieved a 10-word streak!",
    emoji: "⚡",
    color: "from-blue-400 to-purple-500",
    requirement: 10,
    category: "streak",
    rarity: "rare"
  },
  "daily-adventurer": {
    id: "daily-adventurer",
    name: "Daily Adventurer",
    description: "Reviewed 20 words in one day!",
    emoji: "📅",
    color: "from-indigo-400 to-blue-500",
    requirement: 20,
    category: "time",
    rarity: "rare"
  },
  "gem-collector": {
    id: "gem-collector",
    name: "Gem Collector",
    description: "Collected 100 jungle gems!",
    emoji: "💎",
    color: "from-cyan-400 to-blue-500",
    requirement: 100,
    category: "exploration",
    rarity: "legendary"
  }
};

const RARITY_CONFIG = {
  common: {
    borderColor: "border-green-300",
    bgGradient: "from-green-50 to-green-100",
    textColor: "text-green-800",
    sparkleCount: 5
  },
  rare: {
    borderColor: "border-blue-300", 
    bgGradient: "from-blue-50 to-blue-100",
    textColor: "text-blue-800",
    sparkleCount: 8
  },
  epic: {
    borderColor: "border-purple-300",
    bgGradient: "from-purple-50 to-purple-100", 
    textColor: "text-purple-800",
    sparkleCount: 12
  },
  legendary: {
    borderColor: "border-yellow-300",
    bgGradient: "from-yellow-50 to-orange-100",
    textColor: "text-orange-800", 
    sparkleCount: 16
  }
};

export const JungleAchievementPopup: React.FC<JungleAchievementPopupProps> = ({
  isOpen,
  onClose,
  recentAchievements,
  gameStats,
  accessibilitySettings = {},
  onShareAchievement,
  onViewAllAchievements
}) => {
  // State management
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);
  const [celebrationPhase, setCelebrationPhase] = useState<"intro" | "main" | "outro">("intro");

  // Refs
  const popupRef = useRef<HTMLDivElement>(null);
  const celebrationTimeoutRef = useRef<NodeJS.Timeout>();

  // Get current achievement details
  const currentAchievement = recentAchievements[currentAchievementIndex] 
    ? ACHIEVEMENT_LIBRARY[recentAchievements[currentAchievementIndex]]
    : null;

  const rarityConfig = currentAchievement 
    ? RARITY_CONFIG[currentAchievement.rarity]
    : RARITY_CONFIG.common;

  // Create celebration particles
  useEffect(() => {
    if (isOpen && !accessibilitySettings.reducedMotion && currentAchievement) {
      setCelebrationPhase("intro");
      
      const createParticles = () => {
        const newParticles = [];
        const count = rarityConfig.sparkleCount;
        
        for (let i = 0; i < count; i++) {
          newParticles.push({
            id: Math.random(),
            emoji: ['✨', '⭐', '🌟', '💫', '🎉'][Math.floor(Math.random() * 5)],
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 2 + Math.random() * 2
          });
        }
        setParticles(newParticles);
      };

      createParticles();

      // Phase transitions
      celebrationTimeoutRef.current = setTimeout(() => {
        setCelebrationPhase("main");
        setTimeout(() => {
          setCelebrationPhase("outro");
          setTimeout(() => {
            setParticles([]);
          }, 1000);
        }, 3000);
      }, 500);
    }

    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, [isOpen, currentAchievement, accessibilitySettings.reducedMotion, rarityConfig.sparkleCount]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          if (currentAchievementIndex > 0) {
            setCurrentAchievementIndex(prev => prev - 1);
          }
          break;
        case "ArrowRight":
          if (currentAchievementIndex < recentAchievements.length - 1) {
            setCurrentAchievementIndex(prev => prev + 1);
          }
          break;
        case "Enter":
        case " ":
          setShowDetails(!showDetails);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentAchievementIndex, recentAchievements.length, showDetails, onClose]);

  // Handle sharing
  const handleShare = () => {
    if (currentAchievement && onShareAchievement) {
      onShareAchievement(currentAchievement);
    }
  };

  // Navigate between achievements
  const navigateAchievement = (direction: "prev" | "next") => {
    if (direction === "prev" && currentAchievementIndex > 0) {
      setCurrentAchievementIndex(prev => prev - 1);
    } else if (direction === "next" && currentAchievementIndex < recentAchievements.length - 1) {
      setCurrentAchievementIndex(prev => prev + 1);
    }
    setShowDetails(false);
  };

  // Get progress towards next achievement
  const getNextAchievementProgress = () => {
    // This would typically check progress towards next unearned achievement
    // For demo purposes, we'll show progress towards word-champion
    const nextTarget = 50; // Word Champion requirement
    const current = gameStats.masteredWordsCount;
    return {
      name: "Word Champion",
      progress: Math.min(100, (current / nextTarget) * 100),
      current,
      target: nextTarget
    };
  };

  const nextProgress = getNextAchievementProgress();

  if (!isOpen || !currentAchievement) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-title"
      aria-describedby="achievement-description"
    >
      {/* Celebration Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`absolute text-2xl pointer-events-none ${
            accessibilitySettings.reducedMotion ? "" : "animate-ping"
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`
          }}
        >
          {particle.emoji}
        </div>
      ))}

      <Card 
        ref={popupRef}
        className={`w-full max-w-lg transform transition-all duration-500 ${
          celebrationPhase === "intro" && !accessibilitySettings.reducedMotion
            ? "scale-110 opacity-0" 
            : "scale-100 opacity-100"
        } ${accessibilitySettings.highContrast ? "bg-black text-white border-white" : "bg-white"} ${
          rarityConfig.borderColor
        } border-4 shadow-2xl`}
      >
        {/* Header */}
        <CardHeader className={`relative text-center bg-gradient-to-r ${rarityConfig.bgGradient} ${
          accessibilitySettings.highContrast ? "bg-gray-800" : ""
        }`}>
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 h-8 w-8 p-0"
            aria-label="Close achievement popup"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Achievement counter */}
          {recentAchievements.length > 1 && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                {currentAchievementIndex + 1} / {recentAchievements.length}
              </Badge>
            </div>
          )}

          <CardTitle className="text-center">
            <div className={`text-6xl mb-2 ${
              celebrationPhase === "main" && !accessibilitySettings.reducedMotion 
                ? "animate-bounce" 
                : ""
            }`}>
              {currentAchievement.emoji}
            </div>
            <h2 
              id="achievement-title"
              className={`text-2xl font-bold ${rarityConfig.textColor} ${
                accessibilitySettings.largeText ? "text-3xl" : ""
              } ${accessibilitySettings.highContrast ? "text-white" : ""}`}
            >
              🎉 Achievement Unlocked! 🎉
            </h2>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Achievement Details */}
          <div className="text-center space-y-3">
            <h3 className={`text-xl font-bold ${
              accessibilitySettings.largeText ? "text-2xl" : ""
            } ${accessibilitySettings.highContrast ? "text-white" : "text-gray-800"}`}>
              {currentAchievement.name}
            </h3>
            
            <p 
              id="achievement-description"
              className={`${accessibilitySettings.largeText ? "text-lg" : "text-base"} ${
                accessibilitySettings.highContrast ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {currentAchievement.description}
            </p>

            {/* Rarity badge */}
            <Badge 
              className={`capitalize bg-gradient-to-r ${currentAchievement.color} text-white px-4 py-2 text-sm font-bold`}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {currentAchievement.rarity} Achievement
            </Badge>
          </div>

          {/* Additional Details (expandable) */}
          {showDetails && (
            <div className={`space-y-4 bg-gradient-to-r ${rarityConfig.bgGradient} rounded-lg p-4 ${
              accessibilitySettings.highContrast ? "bg-gray-700" : ""
            }`}>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold ${rarityConfig.textColor} ${
                    accessibilitySettings.highContrast ? "text-white" : ""
                  }`}>
                    {gameStats.masteredWordsCount}
                  </div>
                  <div className="text-xs text-gray-600">Words Mastered</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${rarityConfig.textColor} ${
                    accessibilitySettings.highContrast ? "text-white" : ""
                  }`}>
                    {gameStats.currentStreak}
                  </div>
                  <div className="text-xs text-gray-600">Current Streak</div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">Unlocked on:</p>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {/* Next Achievement Progress */}
          <div className="space-y-3">
            <h4 className={`font-semibold ${accessibilitySettings.largeText ? "text-lg" : "text-base"} ${
              accessibilitySettings.highContrast ? "text-white" : "text-gray-800"
            }`}>
              🎯 Next Goal: {nextProgress.name}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{nextProgress.current}</span>
                <span>{nextProgress.target}</span>
              </div>
              <Progress 
                value={nextProgress.progress} 
                className="h-3"
              />
              <p className="text-xs text-center text-gray-600">
                {nextProgress.target - nextProgress.current} more words to go!
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              className="flex-1"
            >
              <Target className="w-4 h-4 mr-2" />
              {showDetails ? "Hide" : "View"} Details
            </Button>

            {onShareAchievement && (
              <Button
                onClick={handleShare}
                variant="outline"
                className="flex-1"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}

            {onViewAllAchievements && (
              <Button
                onClick={onViewAllAchievements}
                variant="outline"
                className="flex-1"
              >
                <Trophy className="w-4 h-4 mr-2" />
                View All
              </Button>
            )}
          </div>

          {/* Navigation for multiple achievements */}
          {recentAchievements.length > 1 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateAchievement("prev")}
                disabled={currentAchievementIndex === 0}
                aria-label="Previous achievement"
              >
                ← Previous
              </Button>

              <div className="flex space-x-1">
                {recentAchievements.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentAchievementIndex 
                        ? "bg-blue-500" 
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateAchievement("next")}
                disabled={currentAchievementIndex === recentAchievements.length - 1}
                aria-label="Next achievement"
              >
                Next →
              </Button>
            </div>
          )}

          {/* Continue Button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5 mr-2" />
            Continue Adventure!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JungleAchievementPopup;
