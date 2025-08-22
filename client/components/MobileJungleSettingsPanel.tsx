import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Volume2,
  VolumeX,
  Music,
  Eye,
  X,
  TreePine,
  Sparkles,
  Leaf,
} from "lucide-react";
import {
  useMobileDevice,
  triggerHapticFeedback,
} from "@/hooks/use-mobile-device";
import {
  setSoundEnabled,
  isSoundEnabled,
  setUIInteractionSoundsEnabled,
  isUIInteractionSoundsEnabled,
  playSoundIfEnabled,
} from "@/lib/soundEffects";

interface MobileJungleSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JungleSettings {
  backgroundMusic: boolean;
  soundEffects: boolean;
  reducedMotion: boolean;
}

export default function MobileJungleSettingsPanel({
  isOpen,
  onClose,
}: MobileJungleSettingsPanelProps) {
  const deviceInfo = useMobileDevice();
  const [settings, setSettings] = useState<JungleSettings>({
    backgroundMusic: false,
    soundEffects: true,
    reducedMotion: false,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("mobileJungleSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    } else {
      // Initialize with current sound settings
      setSettings({
        backgroundMusic: isSoundEnabled(),
        soundEffects: isUIInteractionSoundsEnabled(),
        reducedMotion: deviceInfo.prefersReducedMotion,
      });
    }
  }, [deviceInfo.prefersReducedMotion]);

  // Save settings to localStorage and apply changes
  const updateSetting = (key: keyof JungleSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Save to localStorage
    localStorage.setItem("mobileJungleSettings", JSON.stringify(newSettings));

    // Apply the setting
    switch (key) {
      case "backgroundMusic":
        setSoundEnabled(value);
        if (value) {
          // Play a success sound to indicate background music is enabled
          playSoundIfEnabled.success();
        }
        break;
      case "soundEffects":
        setUIInteractionSoundsEnabled(value);
        if (value) {
          // Play a click sound to indicate sound effects are enabled
          playSoundIfEnabled.click();
        }
        break;
      case "reducedMotion":
        // Apply reduced motion preference to document
        if (value) {
          document.documentElement.style.setProperty(
            "--animation-duration",
            "0s",
          );
          document.documentElement.classList.add("reduce-motion");
        } else {
          document.documentElement.style.removeProperty("--animation-duration");
          document.documentElement.classList.remove("reduce-motion");
        }
        break;
    }

    // Haptic feedback for mobile
    if (deviceInfo.hasHaptic) {
      triggerHapticFeedback("light");
    }
  };

  const handleClose = () => {
    if (deviceInfo.hasHaptic) {
      triggerHapticFeedback("medium");
    }
    onClose();
  };

  // Floating jungle elements for ambiance
  const floatingElements = [
    { id: 1, emoji: "🌿", x: 10, y: 20, delay: 0 },
    { id: 2, emoji: "🦋", x: 80, y: 30, delay: 1 },
    { id: 3, emoji: "🌺", x: 20, y: 70, delay: 2 },
    { id: 4, emoji: "🐛", x: 85, y: 80, delay: 3 },
  ];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-h-[80vh] p-0 overflow-hidden jungle-mobile-settings-dialog">
        {/* Floating Jungle Elements */}
        <AnimatePresence>
          {!settings.reducedMotion &&
            floatingElements.map((element) => (
              <motion.div
                key={element.id}
                className="absolute text-lg pointer-events-none select-none z-10 opacity-50"
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [0.8, 1.1, 0.8],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: element.delay,
                  ease: "easeInOut",
                }}
              >
                {element.emoji}
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Parchment/Wood Background Header */}
        <motion.div
          className="bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 p-4 relative overflow-hidden border-b-2 border-amber-200"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(160, 82, 45, 0.1) 0%, transparent 50%),
              linear-gradient(45deg, rgba(222, 184, 135, 0.1) 0%, transparent 100%)
            `,
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Wood grain texture */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                rgba(139, 69, 19, 0.2) 0px,
                rgba(139, 69, 19, 0.2) 1px,
                transparent 1px,
                transparent 8px
              )`,
            }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <TreePine className="w-6 h-6 text-green-700" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-500" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-amber-900">
                  ⚙️ Settings
                </DialogTitle>
                <DialogDescription className="text-amber-700 text-sm">
                  Customize your jungle adventure
                </DialogDescription>
              </div>
            </div>

            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-red-100 hover:bg-red-200 text-red-600 border border-red-300"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Scrollable Settings Content */}
        <div className="flex flex-col min-h-0 flex-1">
          <ScrollArea className="flex-1 min-h-0 max-h-[calc(80vh-120px)] jungle-mobile-category jungle-mobile-scrollarea">
            <motion.div
              className="p-4 space-y-4"
              style={{
                backgroundImage: `
                radial-gradient(circle at 10% 20%, rgba(139, 69, 19, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 90% 80%, rgba(160, 82, 45, 0.05) 0%, transparent 50%),
                linear-gradient(180deg, rgba(222, 184, 135, 0.05) 0%, rgba(245, 245, 220, 0.05) 100%)
              `,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Background Music Setting */}
              <Card className="jungle-setting-card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm flex-shrink-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between min-h-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                        {settings.backgroundMusic ? (
                          <Music className="w-5 h-5 text-green-600" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-green-800 truncate">
                          🎵 Background Music
                        </h3>
                        <p className="text-sm text-green-600 truncate">
                          Peaceful jungle sounds
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.backgroundMusic}
                      onCheckedChange={(value) =>
                        updateSetting("backgroundMusic", value)
                      }
                      className="jungle-switch flex-shrink-0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Sound Effects Setting */}
              <Card className="jungle-setting-card bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 shadow-sm flex-shrink-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between min-h-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                        {settings.soundEffects ? (
                          <Volume2 className="w-5 h-5 text-blue-600" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-blue-800 truncate">
                          🔊 Sound Effects
                        </h3>
                        <p className="text-sm text-blue-600 truncate">
                          Button clicks and game sounds
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.soundEffects}
                      onCheckedChange={(value) =>
                        updateSetting("soundEffects", value)
                      }
                      className="jungle-switch flex-shrink-0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Reduced Motion Setting */}
              <Card className="jungle-setting-card bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 shadow-sm flex-shrink-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between min-h-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-purple-100 rounded-full flex-shrink-0">
                        <Eye className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-purple-800 truncate">
                          👁️ Reduced Motion
                        </h3>
                        <p className="text-sm text-purple-600 truncate">
                          Less animations for comfort
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings.reducedMotion}
                      onCheckedChange={(value) =>
                        updateSetting("reducedMotion", value)
                      }
                      className="jungle-switch flex-shrink-0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bottom decoration */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="flex items-center gap-2 text-amber-600 opacity-60">
                  <Leaf className="w-4 h-4" />
                  <span className="text-xs">
                    Made with 💚 for jungle explorers
                  </span>
                  <Leaf className="w-4 h-4 scale-x-[-1]" />
                </div>
              </div>
            </motion.div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
