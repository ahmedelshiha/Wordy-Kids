import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Star,
  Sparkles,
  Gift,
  X,
  Crown,
  Gem,
  Award,
  Zap,
} from "lucide-react";
import { audioService } from "@/lib/audioService";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | "learning"
    | "streak"
    | "quiz"
    | "exploration"
    | "social"
    | "journey";
  difficulty: "bronze" | "silver" | "gold" | "diamond";
  requirements: number;
  currentProgress: number;
  unlocked: boolean;
  dateUnlocked?: Date;
  reward?: {
    type: "avatar_accessory" | "theme" | "sound_effect" | "title" | "points";
    item: string;
    value?: number;
  };
  criteria?: Array<{
    type: string;
    target: number;
    operator?: string;
    timeFrame?: string;
  }>;
}

interface EnhancedAchievementPopupProps {
  achievements: Achievement[];
  onClose: () => void;
  onAchievementClaim?: (achievement: Achievement) => void;
}

export function EnhancedAchievementPopup({
  achievements,
  onClose,
  onAchievementClaim,
}: EnhancedAchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());

  const currentAchievement = achievements[currentIndex];

  useEffect(() => {
    if (achievements.length > 0) {
      // Play achievement unlock sound
      audioService.playSuccessSound();

      // Show reward animation after a delay
      setTimeout(() => setShowReward(true), 1000);
    }
  }, [achievements]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "bronze":
        return "from-orange-400 to-amber-600";
      case "silver":
        return "from-gray-300 to-gray-500";
      case "gold":
        return "from-yellow-400 to-yellow-600";
      case "diamond":
        return "from-blue-400 to-purple-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "bronze":
        return <Award className="w-5 h-5" />;
      case "silver":
        return <Star className="w-5 h-5" />;
      case "gold":
        return <Crown className="w-5 h-5" />;
      case "diamond":
        return <Gem className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "learning":
        return "bg-educational-blue";
      case "journey":
        return "bg-educational-purple";
      case "streak":
        return "bg-educational-orange";
      case "quiz":
        return "bg-educational-green";
      case "exploration":
        return "bg-educational-pink";
      default:
        return "bg-gray-500";
    }
  };

  const handleClaimReward = () => {
    if (currentAchievement && !claimed.has(currentAchievement.id)) {
      setClaimed((prev) => new Set(prev).add(currentAchievement.id));
      onAchievementClaim?.(currentAchievement);
      audioService.playCheerSound();

      // Move to next achievement or close
      if (currentIndex < achievements.length - 1) {
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setShowReward(false);
          setTimeout(() => setShowReward(true), 1000);
        }, 1500);
      } else {
        setTimeout(() => onClose(), 2000);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowReward(false);
      setTimeout(() => setShowReward(true), 500);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowReward(false);
      setTimeout(() => setShowReward(true), 500);
    }
  };

  if (achievements.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        {/* Celebration Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-yellow-400 text-2xl"
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 100,
                rotate: 0,
                opacity: 0,
              }}
              animate={{
                y: -100,
                rotate: 360,
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: 5 + Math.random() * 5,
              }}
            >
              ⭐
            </motion.div>
          ))}
        </div>

        {/* Main Achievement Card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: -50 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative"
        >
          <Card
            className={`w-full max-w-md mx-4 bg-gradient-to-br ${getDifficultyColor(currentAchievement.difficulty)} text-white shadow-2xl border-0 overflow-hidden`}
          >
            {/* Close Button */}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/20 rounded-full z-10"
            >
              <X className="w-4 h-4" />
            </Button>

            <CardContent className="p-8 text-center relative">
              {/* Achievement Icon with Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", duration: 0.8 }}
                className="text-7xl mb-4 relative"
              >
                {currentAchievement.icon}

                {/* Sparkle Effects */}
                <AnimatePresence>
                  {showReward && (
                    <>
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-yellow-300 text-lg"
                          initial={{
                            scale: 0,
                            x: 0,
                            y: 0,
                            opacity: 1,
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            x: Math.cos((i * Math.PI * 2) / 8) * 60,
                            y: Math.sin((i * Math.PI * 2) / 8) * 60,
                            opacity: [1, 1, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            delay: i * 0.1,
                          }}
                        >
                          ✨
                        </motion.div>
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Achievement Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  {getDifficultyIcon(currentAchievement.difficulty)}
                  <h3 className="text-2xl font-bold">Achievement Unlocked!</h3>
                </div>

                <h4 className="text-xl mb-3 font-semibold">
                  {currentAchievement.name}
                </h4>

                <p className="text-white/90 mb-4 text-sm leading-relaxed">
                  {currentAchievement.description}
                </p>

                {/* Category and Progress */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge
                    className={`${getCategoryColor(currentAchievement.category)} text-white border-0`}
                  >
                    {currentAchievement.category.toUpperCase()}
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0">
                    {currentAchievement.difficulty.toUpperCase()}
                  </Badge>
                </div>

                {/* Journey Criteria Display */}
                {currentAchievement.criteria &&
                  currentAchievement.criteria.length > 0 && (
                    <div className="bg-white/20 rounded-lg p-3 mb-4 text-left">
                      <div className="text-sm font-semibold mb-2 text-center">
                        🎯 Achievement Criteria Met:
                      </div>
                      {currentAchievement.criteria.map((criterion, index) => (
                        <div key={index} className="text-xs text-white/90 mb-1">
                          ✅{" "}
                          {criterion.type
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                          : {criterion.target}
                          {criterion.timeFrame && ` (${criterion.timeFrame})`}
                        </div>
                      ))}
                    </div>
                  )}

                {/* Reward Display */}
                {currentAchievement.reward && (
                  <AnimatePresence>
                    {showReward && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.2, type: "spring" }}
                        className="bg-white/20 rounded-lg p-4 mb-4"
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Gift className="w-5 h-5" />
                          <span className="font-semibold">
                            Reward Unlocked!
                          </span>
                        </div>
                        <div className="text-lg font-bold">
                          🎁 {currentAchievement.reward.item}
                        </div>
                        {currentAchievement.reward.value && (
                          <div className="text-sm text-white/90">
                            +{currentAchievement.reward.value} points
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Achievement Navigation */}
                {achievements.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {achievements.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentIndex ? "bg-white" : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {showReward &&
                    currentAchievement.reward &&
                    !claimed.has(currentAchievement.id) && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.5 }}
                      >
                        <Button
                          onClick={handleClaimReward}
                          className="w-full bg-white text-gray-800 hover:bg-white/90 font-bold py-3 rounded-xl shadow-lg"
                          size="lg"
                        >
                          <Zap className="w-5 h-5 mr-2" />
                          Claim Reward!
                        </Button>
                      </motion.div>
                    )}

                  <div className="flex gap-2">
                    {currentIndex > 0 && (
                      <Button
                        onClick={handlePrevious}
                        variant="outline"
                        className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
                      >
                        Previous
                      </Button>
                    )}

                    <Button
                      onClick={achievements.length > 1 ? handleNext : onClose}
                      variant="outline"
                      className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
                    >
                      {currentIndex < achievements.length - 1
                        ? "Next"
                        : "Continue"}
                    </Button>
                  </div>
                </div>

                {/* Achievement Counter */}
                {achievements.length > 1 && (
                  <div className="text-xs text-white/70 mt-3">
                    Achievement {currentIndex + 1} of {achievements.length}
                  </div>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
