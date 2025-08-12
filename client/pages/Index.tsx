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
import { SettingsPanel } from "@/components/SettingsPanel";
import { FloatingBubbles } from "@/components/FloatingBubbles";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { DailyChallenge } from "@/components/DailyChallenge";
import { ReadingComprehension } from "@/components/ReadingComprehension";
import { ParentDashboard } from "@/components/ParentDashboard";
import { WordCreator } from "@/components/WordCreator";
import { AdventureDashboard } from "@/components/AdventureDashboard";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { adventureService } from "@/lib/adventureService";
import {
  wordsDatabase,
  getWordsByCategory,
  getRandomWords,
} from "@/data/wordsDatabase";
import {
  SmartWordSelector,
  getSmartWordSelection,
} from "@/lib/smartWordSelection";
import { isBackgroundAnimationsEnabled } from "@/lib/backgroundAnimations";
import {
  generateQuizQuestions,
  generateMatchingPairs,
  generateFillInBlank,
  shuffleArray,
} from "@/lib/gameGeneration";
import {
  Play,
  Trophy,
  Users,
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
  Sword,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WordProgressAPI } from "@/lib/wordProgressApi";
import { ChildWordStats } from "@shared/api";

interface IndexProps {
  initialProfile?: any;
}

export default function Index({ initialProfile }: IndexProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [forgottenWords, setForgottenWords] = useState<Set<number>>(new Set());
  const [rememberedWords, setRememberedWords] = useState<Set<number>>(
    new Set(),
  );
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState<
    "quick" | "standard" | "challenge" | "picture" | "spelling" | "speed"
  >("standard");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [learningMode, setLearningMode] = useState<
    "cards" | "matching" | "selector"
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
    initialProfile || {
      id: "demo-child-1",
      name: "Alex",
      age: 8,
      avatar: "👦",
      interests: ["Animals", "Science", "Space"],
    },
  );
  const [feedback, setFeedback] = useState<any>(null);
  const [gameMode, setGameMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [childStats, setChildStats] = useState<ChildWordStats | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [showPracticeGame, setShowPracticeGame] = useState(false);
  const [practiceWords, setPracticeWords] = useState<any[]>([]);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  const [excludedWordIds, setExcludedWordIds] = useState<Set<number>>(
    new Set(),
  );
  const [currentDashboardWords, setCurrentDashboardWords] = useState<any[]>([]);

  // Initialize dashboard words when category changes or component mounts
  useEffect(() => {
    const initializeWords = () => {
      if (currentDashboardWords.length === 0) {
        generateFreshWords();
      }
    };

    initializeWords();
  }, [selectedCategory, rememberedWords.size, forgottenWords.size]); // Re-initialize when category changes or progress updates

  // Dynamic learning stats that reflect actual progress
  const learningStats = {
    wordsLearned: rememberedWords.size,
    totalWords: wordsDatabase.length,
    currentStreak: 7,
    weeklyGoal: 20,
    weeklyProgress: rememberedWords.size, // Use actual remembered words for today's goal
    accuracyRate:
      rememberedWords.size > 0
        ? Math.round(
            (rememberedWords.size /
              (rememberedWords.size + forgottenWords.size)) *
              100,
          )
        : 0,
    favoriteCategory: "Animals",
    totalPoints:
      rememberedWords.size * 50 + (rememberedWords.size > 10 ? 500 : 0), // Dynamic points
    level: Math.floor(rememberedWords.size / 5) + 1, // Level up every 5 words
    badges: [
      {
        id: "first-word",
        name: "First Word",
        icon: "🎯",
        earned: rememberedWords.size >= 1,
        description: "Learned your first word",
      },
      {
        id: "streak-starter",
        name: "Streak Master",
        icon: "��",
        earned: true,
        description: "7-day learning streak",
      },
      {
        id: "category-explorer",
        name: "Category Explorer",
        icon: "��️",
        earned: rememberedWords.size >= 10,
        description: "Explored 5+ categories",
      },
      {
        id: "science-star",
        name: "Science Star",
        icon: "🔬",
        earned: rememberedWords.size >= 15,
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
        earned: rememberedWords.size >= 50,
        description: "Learn 100 words",
      },
    ],
  };

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

  // Initialize learning session and load child stats
  useEffect(() => {
    const initializeSession = async () => {
      if (currentProfile?.id && activeTab === "learn" && !currentSessionId) {
        try {
          const sessionResponse = await WordProgressAPI.startSession({
            childId: currentProfile.id,
            sessionType: "word_cards",
            category: selectedCategory !== "all" ? selectedCategory : undefined,
          });
          setCurrentSessionId(sessionResponse.sessionId);

          // Load child stats
          const statsResponse = await WordProgressAPI.getChildStats(
            currentProfile.id,
          );
          setChildStats(statsResponse.stats);
        } catch (error) {
          console.error("Failed to initialize session:", error);
        }
      }
    };

    initializeSession();
  }, [currentProfile?.id, activeTab, selectedCategory, currentSessionId]);

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
        title: "Vocabulary Session Complete! ��������",
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

    // Track in Adventure system
    const isCorrect = rating === "easy"; // Easy means they knew it well
    const hasHesitation = rating === "medium"; // Medium means some hesitation

    adventureService.trackWordInteraction(
      wordId.toString(),
      isCorrect,
      hasHesitation,
    );
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
      title: "Amazing Game! ���",
      message: `You scored ${score} points and learned ${totalWords} words!`,
      points: score,
      onContinue: () => setFeedback(null),
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentWordIndex(0);
    // Reset excluded words when changing category
    setExcludedWordIds(new Set());
  };

  const generateFreshWords = () => {
    const allReviewedWords = new Set([
      ...rememberedWords,
      ...forgottenWords,
      ...excludedWordIds,
    ]);

    try {
      const smartSelection = SmartWordSelector.selectWords({
        category: selectedCategory,
        count: 10,
        rememberedWords,
        forgottenWords,
        childStats,
        prioritizeWeakCategories: true,
        includeReviewWords: false, // Focus on new words to avoid repetition
      });

      // Filter out already seen words
      const freshWords = smartSelection.words.filter(
        (word) => !allReviewedWords.has(word.id),
      );

      // If we don't have enough fresh words from smart selection, get random words
      if (freshWords.length < 5) {
        const fallbackWords =
          selectedCategory === "all"
            ? getRandomWords(10)
            : getWordsByCategory(selectedCategory);

        const additionalFreshWords = fallbackWords
          .filter((word) => !allReviewedWords.has(word.id))
          .slice(0, 10 - freshWords.length);

        freshWords.push(...additionalFreshWords);
      }

      // Update excluded words to include the new words we're about to show
      setExcludedWordIds(
        (prev) => new Set([...prev, ...freshWords.map((w) => w.id)]),
      );
      setCurrentDashboardWords(freshWords.slice(0, 10));

      return freshWords.slice(0, 10);
    } catch (error) {
      console.error("Error generating fresh words:", error);
      // Fallback to simple random selection
      const fallbackWords =
        selectedCategory === "all"
          ? getRandomWords(10)
          : getWordsByCategory(selectedCategory).slice(0, 10);

      setCurrentDashboardWords(fallbackWords);
      return fallbackWords;
    }
  };

  const checkCategoryCompletion = (
    displayWords: any[],
    rememberedWords: Set<number>,
    forgottenWords: Set<number>,
    currentWordId: number,
  ) => {
    // Get all word IDs that have been reviewed (either remembered or forgotten)
    const reviewedWordIds = new Set([
      ...rememberedWords,
      ...forgottenWords,
      currentWordId,
    ]);

    // Check if all words in the current set have been reviewed
    const allWordsReviewed = displayWords.every((word) =>
      reviewedWordIds.has(word.id),
    );

    if (allWordsReviewed) {
      const totalWords = displayWords.length;
      const totalRemembered =
        rememberedWords.size + (rememberedWords.has(currentWordId) ? 0 : 1);
      const accuracy = Math.round((totalRemembered / totalWords) * 100);

      // Determine category completion achievement
      let achievementTitle = "";
      let achievementIcon = "";
      let achievementMessage = "";

      // Format category name for display
      const categoryDisplayName =
        selectedCategory === "all" ? "this word set" : selectedCategory;

      if (accuracy === 100) {
        achievementTitle = "Perfect Category Mastery! 🏆";
        achievementIcon = "🏆";
        achievementMessage = `Outstanding! You remembered ALL ${totalWords} words in ${categoryDisplayName}! You're a true champion!\n\n🎁 Perfect Mastery Bonus: 200 points!\n✨ New adventure zone unlocked!\n🏆 Master badge earned!`;
      } else if (accuracy >= 90) {
        achievementTitle = "Category Expert! ��";
        achievementIcon = "���";
        achievementMessage = `Excellent work! You mastered ${categoryDisplayName} with ${accuracy}% accuracy! Almost perfect!\n\n🎁 Expert Bonus: 150 points!\n⭐ Expert badge earned!`;
      } else if (accuracy >= 75) {
        achievementTitle = "Category Scholar! 📚";
        achievementIcon = "📚";
        achievementMessage = `Great job! You completed ${categoryDisplayName} with ${accuracy}% accuracy! Keep up the good work!\n\n🎁 Scholar Bonus: 100 points!\n📚 Scholar badge earned!`;
      } else if (accuracy >= 50) {
        achievementTitle = "Category Explorer! 🎯";
        achievementIcon = "🎯";
        achievementMessage = `Good effort! You finished ${categoryDisplayName} with ${accuracy}% accuracy! Practice makes perfect!\n\n🎁 Explorer Bonus: 75 points!\n🎯 Explorer badge earned!`;
      } else {
        achievementTitle = "Category Challenger! 💪";
        achievementIcon = "💪";
        achievementMessage = `Nice try! You completed ${categoryDisplayName} with ${accuracy}% accuracy! Every attempt makes you stronger!\n\n🎁 Challenger Bonus: 50 points!\n💪 Challenger badge earned!`;
      }

      return {
        shouldShow: true,
        title: achievementTitle,
        icon: achievementIcon,
        message: achievementMessage,
        accuracy,
        totalWords,
        totalRemembered,
        bonusPoints:
          accuracy === 100
            ? 200
            : accuracy >= 90
              ? 150
              : accuracy >= 75
                ? 100
                : accuracy >= 50
                  ? 75
                  : 50,
        badgeEarned:
          accuracy === 100
            ? "master"
            : accuracy >= 90
              ? "expert"
              : accuracy >= 75
                ? "scholar"
                : accuracy >= 50
                  ? "explorer"
                  : "challenger",
      };
    }

    return { shouldShow: false };
  };

  const handleWordProgress = async (
    word: any,
    status: "remembered" | "needs_practice",
    responseTime?: number,
  ) => {
    if (!currentProfile?.id || !currentSessionId) {
      console.warn("Missing profile or session ID");
      return;
    }

    setIsLoadingProgress(true);
    try {
      const response = await WordProgressAPI.recordWordProgress({
        childId: currentProfile.id,
        sessionId: currentSessionId,
        wordId: word.id.toString(),
        word: word.word,
        category: word.category,
        status,
        responseTime: responseTime || Math.random() * 3000 + 1000,
        difficulty: word.difficulty || "medium",
      });

      // Update child stats immediately for real-time feedback
      setChildStats(response.updatedStats);

      // Learning stats are computed dynamically from current state

      // Update adventure system with word interaction
      adventureService.trackWordInteraction(
        word.id.toString(),
        status === "remembered",
        responseTime ? responseTime > 2000 : false,
      );

      // Show achievement notifications in sequence
      const notifications = [];

      // Add level up to notifications if applicable
      if (response.levelUp) {
        notifications.push({
          type: "celebration",
          title: "🎉 Level Up! 🎉",
          message: `Congratulations! You've reached a new level!\n\n🌟 Keep up the amazing work!`,
          points: 50,
        });
      }

      // Add achievements to notifications
      if (response.achievements && response.achievements.length > 0) {
        response.achievements.forEach((achievement) => {
          notifications.push({
            type: "achievement",
            title: `🏆 Achievement Unlocked!`,
            message: achievement,
            points: 25,
          });
        });
      }

      // Show notifications in sequence
      if (notifications.length > 0) {
        let currentIndex = 0;
        const showNext = () => {
          if (currentIndex < notifications.length) {
            const notification = notifications[currentIndex];
            setFeedback({
              ...notification,
              onContinue: () => {
                setFeedback(null);
                currentIndex++;
                // Show next notification after a brief delay
                if (currentIndex < notifications.length) {
                  setTimeout(showNext, 500);
                }
              },
            });
          }
        };

        // Start showing notifications after a brief delay
        setTimeout(showNext, 500);
      }

      console.log("Word progress recorded:", response);
    } catch (error) {
      console.error("Failed to record word progress:", error);

      // Show user-friendly error message
      setFeedback({
        type: "error",
        title: "Oops! Something went wrong",
        message:
          "We couldn't save your progress right now, but keep learning! Your progress is still being tracked locally.",
        points: 0,
        onContinue: () => setFeedback(null),
      });
    } finally {
      setIsLoadingProgress(false);
    }
  };

  const handleSignOut = () => {
    navigate("/");
  };

  const getPracticeWords = () => {
    // Use smart word selector for practice words
    const practiceWords = SmartWordSelector.getPracticeWords(
      forgottenWords,
      childStats,
      10,
    );

    // If no forgotten words, get challenging words for practice
    if (practiceWords.length === 0) {
      const challengingSelection = SmartWordSelector.selectWords({
        category: selectedCategory,
        count: 10,
        rememberedWords,
        forgottenWords,
        childStats,
        prioritizeWeakCategories: true,
        includeReviewWords: false, // Focus on new/challenging words for practice
      });

      return challengingSelection.words.map((word) => ({
        id: word.id.toString(),
        word: word.word,
        definition: word.definition,
        example: word.example,
        category: word.category,
        difficulty: word.difficulty,
        attempts: 0,
        lastAccuracy: 0,
      }));
    }

    // Convert to practice word format
    return practiceWords.map((word) => ({
      id: word.id.toString(),
      word: word.word,
      definition: word.definition,
      example: word.example,
      category: word.category,
      difficulty: word.difficulty,
      attempts: 1,
      lastAccuracy: Math.random() * 40 + 30, // Simulate lower accuracy for practice words
    }));
  };

  // Helper function to get all words from the database
  const getAllWords = () => {
    return wordsDatabase || [];
  };

  // Helper function to get words for a specific category
  const getWordsForCategory = (categoryName: string) => {
    return wordsDatabase.filter(
      (word) =>
        word.category.toLowerCase().replace(/[^a-z]/g, "") ===
        categoryName.toLowerCase().replace(/[^a-z]/g, ""),
    );
  };

  const startPracticeGame = () => {
    const words = getPracticeWords();
    setPracticeWords(words);
    setShowPracticeGame(true);
  };

  const handlePracticeComplete = (results: {
    correctWords: string[];
    totalAttempts: number;
    accuracy: number;
  }) => {
    setShowPracticeGame(false);

    // Show completion feedback
    setFeedback({
      type: "celebration",
      title: "Practice Complete! 🏆",
      message: `Great job practicing your tricky words!\n\n✅ Remembered: ${results.correctWords.length} words\n�� Accuracy: ${results.accuracy}%\n\nKeep practicing to master all your words!`,
      points: results.correctWords.length * 15,
      onContinue: () => setFeedback(null),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 py-1 md:py-4">
          {/* Mobile header - compact */}
          <div className="flex items-center justify-between py-1 md:hidden">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fa33f74a2f97141a4a1ef43d9448f9bda%2F2a4b7e4c3c38485b966cfd2cff50da9e?format=webp&width=800"
                  alt="Wordy Logo"
                  className="w-6 h-6 rounded-full"
                />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight">
                  Wordy's Adventure!
                </h1>
                <p className="text-xs text-educational-yellow-light">
                  WordWise 🦉
                </p>
              </div>
            </div>
          </div>

          {/* Desktop header */}
          <div className="text-center max-w-4xl mx-auto hidden md:block">
            <div className="flex justify-center items-center gap-6 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Fa33f74a2f97141a4a1ef43d9448f9bda%2F2a4b7e4c3c38485b966cfd2cff50da9e?format=webp&width=800"
                  alt="Wordy Logo"
                  className="w-16 h-16 rounded-full"
                />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              🌟 Wordy's Adventure!
            </h1>
            <p className="text-lg font-semibold text-educational-yellow-light mb-2">
              Fun vocabulary learning for kids! 📚
            </p>
          </div>
        </div>

        {/* Enhanced Floating Elements - hidden on mobile to reduce clutter, conditional on setting */}
        {backgroundAnimationsEnabled && (
          <>
            <div className="hidden md:block absolute top-10 left-10 text-3xl animate-bounce">
              ���
            </div>
            <div className="hidden md:block absolute top-20 right-20 text-2xl animate-pulse">
              📚
            </div>
            <div className="hidden md:block absolute bottom-10 left-20 text-4xl animate-bounce delay-1000">
              ������
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
                  label: "���� My Journey",
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
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 scroll-smooth">
        {userRole === "parent" ? (
          <div className="w-full p-4 md:p-8">
            <ParentDashboard
              children={undefined}
              sessions={undefined}
              onNavigateBack={() => setUserRole("child")}
            />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row min-h-screen">
            {/* Desktop Sidebar - Hidden on Mobile */}
            <aside className="hidden lg:flex lg:w-80 xl:w-96 bg-gradient-to-b from-purple-50 to-pink-50 border-r border-purple-200 overflow-y-auto lg:max-h-screen">
              <div className="p-4 lg:p-6">
                {/* Logo Section - Mobile & Desktop */}
                <div className="flex items-center gap-3 mb-6 lg:mb-8">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-xl flex items-center justify-center p-1">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Fa33f74a2f97141a4a1ef43d9448f9bda%2F2a4b7e4c3c38485b966cfd2cff50da9e?format=webp&width=800"
                      alt="Wordy Logo"
                      className="w-full h-full rounded-lg"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg lg:text-xl font-bold text-gray-800">
                      Wordy's Adventure!
                    </h1>
                    <p className="text-xs lg:text-sm text-gray-600">
                      Fun Learning Games
                    </p>
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`w-full flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all ${
                      activeTab === "dashboard"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-purple-50 border border-purple-100"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg lg:rounded-xl ${activeTab === "dashboard" ? "bg-white/20" : "bg-purple-100"}`}
                    >
                      <Target
                        className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === "dashboard" ? "text-white" : "text-purple-600"}`}
                      />
                    </div>
                    <span className="font-medium lg:font-semibold text-sm lg:text-base">
                      Dashboard
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("learn")}
                    className={`w-full flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all ${
                      activeTab === "learn"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-purple-50 border border-purple-100"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg lg:rounded-xl ${activeTab === "learn" ? "bg-white/20" : "bg-green-100"}`}
                    >
                      <BookOpen
                        className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === "learn" ? "text-white" : "text-green-600"}`}
                      />
                    </div>
                    <span className="font-medium lg:font-semibold text-sm lg:text-base">
                      Word Library
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("quiz")}
                    className={`w-full flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all ${
                      activeTab === "quiz"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-purple-50 border border-purple-100"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg lg:rounded-xl ${activeTab === "quiz" ? "bg-white/20" : "bg-pink-100"}`}
                    >
                      <Brain
                        className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === "quiz" ? "text-white" : "text-pink-600"}`}
                      />
                    </div>
                    <span className="font-medium lg:font-semibold text-sm lg:text-base">
                      Quiz Time
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("adventure")}
                    className={`w-full flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all ${
                      activeTab === "adventure"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-purple-50 border border-purple-100"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg lg:rounded-xl ${activeTab === "adventure" ? "bg-white/20" : "bg-green-100"}`}
                    >
                      <Sword
                        className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === "adventure" ? "text-white" : "text-green-600"}`}
                      />
                    </div>
                    <span className="font-medium lg:font-semibold text-sm lg:text-base">
                      🎯 Word Practice
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("progress")}
                    className={`w-full flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all ${
                      activeTab === "progress"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-purple-50 border border-purple-100"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg lg:rounded-xl ${activeTab === "progress" ? "bg-white/20" : "bg-yellow-100"}`}
                    >
                      <Trophy
                        className={`w-4 h-4 lg:w-5 lg:h-5 ${activeTab === "progress" ? "text-white" : "text-yellow-600"}`}
                      />
                    </div>
                    <span className="font-medium lg:font-semibold text-sm lg:text-base">
                      🌟 My Journey
                    </span>
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
                    <span className="font-semibold">
                      Administrator Dashboard
                    </span>
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
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-y-auto scroll-smooth">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsContent value="dashboard">
                  <LearningDashboard
                    stats={learningStats}
                    userName="Explorer"
                    childStats={childStats}
                    forgottenWordsCount={forgottenWords.size}
                    rememberedWordsCount={rememberedWords.size}
                    availableWords={currentDashboardWords}
                    onWordProgress={async (word, status) => {
                      // Handle word progress in dashboard
                      if (status === "remembered") {
                        setRememberedWords(
                          (prev) => new Set([...prev, word.id]),
                        );
                        setForgottenWords((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete(word.id);
                          return newSet;
                        });
                      } else if (status === "needs_practice") {
                        setForgottenWords(
                          (prev) => new Set([...prev, word.id]),
                        );
                        setRememberedWords((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete(word.id);
                          return newSet;
                        });
                      }

                      // Record progress in database (this handles all achievements)
                      await handleWordProgress(
                        word,
                        status === "remembered"
                          ? "remembered"
                          : "needs_practice",
                      );
                    }}
                    onQuickQuiz={() => {
                      setSelectedQuizType("quick");
                      setShowQuiz(true);
                      setActiveTab("quiz"); // Navigate to quiz tab
                    }}
                    onAdventure={() => {
                      setActiveTab("adventure");
                    }}
                    onPracticeForgotten={() => {
                      startPracticeGame();
                      // Stay in current tab - practice component will show as overlay
                    }}
                    onRequestNewWords={generateFreshWords}
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
                              <img
                                src="https://cdn.builder.io/api/v1/image/assets%2Fa33f74a2f97141a4a1ef43d9448f9bda%2F2a4b7e4c3c38485b966cfd2cff50da9e?format=webp&width=800"
                                alt="Wordy"
                                className="w-4 h-4 rounded"
                              />
                              <span className="hidden sm:inline">
                                Word Cards
                              </span>
                              <span className="sm:hidden">Cards</span>
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
                                          word={{
                                            ...(displayWords[
                                              currentWordIndex
                                            ] || displayWords[0]),
                                            masteryLevel: Math.floor(
                                              Math.random() * 100,
                                            ),
                                            lastReviewed: new Date(
                                              Date.now() -
                                                Math.random() *
                                                  7 *
                                                  24 *
                                                  60 *
                                                  60 *
                                                  1000,
                                            ),
                                            nextReview: new Date(
                                              Date.now() +
                                                Math.random() *
                                                  3 *
                                                  24 *
                                                  60 *
                                                  60 *
                                                  1000,
                                            ),
                                          }}
                                          onPronounce={(word) =>
                                            console.log(
                                              "Playing pronunciation for:",
                                              word.word,
                                            )
                                          }
                                          onFavorite={(word) =>
                                            console.log("Favorited:", word.word)
                                          }
                                          onWordMastered={handleWordMastered}
                                          showVocabularyBuilder={true}
                                        />
                                      </div>

                                      <div className="space-y-4">
                                        {/* Learning Progress Buttons */}
                                        <div className="flex justify-center gap-3 md:gap-4 px-4 md:px-0">
                                          <Button
                                            onClick={async () => {
                                              const currentWord =
                                                displayWords[currentWordIndex];
                                              if (currentWord) {
                                                // Mark as forgotten for extra practice
                                                setForgottenWords(
                                                  (prev) =>
                                                    new Set([
                                                      ...prev,
                                                      currentWord.id,
                                                    ]),
                                                );
                                                setRememberedWords((prev) => {
                                                  const newSet = new Set(prev);
                                                  newSet.delete(currentWord.id);
                                                  return newSet;
                                                });

                                                // Record progress in database (this handles all achievements)
                                                await handleWordProgress(
                                                  currentWord,
                                                  "needs_practice",
                                                );
                                                // Show celebration effect briefly
                                                setShowCelebration(true);
                                                setTimeout(
                                                  () =>
                                                    setShowCelebration(false),
                                                  1000,
                                                );
                                              }
                                              // Auto-advance to next word
                                              if (
                                                currentWordIndex <
                                                displayWords.length - 1
                                              ) {
                                                setCurrentWordIndex(
                                                  currentWordIndex + 1,
                                                );
                                              } else {
                                                // Check if we've reviewed all words in category
                                                const updatedForgottenWords =
                                                  new Set([
                                                    ...forgottenWords,
                                                    currentWord.id,
                                                  ]);
                                                const completionResult =
                                                  checkCategoryCompletion(
                                                    displayWords,
                                                    rememberedWords,
                                                    updatedForgottenWords,
                                                    currentWord.id,
                                                  );

                                                if (
                                                  completionResult.shouldShow
                                                ) {
                                                  // Show category completion feedback (not achievement since words were forgotten)
                                                  setFeedback({
                                                    type: "celebration",
                                                    title:
                                                      "Category Review Complete! 📚",
                                                    message: `You've reviewed all ${completionResult.totalWords} words in ${selectedCategory === "all" ? "this word set" : selectedCategory}!\\n\\n✅ Remembered: ${completionResult.totalRemembered} words\\n❌ Need practice: ${completionResult.totalWords - completionResult.totalRemembered} words\\n\\n${completionResult.totalWords - completionResult.totalRemembered > 0 ? "Don't worry! Let's practice the tricky ones again! ������" : "Amazing work! 🎉"}`,
                                                    points:
                                                      completionResult.totalRemembered *
                                                      10, // Fewer points since words were forgotten
                                                    onContinue: () => {
                                                      setFeedback(null);
                                                      setCurrentWordIndex(0);
                                                    },
                                                  });
                                                } else {
                                                  // Restart with forgotten words for practice
                                                  setCurrentWordIndex(0);
                                                }
                                              }
                                            }}
                                            variant="outline"
                                            className="flex-1 bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800 transition-all duration-300 transform hover:scale-105 py-4 px-6"
                                            disabled={isLoadingProgress}
                                          >
                                            <span className="text-xl mr-2">
                                              ❌
                                            </span>
                                            <div className="text-center">
                                              <div className="font-bold text-lg">
                                                I Forgot
                                              </div>
                                              <div className="text-xs opacity-75">
                                                Need practice
                                              </div>
                                            </div>
                                          </Button>

                                          <Button
                                            onClick={async () => {
                                              const currentWord =
                                                displayWords[currentWordIndex];
                                              if (currentWord) {
                                                // Mark as remembered
                                                setRememberedWords(
                                                  (prev) =>
                                                    new Set([
                                                      ...prev,
                                                      currentWord.id,
                                                    ]),
                                                );
                                                setForgottenWords((prev) => {
                                                  const newSet = new Set(prev);
                                                  newSet.delete(currentWord.id);
                                                  return newSet;
                                                });

                                                // Record progress in database (this handles all achievements)
                                                await handleWordProgress(
                                                  currentWord,
                                                  "remembered",
                                                );
                                                // Show celebration effect
                                                setShowCelebration(true);
                                                setTimeout(
                                                  () =>
                                                    setShowCelebration(false),
                                                  1500,
                                                );
                                              }
                                              // Auto-advance to next word
                                              if (
                                                currentWordIndex <
                                                displayWords.length - 1
                                              ) {
                                                setCurrentWordIndex(
                                                  currentWordIndex + 1,
                                                );
                                              } else {
                                                // Check for category completion and show achievement
                                                const currentWord =
                                                  displayWords[
                                                    currentWordIndex
                                                  ];
                                                const updatedRememberedWords =
                                                  new Set([
                                                    ...rememberedWords,
                                                    currentWord.id,
                                                  ]);
                                                const completionResult =
                                                  checkCategoryCompletion(
                                                    displayWords,
                                                    updatedRememberedWords,
                                                    forgottenWords,
                                                    currentWord.id,
                                                  );

                                                if (
                                                  completionResult.shouldShow
                                                ) {
                                                  // Show enhanced category completion achievement
                                                  setFeedback({
                                                    type: "celebration",
                                                    title:
                                                      completionResult.title,
                                                    message: `${completionResult.message}\n\n✅ Remembered: ${completionResult.totalRemembered} words\n❌ Need practice: ${completionResult.totalWords - completionResult.totalRemembered} words\n\n🎉 Category Achievement Unlocked! 🎉`,
                                                    points:
                                                      completionResult.totalRemembered *
                                                        20 +
                                                      (completionResult.accuracy >=
                                                      90
                                                        ? 100
                                                        : completionResult.accuracy >=
                                                            75
                                                          ? 75
                                                          : completionResult.accuracy >=
                                                              50
                                                            ? 50
                                                            : 25),
                                                    onContinue: () => {
                                                      setFeedback(null);
                                                      // Reset for new category or continue practicing
                                                      const totalForgotten =
                                                        completionResult.totalWords -
                                                        completionResult.totalRemembered;
                                                      if (totalForgotten > 0) {
                                                        // Restart with forgotten words for focused practice
                                                        setCurrentWordIndex(0);
                                                      } else {
                                                        // Perfect completion - reset for new round
                                                        setCurrentWordIndex(0);
                                                        setRememberedWords(
                                                          new Set(),
                                                        );
                                                        setForgottenWords(
                                                          new Set(),
                                                        );
                                                      }
                                                    },
                                                  });
                                                }
                                              }
                                            }}
                                            className="flex-1 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 transition-all duration-300 transform hover:scale-105 py-4 px-6"
                                            disabled={isLoadingProgress}
                                          >
                                            <span className="text-xl mr-2">
                                              ✅
                                            </span>
                                            <div className="text-center">
                                              <div className="font-bold text-lg">
                                                I Remember!
                                              </div>
                                              <div className="text-xs opacity-75">
                                                Got it!
                                              </div>
                                            </div>
                                          </Button>
                                        </div>

                                        {/* Learning Progress Indicator */}
                                        <div className="text-center space-y-2">
                                          <div className="flex justify-center gap-4 text-sm">
                                            <div className="flex items-center gap-1 text-green-600">
                                              <span className="text-base">
                                                ✅
                                              </span>
                                              <span className="font-medium">
                                                {rememberedWords.size}
                                              </span>
                                              <span className="text-xs opacity-75">
                                                remembered
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-red-600">
                                              <span className="text-base">
                                                ❌
                                              </span>
                                              <span className="font-medium">
                                                {forgottenWords.size}
                                              </span>
                                              <span className="text-xs opacity-75">
                                                to practice
                                              </span>
                                            </div>
                                          </div>

                                          {/* Quick Navigation */}
                                          <div className="flex justify-center gap-2 mt-3">
                                            <Button
                                              onClick={() =>
                                                setCurrentWordIndex(
                                                  Math.max(
                                                    0,
                                                    currentWordIndex - 1,
                                                  ),
                                                )
                                              }
                                              disabled={currentWordIndex === 0}
                                              variant="ghost"
                                              size="sm"
                                              className="text-xs text-slate-500 hover:text-slate-700"
                                            >
                                              �� Back
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
                                              variant="ghost"
                                              size="sm"
                                              className="text-xs text-slate-500 hover:text-slate-700"
                                            >
                                              Skip →
                                            </Button>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="text-center mt-4 space-y-2">
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

                                        {/* Current Word Status */}
                                        {(() => {
                                          const currentWord =
                                            displayWords[currentWordIndex];
                                          if (!currentWord) return null;

                                          if (
                                            rememberedWords.has(currentWord.id)
                                          ) {
                                            return (
                                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                                ✅ You remembered this word!
                                              </Badge>
                                            );
                                          } else if (
                                            forgottenWords.has(currentWord.id)
                                          ) {
                                            return (
                                              <Badge className="bg-red-100 text-red-700 border-red-300">
                                                ❌ Marked for practice
                                              </Badge>
                                            );
                                          } else {
                                            return (
                                              <Badge
                                                variant="secondary"
                                                className="bg-blue-100 text-blue-700 border-blue-300"
                                              >
                                                🆕 New word to learn
                                              </Badge>
                                            );
                                          }
                                        })()}
                                      </div>
                                    </>
                                  )}
                                </>
                              );
                            })()}
                          </>
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
                          🎮 Quiz & Game Time!
                        </h2>
                        <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8">
                          Test your vocabulary knowledge with fun quizzes and
                          interactive games! Choose your challenge below.
                        </p>
                      </div>

                      {/* All Unique Games and Quizzes - NO DUPLICATES, NO FOLDERS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
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
                            <div className="text-6xl mb-4">���</div>
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
                            <div className="text-6xl mb-4">����</div>
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
                                  <span className="text-2xl">����</span>
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
                            title: "Matching Game Complete! �����",
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

                <TabsContent value="adventure">
                  <AdventureDashboard
                    words={wordsDatabase.map((word) => ({
                      id: word.id,
                      word: word.word,
                      definition: word.definition,
                      emoji: word.emoji,
                      imageUrl: word.imageUrl,
                      wrongDefinitions: [
                        "A type of ancient tool used by early humans",
                        "A scientific term for weather patterns",
                        "A mathematical concept related to geometry",
                        "A historical event from the medieval period",
                      ],
                      hint: `This word starts with "${word.word.charAt(0)}" and relates to ${word.category}`,
                    }))}
                  />
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

      {/* Word Practice Game */}

      {/* Enhanced Components */}
      {showCelebration && <CelebrationEffect trigger={showCelebration} />}
      {backgroundAnimationsEnabled && <FloatingBubbles />}

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setShowMobileMoreMenu(false);
        }}
        onSettingsClick={() => {
          setShowSettings(true);
          setShowMobileMoreMenu(false);
        }}
        onParentClick={() => {
          setUserRole("parent");
          setShowMobileMoreMenu(false);
        }}
        onAdminClick={() => {
          navigate("/admin");
          setShowMobileMoreMenu(false);
        }}
        onSignOut={() => {
          handleSignOut();
          setShowMobileMoreMenu(false);
        }}
        showMoreMenu={showMobileMoreMenu}
        onMoreToggle={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
        achievementCount={learningStats.badges.filter((b) => b.earned).length}
      />

      {/* Floating Helper */}
      <div className="fixed bottom-20 lg:bottom-4 md:bottom-6 right-4 md:right-6 z-40">
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
