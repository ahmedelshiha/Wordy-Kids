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

export const ChildLearningGoalsPanel: React.FC<ChildLearningGoalsPanelProps> = ({
  isOpen,
  onClose,
  child,
  onUpdateChild,
}) => {
  const [goals, setGoals] = useState<LearningGoal[]>(child.learningGoals || []);
  const [preferences, setPreferences] = useState<LearningPreferences>(
    child.learningPreferences || {
      autoAdjustGoals: true,
      adaptiveDifficulty: true,
      preferredCategories: [],
      focusAreas: [],
      reminderTimes: [],
      motivationStyle: "encouraging",
    }
  );
  const [activeTab, setActiveTab] = useState("goals");
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
    setPreferences(child.learningPreferences || {
      autoAdjustGoals: true,
      adaptiveDifficulty: true,
      preferredCategories: [],
      focusAreas: [],
      reminderTimes: [],
      motivationStyle: "encouraging",
    });
  }, [child]);

  const handleSaveChanges = () => {
    const updatedChild = {
      ...child,
      learningGoals: goals,
      learningPreferences: preferences,
    };
    onUpdateChild(updatedChild);
    setHasUnsavedChanges(false);
    triggerHapticFeedback("success");
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

      setGoals(prev => [...prev, goal]);
      setHasUnsavedChanges(true);
      setShowAddGoalDialog(false);
      setNewGoal({
        type: "daily",
        target: 5,
        category: "",
        description: "",
        reward: "",
      });
      triggerHapticFeedback("success");
    }
  };

  const handleToggleGoal = (goalId: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, isActive: !goal.isActive } : goal
    ));
    setHasUnsavedChanges(true);
  };

  const handleUpdateGoalProgress = (goalId: string, newCurrent: number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, current: Math.max(0, newCurrent) } : goal
    ));
    setHasUnsavedChanges(true);
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case "daily": return <Target className="w-4 h-4" />;
      case "weekly": return <Calendar className="w-4 h-4" />;
      case "monthly": return <Trophy className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{child.avatar}</div>
              <div>
                <CardTitle className="text-lg">
                  {child.name}'s Learning Goals
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage learning objectives and preferences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Button size="sm" onClick={handleSaveChanges}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="preferences">Settings</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[50vh] mt-4">
              <TabsContent value="goals" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Active Goals</h3>
                  <Button size="sm" onClick={() => setShowAddGoalDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Goal
                  </Button>
                </div>

                {goals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No learning goals set yet</p>
                    <p className="text-sm">Add your first goal to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {goals.map((goal) => {
                      const progress = Math.min((goal.current / goal.target) * 100, 100);
                      return (
                        <Card key={goal.id} className="border-l-4 border-l-educational-blue">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="mt-1">{getGoalIcon(goal.type)}</div>
                                <div className="flex-1">
                                  <h4 className="font-medium">{goal.description}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {goal.type}
                                    </Badge>
                                    {goal.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {goal.category}
                                      </Badge>
                                    )}
                                    {goal.streak > 0 && (
                                      <div className="flex items-center gap-1 text-orange-600">
                                        <Flame className="w-3 h-3" />
                                        <span className="text-xs font-medium">{goal.streak}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <CompactMobileSwitch
                                checked={goal.isActive}
                                onCheckedChange={() => handleToggleGoal(goal.id)}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{goal.current}/{goal.target}</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                              {goal.reward && (
                                <p className="text-xs text-muted-foreground">
                                  🎁 Reward: {goal.reward}
                                </p>
                              )}
                            </div>

                            {goal.isActive && (
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateGoalProgress(goal.id, goal.current - 1)}
                                  disabled={goal.current <= 0}
                                >
                                  -1
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateGoalProgress(goal.id, goal.current + 1)}
                                  disabled={goal.current >= goal.target}
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
                <h3 className="font-semibold">Learning Analytics</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-educational-blue">
                        {child.wordsLearned}
                      </div>
                      <p className="text-sm text-muted-foreground">Words Learned</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-educational-orange">
                        {child.currentStreak}
                      </div>
                      <p className="text-sm text-muted-foreground">Day Streak</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Goal Completion Rate</h4>
                    <div className="space-y-2">
                      {goals.map((goal) => {
                        const progress = Math.min((goal.current / goal.target) * 100, 100);
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
                          setPreferences(prev => ({ ...prev, autoAdjustGoals: checked }));
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
                          setPreferences(prev => ({ ...prev, adaptiveDifficulty: checked }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div>
                      <Label>Motivation Style</Label>
                      <Select
                        value={preferences.motivationStyle}
                        onValueChange={(value: "encouraging" | "challenging" | "balanced") => {
                          setPreferences(prev => ({ ...prev, motivationStyle: value }));
                          setHasUnsavedChanges(true);
                        }}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="encouraging">Encouraging</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="challenging">Challenging</SelectItem>
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
                  setNewGoal(prev => ({ ...prev, type: value }))
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
                  setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))
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
                  setNewGoal(prev => ({ ...prev, description: e.target.value }))
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
                  setNewGoal(prev => ({ ...prev, category: e.target.value }))
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
                  setNewGoal(prev => ({ ...prev, reward: e.target.value }))
                }
                placeholder="e.g., Extra playtime, Stickers"
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGoalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal} disabled={!newGoal.description.trim()}>
              Add Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChildLearningGoalsPanel;
