import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { audioService } from "@/lib/audioService";
import "./jungle-achievement-popup.css";

interface AchievementPopupProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  difficulty?: "bronze" | "silver" | "gold" | "diamond" | "rainbow";
  onClose?: () => void;
  autoCloseDelay?: number;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({
  title = "You did it!",
  message = "New badge unlocked!",
  icon = <Trophy className="text-yellow-400 w-12 h-12" />,
  difficulty = "bronze",
  onClose,
  autoCloseDelay = 3000,
}) => {
  const [visible, setVisible] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Play gentle jungle cheer sound
    audioService.playCheerSound?.();
    
    // Show confetti after a brief delay
    const confettiTimer = setTimeout(() => {
      setShowConfetti(true);
    }, 200);

    // Auto dismiss after specified delay
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    }, autoCloseDelay);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(dismissTimer);
    };
  }, [onClose, autoCloseDelay]);

  const getDifficultyEmoji = (diff: string): string => {
    switch (diff) {
      case "bronze": return "🥉";
      case "silver": return "🥈";
      case "gold": return "🥇";
      case "diamond": return "💎";
      case "rainbow": return "🌈";
      default: return "🏆";
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="achievement-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`achievement-popup achievement-popup--${difficulty}`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ 
              type: "spring", 
              duration: 0.4,
              damping: 15,
              stiffness: 300
            }}
          >
            {/* Jungle Vines Frame */}
            <div className="jungle-vines-frame">
              <div className="vine vine--top-left">🌿</div>
              <div className="vine vine--top-right">🍃</div>
              <div className="vine vine--bottom-left">🌱</div>
              <div className="vine vine--bottom-right">🌿</div>
            </div>

            {/* Fireflies */}
            <div className="fireflies">
              <div className="firefly firefly--1">✨</div>
              <div className="firefly firefly--2">✨</div>
              <div className="firefly firefly--3">✨</div>
            </div>

            {/* Main Content */}
            <div className="popup-content">
              {/* Trophy Icon with Badge */}
              <motion.div 
                className="popup-icon-container"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  delay: 0.1,
                  duration: 0.5,
                  damping: 10
                }}
              >
                <div className="popup-icon">
                  {icon}
                </div>
                <div className="difficulty-badge">
                  {getDifficultyEmoji(difficulty)}
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2 
                className="popup-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {title}
              </motion.h2>

              {/* Message */}
              <motion.p 
                className="popup-message"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {message}
              </motion.p>

              {/* Celebration Stars */}
              <motion.div
                className="celebration-stars"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <span className="star star--1">⭐</span>
                <span className="star star--2">🌟</span>
                <span className="star star--3">✨</span>
              </motion.div>
            </div>

            {/* Confetti Burst */}
            <AnimatePresence>
              {showConfetti && (
                <div className="confetti-container">
                  {Array.from({ length: 8 }, (_, i) => (
                    <motion.div
                      key={i}
                      className={`confetti confetti--${(i % 4) + 1}`}
                      initial={{ 
                        scale: 0,
                        x: 0,
                        y: 0,
                        rotate: 0,
                        opacity: 1
                      }}
                      animate={{
                        scale: [0, 1, 0.8, 0],
                        x: Math.cos((i * Math.PI * 2) / 8) * (60 + Math.random() * 20),
                        y: Math.sin((i * Math.PI * 2) / 8) * (60 + Math.random() * 20),
                        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                        opacity: [1, 1, 0.8, 0]
                      }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.05,
                        ease: "easeOut"
                      }}
                    >
                      {i % 4 === 0 ? "🍃" : i % 4 === 1 ? "✨" : i % 4 === 2 ? "🌟" : "🎊"}
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Soft Glow Effect */}
            <div className="soft-glow"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementPopup;
