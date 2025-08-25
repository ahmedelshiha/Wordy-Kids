import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnhancedMobileWordLibraryHeader from "@/components/EnhancedMobileWordLibraryHeader";
import {
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  Zap,
  Star,
  Heart,
  Target,
  Settings,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
} from "lucide-react";

export default function EnhancedMobileWordLibraryHeaderDemo() {
  // Demo state
  const [selectedCategory, setSelectedCategory] = useState("animals");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deviceMode, setDeviceMode] = useState<"mobile" | "tablet" | "desktop">(
    "mobile",
  );

  // Accessibility settings
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeTextMode, setLargeTextMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Demo progress data
  const [demoProgress, setDemoProgress] = useState({
    totalWords: 156,
    completedWords: 42,
    streakDays: 7,
  });

  const deviceModes = {
    mobile: { width: 375, height: 667, label: "📱 Mobile" },
    tablet: { width: 768, height: 1024, label: "📱 Tablet" },
    desktop: { width: 1200, height: 800, label: "🖥️ Desktop" },
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Simulate progress update
    if (categoryId !== selectedCategory) {
      setDemoProgress((prev) => ({
        ...prev,
        completedWords: prev.completedWords + 1,
      }));
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    console.log("Demo search:", term);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Demo Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-jungle to-sunshine bg-clip-text text-transparent mb-4">
              🌿 Enhanced Mobile Word Library Header 🦋
            </h1>
            <p className="text-lg text-slate-600 mb-6">
              Premium mobile-first component with integrated category selection,
              search, and jungle adventure theming
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Badge className="bg-jungle text-white px-4 py-2 text-sm font-semibold rounded-full">
                🎯 Quick Categories
              </Badge>
              <Badge className="bg-educational-blue text-white px-4 py-2 text-sm font-semibold rounded-full">
                🔍 Smart Search
              </Badge>
              <Badge className="bg-educational-purple text-white px-4 py-2 text-sm font-semibold rounded-full">
                📊 Progress Tracking
              </Badge>
              <Badge className="bg-sunshine text-jungle-dark px-4 py-2 text-sm font-semibold rounded-full">
                ✨ Premium Design
              </Badge>
              <Badge className="bg-educational-green text-white px-4 py-2 text-sm font-semibold rounded-full">
                📱 Mobile Optimized
              </Badge>
            </div>
          </motion.div>
        </div>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
            <TabsTrigger value="preview">🎯 Live Preview</TabsTrigger>
            <TabsTrigger value="features">✨ Features</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-6">
            {/* Device Mode Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Device Mode Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(deviceModes).map(([mode, config]) => (
                    <Button
                      key={mode}
                      variant={deviceMode === mode ? "default" : "outline"}
                      onClick={() => setDeviceMode(mode as typeof deviceMode)}
                      className="flex items-center gap-2"
                    >
                      {config.label}
                      <span className="text-xs text-slate-500">
                        {config.width}×{config.height}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interactive Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Interactive Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <motion.div
                    className="border-4 border-slate-300 rounded-3xl bg-white shadow-2xl overflow-hidden"
                    style={{
                      width: Math.min(deviceModes[deviceMode].width, 500),
                      height: Math.min(deviceModes[deviceMode].height, 600),
                    }}
                    layout
                    transition={{ duration: 0.5 }}
                  >
                    {/* Simulated Mobile Device */}
                    <div className="h-full overflow-auto relative">
                      {/* Status Bar Simulation */}
                      <div className="h-6 bg-black flex items-center justify-between px-4 text-white text-xs">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-2 border border-white rounded-sm">
                            <div className="w-3 h-1 bg-white rounded-sm"></div>
                          </div>
                          <span>📶</span>
                          <span>📶</span>
                        </div>
                      </div>

                      {/* Enhanced Mobile Word Library Header */}
                      <EnhancedMobileWordLibraryHeader
                        title={
                          selectedCategory
                            ? `🌳 ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Adventure 🦋`
                            : "🌿 Jungle Word Adventure Library 🦋"
                        }
                        selectedCategory={selectedCategory}
                        onCategorySelect={handleCategorySelect}
                        onBack={() => {
                          setSelectedCategory("");
                          console.log("Back button pressed");
                        }}
                        onSearch={handleSearch}
                        onViewModeToggle={toggleViewMode}
                        viewMode={viewMode}
                        showQuickCategories={true}
                        showSearch={true}
                        showStats={true}
                        totalWords={demoProgress.totalWords}
                        completedWords={demoProgress.completedWords}
                        streakDays={demoProgress.streakDays}
                        highContrastMode={highContrastMode}
                        reducedMotion={reducedMotion}
                        largeTextMode={largeTextMode}
                      />

                      {/* Simulated Content Area */}
                      <div className="p-4 space-y-4">
                        <div className="bg-slate-100 rounded-lg p-4 text-center">
                          <p className="text-slate-600 text-sm">
                            📚 Word content would appear here
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Selected: {selectedCategory || "No category"}
                          </p>
                          <p className="text-xs text-slate-500">
                            Search: "{searchTerm || "None"}"
                          </p>
                          <p className="text-xs text-slate-500">
                            View: {viewMode}
                          </p>
                        </div>

                        {/* Demo Word Cards */}
                        <div
                          className={`grid gap-3 ${viewMode === "grid" ? "grid-cols-2" : "grid-cols-1"}`}
                        >
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="bg-white rounded-lg p-3 shadow-sm border"
                            >
                              <div className="text-2xl mb-2">
                                {i === 1
                                  ? "🦁"
                                  : i === 2
                                    ? "🐯"
                                    : i === 3
                                      ? "🐘"
                                      : "🦒"}
                              </div>
                              <div className="text-sm font-semibold">
                                Demo Word {i}
                              </div>
                              <div className="text-xs text-slate-500">
                                Sample definition
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Demo Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-jungle/5 rounded-lg">
                    <div className="text-2xl font-bold text-jungle">
                      {demoProgress.totalWords}
                    </div>
                    <div className="text-sm text-jungle/70">Total Words</div>
                  </div>
                  <div className="text-center p-4 bg-sunshine/5 rounded-lg">
                    <div className="text-2xl font-bold text-sunshine-dark">
                      {demoProgress.completedWords}
                    </div>
                    <div className="text-sm text-sunshine-dark/70">
                      Completed
                    </div>
                  </div>
                  <div className="text-center p-4 bg-educational-blue/5 rounded-lg">
                    <div className="text-2xl font-bold text-educational-blue">
                      {demoProgress.streakDays}
                    </div>
                    <div className="text-sm text-educational-blue/70">
                      Day Streak
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Premium Design Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Premium Design Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-jungle rounded-full"></div>
                    <span className="text-sm">
                      Glass morphism effects with backdrop blur
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-sunshine rounded-full"></div>
                    <span className="text-sm">
                      Animated jungle adventure theme
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-educational-purple rounded-full"></div>
                    <span className="text-sm">Floating emoji animations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-educational-blue rounded-full"></div>
                    <span className="text-sm">Premium gradient overlays</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-educational-green rounded-full"></div>
                    <span className="text-sm">
                      Micro-interactions and haptic feedback
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Interactive Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-jungle rounded-full"></div>
                    <span className="text-sm">
                      Horizontal scrolling category selector
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-sunshine rounded-full"></div>
                    <span className="text-sm">
                      Real-time search with auto-complete
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-educational-purple rounded-full"></div>
                    <span className="text-sm">
                      Progress tracking with animations
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-educational-blue rounded-full"></div>
                    <span className="text-sm">Touch-optimized interface</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-educational-green rounded-full"></div>
                    <span className="text-sm">Smart category auto-scroll</span>
                  </div>
                </CardContent>
              </Card>

              {/* Accessibility Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Accessibility Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-jungle rounded-full"></div>
                    <span className="text-sm">High contrast mode support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-sunshine rounded-full"></div>
                    <span className="text-sm">Reduced motion preferences</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-educational-purple rounded-full"></div>
                    <span className="text-sm">Large text mode</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-educational-blue rounded-full"></div>
                    <span className="text-sm">Screen reader optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-educational-green rounded-full"></div>
                    <span className="text-sm">Keyboard navigation support</span>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Optimizations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Mobile Optimizations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-jungle rounded-full"></div>
                    <span className="text-sm">44px minimum touch targets</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-sunshine rounded-full"></div>
                    <span className="text-sm">
                      Prevent iOS zoom on input focus
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-educational-purple rounded-full"></div>
                    <span className="text-sm">
                      Optimized scroll performance
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-educational-blue rounded-full"></div>
                    <span className="text-sm">Responsive breakpoints</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-educational-green rounded-full"></div>
                    <span className="text-sm">PWA-ready design</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Accessibility & Demo Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Accessibility Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-jungle">
                    Accessibility Settings
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4" />
                      <span>High Contrast Mode</span>
                    </div>
                    <Button
                      variant={highContrastMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHighContrastMode(!highContrastMode)}
                    >
                      {highContrastMode ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4" />
                      <span>Reduced Motion</span>
                    </div>
                    <Button
                      variant={reducedMotion ? "default" : "outline"}
                      size="sm"
                      onClick={() => setReducedMotion(!reducedMotion)}
                    >
                      {reducedMotion ? "On" : "Off"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">Aa</span>
                      <span>Large Text Mode</span>
                    </div>
                    <Button
                      variant={largeTextMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setLargeTextMode(!largeTextMode)}
                    >
                      {largeTextMode ? "Large" : "Normal"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-4 h-4" />
                      <span>Sound Effects</span>
                    </div>
                    <Button
                      variant={soundEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Demo Progress Controls */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-jungle">
                    Demo Progress Controls
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Total Words</label>
                      <input
                        type="number"
                        value={demoProgress.totalWords}
                        onChange={(e) =>
                          setDemoProgress((prev) => ({
                            ...prev,
                            totalWords: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Completed</label>
                      <input
                        type="number"
                        value={demoProgress.completedWords}
                        onChange={(e) =>
                          setDemoProgress((prev) => ({
                            ...prev,
                            completedWords: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Streak Days</label>
                      <input
                        type="number"
                        value={demoProgress.streakDays}
                        onChange={(e) =>
                          setDemoProgress((prev) => ({
                            ...prev,
                            streakDays: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setDemoProgress({
                        totalWords: 156,
                        completedWords: 42,
                        streakDays: 7,
                      });
                      setSelectedCategory("animals");
                      setSearchTerm("");
                    }}
                    className="w-full"
                  >
                    Reset Demo Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>
            🌿 Enhanced Mobile Word Library Header Demo • Built with Premium UX
            Principles 🦋
          </p>
        </div>
      </div>
    </div>
  );
}
