import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Gamepad2, Trophy, Zap, ArrowLeft } from "lucide-react";
import { AdventureGames } from "./AdventureGames";
import { QuizGames } from "./QuizGames";
import { FloatingHelpMenu } from "@/components/FloatingHelpMenu";

interface GameHubProps {
  selectedCategory: string;
  onGameComplete: (score: number, totalWords: number) => void;
  onQuizComplete: (score: number, total: number) => void;
  onMatchingComplete: (score: number, timeSpent: number) => void;
  onBack?: () => void;
  userProfile?: any;
}

export function GameHub({
  selectedCategory,
  onGameComplete,
  onQuizComplete,
  onMatchingComplete,
  onBack,
  userProfile,
}: GameHubProps) {
  const [activeSection, setActiveSection] = useState<
    "hub" | "games" | "quizzes"
  >("hub");

  const handleSectionChange = (section: "hub" | "games" | "quizzes") => {
    setActiveSection(section);
  };

  const handleQuizExit = () => {
    setActiveSection("hub");
  };

  if (activeSection === "games") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setActiveSection("hub")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game Hub
          </Button>
        </div>
        <AdventureGames
          selectedCategory={selectedCategory}
          onGameComplete={onGameComplete}
          onMatchingComplete={onMatchingComplete}
          userProfile={userProfile}
        />
      </div>
    );
  }

  if (activeSection === "quizzes") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setActiveSection("hub")}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game Hub
          </Button>
        </div>
        <QuizGames
          selectedCategory={selectedCategory}
          onQuizComplete={onQuizComplete}
          onQuizExit={handleQuizExit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Game Hub Header */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink p-6 rounded-full shadow-2xl">
            <Brain className="w-16 h-16 text-white" />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink bg-clip-text text-transparent mb-4">
          🎮 Quiz & Game Time! 🎯
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Choose your learning adventure! Games and quizzes side by side!
        </p>
      </div>

      {/* Side by Side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Adventure Games Section */}
        <Card
          className="bg-gradient-to-br from-green-50 to-blue-50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 border-educational-green/30"
          onClick={() => handleSectionChange("games")}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-educational-green to-educational-blue p-3 rounded-full">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <Badge className="bg-educational-green text-white">
                5 Games Available
              </Badge>
            </div>
            <CardTitle className="text-2xl text-educational-green">
              🎮 Adventure Games
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Interactive learning adventures with power-ups, achievements, and
              exciting challenges!
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🌱</div>
                <div className="text-sm font-semibold text-gray-700">
                  Word Garden
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🗺️</div>
                <div className="text-sm font-semibold text-gray-700">
                  Word Quest
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🧩</div>
                <div className="text-sm font-semibold text-gray-700">
                  Memory Match
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-sm font-semibold text-gray-700">
                  Speed Learning
                </div>
              </div>
            </div>

            <div className="bg-educational-green/20 rounded-lg p-3">
              <div className="text-sm font-semibold text-educational-green mb-1">
                🎁 Game Features:
              </div>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Power-ups and special abilities</li>
                <li>• Achievement badges and rewards</li>
                <li>• Adaptive difficulty levels</li>
                <li>• Multiplayer coming soon!</li>
              </ul>
            </div>

            <Button
              className="w-full bg-educational-green text-white hover:bg-educational-green/90"
              onClick={(e) => {
                e.stopPropagation();
                handleSectionChange("games");
              }}
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Enter Adventure Zone!
            </Button>
          </CardContent>
        </Card>

        {/* Quiz Games Section */}
        <Card
          className="bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 border-educational-purple/30"
          onClick={() => handleSectionChange("quizzes")}
        >
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-r from-educational-purple to-educational-pink p-3 rounded-full">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <Badge className="bg-educational-purple text-white">
                7 Quiz Types
              </Badge>
            </div>
            <CardTitle className="text-2xl text-educational-purple">
              🧠 Quiz Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Test your knowledge with structured quizzes from beginner to
              expert level!
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🌱</div>
                <div className="text-sm font-semibold text-gray-700">
                  Quick Quiz
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-sm font-semibold text-gray-700">
                  Standard
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-sm font-semibold text-gray-700">
                  Challenge
                </div>
              </div>
              <div className="bg-white/80 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">📸</div>
                <div className="text-sm font-semibold text-gray-700">
                  Picture Quiz
                </div>
              </div>
            </div>

            <div className="bg-educational-purple/20 rounded-lg p-3">
              <div className="text-sm font-semibold text-educational-purple mb-1">
                🎯 Quiz Features:
              </div>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Timed challenges with scoring</li>
                <li>• Multiple difficulty levels</li>
                <li>• Progress tracking & statistics</li>
                <li>• Spelling & pronunciation tests</li>
              </ul>
            </div>

            <Button
              className="w-full bg-educational-purple text-white hover:bg-educational-purple/90"
              onClick={(e) => {
                e.stopPropagation();
                handleSectionChange("quizzes");
              }}
            >
              <Brain className="w-4 h-4 mr-2" />
              Start Quiz Challenge!
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="bg-gradient-to-r from-educational-orange to-orange-400 text-white">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">127</div>
            <div className="text-sm opacity-90">Games Completed</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-educational-blue to-blue-400 text-white">
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">89%</div>
            <div className="text-sm opacity-90">Average Score</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-educational-green to-green-400 text-white">
          <CardContent className="p-6 text-center">
            <Brain className="w-8 h-8 mx-auto mb-2" />
            <div className="text-2xl font-bold">42</div>
            <div className="text-sm opacity-90">Words Learned Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Help Menu for Game Hub */}
      <FloatingHelpMenu
        currentPage="games"
        onHelpAction={(helpContent) => {
          // Use speech synthesis for game hub help
          if ("speechSynthesis" in window) {
            // Import sanitization helper to prevent "[object Object]" errors
            const { sanitizeTTSInput, logSpeechError } = require("@/lib/speechUtils");

            const message = `${helpContent.title}. ${helpContent.message.replace(/\n/g, ". ").replace(/•/g, "")}`;

            // Sanitize input to prevent errors
            const sanitizedMessage = sanitizeTTSInput(message);
            if (!sanitizedMessage) {
              logSpeechError("GameHub.onHelpAction", message, "Empty message after sanitization");
              return;
            }

            const utterance = new SpeechSynthesisUtterance(sanitizedMessage);
            utterance.rate = 0.8;
            utterance.pitch = 1.1;
            speechSynthesis.speak(utterance);
          }
        }}
      />
    </div>
  );
}
