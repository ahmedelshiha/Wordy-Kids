/**
 * Performance Monitoring and Profiling System
 * Comprehensive performance tracking for React components and app metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: "render" | "memory" | "network" | "interaction" | "custom";
  metadata?: Record<string, any>;
}

interface ComponentRenderMetric {
  componentName: string;
  renderTime: number;
  propsChanged: string[];
  timestamp: number;
  renderCount: number;
}

interface MemoryMetric {
  used: number;
  total: number;
  timestamp: number;
  component?: string;
}

interface NetworkMetric {
  url: string;
  method: string;
  duration: number;
  size: number;
  status: number;
  timestamp: number;
}

class PerformanceProfiler {
  private static instance: PerformanceProfiler;
  private metrics: PerformanceMetric[] = [];
  private renderMetrics: Map<string, ComponentRenderMetric[]> = new Map();
  private memorySnapshots: MemoryMetric[] = [];
  private networkMetrics: NetworkMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = false;
  private maxMetrics: number = 1000;

  static getInstance(): PerformanceProfiler {
    if (!PerformanceProfiler.instance) {
      PerformanceProfiler.instance = new PerformanceProfiler();
    }
    return PerformanceProfiler.instance;
  }

  // Initialize performance monitoring
  initialize(
    options: {
      enableRenderTracking?: boolean;
      enableMemoryTracking?: boolean;
      enableNetworkTracking?: boolean;
      maxMetrics?: number;
    } = {},
  ): void {
    const {
      enableRenderTracking = true,
      enableMemoryTracking = true,
      enableNetworkTracking = true,
      maxMetrics = 1000,
    } = options;

    this.isEnabled = true;
    this.maxMetrics = maxMetrics;

    if (enableRenderTracking) {
      this.setupRenderTracking();
    }

    if (enableMemoryTracking) {
      this.setupMemoryTracking();
    }

    if (enableNetworkTracking) {
      this.setupNetworkTracking();
    }

    this.setupPerformanceObservers();
    console.log("Performance profiler initialized");
  }

  // Component render tracking
  trackComponentRender(
    componentName: string,
    renderTime: number,
    propsChanged: string[] = [],
  ): void {
    if (!this.isEnabled) return;

    if (!this.renderMetrics.has(componentName)) {
      this.renderMetrics.set(componentName, []);
    }

    const metrics = this.renderMetrics.get(componentName)!;
    const lastMetric = metrics[metrics.length - 1];
    const renderCount = lastMetric ? lastMetric.renderCount + 1 : 1;

    const metric: ComponentRenderMetric = {
      componentName,
      renderTime,
      propsChanged,
      timestamp: Date.now(),
      renderCount,
    };

    metrics.push(metric);

    // Keep only recent metrics
    if (metrics.length > this.maxMetrics) {
      metrics.splice(0, metrics.length - this.maxMetrics);
    }

    // Warn about slow renders
    if (renderTime > 16) {
      // 60fps threshold
      console.warn(
        `Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`,
      );
    }

    // Warn about excessive re-renders
    if (renderCount > 100) {
      console.warn(
        `Excessive re-renders detected: ${componentName} has rendered ${renderCount} times`,
      );
    }
  }

  // Memory usage tracking
  trackMemoryUsage(component?: string): void {
    if (!this.isEnabled || !("memory" in performance)) return;

    const memInfo = (performance as any).memory;
    const metric: MemoryMetric = {
      used: memInfo.usedJSHeapSize,
      total: memInfo.totalJSHeapSize,
      timestamp: Date.now(),
      component,
    };

    this.memorySnapshots.push(metric);

    if (this.memorySnapshots.length > this.maxMetrics) {
      this.memorySnapshots.splice(
        0,
        this.memorySnapshots.length - this.maxMetrics,
      );
    }

    // Check for memory leaks
    const recentSnapshots = this.memorySnapshots.slice(-10);
    if (recentSnapshots.length >= 10) {
      const memoryTrend = this.calculateMemoryTrend(recentSnapshots);
      if (memoryTrend > 1024 * 1024) {
        // Growing by more than 1MB
        console.warn(
          "Potential memory leak detected. Memory usage trending upward.",
        );
      }
    }
  }

  // Network request tracking
  trackNetworkRequest(
    url: string,
    method: string,
    duration: number,
    size: number,
    status: number,
  ): void {
    if (!this.isEnabled) return;

    const metric: NetworkMetric = {
      url,
      method,
      duration,
      size,
      status,
      timestamp: Date.now(),
    };

    this.networkMetrics.push(metric);

    if (this.networkMetrics.length > this.maxMetrics) {
      this.networkMetrics.splice(
        0,
        this.networkMetrics.length - this.maxMetrics,
      );
    }

    // Warn about slow requests
    if (duration > 5000) {
      // 5 seconds
      console.warn(`Slow network request: ${method} ${url} took ${duration}ms`);
    }
  }

  // Setup Performance Observers
  private setupPerformanceObservers(): void {
    if (!("PerformanceObserver" in window)) return;

    // Long Tasks Observer
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) {
            // Long task threshold
            console.warn("Long task detected:", entry.duration + "ms", entry);
            this.addMetric({
              name: "long-task",
              value: entry.duration,
              timestamp: Date.now(),
              type: "interaction",
              metadata: { entry: entry.toJSON() },
            });
          }
        });
      });
      longTaskObserver.observe({ entryTypes: ["longtask"] });
      this.observers.push(longTaskObserver);
    } catch (error) {
      console.warn("Long task observer not supported");
    }

    // Layout Shift Observer
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.value > 0.1) {
            // CLS threshold
            console.warn("Layout shift detected:", entry.value, entry);
            this.addMetric({
              name: "layout-shift",
              value: entry.value,
              timestamp: Date.now(),
              type: "render",
              metadata: { entry: entry.toJSON() },
            });
          }
        });
      });
      layoutShiftObserver.observe({ entryTypes: ["layout-shift"] });
      this.observers.push(layoutShiftObserver);
    } catch (error) {
      console.warn("Layout shift observer not supported");
    }

    // Largest Contentful Paint Observer
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.addMetric({
          name: "largest-contentful-paint",
          value: lastEntry.startTime,
          timestamp: Date.now(),
          type: "render",
          metadata: { entry: lastEntry.toJSON() },
        });
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      this.observers.push(lcpObserver);
    } catch (error) {
      console.warn("LCP observer not supported");
    }
  }

  private setupRenderTracking(): void {
    // React DevTools integration would go here
    console.log("Render tracking enabled");
  }

  private setupMemoryTracking(): void {
    // Track memory every 30 seconds
    setInterval(() => {
      this.trackMemoryUsage();
    }, 30000);
  }

  private setupNetworkTracking(): void {
    // Monkey patch fetch to track network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] as string;
      const options = args[1] || {};
      const method = options.method || "GET";

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Estimate response size
        const contentLength = response.headers.get("content-length");
        const size = contentLength ? parseInt(contentLength, 10) : 0;

        this.trackNetworkRequest(url, method, duration, size, response.status);
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        this.trackNetworkRequest(url, method, duration, 0, 0);
        throw error;
      }
    };
  }

  private calculateMemoryTrend(snapshots: MemoryMetric[]): number {
    if (snapshots.length < 2) return 0;

    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    return last.used - first.used;
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.splice(0, this.metrics.length - this.maxMetrics);
    }
  }

  // Get performance report
  getPerformanceReport(): {
    componentMetrics: { [componentName: string]: ComponentRenderMetric[] };
    memoryMetrics: MemoryMetric[];
    networkMetrics: NetworkMetric[];
    generalMetrics: PerformanceMetric[];
    summary: {
      slowestComponents: Array<{
        name: string;
        avgRenderTime: number;
        renderCount: number;
      }>;
      memoryUsage: { current: number; trend: "up" | "down" | "stable" };
      networkPerformance: { avgResponseTime: number; totalRequests: number };
      performanceScore: number;
    };
  } {
    const componentMetrics = Object.fromEntries(this.renderMetrics);

    // Calculate slowest components
    const slowestComponents = Array.from(this.renderMetrics.entries())
      .map(([name, metrics]) => {
        const avgRenderTime =
          metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length;
        const renderCount = metrics.length;
        return { name, avgRenderTime, renderCount };
      })
      .sort((a, b) => b.avgRenderTime - a.avgRenderTime)
      .slice(0, 10);

    // Memory trend
    const recentMemory = this.memorySnapshots.slice(-5);
    let memoryTrend: "up" | "down" | "stable" = "stable";
    if (recentMemory.length >= 2) {
      const trend = this.calculateMemoryTrend(recentMemory);
      if (trend > 1024 * 1024) memoryTrend = "up";
      else if (trend < -1024 * 1024) memoryTrend = "down";
    }

    // Network performance
    const avgResponseTime =
      this.networkMetrics.length > 0
        ? this.networkMetrics.reduce((sum, m) => sum + m.duration, 0) /
          this.networkMetrics.length
        : 0;

    // Performance score (0-100)
    let performanceScore = 100;
    if (
      slowestComponents.length > 0 &&
      slowestComponents[0].avgRenderTime > 16
    ) {
      performanceScore -= 20;
    }
    if (memoryTrend === "up") performanceScore -= 15;
    if (avgResponseTime > 1000) performanceScore -= 15;
    if (this.metrics.some((m) => m.name === "long-task"))
      performanceScore -= 20;

    return {
      componentMetrics,
      memoryMetrics: this.memorySnapshots,
      networkMetrics: this.networkMetrics,
      generalMetrics: this.metrics,
      summary: {
        slowestComponents,
        memoryUsage: {
          current:
            recentMemory.length > 0
              ? recentMemory[recentMemory.length - 1].used
              : 0,
          trend: memoryTrend,
        },
        networkPerformance: {
          avgResponseTime,
          totalRequests: this.networkMetrics.length,
        },
        performanceScore: Math.max(0, performanceScore),
      },
    };
  }

  // Export performance data
  exportPerformanceData(): string {
    const report = this.getPerformanceReport();
    return JSON.stringify(report, null, 2);
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
    this.renderMetrics.clear();
    this.memorySnapshots = [];
    this.networkMetrics = [];
  }

  // Disable monitoring
  disable(): void {
    this.isEnabled = false;
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// React hooks for performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  const profiler = PerformanceProfiler.getInstance();
  const renderStartTime = React.useRef<number>(0);
  const previousProps = React.useRef<any>(null);

  React.useLayoutEffect(() => {
    renderStartTime.current = performance.now();
  });

  React.useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;

    // Track which props changed
    const propsChanged: string[] = [];
    // Note: This would need to be implemented with a props comparison

    profiler.trackComponentRender(componentName, renderTime, propsChanged);
  });

  const trackCustomMetric = React.useCallback(
    (name: string, value: number, metadata?: Record<string, any>) => {
      profiler.addMetric({
        name: `${componentName}.${name}`,
        value,
        timestamp: Date.now(),
        type: "custom",
        metadata,
      });
    },
    [componentName],
  );

  return { trackCustomMetric };
}

export function useMemoryMonitoring() {
  const profiler = PerformanceProfiler.getInstance();

  React.useEffect(() => {
    const trackMemory = () => profiler.trackMemoryUsage();

    // Track on mount and unmount
    trackMemory();
    return trackMemory;
  }, []);

  const trackComponentMemory = React.useCallback((componentName: string) => {
    profiler.trackMemoryUsage(componentName);
  }, []);

  return { trackComponentMemory };
}

// Performance measurement utilities
export class PerformanceMeasurement {
  private startTime: number;
  private name: string;

  constructor(name: string) {
    this.name = name;
    this.startTime = performance.now();
  }

  end(): number {
    const duration = performance.now() - this.startTime;

    if (duration > 16) {
      console.warn(
        `Performance warning: ${this.name} took ${duration.toFixed(2)}ms`,
      );
    }

    return duration;
  }

  static measure<T>(name: string, fn: () => T): T {
    const measurement = new PerformanceMeasurement(name);
    try {
      const result = fn();
      measurement.end();
      return result;
    } catch (error) {
      measurement.end();
      throw error;
    }
  }

  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const measurement = new PerformanceMeasurement(name);
    try {
      const result = await fn();
      measurement.end();
      return result;
    } catch (error) {
      measurement.end();
      throw error;
    }
  }
}

// Performance optimization recommendations
export class PerformanceOptimizer {
  static analyzeAndRecommend(): string[] {
    const profiler = PerformanceProfiler.getInstance();
    const report = profiler.getPerformanceReport();
    const recommendations: string[] = [];

    // Component optimization recommendations
    const slowComponents = report.summary.slowestComponents.filter(
      (c) => c.avgRenderTime > 16,
    );
    slowComponents.forEach((component) => {
      recommendations.push(
        `Consider optimizing ${component.name}: Average render time is ${component.avgRenderTime.toFixed(2)}ms. ` +
          `Try using React.memo, useMemo, or useCallback.`,
      );
    });

    // Memory optimization recommendations
    if (report.summary.memoryUsage.trend === "up") {
      recommendations.push(
        "Memory usage is trending upward. Check for memory leaks, large object retention, or unnecessary state storage.",
      );
    }

    // Network optimization recommendations
    if (report.summary.networkPerformance.avgResponseTime > 1000) {
      recommendations.push(
        `Network performance is slow (${report.summary.networkPerformance.avgResponseTime.toFixed(0)}ms average). ` +
          "Consider request optimization, caching, or lazy loading.",
      );
    }

    // General performance recommendations
    if (report.summary.performanceScore < 80) {
      recommendations.push(
        "Overall performance score is below 80. Review component rendering, memory usage, and network requests.",
      );
    }

    return recommendations;
  }
}

// Initialize performance monitoring for development
if (process.env.NODE_ENV === "development") {
  const profiler = PerformanceProfiler.getInstance();
  profiler.initialize({
    enableRenderTracking: true,
    enableMemoryTracking: true,
    enableNetworkTracking: true,
  });

  // Add to window for debugging
  (window as any).performanceProfiler = profiler;
  (window as any).getPerformanceReport = () => profiler.getPerformanceReport();
  (window as any).getPerformanceRecommendations = () =>
    PerformanceOptimizer.analyzeAndRecommend();
}

export const performanceProfiler = PerformanceProfiler.getInstance();
export { PerformanceProfiler };
