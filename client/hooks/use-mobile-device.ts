import { useState, useEffect } from "react";

interface MobileDeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  hasHaptic: boolean;
  supportsVibration: boolean;
  screenSize: "small" | "medium" | "large";
  orientation: "portrait" | "landscape";
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
}

export const useMobileDevice = (): MobileDeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<MobileDeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    hasTouch: false,
    hasHaptic: false,
    supportsVibration: false,
    screenSize: "large",
    orientation: "landscape",
    prefersReducedMotion: false,
    prefersHighContrast: false,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      
      // Check for haptic feedback support
      const hasHaptic = "vibrate" in navigator && hasTouch;
      
      // Check for vibration API support
      const supportsVibration = "vibrate" in navigator;
      
      // Determine screen size category
      let screenSize: "small" | "medium" | "large" = "large";
      if (width <= 480) screenSize = "small";
      else if (width <= 768) screenSize = "medium";
      
      // Determine orientation
      const orientation = height > width ? "portrait" : "landscape";
      
      // Check for accessibility preferences
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const prefersHighContrast = window.matchMedia("(prefers-contrast: high)").matches;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        hasTouch,
        hasHaptic,
        supportsVibration,
        screenSize,
        orientation,
        prefersReducedMotion,
        prefersHighContrast,
      });
    };

    // Update on mount
    updateDeviceInfo();

    // Update on resize
    window.addEventListener("resize", updateDeviceInfo);
    window.addEventListener("orientationchange", updateDeviceInfo);

    // Listen for preference changes
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
    
    const handleReducedMotionChange = () => updateDeviceInfo();
    const handleHighContrastChange = () => updateDeviceInfo();
    
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    highContrastQuery.addEventListener("change", handleHighContrastChange);

    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
      window.removeEventListener("orientationchange", updateDeviceInfo);
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
      highContrastQuery.removeEventListener("change", handleHighContrastChange);
    };
  }, []);

  return deviceInfo;
};

// Utility function for haptic feedback
export const triggerHapticFeedback = (type: "light" | "medium" | "heavy" = "light") => {
  if ("vibrate" in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 50,
    };
    
    navigator.vibrate(patterns[type]);
  }
};

// Utility function for checking if device supports specific features
export const deviceCapabilities = {
  hasVibration: () => "vibrate" in navigator,
  hasTouch: () => "ontouchstart" in window || navigator.maxTouchPoints > 0,
  hasDeviceMotion: () => "DeviceMotionEvent" in window,
  hasDeviceOrientation: () => "DeviceOrientationEvent" in window,
  hasGeolocation: () => "geolocation" in navigator,
  hasNotifications: () => "Notification" in window,
  hasServiceWorker: () => "serviceWorker" in navigator,
  hasWebGL: () => {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        canvas.getContext("webgl")
      );
    } catch {
      return false;
    }
  },
};
