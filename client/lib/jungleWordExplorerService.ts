import {
  UserProgress,
  Achievement,
  WordSession,
  LearningGoal,
  Word,
  DEFAULT_PREFERENCES,
  ACHIEVEMENTS,
  LEARNING_GOAL_TEMPLATES,
  calculateLevel,
  calculateXP,
  calculateProgress,
} from "./jungleWordExplorerTypes";

/**
 * Comprehensive service for managing the Jungle Word Explorer
 * Handles user progress, achievements, sessions, and goals
 */
export class JungleWordExplorerService {
  private storageKey = "jungleWordExplorer";
  private progressKey = "jungleProgress";
  private achievementsKey = "jungleAchievements";
  private sessionsKey = "jungleSessions";
  private goalsKey = "jungleGoals";

  // Initialize service
  constructor() {
    this.initializeUserData();
  }

  // Initialize user data if not exists
  private initializeUserData(): void {
    try {
      if (!localStorage.getItem(this.progressKey)) {
        const defaultProgress: UserProgress = {
          totalWordsLearned: 0,
          currentStreak: 0,
          longestStreak: 0,
          gems: 0,
          level: 1,
          xp: 0,
          badges: [],
          achievements: [...ACHIEVEMENTS],
          preferences: { ...DEFAULT_PREFERENCES },
          stats: {
            totalTimeSpent: 0,
            averageAccuracy: 0,
            wordsPerSession: 0,
            favoriteDifficulty: "easy",
            favoriteCategory: "animals",
            strongAreas: [],
            improvementAreas: [],
            dailyGoal: 5,
            weeklyProgress: 0,
          },
        };
        this.saveUserProgress(defaultProgress);
      }

      if (!localStorage.getItem(this.goalsKey)) {
        const defaultGoals = LEARNING_GOAL_TEMPLATES.map((template, index) => ({
          ...template,
          id: `goal_${index}`,
          current: 0,
          completed: false,
        }));
        this.saveLearningGoals(defaultGoals);
      }
    } catch (error) {
      console.error("Error initializing user data:", error);
    }
  }

  // User Progress Management
  getUserProgress(): UserProgress {
    try {
      const saved = localStorage.getItem(this.progressKey);
      if (saved) {
        const progress = JSON.parse(saved);
        // Ensure achievements array exists and is up to date
        if (!progress.achievements) {
          progress.achievements = [...ACHIEVEMENTS];
        }
        return progress;
      }
    } catch (error) {
      console.error("Error loading user progress:", error);
    }
    
    // Return default if error or not found
    return {
      totalWordsLearned: 0,
      currentStreak: 0,
      longestStreak: 0,
      gems: 0,
      level: 1,
      xp: 0,
      badges: [],
      achievements: [...ACHIEVEMENTS],
      preferences: { ...DEFAULT_PREFERENCES },
      stats: {
        totalTimeSpent: 0,
        averageAccuracy: 0,
        wordsPerSession: 0,
        favoriteDifficulty: "easy",
        favoriteCategory: "animals",
        strongAreas: [],
        improvementAreas: [],
        dailyGoal: 5,
        weeklyProgress: 0,
      },
    };
  }

  saveUserProgress(progress: UserProgress): void {
    try {
      localStorage.setItem(this.progressKey, JSON.stringify(progress));
    } catch (error) {
      console.error("Error saving user progress:", error);
    }
  }

  // Word mastery tracking
  masterWord(wordId: number, word: Word): { newMastery: boolean; achievements: Achievement[] } {
    const progress = this.getUserProgress();
    const masteredWords = this.getMasteredWords();
    
    if (masteredWords.has(wordId)) {
      return { newMastery: false, achievements: [] };
    }

    // Add to mastered words
    masteredWords.add(wordId);
    this.saveMasteredWords(masteredWords);

    // Update progress
    progress.totalWordsLearned += 1;
    progress.gems += 1;
    progress.xp = calculateXP(progress.totalWordsLearned);
    progress.level = calculateLevel(progress.totalWordsLearned);

    // Update category stats
    this.updateCategoryStats(word.category, true);
    
    // Update daily/weekly progress
    this.updateDailyProgress();
    
    this.saveUserProgress(progress);

    // Check for new achievements
    const newAchievements = this.checkAchievements(progress);

    return { newMastery: true, achievements: newAchievements };
  }

  unMasterWord(wordId: number): void {
    const progress = this.getUserProgress();
    const masteredWords = this.getMasteredWords();
    
    if (!masteredWords.has(wordId)) return;

    masteredWords.delete(wordId);
    this.saveMasteredWords(masteredWords);

    // Update progress
    progress.totalWordsLearned = Math.max(0, progress.totalWordsLearned - 1);
    progress.gems = Math.max(0, progress.gems - 1);
    progress.xp = calculateXP(progress.totalWordsLearned);
    progress.level = calculateLevel(progress.totalWordsLearned);

    this.saveUserProgress(progress);
  }

  // Favorites management
  getMasteredWords(): Set<number> {
    try {
      const saved = localStorage.getItem("masteredWords");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      console.error("Error loading mastered words:", error);
      return new Set();
    }
  }

  saveMasteredWords(masteredWords: Set<number>): void {
    try {
      localStorage.setItem("masteredWords", JSON.stringify(Array.from(masteredWords)));
    } catch (error) {
      console.error("Error saving mastered words:", error);
    }
  }

  getFavoriteWords(): Set<number> {
    try {
      const saved = localStorage.getItem("favoriteWords");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      console.error("Error loading favorite words:", error);
      return new Set();
    }
  }

  saveFavoriteWords(favoriteWords: Set<number>): void {
    try {
      localStorage.setItem("favoriteWords", JSON.stringify(Array.from(favoriteWords)));
    } catch (error) {
      console.error("Error saving favorite words:", error);
    }
  }

  toggleFavorite(wordId: number): boolean {
    const favorites = this.getFavoriteWords();
    const isFavorite = favorites.has(wordId);
    
    if (isFavorite) {
      favorites.delete(wordId);
    } else {
      favorites.add(wordId);
    }
    
    this.saveFavoriteWords(favorites);
    return !isFavorite;
  }

  // Session management
  startSession(category: string, sessionType: "exploration" | "review" | "challenge" | "quiz" = "exploration"): string {
    const sessionId = `session_${Date.now()}`;
    const session: WordSession = {
      id: sessionId,
      startTime: new Date(),
      category,
      wordsReviewed: 0,
      wordsLearned: 0,
      accuracy: 0,
      timeSpent: 0,
      achievements: [],
      difficulty: "easy",
      sessionType,
    };

    this.saveCurrentSession(session);
    return sessionId;
  }

  endSession(sessionId: string): WordSession | null {
    const session = this.getCurrentSession();
    if (!session || session.id !== sessionId) return null;

    session.endTime = new Date();
    session.timeSpent = session.endTime.getTime() - session.startTime.getTime();
    
    // Save to history
    this.saveSessionToHistory(session);
    this.clearCurrentSession();

    // Update user stats
    this.updateStatsFromSession(session);

    return session;
  }

  getCurrentSession(): WordSession | null {
    try {
      const saved = localStorage.getItem("currentSession");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error loading current session:", error);
      return null;
    }
  }

  private saveCurrentSession(session: WordSession): void {
    try {
      localStorage.setItem("currentSession", JSON.stringify(session));
    } catch (error) {
      console.error("Error saving current session:", error);
    }
  }

  private clearCurrentSession(): void {
    try {
      localStorage.removeItem("currentSession");
    } catch (error) {
      console.error("Error clearing current session:", error);
    }
  }

  private saveSessionToHistory(session: WordSession): void {
    try {
      const historyKey = "sessionHistory";
      const existing = localStorage.getItem(historyKey);
      const history = existing ? JSON.parse(existing) : [];
      
      history.push(session);
      
      // Keep only last 50 sessions
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }
      
      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error("Error saving session to history:", error);
    }
  }

  // Achievement system
  checkAchievements(progress: UserProgress): Achievement[] {
    const newAchievements: Achievement[] = [];
    
    progress.achievements.forEach((achievement) => {
      if (achievement.unlocked) return;

      let shouldUnlock = false;
      let currentProgress = 0;

      switch (achievement.id) {
        case "first-word":
          currentProgress = progress.totalWordsLearned;
          shouldUnlock = progress.totalWordsLearned >= 1;
          break;
        case "word-collector":
          currentProgress = progress.totalWordsLearned;
          shouldUnlock = progress.totalWordsLearned >= 10;
          break;
        case "word-master":
          currentProgress = progress.totalWordsLearned;
          shouldUnlock = progress.totalWordsLearned >= 25;
          break;
        case "vocabulary-hero":
          currentProgress = progress.totalWordsLearned;
          shouldUnlock = progress.totalWordsLearned >= 50;
          break;
        case "streak-starter":
          currentProgress = progress.currentStreak;
          shouldUnlock = progress.currentStreak >= 3;
          break;
        case "streak-master":
          currentProgress = progress.currentStreak;
          shouldUnlock = progress.currentStreak >= 7;
          break;
        case "jungle-explorer":
          const exploredCategories = this.getExploredCategories();
          currentProgress = exploredCategories.length;
          shouldUnlock = exploredCategories.length >= 5;
          break;
      }

      achievement.progress = currentProgress;

      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        newAchievements.push(achievement);
        
        // Award gems for achievement
        progress.gems += achievement.rarity === "common" ? 1 : 
                       achievement.rarity === "rare" ? 2 : 
                       achievement.rarity === "epic" ? 3 : 5;
      }
    });

    if (newAchievements.length > 0) {
      this.saveUserProgress(progress);
    }

    return newAchievements;
  }

  // Learning goals
  getLearningGoals(): LearningGoal[] {
    try {
      const saved = localStorage.getItem(this.goalsKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading learning goals:", error);
      return [];
    }
  }

  saveLearningGoals(goals: LearningGoal[]): void {
    try {
      localStorage.setItem(this.goalsKey, JSON.stringify(goals));
    } catch (error) {
      console.error("Error saving learning goals:", error);
    }
  }

  updateGoalProgress(goalId: string, progress: number): void {
    const goals = this.getLearningGoals();
    const goal = goals.find(g => g.id === goalId);
    
    if (goal) {
      goal.current = Math.min(progress, goal.target);
      goal.completed = goal.current >= goal.target;
      this.saveLearningGoals(goals);
    }
  }

  // Statistics and analytics
  private updateCategoryStats(category: string, mastered: boolean): void {
    try {
      const statsKey = "categoryStats";
      const existing = localStorage.getItem(statsKey);
      const stats = existing ? JSON.parse(existing) : {};
      
      if (!stats[category]) {
        stats[category] = { total: 0, mastered: 0 };
      }
      
      stats[category].total += 1;
      if (mastered) {
        stats[category].mastered += 1;
      }
      
      localStorage.setItem(statsKey, JSON.stringify(stats));
    } catch (error) {
      console.error("Error updating category stats:", error);
    }
  }

  private updateDailyProgress(): void {
    try {
      const today = new Date().toDateString();
      const dailyKey = `dailyProgress_${today}`;
      const existing = localStorage.getItem(dailyKey);
      const progress = existing ? JSON.parse(existing) : { wordsLearned: 0, timeSpent: 0 };
      
      progress.wordsLearned += 1;
      localStorage.setItem(dailyKey, JSON.stringify(progress));
      
      // Update goals
      const goals = this.getLearningGoals();
      const dailyWordGoal = goals.find(g => g.type === "daily" && g.metric === "words");
      if (dailyWordGoal) {
        this.updateGoalProgress(dailyWordGoal.id, progress.wordsLearned);
      }
    } catch (error) {
      console.error("Error updating daily progress:", error);
    }
  }

  private updateStatsFromSession(session: WordSession): void {
    const progress = this.getUserProgress();
    
    // Update total time spent
    progress.stats.totalTimeSpent += session.timeSpent / (1000 * 60); // Convert to minutes
    
    // Update accuracy
    if (session.accuracy > 0) {
      progress.stats.averageAccuracy = 
        (progress.stats.averageAccuracy + session.accuracy) / 2;
    }
    
    // Update words per session
    progress.stats.wordsPerSession = 
      (progress.stats.wordsPerSession + session.wordsReviewed) / 2;

    this.saveUserProgress(progress);
  }

  private getExploredCategories(): string[] {
    try {
      const statsKey = "categoryStats";
      const existing = localStorage.getItem(statsKey);
      const stats = existing ? JSON.parse(existing) : {};
      return Object.keys(stats);
    } catch (error) {
      console.error("Error getting explored categories:", error);
      return [];
    }
  }

  // Utility methods
  getCategoryProgress(categoryId: string): { total: number; mastered: number; percentage: number } {
    try {
      const statsKey = "categoryStats";
      const existing = localStorage.getItem(statsKey);
      const stats = existing ? JSON.parse(existing) : {};
      const categoryStats = stats[categoryId] || { total: 0, mastered: 0 };
      
      return {
        total: categoryStats.total,
        mastered: categoryStats.mastered,
        percentage: categoryStats.total > 0 ? 
          Math.round((categoryStats.mastered / categoryStats.total) * 100) : 0,
      };
    } catch (error) {
      console.error("Error getting category progress:", error);
      return { total: 0, mastered: 0, percentage: 0 };
    }
  }

  exportUserData(): string {
    try {
      const data = {
        progress: this.getUserProgress(),
        masteredWords: Array.from(this.getMasteredWords()),
        favoriteWords: Array.from(this.getFavoriteWords()),
        goals: this.getLearningGoals(),
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Error exporting user data:", error);
      return "{}";
    }
  }

  importUserData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.progress) {
        this.saveUserProgress(data.progress);
      }
      if (data.masteredWords) {
        this.saveMasteredWords(new Set(data.masteredWords));
      }
      if (data.favoriteWords) {
        this.saveFavoriteWords(new Set(data.favoriteWords));
      }
      if (data.goals) {
        this.saveLearningGoals(data.goals);
      }
      
      return true;
    } catch (error) {
      console.error("Error importing user data:", error);
      return false;
    }
  }

  // Reset user data (for testing or fresh start)
  resetUserData(): void {
    try {
      localStorage.removeItem(this.progressKey);
      localStorage.removeItem("masteredWords");
      localStorage.removeItem("favoriteWords");
      localStorage.removeItem(this.goalsKey);
      localStorage.removeItem("categoryStats");
      localStorage.removeItem("currentSession");
      localStorage.removeItem("sessionHistory");
      this.initializeUserData();
    } catch (error) {
      console.error("Error resetting user data:", error);
    }
  }
}

// Create singleton instance
export const jungleWordExplorerService = new JungleWordExplorerService();
