import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  Sparkles,
  Target,
  CheckCircle,
  ArrowRight,
  Settings,
  Play,
  BookOpen,
  Zap,
  TrendingUp,
  Star,
} from "lucide-react";
import { LearningDashboard } from "@/components/LearningDashboard";
import { ChildFriendlyCategorySelector } from "@/components/ChildFriendlyCategorySelector";
import { wordsDatabase, getWordsByCategory } from "@/data/wordsDatabase";

export default function AIIntegrationDemo() {
  const [selectedCategory, setSelectedCategory] = useState("animals");
  const [userProgress, setUserProgress] = useState({
    rememberedWords: new Set<number>([1, 2, 3, 4, 5]),
    forgottenWords: new Set<number>([6, 7, 8]),
    excludedWordIds: new Set<number>(),
  });
  const [availableWords, setAvailableWords] = useState<any[]>([]);

  // Mock user data
  const mockUserId = "demo-user-ai";
  const mockChildStats = {
    wordsRemembered: 25,
    wordsNeedingPractice: 8,
    averageAccuracy: 85,
    totalReviewSessions: 12,
    weakestCategories: ["science"],
    strongestCategories: ["animals", "colors"],
  };

  const mockLearningStats = {
    wordsLearned: 25,
    totalWords: 500,
    currentStreak: 7,
    weeklyGoal: 30,
    weeklyProgress: 25,
    accuracyRate: 85,
    favoriteCategory: "Animals",
    totalPoints: 1250,
    level: 3,
    dailyGoalProgress: 8,
    dailyGoalTarget: 10,
    badges: [
      {
        id: "first-word",
        name: "First Word",
        icon: "🎯",
        earned: true,
        description: "Learned your first word",
      },
      {
        id: "streak-master",
        name: "Streak Master",
        icon: "🔥",
        earned: true,
        description: "7-day learning streak",
      },
    ],
  };

  // Load words for selected category
  useEffect(() => {
    const categoryWords = getWordsByCategory(selectedCategory).slice(0, 20);
    setAvailableWords(categoryWords);
  }, [selectedCategory]);

  const handleWordProgress = (
    word: any,
    status: "remembered" | "needs_practice" | "skipped",
  ) => {
    console.log(`Word progress: ${word.word} - ${status}`);

    if (status === "remembered") {
      setUserProgress((prev) => ({
        ...prev,
        rememberedWords: new Set([...prev.rememberedWords, word.id]),
        forgottenWords: new Set(
          [...prev.forgottenWords].filter((id) => id !== word.id),
        ),
      }));
    } else if (status === "needs_practice") {
      setUserProgress((prev) => ({
        ...prev,
        forgottenWords: new Set([...prev.forgottenWords, word.id]),
      }));
    }
  };

  const handleSessionComplete = (sessionData: any) => {
    console.log("AI Session completed:", sessionData);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-4 rounded-full shadow-2xl">
            <Brain className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          AI Integration Demo
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          Experience the power of AI-enhanced word learning integrated into your
          existing dashboard.
        </p>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="features">AI Features</TabsTrigger>
          <TabsTrigger value="integration">How to Integrate</TabsTrigger>
        </TabsList>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <Alert>
            <Brain className="w-4 h-4" />
            <AlertDescription>
              <strong>Interactive Demo:</strong> Try both the original and
              AI-enhanced word learning experiences below. The AI version uses
              machine learning to select optimal words and provide personalized
              feedback.
            </AlertDescription>
          </Alert>

          {/* Category Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Select Learning Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChildFriendlyCategorySelector
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </CardContent>
          </Card>

          {/* Learning Dashboard with AI Toggle */}
          <LearningDashboard
            stats={mockLearningStats}
            userName="Alex"
            childStats={mockChildStats}
            availableWords={availableWords}
            onWordProgress={handleWordProgress}
            onQuickQuiz={() => console.log("Quiz started")}
            onAdventure={() => console.log("Adventure started")}
            onPracticeForgotten={() => console.log("Practice forgotten words")}
            forgottenWordsCount={userProgress.forgottenWords.size}
            rememberedWordsCount={userProgress.rememberedWords.size}
            onRequestNewWords={() => {
              const newWords = getWordsByCategory(selectedCategory).slice(
                0,
                20,
              );
              setAvailableWords(newWords);
            }}
            onSessionProgress={(stats) =>
              console.log("Session progress:", stats)
            }
            // AI Enhancement props
            userId={mockUserId}
            enableAIEnhancement={true}
            selectedCategory={selectedCategory}
            userProgress={userProgress}
            onSessionComplete={handleSessionComplete}
          />
        </TabsContent>

        {/* AI Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core AI Features */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sky-700">
                  <Brain className="w-5 h-5" />
                  Core AI Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-surface/60 rounded-lg">
                    <Sparkles className="w-5 h-5 text-sky-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-sky-700">
                        Adaptive Word Selection
                      </h4>
                      <p className="text-sm text-sky-600">
                        AI analyzes learning patterns to select optimal words
                        based on difficulty, retention rates, and engagement.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-surface/60 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-berry-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-berry-700">
                        Predictive Analytics
                      </h4>
                      <p className="text-sm text-berry-600">
                        Predicts learning outcomes and optimizes difficulty
                        progression in real-time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-surface/60 rounded-lg">
                    <Target className="w-5 h-5 text-jungle-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-jungle-700">
                        Personalized Hints
                      </h4>
                      <p className="text-sm text-jungle-600">
                        Context-aware hints and encouragement based on
                        individual learning style.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-surface/60 rounded-lg">
                    <Zap className="w-5 h-5 text-banana-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-banana-700">
                        Real-time Adaptation
                      </h4>
                      <p className="text-sm text-banana-600">
                        Adjusts difficulty and teaching strategy based on
                        performance patterns.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics & Insights */}
            <Card className="border-success/30 bg-gradient-to-br from-green-50 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-jungle-700">
                  <TrendingUp className="w-5 h-5" />
                  Analytics & Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-surface/60 rounded-lg">
                    <span className="text-sm font-medium text-text-secondary">
                      Learning Velocity
                    </span>
                    <span className="text-sm font-bold text-jungle-600">
                      2.3 words/min
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-surface/60 rounded-lg">
                    <span className="text-sm font-medium text-text-secondary">
                      Retention Prediction
                    </span>
                    <span className="text-sm font-bold text-sky-600">87%</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-surface/60 rounded-lg">
                    <span className="text-sm font-medium text-text-secondary">
                      Engagement Score
                    </span>
                    <span className="text-sm font-bold text-berry-600">
                      94%
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-surface/60 rounded-lg">
                    <span className="text-sm font-medium text-text-secondary">
                      AI Confidence
                    </span>
                    <span className="text-sm font-bold text-banana-600">
                      91%
                    </span>
                  </div>
                </div>

                <Alert className="bg-success-light border-success/30">
                  <Star className="w-4 h-4" />
                  <AlertDescription className="text-jungle-700">
                    <strong>Predictive Success:</strong> AI predictions match
                    actual performance with 89% accuracy on average.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-jungle-600" />
                AI Enhancement Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-text mb-3">
                    Standard Word Selection
                  </h4>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li>• Random or category-based selection</li>
                    <li>• Fixed difficulty progression</li>
                    <li>• Generic encouragement messages</li>
                    <li>• Basic progress tracking</li>
                    <li>• Manual difficulty adjustment</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-jungle-700 mb-3">
                    AI-Enhanced Selection
                  </h4>
                  <ul className="space-y-2 text-sm text-jungle-600">
                    <li>
                      • ✨ Personalized word selection based on learning
                      patterns
                    </li>
                    <li>• 🎯 Adaptive difficulty scaling in real-time</li>
                    <li>• 💬 Context-aware hints and encouragement</li>
                    <li>• 📊 Predictive analytics and insights</li>
                    <li>• 🤖 Automatic optimization for better outcomes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Guide Tab */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Integration Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>Good News!</strong> The AI enhancement is already
                  integrated into your existing components. Just pass the
                  required props to enable AI features.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Step 1: Update LearningDashboard Usage
                </h3>
                <div className="bg-surface-2 p-4 rounded-lg">
                  <pre className="text-sm text-text overflow-x-auto">
                    <code>{`<LearningDashboard
  stats={learningStats}
  userName="Alex"
  childStats={childStats}
  availableWords={availableWords}
  onWordProgress={handleWordProgress}
  // ... existing props ...
  
  // Add these AI enhancement props:
  userId="user-123"
  enableAIEnhancement={true}
  selectedCategory={selectedCategory}
  userProgress={{
    rememberedWords: new Set([1, 2, 3]),
    forgottenWords: new Set([4, 5]),
    excludedWordIds: new Set()
  }}
  onSessionComplete={(sessionData) => {
    console.log("AI session completed:", sessionData);
  }}
/>`}</code>
                  </pre>
                </div>

                <h3 className="text-lg font-semibold">
                  Step 2: Required Props Explanation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-sky-600">
                      Essential Props
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        <code className="bg-surface-2 px-1 rounded">userId</code>{" "}
                        - Unique user identifier
                      </li>
                      <li>
                        <code className="bg-surface-2 px-1 rounded">
                          enableAIEnhancement
                        </code>{" "}
                        - Toggle AI features
                      </li>
                      <li>
                        <code className="bg-surface-2 px-1 rounded">
                          userProgress
                        </code>{" "}
                        - Learning progress data
                      </li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-jungle-600">
                      Optional Props
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li>
                        <code className="bg-surface-2 px-1 rounded">
                          selectedCategory
                        </code>{" "}
                        - Current category
                      </li>
                      <li>
                        <code className="bg-surface-2 px-1 rounded">
                          onSessionComplete
                        </code>{" "}
                        - Session callback
                      </li>
                      <li>
                        <code className="bg-surface-2 px-1 rounded">
                          childStats
                        </code>{" "}
                        - Performance data
                      </li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-lg font-semibold">
                  Step 3: Features You Get
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-sky-100 rounded-lg">
                    <Brain className="w-8 h-8 mx-auto mb-2 text-sky-600" />
                    <div className="text-sm font-medium">Smart Selection</div>
                  </div>
                  <div className="text-center p-4 bg-berry-100 rounded-lg">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-berry-600" />
                    <div className="text-sm font-medium">Analytics</div>
                  </div>
                  <div className="text-center p-4 bg-jungle-100 rounded-lg">
                    <Target className="w-8 h-8 mx-auto mb-2 text-jungle-600" />
                    <div className="text-sm font-medium">Personalization</div>
                  </div>
                  <div className="text-center p-4 bg-banana-100 rounded-lg">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-banana-600" />
                    <div className="text-sm font-medium">Real-time</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Play className="w-4 h-4" />
            <AlertDescription>
              <strong>Ready to Try:</strong> Switch to the "Live Demo" tab to
              experience the AI enhancement in action. Toggle between standard
              and AI modes to see the difference!
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Quick Action Footer */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">
            🚀 Ready to Enhance Your App?
          </h3>
          <p className="mb-4 opacity-90">
            The AI system is already integrated and ready to use. Just enable it
            in your components!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="secondary"
              className="bg-white text-sky-600 hover:bg-surface-2"
              onClick={() => (window.location.href = "#demo")}
            >
              <Play className="w-4 h-4 mr-2" />
              Try Demo
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => (window.location.href = "/")}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
