import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  Accessibility,
  Zap,
  Star,
  Heart,
  Trophy,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Brain,
  Volume2,
  Eye,
  Gamepad2,
} from "lucide-react";
import { EnhancedWordLibrary } from "@/components/EnhancedWordLibrary";

export function EnhancedWordLibraryDemo() {
  const [showDemo, setShowDemo] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(
    new Set(),
  );
  const [deviceMode, setDeviceMode] = useState<"mobile" | "desktop">("mobile");
  const [userInterests, setUserInterests] = useState<string[]>([
    "animals",
    "nature",
  ]);

  // Simulate mobile/desktop detection
  useEffect(() => {
    const checkDevice = () => {
      setDeviceMode(window.innerWidth <= 768 ? "mobile" : "desktop");
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const features = [
    {
      id: "accessibility",
      name: "Enhanced Accessibility",
      description:
        "Screen reader support, keyboard navigation, high contrast mode",
      icon: Accessibility,
      color: "bg-blue-500",
      highlights: [
        "ARIA labels and landmarks",
        "Keyboard shortcuts",
        "High contrast mode",
        "Large text option",
        "Screen reader announcements",
        "Focus management",
      ],
    },
    {
      id: "mobile",
      name: "Mobile Optimization",
      description: "Touch gestures, haptic feedback, responsive design",
      icon: Smartphone,
      color: "bg-green-500",
      highlights: [
        "Swipe gestures for navigation",
        "Haptic feedback",
        "Touch-friendly targets (44px min)",
        "Mobile-first responsive design",
        "Hardware acceleration",
        "Reduced motion options",
      ],
    },
    {
      id: "animations",
      name: "Enhanced Animations",
      description: "Smooth transitions, performance optimized",
      icon: Zap,
      color: "bg-purple-500",
      highlights: [
        "Hardware-accelerated animations",
        "Mobile-optimized performance",
        "Reduced motion respect",
        "Touch feedback animations",
        "Loading states",
        "Micro-interactions",
      ],
    },
    {
      id: "vocabulary",
      name: "Advanced Vocabulary Builder",
      description: "Spaced repetition, progress tracking, gamification",
      icon: Brain,
      color: "bg-orange-500",
      highlights: [
        "Spaced repetition algorithm",
        "Progress tracking",
        "Difficulty adaptation",
        "Achievement system",
        "Session management",
        "Performance analytics",
      ],
    },
    {
      id: "audio",
      name: "Audio Features",
      description: "Text-to-speech, pronunciation guide",
      icon: Volume2,
      color: "bg-pink-500",
      highlights: [
        "Real speech synthesis",
        "Pronunciation guides",
        "Auto-play options",
        "Audio feedback",
        "Voice announcements",
        "Audio cues",
      ],
    },
    {
      id: "visual",
      name: "Visual Enhancements",
      description: "Beautiful design, dark mode, customization",
      icon: Eye,
      color: "bg-indigo-500",
      highlights: [
        "Modern card design",
        "Educational color palette",
        "Dark/high contrast modes",
        "Customizable text sizes",
        "Visual feedback",
        "Intuitive iconography",
      ],
    },
  ];

  const toggleFeature = (featureId: string) => {
    const newFeatures = new Set(selectedFeatures);
    if (newFeatures.has(featureId)) {
      newFeatures.delete(featureId);
    } else {
      newFeatures.add(featureId);
    }
    setSelectedFeatures(newFeatures);
  };

  if (showDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <EnhancedWordLibrary
          onBack={() => setShowDemo(false)}
          userInterests={userInterests}
          enableAdvancedFeatures={true}
          showMobileOptimizations={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-educational-blue to-educational-purple p-4 rounded-full shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-4">
            Enhanced Word Library
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Experience the next generation of educational word learning with
            advanced mobile optimization, accessibility features, and engaging
            interactions designed for modern learners.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge className="bg-educational-green text-white px-4 py-2 text-sm">
              <Accessibility className="w-4 h-4 mr-2" />
              WCAG 2.1 AA Compliant
            </Badge>
            <Badge className="bg-educational-blue text-white px-4 py-2 text-sm">
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile-First Design
            </Badge>
            <Badge className="bg-educational-purple text-white px-4 py-2 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              Hardware Accelerated
            </Badge>
            <Badge className="bg-educational-orange text-white px-4 py-2 text-sm">
              <Trophy className="w-4 h-4 mr-2" />
              Gamified Learning
            </Badge>
          </div>
        </div>

        {/* Device Mode Toggle */}
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Current Device Mode
            </h3>
            <div className="flex items-center justify-center gap-4">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  deviceMode === "mobile"
                    ? "bg-educational-blue text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>Mobile</span>
              </div>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  deviceMode === "desktop"
                    ? "bg-educational-blue text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span>Desktop</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">
              Automatically detected based on screen size
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center text-slate-800">
            🌟 Enhanced Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedFeatures.has(feature.id);

              return (
                <Card
                  key={feature.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                    isSelected ? "ring-2 ring-educational-blue shadow-xl" : ""
                  }`}
                  onClick={() => toggleFeature(feature.id)}
                >
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div
                        className={`${feature.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {feature.name}
                      </h3>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-700 text-sm mb-2">
                        Key Features:
                      </h4>
                      <div className="space-y-1">
                        {feature.highlights.map((highlight, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs text-slate-600"
                          >
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-4 p-3 bg-educational-blue/10 rounded-lg border border-educational-blue/20">
                        <p className="text-xs text-educational-blue font-medium text-center">
                          ✓ Feature will be highlighted in demo
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Demo Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-educational-orange" />
              Demo Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-educational-blue">
                  1500+
                </div>
                <div className="text-sm text-slate-600">Words Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-educational-green">
                  15+
                </div>
                <div className="text-sm text-slate-600">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-educational-purple">
                  6
                </div>
                <div className="text-sm text-slate-600">Enhanced Features</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-educational-orange">
                  100%
                </div>
                <div className="text-sm text-slate-600">Mobile Optimized</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Features Highlight */}
        {deviceMode === "mobile" && (
          <Card className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10 border-educational-blue/20">
            <CardContent className="p-6">
              <div className="text-center">
                <Smartphone className="w-12 h-12 text-educational-blue mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Mobile-Optimized Experience
                </h3>
                <p className="text-slate-600 mb-4">
                  You're viewing on a mobile device! The demo includes special
                  mobile features:
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Swipe gestures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Haptic feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Touch-friendly UI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Optimized animations</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Personalization Demo</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <p className="text-slate-600 mb-4">
                Select your interests to see personalized category
                recommendations:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "animals",
                  "nature",
                  "food",
                  "sports",
                  "science",
                  "music",
                ].map((interest) => (
                  <Button
                    key={interest}
                    size="sm"
                    variant={
                      userInterests.includes(interest) ? "default" : "outline"
                    }
                    onClick={() => {
                      if (userInterests.includes(interest)) {
                        setUserInterests(
                          userInterests.filter((i) => i !== interest),
                        );
                      } else {
                        setUserInterests([...userInterests, interest]);
                      }
                    }}
                    className="capitalize"
                  >
                    {interest}
                  </Button>
                ))}
              </div>
              {userInterests.length > 0 && (
                <p className="text-sm text-educational-blue mt-2">
                  ✓ Categories matching your interests will be highlighted in
                  the demo
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Ready to Experience the Enhanced Word Library?
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              See all the improvements in action with our interactive demo.
              {selectedFeatures.size > 0 &&
                ` Your selected features (${selectedFeatures.size}) will be highlighted.`}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowDemo(true)}
                className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink text-white hover:from-educational-blue/90 hover:via-educational-purple/90 hover:to-educational-pink/90 text-xl px-8 py-4 rounded-full font-bold transform hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <Gamepad2 className="w-6 h-6 mr-2" />
                🚀 Launch Interactive Demo 🚀
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setSelectedFeatures(new Set(features.map((f) => f.id)));
                }}
                className="text-lg px-6 py-4 rounded-full"
              >
                <Star className="w-5 h-5 mr-2" />
                Select All Features
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {selectedFeatures.size > 0 && (
                <Badge className="bg-educational-green text-white px-3 py-1">
                  {selectedFeatures.size} feature
                  {selectedFeatures.size !== 1 ? "s" : ""} selected
                </Badge>
              )}
              {userInterests.length > 0 && (
                <Badge className="bg-educational-purple text-white px-3 py-1">
                  {userInterests.length} interest
                  {userInterests.length !== 1 ? "s" : ""} selected
                </Badge>
              )}
              <Badge className="bg-educational-orange text-white px-3 py-1">
                {deviceMode} optimized
              </Badge>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle className="text-center">
              Technical Improvements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-educational-orange" />
                  Performance Optimizations
                </h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Hardware-accelerated animations</li>
                  <li>• Optimized touch event handling</li>
                  <li>• Reduced layout thrashing</li>
                  <li>• Efficient re-rendering</li>
                  <li>• Lazy loading for large datasets</li>
                  <li>• Memory usage optimization</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-educational-pink" />
                  User Experience Enhancements
                </h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>• Intuitive gesture controls</li>
                  <li>• Consistent feedback patterns</li>
                  <li>• Contextual help and guidance</li>
                  <li>• Progressive disclosure</li>
                  <li>• Error prevention and recovery</li>
                  <li>• Personalized recommendations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
