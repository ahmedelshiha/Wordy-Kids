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
import { Badge } from "@/components/ui/badge";
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
  Heart,
  Shield,
  Flame,
  Diamond,
  Gift,
  Lightbulb,
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

type GameMode = "rescue" | "challenge" | "rush" | "adventure" | "custom";
type DifficultyLevel = "easy" | "medium" | "hard" | "mixed";

interface GameStats {
  totalQuestions: number;
  correctAnswers: number;
  totalAttempts: number;
  accuracy: number;
  averageTime: number;
  timeSpent: number;
  hintsUsed: number;
  perfectAnswers: number;
  mode: GameMode;
  difficulty: DifficultyLevel;
  score: number;
  streak: number;
  maxStreak: number;
}

interface UltimateVowelQuizProps {
  category?: string;
  initialGameMode?: GameMode;
  initialDifficulty?: DifficultyLevel;
  customQuestions?: VowelQuestion[];
  rounds?: number;
  timeLimit?: number;
  onComplete: (stats: GameStats) => void;
  onExit: () => void;
  playerLevel?: number;
}

export function UltimateVowelQuiz({
  category = "all",
  initialGameMode = "rescue",
  initialDifficulty = "easy",
  customQuestions,
  rounds = 10,
  timeLimit = 60,
  onComplete,
  onExit,
  playerLevel = 1,
}: UltimateVowelQuizProps) {
  // Core game state
  const [gameMode, setGameMode] = useState<GameMode>(initialGameMode);
  const [difficulty, setDifficulty] =
    useState<DifficultyLevel>(initialDifficulty);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVowels, setSelectedVowels] = useState<{
    [key: number]: string;
  }>({});

  // Game progression state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showSetup, setShowSetup] = useState(!customQuestions);
  const [isRestarting, setIsRestarting] = useState(false);

  // Enhanced game state
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [powerUps, setPowerUps] = useState({
    hints: 3,
    skips: 1,
    timeBoost: 1,
  });
  const [isUsingHint, setIsUsingHint] = useState(false);

  // Feedback and UI state
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showMainCelebration, setShowMainCelebration] = useState(false);
  const [showSparkleExplosion, setShowSparkleExplosion] = useState(false);
  const [sparkleCount, setSparkleCount] = useState(0);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  // Timer and attempts
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [questionStartTime, setQuestionStartTime] = useState<number | null>(
    null,
  );
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [attempts, setAttempts] = useState<{ [key: number]: number }>({});
  const [questionTimes, setQuestionTimes] = useState<number[]>([]);

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number | null>(null);

  // Generate questions based on game mode and difficulty
  const questions = useMemo(() => {
    if (customQuestions) return customQuestions;

    const questionsCount = gameMode === "rush" ? 30 : rounds;

    if (gameMode === "rescue") {
      return VowelQuizGenerator.getSystematicVowelQuestions({
        category,
        count: questionsCount,
        difficulty: "easy",
        maxMissingVowels: 1,
      });
    } else if (gameMode === "challenge") {
      return VowelQuizGenerator.getSystematicVowelQuestions({
        category,
        count: questionsCount,
        difficulty: difficulty === "easy" ? "medium" : difficulty,
        maxMissingVowels: difficulty === "easy" ? 2 : 3,
      });
    } else if (gameMode === "rush") {
      return VowelQuizGenerator.getSystematicVowelQuestions({
        category,
        count: questionsCount,
        difficulty: "mixed",
        maxMissingVowels: 2,
      });
    } else if (gameMode === "adventure") {
      return VowelQuizGenerator.getSystematicVowelQuestions({
        category,
        count: questionsCount,
        difficulty,
        maxMissingVowels:
          difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3,
      });
    }

    return VowelQuizGenerator.getSystematicVowelQuestions({
      category,
      count: questionsCount,
      difficulty,
      maxMissingVowels: 2,
    });
  }, [gameMode, difficulty, category, rounds, customQuestions]);

  const currentQuestion = questions[currentIndex];

  // Game mode configurations
  const gameModeConfig = {
    rescue: {
      title: "Vowel Rescue",
      subtitle: "Save the vowels! Complete words to rescue them.",
      icon: "🆘",
      color: "educational-green",
      gradientColors: "from-green-400 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-300",
      lives: 3,
      timeLimit: null,
      scoringMultiplier: 1,
      description:
        "Perfect for beginners! Single missing vowels with helpful hints.",
    },
    challenge: {
      title: "Vowel Challenge",
      subtitle: "Take on the challenge! Multiple missing vowels await.",
      icon: "🎯",
      color: "educational-purple",
      gradientColors: "from-purple-400 to-violet-500",
      bgGradient: "from-purple-50 to-violet-50",
      borderColor: "border-purple-300",
      lives: 2,
      timeLimit: null,
      scoringMultiplier: 2,
      description:
        "Medium difficulty with multiple missing vowels and strategic thinking.",
    },
    rush: {
      title: "Vowel Rush",
      subtitle: "Speed round! Complete as many as you can in 60 seconds.",
      icon: "⚡",
      color: "educational-orange",
      gradientColors: "from-orange-400 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      borderColor: "border-orange-300",
      lives: 1,
      timeLimit: 60,
      scoringMultiplier: 3,
      description:
        "Fast-paced action! Race against time to maximize your score.",
    },
    adventure: {
      title: "Vowel Adventure",
      subtitle: "Epic journey through all vowel challenges!",
      icon: "🗺️",
      color: "educational-blue",
      gradientColors: "from-blue-400 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-300",
      lives: 5,
      timeLimit: null,
      scoringMultiplier: 4,
      description:
        "Complete adventure mode with progressive difficulty and bonus rewards.",
    },
    custom: {
      title: "Custom Quest",
      subtitle: "Your personalized vowel challenge!",
      icon: "⚙️",
      color: "educational-pink",
      gradientColors: "from-pink-400 to-rose-500",
      bgGradient: "from-pink-50 to-rose-50",
      borderColor: "border-pink-300",
      lives: 3,
      timeLimit: null,
      scoringMultiplier: 2,
      description: "Customizable experience tailored to your learning needs.",
    },
  };

  const currentConfig = gameModeConfig[gameMode];

  // Timer effect for rush mode
  useEffect(() => {
    if (gameStarted && gameMode === "rush" && timeLeft > 0 && !gameComplete) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [gameStarted, gameMode, timeLeft, gameComplete]);

  // Track question timing
  useEffect(() => {
    if (gameStarted && !gameComplete) {
      questionStartTimeRef.current = Date.now();
      setQuestionStartTime(Date.now());
    }
  }, [currentIndex, gameStarted, gameComplete]);

  // Initialize lives based on game mode
  useEffect(() => {
    if (gameStarted) {
      setLives(currentConfig.lives);
    }
  }, [gameMode, gameStarted]);

  const handleVowelSelect = useCallback(
    (missingIndex: number, vowel: string) => {
      if (!currentQuestion || gameComplete) return;

      playSoundIfEnabled("click");

      const newSelectedVowels = {
        ...selectedVowels,
        [missingIndex]: vowel,
      };
      setSelectedVowels(newSelectedVowels);

      // Check if all vowels are selected
      const allSelected = currentQuestion.missingVowelIndices.every(
        (index) => newSelectedVowels[index],
      );

      if (allSelected) {
        // Small delay to show selection before checking
        setTimeout(() => {
          checkAnswer(newSelectedVowels);
        }, 300);
      }
    },
    [currentQuestion, selectedVowels, gameComplete],
  );

  const calculateScore = (
    isCorrect: boolean,
    timeSpent: number,
    isFirstAttempt: boolean,
  ) => {
    if (!isCorrect) return 0;

    let baseScore = 100 * currentConfig.scoringMultiplier;

    // Bonus for speed (max 50% bonus)
    const speedBonus = Math.max(0, Math.floor((30 - timeSpent) * 2));

    // Bonus for first attempt
    const attemptBonus = isFirstAttempt ? 50 : 0;

    // Streak bonus
    const streakBonus = Math.min(streak * 10, 100);

    return baseScore + speedBonus + attemptBonus + streakBonus;
  };

  const checkAnswer = useCallback(
    (vowelSelections = selectedVowels) => {
      if (!currentQuestion) return;

      const questionTime = questionStartTimeRef.current
        ? (Date.now() - questionStartTimeRef.current) / 1000
        : 0;

      const currentAttempts = attempts[currentIndex] || 0;
      const newAttempts = currentAttempts + 1;
      setAttempts({ ...attempts, [currentIndex]: newAttempts });

      // Check if answer is correct
      const isCorrect = currentQuestion.missingVowelIndices.every(
        (index) =>
          vowelSelections[index] === currentQuestion.correctVowels[index],
      );

      if (isCorrect) {
        const pointsEarned = calculateScore(
          isCorrect,
          questionTime,
          newAttempts === 1,
        );
        setScore((prev) => prev + pointsEarned);
        setStreak((prev) => {
          const newStreak = prev + 1;
          setMaxStreak((max) => Math.max(max, newStreak));
          return newStreak;
        });

        playSoundIfEnabled("success");
        setShowReward(true);
        setSparkleCount((prev) => prev + (newAttempts === 1 ? 3 : 1));

        // Achievement tracking
        const unlockedAchievements = AchievementTracker.trackActivity({
          type: "vowelQuiz",
          mode: gameMode,
          accuracy: newAttempts === 1 ? 100 : Math.round(100 / newAttempts),
          timeSpent: questionTime,
          streak: streak + 1,
        });

        if (unlockedAchievements.length > 0) {
          setNewAchievements((prev) => [...prev, ...unlockedAchievements]);
        }

        setQuestionTimes((prev) => [...prev, questionTime]);

        setTimeout(() => {
          setShowReward(false);
          if (currentIndex === questions.length - 1) {
            handleGameComplete();
          } else {
            nextQuestion();
          }
        }, 1500);
      } else {
        setStreak(0);
        playSoundIfEnabled("error");

        if (
          gameMode === "rescue" ||
          gameMode === "challenge" ||
          gameMode === "adventure"
        ) {
          setLives((prev) => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setTimeout(() => handleGameComplete(), 1000);
            }
            return newLives;
          });
        }

        // Show feedback for wrong answer
        setShowFeedback(true);
        setTimeout(() => {
          setShowFeedback(false);
          if (lives > 1) {
            // Reset selections for retry
            const resetSelections = { ...selectedVowels };
            currentQuestion.missingVowelIndices.forEach((index) => {
              delete resetSelections[index];
            });
            setSelectedVowels(resetSelections);
          }
        }, 2000);
      }
    },
    [
      currentQuestion,
      selectedVowels,
      currentIndex,
      attempts,
      lives,
      score,
      streak,
      gameMode,
    ],
  );

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedVowels({});
      setShowFeedback(false);
      setIsUsingHint(false);
    } else {
      handleGameComplete();
    }
  };

  const useHint = () => {
    if (powerUps.hints > 0 && !isUsingHint) {
      setPowerUps((prev) => ({ ...prev, hints: prev.hints - 1 }));
      setIsUsingHint(true);
      playSoundIfEnabled("powerup");

      // Show one correct vowel
      const firstMissingIndex = currentQuestion.missingVowelIndices[0];
      const correctVowel = currentQuestion.correctVowels[firstMissingIndex];
      setSelectedVowels((prev) => ({
        ...prev,
        [firstMissingIndex]: correctVowel,
      }));
    }
  };

  const skipQuestion = () => {
    if (powerUps.skips > 0) {
      setPowerUps((prev) => ({ ...prev, skips: prev.skips - 1 }));
      playSoundIfEnabled("powerup");
      nextQuestion();
    }
  };

  const addTimeBoost = () => {
    if (powerUps.timeBoost > 0 && gameMode === "rush") {
      setPowerUps((prev) => ({ ...prev, timeBoost: prev.timeBoost - 1 }));
      setTimeLeft((prev) => prev + 15);
      playSoundIfEnabled("powerup");
    }
  };

  const handleGameComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const correctAnswers = questions
      .slice(0, currentIndex + 1)
      .filter(
        (_, index) =>
          attempts[index] === 1 ||
          (attempts[index] > 1 &&
            selectedVowels[questions[index].missingVowelIndices[0]]),
      ).length;

    const totalAttempts = Object.values(attempts).reduce(
      (sum, att) => sum + att,
      0,
    );
    const averageTime =
      questionTimes.length > 0
        ? questionTimes.reduce((sum, time) => sum + time, 0) /
          questionTimes.length
        : 0;

    const finalStats: GameStats = {
      totalQuestions: gameMode === "rush" ? currentIndex + 1 : questions.length,
      correctAnswers,
      totalAttempts,
      accuracy: correctAnswers / (currentIndex + 1),
      averageTime,
      timeSpent: totalTimeSpent,
      hintsUsed: 3 - powerUps.hints,
      perfectAnswers: Object.values(attempts).filter((att) => att === 1).length,
      mode: gameMode,
      difficulty,
      score,
      streak: maxStreak,
      maxStreak,
    };

    setGameComplete(true);
    setShowMainCelebration(true);

    // Track final achievements
    const finalAchievements = AchievementTracker.trackActivity({
      type: "vowelQuizComplete",
      mode: gameMode,
      accuracy: Math.round(finalStats.accuracy * 100),
      score: finalStats.score,
      perfectRatio: finalStats.perfectAnswers / finalStats.totalQuestions,
    });

    if (finalAchievements.length > 0) {
      setNewAchievements((prev) => [...prev, ...finalAchievements]);
    }

    setTimeout(() => {
      onComplete(finalStats);
    }, 3000);
  };

  const resetGame = () => {
    setIsRestarting(true);

    setTimeout(() => {
      setCurrentIndex(0);
      setSelectedVowels({});
      setGameStarted(false);
      setGameComplete(false);
      setShowSetup(true);
      setTimeLeft(timeLimit);
      setAttempts({});
      setQuestionTimes([]);
      setTotalTimeSpent(0);
      setScore(0);
      setStreak(0);
      setMaxStreak(0);
      setLives(currentConfig.lives);
      setPowerUps({ hints: 3, skips: 1, timeBoost: 1 });
      setShowFeedback(false);
      setShowReward(false);
      setIsUsingHint(false);
      setNewAchievements([]);
      setIsRestarting(false);
    }, 500);
  };

  // Game Setup Screen
  if (showSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              onClick={onExit}
              variant="outline"
              className="absolute top-4 left-4 sm:relative sm:top-0 sm:left-0 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink bg-clip-text text-transparent mb-4">
              Ultimate Vowel Quiz
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose your adventure! Four exciting modes to test your vowel
              mastery.
            </p>
          </div>

          {/* Game Mode Selection */}
          <div className="space-y-6 mb-8">
            <h3 className="text-2xl font-bold text-center mb-6">
              Choose Your Adventure
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(gameModeConfig).map(([modeId, config]) => (
                <Card
                  key={modeId}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                    gameMode === modeId
                      ? `border-${config.color} bg-${config.color}/10 shadow-lg`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setGameMode(modeId as GameMode)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="text-4xl">{config.icon}</div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold mb-2">
                          {config.title}
                        </h4>
                        <p className="text-gray-600 mb-3">{config.subtitle}</p>
                        <p className="text-sm text-gray-500 mb-4">
                          {config.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <Heart className="w-3 h-3 mr-1" />
                            {config.lives} Lives
                          </Badge>
                          {config.timeLimit && (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {config.timeLimit}s
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            {config.scoringMultiplier}x Score
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Difficulty Selection (not for rush mode) */}
          {gameMode !== "rush" && (
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-semibold text-center">
                Choose Difficulty
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    id: "easy",
                    title: "Easy",
                    icon: "😊",
                    desc: "1 missing vowel",
                  },
                  {
                    id: "medium",
                    title: "Medium",
                    icon: "🤔",
                    desc: "2 missing vowels",
                  },
                  {
                    id: "hard",
                    title: "Hard",
                    icon: "😤",
                    desc: "3+ missing vowels",
                  },
                  {
                    id: "mixed",
                    title: "Mixed",
                    icon: "🎲",
                    desc: "Random difficulty",
                  },
                ].map((diff) => (
                  <Card
                    key={diff.id}
                    className={`cursor-pointer transition-all hover:scale-105 border-2 ${
                      difficulty === diff.id
                        ? "border-educational-blue bg-educational-blue/10"
                        : "border-gray-200"
                    }`}
                    onClick={() => setDifficulty(diff.id as DifficultyLevel)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">{diff.icon}</div>
                      <h4 className="font-semibold mb-1">{diff.title}</h4>
                      <p className="text-xs text-gray-600">{diff.desc}</p>
                    </CardContent>
                  </Card>
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
              className={`w-full sm:w-auto px-8 py-4 text-lg rounded-xl font-bold text-white bg-gradient-to-r ${currentConfig.gradientColors} hover:scale-105 transition-all duration-300 shadow-lg`}
              size="lg"
            >
              <Play className="w-6 h-6 mr-3" />
              Start {currentConfig.title}!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main Game Screen
  if (!gameStarted || !currentQuestion) return null;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${currentConfig.bgGradient} p-4 relative`}
    >
      {/* Achievement Popups */}
      <AnimatePresence>
        {newAchievements.map((achievement, index) => (
          <EnhancedAchievementPopup
            key={`${achievement.id}-${index}`}
            achievement={achievement}
            onClose={() => {
              setNewAchievements((prev) => prev.filter((_, i) => i !== index));
            }}
          />
        ))}
      </AnimatePresence>

      {/* Celebration Effects */}
      <AnimatePresence>
        {showMainCelebration && (
          <CelebrationEffect
            type="ultimate"
            onComplete={() => setShowMainCelebration(false)}
          />
        )}
        {showReward && (
          <CelebrationEffect
            type="success"
            onComplete={() => setShowReward(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onExit} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {currentConfig.title}
            </h1>
            <p className="text-sm text-gray-600">{currentConfig.subtitle}</p>
          </div>

          <Button onClick={resetGame} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </Button>
        </div>

        {/* Game Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-educational-blue">
              {score}
            </div>
            <div className="text-xs text-gray-600">Score</div>
          </Card>

          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-educational-purple">
              {streak}
            </div>
            <div className="text-xs text-gray-600">Streak</div>
          </Card>

          <Card className="p-3 text-center">
            <div className="flex justify-center space-x-1">
              {Array.from({ length: currentConfig.lives }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${
                    i < lives ? "text-red-500 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-gray-600">Lives</div>
          </Card>

          {gameMode === "rush" && (
            <Card className="p-3 text-center">
              <div className="text-lg font-bold text-educational-orange">
                {timeLeft}
              </div>
              <div className="text-xs text-gray-600">Time</div>
            </Card>
          )}

          <Card className="p-3 text-center">
            <div className="text-lg font-bold text-gray-700">
              {currentIndex + 1}/{gameMode === "rush" ? "∞" : questions.length}
            </div>
            <div className="text-xs text-gray-600">Question</div>
          </Card>
        </div>

        {/* Progress Bar */}
        {gameMode !== "rush" && (
          <div className="mb-6">
            <Progress
              value={(currentIndex / questions.length) * 100}
              className="h-3"
            />
          </div>
        )}

        {/* Power-ups Bar */}
        <div className="flex justify-center space-x-2 mb-6">
          <Button
            onClick={useHint}
            disabled={powerUps.hints === 0 || isUsingHint}
            variant="outline"
            size="sm"
            className="flex-col h-16 w-16"
          >
            <Lightbulb className="w-4 h-4 mb-1" />
            <span className="text-xs">{powerUps.hints}</span>
          </Button>

          <Button
            onClick={skipQuestion}
            disabled={powerUps.skips === 0}
            variant="outline"
            size="sm"
            className="flex-col h-16 w-16"
          >
            <Target className="w-4 h-4 mb-1" />
            <span className="text-xs">{powerUps.skips}</span>
          </Button>

          {gameMode === "rush" && (
            <Button
              onClick={addTimeBoost}
              disabled={powerUps.timeBoost === 0}
              variant="outline"
              size="sm"
              className="flex-col h-16 w-16"
            >
              <Clock className="w-4 h-4 mb-1" />
              <span className="text-xs">{powerUps.timeBoost}</span>
            </Button>
          )}
        </div>

        {/* Question Card */}
        <Card
          className={`mx-auto max-w-2xl border-4 ${currentConfig.borderColor} bg-white/90 backdrop-blur-sm shadow-xl`}
        >
          <CardContent className="p-8">
            {/* Question */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">{currentConfig.icon}</div>
              <h2 className="text-2xl font-bold mb-4">Complete the word:</h2>

              {/* Word Display */}
              <div className="flex justify-center items-center flex-wrap gap-2 mb-6">
                {(currentQuestion.displayWord || currentQuestion.word || "").split("").map((char, index) => {
                  const isMissing =
                    (currentQuestion.missingVowelIndices || currentQuestion.missingIndex || []).includes(index);
                  const selectedVowel = selectedVowels[index];

                  return (
                    <div
                      key={index}
                      className={`w-12 h-16 border-2 rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                        isMissing
                          ? selectedVowel
                            ? "border-green-400 bg-green-50 text-green-700"
                            : "border-gray-400 bg-gray-50 text-gray-400 border-dashed"
                          : "border-gray-200 bg-white text-gray-800"
                      }`}
                    >
                      {isMissing ? selectedVowel || "_" : char}
                    </div>
                  );
                })}
              </div>

              {/* Definition */}
              <p className="text-lg text-gray-600 mb-6 italic">
                "{currentQuestion.definition}"
              </p>

              {/* Audio Button */}
              <Button
                onClick={() => audioService.speakWord(currentQuestion.word)}
                variant="outline"
                className="mb-6"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Hear the word
              </Button>
            </div>

            {/* Vowel Options */}
            <div className="grid grid-cols-5 gap-3">
              {vowelOptions.map((vowel) => (
                <Button
                  key={vowel}
                  onClick={() => {
                    const nextMissingIndex =
                      currentQuestion.missingVowelIndices.find(
                        (index) => !selectedVowels[index],
                      );
                    if (nextMissingIndex !== undefined) {
                      handleVowelSelect(nextMissingIndex, vowel);
                    }
                  }}
                  className={`h-16 text-2xl font-bold rounded-xl transition-all duration-300 ${
                    Object.values(selectedVowels).includes(vowel)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : `bg-gradient-to-br ${currentConfig.gradientColors} text-white hover:scale-110 shadow-lg`
                  }`}
                  disabled={Object.values(selectedVowels).includes(vowel)}
                >
                  {vowel}
                </Button>
              ))}
            </div>

            {/* Hint Display */}
            {isUsingHint && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center"
              >
                <Lightbulb className="w-5 h-5 mx-auto mb-2 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Hint: The first missing vowel is already filled in!
                </p>
              </motion.div>
            )}

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center"
                >
                  <p className="text-red-700 font-semibold">
                    Not quite right! Try again.
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    Think about the sound and meaning of the word.
                  </p>
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
                className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-4">
                  {currentConfig.title} Complete!
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Final Score:</span>
                    <span className="font-bold">{score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Streak:</span>
                    <span className="font-bold">{maxStreak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="font-bold">
                      {gameMode === "rush"
                        ? currentIndex + 1
                        : questions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy:</span>
                    <span className="font-bold">
                      {Math.round(
                        ((currentIndex +
                          1 -
                          (Object.keys(attempts).length -
                            Object.values(attempts).filter((a) => a === 1)
                              .length)) /
                          (currentIndex + 1)) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button onClick={resetGame} className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>
                  <Button onClick={onExit} variant="outline" className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Exit
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Help Menu */}
      <FloatingHelpMenu
        currentPage="vowel-quiz"
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
      />

      {/* Sparkle Effects */}
      {Array.from({ length: sparkleCount }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          initial={{
            opacity: 1,
            scale: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            opacity: 0,
            scale: 1,
            y: "-=100",
          }}
          transition={{ duration: 2, delay: i * 0.1 }}
          className="fixed pointer-events-none z-40"
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
}
