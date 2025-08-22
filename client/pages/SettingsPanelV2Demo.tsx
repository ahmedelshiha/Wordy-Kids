import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JungleAdventureSettingsPanelV2 from "@/components/JungleAdventureSettingsPanelV2";

export default function SettingsPanelV2Demo() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            🛠️ Jungle Adventure Settings Panel V2
          </h1>
          <p className="text-lg text-green-700 mb-6">
            Rebuilt from the ground up - lighter, more mobile-friendly, and better integrated
          </p>
          <Button 
            onClick={() => setSettingsOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 text-white font-semibold px-8 py-3 text-lg shadow-lg"
          >
            🚀 Open Settings Panel V2
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm">
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
                  <div className="text-sm text-gray-600">Accordion layout on mobile, cards on desktop</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">🎵</span>
                <div>
                  <div className="font-medium">Enhanced Audio Integration</div>
                  <div className="text-sm text-gray-600">Better voice controls and ambient sound support</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">⚡</span>
                <div>
                  <div className="font-medium">Lightweight & Fast</div>
                  <div className="text-sm text-gray-600">Streamlined from 6 tabs to 4 focused sections</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">🎨</span>
                <div>
                  <div className="font-medium">Jungle Theme Optimized</div>
                  <div className="text-sm text-gray-600">Parchment background with nature-inspired styling</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                🔧 Technical Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-green-500 mt-1">💾</span>
                <div>
                  <div className="font-medium">Smart Persistence</div>
                  <div className="text-sm text-gray-600">localStorage with real-time updates</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-500 mt-1">🎯</span>
                <div>
                  <div className="font-medium">Haptic Feedback</div>
                  <div className="text-sm text-gray-600">Vibration support on mobile devices</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-500 mt-1">♿</span>
                <div>
                  <div className="font-medium">Accessibility First</div>
                  <div className="text-sm text-gray-600">Screen reader support, keyboard navigation</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 mt-1">🌐</span>
                <div>
                  <div className="font-medium">Cross-Platform</div>
                  <div className="text-sm text-gray-600">Works seamlessly across all devices</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🎵</div>
              <div className="font-semibold text-green-800">Sound & Voice</div>
              <div className="text-xs text-green-700">Audio controls, ambient sounds, voice selection</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-semibold text-yellow-800">Theme & Motion</div>
              <div className="text-xs text-yellow-700">Visual themes, dark mode, animations</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold text-blue-800">Learning & Family</div>
              <div className="text-xs text-blue-700">Difficulty, goals, parental controls</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">♿</div>
              <div className="font-semibold text-purple-800">Accessibility</div>
              <div className="text-xs text-purple-700">Text size, haptics, captions</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            🎯 This demo shows the V2 settings panel in action. Try it on different devices to see the responsive behavior!
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              📱 <span>Mobile: Accordion</span>
            </span>
            <span className="flex items-center gap-1">
              💻 <span>Desktop: Cards</span>
            </span>
            <span className="flex items-center gap-1">
              🎮 <span>Touch: Haptics</span>
            </span>
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
