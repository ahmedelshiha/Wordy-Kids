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
  TreePine,
  Leaf,
} from "lucide-react";
import { audioService } from "@/lib/audioService";
import { enhancedAudioService } from "@/lib/enhancedAudioService";
import { enhancedRewardCelebration } from "@/lib/enhancedRewardCelebration";
import { enhancedAchievementSystem } from "@/lib/enhancedAchievementSystem";
import type { EnhancedAchievement } from "@/lib/enhancedAchievementSystem";

interface EnhancedAchievementDialogProps {
  achievements: EnhancedAchievement[];
  onClose: () => void;
  onAchievementClaim?: (achievement: EnhancedAchievement) => void;
  autoCloseDelay?: number;
}

const DIFFICULTY_COLORS = {
  bronze: "from-amber-600 via-orange-500 to-amber-700",
  silver: "from-gray-400 via-gray-300 to-slate-500",
  gold: "from-yellow-500 via-yellow-400 to-amber-500",
  diamond: "from-cyan-400 via-blue-500 to-purple-600",
  legendary: "from-purple-600 via-pink-500 to-red-500",
} as const;

const DIFFICULTY_ICONS = {
  bronze: Award,
  silver: Star,
  gold: Crown,
  diamond: Gem,
  legendary: Sparkles,
} as const;

// Jungle Vines Component - Wraps around dialog frame
const JungleVines = React.memo(() => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Top Vines */}
    <motion.div
      className="absolute -top-2 left-4 w-16 h-8 text-green-500 text-2xl"
      animate={{
        rotate: [0, 5, -5, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      🌿
    </motion.div>
    <motion.div
      className="absolute -top-1 right-6 w-12 h-6 text-green-600 text-xl"
      animate={{
        rotate: [0, -3, 3, 0],
        y: [0, -2, 2, 0],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5,
      }}
    >
      🍃
    </motion.div>

    {/* Side Vines */}
    <motion.div
      className="absolute left-0 top-1/4 w-6 h-16 text-green-500 text-lg"
      animate={{
        x: [-2, 2, -2],
        rotate: [0, 8, -8, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      🌱
    </motion.div>
    <motion.div
      className="absolute right-0 top-1/3 w-6 h-16 text-green-600 text-lg"
      animate={{
        x: [2, -2, 2],
        rotate: [0, -8, 8, 0],
      }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
      }}
    >
      🌿
    </motion.div>

    {/* Bottom Vines */}
    <motion.div
      className="absolute -bottom-1 left-8 w-14 h-6 text-green-500 text-xl"
      animate={{
        rotate: [0, 3, -3, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1.5,
      }}
    >
      🍀
    </motion.div>
  </div>
));

// Treasure Chest Component - Opens when achievement unlocks
const TreasureChest = React.memo(
  ({
    isOpen,
    onAnimationComplete,
  }: {
    isOpen: boolean;
    onAnimationComplete?: () => void;
  }) => (
    <motion.div
      className="relative text-6xl"
      initial={{ scale: 0.8, rotate: -10 }}
      animate={{
        scale: isOpen ? [0.8, 1.2, 1] : 0.8,
        rotate: isOpen ? [0, 5, 0] : 0,
      }}
      transition={{
        duration: 0.8,
        type: "tween",
        ease: "easeInOut",
      }}
      onAnimationComplete={onAnimationComplete}
    >
      {isOpen ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          📦✨
        </motion.div>
      ) : (
        "📦"
      )}
    </motion.div>
  ),
);

// Firefly Particle Effects
const FireflyParticles = React.memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 8 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute text-yellow-300 text-sm"
        initial={{
          x: Math.random() * 300,
          y: Math.random() * 400,
          opacity: 0,
        }}
        animate={{
          x: Math.random() * 300,
          y: Math.random() * 400,
          opacity: [0, 1, 0.8, 1, 0],
        }}
        transition={{
          duration: 4 + Math.random() * 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 3,
        }}
      >
        ✨
      </motion.div>
    ))}
  </div>
));

// Jungle Canopy Light Effect
const JungleCanopyLight = React.memo(({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-radial from-yellow-200/20 via-green-200/10 to-transparent" />
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-gradient-radial from-yellow-300/30 to-transparent rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            type: "tween",
          }}
        />
      </motion.div>
    )}
  </AnimatePresence>
));

// Celebration Confetti with Jungle Leaves
const JungleCelebrationConfetti = React.memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 15 }, (_, i) => {
      const emojis = ["🍃", "🌿", "⭐", "✨", "🏆", "🎊", "🌟"];
      const emoji = emojis[i % emojis.length];

      return (
        <motion.div
          key={i}
          className="absolute text-lg"
          initial={{
            x:
              Math.random() *
              (typeof window !== "undefined" ? window.innerWidth : 400),
            y: -50,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: typeof window !== "undefined" ? window.innerHeight + 50 : 600,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            ease: "easeOut",
            delay: Math.random() * 1.5,
          }}
        >
          {emoji}
        </motion.div>
      );
    })}
  </div>
));

// Reward Badge Sparkle Animation
const RewardBadgeSparkle = React.memo(({ show }: { show: boolean }) => (
  <AnimatePresence>
    {show && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {Array.from({ length: 6 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-400 text-lg"
            initial={{
              scale: 0,
              x: 0,
              y: 0,
              opacity: 1,
            }}
            animate={{
              scale: [0, 1.2, 0],
              x: Math.cos((i * Math.PI * 2) / 6) * 60,
              y: Math.sin((i * Math.PI * 2) / 6) * 60,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.1,
              ease: "easeOut",
            }}
          >
            ⭐
          </motion.div>
        ))}
      </div>
    )}
  </AnimatePresence>
));

export function EnhancedAchievementDialog({
  achievements,
  onClose,
  onAchievementClaim,
  autoCloseDelay = 8000,
}: EnhancedAchievementDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTreasure, setShowTreasure] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showCanopyLight, setShowCanopyLight] = useState(false);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [isClosing, setIsClosing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(autoCloseDelay);
  const [isMobile, setIsMobile] = useState(false);

  const currentAchievement = achievements[currentIndex];

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Initialize treasure chest animation sequence
  useEffect(() => {
    if (achievements.length > 0 && !isClosing) {
      const timer = setTimeout(() => {
        setShowTreasure(true);
        // Play jungle ambient sound
        enhancedAudioService.playGameSound?.("achievement-unlock");
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [achievements.length, currentIndex, isClosing]);

  // Canopy light effect after treasure opens
  const handleTreasureAnimationComplete = useCallback(() => {
    setShowCanopyLight(true);
    setShowReward(true);

    // Trigger enhanced reward celebration
    if (currentAchievement) {
      enhancedRewardCelebration.triggerCelebration({
        type: "achievement",
        title: currentAchievement.name,
        description: currentAchievement.description,
        icon: currentAchievement.icon,
        rarity: currentAchievement.difficulty as any,
        duration: 3000,
        animations: {
          primary: "burst",
          particles: ["fireflies", "leaves"],
          background: "jungle_canopy",
          sound: "jungle_triumph",
        },
        colors: currentAchievement.jungleTheme
          ? {
              primary: currentAchievement.jungleTheme.glowColor,
              secondary: "#4CAF50",
              accent: "#FFD700",
              glow: currentAchievement.jungleTheme.glowColor,
            }
          : {
              primary: "#FFD700",
              secondary: "#4CAF50",
              accent: "#FF6B35",
              glow: "#FFD700",
            },
        effects: {
          shake: false,
          zoom: true,
          glow: true,
          particles: true,
          confetti: true,
          fireworks: false,
        },
      });
    }
  }, [currentAchievement]);

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
            setTimeout(onClose, 500);
          }
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [
    achievements.length,
    currentIndex,
    isClosing,
    isPaused,
    autoCloseDelay,
    onClose,
  ]);

  // Pause/resume handlers
  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  // Claim reward handler
  const handleClaimReward = useCallback(() => {
    if (currentAchievement && !claimed.has(currentAchievement.id)) {
      setIsPaused(true);
      setClaimed((prev) => new Set(prev).add(currentAchievement.id));

      // Save to enhanced achievement system
      enhancedAchievementSystem.claimAchievement(currentAchievement.id);

      onAchievementClaim?.(currentAchievement);

      // Play celebration sound
      enhancedAudioService.playGameSound?.("treasure-found");

      // Move to next achievement or close
      if (currentIndex < achievements.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setShowTreasure(false);
          setShowReward(false);
          setShowCanopyLight(false);
          setIsPaused(false);

          // Start next achievement animation
          setTimeout(() => setShowTreasure(true), 300);
        }, 1500);
      } else {
        setTimeout(() => {
          setIsClosing(true);
          setTimeout(onClose, 500);
        }, 2000);
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

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex < achievements.length - 1) {
      setIsPaused(true);
      setCurrentIndex(currentIndex + 1);
      setShowTreasure(false);
      setShowReward(false);
      setShowCanopyLight(false);

      setTimeout(() => {
        setShowTreasure(true);
        setIsPaused(false);
      }, 400);
    } else {
      setIsClosing(true);
      setTimeout(onClose, 500);
    }
  }, [currentIndex, achievements.length, onClose]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(onClose, 500);
  }, [onClose]);

  // Get device-appropriate description
  const getDescription = (achievement: EnhancedAchievement): string => {
    if (isMobile && achievement.description.length > 80) {
      return achievement.description.slice(0, 80) + "...";
    }
    return achievement.description;
  };

  if (achievements.length === 0) return null;

  return (
    <AnimatePresence>
      {!isClosing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            isMobile ? "p-4" : "p-8"
          }`}
        >
          {/* Jungle Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-800/70 to-teal-900/80 backdrop-blur-md" />

          {/* Firefly particles */}
          <FireflyParticles />

          {/* Celebration confetti */}
          {showReward && <JungleCelebrationConfetti />}

          {/* Jungle canopy light effect */}
          <JungleCanopyLight show={showCanopyLight} />

          {/* Main Achievement Dialog */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{
              type: "tween",
              duration: 0.6,
              ease: "easeInOut",
            }}
            className={`relative ${
              isMobile ? "w-full max-w-sm mx-auto" : "w-full max-w-lg mx-auto"
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleMouseEnter}
            onTouchEnd={handleMouseLeave}
          >
            {/* Jungle vines frame */}
            <JungleVines />

            <Card
              className={`bg-gradient-to-br ${difficultyColor} border-4 border-yellow-400/50 shadow-2xl overflow-hidden ${
                isMobile ? "rounded-3xl" : "rounded-4xl"
              }`}
            >
              {/* Close Button */}
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20 rounded-full z-20 transition-colors"
                aria-label="Close achievement dialog"
              >
                <X className="w-4 h-4" />
              </Button>

              <CardContent
                className={`text-center relative ${isMobile ? "p-6" : "p-8"} text-white`}
              >
                {/* Header with trophy icon */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-2 mb-4"
                >
                  <Trophy
                    className={`text-yellow-300 ${isMobile ? "w-6 h-6" : "w-8 h-8"}`}
                  />
                  <h1
                    className={`font-bold text-yellow-200 ${isMobile ? "text-lg" : "text-2xl"}`}
                  >
                    🎉 Achievement Unlocked! 🎉
                  </h1>
                  <TreePine
                    className={`text-green-300 ${isMobile ? "w-6 h-6" : "w-8 h-8"}`}
                  />
                </motion.div>

                {/* Treasure chest with achievement icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.1,
                    type: "tween",
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                  className={`relative flex flex-col items-center ${isMobile ? "mb-4" : "mb-6"}`}
                >
                  <TreasureChest
                    isOpen={showTreasure}
                    onAnimationComplete={handleTreasureAnimationComplete}
                  />

                  {/* Achievement icon emerges from chest */}
                  <AnimatePresence>
                    {showReward && (
                      <motion.div
                        initial={{ scale: 0, y: 20 }}
                        animate={{ scale: 1, y: -10 }}
                        transition={{
                          type: "tween",
                          duration: 0.6,
                          delay: 0.3,
                          ease: "easeOut",
                        }}
                        className={`absolute ${isMobile ? "text-4xl" : "text-6xl"} z-10`}
                      >
                        <span>{currentAchievement.icon}</span>
                        <RewardBadgeSparkle show={true} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Achievement details */}
                <AnimatePresence>
                  {showReward && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-4"
                    >
                      {/* Achievement name */}
                      <h2
                        className={`font-bold text-yellow-200 ${isMobile ? "text-xl" : "text-3xl"}`}
                      >
                        {currentAchievement.name}
                      </h2>

                      {/* Achievement description */}
                      <p
                        className={`text-white/90 leading-relaxed ${isMobile ? "text-sm px-2" : "text-lg px-4"}`}
                      >
                        {getDescription(currentAchievement)}
                      </p>

                      {/* Difficulty badge */}
                      <div className="flex justify-center">
                        <Badge className="bg-white/25 text-white border-yellow-400 px-4 py-2 text-sm font-bold rounded-full">
                          <DifficultyIcon className="w-4 h-4 mr-2" />
                          {currentAchievement.difficulty.toUpperCase()} TIER
                        </Badge>
                      </div>

                      {/* Reward details */}
                      {currentAchievement.reward && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.7 }}
                          className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mx-2"
                        >
                          <div className="text-yellow-200 font-bold mb-2 flex items-center justify-center gap-2">
                            <Gift className="w-5 h-5" />
                            Jungle Treasure Reward!
                            <Leaf className="w-5 h-5" />
                          </div>
                          <div
                            className={`text-white font-semibold ${isMobile ? "text-sm" : "text-lg"}`}
                          >
                            {currentAchievement.reward.item}
                          </div>
                          {currentAchievement.reward.value > 0 && (
                            <div className="text-yellow-300 text-sm mt-1">
                              +{currentAchievement.reward.value} Adventure
                              Points!
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Progress indicators for multiple achievements */}
                      {achievements.length > 1 && (
                        <div className="flex justify-center gap-2">
                          {achievements.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentIndex
                                  ? "bg-yellow-300"
                                  : "bg-white/30"
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="space-y-3 pt-2">
                        {/* Claim button */}
                        {currentAchievement.reward &&
                          !claimed.has(currentAchievement.id) && (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.8 }}
                            >
                              <Button
                                onClick={handleClaimReward}
                                className="w-full bg-yellow-500 hover:bg-yellow-400 text-yellow-900 font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
                              >
                                <Zap className="w-5 h-5 mr-2" />
                                Claim Jungle Treasure!
                                <Sparkles className="w-5 h-5 ml-2" />
                              </Button>
                            </motion.div>
                          )}

                        {/* Navigation buttons */}
                        <div className="flex gap-3">
                          {achievements.length > 1 && currentIndex > 0 && (
                            <Button
                              onClick={() => setCurrentIndex(currentIndex - 1)}
                              variant="outline"
                              className="flex-1 bg-white/15 text-white border-white/25 hover:bg-white/25"
                            >
                              ← Previous
                            </Button>
                          )}

                          <Button
                            onClick={
                              achievements.length > 1 ? handleNext : handleClose
                            }
                            variant="outline"
                            className="flex-1 bg-white/15 text-white border-white/25 hover:bg-white/25"
                          >
                            {currentIndex < achievements.length - 1
                              ? "Next Adventure →"
                              : "Continue Journey! 🚀"}
                          </Button>
                        </div>
                      </div>

                      {/* Auto-close indicator */}
                      {autoCloseDelay > 0 && !isPaused && timeRemaining > 0 && (
                        <div className="text-center">
                          <div className="text-xs text-white/60 mb-2">
                            Auto-closing in {Math.ceil(timeRemaining / 1000)}s
                            <div className="text-xs text-white/40">
                              (hover to pause)
                            </div>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-1 mx-auto overflow-hidden">
                            <motion.div
                              className="bg-yellow-400/80 h-1 rounded-full"
                              initial={{ scaleX: 1 }}
                              animate={{
                                scaleX: timeRemaining / autoCloseDelay,
                              }}
                              transition={{ duration: 0.1, ease: "linear" }}
                              style={{ transformOrigin: "left" }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Achievement counter */}
                      {achievements.length > 1 && (
                        <div className="text-sm text-white/70">
                          Achievement {currentIndex + 1} of{" "}
                          {achievements.length}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
