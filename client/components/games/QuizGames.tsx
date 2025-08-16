import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Play, Clock, Target, Trophy } from "lucide-react";
import { QuizGame } from "../QuizGame";
import { generateQuizQuestions } from "@/lib/gameGeneration";
import { VowelRescue } from "./VowelRescue";
import ListenAndGuessGame from "./ListenAndGuessGame";
import PictureFunGame from "./PictureFunGame";
import { BalloonRescueVowelAdventure } from "./BalloonRescueVowelAdventure";
import {
  getSystematicEasyVowelQuestions,
  getSystematicMediumVowelQuestions,
  getSystematicTimedVowelQuestions,
} from "@/lib/vowelQuizGeneration";

interface QuizGamesProps {
  selectedCategory: string;
  onQuizComplete: (score: number, total: number) => void;
  onQuizExit: () => void;
}

export function QuizGames({
  selectedCategory,
  onQuizComplete,
  onQuizExit,
}: QuizGamesProps) {
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);

  const quizTypes = [
    {
      id: "listen-guess",
      title: "Listen & Guess",
      description:
        "Listen carefully and pick the right picture! Perfect for audio learners.",
      icon: "🎧",
      difficulty: "Easy",
      questions: 10,
      timePerQuestion: "No limit",
      color: "from-educational-pink to-pink-400",
      points: "50-100 pts",
    },
    {
      id: "quick",
      title: "Quick Quiz",
      description: "Perfect for beginners! Simple words and definitions.",
      icon: "🌱",
      difficulty: "Easy",
      questions: 5,
      timePerQuestion: "30s",
      color: "from-educational-green to-green-400",
      points: "50-100 pts",
    },
    {
      id: "standard",
      title: "Standard Quiz",
      description: "Medium difficulty with mixed vocabulary challenges.",
      icon: "🎯",
      difficulty: "Medium",
      questions: 10,
      timePerQuestion: "30s",
      color: "from-educational-blue to-blue-400",
      points: "100-200 pts",
    },
    {
      id: "challenge",
      title: "Challenge Quiz",
      description: "For advanced learners! Tricky words and concepts.",
      icon: "🏆",
      difficulty: "Hard",
      questions: 15,
      timePerQuestion: "25s",
      color: "from-educational-purple to-purple-400",
      points: "200-400 pts",
    },
    {
      id: "picture",
      title: "Picture Fun!",
      description: "Kid-friendly! See emoji pictures and pick the right word!",
      icon: "📸",
      difficulty: "Easy",
      questions: 8,
      timePerQuestion: "No limit",
      color: "from-educational-orange to-orange-400",
      points: "80-160 pts",
    },
    {
      id: "spelling",
      title: "Spelling Quiz",
      description: "Test your spelling skills with audio challenges.",
      icon: "✏️",
      difficulty: "Medium",
      questions: 10,
      timePerQuestion: "45s",
      color: "from-educational-pink to-pink-400",
      points: "100-200 pts",
    },
    {
      id: "speed",
      title: "Speed Quiz",
      description: "Quick-fire questions! How fast can you answer?",
      icon: "⚡",
      difficulty: "Hard",
      questions: 20,
      timePerQuestion: "15s",
      color: "from-educational-yellow to-yellow-400",
      points: "200-500 pts",
    },
    {
      id: "vowel-easy",
      title: "Vowel Rescue",
      description: "Help rescue missing vowels in fun words!",
      icon: "🎯",
      difficulty: "Easy",
      questions: 10,
      timePerQuestion: "No limit",
      color: "from-educational-green to-green-400",
      points: "50-100 pts",
    },
    {
      id: "vowel-challenge",
      title: "Vowel Challenge",
      description: "Advanced vowel rescue with multiple missing letters!",
      icon: "🎯",
      difficulty: "Medium",
      questions: 8,
      timePerQuestion: "No limit",
      color: "from-educational-purple to-purple-400",
      points: "80-160 pts",
    },
    {
      id: "vowel-timed",
      title: "Vowel Rush",
      description: "Race against time to rescue as many vowels as possible!",
      icon: "🎯",
      difficulty: "Hard",
      questions: "∞",
      timePerQuestion: "60s total",
      color: "from-educational-orange to-orange-400",
      points: "Variable",
    },
  ];

  const handleQuizStart = (quizType: string) => {
    setActiveQuiz(quizType);
  };

  const handleQuizBack = () => {
    setActiveQuiz(null);
    onQuizExit();
  };

  if (activeQuiz) {
    // Handle Listen & Guess game
    if (activeQuiz === "listen-guess") {
      return (
        <ListenAndGuessGame
          category={selectedCategory}
          difficulty="easy"
          rounds={10}
          optionsPerRound={3}
          playerLevel={1} // Could be dynamic based on user progress
          onFinish={(stats) => {
            onQuizComplete(stats.correct, stats.totalRounds);
          }}
          onExit={handleQuizBack}
        />
      );
    }

    // Handle Picture Fun game
    if (activeQuiz === "picture") {
      return (
        <PictureFunGame
          category={selectedCategory}
          difficulty="easy"
          rounds={8}
          optionsPerRound={4}
          onFinish={(stats) => {
            onQuizComplete(stats.correct, stats.totalRounds);
          }}
          onExit={handleQuizBack}
        />
      );
    }

    // Handle Vowel Rescue games
    if (activeQuiz.startsWith("vowel-")) {
      let vowelQuestions;
      let gameMode: "easy" | "challenge" | "timed" = "easy";

      switch (activeQuiz) {
        case "vowel-easy":
          vowelQuestions = getSystematicEasyVowelQuestions(
            10,
            selectedCategory,
          );
          gameMode = "easy";
          break;
        case "vowel-challenge":
          vowelQuestions = getSystematicMediumVowelQuestions(
            8,
            selectedCategory,
          );
          gameMode = "challenge";
          break;
        case "vowel-timed":
          vowelQuestions = getSystematicTimedVowelQuestions(selectedCategory);
          gameMode = "timed";
          break;
        default:
          vowelQuestions = getSystematicEasyVowelQuestions(
            10,
            selectedCategory,
          );
          gameMode = "easy";
      }

      return (
        <VowelRescue
          questions={vowelQuestions}
          onComplete={onQuizComplete}
          onExit={handleQuizBack}
          gameMode={gameMode}
        />
      );
    }

    // Handle regular quiz games
    const generateQuizQuestionsByType = (type: string) => {
      switch (type) {
        case "quick":
          return generateQuizQuestions(
            5,
            "easy",
            selectedCategory,
            "definition",
          );
        case "standard":
          return generateQuizQuestions(
            10,
            undefined,
            selectedCategory,
            "definition",
          );
        case "challenge":
          return generateQuizQuestions(
            15,
            "hard",
            selectedCategory,
            "definition",
          );
        case "picture":
          return generateQuizQuestions(
            8,
            undefined,
            selectedCategory,
            "picture",
          );
        case "spelling":
          return generateQuizQuestions(
            10,
            undefined,
            selectedCategory,
            "spelling",
          );
        case "speed":
          return generateQuizQuestions(
            20,
            undefined,
            selectedCategory,
            "definition",
          );
        default:
          return generateQuizQuestions(
            10,
            undefined,
            selectedCategory,
            "definition",
          );
      }
    };

    return (
      <QuizGame
        questions={generateQuizQuestionsByType(activeQuiz)}
        onComplete={onQuizComplete}
        onExit={handleQuizBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Games Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink bg-clip-text text-transparent mb-2">
          🧠 Quiz Challenge Zone! 🎓
        </h2>
        <p className="text-gray-600 mb-6">
          Test your vocabulary knowledge with fun quiz challenges!
        </p>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizTypes.map((quiz, index) => (
          <Card
            key={quiz.id}
            className={`hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-solid cursor-pointer bg-gradient-to-br ${quiz.color} text-white`}
            onClick={() => handleQuizStart(quiz.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-4xl">{quiz.icon}</div>
                <Badge className="bg-white/20 text-white border-white/20 text-xs">
                  {quiz.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg text-white">{quiz.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-white/90 text-sm">{quiz.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="font-semibold">{quiz.questions}</div>
                  <div className="text-white/80">Questions</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <div className="font-semibold">{quiz.timePerQuestion}</div>
                  <div className="text-white/80">Each</div>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-2 text-center">
                <div className="text-xs font-semibold text-white/90 mb-1">
                  🎯 Potential Points
                </div>
                <div className="text-sm font-bold text-white">
                  {quiz.points}
                </div>
              </div>

              <Button
                className="w-full bg-white/20 text-white hover:bg-white/30 border-white/20"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuizStart(quiz.id);
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Quiz!
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Scores Section - Hidden */}
      <Card className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10 hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-educational-orange" />
            Your Recent Quiz Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quizTypes
              .filter((quiz) => quiz.id === "picture")
              .map((quiz, index) => {
                const scoreData = {
                  score: "6/8",
                  percentage: "75%",
                  timeAgo: "Yesterday",
                  color: "text-educational-orange",
                };

                return (
                  <div
                    key={quiz.id}
                    className="flex justify-between items-center p-3 bg-white rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{quiz.icon}</span>
                      <div>
                        <div className="font-semibold">{quiz.title}</div>
                        <div className="text-sm text-gray-600">
                          {scoreData.timeAgo}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${scoreData.color}`}>
                        {scoreData.score}
                      </div>
                      <div className="text-sm text-gray-600">
                        {scoreData.percentage}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
