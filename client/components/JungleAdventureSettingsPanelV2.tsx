import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { X, Play, Square, RotateCcw, Save } from "lucide-react";
import {
  setSoundEnabled,
  isSoundEnabled,
  setUIInteractionSoundsEnabled,
  isUIInteractionSoundsEnabled,
} from "@/lib/soundEffects";
import { audioService, VoiceType } from "@/lib/audioService";
import { useMobileDevice, triggerHapticFeedback } from "@/hooks/use-mobile-device";
import "@/styles/jungle-adventure-settings.css";

type Settings = {
  uiSounds: boolean;
  ambient: keyof typeof soundEffects.ambient | "off";
  ambientVolume: number; // 0..1
  voice: "woman" | "man" | "child";
  speechRate: number; // 0.5..1.5

  theme: "jungle" | "canopy" | "parchment" | "river" | "sunset";
  darkMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;

  difficulty: "easy" | "normal" | "hard";
  dailyGoal: number; // cards per day
  timeLimitMin: number; // 0=off
  parentGateEnabled: boolean;

  textScale: number; // 0.9..1.3
  haptics: boolean;
  captions: boolean;
};

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
  difficulty: "normal",
  dailyGoal: 10,
  timeLimitMin: 0,
  parentGateEnabled: true,
  textScale: 1.0,
  haptics: true,
  captions: true,
};

const STORAGE_KEY = "jungleAdventureSettings";

// Define sound effects with proper ambient sounds mapping
const soundEffects = {
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
  }
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(s: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  // apply side-effects
  document.documentElement.style.setProperty("--jng-text-scale", String(s.textScale));
  document.documentElement.classList.toggle("dark", !!s.darkMode);
  document.documentElement.classList.toggle("hc", !!s.highContrast);
  if (s.reducedMotion) document.documentElement.classList.add("reduce-motion");
  else document.documentElement.classList.remove("reduce-motion");
  // theme hook (light, parchment woods)
  document.documentElement.setAttribute("data-jungle-theme", s.theme);
  
  // Apply sound settings
  setSoundEnabled(s.uiSounds);
  setUIInteractionSoundsEnabled(s.uiSounds);
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export default function JungleAdventureSettingsPanelV2({ open, onOpenChange }: Props) {
  const { isMobile, hasHaptic, prefersReducedMotion } = useMobileDevice();
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [dirty, setDirty] = useState(false);
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  // Init side effects on mount
  useEffect(() => {
    saveSettings(settings);
    // ensure single ambient element reused
    ambientRef.current = new Audio();
    ambientRef.current.loop = true;
    ambientRef.current.preload = "auto";
    return () => {
      stopAmbient();
    };
    // eslint-disable-next-line
  }, []);

  // Apply ambient changes
  useEffect(() => {
    if (!ambientRef.current) return;
    if (settings.ambient === "off") {
      stopAmbient();
      return;
    }
    const src = soundEffects.ambient[settings.ambient];
    startAmbient(src, settings.ambientVolume);
  }, [settings.ambient]);

  // Apply ambient volume changes live
  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.volume = clamp(settings.ambientVolume, 0, 1);
    }
  }, [settings.ambientVolume]);

  // Apply reduced motion preference (panel-controlled overrides system)
  useEffect(() => {
    if (settings.reducedMotion || prefersReducedMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, [settings.reducedMotion, prefersReducedMotion]);

  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  function startAmbient(src: string, vol: number) {
    if (!ambientRef.current) return;
    if (ambientRef.current.src !== location.origin + src) {
      ambientRef.current.src = src;
    }
    ambientRef.current.volume = clamp(vol, 0, 1);
    ambientRef.current
      .play()
      .catch(() => {
        // Autoplay block – will start on first tap
        // no-op
      });
  }
  
  function stopAmbient() {
    if (!ambientRef.current) return;
    ambientRef.current.pause();
    ambientRef.current.currentTime = 0;
  }

  function hapticTap() {
    if (settings.haptics && hasHaptic && "vibrate" in navigator) {
      navigator.vibrate?.(10);
    }
  }

  function markDirty(next: Partial<Settings>) {
    setSettings((s) => ({ ...s, ...next }));
    setDirty(true);
    hapticTap();
  }

  // Helper to play sound files
  function playSound(src: string, volume: number = 1.0) {
    if (!settings.uiSounds) return;
    try {
      const audio = new Audio(src);
      audio.volume = Math.max(0, Math.min(1, volume));
      audio.play().catch(() => {
        // Autoplay might be blocked, ignore error
      });
    } catch (error) {
      console.warn('Could not play sound:', src, error);
    }
  }

  function handleSave() {
    saveSettings(settings);
    setDirty(false);
    playSound(soundEffects.ui.settingsSaved);
    onOpenChange(false);
  }

  function handleReset() {
    setSettings(DEFAULTS);
    setDirty(true);
    playSound(soundEffects.ui.settingsReset);
  }

  function previewVoice() {
    const sampleText = "Hello! Let's explore the jungle together and discover amazing words!";
    audioService.pronounceWord(sampleText, {
      onStart: () => {
        playSound(soundEffects.ui.voicePreview);
      }
    });
  }

  // Close on overlay/ESC
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Jungle Adventure Settings"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className={cn(
          "relative w-[min(720px,92vw)] max-h-[80vh] overflow-hidden rounded-2xl shadow-xl",
          "bg-gradient-to-br from-orange-50/95 via-yellow-50/95 to-green-50/95 backdrop-blur-lg",
          "border border-green-200/50"
        )}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-yellow-500 p-6 text-white">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛠️</span>
              <div>
                <h2 className="text-2xl font-bold">Jungle Settings</h2>
                <p className="text-white/90 mt-1 text-sm">
                  Customize your adventure experience
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {dirty && (
                <Badge className="bg-yellow-500 text-white animate-pulse shadow-lg">
                  Unsaved
                </Badge>
              )}
              <button
                aria-label="Close"
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-0">
          <ScrollArea className="max-h-[calc(80vh-112px)] px-4 pb-24">
            {/* MOBILE: Accordion; DESKTOP: sections visible */}
            <div className={cn("space-y-4 py-4", isMobile ? "" : "grid grid-cols-2 gap-4")}>
              {/* 1) SOUND & VOICE */}
              <Section title="🎵 Sound & Voice" isMobile={isMobile} defaultOpen>
                <Row
                  label="UI Sounds"
                  control={
                    <Switch
                      checked={settings.uiSounds}
                      onCheckedChange={(v) => markDirty({ uiSounds: !!v })}
                    />
                  }
                />
                <Row
                  label="Ambient Jungle"
                  control={
                    <Select
                      value={settings.ambient}
                      onValueChange={(val) =>
                        markDirty({ ambient: val as Settings["ambient"] })
                      }
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Off" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">Off</SelectItem>
                        <SelectItem value="birds">🐦 Jungle Birds</SelectItem>
                        <SelectItem value="rain">🌧️ Rain</SelectItem>
                        <SelectItem value="wind">🌬️ Wind</SelectItem>
                        <SelectItem value="waterfall">💧 Waterfall</SelectItem>
                        <SelectItem value="insects">🦗 Insects</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
                <Row label={`Ambient Volume ${Math.round(settings.ambientVolume * 100)}%`}>
                  <Slider
                    value={[settings.ambientVolume * 100]}
                    onValueChange={([v]) => markDirty({ ambientVolume: v / 100 })}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                </Row>
                <Row
                  label="Voice"
                  control={
                    <Select
                      value={settings.voice}
                      onValueChange={(v) => markDirty({ voice: v as Settings["voice"] })}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Voice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="woman">👩 Guide (Woman)</SelectItem>
                        <SelectItem value="man">👨 Guide (Man)</SelectItem>
                        <SelectItem value="child">🧒 Explorer (Child)</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
                <Row label={`Speech Speed ×${settings.speechRate.toFixed(1)}`}>
                  <Slider
                    min={50}
                    max={150}
                    step={5}
                    value={[settings.speechRate * 100]}
                    onValueChange={([v]) => markDirty({ speechRate: v / 100 })}
                    className="flex-1"
                  />
                </Row>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={previewVoice} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Preview Voice
                  </Button>
                  {settings.ambient !== "off" && (
                    <Button variant="secondary" size="sm" onClick={() => markDirty({ ambient: "off" })}>
                      <Square className="w-4 h-4 mr-2" />
                      Stop Ambient
                    </Button>
                  )}
                </div>
              </Section>

              {/* 2) THEME & MOTION */}
              <Section title="🎨 Theme & Motion" isMobile={isMobile}>
                <Row
                  label="Theme"
                  control={
                    <Select
                      value={settings.theme}
                      onValueChange={(v) => markDirty({ theme: v as Settings["theme"] })}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue placeholder="Theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parchment">📜 Parchment (Light)</SelectItem>
                        <SelectItem value="jungle">🌿 Jungle Green</SelectItem>
                        <SelectItem value="canopy">🌫️ Canopy Mist</SelectItem>
                        <SelectItem value="river">🌊 River Blue</SelectItem>
                        <SelectItem value="sunset">🌅 Sunset Amber</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
                <Row
                  label="Dark Mode"
                  control={
                    <Switch
                      checked={settings.darkMode}
                      onCheckedChange={(v) => markDirty({ darkMode: !!v })}
                    />
                  }
                />
                <Row
                  label="Reduced Motion"
                  control={
                    <Switch
                      checked={settings.reducedMotion}
                      onCheckedChange={(v) => markDirty({ reducedMotion: !!v })}
                    />
                  }
                />
                <Row
                  label="High Contrast"
                  control={
                    <Switch
                      checked={settings.highContrast}
                      onCheckedChange={(v) => markDirty({ highContrast: !!v })}
                    />
                  }
                />
              </Section>

              {/* 3) LEARNING & FAMILY */}
              <Section title="📚 Learning & Family" isMobile={isMobile}>
                <Row
                  label="Difficulty"
                  control={
                    <Select
                      value={settings.difficulty}
                      onValueChange={(v) => markDirty({ difficulty: v as Settings["difficulty"] })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">🌱 Easy</SelectItem>
                        <SelectItem value="normal">🌿 Normal</SelectItem>
                        <SelectItem value="hard">🌳 Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
                <Row label={`Daily Goal: ${settings.dailyGoal} cards`}>
                  <Slider
                    min={5} max={50} step={5}
                    value={[settings.dailyGoal]}
                    onValueChange={([v]) => markDirty({ dailyGoal: v })}
                    className="flex-1"
                  />
                </Row>
                <Row label={`Time Limit: ${settings.timeLimitMin === 0 ? "Off" : settings.timeLimitMin + " min"}`}>
                  <Slider
                    min={0} max={60} step={5}
                    value={[settings.timeLimitMin]}
                    onValueChange={([v]) => markDirty({ timeLimitMin: v })}
                    className="flex-1"
                  />
                </Row>
                <Row
                  label="Parent Gate"
                  control={
                    <Switch
                      checked={settings.parentGateEnabled}
                      onCheckedChange={(v) => markDirty({ parentGateEnabled: !!v })}
                    />
                  }
                />
              </Section>

              {/* 4) ACCESSIBILITY */}
              <Section title="♿ Accessibility" isMobile={isMobile}>
                <Row label={`Text Size ×${settings.textScale.toFixed(1)}`}>
                  <Slider
                    min={90} max={130} step={5}
                    value={[settings.textScale * 100]}
                    onValueChange={([v]) => markDirty({ textScale: v / 100 })}
                    className="flex-1"
                  />
                </Row>
                <Row
                  label="Haptics (mobile)"
                  control={
                    <Switch
                      checked={settings.haptics}
                      onCheckedChange={(v) => markDirty({ haptics: !!v })}
                    />
                  }
                />
                <Row
                  label="Captions / Labels"
                  control={
                    <Switch
                      checked={settings.captions}
                      onCheckedChange={(v) => markDirty({ captions: !!v })}
                    />
                  }
                />
              </Section>
            </div>
          </ScrollArea>

          {/* Sticky Footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-orange-50/95 to-green-50/95 border-t border-green-200/50 backdrop-blur-sm p-4">
            <div className="flex justify-between items-center">
              <Button variant="secondary" onClick={handleReset} className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button disabled={!dirty} onClick={handleSave} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save & Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Section({ title, children, isMobile, defaultOpen = false }: { title: string; children: React.ReactNode; isMobile: boolean; defaultOpen?: boolean }) {
  // auto-collapsing accordion on mobile
  if (isMobile) {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border rounded-lg bg-white/60 backdrop-blur-sm">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="font-medium text-green-800">{title}</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3">{children}</div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-green-200/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-green-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">{children}</CardContent>
    </Card>
  );
}

function Row({
  label,
  children,
  control,
}: {
  label: string;
  children?: React.ReactNode;
  control?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm font-medium text-green-800 min-w-0 flex-1">{label}</div>
      <div className="flex-shrink-0">
        {control ?? children}
      </div>
    </div>
  );
}
