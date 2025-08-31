import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  kidFriendlyEffects,
  SOUNDS,
  celebrate,
} from "@/lib/kidFriendlyEffects";

interface TappableZoneProps {
  onTap?: () => void;
  children: React.ReactNode;
  tapEffect?: "bounce" | "pulse" | "shake" | "sparkle" | "rainbow";
  soundEffect?: boolean;
  celebration?: boolean;
  maxTaps?: number;
  className?: string;
}

export const TappableZone: React.FC<TappableZoneProps> = ({
  onTap,
  children,
  tapEffect = "bounce",
  soundEffect = true,
  celebration = false,
  maxTaps = 5,
  className,
}) => {
  const [tapCount, setTapCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTap = () => {
    if (soundEffect) {
      kidFriendlyEffects.playSound(SOUNDS.button_click);
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Special celebration every 5 taps
    if (celebration && newTapCount % maxTaps === 0) {
      celebrate.general(elementRef.current || undefined);
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 2000);
    }

    onTap?.();
  };

  const getAnimationVariants = () => {
    switch (tapEffect) {
      case "bounce":
        return {
          animate: isAnimating
            ? { y: [-5, 0], scale: [1, 1.1, 1] }
            : { y: 0, scale: 1 },
        };
      case "pulse":
        return {
          animate: isAnimating ? { scale: [1, 1.2, 1] } : { scale: 1 },
        };
      case "shake":
        return {
          animate: isAnimating ? { x: [-5, 5, -5, 5, 0] } : { x: 0 },
        };
      case "sparkle":
        return {
          animate: isAnimating
            ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }
            : { scale: 1, rotate: 0 },
        };
      case "rainbow":
        return {
          animate: isAnimating
            ? {
                scale: [1, 1.05, 1],
                rotate: [0, 360],
              }
            : { scale: 1, rotate: 0 },
        };
      default:
        return {
          animate: { scale: 1 },
        };
    }
  };

  return (
    <motion.div
      ref={elementRef}
      className={`cursor-pointer select-none relative ${className}`}
      onClick={handleTap}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...getAnimationVariants()}
      transition={{
        type: "tween",
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      {children}

      {/* Tap counter display */}
      {tapCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-200 to-purple-200 text-purple-800 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-purple-300 shadow-lg"
        >
          {tapCount}
        </motion.div>
      )}

      {/* Sparkle effects */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-400 text-lg"
              style={{
                left: `${20 + i * 10}%`,
                top: `${20 + i * 10}%`,
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
                rotate: [0, 180, 360],
                y: [0, -20, -40],
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                ease: "easeOut",
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TappableZone;
