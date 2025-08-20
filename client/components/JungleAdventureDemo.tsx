import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TreePine,
  Sparkles,
  Star,
  Trophy,
  Users,
  Settings,
  Palette,
  Volume2,
  Heart,
  Crown,
  Gift,
  Target,
  Award,
  BookOpen,
  Gamepad2,
  Map,
  Compass,
  Shield,
  Bell,
  Calendar,
  Clock,
  Download,
  Share,
  Eye,
  Zap,
} from "lucide-react";
import { JungleAdventureDesktopLayout } from "./JungleAdventureDesktopLayout";
import { cn } from "@/lib/utils";

interface JungleAdventureDemoProps {
  className?: string;
}

export const JungleAdventureDemo: React.FC<JungleAdventureDemoProps> = ({
  className,
}) => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userRole] = useState<"child" | "parent">("parent");

  // Demo content for different sections
  const renderSectionContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="p-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <TreePine className="w-8 h-8 text-jungle animate-jungle-sway" />
                <h1 className="text-4xl font-bold text-jungle-dark">
                  Welcome to Jungle Adventure!
                </h1>
                <Sparkles className="w-8 h-8 text-sunshine animate-pulse" />
              </div>
              <p className="text-lg text-jungle-dark/70 max-w-2xl mx-auto">
                🌿 Experience the most immersive learning environment for
                children aged 3-5. Our jungle-themed desktop interface brings
                learning to life with beautiful animations, interactive
                elements, and comprehensive family controls.
              </p>
            </motion.div>

            {/* Feature Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Palette,
                  title: "🎨 Immersive Themes",
                  description:
                    "5 jungle themes with dynamic weather effects and time-based ambience",
                  color: "jungle",
                },
                {
                  icon: Volume2,
                  title: "🔊 Adventure Audio",
                  description:
                    "4 voice characters, ambient jungle sounds, and interactive feedback",
                  color: "sunshine",
                },
                {
                  icon: Users,
                  title: "👨‍👩‍👧‍👦 Family Zone",
                  description:
                    "Comprehensive parent dashboard with progress tracking and controls",
                  color: "profile-purple",
                },
                {
                  icon: Settings,
                  title: "⚙️ Smart Settings",
                  description:
                    "Adaptive accessibility features and learning customization",
                  color: "coral-red",
                },
                {
                  icon: Trophy,
                  title: "🏆 Achievement System",
                  description:
                    "Engaging rewards system with celebration animations",
                  color: "playful-purple",
                },
                {
                  icon: Shield,
                  title: "🛡️ Safe Learning",
                  description:
                    "Age-appropriate content filtering and time management tools",
                  color: "bright-orange",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="jungle-card hover:scale-105 transition-transform cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            feature.color === "jungle" && "bg-jungle/10",
                            feature.color === "sunshine" && "bg-sunshine/10",
                            feature.color === "profile-purple" &&
                              "bg-profile-purple/10",
                            feature.color === "coral-red" && "bg-coral-red/10",
                            feature.color === "playful-purple" &&
                              "bg-playful-purple/10",
                            feature.color === "bright-orange" &&
                              "bg-bright-orange/10",
                          )}
                        >
                          <feature.icon
                            className={cn(
                              "w-5 h-5",
                              feature.color === "jungle" && "text-jungle",
                              feature.color === "sunshine" && "text-sunshine",
                              feature.color === "profile-purple" &&
                                "text-profile-purple",
                              feature.color === "coral-red" && "text-coral-red",
                              feature.color === "playful-purple" &&
                                "text-playful-purple",
                              feature.color === "bright-orange" &&
                                "text-bright-orange",
                            )}
                          />
                        </div>
                        <CardTitle className="text-lg text-jungle-dark">
                          {feature.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-jungle-dark/70">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-jungle/10 to-sunshine/10 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-jungle-dark mb-6 text-center">
                🌟 Enhanced Desktop Experience
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Animated Elements", value: "12+", icon: "🦋" },
                  { label: "Theme Options", value: "5", icon: "🎨" },
                  { label: "Voice Characters", value: "4", icon: "🎭" },
                  { label: "Ambient Sounds", value: "5", icon: "🎵" },
                ].map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold text-jungle">
                      {stat.value}
                    </div>
                    <div className="text-sm text-jungle-dark/70">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        );

      case "learn":
        return (
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-jungle-dark mb-4">
                📚 Word Library Adventure
              </h2>
              <p className="text-lg text-jungle-dark/70">
                Discover vocabulary treasures in our immersive learning
                environment
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { category: "Animals", icon: "🦁", count: 45, color: "jungle" },
                {
                  category: "Nature",
                  icon: "🌿",
                  count: 38,
                  color: "sunshine",
                },
                {
                  category: "Adventure",
                  icon: "🗺️",
                  count: 29,
                  color: "profile-purple",
                },
                {
                  category: "Colors",
                  icon: "🌈",
                  count: 12,
                  color: "coral-red",
                },
                {
                  category: "Shapes",
                  icon: "⭐",
                  count: 15,
                  color: "playful-purple",
                },
                {
                  category: "Numbers",
                  icon: "🔢",
                  count: 10,
                  color: "bright-orange",
                },
              ].map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="jungle-card hover:scale-105 transition-transform cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{category.icon}</div>
                      <h3 className="font-bold text-jungle-dark mb-2">
                        {category.category}
                      </h3>
                      <Badge
                        className={cn(
                          "text-white",
                          category.color === "jungle" && "bg-jungle",
                          category.color === "sunshine" && "bg-sunshine",
                          category.color === "profile-purple" &&
                            "bg-profile-purple",
                          category.color === "coral-red" && "bg-coral-red",
                          category.color === "playful-purple" &&
                            "bg-playful-purple",
                          category.color === "bright-orange" &&
                            "bg-bright-orange",
                        )}
                      >
                        {category.count} words
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-6xl">
                {activeSection === "games"
                  ? "🎮"
                  : activeSection === "progress"
                    ? "📊"
                    : activeSection === "achievements"
                      ? "🏆"
                      : activeSection === "family"
                        ? "👨‍👩‍👧‍👦"
                        : "🌿"}
              </div>
              <h2 className="text-3xl font-bold text-jungle-dark capitalize">
                {activeSection === "games" && "Jungle Games Adventure"}
                {activeSection === "progress" && "Adventure Progress Map"}
                {activeSection === "achievements" && "Treasure Collection"}
                {activeSection === "family" && "Family Adventure Zone"}
              </h2>
              <p className="text-lg text-jungle-dark/70 max-w-2xl mx-auto">
                {activeSection === "games" &&
                  "Interactive learning games with jungle characters and immersive sound effects."}
                {activeSection === "progress" &&
                  "Visual progress tracking with animated charts and milestone celebrations."}
                {activeSection === "achievements" &&
                  "Unlock badges, trophies, and special rewards for learning milestones."}
                {activeSection === "family" &&
                  "Comprehensive parent dashboard with detailed analytics and family controls."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {activeSection === "games" &&
                  [
                    "🎯 Word Target Practice",
                    "🧩 Vocabulary Puzzles",
                    "🎵 Rhythm & Rhyme Games",
                    "🏃‍♂️ Adventure Races",
                  ].map((game, index) => (
                    <Card key={index} className="jungle-card p-4">
                      <p className="font-medium text-jungle-dark">{game}</p>
                    </Card>
                  ))}

                {activeSection === "progress" &&
                  [
                    "📈 Learning Analytics",
                    "🎯 Goal Tracking",
                    "📅 Daily Progress",
                    "🏆 Milestone Rewards",
                  ].map((feature, index) => (
                    <Card key={index} className="jungle-card p-4">
                      <p className="font-medium text-jungle-dark">{feature}</p>
                    </Card>
                  ))}

                {activeSection === "achievements" &&
                  [
                    "🥉 Bronze Explorer",
                    "🥈 Silver Adventurer",
                    "🥇 Gold Champion",
                    "👑 Jungle Master",
                  ].map((achievement, index) => (
                    <Card key={index} className="jungle-card p-4">
                      <p className="font-medium text-jungle-dark">
                        {achievement}
                      </p>
                    </Card>
                  ))}

                {activeSection === "family" &&
                  [
                    "📊 Child Progress Reports",
                    "⏰ Time Management Tools",
                    "🛡️ Safety Controls",
                    "🎯 Learning Goals Setup",
                  ].map((tool, index) => (
                    <Card key={index} className="jungle-card p-4">
                      <p className="font-medium text-jungle-dark">{tool}</p>
                    </Card>
                  ))}
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className={cn("h-screen overflow-hidden", className)}>
      <JungleAdventureDesktopLayout
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userRole={userRole}
      >
        {renderSectionContent()}
      </JungleAdventureDesktopLayout>
    </div>
  );
};

export default JungleAdventureDemo;
