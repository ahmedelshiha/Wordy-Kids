import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Volume2, Star, Trophy, ArrowLeft, Play, Clock } from "lucide-react";

const vowelOptions = ["A", "E", "I", "O", "U"];

interface VowelQuestion {
  word: string;
  missingIndex: number[];
  image?: string;
  audio?: string;
  difficulty?: "easy" | "medium" | "hard";
  originalWord?: any; // Reference to the original word object
  category?: string;
  emoji?: string;
}

interface VowelRescueProps {
  questions: VowelQuestion[];
  onComplete: (score: number, total: number) => void;
  onExit: () => void;
  gameMode?: "easy" | "challenge" | "timed";
}

export function VowelRescue({ 
  questions, 
  onComplete, 
  onExit, 
  gameMode = "easy" 
}: VowelRescueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedVowels, setSelectedVowels] = useState<{ [key: number]: string }>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameComplete, setGameComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentQuestion = questions[currentIndex];
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
    // Use speech synthesis API with word pronunciation if available
    if ('speechSynthesis' in window) {
      const wordToSpeak = currentQuestion.originalWord?.pronunciation
        ? currentQuestion.originalWord.word
        : currentQuestion.word;

      const utterance = new SpeechSynthesisUtterance(wordToSpeak);
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

      setTimeout(() => {
        // Clear the wrong vowel and allow trying again
        const clearedVowels = { ...newSelectedVowels };
        delete clearedVowels[position];
        setSelectedVowels(clearedVowels);
        setShowFeedback(false);
      }, 1500);
      return;
    }

    // Check if all missing positions are filled with correct vowels
    const allFilled = currentQuestion.missingIndex.every(idx =>
      newSelectedVowels[idx] !== undefined
    );

    if (allFilled) {
      checkAnswer(newSelectedVowels);
    }
  };

  const checkAnswer = (vowels: { [key: number]: string }) => {
    const isCorrect = currentQuestion.missingIndex.every(idx => {
      const selectedVowel = vowels[idx];
      const correctVowel = currentQuestion.word[idx];
      return selectedVowel && selectedVowel.toLowerCase() === correctVowel.toLowerCase();
    });

    setShowFeedback(true);

    if (isCorrect) {
      const points = attempts === 0 ? 10 : attempts <= 2 ? 8 : attempts <= 4 ? 5 : 2;
      setScore(score + points);
      setShowReward(true);
      setTimeout(() => setShowReward(false), 1500);

      setTimeout(() => {
        nextQuestion();
      }, 2000);
    }
  };

  const handleTryAgain = () => {
    // Clear wrong selections but keep any correct ones
    const clearedVowels: { [key: number]: string } = {};
    currentQuestion.missingIndex.forEach(idx => {
      const selectedVowel = selectedVowels[idx];
      const correctVowel = currentQuestion.word[idx];

      // Keep correct vowels, clear wrong ones
      if (selectedVowel && selectedVowel.toLowerCase() === correctVowel.toLowerCase()) {
        clearedVowels[idx] = selectedVowel;
      }
    });

    setSelectedVowels(clearedVowels);
    setShowFeedback(false);
  };

  const handleShowHint = () => {
    // Show the correct vowels as a hint
    const hintVowels: { [key: number]: string } = {};
    currentQuestion.missingIndex.forEach(idx => {
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
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGameComplete();
    }
  };

  const handleGameComplete = () => {
    setGameComplete(true);
    setTimeout(() => {
      onComplete(score, questions.length * 10);
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
            <span className={`
              ${showFeedback
                ? selectedVowel?.toLowerCase() === letter.toLowerCase()
                  ? "text-green-500 animate-bounce"
                  : "text-red-500 animate-pulse"
                : "text-educational-blue"
              }
            `}>
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
    return currentQuestion.missingIndex.filter(idx => !selectedVowels[idx]);
  };

  const getNextMissingPosition = () => {
    return getMissingVowelPositions()[0];
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-educational-blue/20 to-educational-purple/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 sm:p-8 text-center relative">
            {/* Close button - Mobile Optimized */}
            <Button
              onClick={onExit}
              variant="outline"
              size="sm"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 rounded-full hover:bg-red-50 hover:text-red-600 border-red-200 min-h-[40px] min-w-[40px]"
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
              Help rescue the missing vowels! Look at the picture and complete the word by choosing the correct vowel letters.
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
                  : `${questions.length} words to complete`
                }
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
                onClick={() => window.location.reload()}
                className="flex-1 bg-educational-blue hover:bg-educational-blue/90 min-h-[44px]"
              >
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-educational-yellow/20 to-educational-orange/20 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
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
                  <span className="font-bold text-educational-blue text-xs sm:text-sm">{timeLeft}s</span>
                </div>
              )}
              <div className="flex items-center gap-1 bg-educational-orange/10 px-1.5 sm:px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-educational-orange" />
                <span className="font-bold text-educational-orange text-xs sm:text-sm">
                  {score}/{questions.length * 10}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Information - Mobile Optimized */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span className="font-medium">
              Q{currentIndex + 1}/{questions.length}
            </span>
            <span className="font-medium">
              {Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <Progress
            value={((currentIndex + 1) / questions.length) * 100}
            className="h-2"
          />
        </div>

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
                  <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 bg-gradient-to-br from-educational-blue/20 to-educational-purple/20 rounded-2xl flex items-center justify-center text-4xl sm:text-6xl md:text-8xl cursor-pointer hover:scale-105 transition-transform active:scale-95"
                       onClick={playAudio}>
                    {currentQuestion.originalWord?.emoji || currentQuestion.image ? (
                      // Display emoji from word database or fallback
                      <span className="text-4xl sm:text-6xl md:text-8xl animate-gentle-bounce">
                        {currentQuestion.originalWord?.emoji || currentQuestion.image}
                      </span>
                    ) : currentQuestion.image?.startsWith('http') || currentQuestion.image?.startsWith('/') ? (
                      <img
                        src={currentQuestion.image}
                        alt={currentQuestion.word}
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    ) : (
                      "🎯"
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
                const isCorrectlyCompleted = allCompleted && currentQuestion.missingIndex.every(idx =>
                  selectedVowels[idx]?.toLowerCase() === currentQuestion.word[idx].toLowerCase()
                );
                const isDisabled = (showFeedback && isCorrectlyCompleted) || allCompleted;

                return (
                  <motion.button
                    key={vowel}
                    className={`w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full font-bold text-lg sm:text-lg md:text-xl text-white transition-all min-h-[44px] min-w-[44px]
                      ${isDisabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-educational-blue hover:bg-educational-blue/90 hover:scale-110 active:scale-95 shadow-lg"
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

            {/* Enhanced Feedback with Try Again Options - Mobile Optimized */}
            {showFeedback && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center mt-4 sm:mt-6 px-2"
              >
                {currentQuestion.missingIndex.every(idx =>
                  selectedVowels[idx]?.toLowerCase() === currentQuestion.word[idx].toLowerCase()
                ) ? (
                  <div className="space-y-3">
                    <div className="text-green-500 text-lg sm:text-xl font-bold">
                      🎉 Excellent! 🎉
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      +{attempts === 0 ? 10 : attempts <= 2 ? 8 : attempts <= 4 ? 5 : 2} points!
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
                      {attempts === 1 ? "Oops! Try a different vowel! 🤔" :
                       attempts === 2 ? "Almost there! Think carefully! 🤗" :
                       attempts === 3 ? "One more try! You can do it! 💪" :
                       "Let's try again together! 😊"}
                    </div>

                    {attempts < 5 && !currentQuestion.missingIndex.every(idx => selectedVowels[idx]) && (
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
      </div>
    </div>
  );
}
