import { useState, useEffect, useCallback } from "react";

interface MobilePerformanceSettings {
  isMobile: boolean;
  isTablet: boolean;
  isLowEndDevice: boolean;
  reducedMotion: boolean;
  shouldUseHardwareAcceleration: boolean;
  maxAnimationComplexity: "low" | "medium" | "high";
  shouldPreloadImages: boolean;
  virtualScrollingEnabled: boolean;
}

export function useOptimizedMobilePerformance(): MobilePerformanceSettings {
  const [settings, setSettings] = useState<MobilePerformanceSettings>({
    isMobile: false,
    isTablet: false,
    isLowEndDevice: false,
    reducedMotion: false,
    shouldUseHardwareAcceleration: true,
    maxAnimationComplexity: "high",
    shouldPreloadImages: true,
    virtualScrollingEnabled: false,
  });

  const detectDeviceCapabilities = useCallback(() => {
    if (typeof window === "undefined") return;

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent,
      );
    const isTablet =
      /ipad|android(?!.*mobile)/i.test(userAgent) ||
      (window.innerWidth >= 768 && window.innerWidth <= 1024);

    // Detect low-end devices
    const isLowEndDevice = (() => {
      // Check for specific low-end device indicators
      if ("deviceMemory" in navigator) {
        return (navigator as any).deviceMemory <= 2; // 2GB or less
      }

      // Check for slow connection
      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        if (
          connection.effectiveType === "slow-2g" ||
          connection.effectiveType === "2g"
        ) {
          return true;
        }
      }

      // Fallback: check hardware concurrency
      if ("hardwareConcurrency" in navigator) {
        return navigator.hardwareConcurrency <= 2; // 2 cores or less
      }

      return false;
    })();

    // Check for reduced motion preference
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Determine animation complexity based on device capabilities
    const maxAnimationComplexity: "low" | "medium" | "high" =
      isLowEndDevice || reducedMotion ? "low" : isMobile ? "medium" : "high";

    // Hardware acceleration support
    const shouldUseHardwareAcceleration = (() => {
      // Disable on very old devices or low-end devices
      if (isLowEndDevice) return false;

      // Check for CSS 3D transform support
      const testEl = document.createElement("div");
      testEl.style.transform = "translate3d(0,0,0)";
      return testEl.style.transform !== "";
    })();

    // Image preloading strategy
    const shouldPreloadImages =
      !isLowEndDevice &&
      (!("connection" in navigator) ||
        !["slow-2g", "2g", "3g"].includes(
          (navigator as any).connection?.effectiveType,
        ));

    // Virtual scrolling for long lists on mobile
    const virtualScrollingEnabled = isMobile;

    setSettings({
      isMobile,
      isTablet,
      isLowEndDevice,
      reducedMotion,
      shouldUseHardwareAcceleration,
      maxAnimationComplexity,
      shouldPreloadImages,
      virtualScrollingEnabled,
    });
  }, []);

  useEffect(() => {
    detectDeviceCapabilities();

    // Listen for orientation changes and resize events
    const handleResize = () => {
      setTimeout(detectDeviceCapabilities, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Listen for connection changes
    if ("connection" in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener("change", detectDeviceCapabilities);
    }

    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = () => {
      setSettings((prev) => ({
        ...prev,
        reducedMotion: mediaQuery.matches,
        maxAnimationComplexity: mediaQuery.matches
          ? "low"
          : prev.maxAnimationComplexity,
      }));
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMotionChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleMotionChange);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);

      if ("connection" in navigator) {
        const connection = (navigator as any).connection;
        connection.removeEventListener("change", detectDeviceCapabilities);
      }

      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMotionChange);
      } else {
        mediaQuery.removeListener(handleMotionChange);
      }
    };
  }, [detectDeviceCapabilities]);

  return settings;
}

// Performance optimization utilities
export const performanceUtils = {
  // Throttle function calls for better performance
  throttle: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastExecTime = 0;

    return ((...args: Parameters<T>) => {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func(...args);
        lastExecTime = currentTime;
      } else {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => {
            func(...args);
            lastExecTime = Date.now();
          },
          delay - (currentTime - lastExecTime),
        );
      }
    }) as T;
  },

  // Debounce function calls
  debounce: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout | null = null;

    return ((...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },

  // Request animation frame helper
  requestAnimationFrame: (callback: () => void) => {
    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      return window.requestAnimationFrame(callback);
    } else {
      return setTimeout(callback, 16); // Fallback to 60fps
    }
  },

  // Check if element is in viewport (for lazy loading)
  isElementInViewport: (element: Element): boolean => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Lazy load intersection observer
  createLazyLoadObserver: (
    callback: (entry: IntersectionObserverEntry) => void,
  ) => {
    if (typeof window === "undefined" || !window.IntersectionObserver) {
      return null;
    }

    return new IntersectionObserver(
      (entries) => {
        entries.forEach(callback);
      },
      {
        rootMargin: "50px 0px", // Start loading 50px before element enters viewport
        threshold: 0.1,
      },
    );
  },

  // Optimize images for different screen densities
  getOptimizedImageSrc: (
    baseSrc: string,
    isMobile: boolean,
    isHighDensity: boolean,
  ): string => {
    if (!baseSrc) return "";

    const extension = baseSrc.split(".").pop();
    const baseName = baseSrc.replace(`.${extension}`, "");

    // Return smaller images for mobile devices
    if (isMobile) {
      return `${baseName}_mobile${isHighDensity ? "@2x" : ""}.${extension}`;
    }

    return isHighDensity ? `${baseName}@2x.${extension}` : baseSrc;
  },
};

// Hook for managing animation preferences
export function useAnimationPreferences() {
  const {
    reducedMotion,
    maxAnimationComplexity,
    shouldUseHardwareAcceleration,
  } = useOptimizedMobilePerformance();

  const getAnimationClass = useCallback(
    (complexity: "low" | "medium" | "high") => {
      if (reducedMotion) return "";

      switch (maxAnimationComplexity) {
        case "low":
          return complexity === "low" ? "jungle-simple-animation" : "";
        case "medium":
          return complexity === "high" ? "" : "jungle-medium-animation";
        case "high":
          return shouldUseHardwareAcceleration
            ? "jungle-gpu-accelerated"
            : "jungle-simple-animation";
        default:
          return "";
      }
    },
    [reducedMotion, maxAnimationComplexity, shouldUseHardwareAcceleration],
  );

  const getTransitionDuration = useCallback(
    (baseMs: number): number => {
      if (reducedMotion) return 0;

      switch (maxAnimationComplexity) {
        case "low":
          return Math.min(baseMs, 200);
        case "medium":
          return Math.min(baseMs, 400);
        case "high":
          return baseMs;
        default:
          return baseMs;
      }
    },
    [reducedMotion, maxAnimationComplexity],
  );

  return {
    reducedMotion,
    maxAnimationComplexity,
    shouldUseHardwareAcceleration,
    getAnimationClass,
    getTransitionDuration,
  };
}
