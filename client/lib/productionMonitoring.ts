/**
 * Production Monitoring and Analytics System
 * Comprehensive monitoring for production applications
 */

interface MonitoringConfig {
  enableErrorTracking: boolean;
  enablePerformanceTracking: boolean;
  enableUserTracking: boolean;
  enableFeatureTracking: boolean;
  apiEndpoint: string;
  apiKey: string;
  environment: 'development' | 'staging' | 'production';
  userId?: string;
  sessionId?: string;
}

interface ErrorEvent {
  type: 'error';
  id: string;
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  userAgent: string;
  additionalContext?: Record<string, any>;
}

interface PerformanceEvent {
  type: 'performance';
  id: string;
  metric: string;
  value: number;
  unit: string;
  timestamp: number;
  url: string;
  userId?: string;
  sessionId?: string;
  additionalContext?: Record<string, any>;
}

interface UserEvent {
  type: 'user';
  id: string;
  action: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: number;
  url: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
}

interface FeatureEvent {
  type: 'feature';
  id: string;
  feature: string;
  action: 'viewed' | 'used' | 'completed' | 'failed';
  timestamp: number;
  url: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

type MonitoringEvent = ErrorEvent | PerformanceEvent | UserEvent | FeatureEvent;

class ProductionMonitoring {
  private static instance: ProductionMonitoring;
  private config: MonitoringConfig;
  private eventQueue: MonitoringEvent[] = [];
  private isOnline = navigator.onLine;
  private flushInterval: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  static getInstance(): ProductionMonitoring {
    if (!ProductionMonitoring.instance) {
      ProductionMonitoring.instance = new ProductionMonitoring();
    }
    return ProductionMonitoring.instance;
  }

  constructor() {
    this.config = {
      enableErrorTracking: process.env.NODE_ENV === 'production',
      enablePerformanceTracking: process.env.NODE_ENV === 'production',
      enableUserTracking: true,
      enableFeatureTracking: true,
      apiEndpoint: process.env.REACT_APP_MONITORING_ENDPOINT || '/api/monitoring',
      apiKey: process.env.REACT_APP_MONITORING_API_KEY || '',
      environment: (process.env.NODE_ENV as any) || 'development',
      sessionId: this.generateSessionId()
    };

    this.initialize();
  }

  // Initialize monitoring
  private initialize(): void {
    this.setupErrorTracking();
    this.setupPerformanceTracking();
    this.setupNetworkTracking();
    this.setupUserActivityTracking();
    this.startEventFlush();
    
    console.log('Production monitoring initialized:', {
      environment: this.config.environment,
      sessionId: this.config.sessionId
    });
  }

  // Configure monitoring
  configure(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Error tracking setup
  private setupErrorTracking(): void {
    if (!this.config.enableErrorTracking) return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        additionalContext: {
          type: 'javascript-error',
          source: 'window.onerror'
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        additionalContext: {
          type: 'unhandled-promise-rejection',
          reason: event.reason,
          source: 'window.onunhandledrejection'
        }
      });
    });

    // React error boundary integration
    this.setupReactErrorTracking();
  }

  // React error tracking
  private setupReactErrorTracking(): void {
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      // Check if this is a React error
      if (args[0] && args[0].includes && args[0].includes('React')) {
        this.trackError({
          message: args.join(' '),
          additionalContext: {
            type: 'react-error',
            source: 'console.error',
            args: args.slice(0, 3) // Limit args to prevent large payloads
          }
        });
      }
      
      originalConsoleError.apply(console, args);
    };
  }

  // Performance tracking setup
  private setupPerformanceTracking(): void {
    if (!this.config.enablePerformanceTracking) return;

    // Core Web Vitals
    this.trackCoreWebVitals();

    // Custom performance metrics
    this.trackCustomMetrics();

    // Resource timing
    this.setupResourceTimingTracking();
  }

  // Core Web Vitals tracking
  private trackCoreWebVitals(): void {
    // FCP (First Contentful Paint)
    this.observePerformanceEntry('paint', (entries) => {
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.trackPerformance('first-contentful-paint', entry.startTime, 'ms');
        }
      });
    });

    // LCP (Largest Contentful Paint)
    this.observePerformanceEntry('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      this.trackPerformance('largest-contentful-paint', lastEntry.startTime, 'ms');
    });

    // FID (First Input Delay) - approximated with event timing
    this.observePerformanceEntry('first-input', (entries) => {
      entries.forEach(entry => {
        const fid = entry.processingStart - entry.startTime;
        this.trackPerformance('first-input-delay', fid, 'ms');
      });
    });

    // CLS (Cumulative Layout Shift)
    this.observePerformanceEntry('layout-shift', (entries) => {
      let cls = 0;
      entries.forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          cls += (entry as any).value;
        }
      });
      this.trackPerformance('cumulative-layout-shift', cls, 'score');
    });
  }

  // Observe performance entries
  private observePerformanceEntry(type: string, callback: (entries: PerformanceEntry[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ entryTypes: [type] });
    } catch (error) {
      console.warn(`Performance observer for ${type} not supported:`, error);
    }
  }

  // Custom metrics tracking
  private trackCustomMetrics(): void {
    // Navigation timing
    if (performance.navigation) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.trackPerformance('dom-content-loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'ms');
        this.trackPerformance('load-complete', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
        this.trackPerformance('dns-lookup', navigation.domainLookupEnd - navigation.domainLookupStart, 'ms');
        this.trackPerformance('tcp-connect', navigation.connectEnd - navigation.connectStart, 'ms');
      }
    }

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.trackPerformance('memory-used', memory.usedJSHeapSize, 'bytes');
      this.trackPerformance('memory-total', memory.totalJSHeapSize, 'bytes');
      this.trackPerformance('memory-limit', memory.jsHeapSizeLimit, 'bytes');
    }
  }

  // Resource timing tracking
  private setupResourceTimingTracking(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        const resource = entry as PerformanceResourceTiming;
        
        // Track slow resources
        if (resource.duration > 1000) { // Slower than 1 second
          this.trackPerformance('slow-resource', resource.duration, 'ms', {
            resourceUrl: resource.name,
            resourceType: this.getResourceType(resource.name),
            transferSize: resource.transferSize
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  // Network tracking
  private setupNetworkTracking(): void {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.trackUserEvent('network', 'online');
      this.flushEvents(); // Flush queued events when back online
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.trackUserEvent('network', 'offline');
    });

    // Monitor connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const trackConnectionChange = () => {
        this.trackUserEvent('network', 'connection-change', undefined, {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
      };

      connection.addEventListener('change', trackConnectionChange);
    }
  }

  // User activity tracking
  private setupUserActivityTracking(): void {
    if (!this.config.enableUserTracking) return;

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      this.trackUserEvent('page', document.hidden ? 'hidden' : 'visible');
    });

    // Session duration tracking
    let sessionStart = Date.now();
    
    window.addEventListener('beforeunload', () => {
      const sessionDuration = Date.now() - sessionStart;
      this.trackPerformance('session-duration', sessionDuration, 'ms');
    });

    // Scroll depth tracking
    this.setupScrollTracking();

    // Click tracking
    this.setupClickTracking();
  }

  // Scroll depth tracking
  private setupScrollTracking(): void {
    let maxScrollDepth = 0;
    const trackScrollDepth = this.throttle(() => {
      const scrollDepth = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track milestone scroll depths
        if ([25, 50, 75, 90, 100].includes(scrollDepth)) {
          this.trackUserEvent('scroll', 'depth', `${scrollDepth}%`);
        }
      }
    }, 1000);

    window.addEventListener('scroll', trackScrollDepth, { passive: true });
  }

  // Click tracking
  private setupClickTracking(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const elementType = target.tagName.toLowerCase();
      const elementText = target.textContent?.substring(0, 100) || '';
      const elementId = target.id;
      const elementClass = target.className;

      // Track important clicks
      if (['button', 'a', 'input'].includes(elementType) || target.role === 'button') {
        this.trackUserEvent('click', elementType, elementText, {
          elementId,
          elementClass: typeof elementClass === 'string' ? elementClass : '',
          x: event.clientX,
          y: event.clientY
        });
      }
    }, { passive: true });
  }

  // Track error
  trackError(error: Partial<ErrorEvent>): void {
    if (!this.config.enableErrorTracking) return;

    const errorEvent: ErrorEvent = {
      type: 'error',
      id: this.generateEventId(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      line: error.line,
      column: error.column,
      timestamp: Date.now(),
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      userAgent: navigator.userAgent,
      additionalContext: error.additionalContext
    };

    this.queueEvent(errorEvent);
  }

  // Track performance metric
  trackPerformance(metric: string, value: number, unit: string, context?: Record<string, any>): void {
    if (!this.config.enablePerformanceTracking) return;

    const performanceEvent: PerformanceEvent = {
      type: 'performance',
      id: this.generateEventId(),
      metric,
      value,
      unit,
      timestamp: Date.now(),
      url: window.location.href,
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      additionalContext: context
    };

    this.queueEvent(performanceEvent);
  }

  // Track user event
  trackUserEvent(category: string, action: string, label?: string, properties?: Record<string, any>): void {
    if (!this.config.enableUserTracking) return;

    const userEvent: UserEvent = {
      type: 'user',
      id: this.generateEventId(),
      action,
      category,
      label,
      timestamp: Date.now(),
      url: window.location.href,
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      properties
    };

    this.queueEvent(userEvent);
  }

  // Track feature usage
  trackFeature(feature: string, action: 'viewed' | 'used' | 'completed' | 'failed', metadata?: Record<string, any>): void {
    if (!this.config.enableFeatureTracking) return;

    const featureEvent: FeatureEvent = {
      type: 'feature',
      id: this.generateEventId(),
      feature,
      action,
      timestamp: Date.now(),
      url: window.location.href,
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      metadata
    };

    this.queueEvent(featureEvent);
  }

  // Queue event for batch sending
  private queueEvent(event: MonitoringEvent): void {
    this.eventQueue.push(event);

    // Immediately send critical errors
    if (event.type === 'error') {
      this.flushEvents();
    }
  }

  // Start automatic event flushing
  private startEventFlush(): void {
    this.flushInterval = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, 10000); // Flush every 10 seconds
  }

  // Flush events to server
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.isOnline) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Environment': this.config.environment
        },
        body: JSON.stringify({
          events,
          meta: {
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now(),
            sessionId: this.config.sessionId,
            userId: this.config.userId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`Monitoring: Sent ${events.length} events`);
    } catch (error) {
      console.error('Failed to send monitoring events:', error);
      
      // Re-queue events for retry (with limit)
      if (this.eventQueue.length < 1000) {
        this.eventQueue.unshift(...events);
      }
    }
  }

  // Utility methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `ses_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(mp3|wav|ogg)$/)) return 'audio';
    if (url.match(/\.(mp4|webm|mov)$/)) return 'video';
    return 'other';
  }

  private throttle<T extends (...args: any[]) => void>(func: T, limit: number): T {
    let inThrottle: boolean;
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }

  // Cleanup
  cleanup(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    // Final flush
    this.flushEvents();
  }

  // Get monitoring statistics
  getStats(): {
    eventsQueued: number;
    sessionId: string;
    isOnline: boolean;
    environment: string;
  } {
    return {
      eventsQueued: this.eventQueue.length,
      sessionId: this.config.sessionId || '',
      isOnline: this.isOnline,
      environment: this.config.environment
    };
  }
}

// React hooks for monitoring
export function useMonitoring() {
  const monitoring = React.useMemo(() => ProductionMonitoring.getInstance(), []);

  const trackError = React.useCallback((error: Error, context?: Record<string, any>) => {
    monitoring.trackError({
      message: error.message,
      stack: error.stack,
      additionalContext: context
    });
  }, [monitoring]);

  const trackUserAction = React.useCallback((category: string, action: string, label?: string, properties?: Record<string, any>) => {
    monitoring.trackUserEvent(category, action, label, properties);
  }, [monitoring]);

  const trackFeature = React.useCallback((feature: string, action: 'viewed' | 'used' | 'completed' | 'failed', metadata?: Record<string, any>) => {
    monitoring.trackFeature(feature, action, metadata);
  }, [monitoring]);

  const trackPerformance = React.useCallback((metric: string, value: number, unit: string, context?: Record<string, any>) => {
    monitoring.trackPerformance(metric, value, unit, context);
  }, [monitoring]);

  return {
    trackError,
    trackUserAction,
    trackFeature,
    trackPerformance,
    getStats: monitoring.getStats.bind(monitoring)
  };
}

// Component usage tracking hook
export function useComponentTracking(componentName: string) {
  const { trackFeature, trackPerformance } = useMonitoring();

  React.useEffect(() => {
    const startTime = performance.now();
    trackFeature(componentName, 'viewed');

    return () => {
      const endTime = performance.now();
      trackPerformance(`${componentName}-mount-time`, endTime - startTime, 'ms');
    };
  }, [componentName, trackFeature, trackPerformance]);

  const trackAction = React.useCallback((action: string, metadata?: Record<string, any>) => {
    trackFeature(componentName, 'used', { action, ...metadata });
  }, [componentName, trackFeature]);

  return { trackAction };
}

export const productionMonitoring = ProductionMonitoring.getInstance();
