import React, { useState, useEffect, useCallback } from "react";
import { EnhancedAchievementPopup } from "./EnhancedAchievementPopup";
import { CompactAchievementToast } from "./CompactAchievementToast";
import { useAchievementNotifications } from "@/hooks/use-achievement-notifications";

interface Achievement {
  id: string;
  name: string;
  description: string;
  funnyDescription?: string;
  icon: string;
  category: string;
  difficulty: "bronze" | "silver" | "gold" | "diamond" | "rainbow";
  reward?: {
    type: string;
    item: string;
    value?: number;
    emoji?: string;
  };
}

interface MobileAchievementManagerProps {
  achievements: Achievement[];
  onClose: () => void;
  onAchievementClaim?: (achievement: Achievement) => void;
  notificationType?: "auto" | "popup" | "toast";
  autoCloseDelay?: number;
  context?: {
    isMobile?: boolean;
    isInGame?: boolean;
    isMinimized?: boolean;
  };
}

export function MobileAchievementManager({
  achievements,
  onClose,
  onAchievementClaim,
  notificationType = "auto",
  autoCloseDelay = 2000,
  context = {},
}: MobileAchievementManagerProps) {
  const { isMobile = true, isInGame = false, isMinimized = false } = context;
  
  const [activeToasts, setActiveToasts] = useState<Achievement[]>([]);
  const [activePopup, setActivePopup] = useState<Achievement[]>([]);
  const [currentToastIndex, setCurrentToastIndex] = useState(0);

  // Determine the best notification type
  const getNotificationType = useCallback(() => {
    if (notificationType !== "auto") return notificationType;
    
    // Use toasts for mobile, in-game, or minimized contexts
    if (isMobile || isInGame || isMinimized) {
      return "toast";
    }
    
    // Use popups for desktop and focused app experiences
    return "popup";
  }, [notificationType, isMobile, isInGame, isMinimized]);

  // Process new achievements when they arrive
  useEffect(() => {
    if (achievements.length === 0) return;

    const selectedType = getNotificationType();
    
    if (selectedType === "toast") {
      // For toasts, show them one by one
      setActiveToasts(achievements);
      setCurrentToastIndex(0);
    } else {
      // For popups, show all at once
      setActivePopup(achievements);
    }
  }, [achievements, getNotificationType]);

  // Handle toast progression
  const handleToastClose = useCallback(() => {
    if (currentToastIndex < activeToasts.length - 1) {
      // Move to next toast
      setCurrentToastIndex(prev => prev + 1);
    } else {
      // All toasts shown, close manager
      setActiveToasts([]);
      setCurrentToastIndex(0);
      onClose();
    }
  }, [currentToastIndex, activeToasts.length, onClose]);

  // Handle popup close
  const handlePopupClose = useCallback(() => {
    setActivePopup([]);
    onClose();
  }, [onClose]);

  // Handle achievement claim
  const handleAchievementClaim = useCallback((achievement: Achievement) => {
    onAchievementClaim?.(achievement);
  }, [onAchievementClaim]);

  // Get appropriate auto-close delay based on context
  const getAutoCloseDelay = useCallback(() => {
    if (isInGame) return 1500; // Faster in games
    if (isMobile) return 2000; // Standard mobile
    return autoCloseDelay; // Desktop or custom
  }, [isInGame, isMobile, autoCloseDelay]);

  // Render nothing if no achievements
  if (achievements.length === 0) return null;

  const selectedType = getNotificationType();
  const currentAutoCloseDelay = getAutoCloseDelay();

  return (
    <>
      {/* Toast Notifications */}
      {selectedType === "toast" && 
       activeToasts.length > 0 && 
       currentToastIndex < activeToasts.length && (
        <CompactAchievementToast
          achievement={activeToasts[currentToastIndex]}
          onClose={handleToastClose}
          autoClose={true}
          autoCloseDelay={currentAutoCloseDelay}
        />
      )}

      {/* Popup Notifications */}
      {selectedType === "popup" && activePopup.length > 0 && (
        <EnhancedAchievementPopup
          achievements={activePopup}
          onClose={handlePopupClose}
          onAchievementClaim={handleAchievementClaim}
          autoCloseDelay={currentAutoCloseDelay}
        />
      )}
    </>
  );
}

// Utility component for quick achievement notifications
interface QuickAchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  type?: "popup" | "toast";
}

export function QuickAchievementNotification({
  achievement,
  onClose,
  type = "toast",
}: QuickAchievementNotificationProps) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  
  return (
    <MobileAchievementManager
      achievements={[achievement]}
      onClose={onClose}
      notificationType={type}
      autoCloseDelay={2000}
      context={{
        isMobile,
        isInGame: false,
        isMinimized: false,
      }}
    />
  );
}

// Hook for easier integration
export function useMobileAchievementManager() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  const showAchievement = useCallback((achievement: Achievement | Achievement[]) => {
    const achievementArray = Array.isArray(achievement) ? achievement : [achievement];
    setAchievements(achievementArray);
  }, []);
  
  const clearAchievements = useCallback(() => {
    setAchievements([]);
  }, []);
  
  const hasActiveAchievements = achievements.length > 0;
  
  return {
    achievements,
    showAchievement,
    clearAchievements,
    hasActiveAchievements,
    AchievementManager: (props: Omit<MobileAchievementManagerProps, 'achievements' | 'onClose'>) => (
      <MobileAchievementManager
        achievements={achievements}
        onClose={clearAchievements}
        {...props}
      />
    ),
  };
}
