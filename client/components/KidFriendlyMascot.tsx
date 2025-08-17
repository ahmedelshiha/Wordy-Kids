import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface KidFriendlyMascotProps {
  mood?: "happy" | "excited" | "encouraging" | "celebrating";
  size?: "small" | "medium" | "large";
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  message?: string;
  showMessage?: boolean;
  onClick?: () => void;
}

export const KidFriendlyMascot: React.FC<KidFriendlyMascotProps> = ({
  mood = "happy",
  size = "medium",
  position = "top-right",
  message,
  showMessage = false,
  onClick,
}) => {
  const [currentMascot, setCurrentMascot] = useState("🦸‍♂️");
  const [isAnimating, setIsAnimating] = useState(false);

  const mascots = {
    happy: ["😊", "😄", "🥳", "🌟", "💫"],
    excited: ["🚀", "⚡", "🎉", "🌈", "✨"],
    encouraging: ["💪", "👍", "🌟", "🎯", "🏆"],
    celebrating: ["🎊", "🎉", "🏆", "🎈", "🥳"],
  };

  const sizeClasses = {
    small: "text-2xl w-8 h-8",
    medium: "text-4xl w-12 h-12",
    large: "text-6xl w-16 h-16",
  };

  const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
    center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const moodMascots = mascots[mood];
      const randomMascot =
        moodMascots[Math.floor(Math.random() * moodMascots.length)];
      setCurrentMascot(randomMascot);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [mood]);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    if (onClick) onClick();
  };

  return (
    <div className={`absolute ${positionClasses[position]} z-20`}>
      <motion.div
        className={`
          ${sizeClasses[size]} 
          flex items-center justify-center 
          cursor-pointer select-none
          ${isAnimating ? "animate-bounce" : ""}
        `}
        onClick={handleClick}
        whileHover={{ scale: 1.2, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -5, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        {currentMascot}
      </motion.div>

      {/* Fun message bubble */}
      <AnimatePresence>
        {showMessage && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 10 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 text-xs font-bold px-3 py-2 rounded-xl border-2 border-orange-300 shadow-lg whitespace-nowrap"
          >
            {message}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-200 border-l-2 border-t-2 border-orange-300 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KidFriendlyMascot;
