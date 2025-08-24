/**
 * Legacy Achievement Data Migration Utility
 *
 * This utility handles the one-time migration of legacy achievement data
 * from the old AchievementSystem to the new EnhancedAchievementSystem.
 */

import { enhancedAchievementSystem } from "./enhancedAchievementSystem";
import { enhancedBadgeSystem } from "./enhancedBadgeSystem";
import { enhancedLearningAnalytics } from "./enhancedLearningAnalytics";

interface LegacyAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category?: string;
  points?: number;
  difficulty?: string;
}

interface LegacyProgress {
  wordsLearned: number;
  streakDays: number;
  totalAccuracy: number;
  categoriesExplored: string[];
  timeSpentLearning: number;
  vowelQuizzesCompleted: number;
}

interface MigrationResult {
  success: boolean;
  migrationId: string;
  timestamp: string;
  legacyDataFound: boolean;
  migratedAchievements: number;
  migratedBadges: number;
  migratedProgress: boolean;
  errors: string[];
  details: string[];
  skipped: boolean;
  skipReason?: string;
}

export class LegacyAchievementMigration {
  private static readonly MIGRATION_KEY =
    "enhanced_achievements_migration_completed";
  private static readonly LEGACY_ACHIEVEMENT_KEY = "achievements";
  private static readonly LEGACY_PROGRESS_KEY = "learningProgress";
  private static readonly LEGACY_STATS_KEY = "childStats";

  /**
   * Check if migration has already been completed
   */
  static isMigrationCompleted(): boolean {
    try {
      const migrationData = localStorage.getItem(this.MIGRATION_KEY);
      return migrationData !== null;
    } catch (error) {
      console.error("Error checking migration status:", error);
      return false;
    }
  }

  /**
   * Check if legacy data exists
   */
  static hasLegacyData(): boolean {
    try {
      const legacyAchievements = localStorage.getItem(
        this.LEGACY_ACHIEVEMENT_KEY,
      );
      const legacyProgress = localStorage.getItem(this.LEGACY_PROGRESS_KEY);
      const legacyStats = localStorage.getItem(this.LEGACY_STATS_KEY);

      return !!(legacyAchievements || legacyProgress || legacyStats);
    } catch (error) {
      console.error("Error checking legacy data:", error);
      return false;
    }
  }

  /**
   * Perform the migration process
   */
  static async performMigration(): Promise<MigrationResult> {
    const migrationId = `migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const result: MigrationResult = {
      success: false,
      migrationId,
      timestamp,
      legacyDataFound: false,
      migratedAchievements: 0,
      migratedBadges: 0,
      migratedProgress: false,
      errors: [],
      details: [],
      skipped: false,
    };

    try {
      // Check if migration already completed
      if (this.isMigrationCompleted()) {
        result.skipped = true;
        result.skipReason = "Migration already completed";
        result.success = true;
        return result;
      }

      // Check for legacy data
      const hasLegacy = this.hasLegacyData();
      result.legacyDataFound = hasLegacy;

      if (!hasLegacy) {
        result.details.push(
          "No legacy data found - starting fresh with enhanced system",
        );
        result.success = true;
        await this.markMigrationCompleted(migrationId, result);
        return result;
      }

      result.details.push("Legacy data detected, beginning migration...");

      // Migrate achievements
      const achievementMigration = await this.migrateLegacyAchievements();
      result.migratedAchievements = achievementMigration.count;
      result.details.push(
        `Migrated ${achievementMigration.count} legacy achievements`,
      );
      if (achievementMigration.errors.length > 0) {
        result.errors.push(...achievementMigration.errors);
      }

      // Migrate badges (derived from achievements)
      const badgeMigration = await this.migrateLegacyBadges();
      result.migratedBadges = badgeMigration.count;
      result.details.push(`Migrated ${badgeMigration.count} legacy badges`);
      if (badgeMigration.errors.length > 0) {
        result.errors.push(...badgeMigration.errors);
      }

      // Migrate progress data
      const progressMigration = await this.migrateLegacyProgress();
      result.migratedProgress = progressMigration.success;
      result.details.push(
        progressMigration.success
          ? "Progress data migrated successfully"
          : "No progress data to migrate",
      );
      if (progressMigration.errors.length > 0) {
        result.errors.push(...progressMigration.errors);
      }

      // Initialize enhanced systems with migrated data
      await this.initializeEnhancedSystems();
      result.details.push("Enhanced achievement systems initialized");

      result.success = result.errors.length === 0;

      if (result.success) {
        await this.markMigrationCompleted(migrationId, result);
        await this.backupLegacyData();
        result.details.push(
          "Migration completed successfully and legacy data backed up",
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Migration failed: ${errorMessage}`);
      console.error("Migration error:", error);
    }

    return result;
  }

  /**
   * Migrate legacy achievements
   */
  private static async migrateLegacyAchievements(): Promise<{
    count: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let count = 0;

    try {
      const legacyData = localStorage.getItem(this.LEGACY_ACHIEVEMENT_KEY);
      if (!legacyData) {
        return { count: 0, errors: [] };
      }

      const legacyAchievements: LegacyAchievement[] = JSON.parse(legacyData);

      for (const legacy of legacyAchievements) {
        try {
          if (legacy.unlocked) {
            // Map legacy achievement to enhanced system format
            const enhancedAchievement = {
              id: legacy.id,
              name: legacy.name,
              description: legacy.description,
              icon: legacy.icon,
              category: legacy.category || "general",
              difficulty: legacy.difficulty || "bronze",
              points: legacy.points || 100,
              unlocked: true,
              unlockedAt: legacy.unlockedAt || new Date().toISOString(),
              currentProgress: 1,
              requirements: {
                type: "migration" as const,
                threshold: 1,
              },
              reward: {
                type: "xp" as const,
                amount: legacy.points || 100,
                item: "Migrated Achievement",
              },
            };

            // Import into enhanced system
            enhancedAchievementSystem.importAchievement(enhancedAchievement);
            count++;
          }
        } catch (error) {
          errors.push(`Failed to migrate achievement ${legacy.id}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Failed to parse legacy achievements: ${error}`);
    }

    return { count, errors };
  }

  /**
   * Migrate legacy badges
   */
  private static async migrateLegacyBadges(): Promise<{
    count: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let count = 0;

    try {
      // Check for legacy badge data in various possible keys
      const possibleKeys = ["badges", "earnedBadges", "userBadges"];

      for (const key of possibleKeys) {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          try {
            const legacyBadges = JSON.parse(legacyData);

            if (Array.isArray(legacyBadges)) {
              for (const badge of legacyBadges) {
                if (badge.earned) {
                  enhancedBadgeSystem.importBadge({
                    id: badge.id,
                    name: badge.name,
                    description: badge.description,
                    icon: badge.icon,
                    tier: badge.tier || "bronze",
                    category: badge.category || "general",
                    earned: true,
                    earnedAt: badge.earnedAt || new Date().toISOString(),
                    currentProgress: badge.progress || 1,
                    requirements: {
                      type: "migration" as const,
                      threshold: 1,
                    },
                    rewards: {
                      xp: badge.rewards?.xp || 50,
                      coins: badge.rewards?.coins || 10,
                    },
                  });
                  count++;
                }
              }
            }
          } catch (error) {
            errors.push(`Failed to parse legacy badges from ${key}: ${error}`);
          }
        }
      }
    } catch (error) {
      errors.push(`Failed to migrate badges: ${error}`);
    }

    return { count, errors };
  }

  /**
   * Migrate legacy progress data
   */
  private static async migrateLegacyProgress(): Promise<{
    success: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      const legacyProgressData = localStorage.getItem(this.LEGACY_PROGRESS_KEY);
      const legacyStatsData = localStorage.getItem(this.LEGACY_STATS_KEY);

      let migrationData: any = {};

      if (legacyProgressData) {
        try {
          const progressData = JSON.parse(legacyProgressData);
          migrationData = { ...migrationData, ...progressData };
        } catch (error) {
          errors.push(`Failed to parse legacy progress data: ${error}`);
        }
      }

      if (legacyStatsData) {
        try {
          const statsData = JSON.parse(legacyStatsData);
          migrationData = { ...migrationData, ...statsData };
        } catch (error) {
          errors.push(`Failed to parse legacy stats data: ${error}`);
        }
      }

      if (Object.keys(migrationData).length > 0) {
        // Import progress into enhanced learning analytics
        enhancedLearningAnalytics.importLegacyData({
          wordsLearned: migrationData.wordsLearned || 0,
          streakDays: migrationData.streakDays || 0,
          totalAccuracy: migrationData.totalAccuracy || 0,
          categoriesExplored: migrationData.categoriesExplored || [],
          timeSpentLearning: migrationData.timeSpentLearning || 0,
          lastActiveDate:
            migrationData.lastActiveDate || new Date().toISOString(),
          sessionCount: migrationData.sessionCount || 0,
        });

        return { success: true, errors };
      }

      return { success: false, errors: ["No legacy progress data found"] };
    } catch (error) {
      errors.push(`Failed to migrate progress: ${error}`);
      return { success: false, errors };
    }
  }

  /**
   * Initialize enhanced systems after migration
   */
  private static async initializeEnhancedSystems(): Promise<void> {
    try {
      // Initialize achievement system
      await enhancedAchievementSystem.initialize();

      // Initialize badge system
      await enhancedBadgeSystem.initialize();

      // Initialize learning analytics
      await enhancedLearningAnalytics.initialize();

      // Trigger any necessary updates
      enhancedAchievementSystem.recalculateProgress();
      enhancedBadgeSystem.validateBadgeProgress();
      enhancedLearningAnalytics.generateProgressReport();
    } catch (error) {
      console.error("Failed to initialize enhanced systems:", error);
      throw error;
    }
  }

  /**
   * Mark migration as completed
   */
  private static async markMigrationCompleted(
    migrationId: string,
    result: MigrationResult,
  ): Promise<void> {
    try {
      const migrationRecord = {
        migrationId,
        completedAt: new Date().toISOString(),
        version: "2.0.0",
        result,
      };

      localStorage.setItem(this.MIGRATION_KEY, JSON.stringify(migrationRecord));
    } catch (error) {
      console.error("Failed to mark migration as completed:", error);
      throw error;
    }
  }

  /**
   * Backup legacy data before cleanup
   */
  private static async backupLegacyData(): Promise<void> {
    try {
      const legacyBackup: any = {};

      // Backup all legacy keys
      const legacyKeys = [
        this.LEGACY_ACHIEVEMENT_KEY,
        this.LEGACY_PROGRESS_KEY,
        this.LEGACY_STATS_KEY,
        "badges",
        "earnedBadges",
        "userBadges",
      ];

      for (const key of legacyKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          legacyBackup[key] = data;
        }
      }

      if (Object.keys(legacyBackup).length > 0) {
        const backupKey = `legacy_backup_${Date.now()}`;
        localStorage.setItem(
          backupKey,
          JSON.stringify({
            backedUpAt: new Date().toISOString(),
            data: legacyBackup,
          }),
        );
      }
    } catch (error) {
      console.error("Failed to backup legacy data:", error);
      // Don't throw here - backup failure shouldn't stop migration
    }
  }

  /**
   * Get migration status and details
   */
  static getMigrationStatus(): {
    completed: boolean;
    hasLegacyData: boolean;
    migrationRecord?: any;
  } {
    try {
      const completed = this.isMigrationCompleted();
      const hasLegacyData = this.hasLegacyData();

      let migrationRecord;
      if (completed) {
        const recordData = localStorage.getItem(this.MIGRATION_KEY);
        if (recordData) {
          migrationRecord = JSON.parse(recordData);
        }
      }

      return {
        completed,
        hasLegacyData,
        migrationRecord,
      };
    } catch (error) {
      console.error("Error getting migration status:", error);
      return {
        completed: false,
        hasLegacyData: false,
      };
    }
  }

  /**
   * Force re-run migration (for testing or troubleshooting)
   */
  static async forceMigration(): Promise<MigrationResult> {
    try {
      // Clear migration marker
      localStorage.removeItem(this.MIGRATION_KEY);

      // Run migration
      return await this.performMigration();
    } catch (error) {
      console.error("Failed to force migration:", error);
      throw error;
    }
  }
}

// Auto-run migration on module load (with safety checks)
export const initializeAchievementMigration =
  async (): Promise<MigrationResult | null> => {
    try {
      // Only run in browser environment
      if (
        typeof window === "undefined" ||
        typeof localStorage === "undefined"
      ) {
        return null;
      }

      // Check if migration is needed
      const status = LegacyAchievementMigration.getMigrationStatus();

      if (!status.completed && (status.hasLegacyData || !status.completed)) {
        console.log("🔄 Starting legacy achievement data migration...");
        const result = await LegacyAchievementMigration.performMigration();

        if (result.success) {
          console.log(
            "✅ Legacy achievement migration completed successfully:",
            {
              migratedAchievements: result.migratedAchievements,
              migratedBadges: result.migratedBadges,
              migratedProgress: result.migratedProgress,
            },
          );
        } else {
          console.warn(
            "⚠️ Legacy achievement migration completed with errors:",
            result.errors,
          );
        }

        return result;
      }

      return null;
    } catch (error) {
      console.error("❌ Failed to initialize achievement migration:", error);
      return null;
    }
  };
