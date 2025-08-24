/**
 * Temporary stub for parentDashboardAnalytics to fix app loading issues
 */

// Stub implementation to prevent esbuild crashes
export const parentDashboardAnalytics = {
  trackDashboardLoad: () => {},
  trackMapInteraction: () => {},
  trackTimelineFilter: () => {},
  trackFeatureUsage: () => {},
  trackError: () => {},
  getMetrics: () => ({ loadTimes: [], mapInteractions: 0, timelineFilters: 0, errorOccurrences: 0 }),
  getPerformanceSummary: () => ({ averageLoadTime: 0 }),
};

export const withPerformanceTracking = (fn: any) => fn;
