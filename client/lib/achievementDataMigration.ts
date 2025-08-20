/**
 * Achievement Data Migration System
 * Migrates user progress from old achievement system to Enhanced Achievement System
 */

import { enhancedAchievementSystem } from "./enhancedAchievementSystem";
import { enhancedBadgeSystem } from "./enhancedBadgeSystem";
import { enhancedLearningAnalytics } from "./enhancedLearningAnalytics";

interface LegacyAchievement {
  id: string;
  name: string;
  unlocked: boolean;
  dateUnlocked?: string;
  progress?: number;
}

interface LegacyProgress {
  wordsLearned: number;
  wordsRemembered: number;
  sessionCount: number;
  accuracy: number;
  currentStreak: number;
  weeklyProgress: number;
  totalPoints: number;
  level: number;
}

interface LegacyUserData {
  achievements: LegacyAchievement[];
  progress: LegacyProgress;
  userWordHistory: Map<number, any>;
  childStats: any;
  learningGoals: any[];
  dailySessionCount: number;
}

interface MigrationResult {
  success: boolean;
  migratedAchievements: number;
  migratedProgress: boolean;
  migratedBadges: number;
  errors: string[];
  details: string[];
}

class AchievementDataMigration {
  private migrationLogs: string[] = [];

  /**
   * Main migration entry point
   */
  async migrateUserData(): Promise<MigrationResult> {
    this.migrationLogs = [];
    this.log("🔄 Starting Achievement Data Migration...");

    const result: MigrationResult = {
      success: false,
      migratedAchievements: 0,
      migratedProgress: false,
      migratedBadges: 0,
      errors: [],
      details: [],
    };

    try {
      // 1. Detect legacy data
      const legacyData = this.detectLegacyData();

      if (!legacyData) {
        this.log("✅ No legacy data found - initializing with defaults");
        await this.initializeDefaultData();
        result.success = true;
        result.details.push("Initialized fresh enhanced achievement system");
        return result;
      }

      this.log(
        `📊 Found legacy data - migrating ${legacyData.achievements?.length || 0} achievements`,
      );

      // 2. Migrate achievements
      result.migratedAchievements = await this.migrateAchievements(
        legacyData.achievements || [],
      );

      // 3. Migrate progress data
      result.migratedProgress = await this.migrateProgressData(
        legacyData.progress,
      );

      // 4. Migrate badges and rewards
      result.migratedBadges = await this.migrateBadges(legacyData);

      // 5. Migrate learning analytics
      await this.migrateLearningAnalytics(legacyData);

      // 6. Create backup of legacy data
      this.createLegacyBackup(legacyData);

      // 7. Mark migration as complete
      this.markMigrationComplete();

      result.success = true;
      result.details = [...this.migrationLogs];

      this.log("✅ Migration completed successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.log(`❌ Migration failed: ${errorMessage}`);
      result.errors.push(errorMessage);
      result.details = [...this.migrationLogs];
    }

    return result;
  }

  /**
   * Detect existing legacy data from localStorage
   */
  private detectLegacyData(): LegacyUserData | null {
    try {
      // Check for old achievement tracker data
      const oldAchievements = localStorage.getItem("achievementTracker");
      const oldProgress = localStorage.getItem("userProgress");
      const oldWordHistory = localStorage.getItem("userWordHistory");
      const oldChildStats = localStorage.getItem("childStats");
      const oldLearningGoals = localStorage.getItem("learningGoals");

      if (!oldAchievements && !oldProgress && !oldWordHistory) {
        return null; // No legacy data found
      }

      return {
        achievements: oldAchievements ? JSON.parse(oldAchievements) : [],
        progress: oldProgress ? JSON.parse(oldProgress) : null,
        userWordHistory: oldWordHistory
          ? new Map(JSON.parse(oldWordHistory))
          : new Map(),
        childStats: oldChildStats ? JSON.parse(oldChildStats) : null,
        learningGoals: oldLearningGoals ? JSON.parse(oldLearningGoals) : [],
        dailySessionCount: parseInt(
          localStorage.getItem("dailySessionCount") || "0",
        ),
      };
    } catch (error) {
      this.log(`⚠️ Error detecting legacy data: ${error}`);
      return null;
    }
  }

  /**
   * Migrate achievements from old system to enhanced system
   */
  private async migrateAchievements(
    legacyAchievements: LegacyAchievement[],
  ): Promise<number> {
    let migratedCount = 0;

    try {
      for (const legacy of legacyAchievements) {
        if (legacy.unlocked) {
          // Map legacy achievement to enhanced system
          const enhancedAchievement = this.mapLegacyToEnhanced(legacy);

          if (enhancedAchievement) {
            await enhancedAchievementSystem.unlockAchievement(
              enhancedAchievement.id,
              {
                silent: true, // Don't trigger celebrations during migration
                migratedDate: legacy.dateUnlocked
                  ? new Date(legacy.dateUnlocked)
                  : new Date(),
              },
            );

            migratedCount++;
            this.log(
              `✅ Migrated achievement: ${legacy.name} → ${enhancedAchievement.id}`,
            );
          }
        }
      }

      this.log(`📊 Migrated ${migratedCount} achievements`);
      return migratedCount;
    } catch (error) {
      this.log(`❌ Error migrating achievements: ${error}`);
      throw error;
    }
  }

  /**
   * Migrate progress data to enhanced analytics
   */
  private async migrateProgressData(
    legacyProgress: LegacyProgress | null,
  ): Promise<boolean> {
    if (!legacyProgress) {
      this.log("ℹ️ No legacy progress data found");
      return false;
    }

    try {
      // Migrate to enhanced learning analytics
      await enhancedLearningAnalytics.updateProgress({
        wordsLearned: legacyProgress.wordsLearned || 0,
        totalSessionTime: (legacyProgress.sessionCount || 0) * 15, // Estimate 15 min per session
        accuracy: legacyProgress.accuracy || 0,
        streak: legacyProgress.currentStreak || 0,
        level: legacyProgress.level || 1,
        totalPoints: legacyProgress.totalPoints || 0,
      });

      this.log(
        `✅ Migrated progress: ${legacyProgress.wordsLearned} words, ${legacyProgress.sessionCount} sessions`,
      );
      return true;
    } catch (error) {
      this.log(`❌ Error migrating progress: ${error}`);
      throw error;
    }
  }

  /**
   * Migrate badges and rewards
   */
  private async migrateBadges(legacyData: LegacyUserData): Promise<number> {
    let migratedCount = 0;

    try {
      // Auto-award appropriate badges based on legacy progress
      if (legacyData.progress) {
        const progress = legacyData.progress;

        // Word learning badges
        if (progress.wordsLearned >= 1) {
          await enhancedBadgeSystem.unlockBadge("first-word", { silent: true });
          migratedCount++;
        }
        if (progress.wordsLearned >= 10) {
          await enhancedBadgeSystem.unlockBadge("word-explorer", {
            silent: true,
          });
          migratedCount++;
        }
        if (progress.wordsLearned >= 25) {
          await enhancedBadgeSystem.unlockBadge("vocabulary-builder", {
            silent: true,
          });
          migratedCount++;
        }

        // Accuracy badges
        if (progress.accuracy >= 80) {
          await enhancedBadgeSystem.unlockBadge("accuracy-expert", {
            silent: true,
          });
          migratedCount++;
        }

        // Streak badges
        if (progress.currentStreak >= 3) {
          await enhancedBadgeSystem.unlockBadge("streak-starter", {
            silent: true,
          });
          migratedCount++;
        }
      }

      this.log(`✅ Migrated ${migratedCount} badges`);
      return migratedCount;
    } catch (error) {
      this.log(`❌ Error migrating badges: ${error}`);
      throw error;
    }
  }

  /**
   * Migrate learning analytics data
   */
  private async migrateLearningAnalytics(
    legacyData: LegacyUserData,
  ): Promise<void> {
    try {
      // Create weekly progress entry for current week
      if (legacyData.progress && legacyData.progress.wordsLearned > 0) {
        const currentWeek = this.getCurrentWeekKey();

        await enhancedLearningAnalytics.recordWeeklyProgress(currentWeek, {
          wordsLearned: legacyData.progress.wordsLearned,
          accuracy: legacyData.progress.accuracy || 0,
          sessionCount: legacyData.progress.sessionCount || 0,
          timeSpent: (legacyData.progress.sessionCount || 0) * 15,
        });

        this.log(`✅ Migrated learning analytics for week ${currentWeek}`);
      }
    } catch (error) {
      this.log(`❌ Error migrating analytics: ${error}`);
      throw error;
    }
  }

  /**
   * Initialize default data for new users
   */
  private async initializeDefaultData(): Promise<void> {
    try {
      // Initialize enhanced systems with default empty state
      await enhancedAchievementSystem.initialize();
      await enhancedBadgeSystem.initialize();
      await enhancedLearningAnalytics.initialize();

      this.log("✅ Initialized enhanced achievement systems");
    } catch (error) {
      this.log(`❌ Error initializing defaults: ${error}`);
      throw error;
    }
  }

  /**
   * Map legacy achievement to enhanced achievement ID
   */
  private mapLegacyToEnhanced(
    legacy: LegacyAchievement,
  ): { id: string } | null {
    const mapping: Record<string, string> = {
      "first-word": "jungle-first-steps",
      "streak-starter": "jungle-consistency",
      "category-explorer": "jungle-explorer",
      "science-star": "category-science-master",
      "quiz-master": "quiz-perfectionist",
      "vocabulary-champion": "jungle-vocabulary-champion",
    };

    const enhancedId = mapping[legacy.id];
    return enhancedId ? { id: enhancedId } : null;
  }

  /**
   * Create backup of legacy data before migration
   */
  private createLegacyBackup(legacyData: LegacyUserData): void {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        legacyData,
        migrationVersion: "1.0.0",
      };

      localStorage.setItem("legacyAchievementBackup", JSON.stringify(backup));
      this.log("✅ Created legacy data backup");
    } catch (error) {
      this.log(`⚠️ Failed to create backup: ${error}`);
    }
  }

  /**
   * Mark migration as complete
   */
  private markMigrationComplete(): void {
    localStorage.setItem("achievementMigrationComplete", "true");
    localStorage.setItem("achievementMigrationDate", new Date().toISOString());
    this.log("✅ Migration marked as complete");
  }

  /**
   * Check if migration has already been completed
   */
  static isMigrationComplete(): boolean {
    return localStorage.getItem("achievementMigrationComplete") === "true";
  }

  /**
   * Get current week key for analytics
   */
  private getCurrentWeekKey(): string {
    const date = new Date();
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week}`;
  }

  /**
   * Get week number for date
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Log migration progress
   */
  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    this.migrationLogs.push(logMessage);
    console.log(`🔄 Migration: ${logMessage}`);
  }

  /**
   * Get migration logs
   */
  getMigrationLogs(): string[] {
    return [...this.migrationLogs];
  }
}

// Export singleton instance
export const achievementDataMigration = new AchievementDataMigration();

// Export types
export type { MigrationResult, LegacyUserData };
