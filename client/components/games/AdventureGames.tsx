import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Play, Zap, Timer, Star, Gift } from "lucide-react";
import { GameLikeLearning } from "../GameLikeLearning";
import { WordMatchingGame } from "../WordMatchingGame";
import { generateMatchingPairs } from "@/lib/gameGeneration";
import { getWordsByCategory, getRandomWords } from "@/data/wordsDatabase";

interface AdventureGamesProps {
  selectedCategory: string;
  onGameComplete: (score: number, totalWords: number) => void;
  onMatchingComplete: (score: number, timeSpent: number) => void;
  userProfile?: any;
}

export function AdventureGames({
  selectedCategory,
  onGameComplete,
  onMatchingComplete,
  userProfile,
}: AdventureGamesProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const adventureGames = [
    {
      id: "word_adventure",
      title: "Word Adventure Quest",
      description: "Journey through words with your learning buddy!",
      icon: "🗺️",
      difficulty: "Easy",
      timeLimit: "2-5 min",
      rewards: ["🎯 +10 points per word", "⭐ Streak bonuses", "🎁 Power-ups"],
      color: "from-educational-green to-green-400",
      players: "Single Player",
    },
    {
      id: "matching_game",
      title: "Memory Match Challenge",
      description: "Match words with their meanings in this brain game!",
      icon: "🧩",
      difficulty: "Medium",
      timeLimit: "3-6 min",
      rewards: [
        "🧠 +20 points per match",
        "⚡ Speed bonuses",
        "🌟 Memory master badge",
      ],
      color: "from-educational-purple to-purple-400",
      players: "Single Player",
    },
    {
      id: "speed_learning",
      title: "Lightning Learning",
      description: "Learn words at lightning speed! How fast can you go?",
      icon: "⚡",
      difficulty: "Hard",
      timeLimit: "1-3 min",
      rewards: [
        "🚀 +30 points per word",
        "💨 Speed achievements",
        "👑 Speed champion",
      ],
      color: "from-educational-orange to-orange-400",
      players: "Single Player",
    },
    {
      id: "pronunciation_party",
      title: "Pronunciation Party",
      description: "Learn to say words perfectly with fun audio challenges!",
      icon: "🎤",
      difficulty: "Easy",
      timeLimit: "2-4 min",
      rewards: [
        "🔊 +15 points per word",
        "🎵 Sound master badge",
        "🗣️ Speaking confidence",
      ],
      color: "from-educational-blue to-blue-400",
      players: "Single Player",
    },
  ];

  const handleGameStart = (gameId: string) => {
    setActiveGame(gameId);
  };

  const handleGameBack = () => {
    setActiveGame(null);
  };

  if (activeGame === "word_adventure") {
    return (
      <GameLikeLearning
        words={(() => {
          const categoryWords =
            selectedCategory === "all"
              ? getRandomWords(20)
              : getWordsByCategory(selectedCategory);
          return categoryWords.slice(0, 10);
        })()}
        onComplete={onGameComplete}
        onBack={handleGameBack}
        userProfile={userProfile}
      />
    );
  }

  if (activeGame === "matching_game") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            🧩 Memory Match Challenge
          </h2>
          <Button onClick={handleGameBack} variant="outline" size="sm">
            ← Back to Games
          </Button>
        </div>
        <WordMatchingGame
          pairs={generateMatchingPairs(6, undefined, selectedCategory)}
          onComplete={onMatchingComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Adventure Games Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-educational-green via-educational-blue to-educational-purple bg-clip-text text-transparent mb-2">
          🎮 Adventure Games Zone! 🚀
        </h2>
        <p className="text-gray-600 mb-6">
          Choose your learning adventure and become a word master!
        </p>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adventureGames.map((game, index) => (
          <Card
            key={game.id}
            className={`hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-dashed hover:border-solid cursor-pointer bg-gradient-to-br ${game.color} text-white`}
            onClick={() => handleGameStart(game.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-4xl">{game.icon}</div>
                <Badge className="bg-white/20 text-white border-white/20">
                  {game.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-xl text-white">{game.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/90 text-sm">{game.description}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    <span>{game.timeLimit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>{game.players}</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-xs font-semibold text-white/90 mb-2 flex items-center gap-1">
                    <Gift className="w-3 h-3" />
                    Rewards:
                  </div>
                  <div className="space-y-1">
                    {game.rewards.map((reward, i) => (
                      <div key={i} className="text-xs text-white/80">
                        {reward}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-white/20 text-white hover:bg-white/30 border-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGameStart(game.id);
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Adventure!
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon Games */}
      <div className="text-center mt-8">
        <h3 className="text-lg font-bold text-gray-700 mb-4">
          🚀 Coming Soon!
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              name: "Story Builder",
              icon: "📚",
              desc: "Create stories with new words!",
            },
            {
              name: "Word Racing",
              icon: "🏎️",
              desc: "Race against time and friends!",
            },
            {
              name: "Treasure Hunt",
              icon: "🗺️",
              desc: "Find hidden word treasures!",
            },
          ].map((game, index) => (
            <Card key={index} className="opacity-60 border-2 border-dashed">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{game.icon}</div>
                <h4 className="font-semibold text-gray-700">{game.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{game.desc}</p>
                <Badge variant="outline" className="mt-2 text-xs">
                  Coming Soon
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
