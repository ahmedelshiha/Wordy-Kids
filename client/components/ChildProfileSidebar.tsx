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
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
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
  const { isGuest, logout } = useAuth();
  const navigate = useNavigate();

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
        "bg-gradient-to-b from-educational-blue/20 via-educational-purple/20 to-educational-pink/20", // Match main game background
        "flex flex-col h-fit max-h-full",
        "transition-all duration-500",
        "relative backdrop-blur-md border border-white/30 rounded-2xl shadow-xl",
        "kid-card", // Apply kid-friendly styling
        className,
      )}
    >
      {/* Enhanced Sidebar Header */}
      <div className="p-2 bg-gradient-to-r from-educational-blue/40 via-educational-purple/40 to-educational-pink/40 backdrop-blur-sm relative z-10 rounded-t-2xl border-b border-white/20">
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

          {/* Collapse Toggle - Hidden on Desktop */}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                kidFriendlyEffects.playSound(SOUNDS.button_click);
                onToggleCollapse();
              }}
              className="h-10 w-10 p-0 bg-gradient-to-r from-educational-yellow to-educational-orange hover:from-educational-yellow-light hover:to-educational-orange-light shadow-xl border-2 border-white/80 rounded-full transition-all duration-300 hover:scale-110 animate-gentle-bounce lg:hidden"
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
                <div className="bg-gradient-to-r from-educational-green/20 to-educational-blue/20 rounded-xl p-3 border border-educational-green/30 shadow-lg backdrop-blur-sm kid-card">
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center kid-text-big text-shadow">
                    <TrendingUp className="w-4 h-4 mr-1 text-educational-yellow" />
                    🏆 This Week
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-700 flex items-center">
                        🎮 Learning Sessions
                      </span>
                      <Badge className="text-xs bg-gradient-to-r from-educational-yellow to-educational-orange text-white border-educational-yellow shadow-md font-bold">
                        {stats.sessionsThisWeek || 0} ✨
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-700 flex items-center">
                        📚 Words Mastered
                      </span>
                      <Badge className="text-xs bg-gradient-to-r from-educational-blue to-educational-purple text-white border-educational-blue shadow-md font-bold">
                        {stats.wordsThisWeek || 0} 🎆
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-700 flex items-center">
                        ⏰ Adventure Time
                      </span>
                      <Badge className="text-xs bg-gradient-to-r from-educational-purple to-educational-pink text-white border-educational-purple shadow-md font-bold">
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
                <div className="bg-gradient-to-r from-educational-pink/20 to-educational-purple/20 rounded-xl p-4 border border-educational-pink/30 shadow-lg backdrop-blur-sm kid-card">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center kid-text-big text-shadow">
                    <Activity className="w-5 h-5 mr-2 text-educational-yellow" />
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
                          <Badge className="text-xs ml-2 bg-gradient-to-r from-educational-orange to-educational-yellow text-white border-educational-orange shadow-md font-bold animate-pulse">
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
                  "w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-xl border-3 border-white/80",
                  "bg-gradient-to-r animate-gentle-bounce backdrop-blur-sm kid-gradient-magic",
                  profile.avatar?.color || "from-educational-purple to-educational-pink",
                )}
              >
                {profile.avatar?.emoji || "🎯"}
              </div>

              {/* Collapsed Quick Stats */}
              <div className="flex flex-col items-center space-y-2">
                <Badge className="text-xs bg-gradient-to-r from-educational-yellow to-educational-orange text-white border-educational-yellow shadow-lg font-bold animate-pulse">
                  🎆 L{profile.level}
                </Badge>
                {profile.streak > 0 && (
                  <Badge className="text-xs bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white border-yellow-400 shadow-xl font-bold animate-pulse kid-gradient-celebration">
                    {profile.streak >= 7 ? "🏆 LEGENDARY!" : `${profile.streak}🔥`}
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Sidebar Footer */}
      <div className="p-4 border-t border-educational-purple/30 bg-gradient-to-r from-educational-blue/40 via-educational-purple/40 to-educational-pink/40 backdrop-blur-sm relative z-10 rounded-b-2xl">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="space-y-2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  kidFriendlyEffects.playSound(SOUNDS.button_click);
                  if (isGuest) {
                    navigate("/signup");
                  } else {
                    logout();
                    if (onLogout) onLogout();
                  }
                }}
                className={`w-full text-xs text-white hover:text-white hover:bg-white/20 rounded-xl font-bold border border-white/20 shadow-md transition-all duration-300 hover:scale-105 ${
                  isGuest
                    ? "bg-gradient-to-r from-educational-yellow/40 to-educational-orange/40 animate-pulse"
                    : "bg-gradient-to-r from-educational-pink/30 to-educational-purple/30"
                }`}
              >
                {isGuest ? (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    ✨ Join Adventure!
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 mr-2" />
                    👋 See You Later!
                  </>
                )}
              </Button>
              {/* Dynamic message below button */}
              <div className="text-center">
                <p className="text-xs text-white/80 font-medium">
                  {isGuest
                    ? "Save your progress & unlock more!"
                    : "Thanks for learning with us!"}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex flex-col items-center space-y-2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  kidFriendlyEffects.playSound(SOUNDS.button_click);
                  if (isGuest) {
                    navigate("/signup");
                  } else {
                    logout();
                    if (onLogout) onLogout();
                  }
                }}
                className={`h-10 w-10 p-0 text-white hover:text-white rounded-full border-2 border-white/80 shadow-xl transition-all duration-300 hover:scale-110 animate-gentle-bounce ${
                  isGuest
                    ? "bg-gradient-to-r from-educational-yellow to-educational-orange animate-pulse"
                    : "bg-gradient-to-r from-educational-pink to-educational-purple hover:from-educational-pink-light hover:to-educational-purple-light"
                }`}
              >
                {isGuest ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default ChildProfileSidebar;
