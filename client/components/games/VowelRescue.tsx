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
    // For demo purposes, we'll use speech synthesis API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentQuestion.word);
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  const handleVowelSelect = (vowel: string, position: number) => {
    if (showFeedback) return;

    const newSelectedVowels = { ...selectedVowels, [position]: vowel };
    setSelectedVowels(newSelectedVowels);

    // Check if all missing positions are filled
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

    setAttempts(attempts + 1);
    setShowFeedback(true);

    if (isCorrect) {
      const points = attempts === 0 ? 10 : attempts === 1 ? 5 : 2;
      setScore(score + points);
      setShowReward(true);
      setTimeout(() => setShowReward(false), 1500);
    }

    setTimeout(() => {
      if (isCorrect || attempts >= 2) {
        nextQuestion();
      } else {
        setShowFeedback(false);
      }
    }, 2000);
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
          className={`inline-block text-2xl md:text-4xl font-bold mx-1 ${
            isMissing 
              ? "w-8 md:w-12 h-10 md:h-14 border-b-4 border-educational-blue text-center" 
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
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center relative">
            {/* Close button */}
            <Button
              onClick={onExit}
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 rounded-full hover:bg-red-50 hover:text-red-600 border-red-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl mb-4 animate-bounce"
            >
              🎯
            </motion.div>
            <h1 className="text-3xl font-bold text-educational-blue mb-4">
              Vowel Rescue!
            </h1>
            <p className="text-gray-600 mb-6">
              Help rescue the missing vowels! Look at the picture and complete the word by choosing the correct vowel letters.
            </p>
            <div className="mb-6">
              <div className="flex justify-center gap-2 mb-4">
                {vowelOptions.map((vowel, idx) => (
                  <motion.div
                    key={vowel}
                    className="w-10 h-10 bg-educational-blue rounded-full flex items-center justify-center text-white font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {vowel}
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {isTimedMode
                  ? `You have 60 seconds to complete as many words as possible!`
                  : `${questions.length} words to complete`
                }
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => setGameStarted(true)}
                className="w-full bg-educational-blue hover:bg-educational-blue/90 text-white py-6 text-lg rounded-xl"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Adventure!
              </Button>
              <Button
                onClick={onExit}
                variant="outline"
                className="w-full py-3 rounded-xl"
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
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>
            <h1 className="text-3xl font-bold text-educational-green mb-4">
              Adventure Complete!
            </h1>
            <div className="text-4xl font-bold text-educational-blue mb-4">
              {score} points!
            </div>
            <p className="text-gray-600 mb-6">
              You rescued {Math.floor(score / 5)} vowels! Great job! 🌟
            </p>
            <div className="flex gap-2">
              <Button
                onClick={onExit}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-educational-blue hover:bg-educational-blue/90"
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
    <div className="min-h-screen bg-gradient-to-br from-educational-yellow/20 to-educational-orange/20 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Enhanced Header with Close Function */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Button
              onClick={onExit}
              variant="outline"
              size="sm"
              className="rounded-full hover:bg-red-50 hover:text-red-600 border-red-200"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Close
            </Button>

            <div className="text-center">
              <h3 className="text-lg font-bold text-educational-blue">
                Vowel Quiz Challenge
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {isTimedMode && (
                <div className="flex items-center gap-1 bg-educational-blue/10 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3 text-educational-blue" />
                  <span className="font-bold text-educational-blue text-sm">{timeLeft}s</span>
                </div>
              )}
              <div className="flex items-center gap-1 bg-educational-orange/10 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-educational-orange" />
                <span className="font-bold text-educational-orange text-sm">
                  {score}/{questions.length * 10}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Information */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="font-medium">
              Question {currentIndex + 1} of {questions.length}
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

        {/* Game Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            {/* Image and Audio */}
            <div className="text-center mb-8">
              <motion.div
                key={currentQuestion.word}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative inline-block"
              >
                <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-educational-blue/20 to-educational-purple/20 rounded-2xl flex items-center justify-center text-6xl md:text-8xl cursor-pointer hover:scale-105 transition-transform"
                     onClick={playAudio}>
                  {currentQuestion.image ? (
                    // Check if image is an emoji or URL
                    currentQuestion.image.startsWith('http') || currentQuestion.image.startsWith('/') ? (
                      <img
                        src={currentQuestion.image}
                        alt={currentQuestion.word}
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    ) : (
                      // Display emoji
                      <span className="text-6xl md:text-8xl animate-gentle-bounce">
                        {currentQuestion.image}
                      </span>
                    )
                  ) : (
                    "🖼️"
                  )}
                </div>
                <Button
                  onClick={playAudio}
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-12 h-12 bg-educational-green hover:bg-educational-green/90"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>

            {/* Word Display */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-1 p-4 bg-gray-50 rounded-2xl">
                {renderWord()}
              </div>
            </div>

            {/* Vowel Buttons */}
            <div className="flex justify-center gap-2 md:gap-4 mb-6">
              {vowelOptions.map((vowel) => {
                const nextPosition = getNextMissingPosition();
                const isDisabled = showFeedback || getMissingVowelPositions().length === 0;
                
                return (
                  <motion.button
                    key={vowel}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full font-bold text-lg md:text-xl text-white transition-all
                      ${isDisabled 
                        ? "bg-gray-400 cursor-not-allowed" 
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

            {/* Feedback */}
            {showFeedback && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                {currentQuestion.missingIndex.every(idx => 
                  selectedVowels[idx]?.toLowerCase() === currentQuestion.word[idx].toLowerCase()
                ) ? (
                  <div className="text-green-500 text-xl font-bold">
                    🎉 Excellent! 🎉
                  </div>
                ) : (
                  <div className="text-orange-500 text-lg">
                    {attempts < 2 ? "Try again! 🤔" : "Good try! Let's move on! 👍"}
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
