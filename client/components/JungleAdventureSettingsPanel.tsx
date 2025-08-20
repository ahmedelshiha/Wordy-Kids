import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  TreePine,
  Leaf,
  Flower,
  Butterfly,
  Bird,
  Rabbit,
  Compass,
  Map,
  Sparkles,
  Crown,
  Gift,
  Users,
  Headphones,
  Speaker,
  Volume1,
  VolumeOff,
  Gamepad2,
  PaintBucket,
  Timer,
  Focus,
  Accessibility,
  Globe,
  Family,
  Baby,
  GraduationCap,
  BookOpen,
  Music,
  Video,
  Image,
  Waves,
  Wind,
  CloudRain,
} from "lucide-react";
import {
  setSoundEnabled,
  isSoundEnabled,
  playSoundIfEnabled,
  setUIInteractionSoundsEnabled,
  isUIInteractionSoundsEnabled,
} from "@/lib/soundEffects";
import { audioService, VoiceType } from "@/lib/audioService";
import { cn } from "@/lib/utils";
import {
  useMobileDevice,
  triggerHapticFeedback,
} from "@/hooks/use-mobile-device";
import "@/styles/jungle-adventure-settings.css";

interface JungleAdventureSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: "child" | "parent";
}

// Jungle ambient sounds
const jungleAmbientSounds = [
  { id: "birds", name: "🐦 Tropical Birds", emoji: "🐦", file: "/sounds/jungle-birds.mp3" },
  { id: "rain", name: "🌧️ Gentle Rain", emoji: "🌧️", file: "/sounds/jungle-rain.mp3" },
  { id: "wind", name: "🌬️ Rustling Leaves", emoji: "🌬️", file: "/sounds/jungle-wind.mp3" },
  { id: "waterfall", name: "💧 Waterfall", emoji: "💧", file: "/sounds/jungle-waterfall.mp3" },
  { id: "insects", name: "🦗 Night Crickets", emoji: "🦗", file: "/sounds/jungle-insects.mp3" },
];

// Jungle themes
const jungleThemes = [
  { 
    id: "classic", 
    name: "🌿 Classic Jungle", 
    emoji: "🌿",
    colors: ["#4CAF50", "#8BC34A", "#CDDC39"],
    description: "Traditional green jungle vibes"
  },
  { 
    id: "sunset", 
    name: "🌅 Sunset Safari", 
    emoji: "🌅",
    colors: ["#FF9800", "#FFC107", "#4CAF50"],
    description: "Warm sunset through the trees"
  },
  { 
    id: "mystical", 
    name: "✨ Mystical Forest", 
    emoji: "✨",
    colors: ["#4CAF50", "#6366F1", "#9C27B0"],
    description: "Magical purple-tinted adventure"
  },
  { 
    id: "ocean", 
    name: "🌊 Jungle Beach", 
    emoji: "🌊",
    colors: ["#2196F3", "#4CAF50", "#00BCD4"],
    description: "Where jungle meets the ocean"
  },
  { 
    id: "autumn", 
    name: "🍂 Autumn Jungle", 
    emoji: "🍂",
    colors: ["#FF5722", "#FF9800", "#8BC34A"],
    description: "Warm autumn colors"
  },
];

// Voice characters for jungle adventure
const jungleVoiceCharacters = [
  { 
    id: "explorer", 
    name: "🏕️ Adventure Guide", 
    emoji: "🏕️",
    voice: "woman" as VoiceType,
    description: "Friendly expedition leader"
  },
  { 
    id: "parrot", 
    name: "🦜 Chatty Parrot", 
    emoji: "🦜",
    voice: "man" as VoiceType,
    description: "Colorful jungle companion"
  },
  { 
    id: "wise_owl", 
    name: "🦉 Wise Owl", 
    emoji: "🦉",
    voice: "woman" as VoiceType,
    description: "Knowledgeable forest teacher"
  },
  { 
    id: "monkey", 
    name: "🐵 Playful Monkey", 
    emoji: "🐵",
    voice: "child" as VoiceType,
    description: "Fun-loving jungle friend"
  },
];

export const JungleAdventureSettingsPanel: React.FC<JungleAdventureSettingsPanelProps> = ({
  isOpen,
  onClose,
  userRole = "child"
}) => {
  const isMobile = useMobileDevice();
  
  // Audio settings
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [uiInteractionSounds, setUiInteractionSounds] = useState(isUIInteractionSoundsEnabled());
  const [selectedVoiceCharacter, setSelectedVoiceCharacter] = useState(jungleVoiceCharacters[0]);
  const [speechRate, setSpeechRate] = useState([1]);
  const [volume, setVolume] = useState([80]);
  const [ambientSounds, setAmbientSounds] = useState(false);
  const [selectedAmbientSound, setSelectedAmbientSound] = useState(jungleAmbientSounds[0]);
  const [ambientVolume, setAmbientVolume] = useState([30]);

  // Appearance settings
  const [selectedTheme, setSelectedTheme] = useState(jungleThemes[0]);
  const [backgroundAnimations, setBackgroundAnimations] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState([1]);
  const [particleEffects, setParticleEffects] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Learning settings
  const [dailyGoal, setDailyGoal] = useState([10]);
  const [difficulty, setDifficulty] = useState("medium");
  const [autoPlay, setAutoPlay] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [repeatOnMistake, setRepeatOnMistake] = useState(true);
  const [celebrationStyle, setCelebrationStyle] = useState("full");
  const [encouragementLevel, setEncouragementLevel] = useState("medium");

  // Family settings (for parents)
  const [childProfiles, setChildProfiles] = useState([]);
  const [timeRestrictions, setTimeRestrictions] = useState(false);
  const [dailyTimeLimit, setDailyTimeLimit] = useState([60]);
  const [contentFiltering, setContentFiltering] = useState("age-appropriate");
  const [progressSharing, setProgressSharing] = useState(false);

  // Accessibility settings
  const [screenReader, setScreenReader] = useState(false);
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [focusIndicators, setFocusIndicators] = useState(true);
  const [colorBlindSupport, setColorBlindSupport] = useState(false);

  // State management
  const [activeTab, setActiveTab] = useState("audio");
  const [isLoading, setIsLoading] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Jungle ambient elements
  const [floatingElements, setFloatingElements] = useState<Array<{ id: number; emoji: string; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isOpen) {
      const elements = [
        { id: 1, emoji: "🦋", x: 15, y: 25, delay: 0 },
        { id: 2, emoji: "🌸", x: 85, y: 35, delay: 1.5 },
        { id: 3, emoji: "🍃", x: 25, y: 75, delay: 3 },
        { id: 4, emoji: "✨", x: 75, y: 15, delay: 4.5 },
      ];
      setFloatingElements(elements);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsLoading(true);
    
    // Save settings to localStorage or API
    const settings = {
      audio: {
        soundOn,
        uiInteractionSounds,
        selectedVoiceCharacter,
        speechRate: speechRate[0],
        volume: volume[0],
        ambientSounds,
        selectedAmbientSound,
        ambientVolume: ambientVolume[0],
      },
      appearance: {
        selectedTheme,
        backgroundAnimations,
        animationSpeed: animationSpeed[0],
        particleEffects,
        darkMode,
        highContrast,
        largeText,
        reducedMotion,
      },
      learning: {
        dailyGoal: dailyGoal[0],
        difficulty,
        autoPlay,
        showHints,
        repeatOnMistake,
        celebrationStyle,
        encouragementLevel,
      },
      family: {
        timeRestrictions,
        dailyTimeLimit: dailyTimeLimit[0],
        contentFiltering,
        progressSharing,
      },
      accessibility: {
        screenReader,
        keyboardNavigation,
        hapticFeedback,
        focusIndicators,
        colorBlindSupport,
      },
    };

    localStorage.setItem('jungleAdventureSettings', JSON.stringify(settings));
    
    // Apply sound settings
    setSoundEnabled(soundOn);
    setUIInteractionSoundsEnabled(uiInteractionSounds);

    // Apply theme
    if (selectedTheme) {
      document.documentElement.style.setProperty('--jungle-primary', selectedTheme.colors[0]);
      document.documentElement.style.setProperty('--jungle-secondary', selectedTheme.colors[1]);
      document.documentElement.style.setProperty('--jungle-accent', selectedTheme.colors[2]);
    }

    // Apply accessibility settings
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setTimeout(() => {
      setIsLoading(false);
      setUnsavedChanges(false);
      playSoundIfEnabled('/sounds/ui/settings-saved.mp3');
      if (hapticFeedback) triggerHapticFeedback('success');
    }, 1000);
  };

  const handleReset = () => {
    // Reset to defaults
    setSoundOn(true);
    setUiInteractionSounds(true);
    setSelectedVoiceCharacter(jungleVoiceCharacters[0]);
    setSpeechRate([1]);
    setVolume([80]);
    setSelectedTheme(jungleThemes[0]);
    setBackgroundAnimations(true);
    setDailyGoal([10]);
    setDifficulty("medium");
    
    setShowResetDialog(false);
    setUnsavedChanges(true);
    
    playSoundIfEnabled('/sounds/ui/settings-reset.mp3');
    if (hapticFeedback) triggerHapticFeedback('light');
  };

  const previewVoice = () => {
    const sampleText = `Hello! I'm your ${selectedVoiceCharacter.name}. Let's explore the jungle together and discover amazing words!`;
    audioService.speak(sampleText, selectedVoiceCharacter.voice, speechRate[0], volume[0] / 100);
    playSoundIfEnabled('/sounds/ui/voice-preview.mp3');
  };

  const previewAmbientSound = () => {
    if (selectedAmbientSound) {
      playSoundIfEnabled(selectedAmbientSound.file, ambientVolume[0] / 100);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden jungle-settings-dialog">
        {/* Floating Jungle Elements */}
        <AnimatePresence>
          {floatingElements.map((element) => (
            <motion.div
              key={element.id}
              className="absolute text-xl pointer-events-none select-none z-10 opacity-60"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [0.8, 1.2, 0.8],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: element.delay,
                ease: "easeInOut"
              }}
            >
              {element.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-jungle to-sunshine p-6 text-white relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <TreePine className="w-8 h-8 animate-jungle-sway" />
                <Sparkles className="w-4 h-4 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  ⚙️ Jungle Adventure Settings
                </DialogTitle>
                <DialogDescription className="text-white/90 mt-1">
                  Customize your magical learning journey through the jungle
                </DialogDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {unsavedChanges && (
                <Badge className="bg-sunshine text-white animate-pulse">
                  Unsaved Changes
                </Badge>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-gradient-to-b from-jungle/5 to-sunshine/5 border-r border-jungle/20 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {[
                  { id: "audio", label: "🔊 Sound & Voice", icon: Volume2, color: "jungle" },
                  { id: "appearance", label: "🎨 Jungle Themes", icon: Palette, color: "sunshine" },
                  { id: "learning", label: "📚 Learning Style", icon: GraduationCap, color: "profile-purple" },
                  ...(userRole === "parent" ? [
                    { id: "family", label: "👨‍👩‍👧‍👦 Family Controls", icon: Users, color: "coral-red" }
                  ] : []),
                  { id: "accessibility", label: "♿ Accessibility", icon: Eye, color: "playful-purple" },
                  { id: "advanced", label: "⚡ Advanced", icon: Settings, color: "bright-orange" },
                ].map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setUnsavedChanges(true);
                      if (hapticFeedback) triggerHapticFeedback('light');
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3",
                      activeTab === tab.id
                        ? `bg-${tab.color} text-white shadow-lg`
                        : "hover:bg-white/50 text-jungle-dark"
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {/* Audio Settings */}
                  {activeTab === "audio" && (
                    <motion.div
                      key="audio"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-jungle-dark mb-4 flex items-center gap-2">
                          <Volume2 className="w-5 h-5 text-jungle" />
                          Sound & Voice Settings
                        </h3>

                        {/* Basic Audio Controls */}
                        <Card className="jungle-card mb-6">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Volume2 className="w-5 h-5 text-jungle" />
                                <div>
                                  <label className="font-medium text-jungle-dark">Master Volume</label>
                                  <p className="text-sm text-jungle-dark/70">Overall sound level</p>
                                </div>
                              </div>
                              <Switch
                                checked={soundOn}
                                onCheckedChange={(checked) => {
                                  setSoundOn(checked);
                                  setUnsavedChanges(true);
                                }}
                              />
                            </div>

                            {soundOn && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-4"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Volume Level</span>
                                    <span className="text-sm text-jungle-dark/70">{volume[0]}%</span>
                                  </div>
                                  <Slider
                                    value={volume}
                                    onValueChange={(value) => {
                                      setVolume(value);
                                      setUnsavedChanges(true);
                                    }}
                                    max={100}
                                    step={5}
                                    className="jungle-slider"
                                  />
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <label className="font-medium text-jungle-dark">UI Sound Effects</label>
                                    <p className="text-sm text-jungle-dark/70">Button clicks and interactions</p>
                                  </div>
                                  <Switch
                                    checked={uiInteractionSounds}
                                    onCheckedChange={(checked) => {
                                      setUiInteractionSounds(checked);
                                      setUnsavedChanges(true);
                                    }}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Voice Character Selection */}
                        <Card className="jungle-card mb-6">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-jungle-dark">
                              <Mic className="w-5 h-5 text-sunshine" />
                              🎭 Choose Your Adventure Guide
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {jungleVoiceCharacters.map((character) => (
                                <motion.div
                                  key={character.id}
                                  className={cn(
                                    "p-4 rounded-lg border-2 cursor-pointer transition-all",
                                    selectedVoiceCharacter.id === character.id
                                      ? "border-jungle bg-jungle/10"
                                      : "border-jungle/20 hover:border-jungle/40 hover:bg-jungle/5"
                                  )}
                                  onClick={() => {
                                    setSelectedVoiceCharacter(character);
                                    setUnsavedChanges(true);
                                  }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="text-2xl">{character.emoji}</div>
                                    <div>
                                      <h4 className="font-medium text-jungle-dark">{character.name}</h4>
                                      <p className="text-sm text-jungle-dark/70">{character.description}</p>
                                    </div>
                                  </div>
                                  {selectedVoiceCharacter.id === character.id && (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        previewVoice();
                                      }}
                                      className="jungle-button w-full"
                                    >
                                      <Play className="w-4 h-4 mr-2" />
                                      Preview Voice
                                    </Button>
                                  )}
                                </motion.div>
                              ))}
                            </div>

                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Speech Speed</span>
                                  <span className="text-sm text-jungle-dark/70">{speechRate[0]}x</span>
                                </div>
                                <Slider
                                  value={speechRate}
                                  onValueChange={(value) => {
                                    setSpeechRate(value);
                                    setUnsavedChanges(true);
                                  }}
                                  min={0.5}
                                  max={2}
                                  step={0.1}
                                  className="jungle-slider"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Ambient Jungle Sounds */}
                        <Card className="jungle-card">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-jungle-dark">
                              <Waves className="w-5 h-5 text-sky" />
                              🌿 Jungle Atmosphere
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="font-medium text-jungle-dark">Background Sounds</label>
                                <p className="text-sm text-jungle-dark/70">Relaxing jungle ambience</p>
                              </div>
                              <Switch
                                checked={ambientSounds}
                                onCheckedChange={(checked) => {
                                  setAmbientSounds(checked);
                                  setUnsavedChanges(true);
                                }}
                              />
                            </div>

                            {ambientSounds && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-4"
                              >
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Choose Your Soundscape</label>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {jungleAmbientSounds.map((sound) => (
                                      <div
                                        key={sound.id}
                                        className={cn(
                                          "p-3 rounded-lg border cursor-pointer transition-all",
                                          selectedAmbientSound.id === sound.id
                                            ? "border-jungle bg-jungle/10"
                                            : "border-jungle/20 hover:border-jungle/40"
                                        )}
                                        onClick={() => {
                                          setSelectedAmbientSound(sound);
                                          setUnsavedChanges(true);
                                        }}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg">{sound.emoji}</span>
                                          <span className="text-sm font-medium">{sound.name}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">Ambient Volume</span>
                                      <span className="text-sm text-jungle-dark/70">{ambientVolume[0]}%</span>
                                    </div>
                                    <Slider
                                      value={ambientVolume}
                                      onValueChange={(value) => {
                                        setAmbientVolume(value);
                                        setUnsavedChanges(true);
                                      }}
                                      max={100}
                                      step={5}
                                      className="jungle-slider"
                                    />
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={previewAmbientSound}
                                    className="jungle-button"
                                  >
                                    <Play className="w-4 h-4" />
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  )}

                  {/* Appearance Settings */}
                  {activeTab === "appearance" && (
                    <motion.div
                      key="appearance"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold text-jungle-dark mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-sunshine" />
                        Jungle Visual Experience
                      </h3>

                      {/* Theme Selection */}
                      <Card className="jungle-card mb-6">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-jungle-dark">
                            <PaintBucket className="w-5 h-5 text-sunshine" />
                            🎨 Choose Your Jungle Theme
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {jungleThemes.map((theme) => (
                              <motion.div
                                key={theme.id}
                                className={cn(
                                  "relative p-4 rounded-lg border-2 cursor-pointer transition-all overflow-hidden",
                                  selectedTheme.id === theme.id
                                    ? "border-jungle shadow-lg"
                                    : "border-jungle/20 hover:border-jungle/40"
                                )}
                                onClick={() => {
                                  setSelectedTheme(theme);
                                  setUnsavedChanges(true);
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div 
                                  className="absolute inset-0 opacity-20"
                                  style={{
                                    background: `linear-gradient(135deg, ${theme.colors.join(', ')})`
                                  }}
                                />
                                <div className="relative z-10">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">{theme.emoji}</span>
                                    <div>
                                      <h4 className="font-medium text-jungle-dark">{theme.name}</h4>
                                      <p className="text-sm text-jungle-dark/70">{theme.description}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 mt-3">
                                    {theme.colors.map((color, index) => (
                                      <div
                                        key={index}
                                        className="w-4 h-4 rounded-full border border-white/50"
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {selectedTheme.id === theme.id && (
                                  <div className="absolute top-2 right-2">
                                    <Check className="w-5 h-5 text-jungle bg-white rounded-full p-1" />
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Animation Settings */}
                      <Card className="jungle-card mb-6">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-jungle-dark">
                            <Sparkles className="w-5 h-5 text-profile-purple" />
                            ✨ Animation & Effects
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Background Animations</label>
                              <p className="text-sm text-jungle-dark/70">Floating leaves, butterflies, etc.</p>
                            </div>
                            <Switch
                              checked={backgroundAnimations}
                              onCheckedChange={(checked) => {
                                setBackgroundAnimations(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Particle Effects</label>
                              <p className="text-sm text-jungle-dark/70">Sparkles, stars, magical effects</p>
                            </div>
                            <Switch
                              checked={particleEffects}
                              onCheckedChange={(checked) => {
                                setParticleEffects(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          {(backgroundAnimations || particleEffects) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Animation Speed</span>
                                  <span className="text-sm text-jungle-dark/70">{animationSpeed[0]}x</span>
                                </div>
                                <Slider
                                  value={animationSpeed}
                                  onValueChange={(value) => {
                                    setAnimationSpeed(value);
                                    setUnsavedChanges(true);
                                  }}
                                  min={0.5}
                                  max={2}
                                  step={0.1}
                                  className="jungle-slider"
                                />
                              </div>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Accessibility Options */}
                      <Card className="jungle-card">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-jungle-dark">
                            <Accessibility className="w-5 h-5 text-playful-purple" />
                            ♿ Visual Accessibility
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">High Contrast Mode</label>
                              <p className="text-sm text-jungle-dark/70">Better visibility for all users</p>
                            </div>
                            <Switch
                              checked={highContrast}
                              onCheckedChange={(checked) => {
                                setHighContrast(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Large Text</label>
                              <p className="text-sm text-jungle-dark/70">Bigger text for easier reading</p>
                            </div>
                            <Switch
                              checked={largeText}
                              onCheckedChange={(checked) => {
                                setLargeText(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Reduced Motion</label>
                              <p className="text-sm text-jungle-dark/70">Minimal animations</p>
                            </div>
                            <Switch
                              checked={reducedMotion}
                              onCheckedChange={(checked) => {
                                setReducedMotion(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Color Blind Support</label>
                              <p className="text-sm text-jungle-dark/70">Alternative color indicators</p>
                            </div>
                            <Switch
                              checked={colorBlindSupport}
                              onCheckedChange={(checked) => {
                                setColorBlindSupport(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Learning Settings */}
                  {activeTab === "learning" && (
                    <motion.div
                      key="learning"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold text-jungle-dark mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-profile-purple" />
                        Learning Adventure Style
                      </h3>

                      {/* Goals & Progress */}
                      <Card className="jungle-card mb-6">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-jungle-dark">
                            <Target className="w-5 h-5 text-coral-red" />
                            🎯 Learning Goals
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Daily Word Goal</span>
                              <span className="text-sm text-jungle-dark/70">{dailyGoal[0]} words</span>
                            </div>
                            <Slider
                              value={dailyGoal}
                              onValueChange={(value) => {
                                setDailyGoal(value);
                                setUnsavedChanges(true);
                              }}
                              min={5}
                              max={50}
                              step={5}
                              className="jungle-slider"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                            <Select
                              value={difficulty}
                              onValueChange={(value) => {
                                setDifficulty(value);
                                setUnsavedChanges(true);
                              }}
                            >
                              <SelectTrigger className="jungle-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="easy">🌱 Easy Explorer</SelectItem>
                                <SelectItem value="medium">🌿 Jungle Adventurer</SelectItem>
                                <SelectItem value="hard">🌳 Expert Guide</SelectItem>
                                <SelectItem value="adaptive">🎯 Adaptive Challenge</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Learning Style */}
                      <Card className="jungle-card mb-6">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-jungle-dark">
                            <BookOpen className="w-5 h-5 text-sunshine" />
                            📚 Learning Preferences
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Auto-play Word Audio</label>
                              <p className="text-sm text-jungle-dark/70">Hear words automatically</p>
                            </div>
                            <Switch
                              checked={autoPlay}
                              onCheckedChange={(checked) => {
                                setAutoPlay(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Show Hints</label>
                              <p className="text-sm text-jungle-dark/70">Helpful clues during games</p>
                            </div>
                            <Switch
                              checked={showHints}
                              onCheckedChange={(checked) => {
                                setShowHints(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Repeat on Mistakes</label>
                              <p className="text-sm text-jungle-dark/70">Extra practice for difficult words</p>
                            </div>
                            <Switch
                              checked={repeatOnMistake}
                              onCheckedChange={(checked) => {
                                setRepeatOnMistake(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Celebration Style</label>
                            <Select
                              value={celebrationStyle}
                              onValueChange={(value) => {
                                setCelebrationStyle(value);
                                setUnsavedChanges(true);
                              }}
                            >
                              <SelectTrigger className="jungle-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minimal">🌿 Subtle</SelectItem>
                                <SelectItem value="standard">🎉 Standard</SelectItem>
                                <SelectItem value="full">🎊 Full Celebration</SelectItem>
                                <SelectItem value="magical">✨ Magical Effects</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-medium mb-2 block">Encouragement Level</label>
                            <Select
                              value={encouragementLevel}
                              onValueChange={(value) => {
                                setEncouragementLevel(value);
                                setUnsavedChanges(true);
                              }}
                            >
                              <SelectTrigger className="jungle-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">🌱 Gentle</SelectItem>
                                <SelectItem value="medium">🌿 Encouraging</SelectItem>
                                <SelectItem value="high">🎉 Enthusiastic</SelectItem>
                                <SelectItem value="adaptive">🎯 Adaptive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Family Settings (Parent only) */}
                  {activeTab === "family" && userRole === "parent" && (
                    <motion.div
                      key="family"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold text-jungle-dark mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-coral-red" />
                        Family Adventure Controls
                      </h3>

                      <Card className="jungle-card mb-6">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-jungle-dark">
                            <Shield className="w-5 h-5 text-jungle" />
                            🛡️ Safety & Time Management
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Time Restrictions</label>
                              <p className="text-sm text-jungle-dark/70">Set daily learning limits</p>
                            </div>
                            <Switch
                              checked={timeRestrictions}
                              onCheckedChange={(checked) => {
                                setTimeRestrictions(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          {timeRestrictions && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Daily Time Limit</span>
                                  <span className="text-sm text-jungle-dark/70">{dailyTimeLimit[0]} minutes</span>
                                </div>
                                <Slider
                                  value={dailyTimeLimit}
                                  onValueChange={(value) => {
                                    setDailyTimeLimit(value);
                                    setUnsavedChanges(true);
                                  }}
                                  min={15}
                                  max={120}
                                  step={15}
                                  className="jungle-slider"
                                />
                              </div>
                            </motion.div>
                          )}

                          <div>
                            <label className="text-sm font-medium mb-2 block">Content Filtering</label>
                            <Select
                              value={contentFiltering}
                              onValueChange={(value) => {
                                setContentFiltering(value);
                                setUnsavedChanges(true);
                              }}
                            >
                              <SelectTrigger className="jungle-select">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="strict">🔒 Strict (Age 3-4)</SelectItem>
                                <SelectItem value="age-appropriate">✅ Age Appropriate (Age 4-5)</SelectItem>
                                <SelectItem value="relaxed">🌟 Relaxed (Age 5+)</SelectItem>
                                <SelectItem value="custom">⚙️ Custom Settings</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Progress Sharing</label>
                              <p className="text-sm text-jungle-dark/70">Share achievements with teachers</p>
                            </div>
                            <Switch
                              checked={progressSharing}
                              onCheckedChange={(checked) => {
                                setProgressSharing(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Accessibility Settings */}
                  {activeTab === "accessibility" && (
                    <motion.div
                      key="accessibility"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold text-jungle-dark mb-4 flex items-center gap-2">
                        <Accessibility className="w-5 h-5 text-playful-purple" />
                        Accessibility Features
                      </h3>

                      <Card className="jungle-card">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Screen Reader Support</label>
                              <p className="text-sm text-jungle-dark/70">Voice descriptions of interface</p>
                            </div>
                            <Switch
                              checked={screenReader}
                              onCheckedChange={(checked) => {
                                setScreenReader(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Keyboard Navigation</label>
                              <p className="text-sm text-jungle-dark/70">Navigate without mouse</p>
                            </div>
                            <Switch
                              checked={keyboardNavigation}
                              onCheckedChange={(checked) => {
                                setKeyboardNavigation(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Haptic Feedback</label>
                              <p className="text-sm text-jungle-dark/70">Touch vibration on mobile</p>
                            </div>
                            <Switch
                              checked={hapticFeedback}
                              onCheckedChange={(checked) => {
                                setHapticFeedback(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Enhanced Focus Indicators</label>
                              <p className="text-sm text-jungle-dark/70">Clearer focus outlines</p>
                            </div>
                            <Switch
                              checked={focusIndicators}
                              onCheckedChange={(checked) => {
                                setFocusIndicators(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Advanced Settings */}
                  {activeTab === "advanced" && (
                    <motion.div
                      key="advanced"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold text-jungle-dark mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-bright-orange" />
                        Advanced Settings
                      </h3>

                      <Card className="jungle-card">
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-jungle-dark">Dark Mode</label>
                              <p className="text-sm text-jungle-dark/70">Dark jungle theme</p>
                            </div>
                            <Switch
                              checked={darkMode}
                              onCheckedChange={(checked) => {
                                setDarkMode(checked);
                                setUnsavedChanges(true);
                              }}
                            />
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <h4 className="font-medium text-jungle-dark flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              Data Management
                            </h4>
                            <div className="grid gap-2">
                              <Button variant="outline" className="jungle-button-outline justify-start">
                                <Download className="w-4 h-4 mr-2" />
                                Export Settings
                              </Button>
                              <Button variant="outline" className="jungle-button-outline justify-start">
                                <Upload className="w-4 h-4 mr-2" />
                                Import Settings
                              </Button>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <h4 className="font-medium text-jungle-dark flex items-center gap-2">
                              <RotateCcw className="w-4 h-4" />
                              Reset Options
                            </h4>
                            <Button
                              variant="outline"
                              onClick={() => setShowResetDialog(true)}
                              className="w-full jungle-button-outline text-coral-red border-coral-red/30 hover:bg-coral-red/10"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reset All Settings
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <motion.div 
          className="border-t border-jungle/20 p-6 bg-gradient-to-r from-jungle/5 to-sunshine/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-jungle-dark/70">
                <TreePine className="w-4 h-4 text-jungle" />
                <span>Jungle Adventure Settings</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="jungle-button-outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!unsavedChanges || isLoading}
                className="jungle-button"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-jungle-dark">
                <RotateCcw className="w-5 h-5 text-coral-red" />
                Reset All Settings?
              </DialogTitle>
              <DialogDescription>
                This will reset all your jungle adventure settings to their default values. 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowResetDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReset}
                className="bg-coral-red hover:bg-coral-red/90 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default JungleAdventureSettingsPanel;
