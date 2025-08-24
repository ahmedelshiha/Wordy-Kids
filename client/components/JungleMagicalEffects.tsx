import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface JungleMagicalEffectsProps {
  show: boolean;
  variant?: "fireflies" | "leaves" | "sparkles" | "rainbow";
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export const JungleMagicalEffects: React.FC<JungleMagicalEffectsProps> = ({
  show,
  variant = "fireflies",
  intensity = "medium",
  className = "",
}) => {
  const getEffectCount = () => {
    switch (intensity) {
      case "low": return 8;
      case "high": return 20;
      default: return 12;
    }
  };

  const getEffectEmoji = (variant: string, index: number) => {
    switch (variant) {
      case "fireflies":
        return index % 3 === 0 ? "✨" : index % 3 === 1 ? "🌟" : "💫";
      case "leaves":
        return index % 4 === 0 ? "🍃" : index % 4 === 1 ? "🌿" : index % 4 === 2 ? "🌱" : "🍀";
      case "sparkles":
        return index % 2 === 0 ? "✨" : "⭐";
      case "rainbow":
        return index % 6 === 0 ? "🌈" : index % 6 === 1 ? "⭐" : index % 6 === 2 ? "✨" : 
               index % 6 === 3 ? "🌟" : index % 6 === 4 ? "💫" : "🎨";
      default:
        return "✨";
    }
  };

  const getAnimationDuration = (index: number) => {
    return 2 + (index * 0.2) + Math.random() * 1.5;
  };

  const getRandomPosition = () => {
    return {
      x: Math.random() * 100,
      y: Math.random() * 100,
    };
  };

  return (
    <AnimatePresence>
      {show && (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
          {Array.from({ length: getEffectCount() }, (_, index) => {
            const startPos = getRandomPosition();
            const endPos = getRandomPosition();
            
            return (
              <motion.div
                key={`${variant}-${index}`}
                className="absolute text-lg sm:text-xl z-10"
                initial={{
                  x: `${startPos.x}%`,
                  y: `${startPos.y}%`,
                  scale: 0,
                  opacity: 0,
                  rotate: 0,
                }}
                animate={{
                  x: `${endPos.x}%`,
                  y: `${endPos.y}%`,
                  scale: [0, 1.2, 1, 0.8, 0],
                  opacity: [0, 1, 1, 0.8, 0],
                  rotate: [0, 180, 360],
                }}
                exit={{
                  scale: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: getAnimationDuration(index),
                  delay: index * 0.1,
                  ease: "easeInOut",
                  repeat: variant === "fireflies" ? Infinity : 0,
                  repeatDelay: variant === "fireflies" ? 3 + Math.random() * 2 : 0,
                }}
                style={{
                  filter: variant === "fireflies" ? "drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))" : "none",
                }}
              >
                {getEffectEmoji(variant, index)}
              </motion.div>
            );
          })}

          {/* Additional magical glow overlay for rainbow variant */}
          {variant === "rainbow" && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-pink-200/10 via-purple-200/10 via-blue-200/10 via-green-200/10 to-yellow-200/10 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0.6, 0.3, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            />
          )}

          {/* Soft pulsing glow for fireflies */}
          {variant === "fireflies" && (
            <motion.div
              className="absolute inset-0 bg-yellow-200/5 rounded-xl"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default JungleMagicalEffects;
