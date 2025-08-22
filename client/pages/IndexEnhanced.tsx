import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WordCard } from "@/components/WordCard";
import { LearningDashboard } from "@/components/LearningDashboard";
import { QuizGame } from "@/components/QuizGame";
import { ChildFriendlyCategorySelector } from "@/components/ChildFriendlyCategorySelector";
import { ChildLogin } from "@/components/ChildLogin";
import { AvatarCustomization } from "@/components/AvatarCustomization";
import { AchievementSystem } from "@/components/AchievementSystem";
import { EncouragingFeedback } from "@/components/EncouragingFeedback";
import { GameLikeLearning } from "@/components/GameLikeLearning";
import { WordMatchingGame } from "@/components/WordMatchingGame";
import { VocabularyBuilder } from "@/components/VocabularyBuilder";
import JungleAdventureSettingsPanelV2 from "@/components/JungleAdventureSettingsPanelV2";
import { FloatingBubbles } from "@/components/FloatingBubbles";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { FloatingHelpMenu } from "@/components/FloatingHelpMenu";
import { DailyChallenge } from "@/components/DailyChallenge";
import { ReadingComprehension } from "@/components/ReadingComprehension";
import { JungleAdventureParentDashboard } from "@/components/JungleAdventureParentDashboard";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sample data for learning
const sampleWords = [
  {
    id: 1,
    word: "adventure",
    pronunciation: "/ədˈven(t)SHər/",
    definition:
      "An exciting or unusual experience, often involving exploration or discovery",
    example: "Reading books takes you on amazing adventures to new worlds",
    funFact:
      "The word 'adventure' comes from Latin 'adventurus' meaning 'about to arrive'",
    emoji: "🗺️",
    category: "general",
    difficulty: "medium" as const,
    imageUrl: undefined,
  },
  {
    id: 2,
    word: "butterfly",
    pronunciation: "/ˈbʌdərˌflaɪ/",
    definition:
      "A colorful flying insect with large, often brightly colored wings",
    example: "The butterfly landed gently on the bright yellow flower",
    funFact:
      "Butterflies taste with their feet and can see ultraviolet colors!",
    emoji: "🦋",
    category: "animals",
    difficulty: "easy" as const,
    imageUrl: undefined,
  },
  {
    id: 3,
    word: "telescope",
    pronunciation: "/ˈtelɪskoʊp/",
    definition:
      "An instrument used to see distant objects, especially stars and planets",
    example: "Through the telescope, we could see the craters on the moon",
    funFact:
      "The first telescope was invented in 1608 and made stars look 20 times closer!",
    emoji: "🔭",
    category: "science",
    difficulty: "hard" as const,
    imageUrl: undefined,
  },
  {
    id: 4,
    word: "rainbow",
    pronunciation: "/ˈreɪnboʊ/",
    definition:
      "A colorful arc in the sky formed by sunlight and water droplets",
    example: "After the rain, a beautiful rainbow appeared in the sky",
    funFact: "Rainbows always appear in the opposite direction from the sun!",
    emoji: "🌈",
    category: "nature",
    difficulty: "easy" as const,
    imageUrl: undefined,
  },
  {
    id: 5,
    word: "magnificent",
    pronunciation: "/mæɡˈnɪfɪsənt/",
    definition: "Extremely beautiful, impressive, or grand in scale",
    example: "The magnificent castle stood tall against the mountain backdrop",
    funFact: "The word comes from Latin 'magnificus' meaning 'great in deed'",
    emoji: "✨",
    category: "general",
    difficulty: "hard" as const,
    imageUrl: undefined,
  },
];

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

export default function IndexEnhanced() {
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [showProfileCreation, setShowProfileCreation] = useState(false);
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

  const handleLogin = (profile: any) => {
    setCurrentProfile(profile);
    setIsLoggedIn(true);
    setFeedback({
      type: "success",
      title: `Welcome back, ${profile.name}! 🌟`,
      message: "Ready to continue your vocabulary adventure?",
      onContinue: () => setFeedback(null),
      autoHide: true,
    });
  };

  const handleProfileCreation = (newProfile: any) => {
    setCurrentProfile(newProfile);
    setIsLoggedIn(true);
    setShowProfileCreation(false);
    setFeedback({
      type: "celebration",
      title: "Profile Created! 🎉",
      message: `Welcome to Wordy Kids, ${newProfile.name}! Your learning journey begins now!`,
      onContinue: () => setFeedback(null),
    });
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

  // Show login screen for children
  if (!isLoggedIn) {
    if (showProfileCreation) {
      return (
        <AvatarCustomization
          onCreateProfile={handleProfileCreation}
          onBack={() => setShowProfileCreation(false)}
        />
      );
    }

    return (
      <ChildLogin
        onLogin={handleLogin}
        onCreateProfile={() => setShowProfileCreation(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink text-white">
        <div className="relative container mx-auto px-4 py-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              🌟 Wordy Kids!
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
            <JungleAdventureParentDashboard
              onBack={() => setUserRole("child")}
              className="min-h-screen"
            />
          </div>
        ) : (
          <div className="flex w-full">
            {/* Left Sidebar */}
            <aside className="w-72 bg-gradient-to-b from-purple-100 to-pink-100 border-r border-purple-200 p-6 flex flex-col">
              {/* User Profile Section */}
              <div className="bg-white rounded-3xl p-6 mb-6 shadow-lg">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentProfile?.theme?.gradient || "from-purple-400 to-pink-400"} flex items-center justify-center mx-auto mb-4 text-3xl`}
                  >
                    {currentProfile?.avatar?.emoji || "🎯"}
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {currentProfile?.name || "demo"}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">
                      Level {currentProfile?.level || 5}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 mb-2">
                    <div
                      className={`bg-gradient-to-r ${currentProfile?.theme?.gradient || "from-purple-400 to-pink-400"} h-2 rounded-full`}
                      style={{
                        width: `${Math.min(((currentProfile?.wordsLearned || 0) / 100) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Progress:{" "}
                    {Math.round(
                      ((currentProfile?.wordsLearned || 0) / 100) * 100,
                    )}
                    %
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentProfile?.wordsLearned || 0} words learned
                  </p>
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
                  onClick={() => setActiveTab("learn")}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    activeTab === "learn"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl ${activeTab === "learn" ? "bg-white/20" : "bg-blue-100"}`}
                  >
                    <BookOpen
                      className={`w-5 h-5 ${activeTab === "learn" ? "text-white" : "text-blue-600"}`}
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
                  onClick={() => setShowSettings(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white text-gray-700 hover:bg-purple-50 transition-all border border-purple-200"
                >
                  <div className="p-2 rounded-xl bg-gray-100">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-semibold">Settings</span>
                </button>
              </nav>

              {/* Bottom Actions */}
              <div className="mt-6 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWordCreator(true)}
                  className="w-full bg-educational-green text-white hover:bg-educational-green/90 border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Word
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant={userRole === "child" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUserRole("child")}
                    className="flex-1"
                  >
                    Child
                  </Button>
                  <Button
                    variant={
                      (userRole as string) === "parent" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setUserRole("parent")}
                    className="flex-1"
                  >
                    Parent
                  </Button>
                </div>
              </div>
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
                        onBack={() => setGameMode(false)}
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
                  {/* Quiz content remains the same as original */}
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
                        title: "Achievement Unlocked! 🎉",
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
      {showCelebration && <CelebrationEffect trigger={showCelebration} />}
      <FloatingBubbles />

      {/* Settings Panel */}
      {showSettings && (
        <JungleAdventureSettingsPanelV2
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      )}

      {/* Word Creator */}
      {showWordCreator && (
        <WordCreator
          onWordCreated={handleWordCreated}
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

      {/* Enhanced Floating Help Menu */}
      <FloatingHelpMenu
        currentPage="home"
        onHelpAction={(helpContent) =>
          setFeedback({
            type: "info",
            title: helpContent.title,
            message: helpContent.message,
            onContinue: () => setFeedback(null),
          })
        }
      />
    </div>
  );
}
