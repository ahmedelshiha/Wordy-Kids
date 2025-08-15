import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  Sparkles,
  RotateCcw,
  Home,
  CheckCircle,
  Target,
  Timer,
  Zap,
  Crown,
  Heart,
  Book,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryCompletionStats {
  wordsReviewed: number;
  totalWords: number;
  accuracy: number;
  timeSpent: number;
  isCompleted: boolean;
  completionDate?: Date;
}

interface CategoryCompletionPopupProps {
  isOpen: boolean;
  categoryName: string;
  categoryEmoji: string;
  stats: CategoryCompletionStats;
  completionCount: number;
  onPlayAgain: () => void;
  onGoToLibrary: () => void;
  onClose: () => void;
  showConfetti?: boolean;
}

export const CategoryCompletionPopup: React.FC<CategoryCompletionPopupProps> = ({
  isOpen,
  categoryName,
  categoryEmoji,
  stats,
  completionCount,
  onPlayAgain,
  onGoToLibrary,
  onClose,
  showConfetti = true,
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShowCelebration(true);
      
      // Haptic feedback for completion
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }

      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getAccuracyGrade = (accuracy: number) => {
    if (accuracy >= 95) return { grade: "A+", color: "text-green-600", emoji: "🌟" };
    if (accuracy >= 90) return { grade: "A", color: "text-green-600", emoji: "⭐" };
    if (accuracy >= 85) return { grade: "B+", color: "text-blue-600", emoji: "👍" };
    if (accuracy >= 80) return { grade: "B", color: "text-blue-600", emoji: "👌" };
    if (accuracy >= 75) return { grade: "C+", color: "text-orange-600", emoji: "🎯" };
    return { grade: "C", color: "text-orange-600", emoji: "💪" };
  };

  const getCompletionMessage = () => {
    if (completionCount === 1) {
      if (stats.accuracy >= 90) {
        return "Fantastic! You mastered this category on your first try! 🌟";
      } else if (stats.accuracy >= 75) {
        return "Great job completing this category! 🎉";
      } else {
        return "Well done! You finished the category! 👏";
      }
    } else {
      return `Amazing! You've completed this category ${completionCount} times! You're becoming an expert! 🏆`;
    }
  };

  const accuracyInfo = getAccuracyGrade(stats.accuracy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-white to-blue-50 shadow-2xl border-0 overflow-hidden">
        {/* Confetti Background */}
        {showCelebration && showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              >
                <span className="text-2xl">
                  {["🎉", "🎊", "⭐", "🌟", "✨", "🏆", "🎁", "🌈"][Math.floor(Math.random() * 8)]}
                </span>
              </div>
            ))}
          </div>
        )}

        <CardHeader className="text-center pb-4 relative">
          {/* Main celebration icon */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg animate-gentle-bounce">
            <div className="text-4xl relative">
              {showCelebration ? (
                <Crown className="w-10 h-10 text-white animate-sparkle" />
              ) : (
                <span>{categoryEmoji}</span>
              )}
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Category Completed!
          </CardTitle>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-slate-700 capitalize">
              {categoryName} Category
            </h3>
            <p className="text-sm text-slate-600 max-w-xs mx-auto">
              {getCompletionMessage()}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {stats.wordsReviewed}
              </div>
              <div className="text-xs text-blue-700">Words Reviewed</div>
              <Book className="w-4 h-4 mx-auto mt-1 text-blue-600" />
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
              <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                {Math.round(stats.accuracy)}%
                <span className="text-lg">{accuracyInfo.emoji}</span>
              </div>
              <div className="text-xs text-green-700">Accuracy</div>
              <Target className="w-4 h-4 mx-auto mt-1 text-green-600" />
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Time Spent</span>
              </div>
              <span className="text-sm font-bold text-purple-600">
                {Math.round(stats.timeSpent)} min
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Grade</span>
              </div>
              <Badge className={cn("text-white", accuracyInfo.color.replace('text', 'bg'))}>
                {accuracyInfo.grade}
              </Badge>
            </div>

            {completionCount > 1 && (
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-yellow-300">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Times Completed</span>
                </div>
                <span className="text-sm font-bold text-yellow-600">
                  {completionCount}x
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Category Progress</span>
              <span className="text-sm font-bold text-green-600">100% Complete!</span>
            </div>
            <Progress value={100} className="h-3 bg-green-100">
              <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse" />
            </Progress>
          </div>

          {/* Achievement Badges */}
          <div className="flex justify-center gap-2">
            {stats.accuracy >= 90 && (
              <Badge className="bg-yellow-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                High Scorer
              </Badge>
            )}
            {stats.timeSpent < 10 && (
              <Badge className="bg-blue-500 text-white">
                <Zap className="w-3 h-3 mr-1" />
                Speed Learner
              </Badge>
            )}
            {completionCount >= 3 && (
              <Badge className="bg-purple-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Category Master
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <div className="text-center text-sm font-medium text-slate-700 mb-3">
              What would you like to do next?
            </div>

            <Button
              onClick={onPlayAgain}
              className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Review Category Again
            </Button>

            <Button
              onClick={onGoToLibrary}
              variant="outline"
              className="w-full h-12 border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Word Library
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full h-10 text-slate-500 hover:text-slate-700 text-sm"
            >
              Close
            </Button>
          </div>

          {/* Motivational Message */}
          <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-200">
            <Sparkles className="w-5 h-5 mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-medium text-purple-700">
              {stats.accuracy >= 90 
                ? "Excellent work! You're ready for the next challenge! 🚀"
                : "Great progress! Keep practicing to improve your score! 💪"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
