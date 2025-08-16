import { Word, wordsDatabase } from "@/data/wordsDatabase";
import { ChildWordStats } from "@shared/api";
import { WordHistory, EnhancedWordSelector } from "./enhancedWordSelection";
import {
  SmartWordSelector,
  DynamicDifficultyAdjuster,
} from "./smartWordSelection";

export interface AILearningPattern {
  userId: string;
  sessionHistory: SessionPerformance[];
  learningVelocity: number; // Words learned per hour
  retentionRate: number; // Percentage of words retained after 24h
  difficultyProgression: "fast" | "steady" | "slow";
  optimalSessionLength: number; // In minutes
  bestLearningTime: string; // Hour of day (24h format)
  categoryAffinities: Map<string, number>; // 0-1 score per category
  weaknessPatterns: WeaknessPattern[];
  strengthPatterns: StrengthPattern[];
  cognitiveLoad: number; // 0-1, current mental capacity
  motivationLevel: number; // 0-1, engagement score
  lastUpdated: number;
}

export interface SessionPerformance {
  sessionId: string;
  startTime: number;
  endTime: number;
  wordsAttempted: number;
  wordsCorrect: number;
  averageResponseTime: number;
  difficultyMix: Record<string, number>;
  categoriesUsed: string[];
  frustrationEvents: number; // Times user seemed frustrated
  engagementScore: number; // 0-1 based on interaction patterns
  completionRate: number; // Did they finish the session
}

export interface WeaknessPattern {
  type: "category" | "difficulty" | "word_length" | "phonetics" | "concept";
  identifier: string;
  severity: number; // 0-1
  frequency: number; // How often this weakness appears
  recentTrend: "improving" | "stable" | "declining";
  suggestedInterventions: string[];
}

export interface StrengthPattern {
  type: "category" | "difficulty" | "learning_style" | "pattern_recognition";
  identifier: string;
  confidence: number; // 0-1
  leverageOpportunities: string[];
}

export interface AIRecommendation {
  words: Word[];
  confidence: number; // 0-1, how confident AI is in this selection
  reasoning: string[];
  expectedOutcomes: {
    learningVelocity: number;
    retentionPrediction: number;
    engagementScore: number;
    difficultyFit: number;
  };
  alternativeStrategies: string[];
  adaptiveInstructions: {
    timeLimit?: number;
    encouragementFrequency: number;
    hintStrategy: "minimal" | "moderate" | "supportive";
    errorHandling: "immediate" | "delayed" | "session_end";
  };
  nextSessionPreview: {
    recommendedGap: number; // Hours until next session
    focusArea: string;
    expectedDifficulty: "easier" | "same" | "harder";
  };
}

export interface MLModelFeatures {
  // User features
  totalWordsLearned: number;
  averageAccuracy: number;
  learningStreakDays: number;
  averageSessionTime: number;
  preferredCategories: number[]; // Encoded category preferences

  // Session context features
  timeOfDay: number; // 0-23
  dayOfWeek: number; // 0-6
  timeSinceLastSession: number; // Hours
  currentMood: number; // 0-1 estimated from interaction patterns

  // Word features
  wordDifficulty: number; // 0-2 (easy=0, medium=1, hard=2)
  wordCategory: number; // Encoded category
  wordLength: number;
  phonemeComplexity: number; // 0-1 estimated complexity

  // Interaction features
  previousAttempts: number;
  previousAccuracy: number;
  daysSinceLastSeen: number;
  contextualSimilarity: number; // How similar to recently learned words
}

/**
 * AI-Powered Word Recommendation Engine
 *
 * Features:
 * - Machine Learning-based word selection
 * - Predictive analytics for learning outcomes
 * - Personalized difficulty scaling
 * - Real-time adaptation based on performance
 * - Multi-modal learning pattern recognition
 * - Cognitive load optimization
 */
export class AIWordRecommendationEngine {
  private static readonly MODEL_VERSION = "1.0.0";
  private static readonly FEATURE_WEIGHTS = {
    userAccuracy: 0.25,
    retentionRate: 0.2,
    engagementScore: 0.15,
    difficultyProgression: 0.15,
    categoryAffinity: 0.1,
    timeOptimization: 0.1,
    cognitiveLoad: 0.05,
  };

  private static learningPatterns = new Map<string, AILearningPattern>();
  private static modelCache = new Map<string, any>();

  /**
   * Generate AI-powered word recommendations
   */
  static async generateRecommendations(
    userId: string,
    targetWordCount: number = 20,
    category?: string,
    userProgress?: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
    contextualHints?: {
      timeOfDay?: number;
      sessionGoal?: "learning" | "review" | "challenge" | "confidence";
      availableTime?: number; // Minutes
      emotionalState?: "excited" | "calm" | "tired" | "frustrated";
    },
  ): Promise<AIRecommendation> {
    // Initialize or update learning pattern
    const learningPattern = await this.updateLearningPattern(
      userId,
      userProgress,
      childStats,
    );

    // Extract features for ML model
    const features = this.extractFeatures(
      learningPattern,
      userProgress,
      childStats,
      contextualHints,
    );

    // Predict optimal learning parameters
    const predictions = this.runPredictiveModels(features, learningPattern);

    // Generate base word selection using existing systems
    const baseRecommendation = this.generateBaseRecommendation(
      category,
      targetWordCount,
      userProgress,
      childStats,
      learningPattern,
    );

    // Apply AI enhancements
    const enhancedRecommendation = this.enhanceWithAI(
      baseRecommendation,
      predictions,
      learningPattern,
      contextualHints,
    );

    // Calculate confidence and reasoning
    const confidence = this.calculateConfidence(
      enhancedRecommendation,
      learningPattern,
    );
    const reasoning = this.generateReasoning(
      enhancedRecommendation,
      predictions,
      learningPattern,
    );

    // Generate adaptive instructions
    const adaptiveInstructions = this.generateAdaptiveInstructions(
      learningPattern,
      predictions,
      contextualHints,
    );

    // Predict next session recommendations
    const nextSessionPreview = this.predictNextSession(
      learningPattern,
      enhancedRecommendation,
      predictions,
    );

    return {
      words: enhancedRecommendation,
      confidence,
      reasoning,
      expectedOutcomes: predictions,
      alternativeStrategies:
        this.generateAlternativeStrategies(learningPattern),
      adaptiveInstructions,
      nextSessionPreview,
    };
  }

  /**
   * Update or create learning pattern for user
   */
  private static async updateLearningPattern(
    userId: string,
    userProgress?: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
  ): Promise<AILearningPattern> {
    let pattern = this.learningPatterns.get(userId);

    if (!pattern) {
      // Create new pattern
      pattern = {
        userId,
        sessionHistory: [],
        learningVelocity: 0,
        retentionRate: 0.8, // Default assumption
        difficultyProgression: "steady",
        optimalSessionLength: 15, // Default 15 minutes
        bestLearningTime: "16", // Default 4 PM
        categoryAffinities: new Map(),
        weaknessPatterns: [],
        strengthPatterns: [],
        cognitiveLoad: 0.5,
        motivationLevel: 0.8,
        lastUpdated: Date.now(),
      };
    }

    // Update with latest data
    if (childStats) {
      pattern.learningVelocity = this.calculateLearningVelocity(
        childStats,
        pattern,
      );
      pattern.retentionRate = this.calculateRetentionRate(
        childStats,
        userProgress,
      );
      pattern.difficultyProgression = this.analyzeDifficultyProgression(
        childStats,
        pattern,
      );
    }

    // Analyze patterns
    pattern.weaknessPatterns = this.identifyWeaknessPatterns(
      pattern,
      userProgress,
      childStats,
    );
    pattern.strengthPatterns = this.identifyStrengthPatterns(
      pattern,
      userProgress,
      childStats,
    );
    pattern.categoryAffinities = this.updateCategoryAffinities(
      pattern,
      userProgress,
      childStats,
    );

    pattern.lastUpdated = Date.now();
    this.learningPatterns.set(userId, pattern);

    return pattern;
  }

  /**
   * Extract features for machine learning models
   */
  private static extractFeatures(
    learningPattern: AILearningPattern,
    userProgress?: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
    contextualHints?: any,
  ): MLModelFeatures {
    const now = new Date();

    return {
      // User features
      totalWordsLearned: userProgress?.rememberedWords.size || 0,
      averageAccuracy: childStats?.averageAccuracy || 0,
      learningStreakDays: learningPattern.sessionHistory.length,
      averageSessionTime: learningPattern.optimalSessionLength,
      preferredCategories: this.encodeCategoryPreferences(
        learningPattern.categoryAffinities,
      ),

      // Session context
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      timeSinceLastSession: this.calculateTimeSinceLastSession(learningPattern),
      currentMood: contextualHints?.emotionalState
        ? this.encodeEmotionalState(contextualHints.emotionalState)
        : learningPattern.motivationLevel,

      // Defaults for word-specific features (will be calculated per word)
      wordDifficulty: 0,
      wordCategory: 0,
      wordLength: 0,
      phonemeComplexity: 0,
      previousAttempts: 0,
      previousAccuracy: 0,
      daysSinceLastSeen: 0,
      contextualSimilarity: 0,
    };
  }

  /**
   * Run predictive models to estimate learning outcomes
   */
  private static runPredictiveModels(
    features: MLModelFeatures,
    learningPattern: AILearningPattern,
  ): AIRecommendation["expectedOutcomes"] {
    // Simplified ML model (in production, this would use actual trained models)

    // Learning velocity prediction (words per minute)
    const velocityFactors = [
      (features.averageAccuracy / 100) * 0.4,
      learningPattern.motivationLevel * 0.3,
      (1 - learningPattern.cognitiveLoad) * 0.2,
      Math.min(features.learningStreakDays / 30, 1) * 0.1,
    ];
    const learningVelocity = velocityFactors.reduce(
      (sum, factor) => sum + factor,
      0,
    );

    // Retention prediction
    const retentionFactors = [
      (features.averageAccuracy / 100) * 0.5,
      learningPattern.retentionRate * 0.3,
      (features.averageSessionTime / 30) * 0.2, // Optimal around 15-20 minutes
    ];
    const retentionPrediction = Math.min(
      1,
      retentionFactors.reduce((sum, factor) => sum + factor, 0),
    );

    // Engagement score prediction
    const engagementFactors = [
      learningPattern.motivationLevel * 0.4,
      features.currentMood * 0.3,
      this.getTimeOfDayBonus(
        features.timeOfDay,
        learningPattern.bestLearningTime,
      ) * 0.3,
    ];
    const engagementScore = engagementFactors.reduce(
      (sum, factor) => sum + factor,
      0,
    );

    // Difficulty fit (how well the difficulty matches user's current ability)
    const difficultyFit = this.calculateDifficultyFit(
      features,
      learningPattern,
    );

    return {
      learningVelocity,
      retentionPrediction,
      engagementScore,
      difficultyFit,
    };
  }

  /**
   * Generate base recommendation using existing algorithms
   */
  private static generateBaseRecommendation(
    category?: string,
    targetWordCount: number = 20,
    userProgress?: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
    learningPattern?: AILearningPattern,
  ): Word[] {
    if (!userProgress) {
      userProgress = {
        rememberedWords: new Set(),
        forgottenWords: new Set(),
        excludedWordIds: new Set(),
      };
    }

    // Use enhanced word selector as base
    const enhancedSelection = SmartWordSelector.selectWords({
      category: category || "all",
      count: targetWordCount,
      rememberedWords: userProgress.rememberedWords,
      forgottenWords: userProgress.forgottenWords,
      childStats,
      prioritizeWeakCategories: true,
      includeReviewWords: true,
    });

    return enhancedSelection.words;
  }

  /**
   * Apply AI enhancements to base recommendation
   */
  private static enhanceWithAI(
    baseWords: Word[],
    predictions: AIRecommendation["expectedOutcomes"],
    learningPattern: AILearningPattern,
    contextualHints?: any,
  ): Word[] {
    let enhancedWords = [...baseWords];

    // Apply cognitive load optimization
    if (learningPattern.cognitiveLoad > 0.7) {
      // High cognitive load - prefer easier words
      enhancedWords = enhancedWords.filter(
        (word) => word.difficulty !== "hard",
      );
      enhancedWords.sort((a, b) => {
        const diffOrder = { easy: 1, medium: 2, hard: 3 };
        return diffOrder[a.difficulty] - diffOrder[b.difficulty];
      });
    }

    // Apply category affinity optimization
    if (learningPattern.categoryAffinities.size > 0) {
      enhancedWords.sort((a, b) => {
        const affinityA =
          learningPattern.categoryAffinities.get(a.category) || 0;
        const affinityB =
          learningPattern.categoryAffinities.get(b.category) || 0;
        return affinityB - affinityA; // Higher affinity first
      });
    }

    // Apply motivational optimization
    if (learningPattern.motivationLevel < 0.5) {
      // Low motivation - inject confidence builders
      const easyWords = enhancedWords.filter((w) => w.difficulty === "easy");
      const otherWords = enhancedWords.filter((w) => w.difficulty !== "easy");

      // Ensure at least 60% easy words for confidence
      const targetEasyCount = Math.ceil(enhancedWords.length * 0.6);
      if (easyWords.length < targetEasyCount) {
        // Replace some medium/hard words with easy ones
        const additionalEasy = wordsDatabase
          .filter(
            (w) =>
              w.difficulty === "easy" &&
              !enhancedWords.some((ew) => ew.id === w.id),
          )
          .slice(0, targetEasyCount - easyWords.length);

        enhancedWords = [
          ...easyWords,
          ...additionalEasy,
          ...otherWords.slice(0, enhancedWords.length - targetEasyCount),
        ];
      }
    }

    // Apply time-based optimization
    if (contextualHints?.availableTime && contextualHints.availableTime < 10) {
      // Short session - reduce word count and focus on easier words
      enhancedWords = enhancedWords
        .filter((w) => w.difficulty !== "hard")
        .slice(0, Math.min(10, enhancedWords.length));
    }

    // Apply weakness targeting
    learningPattern.weaknessPatterns.forEach((weakness) => {
      if (weakness.type === "category" && weakness.severity > 0.6) {
        // Inject more words from weak category
        const weakCategoryWords = wordsDatabase
          .filter(
            (w) =>
              w.category === weakness.identifier &&
              !enhancedWords.some((ew) => ew.id === w.id),
          )
          .slice(0, 3);

        enhancedWords = [
          ...enhancedWords.slice(0, -weakCategoryWords.length),
          ...weakCategoryWords,
        ];
      }
    });

    return enhancedWords;
  }

  /**
   * Calculate confidence in recommendation
   */
  private static calculateConfidence(
    words: Word[],
    learningPattern: AILearningPattern,
  ): number {
    // Dynamic base confidence based on recent performance
    const recentSessions = learningPattern.sessionHistory.slice(-5);
    const recentAccuracy =
      recentSessions.length > 0
        ? recentSessions.reduce((sum, session) => sum + session.accuracy, 0) /
          recentSessions.length
        : 0.5;

    // Start with performance-based confidence (30-90% range)
    let confidence = Math.max(0.3, Math.min(0.9, recentAccuracy * 0.8 + 0.2));

    // Increase confidence based on data quality
    if (learningPattern.sessionHistory.length > 10) confidence += 0.05;
    if (learningPattern.sessionHistory.length > 50) confidence += 0.05;

    // Adjust based on pattern strength
    const patternStrength =
      learningPattern.weaknessPatterns.length +
      learningPattern.strengthPatterns.length;
    confidence += Math.min(0.1, patternStrength * 0.02);

    // Reduce confidence for edge cases
    if (learningPattern.cognitiveLoad > 0.8) confidence -= 0.1;
    if (learningPattern.motivationLevel < 0.3) confidence -= 0.15;

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  /**
   * Generate human-readable reasoning for recommendations
   */
  private static generateReasoning(
    words: Word[],
    predictions: AIRecommendation["expectedOutcomes"],
    learningPattern: AILearningPattern,
  ): string[] {
    const reasoning: string[] = [];

    // Difficulty reasoning
    const difficultyCounts = words.reduce(
      (acc, word) => {
        acc[word.difficulty] = (acc[word.difficulty] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    if (difficultyCounts.easy > words.length * 0.6) {
      reasoning.push(
        "Focused on easier words to build confidence and momentum",
      );
    } else if (difficultyCounts.hard > words.length * 0.3) {
      reasoning.push(
        "Included challenging words to accelerate learning progression",
      );
    }

    // Category reasoning
    const categories = [...new Set(words.map((w) => w.category))];
    if (categories.length > 3) {
      reasoning.push(
        "Diversified across multiple categories for broader vocabulary development",
      );
    } else if (categories.length === 1) {
      reasoning.push(
        `Concentrated on ${categories[0]} category to build specialized knowledge`,
      );
    }

    // Pattern-based reasoning
    if (learningPattern.weaknessPatterns.length > 0) {
      const strongestWeakness = learningPattern.weaknessPatterns.sort(
        (a, b) => b.severity - a.severity,
      )[0];
      reasoning.push(
        `Targeted improvement in ${strongestWeakness.identifier} (identified weakness)`,
      );
    }

    // Performance prediction reasoning
    if (predictions.engagementScore > 0.8) {
      reasoning.push(
        "Optimized for high engagement based on your learning preferences",
      );
    } else if (predictions.retentionPrediction > 0.8) {
      reasoning.push(
        "Structured for maximum retention using spaced repetition principles",
      );
    }

    // Motivation-based reasoning
    if (learningPattern.motivationLevel < 0.5) {
      reasoning.push(
        "Included confidence-building elements to boost motivation",
      );
    }

    return reasoning;
  }

  /**
   * Generate adaptive instructions for the session
   */
  private static generateAdaptiveInstructions(
    learningPattern: AILearningPattern,
    predictions: AIRecommendation["expectedOutcomes"],
    contextualHints?: any,
  ): AIRecommendation["adaptiveInstructions"] {
    return {
      timeLimit: this.calculateOptimalTimeLimit(
        learningPattern,
        contextualHints,
      ),
      encouragementFrequency:
        this.calculateEncouragementFrequency(learningPattern),
      hintStrategy: this.selectHintStrategy(learningPattern, predictions),
      errorHandling: this.selectErrorHandling(learningPattern),
    };
  }

  /**
   * Predict next session recommendations
   */
  private static predictNextSession(
    learningPattern: AILearningPattern,
    currentWords: Word[],
    predictions: any,
  ): AIRecommendation["nextSessionPreview"] {
    // Calculate optimal gap based on retention curve
    const baseGap = 24; // 24 hours base
    const retentionMultiplier = 1 / (learningPattern.retentionRate + 0.1);
    const recommendedGap = baseGap * retentionMultiplier;

    // Determine focus area
    let focusArea = "mixed_practice";
    if (learningPattern.weaknessPatterns.length > 0) {
      const strongestWeakness = learningPattern.weaknessPatterns.sort(
        (a, b) => b.severity - a.severity,
      )[0];
      focusArea = `${strongestWeakness.type}_improvement`;
    }

    // Predict difficulty adjustment
    const avgDifficulty =
      currentWords.reduce((sum, word) => {
        const diffVal = { easy: 1, medium: 2, hard: 3 };
        return sum + diffVal[word.difficulty];
      }, 0) / currentWords.length;

    let expectedDifficulty: "easier" | "same" | "harder" = "same";
    if (
      predictions.engagementScore > 0.8 &&
      predictions.retentionPrediction > 0.8
    ) {
      expectedDifficulty = "harder";
    } else if (predictions.engagementScore < 0.5) {
      expectedDifficulty = "easier";
    }

    return {
      recommendedGap: Math.round(recommendedGap),
      focusArea,
      expectedDifficulty,
    };
  }

  /**
   * Generate alternative learning strategies
   */
  private static generateAlternativeStrategies(
    learningPattern: AILearningPattern,
  ): string[] {
    const strategies: string[] = [];

    if (learningPattern.motivationLevel < 0.5) {
      strategies.push(
        "gamification_boost",
        "micro_sessions",
        "reward_emphasis",
      );
    }

    if (learningPattern.cognitiveLoad > 0.7) {
      strategies.push(
        "break_recommendation",
        "difficulty_reduction",
        "session_splitting",
      );
    }

    if (learningPattern.retentionRate < 0.6) {
      strategies.push(
        "spaced_repetition_focus",
        "memory_techniques",
        "visualization_aids",
      );
    }

    return strategies;
  }

  // Helper methods
  private static calculateLearningVelocity(
    childStats: ChildWordStats,
    pattern: AILearningPattern,
  ): number {
    const recentSessions = pattern.sessionHistory.slice(-10);
    if (recentSessions.length === 0) return 0;

    const totalTime =
      recentSessions.reduce(
        (sum, session) => sum + (session.endTime - session.startTime),
        0,
      ) /
      (1000 * 60); // Convert to minutes
    const totalWords = recentSessions.reduce(
      (sum, session) => sum + session.wordsCorrect,
      0,
    );

    return totalWords / Math.max(1, totalTime);
  }

  private static calculateRetentionRate(
    childStats?: ChildWordStats | null,
    userProgress?: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
  ): number {
    if (!userProgress) return 0.8;

    const totalLearned =
      userProgress.rememberedWords.size + userProgress.forgottenWords.size;
    if (totalLearned === 0) return 0.8;

    return userProgress.rememberedWords.size / totalLearned;
  }

  private static analyzeDifficultyProgression(
    childStats: ChildWordStats,
    pattern: AILearningPattern,
  ): "fast" | "steady" | "slow" {
    const accuracy = childStats.averageAccuracy || 0;
    const sessions = pattern.sessionHistory.length;

    if (accuracy > 85 && sessions > 10) return "fast";
    if (accuracy > 70 && sessions > 5) return "steady";
    return "slow";
  }

  private static identifyWeaknessPatterns(
    pattern: AILearningPattern,
    userProgress?: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
  ): WeaknessPattern[] {
    const patterns: WeaknessPattern[] = [];

    // Analyze category weaknesses
    if (userProgress) {
      const categoryErrors = new Map<string, number>();

      userProgress.forgottenWords.forEach((wordId) => {
        const word = wordsDatabase.find((w) => w.id === wordId);
        if (word) {
          categoryErrors.set(
            word.category,
            (categoryErrors.get(word.category) || 0) + 1,
          );
        }
      });

      categoryErrors.forEach((errors, category) => {
        const totalCategoryWords = wordsDatabase.filter(
          (w) => w.category === category,
        ).length;
        const errorRate = errors / totalCategoryWords;

        if (errorRate > 0.3) {
          patterns.push({
            type: "category",
            identifier: category,
            severity: errorRate,
            frequency: errors,
            recentTrend: "stable", // Would need historical data to determine
            suggestedInterventions: [
              `focused_${category}_practice`,
              "category_association_games",
            ],
          });
        }
      });
    }

    return patterns;
  }

  private static identifyStrengthPatterns(
    pattern: AILearningPattern,
    userProgress?: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
  ): StrengthPattern[] {
    const patterns: StrengthPattern[] = [];

    // Analyze learning style strengths based on accuracy
    if (childStats && childStats.averageAccuracy > 75) {
      patterns.push({
        type: "learning_style",
        identifier: "visual_memory",
        confidence: childStats.averageAccuracy / 100,
        leverageOpportunities: ["picture_association", "visual_mnemonics"],
      });
    }

    return patterns;
  }

  private static updateCategoryAffinities(
    pattern: AILearningPattern,
    userProgress?: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
  ): Map<string, number> {
    const affinities = new Map<string, number>();

    if (userProgress) {
      const categorySuccesses = new Map<string, number>();
      const categoryTotals = new Map<string, number>();

      userProgress.rememberedWords.forEach((wordId) => {
        const word = wordsDatabase.find((w) => w.id === wordId);
        if (word) {
          categorySuccesses.set(
            word.category,
            (categorySuccesses.get(word.category) || 0) + 1,
          );
          categoryTotals.set(
            word.category,
            (categoryTotals.get(word.category) || 0) + 1,
          );
        }
      });

      userProgress.forgottenWords.forEach((wordId) => {
        const word = wordsDatabase.find((w) => w.id === wordId);
        if (word) {
          categoryTotals.set(
            word.category,
            (categoryTotals.get(word.category) || 0) + 1,
          );
        }
      });

      categoryTotals.forEach((total, category) => {
        const successes = categorySuccesses.get(category) || 0;
        const affinity = successes / total;
        affinities.set(category, affinity);
      });
    }

    return affinities;
  }

  private static encodeCategoryPreferences(
    affinities: Map<string, number>,
  ): number[] {
    const categories = [
      "animals",
      "food",
      "objects",
      "nature",
      "body",
      "colors",
    ];
    return categories.map((cat) => affinities.get(cat) || 0);
  }

  private static encodeEmotionalState(state: string): number {
    const stateMap = { excited: 0.9, calm: 0.7, tired: 0.4, frustrated: 0.2 };
    return stateMap[state] || 0.5;
  }

  private static calculateTimeSinceLastSession(
    pattern: AILearningPattern,
  ): number {
    if (pattern.sessionHistory.length === 0) return 24;

    const lastSession =
      pattern.sessionHistory[pattern.sessionHistory.length - 1];
    return (Date.now() - lastSession.endTime) / (1000 * 60 * 60); // Hours
  }

  private static getTimeOfDayBonus(
    currentHour: number,
    preferredHour: string,
  ): number {
    const preferred = parseInt(preferredHour);
    const diff = Math.abs(currentHour - preferred);
    return Math.max(0, 1 - diff / 12); // Bonus decreases with distance from preferred time
  }

  private static calculateDifficultyFit(
    features: MLModelFeatures,
    pattern: AILearningPattern,
  ): number {
    // Simplified difficulty fit calculation
    const accuracy = features.averageAccuracy / 100;

    if (accuracy > 0.9) return 0.8; // Could handle harder
    if (accuracy > 0.7) return 1.0; // Perfect fit
    if (accuracy > 0.5) return 0.6; // Might need easier
    return 0.3; // Definitely needs easier
  }

  private static calculateOptimalTimeLimit(
    pattern: AILearningPattern,
    contextualHints?: any,
  ): number | undefined {
    if (contextualHints?.availableTime) {
      return contextualHints.availableTime * 60; // Convert minutes to seconds
    }

    if (pattern.cognitiveLoad > 0.7) {
      return pattern.optimalSessionLength * 0.75 * 60; // Shorter session
    }

    return pattern.optimalSessionLength * 60; // Normal session length
  }

  private static calculateEncouragementFrequency(
    pattern: AILearningPattern,
  ): number {
    if (pattern.motivationLevel < 0.4) return 1; // Every word
    if (pattern.motivationLevel < 0.6) return 2; // Every 2 words
    return 3; // Every 3 words
  }

  private static selectHintStrategy(
    pattern: AILearningPattern,
    predictions: AIRecommendation["expectedOutcomes"],
  ): "minimal" | "moderate" | "supportive" {
    if (pattern.cognitiveLoad > 0.7 || pattern.motivationLevel < 0.4) {
      return "supportive";
    }
    if (predictions.difficultyFit < 0.6) {
      return "moderate";
    }
    return "minimal";
  }

  private static selectErrorHandling(
    pattern: AILearningPattern,
  ): "immediate" | "delayed" | "session_end" {
    if (pattern.motivationLevel < 0.4) return "immediate";
    if (pattern.cognitiveLoad > 0.7) return "delayed";
    return "session_end";
  }

  /**
   * Record session performance for learning
   */
  static recordSessionPerformance(
    userId: string,
    performance: SessionPerformance,
  ): void {
    const pattern = this.learningPatterns.get(userId);
    if (pattern) {
      pattern.sessionHistory.push(performance);

      // Keep only last 100 sessions
      if (pattern.sessionHistory.length > 100) {
        pattern.sessionHistory = pattern.sessionHistory.slice(-100);
      }

      // Update real-time metrics
      pattern.motivationLevel = this.calculateMotivationLevel(pattern);
      pattern.cognitiveLoad = this.calculateCognitiveLoad(pattern);

      this.learningPatterns.set(userId, pattern);
    }
  }

  private static calculateMotivationLevel(pattern: AILearningPattern): number {
    const recentSessions = pattern.sessionHistory.slice(-5);
    if (recentSessions.length === 0) return 0.8;

    const avgEngagement =
      recentSessions.reduce(
        (sum, session) => sum + session.engagementScore,
        0,
      ) / recentSessions.length;

    const avgCompletion =
      recentSessions.reduce((sum, session) => sum + session.completionRate, 0) /
      recentSessions.length;

    return (avgEngagement + avgCompletion) / 2;
  }

  private static calculateCognitiveLoad(pattern: AILearningPattern): number {
    const recentSessions = pattern.sessionHistory.slice(-3);
    if (recentSessions.length === 0) return 0.5;

    const avgFrustration =
      recentSessions.reduce(
        (sum, session) => sum + session.frustrationEvents,
        0,
      ) / recentSessions.length;

    const avgResponseTime =
      recentSessions.reduce(
        (sum, session) => sum + session.averageResponseTime,
        0,
      ) / recentSessions.length;

    // High frustration and slow response times indicate high cognitive load
    const frustrationLoad = Math.min(1, avgFrustration / 5); // Normalize to 0-1
    const timeLoad = Math.min(1, avgResponseTime / 10000); // 10 seconds max normal

    return (frustrationLoad + timeLoad) / 2;
  }

  /**
   * Get learning analytics dashboard data
   */
  static getLearningAnalytics(userId: string): {
    learningVelocityTrend: number[];
    retentionTrend: number[];
    difficultyProgressionPath: string[];
    categoryMasteryLevels: Map<string, number>;
    predictedOutcomes: {
      nextWeekLearningRate: number;
      retentionRisk: number;
      motivationTrend: "improving" | "stable" | "declining";
      recommendedFocus: string[];
    };
    insights: string[];
  } {
    const pattern = this.learningPatterns.get(userId);
    if (!pattern) {
      return {
        learningVelocityTrend: [],
        retentionTrend: [],
        difficultyProgressionPath: [],
        categoryMasteryLevels: new Map(),
        predictedOutcomes: {
          nextWeekLearningRate: 0,
          retentionRisk: 0,
          motivationTrend: "stable",
          recommendedFocus: [],
        },
        insights: ["Insufficient data for analysis"],
      };
    }

    // Calculate trends
    const velocityTrend = this.calculateVelocityTrend(pattern);
    const retentionTrend = this.calculateRetentionTrend(pattern);

    // Generate insights
    const insights = this.generateLearningInsights(pattern);

    // Predict outcomes
    const predictedOutcomes = this.predictLearningOutcomes(pattern);

    return {
      learningVelocityTrend: velocityTrend,
      retentionTrend: retentionTrend,
      difficultyProgressionPath: [pattern.difficultyProgression],
      categoryMasteryLevels: pattern.categoryAffinities,
      predictedOutcomes,
      insights,
    };
  }

  private static calculateVelocityTrend(pattern: AILearningPattern): number[] {
    return pattern.sessionHistory.slice(-10).map((session) => {
      const duration = (session.endTime - session.startTime) / (1000 * 60); // minutes
      return session.wordsCorrect / Math.max(1, duration);
    });
  }

  private static calculateRetentionTrend(pattern: AILearningPattern): number[] {
    return pattern.sessionHistory.slice(-10).map((session) => {
      return session.wordsCorrect / Math.max(1, session.wordsAttempted);
    });
  }

  private static generateLearningInsights(
    pattern: AILearningPattern,
  ): string[] {
    const insights: string[] = [];

    // Velocity insights
    if (pattern.learningVelocity > 1.5) {
      insights.push(
        "Excellent learning pace - you're mastering words quickly!",
      );
    } else if (pattern.learningVelocity < 0.5) {
      insights.push(
        "Take your time - quality over speed leads to better retention",
      );
    }

    // Retention insights
    if (pattern.retentionRate > 0.8) {
      insights.push(
        "Outstanding retention! Your learning strategies are very effective",
      );
    } else if (pattern.retentionRate < 0.6) {
      insights.push("Focus on review sessions to improve long-term retention");
    }

    // Pattern insights
    if (pattern.weaknessPatterns.length > 0) {
      const mainWeakness = pattern.weaknessPatterns[0];
      insights.push(
        `Consider extra practice with ${mainWeakness.identifier} to strengthen this area`,
      );
    }

    if (pattern.strengthPatterns.length > 0) {
      const mainStrength = pattern.strengthPatterns[0];
      insights.push(
        `Leverage your strength in ${mainStrength.identifier} for accelerated learning`,
      );
    }

    return insights;
  }

  private static predictLearningOutcomes(pattern: AILearningPattern): {
    nextWeekLearningRate: number;
    retentionRisk: number;
    motivationTrend: "improving" | "stable" | "declining";
    recommendedFocus: string[];
  } {
    // Simplified predictions
    const recentSessions = pattern.sessionHistory.slice(-5);
    const avgWordsPerSession =
      recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + s.wordsCorrect, 0) /
          recentSessions.length
        : 0;

    const nextWeekLearningRate = avgWordsPerSession * 7; // Assuming daily sessions

    const retentionRisk = 1 - pattern.retentionRate;

    // Determine motivation trend
    let motivationTrend: "improving" | "stable" | "declining" = "stable";
    if (recentSessions.length >= 3) {
      const recent =
        recentSessions
          .slice(-2)
          .reduce((sum, s) => sum + s.engagementScore, 0) / 2;
      const older =
        recentSessions
          .slice(0, -2)
          .reduce((sum, s) => sum + s.engagementScore, 0) /
        (recentSessions.length - 2);

      if (recent > older + 0.1) motivationTrend = "improving";
      else if (recent < older - 0.1) motivationTrend = "declining";
    }

    // Recommended focus areas
    const recommendedFocus: string[] = [];
    if (pattern.retentionRate < 0.7)
      recommendedFocus.push("retention_improvement");
    if (pattern.motivationLevel < 0.6)
      recommendedFocus.push("engagement_boost");
    if (pattern.weaknessPatterns.length > 0)
      recommendedFocus.push("weakness_targeting");

    return {
      nextWeekLearningRate,
      retentionRisk,
      motivationTrend,
      recommendedFocus,
    };
  }
}
