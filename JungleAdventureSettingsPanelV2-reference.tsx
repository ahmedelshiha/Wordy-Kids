import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { soundEffects, playSoundIfEnabled } from "@/lib/soundEffects";
import { audioService } from "@/lib/audioService";
import useMobileDevice from "@/hooks/use-mobile-device";

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

  function handleSave() {
    saveSettings(settings);
    setDirty(false);
    if (settings.uiSounds) playSoundIfEnabled(soundEffects.ui.settingsSaved);
    onOpenChange(false);
  }

  function handleReset() {
    setSettings(DEFAULTS);
    setDirty(true);
    if (settings.uiSounds) playSoundIfEnabled(soundEffects.ui.settingsReset);
  }

  function previewVoice() {
    audioService.previewVoice(settings.voice);
    if (settings.uiSounds) playSoundIfEnabled(soundEffects.ui.voicePreview);
  }

  // Close on overlay/ESC
  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

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
          "jng-panel-skin" // themed parchment + wood edges
        )}
      >
        {/* Header */}
        <CardHeader className="jng-panel-header">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <span>🛠️ Jungle Settings</span>
            {dirty && <span className="ml-2 text-xs jng-badge">Unsaved</span>}
          </CardTitle>
          <button
            aria-label="Close"
            className="jng-close"
            onClick={() => onOpenChange(false)}
          >
            ✖
          </button>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-0">
          <ScrollArea className="max-h-[calc(80vh-112px)] px-4 pb-24">
            {/* MOBILE: Accordion; DESKTOP: sections visible */}
            <div className={cn("space-y-3", isMobile ? "" : "grid grid-cols-2 gap-4")}>
              {/* 1) SOUND & VOICE */}
              <Section title="🎵 Sound & Voice" defaultOpen>
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
                        <SelectItem value="birds">Jungle Birds</SelectItem>
                        <SelectItem value="rain">Rain</SelectItem>
                        <SelectItem value="wind">Wind</SelectItem>
                        <SelectItem value="waterfall">Waterfall</SelectItem>
                        <SelectItem value="insects">Insects</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
                <Row label={`Ambient Volume ${(settings.ambientVolume * 100) | 0}%`}>
                  <Slider
                    defaultValue={[settings.ambientVolume * 100]}
                    onValueChange={([v]) => markDirty({ ambientVolume: v / 100 })}
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
                        <SelectItem value="woman">Guide (Woman)</SelectItem>
                        <SelectItem value="man">Guide (Man)</SelectItem>
                        <SelectItem value="child">Explorer (Child)</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
                <Row label={`Speech Speed ×${settings.speechRate.toFixed(1)}`}>
                  <Slider
                    min={50}
                    max={150}
                    step={5}
                    defaultValue={[settings.speechRate * 100]}
                    onValueChange={([v]) => markDirty({ speechRate: v / 100 })}
                  />
                </Row>
                <div className="flex gap-2">
                  <Button size="sm" onClick={previewVoice}>Preview Voice</Button>
                  {settings.ambient !== "off" ? (
                    <Button variant="secondary" size="sm" onClick={() => markDirty({ ambient: "off" })}>
                      Stop Ambient
                    </Button>
                  ) : null}
                </div>
              </Section>

              {/* 2) THEME & MOTION */}
              <Section title="🎨 Theme & Motion">
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
                        <SelectItem value="parchment">Parchment (Light)</SelectItem>
                        <SelectItem value="jungle">Jungle Green</SelectItem>
                        <SelectItem value="canopy">Canopy Mist</SelectItem>
                        <SelectItem value="river">River Blue</SelectItem>
                        <SelectItem value="sunset">Sunset Amber</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
                <Row label="Dark Mode">
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(v) => markDirty({ darkMode: !!v })}
                  />
                </Row>
                <Row label="Reduced Motion">
                  <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(v) => markDirty({ reducedMotion: !!v })}
                  />
                </Row>
                <Row label="High Contrast">
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(v) => markDirty({ highContrast: !!v })}
                  />
                </Row>
              </Section>

              {/* 3) LEARNING & FAMILY */}
              <Section title="📚 Learning & Family">
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
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
                <Row label={`Daily Goal: ${settings.dailyGoal} cards`}>
                  <Slider
                    min={5} max={50} step={5}
                    defaultValue={[settings.dailyGoal]}
                    onValueChange={([v]) => markDirty({ dailyGoal: v })}
                  />
                </Row>
                <Row label={`Time Limit: ${settings.timeLimitMin === 0 ? "Off" : settings.timeLimitMin + " min"}`}>
                  <Slider
                    min={0} max={60} step={5}
                    defaultValue={[settings.timeLimitMin]}
                    onValueChange={([v]) => markDirty({ timeLimitMin: v })}
                  />
                </Row>
                <Row label="Parent Gate">
                  <Switch
                    checked={settings.parentGateEnabled}
                    onCheckedChange={(v) => markDirty({ parentGateEnabled: !!v })}
                  />
                </Row>
              </Section>

              {/* 4) ACCESSIBILITY */}
              <Section title="♿ Accessibility">
                <Row label={`Text Size ×${settings.textScale.toFixed(1)}`}>
                  <Slider
                    min={90} max={130} step={5}
                    defaultValue={[settings.textScale * 100]}
                    onValueChange={([v]) => markDirty({ textScale: v / 100 })}
                  />
                </Row>
                <Row label="Haptics (mobile)">
                  <Switch
                    checked={settings.haptics}
                    onCheckedChange={(v) => markDirty({ haptics: !!v })}
                  />
                </Row>
                <Row label="Captions / Labels">
                  <Switch
                    checked={settings.captions}
                    onCheckedChange={(v) => markDirty({ captions: !!v })}
                  />
                </Row>
              </Section>
            </div>
          </ScrollArea>

          {/* Sticky Footer */}
          <div className="jng-panel-footer">
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleReset}>Reset</Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
              <Button disabled={!dirty} onClick={handleSave}>
                Save & Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </motion.div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  // auto-collapsing accordion on mobile
  const isMobile = useMobileDevice().isMobile;
  if (isMobile) {
    return (
      <details className="jng-accordion" open={defaultOpen}>
        <summary className="jng-accordion-summary">{title}</summary>
        <div className="jng-accordion-body">{children}</div>
      </details>
    );
  }
  return (
    <Card className="jng-card">
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
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
    <div className="jng-row">
      <div className="jng-row-label">{label}</div>
      <div className="jng-row-control">
        {control ?? children}
      </div>
    </div>
  );
}
