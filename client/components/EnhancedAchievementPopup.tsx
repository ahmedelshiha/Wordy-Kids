import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Star,
  Sparkles,
  Gift,
  X,
  Crown,
  Gem,
  Award,
  Zap,
} from "lucide-react";
import { audioService } from "@/lib/audioService";
import { EnhancedAchievementTracker } from "@/lib/enhancedAchievementTracker";

interface Achievement {
  id: string;
  name: string;
  description: string;
  funnyDescription?: string; // Kid-friendly version
  icon: string;
  category:
    | "learning"
    | "streak"
    | "quiz"
    | "exploration"
    | "social"
    | "journey";
  difficulty: "bronze" | "silver" | "gold" | "diamond";
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
  criteria?: Array<{
    type: string;
    target: number;
    operator?: string;
    timeFrame?: string;
  }>;
}

interface EnhancedAchievementPopupProps {
  achievements: Achievement[];
  onClose: () => void;
  onAchievementClaim?: (achievement: Achievement) => void;
  autoCloseDelay?: number; // Auto-close delay in milliseconds (default: 8000ms = 8 seconds)
}

const DIFFICULTY_COLORS = {
  bronze: "from-orange-400 to-amber-600",
  silver: "from-gray-300 to-gray-500",
  gold: "from-yellow-400 to-yellow-600",
  diamond: "from-blue-400 to-purple-600",
  rainbow:
    "from-pink-400 via-purple-400 via-blue-400 via-green-400 via-yellow-400 to-red-400",
} as const;

const DIFFICULTY_ICONS = {
  bronze: Award,
  silver: Star,
  gold: Crown,
  diamond: Gem,
  rainbow: Sparkles,
} as const;

const CATEGORY_COLORS = {
  learning: "bg-educational-blue",
  journey: "bg-educational-purple",
  streak: "bg-educational-orange",
  quiz: "bg-educational-green",
  exploration: "bg-educational-pink",
  social: "bg-gray-500",
  difficulty: "bg-gradient-to-r from-green-400 to-blue-500",
  session: "bg-gradient-to-r from-purple-400 to-pink-500",
} as const;

// Memoized celebration particles component
const CelebrationParticles = React.memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 12 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute text-yellow-400 text-xl"
        initial={{
          x:
            typeof window !== "undefined"
              ? Math.random() * window.innerWidth
              : 400,
          y: typeof window !== "undefined" ? window.innerHeight + 50 : 600,
          rotate: 0,
          opacity: 0,
        }}
        animate={{
          y: -50,
          rotate: 360,
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 2.5 + Math.random() * 1.5,
          delay: Math.random() * 1.5,
          repeat: Infinity,
          repeatDelay: 4 + Math.random() * 3,
        }}
      >
        ⭐
      </motion.div>
    ))}
  </div>
));

// Memoized sparkle effects component
const SparkleEffects = React.memo(({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <>
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-300 text-base"
            initial={{
              scale: 0,
              x: 0,
              y: 0,
              opacity: 1,
            }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos((i * Math.PI * 2) / 6) * 50,
              y: Math.sin((i * Math.PI * 2) / 6) * 50,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 1.2,
              delay: i * 0.08,
            }}
          >
            ✨
          </motion.div>
        ))}
      </>
    )}
  </AnimatePresence>
));

export function EnhancedAchievementPopup({
  achievements,
  onClose,
  onAchievementClaim,
}: EnhancedAchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [isClosing, setIsClosing] = useState(false);

  const currentAchievement = achievements[currentIndex];

  // Memoized computed values
  const difficultyColor = useMemo(
    () =>
      DIFFICULTY_COLORS[currentAchievement?.difficulty] ||
      DIFFICULTY_COLORS.bronze,
    [currentAchievement?.difficulty],
  );

  const DifficultyIcon = useMemo(
    () => DIFFICULTY_ICONS[currentAchievement?.difficulty] || Trophy,
    [currentAchievement?.difficulty],
  );

  const categoryColor = useMemo(
    () =>
      CATEGORY_COLORS[currentAchievement?.category] || CATEGORY_COLORS.social,
    [currentAchievement?.category],
  );

  // Initialize sound and reward animation
  useEffect(() => {
    if (achievements.length > 0 && !isClosing) {
      audioService.playSuccessSound();
      const timer = setTimeout(() => setShowReward(true), 800);
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
          setTimeout(() => setShowReward(true), 800);
        }, 1200);
      } else {
        setTimeout(() => {
          setIsClosing(true);
          setTimeout(onClose, 300);
        }, 1500);
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
      setTimeout(() => setShowReward(true), 400);
    } else {
      setIsClosing(true);
      setTimeout(onClose, 300);
    }
  }, [currentIndex, achievements.length, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowReward(false);
      setTimeout(() => setShowReward(true), 400);
    }
  }, [currentIndex]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  if (achievements.length === 0) return null;

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <CelebrationParticles />

          {/* Main Achievement Card - Mobile Optimized */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", duration: 0.4, damping: 20 }}
            className="relative w-full max-w-xs sm:max-w-sm mx-2 sm:mx-4"
          >
            <Card
              className={`bg-gradient-to-br ${difficultyColor} text-white shadow-xl border-0 overflow-hidden rounded-2xl`}
            >
              {/* Close Button - Smaller for mobile */}
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full z-10 transition-colors w-6 h-6 p-0"
                aria-label="Close achievement popup"
              >
                <X className="w-3 h-3" />
              </Button>

              <CardContent className="p-3 sm:p-4 text-center relative">
                {/* Achievement Icon with Animation - Smaller for mobile */}
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", duration: 0.4 }}
                  className="text-4xl sm:text-5xl mb-2 relative flex justify-center"
                >
                  <span>{currentAchievement.icon}</span>
                  <SparkleEffects show={showReward} />
                </motion.div>

                {/* Achievement Details - Compact for mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <DifficultyIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <h3 className="text-sm sm:text-base font-bold animate-bounce">
                      🎉 WOW! 🎉
                    </h3>
                  </div>

                  <h4 className="text-sm sm:text-base mb-2 font-bold text-yellow-200">
                    {currentAchievement.name}
                  </h4>

                  <p className="text-white/90 mb-3 text-xs sm:text-sm leading-tight px-1">
                    {currentAchievement.funnyDescription ||
                      EnhancedAchievementTracker.getKidFriendlyDescription(
                        currentAchievement.id,
                      ) ||
                      currentAchievement.description}
                  </p>

                  {/* Simplified Badges for mobile */}
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Badge className="bg-white/25 text-white border-0 text-xs px-2 py-0.5 rounded-full">
                      {currentAchievement.difficulty === "rainbow"
                        ? "🌈 ULTIMATE"
                        : currentAchievement.difficulty === "diamond"
                          ? "💎 RARE"
                          : currentAchievement.difficulty === "gold"
                            ? "🏆 SUPER"
                            : currentAchievement.difficulty === "silver"
                              ? "⭐ COOL"
                              : "🎯 YAY"}
                    </Badge>
                  </div>

                  {/* Hidden criteria for mobile - too much text */}

                  {/* Compact Reward Display for mobile */}
                  {currentAchievement.reward && (
                    <AnimatePresence>
                      {showReward && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            delay: 0.3,
                            type: "spring",
                            duration: 0.3,
                          }}
                          className="bg-white/20 rounded-xl p-2 mb-3"
                        >
                          <div className="text-xs font-bold text-yellow-200 mb-1 animate-pulse">
                            🎁 REWARD TIME! 🎁
                          </div>
                          <div className="text-sm font-bold">
                            {currentAchievement.reward.emoji || "🎁"}{" "}
                            {currentAchievement.reward.item}
                          </div>
                          {currentAchievement.reward.type === "sticker" && (
                            <div className="text-xs text-white/90 animate-bounce mt-1">
                              ✨ Sticker added! ✨
                            </div>
                          )}
                          {currentAchievement.reward.type === "badge" && (
                            <div className="text-xs text-white/90 animate-pulse mt-1">
                              🏅 Badge earned! 🏅
                            </div>
                          )}
                          {currentAchievement.reward.value && (
                            <div className="text-xs text-white/90 mt-1">
                              +{currentAchievement.reward.value} points!
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {/* Simplified Navigation Dots for mobile */}
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
                  <div className="space-y-1.5">
                    {showReward &&
                      currentAchievement.reward &&
                      !claimed.has(currentAchievement.id) && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <Button
                            onClick={handleClaimReward}
                            className="w-full bg-white text-gray-800 hover:bg-white/90 font-bold py-2 px-3 rounded-lg shadow-lg transition-colors text-sm"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            🎉 GET IT! 🎉
                          </Button>
                        </motion.div>
                      )}

                    <div className="flex gap-1.5">
                      {achievements.length > 1 && currentIndex > 0 && (
                        <Button
                          onClick={handlePrevious}
                          variant="outline"
                          className="flex-1 bg-white/15 text-white border-white/25 hover:bg-white/25 transition-colors py-1.5 text-xs"
                        >
                          ← Back
                        </Button>
                      )}

                      <Button
                        onClick={
                          achievements.length > 1 ? handleNext : handleClose
                        }
                        variant="outline"
                        className="flex-1 bg-white/15 text-white border-white/25 hover:bg-white/25 transition-colors py-1.5 text-xs"
                      >
                        {currentIndex < achievements.length - 1
                          ? "Next →"
                          : "🚀 AWESOME! 🚀"}
                      </Button>
                    </div>
                  </div>

                  {/* Simplified Achievement Counter */}
                  {achievements.length > 1 && (
                    <div className="text-xs text-white/70 mt-1">
                      {currentIndex + 1} of {achievements.length} 🏆
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
