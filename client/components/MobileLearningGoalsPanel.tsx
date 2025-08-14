import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CompactMobileSwitch } from "@/components/ui/compact-mobile-switch";
import { CompactMobileSlider } from "@/components/ui/compact-mobile-slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target,
  Calendar,
  TrendingUp,
  Award,
  BarChart3,
  CheckCircle,
  X,
  Save,
  Plus,
  Trophy,
  Zap,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Flame,
  Brain,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useMobileDevice,
  triggerHapticFeedback,
} from "@/hooks/use-mobile-device";

interface MobileGoalData {
  id: string;
  type: "daily" | "weekly" | "monthly";
  target: number;
  current: number;
  category?: string;
  isActive: boolean;
  streak: number;
  description: string;
}

interface MobileLearningGoalsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentProgress?: {
    wordsLearned: number;
    wordsRemembered: number;
    sessionCount: number;
    accuracy: number;
  };
  onGoalUpdate?: (goals: MobileGoalData[]) => void;
}

export const MobileLearningGoalsPanel: React.FC<MobileLearningGoalsPanelProps> = ({
  isOpen,
  onClose,
  currentProgress = { wordsLearned: 0, wordsRemembered: 0, sessionCount: 0, accuracy: 0 },
  onGoalUpdate,
}) => {
  const [goals, setGoals] = useState<MobileGoalData[]>([
    {
      id: "daily-words",
      type: "daily",
      target: 10,
      current: currentProgress.wordsLearned,
      category: "vocabulary",
      isActive: true,
      streak: 3,
      description: "Learn words daily",
    },
    {
      id: "weekly-accuracy",
      type: "weekly", 
      target: 85,
      current: currentProgress.accuracy,
      isActive: true,
      streak: 1,
      description: "Keep high accuracy",
    },
  ]);

  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const deviceInfo = useMobileDevice();

  // Update goals with current progress
  useEffect(() => {
    setGoals(prevGoals =>
      prevGoals.map(goal => {
        if (goal.id === "daily-words") {
          return { ...goal, current: currentProgress.wordsLearned };
        }
        if (goal.id === "weekly-accuracy") {
          return { ...goal, current: currentProgress.accuracy };
        }
        return goal;
      })
    );
  }, [currentProgress]);

  const handleSaveGoals = () => {
    localStorage.setItem("mobileLearningGoals", JSON.stringify(goals));
    if (onGoalUpdate) onGoalUpdate(goals);
    setHasUnsavedChanges(false);
    if (deviceInfo.hasHaptic) triggerHapticFeedback("heavy");
    onClose();
  };

  const toggleGoalActive = (id: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, isActive: !goal.isActive } : goal
    ));
    setHasUnsavedChanges(true);
    if (deviceInfo.hasHaptic) triggerHapticFeedback("medium");
  };

  const adjustGoalTarget = (id: string, newTarget: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, target: newTarget } : goal
    ));
    setHasUnsavedChanges(true);
  };

  const getGoalProgress = (goal: MobileGoalData) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case "daily": return Calendar;
      case "weekly": return Target;
      case "monthly": return TrendingUp;
      default: return Target;
    }
  };

  const getGoalEmoji = (type: string, progress: number) => {
    if (progress >= 100) return "🎉";
    if (progress >= 75) return "🚀";
    if (progress >= 50) return "💪";
    return "🌟";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50">
      <Card className="w-full max-w-sm mx-2 mb-2 max-h-[85vh] overflow-hidden animate-mobile-slide-in shadow-2xl rounded-t-3xl">
        {/* Compact Header */}
        <CardHeader className="pb-3 bg-gradient-to-r from-educational-blue to-educational-purple text-white rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <div>
                <h2 className="text-lg font-bold">Learning Goals</h2>
                <p className="text-xs opacity-90">Track your progress</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {hasUnsavedChanges && (
            <div className="mt-2 p-2 bg-yellow-500/20 rounded-lg border border-yellow-300/30">
              <p className="text-xs">⚠️ Tap Save to keep changes</p>
            </div>
          )}
        </CardHeader>

        <ScrollArea className="flex-1 max-h-[65vh]">
          <div className="p-4 space-y-3">
            {/* Today's Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-blue-800">Today's Progress</h3>
                  <Badge variant="outline" className="text-xs">
                    {goals.filter(g => g.isActive).length} goals
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {currentProgress.wordsLearned}
                    </div>
                    <div className="text-xs text-blue-600">Words</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {currentProgress.accuracy}%
                    </div>
                    <div className="text-xs text-green-600">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">
                      {Math.max(...goals.map(g => g.streak))}
                    </div>
                    <div className="text-xs text-orange-600">Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Goals */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-educational-blue" />
                Your Goals
              </h3>

              {goals.map((goal) => {
                const IconComponent = getGoalIcon(goal.type);
                const progress = getGoalProgress(goal);
                const emoji = getGoalEmoji(goal.type, progress);
                const isExpanded = expandedGoal === goal.id;

                return (
                  <Card
                    key={goal.id}
                    className={cn(
                      "transition-all duration-200",
                      goal.isActive ? "border-educational-blue/30 bg-blue-50/30" : "border-gray-200 bg-gray-50/30"
                    )}
                  >
                    <CardContent className="p-3">
                      {/* Goal Header */}
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          setExpandedGoal(isExpanded ? null : goal.id);
                          if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">{emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold capitalize truncate">
                                {goal.type} Goal
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {goal.current}/{goal.target}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 truncate">
                              {goal.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CompactMobileSwitch
                            checked={goal.isActive}
                            onCheckedChange={() => toggleGoalActive(goal.id)}
                          />
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>{Math.round(progress)}% complete</span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {goal.streak}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                          {/* Target Adjustment */}
                          <div>
                            <label className="text-xs font-medium text-gray-700 mb-1 block">
                              Target: {goal.target} {goal.type === "weekly-accuracy" ? "%" : "words"}
                            </label>
                            <CompactMobileSlider
                              value={[goal.target]}
                              onValueChange={(value) => {
                                adjustGoalTarget(goal.id, value[0]);
                                if (deviceInfo.hasHaptic) triggerHapticFeedback("light");
                              }}
                              max={goal.type === "weekly-accuracy" ? 100 : 50}
                              min={goal.type === "weekly-accuracy" ? 50 : 5}
                              step={goal.type === "weekly-accuracy" ? 5 : 1}
                              className="w-full"
                            />
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-center p-2 bg-green-50 rounded-lg">
                              <div className="text-sm font-bold text-green-600">
                                {goal.streak}
                              </div>
                              <div className="text-xs text-green-600">Current Streak</div>
                            </div>
                            <div className="text-center p-2 bg-purple-50 rounded-lg">
                              <div className="text-sm font-bold text-purple-600">
                                {Math.round(progress)}%
                              </div>
                              <div className="text-xs text-purple-600">Progress</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-3">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  Quick Tips
                </h4>
                <div className="space-y-2">
                  {currentProgress.accuracy < 80 && (
                    <div className="text-xs p-2 bg-white/60 rounded-lg">
                      💡 Focus on accuracy - take your time with each word
                    </div>
                  )}
                  {currentProgress.wordsLearned === 0 && (
                    <div className="text-xs p-2 bg-white/60 rounded-lg">
                      🌟 Start with just 5 words today - small steps count!
                    </div>
                  )}
                  {goals.find(g => g.id === "daily-words" && g.current >= g.target) && (
                    <div className="text-xs p-2 bg-white/60 rounded-lg">
                      🎉 Daily goal achieved! You're on fire!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Overview */}
            <Card>
              <CardContent className="p-3">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-educational-purple" />
                  This Week
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-sm font-bold text-blue-600">
                      {currentProgress.wordsLearned * 7} {/* Estimate weekly */}
                    </div>
                    <div className="text-xs text-gray-600">Words</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-600">
                      {currentProgress.sessionCount}
                    </div>
                    <div className="text-xs text-gray-600">Sessions</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-purple-600">
                      {Math.round((goals.filter(g => g.isActive && getGoalProgress(g) >= 100).length / goals.filter(g => g.isActive).length) * 100) || 0}%
                    </div>
                    <div className="text-xs text-gray-600">Goals Met</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Compact Action Bar */}
        <div className="border-t bg-slate-50 p-3 rounded-b-3xl">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setGoals([
                  {
                    id: "daily-words",
                    type: "daily",
                    target: 10,
                    current: 0,
                    category: "vocabulary",
                    isActive: true,
                    streak: 0,
                    description: "Learn words daily",
                  }
                ]);
                setHasUnsavedChanges(true);
              }}
              className="flex-1 h-10 text-xs"
            >
              <Target className="w-3 h-3 mr-1" />
              Reset
            </Button>
            <Button
              onClick={handleSaveGoals}
              className="flex-1 bg-educational-blue hover:bg-educational-blue/90 text-white h-10 text-xs"
            >
              <Save className="w-3 h-3 mr-1" />
              Save Goals
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
