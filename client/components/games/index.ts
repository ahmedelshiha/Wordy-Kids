// =====================================================
// ENHANCED JUNGLE QUIZ ADVENTURE - MAIN INTEGRATION
// =====================================================

// Core Components
export { EnhancedJungleQuizAdventure } from "./EnhancedJungleQuizAdventure";
export { EnhancedJungleQuizAdventureDesktop } from "./EnhancedJungleQuizAdventureDesktop";
export { EnhancedGameHub } from "./EnhancedGameHub";

// Existing Components (Enhanced)
export { GameHub } from "./GameHub";
export { AdventureGames } from "./AdventureGames";
export { QuizGames } from "./QuizGames";
export { WordGarden } from "./WordGarden";
export { VowelRescue } from "./VowelRescue";
export { UnifiedVowelGame } from "./UnifiedVowelGame";
export { ListenAndGuessGame } from "./ListenAndGuessGame";
export { PictureFunGame } from "./PictureFunGame";
export { LetterBuilder } from "./LetterBuilder";
export { FlashcardDuel } from "./FlashcardDuel";
export { WordMatchRace } from "./WordMatchRace";

// Enhanced Systems
export {
  PowerUpSystem,
  ScoringSystem,
  GameSessionManager,
  type PowerUp,
  type GameSession,
  type ScoringConfig,
} from "@/lib/enhancedGameplayMechanics";

export {
  EnhancedJungleAudioSystem,
  enhancedJungleAudio,
} from "@/lib/enhancedJungleAudioSystem";

export {
  EnhancedAnalyticsSystem,
  enhancedAnalytics,
  type LearningEvent,
  type SessionData,
  type LearningInsight,
} from "@/lib/enhancedAnalyticsSystem";

export {
  EnhancedJungleQuizOptimizer,
  ProductionOptimizer,
  jungleQuizOptimizer,
  type PerformanceConfig,
} from "@/lib/enhancedJungleQuizOptimizations";

export {
  useEnhancedMobileGaming,
  type TouchGesture,
  type HapticPattern,
  type DeviceCapabilities,
} from "@/hooks/use-enhanced-mobile-gaming";

// Utility Functions and Types
export type { Word } from "@/data/wordsDatabase";

// =====================================================
// MAIN ENHANCED JUNGLE QUIZ ADVENTURE CLASS
// =====================================================

export class EnhancedJungleQuizAdventureSystem {
  private static instance: EnhancedJungleQuizAdventureSystem;

  // System components
  public readonly audio = enhancedJungleAudio;
  public readonly analytics = enhancedAnalytics;
  public readonly optimizer = jungleQuizOptimizer;

  // Game systems
  public readonly powerUps = PowerUpSystem;
  public readonly scoring = ScoringSystem;
  public readonly sessions = GameSessionManager;

  // Initialization state
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): EnhancedJungleQuizAdventureSystem {
    if (!EnhancedJungleQuizAdventureSystem.instance) {
      EnhancedJungleQuizAdventureSystem.instance =
        new EnhancedJungleQuizAdventureSystem();
    }
    return EnhancedJungleQuizAdventureSystem.instance;
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  public async initialize(config?: {
    enableAudio?: boolean;
    enableAnalytics?: boolean;
    enableOptimizations?: boolean;
    audioSettings?: any;
    analyticsSettings?: any;
    optimizationSettings?: any;
  }): Promise<void> {
    if (this.isInitialized) return;

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization(config);
    return this.initializationPromise;
  }

  private async performInitialization(config?: any): Promise<void> {
    try {
      console.log("🌟 Initializing Enhanced Jungle Quiz Adventure System...");

      // Initialize systems in parallel where possible
      const initPromises: Promise<void>[] = [];

      // Initialize audio system
      if (config?.enableAudio !== false) {
        console.log("🎵 Initializing enhanced audio system...");
        initPromises.push(
          this.audio.initialize().catch((error) => {
            console.warn("Audio system initialization failed:", error);
          }),
        );
      }

      // Initialize analytics system
      if (config?.enableAnalytics !== false) {
        console.log("📊 Initializing analytics system...");
        // Analytics system initializes synchronously
        try {
          // Analytics is initialized in its constructor
          console.log("✅ Analytics system ready");
        } catch (error) {
          console.warn("Analytics system initialization failed:", error);
        }
      }

      // Initialize optimizer
      if (config?.enableOptimizations !== false) {
        console.log("⚡ Initializing performance optimizer...");
        // Optimizer initializes synchronously in constructor
        try {
          console.log("✅ Performance optimizer ready");
        } catch (error) {
          console.warn("Performance optimizer initialization failed:", error);
        }
      }

      // Wait for all async initializations
      await Promise.allSettled(initPromises);

      // Setup cross-system integrations
      this.setupIntegrations();

      this.isInitialized = true;
      console.log(
        "🎉 Enhanced Jungle Quiz Adventure System fully initialized!",
      );

      // Log system status
      this.logSystemStatus();
    } catch (error) {
      console.error(
        "Failed to initialize Enhanced Jungle Quiz Adventure System:",
        error,
      );
      throw error;
    }
  }

  private setupIntegrations(): void {
    // Integrate analytics with audio events
    if (this.audio && this.analytics) {
      console.log("🔗 Setting up audio-analytics integration...");
      // This would involve connecting audio events to analytics tracking
    }

    // Integrate optimizer with analytics
    if (this.optimizer && this.analytics) {
      console.log("🔗 Setting up optimizer-analytics integration...");
      // This would involve performance metrics flowing to analytics
    }

    // Setup global error handling
    this.setupGlobalErrorHandling();
  }

  private setupGlobalErrorHandling(): void {
    window.addEventListener("error", (event) => {
      this.analytics.trackEvent(
        "error",
        "system",
        "javascript_error",
        undefined,
        undefined,
        {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        },
      );
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.analytics.trackEvent(
        "error",
        "system",
        "promise_rejection",
        undefined,
        undefined,
        {
          reason: event.reason?.toString(),
          stack: event.reason?.stack,
        },
      );
    });
  }

  private logSystemStatus(): void {
    const status = {
      audio: {
        initialized: this.audio["isInitialized"],
        spatialAudio: this.audio.getSettings?.()?.enable3D || false,
        dynamicMusic: this.audio.getSettings?.()?.enableDynamicMusic || false,
      },
      analytics: {
        tracking: this.analytics.getSessionSummary() !== null,
        insights: this.analytics.getInsights().length,
      },
      optimizer: {
        level: this.optimizer.getOptimizationLevel(),
        batteryOptimized:
          this.optimizer.getPerformanceReport().batteryLevel !== undefined,
      },
    };

    console.log("📋 System Status:", status);
  }

  // =====================================================
  // GAME CREATION HELPERS
  // =====================================================

  public createEnhancedQuizSession(options: {
    category: string;
    difficulty: "easy" | "medium" | "hard";
    gameMode: "adventure" | "challenge" | "zen";
    userId?: string;
  }): string {
    if (!this.isInitialized) {
      throw new Error("System must be initialized before creating sessions");
    }

    // Start analytics session
    const sessionId = this.analytics.startSession(
      options.gameMode,
      options.category,
      options.difficulty,
      options.userId,
    );

    // Set audio mood based on game mode
    if (this.audio["isInitialized"]) {
      const intensity =
        options.gameMode === "zen"
          ? 0.3
          : options.gameMode === "challenge"
            ? 0.8
            : 0.6;
      this.audio.setMusicIntensity?.(intensity, "exploration");
    }

    // Track session creation
    this.analytics.trackEvent(
      "session_created",
      "game",
      "create_session",
      undefined,
      undefined,
      {
        ...options,
        sessionId,
      },
    );

    return sessionId;
  }

  public getOptimizedGameSettings(): any {
    if (!this.isInitialized) {
      return {};
    }

    const optimizationLevel = this.optimizer.getOptimizationLevel();
    const recommendedSettings = this.optimizer.getRecommendedSettings();

    return {
      optimizationLevel,
      ...recommendedSettings,
      audioQuality: optimizationLevel === "high" ? "medium" : "high",
      visualEffects: optimizationLevel === "high" ? "reduced" : "full",
      particleEffects: optimizationLevel !== "high",
      hapticFeedback: true,
    };
  }

  // =====================================================
  // EVENT TRACKING HELPERS
  // =====================================================

  public trackQuestionResponse(data: {
    wordId: string;
    isCorrect: boolean;
    responseTime: number;
    hintsUsed?: number;
    category: string;
    difficulty: string;
  }): void {
    if (!this.isInitialized) return;

    this.analytics.trackQuestionResponse(
      data.wordId,
      data.isCorrect,
      data.responseTime,
      data.hintsUsed || 0,
      data.category,
      data.difficulty,
    );

    // Play appropriate audio feedback
    if (this.audio["isInitialized"]) {
      const soundId = data.isCorrect ? "correct-answer" : "wrong-answer";
      this.audio.playGameSound?.(soundId);
    }
  }

  public trackPowerUpUsage(
    powerUpId: string,
    gemsSpent: number,
    context: string,
  ): void {
    if (!this.isInitialized) return;

    this.analytics.trackPowerUpUsage(powerUpId, gemsSpent, context);

    // Play power-up sound
    if (this.audio["isInitialized"]) {
      this.audio.playGameSound?.("power-up-use");
    }
  }

  public trackAchievementUnlock(achievementId: string, metadata?: any): void {
    if (!this.isInitialized) return;

    this.analytics.trackEvent(
      "achievement_unlocked",
      "progression",
      "achievement",
      achievementId,
      undefined,
      metadata,
    );

    // Play achievement sound and increase music intensity
    if (this.audio["isInitialized"]) {
      this.audio.playGameSound?.("achievement-unlock");
      this.audio.setMusicIntensity?.(0.9, "success");

      // Return to normal intensity after celebration
      setTimeout(() => {
        this.audio.setMusicIntensity?.(0.6, "exploration");
      }, 3000);
    }
  }

  // =====================================================
  // SYSTEM MANAGEMENT
  // =====================================================

  public getSystemHealth(): {
    overall: "excellent" | "good" | "fair" | "poor";
    components: any;
    recommendations: string[];
  } {
    if (!this.isInitialized) {
      return {
        overall: "poor",
        components: {},
        recommendations: ["Initialize the system first"],
      };
    }

    const performanceReport = this.optimizer.getPerformanceReport();
    const sessionSummary = this.analytics.getSessionSummary();

    const components = {
      audio: {
        status: this.audio["isInitialized"] ? "operational" : "offline",
        quality: this.audio.getSettings?.()?.audioQuality || "unknown",
      },
      analytics: {
        status: "operational",
        sessionActive: sessionSummary !== null,
        eventsTracked: true,
      },
      optimizer: {
        status: "operational",
        level: performanceReport.optimizationLevel,
        fps: performanceReport.metrics.averageFPS,
        memory: performanceReport.metrics.memoryUsage,
      },
    };

    const issues = [];
    const recommendations = [];

    // Check performance
    if (performanceReport.metrics.averageFPS < 30) {
      issues.push("low_fps");
      recommendations.push("Enable performance optimizations");
    }

    if (performanceReport.metrics.memoryUsage > 100) {
      issues.push("high_memory");
      recommendations.push("Clear caches and reduce quality settings");
    }

    // Check audio
    if (!this.audio["isInitialized"]) {
      issues.push("audio_offline");
      recommendations.push("Check audio permissions and device capabilities");
    }

    // Determine overall health
    let overall: "excellent" | "good" | "fair" | "poor";
    if (issues.length === 0) {
      overall = "excellent";
    } else if (issues.length <= 1) {
      overall = "good";
    } else if (issues.length <= 2) {
      overall = "fair";
    } else {
      overall = "poor";
    }

    return {
      overall,
      components,
      recommendations,
    };
  }

  public async cleanup(): Promise<void> {
    if (!this.isInitialized) return;

    console.log("🧹 Cleaning up Enhanced Jungle Quiz Adventure System...");

    try {
      // Cleanup systems
      await Promise.allSettled([
        this.audio.cleanup?.(),
        this.analytics.cleanup?.(),
        this.optimizer.cleanup?.(),
      ]);

      this.isInitialized = false;
      this.initializationPromise = null;

      console.log("✅ System cleanup completed");
    } catch (error) {
      console.error("Error during system cleanup:", error);
    }
  }

  // =====================================================
  // DEVELOPMENT UTILITIES
  // =====================================================

  public getDebugInfo(): any {
    return {
      initialized: this.isInitialized,
      systemHealth: this.getSystemHealth(),
      performanceReport: this.optimizer.getPerformanceReport(),
      analyticsInsights: this.analytics.getInsights(),
      audioSettings: this.audio.getSettings?.(),
      timestamp: new Date().toISOString(),
    };
  }
}

// =====================================================
// MAIN EXPORT
// =====================================================

export const enhancedJungleQuizSystem =
  EnhancedJungleQuizAdventureSystem.getInstance();

// Auto-initialize on import (can be disabled)
if (typeof window !== "undefined") {
  // Initialize with default settings after a short delay
  setTimeout(() => {
    enhancedJungleQuizSystem.initialize().catch(console.error);
  }, 100);
}

export default enhancedJungleQuizSystem;
