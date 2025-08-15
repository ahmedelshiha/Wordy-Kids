import { ChildProfile } from "@/components/ParentDashboard";
import {
  goalProgressTracker,
  SystematicProgressData,
} from "@/lib/goalProgressTracker";

/**
 * Utility to sync real learning progress data with ParentDashboard child profiles
 */
export class ChildProgressSync {
  private static instance: ChildProgressSync;
  private progressCache: Map<string, any> = new Map();
  private lastCacheUpdate: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): ChildProgressSync {
    if (!ChildProgressSync.instance) {
      ChildProgressSync.instance = new ChildProgressSync();
    }
    return ChildProgressSync.instance;
  }

  /**
   * Clear the progress cache to force fresh data retrieval
   */
  clearCache(): void {
    this.progressCache.clear();
    this.lastCacheUpdate = 0;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.CACHE_DURATION;
  }

  /**
   * Get real progress data for a child from localStorage with caching
   */
  private getRealProgressData(childId: string): {
    totalWordsLearned: number;
    currentStreak: number;
    weeklyProgress: number;
    todayProgress: number;
  } {
    // Check cache first
    const cacheKey = `progress_${childId}`;
    if (this.isCacheValid() && this.progressCache.has(cacheKey)) {
      return this.progressCache.get(cacheKey);
    }

    try {
      // Get today's progress
      const todayKey = new Date().toISOString().split("T")[0];
      const dailyProgressKey = `daily_progress_${childId}_${todayKey}`;
      const dailyData = JSON.parse(
        localStorage.getItem(dailyProgressKey) || '{"words": 0, "sessions": 0}',
      );

      // Get this week's progress
      const weekKey = this.getWeekKey();
      const weeklyProgressKey = `weekly_progress_${childId}_${weekKey}`;
      const weeklyData = JSON.parse(
        localStorage.getItem(weeklyProgressKey) ||
          '{"words": 0, "sessions": 0}',
      );

      // Get streak data
      const streakKey = `streak_data_${childId}`;
      const streakData = JSON.parse(
        localStorage.getItem(streakKey) ||
          '{"currentStreak": 0, "lastActivity": null}',
      );

      // Calculate total words learned efficiently
      const totalWordsLearned =
        this.calculateTotalWordsLearnedOptimized(childId);

      const progressData = {
        totalWordsLearned,
        currentStreak: streakData.currentStreak,
        weeklyProgress: weeklyData.words,
        todayProgress: dailyData.words,
      };

      // Cache the result
      this.progressCache.set(cacheKey, progressData);

      return progressData;
    } catch (error) {
      console.error("Error getting real progress data:", error);
      return {
        totalWordsLearned: 0,
        currentStreak: 0,
        weeklyProgress: 0,
        todayProgress: 0,
      };
    }
  }

  /**
   * Optimized version that uses a more targeted approach
   */
  private calculateTotalWordsLearnedOptimized(childId: string): number {
    const cacheKey = `total_words_${childId}`;
    if (this.isCacheValid() && this.progressCache.has(cacheKey)) {
      return this.progressCache.get(cacheKey);
    }

    try {
      let total = 0;

      // Instead of scanning all localStorage keys, use a more targeted approach
      // Check for recent data first (last 30 days)
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];
        const dailyProgressKey = `daily_progress_${childId}_${dateKey}`;

        const data = localStorage.getItem(dailyProgressKey);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            total += parsed.words || 0;
          } catch (parseError) {
            // Skip invalid entries
            continue;
          }
        }
      }

      // Cache the result
      this.progressCache.set(cacheKey, total);

      return total;
    } catch (error) {
      console.error("Error calculating total words learned:", error);
      return 0;
    }
  }

  /**
   * Get week key in format YYYY-WW
   */
  private getWeekKey(): string {
    const date = new Date();
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor(
      (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-${weekNumber.toString().padStart(2, "0")}`;
  }

  /**
   * Update a single child's progress data with real learning data
   */
  async updateChildProgress(child: ChildProfile): Promise<ChildProfile> {
    try {
      const realProgress = this.getRealProgressData(child.id);

      // Try to get systematic progress data as well (with timeout)
      let systematicProgress: SystematicProgressData | null = null;
      try {
        const progressPromise = goalProgressTracker.fetchSystematicProgress(
          child.id,
        );
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 5000),
        );

        systematicProgress = (await Promise.race([
          progressPromise,
          timeoutPromise,
        ])) as SystematicProgressData;
      } catch (error) {
        // Could not fetch systematic progress, using localStorage data
        console.log("Using localStorage data for child progress");
      }

      const updatedChild: ChildProfile = {
        ...child,
        wordsLearned:
          systematicProgress?.totalWordsLearned ||
          realProgress.totalWordsLearned,
        currentStreak:
          systematicProgress?.currentStreak || realProgress.currentStreak,
        weeklyProgress:
          systematicProgress?.wordsLearnedThisWeek ||
          realProgress.weeklyProgress,
        // Update last active based on learning activity
        lastActive: this.getLastActiveDate(child.id),
      };

      return updatedChild;
    } catch (error) {
      console.error("Error updating child progress:", error);
      return child;
    }
  }

  /**
   * Update all children's progress data with real learning data
   */
  async updateAllChildrenProgress(
    children: ChildProfile[],
  ): Promise<ChildProfile[]> {
    // Process children in parallel for better performance
    const updatePromises = children.map((child) =>
      this.updateChildProgress(child),
    );

    try {
      const updatedChildren = await Promise.all(updatePromises);

      // Update cache timestamp
      this.lastCacheUpdate = Date.now();

      return updatedChildren;
    } catch (error) {
      console.error("Error updating all children progress:", error);
      return children;
    }
  }

  /**
   * Get the last active date for a child based on their learning activity (optimized)
   */
  private getLastActiveDate(childId: string): Date {
    const cacheKey = `last_active_${childId}`;
    if (this.isCacheValid() && this.progressCache.has(cacheKey)) {
      return this.progressCache.get(cacheKey);
    }

    try {
      let lastActiveDate = new Date(2024, 0, 1); // Default to start of 2024

      // Check recent dates first (last 7 days)
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];
        const dailyProgressKey = `daily_progress_${childId}_${dateKey}`;

        const data = localStorage.getItem(dailyProgressKey);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.words > 0) {
              lastActiveDate = date;
              break; // Found most recent activity
            }
          } catch (parseError) {
            continue;
          }
        }
      }

      // Cache the result
      this.progressCache.set(cacheKey, lastActiveDate);

      return lastActiveDate;
    } catch (error) {
      console.error("Error getting last active date:", error);
      return new Date();
    }
  }

  /**
   * Save updated children data back to localStorage (with error handling)
   */
  saveUpdatedChildren(children: ChildProfile[]): void {
    try {
      localStorage.setItem("parentDashboardChildren", JSON.stringify(children));
    } catch (error) {
      console.error("Error saving updated children:", error);
      // Try to free up space and retry
      try {
        this.clearCache();
        localStorage.setItem(
          "parentDashboardChildren",
          JSON.stringify(children),
        );
      } catch (retryError) {
        console.error(
          "Failed to save children data even after cache clear:",
          retryError,
        );
      }
    }
  }

  /**
   * Sync all children progress and save to localStorage
   */
  async syncAndSaveAllProgress(
    children: ChildProfile[],
  ): Promise<ChildProfile[]> {
    try {
      const updatedChildren = await this.updateAllChildrenProgress(children);
      this.saveUpdatedChildren(updatedChildren);
      return updatedChildren;
    } catch (error) {
      console.error("Error in syncAndSaveAllProgress:", error);
      return children;
    }
  }

  /**
   * Get real-time statistics for the parent dashboard summary (optimized)
   */
  getFamilyStats(children: ChildProfile[]): {
    totalWordsLearned: number;
    longestStreak: number;
    activeChildren: number;
    todayActivity: number;
  } {
    const cacheKey = "family_stats";
    if (this.isCacheValid() && this.progressCache.has(cacheKey)) {
      return this.progressCache.get(cacheKey);
    }

    try {
      let totalWords = 0;
      let longestStreak = 0;
      let activeChildren = 0;
      let todayActivity = 0;

      for (const child of children) {
        const realProgress = this.getRealProgressData(child.id);

        totalWords += realProgress.totalWordsLearned;
        longestStreak = Math.max(longestStreak, realProgress.currentStreak);

        if (realProgress.todayProgress > 0) {
          activeChildren++;
          todayActivity += realProgress.todayProgress;
        }
      }

      const stats = {
        totalWordsLearned: totalWords,
        longestStreak,
        activeChildren,
        todayActivity,
      };

      // Cache the result
      this.progressCache.set(cacheKey, stats);

      return stats;
    } catch (error) {
      console.error("Error calculating family stats:", error);
      return {
        totalWordsLearned: 0,
        longestStreak: 0,
        activeChildren: 0,
        todayActivity: 0,
      };
    }
  }
}

export const childProgressSync = ChildProgressSync.getInstance();
