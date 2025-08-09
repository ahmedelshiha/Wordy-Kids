import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Gamepad2,
  Trophy,
  Star,
  Zap,
  Heart,
  Target,
  Gift,
  Crown,
  Sparkles,
  Timer,
  Volume2,
  Shuffle,
  ChevronRight,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { audioService } from "@/lib/audioService";
import { EncouragingFeedback } from "./EncouragingFeedback";

interface Word {
  id: number;
  word: string;
  pronunciation?: string;
  definition: string;
  example?: string;
  funFact?: string;
  emoji?: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  imageUrl?: string;
}

interface GameSession {
  id: string;
  type:
    | "word_adventure"
    | "spelling_quest"
    | "memory_match"
    | "pronunciation_practice"
    | "definition_detective";
  words: Word[];
  currentIndex: number;
  score: number;
  lives: number;
  streak: number;
  timeLeft: number;
  isActive: boolean;
  powerUps: string[];
}

interface GameLikeLearningProps {
  words: Word[];
  onComplete: (score: number, totalWords: number) => void;
  onBack?: () => void;
  userProfile?: {
    name: string;
    avatar: any;
    level: number;
    points: number;
  };
}

const gameTypes = [
  {
    id: "word_adventure",
    name: "Word Adventure",
    icon: "🗺️",
    description: "Journey through words with your learning buddy!",
    difficulty: "easy",
    timeLimit: 60,
    rewards: ["🎯 +10 points per word", "⭐ Streak bonuses", "🎁 Power-ups"],
  },
  {
    id: "spelling_quest",
    name: "Spelling Quest",
    icon: "✏️",
    description: "Master the magic of spelling with fun challenges!",
    difficulty: "medium",
    timeLimit: 90,
    rewards: [
      "📝 +15 points per word",
      "🔥 Accuracy bonuses",
      "👑 Special badges",
    ],
  },
  {
    id: "memory_match",
    name: "Memory Match",
    icon: "🧩",
    description: "Match words with their meanings in this brain game!",
    difficulty: "medium",
    timeLimit: 120,
    rewards: [
      "�� +20 points per match",
      "⚡ Speed bonuses",
      "🌟 Memory master badge",
    ],
  },
  {
    id: "pronunciation_practice",
    name: "Pronunciation Practice",
    icon: "🎤",
    description: "Learn to say words perfectly with audio help!",
    difficulty: "easy",
    timeLimit: 45,
    rewards: [
      "🔊 +12 points per word",
      "🎵 Pronunciation badges",
      "🗣️ Speaking confidence",
    ],
  },
  {
    id: "definition_detective",
    name: "Definition Detective",
    icon: "🔍",
    description: "Solve word mysteries by finding the right meanings!",
    difficulty: "hard",
    timeLimit: 150,
    rewards: [
      "🕵️ +25 points per solve",
      "💎 Detective badges",
      "🏆 Master rewards",
    ],
  },
];

const powerUps = [
  {
    id: "extra_time",
    name: "Extra Time",
    icon: "⏰",
    description: "+30 seconds",
    cost: 50,
    effect: "Adds 30 seconds to the timer",
  },
  {
    id: "hint_helper",
    name: "Hint Helper",
    icon: "💡",
    description: "Get a helpful hint",
    cost: 75,
    effect: "Reveals part of the answer",
  },
  {
    id: "double_points",
    name: "Double Points",
    icon: "✨",
    description: "2x points for next answer",
    cost: 100,
    effect: "Doubles points for the next correct answer",
  },
  {
    id: "shield",
    name: "Shield",
    icon: "🛡���",
    description: "Protect from mistakes",
    cost: 125,
    effect: "Next wrong answer won't count against you",
  },
];

export function GameLikeLearning({
  words,
  onComplete,
  onBack,
  userProfile,
}: GameLikeLearningProps) {
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [showGameSelection, setShowGameSelection] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);
  const [playerAnswer, setPlayerAnswer] = useState("");
  const [lives, setLives] = useState(3);
  const [multiplier, setMultiplier] = useState(1);
  const [achievements, setAchievements] = useState<string[]>([]);

  // Timer effect
  useEffect(() => {
    if (gameSession?.isActive && gameSession.timeLeft > 0) {
      const timer = setTimeout(() => {
        setGameSession((prev) =>
          prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null,
        );
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameSession?.timeLeft === 0) {
      handleGameComplete();
    }
  }, [gameSession?.timeLeft, gameSession?.isActive]);

  const startGame = (gameType: string) => {
    const gameConfig = gameTypes.find((g) => g.id === gameType);
    if (!gameConfig) return;

    const shuffledWords = [...words]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    const newSession: GameSession = {
      id: Date.now().toString(),
      type: gameType as any,
      words: shuffledWords,
      currentIndex: 0,
      score: 0,
      lives: 3,
      streak: 0,
      timeLeft: gameConfig.timeLimit,
      isActive: true,
      powerUps: [],
    };

    setGameSession(newSession);
    setShowGameSelection(false);
    setLives(3);
    setMultiplier(1);
    audioService.playCheerSound();
  };

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    if (!gameSession) return;

    if (isCorrect) {
      const basePoints = 10 * multiplier;
      const streakBonus = gameSession.streak * 2;
      const totalPoints = basePoints + streakBonus;

      setGameSession((prev) =>
        prev
          ? {
              ...prev,
              score: prev.score + totalPoints,
              streak: prev.streak + 1,
              currentIndex: prev.currentIndex + 1,
            }
          : null,
      );

      setFeedback({
        type: "success",
        title: "Awesome! 🎉",
        message: `Correct! You earned ${totalPoints} points!`,
        points: totalPoints,
        streak: gameSession.streak + 1,
        onContinue: () => {
          setFeedback(null);
          if (gameSession.currentIndex + 1 >= gameSession.words.length) {
            handleGameComplete();
          }
        },
      });

      // Check for achievements
      if (gameSession.streak + 1 === 5) {
        setAchievements((prev) => [...prev, "streak_master"]);
      }

      audioService.playCheerSound();
    } else {
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        handleGameComplete();
        return;
      }

      setGameSession((prev) => (prev ? { ...prev, streak: 0 } : null));

      setFeedback({
        type: "try_again",
        title: "Oops! 💝",
        message: `That's okay! You have ${newLives} hearts left. Keep trying!`,
        onTryAgain: () => {
          setFeedback(null);
          setPlayerAnswer("");
        },
        onContinue: () => {
          setFeedback(null);
          setPlayerAnswer("");
          if (gameSession) {
            setGameSession((prev) =>
              prev ? { ...prev, currentIndex: prev.currentIndex + 1 } : null,
            );
          }
        },
      });

      audioService.playEncouragementSound();
    }

    setMultiplier(1); // Reset multiplier after use
  };

  const handleGameComplete = () => {
    if (!gameSession) return;

    setGameSession((prev) => (prev ? { ...prev, isActive: false } : null));

    const completionBonus = Math.floor(gameSession.score * 0.1);
    const finalScore = gameSession.score + completionBonus;

    setFeedback({
      type: "celebration",
      title: "Game Complete! 🏆",
      message: `You scored ${finalScore} points and learned ${gameSession.currentIndex} words!`,
      points: finalScore,
      onContinue: () => {
        setFeedback(null);
        onComplete(finalScore, gameSession.words.length);
        resetGame();
      },
    });
  };

  const resetGame = () => {
    setGameSession(null);
    setShowGameSelection(true);
    setPlayerAnswer("");
    setLives(3);
    setMultiplier(1);
  };

  const usePowerUp = (powerUpId: string) => {
    if (!gameSession) return;

    switch (powerUpId) {
      case "extra_time":
        setGameSession((prev) =>
          prev ? { ...prev, timeLeft: prev.timeLeft + 30 } : null,
        );
        break;
      case "double_points":
        setMultiplier(2);
        break;
      case "hint_helper":
        // Show hint logic would go here
        break;
      case "shield":
        // Shield logic would go here
        break;
    }

    audioService.playWhooshSound();
  };

  const renderGameSelection = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-educational-blue to-educational-purple p-4 rounded-full animate-pulse">
            <Gamepad2 className="w-12 h-12 text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-educational-blue to-educational-purple bg-clip-text text-transparent mb-4">
          🎮 Choose Your Learning Game! 🎮
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Ready for some fun? Pick a game and start your vocabulary adventure!
        </p>

        {userProfile && (
          <div className="flex justify-center mb-6">
            <Card className="bg-gradient-to-r from-educational-green to-educational-blue text-white">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="text-3xl">
                  {userProfile.avatar?.emoji || "🎯"}
                </div>
                <div>
                  <div className="font-bold">{userProfile.name}</div>
                  <div className="text-sm opacity-90">
                    Level {userProfile.level} • {userProfile.points} points
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Game Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameTypes.map((game, index) => (
          <Card
            key={game.id}
            className={`cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl transform hover:-translate-y-2 ${
              selectedGame === game.id
                ? "ring-4 ring-educational-blue bg-gradient-to-br from-blue-50 to-purple-50"
                : ""
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelectedGame(game.id)}
          >
            <CardHeader className="text-center">
              <div className="text-6xl mb-2">{game.icon}</div>
              <CardTitle className="text-educational-blue">
                {game.name}
              </CardTitle>
              <Badge
                className={`${
                  game.difficulty === "easy"
                    ? "bg-educational-green"
                    : game.difficulty === "medium"
                      ? "bg-educational-orange"
                      : "bg-educational-pink"
                } text-white`}
              >
                {game.difficulty === "easy"
                  ? "🌟 Easy"
                  : game.difficulty === "medium"
                    ? "⭐ Medium"
                    : "🔥 Hard"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{game.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Timer className="w-4 h-4 text-educational-blue" />
                  <span>{game.timeLimit} seconds</span>
                </div>
                <div className="text-xs text-gray-500">
                  <div className="font-semibold mb-1">Rewards:</div>
                  {game.rewards.map((reward, i) => (
                    <div key={i}>{reward}</div>
                  ))}
                </div>
              </div>

              {selectedGame === game.id && (
                <Button
                  className="w-full bg-gradient-to-r from-educational-blue to-educational-purple text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    startGame(game.id);
                  }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Start Adventure!
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGameplay = () => {
    if (!gameSession) return null;

    const currentWord = gameSession.words[gameSession.currentIndex];
    if (!currentWord) return null;

    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="bg-gradient-to-r from-educational-blue to-educational-purple text-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl">
                {gameTypes.find((g) => g.id === gameSession.type)?.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {gameTypes.find((g) => g.id === gameSession.type)?.name}
                </h3>
                <div className="text-sm opacity-90">
                  Word {gameSession.currentIndex + 1} of{" "}
                  {gameSession.words.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Lives */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 3 }, (_, i) => (
                  <Heart
                    key={i}
                    className={`w-6 h-6 ${i < lives ? "text-red-400 fill-current" : "text-gray-400"}`}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <span className="font-bold text-lg">
                  {gameSession.timeLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress
            value={(gameSession.currentIndex / gameSession.words.length) * 100}
            className="h-3 bg-white/20"
          />

          {/* Score & Streak */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-4">
              <Badge className="bg-white/20 text-white">
                <Trophy className="w-4 h-4 mr-1" />
                {gameSession.score} points
              </Badge>
              {gameSession.streak > 0 && (
                <Badge className="bg-yellow-400 text-yellow-900">
                  <Zap className="w-4 h-4 mr-1" />
                  {gameSession.streak} streak
                </Badge>
              )}
              {multiplier > 1 && (
                <Badge className="bg-pink-400 text-white animate-pulse">
                  <Sparkles className="w-4 h-4 mr-1" />
                  {multiplier}x points
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Word Display */}
        <Card className="bg-gradient-to-br from-educational-green to-educational-blue text-white">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">{currentWord.emoji || "📚"}</div>
            <h2 className="text-4xl font-bold mb-2">{currentWord.word}</h2>

            {gameSession.type === "pronunciation_practice" && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => audioService.pronounceWord(currentWord.word)}
                className="text-white hover:bg-white/20 mb-4"
              >
                <Volume2 className="w-6 h-6 mr-2" />
                Listen to Pronunciation
              </Button>
            )}

            {currentWord.pronunciation && (
              <p className="text-lg opacity-90 mb-4">
                {currentWord.pronunciation}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Game-specific content */}
        <Card>
          <CardContent className="p-6">
            {gameSession.type === "word_adventure" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">
                  What does this word mean?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    currentWord.definition,
                    "A wrong definition",
                    "Another wrong answer",
                    "Yet another wrong option",
                  ]
                    .sort(() => Math.random() - 0.5)
                    .map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="p-4 h-auto text-left"
                        onClick={() =>
                          handleAnswer(
                            option,
                            option === currentWord.definition,
                          )
                        }
                      >
                        {option}
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {gameSession.type === "definition_detective" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">
                  🔍 Detective Challenge!
                </h3>
                <p className="text-center text-gray-600">
                  Read this definition and find the mystery word:
                </p>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <p className="font-semibold">{currentWord.definition}</p>
                </div>
                <div className="flex justify-center">
                  <input
                    type="text"
                    value={playerAnswer}
                    onChange={(e) => setPlayerAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    className="px-4 py-2 border rounded-lg text-center"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAnswer(
                          playerAnswer,
                          playerAnswer.toLowerCase() ===
                            currentWord.word.toLowerCase(),
                        );
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Power-ups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Power-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {powerUps.map((powerUp) => (
                <Button
                  key={powerUp.id}
                  variant="outline"
                  size="sm"
                  onClick={() => usePowerUp(powerUp.id)}
                  className="flex flex-col gap-1 h-auto p-3"
                  disabled={(userProfile?.points || 0) < powerUp.cost}
                >
                  <div className="text-2xl">{powerUp.icon}</div>
                  <div className="text-xs font-semibold">{powerUp.name}</div>
                  <div className="text-xs text-gray-500">
                    {powerUp.cost} pts
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Game Controls */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={resetGame}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Exit Game
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {showGameSelection ? renderGameSelection() : renderGameplay()}

      {feedback && (
        <EncouragingFeedback
          feedback={feedback}
          onClose={() => setFeedback(null)}
        />
      )}
    </div>
  );
}
