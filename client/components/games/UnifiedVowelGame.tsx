import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Play,
  Clock,
  Star,
  Trophy,
  Zap,
  Crown,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import { VowelRescue } from "./VowelRescue";
import {
  getSystematicEasyVowelQuestions,
  getSystematicMediumVowelQuestions,
  getSystematicTimedVowelQuestions,
  VowelQuestion,
} from "@/lib/vowelQuizGeneration";

interface UnifiedVowelGameProps {
  onExit: () => void;
  onComplete: (score: number, total: number) => void;
  selectedCategory?: string;
  currentProfile?: any;
}

type DifficultyLevel = "easy" | "medium" | "timed";

interface DifficultyConfig {
  id: DifficultyLevel;
  title: string;
  description: string;
  emoji: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: React.ElementType;
  features: string[];
  rounds: number;
  timeLimit?: number;
}

const difficultyConfigs: DifficultyConfig[] = [
  {
    id: "easy",
    title: "Easy Explorer",
    description: "Perfect for beginners! One vowel at a time.",
    emoji: "🌟",
    color: "educational-green",
    bgColor: "bg-educational-green",
    textColor: "text-educational-green",
    icon: Star,
    features: [
      "1 missing vowel",
      "10 questions",
      "No time limit",
      "Visual hints",
    ],
    rounds: 10,
  },
  {
    id: "medium",
    title: "Challenge Master",
    description: "Ready for more? Multiple vowels to conquer!",
    emoji: "🎯",
    color: "educational-purple",
    bgColor: "bg-educational-purple",
    textColor: "text-educational-purple",
    icon: Target,
    features: [
      "1-2 missing vowels",
      "8 questions",
      "No time limit",
      "Extra points",
    ],
    rounds: 8,
  },
  {
    id: "timed",
    title: "Speed Champion",
    description: "Race against time! Quick thinking required.",
    emoji: "⚡",
    color: "educational-orange",
    bgColor: "bg-educational-orange",
    textColor: "text-educational-orange",
    icon: Timer,
    features: [
      "Mixed difficulty",
      "30 questions",
      "Time pressure",
      "Bonus points",
    ],
    rounds: 30,
    timeLimit: 60,
  },
];

export function UnifiedVowelGame({
  onExit,
  onComplete,
  selectedCategory,
  currentProfile,
}: UnifiedVowelGameProps) {
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyLevel | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameQuestions, setGameQuestions] = useState<VowelQuestion[]>([]);

  const generateQuestions = (difficulty: DifficultyLevel): VowelQuestion[] => {
    switch (difficulty) {
      case "easy":
        return getSystematicEasyVowelQuestions(
          10,
          selectedCategory,
          currentProfile,
        );
      case "medium":
        return getSystematicMediumVowelQuestions(
          8,
          selectedCategory,
          currentProfile,
        );
      case "timed":
        return getSystematicTimedVowelQuestions(
          selectedCategory,
          currentProfile,
        );
      default:
        return getSystematicEasyVowelQuestions(
          10,
          selectedCategory,
          currentProfile,
        );
    }
  };

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    setSelectedDifficulty(difficulty);
    const questions = generateQuestions(difficulty);
    setGameQuestions(questions);
    setIsPlaying(true);
  };

  const handleGameComplete = (score: number, total: number) => {
    setIsPlaying(false);
    setSelectedDifficulty(null);
    onComplete(score, total);
  };

  const handleGameExit = () => {
    setIsPlaying(false);
    setSelectedDifficulty(null);
  };

  if (isPlaying && selectedDifficulty && gameQuestions.length > 0) {
    return (
      <VowelRescue
        questions={gameQuestions}
        onComplete={handleGameComplete}
        onExit={handleGameExit}
        gameMode={
          selectedDifficulty === "easy"
            ? "easy"
            : selectedDifficulty === "medium"
              ? "challenge"
              : "timed"
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-educational-blue/10 via-educational-purple/10 to-educational-pink/10 p-2 md:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              onClick={onExit}
              size="sm"
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800 p-2"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
              🔤 Vowel Adventure!
            </h1>
            <p className="text-xs md:text-sm text-gray-600">
              Choose difficulty & start!
            </p>
          </div>
        </motion.div>

        {/* Difficulty Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4"
        >
          {difficultyConfigs.map((config, index) => {
            const IconComponent = config.icon;

            return (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 border border-${config.color}/30 h-full`}
                >
                  <CardHeader className="text-center pb-2 pt-3 px-3">
                    <div className="text-3xl mb-2">{config.emoji}</div>
                    <CardTitle
                      className={`text-base font-bold ${config.textColor} mb-1`}
                    >
                      {config.title}
                    </CardTitle>
                    <p className="text-xs text-gray-600 hidden sm:block">
                      {config.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0 px-3 pb-3">
                    {/* Compact Features */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Questions:</span>
                        <span className={`font-bold ${config.textColor}`}>
                          {config.rounds}
                        </span>
                      </div>
                      {config.timeLimit && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Time:</span>
                          <span
                            className={`font-bold ${config.textColor} flex items-center gap-1`}
                          >
                            <Timer className="w-3 h-3" />
                            {config.timeLimit}s
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Difficulty:</span>
                        <div className="flex gap-1">
                          {Array.from(
                            {
                              length:
                                config.id === "easy"
                                  ? 1
                                  : config.id === "medium"
                                    ? 2
                                    : 3,
                            },
                            (_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${config.bgColor}`}
                              />
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Play Button */}
                    <Button
                      onClick={() => handleDifficultySelect(config.id)}
                      className={`w-full ${config.bgColor} text-white hover:${config.bgColor}/90 py-2 text-sm font-semibold rounded-lg transition-all duration-200`}
                      size="sm"
                    >
                      <IconComponent className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Start </span>Play!
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Compact Game Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-educational-blue/20">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="flex items-center gap-2 text-educational-blue text-sm">
                <Sparkles className="w-4 h-4" />
                How to Play
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1 text-sm">
                    <Target className="w-3 h-3 text-educational-purple" />
                    Rules
                  </h4>
                  <ul className="space-y-1 text-xs text-gray-700">
                    <li className="flex items-start gap-1">
                      <span className="text-educational-green text-sm">•</span>
                      Fill missing vowels (A, E, I, O, U)
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-educational-green text-sm">•</span>
                      Use emoji clues to help
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-educational-green text-sm">•</span>
                      Complete all to win!
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1 text-sm">
                    <Crown className="w-3 h-3 text-educational-orange" />
                    Tips
                  </h4>
                  <ul className="space-y-1 text-xs text-gray-700">
                    <li className="flex items-start gap-1">
                      <span className="text-educational-orange text-sm">★</span>
                      Start with Easy mode
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-educational-orange text-sm">★</span>
                      Listen to word sounds
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-educational-orange text-sm">★</span>
                      Practice daily!
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Info (if selected) */}
        {selectedCategory && selectedCategory !== "all" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-3 text-center"
          >
            <div className="inline-flex items-center gap-1 bg-white rounded-full px-3 py-1 shadow-sm border border-educational-blue/20">
              <span className="text-xs font-medium text-gray-700">
                Playing:
              </span>
              <span className="text-xs font-bold text-educational-blue capitalize">
                {selectedCategory}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
