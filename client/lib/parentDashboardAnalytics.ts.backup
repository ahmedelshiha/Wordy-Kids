/**
 * Lightweight Parent Dashboard Analytics
 * Anonymous, aggregated telemetry for monitoring and performance optimization
 */

interface AnalyticsEvent {
  event: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface DashboardMetrics {
  loadTimes: number[];
  mapInteractions: number;
  timelineFilters: number;
  errorOccurrences: number;
  lastSession: number;
}

class ParentDashboardAnalytics {
  private isEnabled: boolean = true;
  private sessionId: string;
  private startTime: number;
  private events: AnalyticsEvent[] = [];
  private maxEvents: number = 50; // Limit memory usage

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.isEnabled = this.shouldCollectAnalytics();
  }

  /**
   * Generate anonymous session identifier
   */
  private generateSessionId(): string {
    return `pd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if analytics collection is enabled (respects privacy)
   */
  private shouldCollectAnalytics(): boolean {
    try {
      const settings = localStorage.getItem("jungleAdventureSettings");
      if (settings) {
        const parsed = JSON.parse(settings);
        return parsed.analyticsEnabled !== false; // Default to enabled
      }
      return true;
    } catch {
      return true; // Default to enabled if unable to read settings
    }
  }

  /**
   * Record a generic analytics event
   */
  private recordEvent(
    event: string,
    duration?: number,
    metadata?: Record<string, any>,
  ): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      duration,
      metadata: metadata ? { ...metadata } : undefined, // Clone to avoid references
    };

    this.events.push(analyticsEvent);

    // Maintain memory limits
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Optional: Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`📊 Analytics: ${event}`, analyticsEvent);
    }
  }

  /**
   * Track Parent Dashboard load time
   */
  trackDashboardLoad(loadTime: number): void {
    this.recordEvent("dashboard_load", loadTime, {
      userAgent: navigator.userAgent.substring(0, 100), // Truncated for privacy
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    });

    // Update aggregated metrics
    this.updateMetrics((metrics) => {
      metrics.loadTimes.push(loadTime);
      // Keep only last 10 load times
      if (metrics.loadTimes.length > 10) {
        metrics.loadTimes = metrics.loadTimes.slice(-10);
      }
    });
  }

  /**
   * Track Jungle Map interactions
   */
  trackMapInteraction(
    interactionType: "marker_click" | "zoom" | "pan" | "reset",
    metadata?: Record<string, any>,
  ): void {
    this.recordEvent("map_interaction", undefined, {
      type: interactionType,
      ...metadata,
    });

    this.updateMetrics((metrics) => {
      metrics.mapInteractions++;
    });
  }

  /**
   * Track Timeline filter usage
   */
  trackTimelineFilter(
    filterType: "all" | "achievements" | "milestones",
    eventCount: number,
  ): void {
    this.recordEvent("timeline_filter", undefined, {
      filter: filterType,
      eventCount,
    });

    this.updateMetrics((metrics) => {
      metrics.timelineFilters++;
    });
  }

  /**
   * Track Timeline event interactions
   */
  trackTimelineEventClick(
    eventType: "achievement" | "milestone" | "celebration",
    metadata?: Record<string, any>,
  ): void {
    this.recordEvent("timeline_event_click", undefined, {
      eventType,
      ...metadata,
    });
  }

  /**
   * Track component errors
   */
  trackError(
    component: "dashboard" | "map" | "timeline",
    error: string,
    metadata?: Record<string, any>,
  ): void {
    this.recordEvent("component_error", undefined, {
      component,
      error: error.substring(0, 200), // Limit error message length
      ...metadata,
    });

    this.updateMetrics((metrics) => {
      metrics.errorOccurrences++;
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(
    feature: string,
    action: string,
    metadata?: Record<string, any>,
  ): void {
    this.recordEvent("feature_usage", undefined, {
      feature,
      action,
      ...metadata,
    });
  }

  /**
   * Update aggregated metrics in storage
   */
  private updateMetrics(updater: (metrics: DashboardMetrics) => void): void {
    try {
      const currentMetrics = this.getMetrics();
      updater(currentMetrics);
      currentMetrics.lastSession = Date.now();

      localStorage.setItem(
        "parentDashboardMetrics",
        JSON.stringify(currentMetrics),
      );
    } catch (error) {
      console.warn("Failed to update dashboard metrics:", error);
    }
  }

  /**
   * Get current aggregated metrics
   */
  getMetrics(): DashboardMetrics {
    try {
      const stored = localStorage.getItem("parentDashboardMetrics");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parsing errors
    }

    return {
      loadTimes: [],
      mapInteractions: 0,
      timelineFilters: 0,
      errorOccurrences: 0,
      lastSession: Date.now(),
    };
  }

  /**
   * Get performance summary for debugging
   */
  getPerformanceSummary(): {
    averageLoadTime: number;
    totalInteractions: number;
    errorRate: number;
    sessionDuration: number;
  } {
    const metrics = this.getMetrics();
    const sessionDuration = Date.now() - this.startTime;

    return {
      averageLoadTime:
        metrics.loadTimes.length > 0
          ? Math.round(
              metrics.loadTimes.reduce((a, b) => a + b, 0) /
                metrics.loadTimes.length,
            )
          : 0,
      totalInteractions: metrics.mapInteractions + metrics.timelineFilters,
      errorRate: metrics.errorOccurrences,
      sessionDuration: Math.round(sessionDuration / 1000), // Convert to seconds
    };
  }

  /**
   * Export analytics data for debugging (development only)
   */
  exportAnalyticsData(): string | null {
    if (process.env.NODE_ENV !== "development") {
      console.warn("Analytics export only available in development mode");
      return null;
    }

    return JSON.stringify(
      {
        sessionId: this.sessionId,
        events: this.events,
        metrics: this.getMetrics(),
        summary: this.getPerformanceSummary(),
      },
      null,
      2,
    );
  }

  /**
   * Clear all analytics data (for privacy compliance)
   */
  clearAnalyticsData(): void {
    this.events = [];
    localStorage.removeItem("parentDashboardMetrics");
    console.log("✅ Parent Dashboard analytics data cleared");
  }

  /**
   * Enable/disable analytics collection
   */
  setAnalyticsEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    try {
      const settings = JSON.parse(
        localStorage.getItem("jungleAdventureSettings") || "{}",
      );
      settings.analyticsEnabled = enabled;
      localStorage.setItem("jungleAdventureSettings", JSON.stringify(settings));
    } catch (error) {
      console.warn("Failed to update analytics settings:", error);
    }

    if (!enabled) {
      this.clearAnalyticsData();
    }
  }
}

// Create singleton instance
export const parentDashboardAnalytics = new ParentDashboardAnalytics();

// Export class for testing
export { ParentDashboardAnalytics };

// Utility function for performance timing
export const withPerformanceTracking = async <T>(
  operation: () => Promise<T> | T,
  eventName: string,
  metadata?: Record<string, any>,
): Promise<T> => {
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;

    parentDashboardAnalytics.trackFeatureUsage(eventName, "success", {
      ...metadata,
      duration: Math.round(duration),
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    parentDashboardAnalytics.trackError(
      "dashboard",
      error instanceof Error ? error.message : String(error),
      {
        ...metadata,
        duration: Math.round(duration),
        operation: eventName,
      },
    );

    throw error;
  }
};

export default parentDashboardAnalytics;
