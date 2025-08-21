/**
 * Emoji Performance Optimization Service
 * Handles lazy loading, caching, and performance optimizations for emoji rendering
 */

import React from "react";
import { getTwemojiUrl } from "./twemojiService";
import { preloadCriticalEmojis } from "./emojiUtilsEnhanced";

interface EmojiCacheEntry {
  url: string;
  loaded: boolean;
  loading: boolean;
  element?: HTMLImageElement;
  lastUsed: number;
  priority: "critical" | "high" | "medium" | "low";
}

interface PerformanceConfig {
  maxCacheSize: number;
  preloadCritical: boolean;
  lazyLoadThreshold: number;
  enableIntersectionObserver: boolean;
  enableServiceWorkerCache: boolean;
  criticalEmojiTimeout: number;
}

const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  maxCacheSize: 100, // Maximum number of cached emojis
  preloadCritical: true,
  lazyLoadThreshold: 100, // px from viewport
  enableIntersectionObserver: true,
  enableServiceWorkerCache: true,
  criticalEmojiTimeout: 5000, // 5 seconds timeout for critical emojis
};

class EmojiPerformanceManager {
  private cache = new Map<string, EmojiCacheEntry>();
  private config: PerformanceConfig;
  private intersectionObserver?: IntersectionObserver;
  private criticalEmojis = new Set<string>();
  private loadingQueue = new Set<string>();
  private performanceMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    preloadSuccess: 0,
    preloadFails: 0,
    lazyLoadSuccess: 0,
    lazyLoadFails: 0,
  };

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...DEFAULT_PERFORMANCE_CONFIG, ...config };
    this.setupIntersectionObserver();
    this.setupCriticalEmojis();

    // Monitor performance
    this.startPerformanceMonitoring();
  }

  /**
   * Initialize critical emoji preloading
   */
  private setupCriticalEmojis(): void {
    const critical = preloadCriticalEmojis();
    critical.forEach((emoji) => {
      this.criticalEmojis.add(emoji);
      this.setCacheEntry(emoji, "critical");
    });

    if (this.config.preloadCritical) {
      this.preloadCriticalEmojis();
    }
  }

  /**
   * Set up intersection observer for lazy loading
   */
  private setupIntersectionObserver(): void {
    if (
      !this.config.enableIntersectionObserver ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const emoji = entry.target.getAttribute("data-emoji");
            if (emoji) {
              this.loadEmoji(emoji);
              this.intersectionObserver?.unobserve(entry.target);
            }
          }
        });
      },
      {
        rootMargin: `${this.config.lazyLoadThreshold}px`,
        threshold: 0.1,
      },
    );
  }

  /**
   * Add cache entry for an emoji
   */
  private setCacheEntry(
    emoji: string,
    priority: EmojiCacheEntry["priority"],
  ): void {
    const url = getTwemojiUrl(emoji);

    if (!this.cache.has(emoji)) {
      // Clean cache if it's getting too large
      if (this.cache.size >= this.config.maxCacheSize) {
        this.cleanOldestCacheEntries();
      }

      this.cache.set(emoji, {
        url,
        loaded: false,
        loading: false,
        lastUsed: Date.now(),
        priority,
      });
    }
  }

  /**
   * Clean oldest cache entries to maintain performance
   */
  private cleanOldestCacheEntries(): void {
    const entries = Array.from(this.cache.entries())
      .filter(([, entry]) => entry.priority !== "critical") // Don't remove critical emojis
      .sort(([, a], [, b]) => a.lastUsed - b.lastUsed);

    // Remove oldest 20% of non-critical entries
    const toRemove = Math.floor(entries.length * 0.2);
    entries.slice(0, toRemove).forEach(([emoji]) => {
      this.cache.delete(emoji);
    });
  }

  /**
   * Preload critical emojis immediately
   */
  private async preloadCriticalEmojis(): Promise<void> {
    const criticalArray = Array.from(this.criticalEmojis);
    const preloadPromises = criticalArray.map((emoji) =>
      this.loadEmoji(emoji, true).catch((error) => {
        console.warn(`Failed to preload critical emoji ${emoji}:`, error);
        this.performanceMetrics.preloadFails++;
      }),
    );

    try {
      await Promise.allSettled(preloadPromises);
      this.performanceMetrics.preloadSuccess += criticalArray.length;
    } catch (error) {
      console.warn("Critical emoji preloading encountered errors:", error);
    }
  }

  /**
   * Load an emoji with caching and optimization
   */
  async loadEmoji(
    emoji: string,
    isPreload = false,
  ): Promise<HTMLImageElement | null> {
    const cacheEntry = this.cache.get(emoji);

    if (cacheEntry?.loaded && cacheEntry.element) {
      this.performanceMetrics.cacheHits++;
      cacheEntry.lastUsed = Date.now();
      return cacheEntry.element;
    }

    if (this.loadingQueue.has(emoji)) {
      // Already loading, wait for it
      return this.waitForLoad(emoji);
    }

    this.performanceMetrics.cacheMisses++;
    this.loadingQueue.add(emoji);

    try {
      const element = await this.createImageElement(emoji, isPreload);

      if (cacheEntry) {
        cacheEntry.loaded = true;
        cacheEntry.loading = false;
        cacheEntry.element = element;
        cacheEntry.lastUsed = Date.now();
      }

      this.loadingQueue.delete(emoji);

      if (isPreload) {
        this.performanceMetrics.preloadSuccess++;
      } else {
        this.performanceMetrics.lazyLoadSuccess++;
      }

      return element;
    } catch (error) {
      this.loadingQueue.delete(emoji);

      if (isPreload) {
        this.performanceMetrics.preloadFails++;
      } else {
        this.performanceMetrics.lazyLoadFails++;
      }

      console.warn(`Failed to load emoji ${emoji}:`, error);
      return null;
    }
  }

  /**
   * Create optimized image element for emoji
   */
  private createImageElement(
    emoji: string,
    isPreload: boolean,
  ): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = getTwemojiUrl(emoji);

      // Set up timeout for critical emojis
      const timeout = this.criticalEmojis.has(emoji)
        ? this.config.criticalEmojiTimeout
        : 0;

      let timeoutId: NodeJS.Timeout | null = null;

      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          reject(new Error(`Emoji load timeout: ${emoji}`));
        }, timeout);
      }

      img.onload = () => {
        if (timeoutId) clearTimeout(timeoutId);

        // Add performance attributes
        img.setAttribute("data-emoji", emoji);
        img.setAttribute("data-cached", "true");
        img.setAttribute("loading", "lazy");
        img.setAttribute("decoding", "async");

        resolve(img);
      };

      img.onerror = () => {
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error(`Failed to load emoji: ${emoji}`));
      };

      // Set image properties for optimal loading
      if (!isPreload) {
        img.loading = "lazy";
      }
      img.decoding = "async";
      img.crossOrigin = "anonymous";
      img.src = url;
    });
  }

  /**
   * Wait for an emoji that's currently loading
   */
  private async waitForLoad(emoji: string): Promise<HTMLImageElement | null> {
    const maxWaitTime = 3000; // 3 seconds max wait
    const checkInterval = 100; // Check every 100ms
    let waitTime = 0;

    return new Promise((resolve) => {
      const checkLoad = () => {
        const cacheEntry = this.cache.get(emoji);

        if (cacheEntry?.loaded && cacheEntry.element) {
          resolve(cacheEntry.element);
          return;
        }

        if (!this.loadingQueue.has(emoji)) {
          // Loading failed or completed without success
          resolve(null);
          return;
        }

        waitTime += checkInterval;
        if (waitTime >= maxWaitTime) {
          resolve(null);
          return;
        }

        setTimeout(checkLoad, checkInterval);
      };

      checkLoad();
    });
  }

  /**
   * Register element for lazy loading
   */
  observeForLazyLoad(element: Element, emoji: string): void {
    if (!this.intersectionObserver) return;

    element.setAttribute("data-emoji", emoji);
    this.setCacheEntry(emoji, "medium");
    this.intersectionObserver.observe(element);
  }

  /**
   * Unregister element from lazy loading
   */
  unobserveForLazyLoad(element: Element): void {
    if (!this.intersectionObserver) return;
    this.intersectionObserver.unobserve(element);
  }

  /**
   * Prefetch emojis that are likely to be used soon
   */
  async prefetchEmojis(emojis: string[]): Promise<void> {
    const prefetchPromises = emojis
      .filter((emoji) => !this.cache.get(emoji)?.loaded)
      .slice(0, 10) // Limit concurrent prefetches
      .map((emoji) => {
        this.setCacheEntry(emoji, "low");
        return this.loadEmoji(emoji, true);
      });

    await Promise.allSettled(prefetchPromises);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const cacheHitRate =
      (this.performanceMetrics.cacheHits /
        (this.performanceMetrics.cacheHits +
          this.performanceMetrics.cacheMisses)) *
      100;

    return {
      ...this.performanceMetrics,
      cacheHitRate: isNaN(cacheHitRate) ? 0 : cacheHitRate,
      cacheSize: this.cache.size,
      loadingQueueSize: this.loadingQueue.size,
    };
  }

  /**
   * Monitor performance and clean up resources
   */
  private startPerformanceMonitoring(): void {
    // Clean up cache periodically
    setInterval(() => {
      this.cleanOldestCacheEntries();
    }, 60000); // Every minute

    // Log performance metrics in development
    if (process.env.NODE_ENV === "development") {
      setInterval(() => {
        const metrics = this.getPerformanceMetrics();
        console.log("Emoji Performance Metrics:", metrics);
      }, 30000); // Every 30 seconds
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.intersectionObserver?.disconnect();
    this.cache.clear();
    this.loadingQueue.clear();
  }
}

// Global performance manager instance
let performanceManager: EmojiPerformanceManager | null = null;

/**
 * Get or create the global emoji performance manager
 */
export function getEmojiPerformanceManager(
  config?: Partial<PerformanceConfig>,
): EmojiPerformanceManager {
  if (!performanceManager) {
    performanceManager = new EmojiPerformanceManager(config);
  }
  return performanceManager;
}

/**
 * Preload critical navigation emojis for immediate use
 */
export async function preloadNavigationEmojis(): Promise<void> {
  const manager = getEmojiPerformanceManager();
  const navigationEmojis = ["🦉", "🦜", "🐵", "🐘"];

  await Promise.allSettled(
    navigationEmojis.map((emoji) => manager.loadEmoji(emoji, true)),
  );
}

/**
 * Enable lazy loading for an emoji element
 */
export function enableEmojiLazyLoading(element: Element, emoji: string): void {
  const manager = getEmojiPerformanceManager();
  manager.observeForLazyLoad(element, emoji);
}

/**
 * Disable lazy loading for an emoji element
 */
export function disableEmojiLazyLoading(element: Element): void {
  const manager = getEmojiPerformanceManager();
  manager.unobserveForLazyLoad(element);
}

/**
 * Get current emoji performance metrics
 */
export function getEmojiPerformanceMetrics() {
  return performanceManager?.getPerformanceMetrics() || null;
}

/**
 * Cleanup emoji performance resources
 */
export function cleanupEmojiPerformance(): void {
  performanceManager?.cleanup();
  performanceManager = null;
}

/**
 * React hook for emoji performance monitoring
 */
export function useEmojiPerformance() {
  const [metrics, setMetrics] = React.useState(null);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const currentMetrics = getEmojiPerformanceMetrics();
      setMetrics(currentMetrics);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Types for external use
export type { PerformanceConfig, EmojiCacheEntry };
