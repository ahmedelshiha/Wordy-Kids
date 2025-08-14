import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings,
  Volume2,
  VolumeX,
  Palette,
  Clock,
  Target,
  User,
  Moon,
  Sun,
  Mic,
  Play,
  Shield,
  Bell,
  Eye,
  Zap,
  X,
  Check,
  RotateCcw,
  Save,
  Vibrate,
  MousePointer,
  Type,
  Languages,
  Heart,
  Star,
  Award,
  TrendingUp,
  Calendar,
  Clock4,
  MessageCircle,
  Download,
  Upload,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import {
  setSoundEnabled,
  isSoundEnabled,
  playSoundIfEnabled,
} from "@/lib/soundEffects";
import { audioService, VoiceType } from "@/lib/audioService";
import { cn } from "@/lib/utils";
import { useMobileDevice, triggerHapticFeedback } from "@/hooks/use-mobile-device";

interface EnhancedSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnhancedSettingsPanel: React.FC<EnhancedSettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  // Audio settings
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [selectedVoiceType, setSelectedVoiceType] = useState<VoiceType>("woman");
  const [speechRate, setSpeechRate] = useState([1]);
  const [volume, setVolume] = useState([80]);
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);

  // Appearance settings
  const [darkMode, setDarkMode] = useState(false);
  const [backgroundAnimations, setBackgroundAnimations] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([1]);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Learning settings
  const [dailyGoal, setDailyGoal] = useState([10]);
  const [difficulty, setDifficulty] = useState("medium");
  const [autoPlay, setAutoPlay] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [repeatOnMistake, setRepeatOnMistake] = useState(true);

  // Accessibility settings
  const [screenReader, setScreenReader] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [focusIndicators, setFocusIndicators] = useState(true);

  // Notification settings
  const [dailyReminders, setDailyReminders] = useState(true);
  const [achievementNotifications, setAchievementNotifications] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);

  // Profile settings
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("auto");

  // Mobile-specific states
  const [activeTab, setActiveTab] = useState("audio");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mobile device detection
  const deviceInfo = useMobileDevice();

  useEffect(() => {
    // Initialize settings from localStorage and audio service
    setSelectedVoiceType(audioService.getVoiceType());
    const voices = audioService.getAvailableVoices();
    setAvailableVoices(voices);

    // Load settings from localStorage
    const loadSettings = () => {
      const backgroundAnimationsSettings = localStorage.getItem("backgroundAnimations");
      setBackgroundAnimations(backgroundAnimationsSettings === "true");

      const accessibilitySettings = localStorage.getItem("accessibilitySettings");
      if (accessibilitySettings) {
        const settings = JSON.parse(accessibilitySettings);
        setHighContrast(settings.highContrast || false);
        setLargeText(settings.largeText || false);
        setReducedMotion(settings.reducedMotion || false);
      }

      const learningSettings = localStorage.getItem("learningSettings");
      if (learningSettings) {
        const settings = JSON.parse(learningSettings);
        setDailyGoal([settings.dailyGoal || 10]);
        setDifficulty(settings.difficulty || "medium");
        setAutoPlay(settings.autoPlay !== false);
        setShowHints(settings.showHints !== false);
        setRepeatOnMistake(settings.repeatOnMistake !== false);
      }

      const audioSettings = localStorage.getItem("audioSettings");
      if (audioSettings) {
        const settings = JSON.parse(audioSettings);
        setSpeechRate([settings.speechRate || 1]);
        setVolume([settings.volume || 80]);
      }
    };

    loadSettings();
  }, [isOpen]);

  const handleVoiceTypeChange = (voiceType: VoiceType) => {
    setSelectedVoiceType(voiceType);
    audioService.setVoiceType(voiceType);
    setHasUnsavedChanges(true);
  };

  const handleVoicePreview = (voiceType: VoiceType) => {
    const previewTexts = {
      woman: "Hi there! I'm a friendly woman's voice. I love helping you learn new words!",
      man: "Hello! I'm a man's voice. Let's discover some amazing vocabulary together!",
      kid: "Hey! I'm a fun kid's voice. Learning words is super exciting!",
    };
    audioService.previewVoice(voiceType, previewTexts[voiceType]);
  };

  const handleSaveSettings = () => {
    // Save all settings to localStorage
    localStorage.setItem("backgroundAnimations", backgroundAnimations.toString());
    
    localStorage.setItem("accessibilitySettings", JSON.stringify({
      highContrast,
      largeText,
      reducedMotion,
      screenReader,
      keyboardNavigation,
      hapticFeedback,
      focusIndicators,
    }));

    localStorage.setItem("learningSettings", JSON.stringify({
      dailyGoal: dailyGoal[0],
      difficulty,
      autoPlay,
      showHints,
      repeatOnMistake,
    }));

    localStorage.setItem("audioSettings", JSON.stringify({
      speechRate: speechRate[0],
      volume: volume[0],
    }));

    localStorage.setItem("notificationSettings", JSON.stringify({
      dailyReminders,
      achievementNotifications,
      streakReminders,
    }));

    // Dispatch events for components that need to know about changes
    window.dispatchEvent(new CustomEvent("backgroundAnimationsChanged", { detail: backgroundAnimations }));
    window.dispatchEvent(new CustomEvent("accessibilityChanged", { 
      detail: { highContrast, largeText, reducedMotion }
    }));

    setHasUnsavedChanges(false);
    playSoundIfEnabled();
    onClose();
  };

  const handleResetToDefaults = () => {
    // Reset all settings to defaults
    setSoundOn(true);
    setSoundEnabled(true);
    setSelectedVoiceType("woman");
    audioService.setVoiceType("woman");
    setSpeechRate([1]);
    setVolume([80]);
    
    setDarkMode(false);
    setBackgroundAnimations(false);
    setAnimationSpeed([1]);
    setHighContrast(false);
    setLargeText(false);
    setReducedMotion(false);
    
    setDailyGoal([10]);
    setDifficulty("medium");
    setAutoPlay(true);
    setShowHints(true);
    setRepeatOnMistake(true);
    
    setScreenReader(false);
    setKeyboardNavigation(false);
    setHapticFeedback(true);
    setFocusIndicators(true);
    
    setDailyReminders(true);
    setAchievementNotifications(true);
    setStreakReminders(true);
    
    document.documentElement.classList.remove("dark");
    setHasUnsavedChanges(true);
  };

  const difficultyLevels = [
    { value: "easy", label: "Easy", color: "bg-educational-green", emoji: "🟢" },
    { value: "medium", label: "Medium", color: "bg-educational-orange", emoji: "🟡" },
    { value: "hard", label: "Hard", color: "bg-educational-pink", emoji: "🔴" },
  ];

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
  ];

  if (!isOpen) return null;

  return (
    <div className="settings-panel-mobile fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <Card className="settings-card-mobile w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-mobile-slide-in shadow-2xl">
        <CardHeader className="settings-header-mobile pb-4 bg-gradient-to-r from-educational-blue to-educational-purple text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Settings & Preferences</h2>
                <p className="text-sm opacity-90">Customize your learning experience</p>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {hasUnsavedChanges && (
            <div className="mt-3 p-2 bg-yellow-500/20 rounded-lg border border-yellow-300/30">
              <p className="text-sm flex items-center gap-2">
                <Clock4 className="w-4 h-4" />
                You have unsaved changes
              </p>
            </div>
          )}
        </CardHeader>

        <div className={cn(
          "flex h-full",
          deviceInfo.isMobile ? "flex-col" : "md:flex-row"
        )}>
          {/* Mobile Tabs - Horizontal scrolling on mobile */}
          <div className="md:hidden">
            <ScrollArea className="w-full">
              <div className="flex gap-2 p-4 border-b">
                {[
                  { id: "audio", label: "Audio", icon: Volume2, emoji: "🔊" },
                  { id: "appearance", label: "Appearance", icon: Palette, emoji: "🎨" },
                  { id: "learning", label: "Learning", icon: Target, emoji: "🎯" },
                  { id: "accessibility", label: "Access", icon: Eye, emoji: "♿" },
                  { id: "notifications", label: "Alerts", icon: Bell, emoji: "🔔" },
                  { id: "profile", label: "Profile", icon: User, emoji: "👤" },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                    }}
                    className={cn(
                      "settings-tab-mobile flex-shrink-0 min-w-[80px] h-12 flex flex-col gap-1 text-xs",
                      activeTab === tab.id && "bg-educational-blue text-white shadow-lg"
                    )}
                  >
                    <span className="text-base">{tab.emoji}</span>
                    <span className="font-medium">{tab.label}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 border-r bg-slate-50">
            <nav className="p-4 space-y-2">
              {[
                { id: "audio", label: "Audio Settings", icon: Volume2, emoji: "🔊" },
                { id: "appearance", label: "Appearance", icon: Palette, emoji: "🎨" },
                { id: "learning", label: "Learning", icon: Target, emoji: "🎯" },
                { id: "accessibility", label: "Accessibility", icon: Eye, emoji: "♿" },
                { id: "notifications", label: "Notifications", icon: Bell, emoji: "🔔" },
                { id: "profile", label: "Profile", icon: User, emoji: "👤" },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                  }}
                  className={cn(
                    "w-full justify-start gap-3 h-12",
                    activeTab === tab.id && "bg-educational-blue text-white shadow-lg"
                  )}
                >
                  <span className="text-lg">{tab.emoji}</span>
                  <span className="font-medium">{tab.label}</span>
                </Button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <ScrollArea className="flex-1 h-[60vh] md:h-[70vh]">
            <div className="settings-content-mobile p-4 md:p-6 space-y-6">
              {/* Audio Settings */}
              {activeTab === "audio" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Volume2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Audio Settings</h3>
                  </div>

                  {/* Sound Effects Toggle */}
                  <Card className="settings-option-mobile p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {soundOn ? (
                          <Volume2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">Sound Effects</p>
                          <p className="text-sm text-slate-600">Play sounds for interactions and feedback</p>
                        </div>
                      </div>
                      <Switch
                        className="settings-switch-mobile"
                        checked={soundOn}
                        onCheckedChange={(checked) => {
                          setSoundOn(checked);
                          setSoundEnabled(checked);
                          setHasUnsavedChanges(true);
                          if (deviceInfo.hasHaptic) triggerHapticFeedback("medium");
                        }}
                      />
                    </div>
                  </Card>

                  {/* Volume Control */}
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          Volume Level
                        </p>
                        <Badge variant="outline">{volume[0]}%</Badge>
                      </div>
                      <Slider
                        value={volume}
                        onValueChange={(value) => {
                          setVolume(value);
                          setHasUnsavedChanges(true);
                        }}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>🔇 Silent</span>
                        <span>🔊 Loud</span>
                      </div>
                    </div>
                  </Card>

                  {/* Speech Rate */}
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Speech Rate
                        </p>
                        <Badge variant="outline">{speechRate[0]}x</Badge>
                      </div>
                      <Slider
                        value={speechRate}
                        onValueChange={(value) => {
                          setSpeechRate(value);
                          setHasUnsavedChanges(true);
                        }}
                        max={2}
                        min={0.5}
                        step={0.25}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>🐌 Slow</span>
                        <span>🚀 Fast</span>
                      </div>
                    </div>
                  </Card>

                  {/* Voice Selection */}
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        <p className="font-medium">Pronunciation Voice</p>
                      </div>
                      <p className="text-sm text-slate-600">Choose your preferred voice for word pronunciation</p>

                      <div className="grid gap-3">
                        {[
                          { type: "woman" as VoiceType, label: "Woman Voice", emoji: "👩", description: "Friendly female voice" },
                          { type: "man" as VoiceType, label: "Man Voice", emoji: "👨", description: "Strong male voice" },
                          { type: "kid" as VoiceType, label: "Kid Voice", emoji: "🧒", description: "Fun child-like voice" },
                        ].map((voice) => {
                          const isAvailable = availableVoices.find((v) => v.type === voice.type)?.available ?? true;
                          const isSelected = selectedVoiceType === voice.type;

                          return (
                            <div
                              key={voice.type}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                                isSelected
                                  ? "border-educational-blue bg-educational-blue/10 shadow-md"
                                  : "border-slate-200 hover:border-slate-300 hover:shadow-sm",
                                !isAvailable && "opacity-50 cursor-not-allowed"
                              )}
                              onClick={() => isAvailable && handleVoiceTypeChange(voice.type)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{voice.emoji}</span>
                                <div>
                                  <p className={cn("font-medium", isSelected && "text-educational-blue")}>
                                    {voice.label}
                                  </p>
                                  <p className="text-sm text-slate-600">{voice.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isSelected && (
                                  <Badge className="bg-educational-blue text-white">Selected</Badge>
                                )}
                                {isAvailable && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVoicePreview(voice.type);
                                    }}
                                    className="flex items-center gap-1 hover:bg-blue-50"
                                  >
                                    <Play className="w-3 h-3" />
                                    Preview
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === "appearance" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-xl">
                      <Palette className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Appearance</h3>
                  </div>

                  {/* Theme Settings */}
                  <Card className="p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Theme Settings
                      </h4>
                      
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            <div>
                              <p className="font-medium">Dark Mode</p>
                              <p className="text-sm text-slate-600">Switch to dark theme</p>
                            </div>
                          </div>
                          <Switch
                            checked={darkMode}
                            onCheckedChange={(checked) => {
                              setDarkMode(checked);
                              document.documentElement.classList.toggle("dark", checked);
                              setHasUnsavedChanges(true);
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Eye className="w-5 h-5" />
                            <div>
                              <p className="font-medium">High Contrast</p>
                              <p className="text-sm text-slate-600">Enhance text visibility</p>
                            </div>
                          </div>
                          <Switch
                            checked={highContrast}
                            onCheckedChange={(checked) => {
                              setHighContrast(checked);
                              setHasUnsavedChanges(true);
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Type className="w-5 h-5" />
                            <div>
                              <p className="font-medium">Large Text</p>
                              <p className="text-sm text-slate-600">Increase text size for better readability</p>
                            </div>
                          </div>
                          <Switch
                            checked={largeText}
                            onCheckedChange={(checked) => {
                              setLargeText(checked);
                              setHasUnsavedChanges(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Animation Settings */}
                  <Card className="p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Animation Settings
                      </h4>

                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">Background Animations</p>
                          <p className="text-sm text-slate-600">Show floating elements and bubbles</p>
                        </div>
                        <Switch
                          checked={backgroundAnimations}
                          onCheckedChange={(checked) => {
                            setBackgroundAnimations(checked);
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">Reduce Motion</p>
                          <p className="text-sm text-slate-600">Minimize animations for sensitive users</p>
                        </div>
                        <Switch
                          checked={reducedMotion}
                          onCheckedChange={(checked) => {
                            setReducedMotion(checked);
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Animation Speed</p>
                          <Badge variant="outline">{animationSpeed[0]}x</Badge>
                        </div>
                        <Slider
                          value={animationSpeed}
                          onValueChange={(value) => {
                            setAnimationSpeed(value);
                            setHasUnsavedChanges(true);
                          }}
                          max={2}
                          min={0.5}
                          step={0.25}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>🐌 Slower</span>
                          <span>🚀 Faster</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Learning Settings */}
              {activeTab === "learning" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Learning Preferences</h3>
                  </div>

                  {/* Daily Goal */}
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-medium flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Daily Goal
                        </p>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {dailyGoal[0]} words
                        </Badge>
                      </div>
                      <Slider
                        value={dailyGoal}
                        onValueChange={(value) => {
                          setDailyGoal(value);
                          setHasUnsavedChanges(true);
                        }}
                        max={100}
                        min={5}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>5 words</span>
                        <span>100 words</span>
                      </div>
                    </div>
                  </Card>

                  {/* Difficulty Level */}
                  <Card className="p-4">
                    <div className="space-y-3">
                      <p className="font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Preferred Difficulty
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {difficultyLevels.map((level) => (
                          <Button
                            key={level.value}
                            variant={difficulty === level.value ? "default" : "outline"}
                            className={cn(
                              "h-14 flex flex-col gap-1",
                              difficulty === level.value && `${level.color} text-white shadow-lg`
                            )}
                            onClick={() => {
                              setDifficulty(level.value);
                              setHasUnsavedChanges(true);
                            }}
                          >
                            <span className="text-lg">{level.emoji}</span>
                            <span className="text-sm font-medium">{level.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Learning Features */}
                  <Card className="p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Learning Features
                      </h4>
                      
                      <div className="grid gap-3">
                        {[
                          {
                            id: "autoPlay",
                            label: "Auto-play Audio",
                            description: "Automatically pronounce words when shown",
                            checked: autoPlay,
                            onChange: setAutoPlay,
                            icon: Play,
                          },
                          {
                            id: "showHints",
                            label: "Show Hints",
                            description: "Display helpful clues and tips",
                            checked: showHints,
                            onChange: setShowHints,
                            icon: MessageCircle,
                          },
                          {
                            id: "repeatOnMistake",
                            label: "Repeat on Mistake",
                            description: "Replay audio when you get an answer wrong",
                            checked: repeatOnMistake,
                            onChange: setRepeatOnMistake,
                            icon: RotateCcw,
                          },
                        ].map((feature) => (
                          <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <feature.icon className="w-5 h-5" />
                              <div>
                                <p className="font-medium">{feature.label}</p>
                                <p className="text-sm text-slate-600">{feature.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={feature.checked}
                              onCheckedChange={(checked) => {
                                feature.onChange(checked);
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Accessibility Settings */}
              {activeTab === "accessibility" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 rounded-xl">
                      <Eye className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Accessibility</h3>
                  </div>

                  <Card className="p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Accessibility Features
                      </h4>
                      
                      <div className="grid gap-3">
                        {[
                          {
                            id: "screenReader",
                            label: "Screen Reader Support",
                            description: "Enhanced support for screen readers",
                            checked: screenReader,
                            onChange: setScreenReader,
                            icon: Volume2,
                          },
                          {
                            id: "keyboardNavigation",
                            label: "Keyboard Navigation",
                            description: "Navigate using keyboard shortcuts",
                            checked: keyboardNavigation,
                            onChange: setKeyboardNavigation,
                            icon: MousePointer,
                          },
                          {
                            id: "hapticFeedback",
                            label: "Haptic Feedback",
                            description: "Vibration feedback on mobile devices",
                            checked: hapticFeedback,
                            onChange: setHapticFeedback,
                            icon: Vibrate,
                          },
                          {
                            id: "focusIndicators",
                            label: "Enhanced Focus Indicators",
                            description: "Stronger visual focus indicators",
                            checked: focusIndicators,
                            onChange: setFocusIndicators,
                            icon: Eye,
                          },
                        ].map((feature) => (
                          <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <feature.icon className="w-5 h-5" />
                              <div>
                                <p className="font-medium">{feature.label}</p>
                                <p className="text-sm text-slate-600">{feature.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={feature.checked}
                              onCheckedChange={(checked) => {
                                feature.onChange(checked);
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 border-orange-200 bg-orange-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-200 rounded-full">
                        <Heart className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium text-orange-800">Accessibility Commitment</p>
                        <p className="text-sm text-orange-700">
                          We're committed to making learning accessible for everyone. 
                          These features help ensure everyone can enjoy and benefit from our app.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-yellow-100 rounded-xl">
                      <Bell className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Notifications</h3>
                  </div>

                  <Card className="p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notification Preferences
                      </h4>
                      
                      <div className="grid gap-3">
                        {[
                          {
                            id: "dailyReminders",
                            label: "Daily Learning Reminders",
                            description: "Get notified to maintain your learning streak",
                            checked: dailyReminders,
                            onChange: setDailyReminders,
                            icon: Calendar,
                          },
                          {
                            id: "achievementNotifications",
                            label: "Achievement Notifications",
                            description: "Celebrate when you unlock new achievements",
                            checked: achievementNotifications,
                            onChange: setAchievementNotifications,
                            icon: Award,
                          },
                          {
                            id: "streakReminders",
                            label: "Streak Reminders",
                            description: "Gentle reminders to keep your learning streak alive",
                            checked: streakReminders,
                            onChange: setStreakReminders,
                            icon: Star,
                          },
                        ].map((feature) => (
                          <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <feature.icon className="w-5 h-5" />
                              <div>
                                <p className="font-medium">{feature.label}</p>
                                <p className="text-sm text-slate-600">{feature.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={feature.checked}
                              onCheckedChange={(checked) => {
                                feature.onChange(checked);
                                setHasUnsavedChanges(true);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Profile Settings */}
              {activeTab === "profile" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-pink-100 rounded-xl">
                      <User className="w-5 h-5 text-pink-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Profile Settings</h3>
                  </div>

                  {/* Language Selection */}
                  <Card className="p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Languages className="w-4 h-4" />
                        Language & Region
                      </h4>
                      
                      <div className="grid gap-3">
                        {languages.map((lang) => (
                          <Button
                            key={lang.code}
                            variant={language === lang.code ? "default" : "outline"}
                            className={cn(
                              "justify-start h-12",
                              language === lang.code && "bg-educational-blue text-white"
                            )}
                            onClick={() => {
                              setLanguage(lang.code);
                              setHasUnsavedChanges(true);
                            }}
                          >
                            <span className="text-lg mr-3">{lang.flag}</span>
                            <span>{lang.name}</span>
                            {language === lang.code && <Check className="w-4 h-4 ml-auto" />}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Profile Stats */}
                  <Card className="p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Your Progress
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                          <div className="text-3xl mb-2">🎯</div>
                          <p className="font-bold text-lg text-blue-700">Level 3</p>
                          <p className="text-sm text-blue-600">Word Explorer</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                          <div className="text-3xl mb-2">🏆</div>
                          <p className="font-bold text-lg text-orange-700">1,250</p>
                          <p className="text-sm text-orange-600">Points Earned</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                          <div className="text-3xl mb-2">🔥</div>
                          <p className="font-bold text-lg text-green-700">7 Days</p>
                          <p className="text-sm text-green-600">Current Streak</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border-2 border-pink-200">
                          <div className="text-3xl mb-2">📚</div>
                          <p className="font-bold text-lg text-pink-700">342</p>
                          <p className="text-sm text-pink-600">Words Learned</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Device Information */}
                  <Card className="p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        {deviceInfo.isMobile ? (
                          <Smartphone className="w-4 h-4" />
                        ) : deviceInfo.isTablet ? (
                          <Tablet className="w-4 h-4" />
                        ) : (
                          <Monitor className="w-4 h-4" />
                        )}
                        Device Information
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-lg text-center">
                          <div className="text-lg mb-1">
                            {deviceInfo.isMobile ? "📱" : deviceInfo.isTablet ? "📱" : "💻"}
                          </div>
                          <p className="text-sm font-medium">
                            {deviceInfo.isMobile ? "Mobile" : deviceInfo.isTablet ? "Tablet" : "Desktop"}
                          </p>
                          <p className="text-xs text-slate-600">{deviceInfo.screenSize} screen</p>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg text-center">
                          <div className="text-lg mb-1">
                            {deviceInfo.hasTouch ? "👆" : "🖱️"}
                          </div>
                          <p className="text-sm font-medium">
                            {deviceInfo.hasTouch ? "Touch" : "Mouse"}
                          </p>
                          <p className="text-xs text-slate-600">Primary input</p>
                        </div>

                        {deviceInfo.hasHaptic && (
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <div className="text-lg mb-1">📳</div>
                            <p className="text-sm font-medium text-green-700">Haptic</p>
                            <p className="text-xs text-green-600">Feedback enabled</p>
                          </div>
                        )}

                        <div className="p-3 bg-slate-50 rounded-lg text-center">
                          <div className="text-lg mb-1">
                            {deviceInfo.orientation === "portrait" ? "📱" : "📲"}
                          </div>
                          <p className="text-sm font-medium capitalize">{deviceInfo.orientation}</p>
                          <p className="text-xs text-slate-600">Orientation</p>
                        </div>
                      </div>

                      {(deviceInfo.prefersReducedMotion || deviceInfo.prefersHighContrast) && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-800 mb-2">
                            🌟 Accessibility Preferences Detected
                          </p>
                          <div className="space-y-1">
                            {deviceInfo.prefersReducedMotion && (
                              <p className="text-xs text-blue-700">✓ Reduced motion preferred</p>
                            )}
                            {deviceInfo.prefersHighContrast && (
                              <p className="text-xs text-blue-700">✓ High contrast preferred</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Data Management */}
                  <Card className="p-4">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Data Management
                      </h4>

                      <div className="grid gap-2">
                        <Button variant="outline" className="justify-start h-12">
                          <Download className="w-4 h-4 mr-3" />
                          Export My Data
                        </Button>
                        <Button variant="outline" className="justify-start h-12">
                          <Upload className="w-4 h-4 mr-3" />
                          Import Data
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Action Bar */}
        <div className="settings-footer-mobile border-t bg-slate-50 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => {
                handleResetToDefaults();
                if (deviceInfo.hasHaptic) triggerHapticFeedback("medium");
              }}
              className="flex-1 flex items-center justify-center gap-2 h-12"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>
            <Button
              onClick={() => {
                handleSaveSettings();
                if (deviceInfo.hasHaptic) triggerHapticFeedback("heavy");
              }}
              className="flex-1 bg-educational-blue hover:bg-educational-blue/90 text-white h-12 flex items-center justify-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              Save & Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
