/**
 * Jungle Adventure Performance Optimization System
 * 
 * Comprehensive performance utilities respecting user preferences
 * - Reduced motion and save-data support
 * - Asset optimization and lazy loading
 * - Memory management and cleanup
 * - Performance monitoring and budgets
 */

/* ========================================
 * PERFORMANCE BUDGETS
 * ======================================== */

export const PERFORMANCE_BUDGETS = {
  // CSS budgets
  initialCSS: 90 * 1024, // 90KB initial CSS
  totalCSS: 150 * 1024,  // 150KB total CSS
  
  // JavaScript budgets  
  initialJS: 150 * 1024, // 150KB initial JS
  totalJS: 300 * 1024,   // 300KB total JS
  
  // Image budgets (mobile)
  mobileImages: 250 * 1024, // 250KB total images on mobile
  desktopImages: 500 * 1024, // 500KB total images on desktop
  
  // Core Web Vitals targets
  lcp: 2500,    // Largest Contentful Paint < 2.5s
  fid: 100,     // First Input Delay < 100ms
  cls: 0.1,     // Cumulative Layout Shift < 0.1
  inp: 200,     // Interaction to Next Paint < 200ms
} as const;

/* ========================================
 * USER PREFERENCE DETECTION
 * ======================================== */

export interface UserPreferences {
  reducedMotion: boolean;
  saveData: boolean;
  highContrast: boolean;
  darkMode: boolean;
}

export function getUserPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return {
      reducedMotion: false,
      saveData: false,
      highContrast: false,
      darkMode: false,
    };
  }

  return {
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: 
      window.matchMedia("(prefers-reduced-data: reduce)").matches ||
      // @ts-ignore - navigator.connection might not be available
      (navigator.connection && navigator.connection.saveData === true),
    highContrast: window.matchMedia("(prefers-contrast: high)").matches,
    darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
  };
}

export function createPreferencesWatcher(
  callback: (preferences: UserPreferences) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const queries = [
    window.matchMedia("(prefers-reduced-motion: reduce)"),
    window.matchMedia("(prefers-reduced-data: reduce)"),
    window.matchMedia("(prefers-contrast: high)"),
    window.matchMedia("(prefers-color-scheme: dark)"),
  ];

  const handler = () => callback(getUserPreferences());
  
  queries.forEach(query => query.addEventListener("change", handler));
  
  return () => {
    queries.forEach(query => query.removeEventListener("change", handler));
  };
}

/* ========================================
 * LAZY LOADING UTILITIES
 * ======================================== */

export interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  respectSaveData?: boolean;
}

export function createLazyLoader(options: LazyLoadOptions = {}) {
  const {
    rootMargin = "50px",
    threshold = 0.1,
    respectSaveData = true,
  } = options;

  const preferences = getUserPreferences();
  
  // Disable lazy loading if save-data is enabled and we respect it
  if (respectSaveData && preferences.saveData) {
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    };
  }

  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {},
    };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          
          // Load images
          if (target.tagName === "IMG") {
            const img = target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute("data-srcset");
            }
          }
          
          // Load background images
          if (target.dataset.bgSrc) {
            target.style.backgroundImage = `url(${target.dataset.bgSrc})`;
            target.removeAttribute("data-bg-src");
          }
          
          // Trigger custom load event
          target.dispatchEvent(new CustomEvent("lazyload"));
          
          observer.unobserve(target);
        }
      });
    },
    { rootMargin, threshold }
  );

  return observer;
}

/* ========================================
 * ANIMATION PERFORMANCE
 * ======================================== */

export function optimizeAnimations() {
  const preferences = getUserPreferences();
  
  if (preferences.reducedMotion) {
    // Disable animations globally
    document.documentElement.style.setProperty("--motion-scale", "0");
    document.documentElement.style.setProperty("--dur-fast", "0ms");
    document.documentElement.style.setProperty("--dur-normal", "0ms");
    document.documentElement.style.setProperty("--dur-slow", "0ms");
  }
  
  if (preferences.saveData) {
    // Reduce animation complexity
    document.documentElement.style.setProperty("--shadow-float", "var(--shadow-soft)");
    document.documentElement.style.setProperty("--shadow-glow", "var(--shadow-md)");
  }
}

/* ========================================
 * ASSET OPTIMIZATION
 * ======================================== */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpg" | "png";
  loading?: "lazy" | "eager";
  priority?: boolean;
}

export function createOptimizedImageProps(
  src: string,
  alt: string,
  options: ImageOptimizationOptions = {}
): React.ImgHTMLAttributes<HTMLImageElement> {
  const {
    width,
    height,
    quality = 80,
    format = "webp",
    loading = "lazy",
    priority = false,
  } = options;

  const preferences = getUserPreferences();
  
  // Use lower quality for save-data
  const finalQuality = preferences.saveData ? Math.min(quality, 60) : quality;
  
  // Build optimized src
  const params = new URLSearchParams();
  if (width) params.set("w", width.toString());
  if (height) params.set("h", height.toString());
  params.set("q", finalQuality.toString());
  params.set("f", format);
  
  const optimizedSrc = `${src}?${params.toString()}`;
  
  return {
    src: optimizedSrc,
    alt,
    width,
    height,
    loading: priority ? "eager" : loading,
    decoding: "async",
    ...(loading === "lazy" && { "data-src": optimizedSrc }),
  };
}

/* ========================================
 * MEMORY MANAGEMENT
 * ======================================== */

export class ComponentCleanup {
  private cleanupFunctions: (() => void)[] = [];
  
  add(cleanup: () => void) {
    this.cleanupFunctions.push(cleanup);
  }
  
  addEventListener(
    element: HTMLElement | Window | Document,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) {
    element.addEventListener(event, handler, options);
    this.add(() => element.removeEventListener(event, handler, options));
  }
  
  addTimeout(id: NodeJS.Timeout) {
    this.add(() => clearTimeout(id));
  }
  
  addInterval(id: NodeJS.Timeout) {
    this.add(() => clearInterval(id));
  }
  
  addObserver(observer: IntersectionObserver | ResizeObserver | MutationObserver) {
    this.add(() => observer.disconnect());
  }
  
  cleanup() {
    this.cleanupFunctions.forEach(fn => fn());
    this.cleanupFunctions = [];
  }
}

/* ========================================
 * PERFORMANCE MONITORING
 * ======================================== */

export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  inp?: number;
  ttfb?: number;
  fcp?: number;
}

export function createPerformanceMonitor() {
  const metrics: PerformanceMetrics = {};
  
  if (typeof window === "undefined") {
    return { metrics, getReport: () => metrics };
  }

  // Largest Contentful Paint
  if ("PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      console.warn("LCP monitoring not available");
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          metrics.fid = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      console.warn("FID monitoring not available");
    }

    // Cumulative Layout Shift
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        metrics.cls = clsValue;
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      console.warn("CLS monitoring not available");
    }
  }

  // Navigation timing
  if ("performance" in window && "getEntriesByType" in performance) {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
      metrics.fcp = navigation.loadEventEnd - navigation.navigationStart;
    }
  }

  return {
    metrics,
    getReport: () => ({
      ...metrics,
      budgetStatus: {
        lcp: metrics.lcp ? metrics.lcp <= PERFORMANCE_BUDGETS.lcp : undefined,
        fid: metrics.fid ? metrics.fid <= PERFORMANCE_BUDGETS.fid : undefined,
        cls: metrics.cls ? metrics.cls <= PERFORMANCE_BUDGETS.cls : undefined,
        inp: metrics.inp ? metrics.inp <= PERFORMANCE_BUDGETS.inp : undefined,
      },
    }),
  };
}

/* ========================================
 * RESOURCE HINTS
 * ======================================== */

export function addResourceHints() {
  if (typeof document === "undefined") return;

  const preferences = getUserPreferences();
  
  // Skip resource hints if save-data is enabled
  if (preferences.saveData) return;

  // Preconnect to important domains
  const domains = [
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
  ];

  domains.forEach(domain => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = domain;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  });
}

/* ========================================
 * BUNDLE OPTIMIZATION
 * ======================================== */

export function createBundleAnalyzer() {
  const bundleSizes = new Map<string, number>();
  
  return {
    trackBundle: (name: string, size: number) => {
      bundleSizes.set(name, size);
    },
    
    getBundleReport: () => {
      const totalSize = Array.from(bundleSizes.values()).reduce((sum, size) => sum + size, 0);
      
      return {
        bundles: Object.fromEntries(bundleSizes),
        totalSize,
        budgetStatus: {
          initialJS: totalSize <= PERFORMANCE_BUDGETS.initialJS,
          totalJS: totalSize <= PERFORMANCE_BUDGETS.totalJS,
        },
        recommendations: totalSize > PERFORMANCE_BUDGETS.totalJS ? [
          "Consider code splitting for large bundles",
          "Enable tree shaking for unused code",
          "Use dynamic imports for route-based chunks",
        ] : [],
      };
    },
  };
}

/* ========================================
 * REACT PERFORMANCE HOOKS
 * ======================================== */

export function usePerformanceOptimization() {
  const [preferences, setPreferences] = React.useState(getUserPreferences());
  const cleanupRef = React.useRef(new ComponentCleanup());

  React.useEffect(() => {
    const cleanup = cleanupRef.current;
    
    // Watch for preference changes
    const unwatch = createPreferencesWatcher(setPreferences);
    cleanup.add(unwatch);
    
    // Optimize animations based on preferences
    optimizeAnimations();
    
    // Add resource hints
    addResourceHints();
    
    return () => cleanup.cleanup();
  }, []);

  React.useEffect(() => {
    // Re-optimize when preferences change
    optimizeAnimations();
  }, [preferences]);

  return {
    preferences,
    cleanup: cleanupRef.current,
  };
}

export function useLazyLoading(options?: LazyLoadOptions) {
  const observerRef = React.useRef<IntersectionObserver>();
  
  React.useEffect(() => {
    observerRef.current = createLazyLoader(options);
    
    return () => {
      observerRef.current?.disconnect();
    };
  }, [options]);

  const observe = React.useCallback((element: HTMLElement) => {
    observerRef.current?.observe(element);
  }, []);

  const unobserve = React.useCallback((element: HTMLElement) => {
    observerRef.current?.unobserve(element);
  }, []);

  return { observe, unobserve };
}

// Re-export React for convenience
import React from "react";
