// Enhanced Badge System for Jungle Adventure
export interface EnhancedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "legendary";
  category:
    | "rescue"
    | "skill"
    | "speed"
    | "streak"
    | "milestone"
    | "progression"
    | "exploration"
    | "mastery";
  requirements: {
    type: string;
    threshold: number;
    conditions?: Record<string, any>;
  };
  currentProgress: number;
  earned: boolean;
  earnedAt?: Date;
  rewards: {
    coins: number;
    xp: number;
    special?: {
      type: "theme" | "accessory" | "sound" | "title" | "effect";
      item: string;
    };
  };
  rarity: "common" | "rare" | "epic" | "legendary" | "mythic";
  jungleTheme: {
    glowColor: string;
    particleEffect: string;
    unlockAnimation: string;
    backgroundPattern: string;
  };
}

export interface BadgeCollection {
  totalBadges: number;
  earnedBadges: number;
  categories: Record<
    string,
    {
      total: number;
      earned: number;
      badges: EnhancedBadge[];
    }
  >;
  totalPoints: number;
  totalXP: number;
  prestigeLevel: number;
}

export interface BadgeStatistics {
  byCategory: Record<string, number>;
  byTier: Record<string, number>;
  byRarity: Record<string, number>;
  totalValue: number;
  progressToNext: {
    badgeId: string;
    progress: number;
    threshold: number;
  }[];
}

class EnhancedBadgeSystem {
  private badges: EnhancedBadge[] = [];
  private userBadges: Set<string> = new Set();

  constructor() {
    this.initializeBadges();
    this.loadUserBadges();
  }

  private initializeBadges(): void {
    this.badges = [
      // Word Rescue Badges
      {
        id: "word_rescue_rookie",
        name: "Rescue Rookie",
        description: "Successfully rescue 5 words from the forgotten jungle",
        icon: "🌱",
        tier: "bronze",
        category: "rescue",
        requirements: {
          type: "words_rescued",
          threshold: 5,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 25,
          xp: 50,
        },
        rarity: "common",
        jungleTheme: {
          glowColor: "#4CAF50",
          particleEffect: "green_sparkles",
          unlockAnimation: "leaf_burst",
          backgroundPattern: "jungle_leaves",
        },
      },
      {
        id: "word_rescue_guardian",
        name: "Word Guardian",
        description: "Protect 25 words and become their guardian",
        icon: "🛡️",
        tier: "silver",
        category: "rescue",
        requirements: {
          type: "words_rescued",
          threshold: 25,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 100,
          xp: 200,
          special: {
            type: "accessory",
            item: "Guardian Shield",
          },
        },
        rarity: "rare",
        jungleTheme: {
          glowColor: "#2196F3",
          particleEffect: "blue_shield",
          unlockAnimation: "shield_formation",
          backgroundPattern: "protective_aura",
        },
      },
      {
        id: "word_rescue_champion",
        name: "Word Champion",
        description: "Champion of 100 rescued words in the jungle",
        icon: "🏆",
        tier: "gold",
        category: "rescue",
        requirements: {
          type: "words_rescued",
          threshold: 100,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 500,
          xp: 1000,
          special: {
            type: "title",
            item: "Word Champion",
          },
        },
        rarity: "epic",
        jungleTheme: {
          glowColor: "#FFD700",
          particleEffect: "golden_crown",
          unlockAnimation: "champion_rise",
          backgroundPattern: "victory_laurels",
        },
      },

      // Skill Mastery Badges
      {
        id: "perfectionist_novice",
        name: "Perfectionist",
        description: "Achieve a perfect score in any jungle adventure",
        icon: "⭐",
        tier: "bronze",
        category: "skill",
        requirements: {
          type: "perfect_scores",
          threshold: 1,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 30,
          xp: 75,
        },
        rarity: "common",
        jungleTheme: {
          glowColor: "#FFC107",
          particleEffect: "star_burst",
          unlockAnimation: "star_formation",
          backgroundPattern: "starry_night",
        },
      },
      {
        id: "perfectionist_master",
        name: "Precision Master",
        description: "Achieve 10 perfect scores across all adventures",
        icon: "🌟",
        tier: "gold",
        category: "skill",
        requirements: {
          type: "perfect_scores",
          threshold: 10,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 300,
          xp: 600,
          special: {
            type: "effect",
            item: "Perfect Aura",
          },
        },
        rarity: "epic",
        jungleTheme: {
          glowColor: "#E91E63",
          particleEffect: "precision_beam",
          unlockAnimation: "master_glow",
          backgroundPattern: "geometric_perfection",
        },
      },

      // Speed Badges
      {
        id: "speed_runner_bronze",
        name: "Quick Explorer",
        description: "Complete a word rescue in under 30 seconds",
        icon: "⚡",
        tier: "bronze",
        category: "speed",
        requirements: {
          type: "speed_completion",
          threshold: 30,
          conditions: { operator: "less_than" },
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 40,
          xp: 80,
        },
        rarity: "common",
        jungleTheme: {
          glowColor: "#FF9800",
          particleEffect: "lightning_bolts",
          unlockAnimation: "speed_burst",
          backgroundPattern: "energy_waves",
        },
      },
      {
        id: "speed_runner_silver",
        name: "Lightning Rescuer",
        description: "Complete 5 rescues in under 20 seconds each",
        icon: "🌩️",
        tier: "silver",
        category: "speed",
        requirements: {
          type: "speed_completion_count",
          threshold: 5,
          conditions: { time_limit: 20 },
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 150,
          xp: 300,
          special: {
            type: "sound",
            item: "Lightning Sound Pack",
          },
        },
        rarity: "rare",
        jungleTheme: {
          glowColor: "#9C27B0",
          particleEffect: "storm_lightning",
          unlockAnimation: "lightning_strike",
          backgroundPattern: "electric_jungle",
        },
      },

      // Streak Badges
      {
        id: "daily_warrior_3",
        name: "Daily Warrior",
        description: "Learn words for 3 consecutive days",
        icon: "🔥",
        tier: "bronze",
        category: "streak",
        requirements: {
          type: "daily_streak",
          threshold: 3,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 60,
          xp: 120,
        },
        rarity: "common",
        jungleTheme: {
          glowColor: "#FF5722",
          particleEffect: "fire_trail",
          unlockAnimation: "flame_ignition",
          backgroundPattern: "burning_path",
        },
      },
      {
        id: "weekly_champion_7",
        name: "Weekly Champion",
        description: "Maintain a 7-day learning streak",
        icon: "🏅",
        tier: "silver",
        category: "streak",
        requirements: {
          type: "daily_streak",
          threshold: 7,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 200,
          xp: 400,
          special: {
            type: "theme",
            item: "Champion's Grove",
          },
        },
        rarity: "rare",
        jungleTheme: {
          glowColor: "#4CAF50",
          particleEffect: "victory_confetti",
          unlockAnimation: "champion_crown",
          backgroundPattern: "winner_jungle",
        },
      },
      {
        id: "dedication_master_30",
        name: "Dedication Master",
        description: "Achieve an incredible 30-day learning streak",
        icon: "👑",
        tier: "platinum",
        category: "streak",
        requirements: {
          type: "daily_streak",
          threshold: 30,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 1000,
          xp: 2000,
          special: {
            type: "title",
            item: "Dedication Master",
          },
        },
        rarity: "legendary",
        jungleTheme: {
          glowColor: "#E91E63",
          particleEffect: "royal_diamonds",
          unlockAnimation: "crown_ascension",
          backgroundPattern: "royal_jungle",
        },
      },

      // Milestone Badges
      {
        id: "first_steps",
        name: "First Steps",
        description: "Complete your very first word rescue",
        icon: "👶",
        tier: "bronze",
        category: "milestone",
        requirements: {
          type: "first_completion",
          threshold: 1,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 15,
          xp: 25,
        },
        rarity: "common",
        jungleTheme: {
          glowColor: "#81C784",
          particleEffect: "baby_sparkles",
          unlockAnimation: "first_bloom",
          backgroundPattern: "gentle_leaves",
        },
      },
      {
        id: "category_explorer_5",
        name: "Category Explorer",
        description: "Explore 5 different word categories",
        icon: "🗺️",
        tier: "silver",
        category: "exploration",
        requirements: {
          type: "categories_explored",
          threshold: 5,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 125,
          xp: 250,
          special: {
            type: "accessory",
            item: "Explorer's Compass",
          },
        },
        rarity: "rare",
        jungleTheme: {
          glowColor: "#3F51B5",
          particleEffect: "map_fragments",
          unlockAnimation: "compass_spin",
          backgroundPattern: "ancient_maps",
        },
      },

      // Progression Badges
      {
        id: "level_up_5",
        name: "Rising Explorer",
        description: "Reach Level 5 in your jungle journey",
        icon: "📈",
        tier: "bronze",
        category: "progression",
        requirements: {
          type: "level_reached",
          threshold: 5,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 75,
          xp: 150,
        },
        rarity: "common",
        jungleTheme: {
          glowColor: "#00BCD4",
          particleEffect: "level_up_rays",
          unlockAnimation: "growth_spiral",
          backgroundPattern: "ascending_vines",
        },
      },
      {
        id: "level_up_10",
        name: "Jungle Veteran",
        description: "Achieve the prestigious Level 10",
        icon: "🎖️",
        tier: "gold",
        category: "progression",
        requirements: {
          type: "level_reached",
          threshold: 10,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 400,
          xp: 800,
          special: {
            type: "title",
            item: "Jungle Veteran",
          },
        },
        rarity: "epic",
        jungleTheme: {
          glowColor: "#FF6F00",
          particleEffect: "veteran_stars",
          unlockAnimation: "medal_ceremony",
          backgroundPattern: "honor_vines",
        },
      },

      // Mastery Badges
      {
        id: "accuracy_expert_85",
        name: "Accuracy Expert",
        description: "Maintain 85% accuracy across all activities",
        icon: "🎯",
        tier: "silver",
        category: "mastery",
        requirements: {
          type: "overall_accuracy",
          threshold: 85,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 200,
          xp: 400,
          special: {
            type: "accessory",
            item: "Precision Scope",
          },
        },
        rarity: "rare",
        jungleTheme: {
          glowColor: "#795548",
          particleEffect: "targeting_reticle",
          unlockAnimation: "bullseye_hit",
          backgroundPattern: "precision_grid",
        },
      },
      {
        id: "jungle_legend",
        name: "Jungle Legend",
        description: "Achieve legendary status with 500 rescued words",
        icon: "🦁",
        tier: "legendary",
        category: "mastery",
        requirements: {
          type: "words_rescued",
          threshold: 500,
        },
        currentProgress: 0,
        earned: false,
        rewards: {
          coins: 2500,
          xp: 5000,
          special: {
            type: "title",
            item: "Jungle Legend",
          },
        },
        rarity: "mythic",
        jungleTheme: {
          glowColor: "#FF1744",
          particleEffect: "legendary_aura",
          unlockAnimation: "legend_awakening",
          backgroundPattern: "mythical_jungle",
        },
      },
    ];
  }

  private loadUserBadges(): void {
    try {
      const saved = localStorage.getItem("enhanced_user_badges");
      if (saved) {
        const badgeData = JSON.parse(saved);
        this.userBadges = new Set(badgeData.badges || []);

        // Update earned status and dates
        badgeData.earnedDates = badgeData.earnedDates || {};
        this.badges.forEach((badge) => {
          badge.earned = this.userBadges.has(badge.id);
          if (badge.earned && badgeData.earnedDates[badge.id]) {
            badge.earnedAt = new Date(badgeData.earnedDates[badge.id]);
          }
        });
      }
    } catch (error) {
      console.error("Error loading user badges:", error);
    }
  }

  private saveUserBadges(): void {
    try {
      const earnedDates: Record<string, string> = {};
      this.badges.forEach((badge) => {
        if (badge.earned && badge.earnedAt) {
          earnedDates[badge.id] = badge.earnedAt.toISOString();
        }
      });

      const badgeData = {
        badges: Array.from(this.userBadges),
        earnedDates,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem("enhanced_user_badges", JSON.stringify(badgeData));
    } catch (error) {
      console.error("Error saving user badges:", error);
    }
  }

  // Update badge progress based on user activities
  public updateProgress(progressData: Record<string, any>): void {
    let hasNewBadges = false;

    this.badges.forEach((badge) => {
      if (badge.earned) return; // Skip already earned badges

      let currentProgress = 0;

      switch (badge.requirements.type) {
        case "words_rescued":
          currentProgress = progressData.wordsLearned || 0;
          break;
        case "perfect_scores":
          currentProgress = progressData.perfectScores || 0;
          break;
        case "speed_completion":
          // Check if latest completion time meets requirement
          if (
            progressData.lastCompletionTime &&
            progressData.lastCompletionTime <= badge.requirements.threshold
          ) {
            currentProgress = badge.requirements.threshold;
          }
          break;
        case "speed_completion_count":
          currentProgress = progressData.speedCompletions || 0;
          break;
        case "daily_streak":
          currentProgress = progressData.currentStreak || 0;
          break;
        case "first_completion":
          currentProgress = progressData.completedActivities > 0 ? 1 : 0;
          break;
        case "categories_explored":
          currentProgress = progressData.categoriesExplored || 0;
          break;
        case "level_reached":
          currentProgress = progressData.currentLevel || 1;
          break;
        case "overall_accuracy":
          currentProgress = Math.round(progressData.overallAccuracy || 0);
          break;
        default:
          break;
      }

      badge.currentProgress = currentProgress;

      // Check if badge should be earned
      const meetsThreshold =
        badge.requirements.conditions?.operator === "less_than"
          ? currentProgress <= badge.requirements.threshold
          : currentProgress >= badge.requirements.threshold;

      if (meetsThreshold && !badge.earned) {
        this.earnBadge(badge.id);
        hasNewBadges = true;
      }
    });

    if (hasNewBadges) {
      this.saveUserBadges();
    }
  }

  // Earn a specific badge
  public earnBadge(badgeId: string): boolean {
    const badge = this.badges.find((b) => b.id === badgeId);
    if (!badge || badge.earned) return false;

    badge.earned = true;
    badge.earnedAt = new Date();
    this.userBadges.add(badgeId);

    // Trigger celebration animation
    this.triggerBadgeUnlockCelebration(badge);

    this.saveUserBadges();
    return true;
  }

  // Get all badges
  public getAllBadges(): EnhancedBadge[] {
    return [...this.badges];
  }

  // Get badges by category
  public getBadgesByCategory(category: string): EnhancedBadge[] {
    return this.badges.filter((badge) => badge.category === category);
  }

  // Get earned badges
  public getEarnedBadges(): EnhancedBadge[] {
    return this.badges.filter((badge) => badge.earned);
  }

  // Get badge collection overview
  public getBadgeCollection(): BadgeCollection {
    const categories: Record<
      string,
      { total: number; earned: number; badges: EnhancedBadge[] }
    > = {};

    // Group badges by category
    this.badges.forEach((badge) => {
      if (!categories[badge.category]) {
        categories[badge.category] = { total: 0, earned: 0, badges: [] };
      }
      categories[badge.category].total++;
      categories[badge.category].badges.push(badge);
      if (badge.earned) {
        categories[badge.category].earned++;
      }
    });

    const earnedBadges = this.getEarnedBadges();
    const totalPoints = earnedBadges.reduce(
      (sum, badge) => sum + badge.rewards.coins,
      0,
    );
    const totalXP = earnedBadges.reduce(
      (sum, badge) => sum + badge.rewards.xp,
      0,
    );

    // Calculate prestige level based on rare badges earned
    const rareBadges = earnedBadges.filter(
      (b) =>
        b.rarity === "epic" ||
        b.rarity === "legendary" ||
        b.rarity === "mythic",
    ).length;
    const prestigeLevel = Math.floor(rareBadges / 3) + 1;

    return {
      totalBadges: this.badges.length,
      earnedBadges: earnedBadges.length,
      categories,
      totalPoints,
      totalXP,
      prestigeLevel,
    };
  }

  // Get badge statistics
  public getBadgeStatistics(): BadgeStatistics {
    const earnedBadges = this.getEarnedBadges();

    const byCategory: Record<string, number> = {};
    const byTier: Record<string, number> = {};
    const byRarity: Record<string, number> = {};

    earnedBadges.forEach((badge) => {
      byCategory[badge.category] = (byCategory[badge.category] || 0) + 1;
      byTier[badge.tier] = (byTier[badge.tier] || 0) + 1;
      byRarity[badge.rarity] = (byRarity[badge.rarity] || 0) + 1;
    });

    const totalValue = earnedBadges.reduce(
      (sum, badge) => sum + badge.rewards.coins + badge.rewards.xp,
      0,
    );

    // Find closest badges to completion
    const progressToNext = this.badges
      .filter((badge) => !badge.earned)
      .map((badge) => ({
        badgeId: badge.id,
        progress: badge.currentProgress,
        threshold: badge.requirements.threshold,
      }))
      .sort((a, b) => {
        const aPercent = a.progress / a.threshold;
        const bPercent = b.progress / b.threshold;
        return bPercent - aPercent;
      })
      .slice(0, 5);

    return {
      byCategory,
      byTier,
      byRarity,
      totalValue,
      progressToNext,
    };
  }

  // Get next achievable badges
  public getNextAchievableBadges(limit: number = 3): EnhancedBadge[] {
    return this.badges
      .filter((badge) => !badge.earned)
      .map((badge) => ({
        ...badge,
        progressPercent:
          (badge.currentProgress / badge.requirements.threshold) * 100,
      }))
      .sort((a, b) => b.progressPercent - a.progressPercent)
      .slice(0, limit);
  }

  // Trigger badge unlock celebration
  private triggerBadgeUnlockCelebration(badge: EnhancedBadge): void {
    // Dispatch custom event for celebration animation
    const event = new CustomEvent("badgeUnlocked", {
      detail: {
        badge,
        celebration: {
          type: "jungle_badge_unlock",
          duration: 3000,
          effects: [
            badge.jungleTheme.unlockAnimation,
            badge.jungleTheme.particleEffect,
          ],
          colors: [badge.jungleTheme.glowColor],
          sound: `badge_unlock_${badge.tier}`,
        },
      },
    });

    window.dispatchEvent(event);
  }

  // Get badge by ID
  public getBadgeById(id: string): EnhancedBadge | null {
    return this.badges.find((badge) => badge.id === id) || null;
  }

  // Reset all badges (for testing)
  public resetAllBadges(): void {
    this.badges.forEach((badge) => {
      badge.earned = false;
      badge.earnedAt = undefined;
      badge.currentProgress = 0;
    });
    this.userBadges.clear();
    localStorage.removeItem("enhanced_user_badges");
  }

  // Import badge progress from existing system
  public importFromExistingSystem(existingBadges: any[]): void {
    existingBadges.forEach((oldBadge) => {
      const enhancedBadge = this.badges.find(
        (b) =>
          b.name.toLowerCase().includes(oldBadge.name?.toLowerCase()) ||
          b.id === oldBadge.id,
      );

      if (enhancedBadge && !enhancedBadge.earned) {
        enhancedBadge.currentProgress = oldBadge.currentProgress || 0;
        if (oldBadge.unlocked || oldBadge.earned) {
          this.earnBadge(enhancedBadge.id);
        }
      }
    });
  }
}

// Export singleton instance
export const enhancedBadgeSystem = new EnhancedBadgeSystem();
