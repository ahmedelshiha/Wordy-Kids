import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Type,
  Zap,
  Heart,
  Sun,
  Moon,
  Contrast,
  RotateCcw,
  Accessibility,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  darkMode: boolean;
}

interface MobileAccessibilityEnhancementsProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileAccessibilityEnhancements({
  children,
  className,
}: MobileAccessibilityEnhancementsProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    soundEnabled: true,
    hapticEnabled: true,
    darkMode: false,
  });

  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("accessibility-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error);
      }
    }

    // Check for system preferences
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    setSettings((prev) => ({
      ...prev,
      reduceMotion: prev.reduceMotion || prefersReducedMotion,
      darkMode: prev.darkMode || prefersDarkMode,
    }));
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("accessibility-settings", JSON.stringify(settings));

    // Apply settings to document
    applyAccessibilitySettings(settings);
  }, [settings]);

  const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;

    // High contrast
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Large text
    if (settings.largeText) {
      root.classList.add("large-text");
    } else {
      root.classList.remove("large-text");
    }

    // Reduced motion
    if (settings.reduceMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    // Dark mode
    if (settings.darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    // Provide haptic feedback if enabled
    if (settings.hapticEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      soundEnabled: true,
      hapticEnabled: true,
      darkMode: false,
    };
    setSettings(defaultSettings);

    if (settings.hapticEnabled && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Accessibility Floating Button */}
      <Button
        onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
        className={cn(
          "fixed top-4 left-4 z-50 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-300",
          showAccessibilityPanel && "bg-blue-700 scale-110",
        )}
        aria-label="Open accessibility settings"
        aria-expanded={showAccessibilityPanel}
      >
        <Accessibility className="w-5 h-5" />
      </Button>

      {/* Accessibility Settings Panel */}
      {showAccessibilityPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAccessibilityPanel(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <Card className="fixed top-20 left-4 z-50 w-80 max-w-[calc(100vw-2rem)] shadow-2xl animate-slide-in-from-left">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Accessibility
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetSettings}
                  className="text-xs text-gray-600 hover:text-gray-800"
                  aria-label="Reset all settings"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>

              <div className="space-y-3">
                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Contrast className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">High Contrast</span>
                  </div>
                  <Button
                    variant={settings.highContrast ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateSetting("highContrast", !settings.highContrast)
                    }
                    className="w-16 h-8"
                    aria-pressed={settings.highContrast}
                  >
                    {settings.highContrast ? "On" : "Off"}
                  </Button>
                </div>

                {/* Large Text */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Large Text</span>
                  </div>
                  <Button
                    variant={settings.largeText ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateSetting("largeText", !settings.largeText)
                    }
                    className="w-16 h-8"
                    aria-pressed={settings.largeText}
                  >
                    {settings.largeText ? "On" : "Off"}
                  </Button>
                </div>

                {/* Reduced Motion */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Reduce Motion</span>
                  </div>
                  <Button
                    variant={settings.reduceMotion ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateSetting("reduceMotion", !settings.reduceMotion)
                    }
                    className="w-16 h-8"
                    aria-pressed={settings.reduceMotion}
                  >
                    {settings.reduceMotion ? "On" : "Off"}
                  </Button>
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-gray-600" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-sm font-medium">Sound Effects</span>
                  </div>
                  <Button
                    variant={settings.soundEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateSetting("soundEnabled", !settings.soundEnabled)
                    }
                    className="w-16 h-8"
                    aria-pressed={settings.soundEnabled}
                  >
                    {settings.soundEnabled ? "On" : "Off"}
                  </Button>
                </div>

                {/* Haptic Feedback */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">Haptic Feedback</span>
                  </div>
                  <Button
                    variant={settings.hapticEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateSetting("hapticEnabled", !settings.hapticEnabled)
                    }
                    className="w-16 h-8"
                    aria-pressed={settings.hapticEnabled}
                    disabled={!navigator.vibrate}
                  >
                    {settings.hapticEnabled ? "On" : "Off"}
                  </Button>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.darkMode ? (
                      <Moon className="w-4 h-4 text-gray-600" />
                    ) : (
                      <Sun className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-sm font-medium">Dark Mode</span>
                  </div>
                  <Button
                    variant={settings.darkMode ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      updateSetting("darkMode", !settings.darkMode)
                    }
                    className="w-16 h-8"
                    aria-pressed={settings.darkMode}
                  >
                    {settings.darkMode ? "On" : "Off"}
                  </Button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  Settings are saved automatically
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Main Content with accessibility classes applied */}
      <div
        className={cn(
          "transition-all duration-300",
          settings.largeText && "text-lg",
          settings.highContrast && "contrast-125",
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Enhanced Touch Target Component
export function TouchTarget({
  children,
  onClick,
  className = "",
  variant = "default",
  hapticEnabled = true,
  soundEnabled = true,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "large" | "small";
  hapticEnabled?: boolean;
  soundEnabled?: boolean;
  [key: string]: any;
}) {
  const handleClick = () => {
    // Haptic feedback
    if (hapticEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Sound feedback (placeholder - would integrate with actual audio service)
    if (soundEnabled) {
      // audioService.playClickSound();
    }

    onClick?.();
  };

  const sizeClasses = {
    small: "min-h-[36px] min-w-[36px] p-2",
    default: "min-h-[44px] min-w-[44px] p-3",
    large: "min-h-[48px] min-w-[48px] p-4",
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "transition-all duration-200 transform active:scale-95 rounded-lg",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "touch-manipulation select-none",
        sizeClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Skip Link Component for keyboard navigation
export function SkipLink({
  targetId,
  children,
}: {
  targetId: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
    >
      {children}
    </a>
  );
}
