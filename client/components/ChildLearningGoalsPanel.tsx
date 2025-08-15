import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CompactMobileSwitch } from "@/components/ui/compact-mobile-switch";
import { CompactMobileSlider } from "@/components/ui/compact-mobile-slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
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
  Settings,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useMobileDevice,
  triggerHapticFeedback,
} from "@/hooks/use-mobile-device";
import {
  goalProgressTracker,
  SystematicProgressData,
} from "@/lib/goalProgressTracker";

interface LearningGoal {
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
  reward?: string;
}

interface LearningPreferences {
  autoAdjustGoals: boolean;
  adaptiveDifficulty: boolean;
  preferredCategories: string[];
  focusAreas: string[];
  reminderTimes: string[];
  motivationStyle: "encouraging" | "challenging" | "balanced";
}

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  learningGoals: LearningGoal[];
  learningPreferences: LearningPreferences;
  wordsLearned: number;
  currentStreak: number;
  weeklyProgress: number;
  totalPoints: number;
}

interface ChildLearningGoalsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildProfile;
  onUpdateChild: (updatedChild: ChildProfile) => void;
}

export const ChildLearningGoalsPanel: React.FC<
  ChildLearningGoalsPanelProps
> = ({ isOpen, onClose, child, onUpdateChild }) => {
  const [goals, setGoals] = useState<LearningGoal[]>(child.learningGoals || []);
  const [preferences, setPreferences] = useState<LearningPreferences>(
    child.learningPreferences || {
      autoAdjustGoals: true,
      adaptiveDifficulty: true,
      preferredCategories: [],
      focusAreas: [],
      reminderTimes: [],
      motivationStyle: "encouraging",
    },
  );
  const [activeTab, setActiveTab] = useState("goals");
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [systematicProgress, setSystematicProgress] =
    useState<SystematicProgressData | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [newGoal, setNewGoal] = useState({
    type: "daily" as const,
    target: 5,
    category: "",
    description: "",
    reward: "",
  });

  const deviceInfo = useMobileDevice();

  // Update local state when child prop changes
  useEffect(() => {
    setGoals(child.learningGoals || []);
    setPreferences(
      child.learningPreferences || {
        autoAdjustGoals: true,
        adaptiveDifficulty: true,
        preferredCategories: [],
        focusAreas: [],
        reminderTimes: [],
        motivationStyle: "encouraging",
      },
    );
  }, [child]);

  // Fetch systematic progress data when panel opens
  useEffect(() => {
    if (isOpen && child.id) {
      setIsLoadingProgress(true);
      goalProgressTracker
        .fetchSystematicProgress(child.id)
        .then((progress) => {
          setSystematicProgress(progress);
          setIsLoadingProgress(false);
        })
        .catch((error) => {
          console.error("Error fetching systematic progress:", error);
          setIsLoadingProgress(false);
        });
    }
  }, [isOpen, child.id]);

  // Auto-refresh progress data every 30 seconds when panel is open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(async () => {
      if (child.id) {
        try {
          const progress = await goalProgressTracker.fetchSystematicProgress(
            child.id,
          );
          setSystematicProgress(progress);
        } catch (error) {
          console.error("Error refreshing progress:", error);
        }
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isOpen, child.id]);

  const handleSaveChanges = () => {
    const updatedChild = {
      ...child,
      learningGoals: goals,
      learningPreferences: preferences,
    };
    onUpdateChild(updatedChild);
    setHasUnsavedChanges(false);
    triggerHapticFeedback("medium");
  };

  const handleAddGoal = () => {
    if (newGoal.description.trim()) {
      const goal: LearningGoal = {
        id: `goal-${Date.now()}`,
        type: newGoal.type,
        target: newGoal.target,
        current: 0,
        category: newGoal.category || undefined,
        isActive: true,
        streak: 0,
        bestStreak: 0,
        startDate: new Date().toISOString(),
        description: newGoal.description,
        reward: newGoal.reward || undefined,
      };

      setGoals((prev) => [...prev, goal]);
      setHasUnsavedChanges(true);
      setShowAddGoalDialog(false);
      setNewGoal({
        type: "daily",
        target: 5,
        category: "",
        description: "",
        reward: "",
      });
      triggerHapticFeedback("medium");
    }
  };

  const handleToggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId ? { ...goal, isActive: !goal.isActive } : goal,
      ),
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateGoalProgress = (goalId: string, newCurrent: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? { ...goal, current: Math.max(0, newCurrent) }
          : goal,
      ),
    );
    setHasUnsavedChanges(true);
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case "daily":
        return <Target className="w-4 h-4" />;
      case "weekly":
        return <Calendar className="w-4 h-4" />;
      case "monthly":
        return <Trophy className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-gray-400";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 md:p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-xl md:text-2xl">{child.avatar}</div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base md:text-lg truncate">
                  {child.name}'s Learning Goals
                </CardTitle>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Manage learning objectives and preferences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Button
                  size="sm"
                  onClick={handleSaveChanges}
                  className="text-xs md:text-sm"
                >
                  <Save className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Save
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-3 md:p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full"
          >
            <TabsList className="grid w-full grid-cols-3 h-9 md:h-10">
              <TabsTrigger value="goals" className="text-xs md:text-sm">
                Goals
              </TabsTrigger>
              <TabsTrigger value="progress" className="text-xs md:text-sm">
                Progress
              </TabsTrigger>
              <TabsTrigger value="preferences" className="text-xs md:text-sm">
                Settings
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[45vh] md:h-[50vh] mt-3 md:mt-4">
              <TabsContent value="goals" className="space-y-3 md:space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm md:text-base">
                    Active Goals
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setShowAddGoalDialog(true)}
                    className="w-full md:w-auto"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    <span className="text-xs md:text-sm">Add Goal</span>
                  </Button>
                </div>

                {goals.length === 0 ? (
                  <div className="text-center py-6 md:py-8 text-muted-foreground">
                    <Target className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm md:text-base">
                      No learning goals set yet
                    </p>
                    <p className="text-xs md:text-sm">
                      Add your first goal to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-3">
                    {goals.map((goal) => {
                      const progress = Math.min(
                        (goal.current / goal.target) * 100,
                        100,
                      );
                      return (
                        <Card
                          key={goal.id}
                          className="border-l-4 border-l-educational-blue"
                        >
                          <CardContent className="p-3 md:p-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 md:gap-3 mb-3">
                              <div className="flex items-start gap-2 md:gap-3 flex-1">
                                <div className="mt-0.5">
                                  {getGoalIcon(goal.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm md:text-base leading-tight">
                                    {goal.description}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {goal.type}
                                    </Badge>
                                    {goal.category && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {goal.category}
                                      </Badge>
                                    )}
                                    {goal.streak > 0 && (
                                      <div className="flex items-center gap-1 text-orange-600">
                                        <Flame className="w-3 h-3" />
                                        <span className="text-xs font-medium">
                                          {goal.streak}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <CompactMobileSwitch
                                checked={goal.isActive}
                                onCheckedChange={() =>
                                  handleToggleGoal(goal.id)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-xs md:text-sm">
                                <span>Progress</span>
                                <span className="font-medium">
                                  {goal.current}/{goal.target}
                                </span>
                              </div>
                              <Progress
                                value={progress}
                                className="h-2 md:h-2"
                              />
                              {goal.reward && (
                                <p className="text-xs text-muted-foreground">
                                  🎁 Reward: {goal.reward}
                                </p>
                              )}
                            </div>

                            {goal.isActive && (
                              <div className="flex gap-1 md:gap-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateGoalProgress(
                                      goal.id,
                                      goal.current - 1,
                                    )
                                  }
                                  disabled={goal.current <= 0}
                                  className="flex-1 text-xs md:text-sm h-8 md:h-9"
                                >
                                  -1
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleUpdateGoalProgress(
                                      goal.id,
                                      goal.current + 1,
                                    )
                                  }
                                  disabled={goal.current >= goal.target}
                                  className="flex-1 text-xs md:text-sm h-8 md:h-9"
                                >
                                  +1
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Learning Analytics</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      setIsLoadingProgress(true);
                      try {
                        const progress =
                          await goalProgressTracker.fetchSystematicProgress(
                            child.id,
                          );
                        setSystematicProgress(progress);
                      } catch (error) {
                        console.error("Error refreshing progress:", error);
                      } finally {
                        setIsLoadingProgress(false);
                      }
                    }}
                    disabled={isLoadingProgress}
                  >
                    <RefreshCw
                      className={cn(
                        "w-4 h-4 mr-2",
                        isLoadingProgress && "animate-spin",
                      )}
                    />
                    Refresh
                  </Button>
                </div>

                {isLoadingProgress ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-educational-blue" />
                    <p className="text-sm text-muted-foreground">
                      Loading progress data...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-educational-blue">
                            {systematicProgress?.totalWordsLearned ||
                              child.wordsLearned ||
                              0}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Total Words
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-educational-orange">
                            {systematicProgress?.currentStreak ||
                              child.currentStreak ||
                              0}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Day Streak
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-educational-green">
                            {systematicProgress?.wordsLearnedToday || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">Today</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-educational-purple">
                            {systematicProgress?.wordsLearnedThisWeek || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            This Week
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">Session Activity</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-educational-blue">
                              {systematicProgress?.sessionsToday || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Sessions Today
                            </p>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-educational-purple">
                              {systematicProgress?.sessionsThisWeek || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Sessions This Week
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-3">
                          Goal Completion Rate
                        </h4>
                        <div className="space-y-2">
                          {goals.map((goal) => {
                            const progress = Math.min(
                              (goal.current / goal.target) * 100,
                              100,
                            );
                            return (
                              <div key={goal.id} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{goal.description}</span>
                                  <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-1" />
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                <h3 className="font-semibold">Learning Preferences</h3>

                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-adjust Goals</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically adjust difficulty based on performance
                        </p>
                      </div>
                      <CompactMobileSwitch
                        checked={preferences.autoAdjustGoals}
                        onCheckedChange={(checked) => {
                          setPreferences((prev) => ({
                            ...prev,
                            autoAdjustGoals: checked,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Adaptive Difficulty</Label>
                        <p className="text-xs text-muted-foreground">
                          Adapt content difficulty based on progress
                        </p>
                      </div>
                      <CompactMobileSwitch
                        checked={preferences.adaptiveDifficulty}
                        onCheckedChange={(checked) => {
                          setPreferences((prev) => ({
                            ...prev,
                            adaptiveDifficulty: checked,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div>
                      <Label>Motivation Style</Label>
                      <Select
                        value={preferences.motivationStyle}
                        onValueChange={(
                          value: "encouraging" | "challenging" | "balanced",
                        ) => {
                          setPreferences((prev) => ({
                            ...prev,
                            motivationStyle: value,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="encouraging">
                            Encouraging
                          </SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="challenging">
                            Challenging
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Goal Dialog */}
      <Dialog open={showAddGoalDialog} onOpenChange={setShowAddGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Learning Goal</DialogTitle>
            <DialogDescription>
              Create a new learning objective for {child.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Goal Type</Label>
              <Select
                value={newGoal.type}
                onValueChange={(value: "daily" | "weekly" | "monthly") =>
                  setNewGoal((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target</Label>
              <Input
                type="number"
                value={newGoal.target}
                onChange={(e) =>
                  setNewGoal((prev) => ({
                    ...prev,
                    target: parseInt(e.target.value) || 1,
                  }))
                }
                min="1"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the learning goal..."
                className="mt-2"
              />
            </div>

            <div>
              <Label>Category (Optional)</Label>
              <Input
                value={newGoal.category}
                onChange={(e) =>
                  setNewGoal((prev) => ({ ...prev, category: e.target.value }))
                }
                placeholder="e.g., Animals, Math, Reading"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Reward (Optional)</Label>
              <Input
                value={newGoal.reward}
                onChange={(e) =>
                  setNewGoal((prev) => ({ ...prev, reward: e.target.value }))
                }
                placeholder="e.g., Extra playtime, Stickers"
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddGoalDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddGoal}
              disabled={!newGoal.description.trim()}
            >
              Add Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChildLearningGoalsPanel;
