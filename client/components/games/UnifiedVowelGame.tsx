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
    <div className="min-h-screen bg-gradient-to-br from-educational-blue/10 via-educational-purple/10 to-educational-pink/10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Button
            variant="ghost"
            onClick={onExit}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Button>
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
              🔤 Vowel Adventure! 🔤
            </h1>
            <p className="text-sm md:text-lg text-gray-600">
              Choose your difficulty and start your vowel rescue mission!
            </p>
          </div>
          <div className="w-16" /> {/* Spacer */}
        </motion.div>

        {/* Difficulty Selection Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {difficultyConfigs.map((config, index) => {
            const IconComponent = config.icon;

            return (
              <motion.div
                key={config.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-${config.color}/30 h-full`}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="text-6xl mb-3 animate-bounce">
                      {config.emoji}
                    </div>
                    <CardTitle
                      className={`text-xl font-bold ${config.textColor} mb-2`}
                    >
                      {config.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {config.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {config.features.map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + featureIndex * 0.1 }}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${config.bgColor}`}
                          />
                          <span className="text-gray-700">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Game Stats */}
                    <div className={`${config.bgColor}/10 rounded-lg p-3 mb-4`}>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700">
                          Questions:
                        </span>
                        <span className={`font-bold ${config.textColor}`}>
                          {config.rounds}
                        </span>
                      </div>
                      {config.timeLimit && (
                        <div className="flex justify-between items-center text-sm mt-1">
                          <span className="font-medium text-gray-700">
                            Time Limit:
                          </span>
                          <span
                            className={`font-bold ${config.textColor} flex items-center gap-1`}
                          >
                            <Clock className="w-3 h-3" />
                            {config.timeLimit}s
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Play Button */}
                    <Button
                      onClick={() => handleDifficultySelect(config.id)}
                      className={`w-full ${config.bgColor} text-white hover:${config.bgColor}/90 py-3 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105`}
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      Start {config.title}!
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Game Rules & Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-educational-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-educational-blue">
                <Sparkles className="w-5 h-5" />
                How to Play Vowel Rescue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-educational-purple" />
                    Game Rules
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-educational-green">•</span>
                      Look at words with missing vowels (A, E, I, O, U)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-educational-green">•</span>
                      Tap the correct vowel buttons to fill blanks
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-educational-green">•</span>
                      Use the emoji clues to help guess the word
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-educational-green">•</span>
                      Complete all questions to win rewards!
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-educational-orange" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-educational-orange">★</span>
                      Start with Easy mode to learn the pattern
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-educational-orange">★</span>
                      Listen to word sounds for hints
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-educational-orange">★</span>
                      Pay attention to emoji clues
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-educational-orange">★</span>
                      Practice daily to improve your skills!
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
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-educational-blue/20">
              <span className="text-sm font-medium text-gray-700">
                Playing with:
              </span>
              <span className="text-sm font-bold text-educational-blue capitalize">
                {selectedCategory} Words
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
