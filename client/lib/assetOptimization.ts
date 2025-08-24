/**
 * Asset Optimization utilities for progressive loading and caching
 */

// Audio asset preloader with caching
class AudioAssetManager {
  private static instance: AudioAssetManager;
  private audioCache = new Map<string, HTMLAudioElement>();
  private loadingPromises = new Map<string, Promise<HTMLAudioElement>>();
  private priorityQueue: string[] = [];
  
  static getInstance(): AudioAssetManager {
    if (!AudioAssetManager.instance) {
      AudioAssetManager.instance = new AudioAssetManager();
    }
    return AudioAssetManager.instance;
  }

  // Preload audio with priority queue
  async preloadAudio(src: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<HTMLAudioElement> {
    if (this.audioCache.has(src)) {
      return this.audioCache.get(src)!;
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const loadPromise = this.loadAudioFile(src);
    this.loadingPromises.set(src, loadPromise);

    // Add to priority queue
    if (priority === 'high') {
      this.priorityQueue.unshift(src);
    } else {
      this.priorityQueue.push(src);
    }

    try {
      const audio = await loadPromise;
      this.audioCache.set(src, audio);
      this.loadingPromises.delete(src);
      return audio;
    } catch (error) {
      this.loadingPromises.delete(src);
      console.warn(`Failed to load audio: ${src}`, error);
      throw error;
    }
  }

  private loadAudioFile(src: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
      audio.addEventListener('error', reject, { once: true });
      
      // Optimize for mobile
      audio.preload = 'metadata';
      audio.src = src;
    });
  }

  // Get cached audio or null if not loaded
  getCachedAudio(src: string): HTMLAudioElement | null {
    return this.audioCache.get(src) || null;
  }

  // Preload animal sounds with progressive strategy
  async preloadAnimalSounds(priority: 'high' | 'medium' | 'low' = 'medium'): Promise<void> {
    const commonAnimals = [
      '/sounds/cat.mp3',
      '/sounds/dog.mp3', 
      '/sounds/elephant.mp3',
      '/sounds/lion.mp3',
      '/sounds/bird.mp3'
    ];

    const preloadPromises = commonAnimals.map(sound => 
      this.preloadAudio(sound, priority).catch(err => 
        console.warn(`Failed to preload ${sound}:`, err)
      )
    );

    await Promise.allSettled(preloadPromises);
  }

  // Clear cache to free memory
  clearCache(): void {
    this.audioCache.clear();
    this.loadingPromises.clear();
    this.priorityQueue = [];
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cached: this.audioCache.size,
      loading: this.loadingPromises.size,
      queue: this.priorityQueue.length
    };
  }
}

// Image optimization utilities
class ImageAssetManager {
  private static instance: ImageAssetManager;
  private imageCache = new Map<string, string>();
  private observer: IntersectionObserver | null = null;

  static getInstance(): ImageAssetManager {
    if (!ImageAssetManager.instance) {
      ImageAssetManager.instance = new ImageAssetManager();
    }
    return ImageAssetManager.instance;
  }

  // Progressive image loading with WebP support
  async loadOptimizedImage(src: string, options: {
    webpSrc?: string;
    placeholder?: string;
    quality?: number;
  } = {}): Promise<string> {
    const { webpSrc, placeholder, quality = 85 } = options;

    // Check cache first
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!;
    }

    // Use WebP if supported and available
    const supportsWebP = await this.checkWebPSupport();
    const imageSrc = supportsWebP && webpSrc ? webpSrc : src;

    try {
      const optimizedSrc = await this.loadImage(imageSrc);
      this.imageCache.set(src, optimizedSrc);
      return optimizedSrc;
    } catch (error) {
      console.warn(`Failed to load image: ${imageSrc}`, error);
      return placeholder || src;
    }
  }

  private loadImage(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = reject;
      img.src = src;
    });
  }

  private async checkWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => resolve(webP.height === 2);
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  // Lazy loading with Intersection Observer
  setupLazyLoading(): void {
    if (this.observer) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          const webpSrc = img.dataset.webpSrc;
          
          if (src) {
            this.loadOptimizedImage(src, { webpSrc }).then((optimizedSrc) => {
              img.src = optimizedSrc;
              img.classList.remove('lazy');
              this.observer?.unobserve(img);
            });
          }
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.1
    });
  }

  observeImage(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.observe(img);
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Bundle size analyzer
class BundleAnalyzer {
  static analyzeChunkSizes(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      console.group('Bundle Analysis');
      console.log('Main bundle load time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
      
      const jsResources = resources.filter(r => r.name.endsWith('.js'));
      const cssResources = resources.filter(r => r.name.endsWith('.css'));
      
      console.log('JavaScript chunks:', jsResources.length);
      console.log('CSS chunks:', cssResources.length);
      
      jsResources.forEach(resource => {
        console.log(`${resource.name}: ${Math.round(resource.transferSize / 1024)}KB`);
      });
      
      console.groupEnd();
    }
  }

  static measureComponentLoadTime(componentName: string, startTime: number): void {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    if (loadTime > 100) { // Log slow component loads
      console.warn(`Slow component load: ${componentName} took ${Math.round(loadTime)}ms`);
    }
  }
}

// Progressive loading strategies
export class ProgressiveLoader {
  private static loadingStrategies = {
    // Critical above-the-fold content
    critical: ['main-ui', 'navigation', 'hero'],
    
    // Important but not immediately visible
    important: ['games', 'dashboard', 'profile'],
    
    // Nice-to-have features
    optional: ['analytics', 'admin', 'advanced-features']
  };

  static async loadCriticalAssets(): Promise<void> {
    const audioManager = AudioAssetManager.getInstance();
    const imageManager = ImageAssetManager.getInstance();

    // Setup lazy loading
    imageManager.setupLazyLoading();

    // Preload critical audio
    await audioManager.preloadAnimalSounds('high');

    console.log('Critical assets loaded');
  }

  static async loadImportantAssets(): Promise<void> {
    const audioManager = AudioAssetManager.getInstance();

    // Preload additional animal sounds
    const additionalSounds = [
      '/sounds/tiger.mp3',
      '/sounds/bear.mp3',
      '/sounds/monkey.mp3',
      '/sounds/snake.mp3'
    ];

    const preloadPromises = additionalSounds.map(sound => 
      audioManager.preloadAudio(sound, 'medium').catch(() => {})
    );

    await Promise.allSettled(preloadPromises);
    console.log('Important assets loaded');
  }

  static loadOptionalAssets(): void {
    // Load remaining assets in background
    setTimeout(() => {
      const audioManager = AudioAssetManager.getInstance();
      
      // Load all remaining animal sounds
      const allSounds = [
        '/sounds/zebra.mp3',
        '/sounds/giraffe.mp3',
        '/sounds/hippo.mp3',
        '/sounds/rhino.mp3'
        // Add more as needed
      ];

      allSounds.forEach(sound => {
        audioManager.preloadAudio(sound, 'low').catch(() => {});
      });
    }, 5000); // Delay to not interfere with critical loading
  }
}

// Memory management
export class MemoryManager {
  private static memoryWarningThreshold = 50 * 1024 * 1024; // 50MB

  static monitorMemoryUsage(): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      const usedMemory = memInfo.usedJSHeapSize;
      
      if (usedMemory > this.memoryWarningThreshold) {
        console.warn('High memory usage detected:', Math.round(usedMemory / 1024 / 1024), 'MB');
        this.cleanup();
      }
    }
  }

  static cleanup(): void {
    // Clear audio cache if memory is high
    AudioAssetManager.getInstance().clearCache();
    
    // Trigger garbage collection if available (Chrome DevTools)
    if ((window as any).gc) {
      (window as any).gc();
    }
  }

  static trackComponentMemory(componentName: string): () => void {
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    return () => {
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryDiff = endMemory - startMemory;
      
      if (memoryDiff > 1024 * 1024) { // > 1MB
        console.warn(`Component ${componentName} used ${Math.round(memoryDiff / 1024 / 1024)}MB`);
      }
    };
  }
}

// Export singletons
export const audioAssetManager = AudioAssetManager.getInstance();
export const imageAssetManager = ImageAssetManager.getInstance();

// React hooks for asset management
export function useProgressiveAssetLoading() {
  React.useEffect(() => {
    ProgressiveLoader.loadCriticalAssets().then(() => {
      ProgressiveLoader.loadImportantAssets().then(() => {
        ProgressiveLoader.loadOptionalAssets();
      });
    });

    // Setup memory monitoring
    const memoryInterval = setInterval(() => {
      MemoryManager.monitorMemoryUsage();
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(memoryInterval);
      imageAssetManager.disconnect();
    };
  }, []);
}

export function useOptimizedImage(src: string, options?: {
  webpSrc?: string;
  placeholder?: string;
}) {
  const [optimizedSrc, setOptimizedSrc] = React.useState(options?.placeholder || src);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    imageAssetManager.loadOptimizedImage(src, options)
      .then((loadedSrc) => {
        setOptimizedSrc(loadedSrc);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [src, options?.webpSrc, options?.placeholder]);

  return { src: optimizedSrc, isLoading, error };
}

export function useAudioPreloader(sounds: string[], priority: 'high' | 'medium' | 'low' = 'medium') {
  const [loadedCount, setLoadedCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadAudio = async () => {
      let loaded = 0;
      
      for (const sound of sounds) {
        try {
          await audioAssetManager.preloadAudio(sound, priority);
          loaded++;
          setLoadedCount(loaded);
        } catch (error) {
          console.warn(`Failed to preload ${sound}:`, error);
        }
      }
      
      setIsLoading(false);
    };

    loadAudio();
  }, [sounds, priority]);

  return {
    loadedCount,
    totalCount: sounds.length,
    isLoading,
    progress: sounds.length > 0 ? (loadedCount / sounds.length) * 100 : 0
  };
}
