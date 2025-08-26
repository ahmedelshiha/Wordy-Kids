import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Volume2,
  Star,
  Heart,
  Trophy,
  Zap,
  Shuffle,
  RotateCcw,
  Crown,
  Gem,
  Shield,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UltimateWord {
  id: number;
  word: string;
  emoji: string;
  category: string;
  definition: string;
  sound: string;
  rarity: "common" | "rare" | "epic" | "legendary" | "mythical";
  difficulty: number;
  color: string;
  habitat: string;
  funFact: string;
}

interface UltimateJungleWordCardProps {
  words?: UltimateWord[];
  onScoreUpdate?: (score: number) => void;
  onStreakUpdate?: (streak: number) => void;
  className?: string;
}

export const UltimateJungleWordCard: React.FC<UltimateJungleWordCardProps> = ({
  words,
  onScoreUpdate,
  onStreakUpdate,
  className = "",
}) => {
  // Default vocabulary database with jungle theme
  const defaultVocabulary: UltimateWord[] = [
    {
      id: 1,
      word: "Lion",
      emoji: "🦁",
      category: "animals",
      definition: "The brave king of the jungle!",
      sound: "ROAAAAR! I am the mighty lion!",
      rarity: "legendary",
      difficulty: 2,
      color: "from-yellow-300 via-orange-400 to-red-400",
      habitat: "African Savanna",
      funFact: "Lions can roar as loud as a motorcycle!",
    },
    {
      id: 2,
      word: "Butterfly",
      emoji: "🦋",
      category: "animals",
      definition: "A beautiful flying rainbow!",
      sound: "Flutter flutter! I dance in the air!",
      rarity: "rare",
      difficulty: 3,
      color: "from-pink-300 via-purple-400 to-blue-400",
      habitat: "Flower Gardens",
      funFact: "Butterflies taste with their feet!",
    },
    {
      id: 3,
      word: "Dragon",
      emoji: "🐉",
      category: "fantasy",
      definition: "A magical fire-breathing friend!",
      sound: "RAAAWR! I breathe magical fire!",
      rarity: "mythical",
      difficulty: 4,
      color: "from-red-400 via-orange-500 to-yellow-400",
      habitat: "Mystical Mountains",
      funFact: "Dragons are wise and protect treasures!",
    },
    {
      id: 4,
      word: "Rainbow",
      emoji: "🌈",
      category: "nature",
      definition: "A colorful bridge in the sky!",
      sound: "Shimmer shimmer! I bring colors after rain!",
      rarity: "rare",
      difficulty: 2,
      color:
        "from-red-300 via-yellow-300 via-green-300 via-blue-300 to-purple-300",
      habitat: "Sky Kingdom",
      funFact: "Rainbows have 7 magical colors!",
    },
    {
      id: 5,
      word: "Castle",
      emoji: "🏰",
      category: "places",
      definition: "A magical home for kings and queens!",
      sound: "Welcome to my royal castle!",
      rarity: "epic",
      difficulty: 3,
      color: "from-gray-300 via-blue-400 to-purple-500",
      habitat: "Fantasy Kingdom",
      funFact: "Castles have secret passages and towers!",
    },
    {
      id: 6,
      word: "Unicorn",
      emoji: "🦄",
      category: "fantasy",
      definition: "A magical horse with a rainbow horn!",
      sound: "Neighhhh! My horn grants wishes!",
      rarity: "mythical",
      difficulty: 4,
      color: "from-white via-pink-300 to-purple-400",
      habitat: "Enchanted Forest",
      funFact: "Unicorns bring good luck and magic!",
    },
    {
      id: 7,
      word: "Treasure",
      emoji: "💎",
      category: "objects",
      definition: "Sparkling gems and golden coins!",
      sound: "Bling bling! I shine like stars!",
      rarity: "legendary",
      difficulty: 3,
      color: "from-yellow-300 via-yellow-400 to-orange-400",
      habitat: "Pirate Island",
      funFact: "Pirates hide treasure in secret places!",
    },
    {
      id: 8,
      word: "Rocket",
      emoji: "🚀",
      category: "transport",
      definition: "A fast ship that flies to space!",
      sound: "WHOOOOSH! Blast off to the stars!",
      rarity: "epic",
      difficulty: 3,
      color: "from-blue-400 via-purple-500 to-black",
      habitat: "Outer Space",
      funFact: "Rockets travel faster than race cars!",
    },
    {
      id: 9,
      word: "Elephant",
      emoji: "🐘",
      category: "animals",
      definition: "A gentle giant with big ears!",
      sound: "TRUMPEEET! I never forget anything!",
      rarity: "rare",
      difficulty: 2,
      color: "from-gray-300 via-gray-400 to-gray-500",
      habitat: "African Safari",
      funFact: "Elephants can remember friends for 50 years!",
    },
    {
      id: 10,
      word: "Phoenix",
      emoji: "🔥",
      category: "fantasy",
      definition: "A magical bird that rises from fire!",
      sound: "SWOOOOSH! I am reborn from flames!",
      rarity: "mythical",
      difficulty: 4,
      color: "from-orange-400 via-red-500 to-purple-600",
      habitat: "Fire Mountain",
      funFact: "Phoenix birds live for 1000 years!",
    },
  ];

  const vocabularyWords = words || defaultVocabulary;

  // Core states
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDefinition, setShowDefinition] = useState(true);
  const [discoveryMode, setDiscoveryMode] = useState<
    "learn" | "quiz" | "memory"
  >("learn");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [masteredWords, setMasteredWords] = useState<number[]>([]);
  const [currentAnimation, setCurrentAnimation] = useState("");
  const [particles, setParticles] = useState<
    Array<{
      id: number;
      emoji: string;
      x: number;
      y: number;
      delay: number;
    }>
  >([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showReward, setShowReward] = useState(false);

  const currentWord = vocabularyWords[currentWordIndex];

  // Update parent callbacks
  useEffect(() => {
    onScoreUpdate?.(score);
  }, [score, onScoreUpdate]);

  useEffect(() => {
    onStreakUpdate?.(streak);
  }, [streak, onStreakUpdate]);

  // Create floating particles effect
  const createParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: Math.random(),
        emoji: ["✨", "⭐", "🌟", "💫", "🎉", "🎊"][
          Math.floor(Math.random() * 6)
        ],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  // Play word sound with speech synthesis
  const playWordSound = () => {
    if (!soundEnabled) return;

    const utterance = new SpeechSynthesisUtterance(currentWord.sound);
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);

    // Visual feedback
    setCurrentAnimation("bounce");
    createParticles();
    setTimeout(() => setCurrentAnimation(""), 1000);
  };

  // Handle card interaction
  const handleCardClick = () => {
    if (discoveryMode === "quiz" && !showDefinition) {
      setShowDefinition(true);
      playWordSound();
      setScore((prev) => prev + 10);
    } else {
      playWordSound();
      setScore((prev) => prev + 5);
    }

    // Flip animation
    setIsFlipped(true);
    setTimeout(() => setIsFlipped(false), 600);
  };

  // Navigation functions
  const nextWord = () => {
    setCurrentWordIndex((prev) => (prev + 1) % vocabularyWords.length);
    setShowDefinition(discoveryMode !== "quiz");
    setCurrentAnimation("slideLeft");
    setTimeout(() => setCurrentAnimation(""), 300);
  };

  const previousWord = () => {
    setCurrentWordIndex((prev) =>
      prev === 0 ? vocabularyWords.length - 1 : prev - 1,
    );
    setShowDefinition(discoveryMode !== "quiz");
    setCurrentAnimation("slideRight");
    setTimeout(() => setCurrentAnimation(""), 300);
  };

  const shuffleWord = () => {
    const randomIndex = Math.floor(Math.random() * vocabularyWords.length);
    setCurrentWordIndex(randomIndex);
    setShowDefinition(discoveryMode !== "quiz");
    setCurrentAnimation("spin");
    setTimeout(() => setCurrentAnimation(""), 600);
  };

  // Toggle favorite
  const toggleFavorite = () => {
    if (favorites.includes(currentWord.id)) {
      setFavorites((prev) => prev.filter((id) => id !== currentWord.id));
    } else {
      setFavorites((prev) => [...prev, currentWord.id]);
      setScore((prev) => prev + 15);
      createParticles();
    }
  };

  // Mark as mastered
  const markMastered = () => {
    if (!masteredWords.includes(currentWord.id)) {
      setMasteredWords((prev) => [...prev, currentWord.id]);
      setStreak((prev) => prev + 1);
      setScore((prev) => prev + 25);
      setShowReward(true);
      createParticles();
      setTimeout(() => setShowReward(false), 2000);
    }
  };

  // Get rarity color
  const getRarityColor = () => {
    switch (currentWord.rarity) {
      case "common":
        return "border-green-400";
      case "rare":
        return "border-blue-400";
      case "epic":
        return "border-purple-400";
      case "legendary":
        return "border-yellow-400";
      case "mythical":
        return "border-pink-400";
      default:
        return "border-gray-400";
    }
  };

  // Get difficulty stars
  const getDifficultyStars = () => {
    return Array.from({ length: currentWord.difficulty }, (_, i) => (
      <Star key={i} size={16} className="text-yellow-400 fill-current" />
    ));
  };

  return (
    <div className={cn("relative", className)}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-10 left-10 text-2xl animate-bounce">
          🦋
        </div>
        <div className="absolute top-20 right-20 text-xl animate-pulse">🌸</div>
        <div className="absolute bottom-20 left-20 text-3xl animate-float">
          🌳
        </div>
        <div className="absolute bottom-10 right-10 text-xl animate-bounce delay-1000">
          ⭐
        </div>
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-ping pointer-events-none z-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* Header Stats */}
      <div className="flex justify-between items-center mb-6 bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="text-3xl">🏆</div>
          <div>
            <div className="font-bold text-xl text-gray-800">
              {score} Points
            </div>
            <div className="text-sm text-gray-600">Streak: {streak} 🔥</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "p-2 rounded-full transition-all",
              soundEnabled
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-600 hover:bg-gray-400",
            )}
            size="sm"
          >
            <Volume2 size={20} />
          </Button>

          <div className="text-center">
            <div className="text-2xl">📚</div>
            <div className="text-xs font-bold">
              {currentWordIndex + 1}/{vocabularyWords.length}
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-center gap-2 mb-6">
        {["learn", "quiz", "memory"].map((mode) => (
          <Button
            key={mode}
            onClick={() => {
              setDiscoveryMode(mode as "learn" | "quiz" | "memory");
              setShowDefinition(mode !== "quiz");
            }}
            variant={discoveryMode === mode ? "default" : "outline"}
            className={cn(
              "font-bold transition-all",
              discoveryMode === mode
                ? "bg-jungle text-white shadow-lg scale-105"
                : "bg-white/70 text-gray-700 hover:bg-white/80",
            )}
          >
            {mode === "learn" && "📖 Learn"}
            {mode === "quiz" && "🎯 Quiz"}
            {mode === "memory" && "🧠 Memory"}
          </Button>
        ))}
      </div>

      {/* Main Interactive Card */}
      <div className="max-w-lg mx-auto mb-8">
        <Card
          className={cn(
            `relative bg-gradient-to-br ${currentWord.color} rounded-3xl shadow-2xl overflow-hidden 
          border-4 ${getRarityColor()} transform transition-all duration-500
          ${currentAnimation === "bounce" ? "animate-bounce" : ""}
          ${currentAnimation === "spin" ? "animate-spin" : ""}
          ${currentAnimation === "slideLeft" ? "animate-pulse" : ""}
          ${currentAnimation === "slideRight" ? "animate-pulse" : ""}
          ${isFlipped ? "scale-110 rotate-6" : "scale-100 rotate-0"}
          cursor-pointer hover:scale-105`,
          )}
        >
          {/* Card Header */}
          <div className="bg-white/20 backdrop-blur-sm p-4 border-b border-white/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="text-2xl">🏠</div>
                <div className="text-white font-bold">
                  {currentWord.habitat}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getDifficultyStars()}
                <Badge className="text-white font-bold capitalize bg-white/20 border-white/30">
                  {currentWord.rarity}
                </Badge>
              </div>
            </div>
          </div>

          <CardContent
            className="p-8 text-center text-white"
            onClick={handleCardClick}
          >
            {/* Emoji Display */}
            <div className="text-9xl mb-6 transform hover:scale-110 transition-all duration-300 drop-shadow-2xl">
              {currentWord.emoji}
            </div>

            {/* Word Display */}
            <h1 className="text-6xl font-bold mb-4 drop-shadow-lg tracking-wide">
              {currentWord.word}
            </h1>

            {/* Definition (conditional) */}
            {(discoveryMode === "learn" ||
              (discoveryMode === "quiz" && showDefinition)) && (
              <p className="text-2xl mb-6 bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                {currentWord.definition}
              </p>
            )}

            {/* Quiz Mode Hint */}
            {discoveryMode === "quiz" && !showDefinition && (
              <div className="text-2xl mb-6 bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                🤔 What is this word? Tap to reveal!
              </div>
            )}

            {/* Fun Fact */}
            <div className="bg-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm">
              <div className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
                <span>🤓</span> Fun Fact:
              </div>
              <div className="text-base">{currentWord.funFact}</div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex justify-center gap-3 flex-wrap">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  playWordSound();
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <Volume2 size={20} />
                Say It!
              </Button>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite();
                }}
                variant={
                  favorites.includes(currentWord.id) ? "default" : "outline"
                }
                className={cn(
                  "shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2 transition-all",
                  favorites.includes(currentWord.id)
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white hover:bg-gray-100 text-gray-800",
                )}
              >
                <Heart
                  size={20}
                  className={
                    favorites.includes(currentWord.id) ? "fill-current" : ""
                  }
                />
                {favorites.includes(currentWord.id) ? "Loved!" : "Love It"}
              </Button>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  markMastered();
                }}
                variant={
                  masteredWords.includes(currentWord.id) ? "default" : "outline"
                }
                className={cn(
                  "shadow-xl transform hover:scale-105 active:scale-95 flex items-center gap-2 transition-all",
                  masteredWords.includes(currentWord.id)
                    ? "bg-green-500 text-white"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white",
                )}
              >
                <Crown size={20} />
                {masteredWords.includes(currentWord.id)
                  ? "Mastered!"
                  : "Master It"}
              </Button>
            </div>
          </CardContent>

          {/* Status Badges */}
          {masteredWords.includes(currentWord.id) && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <Shield size={16} />
              MASTERED
            </div>
          )}

          {favorites.includes(currentWord.id) && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <Heart size={16} className="fill-current" />
              FAVORITE
            </div>
          )}
        </Card>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-center items-center gap-6 mb-6">
        <Button
          onClick={previousWord}
          className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transform hover:scale-110 active:scale-95 transition-all"
          size="sm"
        >
          <ChevronLeft size={28} className="text-gray-700" />
        </Button>

        <Button
          onClick={shuffleWord}
          className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transform hover:scale-110 active:scale-95 transition-all"
          size="sm"
        >
          <Shuffle size={28} className="text-gray-700" />
        </Button>

        <Button
          onClick={() => {
            setCurrentWordIndex(0);
            setShowDefinition(discoveryMode !== "quiz");
          }}
          className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transform hover:scale-110 active:scale-95 transition-all"
          size="sm"
        >
          <RotateCcw size={28} className="text-gray-700" />
        </Button>

        <Button
          onClick={nextWord}
          className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl transform hover:scale-110 active:scale-95 transition-all"
          size="sm"
        >
          <ChevronRight size={28} className="text-gray-700" />
        </Button>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center shadow-xl">
          <div className="text-3xl mb-2">❤️</div>
          <div className="font-bold text-xl">{favorites.length}</div>
          <div className="text-sm text-gray-600">Favorites</div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center shadow-xl">
          <div className="text-3xl mb-2">👑</div>
          <div className="font-bold text-xl">{masteredWords.length}</div>
          <div className="text-sm text-gray-600">Mastered</div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center shadow-xl">
          <div className="text-3xl mb-2">🔥</div>
          <div className="font-bold text-xl">{streak}</div>
          <div className="text-sm text-gray-600">Streak</div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 text-center shadow-xl">
          <div className="text-3xl mb-2">🏆</div>
          <div className="font-bold text-xl">{score}</div>
          <div className="text-sm text-gray-600">Score</div>
        </div>
      </div>

      {/* Reward Popup */}
      {showReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center transform animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-3xl font-bold text-gray-800 mb-2">
              Amazing!
            </div>
            <div className="text-xl text-gray-600">
              You mastered "{currentWord.word}"!
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
