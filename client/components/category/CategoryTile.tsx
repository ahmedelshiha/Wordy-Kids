import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, Play, Crown, Star, Clock } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  emoji: string;
  wordCount: number;
  masteredCount?: number;
  difficultyMix?: {
    easy: number;
    medium: number;
    hard: number;
  };
  locked?: boolean;
  inProgress?: boolean;
  completed?: boolean;
  recommended?: boolean;
  estimatedTime?: string;
  description?: string;
  crownLevel?: "bronze" | "silver" | "gold" | "rainbow";
  gemsEarned?: number;
}

interface CategoryTileProps {
  category: Category;
  onClick: (category: Category) => void;
  className?: string;
  reducedMotion?: boolean;
  size?: "sm" | "md" | "lg";
}

export const CategoryTile: React.FC<CategoryTileProps> = ({
  category,
  onClick,
  className,
  reducedMotion = false,
  size = "md",
}) => {
  const {
    id,
    name,
    emoji,
    wordCount,
    masteredCount = 0,
    difficultyMix = { easy: 0, medium: 0, hard: 0 },
    locked = false,
    inProgress = false,
    completed = false,
    recommended = false,
    estimatedTime,
    description,
    crownLevel,
    gemsEarned = 0,
  } = category;

  const progress = wordCount > 0 ? (masteredCount / wordCount) * 100 : 0;
  const isAccessible = !locked;

  const getDifficultyColor = () => {
    const total =
      difficultyMix.easy + difficultyMix.medium + difficultyMix.hard;
    if (total === 0) return "bg-gray-300";

    const easyPercent = (difficultyMix.easy / total) * 100;
    if (easyPercent > 70) return "bg-green-400";
    if (easyPercent > 40) return "bg-yellow-400";
    return "bg-red-400";
  };

  const getDifficultyLabel = () => {
    const total =
      difficultyMix.easy + difficultyMix.medium + difficultyMix.hard;
    if (total === 0) return "Beginner";

    const easyPercent = (difficultyMix.easy / total) * 100;
    if (easyPercent > 70) return "Beginner";
    if (easyPercent > 40) return "Intermediate";
    return "Advanced";
  };

  const getCrownEmoji = () => {
    switch (crownLevel) {
      case "bronze":
        return "🥉";
      case "silver":
        return "🥈";
      case "gold":
        return "🥇";
      case "rainbow":
        return "🌈👑";
      default:
        return "👑";
    }
  };

  const getBackgroundGradient = () => {
    if (locked) return "from-gray-200 to-gray-300";
    if (completed) return "from-yellow-200 to-amber-300";
    if (inProgress) return "from-blue-200 to-cyan-300";
    return "from-green-200 to-emerald-300";
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-32 h-32 p-3";
      case "lg":
        return "w-48 h-48 p-6";
      default:
        return "w-40 h-40 p-4";
    }
  };

  const getEmojiSize = () => {
    switch (size) {
      case "sm":
        return "text-3xl";
      case "lg":
        return "text-6xl";
      default:
        return "text-4xl";
    }
  };

  const handleClick = () => {
    if (isAccessible) {
      onClick(category);

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={!reducedMotion && isAccessible ? { scale: 1.05, y: -4 } : {}}
      whileTap={!reducedMotion && isAccessible ? { scale: 0.98 } : {}}
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-lg border-2 border-white/50 group",
        "bg-gradient-to-br",
        getBackgroundGradient(),
        getSizeClasses(),
        "transition-all duration-300 transform",
        "flex flex-col items-center justify-center text-center",
        isAccessible
          ? "cursor-pointer hover:shadow-xl hover:border-white/70"
          : "cursor-not-allowed opacity-60",
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      tabIndex={isAccessible ? 0 : -1}
      role="button"
      aria-label={`${name} category, ${wordCount} words, ${Math.round(progress)}% complete${locked ? " (locked)" : ""}`}
      aria-disabled={locked}
    >
      {/* Hover glow overlay */}
      {!reducedMotion && isAccessible && (
        <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>
      )}

      {/* Status badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {recommended && (
          <Badge className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 animate-pulse">
            ⭐ For You
          </Badge>
        )}
        <Badge
          className={cn("text-white text-xs px-2 py-1", getDifficultyColor())}
        >
          {getDifficultyLabel()}
        </Badge>
        {estimatedTime && (
          <Badge className="bg-white/25 border-white/40 text-gray-700 text-xs px-2 py-1">
            <Clock className="w-3 h-3 mr-1" />
            {estimatedTime}
          </Badge>
        )}
      </div>

      {/* Crown/Status icons */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {locked && (
          <div className="bg-gray-500 text-white rounded-full p-1">
            <Lock className="w-4 h-4" />
          </div>
        )}
        {inProgress && !completed && (
          <div className="bg-blue-500 text-white rounded-full p-1">
            <Play className="w-4 h-4" />
          </div>
        )}
        {completed && (
          <div className="bg-yellow-500 text-white rounded-full p-1">
            <span className="text-sm">{getCrownEmoji()}</span>
          </div>
        )}
      </div>

      {/* Lock overlay for locked categories */}
      {locked && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
          <div className="text-white text-center">
            <Lock className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Locked</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        {/* Emoji mascot */}
        <motion.div
          animate={
            !reducedMotion && isAccessible
              ? {
                  rotate: [0, 3, -3, 0],
                  scale: [1, 1.05, 1],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
          className={cn(
            "mb-2 transition-transform duration-300",
            getEmojiSize(),
            !reducedMotion && isAccessible && "group-hover:scale-110",
          )}
        >
          {emoji}
        </motion.div>

        {/* Category name */}
        <h3 className="font-bold text-gray-800 mb-1 text-sm sm:text-base leading-tight">
          {name}
        </h3>

        {/* Word count */}
        <p className="text-gray-600 text-xs mb-2">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </p>

        {/* Progress section */}
        <div className="w-full space-y-1">
          {/* Progress bar with vine pattern */}
          <div className="relative">
            <Progress value={progress} className="h-2 bg-white/50" />
            {/* Vine overlay pattern */}
            {progress > 0 && (
              <div
                className="absolute top-0 left-0 h-2 bg-green-500 rounded-full opacity-70"
                style={{
                  width: `${progress}%`,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='8' viewBox='0 0 8 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 1c1-1 2-1 3 0s2 1 3 0' stroke='%23ffffff' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "repeat-x",
                  backgroundPosition: "center",
                }}
              />
            )}
          </div>

          {/* Progress text */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">
              {masteredCount}/{wordCount}
            </span>
            <span className="font-bold text-gray-800">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Gems earned */}
        {gemsEarned > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-blue-500">💎</span>
            <span className="text-xs font-bold text-blue-700">
              {gemsEarned}
            </span>
          </div>
        )}

        {/* Description (if provided) */}
        {description && size === "lg" && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Difficulty mix indicator */}
      {difficultyMix.easy + difficultyMix.medium + difficultyMix.hard > 0 && (
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex h-1 rounded-full overflow-hidden bg-white/30">
            {difficultyMix.easy > 0 && (
              <div
                className="bg-green-400"
                style={{
                  width: `${(difficultyMix.easy / (difficultyMix.easy + difficultyMix.medium + difficultyMix.hard)) * 100}%`,
                }}
              />
            )}
            {difficultyMix.medium > 0 && (
              <div
                className="bg-yellow-400"
                style={{
                  width: `${(difficultyMix.medium / (difficultyMix.easy + difficultyMix.medium + difficultyMix.hard)) * 100}%`,
                }}
              />
            )}
            {difficultyMix.hard > 0 && (
              <div
                className="bg-red-400"
                style={{
                  width: `${(difficultyMix.hard / (difficultyMix.easy + difficultyMix.medium + difficultyMix.hard)) * 100}%`,
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Decorative sparkles */}
      {!reducedMotion && (completed || recommended) && (
        <>
          <motion.div
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1 left-1/2 transform -translate-x-1/2 text-yellow-400"
          >
            ✨
          </motion.div>
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-1 right-1 text-yellow-300"
          >
            ⭐
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default CategoryTile;
