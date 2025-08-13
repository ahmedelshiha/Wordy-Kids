import { Word, wordsDatabase, getAllCategories } from "@/data/wordsDatabase";

export interface DashboardWordSession {
  words: Word[];
  sessionInfo: {
    difficulty: "easy" | "medium" | "hard";
    categoriesUsed: string[];
    sessionNumber: number;
    progressionStage:
      | "easy_focus"
      | "mixed_easy_medium"
      | "mixed_medium_hard"
      | "all_difficulties";
    totalWordsGenerated: number;
  };
}

export interface UserProgress {
  wordsCompleted: number;
  currentDifficulty: "easy" | "medium" | "hard";
  rememberedWords: Set<number>;
  forgottenWords: Set<number>;
  categoryProgress: Map<string, number>;
}

export class DashboardWordGenerator {
  private static readonly WORDS_PER_SESSION = 20;
  private static readonly EASY_THRESHOLD = 50; // Complete 50 easy words before moving to mixed
  private static readonly MEDIUM_THRESHOLD = 100; // Complete 100 total words before introducing hard

  /**
   * Generate a systematic word session for the dashboard
   * Progression: Easy → Easy+Medium → Medium+Hard → All Difficulties
   */
  static generateDashboardSession(
    userProgress: UserProgress,
    sessionNumber: number = 1,
  ): DashboardWordSession {
    const { wordsCompleted, rememberedWords, forgottenWords } = userProgress;

    // Determine progression stage based on user progress
    const progressionStage = this.determineProgressionStage(wordsCompleted);

    // Get all available categories
    const allCategories = getAllCategories().filter((cat) => cat !== "all");

    // Generate words based on progression stage
    let selectedWords: Word[] = [];
    let targetDifficulty: "easy" | "medium" | "hard" = "easy";
    let categoriesUsed: string[] = [];

    switch (progressionStage) {
      case "easy_focus":
        // 100% easy words from random categories
        selectedWords = this.selectWordsByDifficulty(
          ["easy"],
          allCategories,
          rememberedWords,
          forgottenWords,
        );
        targetDifficulty = "easy";
        break;

      case "mixed_easy_medium":
        // 70% easy, 30% medium words
        const easyWords = this.selectWordsByDifficulty(
          ["easy"],
          allCategories,
          rememberedWords,
          forgottenWords,
          Math.floor(this.WORDS_PER_SESSION * 0.7),
        );
        const mediumWords = this.selectWordsByDifficulty(
          ["medium"],
          allCategories,
          rememberedWords,
          forgottenWords,
          Math.floor(this.WORDS_PER_SESSION * 0.3),
        );
        selectedWords = [...easyWords, ...mediumWords];
        targetDifficulty = "medium";
        break;

      case "mixed_medium_hard":
        // 50% medium, 50% hard words
        const medWords = this.selectWordsByDifficulty(
          ["medium"],
          allCategories,
          rememberedWords,
          forgottenWords,
          Math.floor(this.WORDS_PER_SESSION * 0.5),
        );
        const hardWords = this.selectWordsByDifficulty(
          ["hard"],
          allCategories,
          rememberedWords,
          forgottenWords,
          Math.floor(this.WORDS_PER_SESSION * 0.5),
        );
        selectedWords = [...medWords, ...hardWords];
        targetDifficulty = "hard";
        break;

      case "all_difficulties":
        // 30% easy, 40% medium, 30% hard
        const allEasy = this.selectWordsByDifficulty(
          ["easy"],
          allCategories,
          rememberedWords,
          forgottenWords,
          Math.floor(this.WORDS_PER_SESSION * 0.3),
        );
        const allMedium = this.selectWordsByDifficulty(
          ["medium"],
          allCategories,
          rememberedWords,
          forgottenWords,
          Math.floor(this.WORDS_PER_SESSION * 0.4),
        );
        const allHard = this.selectWordsByDifficulty(
          ["hard"],
          allCategories,
          rememberedWords,
          forgottenWords,
          Math.floor(this.WORDS_PER_SESSION * 0.3),
        );
        selectedWords = [...allEasy, ...allMedium, ...allHard];
        targetDifficulty = "medium";
        break;
    }

    // Shuffle the selected words to mix difficulties
    selectedWords = this.shuffleArray([...selectedWords]);

    // Ensure we have enough words
    if (selectedWords.length < this.WORDS_PER_SESSION) {
      const additionalWords = this.fillRemainingSlots(
        selectedWords,
        this.WORDS_PER_SESSION - selectedWords.length,
        allCategories,
        rememberedWords,
        forgottenWords,
      );
      selectedWords = [...selectedWords, ...additionalWords];
    }

    // Limit to session size
    selectedWords = selectedWords.slice(0, this.WORDS_PER_SESSION);

    // Get categories used
    categoriesUsed = [...new Set(selectedWords.map((word) => word.category))];

    return {
      words: selectedWords,
      sessionInfo: {
        difficulty: targetDifficulty,
        categoriesUsed,
        sessionNumber,
        progressionStage,
        totalWordsGenerated: selectedWords.length,
      },
    };
  }

  /**
   * Determine the progression stage based on user's completed words
   */
  private static determineProgressionStage(
    wordsCompleted: number,
  ):
    | "easy_focus"
    | "mixed_easy_medium"
    | "mixed_medium_hard"
    | "all_difficulties" {
    if (wordsCompleted < this.EASY_THRESHOLD) {
      return "easy_focus";
    } else if (wordsCompleted < this.MEDIUM_THRESHOLD) {
      return "mixed_easy_medium";
    } else if (wordsCompleted < this.MEDIUM_THRESHOLD + 50) {
      return "mixed_medium_hard";
    } else {
      return "all_difficulties";
    }
  }

  /**
   * Select words by specific difficulties from random categories
   */
  private static selectWordsByDifficulty(
    difficulties: ("easy" | "medium" | "hard")[],
    categories: string[],
    rememberedWords: Set<number>,
    forgottenWords: Set<number>,
    maxWords: number = this.WORDS_PER_SESSION,
  ): Word[] {
    // Get words matching the difficulties
    const candidateWords = wordsDatabase.filter(
      (word) =>
        difficulties.includes(word.difficulty) && !rememberedWords.has(word.id), // Exclude already remembered words
    );

    // Prioritize forgotten words for review
    const forgottenCandidates = candidateWords.filter((word) =>
      forgottenWords.has(word.id),
    );

    const newCandidates = candidateWords.filter(
      (word) => !forgottenWords.has(word.id),
    );

    // Select words: 30% forgotten (for review), 70% new
    const forgottenCount = Math.floor(maxWords * 0.3);
    const newCount = maxWords - forgottenCount;

    const selectedForgotten = this.shuffleArray(forgottenCandidates).slice(
      0,
      forgottenCount,
    );
    const selectedNew = this.shuffleArray(newCandidates).slice(0, newCount);

    return [...selectedForgotten, ...selectedNew];
  }

  /**
   * Fill remaining slots with any available words
   */
  private static fillRemainingSlots(
    existingWords: Word[],
    slotsNeeded: number,
    categories: string[],
    rememberedWords: Set<number>,
    forgottenWords: Set<number>,
  ): Word[] {
    const existingIds = new Set(existingWords.map((word) => word.id));

    const availableWords = wordsDatabase.filter(
      (word) => !existingIds.has(word.id) && !rememberedWords.has(word.id),
    );

    return this.shuffleArray(availableWords).slice(0, slotsNeeded);
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
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
   * Get progression info for display purposes
   */
  static getProgressionInfo(wordsCompleted: number): {
    stage: string;
    description: string;
    nextMilestone: number;
    progress: number;
  } {
    const stage = this.determineProgressionStage(wordsCompleted);

    switch (stage) {
      case "easy_focus":
        return {
          stage: "Foundation Building",
          description: "Mastering easy words from all categories",
          nextMilestone: this.EASY_THRESHOLD,
          progress: (wordsCompleted / this.EASY_THRESHOLD) * 100,
        };

      case "mixed_easy_medium":
        return {
          stage: "Skill Development",
          description: "Mixing easy and medium difficulty words",
          nextMilestone: this.MEDIUM_THRESHOLD,
          progress:
            ((wordsCompleted - this.EASY_THRESHOLD) /
              (this.MEDIUM_THRESHOLD - this.EASY_THRESHOLD)) *
            100,
        };

      case "mixed_medium_hard":
        return {
          stage: "Challenge Mode",
          description: "Tackling medium and hard words",
          nextMilestone: this.MEDIUM_THRESHOLD + 50,
          progress: ((wordsCompleted - this.MEDIUM_THRESHOLD) / 50) * 100,
        };

      case "all_difficulties":
        return {
          stage: "Master Level",
          description: "Balanced mix of all difficulty levels",
          nextMilestone: wordsCompleted + 100,
          progress: 100,
        };

      default:
        return {
          stage: "Getting Started",
          description: "Beginning your vocabulary journey",
          nextMilestone: this.EASY_THRESHOLD,
          progress: 0,
        };
    }
  }
}
