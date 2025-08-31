import React, { useState, useEffect, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Volume2,
  VolumeX,
  Grid3X3,
  List,
  Map,
  Target,
  Heart,
  Settings,
  Timer,
  Gem,
  Crown,
  Flame,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react";

interface ExplorerShellProps {
  children: ReactNode;
  title?: string;
  showStats?: boolean;
  mode?: "map" | "adventure" | "favorites";
  onModeChange?: (mode: "map" | "adventure" | "favorites") => void;
  onBack?: () => void;
  className?: string;
  // Stats props
  gems?: number;
  streak?: number;
  sessionTime?: string;
  progress?: {
    current: number;
    total: number;
  };
  // Settings props
  audioEnabled?: boolean;
  onAudioToggle?: () => void;
  highContrast?: boolean;
  onHighContrastToggle?: () => void;
  reducedMotion?: boolean;
  onReducedMotionToggle?: () => void;
  // Search props
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
  // View options
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  // Quick actions
  categories?: Array<{
    id: string;
    name: string;
    emoji: string;
    recommended?: boolean;
  }>;
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string;
  // Visual customization
  backgroundImage?: string;
  backgroundGradient?: string;
  leafBorder?: boolean;
  mascotEmoji?: string;
}

export const ExplorerShell: React.FC<ExplorerShellProps> = ({
  children,
  title = "🌟 Jungle Explorer",
  showStats = true,
  mode = "map",
  onModeChange,
  onBack,
  className,
  gems = 0,
  streak = 0,
  sessionTime = "00:00",
  progress,
  audioEnabled = true,
  onAudioToggle,
  highContrast = false,
  onHighContrastToggle,
  reducedMotion = false,
  onReducedMotionToggle,
  searchQuery = "",
  onSearchChange,
  showSearch = false,
  viewMode = "grid",
  onViewModeChange,
  categories = [],
  onCategorySelect,
  selectedCategory,
  backgroundImage,
  backgroundGradient,
  leafBorder = true,
  mascotEmoji = "🦉",
}) => {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Auto-hide mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMobileMenu(false);
    };

    if (showMobileMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showMobileMenu]);

  const handleModeClick = (newMode: "map" | "adventure" | "favorites") => {
    onModeChange?.(newMode);
    setShowMobileMenu(false);
  };

  const formatTime = (timeString: string) => {
    return timeString || "00:00";
  };

  return (
    <div
      className={cn(
        "min-h-screen",
        "relative overflow-hidden",
        className,
      )}
      style={{
        filter: highContrast ? "contrast(1.25) saturate(1.1)" : undefined,
        background:
          backgroundGradient ||
          "linear-gradient(135deg, #ecfdf5 0%, #e0f2fe 50%, #ede9fe 100%)",
      }}
    >
      {/* Background image + animated jungle elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundImage && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})`, opacity: 0.25 }}
            animate={reducedMotion ? {} : { scale: [1, 1.03, 1], y: [0, -8, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {!reducedMotion && (
          <>
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 left-10 text-4xl opacity-20"
            >
              🌿
            </motion.div>
            <motion.div
              animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute top-20 right-20 text-3xl opacity-15"
            >
              🦋
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, -2, 0] }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
              className="absolute bottom-20 left-20 text-5xl opacity-10"
            >
              🌳
            </motion.div>
            <motion.div
              animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 3,
              }}
              className="absolute bottom-10 right-10 text-3xl opacity-20"
            >
              ⭐
            </motion.div>
          </>
        )}
        {/* Leaf border */}
        {leafBorder && (
          <div className="absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"none\"%3E%3Cdefs%3E%3Cpath id=\"l\" d=\"M0 0c8 6 14 6 22 0 8-6 14-6 22 0 8 6 14 6 22 0 8-6 14-6 22 0\"/%3E%3C/defs%3E%3Cpath d=\"M0 3h100\" stroke=\"%2322c55e\" stroke-width=\"1\" opacity=\".2\"/%3E%3Cuse href=\"%23l\" stroke=\"%2322c55e\" stroke-width=\"1\" fill=\"none\" y=\"2\" opacity=\".15\"/%3E%3C/svg%3E')",
                backgroundRepeat: "repeat",
                backgroundSize: "100px 12px",
                maskImage:
                  "linear-gradient(to right, transparent, black 10%, black 90%, transparent), linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
              }}
              aria-hidden
            />
          </div>
        )}
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 py-2 md:px-4 md:py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="secondary"
                  size="sm"
                  aria-label="Go back"
                  className="rounded-full transition-transform hover:scale-105 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}

              <div className="flex items-center gap-3">
                {/* Jungle mascot */}
                <motion.div
                  animate={reducedMotion ? {} : { rotate: [0, 5, -5, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-2xl md:text-3xl"
                >
                  {mascotEmoji}
                </motion.div>

                <div>
                  <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {title}
                  </h1>
                  <p className="hidden md:block text-sm text-gray-600">
                    Discover amazing words with jungle friends!
                  </p>
                </div>
              </div>
            </div>

            {/* Center: Mode Navigation (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <div className="flex bg-white border border-gray-200 rounded-full p-1 shadow-sm">
                <Button
                  onClick={() => handleModeClick("map")}
                  variant={mode === "map" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full px-4"
                  aria-label="Map mode"
                >
                  <Map className="w-4 h-4 mr-2" />
                  Map
                </Button>
                <Button
                  onClick={() => handleModeClick("adventure")}
                  variant={mode === "adventure" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full px-4"
                  aria-label="Adventure mode"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Adventure
                </Button>
                <Button
                  onClick={() => handleModeClick("favorites")}
                  variant={mode === "favorites" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full px-4"
                  aria-label="Favorites mode"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites
                </Button>
              </div>
            </div>

            {/* Right: Stats and Controls */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search (Desktop) */}
              {showSearch && (
                <div className="hidden sm:block relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search words..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                    aria-label="Search words"
                  />
                </div>
              )}

              {/* View mode toggle (Desktop) */}
              {onViewModeChange && (
                <div className="hidden sm:flex border border-gray-200 rounded-full p-1">
                  <Button
                    onClick={() => onViewModeChange("grid")}
                    variant={viewMode === "grid" ? "default" : "secondary"}
                    size="sm"
                    className="rounded-full w-9 h-9 p-0"
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => onViewModeChange("list")}
                    variant={viewMode === "list" ? "default" : "secondary"}
                    size="sm"
                    className="rounded-full w-9 h-9 p-0"
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Audio toggle */}
              <Button
                onClick={onAudioToggle}
                variant="secondary"
                size="sm"
                className="rounded-full w-9 h-9 md:w-10 md:h-10 p-0"
                aria-label={audioEnabled ? "Mute audio" : "Enable audio"}
              >
                {audioEnabled ? (
                  <Volume2 className="w-4 h-4 text-green-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </Button>

              {/* High contrast toggle */}
              <Button
                onClick={onHighContrastToggle}
                variant="secondary"
                size="sm"
                className="rounded-full w-9 h-9 md:w-10 md:h-10 p-0"
                aria-label={
                  highContrast
                    ? "Disable high contrast"
                    : "Enable high contrast"
                }
              >
                {highContrast ? (
                  <Eye className="w-4 h-4 text-blue-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </Button>

              {/* Stats Display (Desktop) */}
              {showStats && (
                <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-white/80 rounded-full border border-gray-200">
                  <div className="flex items-center gap-1">
                    <Gem className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-bold">{gems}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-bold">{streak}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Timer className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-bold">
                      {formatTime(sessionTime)}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                variant="secondary"
                size="sm"
                className="md:hidden rounded-full w-9 h-9 p-0"
                aria-label="Open menu"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden px-2 pb-2 space-y-2">
          {/* Mode Navigation (Mobile) */}
          <div className="flex bg-white border border-gray-200 rounded-full p-1 shadow-sm">
            <Button
              onClick={() => handleModeClick("map")}
              variant={mode === "map" ? "default" : "secondary"}
              size="sm"
              className="rounded-full flex-1"
            >
              <Map className="w-4 h-4 mr-1" />
              Map
            </Button>
            <Button
              onClick={() => handleModeClick("adventure")}
              variant={mode === "adventure" ? "default" : "secondary"}
              size="sm"
              className="rounded-full flex-1"
            >
              <Target className="w-4 h-4 mr-1" />
              Adventure
            </Button>
            <Button
              onClick={() => handleModeClick("favorites")}
              variant={mode === "favorites" ? "default" : "secondary"}
              size="sm"
              className="rounded-full flex-1"
            >
              <Heart className="w-4 h-4 mr-1" />
              Favorites
            </Button>
          </div>

          {/* Mobile Stats */}
          {showStats && (
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="flex items-center gap-1 bg-blue-100 rounded-full px-3 py-1">
                <Gem className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-700">{gems}</span>
              </div>
              <div className="flex items-center gap-1 bg-red-100 rounded-full px-3 py-1">
                <Flame className="w-4 h-4 text-red-600" />
                <span className="text-sm font-bold text-red-700">{streak}</span>
              </div>
              <div className="flex items-center gap-1 bg-green-100 rounded-full px-3 py-1">
                <Timer className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-700">
                  {formatTime(sessionTime)}
                </span>
              </div>
            </div>
          )}

          {/* Mobile Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search words"
              />
            </div>
          )}

          {/* Quick Category Select */}
          {categories.length > 0 && mode === "map" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Quick Select
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => onCategorySelect?.(category.id)}
                    className={cn(
                      "rounded-full min-w-[80px] h-10 px-3 text-sm flex-shrink-0 shadow-sm",
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-green-400 to-blue-500 text-white"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
                    )}
                    aria-label={`Select ${category.name} category`}
                  >
                    <span className="mr-1 text-base">{category.emoji}</span>
                    {category.name}
                    {category.recommended && <span className="ml-1">⭐</span>}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {progress && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>
                  {progress.current}/{progress.total}
                </span>
              </div>
              <Progress
                value={(progress.current / progress.total) * 100}
                className="h-2"
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1">{children}</main>

      {/* Progress Footer (Vine Bar) */}
      {progress && (
        <footer className="relative z-10 bg-white/60 backdrop-blur-sm border-t border-white/50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Learning Journey
              </span>
              <span className="text-sm text-gray-600">
                {progress.current} of {progress.total} completed
              </span>
            </div>

            {/* Vine Progress Bar */}
            <div className="relative h-3 bg-green-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full relative overflow-hidden"
              >
                {/* Vine pattern overlay */}
                <div className="absolute inset-0 opacity-30">
                  <div
                    className="h-full w-full bg-repeat-x bg-center"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='12' viewBox='0 0 20 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 6c2-2 4-2 6 0s4 2 6 0' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
                    }}
                  />
                </div>
              </motion.div>

              {/* Progress gems */}
              {Array.from({
                length: Math.min(5, Math.floor(progress.current / 5)),
              }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                  className="absolute top-1/2 transform -translate-y-1/2 text-xs"
                  style={{ left: `${(i + 1) * 20}%` }}
                >
                  💎
                </motion.div>
              ))}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default ExplorerShell;
