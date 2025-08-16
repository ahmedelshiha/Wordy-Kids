import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Volume2,
  Star,
  Trophy,
  ArrowLeft,
  Play,
  Clock,
  Sparkles,
  Crown,
  Zap,
  Settings,
  RotateCcw,
  Target,
  Award,
  BookOpen,
} from "lucide-react";
import { AchievementTracker } from "@/lib/achievementTracker";
import { EnhancedAchievementPopup } from "@/components/EnhancedAchievementPopup";
import { audioService } from "@/lib/audioService";
import { playSoundIfEnabled } from "@/lib/soundEffects";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { FloatingHelpMenu } from "@/components/FloatingHelpMenu";
import { Word, getWordsByCategory, getRandomWords } from "@/data/wordsDatabase";
import { VowelQuizGenerator, VowelQuestion } from "@/lib/vowelQuizGeneration";

const vowelOptions = ["A", "E", "I", "O", "U"];

type GameMode = "easy" | "challenge" | "timed" | "custom";
type DifficultyLevel = "easy" | "medium" | "hard" | "mixed";

interface GameStats {
  totalQuestions: number;
  correctAnswers: number;
  totalAttempts: number;
  accuracy: number;
  averageTime: number;
  timeSpent: number;
  hintsUsed: number;
  perfectAnswers: number; // answered correctly on first try
}

interface EnhancedVowelQuizProps {
  category?: string;
  initialGameMode?: GameMode;
  initialDifficulty?: DifficultyLevel;
  customQuestions?: VowelQuestion[];
  rounds?: number;
  timeLimit?: number; // in seconds for timed mode
  onComplete: (stats: GameStats) => void;
  onExit: () => void;
  playerLevel?: number;
}

export function EnhancedVowelQuiz({
  category = "all",
  initialGameMode = "easy",
  initialDifficulty = "easy",
  customQuestions,
  rounds = 10,
  timeLimit = 60,
  onComplete,
  onExit,
  playerLevel = 1,
}: EnhancedVowelQuizProps) {
  // Core game state
  const [gameMode, setGameMode] = useState<GameMode>(initialGameMode);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVowels, setSelectedVowels] = useState<{
    [key: number]: string;
  }>({});
  
  // Game progression state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showSetup, setShowSetup] = useState(!customQuestions);
  const [isRestarting, setIsRestarting] = useState(false);
  
  // Feedback and UI state
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showMainCelebration, setShowMainCelebration] = useState(false);
  const [showSparkleExplosion, setShowSparkleExplosion] = useState(false);
  const [sparkleCount, setSparkleCount] = useState(0);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  
  // Timer and attempts
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  
  // Game statistics
  const [gameStats, setGameStats] = useState<GameStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    totalAttempts: 0,
    accuracy: 0,
    averageTime: 0,
    timeSpent: 0,
    hintsUsed: 0,
    perfectAnswers: 0,
  });

  // Generate game questions based on mode and difficulty
  const gameQuestions = useMemo(() => {
    if (customQuestions && customQuestions.length > 0) {
      return customQuestions;
    }

    if (!gameStarted) return [];

    try {
      const questionCount = gameMode === "timed" ? 50 : rounds; // More questions for timed mode
      
      return VowelQuizGenerator.getSystematicVowelQuestions({
        category,
        difficulty: difficulty === "mixed" ? undefined : difficulty,
        count: questionCount,
        gameMode: gameMode === "custom" ? "challenge" : gameMode,
      });
    } catch (error) {
      console.warn("Failed to generate questions, using fallback:", error);
      // Fallback to basic generation
      return generateFallbackQuestions();
    }
  }, [
    customQuestions,
    gameStarted,
    gameMode,
    difficulty,
    category,
    rounds,
    isRestarting,
  ]);

  const generateFallbackQuestions = useCallback((): VowelQuestion[] => {
    const words = category === "all" 
      ? getRandomWords(rounds * 2) 
      : getWordsByCategory(category).slice(0, rounds * 2);
    
    return words.slice(0, rounds).map((word, index) => ({
      id: word.id || index,
      word: word.word.toLowerCase(),
      missingIndex: generateMissingVowelIndices(word.word),
      emoji: word.emoji,
      category: word.category,
      difficulty: word.difficulty,
      originalWord: word,
    }));
  }, [category, rounds]);

  const generateMissingVowelIndices = useCallback((word: string): number[] => {
    const vowels = ["a", "e", "i", "o", "u"];
    const vowelIndices = word
      .split("")
      .map((char, index) => ({ char: char.toLowerCase(), index }))
      .filter(({ char }) => vowels.includes(char))
      .map(({ index }) => index);

    if (vowelIndices.length === 0) return [];

    const maxToRemove = gameMode === "easy" ? 1 : 
                      gameMode === "challenge" ? Math.min(2, vowelIndices.length) : 
                      Math.min(3, vowelIndices.length);
    
    const numToRemove = Math.min(vowelIndices.length, maxToRemove);
    const shuffled = [...vowelIndices].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, numToRemove).sort((a, b) => a - b);
  }, [gameMode]);

  const currentQuestion = gameQuestions[currentIndex];
  const isTimedMode = gameMode === "timed";

  // Timer effect for timed mode
  useEffect(() => {
    if (isTimedMode && gameStarted && !gameComplete && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isTimedMode && timeLeft === 0) {
      handleGameComplete();
    }
  }, [timeLeft, isTimedMode, gameStarted, gameComplete]);

  // Track question timing
  useEffect(() => {
    if (currentQuestion && gameStarted) {
      setQuestionStartTime(Date.now());
    }
  }, [currentIndex, gameStarted]);

  const playAudio = () => {
    if ("speechSynthesis" in window && currentQuestion) {
      const wordToSpeak = currentQuestion.originalWord?.word || currentQuestion.word;
      const utterance = new SpeechSynthesisUtterance(wordToSpeak);
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleVowelSelect = (vowel: string, position: number) => {
    if (showFeedback || !currentQuestion) return;

    const newSelectedVowels = { ...selectedVowels, [position]: vowel };
    setSelectedVowels(newSelectedVowels);
    setAttempts(attempts + 1);

    // Update game stats
    setGameStats(prev => ({
      ...prev,
      totalAttempts: prev.totalAttempts + 1,
    }));

    // Immediately check this specific vowel
    const correctVowel = currentQuestion.word[position];
    const isVowelCorrect = vowel.toLowerCase() === correctVowel.toLowerCase();

    if (!isVowelCorrect) {
      setShowFeedback(true);
      audioService.playEncouragementSound();

      // Haptic feedback for wrong answer
      if (navigator && "vibrate" in navigator) {
        (navigator as any).vibrate([40, 60, 40]);
      }

      setTimeout(() => {
        const clearedVowels = { ...newSelectedVowels };
        delete clearedVowels[position];
        setSelectedVowels(clearedVowels);
        setShowFeedback(false);
      }, 1500);
      return;
    }

    // Gentle vibration for correct vowel
    if (navigator && "vibrate" in navigator) {
      (navigator as any).vibrate(30);
    }

    // Check if all missing positions are filled with correct vowels
    const allFilled = currentQuestion.missingIndex.every(
      (idx) => newSelectedVowels[idx] !== undefined,
    );

    if (allFilled) {
      checkAnswer(newSelectedVowels);
    }
  };

  const checkAnswer = (vowels: { [key: number]: string }) => {
    if (!currentQuestion) return;

    const isCorrect = currentQuestion.missingIndex.every((idx) => {
      const selectedVowel = vowels[idx];
      const correctVowel = currentQuestion.word[idx];
      return (
        selectedVowel &&
        selectedVowel.toLowerCase() === correctVowel.toLowerCase()
      );
    });

    setShowFeedback(true);

    if (isCorrect) {
      const questionTime = Date.now() - questionStartTime;
      const points = attempts === 1 ? 10 : attempts <= 2 ? 8 : attempts <= 4 ? 5 : 2;
      const isPerfect = attempts === 1;

      // Update game stats
      setGameStats(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        timeSpent: prev.timeSpent + questionTime,
        perfectAnswers: isPerfect ? prev.perfectAnswers + 1 : prev.perfectAnswers,
      }));

      setShowReward(true);

      // Enhanced celebration effects
      setShowMainCelebration(true);
      setShowSparkleExplosion(true);
      setSparkleCount((prev) => prev + 1);
      audioService.playSuccessSound();

      // Auto-hide effects
      setTimeout(() => {
        setShowSparkleExplosion(false);
        setShowReward(false);
        setShowMainCelebration(false);
      }, 1500);

      setTimeout(() => {
        nextQuestion();
      }, 2000);
    } else {
      audioService.playEncouragementSound();
    }
  };

  const handleShowHint = () => {
    if (!currentQuestion) return;

    const hintVowels: { [key: number]: string } = {};
    currentQuestion.missingIndex.forEach((idx) => {
      hintVowels[idx] = currentQuestion.word[idx].toUpperCase();
    });
    setSelectedVowels(hintVowels);
    setShowFeedback(true);
    setHintsUsed(hintsUsed + 1);

    setGameStats(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
    }));

    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setSelectedVowels({});
    setAttempts(0);

    if (currentIndex < gameQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGameComplete();
    }
  };

  const handleGameComplete = () => {
    setGameComplete(true);

    // Calculate final stats
    const finalStats: GameStats = {
      ...gameStats,
      totalQuestions: Math.min(currentIndex + 1, gameQuestions.length),
      accuracy: gameStats.correctAnswers / Math.min(currentIndex + 1, gameQuestions.length),
      averageTime: gameStats.timeSpent / Math.max(gameStats.correctAnswers, 1),
    };

    setGameStats(finalStats);

    // Play completion celebration
    setShowMainCelebration(true);
    audioService.playSuccessSound();
    setTimeout(() => setShowMainCelebration(false), 3000);

    // Track achievements
    const unlockedAchievements = AchievementTracker.trackActivity({
      type: "vowelRescue",
      accuracy: Math.round(finalStats.accuracy * 100),
      timeSpent: isTimedMode ? timeLimit - timeLeft : finalStats.timeSpent / 1000,
    });

    if (unlockedAchievements.length > 0) {
      setNewAchievements(unlockedAchievements);
    }

    setTimeout(() => {
      onComplete(finalStats);
    }, 2000);
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setSelectedVowels({});
    setGameStarted(false);
    setGameComplete(false);
    setShowSetup(true);
    setAttempts(0);
    setTimeLeft(timeLimit);
    setHintsUsed(0);
    setShowFeedback(false);
    setShowReward(false);
    setSparkleCount(0);
    setShowSparkleExplosion(false);
    setGameStats({
      totalQuestions: 0,
      correctAnswers: 0,
      totalAttempts: 0,
      accuracy: 0,
      averageTime: 0,
      timeSpent: 0,
      hintsUsed: 0,
      perfectAnswers: 0,
    });
    setIsRestarting(prev => !prev);
  };

  const renderWord = () => {
    if (!currentQuestion) return null;

    return currentQuestion.word.split("").map((letter, index) => {
      const isMissing = currentQuestion.missingIndex.includes(index);
      const selectedVowel = selectedVowels[index];

      return (
        <motion.span
          key={index}
          className={`inline-block text-xl sm:text-2xl md:text-4xl font-bold mx-0.5 sm:mx-1 ${
            isMissing
              ? "w-6 sm:w-8 md:w-12 h-8 sm:h-10 md:h-14 border-b-2 sm:border-b-4 border-educational-blue text-center"
              : ""
          }`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          {isMissing ? (
            <span
              className={`
              ${
                showFeedback
                  ? selectedVowel?.toLowerCase() === letter.toLowerCase()
                    ? "text-green-500 animate-bounce"
                    : "text-red-500 animate-pulse"
                  : "text-educational-blue"
              }
            `}
            >
              {selectedVowel || "_"}
            </span>
          ) : (
            letter.toUpperCase()
          )}
        </motion.span>
      );
    });
  };

  const getMissingVowelPositions = () => {
    if (!currentQuestion) return [];
    return currentQuestion.missingIndex.filter((idx) => !selectedVowels[idx]);
  };

  const getNextMissingPosition = () => {
    return getMissingVowelPositions()[0];
  };

  // Game setup screen
  if (showSetup && !customQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-educational-blue/20 to-educational-purple/20 flex items-center justify-center p-2 sm:p-4">
        <Card className="w-full max-w-2xl mx-2 sm:mx-4">
          <CardContent className="p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <Button
                onClick={onExit}
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 rounded-full hover:bg-red-50 hover:text-red-600"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl sm:text-6xl mb-4 animate-bounce"
              >
                🎯
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-educational-blue mb-2">
                Enhanced Vowel Quiz
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Choose your adventure! Complete words by finding missing vowels.
              </p>
            </div>

            {/* Game Mode Selection */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-center">Choose Game Mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "easy", title: "Easy Mode", desc: "Single missing vowels", icon: "🌱", color: "green" },
                  { id: "challenge", title: "Challenge Mode", desc: "Multiple missing vowels", icon: "🎯", color: "blue" },
                  { id: "timed", title: "Timed Rush", desc: "60 seconds to complete as many as possible", icon: "⚡", color: "orange" },
                  { id: "custom", title: "Custom Mode", desc: "Mix of difficulties", icon: "⚙️", color: "purple" },
                ].map((mode) => (
                  <Card
                    key={mode.id}
                    className={`cursor-pointer transition-all hover:scale-105 border-2 ${
                      gameMode === mode.id ? "border-educational-blue bg-educational-blue/10" : "border-gray-200"
                    }`}
                    onClick={() => setGameMode(mode.id as GameMode)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{mode.icon}</div>
                      <h4 className="font-semibold">{mode.title}</h4>
                      <p className="text-sm text-gray-600">{mode.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Difficulty Selection (not for timed mode) */}
            {gameMode !== "timed" && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-center">Choose Difficulty</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "easy", title: "Easy", icon: "😊" },
                    { id: "medium", title: "Medium", icon: "🤔" },
                    { id: "hard", title: "Hard", icon: "😤" },
                    { id: "mixed", title: "Mixed", icon: "🎲" },
                  ].map((diff) => (
                    <Button
                      key={diff.id}
                      variant={difficulty === diff.id ? "default" : "outline"}
                      className="h-16 flex-col"
                      onClick={() => setDifficulty(diff.id as DifficultyLevel)}
                    >
                      <span className="text-lg">{diff.icon}</span>
                      <span className="text-sm">{diff.title}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Start Button */}
            <div className="text-center">
              <Button
                onClick={() => {
                  setShowSetup(false);
                  setGameStarted(true);
                }}
                className="w-full bg-educational-blue hover:bg-educational-blue/90 text-white py-4 text-lg rounded-xl"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Vowel Adventure!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Game completion screen
  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-educational-green/20 to-educational-blue/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 sm:p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-5xl sm:text-6xl mb-4"
            >
              🏆
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-educational-green mb-4">
              Quest Complete!
            </h1>
            
            {/* Enhanced Stats Display */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              <div className="bg-educational-green/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-educational-green">
                  {Math.round(gameStats.accuracy * 100)}%
                </div>
                <div className="text-xs text-gray-600">Accuracy</div>
              </div>
              <div className="bg-educational-blue/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-educational-blue">
                  {gameStats.correctAnswers}/{gameStats.totalQuestions}
                </div>
                <div className="text-xs text-gray-600">Correct</div>
              </div>
              <div className="bg-educational-purple/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-educational-purple">
                  {gameStats.perfectAnswers}
                </div>
                <div className="text-xs text-gray-600">Perfect</div>
              </div>
              <div className="bg-educational-orange/20 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-educational-orange">
                  {gameStats.hintsUsed}
                </div>
                <div className="text-xs text-gray-600">Hints</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={onExit}
                variant="outline"
                className="flex-1 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
              <Button
                onClick={restartGame}
                className="flex-1 bg-educational-blue hover:bg-educational-blue/90 min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main game screen
  if (!gameStarted || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-educational-blue/20 to-educational-purple/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Loading your vowel adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-educational-yellow/20 to-educational-orange/20 p-2 sm:p-4 touch-manipulation">
      <div className="max-w-2xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Button
              onClick={onExit}
              variant="outline"
              size="sm"
              className="rounded-full hover:bg-red-50 hover:text-red-600"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Exit</span>
            </Button>

            <div className="text-center flex-1 mx-2">
              <h3 className="text-sm sm:text-lg font-bold text-educational-blue">
                Enhanced Vowel Quiz
              </h3>
              <div className="text-xs text-gray-600 capitalize">
                {gameMode} Mode • {difficulty !== "mixed" ? difficulty : "Mixed"} Difficulty
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {isTimedMode && (
                <div className="flex items-center gap-1 bg-educational-blue/10 px-1.5 sm:px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3 text-educational-blue" />
                  <span className="font-bold text-educational-blue text-xs sm:text-sm">
                    {timeLeft}s
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 bg-educational-orange/10 px-1.5 sm:px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-educational-orange" />
                <span className="font-bold text-educational-orange text-xs sm:text-sm">
                  {gameStats.correctAnswers}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Information */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span className="font-medium">
              Q{currentIndex + 1}/{gameQuestions.length}
            </span>
            <span className="font-medium">
              {Math.round(((currentIndex + 1) / gameQuestions.length) * 100)}%
            </span>
          </div>

          <Progress
            value={((currentIndex + 1) / gameQuestions.length) * 100}
            className="h-2"
          />
        </div>

        {/* Sparkle explosion effect */}
        {showSparkleExplosion && (
          <div className="absolute inset-0 pointer-events-none z-30">
            <div className="absolute top-1/4 left-1/4 animate-ping">
              <Sparkles className="w-8 h-8 text-yellow-300" />
            </div>
            <div className="absolute top-1/3 right-1/4 animate-pulse">
              <Star className="w-6 h-6 text-pink-300" />
            </div>
            <div className="absolute bottom-1/3 left-1/3 animate-bounce">
              <Zap className="w-7 h-7 text-blue-300" />
            </div>
            <div className="absolute top-1/2 right-1/3 animate-spin">
              <Crown className="w-5 h-5 text-purple-300" />
            </div>
          </div>
        )}

        {/* Game Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6 md:p-8">
            {/* Image and Audio */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                key={currentQuestion.word}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative inline-block"
              >
                <div className="relative">
                  <div
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 bg-gradient-to-br from-educational-blue/20 to-educational-purple/20 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                    onClick={playAudio}
                  >
                    <span className="text-6xl sm:text-7xl md:text-9xl animate-gentle-bounce">
                      {currentQuestion.originalWord?.emoji || 
                       currentQuestion.emoji || 
                       currentQuestion.image || 
                       "🎯"}
                    </span>
                  </div>

                  {/* Category Badge */}
                  {currentQuestion.originalWord?.category && (
                    <div className="absolute -top-1 -right-1 bg-educational-blue text-white px-2 py-1 rounded-full text-xs font-bold capitalize">
                      {currentQuestion.originalWord.category}
                    </div>
                  )}
                </div>
                <Button
                  onClick={playAudio}
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 bg-educational-green hover:bg-educational-green/90"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            {/* Word Display */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center gap-0.5 sm:gap-1 p-3 sm:p-4 bg-gray-50 rounded-xl min-h-[60px] sm:min-h-[80px]">
                {renderWord()}
              </div>
            </div>

            {/* Vowel Buttons */}
            <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-6 px-2">
              {vowelOptions.map((vowel) => {
                const nextPosition = getNextMissingPosition();
                const allCompleted = getMissingVowelPositions().length === 0;
                const isDisabled = showFeedback && allCompleted;

                return (
                  <motion.button
                    key={vowel}
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full font-bold text-base sm:text-lg md:text-xl text-white transition-all min-h-[48px] min-w-[48px] shadow-lg
                      ${
                        isDisabled
                          ? "bg-gray-400 cursor-not-allowed opacity-60"
                          : "bg-educational-blue hover:bg-educational-blue/90 hover:scale-110 active:scale-95"
                      }
                    `}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => !isDisabled && handleVowelSelect(vowel, nextPosition)}
                    disabled={isDisabled}
                  >
                    {vowel}
                  </motion.button>
                );
              })}
            </div>

            {/* Enhanced Feedback */}
            {showFeedback && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center mt-4 sm:mt-6 px-2"
              >
                {currentQuestion.missingIndex.every(
                  (idx) =>
                    selectedVowels[idx]?.toLowerCase() ===
                    currentQuestion.word[idx].toLowerCase(),
                ) ? (
                  <div className="space-y-3">
                    <div className="text-green-500 text-lg sm:text-xl font-bold">
                      🎉 Excellent! Perfect match! 🎉
                    </div>
                    {attempts === 1 && (
                      <div className="text-yellow-500 text-sm font-bold">
                        ⭐ Perfect Score! First try! ⭐
                      </div>
                    )}
                    {currentQuestion.originalWord?.definition && (
                      <div className="bg-educational-blue/10 p-3 rounded-lg mt-3 text-left">
                        <div className="text-sm font-semibold text-educational-blue mb-1">
                          "{currentQuestion.word.toUpperCase()}" means:
                        </div>
                        <div className="text-sm text-gray-700">
                          {currentQuestion.originalWord.definition}
                        </div>
                        {currentQuestion.originalWord.example && (
                          <div className="text-xs text-gray-600 mt-2 italic">
                            Example: "{currentQuestion.originalWord.example}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-orange-500 text-base sm:text-lg font-bold">
                      {attempts === 1
                        ? "Almost! Try a different vowel! 🤔"
                        : attempts === 2
                          ? "Getting closer! Think carefully! 🤗"
                          : attempts === 3
                            ? "One more try! You've got this! 💪"
                            : "Let's work on this together! 😊"}
                    </div>

                    {attempts < 5 && (
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button
                          onClick={() => {
                            setShowFeedback(false);
                            setSelectedVowels({});
                          }}
                          className="bg-educational-blue hover:bg-educational-blue/90 text-white px-6 py-2 rounded-full text-sm"
                          size="sm"
                        >
                          🔄 Try Again!
                        </Button>

                        {attempts >= 3 && (
                          <Button
                            onClick={handleShowHint}
                            className="bg-educational-green hover:bg-educational-green/90 text-white px-6 py-2 rounded-full text-sm"
                            size="sm"
                          >
                            💡 Show Hint!
                          </Button>
                        )}
                      </div>
                    )}

                    {attempts >= 5 && (
                      <Button
                        onClick={handleShowHint}
                        className="bg-educational-purple hover:bg-educational-purple/90 text-white px-6 py-2 rounded-full text-sm"
                        size="sm"
                      >
                        Show Answer ✨
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Reward Animation */}
        <AnimatePresence>
          {showReward && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1.2, y: -20 }}
                exit={{ scale: 0.8, y: -100, opacity: 0 }}
                className="text-6xl"
              >
                ⭐🎉⭐
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Achievement Popup */}
        {newAchievements.length > 0 && (
          <EnhancedAchievementPopup
            achievements={newAchievements}
            onClose={() => setNewAchievements([])}
            onAchievementClaim={(achievement) => {
              console.log("Achievement claimed:", achievement);
            }}
            autoCloseDelay={3000}
          />
        )}

        {/* Celebration Effect */}
        <CelebrationEffect
          trigger={showMainCelebration}
          type="stars"
          onComplete={() => setShowMainCelebration(false)}
        />

        {/* Floating Help Menu */}
        <FloatingHelpMenu
          currentPage="vowel-rescue"
          onHelpAction={(helpContent) => {
            if ("speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance(
                `${helpContent.title}. ${helpContent.message.replace(/\n/g, ". ").replace(/•/g, "")}`,
              );
              utterance.rate = 0.8;
              utterance.pitch = 1.1;
              speechSynthesis.speak(utterance);
            }
          }}
          onSettings={() => playSoundIfEnabled("click")}
          onAchievements={() => playSoundIfEnabled("success")}
        />
      </div>
    </div>
  );
}
