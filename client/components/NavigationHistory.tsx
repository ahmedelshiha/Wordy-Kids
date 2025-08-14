import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  History,
  Clock,
  ArrowRight,
  Target,
  BookOpen,
  Brain,
  Trophy,
  Users,
  Sword,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

interface NavigationItem {
  tab: string;
  timestamp: number;
  category?: string;
  mode?: string;
  userRole: "child" | "parent";
}

interface NavigationHistoryProps {
  currentTab: string;
  currentRole: "child" | "parent";
  onNavigate: (tab: string, role?: "child" | "parent") => void;
  className?: string;
}

export function NavigationHistory({
  currentTab,
  currentRole,
  onNavigate,
  className,
}: NavigationHistoryProps) {
  const [history, setHistory] = useState<NavigationItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Add current location to history
  useEffect(() => {
    const newItem: NavigationItem = {
      tab: currentTab,
      timestamp: Date.now(),
      userRole: currentRole,
    };

    setHistory((prev) => {
      // Remove duplicates and limit to 10 items
      const filtered = prev.filter(
        (item) =>
          !(item.tab === newItem.tab && item.userRole === newItem.userRole),
      );
      return [newItem, ...filtered].slice(0, 10);
    });
  }, [currentTab, currentRole]);

  const getTabInfo = (tab: string) => {
    const tabs: Record<
      string,
      { label: string; icon: React.ComponentType<any>; color: string }
    > = {
      dashboard: {
        label: "Dashboard",
        icon: Target,
        color: "bg-purple-100 text-purple-700",
      },
      learn: {
        label: "Word Library",
        icon: BookOpen,
        color: "bg-green-100 text-green-700",
      },
      quiz: {
        label: "Quiz Time",
        icon: Brain,
        color: "bg-pink-100 text-pink-700",
      },
      progress: {
        label: "My Journey",
        icon: Trophy,
        color: "bg-yellow-100 text-yellow-700",
      },
      adventure: {
        label: "Adventure",
        icon: Sword,
        color: "bg-blue-100 text-blue-700",
      },
      parent: {
        label: "Parent Dashboard",
        icon: Users,
        color: "bg-purple-100 text-purple-700",
      },
    };
    return (
      tabs[tab] || {
        label: tab,
        icon: Target,
        color: "bg-gray-100 text-gray-700",
      }
    );
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ago`;
    } else if (seconds > 10) {
      return `${seconds}s ago`;
    } else {
      return "just now";
    }
  };

  const recentHistory = history.slice(1, 6); // Exclude current item, show last 5

  if (recentHistory.length === 0) {
    return null;
  }

  return (
    <Card className={`${className} border-gray-200 shadow-sm`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-gray-600" />
            Recent Locations
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            <ChevronDown
              className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {recentHistory.slice(0, isExpanded ? 5 : 3).map((item, index) => {
            const tabInfo = getTabInfo(item.tab);
            const Icon = tabInfo.icon;

            return (
              <Button
                key={`${item.tab}-${item.timestamp}`}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(item.tab, item.userRole)}
                className="w-full justify-start h-auto p-2 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-1.5 rounded-lg ${tabInfo.color}`}>
                    <Icon className="w-3 h-3" />
                  </div>

                  <div className="flex-1 text-left">
                    <div className="text-xs font-medium text-gray-800">
                      {tabInfo.label}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.timestamp)}
                      {item.userRole === "parent" && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-1 py-0"
                        >
                          Parent
                        </Badge>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </div>
              </Button>
            );
          })}
        </div>

        {recentHistory.length > 3 && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              {isExpanded
                ? "Showing all recent"
                : `${recentHistory.length - 3} more location${recentHistory.length - 3 !== 1 ? "s" : ""}`}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact floating version
export function FloatingNavigationHistory({
  currentTab,
  currentRole,
  onNavigate,
}: NavigationHistoryProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [history, setHistory] = useState<NavigationItem[]>([]);

  useEffect(() => {
    const newItem: NavigationItem = {
      tab: currentTab,
      timestamp: Date.now(),
      userRole: currentRole,
    };

    setHistory((prev) => {
      const filtered = prev.filter(
        (item) =>
          !(item.tab === newItem.tab && item.userRole === newItem.userRole),
      );
      return [newItem, ...filtered].slice(0, 5);
    });
  }, [currentTab, currentRole]);

  const recentHistory = history.slice(1, 3); // Show only last 2 items

  if (recentHistory.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 z-30">
      {isVisible && (
        <Card className="w-48 shadow-lg animate-slide-in-from-left">
          <CardContent className="p-3">
            <div className="space-y-2">
              {recentHistory.map((item) => {
                const tabInfo = getTabInfo(item.tab);
                const Icon = tabInfo.icon;

                return (
                  <Button
                    key={`${item.tab}-${item.timestamp}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onNavigate(item.tab, item.userRole);
                      setIsVisible(false);
                    }}
                    className="w-full justify-start text-xs"
                  >
                    <Icon className="w-3 h-3 mr-2" />
                    {tabInfo.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="h-8 w-8 p-0 bg-white/90 backdrop-blur-sm"
      >
        <RotateCcw className="w-3 h-3" />
      </Button>
    </div>
  );
}

// Helper function to get tab info (shared)
function getTabInfo(tab: string) {
  const tabs: Record<
    string,
    { label: string; icon: React.ComponentType<any>; color: string }
  > = {
    dashboard: {
      label: "Dashboard",
      icon: Target,
      color: "bg-purple-100 text-purple-700",
    },
    learn: {
      label: "Word Library",
      icon: BookOpen,
      color: "bg-green-100 text-green-700",
    },
    quiz: {
      label: "Quiz Time",
      icon: Brain,
      color: "bg-pink-100 text-pink-700",
    },
    progress: {
      label: "My Journey",
      icon: Trophy,
      color: "bg-yellow-100 text-yellow-700",
    },
    adventure: {
      label: "Adventure",
      icon: Sword,
      color: "bg-blue-100 text-blue-700",
    },
    parent: {
      label: "Parent Dashboard",
      icon: Users,
      color: "bg-purple-100 text-purple-700",
    },
  };
  return (
    tabs[tab] || {
      label: tab,
      icon: Target,
      color: "bg-gray-100 text-gray-700",
    }
  );
}
