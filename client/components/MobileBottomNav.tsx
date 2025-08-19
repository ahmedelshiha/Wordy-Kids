import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Target,
  BookOpen,
  Brain,
  Trophy,
  MoreHorizontal,
  Settings,
  Users,
  LogOut,
  Sword,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSettingsClick: () => void;
  onParentClick: () => void;
  onAdminClick: () => void;
  showMoreMenu: boolean;
  onMoreToggle: () => void;
  achievementCount?: number;
  userRole?: "child" | "parent";
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  onSettingsClick,
  onParentClick,
  onAdminClick,
  showMoreMenu,
  onMoreToggle,
  achievementCount = 0,
  userRole = "child",
}: MobileBottomNavProps) {
  const { isGuest, logout } = useAuth();
  const navigate = useNavigate();
  // Dynamic primary tabs based on user role
  const baseTabs = [
    {
      id: "dashboard",
      emoji: "🏠",
      label: "Home",
      icon: Target,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      badge: undefined,
    },
    {
      id: "learn",
      emoji: "📚",
      label: "Learn",
      icon: BookOpen,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      badge: undefined,
    },
    {
      id: "quiz",
      emoji: "🎮",
      label: "Quiz",
      icon: Brain,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
      badge: undefined,
    },
    {
      id: "progress",
      emoji: "📊",
      label: userRole === "parent" ? "Reports" : "My Journey",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
      badge: undefined,
    },
  ];

  // Kid-friendly primary tabs with custom image icons
  const primaryTabs = [
    {
      id: "dashboard",
      image: "/images/icons/home.png",
      label: "Home",
      icon: Target,
      activeGradient: "kid-gradient-happy",
      hoverGradient: "kid-gradient-learn",
      sparkle: "✨🌟",
    },
    {
      id: "learn",
      image: "/images/icons/books.png",
      label: "Learn",
      icon: BookOpen,
      activeGradient: "kid-gradient-learn",
      hoverGradient: "kid-gradient-success",
      sparkle: "✨🌟",
    },
    {
      id: "quiz",
      image: "/images/icons/game.png",
      label: "Quiz",
      icon: Brain,
      activeGradient: "kid-gradient-adventure",
      hoverGradient: "kid-gradient-magic",
      sparkle: "✨🌟",
    },
    {
      id: "progress",
      image: "/images/icons/map.png",
      label: "Map",
      icon: Trophy,
      activeGradient: "kid-gradient-success",
      hoverGradient: "kid-gradient-adventure",
      sparkle: "✨🌟",
    },
  ];

  // Kid-friendly secondary menu items with magical theme
  const secondaryMenuItems = [
    {
      id: "parent",
      emoji: "👨‍👩‍👧‍👦",
      label: "Family Zone",
      icon: Users,
      onClick: onParentClick,
      sparkle: "👑",
    },
    {
      id: "admin",
      emoji: "🛡️",
      label: "Admin Dashboard",
      icon: Shield,
      onClick: onAdminClick,
    },
    {
      id: "settings",
      emoji: "⚙️",
      label: "Settings",
      icon: Settings,
      onClick: onSettingsClick,
    },
    {
      id: "auth",
      emoji: isGuest ? "📝" : "👋",
      label: isGuest ? "Sign Up" : "Sign Out",
      icon: isGuest ? Users : LogOut,
      onClick: () => {
        if (isGuest) {
          navigate("/signup");
        } else {
          logout();
        }
        onMoreToggle();
      },
    },
  ];

  return (
    <>
      {/* Magical More Menu Overlay - Kid-friendly styling */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={onMoreToggle}
          />
          <div className="absolute bottom-12 left-3 right-3 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl shadow-2xl p-4 border-4 border-rainbow max-h-[70vh] overflow-y-auto animate-kid-pulse-glow">
            <div className="text-center mb-4">
              <div className="text-2xl sm:text-3xl mb-2 animate-mascot-bounce">
                🎪
              </div>
              <h3 className="text-lg font-kid-friendly font-bold text-purple-800 text-shadow">
                Magical Adventure Menu! ✨
              </h3>
              <p className="text-sm font-kid-friendly text-purple-600">
                Tap to explore new worlds!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {secondaryMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    onMoreToggle();
                  }}
                  className="kid-nav-item bg-white hover:kid-gradient-magic hover:text-white border-2 border-purple-200 kid-interactive min-h-[90px] justify-center"
                >
                  <div className="text-2xl sm:text-3xl animate-gentle-float">
                    {item.emoji}
                  </div>
                  <span className="text-sm font-kid-friendly font-bold">
                    {item.label}
                  </span>
                  {item.sparkle && (
                    <div className="ml-auto animate-kid-magic-sparkle text-xs">
                      {item.sparkle}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={onMoreToggle}
              className="w-full mt-4 py-3 rounded-2xl kid-gradient-magic text-white font-kid-friendly font-bold transition-all transform active:scale-95 shadow-lg kid-button"
            >
              Close Magic Menu ✨
            </button>
          </div>
        </div>
      )}

      {/* Magical Kid-Friendly Bottom Navigation Bar */}
      <div className="fixed bottom-8 left-0 right-0 z-30 lg:hidden">
        <div className="bg-[#FFC107] border-t-2 border-rainbow shadow-2xl safe-area-padding-bottom backdrop-blur-lg">
          <div className="flex items-center justify-around px-0.5 py-0 -my-6">
            {/* Primary Navigation Tabs - Kid Style */}
            {primaryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "kid-nav-item flex flex-col items-center gap-0 p-0 rounded-lg transition-all duration-200 transform active:scale-95 relative min-w-0 flex-1 mx-0.5 min-h-[10px] justify-center overflow-visible",
                  activeTab === tab.id
                    ? "text-[#1A237E] shadow-lg kid-button active"
                    : "text-[#1A237E] hover:text-[#1A237E] kid-interactive",
                )}
              >
                {/* Magical Emoji Icon & Label Combined */}
                <div
                  className={cn(
                    "flex flex-col items-center transition-transform duration-200 -mt-2",
                    tab.id === "dashboard" && "animate-mascot-bounce",
                    tab.id === "learn" && "animate-gentle-float",
                    tab.id === "quiz" && "animate-mascot-happy",
                    tab.id === "progress" && "animate-gentle-bounce",
                  )}
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center">
                    <img
                      src={tab.image}
                      alt={tab.label}
                      className="w-full h-full object-contain filter drop-shadow-lg"
                    />
                  </div>
                  <span className="text-xs font-kid-friendly font-bold leading-none text-center text-[#1A237E] whitespace-nowrap mt-1">
                    {tab.label}
                  </span>
                </div>

                {/* Magical Sparkle for Active Tab */}
                {activeTab === tab.id && (
                  <div className="absolute -top-1 -right-1 animate-kid-magic-sparkle text-xs">
                    {tab.sparkle}
                  </div>
                )}

                {/* Active Indicator - Rainbow dot */}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#1A237E] rounded-full shadow-lg animate-gentle-bounce"></div>
                )}
              </button>
            ))}

            {/* Magical More Menu Button */}
            <button
              onClick={onMoreToggle}
              className={cn(
                "kid-nav-item flex flex-col items-center gap-0 p-0 rounded-lg transition-all duration-200 transform active:scale-95 min-w-0 flex-1 mx-0.5 min-h-[10px] justify-center overflow-visible",
                showMoreMenu
                  ? "text-[#1A237E] shadow-lg kid-button active"
                  : "text-[#1A237E] hover:text-[#1A237E] kid-interactive",
              )}
            >
              <div
                className={cn(
                  "flex flex-col items-center transition-transform duration-200 -mt-2",
                  showMoreMenu
                    ? "rotate-90 scale-110 animate-mascot-bounce"
                    : "animate-gentle-float",
                )}
              >
                <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                  🎪
                </div>
                <span className="text-xs font-kid-friendly font-bold leading-none text-center text-[#1A237E] whitespace-nowrap mt-1">
                  More
                </span>
              </div>

              {/* Magical sparkle for active more menu */}
              {showMoreMenu && (
                <div className="absolute -top-1 -right-1 animate-kid-magic-sparkle text-xs">
                  ✨
                </div>
              )}

              {showMoreMenu && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#1A237E] rounded-full shadow-lg animate-gentle-bounce"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
