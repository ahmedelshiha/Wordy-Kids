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

  static getInstance(): ChildProgressSync {
    if (!ChildProgressSync.instance) {
      ChildProgressSync.instance = new ChildProgressSync();
    }
    return ChildProgressSync.instance;
  }

  /**
   * Get real progress data for a child from localStorage
   */
  private getRealProgressData(childId: string): {
    totalWordsLearned: number;
    currentStreak: number;
    weeklyProgress: number;
    todayProgress: number;
  } {
    try {
      console.log(`Getting progress data for child: ${childId}`);

      // Get today's progress
      const todayKey = new Date().toISOString().split("T")[0];
      const dailyProgressKey = `daily_progress_${childId}_${todayKey}`;
      const dailyData = JSON.parse(
        localStorage.getItem(dailyProgressKey) || '{"words": 0, "sessions": 0}',
      );
      console.log(`Daily data for ${childId}:`, dailyData, `Key: ${dailyProgressKey}`);

      // Get this week's progress
      const weekKey = this.getWeekKey();
      const weeklyProgressKey = `weekly_progress_${childId}_${weekKey}`;
      const weeklyData = JSON.parse(
        localStorage.getItem(weeklyProgressKey) ||
          '{"words": 0, "sessions": 0}',
      );
      console.log(`Weekly data for ${childId}:`, weeklyData, `Key: ${weeklyProgressKey}`);

      // Get streak data
      const streakKey = `streak_data_${childId}`;
      const streakData = JSON.parse(
        localStorage.getItem(streakKey) ||
          '{"currentStreak": 0, "lastActivity": null}',
      );
      console.log(`Streak data for ${childId}:`, streakData, `Key: ${streakKey}`);

      // Calculate total words learned by scanning all daily progress entries
      const totalWordsLearned = this.calculateTotalWordsLearned(childId);
      console.log(`Total words learned for ${childId}:`, totalWordsLearned);

      const result = {
        totalWordsLearned,
        currentStreak: streakData.currentStreak,
        weeklyProgress: weeklyData.words,
        todayProgress: dailyData.words,
      };

      console.log(`Final progress data for ${childId}:`, result);
      return result;
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
   * Calculate total words learned by scanning all daily progress entries
   */
  private calculateTotalWordsLearned(childId: string): number {
    try {
      let total = 0;
      const keys = Object.keys(localStorage);

      // Find all daily progress keys for this child
      const dailyProgressKeys = keys.filter((key) =>
        key.startsWith(`daily_progress_${childId}_`),
      );

      for (const key of dailyProgressKeys) {
        const data = JSON.parse(localStorage.getItem(key) || '{"words": 0}');
        total += data.words || 0;
      }

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

      // Try to get systematic progress data as well
      let systematicProgress: SystematicProgressData | null = null;
      try {
        systematicProgress = await goalProgressTracker.fetchSystematicProgress(
          child.id,
        );
      } catch (error) {
        console.log(
          "Could not fetch systematic progress, using localStorage data",
        );
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
    const updatedChildren: ChildProfile[] = [];

    for (const child of children) {
      const updatedChild = await this.updateChildProgress(child);
      updatedChildren.push(updatedChild);
    }

    return updatedChildren;
  }

  /**
   * Get the last active date for a child based on their learning activity
   */
  private getLastActiveDate(childId: string): Date {
    try {
      const keys = Object.keys(localStorage);
      const dailyProgressKeys = keys.filter((key) =>
        key.startsWith(`daily_progress_${childId}_`),
      );

      let lastActiveDate = new Date(2024, 0, 1); // Default to start of 2024

      for (const key of dailyProgressKeys) {
        const data = JSON.parse(localStorage.getItem(key) || '{"words": 0}');
        if (data.words > 0) {
          // Extract date from key format: daily_progress_${childId}_YYYY-MM-DD
          const dateStr = key.split("_").pop();
          if (dateStr) {
            const date = new Date(dateStr);
            if (date > lastActiveDate) {
              lastActiveDate = date;
            }
          }
        }
      }

      return lastActiveDate;
    } catch (error) {
      console.error("Error getting last active date:", error);
      return new Date();
    }
  }

  /**
   * Save updated children data back to localStorage
   */
  saveUpdatedChildren(children: ChildProfile[]): void {
    try {
      localStorage.setItem("parentDashboardChildren", JSON.stringify(children));
    } catch (error) {
      console.error("Error saving updated children:", error);
    }
  }

  /**
   * Sync all children progress and save to localStorage
   */
  async syncAndSaveAllProgress(
    children: ChildProfile[],
  ): Promise<ChildProfile[]> {
    const updatedChildren = await this.updateAllChildrenProgress(children);
    this.saveUpdatedChildren(updatedChildren);
    return updatedChildren;
  }

  /**
   * Get real-time statistics for the parent dashboard summary
   */
  getFamilyStats(children: ChildProfile[]): {
    totalWordsLearned: number;
    longestStreak: number;
    activeChildren: number;
    todayActivity: number;
  } {
    try {
      console.log("Calculating family stats for children:", children.map(c => ({id: c.id, name: c.name})));

      let totalWords = 0;
      let longestStreak = 0;
      let activeChildren = 0;
      let todayActivity = 0;

      const today = new Date().toISOString().split("T")[0];

      for (const child of children) {
        console.log(`Processing child: ${child.name} (ID: ${child.id})`);
        const realProgress = this.getRealProgressData(child.id);

        totalWords += realProgress.totalWordsLearned;
        longestStreak = Math.max(longestStreak, realProgress.currentStreak);

        if (realProgress.todayProgress > 0) {
          activeChildren++;
          todayActivity += realProgress.todayProgress;
        }

        console.log(`Child ${child.name} contributed:`, {
          words: realProgress.totalWordsLearned,
          streak: realProgress.currentStreak,
          todayWords: realProgress.todayProgress
        });
      }

      const result = {
        totalWordsLearned: totalWords,
        longestStreak,
        activeChildren,
        todayActivity,
      };

      console.log("Final family stats:", result);
      return result;
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
