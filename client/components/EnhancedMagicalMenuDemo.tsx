import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedMagicalAdventureMenu } from "@/components/EnhancedMagicalAdventureMenu";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Star,
  Heart,
  Crown,
  Wand2,
  Gamepad2,
  BookOpen,
  Trophy,
  Settings,
  Users,
} from "lucide-react";

interface EnhancedMagicalMenuDemoProps {
  className?: string;
}

export function EnhancedMagicalMenuDemo({
  className,
}: EnhancedMagicalMenuDemoProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [demoMessage, setDemoMessage] = useState(
    "Welcome to the Enhanced Magical Adventure Menu! 🌟",
  );
  const [achievementCount, setAchievementCount] = useState(5);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const messages = {
      dashboard:
        "🏠 Welcome home, young adventurer! Your magical journey begins here.",
      learn: "📚 Time to discover new words and unlock magical knowledge! ✨",
      quiz: "🎮 Ready for an exciting quiz adventure? Let's test your skills!",
      progress:
        "🗺️ Explore your incredible learning journey and see how far you've come!",
      achievements:
        "🏆 Wow! Look at all your amazing achievements and trophies!",
      games: "🎯 Extra fun games await! Let's play and learn together!",
    };
    setDemoMessage(
      messages[tab as keyof typeof messages] || "🌟 Magical adventure awaits!",
    );
  };

  const handleSettingsClick = () => {
    setDemoMessage(
      "⚙️ Settings opened! Customize your magical learning experience.",
    );
  };

  const handleParentClick = () => {
    setDemoMessage(
      "👨‍👩‍👧‍👦 Family Zone activated! Parents can track progress here.",
    );
  };

  const handleAdminClick = () => {
    setDemoMessage(
      "🛡️ Admin panel accessed! Ultimate control at your fingertips.",
    );
  };

  const addAchievement = () => {
    setAchievementCount((prev) => prev + 1);
    setDemoMessage(
      `🎉 New achievement unlocked! You now have ${achievementCount + 1} badges!`,
    );
  };

  const features = [
    {
      icon: <Wand2 className="w-6 h-6 text-purple-600" />,
      title: "Bottom Positioned Dialogs",
      description:
        "All popup dialogs now appear at the bottom for better mobile visibility and easier thumb access.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-blue-600" />,
      title: "Enhanced Animations",
      description:
        "Magical floating elements, shimmer effects, and smooth spring animations create a delightful experience.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      title: "Better Icon Accessibility",
      description:
        "Larger touch targets, clearer visual hierarchy, and improved contrast for better usability.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Heart className="w-6 h-6 text-red-600" />,
      title: "Improved Visibility",
      description:
        "Enhanced gradients, better backdrop blur, and strategic use of shadows for optimal visibility.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: <Crown className="w-6 h-6 text-amber-600" />,
      title: "Category Organization",
      description:
        "Menu items are logically grouped with visual cues and descriptions for easier navigation.",
      color: "from-amber-500 to-yellow-500",
    },
    {
      icon: <Gamepad2 className="w-6 h-6 text-green-600" />,
      title: "Interactive Feedback",
      description:
        "Haptic-like feedback through animations, hover states, and selection highlighting.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 relative overflow-hidden",
        className,
      )}
    >
      {/* Floating background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 text-6xl opacity-20"
        >
          🌟
        </motion.div>
        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-20 text-5xl opacity-15"
        >
          🦋
        </motion.div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 left-20 text-4xl opacity-10"
        >
          🌺
        </motion.div>
      </div>

      <div className="relative z-10 p-6 pb-32">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl mb-4"
          >
            ✨
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Enhanced Magical Adventure Menu
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the new and improved magical menu with bottom-positioned
            dialogs, enhanced animations, and better accessibility for young
            learners.
          </p>
        </div>

        {/* Demo Message Display */}
        <motion.div
          key={demoMessage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-100 via-yellow-50 to-amber-100 border-2 border-yellow-300 rounded-2xl p-6 mb-8 text-center"
        >
          <p className="text-lg font-semibold text-amber-800">{demoMessage}</p>
        </motion.div>

        {/* Interactive Demo Controls */}
        <Card className="mb-8 border-2 border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-purple-600" />
              Interactive Demo Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              onClick={addAchievement}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Add Achievement
            </Button>
            <Button
              onClick={() => setActiveTab("learn")}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Switch to Learn
            </Button>
            <Button
              onClick={() =>
                setDemoMessage(
                  "🎨 Menu customization coming soon! Stay tuned for more magical features.",
                )
              }
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Settings className="w-5 h-5 mr-2" />
              Customize Menu
            </Button>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-2 border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-6">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-lg",
                      feature.color,
                    )}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Usage Instructions */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-blue-600" />
              How to Use the Enhanced Menu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-purple-700 mb-2">
                  🎯 Navigation
                </h4>
                <p className="text-gray-600 text-sm">
                  Tap any main navigation icon at the bottom to switch between
                  different sections. The menu responds with delightful
                  animations and visual feedback.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-green-700 mb-2">
                  🎪 More Options
                </h4>
                <p className="text-gray-600 text-sm">
                  Tap the "More" button (🎪) to open the magical adventure menu
                  with additional features, settings, and family controls.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-pink-700 mb-2">
                  📱 Bottom Positioning
                </h4>
                <p className="text-gray-600 text-sm">
                  All dialogs and menus now appear at the bottom of the screen
                  for better thumb accessibility on mobile devices.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-amber-700 mb-2">
                  ✨ Animations
                </h4>
                <p className="text-gray-600 text-sm">
                  Enjoy enhanced animations including floating elements, shimmer
                  effects, and spring transitions that make learning more
                  engaging.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Magical Adventure Menu */}
      <EnhancedMagicalAdventureMenu
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSettingsClick={handleSettingsClick}
        onParentClick={handleParentClick}
        onAdminClick={handleAdminClick}
        achievementCount={achievementCount}
        userRole="child"
      />
    </div>
  );
}
