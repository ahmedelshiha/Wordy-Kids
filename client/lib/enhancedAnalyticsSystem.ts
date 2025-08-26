// =====================================================
// ENHANCED ANALYTICS SYSTEM - COMPREHENSIVE TRACKING
// =====================================================

interface LearningEvent {
  id: string;
  timestamp: Date;
  eventType: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata: Record<string, any>;
  userId?: string;
  sessionId: string;
  gameMode?: string;
  difficulty?: string;
}

interface SessionData {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // milliseconds
  gameMode: string;
  category: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  hintsUsed: number;
  powerUpsUsed: PowerUpUsage[];
  averageResponseTime: number;
  streakData: StreakData;
  engagementMetrics: EngagementMetrics;
  learningPatterns: LearningPattern[];
  deviceInfo: DeviceInfo;
  performanceMetrics: PerformanceMetrics;
}

interface StreakData {
  currentStreak: number;
  maxStreak: number;
  streakBreaks: number;
  averageStreakLength: number;
  streakByCategory: Record<string, number>;
}

interface EngagementMetrics {
  focusTime: number; // time window was in focus
  clickCount: number;
  scrollDistance: number;
  gestureCount: number;
  pauseCount: number;
  pauseDuration: number;
  backgroundTime: number; // time spent in background
  interactionRate: number; // interactions per minute
  attentionScore: number; // 0-1 based on various factors
  motivationIndicators: MotivationIndicator[];
}

interface MotivationIndicator {
  type:
    | "celebration_viewed"
    | "retry_attempt"
    | "power_up_purchase"
    | "achievement_pursuit"
    | "time_extension";
  timestamp: Date;
  context: string;
  intensity: number; // 0-1
}

interface LearningPattern {
  type:
    | "speed_improvement"
    | "accuracy_improvement"
    | "difficulty_preference"
    | "time_of_day"
    | "category_preference";
  confidence: number; // 0-1
  description: string;
  data: Record<string, any>;
  detectedAt: Date;
}

interface DeviceInfo {
  platform: string;
  screenSize: { width: number; height: number };
  deviceType: "mobile" | "tablet" | "desktop";
  touchCapable: boolean;
  connectionType: string;
  batteryLevel?: number;
  orientation: "portrait" | "landscape";
}

interface PerformanceMetrics {
  averageFPS: number;
  memoryUsage: number;
  loadTime: number;
  renderTime: number;
  audioLatency: number;
  gestureResponseTime: number;
  errorCount: number;
  warningCount: number;
}

interface PowerUpUsage {
  powerUpId: string;
  timestamp: Date;
  context: string;
  effectiveness: number; // 0-1 based on outcome
  gemsSpent: number;
}

interface LearningInsight {
  type:
    | "strength"
    | "improvement_area"
    | "recommendation"
    | "pattern"
    | "milestone";
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  suggestions: string[];
  data: Record<string, any>;
  createdAt: Date;
}

interface AnalyticsConfig {
  enableTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enableLearningPatterns: boolean;
  enableBehavioralAnalysis: boolean;
  dataRetentionDays: number;
  batchSize: number;
  flushInterval: number; // milliseconds
  privacyMode: "minimal" | "standard" | "detailed";
}

// =====================================================
// ENHANCED ANALYTICS SYSTEM CLASS
// =====================================================

export class EnhancedAnalyticsSystem {
  private config: AnalyticsConfig;
  private eventQueue: LearningEvent[] = [];
  private currentSession: SessionData | null = null;
  private sessionBuffer: SessionData[] = [];
  private insights: LearningInsight[] = [];

  // Performance monitoring
  private performanceObserver: PerformanceObserver | null = null;
  private memoryMonitorInterval: NodeJS.Timeout | null = null;
  private fpsMonitor: { frameCount: number; startTime: number } | null = null;

  // Engagement tracking
  private focusStartTime: number | null = null;
  private lastInteractionTime: number = Date.now();
  private gestureBuffer: Array<{ type: string; timestamp: number }> = [];
  private attentionMetrics = {
    totalFocusTime: 0,
    totalBackgroundTime: 0,
    interactionCount: 0,
    pauseCount: 0,
    lastActivityTime: Date.now(),
  };

  // Learning pattern detection
  private responseTimeHistory: Array<{
    timestamp: Date;
    responseTime: number;
    correct: boolean;
  }> = [];
  private categoryPerformance = new Map<
    string,
    { correct: number; total: number; avgTime: number }
  >();
  private timeOfDayPerformance = new Map<
    number,
    { accuracy: number; engagement: number }
  >();

  // Data storage
  private storage: Storage;
  private isOnline: boolean = navigator.onLine;

  constructor(config?: Partial<AnalyticsConfig>) {
    this.config = {
      enableTracking: true,
      enablePerformanceMonitoring: true,
      enableLearningPatterns: true,
      enableBehavioralAnalysis: true,
      dataRetentionDays: 30,
      batchSize: 50,
      flushInterval: 30000, // 30 seconds
      privacyMode: "standard",
      ...config,
    };

    this.storage = localStorage;
    this.initialize();
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  private initialize(): void {
    if (!this.config.enableTracking) return;

    // Set up event listeners
    this.setupEventListeners();

    // Initialize performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.initializePerformanceMonitoring();
    }

    // Start periodic data flush
    setInterval(() => {
      this.flushData();
    }, this.config.flushInterval);

    // Load existing data
    this.loadStoredData();

    console.log("Enhanced Analytics System initialized");
  }

  private setupEventListeners(): void {
    // Focus and visibility tracking
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this),
    );
    window.addEventListener("focus", this.handleWindowFocus.bind(this));
    window.addEventListener("blur", this.handleWindowBlur.bind(this));

    // Interaction tracking
    document.addEventListener("click", this.trackInteraction.bind(this));
    document.addEventListener("touchstart", this.trackInteraction.bind(this));
    document.addEventListener("keydown", this.trackInteraction.bind(this));

    // Network status
    window.addEventListener("online", () => {
      this.isOnline = true;
    });
    window.addEventListener("offline", () => {
      this.isOnline = false;
    });

    // Unload handling
    window.addEventListener("beforeunload", this.handleBeforeUnload.bind(this));

    // Error tracking
    window.addEventListener("error", this.trackError.bind(this));
    window.addEventListener("unhandledrejection", this.trackError.bind(this));
  }

  private initializePerformanceMonitoring(): void {
    // Performance Observer for detailed metrics
    if ("PerformanceObserver" in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.processPerformanceEntries(entries);
      });

      this.performanceObserver.observe({
        type: "measure",
        buffered: true,
      });

      this.performanceObserver.observe({
        type: "navigation",
        buffered: true,
      });
    }

    // Memory monitoring
    if ("memory" in performance) {
      this.memoryMonitorInterval = setInterval(() => {
        this.recordMemoryUsage();
      }, 10000); // Every 10 seconds
    }

    // FPS monitoring
    this.startFPSMonitoring();
  }

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  public startSession(
    gameMode: string,
    category: string,
    difficulty: string,
    userId?: string,
  ): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // End previous session if exists
    if (this.currentSession) {
      this.endSession();
    }

    this.currentSession = {
      sessionId,
      userId,
      startTime: new Date(),
      duration: 0,
      gameMode,
      category,
      difficulty,
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      skippedQuestions: 0,
      hintsUsed: 0,
      powerUpsUsed: [],
      averageResponseTime: 0,
      streakData: {
        currentStreak: 0,
        maxStreak: 0,
        streakBreaks: 0,
        averageStreakLength: 0,
        streakByCategory: {},
      },
      engagementMetrics: {
        focusTime: 0,
        clickCount: 0,
        scrollDistance: 0,
        gestureCount: 0,
        pauseCount: 0,
        pauseDuration: 0,
        backgroundTime: 0,
        interactionRate: 0,
        attentionScore: 0,
        motivationIndicators: [],
      },
      learningPatterns: [],
      deviceInfo: this.getDeviceInfo(),
      performanceMetrics: {
        averageFPS: 0,
        memoryUsage: 0,
        loadTime: 0,
        renderTime: 0,
        audioLatency: 0,
        gestureResponseTime: 0,
        errorCount: 0,
        warningCount: 0,
      },
    };

    this.trackEvent(
      "session_start",
      "engagement",
      "session",
      undefined,
      undefined,
      {
        gameMode,
        category,
        difficulty,
        deviceInfo: this.currentSession.deviceInfo,
      },
    );

    return sessionId;
  }

  public endSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = new Date();
    this.currentSession.duration =
      this.currentSession.endTime.getTime() -
      this.currentSession.startTime.getTime();

    // Calculate final metrics
    this.calculateSessionMetrics();

    // Generate insights
    this.generateSessionInsights();

    // Store session
    this.sessionBuffer.push({ ...this.currentSession });

    this.trackEvent(
      "session_end",
      "engagement",
      "session",
      undefined,
      this.currentSession.duration,
      {
        sessionSummary: this.getSessionSummary(),
      },
    );

    this.currentSession = null;
  }

  private calculateSessionMetrics(): void {
    if (!this.currentSession) return;

    const session = this.currentSession;

    // Calculate average response time
    if (this.responseTimeHistory.length > 0) {
      const totalTime = this.responseTimeHistory.reduce(
        (sum, entry) => sum + entry.responseTime,
        0,
      );
      session.averageResponseTime = totalTime / this.responseTimeHistory.length;
    }

    // Calculate attention score
    const totalTime = session.duration;
    const focusRatio = session.engagementMetrics.focusTime / totalTime;
    const interactionDensity =
      session.engagementMetrics.clickCount / (totalTime / 1000 / 60); // per minute
    const pausePenalty = Math.min(
      session.engagementMetrics.pauseCount * 0.1,
      0.3,
    );

    session.engagementMetrics.attentionScore = Math.max(
      0,
      Math.min(
        1,
        focusRatio * 0.4 +
          Math.min(interactionDensity / 10, 1) * 0.4 +
          (session.streakData.maxStreak / 10) * 0.2 -
          pausePenalty,
      ),
    );

    // Calculate interaction rate
    session.engagementMetrics.interactionRate =
      session.engagementMetrics.clickCount / (totalTime / 1000 / 60);

    // Update streak averages
    if (session.streakData.maxStreak > 0) {
      session.streakData.averageStreakLength =
        session.correctAnswers / (session.streakData.streakBreaks + 1);
    }
  }

  // =====================================================
  // EVENT TRACKING
  // =====================================================

  public trackEvent(
    eventType: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    metadata: Record<string, any> = {},
  ): void {
    if (!this.config.enableTracking) return;

    const event: LearningEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      eventType,
      category,
      action,
      label,
      value,
      metadata: {
        ...metadata,
        sessionId: this.currentSession?.sessionId,
        gameMode: this.currentSession?.gameMode,
        difficulty: this.currentSession?.difficulty,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
      userId: this.currentSession?.userId,
      sessionId: this.currentSession?.sessionId || "no-session",
      gameMode: this.currentSession?.gameMode,
      difficulty: this.currentSession?.difficulty,
    };

    this.eventQueue.push(event);

    // Process event for learning patterns
    if (this.config.enableLearningPatterns) {
      this.processEventForPatterns(event);
    }

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flushData();
    }
  }

  public trackQuestionResponse(
    wordId: string,
    isCorrect: boolean,
    responseTime: number,
    hintsUsed: number = 0,
    category: string,
    difficulty: string,
  ): void {
    if (!this.currentSession) return;

    // Update session data
    this.currentSession.totalQuestions++;
    if (isCorrect) {
      this.currentSession.correctAnswers++;
      this.currentSession.streakData.currentStreak++;
      this.currentSession.streakData.maxStreak = Math.max(
        this.currentSession.streakData.maxStreak,
        this.currentSession.streakData.currentStreak,
      );
    } else {
      this.currentSession.incorrectAnswers++;
      if (this.currentSession.streakData.currentStreak > 0) {
        this.currentSession.streakData.streakBreaks++;
      }
      this.currentSession.streakData.currentStreak = 0;
    }

    this.currentSession.hintsUsed += hintsUsed;

    // Track response time
    this.responseTimeHistory.push({
      timestamp: new Date(),
      responseTime,
      correct: isCorrect,
    });

    // Update category performance
    const categoryStats = this.categoryPerformance.get(category) || {
      correct: 0,
      total: 0,
      avgTime: 0,
    };
    categoryStats.total++;
    if (isCorrect) categoryStats.correct++;
    categoryStats.avgTime =
      (categoryStats.avgTime * (categoryStats.total - 1) + responseTime) /
      categoryStats.total;
    this.categoryPerformance.set(category, categoryStats);

    // Track the event
    this.trackEvent(
      "question_response",
      "learning",
      isCorrect ? "correct" : "incorrect",
      wordId,
      responseTime,
      {
        category,
        difficulty,
        hintsUsed,
        streak: this.currentSession.streakData.currentStreak,
        questionNumber: this.currentSession.totalQuestions,
      },
    );
  }

  public trackPowerUpUsage(
    powerUpId: string,
    gemsSpent: number,
    context: string,
  ): void {
    if (!this.currentSession) return;

    const usage: PowerUpUsage = {
      powerUpId,
      timestamp: new Date(),
      context,
      effectiveness: 0, // Will be updated based on outcome
      gemsSpent,
    };

    this.currentSession.powerUpsUsed.push(usage);

    this.trackEvent(
      "power_up_used",
      "gameplay",
      "power_up",
      powerUpId,
      gemsSpent,
      {
        context,
        remainingGems: this.getRemainingGems(), // You'd implement this based on your game state
      },
    );
  }

  public trackEngagementAction(
    action: string,
    metadata: Record<string, any> = {},
  ): void {
    if (!this.currentSession) return;

    switch (action) {
      case "motivation_celebration_viewed":
        this.currentSession.engagementMetrics.motivationIndicators.push({
          type: "celebration_viewed",
          timestamp: new Date(),
          context: metadata.context || "",
          intensity: metadata.intensity || 0.8,
        });
        break;
      case "retry_attempt":
        this.currentSession.engagementMetrics.motivationIndicators.push({
          type: "retry_attempt",
          timestamp: new Date(),
          context: metadata.context || "",
          intensity: 0.6,
        });
        break;
      case "achievement_pursuit":
        this.currentSession.engagementMetrics.motivationIndicators.push({
          type: "achievement_pursuit",
          timestamp: new Date(),
          context: metadata.context || "",
          intensity: metadata.intensity || 0.7,
        });
        break;
    }

    this.trackEvent(
      "engagement_action",
      "engagement",
      action,
      undefined,
      undefined,
      metadata,
    );
  }

  // =====================================================
  // LEARNING PATTERN DETECTION
  // =====================================================

  private processEventForPatterns(event: LearningEvent): void {
    if (!this.config.enableLearningPatterns || !this.currentSession) return;

    // Speed improvement detection
    if (
      event.eventType === "question_response" &&
      this.responseTimeHistory.length >= 10
    ) {
      this.detectSpeedImprovement();
    }

    // Accuracy improvement detection
    if (
      event.eventType === "question_response" &&
      this.currentSession.totalQuestions >= 10
    ) {
      this.detectAccuracyImprovement();
    }

    // Time of day patterns
    this.updateTimeOfDayPerformance(event);

    // Category preferences
    if (event.category === "learning" && event.metadata.category) {
      this.updateCategoryPreferences(
        event.metadata.category,
        event.action === "correct",
      );
    }
  }

  private detectSpeedImprovement(): void {
    if (this.responseTimeHistory.length < 10) return;

    const recent = this.responseTimeHistory.slice(-5);
    const earlier = this.responseTimeHistory.slice(-10, -5);

    const recentAvg =
      recent.reduce((sum, r) => sum + r.responseTime, 0) / recent.length;
    const earlierAvg =
      earlier.reduce((sum, r) => sum + r.responseTime, 0) / earlier.length;

    const improvement = (earlierAvg - recentAvg) / earlierAvg;

    if (improvement > 0.15) {
      // 15% improvement
      const pattern: LearningPattern = {
        type: "speed_improvement",
        confidence: Math.min(improvement * 2, 1),
        description: `Response time improved by ${Math.round(improvement * 100)}%`,
        data: {
          previousAvg: earlierAvg,
          currentAvg: recentAvg,
          improvement: improvement,
        },
        detectedAt: new Date(),
      };

      this.currentSession!.learningPatterns.push(pattern);
    }
  }

  private detectAccuracyImprovement(): void {
    if (!this.currentSession || this.currentSession.totalQuestions < 10) return;

    const recentQuestions = Math.min(5, this.currentSession.totalQuestions);
    const earlierQuestions = Math.min(
      5,
      this.currentSession.totalQuestions - recentQuestions,
    );

    if (earlierQuestions < 3) return;

    // Calculate recent accuracy (last 5 questions)
    const recentEvents = this.eventQueue
      .filter(
        (e) =>
          e.eventType === "question_response" &&
          e.sessionId === this.currentSession!.sessionId,
      )
      .slice(-recentQuestions);

    const recentCorrect = recentEvents.filter(
      (e) => e.action === "correct",
    ).length;
    const recentAccuracy = recentCorrect / recentQuestions;

    // Calculate earlier accuracy
    const earlierEvents = this.eventQueue
      .filter(
        (e) =>
          e.eventType === "question_response" &&
          e.sessionId === this.currentSession!.sessionId,
      )
      .slice(-(recentQuestions + earlierQuestions), -recentQuestions);

    const earlierCorrect = earlierEvents.filter(
      (e) => e.action === "correct",
    ).length;
    const earlierAccuracy = earlierCorrect / earlierQuestions;

    const improvement = recentAccuracy - earlierAccuracy;

    if (improvement > 0.2) {
      // 20% improvement
      const pattern: LearningPattern = {
        type: "accuracy_improvement",
        confidence: Math.min(improvement * 2, 1),
        description: `Accuracy improved from ${Math.round(earlierAccuracy * 100)}% to ${Math.round(recentAccuracy * 100)}%`,
        data: {
          previousAccuracy: earlierAccuracy,
          currentAccuracy: recentAccuracy,
          improvement: improvement,
        },
        detectedAt: new Date(),
      };

      this.currentSession.learningPatterns.push(pattern);
    }
  }

  private updateTimeOfDayPerformance(event: LearningEvent): void {
    if (event.eventType !== "question_response") return;

    const hour = event.timestamp.getHours();
    const isCorrect = event.action === "correct";

    const hourData = this.timeOfDayPerformance.get(hour) || {
      accuracy: 0,
      engagement: 0,
    };

    // Update accuracy (running average)
    const currentAccuracy = hourData.accuracy;
    const newAccuracy = isCorrect ? 1 : 0;
    hourData.accuracy = currentAccuracy * 0.9 + newAccuracy * 0.1; // Exponential smoothing

    // Update engagement based on response time
    const responseTime = event.value || 0;
    const engagementScore = Math.max(0, 1 - responseTime / 20000); // 20 seconds max
    hourData.engagement = hourData.engagement * 0.9 + engagementScore * 0.1;

    this.timeOfDayPerformance.set(hour, hourData);
  }

  private updateCategoryPreferences(
    category: string,
    isCorrect: boolean,
  ): void {
    // This is already handled in trackQuestionResponse
    // Additional preference logic could be added here
  }

  // =====================================================
  // INSIGHT GENERATION
  // =====================================================

  private generateSessionInsights(): void {
    if (!this.currentSession) return;

    const insights: LearningInsight[] = [];
    const session = this.currentSession;

    // Performance insights
    const accuracy = session.correctAnswers / session.totalQuestions;

    if (accuracy >= 0.9) {
      insights.push({
        type: "strength",
        title: "Excellent Performance!",
        description: `You achieved ${Math.round(accuracy * 100)}% accuracy - outstanding work!`,
        confidence: 0.9,
        actionable: false,
        suggestions: [
          "Keep up the excellent work!",
          "Try a harder difficulty level",
        ],
        data: { accuracy, streak: session.streakData.maxStreak },
        createdAt: new Date(),
      });
    } else if (accuracy < 0.6) {
      insights.push({
        type: "improvement_area",
        title: "Room for Improvement",
        description: "Your accuracy could be improved with more practice.",
        confidence: 0.8,
        actionable: true,
        suggestions: [
          "Try using hints more often",
          "Take your time with each question",
          "Practice with easier words first",
        ],
        data: { accuracy, hintsUsed: session.hintsUsed },
        createdAt: new Date(),
      });
    }

    // Speed insights
    if (session.averageResponseTime > 0) {
      if (session.averageResponseTime < 5000) {
        // Under 5 seconds
        insights.push({
          type: "strength",
          title: "Lightning Fast!",
          description: "You're answering questions very quickly!",
          confidence: 0.8,
          actionable: false,
          suggestions: ["Try harder questions to challenge yourself"],
          data: { avgResponseTime: session.averageResponseTime },
          createdAt: new Date(),
        });
      } else if (session.averageResponseTime > 15000) {
        // Over 15 seconds
        insights.push({
          type: "recommendation",
          title: "Take Your Time",
          description:
            "You're taking time to think - that's great for learning!",
          confidence: 0.7,
          actionable: true,
          suggestions: [
            "Consider using hints if you're stuck",
            "Practice mode might help build confidence",
          ],
          data: { avgResponseTime: session.averageResponseTime },
          createdAt: new Date(),
        });
      }
    }

    // Engagement insights
    if (session.engagementMetrics.attentionScore > 0.8) {
      insights.push({
        type: "strength",
        title: "Great Focus!",
        description: "You stayed focused throughout the session.",
        confidence: 0.9,
        actionable: false,
        suggestions: ["Try longer sessions to build stamina"],
        data: { attentionScore: session.engagementMetrics.attentionScore },
        createdAt: new Date(),
      });
    }

    // Pattern-based insights
    session.learningPatterns.forEach((pattern) => {
      if (pattern.type === "speed_improvement") {
        insights.push({
          type: "milestone",
          title: "Speed Improvement Detected!",
          description: pattern.description,
          confidence: pattern.confidence,
          actionable: false,
          suggestions: ["Keep up the momentum!"],
          data: pattern.data,
          createdAt: new Date(),
        });
      } else if (pattern.type === "accuracy_improvement") {
        insights.push({
          type: "milestone",
          title: "Accuracy Improvement!",
          description: pattern.description,
          confidence: pattern.confidence,
          actionable: false,
          suggestions: ["You're getting better!"],
          data: pattern.data,
          createdAt: new Date(),
        });
      }
    });

    // Store insights
    this.insights.push(...insights);
  }

  // =====================================================
  // PERFORMANCE MONITORING
  // =====================================================

  private processPerformanceEntries(entries: PerformanceEntry[]): void {
    entries.forEach((entry) => {
      if (entry.entryType === "navigation") {
        const navEntry = entry as PerformanceNavigationTiming;
        if (this.currentSession) {
          this.currentSession.performanceMetrics.loadTime =
            navEntry.loadEventEnd - navEntry.fetchStart;
        }
      } else if (entry.entryType === "measure") {
        // Custom performance measures
        if (this.currentSession) {
          if (entry.name.includes("render")) {
            this.currentSession.performanceMetrics.renderTime = entry.duration;
          } else if (entry.name.includes("audio")) {
            this.currentSession.performanceMetrics.audioLatency =
              entry.duration;
          }
        }
      }
    });
  }

  private recordMemoryUsage(): void {
    if (!this.currentSession) return;

    const memory = (performance as any).memory;
    if (memory) {
      this.currentSession.performanceMetrics.memoryUsage =
        memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  private startFPSMonitoring(): void {
    this.fpsMonitor = { frameCount: 0, startTime: performance.now() };

    const countFrame = () => {
      if (!this.fpsMonitor) return;

      this.fpsMonitor.frameCount++;

      const elapsed = performance.now() - this.fpsMonitor.startTime;
      if (elapsed >= 1000) {
        // Every second
        const fps = (this.fpsMonitor.frameCount * 1000) / elapsed;

        if (this.currentSession) {
          // Running average
          const currentAvg = this.currentSession.performanceMetrics.averageFPS;
          this.currentSession.performanceMetrics.averageFPS =
            currentAvg === 0 ? fps : (currentAvg + fps) / 2;
        }

        this.fpsMonitor.frameCount = 0;
        this.fpsMonitor.startTime = performance.now();
      }

      requestAnimationFrame(countFrame);
    };

    requestAnimationFrame(countFrame);
  }

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  private handleVisibilityChange(): void {
    if (document.hidden) {
      if (this.focusStartTime) {
        const focusTime = Date.now() - this.focusStartTime;
        this.attentionMetrics.totalFocusTime += focusTime;
        if (this.currentSession) {
          this.currentSession.engagementMetrics.focusTime += focusTime;
        }
        this.focusStartTime = null;
      }
    } else {
      this.focusStartTime = Date.now();
    }
  }

  private handleWindowFocus(): void {
    this.focusStartTime = Date.now();
  }

  private handleWindowBlur(): void {
    if (this.focusStartTime) {
      const focusTime = Date.now() - this.focusStartTime;
      this.attentionMetrics.totalFocusTime += focusTime;
      if (this.currentSession) {
        this.currentSession.engagementMetrics.focusTime += focusTime;
      }
      this.focusStartTime = null;
    }
  }

  private trackInteraction(event: Event): void {
    this.lastInteractionTime = Date.now();
    this.attentionMetrics.interactionCount++;

    if (this.currentSession) {
      this.currentSession.engagementMetrics.clickCount++;
    }

    // Track gesture type
    const gestureType = event.type;
    this.gestureBuffer.push({ type: gestureType, timestamp: Date.now() });

    // Keep buffer manageable
    if (this.gestureBuffer.length > 100) {
      this.gestureBuffer = this.gestureBuffer.slice(-50);
    }
  }

  private trackError(event: ErrorEvent | PromiseRejectionEvent): void {
    if (this.currentSession) {
      this.currentSession.performanceMetrics.errorCount++;
    }

    this.trackEvent("error", "performance", "error", undefined, undefined, {
      message: "message" in event ? event.message : "Promise rejection",
      stack: "error" in event && event.error ? event.error.stack : undefined,
      filename: "filename" in event ? event.filename : undefined,
      lineno: "lineno" in event ? event.lineno : undefined,
    });
  }

  private handleBeforeUnload(): void {
    this.flushData();
    if (this.currentSession) {
      this.endSession();
    }
  }

  // =====================================================
  // DATA MANAGEMENT
  // =====================================================

  private flushData(): void {
    if (this.eventQueue.length === 0 && this.sessionBuffer.length === 0) return;

    try {
      // Store events
      if (this.eventQueue.length > 0) {
        const storedEvents = JSON.parse(
          this.storage.getItem("analyticsEvents") || "[]",
        );
        storedEvents.push(...this.eventQueue);

        // Limit stored events
        const maxEvents = 1000;
        if (storedEvents.length > maxEvents) {
          storedEvents.splice(0, storedEvents.length - maxEvents);
        }

        this.storage.setItem("analyticsEvents", JSON.stringify(storedEvents));
        this.eventQueue = [];
      }

      // Store sessions
      if (this.sessionBuffer.length > 0) {
        const storedSessions = JSON.parse(
          this.storage.getItem("analyticsSessions") || "[]",
        );
        storedSessions.push(...this.sessionBuffer);

        // Clean old sessions
        const cutoffDate = new Date(
          Date.now() - this.config.dataRetentionDays * 24 * 60 * 60 * 1000,
        );
        const recentSessions = storedSessions.filter(
          (session: SessionData) => new Date(session.startTime) > cutoffDate,
        );

        this.storage.setItem(
          "analyticsSessions",
          JSON.stringify(recentSessions),
        );
        this.sessionBuffer = [];
      }

      // Store insights
      if (this.insights.length > 0) {
        const storedInsights = JSON.parse(
          this.storage.getItem("analyticsInsights") || "[]",
        );
        storedInsights.push(...this.insights);

        // Keep recent insights
        const recentInsights = storedInsights.slice(-100);
        this.storage.setItem(
          "analyticsInsights",
          JSON.stringify(recentInsights),
        );
        this.insights = [];
      }
    } catch (error) {
      console.error("Failed to flush analytics data:", error);
    }
  }

  private loadStoredData(): void {
    try {
      // Load category performance
      const storedCategoryPerf = this.storage.getItem("categoryPerformance");
      if (storedCategoryPerf) {
        const data = JSON.parse(storedCategoryPerf);
        this.categoryPerformance = new Map(data);
      }

      // Load time of day performance
      const storedTimePerf = this.storage.getItem("timeOfDayPerformance");
      if (storedTimePerf) {
        const data = JSON.parse(storedTimePerf);
        this.timeOfDayPerformance = new Map(data);
      }
    } catch (error) {
      console.error("Failed to load stored analytics data:", error);
    }
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  public getSessionSummary(): any {
    if (!this.currentSession) return null;

    return {
      sessionId: this.currentSession.sessionId,
      duration: Date.now() - this.currentSession.startTime.getTime(),
      totalQuestions: this.currentSession.totalQuestions,
      accuracy:
        this.currentSession.totalQuestions > 0
          ? this.currentSession.correctAnswers /
            this.currentSession.totalQuestions
          : 0,
      maxStreak: this.currentSession.streakData.maxStreak,
      averageResponseTime: this.currentSession.averageResponseTime,
      attentionScore: this.currentSession.engagementMetrics.attentionScore,
      powerUpsUsed: this.currentSession.powerUpsUsed.length,
      hintsUsed: this.currentSession.hintsUsed,
    };
  }

  public getInsights(): LearningInsight[] {
    try {
      const storedInsights = JSON.parse(
        this.storage.getItem("analyticsInsights") || "[]",
      );
      return [...this.insights, ...storedInsights].slice(-20); // Recent 20 insights
    } catch {
      return this.insights;
    }
  }

  public getCategoryPerformance(): Array<{
    category: string;
    accuracy: number;
    avgTime: number;
    total: number;
  }> {
    return Array.from(this.categoryPerformance.entries()).map(
      ([category, stats]) => ({
        category,
        accuracy: stats.correct / stats.total,
        avgTime: stats.avgTime,
        total: stats.total,
      }),
    );
  }

  public getTimeOfDayInsights(): Array<{
    hour: number;
    accuracy: number;
    engagement: number;
  }> {
    return Array.from(this.timeOfDayPerformance.entries()).map(
      ([hour, data]) => ({
        hour,
        accuracy: data.accuracy,
        engagement: data.engagement,
      }),
    );
  }

  public exportData(): any {
    try {
      return {
        events: JSON.parse(this.storage.getItem("analyticsEvents") || "[]"),
        sessions: JSON.parse(this.storage.getItem("analyticsSessions") || "[]"),
        insights: JSON.parse(this.storage.getItem("analyticsInsights") || "[]"),
        categoryPerformance: Array.from(this.categoryPerformance.entries()),
        timeOfDayPerformance: Array.from(this.timeOfDayPerformance.entries()),
        exportedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to export analytics data:", error);
      return null;
    }
  }

  public clearData(): void {
    this.storage.removeItem("analyticsEvents");
    this.storage.removeItem("analyticsSessions");
    this.storage.removeItem("analyticsInsights");
    this.storage.removeItem("categoryPerformance");
    this.storage.removeItem("timeOfDayPerformance");

    this.eventQueue = [];
    this.sessionBuffer = [];
    this.insights = [];
    this.categoryPerformance.clear();
    this.timeOfDayPerformance.clear();
    this.responseTimeHistory = [];
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  private getDeviceInfo(): DeviceInfo {
    return {
      platform: navigator.platform,
      screenSize: { width: window.screen.width, height: window.screen.height },
      deviceType: this.getDeviceType(),
      touchCapable: "ontouchstart" in window,
      connectionType: (navigator as any).connection?.effectiveType || "unknown",
      batteryLevel: undefined, // Would require battery API
      orientation:
        window.innerHeight > window.innerWidth ? "portrait" : "landscape",
    };
  }

  private getDeviceType(): "mobile" | "tablet" | "desktop" {
    const width = window.screen.width;
    const userAgent = navigator.userAgent.toLowerCase();

    if (/mobile|android|iphone/.test(userAgent) || width < 768) {
      return "mobile";
    } else if (
      /tablet|ipad/.test(userAgent) ||
      (width >= 768 && width < 1024)
    ) {
      return "tablet";
    } else {
      return "desktop";
    }
  }

  private getRemainingGems(): number {
    // This would integrate with your game state management
    // For now, return a placeholder
    return 100;
  }

  public cleanup(): void {
    // Clean up performance monitoring
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
    }

    // Final data flush
    this.flushData();

    if (this.currentSession) {
      this.endSession();
    }
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const enhancedAnalytics = new EnhancedAnalyticsSystem();

// Temporary alias for backward compatibility - DEPRECATED
// TODO: Remove this after all imports are fixed
export const enhancedAnalyticsSystem = enhancedAnalytics;

export default enhancedAnalytics;
