import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JungleAdventureSettingsPanelV2 from "@/components/JungleAdventureSettingsPanelV2";
import JungleThemeOverlay from "@/components/JungleThemeOverlay";
import { JungleAdventureThemeManager, JungleTheme } from "@/lib/JungleAdventureThemeManager";
import "@/styles/jungle-theme.css";

export default function SettingsPanelV2Demo() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<JungleTheme>('parchment');
  const [overlays, setOverlays] = useState(JungleAdventureThemeManager.getOverlays());
  const [showOverlays, setShowOverlays] = useState(true);

  // Initialize theme system
  useEffect(() => {
    JungleAdventureThemeManager.init();
    setCurrentTheme(JungleAdventureThemeManager.getTheme());
  }, []);

  // Update theme when changed
  const handleThemeChange = (theme: JungleTheme) => {
    setCurrentTheme(theme);
    JungleAdventureThemeManager.applyTheme(theme);
  };

  // Update overlays when changed
  const handleOverlayChange = (key: keyof typeof overlays, value: boolean) => {
    const newOverlays = { ...overlays, [key]: value };
    setOverlays(newOverlays);
    JungleAdventureThemeManager.applyOverlays(newOverlays);
  };

  return (
    <div className="min-h-screen jng-surface p-4 relative">
      {/* Jungle Theme Overlays */}
      {showOverlays && (
        <JungleThemeOverlay
          fireflies={overlays.fireflies}
          fog={overlays.fog}
          glow={overlays.glow}
          ripples={overlays.ripples}
          seed={42}
        />
      )}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            🛠️ Jungle Adventure Settings Panel V2
          </h1>
          <p className="text-lg text-white/90 mb-6 drop-shadow">
            Enhanced with theme system, animated overlays, and full accessibility
          </p>

          {/* Theme Selector */}
          <div className="mb-6 bg-white/20 backdrop-blur-sm rounded-lg p-4 inline-block">
            <h3 className="text-white font-semibold mb-3">🎨 Theme Preview</h3>
            <div className="flex gap-2 flex-wrap justify-center">
              {(['parchment', 'jungle', 'canopy', 'river', 'sunset'] as const).map(theme => (
                <Button
                  key={theme}
                  variant={currentTheme === theme ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleThemeChange(theme)}
                  className={`${currentTheme === theme ? 'bg-white text-black' : 'text-white border-white/50 hover:bg-white/20'}`}
                >
                  {theme === 'parchment' && '📜'}
                  {theme === 'jungle' && '🌿'}
                  {theme === 'canopy' && '🌫️'}
                  {theme === 'river' && '🌊'}
                  {theme === 'sunset' && '🌅'}
                  {' '}
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Overlay Controls */}
          <div className="mb-6 bg-white/20 backdrop-blur-sm rounded-lg p-4 inline-block ml-4">
            <h3 className="text-white font-semibold mb-3">✨ Animated Overlays</h3>
            <div className="flex gap-3 flex-wrap justify-center items-center">
              <Button
                variant={showOverlays ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowOverlays(!showOverlays)}
                className={`${showOverlays ? 'bg-white text-black' : 'text-white border-white/50 hover:bg-white/20'}`}
              >
                {showOverlays ? '👁️ Hide' : '👁️ Show'} Overlays
              </Button>
              {(['fireflies', 'fog', 'glow', 'ripples'] as const).map(overlay => (
                <Button
                  key={overlay}
                  variant={overlays[overlay] ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleOverlayChange(overlay, !overlays[overlay])}
                  className={`${overlays[overlay] ? 'bg-white text-black' : 'text-white border-white/50 hover:bg-white/20'}`}
                >
                  {overlay === 'fireflies' && '🌟'}
                  {overlay === 'fog' && '🌫️'}
                  {overlay === 'glow' && '✨'}
                  {overlay === 'ripples' && '💧'}
                  {' '}
                  {overlay.charAt(0).toUpperCase() + overlay.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Button
              onClick={() => setSettingsOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-white font-semibold px-8 py-3 text-lg shadow-lg"
            >
              🚀 Open Settings Panel V2
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-md border-white/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                ✨ What's New in V2
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-1">📱</span>
                <div>
                  <div className="font-medium">Mobile-First Design</div>
                  <div className="text-sm text-gray-600">
                    Accordion layout on mobile, cards on desktop
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">🎵</span>
                <div>
                  <div className="font-medium">Enhanced Audio Integration</div>
                  <div className="text-sm text-gray-600">
                    Better voice controls and ambient sound support
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">⚡</span>
                <div>
                  <div className="font-medium">Lightweight & Fast</div>
                  <div className="text-sm text-gray-600">
                    Streamlined from 6 tabs to 4 focused sections
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">🎨</span>
                <div>
                  <div className="font-medium">Jungle Theme Optimized</div>
                  <div className="text-sm text-gray-600">
                    Parchment background with nature-inspired styling
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-md border-white/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                🔧 Enhanced Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-1">💾</span>
                <div>
                  <div className="font-medium">Smart Persistence</div>
                  <div className="text-sm text-gray-600">
                    localStorage with real-time updates
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">🎯</span>
                <div>
                  <div className="font-medium">Haptic Feedback</div>
                  <div className="text-sm text-gray-600">
                    Vibration support on mobile devices
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">♿</span>
                <div>
                  <div className="font-medium">Accessibility First</div>
                  <div className="text-sm text-gray-600">
                    Screen reader support, keyboard navigation
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">🌐</span>
                <div>
                  <div className="font-medium">Cross-Platform</div>
                  <div className="text-sm text-gray-600">
                    Works seamlessly across all devices
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-100/90 to-green-200/90 border-green-300 backdrop-blur-sm shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🎵</div>
              <div className="font-semibold text-green-800">Sound & Voice</div>
              <div className="text-xs text-green-700">
                Audio controls, ambient sounds, voice selection
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-100/90 to-yellow-200/90 border-yellow-300 backdrop-blur-sm shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-semibold text-yellow-800">
                Theme & Motion
              </div>
              <div className="text-xs text-yellow-700">
                Visual themes, overlays, animations
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100/90 to-blue-200/90 border-blue-300 backdrop-blur-sm shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold text-blue-800">
                Learning & Family
              </div>
              <div className="text-xs text-blue-700">
                Difficulty, goals, parental controls
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100/90 to-purple-200/90 border-purple-300 backdrop-blur-sm shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">♿</div>
              <div className="font-semibold text-purple-800">Accessibility</div>
              <div className="text-xs text-purple-700">
                Text size, haptics, captions
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 inline-block">
            <p className="text-sm text-white/90 mb-4">
              🎯 Interactive demo with live theme switching and animated overlays.
              Settings persist across sessions!
            </p>
            <div className="flex justify-center gap-4 text-sm flex-wrap">
              <span className="flex items-center gap-1 text-white/80">
                📱 <span>Mobile: Accordion</span>
              </span>
              <span className="flex items-center gap-1 text-white/80">
                💻 <span>Desktop: Cards</span>
              </span>
              <span className="flex items-center gap-1 text-white/80">
                🎮 <span>Touch: Haptics</span>
              </span>
              <span className="flex items-center gap-1 text-white/80">
                ✨ <span>Live: Theme Previews</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <JungleAdventureSettingsPanelV2
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}
