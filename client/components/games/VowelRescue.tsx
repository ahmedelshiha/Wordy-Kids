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
} from "lucide-react";
import { AchievementTracker } from "@/lib/achievementTracker";
// EnhancedAchievementPopup removed - now using LightweightAchievementProvider
import { audioService } from "@/lib/audioService";
import { playSoundIfEnabled } from "@/lib/soundEffects";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { Word, getWordsByCategory, getRandomWords } from "@/data/wordsDatabase";

const vowelOptions = ["A", "E", "I", "O", "U"];

interface VowelQuestion {
  id: string | number;
  word: string;
  missingIndex: number[];
  image?: string;
  audio?: string;
  difficulty?: "easy" | "medium" | "hard";
  originalWord?: Word; // Reference to the original word object from database
  category?: string;
  emoji?: string;
}

interface VowelRescueProps {
  questions?: VowelQuestion[]; // Now optional - will generate from database if not provided
  rounds?: number; // default 8
  difficulty?: "easy" | "medium" | "hard"; // default "easy"
  category?: string; // word category to focus on
  playerLevel?: number; // for progressive difficulty
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
  gameMode?: "easy" | "challenge" | "timed";
}

export function VowelRescue({
  questions,
  rounds = 8,
  difficulty = "easy",
  category,
  playerLevel = 1,
  onComplete,
  onExit,
  gameMode = "easy",
}: VowelRescueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedVowels, setSelectedVowels] = useState<{
    [key: number]: string;
  }>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [gameStarted, setGameStarted] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameComplete, setGameComplete] = useState(false);
  // newAchievements state removed - now using event-based system
  const [showMainCelebration, setShowMainCelebration] = useState(false);
  const [showSparkleExplosion, setShowSparkleExplosion] = useState(false);
  const [sparkleCount, setSparkleCount] = useState(0);
  const [isRestarting, setIsRestarting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Enhanced word generation using database words with sophisticated selection (same as Listen & Guess)
  const generateDatabaseWords = useCallback(
    (
      count: number,
      category?: string,
      difficulty?: "easy" | "medium" | "hard",
    ): VowelQuestion[] => {
      let dbWords: Word[] = [];

      if (category && category !== "all") {
        dbWords = getWordsByCategory(category);
      } else {
        dbWords = getRandomWords(count * 3); // Get 3x more words for better selection options
      }

      if (difficulty) {
        dbWords = dbWords.filter((w) => w.difficulty === difficulty);
      }

      // Convert database words to VowelQuestion format using emojis
      return dbWords.slice(0, count).map((word) => ({
        id: word.id,
        word: word.word,
        missingIndex: generateMissingVowelIndices(word.word),
        emoji: word.emoji,
        category: word.category,
        difficulty: word.difficulty,
        originalWord: word,
      }));
    },
    [],
  );

  // Generate missing vowel indices intelligently
  const generateMissingVowelIndices = useCallback((word: string): number[] => {
    const vowels = ["a", "e", "i", "o", "u"];
    const vowelIndices = word
      .split("")
      .map((char, index) => ({ char: char.toLowerCase(), index }))
      .filter(({ char }) => vowels.includes(char))
      .map(({ index }) => index);

    // For variety, remove 1-3 vowels based on word length and difficulty
    const numToRemove = Math.min(
      vowelIndices.length,
      word.length <= 4 ? 1 : word.length <= 6 ? 2 : 3,
    );

    // Shuffle and take the first N vowel positions
    const shuffled = [...vowelIndices].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, numToRemove).sort((a, b) => a - b);
  }, []);

  // Generate or use provided questions - Enhanced with database words
  const gameQuestions = useMemo(() => {
    if (questions && questions.length > 0) {
      return questions;
    }

    // Use database-based word generation with sophisticated selection
    const difficultyLevel =
      difficulty ||
      (playerLevel <= 3 ? "easy" : playerLevel <= 7 ? "medium" : "hard");
    return generateDatabaseWords(rounds, category, difficultyLevel);
  }, [
    questions,
    rounds,
    category,
    difficulty,
    playerLevel,
    generateDatabaseWords,
    isRestarting,
  ]);

  const currentQuestion = gameQuestions[currentIndex];
  const isTimedMode = gameMode === "timed";

  // Timer for timed mode
  useEffect(() => {
    if (isTimedMode && gameStarted && !gameComplete && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isTimedMode && timeLeft === 0) {
      handleGameComplete();
    }
  }, [timeLeft, isTimedMode, gameStarted, gameComplete]);

  const playAudio = () => {
    // Import sanitization helper to prevent "[object Object]" errors
    const { sanitizeTTSInput, logSpeechError } = require("@/lib/speechUtils");

    const wordToSpeak = currentQuestion.originalWord?.pronunciation
      ? currentQuestion.originalWord.word
      : currentQuestion.word;

    // Sanitize input to prevent errors
    const sanitizedWord = sanitizeTTSInput(wordToSpeak);
    if (!sanitizedWord) {
      logSpeechError("VowelRescue.playAudio", wordToSpeak, "Empty word after sanitization");
      return;
    }

    // Use speech synthesis API with sanitized input
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(sanitizedWord);
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleVowelSelect = (vowel: string, position: number) => {
    if (showFeedback) return;

    const newSelectedVowels = { ...selectedVowels, [position]: vowel };
    setSelectedVowels(newSelectedVowels);

    // Immediately check this specific vowel
    const correctVowel = currentQuestion.word[position];
    const isVowelCorrect = vowel.toLowerCase() === correctVowel.toLowerCase();

    if (!isVowelCorrect) {
      // Show immediate feedback for wrong vowel
      setAttempts(attempts + 1);
      setShowFeedback(true);
      // Play encouraging speech for wrong vowel
      audioService.playEncouragementSound();

      // Haptic feedback for wrong answer
      if (navigator && "vibrate" in navigator)
        (navigator as any).vibrate([40, 60, 40]);

      setTimeout(() => {
        // Clear the wrong vowel and allow trying again
        const clearedVowels = { ...newSelectedVowels };
        delete clearedVowels[position];
        setSelectedVowels(clearedVowels);
        setShowFeedback(false);
      }, 1500);
      return;
    }

    // Gentle vibration for correct vowel
    if (navigator && "vibrate" in navigator) (navigator as any).vibrate(30);

    // Check if all missing positions are filled with correct vowels
    const allFilled = currentQuestion.missingIndex.every(
      (idx) => newSelectedVowels[idx] !== undefined,
    );

    if (allFilled) {
      checkAnswer(newSelectedVowels);
    }
  };

  const checkAnswer = (vowels: { [key: number]: string }) => {
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
      const points =
        attempts === 0 ? 10 : attempts <= 2 ? 8 : attempts <= 4 ? 5 : 2;
      setScore(score + points);
      setShowReward(true);

      // Enhanced celebration effects with sparkles like Listen & Guess
      setShowMainCelebration(true);
      setShowSparkleExplosion(true);
      setSparkleCount((prev) => prev + 1);
      audioService.playSuccessSound();

      // Auto-hide sparkle explosion after animation
      setTimeout(() => {
        setShowSparkleExplosion(false);
        setShowReward(false);
        setShowMainCelebration(false);
      }, 1500);

      setTimeout(() => {
        nextQuestion();
      }, 2000);
    } else {
      // Play encouraging speech for wrong vowel
      audioService.playEncouragementSound();
    }
  };

  const handleTryAgain = () => {
    // Clear wrong selections but keep any correct ones
    const clearedVowels: { [key: number]: string } = {};
    currentQuestion.missingIndex.forEach((idx) => {
      const selectedVowel = selectedVowels[idx];
      const correctVowel = currentQuestion.word[idx];

      // Keep correct vowels, clear wrong ones
      if (
        selectedVowel &&
        selectedVowel.toLowerCase() === correctVowel.toLowerCase()
      ) {
        clearedVowels[idx] = selectedVowel;
      }
    });

    setSelectedVowels(clearedVowels);
    setShowFeedback(false);
  };

  const handleShowHint = () => {
    // Show the correct vowels as a hint
    const hintVowels: { [key: number]: string } = {};
    currentQuestion.missingIndex.forEach((idx) => {
      hintVowels[idx] = currentQuestion.word[idx].toUpperCase();
    });
    setSelectedVowels(hintVowels);
    setShowFeedback(true);

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

    // Play completion celebration
    setShowMainCelebration(true);
    audioService.playSuccessSound();
    setTimeout(() => setShowMainCelebration(false), 3000);

    // Calculate final accuracy
    const accuracy = Math.round((score / (gameQuestions.length * 10)) * 100);

    // Track vowel rescue completion and check for achievements
    const unlockedAchievements = AchievementTracker.trackActivity({
      type: "vowelRescue",
      accuracy,
      timeSpent: isTimedMode ? 60 - timeLeft : undefined,
    });

    // Show achievement popup if any achievements were unlocked
    if (unlockedAchievements.length > 0) {
      // Trigger achievements through new lightweight popup system
      unlockedAchievements.forEach((achievement) => {
        const event = new CustomEvent("milestoneUnlocked", {
          detail: { achievement },
        });
        window.dispatchEvent(event);
      });
    }

    setTimeout(() => {
      onComplete(score, gameQuestions.length * 10);
    }, 2000);
  };

  const renderWord = () => {
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
    return currentQuestion.missingIndex.filter((idx) => !selectedVowels[idx]);
  };

  const getNextMissingPosition = () => {
    return getMissingVowelPositions()[0];
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-educational-blue/20 to-educational-purple/20 flex items-center justify-center p-2 sm:p-4 safe-area-padding-bottom">
        <Card className="w-full max-w-md mx-2 sm:mx-4 mobile-optimized">
          <CardContent className="p-4 sm:p-6 md:p-8 text-center relative">
            {/* Close button - Enhanced Mobile */}
            <Button
              onClick={onExit}
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 rounded-full hover:bg-red-50 hover:text-red-600 border-red-200 min-h-[44px] min-w-[44px] touch-target"
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
            <h1 className="text-2xl sm:text-3xl font-bold text-educational-blue mb-4">
              Vowel Rescue!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6 px-2">
              Help rescue the missing vowels! Look at the picture and complete
              the word by choosing the correct vowel letters.
            </p>
            <div className="mb-6">
              <div className="flex justify-center gap-2 mb-4">
                {vowelOptions.map((vowel, idx) => (
                  <motion.div
                    key={vowel}
                    className="w-8 h-8 sm:w-10 sm:h-10 bg-educational-blue rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {vowel}
                  </motion.div>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 px-2">
                {isTimedMode
                  ? `You have 60 seconds to complete as many words as possible!`
                  : `${gameQuestions.length} words to complete`}
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => setGameStarted(true)}
                className="w-full bg-educational-blue hover:bg-educational-blue/90 text-white py-4 sm:py-6 text-base sm:text-lg rounded-xl min-h-[52px]"
                size="lg"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start Adventure!
              </Button>
              <Button
                onClick={onExit}
                variant="outline"
                className="w-full py-3 rounded-xl min-h-[44px]"
                size="lg"
              >
                Back to Quiz Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              Adventure Complete!
            </h1>
            <div className="text-3xl sm:text-4xl font-bold text-educational-blue mb-4">
              {score} points!
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-6 px-2">
              You rescued {Math.floor(score / 5)} vowels! Great job! 🌟
            </p>

            {/* Enhanced completion stats */}
            <div className="flex justify-center gap-4 mb-4 text-sm">
              <div className="bg-educational-green/20 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-educational-green">
                  {Math.round((score / (gameQuestions.length * 10)) * 100)}%
                </div>
                <div className="text-xs text-gray-600">Accuracy</div>
              </div>
              <div className="bg-educational-blue/20 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-educational-blue">
                  {gameQuestions.length}
                </div>
                <div className="text-xs text-gray-600">Words</div>
              </div>
              <div className="bg-educational-purple/20 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-educational-purple">
                  {Math.floor(score / 5)}
                </div>
                <div className="text-xs text-gray-600">Rescued</div>
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
                onClick={() => {
                  // Reset game state for restart with new words
                  setCurrentIndex(0);
                  setScore(0);
                  setSelectedVowels({});
                  setGameStarted(false);
                  setGameComplete(false);
                  setAttempts(0);
                  setTimeLeft(60);
                  setShowFeedback(false);
                  setShowReward(false);
                  setSparkleCount(0);
                  setShowSparkleExplosion(false);
                  setIsRestarting((prev) => !prev); // Trigger new word generation
                }}
                className="flex-1 bg-educational-blue hover:bg-educational-blue/90 min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-educational-yellow/20 to-educational-orange/20 p-2 sm:p-4 touch-manipulation safe-area-padding-bottom">
      <div className="max-w-2xl mx-auto mobile-optimized">
        {/* Enhanced Header with Close Function - Mobile Optimized */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <Button
              onClick={onExit}
              variant="outline"
              size="sm"
              className="rounded-full hover:bg-red-50 hover:text-red-600 border-red-200 px-2 sm:px-3"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Close</span>
              <span className="sm:hidden">✕</span>
            </Button>

            <div className="text-center flex-1 mx-2">
              <h3 className="text-sm sm:text-lg font-bold text-educational-blue">
                Vowel Quiz Challenge
              </h3>
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
                  {score}/{gameQuestions.length * 10}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Information - Mobile Optimized */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span className="font-medium">
              Q{currentIndex + 1}/{gameQuestions.length}
            </span>
            <span className="font-medium">
              {Math.round(((currentIndex + 1) / gameQuestions.length) * 100)}%
              Complete
            </span>
          </div>

          {/* Progress Bar */}
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
            <div className="absolute top-1/3 right-1/4 animate-pulse animation-delay-200">
              <Star className="w-6 h-6 text-pink-300" />
            </div>
            <div className="absolute bottom-1/3 left-1/3 animate-bounce animation-delay-100">
              <Zap className="w-7 h-7 text-blue-300" />
            </div>
            <div className="absolute top-1/2 right-1/3 animate-spin">
              <Crown className="w-5 h-5 text-purple-300" />
            </div>
          </div>
        )}

        {/* Game Card - Mobile Optimized */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6 md:p-8">
            {/* Image and Audio - Mobile Optimized */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                key={currentQuestion.word}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative inline-block"
              >
                <div className="relative">
                  <div
                    className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 bg-gradient-to-br from-educational-blue/20 to-educational-purple/20 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95 touch-manipulation select-none"
                    onClick={playAudio}
                    style={{
                      WebkitTapHighlightColor: "transparent",
                      WebkitTouchCallout: "none",
                    }}
                  >
                    {currentQuestion.originalWord?.emoji ||
                    currentQuestion.image ? (
                      // Display emoji from word database or fallback
                      <span className="text-6xl sm:text-7xl md:text-9xl lg:text-[10rem] animate-gentle-bounce">
                        {currentQuestion.originalWord?.emoji ||
                          currentQuestion.image}
                      </span>
                    ) : currentQuestion.image?.startsWith("http") ||
                      currentQuestion.image?.startsWith("/") ? (
                      <img
                        src={currentQuestion.image}
                        alt={currentQuestion.word}
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    ) : (
                      <span className="text-6xl sm:text-7xl md:text-9xl lg:text-[10rem] animate-gentle-bounce">
                        🎯
                      </span>
                    )}
                  </div>

                  {/* Category Badge - Mobile Optimized */}
                  {currentQuestion.originalWord?.category && (
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-educational-blue text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-bold capitalize">
                      {currentQuestion.originalWord.category}
                    </div>
                  )}
                </div>
                <Button
                  onClick={playAudio}
                  size="sm"
                  className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-educational-green hover:bg-educational-green/90"
                >
                  <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </motion.div>
            </div>

            {/* Word Display - Mobile Optimized */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center gap-0.5 sm:gap-1 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl min-h-[60px] sm:min-h-[80px]">
                {renderWord()}
              </div>
            </div>

            {/* Vowel Buttons - Mobile Optimized */}
            <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mb-6 px-2">
              {vowelOptions.map((vowel) => {
                const nextPosition = getNextMissingPosition();
                const allCompleted = getMissingVowelPositions().length === 0;
                const isCorrectlyCompleted =
                  allCompleted &&
                  currentQuestion.missingIndex.every(
                    (idx) =>
                      selectedVowels[idx]?.toLowerCase() ===
                      currentQuestion.word[idx].toLowerCase(),
                  );
                const isDisabled =
                  (showFeedback && isCorrectlyCompleted) || allCompleted;

                return (
                  <motion.button
                    key={vowel}
                    className={`w-12 h-12 sm:w-13 sm:h-13 md:w-16 md:h-16 rounded-full font-bold text-base sm:text-lg md:text-xl text-white transition-all min-h-[48px] min-w-[48px] touch-manipulation select-none shadow-mobile
                      ${
                        isDisabled
                          ? "bg-gray-400 cursor-not-allowed opacity-60"
                          : "bg-educational-blue hover:bg-educational-blue/90 hover:scale-110 active:scale-95 shadow-mobile-lg active:shadow-md"
                      }
                    `}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      !isDisabled && handleVowelSelect(vowel, nextPosition)
                    }
                    disabled={isDisabled}
                    style={{
                      WebkitTapHighlightColor: "transparent",
                      WebkitTouchCallout: "none",
                      WebkitUserSelect: "none",
                    }}
                  >
                    {vowel}
                  </motion.button>
                );
              })}
            </div>

            {/* Enhanced Feedback with Try Again Options - Mobile Optimized */}
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
                      🎉 Perfect! You did it! 🎉
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      +
                      {attempts === 0
                        ? 10
                        : attempts <= 2
                          ? 8
                          : attempts <= 4
                            ? 5
                            : 2}{" "}
                      points!
                    </div>
                    {currentQuestion.originalWord?.definition && (
                      <div className="bg-educational-blue/10 p-3 rounded-lg mt-3 text-left">
                        <div className="text-xs sm:text-sm font-semibold text-educational-blue mb-1">
                          "{currentQuestion.word.toUpperCase()}" means:
                        </div>
                        <div className="text-xs sm:text-sm text-gray-700">
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
                  <div className="space-y-3 sm:space-y-4">
                    <div className="text-orange-500 text-base sm:text-lg font-bold">
                      {attempts === 1
                        ? "Oops! Try a different vowel! 🤔"
                        : attempts === 2
                          ? "Almost there! Think carefully! 🤗"
                          : attempts === 3
                            ? "One more try! You can do it! 💪"
                            : "Let's try again together! 😊"}
                    </div>

                    {attempts < 5 &&
                      !currentQuestion.missingIndex.every(
                        (idx) => selectedVowels[idx],
                      ) && (
                        <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                          <Button
                            onClick={handleTryAgain}
                            className="bg-educational-blue hover:bg-educational-blue/90 text-white px-4 sm:px-6 py-2 rounded-full text-sm w-full sm:w-auto min-h-[44px]"
                            size="sm"
                          >
                            🔄 Try Again!
                          </Button>

                          {attempts >= 3 && (
                            <Button
                              onClick={handleShowHint}
                              className="bg-educational-green hover:bg-educational-green/90 text-white px-4 sm:px-6 py-2 rounded-full text-sm w-full sm:w-auto min-h-[44px]"
                              size="sm"
                            >
                              💡 Show Me!
                            </Button>
                          )}
                        </div>
                      )}

                    {attempts >= 5 && (
                      <div className="space-y-2">
                        <div className="text-educational-purple text-sm sm:text-base">
                          Let's see the answer together! 📖
                        </div>
                        <Button
                          onClick={handleShowHint}
                          className="bg-educational-purple hover:bg-educational-purple/90 text-white px-4 sm:px-6 py-2 rounded-full text-sm w-full sm:w-auto min-h-[44px]"
                          size="sm"
                        >
                          Show Answer ✨
                        </Button>
                      </div>
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

        {/* Achievement popups now handled by LightweightAchievementProvider */}

        {/* Main Celebration Effect */}
        <CelebrationEffect
          trigger={showMainCelebration}
          type="stars"
          onComplete={() => setShowMainCelebration(false)}
        />
      </div>
    </div>
  );
}
