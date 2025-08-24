import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Settings, Users, Shield, Crown, Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DesktopKidNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: "child" | "parent";
  onRoleChange: (role: "child" | "parent") => void;
  onSettingsClick: () => void;
  onAdminClick: () => void;
  className?: string;
}

interface NavTab {
  id: string;
  image: string;
  label: string;
  color: string;
  hoverColor: string;
  shadowColor: string;
}

const kidNavTabs: NavTab[] = [
  {
    id: "dashboard",
    image: "/images/icons/home.png",
    label: "Home",
    color: "from-purple-400 via-pink-400 to-blue-400",
    hoverColor: "from-purple-500 via-pink-500 to-blue-500",
    shadowColor: "shadow-purple-300",
  },
  {
    id: "learn",
    image: "/images/icons/books.png",
    label: "Library",
    color: "from-orange-400 via-yellow-400 to-red-400",
    hoverColor: "from-orange-500 via-yellow-500 to-red-500",
    shadowColor: "shadow-orange-300",
  },
  {
    id: "quiz",
    image: "/images/icons/game.png",
    label: "Play",
    color: "from-green-400 via-emerald-400 to-teal-400",
    hoverColor: "from-green-500 via-emerald-500 to-teal-500",
    shadowColor: "shadow-green-300",
  },
  {
    id: "achievements",
    image: "🏆",
    label: "Achievements",
    color: "from-yellow-400 via-amber-400 to-orange-400",
    hoverColor: "from-yellow-500 via-amber-500 to-orange-500",
    shadowColor: "shadow-yellow-300",
  },
];

export function DesktopKidNav({
  activeTab,
  onTabChange,
  userRole,
  onRoleChange,
  onSettingsClick,
  onAdminClick,
  className,
}: DesktopKidNavProps) {
  const [isPerformanceOptimized, setIsPerformanceOptimized] = useState(false);

  // Initialize performance optimization
  useEffect(() => {
    const initializePerformance = async () => {
      try {
        await junglePerformanceOptimizer.initialize();
        setIsPerformanceOptimized(true);
      } catch (error) {
        console.warn('Performance optimization failed:', error);
        setIsPerformanceOptimized(false);
      }
    };

    initializePerformance();

    // Listen for optimization updates
    const handleOptimizationUpdate = (event: CustomEvent) => {
      setIsPerformanceOptimized(true);
    };

    window.addEventListener('jungle-nav-optimizations-updated', handleOptimizationUpdate as EventListener);

    return () => {
      window.removeEventListener('jungle-nav-optimizations-updated', handleOptimizationUpdate as EventListener);
      junglePerformanceOptimizer.destroy();
    };
  }, []);

  // Render enhanced jungle navigation or fallback based on performance
  if (isPerformanceOptimized) {
    return (
      <JungleAdventureNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        userRole={userRole}
        onRoleChange={onRoleChange}
        onSettingsClick={onSettingsClick}
        onAdminClick={onAdminClick}
        className={className}
      />
    );
  }

  // Fallback to simple navigation for low-performance devices
  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-40", className)}>
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-center space-x-8">
          {kidNavTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors",
                activeTab === tab.id
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <div className="text-2xl mb-1">
                {tab.image.startsWith('/') ? (
                  <img src={tab.image} alt={tab.label} className="w-6 h-6" />
                ) : (
                  <span>{tab.image}</span>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
