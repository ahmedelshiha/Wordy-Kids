import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
} from "lucide-react";
import { AIEnhancedWordLearning } from "@/components/AIEnhancedWordLearning";
import {
  useAIWordRecommendations,
  useRealTimeLearningAnalytics,
} from "@/hooks/use-ai-word-recommendations";
import { aiWordRecommendationService } from "@/lib/aiWordRecommendationService";
import { AIWordRecommendationEngine } from "@/lib/aiWordRecommendationEngine";
import { wordsDatabase, getWordsByCategory } from "@/data/wordsDatabase";

interface DemoUserProfile {
  id: string;
  name: string;
  age: number;
  level: "beginner" | "intermediate" | "advanced";
  preferences: {
    sessionLength: number;
    difficulty: "easy" | "medium" | "hard";
    categories: string[];
  };
  stats: {
    wordsLearned: number;
    averageAccuracy: number;
    totalSessions: number;
    learningStreak: number;
  };
}

const demoUsers: DemoUserProfile[] = [
  {
    id: "demo-alice",
    name: "Alice (Age 6)",
    age: 6,
    level: "beginner",
    preferences: {
      sessionLength: 10,
      difficulty: "easy",
      categories: ["animals", "colors"],
    },
    stats: {
      wordsLearned: 25,
      averageAccuracy: 75,
      totalSessions: 8,
      learningStreak: 3,
    },
  },
  {
    id: "demo-ben",
    name: "Ben (Age 8)",
    age: 8,
    level: "intermediate",
    preferences: {
      sessionLength: 15,
      difficulty: "medium",
      categories: ["science", "nature", "food"],
    },
    stats: {
      wordsLearned: 125,
      averageAccuracy: 85,
      totalSessions: 24,
      learningStreak: 7,
    },
  },
  {
    id: "demo-cara",
    name: "Cara (Age 10)",
    age: 10,
    level: "advanced",
    preferences: {
      sessionLength: 20,
      difficulty: "hard",
      categories: ["science", "technology", "advanced"],
    },
    stats: {
      wordsLearned: 200,
      averageAccuracy: 92,
      totalSessions: 45,
      learningStreak: 12,
    },
  },
];

export default function AIWordRecommendationDemo() {
  const [selectedUser, setSelectedUser] = useState<DemoUserProfile>(
    demoUsers[0],
  );
  const [currentView, setCurrentView] = useState<
    "overview" | "demo" | "analytics" | "integration"
  >("overview");
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);

  // Mock user progress for demo
  const [userProgress, setUserProgress] = useState({
    rememberedWords: new Set<number>([1, 2, 3, 4, 5, 10, 12, 15, 18, 20]),
    forgottenWords: new Set<number>([6, 7, 11, 16]),
    excludedWordIds: new Set<number>(),
  });

  // Mock child stats
  const mockChildStats = {
    wordsRemembered: selectedUser.stats.wordsLearned,
    averageAccuracy: selectedUser.stats.averageAccuracy,
    totalReviewSessions: selectedUser.stats.totalSessions,
    weakestCategories: selectedUser.level === "beginner" ? ["science"] : [],
    strongestCategories: selectedUser.preferences.categories,
  };

  // Analytics hook
  const { analytics, refreshAnalytics } = useRealTimeLearningAnalytics(
    selectedUser.id,
  );

  // Simulate AI learning patterns for different user types
  const simulateUserLearning = async () => {
    setSimulationRunning(true);
    const results = [];

    for (let session = 1; session <= 5; session++) {
      // Simulate getting recommendations
      const recommendation =
        await aiWordRecommendationService.getRecommendations(
          selectedUser.id,
          {
            timeOfDay: 16, // 4 PM
            sessionGoal:
              session <= 2 ? "learning" : session <= 4 ? "review" : "challenge",
            availableTime: selectedUser.preferences.sessionLength,
            deviceType: "tablet",
          },
          userProgress,
          mockChildStats,
          selectedUser.preferences.categories[0],
        );

      // Simulate session performance based on user level
      let accuracy = 0.6; // Base accuracy
      if (selectedUser.level === "intermediate") accuracy = 0.75;
      if (selectedUser.level === "advanced") accuracy = 0.85;

      // Add some randomness
      accuracy += (Math.random() - 0.5) * 0.2;
      accuracy = Math.max(0.4, Math.min(0.95, accuracy));

      const sessionResult = {
        session,
        confidence: recommendation.confidence,
        wordsSelected: recommendation.words.length,
        predictedAccuracy: recommendation.expectedOutcomes.retentionPrediction,
        actualAccuracy: accuracy,
        engagement: recommendation.expectedOutcomes.engagementScore,
        reasoning: recommendation.reasoning,
        adaptations: Math.floor(Math.random() * 3) + 1,
      };

      results.push(sessionResult);

      // Simulate word interactions
      for (let i = 0; i < Math.min(5, recommendation.words.length); i++) {
        const word = recommendation.words[i];
        const isCorrect = Math.random() < accuracy;

        await aiWordRecommendationService.recordWordInteraction(
          selectedUser.id,
          {
            wordId: word.id,
            word: word.word,
            isCorrect,
            responseTime: 2000 + Math.random() * 4000, // 2-6 seconds
            hintsUsed: isCorrect ? 0 : Math.floor(Math.random() * 2),
            attemptNumber: isCorrect ? 1 : Math.floor(Math.random() * 3) + 1,
            timestamp: Date.now(),
          },
        );
      }

      // Complete session
      await aiWordRecommendationService.completeSession(selectedUser.id, {
        completed: true,
        finalStats: {
          wordsAttempted: 5,
          wordsCorrect: Math.floor(accuracy * 5),
          totalTime: selectedUser.preferences.sessionLength * 60 * 1000,
          userSatisfaction: 4,
        },
      });

      // Small delay to simulate real session gaps
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setSimulationResults(results);
    setSimulationRunning(false);
    refreshAnalytics();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink p-4 rounded-full shadow-2xl">
            <Brain className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink bg-clip-text text-transparent mb-4">
          AI Word Recommendation Engine
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience personalized word learning with machine learning algorithms
          that adapt to each child's unique learning patterns, preferences, and
          progress.
        </p>
      </div>

      {/* User Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Demo User Profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedUser.id === user.id
                    ? "border-educational-blue bg-educational-blue/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{user.name}</h3>
                  <Badge
                    variant={
                      user.level === "beginner"
                        ? "default"
                        : user.level === "intermediate"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {user.level}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Words learned: {user.stats.wordsLearned}</div>
                  <div>Accuracy: {user.stats.averageAccuracy}%</div>
                  <div>Streak: {user.stats.learningStreak} days</div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs
        value={currentView}
        onValueChange={(value) => setCurrentView(value as any)}
      >
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  AI Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-educational-blue/5 rounded-lg">
                    <Brain className="w-5 h-5 text-educational-blue mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Adaptive Word Selection</h4>
                      <p className="text-sm text-gray-600">
                        AI analyzes learning patterns to select optimal words
                        based on difficulty, retention, and engagement.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-educational-purple/5 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-educational-purple mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Predictive Analytics</h4>
                      <p className="text-sm text-gray-600">
                        Predicts learning outcomes and optimizes difficulty
                        progression in real-time.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-educational-green/5 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-educational-green mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Personalized Hints</h4>
                      <p className="text-sm text-gray-600">
                        Context-aware hints and encouragement based on
                        individual learning style.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-educational-orange/5 rounded-lg">
                    <Zap className="w-5 h-5 text-educational-orange mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Real-time Adaptation</h4>
                      <p className="text-sm text-gray-600">
                        Adjusts difficulty and teaching strategy based on
                        performance patterns.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current User Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  AI Analysis for {selectedUser.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-educational-blue">
                      {selectedUser.stats.wordsLearned}
                    </div>
                    <div className="text-sm text-gray-600">Words Learned</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-educational-purple">
                      {selectedUser.stats.averageAccuracy}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Learning Velocity</span>
                      <span className="font-medium">
                        {selectedUser.level === "beginner"
                          ? "1.2"
                          : selectedUser.level === "intermediate"
                            ? "2.1"
                            : "3.4"}{" "}
                        words/min
                      </span>
                    </div>
                    <Progress
                      value={
                        selectedUser.level === "beginner"
                          ? 30
                          : selectedUser.level === "intermediate"
                            ? 60
                            : 90
                      }
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Retention Rate</span>
                      <span className="font-medium">
                        {selectedUser.stats.averageAccuracy + 5}%
                      </span>
                    </div>
                    <Progress value={selectedUser.stats.averageAccuracy + 5} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Engagement Score</span>
                      <span className="font-medium">
                        {selectedUser.level === "advanced"
                          ? "95%"
                          : selectedUser.level === "intermediate"
                            ? "88%"
                            : "82%"}
                      </span>
                    </div>
                    <Progress
                      value={
                        selectedUser.level === "advanced"
                          ? 95
                          : selectedUser.level === "intermediate"
                            ? 88
                            : 82
                      }
                    />
                  </div>
                </div>

                <Alert>
                  <Lightbulb className="w-4 h-4" />
                  <AlertDescription>
                    AI Recommendation:{" "}
                    {selectedUser.level === "beginner"
                      ? "Focus on confidence building with easier words and more encouragement."
                      : selectedUser.level === "intermediate"
                        ? "Introduce moderate challenges while maintaining engagement through variety."
                        : "Challenge with advanced vocabulary while leveraging strong pattern recognition skills."}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Simulation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  AI Learning Simulation
                </div>
                <Button
                  onClick={simulateUserLearning}
                  disabled={simulationRunning}
                  className="bg-gradient-to-r from-educational-blue to-educational-purple"
                >
                  {simulationRunning ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Simulation
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {simulationRunning && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 mx-auto mb-4">
                    <Brain className="w-8 h-8 text-educational-blue" />
                  </div>
                  <p>
                    AI is analyzing learning patterns and generating
                    recommendations...
                  </p>
                </div>
              )}

              {simulationResults.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">
                    Simulation Results for {selectedUser.name}
                  </h4>
                  <div className="grid gap-3">
                    {simulationResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            Session {result.session}
                          </Badge>
                          <div className="text-sm">
                            <div className="font-medium">
                              Predicted:{" "}
                              {Math.round(result.predictedAccuracy * 100)}% |
                              Actual: {Math.round(result.actualAccuracy * 100)}%
                            </div>
                            <div className="text-gray-600">
                              Confidence: {Math.round(result.confidence * 100)}%
                              | Words: {result.wordsSelected} | Adaptations:{" "}
                              {result.adaptations}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {Math.abs(
                            result.predictedAccuracy - result.actualAccuracy,
                          ) < 0.1 ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Alert>
                    <Star className="w-4 h-4" />
                    <AlertDescription>
                      Average prediction accuracy:{" "}
                      {Math.round(
                        (simulationResults.reduce(
                          (sum, result) =>
                            sum +
                            (1 -
                              Math.abs(
                                result.predictedAccuracy -
                                  result.actualAccuracy,
                              )),
                          0,
                        ) /
                          simulationResults.length) *
                          100,
                      )}
                      % - AI learns and improves with each session!
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Demo Tab */}
        <TabsContent value="demo">
          <AIEnhancedWordLearning
            userId={selectedUser.id}
            userProgress={userProgress}
            childStats={mockChildStats}
            selectedCategory={selectedUser.preferences.categories[0]}
            onWordProgress={(word, status) => {
              if (status === "remembered") {
                setUserProgress((prev) => ({
                  ...prev,
                  rememberedWords: new Set([...prev.rememberedWords, word.id]),
                  forgottenWords: new Set(
                    [...prev.forgottenWords].filter((id) => id !== word.id),
                  ),
                }));
              } else {
                setUserProgress((prev) => ({
                  ...prev,
                  forgottenWords: new Set([...prev.forgottenWords, word.id]),
                }));
              }
            }}
            onSessionComplete={(results) => {
              console.log("Session completed:", results);
            }}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Real-time Learning Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Learning Velocity Trend</h4>
                    <div className="space-y-2">
                      {analytics.velocityTrend
                        .slice(-5)
                        .map((velocity, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm">Session {index + 1}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-educational-blue h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(100, velocity * 50)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {velocity.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Category Mastery</h4>
                    <div className="space-y-2">
                      {Array.from(analytics.categoryMastery.entries()).map(
                        ([category, mastery]) => (
                          <div key={category} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{category}</span>
                              <span>{Math.round(mastery * 100)}%</span>
                            </div>
                            <Progress value={mastery * 100} />
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Predicted Outcomes</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Next Week Learning Rate</span>
                        <span className="font-medium">
                          {analytics.predictedOutcomes.nextWeekLearningRate}{" "}
                          words
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Retention Risk</span>
                        <Badge
                          variant={
                            analytics.predictedOutcomes.retentionRisk > 0.5
                              ? "destructive"
                              : "default"
                          }
                        >
                          {Math.round(
                            analytics.predictedOutcomes.retentionRisk * 100,
                          )}
                          %
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Motivation Trend</span>
                        <Badge
                          variant={
                            analytics.predictedOutcomes.motivationTrend ===
                            "improving"
                              ? "default"
                              : analytics.predictedOutcomes.motivationTrend ===
                                  "declining"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {analytics.predictedOutcomes.motivationTrend}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Run the simulation to see analytics data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Tab */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Integration Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3>Quick Start Integration</h3>
                <p>
                  The AI Word Recommendation Engine is designed to integrate
                  seamlessly with your existing Wordy Kids app. Here's how to
                  get started:
                </p>

                <h4>1. Basic Integration</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm">
                    <code>{`import { useAIWordRecommendations } from "@/hooks/use-ai-word-recommendations";

function YourLearningComponent({ userId, userProgress, childStats }) {
  const [aiState, aiActions] = useAIWordRecommendations({
    userId,
    enableRealTimeAdaptation: true,
    enableAnalytics: true
  });

  // Get AI recommendations
  useEffect(() => {
    aiActions.getRecommendations(
      { timeOfDay: new Date().getHours(), sessionGoal: "learning" },
      userProgress,
      childStats
    );
  }, []);

  return (
    <div>
      {aiState.words.map(word => (
        <WordCard 
          key={word.id} 
          word={word}
          onWordLearned={(word, correct) => 
            aiActions.recordCorrectAnswer(word.id, responseTime)
          }
        />
      ))}
    </div>
  );
}`}</code>
                  </pre>
                </div>

                <h4>2. Enhanced Features</h4>
                <ul>
                  <li>
                    <strong>Real-time Adaptation:</strong> Words adjust
                    difficulty based on performance
                  </li>
                  <li>
                    <strong>Predictive Analytics:</strong> Predicts learning
                    outcomes and engagement
                  </li>
                  <li>
                    <strong>Personalized Hints:</strong> Context-aware help
                    based on learning patterns
                  </li>
                  <li>
                    <strong>Spaced Repetition:</strong> Optimal review timing
                    for maximum retention
                  </li>
                </ul>

                <h4>3. Integration Points</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2">
                      Replace Word Selection
                    </h5>
                    <p className="text-sm text-gray-600">
                      Replace your existing word selection logic with AI
                      recommendations in:
                    </p>
                    <ul className="text-sm list-disc list-inside mt-2">
                      <li>WordCard components</li>
                      <li>Quiz generation</li>
                      <li>Practice sessions</li>
                      <li>Daily challenges</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2">Enhance Analytics</h5>
                    <p className="text-sm text-gray-600">
                      Add AI insights to your parent dashboard:
                    </p>
                    <ul className="text-sm list-disc list-inside mt-2">
                      <li>Learning velocity trends</li>
                      <li>Retention predictions</li>
                      <li>Difficulty recommendations</li>
                      <li>Personalized study tips</li>
                    </ul>
                  </div>
                </div>

                <h4>4. Configuration Options</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <pre className="text-sm">
                    <code>{`const aiConfig = {
  enableRealTimeAdaptation: true,     // Adjust during session
  enablePredictiveAnalytics: true,    // Predict outcomes
  enablePersonalizedDifficulty: true, // Auto-adjust difficulty
  enableMotivationalBoosts: true,     // Encouragement & hints
  analyticsUpdateInterval: 5000       // Update frequency (ms)
};`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Ready to integrate!</strong> The AI system is designed to
              work alongside your existing components and gradually enhance the
              learning experience. Start with basic word recommendations and
              expand to full analytics and adaptation features.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
