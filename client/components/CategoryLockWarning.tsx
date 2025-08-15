import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Book,
  ArrowRight,
  RotateCcw,
  Clock,
  Target,
  Lock,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryLockWarningProps {
  isOpen: boolean;
  currentCategoryName: string;
  currentCategoryEmoji: string;
  wordsReviewed: number;
  totalWords: number;
  progressPercentage: number;
  onContinueCategory: () => void;
  onForceLeave: () => void;
  onCancel: () => void;
}

export const CategoryLockWarning: React.FC<CategoryLockWarningProps> = ({
  isOpen,
  currentCategoryName,
  currentCategoryEmoji,
  wordsReviewed,
  totalWords,
  progressPercentage,
  onContinueCategory,
  onForceLeave,
  onCancel,
}) => {
  if (!isOpen) return null;

  const remainingWords = totalWords - wordsReviewed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-auto bg-white shadow-2xl border-0 overflow-hidden">
        <CardHeader className="text-center pb-4 bg-gradient-to-br from-orange-50 to-red-50">
          {/* Warning Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg animate-gentle-bounce">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <CardTitle className="text-xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Category In Progress
          </CardTitle>

          <p className="text-sm text-slate-600 max-w-xs mx-auto">
            You're currently learning the <strong>{currentCategoryName}</strong> category. 
            Complete it to unlock other categories!
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Category Info */}
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="text-3xl mb-2">{currentCategoryEmoji}</div>
            <h3 className="text-lg font-semibold text-slate-700 capitalize mb-1">
              {currentCategoryName} Category
            </h3>
            <p className="text-sm text-slate-600">
              Keep going! You're doing great! 🌟
            </p>
          </div>

          {/* Progress Section */}
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="text-md font-semibold text-slate-700 mb-3">Your Progress</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {wordsReviewed}
                </div>
                <div className="text-xs text-green-700">Words Reviewed</div>
                <Book className="w-4 h-4 mx-auto mt-1 text-green-600" />
              </div>

              <div className="text-center p-3 bg-orange-100 rounded-lg">
                <div className="text-xl font-bold text-orange-600">
                  {remainingWords}
                </div>
                <div className="text-xs text-orange-700">Words Left</div>
                <Target className="w-4 h-4 mx-auto mt-1 text-orange-600" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Category Progress</span>
                <span className="text-sm font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </Progress>
              <div className="text-xs text-slate-500 text-center">
                {remainingWords === 0 
                  ? "Almost there! Just a few more to complete! 🎯"
                  : `${remainingWords} more word${remainingWords !== 1 ? 's' : ''} to go!`
                }
              </div>
            </div>
          </div>

          {/* Benefits of Continuing */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600" />
              Why finish this category?
            </h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Complete your learning journey for this topic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Unlock achievement rewards and badges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>Build a stronger foundation before moving on</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>See your completion celebration! 🎉</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onContinueCategory}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Continue {currentCategoryName} Category
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <Button
              onClick={onForceLeave}
              variant="outline"
              className="w-full h-10 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 font-medium rounded-xl transition-all duration-200"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Leave Anyway (Progress Saved)
            </Button>

            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-full h-8 text-slate-500 hover:text-slate-700 text-sm"
            >
              Cancel
            </Button>
          </div>

          {/* Encouraging Message */}
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm font-medium text-yellow-700">
              💪 You're closer than you think! Just {remainingWords} more word{remainingWords !== 1 ? 's' : ''} to victory!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
