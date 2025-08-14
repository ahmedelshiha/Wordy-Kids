import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { VowelRescue } from "@/components/games/VowelRescue";
import ListenAndGuessGame from "@/components/games/ListenAndGuessGame";
import WordGarden from "@/components/games/WordGarden";
import {
  getSystematicEasyVowelQuestions,
  getSystematicMediumVowelQuestions,
  getSystematicTimedVowelQuestions,
} from "@/lib/vowelQuizGeneration";
import { AchievementTracker } from "@/lib/achievementTracker";
import { audioService } from "@/lib/audioService";
import { enhancedAudioService } from "@/lib/enhancedAudioService";
import { EnhancedAchievementPopup } from "@/components/EnhancedAchievementPopup";
import { CompactMobileSettingsPanel } from "@/components/CompactMobileSettingsPanel";
import { FloatingBubbles } from "@/components/FloatingBubbles";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { SessionRestoration } from "@/components/SessionRestoration";
import {
  useSessionPersistence,
  SessionData,
} from "@/hooks/useSessionPersistence";
import { getSessionPersistenceService } from "@/lib/sessionPersistenceService";
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
import {
  EnhancedWordSelector,
  WordHistory,
  SystematicWordSelection,
} from "@/lib/enhancedWordSelection";
import {
  DashboardWordGenerator,
  DashboardWordSession,
  UserProgress,
} from "@/lib/dashboardWordGenerator";
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
  RotateCcw,
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [learningMode, setLearningMode] = useState<
    "cards" | "matching" | "selector"
  >("selector");
  const [showMatchingGame, setShowMatchingGame] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationEffect, setCelebrationEffect] = useState(false);
  const [userRole, setUserRole] = useState<"child" | "parent">("child");
  const [showWordCreator, setShowWordCreator] = useState(false);
  const [customWords, setCustomWords] = useState<any[]>([]);
  const [backgroundAnimationsEnabled, setBackgroundAnimationsEnabled] =
    useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

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
  const [achievementPopup, setAchievementPopup] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [childStats, setChildStats] = useState<ChildWordStats | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);
  const [showPracticeGame, setShowPracticeGame] = useState(false);
  const [practiceWords, setPracticeWords] = useState<any[]>([]);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false);
  const [excludedWordIds, setExcludedWordIds] = useState<Set<number>>(
    new Set(),
  );

  // Session persistence states
  const [showSessionRestoration, setShowSessionRestoration] = useState(false);
  const [sessionRestorationData, setSessionRestorationData] =
    useState<SessionData | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(false);
  const [isSessionInitialized, setIsSessionInitialized] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<number>(Date.now());

  // Initialize session persistence
  const sessionPersistence = useSessionPersistence({
    autoSaveInterval: 3000, // Save every 3 seconds
    enableBackgroundSync: true,
    compressionEnabled: true,
  });

  const persistenceService = getSessionPersistenceService();

  // Learning goals state and progress tracking
  const [learningGoals, setLearningGoals] = useState<any[]>([]);
  const [currentProgress, setCurrentProgress] = useState({
    wordsLearned: 0,
    wordsRemembered: 0,
    sessionCount: 0,
    accuracy: 0,
  });
  const [dailySessionCount, setDailySessionCount] = useState(0);
  const [currentDashboardWords, setCurrentDashboardWords] = useState<any[]>([]);

  // Enhanced word selection states
  const [userWordHistory, setUserWordHistory] = useState<
    Map<number, WordHistory>
  >(new Map());
  const [sessionNumber, setSessionNumber] = useState(1);
  const [lastSystematicSelection, setLastSystematicSelection] =
    useState<SystematicWordSelection | null>(null);

  // Dashboard word generation states
  const [dashboardSession, setDashboardSession] =
    useState<DashboardWordSession | null>(null);
  const [dashboardSessionNumber, setDashboardSessionNumber] = useState(1);

  // Memoize displayWords to prevent recalculation on every render
  const displayWords = useMemo(() => {
    if (currentDashboardWords.length > 0) {
      return currentDashboardWords;
    }
    // Fallback calculation if currentDashboardWords is empty
    if (!selectedCategory) {
      return []; // Return empty array if no category selected
    }
    const categoryWords = getWordsByCategory(selectedCategory);
    return categoryWords.slice(0, 20);
  }, [currentDashboardWords, selectedCategory]);

  // Initialize dashboard words when category changes or component mounts
  useEffect(() => {
    const initializeWords = () => {
      if (selectedCategory && currentDashboardWords.length === 0) {
        generateFreshWords();
      }
    };

    initializeWords();
  }, [selectedCategory]); // Only re-initialize when category changes to prevent constant regeneration

  // Initialize dashboard words for systematic learning (independent of category selection)
  useEffect(() => {
    const initializeDashboardWords = () => {
      if (currentDashboardWords.length === 0) {
        try {
          generateDashboardWords();
        } catch (error) {
          console.error(
            "Error generating dashboard words, using fallback:",
            error,
          );
          // Fallback to random words if systematic generation fails
          const fallbackWords = getRandomWords(20);
          setCurrentDashboardWords(fallbackWords);
        }
      }
    };

    // Initialize dashboard words on component mount
    initializeDashboardWords();
  }, []); // Run only once on mount

  // Regenerate dashboard words when user completes enough words to progress
  useEffect(() => {
    const wordsCompleted = rememberedWords.size;
    const shouldRegenerate = wordsCompleted > 0 && wordsCompleted % 10 === 0; // Regenerate every 10 completed words

    if (shouldRegenerate && dashboardSession) {
      console.log(
        `Regenerating dashboard words after ${wordsCompleted} completed words`,
      );
      generateDashboardWords();
    }
  }, [rememberedWords.size]); // Trigger when remembered words count changes

  // Update current progress for goals tracking
  useEffect(() => {
    const totalWordsLearned = rememberedWords.size;
    const totalAttempts = rememberedWords.size + forgottenWords.size;
    const accuracy =
      totalAttempts > 0
        ? Math.round((rememberedWords.size / totalAttempts) * 100)
        : 0;

    setCurrentProgress({
      wordsLearned: totalWordsLearned,
      wordsRemembered: rememberedWords.size,
      sessionCount: dailySessionCount,
      accuracy: accuracy,
    });
  }, [rememberedWords, forgottenWords, dailySessionCount]);

  // Load saved learning goals on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem("learningGoals");
    if (savedGoals) {
      try {
        setLearningGoals(JSON.parse(savedGoals));
      } catch (error) {
        console.error("Error loading learning goals:", error);
      }
    }
  }, []);

  // Session persistence initialization
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const savedSession = sessionPersistence.loadSession();

        if (savedSession && !isSessionInitialized) {
          // Check if session is recent enough to restore automatically
          const sessionAge = Date.now() - (savedSession.lastSaved || 0);
          const isRecentSession = sessionAge < 30 * 60 * 1000; // 30 minutes

          if (
            isRecentSession &&
            savedSession.currentProgress?.wordsLearned > 0
          ) {
            // Auto-restore session in background without popup
            console.log("Auto-restoring session in background", {
              wordsLearned: savedSession.currentProgress?.wordsLearned || 0,
              sessionAge: Math.round(sessionAge / 1000 / 60), // in minutes
            });
            setIsRestoringSession(true);
            // Small delay to show restoration feedback
            setTimeout(() => {
              handleSessionRestore(savedSession);
              setIsRestoringSession(false);
              // Update last accessed time for the restored session
              sessionPersistence.saveSession({
                lastSaved: Date.now(),
                sessionStartTime: Date.now(),
              });
            }, 800);
          } else {
            // Start fresh but mark session as initialized
            setIsSessionInitialized(true);
          }
        } else {
          setIsSessionInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize session:", error);
        setIsSessionInitialized(true);
      }
    };

    if (!isSessionInitialized) {
      initializeSession();
    }
  }, [sessionPersistence, isSessionInitialized]);

  // Auto-save session data
  const saveSessionData = useCallback(() => {
    if (!isSessionInitialized) return;

    const sessionData: Partial<SessionData> = {
      activeTab,
      currentWordIndex,
      selectedCategory,
      learningMode,
      userRole,
      forgottenWords: Array.from(forgottenWords),
      rememberedWords: Array.from(rememberedWords),
      excludedWordIds: Array.from(excludedWordIds),
      currentProgress,
      dailySessionCount,
      currentProfile,
      childStats,
      currentSessionId,
      learningGoals,
      currentDashboardWords,
      customWords,
      practiceWords,
      userWordHistory: Array.from(userWordHistory.entries()),
      sessionNumber,
      lastSystematicSelection,
      dashboardSession,
      dashboardSessionNumber,
      showQuiz,
      selectedQuizType,
      showMatchingGame,
      gameMode,
      showPracticeGame,
    };

    persistenceService.queueSave(sessionData, "medium");
    setLastAutoSave(Date.now());
  }, [
    isSessionInitialized,
    activeTab,
    currentWordIndex,
    selectedCategory,
    learningMode,
    userRole,
    forgottenWords,
    rememberedWords,
    excludedWordIds,
    currentProgress,
    dailySessionCount,
    currentProfile,
    childStats,
    currentSessionId,
    learningGoals,
    currentDashboardWords,
    customWords,
    practiceWords,
    userWordHistory,
    sessionNumber,
    lastSystematicSelection,
    dashboardSession,
    dashboardSessionNumber,
    showQuiz,
    selectedQuizType,
    showMatchingGame,
    gameMode,
    showPracticeGame,
    persistenceService,
  ]);

  // Auto-save whenever important state changes
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      saveSessionData();
    }, 1000); // Debounce saves

    return () => clearTimeout(saveTimer);
  }, [saveSessionData]);

  // Force save on critical actions
  useEffect(() => {
    if (rememberedWords.size > 0 || forgottenWords.size > 0) {
      persistenceService.queueSave(
        {
          forgottenWords: Array.from(forgottenWords),
          rememberedWords: Array.from(rememberedWords),
          currentProgress,
        },
        "high",
      );
    }
  }, [
    rememberedWords.size,
    forgottenWords.size,
    currentProgress,
    persistenceService,
  ]);

  // Enhanced tab navigation preservation
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab becoming hidden - force save current state
        console.log("Tab hidden, force saving session data");
        persistenceService.queueSave(
          {
            activeTab,
            currentWordIndex,
            selectedCategory,
            learningMode,
            userRole,
            forgottenWords: Array.from(forgottenWords),
            rememberedWords: Array.from(rememberedWords),
            excludedWordIds: Array.from(excludedWordIds),
            currentProgress,
            dailySessionCount,
            currentProfile,
            childStats,
            currentSessionId,
            learningGoals,
            currentDashboardWords,
            customWords,
            practiceWords,
            showQuiz,
            selectedQuizType,
            showMatchingGame,
            gameMode,
            showPracticeGame,
          },
          "high",
        );

        // Force immediate sync
        persistenceService.forceSync();
      } else {
        // Tab becoming visible - check for updates from other tabs
        console.log("Tab visible, checking for session updates");
        const latestSession = sessionPersistence.loadSession();

        if (latestSession && latestSession.lastSaved > lastAutoSave) {
          console.log("Found newer session data from another tab");

          // Session updated silently in background - no popup message
          console.log(
            "Session updated from another tab - progress synced silently",
          );

          // Update current state with latest data (selective update to avoid disruption)
          if (latestSession.currentProgress) {
            setCurrentProgress(latestSession.currentProgress);
          }
          if (latestSession.forgottenWords) {
            setForgottenWords(new Set(latestSession.forgottenWords));
          }
          if (latestSession.rememberedWords) {
            setRememberedWords(new Set(latestSession.rememberedWords));
          }
          if (latestSession.learningGoals) {
            setLearningGoals(latestSession.learningGoals);
          }
          if (latestSession.dailySessionCount !== undefined) {
            setDailySessionCount(latestSession.dailySessionCount);
          }

          setLastAutoSave(latestSession.lastSaved);
        }
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Force save before page unload
      persistenceService.forceSync();

      // Show warning if user has unsaved progress
      if (rememberedWords.size > 0 || forgottenWords.size > 0) {
        const message =
          "You have learning progress that might be lost. Are you sure you want to leave?";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page restored from bfcache, reload latest session
        console.log("Page restored from cache, reloading session");
        const latestSession = sessionPersistence.loadSession();
        if (latestSession) {
          setLastAutoSave(latestSession.lastSaved);
        }
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "wordAdventure_sessionData" && event.newValue) {
        // Another tab updated the session data
        console.log("Session data updated by another tab");
        try {
          const updatedData = JSON.parse(event.newValue);
          if (updatedData.lastSaved > lastAutoSave) {
            setLastAutoSave(updatedData.lastSaved);

            // Progress synced silently in background - no popup message
            console.log(
              "Progress synced from another device - updated silently",
            );
          }
        } catch (error) {
          console.error("Failed to parse updated session data:", error);
        }
      }
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [
    activeTab,
    currentWordIndex,
    selectedCategory,
    learningMode,
    userRole,
    forgottenWords,
    rememberedWords,
    excludedWordIds,
    currentProgress,
    dailySessionCount,
    currentProfile,
    childStats,
    currentSessionId,
    learningGoals,
    currentDashboardWords,
    customWords,
    practiceWords,
    showQuiz,
    selectedQuizType,
    showMatchingGame,
    gameMode,
    showPracticeGame,
    persistenceService,
    sessionPersistence,
    lastAutoSave,
    setFeedback,
  ]);

  // Tab focus detection for immediate synchronization
  useEffect(() => {
    const handleFocus = () => {
      console.log("Window focused, checking for session updates");
      const latestSession = sessionPersistence.loadSession();

      if (latestSession && latestSession.lastSaved > lastAutoSave) {
        // Silently sync progress without disrupting user
        if (latestSession.currentProgress) {
          setCurrentProgress(latestSession.currentProgress);
        }
        setLastAutoSave(latestSession.lastSaved);
      }
    };

    const handleBlur = () => {
      console.log("Window blurred, saving current state");
      saveSessionData();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [sessionPersistence, lastAutoSave, saveSessionData]);

  // Session restoration handlers
  const handleSessionRestore = useCallback((sessionData: SessionData) => {
    try {
      // Restore UI state
      if (sessionData.activeTab) setActiveTab(sessionData.activeTab);
      if (sessionData.currentWordIndex !== undefined)
        setCurrentWordIndex(sessionData.currentWordIndex);
      if (sessionData.selectedCategory)
        setSelectedCategory(sessionData.selectedCategory);
      if (sessionData.learningMode) setLearningMode(sessionData.learningMode);
      if (sessionData.userRole) setUserRole(sessionData.userRole);

      // Restore progress data
      if (sessionData.forgottenWords) {
        setForgottenWords(new Set(sessionData.forgottenWords));
      }
      if (sessionData.rememberedWords) {
        setRememberedWords(new Set(sessionData.rememberedWords));
      }
      if (sessionData.excludedWordIds) {
        setExcludedWordIds(new Set(sessionData.excludedWordIds));
      }
      if (sessionData.currentProgress) {
        setCurrentProgress(sessionData.currentProgress);
      }
      if (sessionData.dailySessionCount !== undefined) {
        setDailySessionCount(sessionData.dailySessionCount);
      }

      // Restore profile and session data
      if (sessionData.currentProfile)
        setCurrentProfile(sessionData.currentProfile);
      if (sessionData.childStats) setChildStats(sessionData.childStats);
      if (sessionData.currentSessionId)
        setCurrentSessionId(sessionData.currentSessionId);

      // Restore learning data
      if (sessionData.learningGoals)
        setLearningGoals(sessionData.learningGoals);
      if (sessionData.currentDashboardWords)
        setCurrentDashboardWords(sessionData.currentDashboardWords);
      if (sessionData.customWords) setCustomWords(sessionData.customWords);
      if (sessionData.practiceWords)
        setPracticeWords(sessionData.practiceWords);

      // Restore advanced learning state
      if (sessionData.userWordHistory) {
        setUserWordHistory(new Map(sessionData.userWordHistory));
      }
      if (sessionData.sessionNumber !== undefined)
        setSessionNumber(sessionData.sessionNumber);
      if (sessionData.lastSystematicSelection)
        setLastSystematicSelection(sessionData.lastSystematicSelection);
      if (sessionData.dashboardSession)
        setDashboardSession(sessionData.dashboardSession);
      if (sessionData.dashboardSessionNumber !== undefined)
        setDashboardSessionNumber(sessionData.dashboardSessionNumber);

      // Restore UI flags
      if (sessionData.showQuiz !== undefined) setShowQuiz(sessionData.showQuiz);
      if (sessionData.selectedQuizType)
        setSelectedQuizType(sessionData.selectedQuizType);
      if (sessionData.showMatchingGame !== undefined)
        setShowMatchingGame(sessionData.showMatchingGame);
      if (sessionData.gameMode !== undefined) setGameMode(sessionData.gameMode);
      if (sessionData.showPracticeGame !== undefined)
        setShowPracticeGame(sessionData.showPracticeGame);

      setIsSessionInitialized(true);
      setShowSessionRestoration(false);

      console.log("Session restored successfully:", {
        wordsLearned: sessionData.currentProgress?.wordsLearned || 0,
        activeTab: sessionData.activeTab,
        selectedCategory: sessionData.selectedCategory,
      });
    } catch (error) {
      console.error("Failed to restore session:", error);
      handleNewSession();
    }
  }, []);

  const handleNewSession = useCallback(() => {
    // Clear any existing session data
    sessionPersistence.clearSession();
    persistenceService.clearAllSessions();

    setIsSessionInitialized(true);
    setShowSessionRestoration(false);
    setSessionRestorationData(null);

    console.log("Started new session");
  }, [sessionPersistence, persistenceService]);

  const handleSessionRestorationDismiss = useCallback(() => {
    setShowSessionRestoration(false);
    setIsSessionInitialized(true);
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log("State Update:", {
      rememberedWordsCount: rememberedWords.size,
      forgottenWordsCount: forgottenWords.size,
      currentDashboardWordsLength: currentDashboardWords.length,
      learningStatsWeeklyProgress: rememberedWords.size,
      childStatsWordsRemembered: childStats?.wordsRemembered,
      currentProgress,
      learningGoalsCount: learningGoals.length,
      isSessionInitialized,
      lastAutoSave: new Date(lastAutoSave).toLocaleTimeString(),
    });
  }, [
    rememberedWords.size,
    forgottenWords.size,
    currentDashboardWords.length,
    childStats?.wordsRemembered,
    currentProgress,
    learningGoals.length,
    isSessionInitialized,
    lastAutoSave,
  ]);

  // Dynamic learning stats that reflect actual progress and goals
  const learningStats = {
    wordsLearned: rememberedWords.size,
    totalWords: wordsDatabase.length,
    currentStreak: 7,
    weeklyGoal:
      learningGoals.find((g) => g.type === "weekly" && g.isActive)?.target ||
      20,
    weeklyProgress: rememberedWords.size, // Allow progress beyond daily goal
    accuracyRate: currentProgress.accuracy,
    favoriteCategory: "Animals",
    totalPoints:
      rememberedWords.size * 50 + (rememberedWords.size > 10 ? 500 : 0), // Dynamic points
    level: Math.floor(rememberedWords.size / 5) + 1, // Level up every 5 words
    dailyGoalProgress: currentProgress.wordsLearned,
    dailyGoalTarget:
      learningGoals.find((g) => g.type === "daily" && g.isActive)?.target || 10,
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
        icon: "🔥",
        earned: true,
        description: "7-day learning streak",
      },
      {
        id: "category-explorer",
        name: "Category Explorer",
        icon: "🗺️",
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

  // Track navigation history for better back navigation
  useEffect(() => {
    const currentPath = `${learningMode}-${selectedCategory || "no-category"}`;
    setNavigationHistory((prev) => {
      const newHistory = [...prev, currentPath];
      // Keep only last 5 navigation steps
      return newHistory.slice(-5);
    });
  }, [learningMode, selectedCategory]);

  // Enhanced navigation with keyboard support
  useEffect(() => {
    const handleKeyNavigation = (e: KeyboardEvent) => {
      // Only handle when in cards mode and not in input fields
      if (
        learningMode === "cards" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
      ) {
        if (e.key === "Escape") {
          e.preventDefault();
          if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
          }
          audioService.playClickSound();
          setLearningMode("selector");
          setCurrentWordIndex(0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyNavigation);
    return () => window.removeEventListener("keydown", handleKeyNavigation);
  }, [learningMode]);

  // Initialize learning session and load child stats
  useEffect(() => {
    const initializeSession = async () => {
      if (currentProfile?.id && activeTab === "learn" && !currentSessionId) {
        try {
          const sessionResponse = await WordProgressAPI.startSession({
            childId: currentProfile.id,
            sessionType: "word_cards",
            category: selectedCategory,
          });
          setCurrentSessionId(sessionResponse.sessionId);

          // Load child stats
          const statsResponse = await WordProgressAPI.getChildStats(
            currentProfile.id,
          );
          setChildStats(statsResponse.stats);

          // Initialize achievement system with current progress
          const currentProgress = {
            wordsLearned: statsResponse.stats?.wordsRemembered || 0,
            streakDays: Math.floor(Math.random() * 5), // Demo data
            totalAccuracy: statsResponse.stats?.averageAccuracy || 80,
            categoriesExplored: new Set([selectedCategory]),
            timeSpentLearning: Math.floor(Math.random() * 120), // Demo data
            vowelQuizzesCompleted: 0,
          };
          AchievementTracker.updateJourneyProgress(currentProgress);
        } catch (error) {
          console.error("Failed to initialize session:", error);
        }
      }
    };

    initializeSession();
  }, [currentProfile?.id, activeTab, selectedCategory, currentSessionId]);

  const handleQuizComplete = (score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);

    // Track quiz completion and check for achievements
    const unlockedAchievements = AchievementTracker.trackActivity({
      type: "quiz",
      score: percentage,
      accuracy: percentage,
      category: selectedCategory,
    });

    setFeedback({
      type: "celebration",
      title: "Quiz Complete! 🎉",
      message: `You scored ${score}/${total} (${percentage}%)`,
      points: score * 10,
      onContinue: () => {
        setFeedback(null);
        // Show achievements after feedback is closed
        if (unlockedAchievements.length > 0) {
          setAchievementPopup(unlockedAchievements);
        }
      },
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
        title: "Vocabulary Session Complete! 🎉📚✨",
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
      title: "Amazing Game! 🎮🌟",
      message: `You scored ${score} points and learned ${totalWords} words!`,
      points: score,
      onContinue: () => setFeedback(null),
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    // Enhanced category change with better UX
    const previousCategory = selectedCategory;

    setSelectedCategory(categoryId);
    setCurrentWordIndex(0);
    setForgottenWords(new Set());
    setRememberedWords(new Set());
    // Reset excluded words when changing category
    setExcludedWordIds(new Set());

    // Reset session number for new category
    setSessionNumber(1);

    // Clear current dashboard words to force regeneration
    setCurrentDashboardWords([]);

    // Play transition sound for better feedback
    if (categoryId !== previousCategory) {
      audioService.playWhooshSound();

      // Light haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  // Enhanced smart back navigation
  const handleSmartBackNavigation = () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
    audioService.playClickSound();

    // If user has made progress, show a subtle confirmation
    const hasProgress = rememberedWords.size > 0 || forgottenWords.size > 0;

    if (hasProgress && window.confirm) {
      // Note: In a real app, you might want to use a custom modal instead of alert
      // For now, just proceed without confirmation for better UX
    }

    setLearningMode("selector");
    setCurrentWordIndex(0);

    // Preserve some session data for potential return
    // You could implement "Continue where you left off" feature
  };

  const generateFreshWords = () => {
    if (!selectedCategory) {
      console.log("No category selected, skipping word generation");
      return [];
    }

    console.log(
      `Generating fresh words with enhanced system for category: ${selectedCategory}`,
    );

    try {
      // Use the enhanced word selection system
      const systematicSelection =
        EnhancedWordSelector.generateSystematicSession(
          selectedCategory,
          userWordHistory,
          {
            rememberedWords,
            forgottenWords,
            excludedWordIds,
          },
          childStats,
          sessionNumber,
        );

      const selectedWords = systematicSelection.words;

      // Store the systematic selection for debugging and analysis
      setLastSystematicSelection(systematicSelection);

      // Update states
      setCurrentDashboardWords(selectedWords);
      setSessionNumber((prev) => prev + 1);

      console.log(`Enhanced Selection Results:`, {
        strategy: systematicSelection.sessionInfo.sessionStrategy,
        difficulty: systematicSelection.sessionInfo.difficulty,
        newWords: systematicSelection.sessionInfo.totalNewWords,
        reviewWords: systematicSelection.sessionInfo.reviewWords,
        exhaustionLevel:
          systematicSelection.sessionInfo.exhaustionLevel.toFixed(2),
        categories: systematicSelection.sessionInfo.categories,
        words: selectedWords.map(
          (w) => `${w.word} (${w.category}, ${w.difficulty})`,
        ),
      });

      return selectedWords;
    } catch (error) {
      console.error("Error in enhanced word generation:", error);

      // Fallback to original system
      if (!selectedCategory) {
        setCurrentDashboardWords([]);
        return [];
      }
      const fallbackWords = getWordsByCategory(selectedCategory).slice(0, 20);

      setCurrentDashboardWords(fallbackWords);
      return fallbackWords;
    }
  };

  const generateDashboardWords = () => {
    console.log("Generating systematic dashboard words...");

    try {
      // Calculate total words completed (remembered words)
      const wordsCompleted = rememberedWords.size;

      // Create user progress object
      const userProgress: UserProgress = {
        wordsCompleted,
        currentDifficulty:
          wordsCompleted < 50
            ? "easy"
            : wordsCompleted < 100
              ? "medium"
              : "hard",
        rememberedWords,
        forgottenWords,
        categoryProgress: new Map(),
      };

      // Generate systematic dashboard session
      const session = DashboardWordGenerator.generateDashboardSession(
        userProgress,
        dashboardSessionNumber,
      );

      // Update states
      setDashboardSession(session);
      setCurrentDashboardWords(session.words);
      setDashboardSessionNumber((prev) => prev + 1);

      console.log("Dashboard session generated:", {
        difficulty: session.sessionInfo.difficulty,
        stage: session.sessionInfo.progressionStage,
        categories: session.sessionInfo.categoriesUsed,
        wordCount: session.words.length,
        words: session.words.map(
          (w) => `${w.word} (${w.category}, ${w.difficulty})`,
        ),
      });

      return session.words;
    } catch (error) {
      console.error("Error generating dashboard words:", error);

      // Fallback to random words
      const fallbackWords = getRandomWords(20);
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
      const categoryDisplayName = selectedCategory;

      if (accuracy === 100) {
        achievementTitle = "Perfect Category Mastery! 🏆";
        achievementIcon = "🏆";
        achievementMessage = `Outstanding! You remembered ALL ${totalWords} words in ${categoryDisplayName}! You're a true champion!\n\n🎁 Perfect Mastery Bonus: 200 points!\n✨ New adventure zone unlocked!\n👑 Master badge earned!`;
      } else if (accuracy >= 90) {
        achievementTitle = "Category Expert! 🎓";
        achievementIcon = "🎓⭐";
        achievementMessage = `Excellent work! You mastered ${categoryDisplayName} with ${accuracy}% accuracy! Almost perfect!\n\n🎁 Expert Bonus: 150 points!\n⭐ Expert badge earned!`;
      } else if (accuracy >= 75) {
        achievementTitle = "Category Scholar! 📚✨";
        achievementIcon = "📚";
        achievementMessage = `Great job! You completed ${categoryDisplayName} with ${accuracy}% accuracy! Keep up the good work!\n\n🎓 Scholar Bonus: 100 points!\n📚 Scholar badge earned!`;
      } else if (accuracy >= 50) {
        achievementTitle = "Category Explorer! 🗺️🌟";
        achievementIcon = "🗺️";
        achievementMessage = `Good effort! You finished ${categoryDisplayName} with ${accuracy}% accuracy! Practice makes perfect!\n\n🎁 Explorer Bonus: 75 points!\n🎯 Explorer badge earned!`;
      } else {
        achievementTitle = "Category Challenger! 💪";
        achievementIcon = "💪";
        achievementMessage = `Nice try! You completed ${categoryDisplayName} with ${accuracy}% accuracy! Every attempt makes you stronger!\n\n🏆 Challenger Bonus: 50 points!\n🎖️ Challenger badge earned!`;
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
    // Update enhanced word history first
    const wasCorrect = status === "remembered";
    EnhancedWordSelector.updateWordHistory(
      word.id,
      wasCorrect,
      userWordHistory,
    );

    // Trigger re-render by updating the state
    setUserWordHistory(new Map(userWordHistory));

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
      // But ensure we don't regress if local state is higher
      setChildStats((prevStats) => {
        const currentLocalProgress = rememberedWords.size;
        const apiProgress = response.updatedStats?.wordsRemembered || 0;

        console.log("Updating childStats:", {
          prevWordsRemembered: prevStats?.wordsRemembered,
          apiProgress,
          currentLocalProgress,
          willUse: Math.max(apiProgress, currentLocalProgress),
        });

        return {
          ...response.updatedStats,
          wordsRemembered: Math.max(apiProgress, currentLocalProgress),
        };
      });

      // Learning stats are computed dynamically from current state

      // Update adventure system with word interaction
      adventureService.trackWordInteraction(
        word.id.toString(),
        status === "remembered",
        status === "remembered",
        responseTime ? responseTime > 2000 : false,
      );

      // Track journey achievements for word learning
      const newAchievements = AchievementTracker.trackActivity({
        type: "wordLearning",
        wordsLearned: status === "remembered" ? 1 : 0,
        accuracy: status === "remembered" ? 100 : 0,
        category: word.category,
        timeSpent: responseTime ? Math.round(responseTime / 1000 / 60) : 1, // Convert to minutes
      });

      // Update session tracking
      if (status === "remembered" || status === "needs_practice") {
        setDailySessionCount((prev) => prev + 1);
      }

      // Check daily goal completion
      const updatedWordsLearned =
        status === "remembered"
          ? rememberedWords.size + 1
          : rememberedWords.size;
      const dailyGoal = learningGoals.find(
        (goal) => goal.type === "daily" && goal.isActive,
      );
      if (dailyGoal && updatedWordsLearned >= dailyGoal.target) {
        setAchievementPopup((prev) => [
          ...prev,
          {
            id: `daily-goal-${Date.now()}`,
            title: "Daily Goal Achieved!",
            description: `Amazing! You've learned ${dailyGoal.target} words today!`,
            emoji: "🏆",
            unlocked: true,
          },
        ]);
      }

      // Show achievement notifications in sequence
      const notifications = [];

      // Add journey achievements to notifications
      if (newAchievements.length > 0) {
        setTimeout(() => {
          setAchievementPopup(newAchievements);
        }, 1000); // Show after a short delay
      }

      // Add level up to notifications if applicable
      if (response.levelUp) {
        notifications.push({
          type: "celebration",
          title: "🎉 Level Up! 🎉",
          message: `Congratulations! You've reached a new level!\n\n🌟 Keep up the amazing work!`,
          points: 50,
        });
      }

      // OLD ACHIEVEMENT NOTIFICATIONS DISABLED - Using only the new enhanced orange achievement system
      // if (response.achievements && response.achievements.length > 0) {
      //   response.achievements.forEach((achievement) => {
      //     notifications.push({
      //       type: "achievement",
      //       title: `🏆 Achievement Unlocked!`,
      //       message: achievement,
      //       points: 25,
      //     });
      //   });
      // }

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
      message: `Great job practicing your tricky words!\n\n✅ Remembered: ${results.correctWords.length} words\n🎯 Accuracy: ${results.accuracy}%\n\nKeep practicing to master all your words!`,
      points: results.correctWords.length * 15,
      onContinue: () => setFeedback(null),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-x-hidden">
      {/* Session Restoration Modal */}
      {showSessionRestoration && sessionRestorationData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <SessionRestoration
            onRestore={handleSessionRestore}
            onDismiss={handleSessionRestorationDismiss}
            onNewSession={handleNewSession}
            autoRestoreEnabled={true}
            showDetailed={true}
          />
        </div>
      )}

      {/* Loading State */}
      {!isSessionInitialized && !showSessionRestoration && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isRestoringSession
                ? "Restoring your previous session..."
                : "Initializing your learning session..."}
            </p>
          </div>
        </div>
      )}
      {/* Main Content - Only show when session is initialized */}
      {isSessionInitialized && (
        <>
          {/* Optimized Mobile-First Header */}
          <header className="relative overflow-hidden bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative container mx-auto px-4 py-2 md:py-4">
              {/* Mobile header - ultra compact */}
              <div className="flex items-center justify-between md:hidden">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-1">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2Fa33f74a2f97141a4a1ef43d9448f9bda%2F2a4b7e4c3c38485b966cfd2cff50da9e?format=webp&width=800"
                      alt="Wordy Logo"
                      className="w-5 h-5 rounded-full"
                    />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold leading-tight">
                      Wordy's Adventure!
                    </h1>
                    <p className="text-xs text-educational-yellow-light opacity-90">
                      Let's Learn! 🦉
                    </p>
                  </div>
                </div>
                {/* Mobile menu trigger could go here if needed */}
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
                  Fun vocabulary learning for kids! 🌟
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
                  🎯📚✨
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
                    {
                      id: "quiz",
                      icon: Brain,
                      label: "Quiz Time",
                      color: "pink",
                    },
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
                    <span className="font-semibold text-sm">
                      Parent Dashboard
                    </span>
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
              <div className="w-full p-4 md:p-8 pb-20 lg:pb-8 mobile-parent-dashboard max-h-screen">
                <ParentDashboard
                  children={undefined}
                  sessions={undefined}
                  onNavigateBack={() => setUserRole("child")}
                  showMobileBackButton={false}
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
                        className={`hidden w-full flex items-center gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl transition-all ${
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
                          🎯 My Journey
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

                {/* Main Content Area - Optimized Mobile Spacing */}
                <div className="flex-1 p-3 sm:p-4 lg:p-8 pb-20 sm:pb-24 lg:pb-8 overflow-y-auto scroll-smooth">
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
                          console.log(
                            `Word Progress: ${word.word} - ${status}`,
                            {
                              wordId: word.id,
                              currentRemembered: rememberedWords.size,
                              currentForgotten: forgottenWords.size,
                            },
                          );

                          // Handle word progress in dashboard
                          if (status === "remembered") {
                            setRememberedWords((prev) => {
                              const newSet = new Set([...prev, word.id]);
                              console.log(
                                `Updated remembered words: ${newSet.size}`,
                                Array.from(newSet),
                              );
                              return newSet;
                            });
                            setForgottenWords((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(word.id);
                              return newSet;
                            });
                          } else if (status === "needs_practice") {
                            setForgottenWords((prev) => {
                              const newSet = new Set([...prev, word.id]);
                              console.log(
                                `Updated forgotten words: ${newSet.size}`,
                                Array.from(newSet),
                              );
                              return newSet;
                            });
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
                        dashboardSession={dashboardSession}
                        onGenerateNewSession={generateDashboardWords}
                      />

                      {/* Enhanced Word Selection Debug Panel */}
                      {process.env.NODE_ENV === "development" &&
                        lastSystematicSelection && (
                          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
                            <h4 className="font-bold mb-2">
                              🔧 Enhanced Word Selection Debug
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <strong>Strategy:</strong>{" "}
                                {
                                  lastSystematicSelection.sessionInfo
                                    .sessionStrategy
                                }
                              </div>
                              <div>
                                <strong>Difficulty:</strong>{" "}
                                {lastSystematicSelection.sessionInfo.difficulty}
                              </div>
                              <div>
                                <strong>New Words:</strong>{" "}
                                {
                                  lastSystematicSelection.sessionInfo
                                    .totalNewWords
                                }
                              </div>
                              <div>
                                <strong>Review Words:</strong>{" "}
                                {
                                  lastSystematicSelection.sessionInfo
                                    .reviewWords
                                }
                              </div>
                              <div>
                                <strong>Exhaustion:</strong>{" "}
                                {(
                                  lastSystematicSelection.sessionInfo
                                    .exhaustionLevel * 100
                                ).toFixed(1)}
                                %
                              </div>
                              <div>
                                <strong>Categories:</strong>{" "}
                                {lastSystematicSelection.sessionInfo.categories.join(
                                  ", ",
                                )}
                              </div>
                            </div>
                            <div className="mt-2">
                              <strong>Session #{sessionNumber - 1}</strong> |{" "}
                              <strong>Word History:</strong>{" "}
                              {userWordHistory.size} words tracked
                            </div>
                          </div>
                        )}
                    </TabsContent>

                    <TabsContent value="learn">
                      <div className="space-y-8">
                        {learningMode === "selector" || !selectedCategory ? (
                          <ChildFriendlyCategorySelector
                            selectedCategory={selectedCategory}
                            onSelectCategory={(category) => {
                              handleCategoryChange(category);
                              setLearningMode("cards");
                            }}
                            userInterests={currentProfile?.interests || []}
                          />
                        ) : (
                          <>
                            <div className="text-center">
                              {/* Compact Mobile Header */}
                              <div className="mb-2">
                                {/* Mobile: Compact navigation */}
                                <div className="block sm:hidden">
                                  {/* Minimal Header with Essential Info */}
                                  <div className="flex items-center justify-between mb-1.5 px-2">
                                    {/* Left: Back Button */}
                                    <Button
                                      onClick={() => {
                                        if (navigator.vibrate) {
                                          navigator.vibrate([50, 30, 50]);
                                        }
                                        audioService.playClickSound();
                                        setLearningMode("selector");
                                        setCurrentWordIndex(0);
                                      }}
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                    >
                                      <BookOpen className="w-3.5 h-3.5" />
                                    </Button>

                                    {/* Center: Category and Progress */}
                                    <div className="flex-1 text-center">
                                      <div className="text-sm font-semibold text-slate-800 truncate px-2">
                                        {selectedCategory
                                          ? selectedCategory
                                              .charAt(0)
                                              .toUpperCase() +
                                            selectedCategory.slice(1)
                                          : "Category"}
                                      </div>
                                      <div className="text-xs text-slate-500">
                                        {currentWordIndex + 1}/
                                        {displayWords.length} •{" "}
                                        {rememberedWords.size} ✅
                                      </div>
                                    </div>

                                    {/* Right: Switch Button */}
                                    <Button
                                      onClick={() => {
                                        if (navigator.vibrate) {
                                          navigator.vibrate(25);
                                        }
                                        audioService.playClickSound();
                                        setSelectedCategory("");
                                        setLearningMode("selector");
                                        setCurrentWordIndex(0);
                                      }}
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                                    >
                                      <Shuffle className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Desktop/Tablet: Compact layout */}
                                <div className="hidden sm:block">
                                  <div className="flex items-center justify-between gap-4 mb-2">
                                    <div className="text-left flex-1 min-w-0">
                                      <h2 className="text-base md:text-lg font-bold text-slate-800 truncate">
                                        {selectedCategory
                                          ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Words`
                                          : "Select a Category"}
                                      </h2>
                                      <div className="flex items-center gap-3 text-xs text-slate-600">
                                        <span>
                                          {currentWordIndex + 1}/
                                          {displayWords.length}
                                        </span>
                                        <span>
                                          {rememberedWords.size} learned
                                        </span>
                                        <span>
                                          {forgottenWords.size} review
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex-shrink-0 flex gap-1">
                                      <Button
                                        onClick={() => {
                                          if (navigator.vibrate) {
                                            navigator.vibrate(25);
                                          }
                                          audioService.playClickSound();
                                          setSelectedCategory("");
                                          setLearningMode("selector");
                                          setCurrentWordIndex(0);
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs rounded-md hover:bg-slate-100"
                                      >
                                        <Shuffle className="w-3 h-3" />
                                      </Button>

                                      <Button
                                        onClick={() => {
                                          if (navigator.vibrate) {
                                            navigator.vibrate([50, 30, 50]);
                                          }
                                          audioService.playClickSound();
                                          setLearningMode("selector");
                                          setCurrentWordIndex(0);
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs rounded-md hover:bg-slate-100"
                                      >
                                        <BookOpen className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {learningMode === "cards" && (
                              <>
                                {(() => {
                                  return (
                                    <>
                                      {displayWords.length > 0 && (
                                        <>
                                          {/* Minimal progress indicator */}
                                          <div className="max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-1">
                                            <div className="w-full bg-slate-200 rounded-full h-1">
                                              <div
                                                className="bg-blue-500 h-1 rounded-full transition-all duration-300 ease-out"
                                                style={{
                                                  width: `${((currentWordIndex + 1) / displayWords.length) * 100}%`,
                                                }}
                                              ></div>
                                            </div>
                                          </div>

                                          <div
                                            className={`max-w-xs sm:max-w-sm md:max-w-md mx-auto px-1 sm:px-2 md:px-0 relative ${
                                              celebrationEffect &&
                                              "animate-pulse shadow-2xl"
                                            }`}
                                          >
                                            {/* Celebration Sparkles */}
                                            {celebrationEffect && (
                                              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 animate-pulse z-20 rounded-xl">
                                                <div className="absolute top-4 left-4 text-2xl animate-bounce">
                                                  ✨
                                                </div>
                                                <div className="absolute top-6 right-6 text-3xl animate-spin">
                                                  🌟
                                                </div>
                                                <div className="absolute bottom-4 left-6 text-2xl animate-bounce delay-300">
                                                  🎊
                                                </div>
                                                <div className="absolute bottom-6 right-4 text-2xl animate-pulse delay-500">
                                                  💫
                                                </div>
                                              </div>
                                            )}
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
                                                console.log(
                                                  "Favorited:",
                                                  word.word,
                                                )
                                              }
                                              onWordMastered={
                                                handleWordMastered
                                              }
                                              showVocabularyBuilder={true}
                                            />
                                          </div>

                                          <div className="space-y-4">
                                            {/* Mobile-Optimized Learning Progress Buttons */}
                                            <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 px-2 sm:px-4 md:px-0">
                                              <Button
                                                onClick={async () => {
                                                  const currentWord =
                                                    displayWords[
                                                      currentWordIndex
                                                    ];
                                                  if (currentWord) {
                                                    // Mark as forgotten for extra practice
                                                    setForgottenWords(
                                                      (prev) =>
                                                        new Set([
                                                          ...prev,
                                                          currentWord.id,
                                                        ]),
                                                    );
                                                    setRememberedWords(
                                                      (prev) => {
                                                        const newSet = new Set(
                                                          prev,
                                                        );
                                                        newSet.delete(
                                                          currentWord.id,
                                                        );
                                                        return newSet;
                                                      },
                                                    );

                                                    // Record progress in database (this handles all achievements)
                                                    await handleWordProgress(
                                                      currentWord,
                                                      "needs_practice",
                                                    );
                                                    // Show encouragement effects and play sound
                                                    audioService.playEncouragementSound();
                                                    setShowCelebration(true);
                                                    setTimeout(
                                                      () =>
                                                        setShowCelebration(
                                                          false,
                                                        ),
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
                                                        message: `You've reviewed all ${completionResult.totalWords} words in ${selectedCategory === "all" ? "this word set" : selectedCategory}!\\n\\n✅ Remembered: ${completionResult.totalRemembered} words\\n❌ Need practice: ${completionResult.totalWords - completionResult.totalRemembered} words\\n\\n${completionResult.totalWords - completionResult.totalRemembered > 0 ? "Don't worry! Let's practice the tricky ones again! 💪📚" : "Amazing work! 🎉"}`,
                                                        points:
                                                          completionResult.totalRemembered *
                                                          10, // Fewer points since words were forgotten
                                                        onContinue: () => {
                                                          setFeedback(null);
                                                          setCurrentWordIndex(
                                                            0,
                                                          );
                                                        },
                                                      });
                                                    } else {
                                                      // Restart with forgotten words for practice
                                                      setCurrentWordIndex(0);
                                                    }
                                                  }
                                                }}
                                                className="flex-1 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-bold border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 py-3 sm:py-4 px-3 sm:px-6 min-h-[56px] sm:min-h-[60px] relative overflow-hidden text-sm sm:text-base"
                                                disabled={isLoadingProgress}
                                              >
                                                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="relative z-10 flex items-center justify-center">
                                                  <span className="text-xl sm:text-2xl mr-1 sm:mr-2 animate-wiggle">
                                                    😔
                                                  </span>
                                                  <div className="text-center">
                                                    <div className="font-bold text-base sm:text-lg">
                                                      I Forgot
                                                    </div>
                                                    <div className="text-xs opacity-90 hidden sm:block">
                                                      Need practice! 💪
                                                    </div>
                                                  </div>
                                                </div>
                                              </Button>

                                              <Button
                                                onClick={async () => {
                                                  const currentWord =
                                                    displayWords[
                                                      currentWordIndex
                                                    ];
                                                  if (currentWord) {
                                                    // Mark as remembered
                                                    setRememberedWords(
                                                      (prev) =>
                                                        new Set([
                                                          ...prev,
                                                          currentWord.id,
                                                        ]),
                                                    );
                                                    setForgottenWords(
                                                      (prev) => {
                                                        const newSet = new Set(
                                                          prev,
                                                        );
                                                        newSet.delete(
                                                          currentWord.id,
                                                        );
                                                        return newSet;
                                                      },
                                                    );

                                                    // Record progress in database (this handles all achievements)
                                                    await handleWordProgress(
                                                      currentWord,
                                                      "remembered",
                                                    );
                                                    // Show enhanced celebration effects and play success sound
                                                    setCelebrationEffect(true);
                                                    audioService.playSuccessSound();
                                                    setShowCelebration(true);
                                                    setTimeout(() => {
                                                      setCelebrationEffect(
                                                        false,
                                                      );
                                                      setShowCelebration(false);
                                                    }, 2000);
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
                                                        message: `${completionResult.message}\n\n✅ Remembered: ${completionResult.totalRemembered} words\n❌ Need practice: ${completionResult.totalWords - completionResult.totalRemembered} words\n\n🏆 Category Achievement Unlocked! 🎉`,
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
                                                          if (
                                                            totalForgotten > 0
                                                          ) {
                                                            // Restart with forgotten words for focused practice
                                                            setCurrentWordIndex(
                                                              0,
                                                            );
                                                          } else {
                                                            // Perfect completion - reset for new round
                                                            setCurrentWordIndex(
                                                              0,
                                                            );
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
                                                className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 py-3 sm:py-4 px-3 sm:px-6 min-h-[56px] sm:min-h-[60px] relative overflow-hidden text-sm sm:text-base"
                                                disabled={isLoadingProgress}
                                              >
                                                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="relative z-10 flex items-center justify-center">
                                                  <span className="text-xl sm:text-2xl mr-1 sm:mr-2 animate-bounce">
                                                    😊
                                                  </span>
                                                  <div className="text-center">
                                                    <div className="font-bold text-base sm:text-lg">
                                                      I Remember!
                                                    </div>
                                                    <div className="text-xs opacity-90 hidden sm:block">
                                                      Awesome! ⭐
                                                    </div>
                                                  </div>
                                                </div>
                                              </Button>
                                            </div>

                                            {/* Mobile-Optimized Learning Progress Indicator */}
                                            <div className="text-center space-y-2">
                                              <div className="flex justify-center gap-3 sm:gap-4 text-sm">
                                                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                                                  <span className="text-sm">
                                                    ✅
                                                  </span>
                                                  <span className="font-bold text-sm">
                                                    {rememberedWords.size}
                                                  </span>
                                                  <span className="text-xs opacity-75 hidden sm:inline">
                                                    remembered
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                                                  <span className="text-sm">
                                                    💪
                                                  </span>
                                                  <span className="font-bold text-sm">
                                                    {forgottenWords.size}
                                                  </span>
                                                  <span className="text-xs opacity-75 hidden sm:inline">
                                                    practice
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Compact Navigation Controls */}
                                              <div className="flex justify-center items-center gap-2 mt-3 max-w-xs sm:max-w-sm md:max-w-md mx-auto">
                                                {/* Previous Button */}
                                                <Button
                                                  onClick={() => {
                                                    if (currentWordIndex > 0) {
                                                      setCurrentWordIndex(
                                                        currentWordIndex - 1,
                                                      );
                                                      audioService.playClickSound();
                                                      if (navigator.vibrate) {
                                                        navigator.vibrate(25);
                                                      }
                                                    }
                                                  }}
                                                  disabled={
                                                    currentWordIndex === 0
                                                  }
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 rounded-full p-0 disabled:opacity-30 hover:bg-slate-100"
                                                >
                                                  <span className="text-lg">
                                                    ←
                                                  </span>
                                                </Button>

                                                {/* Compact Progress */}
                                                <div className="flex-1 flex items-center justify-center gap-2 text-xs text-slate-600">
                                                  <span className="font-medium">
                                                    {currentWordIndex + 1}/
                                                    {displayWords.length}
                                                  </span>
                                                </div>

                                                {/* Next Button */}
                                                <Button
                                                  onClick={() => {
                                                    if (
                                                      currentWordIndex <
                                                      displayWords.length - 1
                                                    ) {
                                                      setCurrentWordIndex(
                                                        currentWordIndex + 1,
                                                      );
                                                      audioService.playClickSound();
                                                      if (navigator.vibrate) {
                                                        navigator.vibrate(25);
                                                      }
                                                    } else {
                                                      setCelebrationEffect(
                                                        true,
                                                      );
                                                      setTimeout(() => {
                                                        setCelebrationEffect(
                                                          false,
                                                        );
                                                        if (
                                                          window.confirm(
                                                            "Great job! You've completed all words in this category. Return to library to choose another category?",
                                                          )
                                                        ) {
                                                          handleSmartBackNavigation();
                                                        }
                                                      }, 2000);
                                                    }
                                                  }}
                                                  disabled={
                                                    currentWordIndex ===
                                                    displayWords.length - 1
                                                  }
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 rounded-full p-0 disabled:opacity-30 hover:bg-slate-100"
                                                >
                                                  <span className="text-lg">
                                                    →
                                                  </span>
                                                </Button>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Minimal Status Indicator */}
                                          <div className="text-center mt-2">
                                            {(() => {
                                              const currentWord =
                                                displayWords[currentWordIndex];
                                              if (!currentWord) return null;

                                              if (
                                                rememberedWords.has(
                                                  currentWord.id,
                                                )
                                              ) {
                                                return (
                                                  <div className="text-xs text-green-600 font-medium">
                                                    ✅ Learned
                                                  </div>
                                                );
                                              } else if (
                                                forgottenWords.has(
                                                  currentWord.id,
                                                )
                                              ) {
                                                return (
                                                  <div className="text-xs text-orange-600 font-medium">
                                                    🤔 Review
                                                  </div>
                                                );
                                              } else {
                                                return (
                                                  <div className="text-xs text-blue-600 font-medium">
                                                    🆕 New
                                                  </div>
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
                          {/* Quiz Header - Kid-Friendly & Mobile Optimized */}
                          <div className="text-center">
                            <div className="flex justify-center mb-4">
                              <div className="bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink p-3 md:p-4 rounded-full shadow-lg animate-gentle-bounce">
                                <Brain className="w-8 h-8 md:w-12 md:h-12 text-white" />
                              </div>
                            </div>
                            <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-4">
                              🧠 Quiz Time!
                            </h2>
                            <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-6 px-4">
                              Test your vocabulary with super fun quizzes! 🌟
                            </p>
                          </div>

                          {/* Kid-Friendly Quiz Cards - Mobile Optimized */}
                          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto px-2">
                            {/* Listen & Guess Quiz */}
                            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-educational-pink/30 animate-kid-float">
                              <CardContent className="p-3 md:p-4 text-center">
                                <div className="text-3xl md:text-5xl mb-2 md:mb-3 animate-gentle-bounce">
                                  🎧
                                </div>
                                <h3 className="text-sm md:text-lg font-bold text-educational-pink mb-1 md:mb-2">
                                  Listen & Guess
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 hidden md:block">
                                  Listen and pick the right picture! 🎵
                                </p>
                                <div className="flex justify-center gap-1 mb-2 md:mb-3">
                                  <span className="bg-educational-pink/20 text-educational-pink px-1.5 py-0.5 rounded-full text-xs">
                                    🎯 Audio!
                                  </span>
                                </div>
                                <Button
                                  onClick={() => {
                                    setSelectedQuizType("listen-guess");
                                    setShowQuiz(true);
                                  }}
                                  className="w-full bg-educational-pink text-white hover:bg-educational-pink/90 py-1.5 md:py-2 text-xs md:text-sm rounded-xl animate-wiggle"
                                  size="sm"
                                >
                                  <Play className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                  Let's Listen! 🎧
                                </Button>
                              </CardContent>
                            </Card>

                            {/* Picture Quiz - Kid-Friendly */}
                            <Card className="cursor-pointer hover:shadow-lg active:shadow-xl transition-all duration-200 active:scale-95 border-2 border-educational-orange/30">
                              <CardContent className="p-3 md:p-4 text-center">
                                <div className="text-3xl md:text-5xl mb-2 md:mb-3 animate-bounce">
                                  🖼️
                                </div>
                                <h3 className="text-sm md:text-lg font-bold text-educational-orange mb-1 md:mb-2">
                                  Picture Fun!
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 hidden md:block">
                                  Look at pictures and guess the words! 📸
                                </p>
                                <div className="flex justify-center gap-1 mb-2 md:mb-3">
                                  <span className="bg-educational-orange/20 text-educational-orange px-1.5 py-0.5 rounded-full text-xs">
                                    🎯 Fun!
                                  </span>
                                </div>
                                <Button
                                  onClick={() => {
                                    setSelectedQuizType("picture");
                                    setShowQuiz(true);
                                  }}
                                  className="w-full bg-educational-orange text-white hover:bg-educational-orange/90 active:bg-educational-orange/80 py-2 text-xs sm:text-sm rounded-xl min-h-[44px]"
                                  size="sm"
                                >
                                  <Play className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                  Let's Play! 🚀
                                </Button>
                              </CardContent>
                            </Card>

                            {/* Vowel Rescue - Easy */}
                            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-educational-green/30 animate-kid-float">
                              <CardContent className="p-3 md:p-4 text-center">
                                <div className="text-3xl md:text-5xl mb-2 md:mb-3 animate-bounce">
                                  🎯
                                </div>
                                <h3 className="text-sm md:text-lg font-bold text-educational-green mb-1 md:mb-2">
                                  Vowel Rescue!
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 hidden md:block">
                                  Help rescue missing vowels! 🆘
                                </p>
                                <div className="flex justify-center gap-1 mb-2 md:mb-3">
                                  <span className="bg-educational-green/20 text-educational-green px-1.5 py-0.5 rounded-full text-xs">
                                    🎯 Easy!
                                  </span>
                                </div>
                                <Button
                                  onClick={() => {
                                    setSelectedQuizType("vowel-easy");
                                    setShowQuiz(true);
                                  }}
                                  className="w-full bg-educational-green text-white hover:bg-educational-green/90 py-1.5 md:py-2 text-xs md:text-sm rounded-xl animate-wiggle"
                                  size="sm"
                                >
                                  <Play className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                  Rescue Vowels! 🚀
                                </Button>
                              </CardContent>
                            </Card>

                            {/* Vowel Challenge - Medium */}
                            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-educational-purple/30 animate-kid-float-delayed">
                              <CardContent className="p-3 md:p-4 text-center">
                                <div className="text-3xl md:text-5xl mb-2 md:mb-3 animate-sparkle">
                                  🎯
                                </div>
                                <h3 className="text-sm md:text-lg font-bold text-educational-purple mb-1 md:mb-2">
                                  Vowel Challenge!
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 hidden md:block">
                                  Multiple missing vowels! 💪
                                </p>
                                <div className="flex justify-center gap-1 mb-2 md:mb-3">
                                  <span className="bg-educational-purple/20 text-educational-purple px-1.5 py-0.5 rounded-full text-xs">
                                    🎯 Medium!
                                  </span>
                                </div>
                                <Button
                                  onClick={() => {
                                    setSelectedQuizType("vowel-challenge");
                                    setShowQuiz(true);
                                  }}
                                  className="w-full bg-educational-purple text-white hover:bg-educational-purple/90 py-1.5 md:py-2 text-xs md:text-sm rounded-xl"
                                  size="sm"
                                >
                                  <Play className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                  Take Challenge! ⚡
                                </Button>
                              </CardContent>
                            </Card>

                            {/* Vowel Rush - Timed */}
                            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-educational-orange/30 animate-gentle-bounce">
                              <CardContent className="p-3 md:p-4 text-center">
                                <div className="text-3xl md:text-5xl mb-2 md:mb-3 animate-pulse">
                                  🎯
                                </div>
                                <h3 className="text-sm md:text-lg font-bold text-educational-orange mb-1 md:mb-2">
                                  Vowel Rush!
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 hidden md:block">
                                  60 seconds speed challenge! ⏰
                                </p>
                                <div className="flex justify-center gap-1 mb-2 md:mb-3">
                                  <span className="bg-educational-orange/20 text-educational-orange px-1.5 py-0.5 rounded-full text-xs">
                                    🎯 Timed!
                                  </span>
                                </div>
                                <Button
                                  onClick={() => {
                                    setSelectedQuizType("vowel-timed");
                                    setShowQuiz(true);
                                  }}
                                  className="w-full bg-educational-orange text-white hover:bg-educational-orange/90 py-1.5 md:py-2 text-xs md:text-sm rounded-xl animate-bounce"
                                  size="sm"
                                >
                                  <Play className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                  Rush Mode! 🔥
                                </Button>
                              </CardContent>
                            </Card>

                            {/* Word Garden - Listen & Pick */}
                            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 border-emerald-400/30 animate-kid-float">
                              <CardContent className="p-3 md:p-4 text-center">
                                <div className="text-3xl md:text-5xl mb-2 md:mb-3 animate-gentle-bounce">
                                  🌱
                                </div>
                                <h3 className="text-sm md:text-lg font-bold text-emerald-600 mb-1 md:mb-2">
                                  Word Garden
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3 hidden md:block">
                                  Listen & grow your vocabulary garden! 🌸
                                </p>
                                <div className="flex justify-center gap-1 mb-2 md:mb-3">
                                  <span className="bg-emerald-400/20 text-emerald-600 px-1.5 py-0.5 rounded-full text-xs">
                                    🎯 Ages 3-5!
                                  </span>
                                </div>
                                <Button
                                  onClick={() => {
                                    setGameMode("word-garden");
                                  }}
                                  className="w-full bg-emerald-500 text-white hover:bg-emerald-600 py-1.5 md:py-2 text-xs md:text-sm rounded-xl animate-wiggle"
                                  size="sm"
                                >
                                  <Play className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                  Grow Garden! 🌱
                                </Button>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Recent Scores */}
                          <div className="max-w-2xl mx-auto">
                            <Card className="bg-gradient-to-r from-educational-blue/10 to-educational-purple/10 hidden">
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
                      ) : gameMode === "word-garden" ? (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">
                              🌱 Word Garden
                            </h2>
                            <Button
                              onClick={() => setGameMode(false)}
                              variant="outline"
                              size="sm"
                            >
                              ← Back to Quiz Time
                            </Button>
                          </div>
                          <WordGarden
                            rounds={8}
                            optionsPerRound={3}
                            difficulty="easy"
                            category={
                              selectedCategory !== "all"
                                ? selectedCategory
                                : undefined
                            }
                            onFinish={(stats) => {
                              setGameMode(false);
                              setFeedback({
                                type: "celebration",
                                title: "Garden Complete! 🌸✨",
                                message: `You grew ${stats.correct} plants out of ${stats.totalRounds}! Best streak: ${stats.bestStreak}`,
                                score: stats.correct,
                                total: stats.totalRounds,
                                celebrationType: "confetti",
                                autoHide: true,
                                hideDelay: 3000,
                                onContinue: () => setFeedback(null),
                              });
                            }}
                            onExit={() => setGameMode(false)}
                          />
                        </div>
                      ) : gameMode ? (
                        <GameLikeLearning
                          words={(() => {
                            const categoryWords =
                              getWordsByCategory(selectedCategory);
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
                                title: "Matching Game Complete! 🎯✨",
                                message: `You matched ${score} pairs in ${timeSpent} seconds!`,
                                points: score * 15,
                                onContinue: () => setFeedback(null),
                              });
                            }}
                          />
                        </div>
                      ) : selectedQuizType === "listen-guess" ? (
                        <ListenAndGuessGame
                          category={selectedCategory}
                          onComplete={(correct, total, streak) => {
                            handleQuizComplete(correct, total);
                          }}
                          onExit={handleQuizExit}
                          playerLevel={1}
                          rounds={10}
                        />
                      ) : selectedQuizType?.startsWith("vowel-") ? (
                        <VowelRescue
                          questions={(() => {
                            switch (selectedQuizType) {
                              case "vowel-easy":
                                return getSystematicEasyVowelQuestions(
                                  10,
                                  selectedCategory,
                                  currentProfile,
                                );
                              case "vowel-challenge":
                                return getSystematicMediumVowelQuestions(
                                  8,
                                  selectedCategory,
                                  currentProfile,
                                );
                              case "vowel-timed":
                                return getSystematicTimedVowelQuestions(
                                  selectedCategory,
                                  currentProfile,
                                );
                              default:
                                return getSystematicEasyVowelQuestions(
                                  10,
                                  selectedCategory,
                                  currentProfile,
                                );
                            }
                          })()}
                          onComplete={handleQuizComplete}
                          onExit={handleQuizExit}
                          gameMode={
                            selectedQuizType === "vowel-easy"
                              ? "easy"
                              : selectedQuizType === "vowel-challenge"
                                ? "challenge"
                                : selectedQuizType === "vowel-timed"
                                  ? "timed"
                                  : "easy"
                          }
                        />
                      ) : (
                        <QuizGame
                          questions={(() => {
                            const generateQuizQuestionsByType = (
                              type: string,
                            ) => {
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
                                    10,
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

                            return generateQuizQuestionsByType(
                              selectedQuizType,
                            );
                          })()}
                          onComplete={handleQuizComplete}
                          onExit={handleQuizExit}
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="adventure" className="hidden">
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
          <CompactMobileSettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            currentProgress={currentProgress}
            onGoalUpdate={(goals) => {
              setLearningGoals(goals);
              console.log("Learning goals updated:", goals);
            }}
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

          {/* Mobile Bottom Navigation - Show for both child and parent modes */}
          <MobileBottomNav
            activeTab={userRole === "parent" ? "" : activeTab}
            onTabChange={(tab) => {
              setUserRole("child");
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
            userRole={userRole}
            onMoreToggle={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
            achievementCount={
              learningStats.badges.filter((b) => b.earned).length
            }
          />

          {/* Mobile-Optimized Floating Helper */}
          <div className="fixed bottom-24 sm:bottom-20 lg:bottom-6 right-3 sm:right-4 md:right-6 z-40">
            <div
              className="bg-gradient-to-r from-educational-purple to-educational-pink p-3 md:p-4 rounded-full shadow-2xl cursor-pointer transition-all duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95"
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

          {/* Enhanced Achievement Popup */}
          {achievementPopup.length > 0 && (
            <EnhancedAchievementPopup
              achievements={achievementPopup}
              onClose={() => setAchievementPopup([])}
              onAchievementClaim={(achievement) => {
                console.log("Achievement claimed:", achievement);
                // Could add additional reward logic here like updating user points
              }}
              autoCloseDelay={6000} // Auto-close after 6 seconds
            />
          )}
        </>
      )}
    </div>
  );
}
