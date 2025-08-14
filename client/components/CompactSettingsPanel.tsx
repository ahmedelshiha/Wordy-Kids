import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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

interface CompactSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompactSettingsPanel: React.FC<CompactSettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  // Essential settings only
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [selectedVoiceType, setSelectedVoiceType] = useState<VoiceType>("woman");
  const [volume, setVolume] = useState([80]);
  const [darkMode, setDarkMode] = useState(false);
  const [backgroundAnimations, setBackgroundAnimations] = useState(false);
  const [dailyGoal, setDailyGoal] = useState([10]);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(true);
  const [largeText, setLargeText] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
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
      const backgroundAnimationsSettings = localStorage.getItem("backgroundAnimations");
      setBackgroundAnimations(backgroundAnimationsSettings === "true");

      const accessibilitySettings = localStorage.getItem("accessibilitySettings");
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
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
  };

  const handleVoiceTypeChange = (voiceType: VoiceType) => {
    setSelectedVoiceType(voiceType);
    audioService.setVoiceType(voiceType);
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    // Save all settings to localStorage
    localStorage.setItem("backgroundAnimations", backgroundAnimations.toString());
    
    localStorage.setItem("accessibilitySettings", JSON.stringify({
      largeText,
      hapticFeedback,
    }));

    localStorage.setItem("learningSettings", JSON.stringify({
      dailyGoal: dailyGoal[0],
      autoPlay,
    }));

    localStorage.setItem("audioSettings", JSON.stringify({
      volume: volume[0],
    }));

    localStorage.setItem("notificationSettings", JSON.stringify({
      dailyReminders,
    }));

    // Dispatch events for components that need to know about changes
    window.dispatchEvent(new CustomEvent("backgroundAnimationsChanged", {
      detail: backgroundAnimations,
    }));
    window.dispatchEvent(new CustomEvent("accessibilityChanged", {
      detail: { largeText },
    }));

    setHasUnsavedChanges(false);
    playSoundIfEnabled();
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
  };

  if (!isOpen) return null;

  const SettingRow = ({ icon: Icon, label, children, description }: any) => (
    <div className="flex items-center justify-between py-3 px-1 border-b border-slate-100 last:border-b-0 min-h-[48px] touch-target">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon className="w-4 h-4 text-slate-600 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-slate-900 leading-tight">{label}</p>
          {description && (
            <p className="text-xs text-slate-500 line-clamp-1 leading-tight">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-2">{children}</div>
    </div>
  );

  const SectionHeader = ({ title, emoji, isExpanded, onToggle }: any) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 hover:bg-slate-50 active:bg-slate-100 transition-colors rounded-lg min-h-[44px] touch-target compact-touch-feedback"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <span className="font-medium text-slate-900 text-sm sm:text-base">{title}</span>
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
      <Card className="compact-settings-mobile w-full max-w-sm sm:max-w-md mx-2 mb-2 sm:mb-0 max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-mobile-slide-in shadow-xl rounded-2xl">
        <CardHeader className="pb-3 bg-gradient-to-r from-educational-blue to-educational-purple text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <div>
                <h2 className="text-lg font-bold">Quick Settings</h2>
                <p className="text-xs opacity-90">Essential preferences</p>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {hasUnsavedChanges && (
            <div className="mt-2 p-2 bg-yellow-500/20 rounded-lg border border-yellow-300/30">
              <p className="text-xs">⚠️ Unsaved changes</p>
            </div>
          )}
        </CardHeader>

        <ScrollArea className="max-h-[55vh] sm:max-h-[60vh]">
          <div className="p-4 space-y-1">
            {/* Audio Section */}
            <div className="border rounded-lg">
              <SectionHeader
                title="Audio"
                emoji="🔊"
                isExpanded={expandedSections.audio}
                onToggle={() => toggleSection("audio")}
              />
              {expandedSections.audio && (
                <div className="px-3 pb-3 space-y-1">
                  <SettingRow
                    icon={soundOn ? Volume2 : VolumeX}
                    label="Sound Effects"
                    description="Play sounds for feedback"
                  >
                    <Switch
                      checked={soundOn}
                      onCheckedChange={(checked) => {
                        setSoundOn(checked);
                        setSoundEnabled(checked);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </SettingRow>
                  
                  <SettingRow
                    icon={Volume2}
                    label="Volume"
                    description={`${volume[0]}%`}
                  >
                    <div className="w-20">
                      <Slider
                        value={volume}
                        onValueChange={(value) => {
                          setVolume(value);
                          setHasUnsavedChanges(true);
                        }}
                        max={100}
                        min={0}
                        step={10}
                        className="compact-slider-mobile"
                      />
                    </div>
                  </SettingRow>

                  <SettingRow
                    icon={Play}
                    label="Auto-play"
                    description="Auto pronounce words"
                  >
                    <Switch
                      checked={autoPlay}
                      onCheckedChange={(checked) => {
                        setAutoPlay(checked);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </SettingRow>

                  <div className="pt-2">
                    <p className="text-xs font-medium text-slate-700 mb-2">Voice</p>
                    <div className="flex gap-1">
                      {[
                        { type: "woman" as VoiceType, emoji: "👩", label: "Woman" },
                        { type: "man" as VoiceType, emoji: "👨", label: "Man" },
                        { type: "kid" as VoiceType, emoji: "🧒", label: "Kid" },
                      ].map((voice) => (
                        <Button
                          key={voice.type}
                          size="sm"
                          variant={selectedVoiceType === voice.type ? "default" : "outline"}
                          className={cn(
                            "flex-1 h-9 text-xs min-h-[36px] touch-target",
                            selectedVoiceType === voice.type && "bg-educational-blue"
                          )}
                          onClick={() => handleVoiceTypeChange(voice.type)}
                        >
                          <span className="mr-1">{voice.emoji}</span>
                          <span className="hidden xs:inline">{voice.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Appearance Section */}
            <div className="border rounded-lg">
              <SectionHeader
                title="Appearance"
                emoji="🎨"
                isExpanded={expandedSections.appearance}
                onToggle={() => toggleSection("appearance")}
              />
              {expandedSections.appearance && (
                <div className="px-3 pb-3 space-y-1">
                  <SettingRow
                    icon={darkMode ? Moon : Sun}
                    label="Dark Mode"
                    description="Switch to dark theme"
                  >
                    <Switch
                      checked={darkMode}
                      onCheckedChange={(checked) => {
                        setDarkMode(checked);
                        document.documentElement.classList.toggle("dark", checked);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </SettingRow>

                  <SettingRow
                    icon={Type}
                    label="Large Text"
                    description="Bigger text size"
                  >
                    <Switch
                      checked={largeText}
                      onCheckedChange={(checked) => {
                        setLargeText(checked);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </SettingRow>

                  <SettingRow
                    icon={Zap}
                    label="Animations"
                    description="Background effects"
                  >
                    <Switch
                      checked={backgroundAnimations}
                      onCheckedChange={(checked) => {
                        setBackgroundAnimations(checked);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </SettingRow>
                </div>
              )}
            </div>

            {/* Learning Section */}
            <div className="border rounded-lg">
              <SectionHeader
                title="Learning"
                emoji="🎯"
                isExpanded={expandedSections.learning}
                onToggle={() => toggleSection("learning")}
              />
              {expandedSections.learning && (
                <div className="px-3 pb-3 space-y-1">
                  <SettingRow
                    icon={Target}
                    label="Daily Goal"
                    description={`${dailyGoal[0]} words per day`}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {dailyGoal[0]}
                      </Badge>
                    </div>
                  </SettingRow>
                  <div className="px-3">
                    <Slider
                      value={dailyGoal}
                      onValueChange={(value) => {
                        setDailyGoal(value);
                        setHasUnsavedChanges(true);
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
              <SectionHeader
                title="Other"
                emoji="⚙️"
                isExpanded={expandedSections.other}
                onToggle={() => toggleSection("other")}
              />
              {expandedSections.other && (
                <div className="px-3 pb-3 space-y-1">
                  <SettingRow
                    icon={Bell}
                    label="Reminders"
                    description="Daily learning alerts"
                  >
                    <Switch
                      checked={dailyReminders}
                      onCheckedChange={(checked) => {
                        setDailyReminders(checked);
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </SettingRow>

                  {deviceInfo.hasHaptic && (
                    <SettingRow
                      icon={Vibrate}
                      label="Haptic Feedback"
                      description="Vibration on touch"
                    >
                      <Switch
                        checked={hapticFeedback}
                        onCheckedChange={(checked) => {
                          setHapticFeedback(checked);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </SettingRow>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Action Bar */}
        <div className="border-t bg-slate-50 p-3 rounded-b-2xl">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                handleResetToDefaults();
                if (deviceInfo.hasHaptic) triggerHapticFeedback("medium");
              }}
              className="flex-1 h-11 text-xs min-h-[44px] touch-target"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
            <Button
              onClick={() => {
                handleSaveSettings();
                if (deviceInfo.hasHaptic) triggerHapticFeedback("heavy");
              }}
              className="flex-1 bg-educational-blue hover:bg-educational-blue/90 text-white h-11 text-xs min-h-[44px] touch-target"
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
