import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Target,
  BookOpen,
  Brain,
  Trophy,
  Settings,
  Users,
  LogOut,
  Shield,
  X,
  Sparkles,
  Star,
  Heart,
  Gamepad2,
  Map,
  Crown,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedMagicalAdventureMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSettingsClick: () => void;
  onParentClick: () => void;
  onAdminClick: () => void;
  achievementCount?: number;
  userRole?: "child" | "parent";
}

export function EnhancedMagicalAdventureMenu({
  activeTab,
  onTabChange,
  onSettingsClick,
  onParentClick,
  onAdminClick,
  achievementCount = 0,
  userRole = "child",
}: EnhancedMagicalAdventureMenuProps) {
  const { isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  // Enhanced magical primary tabs with better accessibility
  const primaryTabs = [
    {
      id: "dashboard",
      emoji: "🏠",
      gradientEmoji: "🌟",
      label: "Home",
      icon: Target,
      gradient: "from-purple-500 via-purple-400 to-pink-500",
      shadowColor: "shadow-purple-500/25",
      description: "Your magical home base",
    },
    {
      id: "learn",
      emoji: "📚",
      gradientEmoji: "✨",
      label: "Learn",
      icon: BookOpen,
      gradient: "from-emerald-500 via-green-400 to-teal-500",
      shadowColor: "shadow-emerald-500/25",
      description: "Discover new words",
    },
    {
      id: "quiz",
      emoji: "🎮",
      gradientEmoji: "🎯",
      label: "Quiz",
      icon: Brain,
      gradient: "from-rose-500 via-pink-400 to-red-500",
      shadowColor: "shadow-rose-500/25",
      description: "Test your knowledge",
    },
    {
      id: "achievements",
      emoji: "🏆",
      gradientEmoji: "🌟",
      label: "Trophies",
      icon: Trophy,
      gradient: "from-yellow-500 via-yellow-400 to-orange-500",
      shadowColor: "shadow-yellow-500/25",
      description: "View your achievements",
      badge: achievementCount > 0 ? achievementCount : undefined,
    },
  ];

  // Enhanced secondary menu with better categorization
  const secondaryMenuItems = [
    {
      id: "parent",
      emoji: "👨‍👩‍👧‍👦",
      gradientEmoji: "👑",
      label: "Family Zone",
      icon: Users,
      onClick: onParentClick,
      gradient: "from-indigo-500 to-purple-600",
      description: "For grown-ups",
      category: "family",
    },
    {
      id: "settings",
      emoji: "⚙️",
      gradientEmoji: "🛠️",
      label: "Settings",
      icon: Settings,
      onClick: onSettingsClick,
      gradient: "from-slate-500 to-gray-600",
      description: "Customize your experience",
      category: "tools",
    },
    {
      id: "adventure",
      emoji: "🗺️",
      gradientEmoji: "👑",
      label: "My Adventure",
      icon: Map,
      onClick: () => onTabChange("adventure"),
      gradient: "from-amber-500 to-orange-600",
      description: "Track your journey",
      category: "progress",
    },
    {
      id: "games",
      emoji: "🎯",
      gradientEmoji: "🎮",
      label: "Mini Games",
      icon: Gamepad2,
      onClick: () => onTabChange("games"),
      gradient: "from-blue-500 to-cyan-600",
      description: "Extra fun activities",
      category: "entertainment",
    },
    {
      id: "admin",
      emoji: "🛡️",
      gradientEmoji: "⚡",
      label: "Admin Panel",
      icon: Shield,
      onClick: onAdminClick,
      gradient: "from-red-500 to-pink-600",
      description: "Admin dashboard",
      category: "admin",
    },
    {
      id: "auth",
      emoji: isGuest ? "📝" : "👋",
      gradientEmoji: isGuest ? "✨" : "🌙",
      label: isGuest ? "Sign Up" : "Sign Out",
      icon: isGuest ? Users : LogOut,
      onClick: () => {
        if (isGuest) {
          navigate("/signup");
        } else {
          logout();
        }
        setShowMoreMenu(false);
      },
      gradient: isGuest
        ? "from-green-500 to-emerald-600"
        : "from-orange-500 to-red-600",
      description: isGuest ? "Join the adventure" : "See you soon",
      category: "account",
    },
  ];

  const handleIconClick = (tabId: string) => {
    setSelectedIcon(tabId);
    onTabChange(tabId);
    // Reset selection after animation
    setTimeout(() => setSelectedIcon(null), 300);
  };

  const toggleMoreMenu = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  return (
    <>
      {/* Enhanced Magical More Menu Overlay - Bottom positioned */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 backdrop-blur-sm"
              onClick={toggleMoreMenu}
            />

            {/* Bottom-positioned menu */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-br from-white via-purple-50/95 to-pink-50/95 backdrop-blur-lg rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <motion.div
                  className="w-12 h-1.5 bg-gray-300 rounded-full cursor-pointer"
                  whileHover={{ scale: 1.1, backgroundColor: "#9CA3AF" }}
                  onClick={toggleMoreMenu}
                />
              </div>

              {/* Header with enhanced animations */}
              <div className="relative px-6 py-4 border-b border-purple-100">
                {/* Magical background elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <motion.div
                    animate={{
                      x: [0, 10, 0],
                      y: [0, -5, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute top-2 left-4 text-2xl"
                  >
                    🌿
                  </motion.div>
                  <motion.div
                    animate={{
                      x: [0, -8, 0],
                      y: [0, 8, 0],
                      rotate: [0, -3, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute top-6 right-6 text-xl"
                  >
                    🦋
                  </motion.div>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute bottom-2 left-8 text-lg"
                  >
                    🌺
                  </motion.div>
                </div>

                <div className="text-center relative z-10">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 360, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="inline-block text-3xl mb-3"
                  >
                    🌟
                  </motion.div>

                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    ✨ Magical Adventure Menu ✨
                  </h3>

                  <p className="text-sm text-purple-600 bg-white/80 px-4 py-2 rounded-full border-2 border-purple-200 inline-block">
                    🗺️ Choose your next adventure! 🌈
                  </p>
                </div>
              </div>

              {/* Enhanced menu grid with better categorization */}
              <div className="px-4 py-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  {secondaryMenuItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 300,
                      }}
                    >
                      <Button
                        onClick={() => {
                          item.onClick();
                          setShowMoreMenu(false);
                        }}
                        className={cn(
                          "group relative w-full h-24 bg-gradient-to-br",
                          item.gradient,
                          "text-white border-0 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden",
                        )}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                        {/* Content */}
                        <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                          <motion.div
                            className="text-2xl"
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {item.emoji}
                          </motion.div>

                          <span className="text-xs font-bold leading-tight text-center">
                            {item.label}
                          </span>

                          <span className="text-xs opacity-80 leading-tight text-center">
                            {item.description}
                          </span>

                          {item.badge && (
                            <Badge className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs min-w-[20px] h-5">
                              {item.badge}
                            </Badge>
                          )}
                        </div>

                        {/* Floating gradient emoji */}
                        <motion.div
                          className="absolute top-1 right-1 text-sm opacity-60"
                          animate={{
                            y: [0, -3, 0],
                            rotate: [0, 5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          {item.gradientEmoji}
                        </motion.div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Enhanced close button */}
              <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
                <Button
                  onClick={toggleMoreMenu}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold transition-all transform hover:scale-105 shadow-lg relative overflow-hidden group"
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      ✨
                    </motion.span>
                    Close Adventure Menu
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      🦋
                    </motion.span>
                  </span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400 border-t-4 border-yellow-500 shadow-2xl backdrop-blur-lg">
          <div className="flex items-center justify-around px-1 py-2 safe-area-padding-bottom">
            {/* Enhanced Primary Navigation Tabs */}
            {primaryTabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => handleIconClick(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative min-w-0 flex-1 mx-1 group",
                  activeTab === tab.id
                    ? "bg-white/90 shadow-lg transform scale-105"
                    : "hover:bg-white/30",
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Enhanced emoji with gradient background */}
                <div
                  className={cn(
                    "relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br",
                    tab.gradient,
                    tab.shadowColor,
                    "shadow-lg group-hover:shadow-xl transition-all duration-300",
                  )}
                >
                  <motion.div
                    className="text-2xl"
                    animate={
                      selectedIcon === tab.id
                        ? {
                            scale: [1, 1.3, 1],
                            rotate: [0, 10, 0],
                          }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                  >
                    {tab.emoji}
                  </motion.div>

                  {/* Badge for achievements */}
                  {tab.badge && (
                    <Badge className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs min-w-[20px] h-5 z-10">
                      {tab.badge}
                    </Badge>
                  )}

                  {/* Gradient emoji overlay */}
                  <motion.div
                    className="absolute -top-1 -right-1 text-xs"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 360, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {tab.gradientEmoji}
                  </motion.div>
                </div>

                {/* Enhanced label */}
                <span
                  className={cn(
                    "text-xs font-bold leading-none text-center whitespace-nowrap transition-colors duration-300",
                    activeTab === tab.id
                      ? "text-purple-700"
                      : "text-purple-600 group-hover:text-purple-700",
                  )}
                >
                  {tab.label}
                </span>

                {/* Active indicator with better animation */}
                <AnimatePresence>
                  {activeTab === tab.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg"
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            ))}

            {/* Enhanced More Menu Button */}
            <motion.button
              onClick={toggleMoreMenu}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative min-w-0 flex-1 mx-1 group",
                showMoreMenu
                  ? "bg-white/90 shadow-lg transform scale-105"
                  : "hover:bg-white/30",
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <motion.div
                  className="text-2xl"
                  animate={
                    showMoreMenu
                      ? {
                          rotate: [0, 180, 360],
                          scale: [1, 1.2, 1],
                        }
                      : {}
                  }
                  transition={{ duration: 0.5 }}
                >
                  🎪
                </motion.div>

                <motion.div
                  className="absolute -top-1 -right-1 text-xs"
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, -360, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  ✨
                </motion.div>
              </div>

              <span
                className={cn(
                  "text-xs font-bold leading-none text-center whitespace-nowrap transition-colors duration-300",
                  showMoreMenu
                    ? "text-purple-700"
                    : "text-purple-600 group-hover:text-purple-700",
                )}
              >
                More
              </span>

              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full shadow-lg"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}
