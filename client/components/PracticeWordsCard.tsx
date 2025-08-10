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
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-green-700 mb-2">
            All Words Mastered!
          </h3>
          <p className="text-green-600">
            Amazing work! You've learned all your tricky words!
          </p>
        </CardContent>
      </Card>
    );
  }

  const easyWords = practiceWords.filter(w => w.difficulty === 'easy').length;
  const mediumWords = practiceWords.filter(w => w.difficulty === 'medium').length;
  const hardWords = practiceWords.filter(w => w.difficulty === 'hard').length;

  const getEncouragingMessage = () => {
    if (practiceWords.length <= 2) return "Just a few words to master! 🌟";
    if (practiceWords.length <= 5) return "Quick practice session ahead! ⚡";
    if (practiceWords.length <= 8) return "Ready for a fun challenge? 🎯";
    return "Big adventure awaiting! 🚀";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEstimatedTime = () => {
    // Estimate 1-2 minutes per word
    const minutes = Math.ceil(practiceWords.length * 1.5);
    return `${minutes} min`;
  };

  return (
    <Card
      className={`bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 border-2 transition-all duration-300 cursor-pointer ${
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
            <div className={`relative p-2 sm:p-3 rounded-full bg-gradient-to-r from-orange-400 to-red-400 transition-transform duration-300 ${
              isHovered ? 'md:scale-110' : ''
            }`}>
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              <div className="absolute -top-1 -right-1 bg-white text-orange-500 text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center animate-pulse">
                {practiceWords.length}
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl font-bold text-orange-700 flex items-center gap-2">
                Practice Challenge!
                <div className={`transition-transform duration-500 ${
                  animationPhase === 0 ? 'animate-bounce' :
                  animationPhase === 1 ? 'animate-pulse' : 'animate-spin'
                }`}>
                  {animationPhase === 0 ? '🎯' : animationPhase === 1 ? '⚡' : '🌟'}
                </div>
              </CardTitle>
              <p className="text-orange-600 font-medium text-sm sm:text-base">
                {getEncouragingMessage()}
              </p>
            </div>
          </div>
          <Badge className="bg-orange-500 text-white text-sm sm:text-lg px-2 sm:px-3 py-1 self-start sm:self-auto">
            Ready!
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preview words */}
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            Words Waiting for You:
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {practiceWords.slice(0, 3).map((word, index) => (
              <div key={word.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {word.category === 'Science' ? '🔬' :
                     word.category === 'Transportation' ? '🚁' :
                     word.category === 'Space' ? '🌟' :
                     word.category === 'History' ? '🏺' :
                     word.category === 'Education' ? '📚' : '📖'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">{word.word}</span>
                    <div className="text-xs text-gray-500">{word.category}</div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getDifficultyColor(word.difficulty)}`}
                >
                  {word.difficulty}
                </Badge>
              </div>
            ))}
            {practiceWords.length > 3 && (
              <div className="text-center text-gray-500 text-sm py-2">
                ... and {practiceWords.length - 3} more words! 🎉
              </div>
            )}
          </div>
        </div>

        {/* Practice session info */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <Timer className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-600">{getEstimatedTime()}</div>
            <div className="text-xs text-blue-500">Estimated</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <Brain className="w-6 h-6 text-purple-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-purple-600">{practiceWords.length}</div>
            <div className="text-xs text-purple-500">Words</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-yellow-600">+{practiceWords.length * 15}</div>
            <div className="text-xs text-yellow-500">Max Points</div>
          </div>
        </div>

        {/* Difficulty breakdown */}
        {(easyWords > 0 || mediumWords > 0 || hardWords > 0) && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h5 className="text-sm font-semibold text-gray-600 mb-2">Challenge Level:</h5>
            <div className="flex gap-2 flex-wrap">
              {easyWords > 0 && (
                <Badge className="bg-green-100 text-green-700 text-xs">
                  {easyWords} Easy 🟢
                </Badge>
              )}
              {mediumWords > 0 && (
                <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                  {mediumWords} Medium 🟡
                </Badge>
              )}
              {hardWords > 0 && (
                <Badge className="bg-red-100 text-red-700 text-xs">
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
            className={`w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg py-6 rounded-xl shadow-lg transition-all duration-300 ${
              isHovered ? 'shadow-2xl scale-[1.02]' : ''
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <Gamepad2 className="w-6 h-6" />
              <div className="text-center">
                <div className="font-bold">Start Practice Adventure!</div>
                <div className="text-sm opacity-90">Let's master these words! 🚀</div>
              </div>
              <Play className="w-6 h-6" />
            </div>
          </Button>
        </div>

        {/* Motivational footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Hey {childName}! <span className="font-semibold text-orange-600">Practice makes perfect!</span> 💪✨
          </p>
        </div>
      </CardContent>

      {/* Floating motivation elements */}
      <div className="absolute top-2 right-2 opacity-50">
        <div className={`text-2xl transition-transform duration-1000 ${
          isHovered ? 'scale-150 rotate-12' : ''
        }`}>
          ✨
        </div>
      </div>
      <div className="absolute bottom-2 left-2 opacity-50">
        <div className={`text-xl transition-transform duration-1000 delay-300 ${
          isHovered ? 'scale-125 -rotate-12' : ''
        }`}>
          🎯
        </div>
      </div>
    </Card>
  );
};
