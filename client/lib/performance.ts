import React from "react";

/**
 * Performance optimization utilities for React components
 */

// Generic React.memo wrapper with display name
export function withMemo<T extends React.ComponentType<any>>(
  Component: T,
  displayName?: string,
): T {
  const MemoizedComponent = React.memo(Component) as T;
  if (displayName) {
    MemoizedComponent.displayName = displayName;
  }
  return MemoizedComponent;
}

// Shallow comparison function for React.memo
export function shallowEqual(objA: any, objB: any): boolean {
  if (objA === objB) {
    return true;
  }

  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      objA[keysA[i]] !== objB[keysA[i]]
    ) {
      return false;
    }
  }

  return true;
}

// HOC for adding performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
) {
  return React.memo((props: P) => {
    const renderStart = performance.now();

    React.useEffect(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;

      if (renderTime > 16) {
        // Longer than a frame (60fps)
        console.warn(
          `Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`,
        );
      }
    });

    return React.createElement(Component, props);
  });
}

// Debounce hook for expensive operations
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for frequent events
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= interval) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      interval - (Date.now() - lastRan.current),
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, interval]);

  return throttledValue;
}

// Memoization for expensive calculations
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
): T {
  return React.useCallback(callback, deps);
}

// Virtual list hook for large datasets
export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
  );

  const visibleItems = React.useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    startIndex,
    setScrollTop,
  };
}

// Performance metrics collection
export class PerformanceMetrics {
  private static metrics: Map<string, number[]> = new Map();

  static recordRender(componentName: string, duration: number) {
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }
    const times = this.metrics.get(componentName)!;
    times.push(duration);

    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }

  static getAverageRenderTime(componentName: string): number {
    const times = this.metrics.get(componentName);
    if (!times || times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  static getSlowComponents(
    threshold = 16,
  ): Array<{ name: string; avgTime: number }> {
    const slowComponents: Array<{ name: string; avgTime: number }> = [];

    this.metrics.forEach((times, name) => {
      const avgTime = this.getAverageRenderTime(name);
      if (avgTime > threshold) {
        slowComponents.push({ name, avgTime });
      }
    });

    return slowComponents.sort((a, b) => b.avgTime - a.avgTime);
  }

  static clearMetrics() {
    this.metrics.clear();
  }
}
