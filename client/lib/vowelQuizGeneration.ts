import { Word, wordsDatabase, getWordsByCategory } from "@/data/wordsDatabase";
import {
  SmartWordSelector,
  WordSelectionOptions,
} from "@/lib/smartWordSelection";
import { EnhancedWordSelector } from "@/lib/enhancedWordSelection";

export interface VowelQuestion {
  word: string;
  missingIndex: number[];
  image?: string;
  audio?: string;
  difficulty?: "easy" | "medium" | "hard";
  originalWord?: Word; // Reference to the original word object
  category?: string;
  emoji?: string;
  // Extended properties for UltimateVowelQuiz compatibility
  displayWord?: string;
  missingVowelIndices?: number[];
  correctVowels?: { [key: number]: string };
  definition?: string;
}

export interface VowelQuizOptions {
  category?: string;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  count: number;
  gameMode?: "easy" | "challenge" | "timed";
  rememberedWords?: Set<number>;
  forgottenWords?: Set<number>;
  userProfile?: any;
  maxMissingVowels?: number;
}

/**
 * Vowel Quiz Generation System
 * Integrates with the existing word database and systematic word selection
 */
export class VowelQuizGenerator {
  private static readonly vowels = [
    "a",
    "e",
    "i",
    "o",
    "u",
    "A",
    "E",
    "I",
    "O",
    "U",
  ];

  /**
   * Generate vowel quiz questions from the word database
   */
  static generateVowelQuiz(options: VowelQuizOptions): VowelQuestion[] {
    const {
      category = "all",
      difficulty,
      count,
      gameMode = "easy",
      rememberedWords = new Set(),
      forgottenWords = new Set(),
      userProfile,
    } = options;

    // Use smart word selection to get appropriate words
    const wordSelection = SmartWordSelector.selectWords({
      category,
      difficulty,
      count: Math.min(count * 2, 50), // Get more words than needed to have options
      rememberedWords,
      forgottenWords,
      userProfile,
      prioritizeWeakCategories: true,
      includeReviewWords: true,
    });

    // Convert selected words to vowel questions
    const vowelQuestions = this.convertWordsToVowelQuestions(
      wordSelection.words,
      gameMode,
      count,
    );

    return vowelQuestions.slice(0, count);
  }

  /**
   * Convert Word objects to VowelQuestion objects
   */
  private static convertWordsToVowelQuestions(
    words: Word[],
    gameMode: "easy" | "challenge" | "timed",
    maxCount: number,
    maxMissingVowels?: number,
  ): VowelQuestion[] {
    const vowelQuestions: VowelQuestion[] = [];

    for (const word of words) {
      if (vowelQuestions.length >= maxCount) break;

      const vowelQuestion = this.createVowelQuestion(word, gameMode, maxMissingVowels);
      if (vowelQuestion) {
        vowelQuestions.push(vowelQuestion);
      }
    }

    // If we don't have enough questions, supplement with more words
    if (vowelQuestions.length < maxCount) {
      const additionalWords = this.getAdditionalWords(
        maxCount - vowelQuestions.length,
      );
      for (const word of additionalWords) {
        const vowelQuestion = this.createVowelQuestion(word, gameMode, maxMissingVowels);
        if (vowelQuestion && vowelQuestions.length < maxCount) {
          vowelQuestions.push(vowelQuestion);
        }
      }
    }

    return this.shuffleArray(vowelQuestions);
  }

  /**
   * Create a vowel question from a Word object
   */
  private static createVowelQuestion(
    word: Word,
    gameMode: "easy" | "challenge" | "timed",
    maxMissingVowels?: number,
  ): VowelQuestion | null {
    const wordLower = word.word.toLowerCase();
    const vowelPositions = this.findVowelPositions(wordLower);

    if (vowelPositions.length === 0) return null;

    let missingIndex: number[];
    const effectiveMaxMissing = maxMissingVowels || 2;

    switch (gameMode) {
      case "easy":
        // Easy mode: 1 vowel missing, prefer middle vowels
        missingIndex = [this.selectSingleVowel(vowelPositions, wordLower)];
        break;

      case "challenge":
        // Challenge mode: 1-2 vowels missing based on word length
        missingIndex = this.selectMultipleVowels(vowelPositions, wordLower, effectiveMaxMissing);
        break;

      case "timed":
        // Timed mode: Mix of easy and medium difficulty
        missingIndex =
          wordLower.length <= 4
            ? [this.selectSingleVowel(vowelPositions, wordLower)]
            : this.selectMultipleVowels(vowelPositions, wordLower, effectiveMaxMissing);
        break;

      default:
        missingIndex = [this.selectSingleVowel(vowelPositions, wordLower)];
    }

    // Create the display word with missing vowels replaced by underscores
    const wordChars = wordLower.split('');
    const displayWord = wordChars.map((char, index) =>
      missingIndex.includes(index) ? '_' : char
    ).join('');

    // Create correct vowels mapping
    const correctVowels: { [key: number]: string } = {};
    missingIndex.forEach(index => {
      correctVowels[index] = wordChars[index].toUpperCase();
    });

    return {
      word: word.word.toLowerCase(),
      missingIndex,
      image: word.emoji || this.getCategoryEmoji(word.category),
      difficulty: word.difficulty,
      originalWord: word,
      category: word.category,
      emoji: word.emoji,
      // Extended properties for UltimateVowelQuiz compatibility
      displayWord,
      missingVowelIndices: missingIndex,
      correctVowels,
      definition: word.definition || `A ${word.category || 'word'}`,
    };
  }

  /**
   * Find all vowel positions in a word
   */
  private static findVowelPositions(word: string): number[] {
    const positions: number[] = [];
    for (let i = 0; i < word.length; i++) {
      if (this.vowels.includes(word[i])) {
        positions.push(i);
      }
    }
    return positions;
  }

  /**
   * Select a single vowel position (for easy mode)
   */
  private static selectSingleVowel(
    vowelPositions: number[],
    word: string,
  ): number {
    if (vowelPositions.length === 1) return vowelPositions[0];

    // Prefer vowels that are not at the beginning (easier to guess from context)
    const nonFirstVowels = vowelPositions.filter((pos) => pos > 0);
    if (nonFirstVowels.length > 0) {
      return nonFirstVowels[Math.floor(Math.random() * nonFirstVowels.length)];
    }

    return vowelPositions[Math.floor(Math.random() * vowelPositions.length)];
  }

  /**
   * Select multiple vowel positions (for challenge mode)
   */
  private static selectMultipleVowels(
    vowelPositions: number[],
    word: string,
    maxVowels: number,
  ): number[] {
    const numToSelect = Math.min(
      maxVowels,
      Math.max(1, Math.floor(vowelPositions.length * 0.6)), // Select up to 60% of vowels
    );

    if (numToSelect >= vowelPositions.length) {
      return [...vowelPositions];
    }

    // Select vowels spread throughout the word
    const selected: number[] = [];
    const shuffled = this.shuffleArray([...vowelPositions]);

    for (let i = 0; i < numToSelect; i++) {
      selected.push(shuffled[i]);
    }

    return selected.sort((a, b) => a - b); // Sort by position
  }

  /**
   * Get category-appropriate emoji if word doesn't have one
   */
  private static getCategoryEmoji(category: string): string {
    const categoryEmojis: { [key: string]: string } = {
      food: "🍎",
      animals: "🐾",
      colors: "🌈",
      family: "👨‍👩‍👧‍👦",
      body: "👤",
      actions: "🏃",
      objects: "📦",
      nature: "🌿",
      weather: "☀️",
      emotions: "😊",
      home: "🏠",
      school: "🏫",
      transport: "🚗",
      clothes: "👕",
      time: "⏰",
    };

    return categoryEmojis[category] || "📚";
  }

  /**
   * Get additional words if needed to reach target count
   */
  private static getAdditionalWords(count: number): Word[] {
    // Get words suitable for vowel exercises (3-8 letters, contains vowels)
    const suitableWords = wordsDatabase.filter((word) => {
      const wordLength = word.word.length;
      const hasVowels =
        this.findVowelPositions(word.word.toLowerCase()).length > 0;
      return wordLength >= 3 && wordLength <= 8 && hasVowels;
    });

    return this.shuffleArray(suitableWords).slice(0, count);
  }

  /**
   * Shuffle array utility
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get systematic vowel questions using enhanced word selection
   */
  static getSystematicVowelQuestions(
    options: VowelQuizOptions,
  ): VowelQuestion[] {
    try {
      // Use EnhancedWordSelector for more systematic selection
      const wordSession = EnhancedWordSelector.generateWordSession({
        category: options.category || "all",
        difficulty: options.difficulty === "mixed" ? "medium" : options.difficulty,
        sessionSize: options.count,
        userProfile: options.userProfile,
      });

      return this.convertWordsToVowelQuestions(
        wordSession.words,
        options.gameMode || "easy",
        options.count,
        options.maxMissingVowels,
      );
    } catch (error) {
      console.warn(
        "Enhanced word selection failed, falling back to smart selection:",
        error,
      );
      return this.generateVowelQuiz({
        ...options,
        difficulty: options.difficulty === "mixed" ? "medium" : options.difficulty,
      });
    }
  }

  /**
   * Track vowel quiz completion for learning progress
   */
  static trackVowelQuizCompletion(
    questions: VowelQuestion[],
    correctAnswers: number,
    totalAttempts: number,
    userProfile?: any,
  ): void {
    try {
      // Track word exposure and performance
      const wordIds = questions
        .map((q) => q.originalWord?.id)
        .filter((id) => id !== undefined);

      // This would integrate with the existing progress tracking system
      console.log("Vowel Quiz Completion:", {
        wordIds,
        correctAnswers,
        totalAttempts,
        accuracy: correctAnswers / questions.length,
        userId: userProfile?.id,
      });

      // In a real implementation, this would update the user's learning progress
      // similar to how other quiz completions are tracked
    } catch (error) {
      console.warn("Failed to track vowel quiz completion:", error);
    }
  }
}

// Export convenient functions for different game modes
export const getSystematicEasyVowelQuestions = (
  count: number = 10,
  category?: string,
  userProfile?: any,
): VowelQuestion[] => {
  return VowelQuizGenerator.getSystematicVowelQuestions({
    count,
    category,
    difficulty: "easy",
    gameMode: "easy",
    userProfile,
  });
};

export const getSystematicMediumVowelQuestions = (
  count: number = 8,
  category?: string,
  userProfile?: any,
): VowelQuestion[] => {
  return VowelQuizGenerator.getSystematicVowelQuestions({
    count,
    category,
    difficulty: "medium",
    gameMode: "challenge",
    userProfile,
  });
};

export const getSystematicTimedVowelQuestions = (
  category?: string,
  userProfile?: any,
): VowelQuestion[] => {
  return VowelQuizGenerator.getSystematicVowelQuestions({
    count: 30, // More questions for timed mode
    category,
    gameMode: "timed",
    userProfile,
  });
};

export const getSystematicMixedVowelQuestions = (
  count: number = 12,
  category?: string,
  userProfile?: any,
): VowelQuestion[] => {
  return VowelQuizGenerator.getSystematicVowelQuestions({
    count,
    category,
    gameMode: "challenge",
    userProfile,
  });
};
