import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
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
} from "lucide-react";
import {
  setSoundEnabled,
  isSoundEnabled,
  playSoundIfEnabled,
} from "@/lib/soundEffects";
import { audioService, VoiceType } from "@/lib/audioService";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [darkMode, setDarkMode] = useState(false);
  const [backgroundAnimations, setBackgroundAnimations] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState([1]);
  const [dailyGoal, setDailyGoal] = useState([10]);
  const [difficulty, setDifficulty] = useState("medium");
  const [selectedVoiceType, setSelectedVoiceType] =
    useState<VoiceType>("woman");
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);

  useEffect(() => {
    // Initialize voice type from audio service
    setSelectedVoiceType(audioService.getVoiceType());

    // Get available voices
    const voices = audioService.getAvailableVoices();
    setAvailableVoices(voices);

    // Load background animations setting (default: false)
    const savedBackgroundAnimations = localStorage.getItem(
      "backgroundAnimations",
    );
    setBackgroundAnimations(savedBackgroundAnimations === "true");
  }, [isOpen]);

  const handleSoundToggle = (checked: boolean) => {
    setSoundOn(checked);
    setSoundEnabled(checked);
    if (checked) {
      playSoundIfEnabled.click();
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    // In a real app, this would toggle the dark mode theme
    document.documentElement.classList.toggle("dark", checked);
    playSoundIfEnabled.click();
  };

  const handleBackgroundAnimationsToggle = (checked: boolean) => {
    setBackgroundAnimations(checked);
    localStorage.setItem("backgroundAnimations", checked.toString());
    // Dispatch custom event for other components to listen
    window.dispatchEvent(
      new CustomEvent("backgroundAnimationsChanged", { detail: checked }),
    );
    playSoundIfEnabled.click();
  };

  const handleVoiceTypeChange = (voiceType: VoiceType) => {
    setSelectedVoiceType(voiceType);
    audioService.setVoiceType(voiceType);
    playSoundIfEnabled.click();
  };

  const handleVoicePreview = (voiceType: VoiceType) => {
    const previewTexts = {
      woman:
        "Hi there! I'm a friendly woman's voice. I love helping you learn new words!",
      man: "Hello! I'm a man's voice. Let's discover some amazing vocabulary together!",
      kid: "Hey! I'm a fun kid's voice. Learning words is super exciting!",
    };
    audioService.previewVoice(voiceType, previewTexts[voiceType]);
  };

  const handleDebugVoices = () => {
    audioService.debugVoices();
  };

  const difficultyLevels = [
    { value: "easy", label: "Easy", color: "bg-educational-green" },
    { value: "medium", label: "Medium", color: "bg-educational-orange" },
    { value: "hard", label: "Hard", color: "bg-educational-pink" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
      <Card className="w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings & Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Sound Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {soundOn ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
              Audio Settings
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sound Effects</p>
                <p className="text-sm text-slate-600">
                  Play sounds for interactions and feedback
                </p>
              </div>
              <Switch checked={soundOn} onCheckedChange={handleSoundToggle} />
            </div>

            {/* Voice Type Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <p className="font-medium">Pronunciation Voice</p>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Choose who you'd like to hear speaking the words
              </p>

              <div className="grid grid-cols-1 gap-2 md:gap-3">
                {[
                  {
                    type: "woman" as VoiceType,
                    label: "Woman Voice",
                    emoji: "👩",
                    description: "Friendly female voice",
                  },
                  {
                    type: "man" as VoiceType,
                    label: "Man Voice",
                    emoji: "👨",
                    description: "Strong male voice",
                  },
                  {
                    type: "kid" as VoiceType,
                    label: "Kid Voice",
                    emoji: "🧒",
                    description: "Fun child-like voice",
                  },
                ].map((voice) => {
                  const isAvailable =
                    availableVoices.find((v) => v.type === voice.type)
                      ?.available ?? true;
                  const isSelected = selectedVoiceType === voice.type;
                  const voiceInfo = audioService.getVoiceInfo(voice.type);

                  return (
                    <div
                      key={voice.type}
                      className={`flex items-center justify-between p-3 md:p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-educational-blue bg-educational-blue/10"
                          : "border-slate-200 hover:border-slate-300"
                      } ${!isAvailable ? "opacity-50" : "cursor-pointer"} min-h-[60px]`}
                      onClick={() =>
                        isAvailable && handleVoiceTypeChange(voice.type)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{voice.emoji}</span>
                        <div>
                          <p
                            className={`font-medium ${isSelected ? "text-educational-blue" : ""}`}
                          >
                            {voice.label}
                          </p>
                          <p className="text-sm text-slate-600">
                            {voice.description}
                          </p>
                          {voiceInfo && (
                            <p className="text-xs text-slate-500">
                              Using: {voiceInfo.name}
                            </p>
                          )}
                          {!isAvailable && (
                            <p className="text-xs text-red-500">
                              Not available on this device
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <Badge className="bg-educational-blue text-white">
                            Selected
                          </Badge>
                        )}
                        {isAvailable && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVoicePreview(voice.type);
                            }}
                            className="flex items-center gap-1"
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

              {/* Debug Button for Voice Issues */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">
                  Having voice issues? Click the button below to see voice debug info in the browser console.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDebugVoices}
                  className="text-xs"
                >
                  Debug Voice Info (Check Console)
                </Button>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-slate-600">Switch to dark theme</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <Switch
                  checked={darkMode}
                  onCheckedChange={handleDarkModeToggle}
                />
                <Moon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Background Animations</p>
                <p className="text-sm text-slate-600">
                  Show floating elements and bubbles
                </p>
              </div>
              <Switch
                checked={backgroundAnimations}
                onCheckedChange={handleBackgroundAnimationsToggle}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Animation Speed</p>
                <Badge variant="outline">{animationSpeed[0]}x</Badge>
              </div>
              <Slider
                value={animationSpeed}
                onValueChange={setAnimationSpeed}
                max={2}
                min={0.5}
                step={0.25}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>
          </div>

          {/* Learning Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Learning Preferences
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Daily Goal</p>
                <Badge variant="outline">{dailyGoal[0]} words</Badge>
              </div>
              <Slider
                value={dailyGoal}
                onValueChange={setDailyGoal}
                max={50}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>5 words</span>
                <span>50 words</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium">Preferred Difficulty</p>
              <div className="grid grid-cols-3 gap-2">
                {difficultyLevels.map((level) => (
                  <Button
                    key={level.value}
                    variant={difficulty === level.value ? "default" : "outline"}
                    className={
                      difficulty === level.value
                        ? `${level.color} text-white`
                        : ""
                    }
                    onClick={() => {
                      setDifficulty(level.value);
                      playSoundIfEnabled.click();
                    }}
                  >
                    {level.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl mb-2">🎯</div>
                <p className="font-semibold">Level 3</p>
                <p className="text-xs text-slate-600">Word Explorer</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl mb-2">🏆</div>
                <p className="font-semibold">1,250 Points</p>
                <p className="text-xs text-slate-600">Total Earned</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                // Reset to defaults
                setSoundOn(true);
                setSoundEnabled(true);
                setDarkMode(false);
                setBackgroundAnimations(false);
                localStorage.setItem("backgroundAnimations", "false");
                window.dispatchEvent(
                  new CustomEvent("backgroundAnimationsChanged", {
                    detail: false,
                  }),
                );
                setAnimationSpeed([1]);
                setDailyGoal([10]);
                setDifficulty("medium");
                setSelectedVoiceType("woman");
                audioService.setVoiceType("woman");
                document.documentElement.classList.remove("dark");
                playSoundIfEnabled.click();
              }}
              className="flex-1 w-full"
            >
              Reset to Defaults
            </Button>
            <Button
              onClick={() => {
                playSoundIfEnabled.click();
                onClose();
              }}
              className="flex-1 w-full bg-educational-blue text-white"
            >
              Save & Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
