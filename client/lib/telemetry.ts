/**
 * Centralized Telemetry Service
 * Provides consistent error logging and analytics across the application
 */

interface TelemetryEvent {
  type: "ui_error" | "performance" | "user_action" | "feature_usage";
  timestamp: number;
  sessionId: string;
  data: Record<string, any>;
}

interface UIErrorData {
  componentName: string;
  error: string;
  stack?: string;
  errorId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
}

class TelemetryService {
  private sessionId: string;
  private isEnabled: boolean = true;
  private events: TelemetryEvent[] = [];
  private maxEvents: number = 100;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = this.shouldCollectTelemetry();
  }

  private generateSessionId(): string {
    return `tel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldCollectTelemetry(): boolean {
    try {
      const settings = localStorage.getItem("jungleAdventureSettings");
      if (settings) {
        const parsed = JSON.parse(settings);
        return parsed.telemetryEnabled !== false; // Default to enabled
      }
      return true;
    } catch {
      return true; // Default to enabled if unable to read settings
    }
  }

  /**
   * Log UI errors from ErrorBoundary or other components
   */
  log(type: "ui_error", data: UIErrorData): void;
  log(type: "performance" | "user_action" | "feature_usage", data: Record<string, any>): void;
  log(type: TelemetryEvent["type"], data: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: TelemetryEvent = {
      type,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: { ...data }
    };

    this.events.push(event);

    // Maintain memory limits
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Store in localStorage for persistence
    this.persistEvents();

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log(`📊 Telemetry [${type}]:`, event);
    }

    // If it's a UI error, also use the parent dashboard analytics
    if (type === "ui_error") {
      try {
        // Import dynamically to avoid circular dependencies
        import("./parentDashboardAnalytics").then(({ parentDashboardAnalytics }) => {
          parentDashboardAnalytics.trackError(
            "dashboard",
            data.error || "Unknown error",
            {
              componentName: data.componentName,
              errorId: data.errorId,
              timestamp: data.timestamp
            }
          );
        });
      } catch (error) {
        console.warn("Failed to log to parent dashboard analytics:", error);
      }
    }
  }

  /**
   * Persist events to localStorage
   */
  private persistEvents(): void {
    try {
      const eventData = {
        sessionId: this.sessionId,
        events: this.events.slice(-50), // Keep only latest 50 events
        lastUpdated: Date.now()
      };
      localStorage.setItem("telemetryEvents", JSON.stringify(eventData));
    } catch (error) {
      console.warn("Failed to persist telemetry events:", error);
    }
  }

  /**
   * Get all telemetry events for debugging
   */
  getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  /**
   * Get error summary for debugging
   */
  getErrorSummary(): {
    totalErrors: number;
    errorsByComponent: Record<string, number>;
    recentErrors: TelemetryEvent[];
  } {
    const errorEvents = this.events.filter(e => e.type === "ui_error");
    const errorsByComponent: Record<string, number> = {};

    errorEvents.forEach(event => {
      const componentName = event.data.componentName || "unknown";
      errorsByComponent[componentName] = (errorsByComponent[componentName] || 0) + 1;
    });

    return {
      totalErrors: errorEvents.length,
      errorsByComponent,
      recentErrors: errorEvents.slice(-10) // Last 10 errors
    };
  }

  /**
   * Clear all telemetry data
   */
  clear(): void {
    this.events = [];
    localStorage.removeItem("telemetryEvents");
    console.log("✅ Telemetry data cleared");
  }

  /**
   * Enable/disable telemetry collection
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    try {
      const settings = JSON.parse(
        localStorage.getItem("jungleAdventureSettings") || "{}"
      );
      settings.telemetryEnabled = enabled;
      localStorage.setItem("jungleAdventureSettings", JSON.stringify(settings));
    } catch (error) {
      console.warn("Failed to update telemetry settings:", error);
    }

    if (!enabled) {
      this.clear();
    }
  }

  /**
   * Export telemetry data for debugging (development only)
   */
  exportData(): string | null {
    if (process.env.NODE_ENV !== "development") {
      console.warn("Telemetry export only available in development mode");
      return null;
    }

    return JSON.stringify({
      sessionId: this.sessionId,
      events: this.events,
      summary: this.getErrorSummary(),
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    }, null, 2);
  }

  /**
   * Load persisted events on initialization
   */
  loadPersistedEvents(): void {
    try {
      const stored = localStorage.getItem("telemetryEvents");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.events && Array.isArray(data.events)) {
          // Only load events from the last 24 hours
          const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
          this.events = data.events.filter((event: TelemetryEvent) => 
            event.timestamp > oneDayAgo
          );
        }
      }
    } catch (error) {
      console.warn("Failed to load persisted telemetry events:", error);
    }
  }
}

// Create singleton instance
export const telemetry = new TelemetryService();

// Load persisted events
telemetry.loadPersistedEvents();

// Export class for testing
export { TelemetryService };

// Utility function for performance tracking with telemetry
export const withTelemetryTracking = async <T>(
  operation: () => Promise<T> | T,
  operationName: string,
  metadata?: Record<string, any>
): Promise<T> => {
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;

    telemetry.log("performance", {
      operation: operationName,
      duration: Math.round(duration),
      success: true,
      ...metadata
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    telemetry.log("ui_error", {
      componentName: operationName,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined,
      duration: Math.round(duration),
      timestamp: new Date().toISOString(),
      ...metadata
    });

    throw error;
  }
};

export default telemetry;
