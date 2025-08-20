import React, { createContext, useContext, ReactNode } from "react";
import { useLightweightAchievementPopup } from "@/hooks/use-lightweight-achievement-popup";
import AchievementPopup from "./AchievementPopup";
import { Trophy, Medal, Award, Crown, Star } from "lucide-react";

interface LightweightAchievementContextType {
  triggerTestPopup: () => void;
  clearQueue: () => void;
  queueStatus: any;
}

const LightweightAchievementContext = createContext<LightweightAchievementContextType | null>(null);

interface LightweightAchievementProviderProps {
  children: ReactNode;
}

export function LightweightAchievementProvider({ children }: LightweightAchievementProviderProps) {
  const {
    isVisible,
    achievement,
    popupProps,
    triggerTestPopup,
    clearQueue,
    queueStatus
  } = useLightweightAchievementPopup();

  /**
   * Convert achievement icon string to React component
   */
  const getIconComponent = (iconStr: string, difficulty: string) => {
    // If it's an emoji, return it as is
    if (iconStr && /\p{Emoji}/u.test(iconStr)) {
      return <span className="text-4xl">{iconStr}</span>;
    }

    // Map difficulty to appropriate Lucide icon
    const iconClass = "w-12 h-12 text-yellow-400";
    
    switch (difficulty) {
      case "bronze":
        return <Award className={iconClass} />;
      case "silver":
        return <Medal className={iconClass} />;
      case "gold":
        return <Crown className={iconClass} />;
      case "diamond":
        return <Star className={iconClass} />;
      case "legendary":
        return <Trophy className={iconClass} />;
      default:
        return <Trophy className={iconClass} />;
    }
  };

  const contextValue: LightweightAchievementContextType = {
    triggerTestPopup,
    clearQueue,
    queueStatus
  };

  return (
    <LightweightAchievementContext.Provider value={contextValue}>
      {children}
      
      {/* Render popup when visible */}
      {isVisible && popupProps && (
        <AchievementPopup
          {...popupProps}
          icon={getIconComponent(
            achievement?.icon || "🏆",
            achievement?.difficulty || "bronze"
          )}
        />
      )}

      {/* Test Controls for Development */}
      <AchievementTestControls />
    </LightweightAchievementContext.Provider>
  );
}

/**
 * Hook to access lightweight achievement context
 */
export function useLightweightAchievement() {
  const context = useContext(LightweightAchievementContext);
  if (!context) {
    throw new Error("useLightweightAchievement must be used within LightweightAchievementProvider");
  }
  return context;
}

/**
 * Test component for debugging (can be removed in production)
 */
export function AchievementTestControls() {
  const { triggerTestPopup, clearQueue, queueStatus } = useLightweightAchievement();

  // Temporarily show in all environments for testing
  // if (process.env.NODE_ENV !== "development") {
  //   return null;
  // }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border">
      <h3 className="text-sm font-bold mb-2">Achievement Test Controls</h3>
      <div className="space-y-2">
        <button
          onClick={triggerTestPopup}
          className="block w-full px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
        >
          🎯 Test Popup
        </button>
        <button
          onClick={clearQueue}
          className="block w-full px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
        >
          🧹 Clear Queue
        </button>
        <div className="text-xs text-gray-600">
          Queue: {queueStatus.queueLength} | 
          Status: {queueStatus.isDisplaying ? "Showing" : "Idle"}
        </div>
      </div>
    </div>
  );
}

export default LightweightAchievementProvider;
