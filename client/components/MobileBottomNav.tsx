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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSettingsClick: () => void;
  onParentClick: () => void;
  onAdminClick: () => void;
  onSignOut: () => void;
  showMoreMenu: boolean;
  onMoreToggle: () => void;
  achievementCount?: number;
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  onSettingsClick,
  onParentClick,
  onAdminClick,
  onSignOut,
  showMoreMenu,
  onMoreToggle,
  achievementCount = 0,
}: MobileBottomNavProps) {
  const primaryTabs = [
    {
      id: "dashboard",
      emoji: "🏠",
      label: "Home",
      icon: Target,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      id: "learn",
      emoji: "📚",
      label: "Learn",
      icon: () => (
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F122959266afa4d539a05a574b1531c32%2Fa3e1599156fb43479f1df1383fc15be2?format=webp&width=800"
          alt="Wordy the Owl"
          className="icon-sm"
        />
      ),
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      id: "quiz",
      emoji: "🎮",
      label: "Quiz",
      icon: Brain,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
    },
  ];

  const secondaryMenuItems = [
    {
      id: "progress",
      emoji: "🌟",
      label: "My Journey",
      icon: Trophy,
      onClick: () => onTabChange("progress"),
    },
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
          <div className="absolute bottom-20 left-4 right-4 bg-white rounded-3xl shadow-2xl p-4 border-4 border-rainbow">
            <div className="text-center mb-4">
              <div className="text-2xl mb-2">🎪</div>
              <h3 className="text-lg font-bold text-gray-800">
                More Fun Stuff!
              </h3>
              <p className="text-sm text-gray-600">Tap what you want to do!</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {secondaryMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick();
                    onMoreToggle();
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-purple-200"
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

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div className="bg-white/95 backdrop-blur-lg border-t-4 border-rainbow shadow-2xl">
          <div className="flex items-center justify-around px-2 py-3">
            {/* Primary Navigation Tabs */}
            {primaryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 relative min-w-0 flex-1 mx-1",
                  activeTab === tab.id
                    ? `bg-gradient-to-br ${tab.color} text-white shadow-lg animate-gentle-float`
                    : `${tab.bgColor} ${tab.textColor} hover:shadow-md`,
                )}
              >
                {/* Emoji Icon */}
                <div
                  className={cn(
                    "text-2xl transition-transform duration-300",
                    activeTab === tab.id ? "animate-sparkle" : "",
                  )}
                >
                  {tab.emoji}
                </div>

                {/* Label */}
                <span className="text-xs font-bold leading-tight text-center">
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
                "flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 min-w-0 flex-1 mx-1",
                showMoreMenu
                  ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg"
                  : "bg-blue-100 text-blue-600 hover:shadow-md",
              )}
            >
              <div
                className={cn(
                  "text-2xl transition-transform duration-300",
                  showMoreMenu ? "rotate-90" : "",
                )}
              >
                🎪
              </div>
              <span className="text-xs font-bold leading-tight text-center">
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
