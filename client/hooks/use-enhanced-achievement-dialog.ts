import { useState, useEffect, useCallback } from "react";
import { enhancedAchievementSystem } from "@/lib/enhancedAchievementSystem";
import type { EnhancedAchievement } from "@/lib/enhancedAchievementSystem";

interface UseEnhancedAchievementDialogReturn {
  achievements: EnhancedAchievement[];
  showDialog: boolean;
  closeDialog: () => void;
  trackProgress: (progressData: {
    wordsLearned?: number;
    streakDays?: number;
    totalAccuracy?: number;
    categoriesCompleted?: string[];
    quizScore?: number;
    sessionCount?: number;
  }) => void;
  addAchievement: (achievement: EnhancedAchievement) => void;
  claimAchievement: (achievement: EnhancedAchievement) => void;
}

export function useEnhancedAchievementDialog(): UseEnhancedAchievementDialogReturn {
  const [achievements, setAchievements] = useState<EnhancedAchievement[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [achievementQueue, setAchievementQueue] = useState<EnhancedAchievement[]>([]);

  // Listen for milestone unlock events
  useEffect(() => {
    const handleMilestoneUnlocked = (event: CustomEvent) => {
      const { achievement } = event.detail;
      console.log('🎉 Milestone unlocked:', achievement.name);
      
      // Add to queue for display
      setAchievementQueue(prev => [...prev, achievement]);
    };

    const handleAchievementClaimed = (event: CustomEvent) => {
      const { achievement } = event.detail;
      console.log('🏆 Achievement claimed:', achievement.name);
    };

    // Type-safe event listeners
    window.addEventListener('milestoneUnlocked', handleMilestoneUnlocked as EventListener);
    window.addEventListener('achievementClaimed', handleAchievementClaimed as EventListener);

    return () => {
      window.removeEventListener('milestoneUnlocked', handleMilestoneUnlocked as EventListener);
      window.removeEventListener('achievementClaimed', handleAchievementClaimed as EventListener);
    };
  }, []);

  // Process achievement queue
  useEffect(() => {
    if (achievementQueue.length > 0 && !showDialog) {
      // Show dialog with queued achievements
      setAchievements([...achievementQueue]);
      setShowDialog(true);
      setAchievementQueue([]);
    }
  }, [achievementQueue, showDialog]);

  // Track progress and check for new achievements
  const trackProgress = useCallback((progressData: {
    wordsLearned?: number;
    streakDays?: number;
    totalAccuracy?: number;
    categoriesCompleted?: string[];
    quizScore?: number;
    sessionCount?: number;
  }) => {
    const newlyUnlocked = enhancedAchievementSystem.trackProgress(progressData);
    
    if (newlyUnlocked.length > 0) {
      console.log(`🎉 ${newlyUnlocked.length} new achievements unlocked!`);
      // The milestone unlock events will trigger the dialog
    }
  }, []);

  // Manually add achievement to dialog (for external achievements)
  const addAchievement = useCallback((achievement: EnhancedAchievement) => {
    setAchievementQueue(prev => [...prev, achievement]);
  }, []);

  // Close dialog
  const closeDialog = useCallback(() => {
    setShowDialog(false);
    setAchievements([]);
  }, []);

  // Claim achievement
  const claimAchievement = useCallback((achievement: EnhancedAchievement) => {
    enhancedAchievementSystem.claimAchievement(achievement.id);
  }, []);

  return {
    achievements,
    showDialog,
    closeDialog,
    trackProgress,
    addAchievement,
    claimAchievement,
  };
}
