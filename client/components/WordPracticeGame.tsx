import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Target,
  Star,
  Zap,
  Trophy,
  Heart,
  Sparkles,
  Volume2,
  RotateCcw,
  CheckCircle,
  XCircle,
  Award,
  Gamepad2,
  Rocket,
} from "lucide-react";

interface PracticeWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  attempts: number;
  lastAccuracy: number;
}

interface WordPracticeGameProps {
  practiceWords: PracticeWord[];
  onComplete: (results: {
    correctWords: string[];
    totalAttempts: number;
    accuracy: number;
  }) => void;
  onBack: () => void;
  childName?: string;
}

export const WordPracticeGame: React.FC<WordPracticeGameProps> = ({
  practiceWords,
  onComplete,
  onBack,
  childName = "Champion",
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<
    "intro" | "playing" | "result" | "complete"
  >("intro");
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [incorrectWords, setIncorrectWords] = useState<string[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [points, setPoints] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentWord = practiceWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / practiceWords.length) * 100;
  const accuracy =
    totalAttempts > 0
      ? Math.round((correctWords.length / totalAttempts) * 100)
      : 0;

  useEffect(() => {
    if (bestStreak < streak) {
      setBestStreak(streak);
    }
  }, [streak, bestStreak]);

  const handleRemember = () => {
    setTotalAttempts((prev) => prev + 1);
    setCorrectWords((prev) => [...prev, currentWord.word]);
    setStreak((prev) => prev + 1);
    setPoints((prev) => prev + 10 * (streak + 1)); // Bonus points for streaks
    setGamePhase("result");

    // Show celebration animation
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1500);
  };

  const handleForgot = () => {
    setTotalAttempts((prev) => prev + 1);
    setIncorrectWords((prev) => [...prev, currentWord.word]);
    setStreak(0); // Reset streak
    setGamePhase("result");
  };

  const nextWord = () => {
    setShowDefinition(false);
    setShowExample(false);

    if (currentWordIndex < practiceWords.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
      setGamePhase("playing");
    } else {
      setGamePhase("complete");
      onComplete({
        correctWords,
        totalAttempts,
        accuracy,
      });
    }
  };

  const startGame = () => {
    setGamePhase("playing");
  };

  const playPronunciation = () => {
    // Import sanitization helper to prevent "[object Object]" errors
    const { sanitizeTTSInput, logSpeechError } = require("@/lib/speechUtils");

    // Sanitize input to prevent errors
    const sanitizedWord = sanitizeTTSInput(currentWord.word);
    if (!sanitizedWord) {
      logSpeechError(
        "WordPracticeGame.playPronunciation",
        currentWord.word,
        "Empty word after sanitization",
      );
      return;
    }

    // Use speech synthesis with sanitized input
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(sanitizedWord);
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const renderIntro = () => (
    <div className="text-center space-y-4 sm:space-y-6 p-4 sm:p-8">
      {/* Animated header */}
      <div className="relative">
        <div className="text-8xl sm:text-9xl mb-4 animate-bounce">🎮</div>
        <div className="absolute -top-4 -right-4 text-3xl sm:text-4xl animate-spin">
          ✨
        </div>
        <div className="absolute -bottom-4 -left-4 text-2xl sm:text-3xl animate-pulse">
          🚀
        </div>
        <div className="absolute top-2 left-2 text-2xl animate-bounce delay-500">
          🌟
        </div>
        <div className="absolute bottom-2 right-2 text-xl animate-pulse delay-700">
          ⚡
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-2 px-2">
          🎆 Word Hero Quest! 🎆
        </h1>
        <div className="flex items-center justify-center gap-2 text-3xl sm:text-4xl">
          <span className="animate-bounce">🦸‍♂️</span>
          <span className="animate-pulse">💪</span>
          <span className="animate-bounce delay-300">🦸‍♀️</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 p-4 sm:p-6 rounded-2xl border-2 border-purple-200 mx-2 sm:mx-0 shadow-lg">
        <p className="text-xl sm:text-2xl text-purple-700 font-bold mb-2 px-4">
          🌟 Hey {childName}! Ready to become a{" "}
          <span className="text-orange-600">Word Hero?</span> 🦸‍♂️
        </p>
        <p className="text-base sm:text-lg text-purple-600 px-4">
          Show these tricky words who's boss! You've got the power! 💪✨
        </p>
      </div>

      {/* Words preview */}
      <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 p-4 sm:p-6 rounded-2xl shadow-xl border-2 border-purple-300 mx-2 sm:mx-0">
        <h3 className="text-lg sm:text-xl font-bold text-purple-700 mb-3 sm:mb-4 flex items-center justify-center gap-2">
          <span className="animate-bounce">🎯</span>
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Word Challenges
          </span>
          <span className="animate-bounce delay-300">🎯</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
          {practiceWords.slice(0, 4).map((word, index) => (
            <div
              key={word.id}
              className={`bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-3 sm:p-4 rounded-xl border-2 border-purple-200 shadow-md hover:shadow-lg transition-all duration-300 ${index === 0 ? "ring-2 ring-orange-300 ring-offset-2" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl sm:text-3xl flex-shrink-0 animate-pulse">
                  {word.category === "Science"
                    ? "🔬"
                    : word.category === "Transportation"
                      ? "🚁"
                      : word.category === "Space"
                        ? "🌟"
                        : word.category === "History"
                          ? "🏺"
                          : word.category === "Education"
                            ? "📚"
                            : word.category === "Animals"
                              ? "🦁"
                              : word.category === "Nature"
                                ? "🌿"
                                : word.category === "Geography"
                                  ? "🗺️"
                                  : word.category === "Music"
                                    ? "🎵"
                                    : "📖"}
                </div>
                <div className="text-left min-w-0 flex-1">
                  <div className="font-bold text-gray-800 text-base sm:text-lg truncate">
                    {word.word}
                  </div>
                  <div className="text-sm text-purple-600 truncate font-medium">
                    {word.category}
                  </div>
                  {index === 0 && (
                    <div className="text-xs text-orange-600 font-bold animate-pulse mt-1">
                      👆 Coming up first!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {practiceWords.length > 4 && (
            <div className="col-span-full text-center bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-xl border border-orange-200">
              <div className="text-orange-600 font-bold text-sm sm:text-base mb-1">
                🎆 + {practiceWords.length - 4} more epic words waiting!
              </div>
              <div className="text-xs text-orange-500">
                This is going to be an awesome adventure! 🚀🌟
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6 rounded-2xl mx-2 sm:mx-0 border-2 border-purple-200 shadow-lg">
        <h3 className="text-lg sm:text-xl font-bold text-purple-700 mb-4 flex items-center justify-center gap-2">
          <span className="animate-bounce">🎮</span>
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            How to Be a Word Hero
          </span>
          <span className="animate-bounce delay-300">🎮</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left max-w-4xl mx-auto">
          <div className="flex items-center gap-3 bg-gradient-to-r from-white to-blue-50 p-4 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0 animate-pulse">
              1
            </div>
            <span className="font-semibold text-sm sm:text-base text-blue-700">
              Study each word like a detective! 🕵️‍♂️
            </span>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-white to-green-50 p-4 rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0 animate-pulse delay-300">
              2
            </div>
            <span className="font-semibold text-sm sm:text-base text-green-700">
              Use your super hints when stuck! 💫
            </span>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-white to-orange-50 p-4 rounded-xl border border-orange-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0 animate-pulse delay-500">
              3
            </div>
            <span className="font-semibold text-sm sm:text-base text-orange-700">
              Be honest - heroes always are! 🦸‍♂️
            </span>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-white to-purple-50 p-4 rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0 animate-pulse delay-700">
              4
            </div>
            <span className="font-semibold text-sm sm:text-base text-purple-700">
              Collect points and build epic streaks! 🔥
            </span>
          </div>
        </div>
      </div>

      {/* Game stats preview */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto px-2 sm:px-0">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-3 sm:p-4 rounded-xl border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-xl sm:text-3xl font-bold text-yellow-600 mb-1">
            {practiceWords.length}
          </div>
          <div className="text-xs sm:text-sm text-yellow-600 font-semibold">
            🎯 Word Challenges
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 rounded-xl border-2 border-green-300 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-xl sm:text-3xl font-bold text-green-600 mb-1">
            +{practiceWords.length * 15}
          </div>
          <div className="text-xs sm:text-sm text-green-600 font-semibold">
            🏆 Max Hero Points
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 sm:p-4 rounded-xl border-2 border-blue-300 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-xl sm:text-3xl font-bold text-blue-600 mb-1">
            ~{Math.ceil(practiceWords.length * 1.5)}m
          </div>
          <div className="text-xs sm:text-sm text-blue-600 font-semibold">
            ⏰ Adventure Time
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 sm:px-0">
        <Button
          onClick={startGame}
          className="w-full sm:w-auto bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white text-lg sm:text-xl py-6 sm:py-8 px-8 sm:px-12 rounded-2xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 min-h-[70px] relative overflow-hidden animate-pulse"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center justify-center gap-3 sm:gap-4">
            <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 animate-bounce" />
            <div className="text-center">
              <div className="font-bold text-base sm:text-lg flex items-center gap-2">
                🦸‍♂️ Start Hero Quest! 🎆
              </div>
              <div className="text-sm sm:text-base opacity-95 font-medium">
                Time to show your word power! 💪🌟
              </div>
            </div>
            <Rocket className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 animate-pulse" />
          </div>
        </Button>

        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 p-4 rounded-xl border border-purple-200">
          <p className="text-sm sm:text-base text-purple-700 font-bold text-center px-2">
            🌟 Remember: Every hero trains to become legendary! 🌟
          </p>
          <p className="text-xs sm:text-sm text-purple-600 text-center mt-1">
            You've got this, Word Hero! 💪✨🦸‍♂️
          </p>
        </div>
      </div>
    </div>
  );

  const renderPlaying = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with progress */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 sm:p-6 rounded-2xl mx-2 sm:mx-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Target className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold">
                Word {currentWordIndex + 1} of {practiceWords.length}
              </h2>
              <p className="text-blue-100 text-sm truncate">
                Category: {currentWord.category}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xl sm:text-2xl font-bold">{points}</div>
            <div className="text-sm text-blue-100">Points</div>
          </div>
        </div>
        <Progress value={progress} className="h-2 sm:h-3 bg-white/20" />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 px-2 sm:px-0">
        <div className="bg-green-50 p-2 sm:p-4 rounded-xl text-center">
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            {streak}
          </div>
          <div className="text-xs sm:text-sm text-green-600">
            Current Streak 🔥
          </div>
        </div>
        <div className="bg-blue-50 p-2 sm:p-4 rounded-xl text-center">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">
            {bestStreak}
          </div>
          <div className="text-xs sm:text-sm text-blue-600">Best Streak ⭐</div>
        </div>
        <div className="bg-purple-50 p-2 sm:p-4 rounded-xl text-center">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">
            {accuracy}%
          </div>
          <div className="text-xs sm:text-sm text-purple-600">Accuracy 🎯</div>
        </div>
      </div>

      {/* Word card */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-xl mx-2 sm:mx-0">
        <CardContent className="p-4 sm:p-8 text-center">
          <div className="space-y-4 sm:space-y-6">
            {/* Word display */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-inner">
              <div className="text-3xl sm:text-5xl font-bold text-gray-800 mb-3 sm:mb-4 break-words">
                {currentWord.word}
              </div>
              <Button
                onClick={playPronunciation}
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100 border-blue-200 min-h-[44px] px-4"
              >
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">🔊 Hear it!</span>
              </Button>
            </div>

            {/* Hint buttons */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Button
                onClick={() => setShowDefinition(!showDefinition)}
                variant="outline"
                className={`p-3 sm:p-4 h-auto min-h-[60px] ${showDefinition ? "bg-sunshine text-white border-0" : "bg-sunshine-light hover:bg-sunshine text-white border-0"}`}
              >
                <div className="text-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-white" />
                  <div className="font-semibold text-xs sm:text-sm">
                    Definition Hint
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => setShowExample(!showExample)}
                variant="outline"
                className={`p-3 sm:p-4 h-auto min-h-[60px] ${showExample ? "bg-sunshine text-white border-0" : "bg-sunshine-light hover:bg-sunshine text-white border-0"}`}
              >
                <div className="text-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-white" />
                  <div className="font-semibold text-xs sm:text-sm">
                    Example Hint
                  </div>
                </div>
              </Button>
            </div>

            {/* Hints display */}
            {showDefinition && (
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-green-700">
                    What it means:
                  </span>
                </div>
                <p className="text-gray-700">{currentWord.definition}</p>
              </div>
            )}

            {showExample && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-blue-700">Example:</span>
                </div>
                <p className="text-gray-700 italic">"{currentWord.example}"</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
              <Button
                onClick={handleForgot}
                variant="outline"
                className="bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 border-2 border-orange-300 text-orange-700 py-4 sm:py-6 text-base sm:text-lg min-h-[60px] order-2 sm:order-1 font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0" />
                <span>🤔 Still Learning!</span>
              </Button>

              <Button
                onClick={handleRemember}
                className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white py-4 sm:py-6 text-base sm:text-lg shadow-xl min-h-[60px] order-1 sm:order-2 font-bold hover:shadow-2xl transition-all transform hover:scale-105 animate-pulse"
              >
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 flex-shrink-0" />
                <span>🦸‍♂️ I Got This! 🎆</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResult = () => {
    const isCorrect = correctWords.includes(currentWord.word);

    return (
      <div className="text-center space-y-6 p-8">
        <div
          className={`text-8xl mb-4 ${isCorrect ? "animate-bounce" : "animate-pulse"}`}
        >
          {isCorrect ? "🎉" : "💪"}
        </div>

        <h2
          className={`text-4xl font-bold mb-4 ${isCorrect ? "bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent" : "bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"}`}
        >
          {isCorrect
            ? "🎉 Amazing! You're a Word Hero! 🦸‍♂️"
            : "💪 That's okay! Heroes never give up! 🚀"}
        </h2>

        {isCorrect && (
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-6 rounded-2xl border-2 border-green-300 shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-3 animate-bounce">🏆</div>
              <p className="text-xl font-bold text-green-700 mb-2">
                🌟 +{10 * streak} Hero Points Earned! 🌟
              </p>
              {streak > 1 && (
                <div className="bg-orange-100 p-3 rounded-xl border border-orange-300 mt-3">
                  <p className="text-lg font-bold text-orange-600">
                    🔥 Epic {streak} Word Streak! You're on fire! 🔥
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {!isCorrect && (
          <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-6 rounded-2xl border-2 border-orange-300 shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-3 animate-pulse">💪</div>
              <p className="text-xl font-bold text-orange-700 mb-3">
                🌟 Heroes never give up! You're getting stronger! 💪
              </p>
              <p className="text-lg text-orange-600 mb-2">
                This tricky word wants to challenge you again!
              </p>
              <div className="bg-blue-100 p-3 rounded-xl border border-blue-300">
                <p className="text-blue-700 font-semibold">
                  🚀 Every hero faces challenges - that's how they become
                  legendary! 🦸‍♂️
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={nextWord}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white text-xl py-6 px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {currentWordIndex < practiceWords.length - 1 ? "🚀" : "🏆"}
            </span>
            <span className="font-bold">
              {currentWordIndex < practiceWords.length - 1
                ? "Next Challenge!"
                : "Hero Results!"}
            </span>
            <span className="text-2xl">
              {currentWordIndex < practiceWords.length - 1 ? "🌟" : "🎆"}
            </span>
          </div>
        </Button>
      </div>
    );
  };

  const renderComplete = () => (
    <div className="text-center space-y-6 p-8">
      <div className="relative">
        <div className="text-9xl mb-4 animate-bounce">🦸‍♂️</div>
        <div className="absolute -top-4 -left-8 text-4xl animate-spin">🏆</div>
        <div className="absolute -top-4 -right-8 text-4xl animate-pulse">
          🎆
        </div>
        <div className="absolute -bottom-4 -left-4 text-3xl animate-bounce delay-500">
          ✨
        </div>
        <div className="absolute -bottom-4 -right-4 text-3xl animate-bounce delay-700">
          🌟
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 p-6 rounded-2xl border-2 border-purple-300 shadow-xl">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">
          🎉 Quest Complete! 🎉
        </h1>

        <p className="text-2xl font-bold text-purple-700 mb-2">
          🌟 Legendary work, {childName}! 🌟
        </p>

        <p className="text-lg text-purple-600">
          You're officially a{" "}
          <span className="font-bold text-orange-600">Word Hero!</span> 🦸‍♂️💪
        </p>
      </div>

      {/* Results summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border-2 border-green-300 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-5xl mb-2 animate-bounce">✅</div>
          <div className="text-4xl font-bold text-green-600 mb-2">
            {correctWords.length}
          </div>
          <div className="text-green-700 font-semibold text-lg">
            Words Mastered!
          </div>
          <div className="text-sm text-green-600 mt-1">
            You're a champion! 🏆
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-yellow-100 p-6 rounded-2xl border-2 border-orange-300 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-5xl mb-2 animate-pulse">🎯</div>
          <div className="text-4xl font-bold text-orange-600 mb-2">
            {incorrectWords.length}
          </div>
          <div className="text-orange-700 font-semibold text-lg">
            Future Conquests
          </div>
          <div className="text-sm text-orange-600 mt-1">
            Heroes return stronger! 💪
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-2xl border-2 border-purple-300 shadow-lg hover:shadow-xl transition-shadow">
          <div className="text-5xl mb-2 animate-spin">🌟</div>
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {points}
          </div>
          <div className="text-purple-700 font-semibold text-lg">
            Hero Points Earned
          </div>
          <div className="text-sm text-purple-600 mt-1">
            Epic achievement! 🚀
          </div>
        </div>
      </div>

      {/* Achievement badges */}
      <div className="space-y-4">
        {accuracy >= 90 && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xl py-4 px-6 rounded-2xl shadow-xl animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">🦸‍♂️</span>
              <span className="font-bold">SUPER HERO! 90%+ accuracy!</span>
              <span className="text-3xl">🏆</span>
            </div>
          </div>
        )}
        {bestStreak >= 5 && (
          <div className="bg-gradient-to-r from-red-400 to-pink-500 text-white text-xl py-4 px-6 rounded-2xl shadow-xl animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">🔥</span>
              <span className="font-bold">
                STREAK LEGEND! {bestStreak} in a row!
              </span>
              <span className="text-3xl">⚡</span>
            </div>
          </div>
        )}
        {correctWords.length === practiceWords.length && (
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xl py-4 px-6 rounded-2xl shadow-xl animate-pulse">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">🎆</span>
              <span className="font-bold">
                PERFECT HERO! All words conquered!
              </span>
              <span className="text-3xl">🤩</span>
            </div>
          </div>
        )}
        {streak >= 3 && (
          <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white text-lg py-3 px-5 rounded-xl shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">✨</span>
              <span className="font-semibold">Word Warrior! Great focus!</span>
              <span className="text-2xl">🧠</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {incorrectWords.length > 0 && (
          <Button
            onClick={() => window.location.reload()} // In real app, restart with missed words
            variant="outline"
            className="bg-gradient-to-r from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 border-2 border-orange-300 text-orange-700 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-center gap-2">
              <RotateCcw className="w-6 h-6" />
              <span>🔥 Train Again!</span>
              <span className="text-xl">💪</span>
            </div>
          </Button>
        )}

        <Button
          onClick={onBack}
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white py-6 text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6" />
            <span>🎆 Continue Quest!</span>
            <span className="text-xl">🚀</span>
          </div>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="bg-white hover:bg-gray-50 min-h-[44px] px-3 sm:px-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="text-sm sm:text-base">Back</span>
        </Button>

        <div className="flex items-center gap-2 sm:gap-3">
          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 animate-pulse" />
          <span className="text-base sm:text-lg font-semibold text-gray-700">
            Practice Mode
          </span>
        </div>
      </div>

      {/* Game content */}
      <div className="max-w-4xl mx-auto px-2 sm:px-0">
        {gamePhase === "intro" && renderIntro()}
        {gamePhase === "playing" && renderPlaying()}
        {gamePhase === "result" && renderResult()}
        {gamePhase === "complete" && renderComplete()}
      </div>

      {/* Celebration animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl animate-ping">
            🎉
          </div>
          <div className="absolute top-1/4 left-1/4 text-4xl animate-bounce delay-300">
            ✨
          </div>
          <div className="absolute top-1/3 right-1/4 text-4xl animate-bounce delay-500">
            ⭐
          </div>
          <div className="absolute bottom-1/3 left-1/3 text-4xl animate-bounce delay-700">
            🌟
          </div>
          <div className="absolute bottom-1/4 right-1/3 text-4xl animate-bounce delay-900">
            💫
          </div>
        </div>
      )}
    </div>
  );
};
