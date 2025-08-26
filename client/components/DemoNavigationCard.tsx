import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Sparkles,
  Trophy,
  ArrowRight,
  Volume2,
  Heart,
  Crown,
  Target,
} from "lucide-react";

export const DemoNavigationCard: React.FC = () => {
  const handleOpenDemo = () => {
    window.open("/ultimate-word-card-demo", "_blank");
  };

  return (
    <Card className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 text-white border-2 border-white/30 shadow-2xl overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-4 left-4 text-2xl animate-bounce">✨</div>
        <div className="absolute top-6 right-6 text-xl animate-pulse">🌟</div>
        <div className="absolute bottom-4 left-6 text-2xl animate-bounce delay-1000">
          🎉
        </div>
        <div className="absolute bottom-6 right-4 text-xl animate-pulse delay-500">
          💫
        </div>
      </div>

      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-white/20 text-white border-white/30 font-bold">
            🚀 NEW DEMO
          </Badge>
          <div className="flex gap-1">
            <Star className="w-4 h-4 text-yellow-300 fill-current" />
            <Star className="w-4 h-4 text-yellow-300 fill-current" />
            <Star className="w-4 h-4 text-yellow-300 fill-current" />
          </div>
        </div>

        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <div className="text-3xl animate-bounce">🌟</div>
          Ultimate Word Card
        </CardTitle>

        <p className="text-white/90 text-lg">
          Experience the most advanced word learning system with AI-powered
          features!
        </p>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4">
        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Volume2 className="w-4 h-4 text-blue-300" />
            <span>Speech Synthesis</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Particle Effects</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-orange-300" />
            <span>Advanced Scoring</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-green-300" />
            <span>3 Learning Modes</span>
          </div>
        </div>

        {/* Learning Modes Preview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 space-y-2">
          <div className="text-sm font-bold text-center mb-2">
            Learning Modes:
          </div>
          <div className="flex justify-center gap-2">
            <Badge className="bg-blue-500/80 text-white">📖 Learn</Badge>
            <Badge className="bg-orange-500/80 text-white">🎯 Quiz</Badge>
            <Badge className="bg-purple-500/80 text-white">🧠 Memory</Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleOpenDemo}
            className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg py-6 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
            size="lg"
          >
            <Star className="w-5 h-5 mr-3" />
            Launch Ultimate Demo
            <ArrowRight className="w-5 h-5 ml-3" />
          </Button>

          <div className="text-center">
            <p className="text-white/80 text-sm">
              ✨ Interactive • 🎮 Gamified • 🧠 AI-Enhanced
            </p>
          </div>
        </div>

        {/* Feature Callouts */}
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
            <Heart className="w-3 h-3 text-red-300" />
            <span>Favorite & Master words with celebration effects</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
            <Crown className="w-3 h-3 text-yellow-300" />
            <span>Rarity system: Common to Mythical word discoveries</span>
          </div>
        </div>
      </CardContent>

      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-full animate-pulse"></div>
    </Card>
  );
};
