import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Sparkles, Target, Zap } from "lucide-react";
import { EnhancedAchievementTracker } from "@/lib/enhancedAchievementTracker";

interface AchievementTeaserProps {
  className?: string;
}

export function AchievementTeaser({ className }: AchievementTeaserProps) {
  const [currentTease, setCurrentTease] = useState<string | null>(null);
  const [motivationalMessage, setMotivationalMessage] = useState<string>("");
  const [specialMessage, setSpecialMessage] = useState<string | null>(null);
  const [showTeaser, setShowTeaser] = useState(false);

  useEffect(() => {
    // Get messages on component mount and periodically
    const updateMessages = () => {
      setMotivationalMessage(
        EnhancedAchievementTracker.getMotivationalMessage(),
      );
      setSpecialMessage(EnhancedAchievementTracker.getTodaySpecialMessage());
      setCurrentTease(EnhancedAchievementTracker.getNextAchievementTease());
    };

    updateMessages();

    // Update messages every 2 minutes
    const interval = setInterval(updateMessages, 120000);

    // Show teaser with delay
    const teaserTimer = setTimeout(() => setShowTeaser(true), 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(teaserTimer);
    };
  }, []);

  // Cycle through messages every 8 seconds
  useEffect(() => {
    const messageRotation = setInterval(() => {
      setShowTeaser(false);
      setTimeout(() => setShowTeaser(true), 300);
    }, 8000);

    return () => clearInterval(messageRotation);
  }, []);

  const getRandomIcon = () => {
    const icons = [Trophy, Star, Sparkles, Target, Zap];
    const IconComponent = icons[Math.floor(Math.random() * icons.length)];
    return <IconComponent className="w-3 h-3" />;
  };

  const getRandomEmoji = () => {
    const emojis = ["🌟", "⭐", "✨", "🎯", "🚀", "💫", "🌈", "🎊"];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  // Priority: Special message > Achievement tease > Motivational message
  const currentMessage = specialMessage || currentTease || motivationalMessage;

  if (!currentMessage) return null;

  const isSpecial = !!specialMessage;
  const isTease = !!currentTease && !specialMessage;

  return (
    <AnimatePresence>
      {showTeaser && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.98 }}
          transition={{
            type: "spring",
            duration: 0.5,
            damping: 20,
          }}
          className={className}
        >
          <Card
            className={`border-0 shadow-sm transition-all duration-500 hover:shadow-md ${
              isSpecial
                ? "bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-200"
                : isTease
                  ? "bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200"
                  : "bg-gradient-to-r from-green-100 to-blue-100 border-green-200"
            }`}
          >
            <CardContent className="p-2 md:p-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  className={`${
                    isSpecial
                      ? "text-yellow-600"
                      : isTease
                        ? "text-purple-600"
                        : "text-blue-600"
                  }`}
                >
                  {getRandomIcon()}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.p
                    key={currentMessage} // Force re-render on message change
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-xs md:text-sm font-medium leading-tight ${
                      isSpecial
                        ? "text-yellow-800"
                        : isTease
                          ? "text-purple-800"
                          : "text-blue-800"
                    }`}
                  >
                    {currentMessage}
                  </motion.p>
                </div>

                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 4,
                  }}
                  className="text-sm"
                >
                  {getRandomEmoji()}
                </motion.div>
              </div>

              {isTease && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="mt-2"
                >
                  <Badge
                    variant="outline"
                    className="text-xs bg-white/50 text-purple-700 border-purple-300 animate-pulse"
                  >
                    🎯 Keep going!
                  </Badge>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
