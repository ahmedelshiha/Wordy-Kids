import { useState, useEffect, useCallback } from "react";
import { achievementPopupQueue } from "@/lib/achievementPopupQueue";
import type { EnhancedAchievement } from "@/lib/enhancedAchievementSystem";

interface PopupState {
  isVisible: boolean;
  achievement: EnhancedAchievement | null;
}

export function useLightweightAchievementPopup() {
  const [popupState, setPopupState] = useState<PopupState>({
    isVisible: false,
    achievement: null,
  });

  /**
   * Show a popup for the given achievement
   */
  const showPopup = useCallback((achievement: EnhancedAchievement) => {
    console.log(`🎉 Showing lightweight popup for: ${achievement.name}`);
    setPopupState({
      isVisible: true,
      achievement,
    });
  }, []);

  /**
   * Hide the current popup
   */
  const hidePopup = useCallback(() => {
    console.log("🎯 Hiding lightweight popup");
    setPopupState({
      isVisible: false,
      achievement: null,
    });

    // Notify queue that popup closed
    achievementPopupQueue.onPopupClose();
  }, []);

  /**
   * Initialize the popup queue system
   */
  useEffect(() => {
    // Set the callback for the queue to show popups
    achievementPopupQueue.setPopupDisplayCallback(showPopup);

    // Cleanup on unmount
    return () => {
      achievementPopupQueue.setPopupDisplayCallback(() => {});
    };
  }, [showPopup]);

  /**
   * Format achievement data for the lightweight popup
   */
  const getPopupProps = useCallback(() => {
    if (!popupState.achievement) {
      return null;
    }

    const achievement = popupState.achievement;

    // Convert achievement icon (string) to React element if needed
    const icon = achievement.icon;

    // Get kid-friendly title and message
    const title = getKidFriendlyTitle(achievement);
    const message = getKidFriendlyMessage(achievement);

    return {
      title,
      message,
      icon,
      difficulty: achievement.difficulty,
      onClose: hidePopup,
      autoCloseDelay: 3000, // 3 seconds auto-close
    };
  }, [popupState.achievement, hidePopup]);


  return {
    // State
    isVisible: popupState.isVisible,
    achievement: popupState.achievement,

    // Actions
    showPopup,
    hidePopup,

    // Computed
    popupProps: getPopupProps(),
  };
}

/**
 * Get kid-friendly title based on achievement
 */
function getKidFriendlyTitle(achievement: EnhancedAchievement): string {
  const excitementLevel = getDifficultyExcitement(achievement.difficulty);

  const titles = [
    `You did it${excitementLevel}`,
    `Amazing work${excitementLevel}`,
    `Super job${excitementLevel}`,
    `Wow${excitementLevel}`,
    `Fantastic${excitementLevel}`,
    `You're awesome${excitementLevel}`,
    `Great job${excitementLevel}`,
    `Incredible${excitementLevel}`,
  ];

  return titles[Math.floor(Math.random() * titles.length)];
}

/**
 * Get kid-friendly message based on achievement
 */
function getKidFriendlyMessage(achievement: EnhancedAchievement): string {
  const difficultyEmoji = getDifficultyEmoji(achievement.difficulty);

  const messages = [
    `New badge unlocked! ${difficultyEmoji}`,
    `You earned a treasure! ${difficultyEmoji}`,
    `New jungle reward! ${difficultyEmoji}`,
    `Adventure complete! ${difficultyEmoji}`,
    `Mission accomplished! ${difficultyEmoji}`,
    `You're a star! ${difficultyEmoji}`,
    `Level up! ${difficultyEmoji}`,
    `Victory achieved! ${difficultyEmoji}`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get excitement level based on difficulty
 */
function getDifficultyExcitement(difficulty: string): string {
  switch (difficulty) {
    case "bronze":
      return "!";
    case "silver":
      return "!!";
    case "gold":
      return "!!!";
    case "diamond":
      return "!!!";
    case "legendary":
      return "!!!!";
    default:
      return "!";
  }
}

/**
 * Get emoji based on difficulty
 */
function getDifficultyEmoji(difficulty: string): string {
  switch (difficulty) {
    case "bronze":
      return "🥉✨";
    case "silver":
      return "🥈⭐";
    case "gold":
      return "🥇🌟";
    case "diamond":
      return "💎✨";
    case "legendary":
      return "🌈🏆";
    default:
      return "🏆";
  }
}
