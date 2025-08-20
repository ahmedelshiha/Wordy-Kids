import React, { createContext, useContext, ReactNode } from "react";
import { useLightweightAchievementPopup } from "@/hooks/use-lightweight-achievement-popup";
import AchievementPopup from "./AchievementPopup";
import { Trophy, Medal, Award, Crown, Star } from "lucide-react";

const LightweightAchievementContext = createContext(null);

interface LightweightAchievementProviderProps {
  children: ReactNode;
}

export function LightweightAchievementProvider({
  children,
}: LightweightAchievementProviderProps) {
  const { isVisible, achievement, popupProps } =
    useLightweightAchievementPopup();

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

  const contextValue = {};

  return (
    <LightweightAchievementContext.Provider value={contextValue}>
      {children}

      {/* Render popup when visible */}
      {isVisible && popupProps && (
        <AchievementPopup
          {...popupProps}
          icon={getIconComponent(
            achievement?.icon || "🏆",
            achievement?.difficulty || "bronze",
          )}
        />
      )}
    </LightweightAchievementContext.Provider>
  );
}

export default LightweightAchievementProvider;
