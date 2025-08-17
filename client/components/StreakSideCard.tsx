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
  Flame,
  Target,
  Gift,
} from "lucide-react";

interface ProgressData {
  wordsLearned?: number;
  currentStreak?: number;
  totalPoints?: number;
  level?: number;
  weeklyProgress?: number;
  weeklyGoal?: number;
}

interface StreakSideCardProps {
  className?: string;
  onDismiss?: () => void;
  showDismiss?: boolean;
  progressData?: ProgressData;
}

export const StreakSideCard: React.FC<StreakSideCardProps> = ({
  className = "",
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
  const dismissKey = "streakSideCardDismissed";
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem(dismissKey) === "true";
  });

  // Animation cycle for sparkles and effects
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 6);
    }, 1500);
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

  // Enhanced personalized message for side card
  const getStreakContent = () => {
    if (!progressData) {
      return {
        title: "Start Your Journey! 🌟",
        subtitle: "Every expert was once a beginner",
        streak: 0,
        message: "Begin building your learning streak today!",
        emoji: "🚀",
        color: "from-purple-500 to-pink-500",
      };
    }

    const { currentStreak = 0, wordsLearned = 0 } = progressData;

    if (currentStreak >= 7) {
      return {
        title: "LEGENDARY STREAK! 🏆",
        subtitle: "You're absolutely unstoppable!",
        streak: currentStreak,
        message: "Save this incredible achievement forever!",
        emoji: "👑",
        color: "from-yellow-500 via-orange-500 to-red-500",
      };
    }

    if (currentStreak >= 5) {
      return {
        title: "AMAZING STREAK! 🔥",
        subtitle: "You're on fire with consistency!",
        streak: currentStreak,
        message: "Keep this momentum going strong!",
        emoji: "🔥",
        color: "from-orange-500 to-red-500",
      };
    }

    if (currentStreak >= 3) {
      return {
        title: "Great Progress! ⚡",
        subtitle: "Building a fantastic habit!",
        streak: currentStreak,
        message: "Create an account to keep your streak safe!",
        emoji: "⚡",
        color: "from-blue-500 to-purple-500",
      };
    }

    if (wordsLearned >= 10) {
      return {
        title: "Word Master! 📚",
        subtitle: "Your vocabulary is growing!",
        streak: currentStreak,
        message: "Unlock achievements and track your progress!",
        emoji: "📚",
        color: "from-green-500 to-blue-500",
      };
    }

    return {
      title: "Ready to Excel? 🌟",
      subtitle: "Join thousands of successful learners",
      streak: currentStreak,
      message: "Create your account to track progress!",
      emoji: "🌟",
      color: "from-purple-500 to-pink-500",
    };
  };

  const content = getStreakContent();

  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className={`sticky top-4 ${className}`}
        initial={{ opacity: 0, x: 20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.95 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.6 
        }}
      >
        <Card className="bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 border-2 border-purple-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm relative overflow-hidden">
          {/* Animated background patterns */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-blue-400/20"></div>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
                style={{
                  left: `${(i * 15) % 100}%`,
                  top: `${(i * 23) % 100}%`,
                }}
                animate={{
                  scale: [0.5, 1.2, 0.5],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>

          <CardContent className="p-0 relative">
            {/* Dismiss button */}
            {showDismiss && (
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/80 hover:bg-white/90 shadow-sm transition-all duration-200 hover:scale-110"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}

            {/* Header with streak display */}
            <div className="relative">
              <div className={`bg-gradient-to-r ${content.color} p-6 text-white relative overflow-hidden`}>
                {/* Animated sparks */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-yellow-300 text-lg"
                      style={{
                        left: `${20 + (i * 12) % 60}%`,
                        top: `${15 + (i * 17) % 70}%`,
                      }}
                      animate={{
                        opacity: animationPhase === i ? [0, 1, 0] : 0,
                        scale: animationPhase === i ? [0.5, 1.2, 0.5] : 0.5,
                        rotate: [0, 180, 360],
                      }}
                      transition={{ duration: 1.5 }}
                    >
                      ✨
                    </motion.div>
                  ))}
                </div>

                <div className="relative z-10 text-center">
                  <motion.div
                    className="text-4xl mb-2"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [-5, 5, -5, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {content.emoji}
                  </motion.div>
                  
                  <h3 className="text-xl font-bold mb-1">{content.title}</h3>
                  <p className="text-sm opacity-90 font-medium">{content.subtitle}</p>
                  
                  {/* Streak counter */}
                  {content.streak > 0 && (
                    <motion.div
                      className="flex items-center justify-center gap-2 mt-3 bg-white/20 rounded-full px-4 py-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Flame className="w-5 h-5 text-yellow-200" />
                      <span className="text-lg font-bold">{content.streak}</span>
                      <span className="text-sm font-medium">Day Streak!</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-6">
              {/* Message */}
              <p className="text-center text-gray-700 font-medium leading-relaxed">
                {content.message}
              </p>

              {/* Progress highlights */}
              {progressData && (progressData.wordsLearned! > 0 || progressData.currentStreak! > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {progressData.wordsLearned! > 0 && (
                    <motion.div
                      className="bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 rounded-lg p-3 text-center"
                      whileHover={{ scale: 1.02 }}
                    >
                      <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-blue-800">{progressData.wordsLearned}</div>
                      <div className="text-xs text-blue-600 font-medium">Words Learned</div>
                    </motion.div>
                  )}
                  
                  {progressData.totalPoints! > 0 && (
                    <motion.div
                      className="bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200 rounded-lg p-3 text-center"
                      whileHover={{ scale: 1.02 }}
                    >
                      <Star className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-yellow-800">{progressData.totalPoints}</div>
                      <div className="text-xs text-yellow-600 font-medium">Points Earned</div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Benefits showcase */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-800 text-center mb-3">
                  🎁 Unlock Amazing Features:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { icon: Trophy, text: "Save Progress", color: "blue" },
                    { icon: Medal, text: "Earn Badges", color: "purple" },
                    { icon: Target, text: "Track Goals", color: "green" },
                    { icon: Gift, text: "Get Rewards", color: "pink" },
                  ].map(({ icon: Icon, text, color }) => (
                    <motion.div
                      key={text}
                      className={`flex items-center gap-2 bg-${color}-50 border border-${color}-200 rounded-lg p-2 hover:bg-${color}-100 transition-colors`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Icon className={`w-3 h-3 text-${color}-600`} />
                      <span className={`text-${color}-700 font-medium`}>{text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSignUp}
                  className={`w-full bg-gradient-to-r ${content.color} hover:shadow-lg text-white font-bold py-4 text-sm shadow-md transition-all duration-300 relative overflow-hidden group`}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    animate={{
                      x: ["-100%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Create My Account! 🚀</span>
                  </div>
                </Button>
              </motion.div>

              {/* Footer note */}
              <p className="text-xs text-center text-gray-500 leading-relaxed">
                Join <span className="font-bold text-purple-600">50,000+</span> kids learning with us! 
                <br />
                <span className="inline-flex items-center gap-1 mt-1">
                  ✨ It's quick, free & fun! ✨
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default StreakSideCard;
