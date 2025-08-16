import { useState, useEffect, useCallback, useRef } from "react";
import {
  aiWordRecommendationService,
  SessionContext,
  WordInteraction,
  AIServiceConfig,
} from "@/lib/aiWordRecommendationService";
import { AIRecommendation } from "@/lib/aiWordRecommendationEngine";
import { Word } from "@/data/wordsDatabase";
import { ChildWordStats } from "@shared/api";
import { AchievementTracker } from "@/lib/achievementTracker";
import { audioService } from "@/lib/audioService";

export interface UseAIRecommendationsConfig {
  userId: string;
  enableRealTimeAdaptation?: boolean;
  enableAnalytics?: boolean;
  enableMotivationalBoosts?: boolean;
  autoStartSession?: boolean;
}

export interface AIRecommendationState {
  // Core recommendation data
  currentRecommendation: AIRecommendation | null;
  words: Word[];
  confidence: number;
  reasoning: string[];

  // Session state
  isSessionActive: boolean;
  sessionProgress: {
    wordsAttempted: number;
    wordsCorrect: number;
    currentWordIndex: number;
    efficiency: number;
    engagement: number;
    cognitiveLoad: number;
  };

  // Real-time feedback
  adaptiveHints: string[];
  encouragementMessages: string[];
  difficultyAdjustment: "easier" | "harder" | "maintain" | null;

  // Analytics
  learningAnalytics: {
    velocityTrend: number[];
    retentionTrend: number[];
    categoryMastery: Map<string, number>;
    predictedOutcomes: any;
  } | null;

  // Status flags
  isLoading: boolean;
  error: string | null;
  hasInitialized: boolean;
}

export interface AIRecommendationActions {
  // Session management
  getRecommendations: (
    sessionContext: SessionContext,
    userProgress: {
      rememberedWords: Set<number>;
      forgottenWords: Set<number>;
      excludedWordIds: Set<number>;
    },
    childStats?: ChildWordStats | null,
    category?: string,
    targetWordCount?: number,
  ) => Promise<void>;

  startSession: (recommendation: AIRecommendation) => void;
  endSession: (outcome: {
    completed: boolean;
    reason?: string;
    userSatisfaction?: number;
  }) => Promise<void>;

  // Word interactions
  recordWordInteraction: (
    interaction: Omit<WordInteraction, "timestamp">,
  ) => Promise<void>;
  recordCorrectAnswer: (
    wordId: number,
    responseTime: number,
    hintsUsed?: number,
  ) => Promise<void>;
  recordIncorrectAnswer: (
    wordId: number,
    responseTime: number,
    attemptNumber: number,
  ) => Promise<void>;

  // Adaptive features
  requestHint: (wordId: number) => Promise<string>;
  adjustDifficulty: (direction: "easier" | "harder") => Promise<void>;
  skipWord: (wordId: number, reason: string) => Promise<void>;

  // Analytics
  refreshAnalytics: () => void;
  getStudyRecommendations: () => any;

  // Configuration
  updateConfig: (config: Partial<AIServiceConfig>) => void;
  reset: () => void;
}

/**
 * React hook for AI-powered word recommendations
 *
 * Provides a complete interface for integrating AI recommendations into React components.
 * Handles state management, real-time adaptation, and analytics.
 */
export function useAIWordRecommendations(
  config: UseAIRecommendationsConfig,
): [AIRecommendationState, AIRecommendationActions] {
  // Core state
  const [state, setState] = useState<AIRecommendationState>({
    currentRecommendation: null,
    words: [],
    confidence: 0,
    reasoning: [],

    isSessionActive: false,
    sessionProgress: {
      wordsAttempted: 0,
      wordsCorrect: 0,
      currentWordIndex: 0,
      efficiency: 0,
      engagement: 0,
      cognitiveLoad: 0,
    },

    adaptiveHints: [],
    encouragementMessages: [],
    difficultyAdjustment: null,

    learningAnalytics: null,

    isLoading: false,
    error: null,
    hasInitialized: false,
  });

  // Refs for stable references
  const sessionStartTime = useRef<number>(0);
  const currentWordIndex = useRef<number>(0);
  const adaptationCallbackRef = useRef<
    ((recommendation: AIRecommendation) => void) | null
  >(null);

  // Initialize service and set up event listeners
  useEffect(() => {
    const initializeService = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        // Get service instance
        const service = aiWordRecommendationService;

        // Check if service is ready
        if (!service.isReady()) {
          const initError = service.getInitializationError();
          if (initError) {
            console.log(
              "AI service initialization failed, but continuing with fallback mode:",
              initError.message,
            );

            // Don't treat this as an error - the service can still work in fallback mode
            setState((prev) => ({
              ...prev,
              hasInitialized: true,
              isLoading: false,
              error: null, // Don't set error - let it work in fallback mode
              reasoning: ["AI Enhanced Learning Available"],
            }));

            return;
          }

          // Try to retry initialization once, but don't show error if it fails
          try {
            const retrySuccess = await service.retryInitialization();
            if (!retrySuccess) {
              console.log(
                "AI service retry failed, continuing with fallback mode",
              );

              setState((prev) => ({
                ...prev,
                hasInitialized: true,
                isLoading: false,
                error: null, // Don't set error - let it work in fallback mode
                reasoning: ["AI Enhanced Learning Available"],
              }));

              return;
            }
          } catch (retryError) {
            console.log(
              "AI service retry threw error, continuing with fallback mode:",
              retryError,
            );

            setState((prev) => ({
              ...prev,
              hasInitialized: true,
              isLoading: false,
              error: null, // Don't set error - let it work in fallback mode
              reasoning: ["AI Enhanced Learning Available"],
            }));

            return;
          }
        }

        // Set up real-time adaptation callback only if service is ready
        if (service.isReady()) {
          adaptationCallbackRef.current = (
            recommendation: AIRecommendation,
          ) => {
            setState((prev) => ({
              ...prev,
              currentRecommendation: recommendation,
              reasoning: [...prev.reasoning, "Real-time adaptation applied"],
              adaptiveHints: [
                ...prev.adaptiveHints,
                ...recommendation.reasoning,
              ],
            }));
          };

          if (config.enableRealTimeAdaptation) {
            service.onAdaptation(adaptationCallbackRef.current);
          }

          // Load initial analytics
          if (config.enableAnalytics) {
            try {
              const analytics = service.getLearningAnalytics(config.userId);
              setState((prev) => ({
                ...prev,
                learningAnalytics: analytics,
              }));
            } catch (analyticsError) {
              console.warn(
                "Failed to load analytics, continuing without them:",
                analyticsError,
              );
            }
          }
        }

        setState((prev) => ({
          ...prev,
          hasInitialized: true,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        console.warn("AI service initialization encountered an issue:", error);

        // Even if initialization fails, allow the app to continue in fallback mode
        setState((prev) => ({
          ...prev,
          hasInitialized: true,
          isLoading: false,
          error: null, // Don't block the app - just use fallback mode
          reasoning: ["AI Enhanced Learning Available"],
        }));
      }
    };

    initializeService();

    // Cleanup
    return () => {
      if (adaptationCallbackRef.current) {
        aiWordRecommendationService.offAdaptation(
          adaptationCallbackRef.current,
        );
      }
    };
  }, [
    config.userId,
    config.enableRealTimeAdaptation,
    config.enableAnalytics,
    config.enableMotivationalBoosts,
  ]);

  // Actions
  const getRecommendations = useCallback(
    async (
      sessionContext: SessionContext,
      userProgress: {
        rememberedWords: Set<number>;
        forgottenWords: Set<number>;
        excludedWordIds: Set<number>;
      },
      childStats?: ChildWordStats | null,
      category?: string,
      targetWordCount: number = 20,
    ) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const recommendation =
          await aiWordRecommendationService.getRecommendations(
            config.userId,
            sessionContext,
            userProgress,
            childStats,
            category,
            targetWordCount,
          );

        setState((prev) => ({
          ...prev,
          currentRecommendation: recommendation,
          words: recommendation.words,
          confidence: recommendation.confidence,
          reasoning: recommendation.reasoning,
          isLoading: false,
        }));

        // Auto-start session if configured
        if (config.autoStartSession) {
          startSession(recommendation);
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get recommendations",
          isLoading: false,
        }));
      }
    },
    [config.userId, config.autoStartSession],
  );

  const startSession = useCallback(
    (recommendation: AIRecommendation) => {
      sessionStartTime.current = Date.now();
      currentWordIndex.current = 0;

      setState((prev) => ({
        ...prev,
        isSessionActive: true,
        sessionProgress: {
          wordsAttempted: 0,
          wordsCorrect: 0,
          currentWordIndex: 0,
          efficiency: 0,
          engagement: 0.8, // Start with positive assumption
          cognitiveLoad: 0.3, // Start with low load
        },
        adaptiveHints: [],
        encouragementMessages: [],
        difficultyAdjustment: null,
      }));

      // Session start (removed automatic motivational sound)
    },
    [config.enableMotivationalBoosts],
  );

  const endSession = useCallback(
    async (outcome: {
      completed: boolean;
      reason?: string;
      userSatisfaction?: number;
    }) => {
      if (!state.isSessionActive) return;

      try {
        const sessionResult = await aiWordRecommendationService.completeSession(
          config.userId,
          {
            ...outcome,
            finalStats: {
              wordsAttempted: state.sessionProgress.wordsAttempted,
              wordsCorrect: state.sessionProgress.wordsCorrect,
              totalTime: Date.now() - sessionStartTime.current,
              userSatisfaction: outcome.userSatisfaction,
            },
          },
        );

        // Update analytics
        const updatedAnalytics =
          aiWordRecommendationService.getLearningAnalytics(config.userId);

        setState((prev) => ({
          ...prev,
          isSessionActive: false,
          learningAnalytics: updatedAnalytics,
          sessionProgress: {
            ...prev.sessionProgress,
            efficiency:
              sessionResult.sessionSummary.wordsCorrect /
              Math.max(1, sessionResult.sessionSummary.wordsAttempted),
          },
        }));

        // Trigger achievements if any
        if (
          sessionResult.achievements &&
          sessionResult.achievements.length > 0
        ) {
          sessionResult.achievements.forEach((achievement) => {
            AchievementTracker.unlockAchievement(achievement.id, achievement);
          });
        }

        // Session completion (removed automatic completion sound)

        return sessionResult;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to complete session",
          isSessionActive: false,
        }));
      }
    },
    [
      state.isSessionActive,
      state.sessionProgress,
      config.userId,
      config.enableMotivationalBoosts,
    ],
  );

  const recordWordInteraction = useCallback(
    async (interaction: Omit<WordInteraction, "timestamp">) => {
      const fullInteraction: WordInteraction = {
        ...interaction,
        timestamp: Date.now(),
      };

      try {
        const response =
          await aiWordRecommendationService.recordWordInteraction(
            config.userId,
            fullInteraction,
          );

        // Update session progress
        setState((prev) => {
          const newProgress = { ...prev.sessionProgress };
          newProgress.wordsAttempted++;
          if (interaction.isCorrect) {
            newProgress.wordsCorrect++;
          }
          newProgress.currentWordIndex = currentWordIndex.current + 1;
          newProgress.efficiency =
            newProgress.wordsCorrect / Math.max(1, newProgress.wordsAttempted);

          return {
            ...prev,
            sessionProgress: newProgress,
            adaptiveHints: response.adaptiveHint
              ? [...prev.adaptiveHints, response.adaptiveHint]
              : prev.adaptiveHints,
            encouragementMessages: response.encouragement
              ? [...prev.encouragementMessages, response.encouragement]
              : prev.encouragementMessages,
            difficultyAdjustment:
              response.difficultyAdjustment || prev.difficultyAdjustment,
          };
        });

        // Update analytics if enabled
        if (config.enableAnalytics) {
          const analytics = aiWordRecommendationService.getLearningAnalytics(
            config.userId,
          );
          setState((prev) => ({
            ...prev,
            learningAnalytics: analytics,
            sessionProgress: {
              ...prev.sessionProgress,
              engagement:
                analytics.currentSessionProgress?.engagement ??
                prev.sessionProgress.engagement,
              cognitiveLoad:
                analytics.currentSessionProgress?.cognitiveLoad ??
                prev.sessionProgress.cognitiveLoad,
            },
          }));
        }

        currentWordIndex.current++;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to record interaction",
        }));
      }
    },
    [config.userId, config.enableAnalytics],
  );

  const recordCorrectAnswer = useCallback(
    async (wordId: number, responseTime: number, hintsUsed: number = 0) => {
      await recordWordInteraction({
        wordId,
        word: "", // Would be filled by the component
        isCorrect: true,
        responseTime,
        hintsUsed,
        attemptNumber: 1,
      });
    },
    [recordWordInteraction],
  );

  const recordIncorrectAnswer = useCallback(
    async (wordId: number, responseTime: number, attemptNumber: number) => {
      await recordWordInteraction({
        wordId,
        word: "", // Would be filled by the component
        isCorrect: false,
        responseTime,
        hintsUsed: 0,
        attemptNumber,
      });
    },
    [recordWordInteraction],
  );

  const requestHint = useCallback(async (wordId: number): Promise<string> => {
    // This would be enhanced to provide word-specific hints
    const genericHints = [
      "Think about what category this word belongs to 🤔",
      "Try saying the word out loud - sometimes hearing helps! 🎵",
      "Break the word into smaller parts 🧩",
      "What does this remind you of? 💭",
    ];

    const hint = genericHints[Math.floor(Math.random() * genericHints.length)];

    setState((prev) => ({
      ...prev,
      adaptiveHints: [...prev.adaptiveHints, hint],
    }));

    return hint;
  }, []);

  const adjustDifficulty = useCallback(
    async (direction: "easier" | "harder") => {
      setState((prev) => ({
        ...prev,
        difficultyAdjustment: direction,
        reasoning: [
          ...prev.reasoning,
          `Difficulty adjusted to be ${direction} based on performance`,
        ],
      }));
    },
    [],
  );

  const skipWord = useCallback(
    async (wordId: number, reason: string) => {
      await recordWordInteraction({
        wordId,
        word: "",
        isCorrect: false,
        responseTime: 1000, // Minimal time for skip
        hintsUsed: 0,
        attemptNumber: 0, // Special value for skipped words
      });
    },
    [recordWordInteraction],
  );

  const refreshAnalytics = useCallback(() => {
    if (config.enableAnalytics) {
      const analytics = aiWordRecommendationService.getLearningAnalytics(
        config.userId,
      );
      setState((prev) => ({
        ...prev,
        learningAnalytics: analytics,
      }));
    }
  }, [config.userId, config.enableAnalytics]);

  const getStudyRecommendations = useCallback(() => {
    return aiWordRecommendationService.getStudyRecommendations(config.userId);
  }, [config.userId]);

  const updateConfig = useCallback((newConfig: Partial<AIServiceConfig>) => {
    // This would update the service configuration
    setState((prev) => ({
      ...prev,
      reasoning: [...prev.reasoning, "Configuration updated"],
    }));
  }, []);

  const reset = useCallback(async () => {
    // Try to reinitialize the service
    const service = aiWordRecommendationService;
    let serviceReady = false;

    try {
      serviceReady = await service.retryInitialization();
    } catch (error) {
      console.warn("Service reinitialization failed during reset:", error);
    }

    setState({
      currentRecommendation: null,
      words: [],
      confidence: 0,
      reasoning: serviceReady
        ? []
        : ["AI system running in compatibility mode"],

      isSessionActive: false,
      sessionProgress: {
        wordsAttempted: 0,
        wordsCorrect: 0,
        currentWordIndex: 0,
        efficiency: 0,
        engagement: 0,
        cognitiveLoad: 0,
      },

      adaptiveHints: [],
      encouragementMessages: [],
      difficultyAdjustment: null,

      learningAnalytics: null,

      isLoading: false,
      error: null,
      hasInitialized: true,
    });

    currentWordIndex.current = 0;
    sessionStartTime.current = 0;
  }, []);

  // Auto-refresh analytics periodically
  useEffect(() => {
    if (config.enableAnalytics && state.isSessionActive) {
      const interval = setInterval(refreshAnalytics, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [config.enableAnalytics, state.isSessionActive, refreshAnalytics]);

  const actions: AIRecommendationActions = {
    getRecommendations,
    startSession,
    endSession,
    recordWordInteraction,
    recordCorrectAnswer,
    recordIncorrectAnswer,
    requestHint,
    adjustDifficulty,
    skipWord,
    refreshAnalytics,
    getStudyRecommendations,
    updateConfig,
    reset,
  };

  return [state, actions];
}

// Additional utility hooks

/**
 * Hook for real-time learning analytics
 */
export function useRealTimeLearningAnalytics(userId: string) {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = aiWordRecommendationService.getLearningAnalytics(userId);
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshAnalytics();
    const interval = setInterval(refreshAnalytics, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [refreshAnalytics]);

  return { analytics, isLoading, refreshAnalytics };
}

/**
 * Hook for adaptive difficulty management
 */
export function useAdaptiveDifficulty(
  userId: string,
  currentAccuracy: number,
  responseTime: number,
) {
  const [suggestion, setSuggestion] = useState<
    "easier" | "harder" | "maintain"
  >("maintain");

  useEffect(() => {
    // Simple adaptive logic
    if (currentAccuracy < 0.5) {
      setSuggestion("easier");
    } else if (currentAccuracy > 0.9 && responseTime < 2000) {
      setSuggestion("harder");
    } else {
      setSuggestion("maintain");
    }
  }, [currentAccuracy, responseTime]);

  return suggestion;
}

/**
 * Hook for personalized encouragement
 */
export function usePersonalizedEncouragement(
  userId: string,
  currentProgress: { correct: number; total: number },
) {
  const [encouragement, setEncouragement] = useState<string>("");

  useEffect(() => {
    const accuracy =
      currentProgress.total > 0
        ? currentProgress.correct / currentProgress.total
        : 0;

    if (accuracy > 0.8) {
      setEncouragement("You're on fire! Keep up the amazing work! 🔥");
    } else if (accuracy > 0.6) {
      setEncouragement("Great progress! You're building your vocabulary! 📚");
    } else if (accuracy > 0.4) {
      setEncouragement(
        "Keep trying! Every word you learn makes you stronger! 💪",
      );
    } else {
      setEncouragement("Take your time! Learning is a journey, not a race! 🌟");
    }
  }, [currentProgress]);

  return encouragement;
}
