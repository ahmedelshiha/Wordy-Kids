import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Sparkles,
  Star,
  Compass,
  Scroll,
  Puzzle,
  Crown,
  ArrowRight,
  Trophy,
  Target,
  Wand2,
} from "lucide-react";

interface LevelSelectionProps {
  onLevelSelect: (level: number, levelName: string) => void;
  onBack?: () => void;
}

const levels = [
  {
    id: 1,
    name: "Beginner",
    description:
      "Perfect for starting your word adventure! Learn basic vocabulary with fun activities.",
    icon: "🌱",
    color: "from-green-400 to-green-600",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  {
    id: 2,
    name: "Explorer",
    description:
      "Ready to discover new words! Explore different categories and build your vocabulary.",
    icon: "🔍",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    id: 3,
    name: "Story Builder",
    description:
      "Create amazing stories! Use advanced vocabulary to tell incredible tales.",
    icon: "📖",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
  },
  {
    id: 4,
    name: "Puzzle Pro",
    description:
      "Challenge yourself! Solve complex word puzzles and master tricky vocabulary.",
    icon: "🧩",
    color: "from-orange-400 to-orange-600",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
  },
  {
    id: 5,
    name: "Word Wizard",
    description:
      "Master of vocabulary! Tackle the most challenging words and become a true word wizard.",
    icon: "🧙‍♂️",
    color: "from-pink-400 to-pink-600",
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
  },
];

export function LevelSelection({ onLevelSelect, onBack }: LevelSelectionProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  const handleLevelClick = (level: (typeof levels)[0]) => {
    setSelectedLevel(level.id);
    setTimeout(() => {
      onLevelSelect(level.id, level.name);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Letters */}
        <div className="absolute top-20 left-16 text-6xl animate-bounce delay-0 opacity-20 font-bold text-educational-blue">
          A
        </div>
        <div className="absolute top-32 right-20 text-5xl animate-pulse delay-300 opacity-20 font-bold text-educational-purple">
          B
        </div>
        <div className="absolute bottom-32 left-20 text-6xl animate-bounce delay-600 opacity-20 font-bold text-educational-green">
          C
        </div>
        <div className="absolute bottom-20 right-16 text-5xl animate-pulse delay-900 opacity-20 font-bold text-educational-orange">
          D
        </div>
        <div
          className="absolute top-1/2 left-8 text-4xl animate-spin opacity-20 font-bold text-educational-pink"
          style={{ animationDuration: "6s" }}
        >
          E
        </div>
        <div className="absolute top-1/3 right-8 text-4xl animate-bounce delay-1200 opacity-20 font-bold text-educational-blue">
          F
        </div>

        {/* Stars and Sparkles */}
        <div className="absolute top-16 left-1/4 text-4xl animate-pulse delay-500">
          ⭐
        </div>
        <div className="absolute top-1/4 right-1/3 text-3xl animate-bounce delay-800">
          ✨
        </div>
        <div className="absolute bottom-1/4 left-1/3 text-4xl animate-pulse delay-1100">
          🌟
        </div>
        <div className="absolute bottom-16 right-1/4 text-3xl animate-bounce delay-1400">
          💫
        </div>

        {/* Confetti */}
        <div className="absolute top-24 left-1/2 text-2xl animate-float delay-0">
          🎉
        </div>
        <div className="absolute top-40 right-1/2 text-2xl animate-float delay-700">
          🎊
        </div>
        <div className="absolute bottom-40 left-1/2 text-2xl animate-float delay-1400">
          🎉
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Header Section with Illustration */}
        <div className="text-center mb-12">
          {/* Main Illustration */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink p-8 rounded-full shadow-2xl">
                <div className="relative">
                  <BookOpen className="w-24 h-24 text-white" />
                  {/* Floating letters around the book */}
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                    📚
                  </div>
                  <div className="absolute -bottom-2 -left-2 text-2xl animate-pulse">
                    ✨
                  </div>
                  <div className="absolute top-0 -left-4 text-xl animate-bounce delay-300">
                    🔤
                  </div>
                  <div className="absolute -top-4 right-0 text-xl animate-pulse delay-600">
                    📝
                  </div>
                </div>
              </div>

              {/* Decorative Banner */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-educational-yellow text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                  🎯 Choose Your Path
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Choose Your Starting Level
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 font-medium mb-8">
            We'll match your journey to the right adventures for your skills.
          </p>

          {/* Decorative Elements */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="w-16 h-1 bg-gradient-to-r from-educational-blue to-educational-purple rounded-full"></div>
            <Sparkles className="w-8 h-8 text-educational-purple animate-pulse" />
            <div className="w-16 h-1 bg-gradient-to-r from-educational-purple to-educational-pink rounded-full"></div>
          </div>
        </div>

        {/* Level Selection Buttons */}
        <div className="space-y-4 mb-8">
          {levels.map((level) => (
            <Card
              key={level.id}
              className={`cursor-pointer transition-all duration-300 border-2 shadow-lg hover:shadow-2xl ${
                selectedLevel === level.id
                  ? "scale-105 border-educational-blue shadow-2xl bg-gradient-to-r from-white to-blue-50"
                  : hoveredLevel === level.id
                    ? "scale-102 border-gray-200 shadow-xl"
                    : "border-gray-100 hover:border-gray-200"
              }`}
              onClick={() => handleLevelClick(level)}
              onMouseEnter={() => setHoveredLevel(level.id)}
              onMouseLeave={() => setHoveredLevel(null)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Level Number/Icon */}
                  <div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${level.color} flex items-center justify-center shadow-lg flex-shrink-0 ${
                      hoveredLevel === level.id ? "animate-bounce" : ""
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-1">{level.icon}</div>
                      <div className="text-white font-bold text-sm">
                        {level.id}
                      </div>
                    </div>
                  </div>

                  {/* Level Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-800">
                        Level {level.id} – {level.name}
                      </h3>
                      {selectedLevel === level.id && (
                        <div className="animate-bounce">
                          <Target className="w-6 h-6 text-educational-blue" />
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {level.description}
                    </p>
                  </div>

                  {/* Arrow Indicator */}
                  <div
                    className={`transition-all duration-300 ${
                      hoveredLevel === level.id || selectedLevel === level.id
                        ? "translate-x-0 opacity-100"
                        : "translate-x-4 opacity-0"
                    }`}
                  >
                    <ArrowRight className="w-8 h-8 text-educational-blue" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-educational-orange" />
            <span className="text-lg text-gray-600 font-medium">
              Don't worry - you can always change your level later!
            </span>
            <Trophy className="w-6 h-6 text-educational-orange" />
          </div>

          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              ← Go Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
