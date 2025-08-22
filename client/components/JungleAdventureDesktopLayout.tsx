import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  TreePine,
  Leaf,
  Sun,
  Star,
  Settings,
  Users,
  Home,
  BookOpen,
  Trophy,
  Compass,
  Map,
  Heart,
  Crown,
  Sparkles,
  Bird,
  Butterfly,
  Flower,
  Mountain,
  Waves,
  Wind,
  CloudRain,
  Music,
  Volume2,
  Palette,
  Shield,
  Eye,
  Zap,
  Bell,
  Calendar,
  Clock,
  Target,
  Award,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  RotateCcw,
  Download,
  Share,
  Gift,
  Gamepad2,
  Headphones,
  Camera,
  Binoculars,
} from "lucide-react";
import { JungleAdventureParentDashboard } from "./JungleAdventureParentDashboard";
import JungleAdventureSettingsPanelV2 from "./JungleAdventureSettingsPanelV2";
import { cn } from "@/lib/utils";
import "@/styles/jungle-adventure-desktop-layout.css";

interface JungleAdventureDesktopLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  userRole?: "child" | "parent";
  className?: string;
}

interface FloatingElement {
  id: number;
  type: "butterfly" | "leaf" | "sparkle" | "flower" | "bird";
  emoji: string;
  x: number;
  y: number;
  delay: number;
  duration: number;
  scale: number;
}

export const JungleAdventureDesktopLayout: React.FC<
  JungleAdventureDesktopLayoutProps
> = ({
  children,
  activeSection = "dashboard",
  onSectionChange,
  userRole = "child",
  className,
}) => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFamilyZone, setShowFamilyZone] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>(
    [],
  );
  const [weatherEffect, setWeatherEffect] = useState<
    "sunny" | "rainy" | "windy" | null
  >("sunny");
  const [timeOfDay, setTimeOfDay] = useState<
    "morning" | "day" | "evening" | "night"
  >("day");
  const [jungleAmbience, setJungleAmbience] = useState(true);

  // Navigation items for the jungle adventure
  const navigationItems = [
    {
      id: "dashboard",
      label: "🏠 Adventure Home",
      icon: Home,
      color: "jungle",
      description: "Your jungle basecamp",
    },
    {
      id: "learn",
      label: "📚 Word Library",
      icon: BookOpen,
      color: "sunshine",
      description: "Discover new vocabulary treasures",
    },
    {
      id: "games",
      label: "🎮 Jungle Games",
      icon: Gamepad2,
      color: "profile-purple",
      description: "Fun learning adventures",
    },
    {
      id: "progress",
      label: "📊 Adventure Map",
      icon: Map,
      color: "sky",
      description: "Track your learning journey",
    },
    {
      id: "achievements",
      label: "🏆 Treasure Collection",
      icon: Trophy,
      color: "coral-red",
      description: "Your earned badges and rewards",
    },
    ...(userRole === "parent"
      ? [
          {
            id: "family",
            label: "👨‍👩‍👧‍👦 Family Zone",
            icon: Users,
            color: "playful-purple",
            description: "Family dashboard and controls",
          },
        ]
      : []),
  ];

  // Quick action items
  const quickActions = [
    { icon: Camera, label: "Capture Moment", color: "bg-jungle" },
    { icon: Headphones, label: "Audio Adventure", color: "bg-sunshine" },
    { icon: Binoculars, label: "Explore Mode", color: "bg-profile-purple" },
    { icon: Gift, label: "Daily Surprise", color: "bg-coral-red" },
    { icon: Calendar, label: "Adventure Calendar", color: "bg-playful-purple" },
    { icon: Share, label: "Share Progress", color: "bg-bright-orange" },
  ];

  // Initialize floating elements
  useEffect(() => {
    const elements: FloatingElement[] = [
      // Butterflies
      {
        id: 1,
        type: "butterfly",
        emoji: "🦋",
        x: 15,
        y: 20,
        delay: 0,
        duration: 12,
        scale: 1,
      },
      {
        id: 2,
        type: "butterfly",
        emoji: "🦋",
        x: 85,
        y: 60,
        delay: 3,
        duration: 15,
        scale: 0.8,
      },

      // Leaves
      {
        id: 3,
        type: "leaf",
        emoji: "🍃",
        x: 25,
        y: 10,
        delay: 1,
        duration: 8,
        scale: 1.2,
      },
      {
        id: 4,
        type: "leaf",
        emoji: "🍃",
        x: 75,
        y: 80,
        delay: 4,
        duration: 10,
        scale: 0.9,
      },
      {
        id: 5,
        type: "leaf",
        emoji: "🌿",
        x: 50,
        y: 30,
        delay: 6,
        duration: 14,
        scale: 1.1,
      },

      // Flowers
      {
        id: 6,
        type: "flower",
        emoji: "🌺",
        x: 10,
        y: 70,
        delay: 2,
        duration: 20,
        scale: 1,
      },
      {
        id: 7,
        type: "flower",
        emoji: "🌸",
        x: 90,
        y: 25,
        delay: 8,
        duration: 18,
        scale: 0.8,
      },

      // Birds
      {
        id: 8,
        type: "bird",
        emoji: "🦜",
        x: 30,
        y: 15,
        delay: 5,
        duration: 16,
        scale: 1.3,
      },
      {
        id: 9,
        type: "bird",
        emoji: "🐦",
        x: 70,
        y: 50,
        delay: 9,
        duration: 12,
        scale: 1,
      },

      // Sparkles
      {
        id: 10,
        type: "sparkle",
        emoji: "✨",
        x: 20,
        y: 45,
        delay: 1.5,
        duration: 6,
        scale: 0.7,
      },
      {
        id: 11,
        type: "sparkle",
        emoji: "⭐",
        x: 80,
        y: 35,
        delay: 7,
        duration: 8,
        scale: 0.9,
      },
      {
        id: 12,
        type: "sparkle",
        emoji: "💫",
        x: 60,
        y: 65,
        delay: 4.5,
        duration: 7,
        scale: 0.8,
      },
    ];
    setFloatingElements(elements);
  }, []);

  // Time of day and weather effects
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) setTimeOfDay("morning");
      else if (hour >= 12 && hour < 17) setTimeOfDay("day");
      else if (hour >= 17 && hour < 20) setTimeOfDay("evening");
      else setTimeOfDay("night");
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Weather effect rotation
  useEffect(() => {
    const weatherEffects = ["sunny", "rainy", "windy", null];
    let currentIndex = 0;

    const rotateWeather = () => {
      setWeatherEffect(weatherEffects[currentIndex] as any);
      currentIndex = (currentIndex + 1) % weatherEffects.length;
    };

    const interval = setInterval(rotateWeather, 30000); // Change every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getTimeBasedGradient = () => {
    switch (timeOfDay) {
      case "morning":
        return "from-orange-200/30 via-yellow-200/20 to-green-200/30";
      case "day":
        return "from-blue-200/20 via-green-200/20 to-yellow-200/20";
      case "evening":
        return "from-orange-300/30 via-pink-200/20 to-purple-200/30";
      case "night":
        return "from-purple-300/20 via-blue-300/20 to-indigo-300/30";
      default:
        return "from-green-200/20 via-blue-200/20 to-yellow-200/20";
    }
  };

  const getWeatherIcon = () => {
    switch (weatherEffect) {
      case "sunny":
        return <Sun className="w-5 h-5 text-sunshine animate-spin-slow" />;
      case "rainy":
        return <CloudRain className="w-5 h-5 text-sky animate-bounce" />;
      case "windy":
        return <Wind className="w-5 h-5 text-jungle animate-pulse" />;
      default:
        return <Compass className="w-5 h-5 text-profile-purple" />;
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br relative overflow-hidden jungle-desktop-layout",
        getTimeBasedGradient(),
        className,
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 jungle-pattern-bg opacity-40" />

      {/* Weather Effects Overlay */}
      {weatherEffect && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            weatherEffect === "rainy" && "jungle-rain-effect",
            weatherEffect === "windy" && "jungle-wind-effect",
            weatherEffect === "sunny" && "jungle-sun-rays",
          )}
        />
      )}

      {/* Floating Jungle Elements */}
      <AnimatePresence>
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute text-2xl pointer-events-none select-none z-10"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              fontSize: `${element.scale * 1.5}rem`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [
                element.scale * 0.8,
                element.scale * 1.2,
                element.scale * 0.8,
              ],
              y:
                element.type === "butterfly" || element.type === "bird"
                  ? [-20, 20, -20]
                  : [-10, 10, -10],
              x: element.type === "leaf" ? [-15, 15, -15] : [-5, 5, -5],
              rotate: element.type === "sparkle" ? [0, 360, 0] : [0, 10, 0],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              delay: element.delay,
              ease: "easeInOut",
            }}
          >
            {element.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="flex h-screen relative z-20">
        {/* Sidebar */}
        <motion.aside
          className={cn(
            "bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl border-r border-jungle/20 shadow-2xl transition-all duration-300",
            sidebarCollapsed ? "w-16" : "w-72",
          )}
          initial={false}
          animate={{ width: sidebarCollapsed ? 64 : 288 }}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-jungle/20">
            <motion.div
              className="flex items-center gap-3"
              initial={false}
              animate={{
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
              }}
            >
              <div className="relative">
                <TreePine className="w-8 h-8 text-jungle animate-jungle-sway" />
                <Sparkles className="w-3 h-3 text-sunshine absolute -top-1 -right-1 animate-pulse" />
              </div>

              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1"
                  >
                    <h1 className="font-bold text-lg text-jungle-dark">
                      Jungle Adventure
                    </h1>
                    <p className="text-xs text-jungle-dark/70">
                      Learning Paradise
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="jungle-hover-effect"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2">
            {navigationItems.map((item, index) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={() => {
                      if (item.id === "family") {
                        setShowFamilyZone(true);
                      } else {
                        onSectionChange?.(item.id);
                      }
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center gap-3 jungle-nav-item",
                      activeSection === item.id
                        ? `bg-${item.color} text-white shadow-lg`
                        : "hover:bg-jungle/10 text-jungle-dark",
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />

                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="flex-1 min-w-0"
                        >
                          <div className="font-medium text-sm truncate">
                            {item.label}
                          </div>
                          <div className="text-xs opacity-70 truncate">
                            {item.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {activeSection === item.id && (
                      <motion.div
                        className="w-2 h-2 bg-white rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{sidebarCollapsed ? item.description : item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-jungle/20 space-y-2">
            {/* Settings Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => setShowSettings(true)}
                  className={cn(
                    "w-full jungle-hover-effect",
                    sidebarCollapsed ? "justify-center" : "justify-start",
                  )}
                >
                  <Settings className="w-4 h-4" />
                  {!sidebarCollapsed && (
                    <span className="ml-2">Adventure Settings</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Customize your jungle experience</p>
              </TooltipContent>
            </Tooltip>

            {/* Weather & Time Info */}
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gradient-to-r from-jungle/10 to-sunshine/10 p-3 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getWeatherIcon()}
                      <span className="text-xs font-medium text-jungle-dark capitalize">
                        {timeOfDay} Adventure
                      </span>
                    </div>
                    <Badge className="bg-jungle/20 text-jungle text-xs">
                      {weatherEffect || "calm"}
                    </Badge>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Profile */}
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gradient-to-r from-profile-purple/10 to-playful-purple/10 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-jungle rounded-full flex items-center justify-center text-white font-bold">
                      {user?.name?.[0] || "J"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-jungle-dark truncate">
                        {user?.name || "Jungle Explorer"}
                      </p>
                      <p className="text-xs text-jungle-dark/70">
                        Level {Math.floor(Math.random() * 20) + 1} Adventurer
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Top Bar */}
          <motion.header
            className="bg-white/90 backdrop-blur-lg border-b border-jungle/20 p-4 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-sunshine" />
                  <span className="font-medium text-jungle-dark">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <Badge className="bg-jungle/10 text-jungle">
                  🔥 3 day streak!
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  {quickActions.slice(0, 3).map((action, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "jungle-hover-effect text-white",
                            action.color,
                          )}
                        >
                          <action.icon className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{action.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                {/* Jungle Ambience Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={jungleAmbience ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setJungleAmbience(!jungleAmbience)}
                      className={cn(
                        "jungle-hover-effect",
                        jungleAmbience ? "bg-jungle text-white" : "",
                      )}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{jungleAmbience ? "Disable" : "Enable"} jungle sounds</p>
                  </TooltipContent>
                </Tooltip>

                {/* Notification Bell */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="jungle-hover-effect relative"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-coral-red text-white text-xs rounded-full flex items-center justify-center">
                        2
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>2 new achievements unlocked!</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </motion.header>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Family Zone Dialog */}
      <Dialog open={showFamilyZone} onOpenChange={setShowFamilyZone}>
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0">
          <JungleAdventureParentDashboard
            onBack={() => setShowFamilyZone(false)}
            className="h-full"
          />
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <JungleAdventureSettingsPanelV2
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
};

export default JungleAdventureDesktopLayout;
