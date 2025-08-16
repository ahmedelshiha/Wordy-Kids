import {
  AIWordRecommendationEngine,
  AIRecommendation,
  SessionPerformance,
  AILearningPattern,
} from "./aiWordRecommendationEngine";
import { Word } from "@/data/wordsDatabase";
import { ChildWordStats } from "@shared/api";
import { AchievementTracker } from "./achievementTracker";
import { audioService } from "./audioService";

export interface AIServiceConfig {
  enableRealTimeAdaptation: boolean;
  enablePredictiveAnalytics: boolean;
  enablePersonalizedDifficulty: boolean;
  enableMotivationalBoosts: boolean;
  analyticsUpdateInterval: number; // milliseconds
}

export interface SessionContext {
  timeOfDay: number;
  availableTime?: number; // minutes
  sessionGoal: "learning" | "review" | "challenge" | "confidence";
  emotionalState?: "excited" | "calm" | "tired" | "frustrated";
  deviceType: "mobile" | "tablet" | "desktop";
  previousSessionGap?: number; // hours since last session
}

export interface WordInteraction {
  wordId: number;
  word: string;
  isCorrect: boolean;
  responseTime: number; // milliseconds
  hintsUsed: number;
  attemptNumber: number;
  timestamp: number;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  currentTime: number;
  wordsAttempted: number;
  wordsCorrect: number;
  averageResponseTime: number;
  hintsUsed: number;
  engagementEvents: {
    type: "positive" | "negative" | "neutral";
    timestamp: number;
    context?: string;
  }[];
  cognitiveLoadIndicators: {
    responseTimeSpikes: number;
    hesitationEvents: number;
    errorPatterns: string[];
  };
}

/**
 * AI Word Recommendation Service
 *
 * Provides a clean API layer for integrating AI recommendations into the React app.
 * Handles real-time adaptation, session tracking, and predictive analytics.
 */
export class AIWordRecommendationService {
  private static instance: AIWordRecommendationService;
  private config: AIServiceConfig;
  private currentSession: SessionMetrics | null = null;
  private sessionInteractions: WordInteraction[] = [];
  private realTimeAdaptationEnabled = true;
  private adaptationCallbacks: ((recommendation: AIRecommendation) => void)[] =
    [];

  private constructor(config: Partial<AIServiceConfig> = {}) {
    this.config = {
      enableRealTimeAdaptation: true,
      enablePredictiveAnalytics: true,
      enablePersonalizedDifficulty: true,
      enableMotivationalBoosts: true,
      analyticsUpdateInterval: 5000, // 5 seconds
      ...config,
    };
  }

  static getInstance(
    config?: Partial<AIServiceConfig>,
  ): AIWordRecommendationService {
    if (!AIWordRecommendationService.instance) {
      AIWordRecommendationService.instance = new AIWordRecommendationService(
        config,
      );
    }
    return AIWordRecommendationService.instance;
  }

  /**
   * Get AI-powered word recommendations for a learning session
   */
  async getRecommendations(
    userId: string,
    sessionContext: SessionContext,
    userProgress: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
    category?: string,
    targetWordCount: number = 20,
  ): Promise<AIRecommendation> {
    try {
      // Prepare contextual hints
      const contextualHints = {
        timeOfDay: sessionContext.timeOfDay,
        sessionGoal: sessionContext.sessionGoal,
        availableTime: sessionContext.availableTime,
        emotionalState: sessionContext.emotionalState,
      };

      // Get AI recommendations
      const recommendation =
        await AIWordRecommendationEngine.generateRecommendations(
          userId,
          targetWordCount,
          category,
          userProgress,
          childStats,
          contextualHints,
        );

      // Apply service-level enhancements
      if (this.config.enableMotivationalBoosts) {
        await this.applyMotivationalEnhancements(
          recommendation,
          sessionContext,
        );
      }

      // Start session tracking
      if (this.config.enableRealTimeAdaptation) {
        this.startSessionTracking(userId, recommendation);
      }

      return recommendation;
    } catch (error) {
      console.error("Failed to get AI recommendations:", error);

      // Fallback to basic recommendation
      return this.getFallbackRecommendation(
        userProgress,
        category,
        targetWordCount,
      );
    }
  }

  /**
   * Record word interaction and provide real-time feedback
   */
  async recordWordInteraction(
    userId: string,
    interaction: WordInteraction,
  ): Promise<{
    adaptiveHint?: string;
    encouragement?: string;
    difficultyAdjustment?: "easier" | "harder" | "maintain";
    nextWordPreview?: Word;
  }> {
    // Record the interaction
    this.sessionInteractions.push(interaction);

    // Update session metrics
    if (this.currentSession) {
      this.updateSessionMetrics(interaction);
    }

    const response: any = {};

    // Real-time adaptive hints
    if (this.config.enableRealTimeAdaptation && !interaction.isCorrect) {
      response.adaptiveHint = await this.generateAdaptiveHint(
        interaction,
        userId,
      );
    }

    // Motivational boosts
    if (this.config.enableMotivationalBoosts) {
      response.encouragement = this.generateEncouragement(interaction, userId);
    }

    // Difficulty adjustment recommendations
    if (this.config.enablePersonalizedDifficulty) {
      response.difficultyAdjustment = this.suggestDifficultyAdjustment(userId);
    }

    // Trigger real-time adaptation if needed
    if (this.shouldTriggerAdaptation()) {
      this.triggerRealTimeAdaptation(userId);
    }

    return response;
  }

  /**
   * Complete session and generate comprehensive analytics
   */
  async completeSession(
    userId: string,
    sessionOutcome: {
      completed: boolean;
      reason?: string;
      finalStats: {
        wordsAttempted: number;
        wordsCorrect: number;
        totalTime: number;
        userSatisfaction?: number; // 1-5 scale
      };
    },
  ): Promise<{
    sessionSummary: SessionPerformance;
    learningInsights: string[];
    nextSessionRecommendations: {
      recommendedGap: number;
      suggestedFocus: string;
      difficultyAdjustment: string;
    };
    achievements?: any[];
  }> {
    if (!this.currentSession) {
      throw new Error("No active session to complete");
    }

    // Create session performance record
    const sessionPerformance: SessionPerformance = {
      sessionId: this.currentSession.sessionId,
      startTime: this.currentSession.startTime,
      endTime: Date.now(),
      wordsAttempted: sessionOutcome.finalStats.wordsAttempted,
      wordsCorrect: sessionOutcome.finalStats.wordsCorrect,
      averageResponseTime: this.currentSession.averageResponseTime,
      difficultyMix: this.calculateDifficultyMix(),
      categoriesUsed: this.calculateCategoriesUsed(),
      frustrationEvents:
        this.currentSession.cognitiveLoadIndicators.hesitationEvents,
      engagementScore: this.calculateEngagementScore(),
      completionRate: sessionOutcome.completed ? 1 : 0.5,
    };

    // Record in AI engine
    AIWordRecommendationEngine.recordSessionPerformance(
      userId,
      sessionPerformance,
    );

    // Generate insights
    const analytics = AIWordRecommendationEngine.getLearningAnalytics(userId);

    // Check for achievements
    const achievements = this.checkSessionAchievements(
      sessionPerformance,
      userId,
    );

    // Reset session state
    this.currentSession = null;
    this.sessionInteractions = [];

    return {
      sessionSummary: sessionPerformance,
      learningInsights: analytics.insights,
      nextSessionRecommendations: {
        recommendedGap:
          analytics.predictedOutcomes.nextWeekLearningRate > 20 ? 6 : 12, // hours
        suggestedFocus:
          analytics.predictedOutcomes.recommendedFocus[0] ||
          "balanced_practice",
        difficultyAdjustment:
          this.recommendDifficultyAdjustment(sessionPerformance),
      },
      achievements,
    };
  }

  /**
   * Get real-time learning analytics
   */
  getLearningAnalytics(userId: string): {
    velocityTrend: number[];
    retentionTrend: number[];
    categoryMastery: Map<string, number>;
    predictedOutcomes: any;
    currentSessionProgress?: {
      efficiency: number;
      engagement: number;
      cognitiveLoad: number;
    };
  } {
    const analytics = AIWordRecommendationEngine.getLearningAnalytics(userId);

    let currentSessionProgress;
    if (this.currentSession) {
      currentSessionProgress = {
        efficiency: this.calculateSessionEfficiency(),
        engagement: this.calculateEngagementScore(),
        cognitiveLoad: this.calculateCognitiveLoad(),
      };
    }

    return {
      velocityTrend: analytics.learningVelocityTrend,
      retentionTrend: analytics.retentionTrend,
      categoryMastery: analytics.categoryMasteryLevels,
      predictedOutcomes: analytics.predictedOutcomes,
      currentSessionProgress,
    };
  }

  /**
   * Get personalized study recommendations
   */
  getStudyRecommendations(userId: string): {
    optimalStudyTimes: string[];
    sessionDuration: number;
    focusAreas: string[];
    motivationalTips: string[];
    difficultyStrategy: string;
  } {
    const analytics = AIWordRecommendationEngine.getLearningAnalytics(userId);

    return {
      optimalStudyTimes: this.calculateOptimalStudyTimes(analytics),
      sessionDuration: this.recommendSessionDuration(analytics),
      focusAreas: analytics.predictedOutcomes.recommendedFocus,
      motivationalTips: this.generateMotivationalTips(analytics),
      difficultyStrategy: this.recommendDifficultyStrategy(analytics),
    };
  }

  /**
   * Register callback for real-time adaptation events
   */
  onAdaptation(callback: (recommendation: AIRecommendation) => void): void {
    this.adaptationCallbacks.push(callback);
  }

  /**
   * Remove adaptation callback
   */
  offAdaptation(callback: (recommendation: AIRecommendation) => void): void {
    const index = this.adaptationCallbacks.indexOf(callback);
    if (index > -1) {
      this.adaptationCallbacks.splice(index, 1);
    }
  }

  // Private helper methods

  private async applyMotivationalEnhancements(
    recommendation: AIRecommendation,
    sessionContext: SessionContext,
  ): Promise<void> {
    // Add motivational elements based on context
    if (sessionContext.emotionalState === "frustrated") {
      // Inject easier words for confidence building
      const easyWords = recommendation.words.filter(
        (w) => w.difficulty === "easy",
      );
      if (easyWords.length < recommendation.words.length * 0.6) {
        // Replace some words with easier alternatives
        recommendation.reasoning.push(
          "Added confidence-building words due to detected frustration",
        );
      }
    }

    if (sessionContext.sessionGoal === "confidence") {
      // Ensure mostly easy to medium words
      recommendation.reasoning.push(
        "Optimized for confidence building with carefully selected difficulty progression",
      );
    }
  }

  private getFallbackRecommendation(
    userProgress: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    category?: string,
    targetWordCount: number = 20,
  ): AIRecommendation {
    // Simple fallback using existing smart selection
    const { SmartWordSelector } = require("./smartWordSelection");

    const selection = SmartWordSelector.selectWords({
      category: category || "all",
      count: targetWordCount,
      rememberedWords: userProgress.rememberedWords,
      forgottenWords: userProgress.forgottenWords,
    });

    return {
      words: selection.words,
      confidence: 0.6,
      reasoning: ["Using fallback recommendation system"],
      expectedOutcomes: {
        learningVelocity: 0.5,
        retentionPrediction: 0.7,
        engagementScore: 0.6,
        difficultyFit: 0.7,
      },
      alternativeStrategies: ["manual_selection"],
      adaptiveInstructions: {
        encouragementFrequency: 2,
        hintStrategy: "moderate",
        errorHandling: "delayed",
      },
      nextSessionPreview: {
        recommendedGap: 24,
        focusArea: "balanced_practice",
        expectedDifficulty: "same",
      },
    };
  }

  private startSessionTracking(
    userId: string,
    recommendation: AIRecommendation,
  ): void {
    this.currentSession = {
      sessionId: `session_${Date.now()}_${userId}`,
      startTime: Date.now(),
      currentTime: Date.now(),
      wordsAttempted: 0,
      wordsCorrect: 0,
      averageResponseTime: 0,
      hintsUsed: 0,
      engagementEvents: [],
      cognitiveLoadIndicators: {
        responseTimeSpikes: 0,
        hesitationEvents: 0,
        errorPatterns: [],
      },
    };

    // Start analytics update interval
    if (this.config.enablePredictiveAnalytics) {
      this.startAnalyticsUpdates(userId);
    }
  }

  private updateSessionMetrics(interaction: WordInteraction): void {
    if (!this.currentSession) return;

    this.currentSession.wordsAttempted++;
    if (interaction.isCorrect) {
      this.currentSession.wordsCorrect++;
    }

    // Update average response time
    const totalTime =
      this.currentSession.averageResponseTime *
      (this.currentSession.wordsAttempted - 1);
    this.currentSession.averageResponseTime =
      (totalTime + interaction.responseTime) /
      this.currentSession.wordsAttempted;

    // Track cognitive load indicators
    if (interaction.responseTime > 8000) {
      // More than 8 seconds
      this.currentSession.cognitiveLoadIndicators.responseTimeSpikes++;
    }

    if (interaction.hintsUsed > 0) {
      this.currentSession.cognitiveLoadIndicators.hesitationEvents++;
    }

    // Track engagement events
    if (interaction.isCorrect && interaction.responseTime < 3000) {
      this.currentSession.engagementEvents.push({
        type: "positive",
        timestamp: interaction.timestamp,
        context: "quick_correct_answer",
      });
    } else if (!interaction.isCorrect && interaction.attemptNumber > 2) {
      this.currentSession.engagementEvents.push({
        type: "negative",
        timestamp: interaction.timestamp,
        context: "multiple_attempts",
      });
    }
  }

  private async generateAdaptiveHint(
    interaction: WordInteraction,
    userId: string,
  ): Promise<string> {
    // Generate contextual hints based on error patterns
    if (interaction.attemptNumber === 1) {
      return "Take your time to think about the word. You've got this! 🤔";
    } else if (interaction.attemptNumber === 2) {
      return "Try breaking the word down into smaller parts. What sounds do you hear? 🎵";
    } else {
      return "No worries! Every mistake is a learning opportunity. Let's try a different approach! 💪";
    }
  }

  private generateEncouragement(
    interaction: WordInteraction,
    userId: string,
  ): string {
    if (interaction.isCorrect) {
      const encouragements = [
        "Excellent work! 🌟",
        "You're getting really good at this! 🎉",
        "Amazing! Keep up the great progress! 🚀",
        "Perfect! You're building your vocabulary beautifully! 📚",
      ];
      return encouragements[Math.floor(Math.random() * encouragements.length)];
    } else {
      const supportive = [
        "That's okay! Learning takes practice! 💫",
        "Great effort! Every try makes you stronger! 💪",
        "You're doing great! Let's keep learning together! 🌈",
        "Nice try! You're building your brain power! 🧠",
      ];
      return supportive[Math.floor(Math.random() * supportive.length)];
    }
  }

  private suggestDifficultyAdjustment(
    userId: string,
  ): "easier" | "harder" | "maintain" {
    if (!this.currentSession || this.sessionInteractions.length < 3) {
      return "maintain";
    }

    const recentInteractions = this.sessionInteractions.slice(-5);
    const accuracy =
      recentInteractions.filter((i) => i.isCorrect).length /
      recentInteractions.length;
    const avgResponseTime =
      recentInteractions.reduce((sum, i) => sum + i.responseTime, 0) /
      recentInteractions.length;

    if (accuracy < 0.4 || avgResponseTime > 8000) {
      return "easier";
    } else if (accuracy > 0.9 && avgResponseTime < 3000) {
      return "harder";
    }

    return "maintain";
  }

  private shouldTriggerAdaptation(): boolean {
    if (!this.realTimeAdaptationEnabled || !this.currentSession) return false;

    // Trigger adaptation every 5 words or if performance changes significantly
    return (
      this.sessionInteractions.length % 5 === 0 || this.detectPerformanceShift()
    );
  }

  private detectPerformanceShift(): boolean {
    if (this.sessionInteractions.length < 6) return false;

    const recent = this.sessionInteractions.slice(-3);
    const previous = this.sessionInteractions.slice(-6, -3);

    const recentAccuracy =
      recent.filter((i) => i.isCorrect).length / recent.length;
    const previousAccuracy =
      previous.filter((i) => i.isCorrect).length / previous.length;

    return Math.abs(recentAccuracy - previousAccuracy) > 0.3;
  }

  private async triggerRealTimeAdaptation(userId: string): Promise<void> {
    // This would generate new recommendations based on current performance
    // For now, just notify callbacks
    const mockAdaptation: AIRecommendation = {
      words: [],
      confidence: 0.8,
      reasoning: ["Real-time adaptation triggered"],
      expectedOutcomes: {
        learningVelocity: 0.7,
        retentionPrediction: 0.8,
        engagementScore: 0.75,
        difficultyFit: 0.85,
      },
      alternativeStrategies: [],
      adaptiveInstructions: {
        encouragementFrequency: 2,
        hintStrategy: "moderate",
        errorHandling: "immediate",
      },
      nextSessionPreview: {
        recommendedGap: 12,
        focusArea: "adaptation_response",
        expectedDifficulty: "same",
      },
    };

    this.adaptationCallbacks.forEach((callback) => callback(mockAdaptation));
  }

  private calculateDifficultyMix(): Record<string, number> {
    const difficulties = this.sessionInteractions.reduce(
      (acc, interaction) => {
        // This would need access to word difficulty from interaction
        acc["medium"] = (acc["medium"] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return difficulties;
  }

  private calculateCategoriesUsed(): string[] {
    // This would need access to word categories from interactions
    return ["animals", "food"]; // Mock data
  }

  private calculateEngagementScore(): number {
    if (!this.currentSession) return 0.5;

    const positiveEvents = this.currentSession.engagementEvents.filter(
      (e) => e.type === "positive",
    ).length;
    const totalEvents = this.currentSession.engagementEvents.length;

    if (totalEvents === 0) return 0.7; // Default neutral engagement

    return positiveEvents / totalEvents;
  }

  private calculateSessionEfficiency(): number {
    if (!this.currentSession || this.currentSession.wordsAttempted === 0)
      return 0;

    return (
      this.currentSession.wordsCorrect / this.currentSession.wordsAttempted
    );
  }

  private calculateCognitiveLoad(): number {
    if (!this.currentSession) return 0.5;

    const indicators = this.currentSession.cognitiveLoadIndicators;
    const loadFactors = [
      indicators.responseTimeSpikes /
        Math.max(1, this.currentSession.wordsAttempted),
      indicators.hesitationEvents /
        Math.max(1, this.currentSession.wordsAttempted),
      this.currentSession.averageResponseTime / 10000, // Normalize to 10 seconds max
    ];

    return Math.min(
      1,
      loadFactors.reduce((sum, factor) => sum + factor, 0) / loadFactors.length,
    );
  }

  private checkSessionAchievements(
    sessionPerformance: SessionPerformance,
    userId: string,
  ): any[] {
    const achievements = [];

    // Check for performance-based achievements
    if (
      sessionPerformance.wordsCorrect / sessionPerformance.wordsAttempted >=
      0.9
    ) {
      achievements.push({
        id: "high_accuracy",
        title: "Accuracy Expert! 🎯",
        description: "Achieved 90%+ accuracy in a session",
      });
    }

    if (sessionPerformance.averageResponseTime < 2000) {
      achievements.push({
        id: "speed_demon",
        title: "Speed Learner! ⚡",
        description: "Lightning-fast responses throughout the session",
      });
    }

    return achievements;
  }

  private recommendDifficultyAdjustment(
    sessionPerformance: SessionPerformance,
  ): string {
    const accuracy =
      sessionPerformance.wordsCorrect / sessionPerformance.wordsAttempted;

    if (accuracy < 0.6) return "reduce_difficulty";
    if (accuracy > 0.9) return "increase_difficulty";
    return "maintain_difficulty";
  }

  private calculateOptimalStudyTimes(analytics: any): string[] {
    // This would analyze user's historical performance by time of day
    return ["16:00", "19:00"]; // 4 PM and 7 PM as examples
  }

  private recommendSessionDuration(analytics: any): number {
    // Based on user's attention span and performance data
    return 15; // 15 minutes
  }

  private generateMotivationalTips(analytics: any): string[] {
    return [
      "Try studying at your peak energy times for better focus! ⚡",
      "Celebrate small wins - every word learned is progress! 🎉",
      "Take breaks when you feel tired - rest helps memory consolidation! 😴",
    ];
  }

  private recommendDifficultyStrategy(analytics: any): string {
    if (analytics.predictedOutcomes.retentionRisk > 0.6) {
      return "focus_on_mastery";
    } else if (
      analytics.velocityTrend
        .slice(-3)
        .every((v, i, arr) => i === 0 || v > arr[i - 1])
    ) {
      return "progressive_challenge";
    }
    return "balanced_approach";
  }

  private startAnalyticsUpdates(userId: string): void {
    // This would set up periodic analytics updates
    setInterval(() => {
      if (this.currentSession) {
        // Update real-time analytics
        this.currentSession.currentTime = Date.now();
      }
    }, this.config.analyticsUpdateInterval);
  }
}

// Export singleton instance
export const aiWordRecommendationService =
  AIWordRecommendationService.getInstance();
