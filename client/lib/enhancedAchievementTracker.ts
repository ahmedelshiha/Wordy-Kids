interface Achievement {
  id: string;
  name: string;
  description: string;
  funnyDescription: string; // Kid-friendly version
  icon: string;
  category:
    | "learning"
    | "streak"
    | "quiz"
    | "exploration"
    | "social"
    | "journey"
    | "difficulty"
    | "session";
  difficulty: "bronze" | "silver" | "gold" | "diamond" | "rainbow";
  requirements: number;
  currentProgress: number;
  unlocked: boolean;
  dateUnlocked?: Date;
  reward?: {
    type: "avatar_accessory" | "theme" | "sound_effect" | "title" | "points" | "sticker" | "badge";
    item: string;
    value?: number;
    emoji?: string;
  };
  // Enhanced criteria for systematic word generation
  criteria?: {
    type:
      | "wordsLearned"
      | "streakDays"
      | "quizScore"
      | "categoryMastery"
      | "accuracy"
      | "timeSpent"
      | "sessionComplete"
      | "difficultyMastery"
      | "easyWords"
      | "mediumWords"
      | "hardWords"
      | "perfectSessions"
      | "speedLearning"
      | "dailyGoal";
    target: number;
    category?: string;
    difficulty?: "easy" | "medium" | "hard";
    timeFrame?: "daily" | "weekly" | "monthly" | "allTime";
    operator?: ">=" | ">" | "=" | "<=" | "<";
    additionalRequirements?: Array<{
      type: string;
      target: number;
      operator?: string;
    }>;
  }[];
}

interface JourneyProgress {
  // Basic stats
  wordsLearned: number;
  streakDays: number;
  quizzesPerfect: number;
  categoriesExplored: Set<string>;
  totalAccuracy: number;
  timeSpentLearning: number; // in minutes
  lastActivityDate: Date;
  
  // Enhanced difficulty-based stats
  difficultyStats: {
    easy: { completed: number; total: number; accuracy: number };
    medium: { completed: number; total: number; accuracy: number };
    hard: { completed: number; total: number; accuracy: number };
  };
  
  // Session stats
  sessionStats: {
    totalSessions: number;
    perfectSessions: number;
    averageWordsPerSession: number;
    fastestSession: number; // time in minutes
    longestStreak: number;
  };
  
  // Daily goals
  dailyGoalStats: {
    achieved: number;
    totalDays: number;
    currentStreak: number;
  };
  
  // Fun stats
  funStats: {
    favoriteEmoji: string;
    luckiestDay: string;
    totalCelebrations: number;
    stickersEarned: number;
  };
}

export class EnhancedAchievementTracker {
  private static achievements: Achievement[] = [
    // 🌟 BEGINNER ACHIEVEMENTS - Kid-friendly first steps
    {
      id: "first_word_wizard",
      name: "First Word Wizard",
      description: "Learn your very first word! Welcome to the adventure!",
      funnyDescription: "🎊 WHOOSH! You just learned your first word! You're officially a Word Wizard now!",
      icon: "🧙‍♂️",
      category: "learning",
      difficulty: "bronze",
      requirements: 1,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "wordsLearned",
          target: 1,
          operator: ">=",
        },
      ],
      reward: { type: "sticker", item: "Magic Wand", emoji: "🪄" },
    },

    {
      id: "word_collector_scout",
      name: "Word Collector Scout",
      description: "Collect 5 amazing words!",
      funnyDescription: "🎒 You're like a word treasure hunter! 5 shiny words in your collection!",
      icon: "🎯",
      category: "learning",
      difficulty: "bronze",
      requirements: 5,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "wordsLearned",
          target: 5,
          operator: ">=",
        },
      ],
      reward: { type: "badge", item: "Scout Badge", emoji: "🏕️" },
    },

    {
      id: "word_party_starter",
      name: "Word Party Starter",
      description: "Learn 10 words and throw a word party!",
      funnyDescription: "🎉 PARTY TIME! 10 words learned = one amazing celebration!",
      icon: "🎉",
      category: "learning",
      difficulty: "silver",
      requirements: 10,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "wordsLearned",
          target: 10,
          operator: ">=",
        },
      ],
      reward: { type: "sound_effect", item: "Party Horns", emoji: "📯" },
    },

    // �� DIFFICULTY MASTERS - New systematic achievements
    {
      id: "easy_peasy_champion",
      name: "Easy Peasy Champion",
      description: "Master 20 easy words with 85%+ accuracy!",
      funnyDescription: "🌟 Easy words are your best friends! You're the Easy Peasy Champion!",
      icon: "🌱",
      category: "difficulty",
      difficulty: "silver",
      requirements: 20,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "easyWords",
          target: 20,
          operator: ">=",
          additionalRequirements: [
            {
              type: "accuracy",
              target: 85,
              operator: ">=",
            },
          ],
        },
      ],
      reward: { type: "avatar_accessory", item: "Green Leaf Crown", emoji: "🌿" },
    },

    {
      id: "medium_difficulty_hero",
      name: "Medium Difficulty Hero",
      description: "Conquer 15 medium words with 80%+ accuracy!",
      funnyDescription: "⚡ You're brave enough to tackle medium words! What a hero!",
      icon: "⚡",
      category: "difficulty",
      difficulty: "gold",
      requirements: 15,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "mediumWords",
          target: 15,
          operator: ">=",
          additionalRequirements: [
            {
              type: "accuracy",
              target: 80,
              operator: ">=",
            },
          ],
        },
      ],
      reward: { type: "theme", item: "Lightning Theme", emoji: "⚡" },
    },

    {
      id: "hard_word_ninja",
      name: "Hard Word Ninja",
      description: "Master 10 hard words with 75%+ accuracy!",
      funnyDescription: "🥷 NINJA MOVES! Hard words can't hide from you anymore!",
      icon: "🥷",
      category: "difficulty",
      difficulty: "diamond",
      requirements: 10,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "hardWords",
          target: 10,
          operator: ">=",
          additionalRequirements: [
            {
              type: "accuracy",
              target: 75,
              operator: ">=",
            },
          ],
        },
      ],
      reward: { type: "avatar_accessory", item: "Ninja Mask", emoji: "🎭" },
    },

    // 🚀 SESSION ACHIEVEMENTS - Enhanced for new word card system
    {
      id: "perfect_session_superstar",
      name: "Perfect Session Superstar",
      description: "Complete a session with 100% accuracy!",
      funnyDescription: "⭐ SUPERSTAR ALERT! Perfect session = you're absolutely amazing!",
      icon: "⭐",
      category: "session",
      difficulty: "gold",
      requirements: 1,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "perfectSessions",
          target: 1,
          operator: ">=",
        },
      ],
      reward: { type: "sticker", item: "Golden Star", emoji: "🌟" },
    },

    {
      id: "session_speed_demon",
      name: "Session Speed Demon",
      description: "Complete a session in under 5 minutes with 80%+ accuracy!",
      funnyDescription: "🏃‍♂️ ZOOM ZOOM! You're faster than a speeding word!",
      icon: "🏃‍♂️",
      category: "session",
      difficulty: "silver",
      requirements: 1,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "speedLearning",
          target: 1,
          operator: ">=",
        },
      ],
      reward: { type: "sound_effect", item: "Whoosh Sound", emoji: "💨" },
    },

    {
      id: "session_marathon_master",
      name: "Session Marathon Master",
      description: "Complete 5 perfect sessions in a row!",
      funnyDescription: "🏃‍♂️ You're unstoppable! 5 perfect sessions = marathon champion!",
      icon: "🏆",
      category: "session",
      difficulty: "diamond",
      requirements: 5,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "perfectSessions",
          target: 5,
          operator: ">=",
        },
      ],
      reward: { type: "title", item: "Marathon Master", emoji: "🏃‍♂️" },
    },

    // 🎯 DAILY GOAL ACHIEVEMENTS
    {
      id: "daily_goal_achiever",
      name: "Daily Goal Achiever",
      description: "Reach your daily goal for the first time!",
      funnyDescription: "🎯 BULLSEYE! You hit your daily goal right on target!",
      icon: "🎯",
      category: "learning",
      difficulty: "bronze",
      requirements: 1,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "dailyGoal",
          target: 1,
          operator: ">=",
        },
      ],
      reward: { type: "sticker", item: "Target Hit", emoji: "🎯" },
    },

    {
      id: "goal_streak_champion",
      name: "Goal Streak Champion",
      description: "Reach your daily goal 7 days in a row!",
      funnyDescription: "🔥 ON FIRE! 7 days of crushing your goals = you're UNSTOPPABLE!",
      icon: "🔥",
      category: "streak",
      difficulty: "gold",
      requirements: 7,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "dailyGoal",
          target: 7,
          operator: ">=",
          timeFrame: "daily",
        },
      ],
      reward: { type: "theme", item: "Fire Theme", emoji: "🔥" },
    },

    // 🌈 RAINBOW ACHIEVEMENTS - Ultimate kid-friendly goals
    {
      id: "word_rainbow_collector",
      name: "Word Rainbow Collector",
      description: "Master all difficulty levels: 30 easy, 20 medium, 10 hard words!",
      funnyDescription: "🌈 YOU DID IT ALL! Easy, medium, hard - you collected the ENTIRE WORD RAINBOW!",
      icon: "🌈",
      category: "difficulty",
      difficulty: "rainbow",
      requirements: 3,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "easyWords",
          target: 30,
          operator: ">=",
        },
        {
          type: "mediumWords",
          target: 20,
          operator: ">=",
        },
        {
          type: "hardWords",
          target: 10,
          operator: ">=",
        },
      ],
      reward: { type: "avatar_accessory", item: "Rainbow Crown", emoji: "🌈" },
    },

    {
      id: "ultimate_word_wizard",
      name: "Ultimate Word Wizard",
      description: "Learn 100 words, maintain 90% accuracy, and reach 30 perfect sessions!",
      funnyDescription: "🧙‍♂️✨ ULTIMATE MAGIC! You're the greatest Word Wizard in the entire universe!",
      icon: "🧙‍♂️",
      category: "journey",
      difficulty: "rainbow",
      requirements: 3,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "wordsLearned",
          target: 100,
          operator: ">=",
        },
        {
          type: "accuracy",
          target: 90,
          operator: ">=",
        },
        {
          type: "perfectSessions",
          target: 30,
          operator: ">=",
        },
      ],
      reward: { type: "title", item: "Ultimate Word Wizard", emoji: "🧙‍♂️" },
    },

    // 🎪 FUN ACHIEVEMENTS - Super kid-friendly
    {
      id: "emoji_collector",
      name: "Emoji Collector",
      description: "See 20 different word emojis!",
      funnyDescription: "😊 Emoji party! You've collected 20 adorable emojis!",
      icon: "😊",
      category: "exploration",
      difficulty: "bronze",
      requirements: 20,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "wordsLearned",
          target: 20,
          operator: ">=",
        },
      ],
      reward: { type: "sticker", item: "Emoji Sticker Pack", emoji: "😍" },
    },

    {
      id: "category_explorer_extraordinaire",
      name: "Category Explorer Extraordinaire",
      description: "Explore 5 different word categories!",
      funnyDescription: "🗺️ EXPLORER MODE ACTIVATED! 5 categories conquered = you're an adventurer!",
      icon: "🗺️",
      category: "exploration",
      difficulty: "silver",
      requirements: 5,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "categoryMastery",
          target: 5,
          operator: ">=",
        },
      ],
      reward: { type: "avatar_accessory", item: "Explorer Hat", emoji: "🎩" },
    },

    // 🎵 PRONUNCIATION ACHIEVEMENTS
    {
      id: "pronunciation_parrot",
      name: "Pronunciation Parrot",
      description: "Listen to 25 word pronunciations!",
      funnyDescription: "🦜 SQUAWK! You're a pronunciation parrot - repeat after me!",
      icon: "🦜",
      category: "learning",
      difficulty: "bronze",
      requirements: 25,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "wordsLearned",
          target: 25,
          operator: ">=",
        },
      ],
      reward: { type: "sound_effect", item: "Parrot Sounds", emoji: "🦜" },
    },
  ];

  private static journeyProgress: JourneyProgress = {
    wordsLearned: 0,
    streakDays: 0,
    quizzesPerfect: 0,
    categoriesExplored: new Set(),
    totalAccuracy: 0,
    timeSpentLearning: 0,
    lastActivityDate: new Date(),
    difficultyStats: {
      easy: { completed: 0, total: 0, accuracy: 0 },
      medium: { completed: 0, total: 0, accuracy: 0 },
      hard: { completed: 0, total: 0, accuracy: 0 },
    },
    sessionStats: {
      totalSessions: 0,
      perfectSessions: 0,
      averageWordsPerSession: 0,
      fastestSession: 999,
      longestStreak: 0,
    },
    dailyGoalStats: {
      achieved: 0,
      totalDays: 0,
      currentStreak: 0,
    },
    funStats: {
      favoriteEmoji: "🌟",
      luckiestDay: "",
      totalCelebrations: 0,
      stickersEarned: 0,
    },
  };

  /**
   * Track activity with enhanced difficulty-based tracking
   */
  static trackActivity(activity: {
    type: "quiz" | "wordLearning" | "sessionComplete" | "dailyGoal";
    score?: number;
    accuracy?: number;
    category?: string;
    difficulty?: "easy" | "medium" | "hard";
    timeSpent?: number;
    wordsLearned?: number;
    sessionStats?: {
      accuracy: number;
      timeMinutes: number;
      wordsCompleted: number;
    };
  }): Achievement[] {
    const progressUpdate: Partial<JourneyProgress> = {};

    switch (activity.type) {
      case "wordLearning":
        if (activity.wordsLearned) {
          progressUpdate.wordsLearned =
            this.journeyProgress.wordsLearned + activity.wordsLearned;
        }
        
        // Track difficulty-specific progress
        if (activity.difficulty && activity.wordsLearned) {
          const diffStats = { ...this.journeyProgress.difficultyStats };
          diffStats[activity.difficulty].completed += activity.wordsLearned;
          if (activity.accuracy) {
            const currentAccuracy = diffStats[activity.difficulty].accuracy;
            const totalCompleted = diffStats[activity.difficulty].completed;
            diffStats[activity.difficulty].accuracy = 
              (currentAccuracy * (totalCompleted - activity.wordsLearned) + activity.accuracy) / totalCompleted;
          }
          progressUpdate.difficultyStats = diffStats;
        }

        if (activity.category) {
          const newCategories = new Set(this.journeyProgress.categoriesExplored);
          newCategories.add(activity.category);
          progressUpdate.categoriesExplored = newCategories;
        }
        break;

      case "sessionComplete":
        if (activity.sessionStats) {
          const sessionStats = { ...this.journeyProgress.sessionStats };
          sessionStats.totalSessions += 1;
          
          if (activity.sessionStats.accuracy === 100) {
            sessionStats.perfectSessions += 1;
          }
          
          if (activity.sessionStats.timeMinutes < sessionStats.fastestSession) {
            sessionStats.fastestSession = activity.sessionStats.timeMinutes;
          }
          
          sessionStats.averageWordsPerSession = 
            (sessionStats.averageWordsPerSession * (sessionStats.totalSessions - 1) + 
             activity.sessionStats.wordsCompleted) / sessionStats.totalSessions;
          
          progressUpdate.sessionStats = sessionStats;
        }
        break;

      case "dailyGoal":
        const goalStats = { ...this.journeyProgress.dailyGoalStats };
        goalStats.achieved += 1;
        goalStats.currentStreak += 1;
        goalStats.totalDays += 1;
        progressUpdate.dailyGoalStats = goalStats;
        break;
    }

    if (activity.timeSpent) {
      progressUpdate.timeSpentLearning =
        this.journeyProgress.timeSpentLearning + activity.timeSpent;
    }

    if (activity.accuracy) {
      const currentTotal = this.journeyProgress.totalAccuracy;
      const newAccuracy = (currentTotal + activity.accuracy) / 2;
      progressUpdate.totalAccuracy = newAccuracy;
    }

    progressUpdate.lastActivityDate = new Date();

    return this.updateJourneyProgress(progressUpdate);
  }

  /**
   * Enhanced achievement evaluation with difficulty tracking
   */
  private static evaluateAchievementCriteria(achievement: Achievement): boolean {
    if (!achievement.criteria) return false;

    return achievement.criteria.every((criterion) => {
      switch (criterion.type) {
        case "easyWords":
          return this.evaluateNumericCriterion(
            this.journeyProgress.difficultyStats.easy.completed,
            criterion.target,
            criterion.operator || ">=",
          );
        
        case "mediumWords":
          return this.evaluateNumericCriterion(
            this.journeyProgress.difficultyStats.medium.completed,
            criterion.target,
            criterion.operator || ">=",
          );
        
        case "hardWords":
          return this.evaluateNumericCriterion(
            this.journeyProgress.difficultyStats.hard.completed,
            criterion.target,
            criterion.operator || ">=",
          );
        
        case "perfectSessions":
          return this.evaluateNumericCriterion(
            this.journeyProgress.sessionStats.perfectSessions,
            criterion.target,
            criterion.operator || ">=",
          );
        
        case "speedLearning":
          return this.evaluateNumericCriterion(
            this.journeyProgress.sessionStats.fastestSession <= 5 ? 1 : 0,
            criterion.target,
            criterion.operator || ">=",
          );
        
        case "dailyGoal":
          return this.evaluateNumericCriterion(
            this.journeyProgress.dailyGoalStats.achieved,
            criterion.target,
            criterion.operator || ">=",
          );
        
        case "wordsLearned":
          return this.evaluateNumericCriterion(
            this.journeyProgress.wordsLearned,
            criterion.target,
            criterion.operator || ">=",
          );
        
        case "accuracy":
          return this.evaluateNumericCriterion(
            this.journeyProgress.totalAccuracy,
            criterion.target,
            criterion.operator || ">=",
          );
        
        case "categoryMastery":
          return this.evaluateNumericCriterion(
            this.journeyProgress.categoriesExplored.size,
            criterion.target,
            criterion.operator || ">=",
          );
        
        default:
          return false;
      }
    });
  }

  /**
   * Update journey progress and check for newly unlocked achievements
   */
  static updateJourneyProgress(progressUpdate: Partial<JourneyProgress>): Achievement[] {
    Object.assign(this.journeyProgress, progressUpdate);
    const newlyUnlocked = this.checkForNewAchievements();
    
    // Update fun stats
    if (newlyUnlocked.length > 0) {
      this.journeyProgress.funStats.totalCelebrations += newlyUnlocked.length;
      this.journeyProgress.funStats.stickersEarned += newlyUnlocked.filter(a => 
        a.reward?.type === "sticker"
      ).length;
    }
    
    return newlyUnlocked;
  }

  /**
   * Check for newly unlocked achievements
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
        achievement.currentProgress = this.calculateAchievementProgress(achievement);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Calculate current progress towards achievement
   */
  private static calculateAchievementProgress(achievement: Achievement): number {
    if (!achievement.criteria) return 0;

    const criterionProgress = achievement.criteria.map((criterion) => {
      let currentValue = 0;

      switch (criterion.type) {
        case "easyWords":
          currentValue = this.journeyProgress.difficultyStats.easy.completed;
          break;
        case "mediumWords":
          currentValue = this.journeyProgress.difficultyStats.medium.completed;
          break;
        case "hardWords":
          currentValue = this.journeyProgress.difficultyStats.hard.completed;
          break;
        case "perfectSessions":
          currentValue = this.journeyProgress.sessionStats.perfectSessions;
          break;
        case "dailyGoal":
          currentValue = this.journeyProgress.dailyGoalStats.achieved;
          break;
        case "wordsLearned":
          currentValue = this.journeyProgress.wordsLearned;
          break;
        case "categoryMastery":
          currentValue = this.journeyProgress.categoriesExplored.size;
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
    operator: string,
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
   * Get kid-friendly achievement description
   */
  static getKidFriendlyDescription(achievementId: string): string {
    const achievement = this.achievements.find(a => a.id === achievementId);
    return achievement?.funnyDescription || achievement?.description || "";
  }

  /**
   * Get all achievements with kid-friendly sorting
   */
  static getAchievements(): Achievement[] {
    return [...this.achievements].sort((a, b) => {
      // Sort by difficulty, then by category
      const difficultyOrder = { bronze: 1, silver: 2, gold: 3, diamond: 4, rainbow: 5 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
  }

  /**
   * Get current journey progress
   */
  static getJourneyProgress(): JourneyProgress {
    return { ...this.journeyProgress };
  }

  /**
   * Get progress summary for kids
   */
  static getKidProgressSummary(): {
    totalWords: number;
    easyMastered: number;
    mediumMastered: number;
    hardMastered: number;
    perfectSessions: number;
    stickersEarned: number;
    nextAchievement?: Achievement;
  } {
    const nextAchievement = this.achievements
      .filter(a => !a.unlocked)
      .sort((a, b) => a.currentProgress / a.requirements - b.currentProgress / b.requirements)[0];

    return {
      totalWords: this.journeyProgress.wordsLearned,
      easyMastered: this.journeyProgress.difficultyStats.easy.completed,
      mediumMastered: this.journeyProgress.difficultyStats.medium.completed,
      hardMastered: this.journeyProgress.difficultyStats.hard.completed,
      perfectSessions: this.journeyProgress.sessionStats.perfectSessions,
      stickersEarned: this.journeyProgress.funStats.stickersEarned,
      nextAchievement,
    };
  }

  /**
   * Reset progress (for testing)
   */
  static resetProgress(): void {
    this.achievements.forEach((achievement) => {
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
      lastActivityDate: new Date(),
      difficultyStats: {
        easy: { completed: 0, total: 0, accuracy: 0 },
        medium: { completed: 0, total: 0, accuracy: 0 },
        hard: { completed: 0, total: 0, accuracy: 0 },
      },
      sessionStats: {
        totalSessions: 0,
        perfectSessions: 0,
        averageWordsPerSession: 0,
        fastestSession: 999,
        longestStreak: 0,
      },
      dailyGoalStats: {
        achieved: 0,
        totalDays: 0,
        currentStreak: 0,
      },
      funStats: {
        favoriteEmoji: "🌟",
        luckiestDay: "",
        totalCelebrations: 0,
        stickersEarned: 0,
      },
    };
  }
}
