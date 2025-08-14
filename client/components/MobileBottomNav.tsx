import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  activeTab: string;
  userRole: 'child' | 'parent';
  onTabChange: (tab: string) => void;
  onSettingsClick: () => void;
  onParentClick: () => void;
  onBackToChild?: () => void;
  onAdminClick: () => void;
  onSignOut: () => void;
  showMoreMenu: boolean;
  onMoreToggle: () => void;
  achievementCount?: number;
}

export function MobileBottomNav({
  activeTab,
  userRole,
  onTabChange,
  onSettingsClick,
  onParentClick,
  onBackToChild,
  onAdminClick,
  onSignOut,
  showMoreMenu,
  onMoreToggle,
  achievementCount = 0,
}: MobileBottomNavProps) {
  // Different tabs based on user role
  const primaryTabs = userRole === 'parent' ? [
    {
      id: "back-to-child",
      emoji: "👦",
      label: "Back to Learning",
      icon: ArrowLeft,
      color: "from-educational-blue to-educational-purple",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      badge: undefined,
      action: onBackToChild,
    },
    {
      id: "parent-home",
      emoji: "👨‍👩‍👧‍👦",
      label: "Parent Dashboard",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      badge: undefined,
      action: () => {}, // Already in parent mode
    }
  ] : [
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
      emoji: "🌟",
      label: "My Journey",
      icon: Trophy,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
      badge: undefined,
    },
  ];

  const secondaryMenuItems = userRole === 'parent' ? [
    {
      id: "back-to-learning",
      emoji: "👦",
      label: "Back to Learning",
      icon: ArrowLeft,
      onClick: onBackToChild || (() => {}),
    },
    {
      id: "child-dashboard",
      emoji: "🏠",
      label: "Child Dashboard",
      icon: Home,
      onClick: () => {
        onBackToChild?.();
        onTabChange('dashboard');
      },
    },
    {
      id: "child-learning",
      emoji: "📚",
      label: "Word Library",
      icon: BookOpen,
      onClick: () => {
        onBackToChild?.();
        onTabChange('learn');
      },
    },
    {
      id: "settings",
      emoji: "⚙️",
      label: "Settings",
      icon: Settings,
      onClick: onSettingsClick,
    },
    {
      id: "signout",
      emoji: "👋",
      label: "Sign Out",
      icon: LogOut,
      onClick: onSignOut,
    },
  ] : [
    {
      id: "parent",
      emoji: "👨‍👩‍👧‍👦",
      label: "Parent Zone",
      icon: Users,
      onClick: onParentClick,
    },
    {
      id: "admin",
      emoji: "🛡️",
      label: "Admin",
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
      id: "signout",
      emoji: "👋",
      label: "Sign Out",
      icon: LogOut,
      onClick: onSignOut,
    },
  ];

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={onMoreToggle}
          />
          <div className="absolute bottom-20 left-3 right-3 bg-white rounded-3xl shadow-2xl p-4 border-4 border-rainbow max-h-[70vh] overflow-y-auto">
            <div className="text-center mb-4">
              <div className="text-2xl mb-2">🎪</div>
              <h3 className="text-lg font-bold text-gray-800">
                More Fun Stuff!
              </h3>
              <p className="text-sm text-gray-600">Tap what you want to do!</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {secondaryMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    onMoreToggle();
                  }}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 active:from-blue-100 active:to-purple-100 transition-all duration-200 transform active:scale-95 border-2 border-purple-200 min-h-[80px] justify-center"
                >
                  <div className="text-3xl">{item.emoji}</div>
                  <span className="text-sm font-bold text-gray-700">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={onMoreToggle}
              className="w-full mt-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 font-medium"
            >
              Close Menu
            </button>
          </div>
        </div>
      )}

      {/* Optimized Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div className="bg-white/95 backdrop-blur-lg border-t-4 border-rainbow shadow-2xl safe-area-padding-bottom">
          <div className="flex items-center justify-around px-1 py-2">
            {/* Primary Navigation Tabs */}
            {primaryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.action) {
                    tab.action();
                  } else {
                    onTabChange(tab.id);
                  }
                }}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 transform active:scale-95 relative min-w-0 flex-1 mx-0.5 min-h-[60px] justify-center",
                  (activeTab === tab.id || (userRole === 'parent' && tab.id === 'parent-home'))
                    ? `bg-gradient-to-br ${tab.color} text-white shadow-lg`
                    : `${tab.bgColor} ${tab.textColor}`,
                )}
              >
                {/* Emoji Icon */}
                <div
                  className={cn(
                    "text-xl transition-transform duration-200",
                    activeTab === tab.id ? "scale-110" : "",
                  )}
                >
                  {tab.emoji}
                </div>

                {/* Label */}
                <span className="text-xs font-semibold leading-tight text-center truncate max-w-full">
                  {tab.label}
                </span>

                {/* Achievement Badge */}
                {tab.badge && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 animate-bounce">
                    {tab.badge}
                  </Badge>
                )}

                {/* Active Indicator */}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
                )}
              </button>
            ))}

            {/* More Menu Button */}
            <button
              onClick={onMoreToggle}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 transform active:scale-95 min-w-0 flex-1 mx-0.5 min-h-[60px] justify-center",
                showMoreMenu
                  ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-blue-100 text-blue-600",
              )}
            >
              <div
                className={cn(
                  "text-xl transition-transform duration-200",
                  showMoreMenu ? "rotate-90 scale-110" : "",
                )}
              >
                🎪
              </div>
              <span className="text-xs font-semibold leading-tight text-center">
                More
              </span>

              {showMoreMenu && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
