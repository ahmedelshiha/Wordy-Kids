import { Word, wordsDatabase } from "@/data/wordsDatabase";
import { ChildWordStats } from "@shared/api";

export interface WordSession {
  id: string;
  words: Word[];
  sessionNumber: number;
  category: string;
  startTime: number;
  completedWords: Set<number>;
  remainingWords: Word[];
}

export interface WordHistory {
  wordId: number;
  lastSeen: number; // timestamp
  timesShown: number;
  consecutiveCorrect: number;
  averageAccuracy: number;
  category: string;
  difficulty: string;
  nextEligibleTime: number; // timestamp when word can be shown again
}

export interface SystematicWordSelection {
  words: Word[];
  sessionInfo: {
    totalNewWords: number;
    reviewWords: number;
    difficulty: "easy" | "medium" | "hard";
    categories: string[];
    exhaustionLevel: number; // 0-1, how much of available pool is used
    sessionStrategy: string;
  };
}

/**
 * Enhanced Word Selection System with Advanced Repetition Prevention
 *
 * Features:
 * - Systematic word progression through database
 * - Intelligent repetition prevention with cooldown periods
 * - Category rotation and difficulty progression
 * - Memory-based spacing algorithms
 * - Adaptive session generation
 */
export class EnhancedWordSelector {
  private static readonly SESSION_SIZE = 20;
  private static readonly MIN_COOLDOWN_HOURS = 4; // Minimum hours before word can repeat
  private static readonly MAX_COOLDOWN_HOURS = 72; // Maximum cooldown for difficult words
  private static readonly CATEGORY_ROTATION_THRESHOLD = 0.7; // Switch categories when 70% exhausted

  /**
   * Generate a systematic session with enhanced repetition prevention
   */
  static generateSystematicSession(
    selectedCategory: string,
    userHistory: Map<number, WordHistory>,
    userProgress: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
    sessionNumber: number = 1,
  ): SystematicWordSelection {
    // Get available word pool for category
    const categoryWords = this.getFilteredCategoryWords(
      selectedCategory,
      userHistory,
    );

    // Calculate category exhaustion level
    const exhaustionLevel = this.calculateCategoryExhaustion(
      selectedCategory,
      userHistory,
      userProgress,
    );

    // Determine session strategy based on exhaustion and performance
    let sessionStrategy = this.determineSessionStrategy(
      exhaustionLevel,
      childStats,
      categoryWords.length,
    );

    // Override cross_category strategy if user selected a specific category
    // Only use cross_category when user selected "all" or when no words available in selected category
    if (sessionStrategy === "cross_category") {
      if (category !== "all" && categoryWords.length > 0) {
        // Force staying within the selected category by using targeted_review or mixed_reinforcement
        sessionStrategy = exhaustionLevel >= 0.8 ? "targeted_review" : "mixed_reinforcement";
        console.log(`Overriding cross_category strategy to ${sessionStrategy} to respect category selection: ${category}`);
      }
    }

    console.log(
      `Session Strategy: ${sessionStrategy}, Exhaustion: ${exhaustionLevel.toFixed(2)}, Category: ${category}`,
    );

    // Generate words based on strategy
    let selectedWords: Word[] = [];

    switch (sessionStrategy) {
      case "fresh_exploration":
        selectedWords = this.selectFreshWords(
          categoryWords,
          userHistory,
          userProgress,
        );
        break;

      case "mixed_reinforcement":
        selectedWords = this.selectMixedWords(
          categoryWords,
          userHistory,
          userProgress,
          childStats,
        );
        break;

      case "targeted_review":
        selectedWords = this.selectReviewWords(
          categoryWords,
          userHistory,
          userProgress,
          childStats,
        );
        break;

      case "cross_category":
        // Only executed when user selected "all" or no words available in category
        selectedWords = this.selectCrossCategoryWords(
          userHistory,
          userProgress,
          childStats,
        );
        break;

      case "adaptive_difficulty":
        selectedWords = this.selectAdaptiveDifficultyWords(
          categoryWords,
          userHistory,
          childStats,
        );
        break;

      default:
        selectedWords = this.selectFreshWords(
          categoryWords,
          userHistory,
          userProgress,
        );
    }

    // Apply final filters and optimizations
    selectedWords = this.applyFinalOptimizations(
      selectedWords,
      userHistory,
      childStats,
    );

    // Ensure we have enough words
    if (selectedWords.length < this.SESSION_SIZE) {
      selectedWords = this.fillRemainingSlots(
        selectedWords,
        categoryWords,
        userHistory,
        userProgress,
      );
    }

    // Limit to session size
    selectedWords = selectedWords.slice(0, this.SESSION_SIZE);

    // Calculate session difficulty
    const sessionDifficulty = this.calculateSessionDifficulty(selectedWords);

    // Get unique categories
    const categories = [...new Set(selectedWords.map((w) => w.category))];

    // Count word types
    const newWords = selectedWords.filter(
      (w) =>
        !userProgress.rememberedWords.has(w.id) &&
        !userProgress.forgottenWords.has(w.id),
    ).length;

    const reviewWords = selectedWords.length - newWords;

    return {
      words: selectedWords,
      sessionInfo: {
        totalNewWords: newWords,
        reviewWords,
        difficulty: sessionDifficulty,
        categories,
        exhaustionLevel,
        sessionStrategy,
      },
    };
  }

  /**
   * Get filtered words for category with cooldown enforcement
   */
  private static getFilteredCategoryWords(
    category: string,
    userHistory: Map<number, WordHistory>,
  ): Word[] {
    const now = Date.now();
    const categoryWords =
      category === "all"
        ? wordsDatabase
        : wordsDatabase.filter((w) => w.category === category);

    return categoryWords.filter((word) => {
      const history = userHistory.get(word.id);

      // If word was never shown, it's available
      if (!history) return true;

      // Check if cooldown period has passed
      return now >= history.nextEligibleTime;
    });
  }

  /**
   * Calculate how exhausted a category is (0 = fresh, 1 = fully exhausted)
   */
  private static calculateCategoryExhaustion(
    category: string,
    userHistory: Map<number, WordHistory>,
    userProgress: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
  ): number {
    const categoryWords =
      category === "all"
        ? wordsDatabase
        : wordsDatabase.filter((w) => w.category === category);

    const totalWords = categoryWords.length;
    const seenWords = categoryWords.filter(
      (w) =>
        userHistory.has(w.id) ||
        userProgress.rememberedWords.has(w.id) ||
        userProgress.forgottenWords.has(w.id),
    ).length;

    return Math.min(1, seenWords / totalWords);
  }

  /**
   * Determine the best session strategy based on current state
   */
  private static determineSessionStrategy(
    exhaustionLevel: number,
    childStats: ChildWordStats | null | undefined,
    availableWords: number,
  ): string {
    const accuracy = childStats?.averageAccuracy || 0;
    const sessions = childStats?.totalReviewSessions || 0;

    // Fresh exploration - plenty of new words available
    if (exhaustionLevel < 0.3 && availableWords >= this.SESSION_SIZE) {
      return "fresh_exploration";
    }

    // Mixed reinforcement - moderate exhaustion, good for building confidence
    if (exhaustionLevel < 0.7 && accuracy >= 60) {
      return "mixed_reinforcement";
    }

    // Targeted review - high exhaustion or struggling performance
    if (exhaustionLevel >= 0.7 || (accuracy < 60 && sessions > 5)) {
      return "targeted_review";
    }

    // Cross-category - need variety when single category is exhausted
    if (exhaustionLevel >= 0.8) {
      return "cross_category";
    }

    // Adaptive difficulty - for advanced learners
    if (accuracy >= 85 && sessions > 15) {
      return "adaptive_difficulty";
    }

    return "fresh_exploration";
  }

  /**
   * Select fresh, unseen words
   */
  private static selectFreshWords(
    availableWords: Word[],
    userHistory: Map<number, WordHistory>,
    userProgress: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
  ): Word[] {
    // Filter to truly new words
    const newWords = availableWords.filter(
      (word) =>
        !userHistory.has(word.id) &&
        !userProgress.rememberedWords.has(word.id) &&
        !userProgress.forgottenWords.has(word.id) &&
        !userProgress.excludedWordIds.has(word.id),
    );

    // Sort by difficulty for progressive learning
    newWords.sort((a, b) => {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

    return newWords.slice(0, this.SESSION_SIZE);
  }

  /**
   * Select mix of new and review words
   */
  private static selectMixedWords(
    availableWords: Word[],
    userHistory: Map<number, WordHistory>,
    userProgress: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
  ): Word[] {
    const selected: Word[] = [];

    // 60% new words
    const newWords = this.selectFreshWords(
      availableWords,
      userHistory,
      userProgress,
    );
    selected.push(...newWords.slice(0, Math.floor(this.SESSION_SIZE * 0.6)));

    // 40% review words (prioritize forgotten words)
    const reviewSlots = this.SESSION_SIZE - selected.length;
    const forgottenReviews = this.selectForgottenWordsForReview(
      userHistory,
      userProgress,
    );
    const rememberedReviews = this.selectRememberedWordsForReview(
      userHistory,
      userProgress,
    );

    // Prioritize forgotten words
    selected.push(
      ...forgottenReviews.slice(
        0,
        Math.min(reviewSlots, forgottenReviews.length),
      ),
    );

    // Fill remaining with remembered reviews
    const remainingSlots = this.SESSION_SIZE - selected.length;
    if (remainingSlots > 0) {
      selected.push(...rememberedReviews.slice(0, remainingSlots));
    }

    return selected;
  }

  /**
   * Select words specifically for review
   */
  private static selectReviewWords(
    userHistory: Map<number, WordHistory>,
    userProgress: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
  ): Word[] {
    const selected: Word[] = [];

    // Prioritize forgotten words
    const forgottenWords = this.selectForgottenWordsForReview(
      userHistory,
      userProgress,
    );
    selected.push(
      ...forgottenWords.slice(0, Math.floor(this.SESSION_SIZE * 0.7)),
    );

    // Add some remembered words for reinforcement
    const rememberedWords = this.selectRememberedWordsForReview(
      userHistory,
      userProgress,
    );
    const remainingSlots = this.SESSION_SIZE - selected.length;
    selected.push(...rememberedWords.slice(0, remainingSlots));

    return selected;
  }

  /**
   * Select words from multiple categories for variety
   */
  private static selectCrossCategoryWords(
    userHistory: Map<number, WordHistory>,
    userProgress: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
  ): Word[] {
    const categories = [
      "food",
      "animals",
      "objects",
      "nature",
      "body",
      "colors",
    ];
    const wordsPerCategory = Math.floor(this.SESSION_SIZE / categories.length);
    const selected: Word[] = [];

    categories.forEach((category) => {
      const categoryWords = this.getFilteredCategoryWords(
        category,
        userHistory,
      );
      const freshWords = this.selectFreshWords(
        categoryWords,
        userHistory,
        userProgress,
      );
      selected.push(...freshWords.slice(0, wordsPerCategory));
    });

    // Fill remaining slots with any available words
    if (selected.length < this.SESSION_SIZE) {
      const allAvailable = this.getFilteredCategoryWords("all", userHistory);
      const remaining = allAvailable.filter(
        (w) => !selected.some((s) => s.id === w.id),
      );
      selected.push(...remaining.slice(0, this.SESSION_SIZE - selected.length));
    }

    return selected;
  }

  /**
   * Select words with adaptive difficulty progression
   */
  private static selectAdaptiveDifficultyWords(
    availableWords: Word[],
    userHistory: Map<number, WordHistory>,
    childStats?: ChildWordStats | null,
  ): Word[] {
    const accuracy = childStats?.averageAccuracy || 0;

    // Determine target difficulty distribution
    let difficultyMix: Record<string, number>;
    if (accuracy >= 90) {
      difficultyMix = { easy: 0.3, medium: 0.4, hard: 0.3 };
    } else if (accuracy >= 75) {
      difficultyMix = { easy: 0.4, medium: 0.4, hard: 0.2 };
    } else {
      difficultyMix = { easy: 0.6, medium: 0.3, hard: 0.1 };
    }

    const selected: Word[] = [];

    Object.entries(difficultyMix).forEach(([difficulty, ratio]) => {
      const difficultyWords = availableWords.filter(
        (w) => w.difficulty === difficulty,
      );
      const count = Math.floor(this.SESSION_SIZE * ratio);
      selected.push(...difficultyWords.slice(0, count));
    });

    return selected;
  }

  /**
   * Select forgotten words that are ready for review
   */
  private static selectForgottenWordsForReview(
    userHistory: Map<number, WordHistory>,
    userProgress: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
  ): Word[] {
    const now = Date.now();
    const forgottenWords: Word[] = [];

    userProgress.forgottenWords.forEach((wordId) => {
      const word = wordsDatabase.find((w) => w.id === wordId);
      const history = userHistory.get(wordId);

      if (word && history && now >= history.nextEligibleTime) {
        forgottenWords.push(word);
      }
    });

    // Sort by priority (longer since last seen = higher priority)
    forgottenWords.sort((a, b) => {
      const historyA = userHistory.get(a.id);
      const historyB = userHistory.get(b.id);
      return (historyA?.lastSeen || 0) - (historyB?.lastSeen || 0);
    });

    return forgottenWords;
  }

  /**
   * Select remembered words for reinforcement
   */
  private static selectRememberedWordsForReview(
    userHistory: Map<number, WordHistory>,
    userProgress: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
  ): Word[] {
    const now = Date.now();
    const rememberedWords: Word[] = [];

    userProgress.rememberedWords.forEach((wordId) => {
      const word = wordsDatabase.find((w) => w.id === wordId);
      const history = userHistory.get(wordId);

      if (word && history && now >= history.nextEligibleTime) {
        rememberedWords.push(word);
      }
    });

    // Sort by spaced repetition schedule
    rememberedWords.sort((a, b) => {
      const historyA = userHistory.get(a.id);
      const historyB = userHistory.get(b.id);

      // Prioritize words that need more reinforcement
      const scoreA =
        (historyA?.consecutiveCorrect || 0) * (historyA?.averageAccuracy || 0);
      const scoreB =
        (historyB?.consecutiveCorrect || 0) * (historyB?.averageAccuracy || 0);

      return scoreA - scoreB; // Lower scores first (need more practice)
    });

    return rememberedWords;
  }

  /**
   * Fill remaining slots when not enough words are selected
   */
  private static fillRemainingSlots(
    currentSelection: Word[],
    availableWords: Word[],
    userHistory: Map<number, WordHistory>,
    userProgress: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
  ): Word[] {
    const selected = [...currentSelection];
    const currentIds = new Set(selected.map((w) => w.id));

    // Find words not in current selection
    const remaining = availableWords.filter((w) => !currentIds.has(w.id));

    // Add remaining words to fill session
    const needed = this.SESSION_SIZE - selected.length;
    selected.push(...remaining.slice(0, needed));

    return selected;
  }

  /**
   * Apply final optimizations to word selection
   */
  private static applyFinalOptimizations(
    words: Word[],
    userHistory: Map<number, WordHistory>,
    childStats?: ChildWordStats | null,
  ): Word[] {
    // Shuffle while maintaining some difficulty progression
    const optimized = this.shuffleWithProgression(words);

    // Remove any words that are still in cooldown (final safety check)
    const now = Date.now();
    return optimized.filter((word) => {
      const history = userHistory.get(word.id);
      return !history || now >= history.nextEligibleTime;
    });
  }

  /**
   * Shuffle words while maintaining educational progression
   */
  private static shuffleWithProgression(words: Word[]): Word[] {
    const easy = words.filter((w) => w.difficulty === "easy");
    const medium = words.filter((w) => w.difficulty === "medium");
    const hard = words.filter((w) => w.difficulty === "hard");

    const shuffleArray = (arr: Word[]) => arr.sort(() => Math.random() - 0.5);

    // Mix difficulties but lean towards easy-to-hard progression
    const result: Word[] = [];
    const maxLength = Math.max(easy.length, medium.length, hard.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < easy.length) result.push(easy[i]);
      if (i < medium.length && result.length < this.SESSION_SIZE)
        result.push(medium[i]);
      if (i < hard.length && result.length < this.SESSION_SIZE)
        result.push(hard[i]);
    }

    // Slight shuffle to avoid predictability
    for (let i = result.length - 1; i > 0; i--) {
      if (Math.random() < 0.3) {
        // 30% chance to swap
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
    }

    return result;
  }

  /**
   * Calculate cooldown period for a word based on performance
   */
  static calculateWordCooldown(
    word: Word,
    wasCorrect: boolean,
    consecutiveCorrect: number,
    averageAccuracy: number,
    timesShown: number,
  ): number {
    let baseHours = this.MIN_COOLDOWN_HOURS;

    // Adjust based on difficulty
    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 };
    baseHours *= difficultyMultiplier[word.difficulty];

    // Adjust based on performance
    if (wasCorrect) {
      // Good performance = longer cooldown (word is learned)
      baseHours *= 1 + consecutiveCorrect * 0.5 + averageAccuracy / 100;
    } else {
      // Poor performance = shorter cooldown (needs more practice)
      baseHours *= 0.5;
    }

    // Adjust based on frequency
    if (timesShown > 5) {
      baseHours *= 1.5; // Give overused words more rest
    }

    // Ensure bounds
    baseHours = Math.max(
      this.MIN_COOLDOWN_HOURS,
      Math.min(this.MAX_COOLDOWN_HOURS, baseHours),
    );

    return baseHours;
  }

  /**
   * Update word history after interaction
   */
  static updateWordHistory(
    wordId: number,
    wasCorrect: boolean,
    userHistory: Map<number, WordHistory>,
  ): WordHistory {
    const now = Date.now();
    const word = wordsDatabase.find((w) => w.id === wordId);

    if (!word) {
      throw new Error(`Word with ID ${wordId} not found`);
    }

    const existing = userHistory.get(wordId) || {
      wordId,
      lastSeen: 0,
      timesShown: 0,
      consecutiveCorrect: 0,
      averageAccuracy: 0,
      category: word.category,
      difficulty: word.difficulty,
      nextEligibleTime: 0,
    };

    // Update stats
    const newConsecutiveCorrect = wasCorrect
      ? existing.consecutiveCorrect + 1
      : 0;
    const newTimesShown = existing.timesShown + 1;

    // Calculate new average accuracy
    const oldTotal = existing.averageAccuracy * (existing.timesShown || 1);
    const newTotal = oldTotal + (wasCorrect ? 100 : 0);
    const newAverageAccuracy = newTotal / newTimesShown;

    // Calculate cooldown
    const cooldownHours = this.calculateWordCooldown(
      word,
      wasCorrect,
      newConsecutiveCorrect,
      newAverageAccuracy,
      newTimesShown,
    );

    const updated: WordHistory = {
      ...existing,
      lastSeen: now,
      timesShown: newTimesShown,
      consecutiveCorrect: newConsecutiveCorrect,
      averageAccuracy: newAverageAccuracy,
      nextEligibleTime: now + cooldownHours * 60 * 60 * 1000, // Convert hours to milliseconds
    };

    userHistory.set(wordId, updated);

    console.log(
      `Word ${word.word}: Correct=${wasCorrect}, Cooldown=${cooldownHours.toFixed(1)}h, Next eligible: ${new Date(updated.nextEligibleTime).toLocaleString()}`,
    );

    return updated;
  }

  /**
   * Calculate session difficulty
   */
  private static calculateSessionDifficulty(
    words: Word[],
  ): "easy" | "medium" | "hard" {
    if (words.length === 0) return "easy";

    const hardCount = words.filter((w) => w.difficulty === "hard").length;
    const mediumCount = words.filter((w) => w.difficulty === "medium").length;

    const hardRatio = hardCount / words.length;
    const mediumRatio = mediumCount / words.length;

    if (hardRatio > 0.4) return "hard";
    if (mediumRatio > 0.5 || hardRatio > 0.2) return "medium";
    return "easy";
  }
}

/**
 * Legacy compatibility function
 */
export function getEnhancedWordSelection(
  category: string,
  userHistory: Map<number, WordHistory>,
  userProgress: {
    rememberedWords: Set<number>;
    forgottenWords: Set<number>;
    excludedWordIds: Set<number>;
  },
  childStats?: ChildWordStats | null,
  sessionNumber: number = 1,
): SystematicWordSelection {
  return EnhancedWordSelector.generateSystematicSession(
    category,
    userHistory,
    userProgress,
    childStats,
    sessionNumber,
  );
}
