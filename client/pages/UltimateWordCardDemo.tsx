import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UltimateJungleWordCard } from "@/components/UltimateJungleWordCard";
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  Target,
  BookOpen,
  Star,
  Crown,
  Heart,
  Zap,
} from "lucide-react";

export function UltimateWordCardDemo() {
  const [showDemo, setShowDemo] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);

  if (showDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4 relative overflow-hidden">
        {/* Back Button */}
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={() => setShowDemo(false)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 shadow-xl"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Demo Info
          </Button>
        </div>

        {/* Live Stats Display */}
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl">🏆</div>
                <div className="font-bold text-lg">{currentScore}</div>
                <div className="text-xs text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">🔥</div>
                <div className="font-bold text-lg">{currentStreak}</div>
                <div className="text-xs text-gray-600">Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ultimate Jungle Word Card */}
        <div className="pt-20">
          <UltimateJungleWordCard
            onScoreUpdate={setCurrentScore}
            onStreakUpdate={setCurrentStreak}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-jungle-light via-jungle to-jungle-dark p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🌟</div>
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Ultimate Jungle Word Card
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Experience the most advanced word learning system designed for young
            explorers! Multi-mode learning with speech synthesis, particle
            celebrations, and progressive gamification.
          </p>
        </div>

        {/* Feature Showcase Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Three Learning Modes */}
          <Card className="bg-white/90 backdrop-blur-md border-2 border-white/50 shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-jungle">
                <BookOpen className="w-6 h-6" />
                Three Learning Modes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500">📖 Learn</Badge>
                <span className="text-sm">Full exploration mode</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-500">🎯 Quiz</Badge>
                <span className="text-sm">Test your knowledge</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500">🧠 Memory</Badge>
                <span className="text-sm">Enhanced retention</span>
              </div>
            </CardContent>
          </Card>

          {/* Speech Synthesis */}
          <Card className="bg-white/90 backdrop-blur-md border-2 border-white/50 shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-jungle">
                <Zap className="w-6 h-6" />
                Smart Audio System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-700">
                • Advanced speech synthesis
              </div>
              <div className="text-sm text-gray-700">
                • Child-optimized voice settings
              </div>
              <div className="text-sm text-gray-700">
                • Contextual sound effects
              </div>
              <div className="text-sm text-gray-700">
                • Interactive audio feedback
              </div>
            </CardContent>
          </Card>

          {/* Rarity System */}
          <Card className="bg-white/90 backdrop-blur-md border-2 border-white/50 shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-jungle">
                <Crown className="w-6 h-6" />
                Rarity Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm">Common words</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm">Rare discoveries</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <span className="text-sm">Epic adventures</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm">Legendary finds</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                <span className="text-sm">Mythical wonders</span>
              </div>
            </CardContent>
          </Card>

          {/* Gamification */}
          <Card className="bg-white/90 backdrop-blur-md border-2 border-white/50 shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-jungle">
                <Trophy className="w-6 h-6" />
                Advanced Scoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-700">
                🎯 +5 points for word taps
              </div>
              <div className="text-sm text-gray-700">
                🎯 +10 points for quiz reveals
              </div>
              <div className="text-sm text-gray-700">
                ❤️ +15 points for favorites
              </div>
              <div className="text-sm text-gray-700">
                👑 +25 points for mastery
              </div>
            </CardContent>
          </Card>

          {/* Particle Effects */}
          <Card className="bg-white/90 backdrop-blur-md border-2 border-white/50 shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-jungle">
                <Sparkles className="w-6 h-6" />
                Celebration System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-700">
                ✨ Particle celebrations
              </div>
              <div className="text-sm text-gray-700">🎉 Achievement popups</div>
              <div className="text-sm text-gray-700">🌟 Visual feedback</div>
              <div className="text-sm text-gray-700">🎊 Reward animations</div>
            </CardContent>
          </Card>

          {/* Progress Tracking */}
          <Card className="bg-white/90 backdrop-blur-md border-2 border-white/50 shadow-2xl hover:scale-105 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-jungle">
                <Target className="w-6 h-6" />
                Progress Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-700">
                📊 Real-time score tracking
              </div>
              <div className="text-sm text-gray-700">🔥 Streak maintenance</div>
              <div className="text-sm text-gray-700">
                ❤️ Favorite collections
              </div>
              <div className="text-sm text-gray-700">
                👑 Mastery achievements
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vocabulary Preview */}
        <Card className="bg-white/90 backdrop-blur-md border-2 border-white/50 shadow-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-center text-jungle">
              🦁 Rich Vocabulary Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-4xl">🦁</div>
                <div className="font-bold">Lion</div>
                <Badge className="bg-yellow-400 text-yellow-900">
                  Legendary
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="text-4xl">🦋</div>
                <div className="font-bold">Butterfly</div>
                <Badge className="bg-blue-400 text-blue-900">Rare</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-4xl">🐉</div>
                <div className="font-bold">Dragon</div>
                <Badge className="bg-pink-400 text-pink-900">Mythical</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-4xl">🌈</div>
                <div className="font-bold">Rainbow</div>
                <Badge className="bg-blue-400 text-blue-900">Rare</Badge>
              </div>
              <div className="space-y-2">
                <div className="text-4xl">🏰</div>
                <div className="font-bold">Castle</div>
                <Badge className="bg-purple-400 text-purple-900">Epic</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Launch */}
        <div className="text-center">
          <Button
            onClick={() => setShowDemo(true)}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white text-xl font-bold px-12 py-6 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300"
            size="lg"
          >
            <Star className="w-6 h-6 mr-3" />
            Launch Ultimate Demo
            <Star className="w-6 h-6 ml-3" />
          </Button>
          <p className="text-white/80 mt-4 text-lg">
            Experience all features in full interactive mode!
          </p>
        </div>

        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 text-4xl animate-bounce">
            🦋
          </div>
          <div className="absolute top-20 right-20 text-3xl animate-pulse">
            ��
          </div>
          <div className="absolute bottom-20 left-20 text-5xl animate-float">
            🌳
          </div>
          <div className="absolute bottom-10 right-10 text-3xl animate-bounce delay-1000">
            ⭐
          </div>
          <div className="absolute top-1/2 left-1/4 text-4xl animate-spin-slow">
            ✨
          </div>
          <div className="absolute top-1/3 right-1/3 text-3xl animate-pulse delay-2000">
            🎈
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
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
        .animate-spin-slow {
          animation: spin 10s linear infinite;
        }
      `}</style>
    </div>
  );
}
