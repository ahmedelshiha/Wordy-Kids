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
import { jungleConfetti, getMascotForState } from "@/lib/jungleAdventureEffects";
import { JungleCollectiblesDisplay } from "@/components/JungleCollectiblesDisplay";

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
        "jungle-zone",
        "flex flex-col h-fit max-h-full",
        "transition-all duration-300",
        "relative border-4 border-yellow-400/50 rounded-3xl shadow-2xl",
        className,
      )}
    >
      {/* Simplified Sidebar Header */}
      <div className="p-3 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 relative z-10 rounded-t-3xl border-b-2 border-yellow-400/30">
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
              className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all duration-200 lg:hidden"
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
                <div className="jungle-card p-3 border-2 border-emerald-300/50 shadow-lg kid-card">
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center kid-text-big text-shadow">
                    <div className="jungle-progress-treasure mr-2">🏆</div>
                    🌿 Adventure Progress
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-white flex items-center">
                        <div className="jungle-progress-torch mr-1">⏳</div>
                        Adventure Time
                      </span>
                      <div className="jungle-collectible">
                        <span className="font-bold">{stats.sessionsThisWeek || 0}</span> 🔥
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-white flex items-center">
                        <div className="jungle-progress-book mr-1">📚</div>
                        Words Learned
                      </span>
                      <div className="jungle-collectible">
                        <span className="font-bold">{stats.wordsThisWeek || 0}</span> ⭐
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-white flex items-center">
                        <div className="jungle-progress-treasure mr-1">🏆</div>
                        Legendary Streak
                      </span>
                      <div className="jungle-collectible">
                        <span className="font-bold">{stats.timeThisWeek
                          ? `${Math.round(stats.timeThisWeek / 60)}h`
                          : "0h"}</span> 🌟
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Awesome Moments */}
              {stats?.recentActivity && (
                <div className="jungle-card p-4 border-2 border-pink-300/50 shadow-lg kid-card">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center kid-text-big text-shadow">
                    <div className="jungle-progress-icon mr-2">🎆</div>
                    🌿 Jungle Treasures!
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

              {/* Jungle Collectibles */}
              <JungleCollectiblesDisplay
                compact={true}
                className="w-full"
              />
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
                  "w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md border-2 border-white",
                  "bg-gradient-to-r transition-all duration-200",
                  profile.avatar?.color || "from-blue-400 to-purple-400",
                )}
              >
                {profile.avatar?.emoji || "🎯"}
              </div>

              {/* Collapsed Quick Stats */}
              <div className="flex flex-col items-center space-y-1">
                <Badge className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md">
                  L{profile.level}
                </Badge>
                {profile.streak > 0 && (
                  <Badge className="text-xs bg-orange-500 text-white px-2 py-1 rounded-md">
                    {profile.streak >= 7
                      ? "Legendary!"
                      : `${profile.streak} days`}
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Sidebar Footer */}
      <div className="p-4 border-t-2 border-yellow-400/30 bg-gradient-to-r from-orange-400/20 to-red-400/20 backdrop-blur-sm relative z-10 rounded-b-3xl">
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
                    navigate("/"); // Navigate to login page
                    if (onLogout) onLogout();
                  }
                }}
                className={`w-full py-3 text-sm rounded-xl font-bold shadow-lg transform hover:scale-105 transition-all duration-300 relative overflow-hidden ${
                  isGuest
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white"
                    : "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white"
                }`}
              >
                {isGuest ? (
                  <>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent"
                      animate={{
                        x: ["-100%", "100%"],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        },
                      }}
                    />
                    <UserPlus className="w-4 h-4 mr-2" />
                    <span>Create My Account! 🚀</span>
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
                <p className="text-xs text-slate-600 font-medium">
                  {isGuest
                    ? "It's super quick and totally free! ✨"
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
                    navigate("/"); // Navigate to login page
                    if (onLogout) onLogout();
                  }
                }}
                className={`h-10 w-10 p-0 text-white hover:text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
                  isGuest
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    : "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700"
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
