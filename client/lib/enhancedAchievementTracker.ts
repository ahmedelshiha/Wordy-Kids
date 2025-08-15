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
    type:
      | "avatar_accessory"
      | "theme"
      | "sound_effect"
      | "title"
      | "points"
      | "sticker"
      | "badge";
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
    // 🌟 BEGINNER ACHIEVEMENTS - More challenging and special
    {
      id: "first_word_wizard",
      name: "First Word Wizard",
      description: "Learn your very first word! Welcome to the adventure!",
      funnyDescription:
        "🎊 WHOOSH! You just learned your first word! You're officially a Word Wizard now!",
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
      description: "Collect 15 amazing words with 80%+ accuracy!",
      funnyDescription:
        "🎒 You're like a word treasure hunter! 15 shiny words with great accuracy!",
      icon: "🎯",
      category: "learning",
      difficulty: "bronze",
      requirements: 15,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "wordsLearned",
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
      reward: { type: "badge", item: "Scout Badge", emoji: "🏕️" },
    },

    {
      id: "word_party_starter",
      name: "Word Party Starter",
      description: "Learn 25 words and throw a word party!",
      funnyDescription:
        "🎉 PARTY TIME! 25 words learned = one EPIC celebration!",
      icon: "🎉",
      category: "learning",
      difficulty: "silver",
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
      reward: { type: "sound_effect", item: "Party Horns", emoji: "📯" },
    },

    // 🎪 SURPRISE ACHIEVEMENTS - Random fun achievements
    {
      id: "lucky_learner",
      name: "Lucky Learner",
      description: "Get 7 words correct in a row - what luck!",
      funnyDescription:
        "🍀 WHOA! 7 perfect words in a row? You must have a magic lucky charm!",
      icon: "🍀",
      category: "streak",
      difficulty: "silver",
      requirements: 7,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "perfectSessions",
          target: 1,
          operator: ">=",
        },
      ],
      reward: { type: "sticker", item: "Four-Leaf Clover", emoji: "🍀" },
    },

    {
      id: "emoji_hunter",
      name: "Emoji Hunter",
      description: "Find words with 10 different emojis!",
      funnyDescription:
        "😍 You're an emoji detective! 10 different emoji words found!",
      icon: "🕵️‍♂️",
      category: "exploration",
      difficulty: "bronze",
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
      reward: { type: "sticker", item: "Detective Badge", emoji: "🔍" },
    },

    // 🔥 DIFFICULTY MASTERS - Much more challenging achievements
    {
      id: "easy_peasy_champion",
      name: "Easy Peasy Champion",
      description: "Master 50 easy words with 90%+ accuracy!",
      funnyDescription:
        "🌟 Easy words are your best friends! You're the ULTIMATE Easy Champion!",
      icon: "🌱",
      category: "difficulty",
      difficulty: "silver",
      requirements: 50,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "easyWords",
          target: 50,
          operator: ">=",
          additionalRequirements: [
            {
              type: "accuracy",
              target: 90,
              operator: ">=",
            },
          ],
        },
      ],
      reward: {
        type: "avatar_accessory",
        item: "Green Leaf Crown",
        emoji: "🌿",
      },
    },

    {
      id: "medium_difficulty_hero",
      name: "Medium Difficulty Hero",
      description: "Conquer 35 medium words with 85%+ accuracy!",
      funnyDescription:
        "⚡ You're SUPER brave! Medium words bow down to your powers!",
      icon: "⚡",
      category: "difficulty",
      difficulty: "gold",
      requirements: 35,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "mediumWords",
          target: 35,
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
      reward: { type: "theme", item: "Lightning Theme", emoji: "⚡" },
    },

    {
      id: "hard_word_ninja",
      name: "Hard Word Ninja",
      description: "Master 20 hard words with 80%+ accuracy!",
      funnyDescription:
        "🥷 LEGENDARY NINJA! Hard words tremble before your might!",
      icon: "🥷",
      category: "difficulty",
      difficulty: "diamond",
      requirements: 20,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "hardWords",
          target: 20,
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
      reward: { type: "avatar_accessory", item: "Ninja Mask", emoji: "��" },
    },

    // 🎭 COMEDY ACHIEVEMENTS - Funny special conditions
    {
      id: "oops_comeback_king",
      name: "Oops Comeback King",
      description: "Get 3 wrong then 5 perfect in same session!",
      funnyDescription:
        "😅 HAHA! You turned your oops into AWESOME! What a comeback!",
      icon: "👑",
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
      reward: { type: "title", item: "Comeback King", emoji: "👑" },
    },

    {
      id: "speed_demon_junior",
      name: "Speed Demon Junior",
      description: "Complete 20 words in under 3 minutes with 85%+ accuracy!",
      funnyDescription:
        "🏎️ ZOOM ZOOM! You're faster than a rocket ship learning words!",
      icon: "🏎️",
      category: "session",
      difficulty: "diamond",
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
      reward: { type: "sound_effect", item: "Race Car Sounds", emoji: "🏁" },
    },

    // 🚀 SESSION ACHIEVEMENTS - Much more challenging
    {
      id: "perfect_session_superstar",
      name: "Perfect Session Superstar",
      description: "Complete 3 perfect sessions with 100% accuracy!",
      funnyDescription:
        "⭐ TRIPLE SUPERSTAR! 3 perfect sessions = you're absolutely LEGENDARY!",
      icon: "⭐",
      category: "session",
      difficulty: "gold",
      requirements: 3,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "perfectSessions",
          target: 3,
          operator: ">=",
        },
      ],
      reward: { type: "sticker", item: "Golden Star", emoji: "🌟" },
    },

    {
      id: "session_marathon_master",
      name: "Session Marathon Master",
      description: "Complete 10 perfect sessions total!",
      funnyDescription:
        "🏃‍♂️ MARATHON LEGEND! 10 perfect sessions = you're UNSTOPPABLE!",
      icon: "🏆",
      category: "session",
      difficulty: "diamond",
      requirements: 10,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "perfectSessions",
          target: 10,
          operator: ">=",
        },
      ],
      reward: { type: "title", item: "Marathon Master", emoji: "🏃‍♂️" },
    },

    // 🎯 DAILY GOAL ACHIEVEMENTS - More challenging
    {
      id: "daily_goal_achiever",
      name: "Daily Goal Achiever",
      description: "Reach your daily goal 5 times!",
      funnyDescription:
        "🎯 BULLSEYE MASTER! 5 daily goals hit = you're a target champion!",
      icon: "🎯",
      category: "learning",
      difficulty: "bronze",
      requirements: 5,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "dailyGoal",
          target: 5,
          operator: ">=",
        },
      ],
      reward: { type: "sticker", item: "Target Hit", emoji: "🎯" },
    },

    {
      id: "goal_streak_champion",
      name: "Goal Streak Champion",
      description: "Reach your daily goal 14 days in a row!",
      funnyDescription:
        "🔥 LEGENDARY FIRE! 2 weeks of crushing goals = you're UNSTOPPABLE!",
      icon: "🔥",
      category: "streak",
      difficulty: "gold",
      requirements: 14,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "dailyGoal",
          target: 14,
          operator: ">=",
          timeFrame: "daily",
        },
      ],
      reward: { type: "theme", item: "Fire Theme", emoji: "🔥" },
    },

    // 🎪 WEEKLY SPECIAL ACHIEVEMENTS
    {
      id: "weekend_warrior",
      name: "Weekend Warrior",
      description: "Learn 50 words on a weekend!",
      funnyDescription:
        "🎊 WEEKEND HERO! 50 words on weekend = you're AMAZING!",
      icon: "🗡️",
      category: "streak",
      difficulty: "gold",
      requirements: 50,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "wordsLearned",
          target: 50,
          operator: ">=",
        },
      ],
      reward: { type: "badge", item: "Weekend Warrior Shield", emoji: "🛡️" },
    },

    // 🌈 RAINBOW ACHIEVEMENTS - EXTREMELY challenging ultimate goals
    {
      id: "word_rainbow_collector",
      name: "Word Rainbow Collector",
      description:
        "Master all difficulty levels: 100 easy, 75 medium, 50 hard words with 90%+ accuracy!",
      funnyDescription:
        "🌈 ULTIMATE RAINBOW MAGIC! You collected the ENTIRE WORD UNIVERSE! You're a LEGEND!",
      icon: "🌈",
      category: "difficulty",
      difficulty: "rainbow",
      requirements: 3,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "easyWords",
          target: 100,
          operator: ">=",
        },
        {
          type: "mediumWords",
          target: 75,
          operator: ">=",
        },
        {
          type: "hardWords",
          target: 50,
          operator: ">=",
        },
      ],
      reward: { type: "avatar_accessory", item: "Rainbow Crown", emoji: "🌈" },
    },

    {
      id: "ultimate_word_wizard",
      name: "Ultimate Word Wizard",
      description:
        "Learn 300 words, maintain 95% accuracy, and reach 50 perfect sessions!",
      funnyDescription:
        "🧙‍♂️✨ ULTIMATE COSMIC MAGIC! You're the SUPREME Word Wizard of the entire GALAXY!",
      icon: "🧙‍♂️",
      category: "journey",
      difficulty: "rainbow",
      requirements: 3,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "wordsLearned",
          target: 300,
          operator: ">=",
        },
        {
          type: "accuracy",
          target: 95,
          operator: ">=",
        },
        {
          type: "perfectSessions",
          target: 50,
          operator: ">=",
        },
      ],
      reward: { type: "title", item: "Ultimate Word Wizard", emoji: "🧙‍♂️" },
    },

    // 🎊 MYSTERY ACHIEVEMENTS - Hidden until unlocked
    {
      id: "mystery_box_opener",
      name: "Mystery Box Opener",
      description: "??? SECRET ACHIEVEMENT ???",
      funnyDescription:
        "🎁 SURPRISE! You found a hidden treasure! What a mystery solver!",
      icon: "🎁",
      category: "exploration",
      difficulty: "diamond",
      requirements: 50,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "wordsLearned",
          target: 50,
          operator: ">=",
        },
      ],
      reward: { type: "sticker", item: "Mystery Box", emoji: "📦" },
    },

    // 🎮 COMBO ACHIEVEMENTS - Special combinations
    {
      id: "triple_threat_master",
      name: "Triple Threat Master",
      description:
        "Get 3 perfect sessions, learn 75 words, and achieve 5 daily goals!",
      funnyDescription:
        "💥 TRIPLE POWER! You're like a superhero with 3 amazing powers!",
      icon: "💥",
      category: "journey",
      difficulty: "diamond",
      requirements: 3,
      currentProgress: 0,
      unlocked: false,
      criteria: [
        {
          type: "perfectSessions",
          target: 3,
          operator: ">=",
        },
        {
          type: "wordsLearned",
          target: 75,
          operator: ">=",
        },
        {
          type: "dailyGoal",
          target: 5,
          operator: ">=",
        },
      ],
      reward: { type: "avatar_accessory", item: "Superhero Cape", emoji: "🦸‍♂️" },
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
      funnyDescription:
        "🗺️ EXPLORER MODE ACTIVATED! 5 categories conquered = you're an adventurer!",
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
      funnyDescription:
        "🦜 SQUAWK! You're a pronunciation parrot - repeat after me!",
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

  // Achievement cooldown system to prevent spam
  private static achievementCooldowns: Map<string, number> = new Map();
  private static lastAchievementTime: number = 0;
  private static readonly ACHIEVEMENT_COOLDOWN_MS = 30000; // 30 seconds between achievements

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
              (currentAccuracy * (totalCompleted - activity.wordsLearned) +
                activity.accuracy) /
              totalCompleted;
          }
          progressUpdate.difficultyStats = diffStats;
        }

        if (activity.category) {
          const newCategories = new Set(
            this.journeyProgress.categoriesExplored,
          );
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
            (sessionStats.averageWordsPerSession *
              (sessionStats.totalSessions - 1) +
              activity.sessionStats.wordsCompleted) /
            sessionStats.totalSessions;

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
  private static evaluateAchievementCriteria(
    achievement: Achievement,
  ): boolean {
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
  static updateJourneyProgress(
    progressUpdate: Partial<JourneyProgress>,
  ): Achievement[] {
    Object.assign(this.journeyProgress, progressUpdate);
    const newlyUnlocked = this.checkForNewAchievements();

    // Update fun stats
    if (newlyUnlocked.length > 0) {
      this.journeyProgress.funStats.totalCelebrations += newlyUnlocked.length;
      this.journeyProgress.funStats.stickersEarned += newlyUnlocked.filter(
        (a) => a.reward?.type === "sticker",
      ).length;
    }

    return newlyUnlocked;
  }

  /**
   * Check for newly unlocked achievements with cooldown and teasing
   */
  private static checkForNewAchievements(): Achievement[] {
    const now = Date.now();
    const newlyUnlocked: Achievement[] = [];

    // Check if we're in achievement cooldown period
    if (now - this.lastAchievementTime < this.ACHIEVEMENT_COOLDOWN_MS) {
      console.log("🕐 Achievement cooldown active - preventing spam!");
      return []; // No achievements during cooldown
    }

    for (const achievement of this.achievements) {
      if (achievement.unlocked || !achievement.criteria) continue;

      // Check if this specific achievement has its own cooldown
      const achievementCooldown =
        this.achievementCooldowns.get(achievement.id) || 0;
      if (now - achievementCooldown < this.ACHIEVEMENT_COOLDOWN_MS * 2) {
        continue; // Skip this achievement if it's in cooldown
      }

      const isUnlocked = this.evaluateAchievementCriteria(achievement);

      if (isUnlocked) {
        achievement.unlocked = true;
        achievement.dateUnlocked = new Date();
        achievement.currentProgress = achievement.requirements;
        newlyUnlocked.push(achievement);

        // Set cooldowns
        this.lastAchievementTime = now;
        this.achievementCooldowns.set(achievement.id, now);

        console.log(
          `🎉 Achievement unlocked: ${achievement.name} (cooldown activated)`,
        );

        // Limit to 1 achievement at a time to prevent overwhelming
        break;
      } else {
        const oldProgress = achievement.currentProgress;
        achievement.currentProgress =
          this.calculateAchievementProgress(achievement);

        // Add teasing for close achievements
        this.checkForTeasingOpportunity(achievement, oldProgress);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Check if we should tease the user about almost completing an achievement
   */
  private static checkForTeasingOpportunity(
    achievement: Achievement,
    oldProgress: number,
  ): void {
    const progressPercent =
      (achievement.currentProgress / achievement.requirements) * 100;
    const oldProgressPercent = (oldProgress / achievement.requirements) * 100;

    // Only tease once when they cross certain thresholds
    if (oldProgressPercent < 75 && progressPercent >= 75) {
      console.log(`👀 Almost there! ${achievement.name} is 75% complete!`);
    } else if (oldProgressPercent < 90 && progressPercent >= 90) {
      console.log(`🔥 SO CLOSE! ${achievement.name} is 90% complete!`);
    } else if (oldProgressPercent < 95 && progressPercent >= 95) {
      console.log(`⚡ ALMOST THERE! ${achievement.name} is 95% complete!`);
    }
  }

  /**
   * Calculate current progress towards achievement
   */
  private static calculateAchievementProgress(
    achievement: Achievement,
  ): number {
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
    const achievement = this.achievements.find((a) => a.id === achievementId);
    return achievement?.funnyDescription || achievement?.description || "";
  }

  /**
   * Get all achievements with kid-friendly sorting
   */
  static getAchievements(): Achievement[] {
    return [...this.achievements].sort((a, b) => {
      // Sort by difficulty, then by category
      const difficultyOrder = {
        bronze: 1,
        silver: 2,
        gold: 3,
        diamond: 4,
        rainbow: 5,
      };
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
      .filter((a) => !a.unlocked)
      .sort(
        (a, b) =>
          a.currentProgress / a.requirements -
          b.currentProgress / b.requirements,
      )[0];

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
   * Get short mobile-friendly motivational message
   */
  static getShortMotivationalMessage(): string {
    const hour = new Date().getHours();

    const morningShort = [
      "🌅 Good morning! Ready to learn?",
      "☀️ Rise and shine! Word time!",
      "🌈 Morning sunshine! Let's go!",
      "🦋 Flutter into word fun!",
      "🌸 Fresh morning learning!",
      "🐝 Buzzing for words!",
      "🎈 Morning word balloon!",
      "⭐ Wake up, superstar!",
      "🚀 Blast off to learning!",
      "🎨 Paint with words!",
      "🦄 Magical word time!",
      "🌟 Sparkly learning ahead!",
      "🍀 Lucky word hunt!",
      "🎪 Word circus time!",
      "🎵 Sing with new words!",
    ];

    const afternoonShort = [
      "🌞 Afternoon power! Let's learn!",
      "⚡ Energy boost time!",
      "🎯 Target practice!",
      "🌻 Sunny word vibes!",
      "🦋 Afternoon flutter!",
      "🎪 Word carnival!",
      "🏖️ Surf word waves!",
      "🍎 Brain snack time!",
      "🎨 Afternoon art class!",
      "🚂 All aboard word train!",
      "🎵 Music with words!",
      "🏃‍♂️ Word marathon time!",
      "🌈 Rainbow bridge!",
      "🎭 You're the star!",
      "🏆 Claim victories!",
    ];

    const eveningShort = [
      "🌙 Evening magic time!",
      "⭐ Star-powered learning!",
      "🦉 Wise owl hours!",
      "🌃 City lights sparkle!",
      "🌛 Crescent moon smiles!",
      "✨ Twilight twinkles!",
      "🎆 Evening fireworks!",
      "🌟 Star wishes!",
      "🦇 Evening adventure!",
      "🌒 Moon magic!",
      "🕯️ Cozy word time!",
      "🎭 Tonight's show!",
      "🌊 Ocean wave learning!",
      "🎪 Evening circus!",
      "🍕 Evening word treat!",
    ];

    let selectedMessages = morningShort;
    if (hour >= 12 && hour < 18) selectedMessages = afternoonShort;
    else if (hour >= 18) selectedMessages = eveningShort;

    return selectedMessages[
      Math.floor(Math.random() * selectedMessages.length)
    ];
  }

  /**
   * Get fun motivational message based on progress
   */
  static getMotivationalMessage(): string {
    const hour = new Date().getHours();
    const progress = this.journeyProgress;

    const morningMessages = [
      "🌅 Good morning, Word Warrior! Ready for an adventure?",
      "☀️ Rise and shine! Time to catch some word magic!",
      "🌈 Morning sunshine! Let's discover amazing new words!",
      "🦋 Good morning, butterfly! Fly into a world of words!",
      "🌸 Fresh morning blooms! Perfect time for learning!",
      "🐝 Buzzing with excitement! Morning word hunt begins!",
      "🎈 Morning balloons of joy! Let's float into learning!",
      "⭐ Wake up, superstar! Your word kingdom awaits!",
      "🚀 Morning rocket launch! Blast off to word adventures!",
      "🎨 Paint your morning with colorful new words!",
      "🦄 Magical morning unicorn says: Time to learn!",
      "🌟 Sparkly morning ahead! Words are waiting for you!",
      "🍀 Lucky morning! Today's the day for word treasures!",
      "🎪 Morning circus of words! Step right up to learn!",
      "🎵 Morning melody! Let's sing along with new words!",
      "🌺 Bloom with the morning! Grow your word garden!",
      "🦜 Good morning, word parrot! Ready to repeat success?",
      "🎯 Morning target practice! Aim for word mastery!",
      "🏰 Your morning word castle is ready to explore!",
      "🌊 Ride the morning wave of wonderful words!",
    ];

    const afternoonMessages = [
      "🌞 Afternoon power! Your brain is ready for word challenges!",
      "⚡ Afternoon energy boost! Time for some word lightning!",
      "🎯 Afternoon target practice! Let's hit those word bullseyes!",
      "🌻 Sunny afternoon vibes! Perfect for word adventures!",
      "🦋 Afternoon butterfly dance! Flutter through new words!",
      "🎪 Afternoon word carnival! Come one, come all to learn!",
      "🏖️ Beach afternoon energy! Surf the waves of words!",
      "🍎 Afternoon snack time! Feed your brain with words!",
      "🎨 Afternoon art class! Paint pictures with new words!",
      "🚂 All aboard the afternoon word train! Choo-choo!",
      "🎵 Afternoon concert! Let's make music with words!",
      "🏃‍♂️ Afternoon word marathon! You're doing amazing!",
      "🌈 Afternoon rainbow bridge! Cross over to new words!",
      "🎭 Afternoon word theater! You're the star of the show!",
      "🏆 Afternoon champion! Time to claim your word victories!",
      "🎊 Afternoon party time! Celebrate with new words!",
      "🦖 Roaring afternoon! Dinosaur-sized word adventures!",
      "🎸 Rock your afternoon! Strum the strings of success!",
      "🌮 Spicy afternoon learning! Add flavor with new words!",
      "🎢 Afternoon roller coaster! Up and down with word fun!",
      "🧙‍♂️ Afternoon magic hour! Cast spells with new words!",
      "🏖️ Afternoon beach day! Build sandcastles of knowledge!",
    ];

    const eveningMessages = [
      "🌙 Evening magic time! Perfect for word enchantments!",
      "⭐ Star-powered learning! Your evening word adventure awaits!",
      "🦉 Wise owl hours! Time for some smart word hunting!",
      "🌃 City lights sparkle! So do your amazing word skills!",
      "🌛 Crescent moon smiles! Evening word mysteries await!",
      "✨ Twilight twinkles! Sprinkle some word magic tonight!",
      "🎆 Evening fireworks! Light up your mind with words!",
      "🌟 Evening star wishes! Make your word dreams come true!",
      "🦇 Evening bat flight! Swoop into word adventures!",
      "🌒 Moon phases! Transform your brain with new words!",
      "🕯️ Candlelit learning! Warm and cozy word time!",
      "🎭 Evening theater! Tonight's show: Amazing Word Learning!",
      "🌊 Evening ocean waves! Drift into peaceful word learning!",
      "🎪 Evening word circus! The grand finale of your day!",
      "🍕 Evening treat time! Slice up some delicious words!",
      "🎬 Evening movie night! You're the star learning words!",
      "🌹 Evening garden blooms! Your word skills are flowering!",
      "🎵 Evening lullaby! Let words sing you to success!",
      "🏰 Evening castle glow! Your word kingdom grows stronger!",
      "🦋 Evening butterfly dreams! Float through word wonderland!",
      "🎨 Evening masterpiece! Paint your mind with new words!",
      "🌈 Evening rainbow magic! Colors of learning everywhere!",
    ];

    // Special weekend messages
    const weekendMessages = [
      "🎉 Weekend word party! No school but lots of fun learning!",
      "🏖️ Weekend vibes! Relax and learn at your own pace!",
      "🎪 Weekend word carnival! Extra fun, extra learning!",
      "🦋 Free weekend spirit! Let your word wings soar!",
      "🎨 Creative weekend! Paint with words and imagination!",
      "🌈 Rainbow weekend! Every color of learning is here!",
      "🎊 Weekend celebration! Learning never takes a break!",
      "🏰 Weekend word kingdom! You rule your learning adventure!",
      "🎵 Weekend word symphony! Make beautiful learning music!",
      "🦄 Magical weekend! Unicorns believe in your word power!",
    ];

    // Special day messages
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Monday motivation
    const mondayMessages = [
      "💪 Monday Motivation! Start the week with word power!",
      "🚀 Monday Blast Off! Launch into an amazing week!",
      "⭐ Marvelous Monday! Make this week sparkle with words!",
      "🌟 Monday Magic! Transform your week with learning!",
      "🎯 Monday Mission! Your word adventure begins now!",
    ];

    // Friday celebration
    const fridayMessages = [
      "🎉 Friday Fun! End the week with a word celebration!",
      "🏆 Fantastic Friday! You've earned your learning crown!",
      "🌈 Friday Rainbow! Look at all the words you've collected!",
      "🎪 Friday Festival! Celebrate your amazing week of learning!",
      "⭐ Friday Superstar! You've shined all week long!",
    ];

    // Determine which message set to use
    let selectedMessages;

    if (isWeekend) {
      selectedMessages = weekendMessages;
    } else if (dayOfWeek === 1) {
      // Monday
      selectedMessages = mondayMessages;
    } else if (dayOfWeek === 5) {
      // Friday
      selectedMessages = fridayMessages;
    } else {
      // Regular time-based messages
      selectedMessages = morningMessages;
      if (hour >= 12 && hour < 18) selectedMessages = afternoonMessages;
      else if (hour >= 18) selectedMessages = eveningMessages;
    }

    return selectedMessages[
      Math.floor(Math.random() * selectedMessages.length)
    ];
  }

  /**
   * Get next achievement tease
   */
  static getNextAchievementTease(): string | null {
    const nextAchievement = this.achievements
      .filter((a) => !a.unlocked)
      .sort(
        (a, b) =>
          b.currentProgress / b.requirements -
          a.currentProgress / a.requirements,
      )[0];

    if (!nextAchievement) return null;

    const progressPercent = Math.round(
      (nextAchievement.currentProgress / nextAchievement.requirements) * 100,
    );

    if (progressPercent >= 90) {
      return `🔥 SO CLOSE! "${nextAchievement.name}" is ${progressPercent}% complete!`;
    } else if (progressPercent >= 75) {
      return `👀 Almost there! "${nextAchievement.name}" is ${progressPercent}% done!`;
    } else if (progressPercent >= 50) {
      return `💪 Keep going! "${nextAchievement.name}" is halfway there!`;
    }

    return null;
  }

  /**
   * Get short achievement tease for mobile
   */
  static getShortAchievementTease(): string | null {
    const nextAchievement = this.achievements
      .filter((a) => !a.unlocked)
      .sort(
        (a, b) =>
          b.currentProgress / b.requirements -
          a.currentProgress / a.requirements,
      )[0];

    if (!nextAchievement) return null;

    const progressPercent = Math.round(
      (nextAchievement.currentProgress / nextAchievement.requirements) * 100,
    );

    const shortName =
      nextAchievement.name.length > 15
        ? nextAchievement.name.slice(0, 15) + "..."
        : nextAchievement.name;

    if (progressPercent >= 90) {
      return `🔥 Almost! ${shortName} ${progressPercent}%`;
    } else if (progressPercent >= 75) {
      return `👀 Close! ${shortName} ${progressPercent}%`;
    } else if (progressPercent >= 50) {
      return `💪 Keep going! ${shortName} ${progressPercent}%`;
    }

    return null;
  }

  /**
   * Check if today is a special achievement day
   */
  static getTodaySpecialMessage(): string | null {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      return "🎊 WEEKEND BONUS! Double the fun, double the achievement magic!";
    }

    // Monday motivation
    if (dayOfWeek === 1) {
      return "🚀 MONDAY POWER-UP! Start the week with word magic!";
    }

    // Friday celebration
    if (dayOfWeek === 5) {
      return "🎉 FRIDAY FUN! End the week with a word party!";
    }

    return null;
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

    this.achievementCooldowns.clear();
    this.lastAchievementTime = 0;

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
