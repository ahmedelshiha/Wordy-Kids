import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Smartphone, TreePine, Sparkles } from "lucide-react";
import MobileJungleSettingsPanel from "@/components/MobileJungleSettingsPanel";
import { useMobileDevice } from "@/hooks/use-mobile-device";
import "@/styles/mobile-jungle-settings.css";

export default function MobileSettingsDemo() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const deviceInfo = useMobileDevice();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <TreePine className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-green-800">
              Mobile Settings Demo
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </div>
          <p className="text-green-600">
            Experience the optimized jungle adventure settings panel for mobile
            devices
          </p>
        </div>

        {/* Device Info Card */}
        <Card className="bg-white/80 backdrop-blur border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Smartphone className="w-5 h-5" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Device Type:</span>
                <span className="ml-2 text-green-600">
                  {deviceInfo.isMobile
                    ? "📱 Mobile"
                    : deviceInfo.isTablet
                      ? "📱 Tablet"
                      : "💻 Desktop"}
                </span>
              </div>
              <div>
                <span className="font-medium">Screen Size:</span>
                <span className="ml-2 text-green-600 capitalize">
                  {deviceInfo.screenSize}
                </span>
              </div>
              <div>
                <span className="font-medium">Has Touch:</span>
                <span className="ml-2 text-green-600">
                  {deviceInfo.hasTouch ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div>
                <span className="font-medium">Has Haptic:</span>
                <span className="ml-2 text-green-600">
                  {deviceInfo.hasHaptic ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div>
                <span className="font-medium">Orientation:</span>
                <span className="ml-2 text-green-600 capitalize">
                  {deviceInfo.orientation}
                </span>
              </div>
              <div>
                <span className="font-medium">Reduced Motion:</span>
                <span className="ml-2 text-green-600">
                  {deviceInfo.prefersReducedMotion ? "✅ Yes" : "❌ No"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card className="bg-white/80 backdrop-blur border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">
              Mobile Settings Panel Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-lg">🎨</span>
                <div>
                  <h4 className="font-medium text-green-800">
                    Parchment & Wood Background
                  </h4>
                  <p className="text-sm text-green-600">
                    Beautiful jungle-themed design with texture
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-lg">📱</span>
                <div>
                  <h4 className="font-medium text-green-800">
                    Mobile Optimized
                  </h4>
                  <p className="text-sm text-green-600">
                    Max height ~80vh, perfectly sized for mobile screens
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-lg">📜</span>
                <div>
                  <h4 className="font-medium text-green-800">
                    Scrollable Content
                  </h4>
                  <p className="text-sm text-green-600">
                    Smooth scrolling when content exceeds viewport
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-lg">🎵</span>
                <div>
                  <h4 className="font-medium text-green-800">
                    Jungle-Styled Toggles
                  </h4>
                  <p className="text-sm text-green-600">
                    Background Music, Sound Effects, and Reduced Motion controls
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-500 text-lg">❌</span>
                <div>
                  <h4 className="font-medium text-green-800">
                    Styled Close Button
                  </h4>
                  <p className="text-sm text-green-600">
                    Easy-to-tap close button with haptic feedback
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Button */}
        <div className="text-center">
          <Button
            onClick={() => setIsSettingsOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105"
          >
            <Settings className="w-5 h-5 mr-2" />
            Open Settings Panel
          </Button>
        </div>

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌟</span>
              <div>
                <h4 className="font-medium text-amber-800 mb-1">Try It Out!</h4>
                <p className="text-sm text-amber-700">
                  Tap the button above to open the mobile settings panel.
                  {deviceInfo.hasHaptic &&
                    " You'll feel haptic feedback on supported devices!"}
                  The panel features beautiful jungle-themed styling with wood
                  and parchment textures, smooth animations (unless you have
                  reduced motion enabled), and intuitive toggle controls.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Settings Panel */}
      <MobileJungleSettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
