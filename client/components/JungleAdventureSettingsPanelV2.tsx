import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { EnhancedSlider } from "@/components/ui/enhanced-slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  X,
  Play,
  Square,
  RotateCcw,
  Save,
  Volume2,
  VolumeX,
  Palette,
  BookOpen,
  Accessibility,
  Sparkles,
} from "lucide-react";
import {
  setSoundEnabled,
  isSoundEnabled,
  setUIInteractionSoundsEnabled,
  isUIInteractionSoundsEnabled,
  playSoundIfEnabled,
} from "@/lib/soundEffects";
import { audioService, VoiceType } from "@/lib/audioService";
import { globalAmbientAudio } from "@/lib/globalAmbientAudio";
import {
  useMobileDevice,
  triggerHapticFeedback,
} from "@/hooks/use-mobile-device";
import { sessionManager } from "@/lib/sessionManager";
import {
  JungleAdventureThemeManager,
  JungleTheme,
  OverlaySettings,
} from "@/lib/JungleAdventureThemeManager";
import "@/styles/jungle-theme.css";

// Settings type definition
type Settings = {
  // Sound & Voice
  uiSounds: boolean;
  ambient: "off" | "birds" | "rain" | "wind" | "waterfall" | "insects";
  ambientVolume: number; // 0..1
  voice: "woman" | "man" | "child";
  speechRate: number; // 0.5..1.5

  // Theme & Motion
  theme: JungleTheme;
  darkMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;

  // Overlay Effects
  overlays: OverlaySettings;

  // Learning & Family
  difficulty: "easy" | "normal" | "hard";
  dailyGoal: number; // cards per day
  timeLimitMin: number; // 0=off
  parentGateEnabled: boolean;

  // Accessibility
  textScale: number; // 0.9..1.3
  haptics: boolean;
  captions: boolean;
};

// Default settings
const DEFAULTS: Settings = {
  uiSounds: true,
  ambient: "off",
  ambientVolume: 0.35,
  voice: "child",
  speechRate: 1.0,
  theme: "parchment",
  darkMode: false,
  reducedMotion: false,
  highContrast: false,
  overlays: {
    fireflies: false,
    fog: false,
    glow: false,
    ripples: false,
  },
  difficulty: "normal",
  dailyGoal: 10,
  timeLimitMin: 0,
  parentGateEnabled: true,
  textScale: 1.0,
  haptics: true,
  captions: true,
};

const STORAGE_KEY = "jungleAdventureSettings";

// Sound files mapping
const SOUND_FILES = {
  ambient: {
    birds: "/sounds/jungle-birds.mp3",
    rain: "/sounds/jungle-rain.mp3",
    wind: "/sounds/jungle-wind.mp3",
    waterfall: "/sounds/jungle-waterfall.mp3",
    insects: "/sounds/jungle-insects.mp3",
  },
  ui: {
    settingsSaved: "/sounds/ui/settings-saved.mp3",
    settingsReset: "/sounds/ui/settings-reset.mp3",
    voicePreview: "/sounds/ui/voice-preview.mp3",
  },
};

// Settings management
function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let parsed = raw ? JSON.parse(raw) : {};

    // Integrate with theme manager
    const themeFromManager = JungleAdventureThemeManager.getTheme();
    const overlaysFromManager = JungleAdventureThemeManager.getOverlays();

    return {
      ...DEFAULTS,
      ...parsed,
      theme: themeFromManager,
      overlays: overlaysFromManager,
    };
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(s: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

  // Apply side-effects to document
  document.documentElement.style.setProperty(
    "--jng-text-scale",
    String(s.textScale),
  );
  document.documentElement.classList.toggle("dark", s.darkMode);
  document.documentElement.classList.toggle("hc", s.highContrast);
  document.documentElement.classList.toggle("reduce-motion", s.reducedMotion);

  // Apply theme and overlays through theme manager
  JungleAdventureThemeManager.applyTheme(s.theme);
  JungleAdventureThemeManager.applyOverlays(s.overlays);

  // Apply sound settings
  setSoundEnabled(s.uiSounds);
  setUIInteractionSoundsEnabled(s.uiSounds);

  // Apply voice settings to audioService
  if (audioService) {
    audioService.setVoiceType(s.voice);
    // Store speech rate for global use
    (window as any).jungleAudioSettings = {
      speechRate: s.speechRate,
      voice: s.voice,
      ambientVolume: s.ambientVolume,
    };
  }

  // Apply ambient sound settings globally
  globalAmbientAudio.updateFromSettings(s.ambient, s.ambientVolume);

  // Make session manager globally available
  (window as any).sessionManager = sessionManager;

  // Notify any active session about settings change
  console.log(
    "📚 Settings updated - session will use new values on next start",
  );
}

// Helper function to get current audio settings for use throughout the app
export function getCurrentAudioSettings() {
  const settings = loadSettings();
  return {
    speechRate: settings.speechRate,
    voice: settings.voice,
    ambientVolume: settings.ambientVolume,
  };
}

// Helper function to pronounce word with current settings
export function pronounceWordWithSettings(word: string, options: any = {}) {
  const audioSettings = getCurrentAudioSettings();
  return audioService.pronounceWord(word, {
    rate: audioSettings.speechRate,
    ...options,
  });
}

// Component props
type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export default function JungleAdventureSettingsPanelV2({
  open,
  onOpenChange,
}: Props) {
  const { isMobile, hasHaptic, prefersReducedMotion } = useMobileDevice();
  const [settings, setSettings] = useState<Settings>(() => {
    const loadedSettings = loadSettings();
    console.log("🔧 Initial settings loaded:", loadedSettings);
    return loadedSettings;
  });
  const [dirty, setDirty] = useState(false);
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  // Initialize theme manager and global ambient audio
  useEffect(() => {
    JungleAdventureThemeManager.init();
    globalAmbientAudio.init();
    saveSettings(settings);

    // Keep local ambient ref for preview purposes only
    ambientRef.current = new Audio();
    ambientRef.current.loop = true;
    ambientRef.current.preload = "auto";

    return () => {
      if (ambientRef.current) {
        ambientRef.current.pause();
        ambientRef.current.currentTime = 0;
      }
    };
  }, []);

  // Handle ambient sound preview (local audio for settings panel preview only)
  useEffect(() => {
    if (!ambientRef.current) return;

    // Only play preview if the settings panel is open
    if (!open) {
      ambientRef.current.pause();
      ambientRef.current.currentTime = 0;
      return;
    }

    if (settings.ambient === "off") {
      ambientRef.current.pause();
      ambientRef.current.currentTime = 0;
      return;
    }

    const src = SOUND_FILES.ambient[settings.ambient];
    if (ambientRef.current.src !== location.origin + src) {
      ambientRef.current.src = src;
    }

    ambientRef.current.volume = Math.max(
      0,
      Math.min(1, settings.ambientVolume),
    );
    ambientRef.current.play().catch(() => {
      // Autoplay may be blocked - this is normal for preview
      console.log("Preview autoplay blocked - user needs to interact first");
    });
  }, [settings.ambient, settings.ambientVolume, open]);

  // Handle reduced motion preference
  useEffect(() => {
    const shouldReduceMotion = settings.reducedMotion || prefersReducedMotion;
    document.documentElement.classList.toggle(
      "reduce-motion",
      shouldReduceMotion,
    );
  }, [settings.reducedMotion, prefersReducedMotion]);

  // Haptic feedback helper
  function hapticTap() {
    if (settings.haptics && hasHaptic) {
      triggerHapticFeedback("light");
    }
  }

  // Update settings with dirty tracking
  function markDirty(next: Partial<Settings>) {
    console.log("🔧 Settings changed:", next);
    setSettings((s) => ({ ...s, ...next }));
    setDirty(true);
    hapticTap();
  }

  // Play UI sound
  function playUISound(src: string) {
    if (!settings.uiSounds) return;
    try {
      const audio = new Audio(src);
      audio.volume = 0.7;
      audio.play().catch(() => {});
    } catch (error) {
      console.warn("Could not play UI sound:", error);
    }
  }

  // Save and apply settings
  function handleSave() {
    // Stop local preview audio before saving
    if (ambientRef.current) {
      ambientRef.current.pause();
      ambientRef.current.currentTime = 0;
    }

    saveSettings(settings);
    setDirty(false);
    playUISound(SOUND_FILES.ui.settingsSaved);
    onOpenChange(false);
  }

  // Reset to defaults
  function handleReset() {
    setSettings(DEFAULTS);
    setDirty(true);
    playUISound(SOUND_FILES.ui.settingsReset);
  }

  // Preview voice
  function previewVoice() {
    const sampleText =
      "Hello! Let's explore the jungle together and discover amazing words!";
    audioService.pronounceWord(sampleText, {
      rate: settings.speechRate,
      onStart: () => playUISound(SOUND_FILES.ui.voicePreview),
    });
  }

  // Close on ESC and handle cleanup
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (open && e.key === "Escape") {
        // Stop preview audio when closing
        if (ambientRef.current) {
          ambientRef.current.pause();
          ambientRef.current.currentTime = 0;
        }
        onOpenChange(false);
      }
    }

    // Show keyboard help on F1 or ?
    function onHelp(e: KeyboardEvent) {
      if (open && (e.key === "F1" || (e.key === "?" && !e.shiftKey))) {
        e.preventDefault();
        console.log(
          "🎮 Keyboard shortcuts: Tab to navigate, Arrow keys to adjust sliders, Space/Enter to activate buttons, Esc to close",
        );
      }
    }

    window.addEventListener("keydown", onEsc);
    window.addEventListener("keydown", onHelp);
    return () => {
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("keydown", onHelp);
    };
  }, [open, onOpenChange]);

  // Handle panel close cleanup
  useEffect(() => {
    if (!open && ambientRef.current) {
      // Stop preview audio when panel is closed
      ambientRef.current.pause();
      ambientRef.current.currentTime = 0;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Jungle Adventure Settings"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className={cn(
          "relative overflow-hidden rounded-xl shadow-2xl",
          "bg-gradient-to-br from-amber-50/95 via-orange-50/95 to-yellow-50/95 backdrop-blur-lg",
          "border-2 border-orange-200/60",
          isMobile
            ? "w-[min(380px,95vw)] max-h-[75vh]"
            : "w-[min(900px,90vw)] max-h-[85vh]",
        )}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255,193,7,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(76,175,80,0.1) 0%, transparent 50%)
          `,
        }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-yellow-500 p-4 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛠️</span>
              <div>
                <h2 className="text-xl font-bold">Jungle Settings</h2>
                <p className="text-white/90 text-sm">
                  Customize your adventure
                </p>
                {!isMobile && (
                  <p className="text-white/70 text-xs mt-1">
                    💡 Use arrow keys on sliders, Tab to navigate, ? for help
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {dirty && (
                <Badge className="bg-yellow-500 text-white animate-pulse">
                  Unsaved
                </Badge>
              )}
              <button
                aria-label="Close settings"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col min-h-0">
          <ScrollArea
            className={cn(
              "flex-1 min-h-0 jungle-settings-category",
              isMobile
                ? "max-h-[calc(75vh-120px)] p-3 jungle-mobile-scrollarea jungle-mobile-main-scrollarea"
                : "max-h-[calc(85vh-100px)] p-3 jungle-settings-scrollarea",
            )}
          >
            <div
              className={cn(
                isMobile
                  ? "space-y-2"
                  : "grid grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-min",
              )}
            >
              {/* 🎵 Sound & Voice Section */}
              <SettingsSection
                title="🎵 Sound & Voice"
                icon={<Volume2 className="w-4 h-4" />}
                isMobile={isMobile}
                defaultOpen
              >
                <SettingRow
                  label="UI Sounds"
                  control={
                    <Switch
                      checked={settings.uiSounds}
                      onCheckedChange={(v) => markDirty({ uiSounds: v })}
                      className={cn(
                        isMobile ? "scale-110 touch-manipulation" : "scale-90",
                      )}
                    />
                  }
                />

                <SettingRow
                  label="Ambient Jungle"
                  control={
                    <Select
                      value={settings.ambient}
                      onValueChange={(v) =>
                        markDirty({ ambient: v as Settings["ambient"] })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          isMobile
                            ? "w-40 h-10 touch-manipulation"
                            : "w-32 h-8 text-xs",
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">🔇 Off</SelectItem>
                        <SelectItem value="birds">🐦 Birds</SelectItem>
                        <SelectItem value="rain">🌧️ Rain</SelectItem>
                        <SelectItem value="wind">🌬️ Wind</SelectItem>
                        <SelectItem value="waterfall">💧 Waterfall</SelectItem>
                        <SelectItem value="insects">🦗 Insects</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />

                <SettingRow label="Ambient Volume">
                  <EnhancedSlider
                    value={[settings.ambientVolume * 100]}
                    onValueChange={([v]) =>
                      markDirty({ ambientVolume: v / 100 })
                    }
                    max={100}
                    min={0}
                    step={5}
                    disabled={settings.ambient === "off"}
                    size="md"
                    variant="jungle"
                    tooltipFormatter={(v) => `${Math.round(v)}%`}
                    hapticFeedback={settings.haptics}
                    className="flex-1"
                  />
                </SettingRow>

                <SettingRow
                  label="Voice Character"
                  control={
                    <Select
                      value={settings.voice}
                      onValueChange={(v) =>
                        markDirty({ voice: v as Settings["voice"] })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          isMobile
                            ? "w-40 h-10 touch-manipulation"
                            : "w-32 h-8 text-xs",
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="woman">👩 Woman Guide</SelectItem>
                        <SelectItem value="man">👨 Man Guide</SelectItem>
                        <SelectItem value="child">🧒 Kid Explorer</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />

                <SettingRow
                  label="Speech Speed"
                  description={
                    settings.speechRate < 0.8
                      ? "Slower"
                      : settings.speechRate > 1.2
                        ? "Faster"
                        : "Normal"
                  }
                >
                  <EnhancedSlider
                    min={50}
                    max={150}
                    step={10}
                    value={[settings.speechRate * 100]}
                    onValueChange={([v]) => markDirty({ speechRate: v / 100 })}
                    size="md"
                    variant="jungle"
                    tooltipFormatter={(v) => `×${(v / 100).toFixed(1)}`}
                    hapticFeedback={settings.haptics}
                    className="flex-1"
                  />
                </SettingRow>

                <div className="flex gap-2 pt-1.5">
                  <Button
                    size="sm"
                    onClick={previewVoice}
                    className="flex-1 h-8 text-xs"
                  >
                    <Play className="w-3 h-3 mr-1.5" />
                    Preview
                  </Button>
                  {settings.ambient !== "off" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => markDirty({ ambient: "off" })}
                      className="h-8 text-xs"
                    >
                      <Square className="w-3 h-3 mr-1.5" />
                      Stop
                    </Button>
                  )}
                </div>
              </SettingsSection>

              {/* 🎨 Theme & Motion Section */}
              <SettingsSection
                title="🎨 Theme & Motion"
                icon={<Palette className="w-4 h-4" />}
                isMobile={isMobile}
              >
                <SettingRow
                  label="Theme"
                  control={
                    <Select
                      value={settings.theme}
                      onValueChange={(v) =>
                        markDirty({ theme: v as JungleTheme })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          isMobile
                            ? "w-40 h-10 touch-manipulation"
                            : "w-32 h-8 text-xs",
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parchment">📜 Parchment</SelectItem>
                        <SelectItem value="jungle">🌿 Jungle</SelectItem>
                        <SelectItem value="canopy">🌫️ Canopy</SelectItem>
                        <SelectItem value="river">🌊 River</SelectItem>
                        <SelectItem value="sunset">🌅 Sunset</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />

                <SettingRow
                  label="Dark Mode"
                  control={
                    <Switch
                      checked={settings.darkMode}
                      onCheckedChange={(v) => markDirty({ darkMode: v })}
                    />
                  }
                />

                <SettingRow
                  label="Reduced Motion"
                  control={
                    <Switch
                      checked={settings.reducedMotion}
                      onCheckedChange={(v) => markDirty({ reducedMotion: v })}
                    />
                  }
                />

                <SettingRow
                  label="High Contrast"
                  control={
                    <Switch
                      checked={settings.highContrast}
                      onCheckedChange={(v) => markDirty({ highContrast: v })}
                    />
                  }
                />

                {/* Overlay Effects */}
                <div className="pt-1.5 border-t border-orange-200/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span className="text-xs font-medium text-green-800">
                      Animated Overlays
                    </span>
                  </div>

                  <SettingRow
                    label="Fireflies ✨"
                    control={
                      <Switch
                        checked={settings.overlays.fireflies}
                        onCheckedChange={(v) =>
                          markDirty({
                            overlays: { ...settings.overlays, fireflies: v },
                          })
                        }
                      />
                    }
                  />

                  <SettingRow
                    label="Fog 🌫️"
                    control={
                      <Switch
                        checked={settings.overlays.fog}
                        onCheckedChange={(v) =>
                          markDirty({
                            overlays: { ...settings.overlays, fog: v },
                          })
                        }
                      />
                    }
                  />

                  <SettingRow
                    label="Glow ✨"
                    control={
                      <Switch
                        checked={settings.overlays.glow}
                        onCheckedChange={(v) =>
                          markDirty({
                            overlays: { ...settings.overlays, glow: v },
                          })
                        }
                      />
                    }
                  />

                  <SettingRow
                    label="Ripples 💧"
                    control={
                      <Switch
                        checked={settings.overlays.ripples}
                        onCheckedChange={(v) =>
                          markDirty({
                            overlays: { ...settings.overlays, ripples: v },
                          })
                        }
                      />
                    }
                  />
                </div>
              </SettingsSection>

              {/* 📚 Learning & Family Section */}
              <SettingsSection
                title="📚 Learning & Family"
                icon={<BookOpen className="w-4 h-4" />}
                isMobile={isMobile}
              >
                <SettingRow
                  label="Difficulty Level"
                  control={
                    <Select
                      value={settings.difficulty}
                      onValueChange={(v) =>
                        markDirty({ difficulty: v as Settings["difficulty"] })
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          isMobile
                            ? "w-32 h-10 touch-manipulation"
                            : "w-28 h-8 text-xs",
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">🌱 Easy</SelectItem>
                        <SelectItem value="normal">🌿 Normal</SelectItem>
                        <SelectItem value="hard">🌳 Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />

                <SettingRow label="Daily Goal">
                  <EnhancedSlider
                    min={5}
                    max={50}
                    step={5}
                    value={[settings.dailyGoal]}
                    onValueChange={([v]) => markDirty({ dailyGoal: v })}
                    size="md"
                    variant="success"
                    tooltipFormatter={(v) => `${v} cards`}
                    hapticFeedback={settings.haptics}
                    className="flex-1"
                  />
                </SettingRow>

                <SettingRow label="Time Limit">
                  <EnhancedSlider
                    min={0}
                    max={60}
                    step={5}
                    value={[settings.timeLimitMin]}
                    onValueChange={([v]) => markDirty({ timeLimitMin: v })}
                    size="md"
                    variant={
                      settings.timeLimitMin === 0 ? "default" : "warning"
                    }
                    tooltipFormatter={(v) => (v === 0 ? "Off" : `${v} min`)}
                    hapticFeedback={settings.haptics}
                    className={cn(
                      "flex-1",
                      settings.timeLimitMin === 0 && "opacity-75",
                    )}
                  />
                </SettingRow>

                <SettingRow
                  label="Parent Gate"
                  description="Require adult verification for certain actions"
                  control={
                    <Switch
                      checked={settings.parentGateEnabled}
                      onCheckedChange={(v) =>
                        markDirty({ parentGateEnabled: v })
                      }
                    />
                  }
                />
              </SettingsSection>

              {/* ♿ Accessibility Section - Mobile Only */}
              {isMobile && (
                <SettingsSection
                  title="♿ Accessibility"
                  icon={<Accessibility className="w-4 h-4" />}
                  isMobile={isMobile}
                >
                  <SettingRow label="Text Size">
                    <EnhancedSlider
                      min={90}
                      max={130}
                      step={5}
                      value={[settings.textScale * 100]}
                      onValueChange={([v]) => markDirty({ textScale: v / 100 })}
                      size="lg"
                      variant="default"
                      tooltipFormatter={(v) => `×${(v / 100).toFixed(1)}`}
                      hapticFeedback={settings.haptics}
                      className="flex-1"
                    />
                  </SettingRow>

                  <SettingRow
                    label="Haptic Feedback"
                    description="Vibration feedback on mobile devices"
                    control={
                      <Switch
                        checked={settings.haptics}
                        onCheckedChange={(v) => markDirty({ haptics: v })}
                        disabled={!hasHaptic}
                      />
                    }
                  />

                  <SettingRow
                    label="Captions & Labels"
                    description="Show additional text descriptions"
                    control={
                      <Switch
                        checked={settings.captions}
                        onCheckedChange={(v) => markDirty({ captions: v })}
                      />
                    }
                  />
                </SettingsSection>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div
            className={cn(
              "border-t bg-gradient-to-r from-amber-50/95 to-yellow-50/95",
              isMobile ? "p-3" : "px-3 py-2.5",
            )}
          >
            <div
              className={cn(
                "flex items-center",
                isMobile ? "flex-col gap-2" : "justify-between",
              )}
            >
              {isMobile ? (
                <>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex items-center gap-1 text-xs px-4 py-3 h-10 touch-manipulation"
                      size="sm"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                      className="text-xs px-4 py-3 h-10 touch-manipulation"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={!dirty}
                      onClick={handleSave}
                      className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-xs px-4 py-3 h-10 flex-1 touch-manipulation"
                      size="sm"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button
                      disabled={!dirty}
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                    >
                      <Save className="w-4 h-4" />
                      Save & Apply
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper Components
function SettingsSection({
  title,
  icon,
  children,
  isMobile,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isMobile: boolean;
  defaultOpen?: boolean;
}) {
  if (isMobile) {
    // Mobile: Keep accordion behavior with enhanced scrolling for Theme & Motion
    const isThemeAndMotion = title.includes("Theme & Motion");
    const maxHeight = isThemeAndMotion ? "max-h-80" : "max-h-60"; // Increased height for Theme & Motion

    return (
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={defaultOpen ? "item-1" : undefined}
      >
        <AccordionItem
          value="item-1"
          className="border rounded-lg bg-white/80 backdrop-blur-sm shadow-sm"
        >
          <AccordionTrigger className="px-3 py-3 hover:no-underline text-sm touch-manipulation">
            <div className="flex items-center gap-2 font-medium text-green-800">
              {icon}
              <span>{title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3">
            <ScrollArea
              className={cn(
                maxHeight,
                "pr-3 jungle-mobile-category jungle-mobile-scrollarea",
                isThemeAndMotion && "jungle-mobile-theme-motion-scrollarea",
              )}
            >
              <div className="space-y-2.5">{children}</div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  // Desktop: Show all content expanded with compact card layout
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-orange-200/50 rounded-lg shadow-sm">
      {/* Category Header - Always visible, non-clickable */}
      <div className="px-3 py-2 border-b border-orange-200/30 bg-gradient-to-r from-green-50/50 to-yellow-50/50">
        <div className="flex items-center gap-2 font-medium text-green-800 text-sm">
          {icon}
          <span>{title}</span>
        </div>
      </div>

      {/* Category Content - Always expanded */}
      <div className="px-3 py-2.5">
        <div className="space-y-2">{children}</div>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
  control,
}: {
  label: string;
  description?: string;
  children?: React.ReactNode;
  control?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-green-800">{label}</div>
        {description && (
          <div className="text-xs text-green-600 mt-0.5 leading-tight opacity-80">
            {description}
          </div>
        )}
      </div>
      <div className="flex flex-1 min-w-0 max-w-[140px]">
        {control ?? children}
      </div>
    </div>
  );
}
