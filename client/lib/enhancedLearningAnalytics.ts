// Enhanced Learning Analytics for Jungle Adventure Progress System
export interface LearningSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  wordsLearned: number;
  wordsReviewed: number;
  accuracy: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  gameType: "quiz" | "flashcard" | "word_rescue" | "vowel_game" | "memory";
  streakMaintained: boolean;
  perfectScore: boolean;
  completionTime: number; // in seconds
}

export interface WeeklyAnalytics {
  weekStart: Date;
  weekEnd: Date;
  totalSessions: number;
  totalTimeSpent: number; // in minutes
  totalWordsLearned: number;
  averageAccuracy: number;
  streakDays: number;
  categoriesExplored: string[];
  dailyBreakdown: Array<{
    date: Date;
    sessions: number;
    timeSpent: number;
    wordsLearned: number;
    accuracy: number;
  }>;
  achievements: string[];
  badgesEarned: string[];
}

export interface MonthlyAnalytics {
  monthStart: Date;
  monthEnd: Date;
  totalSessions: number;
  totalTimeSpent: number;
  totalWordsLearned: number;
  averageAccuracy: number;
  longestStreak: number;
  categoriesCompleted: string[];
  levelGained: number;
  experienceEarned: number;
  weeklyBreakdown: WeeklyAnalytics[];
  topCategories: Array<{
    category: string;
    wordsLearned: number;
    accuracy: number;
    timeSpent: number;
  }>;
  improvementAreas: Array<{
    area: string;
    currentScore: number;
    targetScore: number;
    suggestions: string[];
  }>;
}

export interface LearningTrends {
  accuracyTrend: Array<{ date: Date; value: number }>;
  speedTrend: Array<{ date: Date; value: number }>;
  consistencyTrend: Array<{ date: Date; value: number }>;
  engagementTrend: Array<{ date: Date; value: number }>;
  difficultyProgression: Array<{
    difficulty: string;
    completedOverTime: Array<{ date: Date; count: number }>;
  }>;
}

export interface PersonalizedInsights {
  learningStyle: "visual" | "auditory" | "kinesthetic" | "mixed";
  optimalLearningTime: {
    hour: number;
    day: string;
    duration: number;
  };
  strengthCategories: string[];
  improvementCategories: string[];
  motivationalFactors: string[];
  recommendedGoals: Array<{
    type: string;
    target: number;
    timeframe: string;
    reasoning: string;
  }>;
  adaptiveRecommendations: Array<{
    action: string;
    reason: string;
    priority: "high" | "medium" | "low";
  }>;
}

export interface JungleProgressReport {
  heroLevel: number;
  experiencePoints: number;
  nextLevelProgress: number;
  totalWordsRescued: number;
  categoriesExplored: number;
  currentStreak: number;
  longestStreak: number;
  achievementsUnlocked: number;
  badgesEarned: number;
  jungleExplorationMap: {
    visitedAreas: string[];
    completedQuests: string[];
    discoveredSecrets: number;
    rescuedCreatures: number;
  };
  parentalInsights: {
    engagementLevel: "high" | "medium" | "low";
    consistencyRating: number;
    progressVelocity: "accelerating" | "steady" | "needs_support";
    recommendedActions: string[];
  };
}

class EnhancedLearningAnalytics {
  private sessions: LearningSession[] = [];
  private currentSession: Partial<LearningSession> | null = null;

  constructor() {
    this.loadSessions();
  }

  // Session Management
  public startSession(
    gameType: string,
    category: string,
    difficulty: "easy" | "medium" | "hard",
  ): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.currentSession = {
      id: sessionId,
      startTime: new Date(),
      gameType: gameType as any,
      category,
      difficulty,
      wordsLearned: 0,
      wordsReviewed: 0,
      accuracy: 0,
      streakMaintained: false,
      perfectScore: false,
    };

    return sessionId;
  }

  public updateSession(sessionData: Partial<LearningSession>): void {
    if (!this.currentSession) return;

    Object.assign(this.currentSession, sessionData);
  }

  public endSession(
    finalData?: Partial<LearningSession>,
  ): LearningSession | null {
    if (!this.currentSession || !this.currentSession.startTime) return null;

    const endTime = new Date();
    const duration =
      (endTime.getTime() - this.currentSession.startTime.getTime()) /
      (1000 * 60); // minutes

    const completedSession: LearningSession = {
      id: this.currentSession.id!,
      startTime: this.currentSession.startTime,
      endTime,
      duration,
      wordsLearned: this.currentSession.wordsLearned || 0,
      wordsReviewed: this.currentSession.wordsReviewed || 0,
      accuracy: this.currentSession.accuracy || 0,
      category: this.currentSession.category || "unknown",
      difficulty: this.currentSession.difficulty || "easy",
      gameType: this.currentSession.gameType || "quiz",
      streakMaintained: this.currentSession.streakMaintained || false,
      perfectScore: this.currentSession.perfectScore || false,
      completionTime: duration * 60, // convert to seconds
      ...finalData,
    };

    this.sessions.push(completedSession);
    this.saveSessions();
    this.currentSession = null;

    return completedSession;
  }

  // Analytics Generation
  public getWeeklyAnalytics(weekOffset: number = 0): WeeklyAnalytics {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - weekOffset * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekSessions = this.sessions.filter(
      (session) =>
        session.startTime >= weekStart && session.startTime <= weekEnd,
    );

    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      const daySessions = weekSessions.filter(
        (session) => session.startTime.toDateString() === date.toDateString(),
      );

      dailyBreakdown.push({
        date,
        sessions: daySessions.length,
        timeSpent: daySessions.reduce((sum, s) => sum + s.duration, 0),
        wordsLearned: daySessions.reduce((sum, s) => sum + s.wordsLearned, 0),
        accuracy:
          daySessions.length > 0
            ? daySessions.reduce((sum, s) => sum + s.accuracy, 0) /
              daySessions.length
            : 0,
      });
    }

    const categoriesExplored = [
      ...new Set(weekSessions.map((s) => s.category)),
    ];
    const streakDays = this.calculateWeeklyStreak(weekStart, weekEnd);

    return {
      weekStart,
      weekEnd,
      totalSessions: weekSessions.length,
      totalTimeSpent: weekSessions.reduce((sum, s) => sum + s.duration, 0),
      totalWordsLearned: weekSessions.reduce(
        (sum, s) => sum + s.wordsLearned,
        0,
      ),
      averageAccuracy:
        weekSessions.length > 0
          ? weekSessions.reduce((sum, s) => sum + s.accuracy, 0) /
            weekSessions.length
          : 0,
      streakDays,
      categoriesExplored,
      dailyBreakdown,
      achievements: this.getWeeklyAchievements(weekStart, weekEnd),
      badgesEarned: this.getWeeklyBadges(weekStart, weekEnd),
    };
  }

  public getMonthlyAnalytics(monthOffset: number = 0): MonthlyAnalytics {
    const now = new Date();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth() - monthOffset,
      1,
    );
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() - monthOffset + 1,
      0,
    );

    const monthSessions = this.sessions.filter(
      (session) =>
        session.startTime >= monthStart && session.startTime <= monthEnd,
    );

    // Generate weekly breakdown
    const weeklyBreakdown: WeeklyAnalytics[] = [];
    const weeksInMonth = Math.ceil(
      (monthEnd.getDate() - monthStart.getDate() + 1) / 7,
    );

    for (let i = 0; i < weeksInMonth; i++) {
      weeklyBreakdown.push(this.getWeeklyAnalytics(i));
    }

    // Calculate top categories
    const categoryStats = new Map<
      string,
      { words: number; time: number; accuracy: number; count: number }
    >();

    monthSessions.forEach((session) => {
      const existing = categoryStats.get(session.category) || {
        words: 0,
        time: 0,
        accuracy: 0,
        count: 0,
      };
      existing.words += session.wordsLearned;
      existing.time += session.duration;
      existing.accuracy += session.accuracy;
      existing.count += 1;
      categoryStats.set(session.category, existing);
    });

    const topCategories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        wordsLearned: stats.words,
        accuracy: stats.count > 0 ? stats.accuracy / stats.count : 0,
        timeSpent: stats.time,
      }))
      .sort((a, b) => b.wordsLearned - a.wordsLearned)
      .slice(0, 5);

    // Identify improvement areas
    const improvementAreas = this.identifyImprovementAreas(monthSessions);

    return {
      monthStart,
      monthEnd,
      totalSessions: monthSessions.length,
      totalTimeSpent: monthSessions.reduce((sum, s) => sum + s.duration, 0),
      totalWordsLearned: monthSessions.reduce(
        (sum, s) => sum + s.wordsLearned,
        0,
      ),
      averageAccuracy:
        monthSessions.length > 0
          ? monthSessions.reduce((sum, s) => sum + s.accuracy, 0) /
            monthSessions.length
          : 0,
      longestStreak: this.calculateLongestStreak(monthStart, monthEnd),
      categoriesCompleted: [...new Set(monthSessions.map((s) => s.category))],
      levelGained: this.calculateLevelGained(monthStart, monthEnd),
      experienceEarned: this.calculateExperienceEarned(monthStart, monthEnd),
      weeklyBreakdown,
      topCategories,
      improvementAreas,
    };
  }

  // Learning Trends Analysis
  public getLearningTrends(days: number = 30): LearningTrends {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days);

    const relevantSessions = this.sessions.filter(
      (session) =>
        session.startTime >= startDate && session.startTime <= endDate,
    );

    return {
      accuracyTrend: this.calculateAccuracyTrend(relevantSessions),
      speedTrend: this.calculateSpeedTrend(relevantSessions),
      consistencyTrend: this.calculateConsistencyTrend(relevantSessions),
      engagementTrend: this.calculateEngagementTrend(relevantSessions),
      difficultyProgression:
        this.calculateDifficultyProgression(relevantSessions),
    };
  }

  // Personalized Insights
  public getPersonalizedInsights(): PersonalizedInsights {
    const recentSessions = this.sessions.slice(-50); // Last 50 sessions

    return {
      learningStyle: this.detectLearningStyle(recentSessions),
      optimalLearningTime: this.findOptimalLearningTime(recentSessions),
      strengthCategories: this.identifyStrengths(recentSessions),
      improvementCategories: this.identifyWeaknesses(recentSessions),
      motivationalFactors: this.analyzeMotivationalFactors(recentSessions),
      recommendedGoals: this.generateRecommendedGoals(recentSessions),
      adaptiveRecommendations:
        this.generateAdaptiveRecommendations(recentSessions),
    };
  }

  // Jungle Progress Report
  public getJungleProgressReport(): JungleProgressReport {
    const totalWords = this.sessions.reduce(
      (sum, s) => sum + s.wordsLearned,
      0,
    );
    const currentStreak = this.getCurrentStreak();
    const longestStreak = this.getLongestStreak();

    return {
      heroLevel: this.calculateHeroLevel(totalWords),
      experiencePoints: this.calculateExperiencePoints(),
      nextLevelProgress: this.calculateNextLevelProgress(),
      totalWordsRescued: totalWords,
      categoriesExplored: new Set(this.sessions.map((s) => s.category)).size,
      currentStreak,
      longestStreak,
      achievementsUnlocked: this.getAchievementsCount(),
      badgesEarned: this.getBadgesCount(),
      jungleExplorationMap: {
        visitedAreas: this.getVisitedAreas(),
        completedQuests: this.getCompletedQuests(),
        discoveredSecrets: this.getDiscoveredSecrets(),
        rescuedCreatures: this.getRescuedCreatures(),
      },
      parentalInsights: {
        engagementLevel: this.calculateEngagementLevel(),
        consistencyRating: this.calculateConsistencyRating(),
        progressVelocity: this.calculateProgressVelocity(),
        recommendedActions: this.generateParentalRecommendations(),
      },
    };
  }

  // Private Helper Methods
  private loadSessions(): void {
    try {
      const saved = localStorage.getItem("enhanced_learning_sessions");
      if (saved) {
        const data = JSON.parse(saved);
        this.sessions = data.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime),
        }));
      }
    } catch (error) {
      console.error("Error loading learning sessions:", error);
    }
  }

  private saveSessions(): void {
    try {
      localStorage.setItem(
        "enhanced_learning_sessions",
        JSON.stringify(this.sessions),
      );
    } catch (error) {
      console.error("Error saving learning sessions:", error);
    }
  }

  private calculateWeeklyStreak(weekStart: Date, weekEnd: Date): number {
    let streak = 0;
    const currentDate = new Date(weekStart);

    while (currentDate <= weekEnd) {
      const dayHasSessions = this.sessions.some(
        (session) =>
          session.startTime.toDateString() === currentDate.toDateString(),
      );

      if (dayHasSessions) {
        streak++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return streak;
  }

  private getWeeklyAchievements(weekStart: Date, weekEnd: Date): string[] {
    // This would integrate with the achievement system
    return [];
  }

  private getWeeklyBadges(weekStart: Date, weekEnd: Date): string[] {
    // This would integrate with the badge system
    return [];
  }

  private identifyImprovementAreas(sessions: LearningSession[]): Array<{
    area: string;
    currentScore: number;
    targetScore: number;
    suggestions: string[];
  }> {
    const areas = [];

    // Accuracy improvement
    const avgAccuracy =
      sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length;
    if (avgAccuracy < 85) {
      areas.push({
        area: "Accuracy",
        currentScore: Math.round(avgAccuracy),
        targetScore: 85,
        suggestions: [
          "Take your time with each question",
          "Review incorrect answers",
          "Practice with easier difficulty first",
        ],
      });
    }

    // Speed improvement
    const avgCompletionTime =
      sessions.reduce((sum, s) => sum + s.completionTime, 0) / sessions.length;
    if (avgCompletionTime > 120) {
      // 2 minutes
      areas.push({
        area: "Speed",
        currentScore: Math.round(avgCompletionTime),
        targetScore: 90,
        suggestions: [
          "Practice word recognition",
          "Use elimination strategies",
          "Build vocabulary confidence",
        ],
      });
    }

    return areas;
  }

  private calculateLongestStreak(monthStart: Date, monthEnd: Date): number {
    let longestStreak = 0;
    let currentStreak = 0;
    const currentDate = new Date(monthStart);

    while (currentDate <= monthEnd) {
      const dayHasSessions = this.sessions.some(
        (session) =>
          session.startTime.toDateString() === currentDate.toDateString(),
      );

      if (dayHasSessions) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return longestStreak;
  }

  private calculateLevelGained(monthStart: Date, monthEnd: Date): number {
    // Implementation depends on level calculation system
    return 1;
  }

  private calculateExperienceEarned(monthStart: Date, monthEnd: Date): number {
    const monthSessions = this.sessions.filter(
      (session) =>
        session.startTime >= monthStart && session.startTime <= monthEnd,
    );
    return monthSessions.reduce((sum, s) => sum + s.wordsLearned * 10, 0);
  }

  private calculateAccuracyTrend(
    sessions: LearningSession[],
  ): Array<{ date: Date; value: number }> {
    const dailyAccuracy = new Map<string, { total: number; count: number }>();

    sessions.forEach((session) => {
      const dateKey = session.startTime.toDateString();
      const existing = dailyAccuracy.get(dateKey) || { total: 0, count: 0 };
      existing.total += session.accuracy;
      existing.count += 1;
      dailyAccuracy.set(dateKey, existing);
    });

    return Array.from(dailyAccuracy.entries()).map(([dateKey, stats]) => ({
      date: new Date(dateKey),
      value: stats.count > 0 ? stats.total / stats.count : 0,
    }));
  }

  private calculateSpeedTrend(
    sessions: LearningSession[],
  ): Array<{ date: Date; value: number }> {
    const dailySpeed = new Map<string, { total: number; count: number }>();

    sessions.forEach((session) => {
      const dateKey = session.startTime.toDateString();
      const existing = dailySpeed.get(dateKey) || { total: 0, count: 0 };
      const wordsPerMinute =
        session.wordsLearned / Math.max(session.duration, 1);
      existing.total += wordsPerMinute;
      existing.count += 1;
      dailySpeed.set(dateKey, existing);
    });

    return Array.from(dailySpeed.entries()).map(([dateKey, stats]) => ({
      date: new Date(dateKey),
      value: stats.count > 0 ? stats.total / stats.count : 0,
    }));
  }

  private calculateConsistencyTrend(
    sessions: LearningSession[],
  ): Array<{ date: Date; value: number }> {
    // Consistency based on daily engagement
    const dailyEngagement = new Map<string, boolean>();

    sessions.forEach((session) => {
      dailyEngagement.set(session.startTime.toDateString(), true);
    });

    const trend = [];
    const endDate = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - i);
      const dateKey = date.toDateString();

      trend.push({
        date,
        value: dailyEngagement.has(dateKey) ? 1 : 0,
      });
    }

    return trend;
  }

  private calculateEngagementTrend(
    sessions: LearningSession[],
  ): Array<{ date: Date; value: number }> {
    const dailyEngagement = new Map<string, number>();

    sessions.forEach((session) => {
      const dateKey = session.startTime.toDateString();
      const engagement =
        (session.accuracy / 100) *
        (session.duration / 10) *
        (session.wordsLearned / 5);
      dailyEngagement.set(
        dateKey,
        (dailyEngagement.get(dateKey) || 0) + engagement,
      );
    });

    return Array.from(dailyEngagement.entries()).map(([dateKey, value]) => ({
      date: new Date(dateKey),
      value: Math.min(value, 10), // Cap at 10
    }));
  }

  private calculateDifficultyProgression(sessions: LearningSession[]): Array<{
    difficulty: string;
    completedOverTime: Array<{ date: Date; count: number }>;
  }> {
    const difficulties = ["easy", "medium", "hard"];

    return difficulties.map((difficulty) => {
      const difficultySessions = sessions.filter(
        (s) => s.difficulty === difficulty,
      );
      const dailyCounts = new Map<string, number>();

      difficultySessions.forEach((session) => {
        const dateKey = session.startTime.toDateString();
        dailyCounts.set(dateKey, (dailyCounts.get(dateKey) || 0) + 1);
      });

      const completedOverTime = Array.from(dailyCounts.entries()).map(
        ([dateKey, count]) => ({
          date: new Date(dateKey),
          count,
        }),
      );

      return { difficulty, completedOverTime };
    });
  }

  private detectLearningStyle(
    sessions: LearningSession[],
  ): "visual" | "auditory" | "kinesthetic" | "mixed" {
    // Analyze game types and performance to detect learning style
    const gameTypePerformance = new Map<
      string,
      { total: number; count: number }
    >();

    sessions.forEach((session) => {
      const existing = gameTypePerformance.get(session.gameType) || {
        total: 0,
        count: 0,
      };
      existing.total += session.accuracy;
      existing.count += 1;
      gameTypePerformance.set(session.gameType, existing);
    });

    // Simple heuristic based on game type performance
    let bestGameType = "";
    let bestPerformance = 0;

    gameTypePerformance.forEach((stats, gameType) => {
      const avgPerformance = stats.total / stats.count;
      if (avgPerformance > bestPerformance) {
        bestPerformance = avgPerformance;
        bestGameType = gameType;
      }
    });

    // Map game types to learning styles
    const styleMap: Record<string, "visual" | "auditory" | "kinesthetic"> = {
      flashcard: "visual",
      word_rescue: "kinesthetic",
      quiz: "auditory",
      memory: "visual",
      vowel_game: "auditory",
    };

    return styleMap[bestGameType] || "mixed";
  }

  private findOptimalLearningTime(sessions: LearningSession[]): {
    hour: number;
    day: string;
    duration: number;
  } {
    const hourPerformance = new Map<number, { total: number; count: number }>();
    const dayPerformance = new Map<string, { total: number; count: number }>();

    sessions.forEach((session) => {
      const hour = session.startTime.getHours();
      const day = session.startTime.toLocaleDateString("en-US", {
        weekday: "long",
      });

      // Hour analysis
      const hourStats = hourPerformance.get(hour) || { total: 0, count: 0 };
      hourStats.total += session.accuracy;
      hourStats.count += 1;
      hourPerformance.set(hour, hourStats);

      // Day analysis
      const dayStats = dayPerformance.get(day) || { total: 0, count: 0 };
      dayStats.total += session.accuracy;
      dayStats.count += 1;
      dayPerformance.set(day, dayStats);
    });

    // Find best hour
    let bestHour = 9; // default
    let bestHourPerformance = 0;
    hourPerformance.forEach((stats, hour) => {
      const avg = stats.total / stats.count;
      if (avg > bestHourPerformance) {
        bestHourPerformance = avg;
        bestHour = hour;
      }
    });

    // Find best day
    let bestDay = "Monday"; // default
    let bestDayPerformance = 0;
    dayPerformance.forEach((stats, day) => {
      const avg = stats.total / stats.count;
      if (avg > bestDayPerformance) {
        bestDayPerformance = avg;
        bestDay = day;
      }
    });

    // Calculate optimal duration
    const avgDuration =
      sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;

    return {
      hour: bestHour,
      day: bestDay,
      duration: Math.round(avgDuration),
    };
  }

  private identifyStrengths(sessions: LearningSession[]): string[] {
    const categoryPerformance = new Map<string, number>();

    sessions.forEach((session) => {
      const existing = categoryPerformance.get(session.category) || 0;
      categoryPerformance.set(session.category, existing + session.accuracy);
    });

    return Array.from(categoryPerformance.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  private identifyWeaknesses(sessions: LearningSession[]): string[] {
    const categoryPerformance = new Map<string, number>();

    sessions.forEach((session) => {
      const existing = categoryPerformance.get(session.category) || 0;
      categoryPerformance.set(session.category, existing + session.accuracy);
    });

    return Array.from(categoryPerformance.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  private analyzeMotivationalFactors(sessions: LearningSession[]): string[] {
    const factors = [];

    const recentSessions = sessions.slice(-10);
    const avgAccuracy =
      recentSessions.reduce((sum, s) => sum + s.accuracy, 0) /
      recentSessions.length;

    if (avgAccuracy > 85) factors.push("High Achievement");
    if (recentSessions.some((s) => s.perfectScore))
      factors.push("Perfect Scores");
    if (recentSessions.some((s) => s.streakMaintained))
      factors.push("Streak Maintenance");

    return factors;
  }

  private generateRecommendedGoals(sessions: LearningSession[]): Array<{
    type: string;
    target: number;
    timeframe: string;
    reasoning: string;
  }> {
    const goals = [];

    const avgWordsPerSession =
      sessions.reduce((sum, s) => sum + s.wordsLearned, 0) / sessions.length;
    const avgAccuracy =
      sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length;

    if (avgAccuracy < 90) {
      goals.push({
        type: "Accuracy Improvement",
        target: 90,
        timeframe: "2 weeks",
        reasoning: "Focus on accuracy to build confidence",
      });
    }

    if (avgWordsPerSession < 10) {
      goals.push({
        type: "Words Per Session",
        target: 12,
        timeframe: "1 week",
        reasoning: "Increase learning volume gradually",
      });
    }

    return goals;
  }

  private generateAdaptiveRecommendations(sessions: LearningSession[]): Array<{
    action: string;
    reason: string;
    priority: "high" | "medium" | "low";
  }> {
    const recommendations = [];

    const recentAccuracy =
      sessions.slice(-5).reduce((sum, s) => sum + s.accuracy, 0) / 5;

    if (recentAccuracy < 70) {
      recommendations.push({
        action: "Switch to easier difficulty",
        reason: "Build confidence with successful completions",
        priority: "high" as const,
      });
    }

    if (sessions.length > 0 && sessions[sessions.length - 1].duration > 20) {
      recommendations.push({
        action: "Take shorter sessions",
        reason: "Prevent fatigue and maintain focus",
        priority: "medium" as const,
      });
    }

    return recommendations;
  }

  // Additional helper methods for jungle progress report
  private calculateHeroLevel(totalWords: number): number {
    return Math.floor(totalWords / 10) + 1;
  }

  private calculateExperiencePoints(): number {
    return this.sessions.reduce((sum, s) => sum + s.wordsLearned * 10, 0);
  }

  private calculateNextLevelProgress(): number {
    const totalWords = this.sessions.reduce(
      (sum, s) => sum + s.wordsLearned,
      0,
    );
    const currentLevel = this.calculateHeroLevel(totalWords);
    const wordsForNextLevel = currentLevel * 10;
    const progressToNext = totalWords - (currentLevel - 1) * 10;
    return (progressToNext / 10) * 100;
  }

  private getCurrentStreak(): number {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const hasSession = this.sessions.some(
        (session) =>
          session.startTime.toDateString() === checkDate.toDateString(),
      );

      if (hasSession) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private getLongestStreak(): number {
    // Implementation to find longest streak ever
    return 0; // Placeholder
  }

  private getAchievementsCount(): number {
    // This would integrate with achievement system
    return 0;
  }

  private getBadgesCount(): number {
    // This would integrate with badge system
    return 0;
  }

  private getVisitedAreas(): string[] {
    return [...new Set(this.sessions.map((s) => s.category))];
  }

  private getCompletedQuests(): string[] {
    return this.sessions
      .filter((s) => s.perfectScore)
      .map((s) => `Perfect ${s.category} Quest`);
  }

  private getDiscoveredSecrets(): number {
    return this.sessions.filter((s) => s.accuracy > 95).length;
  }

  private getRescuedCreatures(): number {
    return this.sessions.reduce((sum, s) => sum + s.wordsLearned, 0);
  }

  private calculateEngagementLevel(): "high" | "medium" | "low" {
    const recentSessions = this.sessions.slice(-10);
    const avgDuration =
      recentSessions.reduce((sum, s) => sum + s.duration, 0) /
      recentSessions.length;

    if (avgDuration > 15) return "high";
    if (avgDuration > 8) return "medium";
    return "low";
  }

  private calculateConsistencyRating(): number {
    const last7Days = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const hasSession = this.sessions.some(
        (session) =>
          session.startTime.toDateString() === checkDate.toDateString(),
      );

      last7Days.push(hasSession ? 1 : 0);
    }

    return (last7Days.reduce((sum, day) => sum + day, 0) / 7) * 100;
  }

  private calculateProgressVelocity():
    | "accelerating"
    | "steady"
    | "needs_support" {
    const recent = this.sessions.slice(-10);
    const older = this.sessions.slice(-20, -10);

    const recentAvgWords =
      recent.reduce((sum, s) => sum + s.wordsLearned, 0) / recent.length;
    const olderAvgWords =
      older.reduce((sum, s) => sum + s.wordsLearned, 0) / older.length;

    if (recentAvgWords > olderAvgWords * 1.2) return "accelerating";
    if (recentAvgWords > olderAvgWords * 0.8) return "steady";
    return "needs_support";
  }

  private generateParentalRecommendations(): string[] {
    const recommendations = [];

    const engagementLevel = this.calculateEngagementLevel();
    const consistencyRating = this.calculateConsistencyRating();

    if (engagementLevel === "low") {
      recommendations.push("Consider shorter, more frequent sessions");
    }

    if (consistencyRating < 50) {
      recommendations.push("Establish a regular learning routine");
    }

    return recommendations;
  }

  // Public API methods
  public getAllSessions(): LearningSession[] {
    return [...this.sessions];
  }

  public getSessionsByDateRange(start: Date, end: Date): LearningSession[] {
    return this.sessions.filter(
      (session) => session.startTime >= start && session.startTime <= end,
    );
  }

  public exportData(): string {
    return JSON.stringify({
      sessions: this.sessions,
      exported: new Date().toISOString(),
    });
  }

  public importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.sessions && Array.isArray(parsed.sessions)) {
        this.sessions = parsed.sessions.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime),
        }));
        this.saveSessions();
        return true;
      }
    } catch (error) {
      console.error("Error importing data:", error);
    }
    return false;
  }
}

// Export singleton instance
export const enhancedLearningAnalytics = new EnhancedLearningAnalytics();
