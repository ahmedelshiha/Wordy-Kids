export type JungleTheme =
  | "parchment"
  | "jungle"
  | "canopy"
  | "river"
  | "sunset";

export type OverlaySettings = {
  fireflies: boolean;
  fog: boolean;
  glow: boolean;
  ripples: boolean;
};

const THEME_STORAGE_KEY = "jungleTheme";
const OVERLAYS_STORAGE_KEY = "jungleOverlays";

export const JungleAdventureThemeManager = {
  getTheme(): JungleTheme {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      const theme = (stored || "parchment") as JungleTheme;
      return (
        ["parchment", "jungle", "canopy", "river", "sunset"] as const
      ).includes(theme)
        ? theme
        : "parchment";
    } catch {
      return "parchment";
    }
  },

  getOverlays(): OverlaySettings {
    try {
      const stored = localStorage.getItem(OVERLAYS_STORAGE_KEY);
      if (!stored)
        return { fireflies: true, fog: true, glow: true, ripples: false };
      return {
        fireflies: true,
        fog: true,
        glow: true,
        ripples: false,
        ...JSON.parse(stored),
      };
    } catch {
      return { fireflies: true, fog: true, glow: true, ripples: false };
    }
  },

  applyTheme(theme: JungleTheme) {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove(
      "jng-theme-parchment",
      "jng-theme-jungle",
      "jng-theme-canopy",
      "jng-theme-river",
      "jng-theme-sunset",
    );

    // Add new theme class
    root.classList.add("jng-theme-" + theme);

    // Set CSS custom property for theme-aware components
    root.style.setProperty("--current-jungle-theme", theme);

    // Persist in localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  },

  applyOverlays(overlays: OverlaySettings) {
    // Persist in localStorage
    localStorage.setItem(OVERLAYS_STORAGE_KEY, JSON.stringify(overlays));

    // Set CSS custom properties for overlay opacity control
    const root = document.documentElement;
    root.style.setProperty(
      "--jng-firefly-opacity",
      overlays.fireflies ? ".9" : "0",
    );
    root.style.setProperty("--jng-fog-opacity", overlays.fog ? ".35" : "0");
    root.style.setProperty("--jng-glow-opacity", overlays.glow ? ".25" : "0");
    root.style.setProperty(
      "--jng-ripples-opacity",
      overlays.ripples ? ".25" : "0",
    );
  },

  init() {
    // Apply saved theme and overlays on startup
    this.applyTheme(this.getTheme());
    this.applyOverlays(this.getOverlays());
  },

  // Convenience method to update both theme and overlays
  updateSettings(theme: JungleTheme, overlays: OverlaySettings) {
    this.applyTheme(theme);
    this.applyOverlays(overlays);
  },
};

export default JungleAdventureThemeManager;
