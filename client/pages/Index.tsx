import React, { useState, useEffect } from "react";
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
import { GameHub } from "@/components/games/GameHub";
import { VocabularyBuilder } from "@/components/VocabularyBuilder";
import { SettingsPanel } from "@/components/SettingsPanel";
import { FloatingBubbles } from "@/components/FloatingBubbles";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { DailyChallenge } from "@/components/DailyChallenge";
import { ReadingComprehension } from "@/components/ReadingComprehension";
import { ParentDashboard } from "@/components/ParentDashboard";
import { WordCreator } from "@/components/WordCreator";
import {
  wordsDatabase,
  getWordsByCategory,
  getRandomWords,
} from "@/data/wordsDatabase";
import { isBackgroundAnimationsEnabled } from "@/lib/backgroundAnimations";
import {
  generateQuizQuestions,
  generateMatchingPairs,
  generateFillInBlank,
  shuffleArray,
} from "@/lib/gameGeneration";
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
  Volume2,
  ImageIcon,
  PenTool,
  Clock,
  Shield,
  Crown,
  Menu,
  X,
  LogOut,
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
    "cards" | "builder" | "matching" | "selector"
  >("selector");
  const [showMatchingGame, setShowMatchingGame] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [userRole, setUserRole] = useState<"child" | "parent">("child");
  const [showWordCreator, setShowWordCreator] = useState(false);
  const [customWords, setCustomWords] = useState<any[]>([]);
  const [backgroundAnimationsEnabled, setBackgroundAnimationsEnabled] =
    useState(false);

  // New child-friendly states
  const [currentProfile, setCurrentProfile] = useState<any>(
    initialProfile || null,
  );
  const [feedback, setFeedback] = useState<any>(null);
  const [gameMode, setGameMode] = useState(false);
  const [showWordAdventure, setShowWordAdventure] = useState(false);
  const [showDefinitionDetective, setShowDefinitionDetective] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load background animations setting on mount
  useEffect(() => {
    setBackgroundAnimationsEnabled(isBackgroundAnimationsEnabled());

    // Listen for setting changes
    const handleAnimationsChange = (event: CustomEvent) => {
      setBackgroundAnimationsEnabled(event.detail);
    };

    window.addEventListener(
      "backgroundAnimationsChanged",
      handleAnimationsChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        "backgroundAnimationsChanged",
        handleAnimationsChange as EventListener,
      );
    };
  }, []);

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
        title: "Vocabulary Session Complete! ������",
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

  const handleSignOut = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-4 md:py-8">
          {/* Mobile header with hamburger menu */}
          <div className="flex items-center justify-between mb-4 md:hidden">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-bold">Word Adventure</h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all hover:bg-white/30"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Desktop header */}
          <div className="text-center max-w-4xl mx-auto hidden md:block">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              ⭐ Word Adventure
            </h1>
            <p className="text-lg md:text-xl mb-6 opacity-90">
              Welcome to your vocabulary adventure! Ready for some learning fun?
            </p>
          </div>

          {/* Mobile simplified header */}
          <div className="text-center md:hidden">
            <p className="text-sm opacity-90">
              Ready for your vocabulary adventure?
            </p>
          </div>
        </div>

        {/* Enhanced Floating Elements - hidden on mobile to reduce clutter, conditional on setting */}
        {backgroundAnimationsEnabled && (
          <>
            <div className="hidden md:block absolute top-10 left-10 text-3xl animate-bounce">
              🌟
            </div>
            <div className="hidden md:block absolute top-20 right-20 text-2xl animate-pulse">
              📚
            </div>
            <div className="hidden md:block absolute bottom-10 left-20 text-4xl animate-bounce delay-1000">
              🎯
            </div>
            <div className="hidden md:block absolute bottom-20 right-10 text-3xl animate-pulse delay-500">
              🚀
            </div>
            <div
              className="hidden md:block absolute top-1/2 left-5 text-2xl animate-spin"
              style={{ animationDuration: "3s" }}
            >
              ✨
            </div>
            <div className="hidden md:block absolute top-1/3 right-5 text-2xl animate-bounce delay-700">
              🎪
            </div>
          </>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 w-80 h-full bg-gradient-to-b from-purple-100 to-pink-100 p-6 flex flex-col shadow-2xl">
            {/* Mobile Navigation */}
            <nav className="flex-1 space-y-2">
              {[
                {
                  id: "dashboard",
                  icon: Target,
                  label: "Dashboard",
                  color: "purple",
                },
                {
                  id: "learn",
                  icon: BookOpen,
                  label: "Word Library",
                  color: "green",
                },
                { id: "quiz", icon: Brain, label: "Quiz Time", color: "pink" },
                {
                  id: "progress",
                  icon: Trophy,
                  label: "🌟 My Journey",
                  color: "yellow",
                },
              ].map(({ id, icon: Icon, label, color }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    activeTab === id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${activeTab === id ? "bg-white/20" : `bg-${color}-100`}`}
                  >
                    <Icon
                      className={`w-4 h-4 ${activeTab === id ? "text-white" : `text-${color}-600`}`}
                    />
                  </div>
                  <span className="font-semibold text-sm">{label}</span>
                </button>
              ))}

              <button
                onClick={() => {
                  setUserRole("parent");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all bg-white text-gray-700 hover:bg-blue-50 border-2 border-transparent"
              >
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-semibold text-sm">Parent Dashboard</span>
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white text-gray-700 hover:bg-purple-50 transition-all border border-purple-200"
              >
                <div className="p-2 rounded-lg bg-gray-100">
                  <Settings className="w-4 h-4 text-gray-600" />
                </div>
                <span className="font-semibold text-sm">Settings</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white text-gray-700 hover:bg-red-50 transition-all border border-red-200"
              >
                <div className="p-2 rounded-lg bg-red-100">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <span className="font-semibold text-sm">Sign Out</span>
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content with Sidebar Layout */}
      <main className="flex min-h-screen">
        {userRole === "parent" ? (
          <div className="w-full p-4 md:p-8">
            <ParentDashboard
              children={undefined}
              sessions={undefined}
              onNavigateBack={() => setUserRole("child")}
            />
          </div>
        ) : (
          <div className="flex w-full">
            {/* Desktop Left Sidebar */}
            <aside className="hidden md:flex w-72 bg-gradient-to-b from-purple-100 to-pink-100 border-r border-purple-200 p-6 flex-col">
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
                  onClick={() => setActiveTab("learn")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === "learn"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${activeTab === "learn" ? "bg-white/20" : "bg-green-100"}`}
                  >
                    <BookOpen
                      className={`w-5 h-5 ${activeTab === "learn" ? "text-white" : "text-green-600"}`}
                    />
                  </div>
                  <span className="font-semibold">Word Library</span>
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
                  <span className="font-semibold">🌟 My Journey</span>
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

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white text-gray-700 hover:bg-red-50 transition-all border border-red-200"
                >
                  <div className="p-2 rounded-xl bg-red-100">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-semibold">Sign Out</span>
                </button>
              </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsContent value="dashboard">
                  <LearningDashboard
                    stats={learningStats}
                    userName="Explorer"
                  />
                </TabsContent>

                <TabsContent value="learn">
                  <div className="space-y-8">
                    {selectedCategory === "all" &&
                    learningMode === "selector" ? (
                      <ChildFriendlyCategorySelector
                        selectedCategory={selectedCategory}
                        onSelectCategory={(category) => {
                          handleCategoryChange(category);
                          if (category === "all") {
                            setLearningMode("cards");
                          } else {
                            setLearningMode("cards");
                          }
                        }}
                        userInterests={currentProfile?.interests || []}
                      />
                    ) : (
                      <>
                        <div className="text-center">
                          <h2 className="text-3xl font-bold text-slate-800 mb-4">
                            Word Library
                          </h2>
                          <p className="text-slate-600 mb-8">
                            Choose how you'd like to explore and learn
                            vocabulary!
                          </p>

                          <div className="flex justify-center gap-2 md:gap-4 mb-6 md:mb-8 flex-wrap px-4 md:px-0">
                            <Button
                              onClick={() => setLearningMode("cards")}
                              variant={
                                learningMode === "cards" ? "default" : "outline"
                              }
                              className="flex items-center gap-1 md:gap-2 text-sm md:text-base px-3 md:px-4"
                            >
                              <BookOpen className="w-4 h-4" />
                              <span className="hidden sm:inline">
                                Word Cards
                              </span>
                              <span className="sm:hidden">Cards</span>
                            </Button>
                            <Button
                              onClick={() => setLearningMode("builder")}
                              variant={
                                learningMode === "builder"
                                  ? "default"
                                  : "outline"
                              }
                              className="flex items-center gap-1 md:gap-2 text-sm md:text-base px-3 md:px-4"
                            >
                              <Brain className="w-4 h-4" />
                              <span className="hidden sm:inline">
                                Vocabulary Builder
                              </span>
                              <span className="sm:hidden">Builder</span>
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedCategory("all");
                                setLearningMode("selector");
                              }}
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
                                  {displayWords.length > 0 && (
                                    <>
                                      <div className="max-w-sm md:max-w-md mx-auto px-2 md:px-0">
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

                                      <div className="flex justify-center gap-2 md:gap-4 px-4 md:px-0">
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
                  {!showQuiz && !gameMode && !showMatchingGame ? (
                    <div className="space-y-8">
                      {/* Quiz Header */}
                      <div className="text-center">
                        <div className="flex justify-center mb-6">
                          <div className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink p-6 rounded-full shadow-2xl">
                            <Brain className="w-16 h-16 text-white" />
                          </div>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
                          �� Quiz & Game Time!
                        </h2>
                        <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8">
                          Test your vocabulary knowledge with fun quizzes and
                          interactive games! Choose your challenge below.
                        </p>
                      </div>

                      {/* All Unique Games and Quizzes - NO DUPLICATES, NO FOLDERS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {/* Word Adventure Quest */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-educational-green/30">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🗺️</div>
                            <h3 className="text-xl font-bold text-educational-green mb-2">
                              Word Adventure Quest
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Journey through words with your learning buddy!
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-educational-green/20 text-educational-green px-2 py-1 rounded-full text-xs">
                                Easy
                              </span>
                              <span className="bg-educational-green/20 text-educational-green px-2 py-1 rounded-full text-xs">
                                2-5 min
                              </span>
                            </div>
                            <Button
                              onClick={() => setShowWordAdventure(true)}
                              className="w-full bg-educational-green text-white hover:bg-educational-green/90"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Quest!
                            </Button>
                          </CardContent>
                        </Card>



                        {/* Matching Game */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-educational-purple/30">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🧩</div>
                            <h3 className="text-xl font-bold text-educational-purple mb-2">
                              Matching Game
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Match words with their meanings in this brain
                              game!
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-educational-purple/20 text-educational-purple px-2 py-1 rounded-full text-xs">
                                Memory Challenge
                              </span>
                              <span className="bg-educational-purple/20 text-educational-purple px-2 py-1 rounded-full text-xs">
                                Timed
                              </span>
                            </div>
                            <Button
                              onClick={() => setShowMatchingGame(true)}
                              className="w-full bg-educational-purple text-white hover:bg-educational-purple/90"
                            >
                              <Shuffle className="w-4 h-4 mr-2" />
                              Start Matching!
                            </Button>
                          </CardContent>
                        </Card>
                        {/* Easy Quiz */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 md:hover:scale-105 border-2 border-educational-green/30">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🌱</div>
                            <h3 className="text-xl font-bold text-educational-green mb-2">
                              Easy Quiz
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Perfect for beginners! Simple words and
                              definitions.
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-educational-green/20 text-educational-green px-2 py-1 rounded-full text-xs">
                                5 Questions
                              </span>
                              <span className="bg-educational-green/20 text-educational-green px-2 py-1 rounded-full text-xs">
                                30s Each
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("quick");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-educational-green text-white hover:bg-educational-green/90"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Easy Quiz
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Standard Quiz */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-educational-blue/30">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold text-educational-blue mb-2">
                              Standard Quiz
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Medium difficulty with mixed vocabulary
                              challenges.
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-educational-blue/20 text-educational-blue px-2 py-1 rounded-full text-xs">
                                10 Questions
                              </span>
                              <span className="bg-educational-blue/20 text-educational-blue px-2 py-1 rounded-full text-xs">
                                30s Each
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("standard");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-educational-blue text-white hover:bg-educational-blue/90"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Standard Quiz
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Challenge Quiz */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-educational-purple/30">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">🏆</div>
                            <h3 className="text-xl font-bold text-educational-purple mb-2">
                              Challenge Quiz
                            </h3>
                            <p className="text-gray-600 mb-4">
                              For advanced learners! Tricky words and concepts.
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-educational-purple/20 text-educational-purple px-2 py-1 rounded-full text-xs">
                                15 Questions
                              </span>
                              <span className="bg-educational-purple/20 text-educational-purple px-2 py-1 rounded-full text-xs">
                                25s Each
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("challenge");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-educational-purple text-white hover:bg-educational-purple/90"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Challenge Quiz
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Picture Quiz */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-educational-orange/30">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">📸</div>
                            <h3 className="text-xl font-bold text-educational-orange mb-2">
                              Picture Quiz
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Visual learning! Match pictures with words.
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-educational-orange/20 text-educational-orange px-2 py-1 rounded-full text-xs">
                                8 Questions
                              </span>
                              <span className="bg-educational-orange/20 text-educational-orange px-2 py-1 rounded-full text-xs">
                                35s Each
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("picture");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-educational-orange text-white hover:bg-educational-orange/90"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Picture Quiz
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Spelling Quiz */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-educational-pink/30">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">✏️</div>
                            <h3 className="text-xl font-bold text-educational-pink mb-2">
                              Spelling Quiz
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Test your spelling skills with audio challenges.
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-educational-pink/20 text-educational-pink px-2 py-1 rounded-full text-xs">
                                10 Questions
                              </span>
                              <span className="bg-educational-pink/20 text-educational-pink px-2 py-1 rounded-full text-xs">
                                45s Each
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("spelling");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-educational-pink text-white hover:bg-educational-pink/90"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Spelling Quiz
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Speed Quiz */}
                        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-educational-yellow/30">
                          <CardContent className="p-6 text-center">
                            <div className="text-6xl mb-4">⚡</div>
                            <h3 className="text-xl font-bold text-educational-yellow mb-2">
                              Speed Quiz
                            </h3>
                            <p className="text-gray-600 mb-4">
                              Quick-fire questions! How fast can you answer?
                            </p>
                            <div className="flex justify-center gap-2 mb-4">
                              <span className="bg-educational-yellow/20 text-educational-yellow px-2 py-1 rounded-full text-xs">
                                20 Questions
                              </span>
                              <span className="bg-educational-yellow/20 text-educational-yellow px-2 py-1 rounded-full text-xs">
                                15s Each
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedQuizType("speed");
                                setShowQuiz(true);
                              }}
                              className="w-full bg-educational-yellow text-white hover:bg-educational-yellow/90"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Speed Quiz
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Recent Scores */}
                      <div className="max-w-2xl mx-auto">
                        <Card className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-educational-orange" />
                              Your Recent Quiz Scores
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🎯</span>
                                  <div>
                                    <div className="font-semibold">
                                      Standard Quiz
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Yesterday
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-educational-blue">
                                    8/10
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    80%
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🌱</span>
                                  <div>
                                    <div className="font-semibold">
                                      Easy Quiz
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      2 days ago
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-educational-green">
                                    5/5
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    100%
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">🏆</span>
                                  <div>
                                    <div className="font-semibold">
                                      Challenge Quiz
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      3 days ago
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-educational-purple">
                                    12/15
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    80%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
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
                      onBack={() => setGameMode(false)}
                      userProfile={currentProfile}
                    />
                  ) : showWordAdventure ? (
                    <GameLikeLearning
                      words={(() => {
                        const categoryWords =
                          selectedCategory === "all"
                            ? getRandomWords(20)
                            : getWordsByCategory(selectedCategory);
                        return categoryWords.slice(0, 10);
                      })()}
                      onComplete={(score, totalWords) => {
                        setShowWordAdventure(false);
                        setFeedback({
                          type: "celebration",
                          title: "Word Adventure Complete! 🗺️",
                          message: `You learned ${score} out of ${totalWords} words!`,
                          points: score * 10,
                          onContinue: () => setFeedback(null),
                        });
                      }}
                      onBack={() => setShowWordAdventure(false)}
                      userProfile={currentProfile}
                    />
                  ) : showMatchingGame ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">
                          🧩 Word Matching Game
                        </h2>
                        <Button
                          onClick={() => setShowMatchingGame(false)}
                          variant="outline"
                          size="sm"
                        >
                          ← Back to Games
                        </Button>
                      </div>
                      <WordMatchingGame
                        pairs={generateMatchingPairs(
                          6,
                          undefined,
                          selectedCategory,
                        )}
                        onComplete={(score, timeSpent) => {
                          setShowMatchingGame(false);
                          setFeedback({
                            type: "celebration",
                            title: "Matching Game Complete! 🎯",
                            message: `You matched ${score} pairs in ${timeSpent} seconds!`,
                            points: score * 15,
                            onContinue: () => setFeedback(null),
                          });
                        }}
                      />
                    </div>
                  ) : (
                    <QuizGame
                      questions={(() => {
                        const generateQuizQuestionsByType = (type: string) => {
                          switch (type) {
                            case "quick":
                              return generateQuizQuestions(
                                5,
                                "easy",
                                selectedCategory,
                                "definition",
                              );

                            case "standard":
                              return generateQuizQuestions(
                                10,
                                undefined,
                                selectedCategory,
                                "definition",
                              );

                            case "challenge":
                              return generateQuizQuestions(
                                15,
                                "hard",
                                selectedCategory,
                                "definition",
                              );

                            case "picture":
                              return generateQuizQuestions(
                                8,
                                undefined,
                                selectedCategory,
                                "picture",
                              );

                            case "spelling":
                              return generateQuizQuestions(
                                10,
                                undefined,
                                selectedCategory,
                                "spelling",
                              );

                            case "speed":
                              return generateQuizQuestions(
                                20,
                                undefined,
                                selectedCategory,
                                "definition",
                              );

                            default:
                              return generateQuizQuestions(
                                10,
                                undefined,
                                selectedCategory,
                                "definition",
                              );
                          }
                        };

                        return generateQuizQuestionsByType(selectedQuizType);
                      })()}
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
              </Tabs>
            </div>
          </div>
        )}
      </main>

      {/* Enhanced Components */}
      {showCelebration && <CelebrationEffect />}
      {backgroundAnimationsEnabled && <FloatingBubbles />}

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
      <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-40">
        <div
          className="bg-gradient-to-r from-educational-purple to-educational-pink p-3 md:p-4 rounded-full shadow-2xl cursor-pointer md:hover:scale-110 transition-all duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center"
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
          <Heart className="w-5 md:w-6 h-5 md:h-6 text-white fill-current animate-pulse" />
        </div>
      </div>
    </div>
  );
}
