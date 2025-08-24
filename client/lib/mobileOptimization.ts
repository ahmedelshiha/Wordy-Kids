/**
 * Mobile Performance Optimization Utilities
 * Specific optimizations for mobile devices and touch interfaces
 */

interface DeviceCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLowEndDevice: boolean;
  supportsTouch: boolean;
  deviceMemory: number;
  connectionType: string;
  screenSize: { width: number; height: number };
  pixelRatio: number;
  reducedMotion: boolean;
  highContrast: boolean;
}

interface MobileOptimizationConfig {
  enableImageOptimization: boolean;
  enableTouchOptimization: boolean;
  enableAnimationReduction: boolean;
  enableLazyLoading: boolean;
  touchDebounceMs: number;
  scrollThrottleMs: number;
  imageQuality: "low" | "medium" | "high";
  enableHapticFeedback: boolean;
}

class MobilePerformanceOptimizer {
  private static instance: MobilePerformanceOptimizer;
  private deviceCapabilities: DeviceCapabilities;
  private config: MobileOptimizationConfig;
  private touchHandlers = new Map<string, any>();
  private scrollObserver: IntersectionObserver | null = null;

  static getInstance(): MobilePerformanceOptimizer {
    if (!MobilePerformanceOptimizer.instance) {
      MobilePerformanceOptimizer.instance = new MobilePerformanceOptimizer();
    }
    return MobilePerformanceOptimizer.instance;
  }

  constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.config = this.getOptimalConfig();
    this.initialize();
  }

  // Detect device capabilities and limitations
  private detectDeviceCapabilities(): DeviceCapabilities {
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    const isTablet = /iPad|Android.*Tablet/i.test(navigator.userAgent);
    const isDesktop = !isMobile && !isTablet;

    // Detect low-end devices
    const deviceMemory = (navigator as any).deviceMemory || 4; // Default to 4GB if unknown
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const isLowEndDevice = deviceMemory <= 2 || hardwareConcurrency <= 2;

    const supportsTouch =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Network connection
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    const connectionType = connection?.effectiveType || "unknown";

    // Screen information
    const screenSize = {
      width: window.screen.width,
      height: window.screen.height,
    };
    const pixelRatio = window.devicePixelRatio || 1;

    // Accessibility preferences
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const highContrast = window.matchMedia("(prefers-contrast: high)").matches;

    return {
      isMobile,
      isTablet,
      isDesktop,
      isLowEndDevice,
      supportsTouch,
      deviceMemory,
      connectionType,
      screenSize,
      pixelRatio,
      reducedMotion,
      highContrast,
    };
  }

  // Get optimal configuration based on device capabilities
  private getOptimalConfig(): MobileOptimizationConfig {
    const { isLowEndDevice, connectionType, reducedMotion } =
      this.deviceCapabilities;

    return {
      enableImageOptimization: true,
      enableTouchOptimization: this.deviceCapabilities.supportsTouch,
      enableAnimationReduction: reducedMotion || isLowEndDevice,
      enableLazyLoading: true,
      touchDebounceMs: isLowEndDevice ? 100 : 50,
      scrollThrottleMs: isLowEndDevice ? 16 : 8,
      imageQuality:
        connectionType === "slow-2g" || connectionType === "2g"
          ? "low"
          : connectionType === "3g"
            ? "medium"
            : "high",
      enableHapticFeedback:
        this.deviceCapabilities.supportsTouch && !isLowEndDevice,
    };
  }

  // Initialize mobile optimizations
  private initialize(): void {
    this.setupViewportOptimization();
    this.setupTouchOptimizations();
    this.setupScrollOptimizations();
    this.setupImageOptimizations();
    this.setupAnimationOptimizations();
    this.logDeviceInfo();
  }

  // Optimize viewport settings
  private setupViewportOptimization(): void {
    // Ensure proper viewport meta tag
    let viewportMeta = document.querySelector(
      'meta[name="viewport"]',
    ) as HTMLMetaElement;

    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
    }

    // Optimal viewport settings for mobile
    const viewportContent = [
      "width=device-width",
      "initial-scale=1.0",
      "maximum-scale=5.0",
      "user-scalable=yes",
      "viewport-fit=cover",
    ].join(", ");

    viewportMeta.content = viewportContent;

    // Add safe area CSS variables for notched devices
    if (this.deviceCapabilities.isMobile) {
      const style = document.createElement("style");
      style.textContent = `
        :root {
          --safe-area-inset-top: env(safe-area-inset-top, 0px);
          --safe-area-inset-right: env(safe-area-inset-right, 0px);
          --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
          --safe-area-inset-left: env(safe-area-inset-left, 0px);
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Setup touch optimizations
  private setupTouchOptimizations(): void {
    if (!this.config.enableTouchOptimization) return;

    // Disable touch delay on mobile
    const style = document.createElement("style");
    style.textContent = `
      * {
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      }
      
      button, [role="button"], .touchable {
        touch-action: manipulation;
        user-select: none;
        -webkit-user-select: none;
      }
    `;
    document.head.appendChild(style);

    // Setup passive event listeners for better scroll performance
    this.setupPassiveEventListeners();
  }

  // Setup passive event listeners for scroll performance
  private setupPassiveEventListeners(): void {
    const passiveEvents = ["touchstart", "touchmove", "wheel"];

    passiveEvents.forEach((eventType) => {
      document.addEventListener(eventType, () => {}, { passive: true });
    });
  }

  // Setup scroll optimizations
  private setupScrollOptimizations(): void {
    // Enable smooth scrolling with fallback
    const style = document.createElement("style");
    style.textContent = `
      html {
        scroll-behavior: ${this.config.enableAnimationReduction ? "auto" : "smooth"};
      }
      
      /* Optimize scrolling containers */
      .scroll-container {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        scroll-snap-type: y proximity;
      }
      
      /* Reduce scroll jank */
      .scroll-item {
        transform: translateZ(0);
        will-change: transform;
      }
    `;
    document.head.appendChild(style);

    // Setup intersection observer for lazy loading
    this.setupIntersectionObserver();
  }

  // Setup intersection observer for lazy loading
  private setupIntersectionObserver(): void {
    if (!this.config.enableLazyLoading) return;

    const options = {
      root: null,
      rootMargin: this.deviceCapabilities.isLowEndDevice ? "50px" : "100px",
      threshold: 0.1,
    };

    this.scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          this.loadLazyContent(element);
          this.scrollObserver?.unobserve(element);
        }
      });
    }, options);
  }

  // Load lazy content
  private loadLazyContent(element: HTMLElement): void {
    const dataSrc = element.getAttribute("data-src");
    const dataSrcset = element.getAttribute("data-srcset");

    if (element instanceof HTMLImageElement) {
      if (dataSrc) {
        element.src = dataSrc;
        element.removeAttribute("data-src");
      }
      if (dataSrcset) {
        element.srcset = dataSrcset;
        element.removeAttribute("data-srcset");
      }
    }

    element.classList.remove("lazy");
    element.classList.add("loaded");
  }

  // Setup image optimizations
  private setupImageOptimizations(): void {
    if (!this.config.enableImageOptimization) return;

    const style = document.createElement("style");
    style.textContent = `
      /* Optimize image rendering */
      img {
        image-rendering: ${this.deviceCapabilities.isLowEndDevice ? "auto" : "crisp-edges"};
        decode: async;
      }
      
      /* Lazy loading styles */
      .lazy {
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      .loaded {
        opacity: 1;
      }
      
      /* Responsive images */
      .responsive-img {
        width: 100%;
        height: auto;
        object-fit: cover;
      }
    `;
    document.head.appendChild(style);
  }

  // Setup animation optimizations
  private setupAnimationOptimizations(): void {
    const style = document.createElement("style");

    if (this.config.enableAnimationReduction) {
      style.textContent = `
        /* Reduce animations for low-end devices or user preference */
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
    } else {
      style.textContent = `
        /* Optimize animations for performance */
        .animate {
          transform: translateZ(0);
          will-change: transform, opacity;
        }
        
        .animate:not(.active) {
          will-change: auto;
        }
      `;
    }

    document.head.appendChild(style);
  }

  // Log device information for debugging
  private logDeviceInfo(): void {
    console.group("Mobile Performance Optimizer");
    console.log("Device Capabilities:", this.deviceCapabilities);
    console.log("Optimization Config:", this.config);
    console.groupEnd();
  }

  // Optimize touch event handling
  optimizeTouchEvent(
    element: HTMLElement,
    eventType: "tap" | "longpress" | "swipe",
    handler: (event: TouchEvent) => void,
    options: { debounce?: number; preventDefault?: boolean } = {},
  ): () => void {
    const { debounce = this.config.touchDebounceMs, preventDefault = true } =
      options;

    let startTime = 0;
    let startPos = { x: 0, y: 0 };
    let timeoutId: NodeJS.Timeout | null = null;

    const debouncedHandler = this.debounce(handler, debounce);

    const handleTouchStart = (e: TouchEvent) => {
      startTime = Date.now();
      const touch = e.touches[0];
      startPos = { x: touch.clientX, y: touch.clientY };

      if (eventType === "longpress") {
        timeoutId = setTimeout(() => {
          debouncedHandler(e);
        }, 500);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (preventDefault) e.preventDefault();

      const endTime = Date.now();
      const duration = endTime - startTime;

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (eventType === "tap" && duration < 300) {
        debouncedHandler(e);
      } else if (eventType === "swipe" && duration < 300) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - startPos.x;
        const deltaY = touch.clientY - startPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > 50) {
          debouncedHandler(e);
        }
      }

      // Haptic feedback
      if (this.config.enableHapticFeedback && "vibrate" in navigator) {
        navigator.vibrate(10);
      }
    };

    element.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    element.addEventListener("touchend", handleTouchEnd, { passive: false });

    const handlerId = `${eventType}-${Date.now()}`;
    this.touchHandlers.set(handlerId, {
      element,
      touchstart: handleTouchStart,
      touchend: handleTouchEnd,
    });

    return () => {
      const handlers = this.touchHandlers.get(handlerId);
      if (handlers) {
        handlers.element.removeEventListener("touchstart", handlers.touchstart);
        handlers.element.removeEventListener("touchend", handlers.touchend);
        this.touchHandlers.delete(handlerId);
      }
    };
  }

  // Optimize image loading for mobile
  optimizeImageForMobile(
    img: HTMLImageElement,
    options: {
      lazy?: boolean;
      quality?: "low" | "medium" | "high";
      sizes?: string;
    } = {},
  ): void {
    const { lazy = true, quality = this.config.imageQuality, sizes } = options;

    // Set responsive sizes if not provided
    if (!sizes && !img.sizes) {
      img.sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
    }

    // Setup lazy loading
    if (lazy && this.scrollObserver) {
      img.classList.add("lazy");
      img.setAttribute("data-src", img.src);
      img.src = this.generatePlaceholder(img.width || 300, img.height || 200);
      this.scrollObserver.observe(img);
    }

    // Add loading attribute for modern browsers
    img.loading = "lazy";
    img.decoding = "async";
  }

  // Generate placeholder image
  private generatePlaceholder(width: number, height: number): string {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#cccccc";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Loading...", width / 2, height / 2);
    }

    return canvas.toDataURL();
  }

  // Debounce utility
  private debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number,
  ): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    }) as T;
  }

  // Throttle utility
  private throttle<T extends (...args: any[]) => void>(
    func: T,
    delay: number,
  ): T {
    let lastCall = 0;
    return ((...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return func.apply(this, args);
      }
    }) as T;
  }

  // Get device capabilities
  getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  // Update configuration
  updateConfig(newConfig: Partial<MobileOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Cleanup
  cleanup(): void {
    this.touchHandlers.clear();
    if (this.scrollObserver) {
      this.scrollObserver.disconnect();
      this.scrollObserver = null;
    }
  }
}

// React hooks for mobile optimization
export function useMobileOptimization() {
  const optimizer = React.useMemo(
    () => MobilePerformanceOptimizer.getInstance(),
    [],
  );
  const [deviceCapabilities, setDeviceCapabilities] = React.useState(
    optimizer.getDeviceCapabilities(),
  );

  React.useEffect(() => {
    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(() => {
        // Update device capabilities after orientation change
        const newCapabilities = optimizer.getDeviceCapabilities();
        setDeviceCapabilities(newCapabilities);
      }, 100);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, [optimizer]);

  const optimizeTouch = React.useCallback(
    (
      element: HTMLElement,
      eventType: "tap" | "longpress" | "swipe",
      handler: (event: TouchEvent) => void,
      options?: { debounce?: number; preventDefault?: boolean },
    ) => {
      return optimizer.optimizeTouchEvent(element, eventType, handler, options);
    },
    [optimizer],
  );

  const optimizeImage = React.useCallback(
    (
      img: HTMLImageElement,
      options?: {
        lazy?: boolean;
        quality?: "low" | "medium" | "high";
        sizes?: string;
      },
    ) => {
      optimizer.optimizeImageForMobile(img, options);
    },
    [optimizer],
  );

  return {
    deviceCapabilities,
    optimizeTouch,
    optimizeImage,
    isMobile: deviceCapabilities.isMobile,
    isLowEndDevice: deviceCapabilities.isLowEndDevice,
    supportsTouch: deviceCapabilities.supportsTouch,
  };
}

// Touch-optimized button component
export function useTouchOptimizedButton() {
  const { optimizeTouch, supportsTouch } = useMobileOptimization();

  const createTouchButton = React.useCallback(
    (
      ref: React.RefObject<HTMLElement>,
      onClick: () => void,
      options: { haptic?: boolean; debounce?: number } = {},
    ) => {
      React.useEffect(() => {
        if (!ref.current || !supportsTouch) return;

        const cleanup = optimizeTouch(
          ref.current,
          "tap",
          (e: TouchEvent) => {
            e.preventDefault();
            onClick();

            // Haptic feedback
            if (options.haptic && "vibrate" in navigator) {
              navigator.vibrate(10);
            }
          },
          { debounce: options.debounce },
        );

        return cleanup;
      }, [ref, onClick, options.haptic, options.debounce]);
    },
    [optimizeTouch, supportsTouch],
  );

  return createTouchButton;
}

// Performance monitoring for mobile
export function useMobilePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState({
    frameRate: 0,
    touchLatency: 0,
    scrollPerformance: 0,
    memoryUsage: 0,
  });

  React.useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFrameRate = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        setMetrics((prev) => ({
          ...prev,
          frameRate: Math.round((frameCount * 1000) / (currentTime - lastTime)),
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measureFrameRate);
    };

    measureFrameRate();

    // Monitor memory if available
    const memoryInterval = setInterval(() => {
      if ("memory" in performance) {
        const memInfo = (performance as any).memory;
        setMetrics((prev) => ({
          ...prev,
          memoryUsage: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
        }));
      }
    }, 5000);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(memoryInterval);
    };
  }, []);

  return metrics;
}

export const mobileOptimizer = MobilePerformanceOptimizer.getInstance();
