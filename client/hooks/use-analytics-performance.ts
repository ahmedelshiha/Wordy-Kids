import { useState, useEffect, useCallback, useMemo } from "react";

// Performance monitoring hook
export const useAnalyticsPerformance = () => {
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    analytics: false,
    charts: false,
    reports: false,
  });

  // Detect performance capabilities
  useEffect(() => {
    const checkPerformance = () => {
      // Check device capabilities
      const connection = (navigator as any).connection;
      const isSlowConnection =
        connection &&
        connection.effectiveType &&
        ["slow-2g", "2g"].includes(connection.effectiveType);

      // Check device memory (if available)
      const deviceMemory = (navigator as any).deviceMemory;
      const isLowMemory = deviceMemory && deviceMemory < 4;

      // Check CPU cores
      const cpuCores = navigator.hardwareConcurrency;
      const isLowCPU = cpuCores && cpuCores < 4;

      const shouldUseLowPerformanceMode =
        isSlowConnection || isLowMemory || isLowCPU;

      if (shouldUseLowPerformanceMode) {
        setIsLowPerformanceMode(true);
        document.body.classList.add("low-performance-mode");
      }
    };

    checkPerformance();
  }, []);

  const setLoadingState = useCallback(
    (key: keyof typeof loadingStates, value: boolean) => {
      setLoadingStates((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const measurePerformance = useCallback((name: string, fn: () => void) => {
    if (typeof window !== "undefined" && window.performance) {
      const start = performance.now();
      fn();
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
    } else {
      fn();
    }
  }, []);

  return {
    isLowPerformanceMode,
    loadingStates,
    setLoadingState,
    measurePerformance,
  };
};

// Lazy loading utilities
export const useLazyAnalytics = () => {
  const [shouldLoadCharts, setShouldLoadCharts] = useState(false);
  const [shouldLoadReports, setShouldLoadReports] = useState(false);

  const triggerChartLoad = useCallback(() => {
    setShouldLoadCharts(true);
  }, []);

  const triggerReportLoad = useCallback(() => {
    setShouldLoadReports(true);
  }, []);

  return {
    shouldLoadCharts,
    shouldLoadReports,
    triggerChartLoad,
    triggerReportLoad,
  };
};

// Optimized data calculation
export const useOptimizedAnalytics = (children: any[], timeRange: string) => {
  return useMemo(() => {
    // Memoize expensive calculations
    const calculateMetrics = () => {
      // Simulate expensive calculations
      const categoryProgress = [
        {
          category: "Animals",
          totalWords: 150,
          masteredWords: 89,
          practiceWords: 23,
          accuracy: 87,
          timeSpent: 180,
          difficulty: "medium" as const,
        },
        {
          category: "Colors",
          totalWords: 50,
          masteredWords: 45,
          practiceWords: 3,
          accuracy: 94,
          timeSpent: 90,
          difficulty: "easy" as const,
        },
        {
          category: "Numbers",
          totalWords: 100,
          masteredWords: 67,
          practiceWords: 15,
          accuracy: 82,
          timeSpent: 120,
          difficulty: "medium" as const,
        },
        {
          category: "School",
          totalWords: 200,
          masteredWords: 134,
          practiceWords: 28,
          accuracy: 89,
          timeSpent: 240,
          difficulty: "hard" as const,
        },
        {
          category: "Family",
          totalWords: 80,
          masteredWords: 72,
          practiceWords: 5,
          accuracy: 96,
          timeSpent: 100,
          difficulty: "easy" as const,
        },
      ];

      const totalWordsMastered = categoryProgress.reduce(
        (sum, cat) => sum + cat.masteredWords,
        0,
      );
      const wordsNeedPractice = categoryProgress.reduce(
        (sum, cat) => sum + cat.practiceWords,
        0,
      );
      const totalWordsLearned = categoryProgress.reduce(
        (sum, cat) => sum + cat.masteredWords + cat.practiceWords,
        0,
      );
      const totalTimeSpent = categoryProgress.reduce(
        (sum, cat) => sum + cat.timeSpent,
        0,
      );
      const overallAccuracy = Math.round(
        categoryProgress.reduce((sum, cat) => sum + cat.accuracy, 0) /
          categoryProgress.length,
      );

      return {
        overview: {
          totalWordsMastered,
          wordsNeedPractice,
          overallAccuracy,
          totalWordsLearned,
          totalLearningTime: totalTimeSpent,
          activeLearningStreak: 12,
          averageDailyTime: Math.round(totalTimeSpent / 30),
          totalSessions: 156,
        },
        categoryProgress,
      };
    };

    return calculateMetrics();
  }, [children, timeRange]);
};
