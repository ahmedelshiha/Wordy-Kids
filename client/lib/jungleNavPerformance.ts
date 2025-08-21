/**
 * 🚀 Jungle Navigation Performance Utilities
 * Optimizes navigation performance across different device capabilities
 */

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  isLowEnd: boolean;
}

export interface PerformanceOptimizations {
  reduceAnimations: boolean;
  disableParticles: boolean;
  simplifyBackground: boolean;
  preloadAssets: boolean;
  enableVirtualization: boolean;
}

class JungleNavPerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private isMonitoring = false;
  private rafId: number | null = null;

  // Device capability detection
  static detectDeviceCapabilities(): PerformanceOptimizations {
    const capabilities = {
      reduceAnimations: false,
      disableParticles: false,
      simplifyBackground: false,
      preloadAssets: true,
      enableVirtualization: false,
    };

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      capabilities.reduceAnimations = true;
      capabilities.disableParticles = true;
      return capabilities;
    }

    // Hardware detection
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const isLowEnd = hardwareConcurrency < 4;

    // Memory detection (if available)
    const memory = (navigator as any).deviceMemory;
    const isLowMemory = memory && memory < 4;

    // Screen size detection
    const isMobile = window.innerWidth < 768;
    const isHighDPI = window.devicePixelRatio > 2;

    // Connection speed detection
    const connection = (navigator as any).connection;
    const isSlowConnection = connection && (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.effectiveType === '3g'
    );

    // Apply optimizations based on capabilities
    if (isLowEnd || isLowMemory) {
      capabilities.reduceAnimations = true;
      capabilities.disableParticles = true;
      capabilities.simplifyBackground = true;
    }

    if (isMobile) {
      capabilities.disableParticles = true;
      if (isHighDPI) {
        capabilities.simplifyBackground = true;
      }
    }

    if (isSlowConnection) {
      capabilities.preloadAssets = false;
      capabilities.simplifyBackground = true;
    }

    return capabilities;
  }

  // Start FPS monitoring
  startMonitoring(callback?: (metrics: PerformanceMetrics) => void): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();

    const monitor = () => {
      this.frameCount++;
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;

      if (deltaTime >= 1000) {
        this.fps = Math.round((this.frameCount * 1000) / deltaTime);
        this.frameCount = 0;
        this.lastTime = currentTime;

        if (callback) {
          const metrics: PerformanceMetrics = {
            fps: this.fps,
            memoryUsage: this.getMemoryUsage(),
            renderTime: deltaTime,
            isLowEnd: this.fps < 30,
          };
          callback(metrics);
        }
      }

      if (this.isMonitoring) {
        this.rafId = requestAnimationFrame(monitor);
      }
    };

    this.rafId = requestAnimationFrame(monitor);
  }

  // Stop monitoring
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // Get current FPS
  getCurrentFPS(): number {
    return this.fps;
  }

  // Get memory usage (if available)
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return 0;
  }
}

// Asset preloading utilities
export class JungleAssetManager {
  private loadedAssets = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();

  // Preload images
  async preloadImage(src: string): Promise<void> {
    if (this.loadedAssets.has(src)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedAssets.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // Preload audio
  async preloadAudio(src: string): Promise<void> {
    if (this.loadedAssets.has(src)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.loadedAssets.add(src);
        resolve();
      };
      audio.onerror = reject;
      audio.preload = 'metadata';
      audio.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // Preload critical assets
  async preloadCriticalAssets(): Promise<void> {
    const criticalAssets = [
      // Animal emoji fallbacks (using data URLs for instant loading)
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🦉</text></svg>',
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🦜</text></svg>',
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🐵</text></svg>',
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="80" font-size="80">🐘</text></svg>',
    ];

    const promises = criticalAssets.map(asset => this.preloadImage(asset));
    await Promise.allSettled(promises);
  }

  // Check if asset is loaded
  isAssetLoaded(src: string): boolean {
    return this.loadedAssets.has(src);
  }
}

// Performance optimization strategies
export class JunglePerformanceOptimizer {
  private monitor = new JungleNavPerformanceMonitor();
  private assetManager = new JungleAssetManager();
  private optimizations: PerformanceOptimizations;

  constructor() {
    this.optimizations = JungleNavPerformanceMonitor.detectDeviceCapabilities();
  }

  // Initialize optimizations
  async initialize(): Promise<void> {
    // Preload critical assets if device can handle it
    if (this.optimizations.preloadAssets) {
      try {
        await this.assetManager.preloadCriticalAssets();
      } catch (error) {
        console.warn('Asset preloading failed:', error);
      }
    }

    // Start performance monitoring
    this.monitor.startMonitoring((metrics) => {
      this.adjustOptimizations(metrics);
    });
  }

  // Dynamically adjust optimizations based on performance
  private adjustOptimizations(metrics: PerformanceMetrics): void {
    const { fps, isLowEnd, memoryUsage } = metrics;

    // If FPS drops below threshold, enable more aggressive optimizations
    if (fps < 24 || isLowEnd) {
      this.optimizations.reduceAnimations = true;
      this.optimizations.disableParticles = true;
    }

    // If memory usage is high, simplify rendering
    if (memoryUsage > 0.8) {
      this.optimizations.simplifyBackground = true;
      this.optimizations.disableParticles = true;
    }

    // Broadcast optimization changes
    window.dispatchEvent(new CustomEvent('jungle-nav-optimizations-updated', {
      detail: this.optimizations
    }));
  }

  // Get current optimizations
  getOptimizations(): PerformanceOptimizations {
    return { ...this.optimizations };
  }

  // Cleanup
  destroy(): void {
    this.monitor.stopMonitoring();
  }
}

// Utility functions for component optimization
export const performanceUtils = {
  // Throttle function calls
  throttle<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number | null = null;
    let lastExecTime = 0;

    return (...args: Parameters<T>) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  },

  // Debounce function calls
  debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number | null = null;

    return (...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  // Check if element is in viewport (for virtualization)
  isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Optimize CSS transforms for better performance
  enableHardwareAcceleration(element: HTMLElement): void {
    element.style.transform = element.style.transform || 'translateZ(0)';
    element.style.willChange = 'transform, opacity';
  },

  // Disable hardware acceleration when not needed
  disableHardwareAcceleration(element: HTMLElement): void {
    element.style.willChange = 'auto';
  },
};

// Export singleton instance
export const junglePerformanceOptimizer = new JunglePerformanceOptimizer();
export const jungleAssetManager = new JungleAssetManager();
