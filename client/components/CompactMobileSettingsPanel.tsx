import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompactMobileSwitch } from "@/components/ui/compact-mobile-switch";
import { CompactMobileSlider } from "@/components/ui/compact-mobile-slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Target,
  Bell,
  X,
  Save,
  RotateCcw,
  Play,
  Zap,
  Type,
  Vibrate,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  setSoundEnabled,
  isSoundEnabled,
  playSoundIfEnabled,
} from "@/lib/soundEffects";
import { audioService, VoiceType } from "@/lib/audioService";
import { cn } from "@/lib/utils";
import {
  useMobileDevice,
  triggerHapticFeedback,
} from "@/hooks/use-mobile-device";

interface CompactMobileSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompactMobileSettingsPanel: React.FC<CompactMobileSettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  // Essential settings only
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [selectedVoiceType, setSelectedVoiceType] =
    useState<VoiceType>("woman");
  const [volume, setVolume] = useState([80]);
  const [darkMode, setDarkMode] = useState(false);
  const [backgroundAnimations, setBackgroundAnimations] = useState(false);
  const [dailyGoal, setDailyGoal] = useState([10]);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [largeText, setLargeText] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    audio: true,
    appearance: false,
    learning: false,
    other: false,
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const deviceInfo = useMobileDevice();

  useEffect(() => {
    // Load settings from localStorage
    setSelectedVoiceType(audioService.getVoiceType());

    const loadSettings = () => {
      const backgroundAnimationsSettings = localStorage.getItem(
        "backgroundAnimations",
      );
      setBackgroundAnimations(backgroundAnimationsSettings === "true");

      const accessibilitySettings = localStorage.getItem(
        "accessibilitySettings",
      );
      if (accessibilitySettings) {
        const settings = JSON.parse(accessibilitySettings);
        setLargeText(settings.largeText || false);
        setHapticFeedback(settings.hapticFeedback !== false);
      }

      const learningSettings = localStorage.getItem("learningSettings");
      if (learningSettings) {
        const settings = JSON.parse(learningSettings);
        setDailyGoal([settings.dailyGoal || 10]);
        setAutoPlay(settings.autoPlay !== false);
      }

      const audioSettings = localStorage.getItem("audioSettings");
      if (audioSettings) {
        const settings = JSON.parse(audioSettings);
        setVolume([settings.volume || 80]);
      }

      const notificationSettings = localStorage.getItem("notificationSettings");
      if (notificationSettings) {
        const settings = JSON.parse(notificationSettings);
        setDailyReminders(settings.dailyReminders !== false);
      }
    };

    loadSettings();
  }, [isOpen]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
    if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
  };

  const handleVoiceTypeChange = (voiceType: VoiceType) => {
    setSelectedVoiceType(voiceType);
    audioService.setVoiceType(voiceType);
    setHasUnsavedChanges(true);
    if (deviceInfo.hasHaptic) triggerHapticFeedback("medium");
  };

  const handleSaveSettings = () => {
    // Save all settings to localStorage
    localStorage.setItem(
      "backgroundAnimations",
      backgroundAnimations.toString(),
    );

    localStorage.setItem(
      "accessibilitySettings",
      JSON.stringify({
        largeText,
        hapticFeedback,
      }),
    );

    localStorage.setItem(
      "learningSettings",
      JSON.stringify({
        dailyGoal: dailyGoal[0],
        autoPlay,
      }),
    );

    localStorage.setItem(
      "audioSettings",
      JSON.stringify({
        volume: volume[0],
      }),
    );

    localStorage.setItem(
      "notificationSettings",
      JSON.stringify({
        dailyReminders,
      }),
    );

    // Dispatch events for components that need to know about changes
    window.dispatchEvent(
      new CustomEvent("backgroundAnimationsChanged", {
        detail: backgroundAnimations,
      }),
    );
    window.dispatchEvent(
      new CustomEvent("accessibilityChanged", {
        detail: { largeText },
      }),
    );

    setHasUnsavedChanges(false);
    playSoundIfEnabled.success();
    if (deviceInfo.hasHaptic) triggerHapticFeedback("heavy");
    onClose();
  };

  const handleResetToDefaults = () => {
    setSoundOn(true);
    setSoundEnabled(true);
    setSelectedVoiceType("woman");
    audioService.setVoiceType("woman");
    setVolume([80]);
    setDarkMode(false);
    setBackgroundAnimations(false);
    setDailyGoal([10]);
    setHapticFeedback(true);
    setDailyReminders(true);
    setLargeText(false);
    setAutoPlay(true);
    document.documentElement.classList.remove("dark");
    setHasUnsavedChanges(true);
    if (deviceInfo.hasHaptic) triggerHapticFeedback("medium");
  };

  if (!isOpen) return null;

  const CompactSettingRow = ({ icon: Icon, label, children, description }: any) => (
    <div className="flex items-center justify-between py-2 px-2 border-b border-slate-100 last:border-b-0 min-h-[40px]">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon className="w-4 h-4 text-slate-600 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-slate-900 leading-tight">
            {label}
          </p>
          {description && (
            <p className="text-xs text-slate-500 line-clamp-1 leading-tight">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-2">{children}</div>
    </div>
  );

  const CompactSectionHeader = ({ title, emoji, isExpanded, onToggle }: any) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-2 hover:bg-slate-50 active:bg-slate-100 transition-colors rounded-lg min-h-[36px] touch-target"
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{emoji}</span>
        <span className="font-medium text-slate-900 text-sm">
          {title}
        </span>
      </div>
      {isExpanded ? (
        <ChevronUp className="w-4 h-4 text-slate-500" />
      ) : (
        <ChevronDown className="w-4 h-4 text-slate-500" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-2">
      <Card className="w-full max-w-sm mx-2 mb-2 sm:mb-0 max-h-[85vh] overflow-hidden animate-mobile-slide-in shadow-xl rounded-2xl flex flex-col">
        <CardHeader className="pb-2 bg-gradient-to-r from-educational-blue to-educational-purple text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <div>
                <h2 className="text-base font-bold">
                  Settings
                </h2>
                <p className="text-xs opacity-90">Quick preferences</p>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg h-7 w-7"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {hasUnsavedChanges && (
            <div className="mt-1 p-2 bg-yellow-500/20 rounded-lg border border-yellow-300/30">
              <p className="text-xs">⚠️ Unsaved changes</p>
            </div>
          )}
        </CardHeader>

        <ScrollArea className="flex-1 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto scroll-smooth">
          <div className="p-2 space-y-1 min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
            {/* Audio Section */}
            <div className="border rounded-lg">
              <CompactSectionHeader
                title="Audio"
                emoji="🔊"
                isExpanded={expandedSections.audio}
                onToggle={() => toggleSection("audio")}
              />
              {expandedSections.audio && (
                <div className="px-2 pb-2 space-y-1 max-h-[40vh] overflow-y-auto">
                  <CompactSettingRow
                    icon={soundOn ? Volume2 : VolumeX}
                    label="Sound Effects"
                    description="Play sounds for feedback"
                  >
                    <CompactMobileSwitch
                      checked={soundOn}
                      onCheckedChange={(checked) => {
                        setSoundOn(checked);
                        setSoundEnabled(checked);
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                    />
                  </CompactSettingRow>

                  <CompactSettingRow
                    icon={Volume2}
                    label="Volume"
                    description={`${volume[0]}%`}
                  >
                    <div className="w-16">
                      <CompactMobileSlider
                        value={volume}
                        onValueChange={(value) => {
                          setVolume(value);
                          setHasUnsavedChanges(true);
                          if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                        }}
                        max={100}
                        min={0}
                        step={10}
                      />
                    </div>
                  </CompactSettingRow>

                  <CompactSettingRow
                    icon={Play}
                    label="Auto-play"
                    description="Auto pronounce words"
                  >
                    <CompactMobileSwitch
                      checked={autoPlay}
                      onCheckedChange={(checked) => {
                        setAutoPlay(checked);
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                    />
                  </CompactSettingRow>

                  <div className="pt-1">
                    <p className="text-xs font-medium text-slate-700 mb-1 px-1">
                      Voice
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        {
                          type: "woman" as VoiceType,
                          emoji: "👩",
                          label: "Woman",
                        },
                        { type: "man" as VoiceType, emoji: "👨", label: "Man" },
                        { type: "kid" as VoiceType, emoji: "🧒", label: "Kid" },
                      ].map((voice) => (
                        <Button
                          key={voice.type}
                          size="sm"
                          variant={
                            selectedVoiceType === voice.type
                              ? "default"
                              : "outline"
                          }
                          className={cn(
                            "h-8 text-xs px-1 min-h-[32px] flex-col gap-0",
                            selectedVoiceType === voice.type &&
                              "bg-educational-blue text-white scale-95",
                          )}
                          onClick={() => handleVoiceTypeChange(voice.type)}
                        >
                          <span className="text-xs">{voice.emoji}</span>
                          <span className="text-[10px] leading-tight">
                            {voice.label}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Appearance Section */}
            <div className="border rounded-lg">
              <CompactSectionHeader
                title="Appearance"
                emoji="🎨"
                isExpanded={expandedSections.appearance}
                onToggle={() => toggleSection("appearance")}
              />
              {expandedSections.appearance && (
                <div className="px-2 pb-2 space-y-1 max-h-[30vh] overflow-y-auto">
                  <CompactSettingRow
                    icon={darkMode ? Moon : Sun}
                    label="Dark Mode"
                    description="Switch to dark theme"
                  >
                    <CompactMobileSwitch
                      checked={darkMode}
                      onCheckedChange={(checked) => {
                        setDarkMode(checked);
                        document.documentElement.classList.toggle(
                          "dark",
                          checked,
                        );
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                    />
                  </CompactSettingRow>

                  <CompactSettingRow
                    icon={Type}
                    label="Large Text"
                    description="Bigger text size"
                  >
                    <CompactMobileSwitch
                      checked={largeText}
                      onCheckedChange={(checked) => {
                        setLargeText(checked);
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                    />
                  </CompactSettingRow>

                  <CompactSettingRow
                    icon={Zap}
                    label="Animations"
                    description="Background effects"
                  >
                    <CompactMobileSwitch
                      checked={backgroundAnimations}
                      onCheckedChange={(checked) => {
                        setBackgroundAnimations(checked);
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                    />
                  </CompactSettingRow>
                </div>
              )}
            </div>

            {/* Learning Section */}
            <div className="border rounded-lg">
              <CompactSectionHeader
                title="Learning"
                emoji="🎯"
                isExpanded={expandedSections.learning}
                onToggle={() => toggleSection("learning")}
              />
              {expandedSections.learning && (
                <div className="px-2 pb-2 space-y-2 max-h-[35vh] overflow-y-auto">
                  <CompactSettingRow
                    icon={Target}
                    label="Daily Goal"
                    description={`${dailyGoal[0]} words per day`}
                  >
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      {dailyGoal[0]}
                    </Badge>
                  </CompactSettingRow>
                  <div className="px-2">
                    <CompactMobileSlider
                      value={dailyGoal}
                      onValueChange={(value) => {
                        setDailyGoal(value);
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                      max={50}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>5</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Other Section */}
            <div className="border rounded-lg">
              <CompactSectionHeader
                title="Other"
                emoji="⚙️"
                isExpanded={expandedSections.other}
                onToggle={() => toggleSection("other")}
              />
              {expandedSections.other && (
                <div className="px-2 pb-2 space-y-1 max-h-[30vh] overflow-y-auto">
                  <CompactSettingRow
                    icon={Bell}
                    label="Reminders"
                    description="Daily learning alerts"
                  >
                    <CompactMobileSwitch
                      checked={dailyReminders}
                      onCheckedChange={(checked) => {
                        setDailyReminders(checked);
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                    />
                  </CompactSettingRow>

                  {deviceInfo.hasHaptic && (
                    <CompactSettingRow
                      icon={Vibrate}
                      label="Haptic Feedback"
                      description="Vibration on touch"
                    >
                      <CompactMobileSwitch
                        checked={hapticFeedback}
                        onCheckedChange={(checked) => {
                          setHapticFeedback(checked);
                          setHasUnsavedChanges(true);
                          if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                        }}
                      />
                    </CompactSettingRow>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Compact Action Bar */}
        <div className="border-t bg-slate-50 p-2 rounded-b-2xl">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              className="flex-1 h-9 text-xs min-h-[36px] px-2"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="flex-1 bg-educational-blue hover:bg-educational-blue/90 text-white h-9 text-xs min-h-[36px] px-2"
            >
              <Save className="w-3 h-3 mr-1" />
              Save & Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
