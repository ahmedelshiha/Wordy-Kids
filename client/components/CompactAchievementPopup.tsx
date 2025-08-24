import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Trophy, Star, Crown, Gem, Award } from "lucide-react";
import { audioService } from "@/lib/audioService";

interface Achievement {
  id: string;
  name: string;
  description: string;
  funnyDescription?: string;
  icon: string;
  category:
    | "learning"
    | "streak"
    | "quiz"
    | "exploration"
    | "social"
    | "journey"
    | "difficulty"
    | "session";
  difficulty: "bronze" | "silver" | "gold" | "diamond" | "rainbow";
  requirements: number;
  currentProgress: number;
  unlocked: boolean;
  dateUnlocked?: Date;
  reward?: {
    type:
      | "avatar_accessory"
      | "theme"
      | "sound_effect"
      | "title"
      | "points"
      | "sticker"
      | "badge";
    item: string;
    value?: number;
    emoji?: string;
  };
}

interface CompactAchievementPopupProps {
  achievements: Achievement[];
  onClose: () => void;
  onAchievementClaim?: (achievement: Achievement) => void;
}

const DIFFICULTY_COLORS = {
  bronze: "from-amber-200 via-orange-300 to-yellow-300", // 🌱 Seed theme
  silver: "from-gray-300 to-gray-500",
  gold: "from-yellow-400 to-yellow-500",
  diamond: "from-blue-400 to-purple-500",
  rainbow:
    "from-pink-400 via-purple-400 via-blue-400 via-green-400 to-yellow-400",
} as const;

const DIFFICULTY_ICONS = {
  bronze: Award,
  silver: Star,
  gold: Crown,
  diamond: Gem,
  rainbow: Trophy,
} as const;

// Compact sparkle effect for mobile
const CompactSparkles = React.memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 4 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute text-yellow-300 text-sm"
        initial={{
          scale: 0,
          x: 0,
          y: 0,
          opacity: 1,
        }}
        animate={{
          scale: [0, 1, 0],
          x: Math.cos((i * Math.PI * 2) / 4) * 20,
          y: Math.sin((i * Math.PI * 2) / 4) * 20,
          opacity: [1, 1, 0],
        }}
        transition={{
          duration: 0.8,
          delay: i * 0.1,
          repeat: 2,
          repeatDelay: 1,
        }}
      >
        ✨
      </motion.div>
    ))}
  </div>
));

export function CompactAchievementPopup({
  achievements,
  onClose,
  onAchievementClaim,
}: CompactAchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [isClosing, setIsClosing] = useState(false);

  const currentAchievement = achievements[currentIndex];

  // Auto-close after 2 seconds
  useEffect(() => {
    if (achievements.length > 0 && !isClosing) {
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(onClose, 300);
      }, 2000); // 2 seconds auto-close

      return () => clearTimeout(timer);
    }
  }, [achievements.length, currentIndex, isClosing, onClose]);

  // Show reward animation (removed automatic sound)
  useEffect(() => {
    if (achievements.length > 0 && !isClosing) {
      const timer = setTimeout(() => setShowReward(true), 500);
      return () => clearTimeout(timer);
    }
  }, [achievements.length, currentIndex, isClosing]);

  const handleClaimReward = useCallback(() => {
    if (currentAchievement && !claimed.has(currentAchievement.id)) {
      setClaimed((prev) => new Set(prev).add(currentAchievement.id));
      onAchievementClaim?.(currentAchievement);
      audioService.playCheerSound();

      // Move to next achievement or close
      if (currentIndex < achievements.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setShowReward(false);
          setTimeout(() => setShowReward(true), 500);
        }, 800);
      } else {
        setTimeout(() => {
          setIsClosing(true);
          setTimeout(onClose, 300);
        }, 1000);
      }
    }
  }, [
    currentAchievement,
    claimed,
    currentIndex,
    achievements.length,
    onAchievementClaim,
    onClose,
  ]);

  const handleNext = useCallback(() => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowReward(false);
      setTimeout(() => setShowReward(true), 300);
    } else {
      setIsClosing(true);
      setTimeout(onClose, 300);
    }
  }, [currentIndex, achievements.length, onClose]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  // Get short description for mobile
  const getShortDescription = (achievement: Achievement): string => {
    if (achievement.funnyDescription) {
      // Extract the first sentence/phrase before punctuation
      const match = achievement.funnyDescription.match(/^[^!.?]*[!.?]?/);
      return match
        ? match[0].trim()
        : achievement.funnyDescription.slice(0, 50) + "...";
    }

    // Shorten the regular description
    if (achievement.description.length > 40) {
      return achievement.description.slice(0, 40) + "...";
    }

    return achievement.description;
  };

  const getDifficultyEmoji = (difficulty: string): string => {
    switch (difficulty) {
      case "rainbow":
        return "🌈";
      case "diamond":
        return "💎";
      case "gold":
        return "🏆";
      case "silver":
        return "⭐";
      case "bronze":
        return "🎯";
      default:
        return "🎯";
    }
  };

  if (achievements.length === 0) return null;

  const difficultyColor =
    DIFFICULTY_COLORS[currentAchievement?.difficulty] ||
    DIFFICULTY_COLORS.bronze;
  const DifficultyIcon =
    DIFFICULTY_ICONS[currentAchievement?.difficulty] || Trophy;

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3"
        >
          {/* Compact Achievement Toast - Mobile First */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -30 }}
            transition={{ type: "spring", duration: 0.3, damping: 25 }}
            className="relative w-full max-w-[280px] sm:max-w-[320px]"
          >
            <Card
              className={`bg-gradient-to-br ${difficultyColor} text-white shadow-lg border-0 overflow-hidden rounded-xl`}
            >
              {/* Compact Close Button */}
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 text-white/70 hover:text-white hover:bg-white/20 rounded-full z-10 w-5 h-5 p-0"
                aria-label="Close"
              >
                <X className="w-3 h-3" />
              </Button>

              <CardContent className="p-3 text-center relative">
                {/* Compact Achievement Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", duration: 0.3 }}
                  className="text-3xl mb-2 relative flex justify-center"
                >
                  <span>{currentAchievement.icon}</span>
                  <CompactSparkles />
                </motion.div>

                {/* Compact Achievement Details */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Simplified Header */}
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <DifficultyIcon className="w-3 h-3" />
                    <h3 className="text-xs font-bold text-yellow-200">
                      🎉 YAY! 🎉
                    </h3>
                  </div>

                  {/* Short Achievement Name */}
                  <h4 className="text-sm mb-1 font-bold text-white">
                    {currentAchievement.name}
                  </h4>

                  {/* Very Short Description */}
                  <p className="text-white/90 mb-2 text-xs leading-tight">
                    {getShortDescription(currentAchievement)}
                  </p>

                  {/* Minimal Badge */}
                  <Badge className="bg-white/25 text-white border-0 text-xs px-2 py-0.5 rounded-full mb-2">
                    {getDifficultyEmoji(currentAchievement.difficulty)}{" "}
                    {currentAchievement.difficulty.toUpperCase()}
                  </Badge>

                  {/* Compact Reward Display */}
                  {currentAchievement.reward && showReward && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, type: "spring", duration: 0.2 }}
                      className="bg-white/20 rounded-lg p-2 mb-2"
                    >
                      <div className="text-xs font-bold text-yellow-200 mb-1">
                        🎁 REWARD!
                      </div>
                      <div className="text-sm">
                        {currentAchievement.reward.emoji || "🎁"}{" "}
                        {currentAchievement.reward.item.length > 15
                          ? currentAchievement.reward.item.slice(0, 15) + "..."
                          : currentAchievement.reward.item}
                      </div>
                      {currentAchievement.reward.value && (
                        <div className="text-xs text-white/90">
                          +{currentAchievement.reward.value} pts!
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Navigation Dots */}
                  {achievements.length > 1 && (
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {achievements.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            index === currentIndex ? "bg-white" : "bg-white/30"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Compact Action Buttons */}
                  <div className="space-y-1">
                    {showReward &&
                      currentAchievement.reward &&
                      !claimed.has(currentAchievement.id) && (
                        <Button
                          onClick={handleClaimReward}
                          className="w-full bg-white text-gray-800 hover:bg-white/90 font-bold py-1.5 px-3 rounded-lg text-xs"
                        >
                          🎉 CLAIM! 🎉
                        </Button>
                      )}

                    <div className="flex gap-1">
                      <Button
                        onClick={
                          achievements.length > 1 ? handleNext : handleClose
                        }
                        variant="outline"
                        className="flex-1 bg-white/15 text-white border-white/25 hover:bg-white/25 py-1 text-xs"
                      >
                        {currentIndex < achievements.length - 1
                          ? "Next →"
                          : "🚀 COOL! 🚀"}
                      </Button>
                    </div>
                  </div>

                  {/* Auto-close indicator */}
                  <div className="mt-2">
                    <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                      <motion.div
                        className="h-full bg-white/40 rounded-full"
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 2, ease: "linear" }}
                        style={{ transformOrigin: "left" }}
                      />
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      Auto-closing...
                    </div>
                  </div>

                  {/* Achievement Counter */}
                  {achievements.length > 1 && (
                    <div className="text-xs text-white/70 mt-1">
                      {currentIndex + 1}/{achievements.length} 🏆
                    </div>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
