import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Star,
  Trophy,
  Heart,
  Sparkles,
  X,
  BookOpen,
  Medal,
} from "lucide-react";

interface ProgressData {
  wordsLearned?: number;
  currentStreak?: number;
  totalPoints?: number;
  level?: number;
  weeklyProgress?: number;
  weeklyGoal?: number;
}

interface KidRegistrationNotificationProps {
  className?: string;
  variant?: "banner" | "card" | "floating";
  onDismiss?: () => void;
  showDismiss?: boolean;
  progressData?: ProgressData;
}

export const KidRegistrationNotification: React.FC<
  KidRegistrationNotificationProps
> = ({
  className = "",
  variant = "card",
  onDismiss,
  showDismiss = true,
  progressData,
}) => {
  const { isGuest, user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Don't show if user is already registered
  if (!isGuest || !user) {
    return null;
  }

  // Don't show if already dismissed in this session
  const dismissKey = "kidRegistrationDismissed";
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem(dismissKey) === "true";
  });

  // Animation cycle for sparkles and stars
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem(dismissKey, "true");
    if (onDismiss) {
      onDismiss();
    }
  };

  // Personalize message based on progress
  const getPersonalizedMessage = () => {
    if (!progressData) {
      return {
        title: "Hey there, Amazing Explorer! 🌟",
        message:
          "You're doing great learning new words! 📚 Want to save your awesome progress and unlock even more magical features?",
        emoji: "🦄",
      };
    }

    const {
      wordsLearned = 0,
      currentStreak = 0,
      totalPoints = 0,
      level = 1,
    } = progressData;

    if (wordsLearned >= 20) {
      return {
        title: "WOW! You're a Word Master! 🏆",
        message: `Amazing! You've learned ${wordsLearned} words and you're on level ${level}! 🌟 Save your incredible progress and unlock special rewards!`,
        emoji: "👑",
      };
    }

    if (wordsLearned >= 10) {
      return {
        title: "Super Star Learner! ⭐",
        message: `Fantastic! You've learned ${wordsLearned} words! 🎉 Create an account to keep your amazing progress safe!`,
        emoji: "🌟",
      };
    }

    if (wordsLearned >= 5) {
      return {
        title: "You're Doing Great! 🚀",
        message: `Awesome job learning ${wordsLearned} words! 📖 Sign up to save your progress and earn cool badges!`,
        emoji: "🦄",
      };
    }

    if (currentStreak >= 3) {
      return {
        title: "Amazing Streak! 🔥",
        message: `You're on fire with a ${currentStreak}-day streak! 💪 Create an account to keep your streak going!`,
        emoji: "🎯",
      };
    }

    return {
      title: "Welcome, Future Word Champion! 🌟",
      message:
        "You're off to a great start! 🎉 Want to save your progress and unlock magical learning features?",
      emoji: "🦄",
    };
  };

  const personalizedContent = getPersonalizedMessage();

  if (isDismissed || !isVisible) {
    return null;
  }

  const sparkleVariants = {
    hidden: { opacity: 0, scale: 0, rotate: 0 },
    visible: {
      opacity: [0, 1, 0],
      scale: [0.5, 1.2, 0.5],
      rotate: [0, 180, 360],
      transition: { duration: 2, repeat: Infinity },
    },
  };

  const floatingVariants = {
    float: {
      y: [-10, 10, -10],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut", type: "tween" },
    },
  };

  const cardContent = (
    <div className="relative overflow-hidden">
      {/* Background magical elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-2 right-4 text-yellow-400 text-lg"
          variants={sparkleVariants}
          initial="hidden"
          animate={animationPhase % 2 === 0 ? "visible" : "hidden"}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute bottom-3 left-3 text-blue-400 text-sm"
          variants={sparkleVariants}
          initial="hidden"
          animate={animationPhase % 2 === 1 ? "visible" : "hidden"}
        >
          🌟
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-2 text-pink-400 text-xs"
          variants={sparkleVariants}
          initial="hidden"
          animate={animationPhase % 3 === 0 ? "visible" : "hidden"}
        >
          💫
        </motion.div>
      </div>

      {/* Dismiss button */}
      {showDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
        >
          <X className="w-3 h-3 text-gray-500" />
        </button>
      )}

      {/* Main content */}
      <div className="text-center p-4 relative z-10">
        {/* Character mascot */}
        <motion.div
          className="text-4xl mb-3"
          variants={floatingVariants}
          animate="float"
        >
          {personalizedContent.emoji}
        </motion.div>

        {/* Title */}
        <motion.h3
          className="text-lg font-bold text-purple-800 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {personalizedContent.title}
        </motion.h3>

        {/* Message */}
        <motion.p
          className="text-sm text-purple-700 mb-4 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {personalizedContent.message}
        </motion.p>

        {/* Progress highlight for kids with some achievement */}
        {progressData &&
          (progressData.wordsLearned! > 0 ||
            progressData.currentStreak! > 0) && (
            <motion.div
              className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-lg p-3 mb-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-center gap-4 text-xs font-bold">
                {progressData.wordsLearned! > 0 && (
                  <div className="flex items-center gap-1 text-blue-700">
                    <BookOpen className="w-3 h-3" />
                    <span>{progressData.wordsLearned} Words!</span>
                  </div>
                )}
                {progressData.currentStreak! > 0 && (
                  <div className="flex items-center gap-1 text-orange-700">
                    <Medal className="w-3 h-3" />
                    <span>{progressData.currentStreak}-Day Streak!</span>
                  </div>
                )}
                {progressData.totalPoints! > 0 && (
                  <div className="flex items-center gap-1 text-purple-700">
                    <Star className="w-3 h-3" />
                    <span>{progressData.totalPoints} Points!</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        {/* Benefits list */}
        <motion.div
          className="grid grid-cols-2 gap-2 mb-4 text-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-1 text-blue-700 bg-blue-50 rounded-lg p-2">
            <Trophy className="w-3 h-3" />
            <span>Save Progress</span>
          </div>
          <div className="flex items-center gap-1 text-green-700 bg-green-50 rounded-lg p-2">
            <Star className="w-3 h-3" />
            <span>Earn Badges</span>
          </div>
          <div className="flex items-center gap-1 text-purple-700 bg-purple-50 rounded-lg p-2">
            <BookOpen className="w-3 h-3" />
            <span>Personal Library</span>
          </div>
          <div className="flex items-center gap-1 text-pink-700 bg-pink-50 rounded-lg p-2">
            <Heart className="w-3 h-3" />
            <span>Fun Rewards</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={handleSignUp}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-bold py-3 text-sm shadow-lg transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent"
              animate={{
                x: ["-100%", "200%"],
                transition: { duration: 2, repeat: Infinity, ease: "linear" },
              }}
            />
            <UserPlus className="w-4 h-4 mr-2" />
            <span>Create My Account! 🚀</span>
          </Button>
        </motion.div>

        {/* Secondary message */}
        <motion.p
          className="text-xs text-gray-600 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          It's super quick and totally free! ✨
        </motion.p>
      </div>
    </div>
  );

  if (variant === "banner") {
    return (
      <AnimatePresence>
        <motion.div
          className={`w-full bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-2 border-purple-200 rounded-xl shadow-lg ${className}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {cardContent}
        </motion.div>
      </AnimatePresence>
    );
  }

  if (variant === "floating") {
    return (
      <AnimatePresence>
        <motion.div
          className={`fixed bottom-4 right-4 z-50 max-w-xs bg-white border-2 border-purple-200 rounded-xl shadow-xl ${className}`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          {cardContent}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Default card variant
  return (
    <AnimatePresence>
      <motion.div
        className={className}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0">{cardContent}</CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default KidRegistrationNotification;
