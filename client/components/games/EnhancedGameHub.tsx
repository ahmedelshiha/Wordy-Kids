import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Trophy,
  Crown,
  Star,
  Zap,
  ArrowLeft,
  Gamepad2,
  Target,
  Clock,
  Brain,
  Gem,
  Settings,
  Info,
} from "lucide-react";
import { EnhancedJungleQuizAdventure } from "./EnhancedJungleQuizAdventure";
import { AdventureGames } from "./AdventureGames";
import { QuizGames } from "./QuizGames";
import { WordGarden } from "./WordGarden";
import { useEnhancedMobileGaming } from "@/hooks/use-enhanced-mobile-gaming";
import {
  PowerUpSystem,
  AchievementSystem,
  GameSessionManager,
} from "@/lib/enhancedGameplayMechanics";
import "@/styles/enhanced-jungle-quiz-adventure.css";

interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  difficulty: "easy" | "medium" | "hard";
  duration: number; // minutes
  rewards: string[];
  unlockLevel: number;
  featured?: boolean;
}

interface EnhancedGameHubProps {
  selectedCategory: string;
  onGameComplete: (score: number, totalWords: number, stats: any) => void;
  onQuizComplete: (score: number, total: number, stats: any) => void;
  onMatchingComplete: (score: number, timeSpent: number) => void;
  onBack?: () => void;
  userProfile?: any;
  playerLevel?: number;
  playerGems?: number;
  unlockedAchievements?: string[];
}

export function EnhancedGameHub({
  selectedCategory,
  onGameComplete,
  onQuizComplete,
  onMatchingComplete,
  onBack,
  userProfile,
  playerLevel = 1,
  playerGems = 100,
  unlockedAchievements = [],
}: EnhancedGameHubProps) {
  // State management
  const [activeSection, setActiveSection] = useState<
    | "hub"
    | "enhanced-quiz"
    | "word-garden"
    | "adventure-games"
    | "classic-quizzes"
    | "settings"
  >("hub");
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | null>(
    null,
  );
  const [showGameSettings, setShowGameSettings] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    difficulty: "medium" as "easy" | "medium" | "hard",
    enableHaptics: true,
    enableSound: true,
    enableAnimations: true,
    timeLimit: 15,
  });

  // Enhanced mobile gaming hook
  const {
    deviceCapabilities,
    triggerHaptic,
    createTouchAreaHandler,
    getTouchableStyle,
    enableGameMode: enableMobileGameMode,
  } = useEnhancedMobileGaming({
    enableHaptics: gameSettings.enableHaptics,
    enableGestures: true,
    hapticIntensity: 1,
    enableAdvancedTouch: true,
  });

  // Game modes configuration
  const gameModes: GameMode[] = [
    {
      id: "enhanced-adventure",
      name: "Jungle Quiz Adventure",
      description:
        "Premium AAA gaming experience with 3D effects, power-ups, and immersive jungle exploration",
      icon: <Crown className="w-8 h-8" />,
      difficulty: "medium",
      duration: 15,
      rewards: ["Double XP", "Power-ups", "Achievements"],
      unlockLevel: 1,
      featured: true,
    },
    {
      id: "word-garden",
      name: "Classic Word Garden",
      description:
        "Listen and pick the matching picture in our beautiful jungle garden",
      icon: <Star className="w-8 h-8" />,
      difficulty: "easy",
      duration: 10,
      rewards: ["Plant Growth", "Jungle Coins"],
      unlockLevel: 1,
    },
    {
      id: "speed-challenge",
      name: "Lightning Quest",
      description:
        "Fast-paced vocabulary challenges with time pressure and streak multipliers",
      icon: <Zap className="w-8 h-8" />,
      difficulty: "hard",
      duration: 5,
      rewards: ["Speed Bonus", "Lightning Badge"],
      unlockLevel: 3,
    },
    {
      id: "zen-mode",
      name: "Peaceful Learning",
      description:
        "Relaxed gameplay without timers, perfect for mindful learning",
      icon: <Brain className="w-8 h-8" />,
      difficulty: "easy",
      duration: 20,
      rewards: ["Zen Points", "Mindfulness Badge"],
      unlockLevel: 1,
    },
    {
      id: "treasure-hunt",
      name: "Treasure Hunt Adventure",
      description:
        "Explore the jungle to find hidden word treasures with special rewards",
      icon: <Gem className="w-8 h-8" />,
      difficulty: "medium",
      duration: 12,
      rewards: ["Rare Gems", "Treasure Badge"],
      unlockLevel: 5,
    },
  ];

  // Filter available game modes based on player level
  const availableGameModes = gameModes.filter(
    (mode) => playerLevel >= mode.unlockLevel,
  );
  const featuredMode = gameModes.find((mode) => mode.featured);

  // Enable mobile game mode on mount
  useEffect(() => {
    const cleanup = enableMobileGameMode();
    return cleanup;
  }, [enableMobileGameMode]);

  // Handle game mode selection
  const handleGameModeSelect = (mode: GameMode) => {
    setSelectedGameMode(mode);
    triggerHaptic({ type: "selection" });

    switch (mode.id) {
      case "enhanced-adventure":
        setActiveSection("enhanced-quiz");
        break;
      case "word-garden":
        setActiveSection("word-garden");
        break;
      default:
        setActiveSection("adventure-games");
        break;
    }
  };

  // Handle game completion
  const handleEnhancedQuizComplete = (score: number, stats: any) => {
    triggerHaptic({ type: "success" });
    onGameComplete(score, stats.totalWords || 10, {
      ...stats,
      gameMode: selectedGameMode?.id,
      difficulty: gameSettings.difficulty,
    });
    setActiveSection("hub");
  };

  // Handle game exit
  const handleGameExit = () => {
    triggerHaptic({ type: "light" });
    setActiveSection("hub");
    setSelectedGameMode(null);
  };

  // Handle settings
  const handleSettingsChange = (key: string, value: any) => {
    setGameSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Render based on active section
  if (activeSection === "enhanced-quiz") {
    return (
      <div className="min-h-screen">
        <EnhancedJungleQuizAdventure
          selectedCategory={selectedCategory}
          onComplete={handleEnhancedQuizComplete}
          onExit={handleGameExit}
          difficulty={gameSettings.difficulty}
          gameMode={
            selectedGameMode?.id === "zen-mode"
              ? "zen"
              : selectedGameMode?.id === "speed-challenge"
                ? "challenge"
                : "adventure"
          }
        />
      </div>
    );
  }

  if (activeSection === "word-garden") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4">
          <Button
            onClick={handleGameExit}
            variant="outline"
            size="sm"
            style={getTouchableStyle()}
            className="jungle-glass-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </div>
        <WordGarden
          selectedCategory={selectedCategory}
          onComplete={(stats) =>
            onGameComplete(stats.score || 0, stats.totalWords || 10, stats)
          }
          userProfile={userProfile}
        />
      </div>
    );
  }

  if (activeSection === "adventure-games") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4">
          <Button
            onClick={handleGameExit}
            variant="outline"
            size="sm"
            style={getTouchableStyle()}
            className="jungle-glass-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </div>
        <AdventureGames
          selectedCategory={selectedCategory}
          onGameComplete={onGameComplete}
          onMatchingComplete={onMatchingComplete}
          userProfile={userProfile}
        />
      </div>
    );
  }

  if (activeSection === "classic-quizzes") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4">
          <Button
            onClick={handleGameExit}
            variant="outline"
            size="sm"
            style={getTouchableStyle()}
            className="jungle-glass-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
        </div>
        <QuizGames
          selectedCategory={selectedCategory}
          onQuizComplete={onQuizComplete}
          onQuizExit={handleGameExit}
        />
      </div>
    );
  }

  // Main Game Hub UI
  return (
    <div className="min-h-screen jungle-background-morning relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/10 via-green-500/20 to-emerald-600/30" />
      <div className="absolute inset-0 jungle-parallax-layer-1" />
      <div className="absolute inset-0 jungle-parallax-layer-2" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-300 rounded-full opacity-60 animate-jungle-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-20 p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 via-emerald-500 to-green-600 p-6 rounded-full shadow-2xl animate-jungle-glow">
                <Gamepad2 className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                NEW!
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-500 to-yellow-500 bg-clip-text text-transparent mb-4">
            🎮 Jungle Game Adventure! 🌟
          </h1>

          <p className="text-lg md:text-xl text-emerald-700 mb-6">
            Choose your epic learning adventure in the magical jungle!
          </p>

          {/* Player Stats */}
          <div className="flex justify-center gap-4 mb-8">
            <Badge className="level-badge bg-blue-500 text-blue-900 font-bold px-4 py-2">
              <Crown className="w-5 h-5 mr-2" />
              Level {playerLevel}
            </Badge>
            <Badge className="gems-badge bg-purple-500 text-purple-900 font-bold px-4 py-2">
              <Gem className="w-5 h-5 mr-2" />
              {playerGems.toLocaleString()} Gems
            </Badge>
            <Badge className="achievement-badge bg-yellow-500 text-yellow-900 font-bold px-4 py-2">
              <Trophy className="w-5 h-5 mr-2" />
              {unlockedAchievements.length} Badges
            </Badge>
          </div>
        </div>

        {/* Featured Game Mode */}
        {featuredMode && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-emerald-800 mb-4 text-center">
              🌟 Featured Adventure
            </h2>
            <Card className="jungle-treasure-card border-4 border-yellow-400 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-emerald-500/10 to-green-600/20" />
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                FEATURED
              </div>

              <CardHeader className="text-center relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white shadow-lg">
                    {featuredMode.icon}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-emerald-800">
                  {featuredMode.name}
                </CardTitle>
                <p className="text-emerald-600 text-lg">
                  {featuredMode.description}
                </p>
              </CardHeader>

              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <Target className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm font-semibold text-emerald-800">
                      {featuredMode.difficulty.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm font-semibold text-emerald-800">
                      {featuredMode.duration} Minutes
                    </p>
                  </div>
                  <div className="text-center">
                    <Trophy className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm font-semibold text-emerald-800">
                      Epic Rewards
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center mb-6">
                  {featuredMode.rewards.map((reward, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {reward}
                    </Badge>
                  ))}
                </div>

                <Button
                  onClick={() => handleGameModeSelect(featuredMode)}
                  size="lg"
                  className="w-full jungle-continue-button group text-lg font-bold py-4"
                  style={getTouchableStyle(60)}
                  {...createTouchAreaHandler(() =>
                    handleGameModeSelect(featuredMode),
                  )}
                >
                  <Play className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                  Start Epic Adventure!
                  <Star className="w-6 h-6 ml-3 group-hover:animate-spin" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* All Game Modes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-emerald-800 mb-6 text-center">
            🎯 Choose Your Adventure
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableGameModes.map((mode) => {
              const isLocked = playerLevel < mode.unlockLevel;
              const isFeatured = mode.featured;

              return (
                <Card
                  key={mode.id}
                  className={`treasure-option-card cursor-pointer transition-all duration-300 relative overflow-hidden ${
                    isLocked ? "opacity-50 cursor-not-allowed" : ""
                  } ${isFeatured ? "ring-2 ring-yellow-400" : ""}`}
                  onClick={() => !isLocked && handleGameModeSelect(mode)}
                  style={getTouchableStyle()}
                  {...(!isLocked
                    ? createTouchAreaHandler(() => handleGameModeSelect(mode))
                    : {})}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-emerald-50/40 to-green-100/30" />

                  {isLocked && (
                    <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-30">
                      <div className="text-center text-white">
                        <Crown className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-bold">
                          Level {mode.unlockLevel} Required
                        </p>
                      </div>
                    </div>
                  )}

                  <CardHeader className="text-center relative z-10">
                    <div className="flex justify-center mb-3">
                      <div
                        className={`p-3 rounded-full text-white shadow-md ${
                          mode.difficulty === "easy"
                            ? "bg-green-500"
                            : mode.difficulty === "medium"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      >
                        {mode.icon}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-emerald-800">
                      {mode.name}
                    </CardTitle>
                    <p className="text-sm text-emerald-600">
                      {mode.description}
                    </p>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                      <div className="text-center">
                        <Target className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                        <p className="font-semibold text-emerald-800">
                          {mode.difficulty.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-center">
                        <Clock className="w-4 h-4 mx-auto text-emerald-600 mb-1" />
                        <p className="font-semibold text-emerald-800">
                          {mode.duration}min
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 justify-center">
                      {mode.rewards.slice(0, 2).map((reward, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {reward}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Classic Games Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-emerald-800 mb-6 text-center">
            📚 Classic Adventures
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card
              className="treasure-option-card cursor-pointer"
              onClick={() => setActiveSection("adventure-games")}
              style={getTouchableStyle()}
              {...createTouchAreaHandler(() =>
                setActiveSection("adventure-games"),
              )}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full text-white shadow-md">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-emerald-800">
                  Adventure Games
                </CardTitle>
                <p className="text-sm text-emerald-600">
                  Classic learning games with jungle themes
                </p>
              </CardHeader>
            </Card>

            <Card
              className="treasure-option-card cursor-pointer"
              onClick={() => setActiveSection("classic-quizzes")}
              style={getTouchableStyle()}
              {...createTouchAreaHandler(() =>
                setActiveSection("classic-quizzes"),
              )}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full text-white shadow-md">
                    <Brain className="w-6 h-6" />
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-emerald-800">
                  Classic Quizzes
                </CardTitle>
                <p className="text-sm text-emerald-600">
                  Traditional quiz games for focused learning
                </p>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        {onBack && (
          <div className="text-center">
            <Button
              onClick={onBack}
              variant="outline"
              size="lg"
              className="jungle-glass-button"
              style={getTouchableStyle()}
              {...createTouchAreaHandler(onBack)}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Learning Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedGameHub;
