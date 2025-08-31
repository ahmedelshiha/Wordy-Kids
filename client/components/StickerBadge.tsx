import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StickerBadgeProps {
  type:
    | "star"
    | "trophy"
    | "heart"
    | "rocket"
    | "rainbow"
    | "diamond"
    | "crown"
    | "fire";
  size?: "small" | "medium" | "large";
  color?: "gold" | "silver" | "rainbow" | "pink" | "blue" | "green" | "purple";
  glowing?: boolean;
  animated?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const StickerBadge: React.FC<StickerBadgeProps> = ({
  type,
  size = "medium",
  color = "gold",
  glowing = false,
  animated = true,
  children,
  className,
  onClick,
}) => {
  const stickerEmojis = {
    star: "⭐",
    trophy: "🏆",
    heart: "💖",
    rocket: "🚀",
    rainbow: "🌈",
    diamond: "💎",
    crown: "👑",
    fire: "🔥",
  };

  const sizeClasses = {
    small: "w-8 h-8 text-xl",
    medium: "w-12 h-12 text-3xl",
    large: "w-16 h-16 text-5xl",
  };

  const colorClasses = {
    gold: "bg-gradient-to-br from-yellow-200 via-yellow-300 to-orange-300 border-yellow-400",
    silver:
      "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 border-gray-500",
    rainbow:
      "bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 border-purple-400",
    pink: "bg-gradient-to-br from-pink-200 via-pink-300 to-rose-300 border-pink-400",
    blue: "bg-gradient-to-br from-blue-200 via-blue-300 to-cyan-300 border-blue-400",
    green:
      "bg-gradient-to-br from-green-200 via-green-300 to-emerald-300 border-green-400",
    purple:
      "bg-gradient-to-br from-purple-200 via-purple-300 to-violet-300 border-purple-400",
  };

  const glowClasses = {
    gold: "shadow-lg shadow-yellow-300/50",
    silver: "shadow-lg shadow-gray-300/50",
    rainbow: "shadow-lg shadow-purple-300/50",
    pink: "shadow-lg shadow-pink-300/50",
    blue: "shadow-lg shadow-blue-300/50",
    green: "shadow-lg shadow-green-300/50",
    purple: "shadow-lg shadow-purple-300/50",
  };

  return (
    <motion.div
      className={cn(
        "inline-flex items-center justify-center rounded-full border-3 relative overflow-hidden",
        sizeClasses[size],
        colorClasses[color],
        glowing && glowClasses[color],
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
      whileHover={
        animated
          ? {
              scale: 1.1,
              rotate: [0, -5, 5, 0],
              transition: { type: "tween", duration: 0.3, ease: "easeInOut" },
            }
          : undefined
      }
      whileTap={animated ? { scale: 0.95 } : undefined}
      animate={
        animated
          ? {
              y: [0, -2, 0],
              rotate: [0, 1, -1, 0],
            }
          : undefined
      }
      transition={
        animated
          ? {
              type: "tween",
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }
          : undefined
      }
    >
      {/* Sparkle effects */}
      {glowing && (
        <>
          <motion.div
            className="absolute -top-1 -right-1 text-yellow-400 text-xs"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0,
            }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute -bottom-1 -left-1 text-yellow-400 text-xs"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
            }}
          >
            ✨
          </motion.div>
        </>
      )}

      {/* Main sticker emoji */}
      <span className="relative z-10">{stickerEmojis[type]}</span>

      {/* Optional children content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          {children}
        </div>
      )}

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

// Preset sticker combinations for common achievements
export const StickerPresets = {
  FirstWord: () => <StickerBadge type="star" color="gold" glowing animated />,
  StreakFire: () => (
    <StickerBadge type="fire" color="rainbow" glowing animated />
  ),
  LevelUp: () => <StickerBadge type="crown" color="gold" glowing animated />,
  Perfect: () => (
    <StickerBadge type="diamond" color="rainbow" glowing animated />
  ),
  Rocket: () => <StickerBadge type="rocket" color="blue" glowing animated />,
  Heart: () => <StickerBadge type="heart" color="pink" glowing animated />,
  Trophy: () => <StickerBadge type="trophy" color="gold" glowing animated />,
  Rainbow: () => (
    <StickerBadge type="rainbow" color="rainbow" glowing animated />
  ),
};

export default StickerBadge;
