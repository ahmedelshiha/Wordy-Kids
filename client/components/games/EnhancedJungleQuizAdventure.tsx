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

interface EnhancedJungleQuizAdventureProps {
  selectedCategory?: string;
  onComplete?: (score: number, stats: any) => void;
  onExit?: () => void;
  words?: Word[];
  difficulty?: "easy" | "medium" | "hard";
  gameMode?: "adventure" | "challenge" | "zen";
}

export const EnhancedJungleQuizAdventure: React.FC<
  EnhancedJungleQuizAdventureProps
> = ({
  selectedCategory = "animals",
  onComplete,
  onExit,
  words: customWords,
  difficulty = "medium",
  gameMode = "adventure",
}) => {
  // Core game state
  const [gameState, setGameState] = useState<GameState>({
    currentWordIndex: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    gems: 100,
    stars: 3,
    lives: 3,
    timeBonus: 0,
    level: 1,
    experience: 0,
    powerUps: [
      {
        id: "hint",
        type: "hint",
        name: "Jungle Hint",
        icon: <Sparkles className="w-4 h-4" />,
        description: "Reveals the first letter",
        cost: 10,
        active: false,
        uses: 3,
      },
      {
        id: "streak",
        type: "streak",
        name: "Streak Multiplier",
        icon: <Zap className="w-4 h-4" />,
        description: "Double points for next answer",
        cost: 25,
        active: false,
        uses: 2,
      },
      {
        id: "time",
        type: "time",
        name: "Time Boost",
        icon: <Target className="w-4 h-4" />,
        description: "Extra time for this question",
        cost: 15,
        active: false,
        uses: 5,
      },
    ],
    achievements: [],
    plantGrowthStage: 0,
    treasuresFound: 0,
  });

  // Game setup
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<Word[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [gamePhase, setGamePhase] = useState<
    "playing" | "result" | "levelUp" | "gameOver"
  >("playing");

  // Visual effects state
  const [isCardFlipping, setIsCardFlipping] = useState(false);
  const [showSuccessParticles, setShowSuccessParticles] = useState(false);
  const [showStreakEffect, setShowStreakEffect] = useState(false);
  const [showTreasureDiscovery, setShowTreasureDiscovery] = useState(false);
  const [showLevelUpEffect, setShowLevelUpEffect] = useState(false);
  const [backgroundTheme, setBackgroundTheme] = useState<
    "morning" | "midday" | "evening" | "night"
  >("morning");
  const [weatherEffect, setWeatherEffect] = useState<
    "sunny" | "misty" | "gentle-rain" | "sparkles"
  >("sunny");

  // Audio and accessibility
  const [isMuted, setIsMuted] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Hooks
  const { showAchievement } = useAchievementNotifications();
  const { enableHapticFeedback, triggerHaptic } = useMobileTouch();
  const { isHighContrast, fontSize } = useAccessibilityFeatures();

  // Initialize words and game
  useEffect(() => {
    const initializeGame = () => {
      let gameWords: Word[] = [];

      if (customWords && customWords.length > 0) {
        gameWords = customWords;
      } else {
        gameWords =
          selectedCategory === "mixed"
            ? getRandomWords(20)
            : getWordsByCategory(selectedCategory);
      }

      // Filter by difficulty
      gameWords = gameWords.filter(
        (word) =>
          difficulty === "easy"
            ? word.difficulty === "easy"
            : difficulty === "medium"
              ? ["easy", "medium"].includes(word.difficulty)
              : word.difficulty, // hard includes all
      );

      // Ensure we have enough words
      if (gameWords.length < 10) {
        gameWords = [...gameWords, ...getRandomWords(10 - gameWords.length)];
      }

      setWords(gameWords.slice(0, 20)); // Limit to 20 words for optimal session length
    };

    initializeGame();
  }, [selectedCategory, difficulty, customWords]);

  // Initialize current word and options
  useEffect(() => {
    if (words.length > 0 && gameState.currentWordIndex < words.length) {
      const word = words[gameState.currentWordIndex];
      setCurrentWord(word);
      generateOptions(word);
      setTimeLeft(
        difficulty === "easy" ? 20 : difficulty === "medium" ? 15 : 10,
      );
      setIsTimerActive(true);
      setShowHint(false);
      setSelectedOption(null);
      setShowResult(false);
      setIsAnswering(false);

      // Auto-play pronunciation if enabled
      if (autoPlayAudio && !isMuted) {
        setTimeout(() => {
          playWordPronunciation(word.word);
        }, 500);
      }
    }
  }, [words, gameState.currentWordIndex, autoPlayAudio, isMuted, difficulty]);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && gamePhase === "playing") {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerActive, timeLeft, gamePhase]);

  // Dynamic background theme based on progress
  useEffect(() => {
    const progressPercent = (gameState.currentWordIndex / words.length) * 100;

    if (progressPercent < 25) {
      setBackgroundTheme("morning");
      setWeatherEffect("sunny");
    } else if (progressPercent < 50) {
      setBackgroundTheme("midday");
      setWeatherEffect("sparkles");
    } else if (progressPercent < 75) {
      setBackgroundTheme("evening");
      setWeatherEffect("misty");
    } else {
      setBackgroundTheme("night");
      setWeatherEffect("gentle-rain");
    }
  }, [gameState.currentWordIndex, words.length]);

  // Generate multiple choice options
  const generateOptions = useCallback((correctWord: Word) => {
    const allWords = wordsDatabase.filter(
      (w) => w.category === correctWord.category && w.id !== correctWord.id,
    );

    // Get 3 random incorrect options
    const shuffled = allWords.sort(() => 0.5 - Math.random());
    const incorrectOptions = shuffled.slice(0, 3);

    // Combine with correct answer and shuffle
    const allOptions = [correctWord, ...incorrectOptions].sort(
      () => 0.5 - Math.random(),
    );
    setOptions(allOptions);
  }, []);

  // Audio functions
  const playWordPronunciation = useCallback(
    async (word: string) => {
      if (isMuted) return;

      try {
        await enhancedAudioService.speakText(word, {
          rate: 0.8,
          pitch: 1.1,
          volume: 0.9,
        });
      } catch (error) {
        console.error("Failed to play word pronunciation:", error);
        // Fallback to regular audio service
        audioService.playSuccessSound();
      }
    },
    [isMuted],
  );

  const playSound = useCallback(
    (soundType: "success" | "error" | "click" | "whoosh" | "celebration") => {
      if (isMuted) return;

      switch (soundType) {
        case "success":
          audioService.playSuccessSound();
          break;
        case "error":
          audioService.playErrorSound();
          break;
        case "click":
          audioService.playClickSound();
          break;
        case "whoosh":
          audioService.playWhooshSound();
          break;
        case "celebration":
          // Play multiple celebration sounds in sequence
          audioService.playSuccessSound();
          setTimeout(() => audioService.playClickSound(), 200);
          setTimeout(() => audioService.playWhooshSound(), 400);
          break;
      }
    },
    [isMuted],
  );

  // Power-up functions
  const usePowerUp = useCallback(
    (powerUpId: string) => {
      const powerUp = gameState.powerUps.find((p) => p.id === powerUpId);
      if (!powerUp || powerUp.uses <= 0 || gameState.gems < powerUp.cost)
        return;

      setGameState((prev) => ({
        ...prev,
        gems: prev.gems - powerUp.cost,
        powerUps: prev.powerUps.map((p) =>
          p.id === powerUpId ? { ...p, uses: p.uses - 1, active: true } : p,
        ),
      }));

      // Apply power-up effect
      switch (powerUpId) {
        case "hint":
          setShowHint(true);
          triggerHaptic("light");
          playSound("click");
          break;
        case "streak":
          triggerHaptic("medium");
          playSound("success");
          break;
        case "time":
          setTimeLeft((prev) => prev + 10);
          triggerHaptic("light");
          playSound("whoosh");
          break;
      }
    },
    [gameState.powerUps, gameState.gems, triggerHaptic, playSound],
  );

  // Handle answer selection
  const handleAnswerSelect = useCallback(
    (selectedWordId: number) => {
      if (isAnswering || !currentWord) return;

      setIsAnswering(true);
      setSelectedOption(selectedWordId.toString());
      setIsTimerActive(false);

      const correct = selectedWordId === currentWord.id;
      setIsCorrect(correct);

      // Calculate points
      let points = 100;
      if (correct) {
        // Base points
        points = 100;

        // Time bonus
        const timeBonus = Math.max(0, timeLeft * 5);
        points += timeBonus;

        // Streak multiplier
        const streakMultiplier = Math.min(
          5,
          Math.floor(gameState.streak / 3) + 1,
        );
        points *= streakMultiplier;

        // Power-up multiplier
        const streakPowerUp = gameState.powerUps.find(
          (p) => p.id === "streak" && p.active,
        );
        if (streakPowerUp) {
          points *= 2;
        }

        // Difficulty multiplier
        const difficultyMultiplier =
          difficulty === "easy" ? 1 : difficulty === "medium" ? 1.2 : 1.5;
        points = Math.round(points * difficultyMultiplier);
      }

      // Update game state
      setGameState((prev) => {
        const newStreak = correct ? prev.streak + 1 : 0;
        const newScore = correct ? prev.score + points : prev.score;
        const newExperience = prev.experience + (correct ? 25 : 5);
        const newLevel = Math.floor(newExperience / 100) + 1;
        const leveledUp = newLevel > prev.level;

        return {
          ...prev,
          score: newScore,
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
          experience: newExperience,
          level: newLevel,
          lives: correct ? prev.lives : Math.max(0, prev.lives - 1),
          treasuresFound: correct
            ? prev.treasuresFound + 1
            : prev.treasuresFound,
          plantGrowthStage: Math.min(
            5,
            prev.plantGrowthStage + (correct ? 1 : 0),
          ),
          powerUps: prev.powerUps.map((p) => ({ ...p, active: false })), // Deactivate power-ups
        };
      });

      // Visual and audio feedback
      if (correct) {
        triggerHaptic("success");
        playSound("success");
        setShowSuccessParticles(true);

        if (gameState.streak > 0 && (gameState.streak + 1) % 3 === 0) {
          setShowStreakEffect(true);
          setTimeout(() => setShowStreakEffect(false), 2000);
        }

        if ((gameState.treasuresFound + 1) % 5 === 0) {
          setShowTreasureDiscovery(true);
          setTimeout(() => setShowTreasureDiscovery(false), 3000);
        }
      } else {
        triggerHaptic("error");
        playSound("error");
      }

      // Show result
      setTimeout(() => {
        setShowResult(true);
        setIsCardFlipping(true);

        setTimeout(() => {
          setIsCardFlipping(false);
          setShowSuccessParticles(false);
        }, 1000);
      }, 500);
    },
    [
      isAnswering,
      currentWord,
      timeLeft,
      gameState,
      difficulty,
      triggerHaptic,
      playSound,
    ],
  );

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (isAnswering || showResult) return;

    setIsTimerActive(false);
    setIsCorrect(false);

    setGameState((prev) => ({
      ...prev,
      streak: 0,
      lives: Math.max(0, prev.lives - 1),
    }));

    triggerHaptic("error");
    playSound("error");

    setTimeout(() => {
      setShowResult(true);
    }, 500);
  }, [isAnswering, showResult, triggerHaptic, playSound]);

  // Handle next question
  const handleNextQuestion = useCallback(() => {
    if (gameState.currentWordIndex + 1 >= words.length) {
      // Game complete
      setGamePhase("result");
      if (onComplete) {
        onComplete(gameState.score, {
          streak: gameState.maxStreak,
          accuracy: Math.round((gameState.treasuresFound / words.length) * 100),
          level: gameState.level,
          gems: gameState.gems,
        });
      }
      return;
    }

    if (gameState.lives <= 0) {
      // Game over
      setGamePhase("gameOver");
      return;
    }

    setGameState((prev) => ({
      ...prev,
      currentWordIndex: prev.currentWordIndex + 1,
    }));
  }, [gameState, words.length, onComplete]);

  // Handle replay pronunciation
  const handleReplayAudio = useCallback(() => {
    if (currentWord) {
      playWordPronunciation(currentWord.word);
      triggerHaptic("light");
    }
  }, [currentWord, playWordPronunciation, triggerHaptic]);

  // Progress calculation
  const progressPercent =
    words.length > 0 ? (gameState.currentWordIndex / words.length) * 100 : 0;
  const experiencePercent = gameState.experience % 100;

  return (
    <div
      ref={gameContainerRef}
      className={cn(
        "min-h-screen relative overflow-hidden",
        `jungle-background-${backgroundTheme}`,
        `weather-${weatherEffect}`,
        reducedMotion && "reduce-motion",
        isHighContrast && "high-contrast",
      )}
    >
      {/* Immersive Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/20 via-green-500/30 to-emerald-600/40" />
      <div className="absolute inset-0 jungle-parallax-layer-1" />
      <div className="absolute inset-0 jungle-parallax-layer-2" />
      <div className="absolute inset-0 jungle-parallax-layer-3" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-2 h-2 rounded-full opacity-60",
              "animate-jungle-float",
              weatherEffect === "sparkles"
                ? "bg-yellow-300"
                : weatherEffect === "gentle-rain"
                  ? "bg-blue-200"
                  : "bg-green-300",
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Header UI */}
      <div className="relative z-40 p-4">
        <div className="flex items-center justify-between mb-4">
          {/* Score and Progress */}
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

          {/* Controls */}
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

        {/* Progress Bar */}
        <div className="relative mb-4">
          <Progress
            value={progressPercent}
            className="h-3 jungle-progress-trail"
          />
          <div className="absolute -top-1 left-0 w-full h-5 flex items-center justify-between pointer-events-none">
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
        <div className="flex items-center justify-between mb-4">
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
        <div className="text-center mb-4">
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
      </div>

      {/* Power-ups Bar */}
      <div className="relative z-30 px-4 mb-4">
        <div className="flex justify-center gap-2">
          {gameState.powerUps.map((powerUp) => (
            <Button
              key={powerUp.id}
              variant="outline"
              size="sm"
              onClick={() => usePowerUp(powerUp.id)}
              disabled={powerUp.uses <= 0 || gameState.gems < powerUp.cost}
              className={cn(
                "jungle-glass-button flex items-center gap-2 transition-all duration-300",
                powerUp.active && "animate-jungle-glow",
                powerUp.uses <= 0 && "opacity-50",
              )}
            >
              {powerUp.icon}
              <span className="text-xs">
                {powerUp.cost} <Gem className="w-3 h-3 inline" />
              </span>
              <Badge variant="secondary" className="text-xs">
                {powerUp.uses}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-20 px-4 pb-8">
        {currentWord && (
          <div className="max-w-4xl mx-auto">
            {/* Question Card */}
            <Card
              className={cn(
                "jungle-treasure-card mb-6 relative overflow-hidden transition-all duration-500",
                isCardFlipping && "animate-jungle-celebration",
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

                {/* Hint Display */}
                {showHint && (
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300 animate-jungle-sparkle">
                    <p className="text-yellow-800 font-medium">
                      🔍 Hint: The word starts with "
                      {currentWord.word[0].toUpperCase()}"
                    </p>
                  </div>
                )}
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
                    const isSelected = selectedOption === option.id.toString();
                    const isCorrectAnswer = option.id === currentWord.id;

                    let cardState = "default";
                    if (showResult) {
                      if (isSelected && isCorrectAnswer) cardState = "correct";
                      else if (isSelected && !isCorrectAnswer)
                        cardState = "incorrect";
                      else if (isCorrectAnswer) cardState = "reveal-correct";
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
                          {/* Card Background Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-emerald-50/30 to-green-100/20" />

                          {/* Emoji */}
                          <div className="text-6xl mb-4 relative z-10 select-none">
                            {option.emoji}
                          </div>

                          {/* Word */}
                          <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">
                            {option.word}
                          </h3>

                          {/* Definition (shown after selection) */}
                          {showResult && isSelected && (
                            <p className="text-sm text-gray-600 mt-2 animate-fadeIn relative z-10">
                              {option.definition}
                            </p>
                          )}

                          {/* Success Particles */}
                          {showSuccessParticles && cardState === "correct" && (
                            <div className="absolute inset-0 pointer-events-none">
                              {[...Array(8)].map((_, i) => (
                                <div
                                  key={i}
                                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-celebration-sparkles"
                                  style={{
                                    left: `${20 + Math.random() * 60}%`,
                                    top: `${20 + Math.random() * 60}%`,
                                    animationDelay: `${i * 0.1}s`,
                                  }}
                                />
                              ))}
                            </div>
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
                          You discovered: <strong>{currentWord.word}</strong>
                        </p>
                        <p className="text-sm text-gray-600 max-w-md mx-auto">
                          {currentWord.funFact}
                        </p>

                        {/* Streak Display */}
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

            {/* Plant Growth Visualization */}
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
        )}
      </div>

      {/* Special Effects Overlays */}
      {showStreakEffect && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-8xl animate-jungle-celebration">
            🔥 STREAK! 🔥
          </div>
        </div>
      )}

      {showTreasureDiscovery && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center animate-jungle-level-up">
            <div className="text-8xl mb-4">💎</div>
            <h2 className="text-4xl font-bold text-yellow-600">
              LEGENDARY TREASURE!
            </h2>
          </div>
        </div>
      )}

      {showLevelUpEffect && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center animate-jungle-level-up">
            <div className="text-8xl mb-4">👑</div>
            <h2 className="text-4xl font-bold text-purple-600">LEVEL UP!</h2>
            <p className="text-xl text-purple-500">
              Welcome to Level {gameState.level}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedJungleQuizAdventure;
