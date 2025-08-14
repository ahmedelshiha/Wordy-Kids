import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MobileSwitch } from "@/components/ui/mobile-switch";
import { MobileSlider } from "@/components/ui/mobile-slider";
import { Separator } from "@/components/ui/separator";
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

interface EnhancedMobileSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnhancedMobileSettingsPanel: React.FC<EnhancedMobileSettingsPanelProps> = ({
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

  const MobileSettingRow = ({ icon: Icon, label, children, description }: any) => (
    <div className="flex items-center justify-between py-4 px-3 border-b border-slate-100 last:border-b-0 min-h-[60px] touch-target">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Icon className="w-5 h-5 text-slate-600 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-base text-slate-900 leading-tight setting-label">
            {label}
          </p>
          {description && (
            <p className="text-sm text-slate-500 line-clamp-1 leading-tight setting-description mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-3">{children}</div>
    </div>
  );

  const MobileSectionHeader = ({ title, emoji, isExpanded, onToggle }: any) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 active:bg-slate-100 transition-all duration-150 rounded-lg min-h-[56px] touch-target compact-touch-feedback"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <span className="font-semibold text-slate-900 text-base">
          {title}
        </span>
      </div>
      {isExpanded ? (
        <ChevronUp className="w-5 h-5 text-slate-500" />
      ) : (
        <ChevronDown className="w-5 h-5 text-slate-500" />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 settings-panel-mobile">
      <Card className="settings-card-mobile w-full max-w-lg mx-4 mb-4 sm:mb-0 max-h-[90vh] overflow-hidden animate-mobile-slide-in shadow-2xl rounded-3xl">
        <CardHeader className="pb-4 bg-gradient-to-br from-educational-blue via-educational-purple to-educational-pink text-white rounded-t-3xl settings-header-mobile">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">
                  Learning Settings
                </h2>
                <p className="text-sm opacity-90 mt-1">Personalize your experience</p>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 min-h-[44px] min-w-[44px] touch-target"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          {hasUnsavedChanges && (
            <div className="mt-3 p-3 bg-yellow-500/20 rounded-xl border border-yellow-300/30">
              <p className="text-sm">⚠️ You have unsaved changes</p>
            </div>
          )}
        </CardHeader>

        <ScrollArea className="max-h-[50vh] sm:max-h-[55vh] settings-content-mobile">
          <div className="p-4 space-y-2">
            {/* Audio Section */}
            <div className="border-2 rounded-xl bg-white shadow-sm">
              <MobileSectionHeader
                title="Audio & Voice"
                emoji="🔊"
                isExpanded={expandedSections.audio}
                onToggle={() => toggleSection("audio")}
              />
              {expandedSections.audio && (
                <div className="px-3 pb-4 space-y-2">
                  <MobileSettingRow
                    icon={soundOn ? Volume2 : VolumeX}
                    label="Sound Effects"
                    description="Play sounds for feedback and interactions"
                  >
                    <MobileSwitch
                      checked={soundOn}
                      onCheckedChange={(checked) => {
                        setSoundOn(checked);
                        setSoundEnabled(checked);
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                    />
                  </MobileSettingRow>

                  <MobileSettingRow
                    icon={Volume2}
                    label="Master Volume"
                    description={`Current volume: ${volume[0]}%`}
                  >
                    <div className="w-24">
                      <MobileSlider
                        value={volume}
                        onValueChange={(value) => {
                          setVolume(value);
                          setHasUnsavedChanges(true);
                          if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                        }}
                        max={100}
                        min={0}
                        step={10}
                        className="compact-slider-mobile"
                      />
                    </div>
                  </MobileSettingRow>

                  <MobileSettingRow
                    icon={Play}
                    label="Auto-pronunciation"
                    description="Automatically pronounce words when shown"
                  >
                    <MobileSwitch
                      checked={autoPlay}
                      onCheckedChange={(checked) => {
                        setAutoPlay(checked);
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                    />
                  </MobileSettingRow>

                  <div className="pt-3 px-3">
                    <p className="text-sm font-semibold text-slate-700 mb-3">
                      Voice Selection
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          type: "woman" as VoiceType,
                          emoji: "👩",
                          label: "Woman",
                        },
                        { type: "man" as VoiceType, emoji: "👨", label: "Man" },
                        { type: "kid" as VoiceType, emoji: "🧒", label: "Child" },
                      ].map((voice) => (
                        <Button
                          key={voice.type}
                          size="lg"
                          variant={
                            selectedVoiceType === voice.type
                              ? "default"
                              : "outline"
                          }
                          className={cn(
                            "h-14 text-sm min-h-[56px] touch-target voice-button flex-col gap-1 settings-option-mobile",
                            selectedVoiceType === voice.type &&
                              "bg-educational-blue hover:bg-educational-blue/90 text-white shadow-lg scale-105",
                          )}
                          onClick={() => handleVoiceTypeChange(voice.type)}
                        >
                          <span className="text-lg">{voice.emoji}</span>
                          <span className="voice-label text-xs">
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
            <div className="border-2 rounded-xl bg-white shadow-sm">
              <MobileSectionHeader
                title="Appearance"
                emoji="🎨"
                isExpanded={expandedSections.appearance}
                onToggle={() => toggleSection("appearance")}
              />
              {expandedSections.appearance && (
                <div className="px-3 pb-4 space-y-2">
                  <MobileSettingRow
                    icon={darkMode ? Moon : Sun}
                    label="Dark Mode"
                    description="Switch between light and dark themes"
                  >
                    <MobileSwitch
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
                  </MobileSettingRow>

                  <MobileSettingRow
                    icon={Type}
                    label="Large Text"
                    description="Increase text size for better readability"
                  >
                    <MobileSwitch
                      checked={largeText}
                      onCheckedChange={(checked) => {
                        setLargeText(checked);
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                    />
                  </MobileSettingRow>

                  <MobileSettingRow
                    icon={Zap}
                    label="Background Animations"
                    description="Enable floating elements and visual effects"
                  >
                    <MobileSwitch
                      checked={backgroundAnimations}
                      onCheckedChange={(checked) => {
                        setBackgroundAnimations(checked);
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                    />
                  </MobileSettingRow>
                </div>
              )}
            </div>

            {/* Learning Section */}
            <div className="border-2 rounded-xl bg-white shadow-sm">
              <MobileSectionHeader
                title="Learning Goals"
                emoji="🎯"
                isExpanded={expandedSections.learning}
                onToggle={() => toggleSection("learning")}
              />
              {expandedSections.learning && (
                <div className="px-3 pb-4 space-y-4">
                  <MobileSettingRow
                    icon={Target}
                    label="Daily Word Goal"
                    description={`Target: ${dailyGoal[0]} words per day`}
                  >
                    <Badge variant="secondary" className="text-sm px-3 py-1 font-semibold">
                      {dailyGoal[0]}
                    </Badge>
                  </MobileSettingRow>
                  <div className="px-3">
                    <MobileSlider
                      value={dailyGoal}
                      onValueChange={(value) => {
                        setDailyGoal(value);
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                      max={50}
                      min={5}
                      step={5}
                      className="w-full compact-slider-mobile"
                    />
                    <div className="flex justify-between text-sm text-slate-500 mt-2">
                      <span>5 words</span>
                      <span>50 words</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Other Section */}
            <div className="border-2 rounded-xl bg-white shadow-sm">
              <MobileSectionHeader
                title="Notifications & Feedback"
                emoji="⚙️"
                isExpanded={expandedSections.other}
                onToggle={() => toggleSection("other")}
              />
              {expandedSections.other && (
                <div className="px-3 pb-4 space-y-2">
                  <MobileSettingRow
                    icon={Bell}
                    label="Daily Reminders"
                    description="Get notifications to practice daily"
                  >
                    <MobileSwitch
                      checked={dailyReminders}
                      onCheckedChange={(checked) => {
                        setDailyReminders(checked);
                        setHasUnsavedChanges(true);
                        if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                      }}
                    />
                  </MobileSettingRow>

                  {deviceInfo.hasHaptic && (
                    <MobileSettingRow
                      icon={Vibrate}
                      label="Haptic Feedback"
                      description="Feel vibrations when interacting"
                    >
                      <MobileSwitch
                        checked={hapticFeedback}
                        onCheckedChange={(checked) => {
                          setHapticFeedback(checked);
                          setHasUnsavedChanges(true);
                          if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                        }}
                      />
                    </MobileSettingRow>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Enhanced Action Bar */}
        <div className="border-t-2 bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-b-3xl settings-footer-mobile">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              className="flex-1 h-12 text-sm min-h-[48px] touch-target border-2 hover:bg-slate-50 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Defaults
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="flex-2 bg-gradient-to-r from-educational-blue to-educational-purple hover:from-educational-blue/90 hover:to-educational-purple/90 text-white h-12 text-sm min-h-[48px] touch-target shadow-lg active:scale-95 transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
