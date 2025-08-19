import { useEffect, useCallback, useRef } from "react";

interface TouchOptimizationOptions {
  enableTouchFeedback?: boolean;
  preventScrollOnTouch?: boolean;
  optimizeForTouch?: boolean;
}

export function useMobileTouch(options: TouchOptimizationOptions = {}) {
  const {
    enableTouchFeedback = true,
    preventScrollOnTouch = false,
    optimizeForTouch = true,
  } = options;

  const elementRef = useRef<HTMLElement>(null);

  // Handle touch feedback
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enableTouchFeedback) return;

      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON" || target.closest("button")) {
        target.style.transform = "scale(0.95)";
        target.style.transition = "transform 0.1s ease-out";
      }
    },
    [enableTouchFeedback],
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!enableTouchFeedback) return;

      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON" || target.closest("button")) {
        setTimeout(() => {
          target.style.transform = "scale(1)";
        }, 100);
      }
    },
    [enableTouchFeedback],
  );

  // Prevent scroll on touch if needed
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (
        preventScrollOnTouch &&
        elementRef.current?.contains(e.target as Node)
      ) {
        e.preventDefault();
      }
    },
    [preventScrollOnTouch],
  );

  useEffect(() => {
    if (!optimizeForTouch) return;

    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners
    element.addEventListener("touchstart", handleTouchStart, {
      passive: !preventScrollOnTouch,
    });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    if (preventScrollOnTouch) {
      element.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
    }

    // Cleanup
    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchend", handleTouchEnd);
      if (preventScrollOnTouch) {
        element.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, [
    handleTouchStart,
    handleTouchEnd,
    handleTouchMove,
    optimizeForTouch,
    preventScrollOnTouch,
  ]);

  // Haptic feedback function
  const triggerHaptic = useCallback(
    (type: "light" | "medium" | "heavy" | "success" | "error" = "light") => {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        let pattern: number | number[];

        switch (type) {
          case "light":
            pattern = 10;
            break;
          case "medium":
            pattern = 20;
            break;
          case "heavy":
            pattern = 40;
            break;
          case "success":
            pattern = [10, 50, 10];
            break;
          case "error":
            pattern = [50, 30, 50];
            break;
          default:
            pattern = 10;
        }

        navigator.vibrate(pattern);
      }
    },
    [],
  );

  return { elementRef, triggerHaptic };
}

// Hook for detecting mobile device
export function useIsMobile() {
  const isMobile = useCallback(() => {
    if (typeof window === "undefined") return false;

    // Check for touch support
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Check viewport width
    const isMobileWidth = window.innerWidth <= 768;

    // Check user agent (fallback)
    const mobileUserAgent =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    return hasTouch && (isMobileWidth || mobileUserAgent);
  }, []);

  return isMobile();
}

// Hook for safe area insets (for devices with notches)
export function useSafeAreaInsets() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Apply safe area insets for mobile devices
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
    window.addEventListener("orientationchange", setViewportHeight);

    return () => {
      window.removeEventListener("resize", setViewportHeight);
      window.removeEventListener("orientationchange", setViewportHeight);
    };
  }, []);
}
