import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TreePine,
  Crown,
  Star,
  Heart,
  Shuffle,
  Settings,
  Monitor,
  Smartphone,
  Volume2,
  Zap,
} from "lucide-react";
import { JungleAdventureWordCard } from "@/components/JungleAdventureWordCard";

// Sample jungle adventure words for demo
const jungleWords = [
  {
    id: 1,
    word: "Adventure",
    pronunciation: "/ədˈventʃər/",
    definition:
      "An exciting or unusual experience, especially a journey to explore new places!",
    example:
      "The brave explorer went on a jungle adventure to find hidden treasures.",
    funFact:
      "The word 'adventure' comes from Latin meaning 'to arrive' - just like arriving at new discoveries!",
    emoji: "🌿",
    category: "exploration",
    difficulty: "medium" as const,
    masteryLevel: 75,
  },
  {
    id: 2,
    word: "Jungle",
    pronunciation: "/ˈdʒʌŋɡəl/",
    definition:
      "A thick tropical forest with lots of trees, plants, and amazing animals!",
    example:
      "The colorful parrots and playful monkeys live happily in the jungle.",
    funFact:
      "Jungles are home to more than half of all the animals and plants on Earth!",
    emoji: "🌳",
    category: "nature",
    difficulty: "easy" as const,
    masteryLevel: 90,
  },
  {
    id: 3,
    word: "Explorer",
    pronunciation: "/ɪkˈsplɔːrər/",
    definition:
      "A brave person who travels to discover new places and learn exciting things!",
    example:
      "The young explorer used a map and compass to find the secret waterfall.",
    funFact:
      "Famous explorers discovered new continents and helped us learn about our amazing world!",
    emoji: "🧭",
    category: "people",
    difficulty: "medium" as const,
    masteryLevel: 60,
  },
  {
    id: 4,
    word: "Magnificent",
    pronunciation: "/mæɡˈnɪfɪsənt/",
    definition:
      "Something so beautiful and amazing that it takes your breath away!",
    example:
      "The magnificent rainbow appeared after the jungle rain, painting the sky with colors.",
    funFact:
      "Magnificent comes from Latin meaning 'great-making' - it makes everything feel grand!",
    emoji: "✨",
    category: "descriptive",
    difficulty: "hard" as const,
    masteryLevel: 30,
  },
  {
    id: 5,
    word: "Discovery",
    pronunciation: "/dɪˈskʌvəri/",
    definition:
      "Finding something new and exciting that nobody knew about before!",
    example:
      "The greatest discovery in the jungle was a hidden cave full of sparkling crystals.",
    funFact:
      "Every day scientists make new discoveries that help us understand our world better!",
    emoji: "💎",
    category: "exploration",
    difficulty: "medium" as const,
    masteryLevel: 50,
  },
];

export function JungleAdventureWordCardDemo() {
  const [showDemo, setShowDemo] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [adventureStats, setAdventureStats] = useState({
    wordsExplored: 0,
    adventureLevel: 1,
    explorerXP: 0,
    badges: ["first-explorer"],
  });

  const currentWord = jungleWords[currentWordIndex];

  const handleWordMastered = (
    wordId: number,
    rating: "easy" | "medium" | "hard",
  ) => {
    console.log(`Jungle word mastered: ${wordId} with rating: ${rating}`);

    // Update adventure stats
    setAdventureStats((prev) => ({
      ...prev,
      wordsExplored: prev.wordsExplored + 1,
      explorerXP:
        prev.explorerXP +
        (rating === "easy" ? 100 : rating === "medium" ? 60 : 30),
      adventureLevel:
        Math.floor(
          (prev.explorerXP +
            (rating === "easy" ? 100 : rating === "medium" ? 60 : 30)) /
            200,
        ) + 1,
    }));
  };

  const nextWord = () => {
    setCurrentWordIndex((prev) => (prev + 1) % jungleWords.length);
  };

  const prevWord = () => {
    setCurrentWordIndex(
      (prev) => (prev - 1 + jungleWords.length) % jungleWords.length,
    );
  };

  const shuffleWord = () => {
    setCurrentWordIndex(Math.floor(Math.random() * jungleWords.length));
  };

  if (showDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jungle-light via-green-50 to-emerald-100 relative overflow-hidden">
        {/* Jungle Background Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 text-6xl animate-sway">
            🌿
          </div>
          <div className="absolute top-20 right-20 text-5xl animate-bounce">
            🦋
          </div>
          <div className="absolute bottom-20 left-20 text-7xl animate-pulse">
            🌳
          </div>
          <div className="absolute bottom-10 right-10 text-4xl animate-spin-slow">
            🌺
          </div>
          <div className="absolute top-1/2 left-1/4 text-3xl animate-float-up">
            🐦
          </div>
          <div className="absolute top-1/3 right-1/3 text-5xl animate-gentle-bounce">
            🌸
          </div>
        </div>

        {/* Header */}
        <div className="relative z-10 p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => setShowDemo(false)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-jungle-dark"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </Button>

            <div className="flex items-center gap-4">
              {/* Device View Toggle */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full p-1 border border-white/30">
                <Button
                  onClick={() => setDeviceView("desktop")}
                  size="sm"
                  className={`rounded-full transition-all ${
                    deviceView === "desktop"
                      ? "bg-jungle text-white shadow-lg"
                      : "bg-transparent text-jungle-dark hover:bg-white/20"
                  }`}
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  onClick={() => setDeviceView("mobile")}
                  size="sm"
                  className={`rounded-full transition-all ${
                    deviceView === "mobile"
                      ? "bg-jungle text-white shadow-lg"
                      : "bg-transparent text-jungle-dark hover:bg-white/20"
                  }`}
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Mobile
                </Button>
              </div>

              {/* Adventure Stats */}
              <div className="bg-gradient-to-r from-sunshine/20 to-bright-orange/20 backdrop-blur-md rounded-xl px-4 py-2 border border-yellow-400/30">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    <span className="font-bold text-yellow-800">
                      Lv.{adventureStats.adventureLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">
                      {adventureStats.explorerXP} XP
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TreePine className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-800">
                      {adventureStats.wordsExplored} Explored
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-jungle-dark via-green-600 to-emerald-700 bg-clip-text text-transparent mb-4">
              🌿 Jungle Adventure Word Cards ✨
            </h1>
            <p className="text-lg md:text-xl text-jungle-dark/80 max-w-3xl mx-auto">
              Experience the most immersive jungle adventure word learning
              system! Perfect for both desktop and mobile explorers. 🦋🌳
            </p>
          </div>
        </div>

        {/* Main Demo Area */}
        <div className="relative z-10 px-4 pb-8">
          <div
            className={`max-w-6xl mx-auto ${deviceView === "mobile" ? "max-w-md" : ""}`}
          >
            {/* Device Frame */}
            <div
              className={`${
                deviceView === "mobile"
                  ? "bg-gray-900 rounded-[2rem] p-2 shadow-2xl border-4 border-gray-800"
                  : "bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20"
              }`}
            >
              {deviceView === "mobile" && (
                <div className="bg-black rounded-[1.5rem] p-4 relative">
                  {/* Mobile notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl"></div>
                  <div className="pt-6">
                    <JungleAdventureWordCard
                      word={currentWord}
                      onWordMastered={handleWordMastered}
                      showVocabularyBuilder={true}
                      adventureLevel={adventureStats.adventureLevel}
                      explorerBadges={adventureStats.badges}
                      isJungleQuest={true}
                    />
                  </div>
                </div>
              )}

              {deviceView === "desktop" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  {/* Word Card */}
                  <div className="flex justify-center">
                    <JungleAdventureWordCard
                      word={currentWord}
                      onWordMastered={handleWordMastered}
                      showVocabularyBuilder={true}
                      adventureLevel={adventureStats.adventureLevel}
                      explorerBadges={adventureStats.badges}
                      isJungleQuest={true}
                    />
                  </div>

                  {/* Info Panel */}
                  <div className="space-y-4">
                    <Card className="bg-white/20 backdrop-blur-md border border-white/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-jungle-dark">
                          <TreePine className="w-5 h-5" />
                          Jungle Adventure Features
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-jungle rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <h4 className="font-semibold text-jungle-dark">
                              Immersive Jungle Theme
                            </h4>
                            <p className="text-sm text-jungle-dark/70">
                              Beautiful jungle-themed UI with animated particles
                              and nature sounds
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-sunshine rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <h4 className="font-semibold text-jungle-dark">
                              Adventure Level System
                            </h4>
                            <p className="text-sm text-jungle-dark/70">
                              Earn XP and level up as you master new words!
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-coral-red rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <h4 className="font-semibold text-jungle-dark">
                              Mobile Optimized
                            </h4>
                            <p className="text-sm text-jungle-dark/70">
                              Perfect touch interactions and responsive design
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-playful-purple rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <h4 className="font-semibold text-jungle-dark">
                              Enhanced Accessibility
                            </h4>
                            <p className="text-sm text-jungle-dark/70">
                              Screen reader support, high contrast, and reduced
                              motion options
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-sunshine/20 to-bright-orange/20 backdrop-blur-md border border-yellow-400/30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-800">
                          <Crown className="w-5 h-5" />
                          Current Word Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-orange-700">
                              Difficulty
                            </p>
                            <Badge
                              className={`${
                                currentWord.difficulty === "easy"
                                  ? "bg-jungle"
                                  : currentWord.difficulty === "medium"
                                    ? "bg-sunshine"
                                    : "bg-coral-red"
                              } text-white`}
                            >
                              {currentWord.difficulty}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-orange-700">Category</p>
                            <Badge
                              variant="outline"
                              className="border-orange-400 text-orange-800"
                            >
                              {currentWord.category}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-orange-700">Mastery</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-orange-200 rounded-full h-2">
                                <div
                                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${currentWord.masteryLevel}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-orange-800">
                                {currentWord.masteryLevel}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-orange-700">Letters</p>
                            <span className="text-lg font-bold text-orange-800">
                              {currentWord.word.length}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                onClick={prevWord}
                className="bg-jungle hover:bg-jungle-dark text-white shadow-lg"
              >
                ← Previous
              </Button>

              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
                <span className="text-sm font-semibold text-jungle-dark">
                  {currentWordIndex + 1} of {jungleWords.length}
                </span>
              </div>

              <Button
                onClick={shuffleWord}
                className="bg-sunshine hover:bg-sunshine-dark text-white shadow-lg"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Random
              </Button>

              <Button
                onClick={nextWord}
                className="bg-jungle hover:bg-jungle-dark text-white shadow-lg"
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Overview Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-jungle-light via-green-50 to-emerald-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-jungle-dark via-green-600 to-emerald-700 bg-clip-text text-transparent mb-6">
            🌿 Jungle Adventure Word Cards
          </h1>
          <p className="text-xl md:text-2xl text-jungle-dark/80 mb-8 max-w-3xl mx-auto">
            Experience the most immersive and engaging word learning adventure!
            Perfectly optimized for both desktop and mobile devices.
          </p>

          <Button
            onClick={() => setShowDemo(true)}
            className="bg-gradient-to-r from-jungle to-jungle-dark hover:from-jungle-dark hover:to-jungle text-white text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Zap className="w-6 h-6 mr-2" />
            Explore the Jungle Demo! 🦋
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: TreePine,
              title: "Immersive Jungle Theme",
              description:
                "Beautiful jungle-themed design with animated particles, nature sounds, and magical effects",
              color: "from-jungle to-jungle-dark",
            },
            {
              icon: Crown,
              title: "Adventure Level System",
              description:
                "Earn XP, level up, and unlock explorer badges as you master new words",
              color: "from-sunshine to-bright-orange",
            },
            {
              icon: Smartphone,
              title: "Mobile Optimized",
              description:
                "Perfect touch interactions, responsive design, and mobile-first user experience",
              color: "from-sky to-sky-dark",
            },
            {
              icon: Volume2,
              title: "Enhanced Audio",
              description:
                "Jungle-themed sound effects, clear pronunciation, and immersive audio feedback",
              color: "from-playful-purple to-purple-600",
            },
            {
              icon: Star,
              title: "3D Flip Animation",
              description:
                "Smooth 3D card flipping with hardware acceleration and beautiful transitions",
              color: "from-coral-red to-red-600",
            },
            {
              icon: Heart,
              title: "Accessibility First",
              description:
                "Full screen reader support, high contrast modes, and reduced motion options",
              color: "from-pink-500 to-rose-600",
            },
          ].map((feature, index) => (
            <Card
              key={index}
              className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-jungle-dark mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-jungle-dark/70">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Preview Images */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30">
          <h2 className="text-3xl font-bold text-center text-jungle-dark mb-6">
            🎯 Perfect for Both Desktop & Mobile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-jungle/10 to-emerald-600/10 rounded-2xl p-6 mb-4 border border-jungle/20">
                <Monitor className="w-16 h-16 mx-auto mb-4 text-jungle" />
                <h3 className="text-xl font-bold text-jungle-dark mb-2">
                  Desktop Experience
                </h3>
                <p className="text-jungle-dark/70">
                  Large, beautiful cards with detailed information panels and
                  smooth hover effects
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-sunshine/10 to-orange-600/10 rounded-2xl p-6 mb-4 border border-sunshine/20">
                <Smartphone className="w-16 h-16 mx-auto mb-4 text-orange-600" />
                <h3 className="text-xl font-bold text-jungle-dark mb-2">
                  Mobile Experience
                </h3>
                <p className="text-jungle-dark/70">
                  Touch-optimized interface with haptic feedback and optimized
                  performance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
