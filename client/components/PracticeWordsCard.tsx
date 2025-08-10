import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Star, 
  Zap, 
  Trophy, 
  Heart, 
  Sparkles,
  Play,
  Gamepad2,
  Timer,
  Award,
  BookOpen,
  Brain,
  Rocket,
  Crown
} from 'lucide-react';

interface PracticeWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  attempts: number;
  lastAccuracy: number;
}

interface PracticeWordsCardProps {
  practiceWords: PracticeWord[];
  onStartPractice: () => void;
  childName?: string;
}

export const PracticeWordsCard: React.FC<PracticeWordsCardProps> = ({
  practiceWords,
  onStartPractice,
  childName = "Champion"
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Rotate through different animations
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (practiceWords.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 shadow-xl">
        <CardContent className="p-6 text-center">
          <div className="text-8xl mb-4 animate-bounce">🏆</div>
          <div className="relative">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              🌟 Word Champion! 🌟
            </h3>
            <div className="absolute -top-2 -left-4 text-2xl animate-pulse">✨</div>
            <div className="absolute -top-1 -right-4 text-xl animate-bounce delay-300">⭐</div>
          </div>
          <p className="text-green-700 font-medium text-lg mb-4">
            Wow! You've mastered all your tricky words!
          </p>
          <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">You're ready for new challenges!</span>
              <Crown className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const easyWords = practiceWords.filter(w => w.difficulty === 'easy').length;
  const mediumWords = practiceWords.filter(w => w.difficulty === 'medium').length;
  const hardWords = practiceWords.filter(w => w.difficulty === 'hard').length;

  const getEncouragingMessage = () => {
    if (practiceWords.length <= 1) return "One word to conquer! You've got this! 💪";
    if (practiceWords.length <= 2) return "Just a couple words to master! Easy peasy! 🌟";
    if (practiceWords.length <= 3) return "Mini word quest ahead! Perfect for a quick win! ⚡";
    if (practiceWords.length <= 5) return "Fun practice adventure waiting! Let's level up! 🎮";
    if (practiceWords.length <= 8) return "Epic word challenge! Ready to become a word hero? 🎯";
    return "Mega word adventure! Time to show your word power! 🚀";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-300';
      case 'hard': return 'text-red-600 bg-red-50 border-red-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-300';
    }
  };

  const getEstimatedTime = () => {
    // Estimate 1-2 minutes per word
    const minutes = Math.ceil(practiceWords.length * 1.5);
    return `${minutes} min`;
  };

  return (
    <Card
      className={`bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 border-2 transition-all duration-300 cursor-pointer relative overflow-hidden ${
        isHovered
          ? 'border-orange-300 shadow-2xl md:scale-[1.02]'
          : 'border-orange-200 shadow-lg hover:shadow-xl'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onStartPractice}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`relative p-2 sm:p-3 rounded-full bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 transition-all duration-300 ${
              isHovered ? 'md:scale-110 shadow-lg' : 'shadow-md'
            }`}>
              <div className="relative">
                <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                {practiceWords.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-white text-orange-500 text-xs font-bold rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center animate-pulse border-2 border-orange-200">
                    {practiceWords.length}
                  </div>
                )}
                <div className="absolute -bottom-1 -left-1 text-xs animate-bounce">🎯</div>
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
                🎮 Practice Quest!
                <div className={`transition-transform duration-500 ${
                  animationPhase === 0 ? 'animate-bounce' :
                  animationPhase === 1 ? 'animate-pulse' : 'animate-spin'
                }`}>
                  {animationPhase === 0 ? '🎯' : animationPhase === 1 ? '⚡' : '🌟'}
                </div>
              </CardTitle>
              <p className="text-orange-700 font-semibold text-sm sm:text-base bg-orange-50 px-3 py-1 rounded-full inline-block mt-1">
                {getEncouragingMessage()}
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm sm:text-lg px-3 sm:px-4 py-2 self-start sm:self-auto shadow-lg animate-pulse">
            🚀 Ready to Play!
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preview words */}
        <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-purple-200 shadow-inner">
          <h4 className="font-bold text-purple-700 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 animate-pulse" />
            🎯 Your Challenge Words:
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {practiceWords.slice(0, 3).map((word, index) => (
              <div key={word.id} className={`flex items-center justify-between bg-gradient-to-r from-white to-purple-50 p-2 sm:p-3 rounded-lg border border-purple-100 transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${index === 0 ? 'ring-2 ring-purple-200' : ''}`}>
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="text-xl sm:text-2xl flex-shrink-0 animate-pulse">
                    {word.category === 'Science' ? '🔬' :
                     word.category === 'Transportation' ? '🚁' :
                     word.category === 'Space' ? '🌟' :
                     word.category === 'History' ? '🏺' :
                     word.category === 'Education' ? '📚' :
                     word.category === 'Animals' ? '🦁' :
                     word.category === 'Nature' ? '🌿' :
                     word.category === 'Geography' ? '🗺️' :
                     word.category === 'Music' ? '🎵' : '📖'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-gray-800 text-sm sm:text-base truncate block">{word.word}</span>
                    <div className="text-xs text-purple-600 truncate font-medium">{word.category}</div>
                    {word.lastAccuracy > 0 && (
                      <div className="text-xs text-gray-500">Last try: {word.lastAccuracy}%</div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant="outline"
                    className={`text-xs flex-shrink-0 font-semibold ${getDifficultyColor(word.difficulty)} border-2`}
                  >
                    {word.difficulty === 'easy' ? '🟢 Easy' : word.difficulty === 'medium' ? '🟡 Medium' : '🔴 Hard'}
                  </Badge>
                  {index === 0 && (
                    <div className="text-xs text-purple-600 font-bold animate-pulse">👆 First up!</div>
                  )}
                </div>
              </div>
            ))}
            {practiceWords.length > 3 && (
              <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                <div className="text-purple-600 font-bold text-sm sm:text-base mb-1">
                  🎊 + {practiceWords.length - 3} more amazing words!
                </div>
                <div className="text-xs text-purple-500">
                  Get ready for an epic word adventure! 🚀
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Practice session info */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-2 sm:p-3 rounded-xl text-center border border-blue-200 shadow-md hover:shadow-lg transition-shadow">
            <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1 animate-pulse" />
            <div className="text-sm sm:text-lg font-bold text-blue-600">{getEstimatedTime()}</div>
            <div className="text-xs text-blue-500 font-medium">⏰ Time to Play</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-2 sm:p-3 rounded-xl text-center border border-purple-200 shadow-md hover:shadow-lg transition-shadow">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mx-auto mb-1 animate-bounce" />
            <div className="text-sm sm:text-lg font-bold text-purple-600">{practiceWords.length}</div>
            <div className="text-xs text-purple-500 font-medium">🧠 Word Quest</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-2 sm:p-3 rounded-xl text-center border border-yellow-200 shadow-md hover:shadow-lg transition-shadow">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mx-auto mb-1 animate-spin" />
            <div className="text-sm sm:text-lg font-bold text-yellow-600">+{practiceWords.length * 15}</div>
            <div className="text-xs text-yellow-500 font-medium">🌟 Max Points</div>
          </div>
        </div>

        {/* Difficulty breakdown */}
        {(easyWords > 0 || mediumWords > 0 || hardWords > 0) && (
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-3 rounded-lg border border-purple-200">
            <h5 className="text-sm font-bold text-purple-600 mb-2 flex items-center gap-1">
              🎮 Challenge Levels:
            </h5>
            <div className="flex gap-2 flex-wrap">
              {easyWords > 0 && (
                <Badge className="bg-green-100 text-green-700 text-xs font-semibold">
                  {easyWords} Easy 🟢
                </Badge>
              )}
              {mediumWords > 0 && (
                <Badge className="bg-yellow-100 text-yellow-700 text-xs font-semibold">
                  {mediumWords} Medium 🟡
                </Badge>
              )}
              {hardWords > 0 && (
                <Badge className="bg-red-100 text-red-700 text-xs font-semibold">
                  {hardWords} Hard 🔴
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Call to action */}
        <div className="pt-2">
          <Button
            onClick={onStartPractice}
            className={`w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white text-base sm:text-lg py-4 sm:py-6 rounded-2xl shadow-xl transition-all duration-300 min-h-[60px] sm:min-h-[auto] relative overflow-hidden ${
              isHovered ? 'shadow-2xl md:scale-[1.05] animate-pulse' : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-2 sm:gap-3">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 animate-bounce" />
              <div className="text-center min-w-0">
                <div className="font-bold text-sm sm:text-base flex items-center gap-1">
                  🎮 Start Word Quest! 🌟
                </div>
                <div className="text-xs sm:text-sm opacity-90 font-medium">
                  Time to become a Word Hero! 🦸‍♂️
                </div>
              </div>
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 animate-pulse" />
            </div>
          </Button>
        </div>

        {/* Motivational footer */}
        <div className="text-center bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 p-3 sm:p-4 rounded-xl border border-purple-200">
          <p className="text-sm sm:text-base text-purple-700 font-semibold px-2">
            🌟 Hey {childName}! You're about to level up your word power! 🌟
          </p>
          <p className="text-xs sm:text-sm text-purple-600 mt-1">
            <span className="font-bold">Remember:</span> Every hero practices to become stronger! 💪✨
          </p>
        </div>
      </CardContent>

      {/* Floating motivation elements */}
      <div className="absolute top-2 right-2 opacity-60">
        <div className={`text-2xl transition-transform duration-1000 ${
          isHovered ? 'scale-150 rotate-12' : ''
        }`}>
          ✨
        </div>
      </div>
      <div className="absolute bottom-2 left-2 opacity-60">
        <div className={`text-xl transition-transform duration-1000 delay-300 ${
          isHovered ? 'scale-125 -rotate-12' : ''
        }`}>
          🎯
        </div>
      </div>
      <div className="absolute top-1/2 left-2 opacity-40">
        <div className={`text-lg transition-transform duration-1000 delay-500 ${
          isHovered ? 'scale-110 rotate-6' : ''
        }`}>
          🚀
        </div>
      </div>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 opacity-40">
        <div className={`text-sm transition-transform duration-1000 delay-700 ${
          isHovered ? 'scale-125 -rotate-6' : ''
        }`}>
          ⭐
        </div>
      </div>
    </Card>
  );
};
