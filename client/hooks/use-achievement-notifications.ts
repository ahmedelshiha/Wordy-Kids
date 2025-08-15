import { useState, useCallback, useRef } from "react";

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

interface AchievementNotification {
  id: string;
  achievement: Achievement;
  timestamp: number;
}

export interface AchievementNotificationOptions {
  maxVisible?: number;
  autoCloseDelay?: number;
  stackVertically?: boolean;
  showToast?: boolean; // Show compact toast instead of full popup
}

export function useAchievementNotifications(
  options: AchievementNotificationOptions = {}
) {
  const {
    maxVisible = 1,
    autoCloseDelay = 2000,
    stackVertically = false,
    showToast = false,
  } = options;

  const [notifications, setNotifications] = useState<AchievementNotification[]>([]);
  const [activePopup, setActivePopup] = useState<Achievement[]>([]);
  const notificationIdRef = useRef(0);

  // Add new achievement notification
  const addAchievementNotification = useCallback((achievement: Achievement) => {
    const notificationId = `achievement-${notificationIdRef.current++}`;
    
    if (showToast) {
      // Add to toast notifications
      setNotifications(prev => {
        const newNotification: AchievementNotification = {
          id: notificationId,
          achievement,
          timestamp: Date.now(),
        };
        
        // Limit the number of visible notifications
        const updated = [...prev, newNotification];
        return updated.slice(-maxVisible);
      });

      // Auto-remove toast notification
      setTimeout(() => {
        removeNotification(notificationId);
      }, autoCloseDelay);
    } else {
      // Add to popup system
      setActivePopup(prev => {
        const updated = [...prev, achievement];
        return updated.slice(-maxVisible);
      });
    }
  }, [showToast, maxVisible, autoCloseDelay]);

  // Add multiple achievements at once
  const addMultipleAchievements = useCallback((achievements: Achievement[]) => {
    if (showToast) {
      // For toasts, show them one by one with delays
      achievements.forEach((achievement, index) => {
        setTimeout(() => {
          addAchievementNotification(achievement);
        }, index * 500); // 500ms delay between toasts
      });
    } else {
      // For popups, show all at once
      setActivePopup(prev => [...prev, ...achievements]);
    }
  }, [showToast, addAchievementNotification]);

  // Remove specific notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setActivePopup([]);
  }, []);

  // Clear popup achievements
  const clearPopupAchievements = useCallback(() => {
    setActivePopup([]);
  }, []);

  // Remove achievement from popup by index
  const removePopupAchievement = useCallback((index: number) => {
    setActivePopup(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Get the next achievement in popup queue
  const getNextPopupAchievement = useCallback(() => {
    return activePopup[0] || null;
  }, [activePopup]);

  // Check if there are any active notifications
  const hasActiveNotifications = notifications.length > 0 || activePopup.length > 0;

  // Get all active notifications for rendering
  const getActiveNotifications = useCallback(() => {
    return {
      toasts: notifications,
      popups: activePopup,
      hasAny: hasActiveNotifications,
    };
  }, [notifications, activePopup, hasActiveNotifications]);

  return {
    // State
    notifications,
    activePopup,
    hasActiveNotifications,
    
    // Actions
    addAchievementNotification,
    addMultipleAchievements,
    removeNotification,
    clearAllNotifications,
    clearPopupAchievements,
    removePopupAchievement,
    getNextPopupAchievement,
    getActiveNotifications,
    
    // Configuration
    options: {
      maxVisible,
      autoCloseDelay,
      stackVertically,
      showToast,
    },
  };
}

// Utility function to determine best notification type based on context
export function getOptimalNotificationType(context: {
  isMobile?: boolean;
  isInGame?: boolean;
  userPreference?: "popup" | "toast" | "auto";
}): "popup" | "toast" {
  const { isMobile = false, isInGame = false, userPreference = "auto" } = context;

  if (userPreference !== "auto") {
    return userPreference;
  }

  // Use toasts for mobile or in-game scenarios for less disruption
  if (isMobile || isInGame) {
    return "toast";
  }

  // Use popups for desktop and main app experiences
  return "popup";
}
