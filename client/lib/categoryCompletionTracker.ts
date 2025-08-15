interface CategoryProgress {
  categoryId: string;
  totalWords: number;
  reviewedWords: Set<number>;
  completedWords: Set<number>;
  lastReviewed: Date;
  accuracy: number;
  timeSpent: number; // in minutes
}

interface CategoryCompletionStats {
  wordsReviewed: number;
  totalWords: number;
  accuracy: number;
  timeSpent: number;
  isCompleted: boolean;
  completionDate?: Date;
}

export class CategoryCompletionTracker {
  private static STORAGE_KEY = "categoryProgress";
  private static currentSession: CategoryProgress | null = null;
  private static completionCallbacks: Array<
    (stats: CategoryCompletionStats) => void
  > = [];

  /**
   * Start tracking a category session
   */
  static startCategorySession(categoryId: string, totalWords: number): void {
    const existing = this.getCategoryProgress(categoryId);

    this.currentSession = {
      categoryId,
      totalWords,
      reviewedWords: existing?.reviewedWords || new Set(),
      completedWords: existing?.completedWords || new Set(),
      lastReviewed: new Date(),
      accuracy: existing?.accuracy || 0,
      timeSpent: existing?.timeSpent || 0,
    };
  }

  /**
   * Track a word being reviewed/completed
   */
  static trackWordReview(wordId: number, wasCorrect: boolean = true): void {
    if (!this.currentSession) return;

    this.currentSession.reviewedWords.add(wordId);

    if (wasCorrect) {
      this.currentSession.completedWords.add(wordId);
    }

    this.currentSession.lastReviewed = new Date();

    // Update accuracy
    const totalReviewed = this.currentSession.reviewedWords.size;
    const totalCorrect = this.currentSession.completedWords.size;
    this.currentSession.accuracy =
      totalReviewed > 0 ? (totalCorrect / totalReviewed) * 100 : 0;

    // Save progress
    this.saveCategoryProgress();

    // Check if category is completed
    if (this.isCategoryCompleted()) {
      this.handleCategoryCompletion();
    }
  }

  /**
   * Track time spent in category
   */
  static trackTimeSpent(minutes: number): void {
    if (!this.currentSession) return;

    this.currentSession.timeSpent += minutes;
    this.saveCategoryProgress();
  }

  /**
   * Check if current category is completed
   */
  static isCategoryCompleted(): boolean {
    if (!this.currentSession) return false;

    const reviewedCount = this.currentSession.reviewedWords.size;
    const totalWords = this.currentSession.totalWords;

    return reviewedCount >= totalWords;
  }

  /**
   * Get completion stats for current session
   */
  static getCurrentCategoryStats(): CategoryCompletionStats | null {
    if (!this.currentSession) return null;

    return {
      wordsReviewed: this.currentSession.reviewedWords.size,
      totalWords: this.currentSession.totalWords,
      accuracy: this.currentSession.accuracy,
      timeSpent: this.currentSession.timeSpent,
      isCompleted: this.isCategoryCompleted(),
      completionDate: this.isCategoryCompleted() ? new Date() : undefined,
    };
  }

  /**
   * Check if a specific word has been reviewed in current session
   */
  static isWordReviewed(wordId: number): boolean {
    return this.currentSession?.reviewedWords.has(wordId) || false;
  }

  /**
   * Check if a specific word has been completed correctly in current session
   */
  static isWordCompleted(wordId: number): boolean {
    return this.currentSession?.completedWords.has(wordId) || false;
  }

  /**
   * Get progress percentage for current category
   */
  static getCategoryProgress(): number {
    if (!this.currentSession) return 0;

    const reviewed = this.currentSession.reviewedWords.size;
    const total = this.currentSession.totalWords;

    return total > 0 ? (reviewed / total) * 100 : 0;
  }

  /**
   * Register callback for category completion
   */
  static onCategoryCompletion(
    callback: (stats: CategoryCompletionStats) => void,
  ): void {
    this.completionCallbacks.push(callback);
  }

  /**
   * Remove completion callback
   */
  static removeCompletionCallback(
    callback: (stats: CategoryCompletionStats) => void,
  ): void {
    const index = this.completionCallbacks.indexOf(callback);
    if (index > -1) {
      this.completionCallbacks.splice(index, 1);
    }
  }

  /**
   * Handle category completion
   */
  private static handleCategoryCompletion(): void {
    const stats = this.getCurrentCategoryStats();
    if (!stats) return;

    // Mark completion date
    stats.completionDate = new Date();

    // Save completion to storage
    this.saveCompletionRecord(stats);

    // Notify all callbacks
    this.completionCallbacks.forEach((callback) => {
      try {
        callback(stats);
      } catch (error) {
        console.error("Error in category completion callback:", error);
      }
    });
  }

  /**
   * Reset current category session
   */
  static resetCurrentSession(): void {
    this.currentSession = null;
  }

  /**
   * Exit current category session (cleanup)
   */
  static exitCategorySession(): void {
    if (this.currentSession) {
      this.saveCategoryProgress();
      this.currentSession = null;
    }
  }

  /**
   * Check if category switching should be prevented
   */
  static shouldPreventCategorySwitch(): boolean {
    if (!this.currentSession) return false;

    // Prevent switching if category has been started but not completed
    const hasStarted = this.currentSession.reviewedWords.size > 0;
    const isCompleted = this.isCategoryCompleted();

    return hasStarted && !isCompleted;
  }

  /**
   * Get category that should be locked/continued
   */
  static getLockedCategory(): string | null {
    return this.shouldPreventCategorySwitch()
      ? this.currentSession?.categoryId || null
      : null;
  }

  /**
   * Force unlock category (when user explicitly chooses to leave)
   */
  static forceUnlockCategory(): void {
    if (this.currentSession) {
      this.saveCategoryProgress();
      this.resetCurrentSession();
    }
  }

  /**
   * Save category progress to localStorage
   */
  private static saveCategoryProgress(): void {
    if (!this.currentSession) return;

    try {
      const allProgress = this.getAllCategoryProgress();
      allProgress[this.currentSession.categoryId] = {
        ...this.currentSession,
        reviewedWords: Array.from(this.currentSession.reviewedWords),
        completedWords: Array.from(this.currentSession.completedWords),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error("Failed to save category progress:", error);
    }
  }

  /**
   * Get category progress from localStorage
   */
  private static getCategoryProgress(
    categoryId: string,
  ): CategoryProgress | null {
    try {
      const allProgress = this.getAllCategoryProgress();
      const saved = allProgress[categoryId];

      if (saved) {
        return {
          ...saved,
          reviewedWords: new Set(saved.reviewedWords),
          completedWords: new Set(saved.completedWords),
          lastReviewed: new Date(saved.lastReviewed),
        };
      }
    } catch (error) {
      console.error("Failed to load category progress:", error);
    }

    return null;
  }

  /**
   * Get all category progress from localStorage
   */
  private static getAllCategoryProgress(): Record<string, any> {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Failed to load all category progress:", error);
      return {};
    }
  }

  /**
   * Save completion record
   */
  private static saveCompletionRecord(stats: CategoryCompletionStats): void {
    if (!this.currentSession) return;

    try {
      const completions = this.getCompletionHistory();
      const record = {
        categoryId: this.currentSession.categoryId,
        completionDate: stats.completionDate,
        ...stats,
      };

      completions.push(record);
      localStorage.setItem("categoryCompletions", JSON.stringify(completions));
    } catch (error) {
      console.error("Failed to save completion record:", error);
    }
  }

  /**
   * Get completion history
   */
  static getCompletionHistory(): any[] {
    try {
      const saved = localStorage.getItem("categoryCompletions");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to load completion history:", error);
      return [];
    }
  }

  /**
   * Check if category has been completed before
   */
  static hasCategoryBeenCompleted(categoryId: string): boolean {
    const history = this.getCompletionHistory();
    return history.some((record: any) => record.categoryId === categoryId);
  }

  /**
   * Get completion count for category
   */
  static getCategoryCompletionCount(categoryId: string): number {
    const history = this.getCompletionHistory();
    return history.filter((record: any) => record.categoryId === categoryId)
      .length;
  }

  /**
   * Reset all progress (for testing)
   */
  static resetAllProgress(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem("categoryCompletions");
    this.currentSession = null;
  }
}
