interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "learning" | "streak" | "quiz" | "exploration" | "social" | "journey";
  difficulty: "bronze" | "silver" | "gold" | "diamond";
  requirements: number;
  currentProgress: number;
  unlocked: boolean;
  dateUnlocked?: Date;
  reward?: {
    type: "avatar_accessory" | "theme" | "sound_effect" | "title" | "points";
    item: string;
    value?: number;
  };
  // Enhanced criteria for journey achievements
  criteria?: {
    type: "wordsLearned" | "streakDays" | "quizScore" | "categoryMastery" | "accuracy" | "timeSpent" | "sessionComplete" | "vowelRescue";
    target: number;
    category?: string;
    difficulty?: string;
    timeFrame?: "daily" | "weekly" | "monthly" | "allTime";
    operator?: ">="|">" | "=" | "<=" | "<";
    additionalRequirements?: Array<{
      type: string;
      target: number;
      operator?: string;
    }>;
  }[];
}

interface JourneyProgress {
  wordsLearned: number;
  streakDays: number;
  quizzesPerfect: number;
  categoriesExplored: Set<string>;
  totalAccuracy: number;
  timeSpentLearning: number; // in minutes
  vowelQuizzesCompleted: number;
  lastActivityDate: Date;
  sessionStats: {
    totalSessions: number;
    perfectSessions: number;
    averageWordsPerSession: number;
  };
}

export class AchievementTracker {
  private static achievements: Achievement[] = [
    // Basic Learning Achievements
    {
      id: "first_word",
      name: "First Steps",
      description: "Learn your very first word!",
      icon: "🎯",
      category: "learning",
      difficulty: "bronze",
      requirements: 1,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "wordsLearned",
          target: 1,
          operator: ">="
        }
      ],
      reward: { type: "avatar_accessory", item: "Beginner Badge" }
    },

    // Journey-specific Achievements
    {
      id: "vowel_rescue_hero",
      name: "Vowel Rescue Hero",
      description: "Complete 10 Vowel Rescue challenges successfully!",
      icon: "🎯",
      category: "journey",
      difficulty: "silver",
      requirements: 10,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "vowelRescue",
          target: 10,
          operator: ">="
        }
      ],
      reward: { type: "title", item: "Vowel Master" }
    },

    {
      id: "perfect_streak_scholar",
      name: "Perfect Streak Scholar",
      description: "Maintain 90%+ accuracy for 7 consecutive days!",
      icon: "🌟",
      category: "journey",
      difficulty: "gold",
      requirements: 7,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "accuracy",
          target: 90,
          operator: ">=",
          timeFrame: "daily"
        },
        {
          type: "streakDays",
          target: 7,
          operator: ">="
        }
      ],
      reward: { type: "theme", item: "Scholar's Golden Theme" }
    },

    {
      id: "category_conqueror",
      name: "Category Conqueror",
      description: "Master 3 different categories with 85%+ accuracy!",
      icon: "🏰",
      category: "journey",
      difficulty: "gold",
      requirements: 3,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "categoryMastery",
          target: 3,
          operator: ">=",
          additionalRequirements: [
            {
              type: "accuracy",
              target: 85,
              operator: ">="
            }
          ]
        }
      ],
      reward: { type: "title", item: "Word Conqueror" }
    },

    {
      id: "quiz_champion",
      name: "Quiz Champion",
      description: "Score 100% on 10 quizzes in a single week!",
      icon: "🏆",
      category: "journey",
      difficulty: "diamond",
      requirements: 10,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "quizScore",
          target: 100,
          operator: "=",
          timeFrame: "weekly"
        }
      ],
      reward: { type: "points", item: "Bonus Points", value: 500 }
    },

    {
      id: "learning_marathon",
      name: "Learning Marathon",
      description: "Spend 300 minutes learning in a single month!",
      icon: "🏃‍♂️",
      category: "journey",
      difficulty: "silver",
      requirements: 300,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "timeSpent",
          target: 300,
          operator: ">=",
          timeFrame: "monthly"
        }
      ],
      reward: { type: "avatar_accessory", item: "Marathon Medal" }
    },

    {
      id: "session_perfectionist",
      name: "Session Perfectionist",
      description: "Complete 5 perfect learning sessions (100% accuracy)!",
      icon: "💎",
      category: "journey",
      difficulty: "gold",
      requirements: 5,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "sessionComplete",
          target: 5,
          operator: ">=",
          additionalRequirements: [
            {
              type: "accuracy",
              target: 100,
              operator: "="
            }
          ]
        }
      ],
      reward: { type: "theme", item: "Perfectionist Crystal Theme" }
    }
  ];

  private static journeyProgress: JourneyProgress = {
    wordsLearned: 0,
    streakDays: 0,
    quizzesPerfect: 0,
    categoriesExplored: new Set(),
    totalAccuracy: 0,
    timeSpentLearning: 0,
    vowelQuizzesCompleted: 0,
    lastActivityDate: new Date(),
    sessionStats: {
      totalSessions: 0,
      perfectSessions: 0,
      averageWordsPerSession: 0
    }
  };

  /**
   * Update journey progress and check for newly unlocked achievements
   */
  static updateJourneyProgress(progressUpdate: Partial<JourneyProgress>): Achievement[] {
    // Update the journey progress
    Object.assign(this.journeyProgress, progressUpdate);
    
    // Check for newly unlocked achievements
    const newlyUnlocked = this.checkForNewAchievements();
    
    return newlyUnlocked;
  }

  /**
   * Track specific activity completion
   */
  static trackActivity(activity: {
    type: "quiz" | "vowelRescue" | "wordLearning" | "sessionComplete";
    score?: number;
    accuracy?: number;
    category?: string;
    timeSpent?: number;
    wordsLearned?: number;
  }): Achievement[] {
    const progressUpdate: Partial<JourneyProgress> = {};

    switch (activity.type) {
      case "quiz":
        if (activity.score === 100) {
          progressUpdate.quizzesPerfect = this.journeyProgress.quizzesPerfect + 1;
        }
        if (activity.accuracy) {
          progressUpdate.totalAccuracy = 
            (this.journeyProgress.totalAccuracy + activity.accuracy) / 2;
        }
        break;

      case "vowelRescue":
        progressUpdate.vowelQuizzesCompleted = 
          this.journeyProgress.vowelQuizzesCompleted + 1;
        if (activity.accuracy) {
          progressUpdate.totalAccuracy = 
            (this.journeyProgress.totalAccuracy + activity.accuracy) / 2;
        }
        break;

      case "wordLearning":
        if (activity.wordsLearned) {
          progressUpdate.wordsLearned = 
            this.journeyProgress.wordsLearned + activity.wordsLearned;
        }
        if (activity.category) {
          const newCategories = new Set(this.journeyProgress.categoriesExplored);
          newCategories.add(activity.category);
          progressUpdate.categoriesExplored = newCategories;
        }
        break;

      case "sessionComplete":
        progressUpdate.sessionStats = {
          ...this.journeyProgress.sessionStats,
          totalSessions: this.journeyProgress.sessionStats.totalSessions + 1,
          perfectSessions: activity.accuracy === 100 
            ? this.journeyProgress.sessionStats.perfectSessions + 1
            : this.journeyProgress.sessionStats.perfectSessions
        };
        break;
    }

    if (activity.timeSpent) {
      progressUpdate.timeSpentLearning = 
        this.journeyProgress.timeSpentLearning + activity.timeSpent;
    }

    progressUpdate.lastActivityDate = new Date();

    return this.updateJourneyProgress(progressUpdate);
  }

  /**
   * Check for newly unlocked achievements based on current progress
   */
  private static checkForNewAchievements(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (achievement.unlocked || !achievement.criteria) continue;

      const isUnlocked = this.evaluateAchievementCriteria(achievement);
      
      if (isUnlocked) {
        achievement.unlocked = true;
        achievement.dateUnlocked = new Date();
        achievement.currentProgress = achievement.requirements;
        newlyUnlocked.push(achievement);
      } else {
        // Update current progress
        achievement.currentProgress = this.calculateAchievementProgress(achievement);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Evaluate if achievement criteria are met
   */
  private static evaluateAchievementCriteria(achievement: Achievement): boolean {
    if (!achievement.criteria) return false;

    return achievement.criteria.every(criterion => {
      switch (criterion.type) {
        case "wordsLearned":
          return this.evaluateNumericCriterion(
            this.journeyProgress.wordsLearned,
            criterion.target,
            criterion.operator || ">="
          );

        case "vowelRescue":
          return this.evaluateNumericCriterion(
            this.journeyProgress.vowelQuizzesCompleted,
            criterion.target,
            criterion.operator || ">="
          );

        case "streakDays":
          return this.evaluateNumericCriterion(
            this.journeyProgress.streakDays,
            criterion.target,
            criterion.operator || ">="
          );

        case "quizScore":
          return this.evaluateNumericCriterion(
            this.journeyProgress.quizzesPerfect,
            criterion.target,
            criterion.operator || ">="
          );

        case "accuracy":
          return this.evaluateNumericCriterion(
            this.journeyProgress.totalAccuracy,
            criterion.target,
            criterion.operator || ">="
          );

        case "timeSpent":
          return this.evaluateNumericCriterion(
            this.journeyProgress.timeSpentLearning,
            criterion.target,
            criterion.operator || ">="
          );

        case "categoryMastery":
          const masteredCategories = this.journeyProgress.categoriesExplored.size;
          return this.evaluateNumericCriterion(
            masteredCategories,
            criterion.target,
            criterion.operator || ">="
          );

        case "sessionComplete":
          const perfectSessions = this.journeyProgress.sessionStats.perfectSessions;
          return this.evaluateNumericCriterion(
            perfectSessions,
            criterion.target,
            criterion.operator || ">="
          );

        default:
          return false;
      }
    });
  }

  /**
   * Calculate current progress towards achievement
   */
  private static calculateAchievementProgress(achievement: Achievement): number {
    if (!achievement.criteria) return 0;

    const criterionProgress = achievement.criteria.map(criterion => {
      let currentValue = 0;

      switch (criterion.type) {
        case "wordsLearned":
          currentValue = this.journeyProgress.wordsLearned;
          break;
        case "vowelRescue":
          currentValue = this.journeyProgress.vowelQuizzesCompleted;
          break;
        case "streakDays":
          currentValue = this.journeyProgress.streakDays;
          break;
        case "quizScore":
          currentValue = this.journeyProgress.quizzesPerfect;
          break;
        case "categoryMastery":
          currentValue = this.journeyProgress.categoriesExplored.size;
          break;
        case "sessionComplete":
          currentValue = this.journeyProgress.sessionStats.perfectSessions;
          break;
        default:
          currentValue = 0;
      }

      return Math.min(currentValue, criterion.target);
    });

    return Math.min(...criterionProgress);
  }

  /**
   * Evaluate numeric criterion with operator
   */
  private static evaluateNumericCriterion(
    current: number, 
    target: number, 
    operator: string
  ): boolean {
    switch (operator) {
      case ">=":
        return current >= target;
      case ">":
        return current > target;
      case "=":
        return current === target;
      case "<=":
        return current <= target;
      case "<":
        return current < target;
      default:
        return current >= target;
    }
  }

  /**
   * Get all achievements
   */
  static getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  /**
   * Get current journey progress
   */
  static getJourneyProgress(): JourneyProgress {
    return { ...this.journeyProgress };
  }

  /**
   * Get unlocked achievements
   */
  static getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  /**
   * Get achievements by category
   */
  static getAchievementsByCategory(category: string): Achievement[] {
    if (category === "all") return this.achievements;
    return this.achievements.filter(a => a.category === category);
  }

  /**
   * Reset progress (for testing)
   */
  static resetProgress(): void {
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.currentProgress = 0;
      achievement.dateUnlocked = undefined;
    });

    this.journeyProgress = {
      wordsLearned: 0,
      streakDays: 0,
      quizzesPerfect: 0,
      categoriesExplored: new Set(),
      totalAccuracy: 0,
      timeSpentLearning: 0,
      vowelQuizzesCompleted: 0,
      lastActivityDate: new Date(),
      sessionStats: {
        totalSessions: 0,
        perfectSessions: 0,
        averageWordsPerSession: 0
      }
    };
  }
}
