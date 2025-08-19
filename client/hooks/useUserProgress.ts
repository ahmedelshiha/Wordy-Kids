import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { goalProgressTracker } from "@/lib/goalProgressTracker";
import { AchievementTracker } from "@/lib/achievementTracker";
import { AnalyticsDataService } from "@/lib/analyticsDataService";

export interface UserProgressData {
  wordsLearned: number;
  animalsLearned: number;
  totalTimeSpent: number; // in minutes
  currentStreak: number;
  level: number;
  sessionsToday: number;
  categoriesProgress: Record<string, number>;
  isLoading: boolean;
  lastUpdated: Date | null;
}

interface UserStatsData {
  name: string;
  level: number;
  streak: number;
  avatar?: {
    emoji?: string;
  };
  stats: {
    wordsLearned: number;
    animalsLearned: number;
    totalTime: number;
  };
}

export const useUserProgress = (): UserStatsData => {
  const { user, isGuest } = useAuth();
  const [progressData, setProgressData] = useState<UserProgressData>({
    wordsLearned: 0,
    animalsLearned: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    level: 1,
    sessionsToday: 0,
    categoriesProgress: {},
    isLoading: true,
    lastUpdated: null,
  });

  const calculateLevel = (wordsLearned: number): number => {
    // Level progression: every 25 words = 1 level, minimum level 1
    return Math.max(1, Math.floor(wordsLearned / 25) + 1);
  };

  const getAnimalsLearned = (categoriesProgress: Record<string, number>): number => {
    // Count words learned in animal-related categories
    const animalCategories = ['animals', 'zoo', 'pets', 'safari', 'ocean', 'farm'];
    return animalCategories.reduce((total, category) => {
      return total + (categoriesProgress[category] || 0);
    }, 0);
  };

  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user?.id) {
        setProgressData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const progressTracker = GoalProgressTracker.getInstance();
        const systematicProgress = await progressTracker.fetchSystematicProgress(user.id);
        
        // Get journey progress for additional stats
        const journeyProgress = AchievementTracker.getJourneyProgress();
        
        // Get time spent from analytics
        const analyticsData = await AnalyticsDataService.getInstance().getAnalyticsData();
        const timeSpent = analyticsData.overview?.totalLearningTime || 0;

        const updatedProgress: UserProgressData = {
          wordsLearned: systematicProgress.totalWordsLearned || journeyProgress.wordsLearned || 0,
          animalsLearned: getAnimalsLearned(systematicProgress.categoriesProgress),
          totalTimeSpent: Math.round(timeSpent / 60), // Convert to minutes
          currentStreak: systematicProgress.currentStreak || journeyProgress.streakDays || 0,
          level: calculateLevel(systematicProgress.totalWordsLearned || journeyProgress.wordsLearned || 0),
          sessionsToday: systematicProgress.sessionsToday || 0,
          categoriesProgress: systematicProgress.categoriesProgress || {},
          isLoading: false,
          lastUpdated: new Date(),
        };

        setProgressData(updatedProgress);
      } catch (error) {
        console.error("Error fetching user progress:", error);
        
        // Fallback to localStorage data
        try {
          const journeyProgress = AchievementTracker.getJourneyProgress();
          const fallbackProgress: UserProgressData = {
            wordsLearned: journeyProgress.wordsLearned || 0,
            animalsLearned: journeyProgress.categoriesExplored.size || 0,
            totalTimeSpent: Math.round(journeyProgress.timeSpentLearning) || 0,
            currentStreak: journeyProgress.streakDays || 0,
            level: calculateLevel(journeyProgress.wordsLearned || 0),
            sessionsToday: 0,
            categoriesProgress: {},
            isLoading: false,
            lastUpdated: new Date(),
          };
          
          setProgressData(fallbackProgress);
        } catch (fallbackError) {
          console.error("Error with fallback progress:", fallbackError);
          setProgressData(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    fetchUserProgress();

    // Set up listeners for real-time updates
    const handleProgressUpdate = () => {
      fetchUserProgress();
    };

    const handleWordLearned = () => {
      fetchUserProgress();
    };

    const handleSessionComplete = () => {
      fetchUserProgress();
    };

    // Listen for progress events
    window.addEventListener('wordLearned', handleWordLearned);
    window.addEventListener('sessionCompleted', handleSessionComplete);
    window.addEventListener('goalCompleted', handleProgressUpdate);
    window.addEventListener('achievementUnlocked', handleProgressUpdate);
    window.addEventListener('wordProgressUpdate', handleProgressUpdate);
    
    // Periodic refresh every 30 seconds to ensure data freshness
    const refreshInterval = setInterval(fetchUserProgress, 30000);

    return () => {
      window.removeEventListener('wordLearned', handleWordLearned);
      window.removeEventListener('sessionCompleted', handleSessionComplete);
      window.removeEventListener('goalCompleted', handleProgressUpdate);
      window.removeEventListener('achievementUnlocked', handleProgressUpdate);
      window.removeEventListener('wordProgressUpdate', handleProgressUpdate);
      clearInterval(refreshInterval);
    };
  }, [user?.id]);

  // Transform progress data into the format expected by the sidebar
  const userStatsData: UserStatsData = {
    name: user?.name || "Guest Explorer",
    level: progressData.level,
    streak: progressData.currentStreak,
    avatar: {
      emoji: user?.avatar || "🎯",
    },
    stats: {
      wordsLearned: progressData.wordsLearned,
      animalsLearned: progressData.animalsLearned,
      totalTime: progressData.totalTimeSpent,
    },
  };

  return userStatsData;
};
