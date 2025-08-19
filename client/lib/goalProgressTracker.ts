// Local interface definitions (copied from ParentDashboard)
interface LearningGoal {
  id: string;
  type: "daily" | "weekly" | "monthly";
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: string;
  reward: string;
  isActive: boolean;
  completedAt?: Date;
  createdAt: Date;
}

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  totalWords: number;
  streak: number;
  lastActive: Date;
  learningGoals: LearningGoal[];
}

export interface ProgressUpdate {
  type:
    | "word_learned"
    | "session_completed"
    | "category_mastered"
    | "streak_achieved";
  value: number;
  category?: string;
  childId: string;
  timestamp: Date;
}

export interface SystematicProgressData {
  totalWordsLearned: number;
  wordsLearnedToday: number;
  wordsLearnedThisWeek: number;
  wordsLearnedThisMonth: number;
  currentStreak: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  categoriesProgress: Record<string, number>;
  lastUpdated: Date;
}

class GoalProgressTracker {
  private static instance: GoalProgressTracker;
  private progressCache: Map<string, SystematicProgressData> = new Map();

  static getInstance(): GoalProgressTracker {
    if (!GoalProgressTracker.instance) {
      GoalProgressTracker.instance = new GoalProgressTracker();
    }
    return GoalProgressTracker.instance;
  }

  /**
   * Systematically fetch all progress data for a child
   */
  async fetchSystematicProgress(
    childId: string,
  ): Promise<SystematicProgressData> {
    try {
      // Check cache first
      const cached = this.progressCache.get(childId);
      if (cached && this.isCacheValid(cached.lastUpdated)) {
        return cached;
      }

      // Fetch from multiple sources
      const [
        overallProgress,
        dailyProgress,
        weeklyProgress,
        monthlyProgress,
        streakData,
        sessionData,
        categoryData,
      ] = await Promise.all([
        this.fetchOverallProgress(childId),
        this.fetchDailyProgress(childId),
        this.fetchWeeklyProgress(childId),
        this.fetchMonthlyProgress(childId),
        this.fetchStreakProgress(childId),
        this.fetchSessionProgress(childId),
        this.fetchCategoryProgress(childId),
      ]);

      const systematicData: SystematicProgressData = {
        totalWordsLearned: overallProgress.totalWords,
        wordsLearnedToday: dailyProgress.words,
        wordsLearnedThisWeek: weeklyProgress.words,
        wordsLearnedThisMonth: monthlyProgress.words,
        currentStreak: streakData.currentStreak,
        sessionsToday: sessionData.todaySessions,
        sessionsThisWeek: sessionData.weekSessions,
        categoriesProgress: categoryData,
        lastUpdated: new Date(),
      };

      // Cache the result
      this.progressCache.set(childId, systematicData);

      // Save to localStorage for persistence
      this.saveProgressToStorage(childId, systematicData);

      return systematicData;
    } catch (error) {
      console.error("Error fetching systematic progress:", error);
      // Fallback to localStorage or default values
      return this.getProgressFromStorage(childId) || this.getDefaultProgress();
    }
  }

  /**
   * Update goal progress based on learning activity
   */
  async updateGoalProgress(
    childId: string,
    goals: LearningGoal[],
    progressUpdate: ProgressUpdate,
  ): Promise<LearningGoal[]> {
    try {
      const currentProgress = await this.fetchSystematicProgress(childId);
      const updatedGoals = [...goals];

      for (let i = 0; i < updatedGoals.length; i++) {
        const goal = updatedGoals[i];
        if (!goal.isActive) continue;

        let shouldUpdate = false;
        let incrementValue = 0;

        switch (goal.type) {
          case "daily":
            if (this.isToday(goal.createdAt || new Date())) {
              shouldUpdate = this.shouldUpdateForDaily(goal, progressUpdate);
              incrementValue = this.getIncrementValue(goal, progressUpdate);
            }
            break;

          case "weekly":
            if (this.isThisWeek(goal.createdAt || new Date())) {
              shouldUpdate = this.shouldUpdateForWeekly(goal, progressUpdate);
              incrementValue = this.getIncrementValue(goal, progressUpdate);
            }
            break;

          case "monthly":
            if (this.isThisMonth(goal.createdAt || new Date())) {
              shouldUpdate = this.shouldUpdateForMonthly(goal, progressUpdate);
              incrementValue = this.getIncrementValue(goal, progressUpdate);
            }
            break;
        }

        if (shouldUpdate && incrementValue > 0) {
          updatedGoals[i] = {
            ...goal,
            current: Math.min(goal.current + incrementValue, goal.target),
            lastUpdated: new Date(),
            // Update streak if goal completed
            streak:
              goal.current + incrementValue >= goal.target
                ? goal.streak + 1
                : goal.streak,
          };

          // Trigger goal completion celebration if target reached
          if (
            updatedGoals[i].current >= goal.target &&
            goal.current < goal.target
          ) {
            this.triggerGoalCompletion(goal, childId);
          }
        }
      }

      // Invalidate cache to force refresh
      this.progressCache.delete(childId);

      return updatedGoals;
    } catch (error) {
      console.error("Error updating goal progress:", error);
      return goals;
    }
  }

  /**
   * Get real-time progress updates for dashboard
   */
  async getRealtimeProgress(childId: string): Promise<{
    wordsLearned: number;
    sessionsCompleted: number;
    currentStreak: number;
    weeklyProgress: number;
  }> {
    const progress = await this.fetchSystematicProgress(childId);
    return {
      wordsLearned: progress.totalWordsLearned,
      sessionsCompleted: progress.sessionsToday,
      currentStreak: progress.currentStreak,
      weeklyProgress: progress.wordsLearnedThisWeek,
    };
  }

  // Private helper methods
  private async fetchOverallProgress(childId: string) {
    const rememberedWords = this.getRememberedWords(childId);
    return { totalWords: rememberedWords.size };
  }

  private async fetchDailyProgress(childId: string) {
    const todayKey = this.getTodayKey();
    const dailyData = localStorage.getItem(
      `daily_progress_${childId}_${todayKey}`,
    );
    return dailyData ? JSON.parse(dailyData) : { words: 0, sessions: 0 };
  }

  private async fetchWeeklyProgress(childId: string) {
    const weekKey = this.getWeekKey();
    const weeklyData = localStorage.getItem(
      `weekly_progress_${childId}_${weekKey}`,
    );
    return weeklyData ? JSON.parse(weeklyData) : { words: 0, sessions: 0 };
  }

  private async fetchMonthlyProgress(childId: string) {
    const monthKey = this.getMonthKey();
    const monthlyData = localStorage.getItem(
      `monthly_progress_${childId}_${monthKey}`,
    );
    return monthlyData ? JSON.parse(monthlyData) : { words: 0, sessions: 0 };
  }

  private async fetchStreakProgress(childId: string) {
    const streakData = localStorage.getItem(`streak_data_${childId}`);
    return streakData
      ? JSON.parse(streakData)
      : { currentStreak: 0, lastActivity: null };
  }

  private async fetchSessionProgress(childId: string) {
    const todayKey = this.getTodayKey();
    const weekKey = this.getWeekKey();
    const todaySessions =
      localStorage.getItem(`sessions_${childId}_${todayKey}`) || "0";
    const weekSessions =
      localStorage.getItem(`sessions_${childId}_${weekKey}`) || "0";

    return {
      todaySessions: parseInt(todaySessions),
      weekSessions: parseInt(weekSessions),
    };
  }

  private async fetchCategoryProgress(
    childId: string,
  ): Promise<Record<string, number>> {
    const categoryData = localStorage.getItem(`category_progress_${childId}`);
    return categoryData ? JSON.parse(categoryData) : {};
  }

  private getRememberedWords(childId: string): Set<number> {
    const data = localStorage.getItem(`remembered_words_${childId}`);
    return data ? new Set(JSON.parse(data)) : new Set();
  }

  private shouldUpdateForDaily(
    goal: LearningGoal,
    update: ProgressUpdate,
  ): boolean {
    if (goal.category && update.category && goal.category !== update.category) {
      return false;
    }

    return (
      update.type === "word_learned" ||
      (update.type === "session_completed" &&
        goal.description?.includes("session"))
    );
  }

  private shouldUpdateForWeekly(
    goal: LearningGoal,
    update: ProgressUpdate,
  ): boolean {
    return this.shouldUpdateForDaily(goal, update);
  }

  private shouldUpdateForMonthly(
    goal: LearningGoal,
    update: ProgressUpdate,
  ): boolean {
    return this.shouldUpdateForDaily(goal, update);
  }

  private getIncrementValue(
    goal: LearningGoal,
    update: ProgressUpdate,
  ): number {
    if (update.type === "word_learned") return 1;
    if (update.type === "session_completed") return 1;
    return update.value || 0;
  }

  private triggerGoalCompletion(goal: LearningGoal, childId: string) {
    // Dispatch custom event for goal completion celebration
    const event = new CustomEvent("goalCompleted", {
      detail: { goal, childId },
    });
    window.dispatchEvent(event);
  }

  private isCacheValid(lastUpdated: Date): boolean {
    const cacheMaxAge = 2 * 60 * 1000; // 2 minutes
    return Date.now() - lastUpdated.getTime() < cacheMaxAge;
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  private isThisWeek(date: Date): boolean {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    return date >= weekStart;
  }

  private isThisMonth(date: Date): boolean {
    const today = new Date();
    return (
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private getTodayKey(): string {
    return new Date().toISOString().split("T")[0];
  }

  private getWeekKey(): string {
    const date = new Date();
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week}`;
  }

  private getMonthKey(): string {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  private saveProgressToStorage(childId: string, data: SystematicProgressData) {
    localStorage.setItem(
      `systematic_progress_${childId}`,
      JSON.stringify(data),
    );
  }

  private getProgressFromStorage(
    childId: string,
  ): SystematicProgressData | null {
    const data = localStorage.getItem(`systematic_progress_${childId}`);
    if (data) {
      const parsed = JSON.parse(data);
      parsed.lastUpdated = new Date(parsed.lastUpdated);
      return parsed;
    }
    return null;
  }

  private getDefaultProgress(): SystematicProgressData {
    return {
      totalWordsLearned: 0,
      wordsLearnedToday: 0,
      wordsLearnedThisWeek: 0,
      wordsLearnedThisMonth: 0,
      currentStreak: 0,
      sessionsToday: 0,
      sessionsThisWeek: 0,
      categoriesProgress: {},
      lastUpdated: new Date(),
    };
  }
}

export const goalProgressTracker = GoalProgressTracker.getInstance();
