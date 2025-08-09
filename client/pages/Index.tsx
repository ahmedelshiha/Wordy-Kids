import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WordCard } from "@/components/WordCard";
import { LearningDashboard } from "@/components/LearningDashboard";
import { QuizGame } from "@/components/QuizGame";
import { ChildFriendlyCategorySelector } from "@/components/ChildFriendlyCategorySelector";
import { EnhancedChildLogin } from "@/components/EnhancedChildLogin";
import { AvatarCustomization } from "@/components/AvatarCustomization";
import { AchievementSystem } from "@/components/AchievementSystem";
import { EncouragingFeedback } from "@/components/EncouragingFeedback";
import { GameLikeLearning } from "@/components/GameLikeLearning";
import { WordMatchingGame } from "@/components/WordMatchingGame";
import { VocabularyBuilder } from "@/components/VocabularyBuilder";
import { SettingsPanel } from "@/components/SettingsPanel";
import { FloatingBubbles } from "@/components/FloatingBubbles";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { DailyChallenge } from "@/components/DailyChallenge";
import { ReadingComprehension } from "@/components/ReadingComprehension";
import { ParentDashboard } from "@/components/ParentDashboard";
import { WordCreator } from "@/components/WordCreator";
import { LearningAnalytics } from "@/components/LearningAnalytics";
import {
  wordsDatabase,
  getWordsByCategory,
  getRandomWords,
} from "@/data/wordsDatabase";
import {
  BookOpen,
  Play,
  Trophy,
  Users,
  Sparkles,
  ArrowRight,
  Star,
  Target,
  Heart,
  Gamepad2,
  Brain,
  Shuffle,
  Settings,
  Calendar,
  FileText,
  Plus,
  TrendingUp,
  Zap,
  ImageIcon,
  PenTool,
  Clock,
  Shield,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const learningStats = {
  wordsLearned: 68,
  totalWords: wordsDatabase.length,
  currentStreak: 7,
  weeklyGoal: 20,
  weeklyProgress: 18,
  accuracyRate: 92,
  favoriteCategory: "Animals",
  totalPoints: 2850,
  level: 4,
  badges: [
    {
      id: "first-word",
      name: "First Word",
      icon: "🎯",
      earned: true,
      description: "Learned your first word",
    },
    {
      id: "streak-starter",
      name: "Streak Master",
      icon: "🔥",
      earned: true,
      description: "7-day learning streak",
    },
    {
      id: "category-explorer",
      name: "Category Explorer",
      icon: "🗺️",
      earned: true,
      description: "Explored 5+ categories",
    },
    {
      id: "science-star",
      name: "Science Star",
      icon: "🔬",
      earned: true,
      description: "Mastered 10 science words",
    },
    {
      id: "quiz-master",
      name: "Quiz Master",
      icon: "🧠",
      earned: false,
      description: "Score 100% on 5 quizzes",
    },
    {
      id: "vocabulary-champion",
      name: "Vocabulary Champion",
      icon: "🏆",
      earned: false,
      description: "Learn 100 words",
    },
  ],
};

interface IndexProps {
  initialProfile?: any;
}

export default function Index({ initialProfile }: IndexProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState<
    "quick" | "standard" | "challenge" | "picture" | "spelling" | "speed"
  >("standard");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [learningMode, setLearningMode] = useState<
    "cards" | "builder" | "matching"
  >("cards");
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [userRole, setUserRole] = useState<"child" | "parent">("child");
  const [showWordCreator, setShowWordCreator] = useState(false);
  const [customWords, setCustomWords] = useState<any[]>([]);

  // New child-friendly states
  const [currentProfile, setCurrentProfile] = useState<any>(initialProfile || null);
  const [feedback, setFeedback] = useState<any>(null);
  const [gameMode, setGameMode] = useState(false);

  const handleQuizComplete = (score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);
    setFeedback({
      type: "celebration",
      title: "Quiz Complete! 🎉",
      message: `You scored ${score}/${total} (${percentage}%)`,
      points: score * 10,
      onContinue: () => setFeedback(null),
    });
    setShowQuiz(false);
  };

  const handleQuizExit = () => {
    setShowQuiz(false);
  };

  const handleMatchingComplete = (score: number, timeSpent: number) => {
    setShowCelebration(true);
    setTimeout(() => {
      setFeedback({
        type: "celebration",
        title: "Matching Game Complete! 🎯",
        message: `You matched ${score} pairs in ${timeSpent} seconds!`,
        points: score * 15,
        onContinue: () => setFeedback(null),
      });
      setShowCelebration(false);
    }, 2000);
  };

  const handleVocabularySessionComplete = (
    wordsReviewed: number,
    accuracy: number,
  ) => {
    setShowCelebration(true);
    setTimeout(() => {
      setFeedback({
        type: "celebration",
        title: "Vocabulary Session Complete! 📚",
        message: `Reviewed ${wordsReviewed} words with ${accuracy}% accuracy!`,
        points: wordsReviewed * accuracy,
        onContinue: () => setFeedback(null),
      });
      setShowCelebration(false);
    }, 2000);
  };

  const handleWordMastered = (
    wordId: number,
    rating: "easy" | "medium" | "hard",
  ) => {
    console.log(`Word ${wordId} rated as ${rating}`);
  };

  const handleWordCreated = (newWord: any) => {
    setCustomWords([...customWords, { ...newWord, id: Date.now() }]);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };


  const handleGameComplete = (score: number, totalWords: number) => {
    setGameMode(false);
    setFeedback({
      type: "celebration",
      title: "Amazing Game! 🏆",
      message: `You scored ${score} points and learned ${totalWords} words!`,
      points: score,
      onContinue: () => setFeedback(null),
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentWordIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              ⭐ Word Adventure
            </h1>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Welcome back, {currentProfile?.name}! Ready for more vocabulary
              fun?
            </p>
          </div>
        </div>

        {/* Enhanced Floating Elements */}
        <div className="absolute top-10 left-10 text-3xl animate-bounce">
          🌟
        </div>
        <div className="absolute top-20 right-20 text-2xl animate-pulse">
          📚
        </div>
        <div className="absolute bottom-10 left-20 text-4xl animate-bounce delay-1000">
          🎯
        </div>
        <div className="absolute bottom-20 right-10 text-3xl animate-pulse delay-500">
          🚀
        </div>
        <div
          className="absolute top-1/2 left-5 text-2xl animate-spin"
          style={{ animationDuration: "3s" }}
        >
          ✨
        </div>
        <div className="absolute top-1/3 right-5 text-2xl animate-bounce delay-700">
          🎪
        </div>
      </header>

      {/* Main Content with Sidebar Layout */}
      <main className="flex min-h-screen">
        {userRole === "parent" ? (
          <div className="w-full p-8">
            <ParentDashboard
              children={undefined}
              sessions={undefined}
              onNavigateBack={() => setUserRole("child")}
            />
          </div>
        ) : (
          <div className="flex w-full">
            {/* Left Sidebar */}
            <aside className="w-72 bg-gradient-to-b from-purple-100 to-pink-100 border-r border-purple-200 p-6 flex flex-col">
              {/* Enhanced User Profile Section */}
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl p-6 mb-6 shadow-xl border border-purple-100">
                <div className="text-center">
                  {/* Avatar with Status Ring */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-educational-green to-educational-blue rounded-full p-1">
                      <div className="rounded-full p-1">
                        <div
                          className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentProfile?.theme?.gradient || "from-educational-blue to-educational-purple"} flex items-center justify-center text-3xl shadow-lg`}
                        >
                          {currentProfile?.avatar?.emoji || "🌟"}
                        </div>
                      </div>
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                  </div>

                  {/* User Name and Title */}
                  <h3 className="font-bold text-xl text-gray-800 mb-1">
                    {currentProfile?.name || "Word Explorer"}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <Crown className="w-4 h-4 text-educational-orange fill-current" />
                    <span className="text-sm font-semibold text-educational-purple">
                      {currentProfile?.levelName || "Story Builder"}
                    </span>
                  </div>

                  {/* Level and XP */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-lg font-bold text-gray-700">
                      Level {currentProfile?.level || 3}
                    </span>
                    <div className="ml-2 bg-educational-orange text-white px-2 py-1 rounded-full text-xs font-bold">
                      {currentProfile?.points || 1850} XP
                    </div>
                  </div>

                  {/* Progress Bar with Better Calculation */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">Progress to Level {(currentProfile?.level || 3) + 1}</span>
                      <span className="text-xs font-bold text-educational-purple">
                        {Math.min(Math.round(((currentProfile?.wordsLearned || 45) / 100) * 100), 100)}%
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`bg-gradient-to-r ${currentProfile?.theme?.gradient || "from-educational-blue to-educational-purple"} h-3 rounded-full transition-all duration-500 relative`}
                        style={{
                          width: `${Math.min(((currentProfile?.wordsLearned || 45) / 100) * 100, 100)}%`,
                        }}
                      >
                        <div className="absolute inset-0 bg-white/30"></div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-educational-blue/10 rounded-xl p-3">
                      <div className="text-lg font-bold text-educational-blue">
                        {currentProfile?.wordsLearned || 45}
                      </div>
                      <div className="text-xs text-gray-600">Words Mastered</div>
                    </div>
                    <div className="bg-educational-orange/10 rounded-xl p-3">
                      <div className="text-lg font-bold text-educational-orange flex items-center justify-center gap-1">
                        <span>{currentProfile?.streak || 12}</span>
                        <span className="text-sm">🔥</span>
                      </div>
                      <div className="text-xs text-gray-600">Day Streak</div>
                    </div>
                  </div>

                  {/* Achievements Badge */}
                  <div className="bg-gradient-to-r from-educational-purple/10 to-educational-pink/10 rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-educational-purple" />
                      <span className="text-sm font-semibold text-educational-purple">
                        {currentProfile?.accuracy || 87}% Accuracy
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {currentProfile?.totalQuizzes || 8} quizzes completed
                    </div>
                  </div>

                  {/* Quick Status */}
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Active {currentProfile?.lastActive || "Today"}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="flex-1 space-y-3">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === "dashboard"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${activeTab === "dashboard" ? "bg-white/20" : "bg-purple-100"}`}
                  >
                    <Target
                      className={`w-5 h-5 ${activeTab === "dashboard" ? "text-white" : "text-purple-600"}`}
                    />
                  </div>
                  <span className="font-semibold">Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === "quiz"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${activeTab === "quiz" ? "bg-white/20" : "bg-pink-100"}`}
                  >
                    <Brain
                      className={`w-5 h-5 ${activeTab === "quiz" ? "text-white" : "text-pink-600"}`}
                    />
                  </div>
                  <span className="font-semibold">Quiz Time</span>
                </button>

                <button
                  onClick={() => setActiveTab("progress")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === "progress"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${activeTab === "progress" ? "bg-white/20" : "bg-yellow-100"}`}
                  >
                    <Trophy
                      className={`w-5 h-5 ${activeTab === "progress" ? "text-white" : "text-yellow-600"}`}
                    />
                  </div>
                  <span className="font-semibold">Achievements</span>
                </button>

                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === "analytics"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${activeTab === "analytics" ? "bg-white/20" : "bg-green-100"}`}
                  >
                    <TrendingUp
                      className={`w-5 h-5 ${activeTab === "analytics" ? "text-white" : "text-green-600"}`}
                    />
                  </div>
                  <span className="font-semibold">Progress</span>
                </button>

                <button
                  onClick={() => setUserRole("parent")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent"
                >
                  <div className="p-2 rounded-xl bg-blue-100">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold">Parent Dashboard</span>
                </button>

                <button
                  onClick={() => navigate("/admin")}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all bg-white text-gray-700 hover:bg-red-50 hover:border-red-200 border-2 border-transparent"
                >
                  <div className="p-2 rounded-xl bg-red-100">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-semibold">Administrator Dashboard</span>
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white text-gray-700 hover:bg-purple-50 transition-all border border-purple-200"
                >
                  <div className="p-2 rounded-xl bg-gray-100">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-semibold">Settings</span>
                </button>
              </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsContent value="dashboard">
                  <LearningDashboard
                    stats={learningStats}
                    userName={currentProfile?.name || "Alex"}
                  />
                </TabsContent>

                <TabsContent value="learn">
                  <div className="space-y-8">
                    {selectedCategory === "all" ? (
                      <ChildFriendlyCategorySelector
                        selectedCategory={selectedCategory}
                        onSelectCategory={(category) => {
                          handleCategoryChange(category);
                          setLearningMode("cards");
                        }}
                        userInterests={currentProfile?.interests || []}
                      />
                    ) : gameMode ? (
                      <GameLikeLearning
                        words={(() => {
                          const categoryWords =
                            selectedCategory === "all"
                              ? getRandomWords(20)
                              : getWordsByCategory(selectedCategory);
                          return categoryWords.slice(0, 10);
                        })()}
                        onComplete={handleGameComplete}
                        userProfile={currentProfile}
                      />
                    ) : (
                      <>
                        <div className="text-center">
                          <h2 className="text-3xl font-bold text-slate-800 mb-4">
                            Learning Mode
                          </h2>
                          <p className="text-slate-600 mb-8">
                            Choose how you'd like to learn your vocabulary!
                          </p>

                          <div className="flex justify-center gap-4 mb-8 flex-wrap">
                            <Button
                              onClick={() => setLearningMode("cards")}
                              variant={
                                learningMode === "cards" ? "default" : "outline"
                              }
                              className="flex items-center gap-2"
                            >
                              <BookOpen className="w-4 h-4" />
                              Word Cards
                            </Button>
                            <Button
                              onClick={() => setLearningMode("builder")}
                              variant={
                                learningMode === "builder"
                                  ? "default"
                                  : "outline"
                              }
                              className="flex items-center gap-2"
                            >
                              <Brain className="w-4 h-4" />
                              Vocabulary Builder
                            </Button>
                            <Button
                              onClick={() => setGameMode(true)}
                              variant="default"
                              className="flex items-center gap-2 bg-gradient-to-r from-educational-green to-educational-blue text-white"
                            >
                              <Gamepad2 className="w-4 h-4" />
                              Game Mode! 🎮
                            </Button>
                            <Button
                              onClick={() => setSelectedCategory("all")}
                              variant="ghost"
                            >
                              ← Back to Categories
                            </Button>
                          </div>
                        </div>

                        {learningMode === "cards" && (
                          <>
                            {(() => {
                              const categoryWords =
                                selectedCategory === "all"
                                  ? getRandomWords(20)
                                  : getWordsByCategory(selectedCategory);
                              const displayWords = categoryWords.slice(0, 20);

                              return (
                                <>
                                  <div className="flex justify-center mb-6">
                                    <div className="flex flex-wrap gap-2 max-w-lg">
                                      {displayWords.map((_, index) => (
                                        <Button
                                          key={index}
                                          size="sm"
                                          variant={
                                            currentWordIndex === index
                                              ? "default"
                                              : "outline"
                                          }
                                          onClick={() =>
                                            setCurrentWordIndex(index)
                                          }
                                          className="w-8 h-8 p-0"
                                        >
                                          {index + 1}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>

                                  {displayWords.length > 0 && (
                                    <>
                                      <div className="max-w-md mx-auto">
                                        <WordCard
                                          word={
                                            displayWords[currentWordIndex] ||
                                            displayWords[0]
                                          }
                                          onPronounce={(word) =>
                                            console.log(
                                              "Playing pronunciation for:",
                                              word.word,
                                            )
                                          }
                                          onFavorite={(word) =>
                                            console.log("Favorited:", word.word)
                                          }
                                        />
                                      </div>

                                      <div className="flex justify-center gap-4">
                                        <Button
                                          onClick={() =>
                                            setCurrentWordIndex(
                                              Math.max(0, currentWordIndex - 1),
                                            )
                                          }
                                          disabled={currentWordIndex === 0}
                                          variant="outline"
                                        >
                                          Previous
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            setCurrentWordIndex(
                                              Math.min(
                                                displayWords.length - 1,
                                                currentWordIndex + 1,
                                              ),
                                            )
                                          }
                                          disabled={
                                            currentWordIndex ===
                                            displayWords.length - 1
                                          }
                                        >
                                          Next
                                          <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                      </div>

                                      <div className="text-center mt-4">
                                        <Badge
                                          variant="outline"
                                          className="text-sm"
                                        >
                                          {selectedCategory === "all"
                                            ? "Random Selection"
                                            : `${selectedCategory} Category`}{" "}
                                          - Word {currentWordIndex + 1} of{" "}
                                          {displayWords.length}
                                        </Badge>
                                      </div>
                                    </>
                                  )}
                                </>
                              );
                            })()}
                          </>
                        )}

                        {learningMode === "builder" && (
                          <VocabularyBuilder
                            words={wordsDatabase.map((word) => ({
                              ...word,
                              masteryLevel: Math.floor(Math.random() * 100),
                              lastReviewed: new Date(
                                Date.now() -
                                  Math.random() * 7 * 24 * 60 * 60 * 1000,
                              ),
                              nextReview: new Date(
                                Date.now() +
                                  Math.random() * 3 * 24 * 60 * 60 * 1000,
                              ),
                            }))}
                            onWordMastered={handleWordMastered}
                            onSessionComplete={handleVocabularySessionComplete}
                          />
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="quiz">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">
                      🧠 Quiz Time!
                    </h2>
                    <p className="text-slate-600 mb-8">
                      Test your vocabulary knowledge with fun quizzes!
                    </p>
                    <Button
                      onClick={() => setShowQuiz(true)}
                      className="bg-gradient-to-r from-educational-blue to-educational-purple text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Quiz
                    </Button>
                  </div>

                  {showQuiz && (
                    <QuizGame
                      questions={[]}
                      onComplete={handleQuizComplete}
                      onExit={handleQuizExit}
                    />
                  )}
                </TabsContent>

                <TabsContent value="progress">
                  <AchievementSystem
                    onUnlock={(achievement) => {
                      setFeedback({
                        type: "celebration",
                        title: "Achievement Unlocked! 🏆",
                        message: `You earned: ${achievement.name}`,
                        onContinue: () => setFeedback(null),
                      });
                    }}
                  />
                </TabsContent>

                <TabsContent value="analytics">
                  <LearningAnalytics />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Components */}
      {showCelebration && <CelebrationEffect />}
      <FloatingBubbles />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Word Creator */}
      {showWordCreator && (
        <WordCreator
          onSave={handleWordCreated}
          onClose={() => setShowWordCreator(false)}
        />
      )}

      {/* Feedback System */}
      {feedback && (
        <EncouragingFeedback
          feedback={feedback}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Floating Helper */}
      <div className="fixed bottom-6 right-6 z-40">
        <div
          className="bg-gradient-to-r from-educational-purple to-educational-pink p-4 rounded-full shadow-2xl cursor-pointer hover:scale-110 transition-all duration-300"
          onClick={() =>
            setFeedback({
              type: "encouragement",
              title: "Need Help? 🤗",
              message:
                "You're doing amazing! Keep learning and exploring new words!",
              onContinue: () => setFeedback(null),
            })
          }
        >
          <Heart className="w-6 h-6 text-white fill-current animate-pulse" />
        </div>
      </div>
    </div>
  );
}
