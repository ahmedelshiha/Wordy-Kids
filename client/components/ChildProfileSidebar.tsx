import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EnhancedChildProfileCard } from "@/components/EnhancedChildProfileCard";
import { FriendlyMascot } from "@/components/FriendlyMascot";
import {
  kidFriendlyEffects,
  SOUNDS,
  celebrate,
} from "@/lib/kidFriendlyEffects";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  RefreshCw,
  Calendar,
  TrendingUp,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChildProfileSidebarProps {
  profile: any;
  stats?: any;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onProfileEdit?: () => void;
  onQuickAction?: (action: string) => void;
  onLogout?: () => void;
  showTimeOfDay?: boolean;
  showWeeklyProgress?: boolean;
  position?: "left" | "right";
}

export const ChildProfileSidebar: React.FC<ChildProfileSidebarProps> = ({
  profile,
  stats,
  className,
  isCollapsed = false,
  onToggleCollapse,
  onProfileEdit,
  onQuickAction,
  onLogout,
  showTimeOfDay = true,
  showWeeklyProgress = true,
  position = "left",
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeOfDayGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12)
      return {
        greeting: "Good morning",
        icon: "🌅",
        color: "from-orange-200 to-yellow-200",
      };
    if (hour < 17)
      return {
        greeting: "Good afternoon",
        icon: "☀️",
        color: "from-blue-200 to-cyan-200",
      };
    return {
      greeting: "Good evening",
      icon: "🌙",
      color: "from-purple-200 to-indigo-200",
    };
  };

  const timeInfo = getTimeOfDayGreeting();

  const sidebarVariants = {
    expanded: {
      width: position === "left" ? "280px" : "280px",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    collapsed: {
      width: position === "left" ? "60px" : "60px",
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

  if (!profile) return null;

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      className={cn(
        "bg-transparent", // Let parent background show through
        "flex flex-col h-fit max-h-full",
        "transition-all duration-500",
        "relative backdrop-blur-md",
        className,
      )}
    >
      {/* Enhanced Sidebar Header */}
      <div className="p-2 bg-gradient-to-r from-white/60 to-blue-50/60 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex-1"
              ></motion.div>
            )}
          </AnimatePresence>

          {/* Collapse Toggle */}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                kidFriendlyEffects.playSound(SOUNDS.button_click);
                onToggleCollapse();
              }}
              className="h-10 w-10 p-0 bg-gradient-to-r from-yellow-200 to-orange-200 hover:from-yellow-300 hover:to-orange-300 shadow-lg border-2 border-white rounded-full transition-all duration-300 hover:scale-110"
            >
              {isCollapsed ? (
                position === "left" ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )
              ) : position === "left" ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="flex-1 p-2 relative z-10">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="space-y-2"
            >
              <EnhancedChildProfileCard
                profile={profile}
                stats={stats}
                isCompact={true}
                showQuickActions={false}
                onProfileEdit={onProfileEdit}
                onQuickAction={onQuickAction}
                animationEnabled={false}
              />

              {/* Weekly Adventure Progress */}
              {showWeeklyProgress && stats && (
                <div className="bg-gradient-to-r from-green-50/80 to-blue-50/80 rounded-lg p-3 border border-green-200/50 shadow-sm backdrop-blur-sm">
                  <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                    🏆 This Week
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-700 flex items-center">
                        🎮 Learning Sessions
                      </span>
                      <Badge className="text-xs bg-yellow-200 text-yellow-800 border-yellow-300">
                        {stats.sessionsThisWeek || 0} ✨
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-700 flex items-center">
                        📚 Words Mastered
                      </span>
                      <Badge className="text-xs bg-blue-200 text-blue-800 border-blue-300">
                        {stats.wordsThisWeek || 0} 🎆
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-700 flex items-center">
                        ⏰ Adventure Time
                      </span>
                      <Badge className="text-xs bg-purple-200 text-purple-800 border-purple-300">
                        {stats.timeThisWeek
                          ? `${Math.round(stats.timeThisWeek / 60)}h`
                          : "0h"}{" "}
                        🚀
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Awesome Moments */}
              {stats?.recentActivity && (
                <div className="bg-gradient-to-r from-pink-50/80 to-purple-50/80 rounded-xl p-4 border border-pink-200/50 shadow-md backdrop-blur-sm">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-pink-600" />
                    🎉 Awesome Moments!
                  </h4>
                  <div className="space-y-2">
                    {stats.recentActivity
                      .slice(0, 3)
                      .map((activity: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs font-medium text-gray-700 truncate">
                            ✨ {activity.description}
                          </span>
                          <Badge className="text-xs ml-2 bg-orange-200 text-orange-800 border-orange-300">
                            +{activity.points} 🎆
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex flex-col items-center space-y-4"
            >
              {/* Collapsed Profile Avatar */}
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white/50",
                  "bg-gradient-to-r animate-pulse backdrop-blur-sm",
                  profile.avatar?.color || "from-purple-400/80 to-pink-400/80",
                )}
              >
                {profile.avatar?.emoji || "🎯"}
              </div>

              {/* Collapsed Quick Stats */}
              <div className="flex flex-col items-center space-y-2">
                <Badge className="text-xs bg-gradient-to-r from-yellow-200 to-orange-200 text-orange-800 border-orange-300 font-bold">
                  🎆 L{profile.level}
                </Badge>
                {profile.streak > 0 && (
                  <Badge className="text-xs bg-gradient-to-r from-red-200 to-orange-200 text-red-800 border-red-300 animate-pulse">
                    {profile.streak}🔥
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Sidebar Footer */}
      <div className="p-4 border-t border-purple-200/30 bg-gradient-to-r from-white/60 to-purple-50/60 backdrop-blur-sm relative z-10">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="space-y-2"
            >
              {onLogout && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    kidFriendlyEffects.playSound(SOUNDS.button_click);
                    onLogout?.();
                  }}
                  className="w-full text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl font-medium"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  🔄 Switch Friends
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex flex-col items-center space-y-2"
            >
              {onLogout && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    kidFriendlyEffects.playSound(SOUNDS.button_click);
                    onLogout?.();
                  }}
                  className="h-10 w-10 p-0 text-gray-700 hover:text-gray-900 bg-white/80 hover:bg-white rounded-full border-2 border-gray-200 shadow-md transition-all duration-300 hover:scale-110"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default ChildProfileSidebar;
