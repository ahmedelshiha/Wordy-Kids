import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CompactMobileSwitch } from "@/components/ui/compact-mobile-switch";
import { CompactMobileSlider } from "@/components/ui/compact-mobile-slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Target,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Star,
  Trophy,
  Zap,
  ChevronRight,
  X,
  Save,
  Plus,
  Edit3,
  RefreshCw,
  Brain,
  Heart,
  Timer,
  BookOpen,
  Lightbulb,
  PlayCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useMobileDevice,
  triggerHapticFeedback,
} from "@/hooks/use-mobile-device";

interface GoalData {
  id: string;
  type: "daily" | "weekly" | "monthly";
  target: number;
  current: number;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  isActive: boolean;
  streak: number;
  bestStreak: number;
  startDate: string;
  endDate?: string;
  description: string;
}

interface LearningPreferences {
  autoAdjustGoals: boolean;
  adaptiveDifficulty: boolean;
  preferredCategories: string[];
  focusAreas: string[];
  reminderTimes: string[];
  motivationStyle: "encouraging" | "challenging" | "balanced";
}

interface ProgressAnalytics {
  weeklyAverage: number;
  monthlyAverage: number;
  accuracyTrend: number[];
  categoryProgress: Record<string, number>;
  peakLearningTimes: string[];
  goalCompletionRate: number;
}

interface EnhancedLearningGoalsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentProgress?: {
    wordsLearned: number;
    wordsRemembered: number;
    sessionCount: number;
    accuracy: number;
  };
  onGoalUpdate?: (goals: GoalData[]) => void;
  onPreferencesUpdate?: (preferences: LearningPreferences) => void;
}

export const EnhancedLearningGoalsPanel: React.FC<
  EnhancedLearningGoalsPanelProps
> = ({
  isOpen,
  onClose,
  currentProgress = { wordsLearned: 0, wordsRemembered: 0, sessionCount: 0, accuracy: 0 },
  onGoalUpdate,
  onPreferencesUpdate,
}) => {
  // Goals state
  const [goals, setGoals] = useState<GoalData[]>([
    {
      id: "daily-words",
      type: "daily",
      target: 10,
      current: currentProgress.wordsLearned,
      category: "all",
      difficulty: "medium",
      isActive: true,
      streak: 3,
      bestStreak: 7,
      startDate: new Date().toISOString(),
      description: "Learn new words every day",
    },
    {
      id: "weekly-accuracy",
      type: "weekly",
      target: 85,
      current: currentProgress.accuracy,
      isActive: true,
      streak: 1,
      bestStreak: 4,
      startDate: new Date().toISOString(),
      description: "Maintain high accuracy in learning",
    },
  ]);

  // Learning preferences
  const [preferences, setPreferences] = useState<LearningPreferences>({
    autoAdjustGoals: true,
    adaptiveDifficulty: true,
    preferredCategories: ["animals", "food", "colors"],
    focusAreas: ["vocabulary", "pronunciation"],
    reminderTimes: ["09:00", "18:00"],
    motivationStyle: "encouraging",
  });

  // Analytics state
  const [analytics, setAnalytics] = useState<ProgressAnalytics>({
    weeklyAverage: 8.5,
    monthlyAverage: 42,
    accuracyTrend: [85, 88, 92, 89, 91, 94, 87],
    categoryProgress: {
      animals: 75,
      food: 60,
      colors: 90,
      numbers: 45,
    },
    peakLearningTimes: ["09:00", "18:00"],
    goalCompletionRate: 78,
  });

  // UI state
  const [activeTab, setActiveTab] = useState("goals");
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  const deviceInfo = useMobileDevice();

  // Load saved goals and preferences
  useEffect(() => {
    const savedGoals = localStorage.getItem("learningGoals");
    const savedPreferences = localStorage.getItem("learningPreferences");

    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (error) {
        console.error("Error loading saved goals:", error);
      }
    }

    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error("Error loading saved preferences:", error);
      }
    }
  }, [isOpen]);

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
    localStorage.setItem("learningGoals", JSON.stringify(goals));
    localStorage.setItem("learningPreferences", JSON.stringify(preferences));
    
    if (onGoalUpdate) onGoalUpdate(goals);
    if (onPreferencesUpdate) onPreferencesUpdate(preferences);
    
    setHasUnsavedChanges(false);
    if (deviceInfo.hasHaptic) triggerHapticFeedback("heavy");
    onClose();
  };

  const updateGoal = (id: string, updates: Partial<GoalData>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
    setHasUnsavedChanges(true);
  };

  const toggleGoalActive = (id: string) => {
    updateGoal(id, { isActive: !goals.find(g => g.id === id)?.isActive });
    if (deviceInfo.hasHaptic) triggerHapticFeedback("medium");
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case "daily": return Calendar;
      case "weekly": return Target;
      case "monthly": return TrendingUp;
      default: return Target;
    }
  };

  const getGoalProgress = (goal: GoalData) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };

  const getGoalStatus = (goal: GoalData) => {
    const progress = getGoalProgress(goal);
    if (progress >= 100) return { status: "completed", color: "text-green-600", bg: "bg-green-50" };
    if (progress >= 75) return { status: "on-track", color: "text-blue-600", bg: "bg-blue-50" };
    if (progress >= 50) return { status: "behind", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { status: "far-behind", color: "text-red-600", bg: "bg-red-50" };
  };

  const categories = [
    { id: "animals", name: "Animals", emoji: "🐾", progress: analytics.categoryProgress.animals },
    { id: "food", name: "Food", emoji: "🍎", progress: analytics.categoryProgress.food },
    { id: "colors", name: "Colors", emoji: "🌈", progress: analytics.categoryProgress.colors },
    { id: "numbers", name: "Numbers", emoji: "🔢", progress: analytics.categoryProgress.numbers },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <Card className="w-full max-w-4xl max-h-[95vh] overflow-hidden animate-mobile-slide-in shadow-2xl">
        <CardHeader className="pb-4 bg-gradient-to-r from-educational-blue to-educational-purple text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Learning Goals & Progress</h2>
                <p className="text-sm opacity-90">
                  Track your learning journey and set personalized goals
                </p>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-xl"
              aria-label="Close goals panel"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {hasUnsavedChanges && (
            <div className="mt-3 p-2 bg-yellow-500/20 rounded-lg border border-yellow-300/30">
              <p className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                You have unsaved changes to your goals
              </p>
            </div>
          )}
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 h-[60vh]">
            <div className="p-4 space-y-6">
              {/* Goals Tab */}
              <TabsContent value="goals" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-educational-blue" />
                    Active Learning Goals
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateGoal(true)}
                    className="bg-educational-blue hover:bg-educational-blue/90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Goal
                  </Button>
                </div>

                {/* Current Goals */}
                <div className="space-y-3">
                  {goals.map((goal) => {
                    const IconComponent = getGoalIcon(goal.type);
                    const progress = getGoalProgress(goal);
                    const status = getGoalStatus(goal);

                    return (
                      <Card
                        key={goal.id}
                        className={cn(
                          "transition-all duration-200",
                          goal.isActive
                            ? "border-educational-blue/30 bg-blue-50/50"
                            : "border-gray-200 bg-gray-50/50"
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-xl",
                                goal.isActive ? "bg-educational-blue/10" : "bg-gray-100"
                              )}>
                                <IconComponent className={cn(
                                  "w-5 h-5",
                                  goal.isActive ? "text-educational-blue" : "text-gray-500"
                                )} />
                              </div>
                              <div>
                                <h4 className="font-semibold capitalize">
                                  {goal.type} Goal
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {goal.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={cn(status.bg, status.color, "text-xs")}>
                                {status.status.replace("-", " ")}
                              </Badge>
                              <CompactMobileSwitch
                                checked={goal.isActive}
                                onCheckedChange={() => toggleGoalActive(goal.id)}
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            {/* Progress Bar */}
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span className="font-medium">
                                  {goal.current}/{goal.target} {goal.type === "weekly-accuracy" ? "%" : "words"}
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>

                            {/* Goal Details */}
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-lg font-bold text-orange-600">
                                  {goal.streak}
                                </div>
                                <div className="text-xs text-gray-600">Current Streak</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-green-600">
                                  {goal.bestStreak}
                                </div>
                                <div className="text-xs text-gray-600">Best Streak</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-purple-600">
                                  {Math.round(progress)}%
                                </div>
                                <div className="text-xs text-gray-600">Complete</div>
                              </div>
                            </div>

                            {/* Goal Actions */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingGoal(goal.id)}
                                className="flex-1"
                              >
                                <Edit3 className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              {progress >= 100 && (
                                <Button
                                  size="sm"
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <Trophy className="w-3 h-3 mr-1" />
                                  Completed!
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Quick Goal Suggestions */}
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-purple-600" />
                      Suggested Goals
                    </h4>
                    <div className="grid gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start h-auto p-2"
                        onClick={() => {
                          const newGoal: GoalData = {
                            id: `weekly-${Date.now()}`,
                            type: "weekly",
                            target: 50,
                            current: 0,
                            category: "all",
                            isActive: true,
                            streak: 0,
                            bestStreak: 0,
                            startDate: new Date().toISOString(),
                            description: "Learn 50 words this week",
                          };
                          setGoals(prev => [...prev, newGoal]);
                          setHasUnsavedChanges(true);
                        }}
                      >
                        <div className="text-left">
                          <div className="font-medium">Weekly Challenge</div>
                          <div className="text-xs text-gray-600">Learn 50 words this week</div>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Progress Tab */}
              <TabsContent value="progress" className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-educational-green" />
                  Learning Progress
                </h3>

                {/* Daily Summary */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Today's Progress</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {currentProgress.wordsLearned}
                        </div>
                        <div className="text-sm text-gray-600">Words Learned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {currentProgress.accuracy}%
                        </div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Progress */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Category Progress</h4>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center gap-3">
                          <span className="text-xl">{category.emoji}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{category.name}</span>
                              <span>{category.progress}%</span>
                            </div>
                            <Progress value={category.progress} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Overview */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">This Week</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-educational-blue">
                          {analytics.weeklyAverage}
                        </div>
                        <div className="text-xs text-gray-600">Avg Words/Day</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-educational-orange">
                          {Math.round(analytics.goalCompletionRate)}%
                        </div>
                        <div className="text-xs text-gray-600">Goal Completion</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-educational-green">
                          {currentProgress.sessionCount}
                        </div>
                        <div className="text-xs text-gray-600">Sessions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-educational-purple" />
                  Learning Analytics
                </h3>

                {/* Performance Insights */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Performance Insights</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Accuracy Improving</span>
                        </div>
                        <span className="text-xs text-green-600">+5% this week</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Peak Learning Time</span>
                        </div>
                        <span className="text-xs text-blue-600">9:00 AM - 10:00 AM</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">Favorite Category</span>
                        </div>
                        <span className="text-xs text-purple-600">Colors (90% mastery)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-orange-600" />
                      Smart Recommendations
                    </h4>
                    <div className="space-y-2">
                      <div className="p-2 bg-white/60 rounded-lg">
                        <p className="text-sm">Focus on <strong>Numbers</strong> category - only 45% mastery</p>
                      </div>
                      <div className="p-2 bg-white/60 rounded-lg">
                        <p className="text-sm">Consider increasing daily goal to <strong>15 words</strong></p>
                      </div>
                      <div className="p-2 bg-white/60 rounded-lg">
                        <p className="text-sm">Try evening sessions for better retention</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-educational-pink" />
                  Learning Preferences
                </h3>

                {/* Auto-adjustment Settings */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Smart Goal Management</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-adjust Goals</p>
                          <p className="text-sm text-gray-600">
                            Automatically adjust goals based on performance
                          </p>
                        </div>
                        <CompactMobileSwitch
                          checked={preferences.autoAdjustGoals}
                          onCheckedChange={(checked) => {
                            setPreferences(prev => ({ ...prev, autoAdjustGoals: checked }));
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Adaptive Difficulty</p>
                          <p className="text-sm text-gray-600">
                            Adjust word difficulty based on progress
                          </p>
                        </div>
                        <CompactMobileSwitch
                          checked={preferences.adaptiveDifficulty}
                          onCheckedChange={(checked) => {
                            setPreferences(prev => ({ ...prev, adaptiveDifficulty: checked }));
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Motivation Style */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Motivation Style</h4>
                    <div className="grid gap-2">
                      {[
                        { id: "encouraging", label: "Encouraging", emoji: "🌟", desc: "Positive reinforcement" },
                        { id: "challenging", label: "Challenging", emoji: "🎯", desc: "Push your limits" },
                        { id: "balanced", label: "Balanced", emoji: "⚖️", desc: "Mix of both styles" },
                      ].map((style) => (
                        <Button
                          key={style.id}
                          variant={preferences.motivationStyle === style.id ? "default" : "outline"}
                          className={cn(
                            "h-auto p-3 justify-start",
                            preferences.motivationStyle === style.id && "bg-educational-blue text-white"
                          )}
                          onClick={() => {
                            setPreferences(prev => ({ ...prev, motivationStyle: style.id as any }));
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <span className="text-lg mr-3">{style.emoji}</span>
                          <div className="text-left">
                            <div className="font-medium">{style.label}</div>
                            <div className="text-xs opacity-75">{style.desc}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Focus Areas */}
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Focus Areas</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "vocabulary", label: "Vocabulary", icon: BookOpen },
                        { id: "pronunciation", label: "Pronunciation", icon: PlayCircle },
                        { id: "memory", label: "Memory", icon: Brain },
                        { id: "speed", label: "Speed", icon: Timer },
                      ].map((area) => {
                        const isSelected = preferences.focusAreas.includes(area.id);
                        return (
                          <Button
                            key={area.id}
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                              "h-12 flex flex-col gap-1 text-xs",
                              isSelected && "bg-educational-purple text-white"
                            )}
                            onClick={() => {
                              setPreferences(prev => ({
                                ...prev,
                                focusAreas: isSelected
                                  ? prev.focusAreas.filter(a => a !== area.id)
                                  : [...prev.focusAreas, area.id]
                              }));
                              setHasUnsavedChanges(true);
                            }}
                          >
                            <area.icon className="w-4 h-4" />
                            {area.label}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        {/* Action Bar */}
        <div className="border-t bg-slate-50 p-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setGoals([]);
                setPreferences({
                  autoAdjustGoals: true,
                  adaptiveDifficulty: true,
                  preferredCategories: [],
                  focusAreas: [],
                  reminderTimes: [],
                  motivationStyle: "encouraging",
                });
                setHasUnsavedChanges(true);
              }}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={handleSaveGoals}
              className="flex-1 bg-educational-blue hover:bg-educational-blue/90 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Goals
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
