import { useState, useEffect, useCallback } from "react";

// Accessibility preferences hook
export const useAccessibilityFeatures = () => {
  const [preferences, setPreferences] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: false,
  });

  // Detect system preferences
  useEffect(() => {
    const detectSystemPreferences = () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const prefersHighContrast = window.matchMedia(
        "(prefers-contrast: high)",
      ).matches;
      const prefersLargeText = window.matchMedia(
        "(min-resolution: 144dpi)",
      ).matches;

      setPreferences((prev) => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
        largeText: prefersLargeText,
      }));

      // Apply classes to body
      if (prefersReducedMotion) {
        document.body.classList.add("reduce-motion");
      }
      if (prefersHighContrast) {
        document.body.classList.add("high-contrast");
      }
      if (prefersLargeText) {
        document.body.classList.add("large-text");
      }
    };

    detectSystemPreferences();

    // Listen for preference changes
    const mediaQueries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(prefers-contrast: high)"),
      window.matchMedia("(min-resolution: 144dpi)"),
    ];

    const handleChange = () => detectSystemPreferences();
    mediaQueries.forEach((mq) => mq.addEventListener("change", handleChange));

    return () => {
      mediaQueries.forEach((mq) =>
        mq.removeEventListener("change", handleChange),
      );
    };
  }, []);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enable keyboard navigation mode
      if (e.key === "Tab") {
        setPreferences((prev) => ({ ...prev, keyboardNavigation: true }));
        document.body.classList.add("keyboard-navigation");
      }
    };

    const handleMouseDown = () => {
      // Disable keyboard navigation mode when mouse is used
      setPreferences((prev) => ({ ...prev, keyboardNavigation: false }));
      document.body.classList.remove("keyboard-navigation");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const togglePreference = useCallback((key: keyof typeof preferences) => {
    setPreferences((prev) => {
      const newValue = !prev[key];

      // Apply body classes based on preferences
      const className = `accessibility-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      if (newValue) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }

      return { ...prev, [key]: newValue };
    });
  }, []);

  return {
    preferences,
    togglePreference,
  };
};

// Voice announcement hook for screen readers
export const useVoiceAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      // Add to announcements for screen readers
      setAnnouncements((prev) => [...prev, message]);

      // Create live region for screen reader
      const liveRegion = document.createElement("div");
      liveRegion.setAttribute("aria-live", priority);
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.style.position = "absolute";
      liveRegion.style.left = "-10000px";
      liveRegion.style.width = "1px";
      liveRegion.style.height = "1px";
      liveRegion.style.overflow = "hidden";
      liveRegion.textContent = message;

      document.body.appendChild(liveRegion);

      // Remove after announcement
      setTimeout(() => {
        if (document.body.contains(liveRegion)) {
          document.body.removeChild(liveRegion);
        }
      }, 1000);
    },
    [],
  );

  const announceProgress = useCallback(
    (current: number, total: number, context: string) => {
      const percentage = Math.round((current / total) * 100);
      announce(`${context}: ${current} of ${total}, ${percentage}% complete`);
    },
    [announce],
  );

  const announceNewData = useCallback(
    (type: string, count: number) => {
      announce(`New ${type} data loaded with ${count} items`);
    },
    [announce],
  );

  return {
    announce,
    announceProgress,
    announceNewData,
    announcements,
  };
};

// Kid-friendly focus management
export const useKidFriendlyFocus = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      setFocusedElement(target);

      // Add kid-friendly focus indicator
      target.classList.add("kid-focus");
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      target.classList.remove("kid-focus");
    };

    document.addEventListener("focusin", handleFocus);
    document.addEventListener("focusout", handleBlur);

    return () => {
      document.removeEventListener("focusin", handleFocus);
      document.removeEventListener("focusout", handleBlur);
    };
  }, []);

  const moveFocusToElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      // Announce focus change for screen readers
      const announcement = `Focus moved to ${element.getAttribute("aria-label") || element.textContent || selector}`;
      const liveRegion = document.createElement("div");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.style.position = "absolute";
      liveRegion.style.left = "-10000px";
      liveRegion.textContent = announcement;
      document.body.appendChild(liveRegion);
      setTimeout(() => document.body.removeChild(liveRegion), 1000);
    }
  }, []);

  return {
    focusedElement,
    moveFocusToElement,
  };
};

// High contrast mode utilities
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      const prefersHighContrast = window.matchMedia(
        "(prefers-contrast: high)",
      ).matches;
      setIsHighContrast(prefersHighContrast);
    };

    checkHighContrast();

    const mediaQuery = window.matchMedia("(prefers-contrast: high)");
    mediaQuery.addEventListener("change", checkHighContrast);

    return () => mediaQuery.removeEventListener("change", checkHighContrast);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setIsHighContrast((prev) => {
      const newValue = !prev;
      if (newValue) {
        document.body.classList.add("high-contrast-mode");
      } else {
        document.body.classList.remove("high-contrast-mode");
      }
      return newValue;
    });
  }, []);

  return {
    isHighContrast,
    toggleHighContrast,
  };
};
