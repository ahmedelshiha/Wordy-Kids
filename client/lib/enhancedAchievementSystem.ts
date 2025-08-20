import { EnhancedAchievementTracker } from "./enhancedAchievementTracker";
import { goalProgressTracker } from "./goalProgressTracker";
import { CategoryCompletionTracker } from "./categoryCompletionTracker";

// Enhanced Achievement System Types
export interface EnhancedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | "learning"
    | "streak"
    | "quiz"
    | "exploration"
    | "social"
    | "mastery";
  difficulty: "bronze" | "silver" | "gold" | "diamond" | "legendary";
  requirements: {
    type: string;
    threshold: number;
    conditions?: Record<string, any>;
  };
  currentProgress: number;
  unlocked: boolean;
  dateUnlocked?: Date;
  reward: {
    type:
      | "avatar_accessory"
      | "theme"
      | "sound_effect"
      | "title"
      | "points"
      | "badge";
    item: string;
    value: number;
    rarity: "common" | "rare" | "epic" | "legendary";
  };
  jungleTheme: {
    glowColor: string;
    particleEffect: string;
    celebrationSound: string;
    backgroundGradient: string;
  };
}

export interface LearningJourney {
  totalWordsLearned: number;
  streakDays: number;
  totalAccuracy: number;
  categoriesCompleted: string[];
  difficultyLevels: {
    easy: { completed: number; accuracy: number };
    medium: { completed: number; accuracy: number };
    hard: { completed: number; accuracy: number };
  };
  weeklyProgress: number[];
  monthlyProgress: number[];
  achievements: EnhancedAchievement[];
  badges: string[];
  level: number;
  experience: number;
  nextLevelThreshold: number;
}

export interface ProgressMilestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  category: string;
  rewards: Array<{
    type: string;
    value: number;
    description: string;
  }>;
  isReached: boolean;
  reachedAt?: Date;
}

class EnhancedAchievementSystem {
  private achievements: EnhancedAchievement[] = [];
  private userProgress: LearningJourney | null = null;
  private milestones: ProgressMilestone[] = [];

  constructor() {
    this.initializeAchievements();
    this.initializeMilestones();
    this.initialize();
  }

  // Initialize comprehensive achievement system
  private initializeAchievements(): void {
    this.achievements = [
      // Learning Category
      {
        id: "word_explorer_10",
        name: "Word Explorer",
        description: "Discover 10 new words in the jungle of learning",
        icon: "🌱",
        category: "learning",
        difficulty: "bronze",
        requirements: {
          type: "words_learned",
          threshold: 10,
        },
        currentProgress: 0,
        unlocked: false,
        reward: {
          type: "points",
          item: "Explorer Points",
          value: 100,
          rarity: "common",
        },
        jungleTheme: {
          glowColor: "#4CAF50",
          particleEffect: "leaves",
          celebrationSound: "jungle_cheer",
          backgroundGradient: "from-green-400/20 to-emerald-500/20",
        },
      },
      {
        id: "word_scholar_50",
        name: "Jungle Scholar",
        description: "Master 50 words and become a jungle wisdom keeper",
        icon: "🦉",
        category: "learning",
        difficulty: "silver",
        requirements: {
          type: "words_learned",
          threshold: 50,
        },
        currentProgress: 0,
        unlocked: false,
        reward: {
          type: "theme",
          item: "Wise Owl Theme",
          value: 250,
          rarity: "rare",
        },
        jungleTheme: {
          glowColor: "#FF9800",
          particleEffect: "golden_leaves",
          celebrationSound: "owl_wisdom",
          backgroundGradient: "from-orange-400/20 to-yellow-500/20",
        },
      },
      {
        id: "word_master_100",
        name: "Jungle Word Master",
        description: "Command 100 words like a true jungle guardian",
        icon: "🐯",
        category: "learning",
        difficulty: "gold",
        requirements: {
          type: "words_learned",
          threshold: 100,
        },
        currentProgress: 0,
        unlocked: false,
        reward: {
          type: "avatar_accessory",
          item: "Tiger Stripes",
          value: 500,
          rarity: "epic",
        },
        jungleTheme: {
          glowColor: "#FF5722",
          particleEffect: "tiger_sparkles",
          celebrationSound: "tiger_roar",
          backgroundGradient: "from-orange-500/20 to-red-500/20",
        },
      },

      // Streak Category
      {
        id: "daily_adventurer_3",
        name: "Daily Adventurer",
        description: "Explore the jungle for 3 consecutive days",
        icon: "🔥",
        category: "streak",
        difficulty: "bronze",
        requirements: {
          type: "streak_days",
          threshold: 3,
        },
        currentProgress: 0,
        unlocked: false,
        reward: {
          type: "points",
          item: "Streak Fire",
          value: 150,
          rarity: "common",
        },
        jungleTheme: {
          glowColor: "#FF9800",
          particleEffect: "fire_sparks",
          celebrationSound: "campfire_crackle",
          backgroundGradient: "from-orange-400/20 to-red-400/20",
        },
      },
      {
        id: "weekly_explorer_7",
        name: "Weekly Explorer",
        description: "Maintain your jungle journey for a full week",
        icon: "🌟",
        category: "streak",
        difficulty: "silver",
        requirements: {
          type: "streak_days",
          threshold: 7,
        },
        currentProgress: 0,
        unlocked: false,
        reward: {
          type: "sound_effect",
          item: "Victory Trumpet",
          value: 300,
          rarity: "rare",
        },
        jungleTheme: {
          glowColor: "#FFC107",
          particleEffect: "star_shower",
          celebrationSound: "victory_trumpet",
          backgroundGradient: "from-yellow-400/20 to-orange-400/20",
        },
      },

      // Quiz Category
      {
        id: "quiz_champion_5",
        name: "Quiz Champion",
        description: "Complete 5 jungle quiz adventures successfully",
        icon: "🧠",
        category: "quiz",
        difficulty: "bronze",
        requirements: {
          type: "quizzes_completed",
          threshold: 5,
        },
        currentProgress: 0,
        unlocked: false,
        reward: {
          type: "title",
          item: "Brain Explorer",
          value: 200,
          rarity: "common",
        },
        jungleTheme: {
          glowColor: "#9C27B0",
          particleEffect: "brain_waves",
          celebrationSound: "quiz_success",
          backgroundGradient: "from-purple-400/20 to-pink-400/20",
        },
      },

      // Exploration Category
      {
        id: "category_explorer_3",
        name: "Category Explorer",
        description: "Explore 3 different word categories in the jungle",
        icon: "🗺️",
        category: "exploration",
        difficulty: "bronze",
        requirements: {
          type: "categories_explored",
          threshold: 3,
        },
        currentProgress: 0,
        unlocked: false,
        reward: {
          type: "badge",
          item: "Explorer Badge",
          value: 150,
          rarity: "common",
        },
        jungleTheme: {
          glowColor: "#2196F3",
          particleEffect: "map_sparkles",
          celebrationSound: "exploration_fanfare",
          backgroundGradient: "from-blue-400/20 to-cyan-400/20",
        },
      },

      // Mastery Category
      {
        id: "accuracy_master_90",
        name: "Precision Master",
        description: "Achieve 90% accuracy across all jungle adventures",
        icon: "🎯",
        category: "mastery",
        difficulty: "gold",
        requirements: {
          type: "overall_accuracy",
          threshold: 90,
        },
        currentProgress: 0,
        unlocked: false,
        reward: {
          type: "avatar_accessory",
          item: "Golden Arrow",
          value: 750,
          rarity: "epic",
        },
        jungleTheme: {
          glowColor: "#FFD700",
          particleEffect: "golden_arrows",
          celebrationSound: "precision_bell",
          backgroundGradient: "from-yellow-300/20 to-amber-400/20",
        },
      },

      // Legendary Achievement
      {
        id: "jungle_legend",
        name: "Jungle Legend",
        description: "Master 500 words and become a legendary jungle guardian",
        icon: "👑",
        category: "mastery",
        difficulty: "legendary",
        requirements: {
          type: "words_learned",
          threshold: 500,
        },
        currentProgress: 0,
        unlocked: false,
        reward: {
          type: "theme",
          item: "Legendary Crown Theme",
          value: 2000,
          rarity: "legendary",
        },
        jungleTheme: {
          glowColor: "#E91E63",
          particleEffect: "royal_shimmer",
          celebrationSound: "legendary_fanfare",
          backgroundGradient: "from-pink-400/20 to-purple-500/20",
        },
      },
    ];
  }

  // Initialize progress milestones
  private initializeMilestones(): void {
    this.milestones = [
      {
        id: "milestone_10_words",
        name: "First Steps",
        description: "Your first 10 words in the jungle",
        icon: "🌱",
        threshold: 10,
        category: "words_learned",
        rewards: [
          { type: "points", value: 50, description: "Starter points" },
          {
            type: "encouragement",
            value: 1,
            description: "You're doing great!",
          },
        ],
        isReached: false,
      },
      {
        id: "milestone_25_words",
        name: "Growing Strong",
        description: "Quarter-century of words conquered",
        icon: "🌿",
        threshold: 25,
        category: "words_learned",
        rewards: [
          { type: "points", value: 125, description: "Growth bonus" },
          { type: "unlock", value: 1, description: "New categories available" },
        ],
        isReached: false,
      },
      {
        id: "milestone_50_words",
        name: "Jungle Explorer",
        description: "Half a hundred words explored",
        icon: "🦋",
        threshold: 50,
        category: "words_learned",
        rewards: [
          { type: "points", value: 250, description: "Explorer bonus" },
          { type: "theme", value: 1, description: "Butterfly theme unlocked" },
        ],
        isReached: false,
      },
      {
        id: "milestone_100_words",
        name: "Word Guardian",
        description: "One hundred words under your protection",
        icon: "🛡️",
        threshold: 100,
        category: "words_learned",
        rewards: [
          { type: "points", value: 500, description: "Guardian bonus" },
          { type: "avatar", value: 1, description: "Guardian shield unlocked" },
        ],
        isReached: false,
      },
    ];
  }

  // Get current learning journey
  public async getLearningJourney(userId: string): Promise<LearningJourney> {
    try {
      // Get data from existing trackers
      const enhancedProgress = EnhancedAchievementTracker.getJourneyProgress();
      const achievements = this.getAchievements();
      const progressData =
        await goalProgressTracker.fetchSystematicProgress(userId);

      // Calculate weekly and monthly progress
      const weeklyProgress = this.calculateWeeklyProgress(userId);
      const monthlyProgress = this.calculateMonthlyProgress(userId);

      // Calculate level and experience
      const { level, experience, nextLevelThreshold } =
        this.calculateLevelProgress(enhancedProgress.wordsLearned || 0);

      this.userProgress = {
        totalWordsLearned: enhancedProgress.wordsLearned || 0,
        streakDays: enhancedProgress.streakDays || 0,
        totalAccuracy: enhancedProgress.totalAccuracy || 85,
        categoriesCompleted: this.getCategoriesCompleted(),
        difficultyLevels: {
          easy: {
            completed: enhancedProgress.difficultyStats?.easy?.completed || 0,
            accuracy: enhancedProgress.difficultyStats?.easy?.accuracy || 0,
          },
          medium: {
            completed: enhancedProgress.difficultyStats?.medium?.completed || 0,
            accuracy: enhancedProgress.difficultyStats?.medium?.accuracy || 0,
          },
          hard: {
            completed: enhancedProgress.difficultyStats?.hard?.completed || 0,
            accuracy: enhancedProgress.difficultyStats?.hard?.accuracy || 0,
          },
        },
        weeklyProgress,
        monthlyProgress,
        achievements,
        badges: enhancedProgress.badges || [],
        level,
        experience,
        nextLevelThreshold,
      };

      return this.userProgress;
    } catch (error) {
      console.error("Error loading learning journey:", error);
      return this.getDefaultJourney();
    }
  }

  // Calculate level and experience based on words learned
  private calculateLevelProgress(wordsLearned: number): {
    level: number;
    experience: number;
    nextLevelThreshold: number;
  } {
    // Experience formula: words learned * 10 + bonus for milestones
    let experience = wordsLearned * 10;

    // Bonus experience for milestones
    if (wordsLearned >= 10) experience += 50;
    if (wordsLearned >= 25) experience += 100;
    if (wordsLearned >= 50) experience += 200;
    if (wordsLearned >= 100) experience += 500;

    // Level calculation: exponential growth
    let level = 1;
    let currentThreshold = 100;
    let totalNeeded = 0;

    while (experience >= totalNeeded + currentThreshold) {
      totalNeeded += currentThreshold;
      level++;
      currentThreshold = Math.floor(currentThreshold * 1.5); // 50% increase per level
    }

    const nextLevelThreshold = totalNeeded + currentThreshold;

    return { level, experience, nextLevelThreshold };
  }

  // Get achievements with current progress
  public getAchievements(): EnhancedAchievement[] {
    return this.achievements.map((achievement) => {
      const progress = this.calculateAchievementProgress(achievement);
      return {
        ...achievement,
        currentProgress: progress.current,
        unlocked: progress.unlocked,
        dateUnlocked: progress.dateUnlocked,
      };
    });
  }

  // Calculate progress for a specific achievement
  private calculateAchievementProgress(achievement: EnhancedAchievement): {
    current: number;
    unlocked: boolean;
    dateUnlocked?: Date;
  } {
    try {
      const journeyProgress = EnhancedAchievementTracker.getJourneyProgress();
      let current = 0;

      switch (achievement.requirements.type) {
        case "words_learned":
          current = journeyProgress.wordsLearned || 0;
          break;
        case "streak_days":
          current = journeyProgress.streakDays || 0;
          break;
        case "quizzes_completed":
          current = journeyProgress.quizzesCompleted || 0;
          break;
        case "categories_explored":
          current = this.getCategoriesCompleted().length;
          break;
        case "overall_accuracy":
          current = journeyProgress.totalAccuracy || 0;
          break;
        default:
          current = 0;
      }

      const unlocked = current >= achievement.requirements.threshold;
      const dateUnlocked = unlocked ? new Date() : undefined;

      return { current, unlocked, dateUnlocked };
    } catch (error) {
      console.error("Error calculating achievement progress:", error);
      return { current: 0, unlocked: false };
    }
  }

  // Get completed categories
  private getCategoriesCompleted(): string[] {
    try {
      const completionHistory =
        CategoryCompletionTracker.getCompletionHistory();
      const completedCategories = new Set<string>();

      completionHistory.forEach((record: any) => {
        if (record.completed) {
          completedCategories.add(record.categoryId);
        }
      });

      return Array.from(completedCategories);
    } catch (error) {
      console.error("Error getting completed categories:", error);
      return [];
    }
  }

  // Calculate weekly progress
  private calculateWeeklyProgress(userId: string): number[] {
    const weeklyData: number[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      try {
        const dailyData = localStorage.getItem(
          `daily_progress_${userId}_${dateKey}`,
        );
        if (dailyData) {
          const parsed = JSON.parse(dailyData);
          weeklyData.push(parsed.words || 0);
        } else {
          weeklyData.push(0);
        }
      } catch (error) {
        weeklyData.push(0);
      }
    }

    return weeklyData;
  }

  // Calculate monthly progress
  private calculateMonthlyProgress(userId: string): number[] {
    const monthlyData: number[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];

      try {
        const dailyData = localStorage.getItem(
          `daily_progress_${userId}_${dateKey}`,
        );
        if (dailyData) {
          const parsed = JSON.parse(dailyData);
          monthlyData.push(parsed.words || 0);
        } else {
          monthlyData.push(0);
        }
      } catch (error) {
        monthlyData.push(0);
      }
    }

    return monthlyData;
  }

  // Get progress milestones
  public getProgressMilestones(): ProgressMilestone[] {
    if (!this.userProgress) return this.milestones;

    return this.milestones.map((milestone) => ({
      ...milestone,
      isReached: this.userProgress!.totalWordsLearned >= milestone.threshold,
      reachedAt:
        this.userProgress!.totalWordsLearned >= milestone.threshold
          ? new Date()
          : undefined,
    }));
  }

  // Unlock achievement
  public unlockAchievement(achievementId: string): boolean {
    const achievement = this.achievements.find((a) => a.id === achievementId);
    if (!achievement) return false;

    achievement.unlocked = true;
    achievement.dateUnlocked = new Date();

    // Update enhanced tracker
    EnhancedAchievementTracker.unlockAchievement(achievementId);

    return true;
  }

  // Get default journey for error fallback
  private getDefaultJourney(): LearningJourney {
    return {
      totalWordsLearned: 0,
      streakDays: 0,
      totalAccuracy: 0,
      categoriesCompleted: [],
      difficultyLevels: {
        easy: { completed: 0, accuracy: 0 },
        medium: { completed: 0, accuracy: 0 },
        hard: { completed: 0, accuracy: 0 },
      },
      weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
      monthlyProgress: Array(30).fill(0),
      achievements: this.achievements,
      badges: [],
      level: 1,
      experience: 0,
      nextLevelThreshold: 100,
    };
  }

  // Get achievement by ID
  public getAchievementById(id: string): EnhancedAchievement | null {
    return this.achievements.find((a) => a.id === id) || null;
  }

  // Get achievements by category
  public getAchievementsByCategory(category: string): EnhancedAchievement[] {
    return this.getAchievements().filter((a) => a.category === category);
  }

  // Get unlocked achievements
  public getUnlockedAchievements(): EnhancedAchievement[] {
    return this.getAchievements().filter((a) => a.unlocked);
  }

  // Calculate total achievement points
  public getTotalAchievementPoints(): number {
    return this.getUnlockedAchievements().reduce((total, achievement) => {
      return total + achievement.reward.value;
    }, 0);
  }

  // Track progress and check for milestone unlocks
  public trackProgress(progressData: {
    wordsLearned?: number;
    streakDays?: number;
    totalAccuracy?: number;
    categoriesCompleted?: string[];
    quizScore?: number;
    sessionCount?: number;
  }): EnhancedAchievement[] {
    const newlyUnlocked: EnhancedAchievement[] = [];

    this.achievements.forEach((achievement) => {
      if (!achievement.unlocked) {
        let shouldUnlock = false;

        // Check achievement requirements
        switch (achievement.requirements.type) {
          case "words_learned":
            shouldUnlock =
              (progressData.wordsLearned || 0) >=
              achievement.requirements.threshold;
            achievement.currentProgress = progressData.wordsLearned || 0;
            break;

          case "streak_days":
            shouldUnlock =
              (progressData.streakDays || 0) >=
              achievement.requirements.threshold;
            achievement.currentProgress = progressData.streakDays || 0;
            break;

          case "accuracy":
            shouldUnlock =
              (progressData.totalAccuracy || 0) >=
              achievement.requirements.threshold;
            achievement.currentProgress = progressData.totalAccuracy || 0;
            break;

          case "categories_completed":
            const categoriesCount =
              progressData.categoriesCompleted?.length || 0;
            shouldUnlock =
              categoriesCount >= achievement.requirements.threshold;
            achievement.currentProgress = categoriesCount;
            break;

          case "quiz_score":
            shouldUnlock =
              (progressData.quizScore || 0) >=
              achievement.requirements.threshold;
            achievement.currentProgress = progressData.quizScore || 0;
            break;

          case "session_count":
            shouldUnlock =
              (progressData.sessionCount || 0) >=
              achievement.requirements.threshold;
            achievement.currentProgress = progressData.sessionCount || 0;
            break;
        }

        if (shouldUnlock) {
          achievement.unlocked = true;
          achievement.dateUnlocked = new Date();
          newlyUnlocked.push(achievement);

          // Trigger milestone unlocked event
          this.triggerMilestoneUnlocked(achievement);
        }
      }
    });

    // Save progress to localStorage
    this.saveAchievements();

    return newlyUnlocked;
  }

  // Trigger milestone unlocked event
  private triggerMilestoneUnlocked(achievement: EnhancedAchievement): void {
    const event = new CustomEvent("milestoneUnlocked", {
      detail: { achievement },
    });
    window.dispatchEvent(event);
  }

  // Claim achievement reward
  public claimAchievement(achievementId: string): boolean {
    const achievement = this.getAchievementById(achievementId);
    if (achievement && achievement.unlocked) {
      // Mark as claimed (could add a claimed property to track this)
      // For now, just trigger a claimed event
      const event = new CustomEvent("achievementClaimed", {
        detail: { achievement },
      });
      window.dispatchEvent(event);
      return true;
    }
    return false;
  }

  // Save achievements to localStorage
  private saveAchievements(): void {
    try {
      localStorage.setItem(
        "enhancedAchievements",
        JSON.stringify(this.achievements),
      );
    } catch (error) {
      console.error("Error saving achievements:", error);
    }
  }

  // Load achievements from localStorage
  private loadAchievements(): void {
    try {
      const saved = localStorage.getItem("enhancedAchievements");
      if (saved) {
        const savedAchievements = JSON.parse(saved);
        // Merge saved progress with current achievements
        this.achievements.forEach((achievement) => {
          const saved = savedAchievements.find(
            (s: any) => s.id === achievement.id,
          );
          if (saved) {
            achievement.unlocked = saved.unlocked;
            achievement.currentProgress = saved.currentProgress;
            achievement.dateUnlocked = saved.dateUnlocked
              ? new Date(saved.dateUnlocked)
              : undefined;
          }
        });
      }
    } catch (error) {
      console.error("Error loading achievements:", error);
    }
  }

  // Initialize system (call this when system starts)
  public initialize(): void {
    this.loadAchievements();
  }

  // Get pending achievements (unlocked but not claimed)
  public getPendingAchievements(): EnhancedAchievement[] {
    return this.getUnlockedAchievements(); // For now, all unlocked are "pending"
  }
}

// Export singleton instance
export const enhancedAchievementSystem = new EnhancedAchievementSystem();
