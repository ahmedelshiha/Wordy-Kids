import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Crown, Gem, Award, X } from "lucide-react";
import { audioService } from "@/lib/audioService";

interface Achievement {
  id: string;
  name: string;
  description: string;
  funnyDescription?: string;
  icon: string;
  category: string;
  difficulty: "bronze" | "silver" | "gold" | "diamond" | "rainbow";
  reward?: {
    type: string;
    item: string;
    value?: number;
    emoji?: string;
  };
}

interface CompactAchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const DIFFICULTY_COLORS = {
  bronze: "from-amber-200 via-orange-300 to-yellow-300", // 🌱 Seed theme
  silver: "from-emerald-200 via-green-300 to-teal-300", // 🌿 Sprout theme
  gold: "from-yellow-200 via-orange-300 to-amber-300", // 🌻 Bloom theme
  diamond: "from-emerald-300 via-teal-400 to-cyan-300", // 🌳 Tree theme
  rainbow: "from-pink-300 via-purple-300 to-blue-300", // 🌈 Legend theme
} as const;

const DIFFICULTY_ICONS = {
  bronze: Award,
  silver: Star,
  gold: Crown,
  diamond: Gem,
  rainbow: Trophy,
} as const;

export function CompactAchievementToast({
  achievement,
  onClose,
  autoClose = true,
  autoCloseDelay = 2000,
}: CompactAchievementToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Auto-close functionality
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(onClose, 300);
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  // Play achievement sound only for specific achievements, not automatically
  // Removed automatic sound to prevent unexpected "Great job!" audio

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const DifficultyIcon = DIFFICULTY_ICONS[achievement.difficulty] || Trophy;
  const difficultyColor =
    DIFFICULTY_COLORS[achievement.difficulty] || DIFFICULTY_COLORS.bronze;

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

  const getShortName = (name: string): string => {
    return name.length > 25 ? name.slice(0, 25) + "..." : name;
  };

  return (
    <AnimatePresence>
      {isVisible && !isClosing && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.4, damping: 20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-[300px]"
        >
          <div
            className={`bg-gradient-to-r ${difficultyColor} text-gray-800 rounded-xl shadow-lg border-0 overflow-hidden`}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-1 right-1 text-gray-700 hover:text-gray-900 z-10 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/40 transition-colors"
              aria-label="Close"
            >
              <X className="w-3 h-3" />
            </button>

            <div className="p-3 text-center relative">
              {/* Achievement icon with sparkle */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", duration: 0.3 }}
                className="text-2xl mb-1 relative"
              >
                {achievement.icon}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="absolute -top-1 -right-1 text-yellow-300 text-xs"
                >
                  ✨
                </motion.div>
              </motion.div>

              {/* Quick achievement header */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DifficultyIcon className="w-3 h-3" />
                  <span className="text-xs font-bold text-yellow-200">
                    🎉 Achievement! 🎉
                  </span>
                </div>

                {/* Achievement name */}
                <h4 className="text-sm font-bold text-emerald-700 mb-1">
                  {getShortName(achievement.name)}
                </h4>

                {/* Compact badge */}
                <Badge className="bg-white/25 text-white border-0 text-xs px-2 py-0.5 rounded-full mb-2">
                  {getDifficultyEmoji(achievement.difficulty)}{" "}
                  {achievement.difficulty.toUpperCase()}
                </Badge>

                {/* Reward preview */}
                {achievement.reward && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/20 rounded-lg p-1.5 mb-2"
                  >
                    <div className="text-xs font-bold text-yellow-200">
                      🎁 {achievement.reward.emoji || "🎁"}{" "}
                      {achievement.reward.item.slice(0, 20)}
                      {achievement.reward.item.length > 20 ? "..." : ""}
                    </div>
                    {achievement.reward.value && (
                      <div className="text-xs text-white/90">
                        +{achievement.reward.value} pts!
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Auto-close progress bar */}
                {autoClose && (
                  <div className="mt-2">
                    <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                      <motion.div
                        className="h-full bg-white/40 rounded-full"
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{
                          duration: autoCloseDelay / 1000,
                          ease: "linear",
                        }}
                        style={{ transformOrigin: "left" }}
                      />
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      Auto-closing...
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
