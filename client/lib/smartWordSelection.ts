import { Word, wordsDatabase, getWordsByCategory, getRandomWords } from "@/data/wordsDatabase";
import { ChildWordStats } from "@shared/api";

export interface WordSelectionOptions {
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  count: number;
  rememberedWords: Set<number>;
  forgottenWords: Set<number>;
  childStats?: ChildWordStats | null;
  userProfile?: any;
  prioritizeWeakCategories?: boolean;
  includeReviewWords?: boolean;
}

export interface SmartWordSelection {
  words: Word[];
  selectionReason: {
    forgottenCount: number;
    newCount: number;
    reviewCount: number;
    adaptiveCount: number;
  };
  difficulty: "easy" | "medium" | "hard";
  categories: string[];
}

/**
 * Advanced word selection algorithm that considers:
 * - Spaced repetition principles
 * - Child's performance history
 * - Difficulty progression
 * - Category mastery levels
 * - Engagement optimization
 */
export class SmartWordSelector {
  
  /**
   * Get optimal word selection for learning session
   */
  static selectWords(options: WordSelectionOptions): SmartWordSelection {
    const {
      category = "all",
      count,
      rememberedWords,
      forgottenWords,
      childStats,
      prioritizeWeakCategories = true,
      includeReviewWords = true,
    } = options;

    // Get base word pool
    let wordPool = category === "all" 
      ? wordsDatabase 
      : getWordsByCategory(category);

    // Categorize words by learning status
    const forgottenWordsList = wordPool.filter(word => 
      forgottenWords.has(word.id)
    );
    
    const rememberedWordsList = wordPool.filter(word => 
      rememberedWords.has(word.id)
    );
    
    const newWords = wordPool.filter(word => 
      !forgottenWords.has(word.id) && !rememberedWords.has(word.id)
    );

    // Determine optimal distribution based on learning science
    const distribution = this.calculateOptimalDistribution(
      count, 
      forgottenWordsList.length,
      newWords.length,
      rememberedWordsList.length,
      childStats
    );

    // Select words with smart algorithms
    const selectedWords: Word[] = [];
    const selectionReason = {
      forgottenCount: 0,
      newCount: 0,
      reviewCount: 0,
      adaptiveCount: 0,
    };

    // 1. Priority: Forgotten words (spaced repetition)
    if (distribution.forgotten > 0 && forgottenWordsList.length > 0) {
      const forgottenSelection = this.selectForgottenWords(
        forgottenWordsList, 
        distribution.forgotten,
        childStats
      );
      selectedWords.push(...forgottenSelection);
      selectionReason.forgottenCount = forgottenSelection.length;
    }

    // 2. New words with adaptive difficulty
    if (distribution.new > 0 && newWords.length > 0) {
      const newWordsSelection = this.selectNewWords(
        newWords,
        distribution.new,
        childStats,
        prioritizeWeakCategories
      );
      selectedWords.push(...newWordsSelection);
      selectionReason.newCount = newWordsSelection.length;
    }

    // 3. Review words for reinforcement
    if (distribution.review > 0 && rememberedWordsList.length > 0 && includeReviewWords) {
      const reviewSelection = this.selectReviewWords(
        rememberedWordsList,
        distribution.review,
        childStats
      );
      selectedWords.push(...reviewSelection);
      selectionReason.reviewCount = reviewSelection.length;
    }

    // 4. Fill remaining slots adaptively
    const remaining = count - selectedWords.length;
    if (remaining > 0) {
      const adaptiveSelection = this.selectAdaptiveWords(
        wordPool.filter(word => 
          !selectedWords.some(selected => selected.id === word.id)
        ),
        remaining,
        childStats
      );
      selectedWords.push(...adaptiveSelection);
      selectionReason.adaptiveCount = adaptiveSelection.length;
    }

    // Shuffle for varied presentation
    const shuffledWords = this.shuffleWords(selectedWords);

    // Determine session difficulty and categories
    const sessionDifficulty = this.calculateSessionDifficulty(shuffledWords, childStats);
    const categories = [...new Set(shuffledWords.map(word => word.category))];

    return {
      words: shuffledWords.slice(0, count),
      selectionReason,
      difficulty: sessionDifficulty,
      categories,
    };
  }

  /**
   * Calculate optimal distribution of word types based on learning science
   */
  private static calculateOptimalDistribution(
    totalCount: number,
    forgottenCount: number,
    newWordsCount: number,
    reviewCount: number,
    childStats?: ChildWordStats | null
  ) {
    // Base distribution following 40-40-20 rule (forgotten-new-review)
    let forgottenRatio = 0.4;
    let newRatio = 0.4;
    let reviewRatio = 0.2;

    // Adapt based on performance
    if (childStats) {
      const accuracy = childStats.averageAccuracy || 0;
      
      // If struggling (low accuracy), focus more on forgotten words
      if (accuracy < 60) {
        forgottenRatio = 0.6;
        newRatio = 0.3;
        reviewRatio = 0.1;
      }
      // If doing well, introduce more new words
      else if (accuracy > 85) {
        forgottenRatio = 0.3;
        newRatio = 0.5;
        reviewRatio = 0.2;
      }
    }

    // Calculate actual counts
    const forgotten = Math.min(
      Math.floor(totalCount * forgottenRatio), 
      forgottenCount
    );
    
    const remaining = totalCount - forgotten;
    const newWords = Math.min(
      Math.floor(remaining * (newRatio / (newRatio + reviewRatio))), 
      newWordsCount
    );
    
    const review = Math.min(totalCount - forgotten - newWords, reviewCount);

    return { forgotten, new: newWords, review };
  }

  /**
   * Select forgotten words prioritizing spaced repetition
   */
  private static selectForgottenWords(
    forgottenWords: Word[],
    count: number,
    childStats?: ChildWordStats | null
  ): Word[] {
    if (forgottenWords.length === 0) return [];

    // Prioritize by category weakness if stats available
    if (childStats?.weakestCategories) {
      const categorizedWords = new Map<string, Word[]>();
      forgottenWords.forEach(word => {
        if (!categorizedWords.has(word.category)) {
          categorizedWords.set(word.category, []);
        }
        categorizedWords.get(word.category)!.push(word);
      });

      const selected: Word[] = [];
      
      // First, select from weakest categories
      childStats.weakestCategories.forEach(category => {
        if (selected.length < count && categorizedWords.has(category)) {
          const categoryWords = categorizedWords.get(category)!;
          const needed = Math.min(count - selected.length, categoryWords.length);
          selected.push(...categoryWords.slice(0, needed));
        }
      });

      // Fill remaining with other forgotten words
      if (selected.length < count) {
        const remaining = forgottenWords.filter(word => 
          !selected.some(s => s.id === word.id)
        );
        selected.push(...remaining.slice(0, count - selected.length));
      }

      return selected;
    }

    // Default: random selection with difficulty consideration
    return forgottenWords
      .sort((a, b) => {
        // Prioritize easier words for confidence building
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      })
      .slice(0, count);
  }

  /**
   * Select new words with adaptive difficulty progression
   */
  private static selectNewWords(
    newWords: Word[],
    count: number,
    childStats?: ChildWordStats | null,
    prioritizeWeakCategories: boolean = true
  ): Word[] {
    if (newWords.length === 0) return [];

    // Determine appropriate difficulty level
    let targetDifficulty: "easy" | "medium" | "hard" = "easy";
    
    if (childStats) {
      const accuracy = childStats.averageAccuracy || 0;
      if (accuracy > 85) targetDifficulty = "medium";
      if (accuracy > 95) targetDifficulty = "hard";
    }

    // Filter by difficulty
    let candidateWords = newWords.filter(word => 
      word.difficulty === targetDifficulty
    );

    // If not enough words at target difficulty, expand
    if (candidateWords.length < count) {
      candidateWords = newWords.filter(word => 
        word.difficulty === "easy" || word.difficulty === targetDifficulty
      );
    }

    // Prioritize weak categories if applicable
    if (prioritizeWeakCategories && childStats?.weakestCategories) {
      const weakCategoryWords = candidateWords.filter(word =>
        childStats.weakestCategories.includes(word.category)
      );
      
      if (weakCategoryWords.length > 0) {
        const selectedWeak = weakCategoryWords.slice(0, Math.ceil(count * 0.6));
        const remaining = candidateWords.filter(word => 
          !selectedWeak.some(w => w.id === word.id)
        );
        return [
          ...selectedWeak,
          ...remaining.slice(0, count - selectedWeak.length)
        ];
      }
    }

    // Random selection from candidates
    return candidateWords
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  /**
   * Select review words for reinforcement
   */
  private static selectReviewWords(
    reviewWords: Word[],
    count: number,
    childStats?: ChildWordStats | null
  ): Word[] {
    if (reviewWords.length === 0) return [];

    // Prioritize stronger categories for confidence
    if (childStats?.strongestCategories) {
      const strongCategoryWords = reviewWords.filter(word =>
        childStats.strongestCategories.includes(word.category)
      );
      
      if (strongCategoryWords.length >= count) {
        return strongCategoryWords.slice(0, count);
      }
    }

    // Random selection for review
    return reviewWords
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  /**
   * Select adaptive words to fill remaining slots
   */
  private static selectAdaptiveWords(
    availableWords: Word[],
    count: number,
    childStats?: ChildWordStats | null
  ): Word[] {
    if (availableWords.length === 0) return [];

    // Mix of difficulties based on performance
    const difficultyMix = this.getDifficultyMix(childStats);
    const selected: Word[] = [];

    Object.entries(difficultyMix).forEach(([difficulty, ratio]) => {
      const difficultyWords = availableWords.filter(word => 
        word.difficulty === difficulty
      );
      const needed = Math.floor(count * ratio);
      selected.push(...difficultyWords.slice(0, needed));
    });

    // Fill any remaining slots
    if (selected.length < count) {
      const remaining = availableWords.filter(word => 
        !selected.some(s => s.id === word.id)
      );
      selected.push(...remaining.slice(0, count - selected.length));
    }

    return selected;
  }

  /**
   * Determine optimal difficulty mix based on performance
   */
  private static getDifficultyMix(childStats?: ChildWordStats | null) {
    if (!childStats) {
      return { easy: 0.6, medium: 0.3, hard: 0.1 };
    }

    const accuracy = childStats.averageAccuracy || 0;

    if (accuracy < 60) {
      return { easy: 0.8, medium: 0.2, hard: 0.0 };
    } else if (accuracy < 80) {
      return { easy: 0.6, medium: 0.3, hard: 0.1 };
    } else {
      return { easy: 0.4, medium: 0.4, hard: 0.2 };
    }
  }

  /**
   * Calculate appropriate session difficulty
   */
  private static calculateSessionDifficulty(
    words: Word[], 
    childStats?: ChildWordStats | null
  ): "easy" | "medium" | "hard" {
    if (words.length === 0) return "easy";

    const difficultyCount = words.reduce((acc, word) => {
      acc[word.difficulty] = (acc[word.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = words.length;
    const hardRatio = (difficultyCount.hard || 0) / total;
    const mediumRatio = (difficultyCount.medium || 0) / total;

    if (hardRatio > 0.4) return "hard";
    if (mediumRatio > 0.5 || hardRatio > 0.2) return "medium";
    return "easy";
  }

  /**
   * Shuffle words while maintaining some predictability for learning
   */
  private static shuffleWords(words: Word[]): Word[] {
    // Simple shuffle with slight difficulty progression
    const shuffled = [...words];
    
    // Sort by difficulty first, then shuffle within groups
    const easy = shuffled.filter(w => w.difficulty === "easy");
    const medium = shuffled.filter(w => w.difficulty === "medium");
    const hard = shuffled.filter(w => w.difficulty === "hard");

    const shuffleArray = (arr: Word[]) => 
      arr.sort(() => Math.random() - 0.5);

    return [
      ...shuffleArray(easy),
      ...shuffleArray(medium),
      ...shuffleArray(hard),
    ];
  }

  /**
   * Get words for practice mode (forgotten words only)
   */
  static getPracticeWords(
    forgottenWords: Set<number>,
    childStats?: ChildWordStats | null,
    maxCount: number = 10
  ): Word[] {
    const forgottenWordsList = wordsDatabase.filter(word => 
      forgottenWords.has(word.id)
    );

    if (forgottenWordsList.length === 0) return [];

    return this.selectForgottenWords(forgottenWordsList, maxCount, childStats);
  }

  /**
   * Get category-specific words with smart selection
   */
  static getCategoryWords(
    category: string,
    options: Partial<WordSelectionOptions>
  ): SmartWordSelection {
    return this.selectWords({
      category,
      count: 10,
      rememberedWords: new Set(),
      forgottenWords: new Set(),
      ...options,
    });
  }
}

/**
 * Dynamic Difficulty Adjustment System
 * Adjusts word difficulty based on real-time performance
 */
export class DynamicDifficultyAdjuster {

  /**
   * Calculate optimal difficulty based on recent performance
   */
  static calculateOptimalDifficulty(
    childStats?: ChildWordStats | null,
    recentAccuracy?: number
  ): "easy" | "medium" | "hard" {
    if (!childStats && !recentAccuracy) return "easy";

    // Use recent accuracy if available, otherwise use overall accuracy
    const accuracy = recentAccuracy || childStats?.averageAccuracy || 0;
    const totalSessions = childStats?.totalReviewSessions || 0;

    // For new learners, start with easy
    if (totalSessions < 5) return "easy";

    // Performance-based difficulty adjustment
    if (accuracy >= 90) {
      // High performer - can handle harder content
      return totalSessions > 20 ? "hard" : "medium";
    } else if (accuracy >= 75) {
      // Good performer - standard progression
      return "medium";
    } else if (accuracy >= 60) {
      // Struggling - stay with easier content
      return "easy";
    } else {
      // Very struggling - focus on basic words
      return "easy";
    }
  }

  /**
   * Adjust word selection based on performance patterns
   */
  static adjustWordSelection(
    words: Word[],
    childStats?: ChildWordStats | null,
    recentPerformance?: {
      lastFiveAccuracy: number[];
      timeSpentPerWord: number[];
      strugglingCategories: string[];
    }
  ): Word[] {
    if (!childStats && !recentPerformance) return words;

    const optimalDifficulty = this.calculateOptimalDifficulty(childStats);

    // Filter words based on optimal difficulty
    let adjustedWords = words.filter(word => {
      if (optimalDifficulty === "easy") {
        return word.difficulty === "easy";
      } else if (optimalDifficulty === "medium") {
        return word.difficulty === "easy" || word.difficulty === "medium";
      } else {
        // For hard difficulty, include all levels but weight towards harder
        return true;
      }
    });

    // If we don't have enough words at the target difficulty, expand selection
    if (adjustedWords.length < Math.ceil(words.length * 0.8)) {
      adjustedWords = words; // Fall back to original selection
    }

    // Sort by difficulty preference
    adjustedWords.sort((a, b) => {
      const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
      if (optimalDifficulty === "hard") {
        return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
      }
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

    return adjustedWords;
  }

  /**
   * Adaptive session configuration based on performance
   */
  static getAdaptiveSessionConfig(childStats?: ChildWordStats | null) {
    if (!childStats) {
      return {
        wordsPerSession: 10,
        allowedMistakes: 3,
        timePerWord: 30, // seconds
        encouragementFrequency: 2, // every 2 words
      };
    }

    const accuracy = childStats.averageAccuracy || 0;
    const sessions = childStats.totalReviewSessions || 0;

    if (accuracy >= 85 && sessions > 15) {
      // Advanced learner
      return {
        wordsPerSession: 15,
        allowedMistakes: 2,
        timePerWord: 25,
        encouragementFrequency: 3,
      };
    } else if (accuracy >= 70) {
      // Intermediate learner
      return {
        wordsPerSession: 12,
        allowedMistakes: 3,
        timePerWord: 30,
        encouragementFrequency: 2,
      };
    } else {
      // Beginning learner
      return {
        wordsPerSession: 8,
        allowedMistakes: 4,
        timePerWord: 45,
        encouragementFrequency: 1,
      };
    }
  }
}

/**
 * Enhanced Spaced Repetition Algorithm
 */
export class EnhancedSpacedRepetition {

  /**
   * Calculate next review date based on performance and difficulty
   */
  static calculateNextReview(
    word: Word,
    wasCorrect: boolean,
    previousAttempts: number = 0,
    previousAccuracy: number = 0
  ): Date {
    const now = new Date();
    const baseInterval = this.getBaseInterval(word.difficulty);

    let multiplier = 1;

    if (wasCorrect) {
      // Correct answer - increase interval
      if (previousAccuracy >= 90) {
        multiplier = 2.5; // Strong memory
      } else if (previousAccuracy >= 70) {
        multiplier = 2.0; // Good memory
      } else {
        multiplier = 1.5; // Building memory
      }
    } else {
      // Incorrect answer - decrease interval
      multiplier = 0.5;
    }

    // Adjust for number of attempts
    const attemptMultiplier = Math.max(0.5, 1 - (previousAttempts * 0.1));

    const finalInterval = baseInterval * multiplier * attemptMultiplier;

    // Ensure minimum and maximum intervals
    const clampedInterval = Math.max(1, Math.min(30, finalInterval));

    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + clampedInterval);

    return nextReview;
  }

  /**
   * Get base interval in days based on difficulty
   */
  private static getBaseInterval(difficulty: "easy" | "medium" | "hard"): number {
    switch (difficulty) {
      case "easy": return 3;
      case "medium": return 2;
      case "hard": return 1;
      default: return 2;
    }
  }

  /**
   * Determine if a word should be reviewed today
   */
  static shouldReviewToday(
    lastReviewDate: Date,
    nextReviewDate: Date,
    accuracy: number
  ): boolean {
    const today = new Date();
    const daysSinceReview = Math.floor(
      (today.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Always review if past due date
    if (today >= nextReviewDate) return true;

    // Review early if accuracy is low
    if (accuracy < 60 && daysSinceReview >= 1) return true;

    return false;
  }
}

/**
 * Utility function for backward compatibility
 */
export function getSmartWordSelection(
  category: string,
  count: number,
  rememberedWords: Set<number>,
  forgottenWords: Set<number>,
  childStats?: ChildWordStats | null
): Word[] {
  const selection = SmartWordSelector.selectWords({
    category,
    count,
    rememberedWords,
    forgottenWords,
    childStats,
  });

  // Apply dynamic difficulty adjustment
  const adjustedWords = DynamicDifficultyAdjuster.adjustWordSelection(
    selection.words,
    childStats
  );

  return adjustedWords;
}
