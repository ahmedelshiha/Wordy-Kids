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
  const [isPressed, setIsPressed] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Get messages on component mount and periodically
    const updateMessages = () => {
      const isMobile = window.innerWidth < 768;
      setMotivationalMessage(
        isMobile
          ? EnhancedAchievementTracker.getShortMotivationalMessage()
          : EnhancedAchievementTracker.getMotivationalMessage(),
      );
      setSpecialMessage(EnhancedAchievementTracker.getTodaySpecialMessage());
      setCurrentTease(
        isMobile
          ? EnhancedAchievementTracker.getShortAchievementTease()
          : EnhancedAchievementTracker.getNextAchievementTease(),
      );
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

  // Cycle through messages every 8 seconds (longer for mobile to read)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const rotationInterval = isMobile ? 6000 : 8000; // 6s on mobile, 8s on desktop

    const messageRotation = setInterval(() => {
      setShowTeaser(false);
      setTimeout(() => {
        // Update all messages for variety
        const isMobile = window.innerWidth < 768;
        setMotivationalMessage(
          isMobile
            ? EnhancedAchievementTracker.getShortMotivationalMessage()
            : EnhancedAchievementTracker.getMotivationalMessage(),
        );
        setSpecialMessage(EnhancedAchievementTracker.getTodaySpecialMessage());
        setCurrentTease(
          isMobile
            ? EnhancedAchievementTracker.getShortAchievementTease()
            : EnhancedAchievementTracker.getNextAchievementTease(),
        );
        setMessageIndex((prev) => prev + 1);
        setShowTeaser(true);
      }, 300);
    }, rotationInterval);

    return () => clearInterval(messageRotation);
  }, []);

  const getRandomIcon = () => {
    const icons = [Trophy, Star, Sparkles, Target, Zap];
    const IconComponent = icons[Math.floor(Math.random() * icons.length)];
    return <IconComponent className="w-3 h-3 sm:w-4 sm:h-4" />;
  };

  const getRandomEmoji = () => {
    const emojis = [
      "🌟",
      "⭐",
      "✨",
      "🎯",
      "🚀",
      "💫",
      "🌈",
      "🎊",
      "🦋",
      "🌺",
      "🎪",
      "🦄",
      "🎵",
      "����",
      "🎨",
      "🏰",
    ];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  // Touch handlers for mobile interactivity
  const handleTouchStart = () => {
    setIsPressed(true);
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
    // Cycle to next message on tap (mobile-friendly)
    setShowTeaser(false);
    setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      setMotivationalMessage(
        isMobile
          ? EnhancedAchievementTracker.getShortMotivationalMessage()
          : EnhancedAchievementTracker.getMotivationalMessage(),
      );
      setSpecialMessage(EnhancedAchievementTracker.getTodaySpecialMessage());
      setCurrentTease(
        isMobile
          ? EnhancedAchievementTracker.getShortAchievementTease()
          : EnhancedAchievementTracker.getNextAchievementTease(),
      );
      setMessageIndex((prev) => prev + 1);
      setShowTeaser(true);
    }, 200);
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
          animate={{
            opacity: 1,
            y: 0,
            scale: isPressed ? 0.98 : 1,
          }}
          exit={{ opacity: 0, y: -5, scale: 0.98 }}
          transition={{
            type: "spring",
            duration: 0.5,
            damping: 20,
          }}
          className={`${className} cursor-pointer select-none`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={() => setIsPressed(false)}
          whileTap={{ scale: 0.98 }}
        >
          <Card
            className={`border-0 shadow-sm transition-all duration-500 hover:shadow-md active:shadow-lg rounded-xl sm:rounded-2xl backdrop-blur-sm overflow-hidden ${
              isSpecial
                ? "bg-gradient-to-r from-yellow-100 via-orange-50 to-pink-100 border-yellow-200 shadow-yellow-100/50 hover:shadow-yellow-200/60"
                : isTease
                  ? "bg-gradient-to-r from-blue-100 via-purple-50 to-indigo-100 border-blue-200 shadow-blue-100/50 hover:shadow-blue-200/60"
                  : "bg-gradient-to-r from-green-100 via-emerald-50 to-blue-100 border-green-200 shadow-green-100/50 hover:shadow-green-200/60"
            } ${isPressed ? "scale-98 shadow-lg" : ""}`}
            role="button"
            tabIndex={0}
            aria-label="Tap for a new motivational message"
          >
            {/* Mobile: Ultra compact */}
            <CardContent className="p-1.5 sm:p-2 md:p-3">
              <div className="md:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-sm flex-shrink-0">
                    {getRandomEmoji()}
                  </span>
                  <motion.p
                    key={currentMessage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs font-medium text-blue-700 truncate flex-1"
                  >
                    {currentMessage}
                  </motion.p>
                </div>
              </div>

              {/* Desktop: Full layout */}
              <div className="hidden md:block">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut",
                    }}
                    className={`flex-shrink-0 will-change-transform ${
                      isSpecial
                        ? "text-yellow-600 drop-shadow-sm"
                        : isTease
                          ? "text-purple-600 drop-shadow-sm"
                          : "text-blue-600 drop-shadow-sm"
                    }`}
                  >
                    {getRandomIcon()}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <motion.p
                      key={currentMessage}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`text-sm md:text-base font-medium leading-tight line-clamp-2 ${
                        isSpecial
                          ? "text-yellow-800 drop-shadow-sm"
                          : isTease
                            ? "text-purple-800 drop-shadow-sm"
                            : "text-blue-800 drop-shadow-sm"
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
                      ease: "easeInOut",
                    }}
                    className="text-base md:text-lg flex-shrink-0 will-change-transform"
                  >
                    {getRandomEmoji()}
                  </motion.div>
                </div>
              </div>

              {/* Desktop only teaser details */}
              {isTease && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  className="hidden md:block"
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-2"
                >
                  <Badge
                    variant="outline"
                    className="text-xs sm:text-sm bg-white/60 text-purple-700 border-purple-300 animate-pulse rounded-full px-2 py-1 shadow-sm will-change-transform"
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
