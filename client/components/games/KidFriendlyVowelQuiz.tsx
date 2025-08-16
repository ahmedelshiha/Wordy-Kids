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
  ArrowLeft,
  Heart,
  Trophy,
  RotateCcw,
  Home,
} from "lucide-react";
import { audioService } from "@/lib/audioService";
import { playSoundIfEnabled } from "@/lib/soundEffects";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { VowelQuizGenerator, VowelQuestion } from "@/lib/vowelQuizGeneration";

const vowelOptions = ["A", "E", "I", "O", "U"];

interface GameStats {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  streak: number;
}

interface KidFriendlyVowelQuizProps {
  category?: string;
  rounds?: number;
  onComplete: (stats: GameStats) => void;
  onExit: () => void;
}

export function KidFriendlyVowelQuiz({
  category = "all",
  rounds = 5,
  onComplete,
  onExit,
}: KidFriendlyVowelQuizProps) {
  // Simple game state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVowel, setSelectedVowel] = useState<string>("");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showSetup, setShowSetup] = useState(true);

  // Game progression
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [streak, setStreak] = useState(0);

  // Generate simple questions with only 1 missing vowel
  const questions = useMemo(() => {
    return VowelQuizGenerator.getSystematicVowelQuestions({
      category,
      count: rounds,
      difficulty: "easy",
      maxMissingVowels: 1,
    });
  }, [category, rounds]);

  const currentQuestion = questions[currentIndex];

  const handleVowelSelect = useCallback((vowel: string) => {
    if (!currentQuestion || showFeedback) return;

    setSelectedVowel(vowel);
    playSoundIfEnabled.click();

    // Check answer after short delay
    setTimeout(() => {
      checkAnswer(vowel);
    }, 500);
  }, [currentQuestion, showFeedback]);

  const checkAnswer = (vowel: string) => {
    if (!currentQuestion) return;

    const missingIndex = currentQuestion.missingVowelIndices?.[0] || currentQuestion.missingIndex?.[0] || 0;
    const correctVowel = currentQuestion.correctVowels?.[missingIndex] || 
                        (currentQuestion.word || "")[missingIndex]?.toUpperCase();
    
    const correct = vowel === correctVowel;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => prev + 100);
      setStreak(prev => prev + 1);
      playSoundIfEnabled.success();
      setShowCelebration(true);
    } else {
      setStreak(0);
      setHearts(prev => Math.max(0, prev - 1));
      playSoundIfEnabled.error();
    }

    // Move to next question or end game
    setTimeout(() => {
      setShowFeedback(false);
      setShowCelebration(false);
      setSelectedVowel("");
      
      if (correct && currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (correct && currentIndex === questions.length - 1) {
        handleGameComplete();
      } else if (hearts <= 1) {
        handleGameComplete();
      }
    }, 2000);
  };

  const handleGameComplete = () => {
    const correctAnswers = score / 100;
    const finalStats: GameStats = {
      totalQuestions: currentIndex + 1,
      correctAnswers,
      score,
      streak,
    };

    setGameComplete(true);
    setTimeout(() => {
      onComplete(finalStats);
    }, 3000);
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setSelectedVowel("");
    setGameStarted(false);
    setGameComplete(false);
    setShowSetup(true);
    setScore(0);
    setHearts(3);
    setShowFeedback(false);
    setStreak(0);
  };

  // Setup Screen - Simplified for kids
  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4 mobile-container safe-area-top safe-area-bottom">
        <div className="max-w-md mx-auto text-center">
          <Button
            onClick={onExit}
            variant="outline"
            className="absolute top-4 left-4 sm:mb-4"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Home
          </Button>

          <div className="mt-8">
            <div className="text-8xl mb-6">🎯</div>
            <h1 className="text-4xl font-bold text-purple-600 mb-4">
              Vowel Fun!
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Help complete the words by finding the missing vowels!
            </p>

            <div className="bg-white rounded-xl p-6 mb-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-4">🌟 How to Play:</h2>
              <div className="space-y-3 text-left">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👀</span>
                  <span className="text-lg">Look at the word with missing letters</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🎵</span>
                  <span className="text-lg">Listen to how it sounds</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✨</span>
                  <span className="text-lg">Pick the right vowel (A, E, I, O, U)</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowSetup(false);
                setGameStarted(true);
              }}
              className="w-full py-6 text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-xl transform hover:scale-105 transition-all kid-friendly-button kid-friendly-focus mobile-button-padding"
              size="lg"
            >
              🚀 Let's Play!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main Game Screen - Mobile Optimized
  if (!gameStarted || !currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4 relative mobile-container safe-area-top safe-area-bottom">
      {/* Celebration Effects */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationEffect
            type="success"
            onComplete={() => setShowCelebration(false)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto safe-area-left safe-area-right">
        {/* Header - Simplified */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onExit} variant="outline" size="lg" className="rounded-xl">
            <Home className="w-5 h-5 mr-2" />
            Home
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-purple-600">
              Question {currentIndex + 1}
            </h1>
          </div>

          <Button onClick={resetGame} variant="outline" size="lg" className="rounded-xl">
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar - Kid Friendly */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-bold text-purple-600">Progress:</span>
            <span className="text-lg font-bold text-purple-600">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <Progress
            value={(currentIndex / questions.length) * 100}
            className="h-4 bg-white rounded-full"
          />
        </div>

        {/* Score and Hearts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 text-center bg-white/90 rounded-xl shadow-lg">
            <div className="text-3xl font-bold text-green-600">{score}</div>
            <div className="text-sm font-semibold text-gray-600">⭐ Points</div>
          </Card>

          <Card className="p-4 text-center bg-white/90 rounded-xl shadow-lg">
            <div className="flex justify-center space-x-1 mb-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-6 h-6 ${
                    i < hearts ? "text-red-500 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm font-semibold text-gray-600">❤️ Lives</div>
          </Card>
        </div>

        {/* Question Card - Large and Touch Friendly */}
        <Card className="bg-white/95 rounded-2xl shadow-xl border-4 border-purple-200 mb-6 mobile-card">
          <CardContent className="p-8 mobile-card-content">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6 text-purple-700">
                Complete this word:
              </h2>

              {/* Word Display - Large Letters */}
              <div className="flex justify-center items-center flex-wrap gap-3 mb-8">
                {(currentQuestion.displayWord || currentQuestion.word || "")
                  .split("")
                  .map((char, index) => {
                    const isMissing = (
                      currentQuestion.missingVowelIndices ||
                      currentQuestion.missingIndex ||
                      []
                    ).includes(index);

                    return (
                      <div
                        key={index}
                        className={`w-16 h-20 border-3 rounded-xl flex items-center justify-center text-3xl font-bold transition-all duration-300 ${
                          isMissing
                            ? selectedVowel
                              ? "border-green-400 bg-green-50 text-green-700"
                              : "border-gray-400 bg-gray-50 text-gray-400 border-dashed"
                            : "border-purple-200 bg-purple-50 text-purple-800"
                        }`}
                      >
                        {isMissing ? selectedVowel || "?" : char}
                      </div>
                    );
                  })}
              </div>

              {/* Definition - Simple Language */}
              <p className="text-xl text-gray-700 mb-6 font-medium">
                {currentQuestion.definition ||
                  currentQuestion.originalWord?.definition ||
                  `It's a ${currentQuestion.category || "word"}!`}
              </p>

              {/* Audio Button - Large and Prominent */}
              <Button
                onClick={() => audioService.speakWord(currentQuestion.word)}
                variant="outline"
                className="mb-8 p-6 text-lg rounded-xl border-2 border-blue-300 bg-blue-50 hover:bg-blue-100"
                size="lg"
              >
                <Volume2 className="w-6 h-6 mr-3" />
                🎵 Listen
              </Button>
            </div>

            {/* Vowel Options - Large Touch Targets */}
            <div className="grid grid-cols-5 gap-3 mobile-button-grid">
              {vowelOptions.map((vowel) => (
                <Button
                  key={vowel}
                  onClick={() => handleVowelSelect(vowel)}
                  disabled={showFeedback || selectedVowel === vowel}
                  className={`h-20 text-3xl font-bold rounded-xl transition-all duration-300 vowel-button-touch kid-friendly-button kid-friendly-focus ${
                    selectedVowel === vowel
                      ? "bg-purple-600 text-white scale-110 shadow-lg kid-friendly-bounce"
                      : "bg-gradient-to-br from-purple-400 to-pink-400 text-white hover:scale-105 shadow-md"
                  }`}
                >
                  {vowel}
                </Button>
              ))}
            </div>

            {/* Feedback - Kid Friendly */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`mt-6 p-6 rounded-xl text-center ${
                    isCorrect
                      ? "bg-green-100 border-2 border-green-300"
                      : "bg-orange-100 border-2 border-orange-300"
                  }`}
                >
                  <div className="text-4xl mb-2">
                    {isCorrect ? "🎉" : "😊"}
                  </div>
                  <p className={`text-xl font-bold ${
                    isCorrect ? "text-green-700" : "text-orange-700"
                  }`}>
                    {isCorrect ? "Great job!" : "Try again next time!"}
                  </p>
                  {isCorrect && (
                    <p className="text-lg text-green-600 mt-2">
                      +100 points! ⭐
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Game Complete Screen */}
        <AnimatePresence>
          {gameComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
              >
                <div className="text-8xl mb-4">🏆</div>
                <h3 className="text-3xl font-bold mb-6 text-purple-600">
                  Amazing Work!
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{score}</div>
                    <div className="text-purple-700">⭐ Total Points</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((score / 100 / questions.length) * 100)}%
                    </div>
                    <div className="text-green-700">🎯 Success Rate</div>
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button 
                    onClick={resetGame} 
                    className="w-full py-4 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Play Again
                  </Button>
                  <Button 
                    onClick={onExit} 
                    variant="outline" 
                    className="w-full py-4 text-lg rounded-xl"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Back Home
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
