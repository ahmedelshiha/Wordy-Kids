import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { DynamicAuthButton } from "@/components/DynamicAuthButton";
import { goalProgressTracker } from "@/lib/goalProgressTracker";
import { achievementTracker } from "@/lib/achievementTracker";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import {
  kidFriendlyEffects,
  SOUNDS,
  celebrate,
} from "@/lib/kidFriendlyEffects";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Star,
  Trophy,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SimplifiedChildSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  position?: "left" | "right";
}

interface RealTimeStats {
  wordsLearned: number;
  points: number;
  streak: number;
  level: number;
  levelProgress: number;
  timeToday: string;
  achievements: number;
}

export const SimplifiedChildSidebar: React.FC<SimplifiedChildSidebarProps> = ({
  className,
  isCollapsed = false,
  onToggleCollapse,
  position = "left",
}) => {
  const { user, isGuest } = useAuth();
  const { loadSession } = useSessionPersistence();
  const [stats, setStats] = useState<RealTimeStats>({
    wordsLearned: 0,
    points: 0,
    streak: 0,
    level: 1,
    levelProgress: 0,
    timeToday: "0m",
    achievements: 0,
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState("");

  // Update real-time data every 30 seconds
  useEffect(() => {
    const updateStats = async () => {
      try {
        const childId = user?.id || "guest-user";
        
        // Get real progress data
        const progressData = await goalProgressTracker.fetchSystematicProgress(childId);
        const journeyProgress = achievementTracker.getJourneyProgress(childId);
        const sessionData = loadSession();

        // Calculate level from words learned (every 10 words = 1 level for kids)
        const level = Math.floor(progressData.totalWordsLearned / 10) + 1;
        const levelProgress = ((progressData.totalWordsLearned % 10) / 10) * 100;

        // Format time spent today
        const timeMinutes = progressData.timeSpentToday || 0;
        const timeDisplay = timeMinutes < 60 ? `${timeMinutes}m` : `${Math.floor(timeMinutes / 60)}h`;

        setStats({
          wordsLearned: progressData.totalWordsLearned || 0,
          points: journeyProgress.totalPoints || 0,
          streak: progressData.currentStreak || 0,
          level,
          levelProgress,
          timeToday: timeDisplay,
          achievements: journeyProgress.achievementsUnlocked?.length || 0,
        });
      } catch (error) {
        console.log("Using fallback stats:", error);
        // Fallback to basic stats for guests or on error
        setStats({
          wordsLearned: 0,
          points: 0,
          streak: 0,
          level: 1,
          levelProgress: 0,
          timeToday: "0m",
          achievements: 0,
        });
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [user?.id, loadSession]);

  // Update time-based greeting
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      const name = user?.name || "Friend";
      
      if (hour < 12) {
        setGreeting(`Good morning, ${name}! 🌅`);
      } else if (hour < 17) {
        setGreeting(`Hi there, ${name}! ☀️`);
      } else {
        setGreeting(`Good evening, ${name}! 🌙`);
      }
    };

    updateGreeting();
    const timer = setInterval(updateGreeting, 60000);
    return () => clearInterval(timer);
  }, [user?.name, currentTime]);

  const sidebarVariants = {
    expanded: {
      width: "280px", // Smaller for kids
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    collapsed: {
      width: "70px", // More compact
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const contentVariants = {
    expanded: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.1, duration: 0.2 },
    },
    collapsed: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      className={cn(
        "bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50",
        "border-r-4 border-rainbow-200 shadow-xl",
        "flex flex-col h-full overflow-hidden",
        "transition-all duration-500 relative",
        position === "right" && "border-r-0 border-l-4",
        className,
      )}
    >
      {/* Fun floating elements for kids */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-4 right-4 text-xl animate-spin" style={{ animationDuration: "8s" }}>
          ⭐
        </div>
        <div className="absolute top-16 left-4 text-lg animate-bounce" style={{ animationDelay: "1s" }}>
          🌟
        </div>
        <div className="absolute bottom-20 right-4 text-lg animate-bounce" style={{ animationDelay: "2s" }}>
          🎯
        </div>
      </div>

      {/* Header with greeting */}
      <div className="p-3 border-b-2 border-rainbow-200 bg-gradient-to-r from-yellow-100 to-orange-100 relative z-10">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex-1"
              >
                <div className="bg-gradient-to-r from-orange-200 to-yellow-200 rounded-xl p-3 border-2 border-white shadow-md">
                  <div className="text-sm font-bold text-gray-800 text-center">
                    {greeting}
                  </div>
                  <div className="text-xs text-gray-600 text-center mt-1">
                    Let's learn together! 🚀
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                kidFriendlyEffects.playSound(SOUNDS.button_click);
                onToggleCollapse();
              }}
              className="h-8 w-8 p-0 bg-gradient-to-r from-yellow-200 to-orange-200 hover:from-yellow-300 hover:to-orange-300 shadow-md border-2 border-white rounded-full ml-2"
            >
              {isCollapsed ? (
                position === "left" ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronLeft className="w-3 h-3" />
                )
              ) : position === "left" ? (
                <ChevronLeft className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-3 overflow-y-auto relative z-10">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="space-y-4"
            >
              {/* Big friendly avatar */}
              <div className="text-center">
                <motion.div
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-4xl border-4 border-white shadow-xl cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    kidFriendlyEffects.playSound(SOUNDS.success);
                    celebrate.general();
                  }}
                >
                  🎯
                </motion.div>
                <div className="mt-2 text-lg font-bold text-gray-800">
                  Level {stats.level}
                </div>
              </div>

              {/* Level progress - BIG and simple */}
              <Card className="p-4 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-200">
                <div className="text-center mb-3">
                  <div className="text-sm font-bold text-gray-800">🎮 Next Level</div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    kidFriendlyEffects.playSound(SOUNDS.success);
                    if (stats.levelProgress > 70) celebrate.general();
                  }}
                  className="cursor-pointer"
                >
                  <Progress
                    value={stats.levelProgress}
                    className="h-8 bg-green-50 border-2 border-green-200 rounded-full"
                  />
                </motion.div>
                <div className="text-xs text-center mt-2 text-green-700 font-medium">
                  {Math.ceil((100 - stats.levelProgress) / 10)} more words to go! 🌟
                </div>
              </Card>

              {/* Simple stats grid - 2x2 for simplicity */}
              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-3 text-center border-2 border-purple-200 shadow-md"
                >
                  <BookOpen className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                  <div className="text-xl font-black text-gray-800">
                    {stats.wordsLearned}
                  </div>
                  <div className="text-xs font-bold text-purple-700">
                    📚 Words
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl p-3 text-center border-2 border-orange-200 shadow-md"
                >
                  <Trophy className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                  <div className="text-xl font-black text-gray-800">
                    {stats.points}
                  </div>
                  <div className="text-xs font-bold text-orange-700">
                    🏆 Points
                  </div>
                </motion.div>

                {stats.streak > 0 && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-red-100 to-pink-100 rounded-xl p-3 text-center border-2 border-red-200 shadow-md"
                  >
                    <Target className="w-6 h-6 mx-auto mb-1 text-red-600" />
                    <div className="text-xl font-black text-gray-800">
                      {stats.streak}
                    </div>
                    <div className="text-xs font-bold text-red-700">
                      🔥 Streak
                    </div>
                  </motion.div>
                )}

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-3 text-center border-2 border-blue-200 shadow-md"
                >
                  <Star className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                  <div className="text-xl font-black text-gray-800">
                    {stats.achievements}
                  </div>
                  <div className="text-xs font-bold text-blue-700">
                    ⭐ Stars
                  </div>
                </motion.div>
              </div>

              {/* Today's adventure time */}
              {stats.timeToday !== "0m" && (
                <Card className="p-3 bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-200">
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-800 mb-1">
                      ⏰ Today's Adventure
                    </div>
                    <div className="text-2xl font-black text-purple-800">
                      {stats.timeToday}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      Great job learning! 🎉
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex flex-col items-center space-y-3"
            >
              {/* Collapsed avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-2xl border-2 border-white shadow-md">
                🎯
              </div>

              {/* Collapsed quick stats */}
              <div className="flex flex-col items-center space-y-2">
                <Badge className="text-xs bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 border-orange-300 font-bold">
                  L{stats.level}
                </Badge>
                {stats.streak > 0 && (
                  <Badge className="text-xs bg-gradient-to-r from-red-200 to-orange-200 text-red-800 border-red-300">
                    {stats.streak}🔥
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer with dynamic auth button */}
      <div className="p-3 border-t-2 border-rainbow-200 bg-gradient-to-r from-green-100 to-blue-100 relative z-10">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
            >
              <DynamicAuthButton variant="sidebar" />
            </motion.div>
          ) : (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex justify-center"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  kidFriendlyEffects.playSound(SOUNDS.button_click);
                  // Will handle the same logic as DynamicAuthButton
                  if (isGuest) {
                    window.location.href = "/signup";
                  } else {
                    // logout logic would go here
                  }
                }}
                className="h-10 w-10 p-0 bg-gradient-to-r from-purple-200 to-pink-200 hover:from-purple-300 hover:to-pink-300 rounded-full border-2 border-white shadow-lg"
              >
                {isGuest ? (
                  <span className="text-lg">✨</span>
                ) : (
                  <span className="text-lg">🚪</span>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default SimplifiedChildSidebar;
