import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";

interface RewardPopupProps {
  title: string;
  message: string;
  rewardIcon: string;
  gemsEarned?: number;
  crownLevel?: "bronze" | "silver" | "gold" | "rainbow";
  streakDays?: number;
  type?: "word" | "category" | "streak" | "game";
  onClose: () => void;
  reducedMotion?: boolean;
}

export const RewardPopup: React.FC<RewardPopupProps> = ({
  title,
  message,
  rewardIcon,
  gemsEarned = 0,
  crownLevel,
  streakDays,
  type = "word",
  onClose,
  reducedMotion = false,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  // Auto-close after 4 seconds for kids
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Show confetti on mount
  useEffect(() => {
    if (!reducedMotion) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [reducedMotion]);

  // Play sound effect on mount
  useEffect(() => {
    const playRewardSound = async () => {
      try {
        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Simple success sound using Web Audio API
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log("Audio not available, skipping sound effect");
      }
    };

    playRewardSound();
  }, []);

  // Haptic feedback
  useEffect(() => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, []);

  const getBackgroundColor = () => {
    switch (type) {
      case "word":
        return "from-green-400 to-green-600";
      case "category":
        return "from-yellow-400 to-orange-500";
      case "streak":
        return "from-red-400 to-pink-500";
      case "game":
        return "from-purple-400 to-blue-500";
      default:
        return "from-green-400 to-green-600";
    }
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        role="alertdialog"
        aria-live="assertive"
        aria-label={`${title}: ${message}`}
      >
        {/* Confetti Background */}
        {showConfetti && !reducedMotion && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  y: -100,
                  x: Math.random() * window.innerWidth,
                  rotate: 0,
                }}
                animate={{
                  opacity: 0,
                  y: window.innerHeight + 100,
                  rotate: 360,
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
                className="absolute text-2xl"
              >
                {["🎉", "✨", "🌟", "🎊", "💎"][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Popup */}
        <motion.div
          initial={reducedMotion ? {} : { scale: 0.7, opacity: 0, y: 50 }}
          animate={reducedMotion ? {} : { scale: 1, opacity: 1, y: 0 }}
          exit={reducedMotion ? {} : { scale: 0.7, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
          className={cn(
            "relative bg-gradient-to-br",
            getBackgroundColor(),
            "rounded-3xl shadow-2xl max-w-sm mx-4 overflow-hidden"
          )}
        >
          {/* Close button */}
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            className="absolute top-4 right-4 z-10 rounded-full w-8 h-8 p-0 bg-white/20 hover:bg-white/30"
            aria-label="Close reward popup"
          >
            <X className="w-4 h-4 text-white" />
          </Button>

          {/* Sparkle decorations */}
          <div className="absolute top-6 left-6">
            <Sparkles className="w-6 h-6 text-white/60" />
          </div>
          <div className="absolute bottom-6 right-6">
            <Sparkles className="w-5 h-5 text-white/40" />
          </div>

          {/* Content */}
          <div className="p-8 text-center text-white">
            {/* Main Icon */}
            <motion.div
              initial={reducedMotion ? {} : { scale: 0, rotate: -180 }}
              animate={reducedMotion ? {} : { scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              className="text-6xl mb-4"
            >
              {rewardIcon}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2"
            >
              {title}
            </motion.h2>

            {/* Message */}
            <motion.p
              initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg mb-4 text-white/90"
            >
              {message}
            </motion.p>

            {/* Rewards Display */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, scale: 0.8 }}
              animate={reducedMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              {/* Gems */}
              {gemsEarned > 0 && (
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <span className="text-2xl">💎</span>
                  <span className="text-xl font-bold">+{gemsEarned}</span>
                </div>
              )}

              {/* Crown */}
              {crownLevel && (
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <span className="text-2xl">{getCrownEmoji()}</span>
                  <span className="text-lg font-bold capitalize">{crownLevel}</span>
                </div>
              )}

              {/* Streak */}
              {streakDays && (
                <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                  <span className="text-2xl">🔥</span>
                  <span className="text-xl font-bold">{streakDays} days</span>
                </div>
              )}
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onClose}
                size="lg"
                className="bg-white text-gray-800 hover:bg-white/90 rounded-full font-bold px-8 py-3 text-lg shadow-lg"
              >
                <span className="mr-2">🎉</span>
                Awesome!
                <span className="ml-2">🌟</span>
              </Button>
            </motion.div>
          </div>

          {/* Bottom decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-white/30 via-white/50 to-white/30" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RewardPopup;
