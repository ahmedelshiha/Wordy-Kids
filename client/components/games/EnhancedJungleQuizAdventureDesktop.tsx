import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Star,
  Zap,
  Crown,
  Trophy,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Heart,
  Gem,
  Target,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { audioService } from "@/lib/audioService";
import { enhancedAudioService } from "@/lib/enhancedAudioService";
import {
  wordsDatabase,
  getWordsByCategory,
  getRandomWords,
} from "@/data/wordsDatabase";
import { useAchievementNotifications } from "@/hooks/use-achievement-notifications";
import { useMobileTouch } from "@/hooks/use-mobile-touch";
import { useAccessibilityFeatures } from "@/hooks/use-accessibility-features";

interface PowerUp {
  id: string;
  type: "hint" | "streak" | "time" | "gems";
  name: string;
  icon: React.ReactNode;
  description: string;
  cost: number;
  active: boolean;
  uses: number;
}

interface GameState {
  currentWordIndex: number;
  score: number;
  streak: number;
  maxStreak: number;
  gems: number;
  stars: number;
  lives: number;
  timeBonus: number;
  level: number;
  experience: number;
  powerUps: PowerUp[];
  achievements: string[];
  plantGrowthStage: number;
  treasuresFound: number;
}

interface Word {
  id: number;
  word: string;
  pronunciation: string;
  definition: string;
  example: string;
  funFact: string;
  emoji: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

interface EnhancedJungleQuizAdventureDesktopProps {
  selectedCategory?: string;
  onComplete?: (score: number, stats: any) => void;
  onExit?: () => void;
  words?: Word[];
  difficulty?: "easy" | "medium" | "hard";
  gameMode?: "adventure" | "challenge" | "zen";
}

export const EnhancedJungleQuizAdventureDesktop: React.FC<
  EnhancedJungleQuizAdventureDesktopProps
> = ({
  selectedCategory = "animals",
  onComplete,
  onExit,
  words: customWords,
  difficulty = "medium",
  gameMode = "adventure",
}) => {
  // Sample game state for demo - this would normally come from the original component
  const [gameState, setGameState] = useState<GameState>({
    currentWordIndex: 0,
    score: 1250,
    streak: 3,
    maxStreak: 5,
    gems: 42,
    stars: 15,
    lives: 3,
    timeBonus: 0,
    level: 2,
    experience: 65,
    powerUps: [],
    achievements: [],
    plantGrowthStage: 2,
    treasuresFound: 8,
  });

  const [timeLeft, setTimeLeft] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Sample words data
  const words = useMemo(
    () => [
      {
        id: 1,
        word: "elephant",
        pronunciation: "EL-uh-fuhnt",
        definition: "A large gray mammal with a long trunk",
        example: "The elephant sprayed water with its trunk",
        funFact: "Elephants can remember things for many years!",
        emoji: "🐘",
        category: "animals",
        difficulty: "easy" as const,
      },
      {
        id: 2,
        word: "butterfly",
        pronunciation: "BUHT-er-fly",
        definition: "A colorful flying insect",
        example: "The butterfly landed on the flower",
        funFact: "Butterflies taste with their feet!",
        emoji: "🦋",
        category: "animals",
        difficulty: "easy" as const,
      },
      {
        id: 3,
        word: "tree",
        pronunciation: "tree",
        definition: "A tall plant with a trunk and branches",
        example: "The monkey climbed the tall tree",
        funFact: "Trees can live for hundreds of years!",
        emoji: "🌳",
        category: "nature",
        difficulty: "easy" as const,
      },
    ],
    [],
  );

  const currentWord = words[gameState.currentWordIndex] || words[0];
  const options = useMemo(
    () => [currentWord, ...words.slice(1, 3)],
    [currentWord, words],
  );

  const progressPercent =
    words.length > 0 ? (gameState.currentWordIndex / words.length) * 100 : 0;
  const experiencePercent = gameState.experience % 100;

  const handleReplayAudio = useCallback(() => {
    console.log("Playing audio for:", currentWord?.word);
  }, [currentWord]);

  const handleAnswerSelect = useCallback(
    (optionId: number) => {
      setSelectedOption(optionId.toString());
      setIsAnswering(true);
      setIsCorrect(optionId === currentWord.id);
      setShowResult(true);

      setTimeout(() => {
        setIsAnswering(false);
      }, 1000);
    },
    [currentWord.id],
  );

  const handleNextQuestion = useCallback(() => {
    setShowResult(false);
    setSelectedOption(null);
    setIsCorrect(false);
    setGameState((prev) => ({
      ...prev,
      currentWordIndex: (prev.currentWordIndex + 1) % words.length,
      plantGrowthStage: prev.plantGrowthStage + (isCorrect ? 1 : 0),
    }));
  }, [isCorrect, words.length]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-400/20 via-green-500/30 to-emerald-600/40">
      {/* Background Effects */}
      <div className="absolute inset-0 jungle-parallax-layer-1" />
      <div className="absolute inset-0 jungle-parallax-layer-2" />
      <div className="absolute inset-0 jungle-parallax-layer-3" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-60 bg-green-300 animate-jungle-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Desktop Layout Container */}
      <div className="relative z-40 min-h-screen lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:p-6">
        {/* Main Content Area */}
        <div className="lg:order-1">
          {/* Mobile Header - Achievement badges visible on mobile */}
          <div className="p-4 lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Badge className="treasure-badge bg-yellow-500 text-yellow-900 font-bold px-3 py-1">
                  <Trophy className="w-4 h-4 mr-1" />
                  {gameState.score.toLocaleString()}
                </Badge>
                <Badge className="streak-badge bg-orange-500 text-orange-900 font-bold px-3 py-1">
                  <Zap className="w-4 h-4 mr-1" />
                  {gameState.streak}x
                </Badge>
                <Badge className="gems-badge bg-purple-500 text-purple-900 font-bold px-3 py-1">
                  <Gem className="w-4 h-4 mr-1" />
                  {gameState.gems}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReplayAudio}
                  className="jungle-glass-button"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="jungle-glass-button"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                {onExit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onExit}
                    className="jungle-glass-button"
                  >
                    ✕
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Controls Only */}
          <div className="hidden lg:flex lg:items-center lg:justify-end lg:p-4 lg:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReplayAudio}
              className="jungle-glass-button"
            >
              <Volume2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className="jungle-glass-button"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            {onExit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="jungle-glass-button"
              >
                ✕
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="relative mb-4 px-4 lg:px-0">
            <Progress
              value={progressPercent}
              className="h-3 jungle-progress-trail"
            />
            <div className="absolute -top-1 left-4 lg:left-0 right-4 lg:right-0 h-5 flex items-center justify-between pointer-events-none">
              {[...Array(5)].map((_, i) => {
                const stationProgress = (i / 4) * 100;
                const isActive = progressPercent >= stationProgress;
                const isComplete = progressPercent > stationProgress + 10;

                return (
                  <div
                    key={i}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                      isComplete
                        ? "bg-yellow-400 border-yellow-500 text-yellow-900 animate-jungle-glow"
                        : isActive
                          ? "bg-green-400 border-green-500 text-green-900 animate-jungle-sparkle"
                          : "bg-gray-300 border-gray-400 text-gray-600",
                    )}
                  >
                    {isComplete ? "🏆" : isActive ? "🌟" : "🌱"}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lives and Level */}
          <div className="flex items-center justify-between mb-4 px-4 lg:px-0">
            <div className="flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    "w-6 h-6 transition-all duration-300",
                    i < gameState.lives
                      ? "text-red-500 fill-red-500 animate-pulse"
                      : "text-gray-400",
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Badge className="level-badge bg-blue-500 text-blue-900 font-bold px-3 py-1">
                <Crown className="w-4 h-4 mr-1" />
                Level {gameState.level}
              </Badge>
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-500 animate-jungle-glow"
                  style={{ width: `${experiencePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="text-center mb-4 px-4 lg:px-0">
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full jungle-glass-morphism",
                timeLeft <= 5
                  ? "animate-pulse bg-red-500/20 text-red-700"
                  : "text-green-700",
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full",
                  timeLeft <= 5 ? "bg-red-500 animate-ping" : "bg-green-500",
                )}
              />
              <span className="font-bold text-lg">{timeLeft}s</span>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="relative z-20 px-4 lg:px-0 pb-8">
            {currentWord && (
              <div className="max-w-4xl mx-auto lg:max-w-none">
                <Card
                  className={cn(
                    "jungle-treasure-card mb-6 relative overflow-hidden transition-all duration-500",
                    showResult && isCorrect && "animate-treasureDiscovery",
                  )}
                >
                  <CardHeader className="text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-yellow-500/10" />
                    <CardTitle className="text-2xl font-bold text-emerald-800 relative z-10">
                      Listen and Find the Treasure!
                    </CardTitle>
                    <p className="text-emerald-600 relative z-10">
                      What word do you hear? 🎧
                    </p>
                  </CardHeader>

                  <CardContent className="relative">
                    {/* Audio Control */}
                    <div className="text-center mb-6">
                      <Button
                        size="lg"
                        onClick={handleReplayAudio}
                        className="jungle-audio-button group"
                        disabled={isAnswering}
                      >
                        <Volume2 className="w-6 h-6 mr-2 group-hover:animate-bounce" />
                        <span className="text-lg font-semibold">Play Word</span>
                        <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      </Button>
                    </div>

                    {/* Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {options.map((option, index) => {
                        const isSelected =
                          selectedOption === option.id.toString();
                        const isCorrectAnswer = option.id === currentWord.id;

                        let cardState = "default";
                        if (showResult) {
                          if (isSelected && isCorrectAnswer)
                            cardState = "correct";
                          else if (isSelected && !isCorrectAnswer)
                            cardState = "incorrect";
                          else if (isCorrectAnswer)
                            cardState = "reveal-correct";
                        }

                        return (
                          <Card
                            key={option.id}
                            className={cn(
                              "treasure-option-card cursor-pointer transition-all duration-300 relative overflow-hidden",
                              "hover:scale-105 hover:shadow-xl active:scale-98",
                              isSelected && "ring-4",
                              cardState === "correct" &&
                                "ring-green-500 bg-green-50 animate-treasureDiscovery",
                              cardState === "incorrect" &&
                                "ring-red-500 bg-red-50 animate-shake",
                              cardState === "reveal-correct" &&
                                "ring-green-400 bg-green-25 animate-jungle-glow",
                              isAnswering && "pointer-events-none",
                            )}
                            onClick={() => handleAnswerSelect(option.id)}
                          >
                            <CardContent className="p-6 text-center relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-emerald-50/30 to-green-100/20" />
                              <div className="text-6xl mb-4 relative z-10 select-none">
                                {option.emoji}
                              </div>
                              <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">
                                {option.word}
                              </h3>
                              {showResult && isSelected && (
                                <p className="text-sm text-gray-600 mt-2 animate-fadeIn relative z-10">
                                  {option.definition}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Result Display */}
                    {showResult && (
                      <div className="mt-6 text-center animate-jungle-entrance">
                        {isCorrect ? (
                          <div className="space-y-4">
                            <div className="text-6xl animate-bounce">🎉</div>
                            <h3 className="text-2xl font-bold text-green-700">
                              Treasure Found! 🏆
                            </h3>
                            <p className="text-green-600">
                              You discovered:{" "}
                              <strong>{currentWord.word}</strong>
                            </p>
                            <p className="text-sm text-gray-600 max-w-md mx-auto">
                              {currentWord.funFact}
                            </p>
                            {gameState.streak > 1 && (
                              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full border border-orange-300">
                                <Zap className="w-5 h-5 text-orange-600" />
                                <span className="font-bold text-orange-700">
                                  {gameState.streak} Streak! 🔥
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-6xl">😅</div>
                            <h3 className="text-2xl font-bold text-blue-700">
                              Keep Exploring! 🗺️
                            </h3>
                            <p className="text-blue-600">
                              The correct answer was:{" "}
                              <strong>{currentWord.word}</strong>
                            </p>
                            <p className="text-sm text-gray-600 max-w-md mx-auto">
                              {currentWord.definition}
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={handleNextQuestion}
                          className="mt-6 jungle-continue-button group"
                          size="lg"
                        >
                          <span className="mr-2">Continue Adventure</span>
                          <Star className="w-5 h-5 group-hover:animate-spin" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:order-2 lg:p-4">
          <div className="bg-gradient-to-b from-emerald-50/95 to-green-100/95 rounded-3xl p-6 shadow-xl border-2 border-emerald-300/60 backdrop-blur-sm h-fit sticky top-6">
            {/* Achievement Badges */}
            <div className="mb-6">
              <h3 className="font-bold text-emerald-800 mb-4 text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Adventure Progress
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-xl border border-yellow-300 transition-all hover:scale-105">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-900">Score</span>
                  </div>
                  <span className="font-bold text-yellow-900 text-lg">
                    {gameState.score.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-100 rounded-xl border border-orange-300 transition-all hover:scale-105">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold text-orange-900">
                      Streak
                    </span>
                  </div>
                  <span className="font-bold text-orange-900 text-lg">
                    {gameState.streak}x
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-100 rounded-xl border border-purple-300 transition-all hover:scale-105">
                  <div className="flex items-center gap-2">
                    <Gem className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">Gems</span>
                  </div>
                  <span className="font-bold text-purple-900 text-lg">
                    {gameState.gems}
                  </span>
                </div>
              </div>
            </div>

            {/* Plant Growth Visualization */}
            <div>
              <h3 className="font-bold text-emerald-800 mb-4 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Garden Growth
              </h3>
              <div className="text-center p-4 bg-green-100 rounded-xl border border-green-300">
                <div className="text-4xl mb-3 animate-jungle-float">
                  {gameState.plantGrowthStage === 0
                    ? "🌱"
                    : gameState.plantGrowthStage === 1
                      ? "🌿"
                      : gameState.plantGrowthStage === 2
                        ? "🌸"
                        : gameState.plantGrowthStage === 3
                          ? "🌺"
                          : gameState.plantGrowthStage === 4
                            ? "🌻"
                            : "🏆"}
                </div>
                <div className="font-semibold text-green-800 text-sm mb-3">
                  Stage: {Math.min(gameState.plantGrowthStage, 5)}/5
                </div>
                <div className="w-full h-3 bg-green-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 animate-jungle-glow"
                    style={{
                      width: `${(Math.min(gameState.plantGrowthStage, 5) / 5) * 100}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-green-700 mt-2 font-medium">
                  {gameState.plantGrowthStage < 5
                    ? "Growing stronger!"
                    : "Garden Complete! 🎉"}
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 text-sm">
                Session Stats
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Max Streak:</span>
                  <span className="font-bold text-blue-900">
                    {gameState.maxStreak}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Treasures Found:</span>
                  <span className="font-bold text-blue-900">
                    {gameState.treasuresFound}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Level:</span>
                  <span className="font-bold text-blue-900">
                    {gameState.level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Plant Growth - Below main content */}
      <div className="lg:hidden px-4 pb-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 rounded-full border border-green-300">
            <span className="text-2xl">
              {gameState.plantGrowthStage === 0
                ? "🌱"
                : gameState.plantGrowthStage === 1
                  ? "🌿"
                  : gameState.plantGrowthStage === 2
                    ? "🌸"
                    : gameState.plantGrowthStage === 3
                      ? "🌺"
                      : gameState.plantGrowthStage === 4
                        ? "🌻"
                        : "🏆"}
            </span>
            <span className="font-semibold text-green-800">
              Garden Stage: {Math.min(gameState.plantGrowthStage, 5)}/5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedJungleQuizAdventureDesktop;
