import { useState, useEffect } from "react";

export interface BottomNavSettings {
  showBottomNav: boolean;
}

const DEFAULT_SETTINGS: BottomNavSettings = {
  showBottomNav: false, // Default to disabled as requested
};

export function useBottomNavSettings() {
  const [settings, setSettings] = useState<BottomNavSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const uiSettings = localStorage.getItem("uiSettings");
        if (uiSettings) {
          const parsedSettings = JSON.parse(uiSettings);
          setSettings({
            showBottomNav: parsedSettings.showBottomNav !== false,
          });
        }
      } catch (error) {
        console.error("Error loading bottom nav settings:", error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage
  const updateSettings = (newSettings: Partial<BottomNavSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      // Get existing UI settings and merge with new ones
      const existingSettings = localStorage.getItem("uiSettings");
      const existingParsed = existingSettings
        ? JSON.parse(existingSettings)
        : {};

      localStorage.setItem(
        "uiSettings",
        JSON.stringify({
          ...existingParsed,
          ...updatedSettings,
        }),
      );
    } catch (error) {
      console.error("Error saving bottom nav settings:", error);
    }
  };

  return {
    settings,
    updateSettings,
    isLoaded,
    showBottomNav: settings.showBottomNav,
    setShowBottomNav: (show: boolean) =>
      updateSettings({ showBottomNav: show }),
  };
}
