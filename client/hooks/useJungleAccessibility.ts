import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";

// Types and interfaces
interface AccessibilitySettings {
  // Visual accessibility
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  colorBlindSupport: boolean;
  darkMode: boolean;
  fontScale: number; // 1.0 = normal, 1.5 = large, 2.0 = extra large

  // Audio accessibility
  soundEnabled: boolean;
  speechRate: number;
  speechPitch: number;
  audioDescriptions: boolean;
  captionsEnabled: boolean;
  soundEffectsEnabled: boolean;

  // Motor accessibility
  stickyKeys: boolean;
  slowKeys: boolean;
  mouseKeys: boolean;
  largerClickTargets: boolean;
  reducedClickSensitivity: boolean;
  gestureAlternatives: boolean;

  // Cognitive accessibility
  simplifiedInterface: boolean;
  extendedTimeouts: boolean;
  pauseAnimations: boolean;
  consistentNavigation: boolean;
  errorPrevention: boolean;
  cognitiveLoad: "low" | "medium" | "high";

  // Screen reader support
  screenReaderEnabled: boolean;
  verboseDescriptions: boolean;
  landmark_navigation: boolean;
  skipLinks: boolean;
  focusIndicators: boolean;
  liveRegions: boolean;
}

interface KeyboardShortcut {
  key: string;
  modifiers: string[];
  action: string;
  description: string;
  global: boolean;
}

interface FocusManagement {
  currentFocusElement: HTMLElement | null;
  focusHistory: HTMLElement[];
  trapFocus: boolean;
  focusOutline: boolean;
  skipToContent: boolean;
}

interface ScreenReaderAnnouncement {
  message: string;
  priority: "polite" | "assertive";
  delay?: number;
  clear?: boolean;
}

const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  // Visual
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  colorBlindSupport: false,
  darkMode: false,
  fontScale: 1.0,

  // Audio
  soundEnabled: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  audioDescriptions: false,
  captionsEnabled: false,
  soundEffectsEnabled: true,

  // Motor
  stickyKeys: false,
  slowKeys: false,
  mouseKeys: false,
  largerClickTargets: false,
  reducedClickSensitivity: false,
  gestureAlternatives: true,

  // Cognitive
  simplifiedInterface: false,
  extendedTimeouts: false,
  pauseAnimations: false,
  consistentNavigation: true,
  errorPrevention: true,
  cognitiveLoad: "medium",

  // Screen reader
  screenReaderEnabled: false,
  verboseDescriptions: false,
  landmark_navigation: true,
  skipLinks: true,
  focusIndicators: true,
  liveRegions: true,
};

const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: "h",
    modifiers: ["alt"],
    action: "toggleHighContrast",
    description: "Toggle high contrast mode",
    global: true,
  },
  {
    key: "l",
    modifiers: ["alt"],
    action: "toggleLargeText",
    description: "Toggle large text",
    global: true,
  },
  {
    key: "m",
    modifiers: ["alt"],
    action: "toggleReducedMotion",
    description: "Toggle reduced motion",
    global: true,
  },
  {
    key: "s",
    modifiers: ["alt"],
    action: "toggleSound",
    description: "Toggle sound",
    global: true,
  },
  {
    key: "Tab",
    modifiers: [],
    action: "focusNext",
    description: "Move to next element",
    global: true,
  },
  {
    key: "Tab",
    modifiers: ["shift"],
    action: "focusPrevious",
    description: "Move to previous element",
    global: true,
  },
  {
    key: "Enter",
    modifiers: [],
    action: "activate",
    description: "Activate focused element",
    global: false,
  },
  {
    key: " ",
    modifiers: [],
    action: "activate",
    description: "Activate focused element",
    global: false,
  },
  {
    key: "Escape",
    modifiers: [],
    action: "cancel",
    description: "Cancel or close",
    global: false,
  },
  {
    key: "ArrowUp",
    modifiers: [],
    action: "navigateUp",
    description: "Navigate up",
    global: false,
  },
  {
    key: "ArrowDown",
    modifiers: [],
    action: "navigateDown",
    description: "Navigate down",
    global: false,
  },
  {
    key: "ArrowLeft",
    modifiers: [],
    action: "navigateLeft",
    description: "Navigate left",
    global: false,
  },
  {
    key: "ArrowRight",
    modifiers: [],
    action: "navigateRight",
    description: "Navigate right",
    global: false,
  },
  {
    key: "Home",
    modifiers: [],
    action: "navigateFirst",
    description: "Go to first item",
    global: false,
  },
  {
    key: "End",
    modifiers: [],
    action: "navigateLast",
    description: "Go to last item",
    global: false,
  },
];

const STORAGE_KEY = "jungle_accessibility_settings";

export const useJungleAccessibility = () => {
  // State management
  const [accessibilitySettings, setAccessibilitySettings] =
    useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY_SETTINGS);

  const [focusManagement, setFocusManagement] = useState<FocusManagement>({
    currentFocusElement: null,
    focusHistory: [],
    trapFocus: false,
    focusOutline: true,
    skipToContent: true,
  });

  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const [announcements, setAnnouncements] = useState<
    ScreenReaderAnnouncement[]
  >([]);

  // Refs
  const announcementTimeoutRef = useRef<NodeJS.Timeout>();
  const focusTrapRef = useRef<HTMLElement[]>([]);
  const skipLinkRef = useRef<HTMLAnchorElement | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // Load accessibility settings on mount
  useEffect(() => {
    loadAccessibilitySettings();
    detectScreenReader();
    createLiveRegion();
    applySystemPreferences();
  }, []);

  // Apply settings when they change
  useEffect(() => {
    applyAccessibilitySettings();
  }, [accessibilitySettings]);

  // Load settings from localStorage
  const loadAccessibilitySettings = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setAccessibilitySettings({
          ...DEFAULT_ACCESSIBILITY_SETTINGS,
          ...parsed,
        });
      }
    } catch (error) {
      console.error("Error loading accessibility settings:", error);
    }
  }, []);

  // Save settings to localStorage
  const saveAccessibilitySettings = useCallback(
    (settings: AccessibilitySettings) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setAccessibilitySettings(settings);
      } catch (error) {
        console.error("Error saving accessibility settings:", error);
      }
    },
    [],
  );

  // Detect if screen reader is active
  const detectScreenReader = useCallback(() => {
    // Multiple methods to detect screen readers
    const hasScreenReader =
      // Check for common screen reader indicators
      ("speechSynthesis" in window && speechSynthesis.getVoices().length > 0) ||
      // Check for screen reader specific APIs
      "webkitSpeechRecognition" in window ||
      // Check for high contrast mode (often indicates screen reader use)
      window.matchMedia("(-ms-high-contrast: active)").matches ||
      // Check for prefers-reduced-motion (accessibility-conscious users)
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setIsScreenReaderActive(hasScreenReader);

    if (hasScreenReader) {
      updateAccessibilitySettings({ screenReaderEnabled: true });
    }
  }, []);

  // Apply system accessibility preferences
  const applySystemPreferences = useCallback(() => {
    const preferences: Partial<AccessibilitySettings> = {};

    // Check for reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      preferences.reducedMotion = true;
      preferences.pauseAnimations = true;
    }

    // Check for high contrast preference
    if (window.matchMedia("(prefers-contrast: high)").matches) {
      preferences.highContrast = true;
    }

    // Check for dark mode preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      preferences.darkMode = true;
    }

    // Check for reduced transparency (cognitive accessibility)
    if (window.matchMedia("(prefers-reduced-transparency: reduce)").matches) {
      preferences.simplifiedInterface = true;
    }

    if (Object.keys(preferences).length > 0) {
      updateAccessibilitySettings(preferences);
    }
  }, []);

  // Create live region for screen reader announcements
  const createLiveRegion = useCallback(() => {
    if (typeof document === "undefined") return;

    let liveRegion = document.getElementById("jungle-live-region");
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.id = "jungle-live-region";
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.className = "sr-only";
      liveRegion.style.cssText =
        "position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;";
      document.body.appendChild(liveRegion);
    }
    liveRegionRef.current = liveRegion as HTMLDivElement;
  }, []);

  // Apply accessibility settings to the DOM
  const applyAccessibilitySettings = useCallback(() => {
    const root = document.documentElement;

    // Visual accessibility
    root.style.setProperty(
      "--font-scale",
      accessibilitySettings.fontScale.toString(),
    );
    root.classList.toggle("high-contrast", accessibilitySettings.highContrast);
    root.classList.toggle("large-text", accessibilitySettings.largeText);
    root.classList.toggle(
      "reduced-motion",
      accessibilitySettings.reducedMotion,
    );
    root.classList.toggle("dark-mode", accessibilitySettings.darkMode);
    root.classList.toggle(
      "colorblind-support",
      accessibilitySettings.colorBlindSupport,
    );

    // Motor accessibility
    root.classList.toggle(
      "large-click-targets",
      accessibilitySettings.largerClickTargets,
    );
    root.classList.toggle("sticky-keys", accessibilitySettings.stickyKeys);

    // Cognitive accessibility
    root.classList.toggle(
      "simplified-interface",
      accessibilitySettings.simplifiedInterface,
    );
    root.setAttribute(
      "data-cognitive-load",
      accessibilitySettings.cognitiveLoad,
    );

    // Focus management
    root.classList.toggle(
      "focus-indicators",
      accessibilitySettings.focusIndicators,
    );

    // Animation preferences
    if (accessibilitySettings.reducedMotion) {
      root.style.setProperty("--animation-duration", "0.01ms");
      root.style.setProperty("--transition-duration", "0.01ms");
    } else {
      root.style.removeProperty("--animation-duration");
      root.style.removeProperty("--transition-duration");
    }
  }, [accessibilitySettings]);

  // Screen reader announcement function
  const announceForScreenReader = useCallback(
    (
      message: string,
      priority: "polite" | "assertive" = "polite",
      delay: number = 0,
    ) => {
      if (
        !accessibilitySettings.screenReaderEnabled ||
        !liveRegionRef.current
      ) {
        return;
      }

      const announce = () => {
        if (liveRegionRef.current) {
          liveRegionRef.current.setAttribute("aria-live", priority);
          liveRegionRef.current.textContent = message;

          // Clear after 1 second to allow for new announcements
          if (announcementTimeoutRef.current) {
            clearTimeout(announcementTimeoutRef.current);
          }
          announcementTimeoutRef.current = setTimeout(() => {
            if (liveRegionRef.current) {
              liveRegionRef.current.textContent = "";
            }
          }, 1000);
        }
      };

      if (delay > 0) {
        setTimeout(announce, delay);
      } else {
        announce();
      }

      // Add to announcements history
      setAnnouncements((prev) => [
        ...prev.slice(-9),
        { message, priority, delay },
      ]);
    },
    [accessibilitySettings.screenReaderEnabled],
  );

  // Keyboard navigation handler
  const handleKeyboardNavigation = useCallback(
    (event: KeyboardEvent): boolean => {
      const shortcut = KEYBOARD_SHORTCUTS.find(
        (s) =>
          s.key === event.key &&
          s.modifiers.every((mod) => {
            switch (mod) {
              case "ctrl":
                return event.ctrlKey;
              case "alt":
                return event.altKey;
              case "shift":
                return event.shiftKey;
              case "meta":
                return event.metaKey;
              default:
                return true;
            }
          }),
      );

      if (!shortcut) return false;

      event.preventDefault();

      switch (shortcut.action) {
        case "toggleHighContrast":
          updateAccessibilitySettings({
            highContrast: !accessibilitySettings.highContrast,
          });
          announceForScreenReader(
            `High contrast ${accessibilitySettings.highContrast ? "disabled" : "enabled"}`,
          );
          break;
        case "toggleLargeText":
          updateAccessibilitySettings({
            largeText: !accessibilitySettings.largeText,
          });
          announceForScreenReader(
            `Large text ${accessibilitySettings.largeText ? "disabled" : "enabled"}`,
          );
          break;
        case "toggleReducedMotion":
          updateAccessibilitySettings({
            reducedMotion: !accessibilitySettings.reducedMotion,
          });
          announceForScreenReader(
            `Animations ${accessibilitySettings.reducedMotion ? "enabled" : "disabled"}`,
          );
          break;
        case "toggleSound":
          updateAccessibilitySettings({
            soundEnabled: !accessibilitySettings.soundEnabled,
          });
          announceForScreenReader(
            `Sound ${accessibilitySettings.soundEnabled ? "disabled" : "enabled"}`,
          );
          break;
      }

      return true;
    },
    [accessibilitySettings, announceForScreenReader],
  );

  // Focus management functions
  const manageFocus = useCallback(
    (
      element: HTMLElement | null,
      options?: {
        announce?: boolean;
        scroll?: boolean;
        trap?: boolean;
      },
    ) => {
      if (!element) return;

      const { announce = false, scroll = true, trap = false } = options || {};

      // Update focus history
      setFocusManagement((prev) => ({
        ...prev,
        currentFocusElement: element,
        focusHistory: [element, ...prev.focusHistory.slice(0, 9)],
        trapFocus: trap,
      }));

      // Focus the element
      element.focus({ preventScroll: !scroll });

      // Announce for screen readers if requested
      if (announce && accessibilitySettings.screenReaderEnabled) {
        const label =
          element.getAttribute("aria-label") ||
          element.getAttribute("alt") ||
          element.textContent ||
          element.tagName.toLowerCase();

        announceForScreenReader(`Focused on ${label}`);
      }
    },
    [accessibilitySettings.screenReaderEnabled, announceForScreenReader],
  );

  // Focus trap for modal dialogs
  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, []);

  // Skip link functionality
  const createSkipLink = useCallback(
    (targetId: string, label: string = "Skip to main content") => {
      if (typeof document === "undefined") return;

      let skipLink = document.getElementById("jungle-skip-link");
      if (!skipLink) {
        skipLink = document.createElement("a");
        skipLink.id = "jungle-skip-link";
        skipLink.href = `#${targetId}`;
        skipLink.textContent = label;
        skipLink.className =
          "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50";

        skipLink.addEventListener("click", (e) => {
          e.preventDefault();
          const target = document.getElementById(targetId);
          if (target) {
            target.focus();
            target.scrollIntoView({ behavior: "smooth" });
            announceForScreenReader(`Skipped to ${label}`);
          }
        });

        document.body.insertBefore(skipLink, document.body.firstChild);
      }

      skipLinkRef.current = skipLink as HTMLAnchorElement;
    },
    [announceForScreenReader],
  );

  // Update accessibility settings
  const updateAccessibilitySettings = useCallback(
    (updates: Partial<AccessibilitySettings>) => {
      const newSettings = { ...accessibilitySettings, ...updates };
      saveAccessibilitySettings(newSettings);

      // Announce significant changes
      Object.keys(updates).forEach((key) => {
        const value = (updates as any)[key];
        if (
          typeof value === "boolean" &&
          accessibilitySettings.screenReaderEnabled
        ) {
          const friendlyName = key.replace(/([A-Z])/g, " $1").toLowerCase();
          announceForScreenReader(
            `${friendlyName} ${value ? "enabled" : "disabled"}`,
          );
        }
      });
    },
    [accessibilitySettings, saveAccessibilitySettings, announceForScreenReader],
  );

  // Get accessibility status
  const getAccessibilityStatus = useCallback(() => {
    return {
      screenReaderDetected: isScreenReaderActive,
      settingsLoaded: true,
      focusManagement: {
        currentElement: focusManagement.currentFocusElement?.tagName || null,
        trapActive: focusManagement.trapFocus,
      },
      announcements: announcements.length,
      keyboardShortcuts: KEYBOARD_SHORTCUTS.length,
    };
  }, [isScreenReaderActive, focusManagement, announcements]);

  // Quick accessibility toggle functions
  const toggleHighContrast = useCallback(() => {
    updateAccessibilitySettings({
      highContrast: !accessibilitySettings.highContrast,
    });
  }, [accessibilitySettings.highContrast, updateAccessibilitySettings]);

  const toggleLargeText = useCallback(() => {
    updateAccessibilitySettings({
      largeText: !accessibilitySettings.largeText,
    });
  }, [accessibilitySettings.largeText, updateAccessibilitySettings]);

  const toggleReducedMotion = useCallback(() => {
    updateAccessibilitySettings({
      reducedMotion: !accessibilitySettings.reducedMotion,
    });
  }, [accessibilitySettings.reducedMotion, updateAccessibilitySettings]);

  const increaseFontSize = useCallback(() => {
    const newScale = Math.min(2.0, accessibilitySettings.fontScale + 0.1);
    updateAccessibilitySettings({ fontScale: newScale });
  }, [accessibilitySettings.fontScale, updateAccessibilitySettings]);

  const decreaseFontSize = useCallback(() => {
    const newScale = Math.max(0.8, accessibilitySettings.fontScale - 0.1);
    updateAccessibilitySettings({ fontScale: newScale });
  }, [accessibilitySettings.fontScale, updateAccessibilitySettings]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Settings
    accessibilitySettings,
    updateAccessibilitySettings,

    // Screen reader support
    isScreenReaderActive,
    announceForScreenReader,
    announcements,

    // Focus management
    focusManagement,
    manageFocus,
    trapFocus,
    createSkipLink,

    // Keyboard navigation
    handleKeyboardNavigation,
    keyboardShortcuts: KEYBOARD_SHORTCUTS,

    // Quick toggles
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    increaseFontSize,
    decreaseFontSize,

    // Utilities
    getAccessibilityStatus,
    detectScreenReader,
    applySystemPreferences,
  };
};

export default useJungleAccessibility;
