import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, TrendingUp, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickGoal {
  id: string;
  type: "daily" | "weekly" | "monthly";
  current: number;
  target: number;
  emoji: string;
}

interface QuickGoalsWidgetProps {
  currentProgress: {
    wordsLearned: number;
    wordsRemembered: number;
    sessionCount: number;
    accuracy: number;
  };
  className?: string;
  onExpandClick?: () => void;
}

export const QuickGoalsWidget: React.FC<QuickGoalsWidgetProps> = ({
  currentProgress,
  className,
  onExpandClick,
}) => {
  const goals: QuickGoal[] = [
    {
      id: "daily",
      type: "daily",
      current: currentProgress.wordsLearned,
      target: 10,
      emoji: "🎯",
    },
    {
      id: "accuracy",
      type: "weekly",
      current: currentProgress.accuracy,
      target: 85,
      emoji: "📊",
    },
  ];

  const getProgress = (goal: QuickGoal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "daily":
        return Calendar;
      case "weekly":
        return Target;
      case "monthly":
        return TrendingUp;
      default:
        return Target;
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {goals.map((goal) => {
        const progress = getProgress(goal);
        const IconComponent = getIcon(goal.type);
        const isCompleted = progress >= 100;

        return (
          <div
            key={goal.id}
            className={cn(
              "p-2 rounded-lg border transition-all duration-200",
              isCompleted
                ? "bg-green-50 border-green-200"
                : progress >= 75
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200",
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">{goal.emoji}</span>
                <IconComponent className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-medium capitalize text-gray-700">
                  {goal.type}
                </span>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs h-5",
                  isCompleted
                    ? "text-green-600 border-green-300"
                    : progress >= 75
                      ? "text-blue-600 border-blue-300"
                      : "text-gray-600 border-gray-300",
                )}
              >
                {goal.current}/{goal.target}
              </Badge>
            </div>
            <Progress value={progress} className="h-1.5 mb-1" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">
                {Math.round(progress)}% complete
              </span>
              {isCompleted && (
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">
                    Done!
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Quick Stats Row */}
      <div className="flex justify-between text-center bg-slate-50 rounded-lg p-2 mt-2">
        <div>
          <div className="text-xs font-bold text-blue-600">
            {currentProgress.wordsLearned}
          </div>
          <div className="text-xs text-gray-600">Words</div>
        </div>
        <div>
          <div className="text-xs font-bold text-green-600">
            {currentProgress.accuracy}%
          </div>
          <div className="text-xs text-gray-600">Accuracy</div>
        </div>
        <div>
          <div className="text-xs font-bold text-purple-600">
            {currentProgress.sessionCount}
          </div>
          <div className="text-xs text-gray-600">Sessions</div>
        </div>
      </div>

      {onExpandClick && (
        <button
          onClick={onExpandClick}
          className="w-full mt-2 p-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-blue-200 font-medium"
        >
          View All Goals →
        </button>
      )}
    </div>
  );
};
