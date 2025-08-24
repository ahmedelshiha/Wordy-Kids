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
  bronze: "from-amber-200 via-orange-300 to-yellow-300", // 🌱 Seed theme - warm sunrise
  silver: "from-emerald-200 via-green-300 to-teal-300", // 🌿 Sprout theme - fresh growth
  gold: "from-yellow-200 via-orange-300 to-amber-300", // 🌻 Bloom theme - bright flowers
  diamond: "from-emerald-300 via-teal-400 to-cyan-300", // 🌳 Tree theme - majestic canopy
  rainbow: "from-pink-300 via-purple-300 via-blue-300 via-green-300 via-yellow-300 to-orange-300", // 🌈 Legend theme - magical aurora
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
  autoCloseDelay = 2000, // Default 2 seconds for mobile
}: EnhancedAchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [isClosing, setIsClosing] = useState(false);
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(autoCloseDelay);

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

  // Initialize reward animation (removed automatic sound)
  useEffect(() => {
    if (achievements.length > 0 && !isClosing) {
      const timer = setTimeout(() => setShowReward(true), 800);
      return () => clearTimeout(timer);
    }
  }, [achievements.length, currentIndex, isClosing]);

  // Auto-close timer management
  useEffect(() => {
    if (
      achievements.length > 0 &&
      !isClosing &&
      !isPaused &&
      autoCloseDelay > 0
    ) {
      setTimeRemaining(autoCloseDelay);

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, autoCloseDelay - elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          if (!isPaused) {
            setIsClosing(true);
            setTimeout(onClose, 300);
          }
        }
      }, 100); // Update every 100ms for smooth progress

      setAutoCloseTimer(interval as any);

      return () => {
        clearInterval(interval);
      };
    }
  }, [
    achievements.length,
    currentIndex,
    isClosing,
    isPaused,
    autoCloseDelay,
    onClose,
  ]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
      }
    };
  }, [autoCloseTimer]);

  // Pause auto-close when user hovers or interacts
  const handleMouseEnter = useCallback(() => {
    setIsPaused(true);
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
    }
  }, [autoCloseTimer]);

  const handleMouseLeave = useCallback(() => {
    setIsPaused(false);
    // Auto-close timer will restart via useEffect
  }, []);

  const handleClaimReward = useCallback(() => {
    if (currentAchievement && !claimed.has(currentAchievement.id)) {
      // Pause auto-close when claiming
      setIsPaused(true);
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        setAutoCloseTimer(null);
      }

      setClaimed((prev) => new Set(prev).add(currentAchievement.id));
      onAchievementClaim?.(currentAchievement);
      audioService.playCheerSound();

      // Move to next achievement or close
      if (currentIndex < achievements.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setShowReward(false);
          setIsPaused(false); // Resume auto-close for next achievement
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
    autoCloseTimer,
  ]);

  const handleNext = useCallback(() => {
    if (currentIndex < achievements.length - 1) {
      // Temporarily pause auto-close during navigation
      setIsPaused(true);
      setCurrentIndex(currentIndex + 1);
      setShowReward(false);
      setTimeout(() => {
        setShowReward(true);
        setIsPaused(false); // Resume auto-close for new achievement
      }, 400);
    } else {
      setIsClosing(true);
      setTimeout(onClose, 300);
    }
  }, [currentIndex, achievements.length, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      // Temporarily pause auto-close during navigation
      setIsPaused(true);
      setCurrentIndex(currentIndex - 1);
      setShowReward(false);
      setTimeout(() => {
        setShowReward(true);
        setIsPaused(false); // Resume auto-close for new achievement
      }, 400);
    }
  }, [currentIndex]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  }, [onClose]);

  // Get short description for mobile
  const getShortDescription = (achievement: Achievement): string => {
    const fullDescription =
      achievement.funnyDescription ||
      EnhancedAchievementTracker.getKidFriendlyDescription(achievement.id) ||
      achievement.description;

    // For mobile, keep it very short
    if (fullDescription.length > 60) {
      // Try to find a natural break point
      const match = fullDescription.match(/^[^!.?]*[!.?]?/);
      if (match && match[0].length <= 60) {
        return match[0].trim();
      }
      return fullDescription.slice(0, 60) + "...";
    }

    return fullDescription;
  };

  if (achievements.length === 0) return null;

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-emerald-100/80 via-green-200/70 to-yellow-100/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <CelebrationParticles />

          {/* Main Achievement Card - Mobile Optimized */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", duration: 0.4, damping: 20 }}
            className="relative w-full max-w-[280px] sm:max-w-[320px] mx-2 sm:mx-4"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseEnter}
            onTouchEnd={handleMouseLeave}
          >
            <Card
              className={`bg-gradient-to-br ${difficultyColor} text-gray-800 shadow-xl border-4 border-white/50 overflow-hidden rounded-2xl backdrop-blur-sm`}
            >
              {/* Close Button - Smaller for mobile */}
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 hover:bg-white/40 rounded-full z-10 transition-colors w-6 h-6 p-0"
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
                    <DifficultyIcon className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                    <h3 className="text-sm sm:text-base font-bold animate-bounce text-emerald-800">
                      🎉 AMAZING! 🎉
                    </h3>
                  </div>

                  <h4 className="text-sm sm:text-base mb-2 font-bold text-emerald-700">
                    {currentAchievement.name.length > 20
                      ? currentAchievement.name.slice(0, 20) + "..."
                      : currentAchievement.name}
                  </h4>

                  <p className="text-gray-700 mb-3 text-xs sm:text-sm leading-tight px-1">
                    {getShortDescription(currentAchievement)}
                  </p>

                  {/* Simplified Badges for mobile */}
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Badge className="bg-white/60 text-emerald-800 border-0 text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
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
                          className="bg-white/60 rounded-xl p-2 mb-3 border-2 border-white/70 shadow-lg"
                        >
                          <div className="text-xs font-bold text-emerald-700 mb-1 animate-pulse">
                            🎁 TREASURE FOUND! 🎁
                          </div>
                          <div className="text-sm font-bold text-gray-800">
                            {currentAchievement.reward.emoji || "🎁"}{" "}
                            {currentAchievement.reward.item.length > 15
                              ? currentAchievement.reward.item.slice(0, 15) +
                                "..."
                              : currentAchievement.reward.item}
                          </div>
                          {currentAchievement.reward.type === "sticker" && (
                            <div className="text-xs text-white/90 animate-bounce mt-1">
                              ✨ Sticker added! ✨
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
                            🎉 CLAIM! 🎉
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

                  {/* Auto-close progress indicator */}
                  {autoCloseDelay > 0 && !isPaused && timeRemaining > 0 && (
                    <div className="mt-2 mb-1">
                      <div className="text-center mb-1">
                        <div className="text-xs text-white/60">
                          Auto-closing in {Math.ceil(timeRemaining / 1000)}s
                        </div>
                        <div className="text-xs text-white/40 hidden sm:block">
                          (tap to pause)
                        </div>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1 mx-auto overflow-hidden">
                        <motion.div
                          className="bg-white/60 h-1 rounded-full w-full"
                          initial={{ scaleX: 1 }}
                          animate={{
                            scaleX:
                              autoCloseDelay > 0
                                ? timeRemaining / autoCloseDelay
                                : 0,
                          }}
                          transition={{ duration: 0.1, ease: "linear" }}
                          style={{ transformOrigin: "left" }}
                        />
                      </div>
                    </div>
                  )}

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
