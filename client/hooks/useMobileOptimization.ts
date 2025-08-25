import { useState, useEffect, useCallback, useRef } from "react";

// Types and interfaces
interface ScreenSize {
  width: number;
  height: number;
  ratio: number;
}

interface DeviceCapabilities {
  touchScreen: boolean;
  pointerCoarse: boolean;
  hoverCapable: boolean;
  vibrationSupported: boolean;
  orientationSupported: boolean;
  fullscreenSupported: boolean;
  shareApiSupported: boolean;
}

interface TouchGesture {
  type: "tap" | "double-tap" | "long-press" | "swipe" | "pinch";
  startPosition: { x: number; y: number };
  endPosition?: { x: number; y: number };
  duration: number;
  distance?: number;
  direction?: "up" | "down" | "left" | "right";
}

interface MobileOptimizations {
  enableLargerTouchTargets: boolean;
  enableSwipeGestures: boolean;
  enableHapticFeedback: boolean;
  optimizeScrolling: boolean;
  enablePullToRefresh: boolean;
  reduceAnimations: boolean;
  increaseFontSizes: boolean;
  simplifyNavigation: boolean;
}

// Device detection constants
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const TOUCH_TARGET_MIN_SIZE = 44; // Apple's recommended minimum
const SWIPE_THRESHOLD = 50;
const LONG_PRESS_DURATION = 500;
const DOUBLE_TAP_DELAY = 300;

export const useMobileOptimization = () => {
  // State management
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
    ratio:
      typeof window !== "undefined"
        ? window.innerWidth / window.innerHeight
        : 1.5,
  });

  const [deviceCapabilities, setDeviceCapabilities] =
    useState<DeviceCapabilities>({
      touchScreen: false,
      pointerCoarse: false,
      hoverCapable: false,
      vibrationSupported: false,
      orientationSupported: false,
      fullscreenSupported: false,
      shareApiSupported: false,
    });

  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait",
  );
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [mobileOptimizations, setMobileOptimizations] =
    useState<MobileOptimizations>({
      enableLargerTouchTargets: true,
      enableSwipeGestures: true,
      enableHapticFeedback: true,
      optimizeScrolling: true,
      enablePullToRefresh: true,
      reduceAnimations: false,
      increaseFontSizes: false,
      simplifyNavigation: true,
    });

  // Refs for gesture tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Computed values
  const isMobile = screenSize.width <= MOBILE_BREAKPOINT;
  const isTablet =
    screenSize.width > MOBILE_BREAKPOINT &&
    screenSize.width <= TABLET_BREAKPOINT;
  const isDesktop = screenSize.width > TABLET_BREAKPOINT;
  const isLandscape = orientation === "landscape";
  const isPortrait = orientation === "portrait";

  // Device capability detection
  useEffect(() => {
    const detectCapabilities = () => {
      const capabilities: DeviceCapabilities = {
        touchScreen: "ontouchstart" in window || navigator.maxTouchPoints > 0,
        pointerCoarse: window.matchMedia("(pointer: coarse)").matches,
        hoverCapable: window.matchMedia("(hover: hover)").matches,
        vibrationSupported: "vibrate" in navigator,
        orientationSupported:
          "orientation" in window || "onorientationchange" in window,
        fullscreenSupported:
          document.fullscreenEnabled ||
          (document as any).webkitFullscreenEnabled,
        shareApiSupported: "share" in navigator,
      };

      setDeviceCapabilities(capabilities);
    };

    detectCapabilities();
  }, []);

  // Screen size tracking
  useEffect(() => {
    const handleResize = () => {
      const newSize = {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.innerWidth / window.innerHeight,
      };
      setScreenSize(newSize);

      // Detect if keyboard is open on mobile (heuristic)
      if (isMobile) {
        const heightReduction =
          (screen.height - window.innerHeight) / screen.height;
        setIsKeyboardOpen(heightReduction > 0.25); // Keyboard likely open if >25% height reduction
      }
    };

    const handleOrientationChange = () => {
      // Delay to allow screen to settle after orientation change
      setTimeout(() => {
        handleResize();
        setOrientation(
          window.innerWidth > window.innerHeight ? "landscape" : "portrait",
        );
      }, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    // Initial orientation detection
    setOrientation(
      window.innerWidth > window.innerHeight ? "landscape" : "portrait",
    );

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, [isMobile]);

  // Haptic feedback function
  const triggerHapticFeedback = useCallback(
    (type: "light" | "medium" | "heavy" = "medium") => {
      if (
        !mobileOptimizations.enableHapticFeedback ||
        !deviceCapabilities.vibrationSupported
      ) {
        return;
      }

      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
      };

      navigator.vibrate(patterns[type]);
    },
    [
      mobileOptimizations.enableHapticFeedback,
      deviceCapabilities.vibrationSupported,
    ],
  );

  // Touch gesture handler
  const handleTouchGesture = useCallback(
    (element: HTMLElement, onGesture: (gesture: TouchGesture) => void) => {
      if (!mobileOptimizations.enableSwipeGestures) return;

      const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        };

        // Set up long press detection
        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current);
        }

        longPressTimeoutRef.current = setTimeout(() => {
          if (touchStartRef.current) {
            onGesture({
              type: "long-press",
              startPosition: {
                x: touchStartRef.current.x,
                y: touchStartRef.current.y,
              },
              duration: LONG_PRESS_DURATION,
            });
            triggerHapticFeedback("heavy");
          }
        }, LONG_PRESS_DURATION);
      };

      const handleTouchEnd = (e: TouchEvent) => {
        if (!touchStartRef.current) return;

        const touch = e.changedTouches[0];
        const endPosition = { x: touch.clientX, y: touch.clientY };
        const duration = Date.now() - touchStartRef.current.time;
        const deltaX = endPosition.x - touchStartRef.current.x;
        const deltaY = endPosition.y - touchStartRef.current.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Clear long press timeout
        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current);
          longPressTimeoutRef.current = null;
        }

        // Determine gesture type
        if (distance < 10 && duration < 300) {
          // Tap gesture - check for double tap
          tapCountRef.current++;

          if (tapCountRef.current === 1) {
            tapTimeoutRef.current = setTimeout(() => {
              onGesture({
                type: "tap",
                startPosition: touchStartRef.current!,
                endPosition,
                duration,
              });
              tapCountRef.current = 0;
              triggerHapticFeedback("light");
            }, DOUBLE_TAP_DELAY);
          } else if (tapCountRef.current === 2) {
            if (tapTimeoutRef.current) {
              clearTimeout(tapTimeoutRef.current);
            }
            onGesture({
              type: "double-tap",
              startPosition: touchStartRef.current,
              endPosition,
              duration,
            });
            tapCountRef.current = 0;
            triggerHapticFeedback("medium");
          }
        } else if (distance > SWIPE_THRESHOLD) {
          // Swipe gesture
          const absX = Math.abs(deltaX);
          const absY = Math.abs(deltaY);
          let direction: "up" | "down" | "left" | "right";

          if (absX > absY) {
            direction = deltaX > 0 ? "right" : "left";
          } else {
            direction = deltaY > 0 ? "down" : "up";
          }

          onGesture({
            type: "swipe",
            startPosition: touchStartRef.current,
            endPosition,
            duration,
            distance,
            direction,
          });
          triggerHapticFeedback("light");
        }

        touchStartRef.current = null;
      };

      const handleTouchMove = (e: TouchEvent) => {
        // Prevent default to avoid scrolling during gestures
        if (touchStartRef.current) {
          const touch = e.touches[0];
          const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
          const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

          // If significant movement, cancel long press
          if ((deltaX > 10 || deltaY > 10) && longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
          }
        }
      };

      element.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      element.addEventListener("touchend", handleTouchEnd, { passive: false });
      element.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });

      return () => {
        element.removeEventListener("touchstart", handleTouchStart);
        element.removeEventListener("touchend", handleTouchEnd);
        element.removeEventListener("touchmove", handleTouchMove);

        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        if (longPressTimeoutRef.current)
          clearTimeout(longPressTimeoutRef.current);
      };
    },
    [mobileOptimizations.enableSwipeGestures, triggerHapticFeedback],
  );

  // Optimize for mobile performance
  const optimizeForMobile = useCallback(() => {
    if (!isMobile) return;

    // Optimize scrolling
    if (mobileOptimizations.optimizeScrolling) {
      document.body.style.webkitOverflowScrolling = "touch";
      document.body.style.overflowScrolling = "touch";
    }

    // Prevent zoom on inputs
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
      );
    }

    // Optimize touch events
    document.body.style.touchAction = "manipulation";
  }, [isMobile, mobileOptimizations.optimizeScrolling]);

  // Apply mobile optimizations on mount and when settings change
  useEffect(() => {
    optimizeForMobile();
  }, [optimizeForMobile]);

  // Get responsive classes for styling
  const getResponsiveClasses = useCallback(
    (config: {
      mobile?: string;
      tablet?: string;
      desktop?: string;
      landscape?: string;
      portrait?: string;
    }) => {
      const classes: string[] = [];

      if (isMobile && config.mobile) classes.push(config.mobile);
      if (isTablet && config.tablet) classes.push(config.tablet);
      if (isDesktop && config.desktop) classes.push(config.desktop);
      if (isLandscape && config.landscape) classes.push(config.landscape);
      if (isPortrait && config.portrait) classes.push(config.portrait);

      return classes.join(" ");
    },
    [isMobile, isTablet, isDesktop, isLandscape, isPortrait],
  );

  // Get touch-friendly size classes
  const getTouchFriendlyClasses = useCallback(
    (baseSize: "sm" | "md" | "lg") => {
      if (!mobileOptimizations.enableLargerTouchTargets || !isMobile) {
        return "";
      }

      const touchSizes = {
        sm: "min-h-[44px] min-w-[44px] p-3",
        md: "min-h-[48px] min-w-[48px] p-4",
        lg: "min-h-[52px] min-w-[52px] p-5",
      };

      return touchSizes[baseSize];
    },
    [mobileOptimizations.enableLargerTouchTargets, isMobile],
  );

  // Update mobile optimizations
  const updateMobileOptimizations = useCallback(
    (updates: Partial<MobileOptimizations>) => {
      setMobileOptimizations((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  // Force orientation (if supported)
  const requestOrientation = useCallback(
    async (orientation: OrientationLockType) => {
      if (deviceCapabilities.orientationSupported && screen.orientation?.lock) {
        try {
          await screen.orientation.lock(orientation);
        } catch (error) {
          console.warn("Failed to lock orientation:", error);
        }
      }
    },
    [deviceCapabilities.orientationSupported],
  );

  // Enter fullscreen mode
  const requestFullscreen = useCallback(
    async (element?: HTMLElement) => {
      if (!deviceCapabilities.fullscreenSupported) return false;

      const targetElement = element || document.documentElement;

      try {
        if (targetElement.requestFullscreen) {
          await targetElement.requestFullscreen();
        } else if ((targetElement as any).webkitRequestFullscreen) {
          await (targetElement as any).webkitRequestFullscreen();
        }
        return true;
      } catch (error) {
        console.warn("Failed to enter fullscreen:", error);
        return false;
      }
    },
    [deviceCapabilities.fullscreenSupported],
  );

  // Exit fullscreen mode
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
    } catch (error) {
      console.warn("Failed to exit fullscreen:", error);
    }
  }, []);

  // Share content using native share API
  const shareContent = useCallback(
    async (data: ShareData) => {
      if (!deviceCapabilities.shareApiSupported) return false;

      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.warn("Failed to share content:", error);
        return false;
      }
    },
    [deviceCapabilities.shareApiSupported],
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      if (longPressTimeoutRef.current)
        clearTimeout(longPressTimeoutRef.current);
    };
  }, []);

  return {
    // Device state
    screenSize,
    deviceCapabilities,
    orientation,
    isKeyboardOpen,

    // Device type detection
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,

    // Touch capabilities
    touchCapabilities: {
      touchScreen: deviceCapabilities.touchScreen,
      hapticFeedback: deviceCapabilities.vibrationSupported,
      swipeGestures: mobileOptimizations.enableSwipeGestures,
    },

    // Optimization settings
    mobileOptimizations,
    updateMobileOptimizations,

    // Helper functions
    getResponsiveClasses,
    getTouchFriendlyClasses,
    handleTouchGesture,
    triggerHapticFeedback,
    optimizeForMobile,

    // Device APIs
    requestOrientation,
    requestFullscreen,
    exitFullscreen,
    shareContent,
  };
};

export default useMobileOptimization;
