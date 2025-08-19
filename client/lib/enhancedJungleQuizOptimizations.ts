// =====================================================
// ENHANCED JUNGLE QUIZ - PERFORMANCE OPTIMIZATIONS
// =====================================================

interface PerformanceConfig {
  enableVirtualization: boolean;
  enableImageLazyLoading: boolean;
  enableAudioPreloading: boolean;
  enableComponentMemoization: boolean;
  enableAnimationOptimizations: boolean;
  enableBatteryOptimizations: boolean;
  enableReducedMotion: boolean;
  maxConcurrentAnimations: number;
  audioBufferSize: number;
  imageCompressionQuality: number;
  memoryManagement: {
    maxCacheSize: number; // MB
    cleanupInterval: number; // milliseconds
    lowMemoryThreshold: number; // MB
  };
}

interface BatteryInfo {
  level: number;
  charging: boolean;
  dischargingTime: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// =====================================================
// PERFORMANCE OPTIMIZER CLASS
// =====================================================

export class EnhancedJungleQuizOptimizer {
  private config: PerformanceConfig;
  private isLowEndDevice: boolean = false;
  private batteryInfo: BatteryInfo | null = null;
  private memoryMonitor: NodeJS.Timeout | null = null;
  private animationQueue: Array<{ id: string; priority: number; animation: () => void }> = [];
  private imageCache = new Map<string, HTMLImageElement>();
  private audioCache = new Map<string, AudioBuffer>();
  
  // Performance metrics
  private performanceMetrics = {
    averageFPS: 60,
    memoryUsage: 0,
    renderTime: 0,
    audioLatency: 0,
    animationDroppedFrames: 0
  };

  // Optimization strategies
  private optimizationStrategies = new Map<string, boolean>();

  constructor(config?: Partial<PerformanceConfig>) {
    this.config = {
      enableVirtualization: true,
      enableImageLazyLoading: true,
      enableAudioPreloading: true,
      enableComponentMemoization: true,
      enableAnimationOptimizations: true,
      enableBatteryOptimizations: true,
      enableReducedMotion: false,
      maxConcurrentAnimations: 5,
      audioBufferSize: 4096,
      imageCompressionQuality: 0.8,
      memoryManagement: {
        maxCacheSize: 50, // 50MB
        cleanupInterval: 30000, // 30 seconds
        lowMemoryThreshold: 100 // 100MB
      },
      ...config
    };

    this.initialize();
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  private async initialize(): Promise<void> {
    // Detect device capabilities
    await this.detectDeviceCapabilities();
    
    // Initialize battery monitoring
    await this.initializeBatteryMonitoring();
    
    // Start memory monitoring
    this.startMemoryMonitoring();
    
    // Apply initial optimizations
    this.applyInitialOptimizations();
    
    // Set up optimization strategies
    this.setupOptimizationStrategies();

    console.log('Enhanced Jungle Quiz Optimizer initialized', {
      isLowEndDevice: this.isLowEndDevice,
      batteryLevel: this.batteryInfo?.level,
      memoryLimit: this.getMemoryInfo()?.jsHeapSizeLimit
    });
  }

  private async detectDeviceCapabilities(): Promise<void> {
    // CPU detection (simplified)
    const start = performance.now();
    for (let i = 0; i < 100000; i++) {
      Math.random();
    }
    const cpuTime = performance.now() - start;
    
    // Memory detection
    const memoryInfo = this.getMemoryInfo();
    const totalMemory = memoryInfo?.jsHeapSizeLimit || 0;
    
    // GPU detection (WebGL test)
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const hasWebGL = !!gl;
    
    // Determine if this is a low-end device
    this.isLowEndDevice = 
      cpuTime > 50 || // Slow CPU
      totalMemory < 50 * 1024 * 1024 || // Less than 50MB heap
      !hasWebGL || // No WebGL support
      navigator.hardwareConcurrency <= 2; // 2 or fewer cores

    if (this.isLowEndDevice) {
      console.log('Low-end device detected, applying performance optimizations');
      this.applyLowEndOptimizations();
    }
  }

  private async initializeBatteryMonitoring(): Promise<void> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        
        this.batteryInfo = {
          level: battery.level,
          charging: battery.charging,
          dischargingTime: battery.dischargingTime
        };

        // Monitor battery changes
        battery.addEventListener('levelchange', () => {
          this.batteryInfo!.level = battery.level;
          this.handleBatteryChange();
        });

        battery.addEventListener('chargingchange', () => {
          this.batteryInfo!.charging = battery.charging;
          this.handleBatteryChange();
        });
      }
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
  }

  private startMemoryMonitoring(): void {
    if (!this.config.memoryManagement.cleanupInterval) return;

    this.memoryMonitor = setInterval(() => {
      this.checkMemoryUsage();
    }, this.config.memoryManagement.cleanupInterval);
  }

  // =====================================================
  // OPTIMIZATION STRATEGIES
  // =====================================================

  private setupOptimizationStrategies(): void {
    // Image optimization strategy
    this.optimizationStrategies.set('lazy-loading', this.config.enableImageLazyLoading);
    this.optimizationStrategies.set('image-compression', true);
    this.optimizationStrategies.set('webp-support', this.supportsWebP());
    
    // Animation optimization strategy
    this.optimizationStrategies.set('animation-culling', this.config.enableAnimationOptimizations);
    this.optimizationStrategies.set('reduced-motion', this.config.enableReducedMotion || this.isLowEndDevice);
    this.optimizationStrategies.set('animation-queuing', true);
    
    // Audio optimization strategy
    this.optimizationStrategies.set('audio-preloading', this.config.enableAudioPreloading);
    this.optimizationStrategies.set('audio-compression', true);
    this.optimizationStrategies.set('spatial-audio', !this.isLowEndDevice);
    
    // Rendering optimization strategy
    this.optimizationStrategies.set('virtualization', this.config.enableVirtualization);
    this.optimizationStrategies.set('component-memoization', this.config.enableComponentMemoization);
    this.optimizationStrategies.set('gpu-acceleration', !this.isLowEndDevice);
  }

  private applyInitialOptimizations(): void {
    // CSS optimizations
    this.applyCSSOptimizations();
    
    // DOM optimizations
    this.applyDOMOptimizations();
    
    // Event optimizations
    this.applyEventOptimizations();
  }

  private applyLowEndOptimizations(): void {
    // Reduce animation complexity
    this.config.maxConcurrentAnimations = 2;
    this.config.enableReducedMotion = true;
    
    // Reduce audio quality
    this.config.audioBufferSize = 2048;
    
    // Reduce image quality
    this.config.imageCompressionQuality = 0.6;
    
    // Increase cleanup frequency
    this.config.memoryManagement.cleanupInterval = 15000; // 15 seconds
    this.config.memoryManagement.maxCacheSize = 25; // 25MB
  }

  // =====================================================
  // CSS OPTIMIZATIONS
  // =====================================================

  private applyCSSOptimizations(): void {
    const style = document.createElement('style');
    style.textContent = `
      /* Performance optimizations for Enhanced Jungle Quiz */
      
      /* Enable hardware acceleration for key elements */
      .jungle-treasure-card,
      .treasure-option-card,
      .jungle-parallax-layer-1,
      .jungle-parallax-layer-2,
      .jungle-parallax-layer-3 {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
        will-change: transform;
      }
      
      /* Optimize animations for low-end devices */
      ${this.isLowEndDevice ? `
        .treasure-option-card:hover {
          transform: translateY(-4px) scale(1.02) !important;
          transition: transform 0.2s ease !important;
        }
        
        .jungle-parallax-layer-1,
        .jungle-parallax-layer-2,
        .jungle-parallax-layer-3 {
          animation: none !important;
        }
        
        .weather-sparkles::after,
        .weather-gentle-rain::before,
        .weather-misty::before {
          display: none !important;
        }
      ` : ''}
      
      /* Contain layout and paint for performance */
      .enhanced-jungle-quiz-container {
        contain: layout style paint;
      }
      
      /* Optimize font rendering */
      * {
        text-rendering: optimizeSpeed;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      /* Reduce repaints */
      .jungle-background-morning,
      .jungle-background-midday,
      .jungle-background-evening,
      .jungle-background-night {
        contain: strict;
        will-change: auto;
      }
      
      /* Battery optimization styles */
      ${this.batteryInfo && this.batteryInfo.level < 0.2 ? `
        .battery-saving-mode {
          animation: none !important;
          transition: none !important;
          filter: none !important;
          box-shadow: none !important;
          background-image: none !important;
        }
        
        .battery-saving-mode * {
          animation: none !important;
          transition: opacity 0.2s ease !important;
        }
      ` : ''}
    `;
    
    document.head.appendChild(style);
  }

  // =====================================================
  // DOM OPTIMIZATIONS
  // =====================================================

  private applyDOMOptimizations(): void {
    // Optimize viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      );
    }

    // Add performance hints
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect);

    // Prefetch critical resources
    if (this.config.enableAudioPreloading) {
      this.prefetchCriticalAssets();
    }
  }

  private applyEventOptimizations(): void {
    // Passive event listeners for better scroll performance
    const passiveOptions = { passive: true };
    
    // Override default event listener additions for better performance
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'scroll') {
        options = { ...options, ...passiveOptions };
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  // =====================================================
  // IMAGE OPTIMIZATIONS
  // =====================================================

  public optimizeImage(src: string, options?: {
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    width?: number;
    height?: number;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check cache first
      if (this.imageCache.has(src)) {
        resolve(src);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(src);
            return;
          }

          // Set dimensions
          const targetWidth = options?.width || img.width;
          const targetHeight = options?.height || img.height;
          
          // Apply device pixel ratio for crisp images
          const dpr = window.devicePixelRatio || 1;
          canvas.width = targetWidth * dpr;
          canvas.height = targetHeight * dpr;
          
          ctx.scale(dpr, dpr);
          canvas.style.width = targetWidth + 'px';
          canvas.style.height = targetHeight + 'px';
          
          // Draw optimized image
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          
          // Convert to optimized format
          const quality = options?.quality || this.config.imageCompressionQuality;
          const format = options?.format || (this.supportsWebP() ? 'webp' : 'jpeg');
          const mimeType = `image/${format}`;
          
          const optimizedSrc = canvas.toDataURL(mimeType, quality);
          
          // Cache the optimized image
          this.imageCache.set(src, img);
          
          resolve(optimizedSrc);
        } catch (error) {
          console.warn('Image optimization failed:', error);
          resolve(src);
        }
      };

      img.onerror = () => {
        console.warn('Failed to load image for optimization:', src);
        resolve(src);
      };

      img.src = src;
    });
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private prefetchCriticalAssets(): void {
    const criticalAssets = [
      '/audio/sfx/correct-answer.mp3',
      '/audio/sfx/wrong-answer.mp3',
      '/audio/sfx/ui-click.mp3',
      '/audio/sfx/treasure-found.mp3'
    ];

    criticalAssets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = asset;
      document.head.appendChild(link);
    });
  }

  // =====================================================
  // ANIMATION OPTIMIZATIONS
  // =====================================================

  public queueAnimation(id: string, animation: () => void, priority: number = 0): void {
    if (!this.config.enableAnimationOptimizations) {
      animation();
      return;
    }

    // Check if we're at the concurrent limit
    if (this.animationQueue.length >= this.config.maxConcurrentAnimations) {
      // Remove lowest priority animation
      this.animationQueue.sort((a, b) => b.priority - a.priority);
      this.animationQueue.pop();
    }

    this.animationQueue.push({ id, priority, animation });
    this.processAnimationQueue();
  }

  private processAnimationQueue(): void {
    if (this.animationQueue.length === 0) return;

    // Sort by priority
    this.animationQueue.sort((a, b) => b.priority - a.priority);

    // Process highest priority animation
    const nextAnimation = this.animationQueue.shift();
    if (nextAnimation) {
      requestAnimationFrame(() => {
        try {
          nextAnimation.animation();
        } catch (error) {
          console.warn('Animation failed:', error);
        }
        this.processAnimationQueue();
      });
    }
  }

  public optimizeAnimationFrame(callback: () => void): void {
    if (this.performanceMetrics.averageFPS < 30) {
      // Skip frame for better performance
      setTimeout(callback, 32); // ~30fps
    } else {
      requestAnimationFrame(callback);
    }
  }

  // =====================================================
  // MEMORY MANAGEMENT
  // =====================================================

  private checkMemoryUsage(): void {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) return;

    const usedMemoryMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
    this.performanceMetrics.memoryUsage = usedMemoryMB;

    // Trigger cleanup if memory usage is high
    if (usedMemoryMB > this.config.memoryManagement.lowMemoryThreshold) {
      this.performMemoryCleanup();
    }

    // Clear caches if approaching limits
    const totalCacheSize = this.calculateCacheSize();
    if (totalCacheSize > this.config.memoryManagement.maxCacheSize) {
      this.clearOldCacheEntries();
    }
  }

  private performMemoryCleanup(): void {
    console.log('Performing memory cleanup');

    // Clear old images from cache
    if (this.imageCache.size > 20) {
      const entries = Array.from(this.imageCache.entries());
      const toRemove = entries.slice(0, entries.length - 10);
      toRemove.forEach(([key]) => this.imageCache.delete(key));
    }

    // Clear animation queue
    this.animationQueue = this.animationQueue.slice(0, 3);

    // Force garbage collection if available
    if ('gc' in window) {
      (window as any).gc();
    }

    // Trigger low memory mode
    this.enableLowMemoryMode();
  }

  private calculateCacheSize(): number {
    // Rough estimation of cache size in MB
    return (this.imageCache.size * 0.5) + (this.audioCache.size * 2);
  }

  private clearOldCacheEntries(): void {
    // Clear half of the cached images
    const imageEntries = Array.from(this.imageCache.entries());
    const toRemove = imageEntries.slice(0, Math.floor(imageEntries.length / 2));
    toRemove.forEach(([key]) => this.imageCache.delete(key));
  }

  private enableLowMemoryMode(): void {
    // Apply aggressive optimizations
    this.config.maxConcurrentAnimations = 1;
    this.config.enableReducedMotion = true;
    
    // Add CSS class for low memory mode
    document.body.classList.add('low-memory-mode');
    
    // Remove after some time
    setTimeout(() => {
      document.body.classList.remove('low-memory-mode');
      this.config.maxConcurrentAnimations = this.isLowEndDevice ? 2 : 5;
    }, 30000); // 30 seconds
  }

  private getMemoryInfo(): MemoryInfo | null {
    return (performance as any).memory || null;
  }

  // =====================================================
  // BATTERY OPTIMIZATIONS
  // =====================================================

  private handleBatteryChange(): void {
    if (!this.batteryInfo || !this.config.enableBatteryOptimizations) return;

    const batteryLevel = this.batteryInfo.level;
    const isCharging = this.batteryInfo.charging;

    // Apply aggressive optimizations when battery is low
    if (batteryLevel < 0.2 && !isCharging) {
      this.enableBatterySavingMode();
    } else if (batteryLevel > 0.3 || isCharging) {
      this.disableBatterySavingMode();
    }
  }

  private enableBatterySavingMode(): void {
    console.log('Enabling battery saving mode');
    
    // Add CSS class
    document.body.classList.add('battery-saving-mode');
    
    // Reduce performance-intensive features
    this.config.maxConcurrentAnimations = 1;
    this.config.enableReducedMotion = true;
    
    // Reduce update frequency
    this.config.memoryManagement.cleanupInterval = 60000; // 1 minute
  }

  private disableBatterySavingMode(): void {
    console.log('Disabling battery saving mode');
    
    // Remove CSS class
    document.body.classList.remove('battery-saving-mode');
    
    // Restore normal settings
    this.config.maxConcurrentAnimations = this.isLowEndDevice ? 2 : 5;
    this.config.enableReducedMotion = this.isLowEndDevice;
    this.config.memoryManagement.cleanupInterval = 30000; // 30 seconds
  }

  // =====================================================
  // PERFORMANCE MONITORING
  // =====================================================

  public updatePerformanceMetrics(metrics: Partial<typeof this.performanceMetrics>): void {
    Object.assign(this.performanceMetrics, metrics);
    
    // Auto-adjust settings based on performance
    this.autoOptimize();
  }

  private autoOptimize(): void {
    const fps = this.performanceMetrics.averageFPS;
    const memoryUsage = this.performanceMetrics.memoryUsage;

    // Adjust based on FPS
    if (fps < 30) {
      this.config.maxConcurrentAnimations = Math.max(1, this.config.maxConcurrentAnimations - 1);
      this.config.enableReducedMotion = true;
    } else if (fps > 55 && !this.isLowEndDevice) {
      this.config.maxConcurrentAnimations = Math.min(5, this.config.maxConcurrentAnimations + 1);
    }

    // Adjust based on memory usage
    if (memoryUsage > 80) {
      this.performMemoryCleanup();
    }
  }

  // =====================================================
  // PUBLIC API
  // =====================================================

  public getOptimizationLevel(): 'low' | 'medium' | 'high' {
    if (this.isLowEndDevice || (this.batteryInfo && this.batteryInfo.level < 0.2)) {
      return 'high';
    } else if (this.performanceMetrics.averageFPS < 45 || this.performanceMetrics.memoryUsage > 60) {
      return 'medium';
    }
    return 'low';
  }

  public getRecommendedSettings(): Partial<PerformanceConfig> {
    const level = this.getOptimizationLevel();
    
    switch (level) {
      case 'high':
        return {
          enableReducedMotion: true,
          maxConcurrentAnimations: 1,
          audioBufferSize: 2048,
          imageCompressionQuality: 0.6
        };
      case 'medium':
        return {
          enableReducedMotion: false,
          maxConcurrentAnimations: 3,
          audioBufferSize: 4096,
          imageCompressionQuality: 0.7
        };
      case 'low':
      default:
        return {
          enableReducedMotion: false,
          maxConcurrentAnimations: 5,
          audioBufferSize: 8192,
          imageCompressionQuality: 0.9
        };
    }
  }

  public updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.applyConfigChanges();
  }

  private applyConfigChanges(): void {
    // Reapply optimizations with new config
    this.applyCSSOptimizations();
    
    // Update optimization strategies
    this.setupOptimizationStrategies();
  }

  public getPerformanceReport(): any {
    return {
      deviceType: this.isLowEndDevice ? 'low-end' : 'high-end',
      batteryLevel: this.batteryInfo?.level,
      isCharging: this.batteryInfo?.charging,
      metrics: this.performanceMetrics,
      optimizationLevel: this.getOptimizationLevel(),
      strategies: Array.from(this.optimizationStrategies.entries()),
      cacheSize: {
        images: this.imageCache.size,
        audio: this.audioCache.size,
        totalMB: this.calculateCacheSize()
      },
      config: this.config
    };
  }

  public cleanup(): void {
    // Clear monitoring intervals
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
    }

    // Clear caches
    this.imageCache.clear();
    this.audioCache.clear();
    this.animationQueue = [];

    // Remove CSS classes
    document.body.classList.remove('battery-saving-mode', 'low-memory-mode');
  }
}

// =====================================================
// PRODUCTION DEPLOYMENT UTILITIES
// =====================================================

export class ProductionOptimizer {
  public static enableProductionMode(): void {
    // Remove development-only features
    if (process.env.NODE_ENV === 'production') {
      // Disable console logging
      console.log = () => {};
      console.warn = () => {};
      console.info = () => {};
      
      // Enable service worker if available
      this.enableServiceWorker();
      
      // Enable compression
      this.enableCompression();
    }
  }

  private static enableServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }

  private static enableCompression(): void {
    // Add compression hints for browsers
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Encoding';
    meta.content = 'gzip, deflate, br';
    document.head.appendChild(meta);
  }

  public static generateOptimizedBuild(): {
    bundleSize: number;
    compressionRatio: number;
    loadTime: number;
    recommendations: string[];
  } {
    // This would integrate with your build system
    return {
      bundleSize: 2.4, // MB
      compressionRatio: 0.68,
      loadTime: 1.8, // seconds
      recommendations: [
        'Enable gzip compression on server',
        'Use CDN for static assets',
        'Implement code splitting for lazy loading',
        'Enable browser caching headers'
      ]
    };
  }
}

// =====================================================
// SINGLETON EXPORTS
// =====================================================

export const jungleQuizOptimizer = new EnhancedJungleQuizOptimizer();

// Auto-enable production mode
if (typeof window !== 'undefined') {
  ProductionOptimizer.enableProductionMode();
}

export default jungleQuizOptimizer;
