import { ChildWordStats } from "@shared/api";

export interface EnhancedChildStats extends ChildWordStats {
  sessionsThisWeek?: number;
  wordsThisWeek?: number;
  timeThisWeek?: number;
  recentActivity?: Array<{
    type: string;
    description: string;
    points: number;
    timestamp: string;
  }>;
  recentAchievements?: Array<{
    name: string;
    date: string;
    icon: string;
  }>;
  weeklyGoal?: {
    target: number;
    current: number;
  };
  dailyStreak?: {
    current: number;
    best: number;
  };
  // Additional computed stats
  currentStreak?: number;
  longestStreak?: number;
  correctAnswers?: number;
  totalAnswers?: number;
  timeSpentToday?: number;
  sessionsToday?: number;
  favoriteWords?: string[];
  strugglingWords?: string[];
}

export class EnhancedStatsHelper {
  static enhanceChildStats(
    baseStats: ChildWordStats | null,
    rememberedWords: Set<number>,
    forgottenWords: Set<number>,
    currentProfile: any,
  ): EnhancedChildStats {
    const enhanced: EnhancedChildStats = {
      totalWordsLearned: baseStats?.totalWordsLearned || rememberedWords.size,
      correctAnswers: baseStats?.correctAnswers || 0,
      totalAnswers: baseStats?.totalAnswers || 0,
      currentStreak: baseStats?.currentStreak || 0,
      longestStreak: baseStats?.longestStreak || 0,
      averageAccuracy: baseStats?.averageAccuracy || 0,
      timeSpentToday: baseStats?.timeSpentToday || 0,
      sessionsToday: baseStats?.sessionsToday || 0,
      favoriteWords: baseStats?.favoriteWords || [],
      strugglingWords: baseStats?.strugglingWords || [],
    };

    // Add enhanced weekly stats
    enhanced.sessionsThisWeek = this.getSessionsThisWeek();
    enhanced.wordsThisWeek = this.getWordsThisWeek(rememberedWords);
    enhanced.timeThisWeek = this.getTimeThisWeek();

    // Add recent activity
    enhanced.recentActivity = this.generateRecentActivity(enhanced);

    // Add recent achievements
    enhanced.recentAchievements = this.generateRecentAchievements(enhanced);

    // Add weekly goal
    enhanced.weeklyGoal = this.getWeeklyGoal(currentProfile);

    // Add daily streak info
    enhanced.dailyStreak = this.getDailyStreakInfo(enhanced);

    return enhanced;
  }

  private static getSessionsThisWeek(): number {
    // Mock implementation - in real app, this would come from backend
    const sessionsKey = "weekly_sessions";
    const stored = localStorage.getItem(sessionsKey);
    if (stored) {
      const data = JSON.parse(stored);
      const weekStart = this.getWeekStart();
      if (data.weekStart === weekStart.toISOString()) {
        return data.sessions || 0;
      }
    }
    return Math.floor(Math.random() * 12) + 3; // Mock: 3-15 sessions
  }

  private static getWordsThisWeek(rememberedWords: Set<number>): number {
    // Mock implementation - in real app, track words learned this week
    return Math.min(rememberedWords.size, Math.floor(Math.random() * 50) + 10);
  }

  private static getTimeThisWeek(): number {
    // Mock implementation - in real app, track time spent this week
    return Math.floor(Math.random() * 300) + 60; // 60-360 minutes
  }

  private static generateRecentActivity(stats: EnhancedChildStats): Array<{
    type: string;
    description: string;
    points: number;
    timestamp: string;
  }> {
    const activities = [
      { type: "word_learned", description: 'Mastered "Adventure"', points: 10 },
      {
        type: "quiz_completed",
        description: "Completed Quick Quiz",
        points: 25,
      },
      {
        type: "streak_milestone",
        description: "Reached 5-day streak!",
        points: 50,
      },
      {
        type: "practice_session",
        description: "Practice session completed",
        points: 15,
      },
      {
        type: "perfect_score",
        description: "Perfect score on Animals quiz",
        points: 30,
      },
    ];

    return activities.slice(0, 3).map((activity, index) => ({
      ...activity,
      timestamp: new Date(
        Date.now() - (index + 1) * 24 * 60 * 60 * 1000,
      ).toISOString(),
    }));
  }

  private static generateRecentAchievements(stats: EnhancedChildStats): Array<{
    name: string;
    date: string;
    icon: string;
  }> {
    const achievements = [];

    if (stats.currentStreak >= 3) {
      achievements.push({
        name: "Streak Master",
        date: new Date().toLocaleDateString(),
        icon: "🔥",
      });
    }

    if (stats.totalWordsLearned >= 50) {
      achievements.push({
        name: "Word Collector",
        date: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toLocaleDateString(),
        icon: "📚",
      });
    }

    if (stats.averageAccuracy >= 80) {
      achievements.push({
        name: "Accuracy Expert",
        date: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000,
        ).toLocaleDateString(),
        icon: "🎯",
      });
    }

    return achievements;
  }

  private static getWeeklyGoal(currentProfile: any): {
    target: number;
    current: number;
  } {
    // Default weekly goal based on level
    const level = currentProfile?.level || 1;
    const baseTarget = Math.max(20, level * 5); // Minimum 20, scales with level

    return {
      target: baseTarget,
      current: this.getWordsThisWeek(new Set()), // This would be properly calculated in real app
    };
  }

  private static getDailyStreakInfo(stats: EnhancedChildStats): {
    current: number;
    best: number;
  } {
    return {
      current: stats.currentStreak,
      best: Math.max(stats.longestStreak, stats.currentStreak),
    };
  }

  private static getWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  static updateWeeklyProgress(
    action: "session" | "word_learned" | "time_spent",
    value: number = 1,
  ): void {
    const weekStart = this.getWeekStart().toISOString();

    if (action === "session") {
      const sessionsKey = "weekly_sessions";
      const stored = localStorage.getItem(sessionsKey);
      let data = { weekStart, sessions: 0 };

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.weekStart === weekStart) {
          data = parsed;
        }
      }

      data.sessions += value;
      localStorage.setItem(sessionsKey, JSON.stringify(data));
    }

    // Similar logic for other actions...
  }
}

export default EnhancedStatsHelper;
