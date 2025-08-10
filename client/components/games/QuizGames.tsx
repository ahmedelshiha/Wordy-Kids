import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Play,
  Clock,
  Target,
  Trophy,
} from "lucide-react";
import { QuizGame } from "../QuizGame";
import { generateQuizQuestions } from "@/lib/gameGeneration";

interface QuizGamesProps {
  selectedCategory: string;
  onQuizComplete: (score: number, total: number) => void;
  onQuizExit: () => void;
}

export function QuizGames({ 
  selectedCategory, 
  onQuizComplete, 
  onQuizExit 
}: QuizGamesProps) {
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);

  const quizTypes = [
    {
      id: "quick",
      title: "Quick Quiz",
      description: "Perfect for beginners! Simple words and definitions.",
      icon: "🌱",
      difficulty: "Easy",
      questions: 5,
      timePerQuestion: "30s",
      color: "from-educational-green to-green-400",
      points: "50-100 pts"
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
      points: "100-200 pts"
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
      points: "200-400 pts"
    },
    {
      id: "picture",
      title: "Picture Quiz",
      description: "Visual learning! Match pictures with words.",
      icon: "📸",
      difficulty: "Medium",
      questions: 8,
      timePerQuestion: "35s",
      color: "from-educational-orange to-orange-400",
      points: "80-160 pts"
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
      points: "100-200 pts"
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
      points: "200-500 pts"
    }
  ];

  const handleQuizStart = (quizType: string) => {
    setActiveQuiz(quizType);
  };

  const handleQuizBack = () => {
    setActiveQuiz(null);
    onQuizExit();
  };

  if (activeQuiz) {
    const generateQuizQuestionsByType = (type: string) => {
      switch (type) {
        case "quick":
          return generateQuizQuestions(5, "easy", selectedCategory, "definition");
        case "standard":
          return generateQuizQuestions(10, undefined, selectedCategory, "definition");
        case "challenge":
          return generateQuizQuestions(15, "hard", selectedCategory, "definition");
        case "picture":
          return generateQuizQuestions(8, undefined, selectedCategory, "picture");
        case "spelling":
          return generateQuizQuestions(10, undefined, selectedCategory, "spelling");
        case "speed":
          return generateQuizQuestions(20, undefined, selectedCategory, "definition");
        default:
          return generateQuizQuestions(10, undefined, selectedCategory, "definition");
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
              <CardTitle className="text-lg text-white">
                {quiz.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-white/90 text-sm">
                {quiz.description}
              </p>

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

      {/* Recent Scores Section */}
      <Card className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-educational-orange" />
            Your Recent Quiz Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-semibold">Standard Quiz</div>
                  <div className="text-sm text-gray-600">Yesterday</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-educational-blue">8/10</div>
                <div className="text-sm text-gray-600">80%</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <div className="font-semibold">Quick Quiz</div>
                  <div className="text-sm text-gray-600">2 days ago</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-educational-green">5/5</div>
                <div className="text-sm text-gray-600">100%</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="font-semibold">Challenge Quiz</div>
                  <div className="text-sm text-gray-600">3 days ago</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-educational-purple">12/15</div>
                <div className="text-sm text-gray-600">80%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
