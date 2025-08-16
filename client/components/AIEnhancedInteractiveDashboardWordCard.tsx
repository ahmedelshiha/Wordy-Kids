import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Volume2,
  RotateCcw,
  CheckCircle,
  XCircle,
  SkipForward,
  Sparkles,
  Target,
  Trophy,
  Zap,
  Eye,
  EyeOff,
  Lightbulb,
  Brain,
  TrendingUp,
  Star,
  Clock,
  BarChart3,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { audioService } from "@/lib/audioService";
import { enhancedAudioService } from "@/lib/enhancedAudioService";
import { AchievementTracker } from "@/lib/achievementTracker";
import { EnhancedAchievementTracker } from "@/lib/enhancedAchievementTracker";
import { EnhancedAchievementPopup } from "@/components/EnhancedAchievementPopup";
import { AchievementTeaser } from "@/components/AchievementTeaser";
import {
  useAIWordRecommendations,
  useAdaptiveDifficulty,
  usePersonalizedEncouragement,
} from "@/hooks/use-ai-word-recommendations";
import { SessionContext } from "@/lib/aiWordRecommendationService";
import { useVoiceSettings } from "@/hooks/use-voice-settings";
import { ChildWordStats } from "@shared/api";

interface Word {
  id: number;
  word: string;
  definition: string;
  example: string;
  category: string;
  difficulty?: "easy" | "medium" | "hard";
  pronunciation?: string;
  emoji?: string;
  imageUrl?: string;
}

interface DailyGoal {
  target: number;
  completed: number;
  streak: number;
}

interface AIEnhancedInteractiveDashboardWordCardProps {
  userId: string;
  userProgress: {
    rememberedWords: Set<number>;
    forgottenWords: Set<number>;
    excludedWordIds: Set<number>;
  };
  childStats?: ChildWordStats | null;
  onWordProgress: (
    word: Word,
    status: "remembered" | "needs_practice" | "skipped",
  ) => void;
  onQuickQuiz: () => void;
  onAdventure: () => void;
  onPracticeForgotten: () => void;
  dailyGoal: DailyGoal;
  currentLevel: number;
  totalPoints: number;
  selectedCategory?: string;
  className?: string;
  onSessionComplete?: (sessionData: any) => void;
}

export interface SessionStats {
  wordsCompleted: number;
  wordsRemembered: number;
  wordsForgotten: number;
  accuracy: number;
  sessionStartTime: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
}

export function AIEnhancedInteractiveDashboardWordCard({
  userId,
  userProgress,
  childStats,
  onWordProgress,
  onQuickQuiz,
  onAdventure,
  onPracticeForgotten,
  dailyGoal,
  currentLevel,
  totalPoints,
  selectedCategory,
  className,
  onSessionComplete,
}: AIEnhancedInteractiveDashboardWordCardProps) {
  // Session Management
  const SESSION_SIZE = 20;
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    wordsCompleted: 0,
    wordsRemembered: 0,
    wordsForgotten: 0,
    accuracy: 0,
    sessionStartTime: Date.now(),
  });
  const [wordStartTime, setWordStartTime] = useState(0);

  // AI Recommendations Hook
  const [aiState, aiActions] = useAIWordRecommendations({
    userId,
    enableRealTimeAdaptation: true,
    enableAnalytics: true,
    enableMotivationalBoosts: true,
    autoStartSession: false,
  });

  // Adaptive features (now using sessionStats after it's defined)
  const difficultyAdjustment = useAdaptiveDifficulty(
    userId,
    sessionStats.accuracy / 100,
    wordStartTime ? Date.now() - wordStartTime : 0,
  );

  const encouragement = usePersonalizedEncouragement(userId, {
    correct: sessionStats.wordsRemembered,
    total: sessionStats.wordsCompleted,
  });
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [sessionAchievements, setSessionAchievements] = useState<Achievement[]>(
    [],
  );
  const [journeyAchievements, setJourneyAchievements] = useState<any[]>([]);

  // UI States
  const [showWordName, setShowWordName] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [celebrationEffect, setCelebrationEffect] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "remembered" | "needs_practice" | null
  >(null);
  const [guess, setGuess] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(1);

  // AI Enhanced States
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [adaptiveHints, setAdaptiveHints] = useState<string[]>([]);
  const [realTimeEncouragement, setRealTimeEncouragement] =
    useState<string>("");
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [learningVelocity, setLearningVelocity] = useState(0);

  // Enhanced visual feedback states
  const [particles, setParticles] = useState<
    Array<{ id: number; type: "success" | "practice"; x: number; y: number }>
  >([]);
  const [buttonClickedId, setButtonClickedId] = useState<string | null>(null);
  const [showSuccessRipple, setShowSuccessRipple] = useState(false);
  const [showPracticeRipple, setShowPracticeRipple] = useState(false);

  // Voice settings integration
  const voiceSettings = useVoiceSettings();

  // Progressive enhancement states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Initialize AI recommendations when component mounts
  useEffect(() => {
    if (!aiState.hasInitialized) return;

    const sessionContext: SessionContext = {
      timeOfDay: new Date().getHours(),
      availableTime: 15, // Default 15 minutes
      sessionGoal: "learning",
      deviceType:
        window.innerWidth < 768
          ? "mobile"
          : window.innerWidth < 1024
            ? "tablet"
            : "desktop",
      previousSessionGap: 24, // Default 24 hours
    };

    if (!aiState.currentRecommendation) {
      aiActions.getRecommendations(
        sessionContext,
        userProgress,
        childStats,
        selectedCategory || "all",
        SESSION_SIZE,
      );
    }
  }, [aiState.hasInitialized, selectedCategory, userProgress, childStats]);

  // Start AI session when recommendations are ready
  useEffect(() => {
    if (
      aiState.currentRecommendation &&
      !aiState.isSessionActive &&
      sessionWords.length === 0
    ) {
      setSessionWords(aiState.words);
      setCurrentWordIndex(0);
      setSessionStats({
        wordsCompleted: 0,
        wordsRemembered: 0,
        wordsForgotten: 0,
        accuracy: 0,
        sessionStartTime: Date.now(),
      });
      setWordStartTime(Date.now());

      // Start AI session
      aiActions.startSession(aiState.currentRecommendation);

      console.log("AI-Enhanced session started:", {
        confidence: aiState.confidence,
        wordsSelected: aiState.words.length,
        reasoning: aiState.reasoning,
        expectedOutcomes: aiState.currentRecommendation.expectedOutcomes,
      });
    }
  }, [
    aiState.currentRecommendation,
    aiState.isSessionActive,
    sessionWords.length,
  ]);

  // Haptic feedback utility for mobile
  const triggerHapticFeedback = (
    type: "light" | "medium" | "heavy" = "light",
  ) => {
    if ("vibrate" in navigator) {
      switch (type) {
        case "light":
          navigator.vibrate(10);
          break;
        case "medium":
          navigator.vibrate(25);
          break;
        case "heavy":
          navigator.vibrate([50, 30, 50]);
          break;
      }
    }
  };

  // Enhanced action handler with AI integration
  const handleActionWithFeedback = (
    action: () => void,
    feedbackType: "light" | "medium" | "heavy" = "medium",
  ) => {
    triggerHapticFeedback(feedbackType);
    action();
  };

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isAnswered) return;

    switch (event.key) {
      case "1":
      case "f":
      case "F":
        event.preventDefault();
        handleWordAction("needs_practice");
        break;
      case "2":
      case "r":
      case "R":
        event.preventDefault();
        handleWordAction("remembered");
        break;
      case "h":
      case "H":
        event.preventDefault();
        if (!showHint && !showWordName) {
          handleRequestHint();
        }
        break;
      case "s":
      case "S":
        event.preventDefault();
        if (!showWordName) {
          setShowWordName(true);
        }
        break;
      case " ":
        event.preventDefault();
        playPronunciation();
        break;
      default:
        break;
    }
  };

  const currentWord = sessionWords[currentWordIndex] || null;
  const sessionProgress = Math.round(
    (sessionStats.wordsCompleted / SESSION_SIZE) * 100,
  );

  // Reset card state when word changes
  useEffect(() => {
    setShowWordName(false);
    setIsAnswered(false);
    setGuess("");
    setShowHint(false);
    setImageLoaded(false);
    setImageError(false);
    setIsTransitioning(true);
    setHintsUsed(0);
    setCurrentAttempt(1);
    setWordStartTime(Date.now());

    // Reset transition state after brief delay
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [currentWordIndex]);

  // Update real-time encouragement based on AI insights
  useEffect(() => {
    if (aiState.encouragementMessages.length > 0) {
      setRealTimeEncouragement(
        aiState.encouragementMessages[aiState.encouragementMessages.length - 1],
      );
    }
  }, [aiState.encouragementMessages]);

  // Update adaptive hints from AI
  useEffect(() => {
    if (aiState.adaptiveHints.length > 0) {
      setAdaptiveHints(aiState.adaptiveHints);
    }
  }, [aiState.adaptiveHints]);

  // Update confidence and velocity from AI analytics
  useEffect(() => {
    setConfidenceLevel(aiState.confidence);
    if (aiState.learningAnalytics?.velocityTrend) {
      const latestVelocity =
        aiState.learningAnalytics.velocityTrend.slice(-1)[0];
      setLearningVelocity(latestVelocity || 0);
    }
  }, [aiState.confidence, aiState.learningAnalytics]);

  const playPronunciation = () => {
    if (currentWord && !isPlaying) {
      triggerHapticFeedback("light");
      setIsPlaying(true);
      enhancedAudioService.pronounceWord(currentWord.word, {
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  const handleRequestHint = async () => {
    if (currentWord) {
      const hint = await aiActions.requestHint(currentWord.id);
      setShowHint(true);
      setHintsUsed((prev) => prev + 1);
      setAdaptiveHints((prev) => [...prev, hint]);
    }
  };

  const checkSessionAchievements = (stats: SessionStats): Achievement[] => {
    const achievements: Achievement[] = [];
    const { wordsCompleted, wordsRemembered, accuracy } = stats;

    if (wordsCompleted === SESSION_SIZE) {
      if (accuracy === 100) {
        achievements.push({
          id: "perfect_ai_session",
          title: "AI PERFECT SESSION!",
          description: `Amazing! You mastered all ${SESSION_SIZE} AI-selected words!`,
          emoji: "🤖🏆",
          unlocked: true,
        });
      } else if (accuracy >= 90) {
        achievements.push({
          id: "excellent_ai_session",
          title: "AI EXCELLENCE!",
          description: `Outstanding! ${accuracy}% accuracy with AI recommendations!`,
          emoji: "🧠⭐",
          unlocked: true,
        });
      } else if (accuracy >= 75) {
        achievements.push({
          id: "great_ai_session",
          title: "AI LEARNING SUCCESS!",
          description: `Great job! ${accuracy}% accuracy with personalized learning!`,
          emoji: "🎯🤖",
          unlocked: true,
        });
      }

      // AI-specific achievements
      if (aiState.confidence > 0.8) {
        achievements.push({
          id: "ai_confidence_high",
          title: "AI CONFIDENCE BOOST!",
          description: `AI predicted your success with ${Math.round(aiState.confidence * 100)}% confidence!`,
          emoji: "🔮✨",
          unlocked: true,
        });
      }
    }

    return achievements;
  };

  const handleWordAction = async (
    status: "remembered" | "needs_practice" | "skipped",
  ) => {
    if (!currentWord || isAnswered) return;

    // Provide haptic feedback based on action
    if (status === "remembered") {
      triggerHapticFeedback("heavy");
    } else if (status === "needs_practice") {
      triggerHapticFeedback("medium");
    } else {
      triggerHapticFeedback("light");
    }

    console.log(`AI Enhanced Word Action: ${currentWord.word} - ${status}`, {
      wordId: currentWord.id,
      sessionProgress: `${currentWordIndex + 1}/${SESSION_SIZE}`,
      aiConfidence: aiState.confidence,
      hintsUsed,
      currentAttempt,
    });

    // Mark as answered immediately
    setIsAnswered(true);

    // Record interaction with AI system
    const responseTime = Date.now() - wordStartTime;
    await aiActions.recordWordInteraction({
      wordId: currentWord.id,
      word: currentWord.word,
      isCorrect: status === "remembered",
      responseTime,
      hintsUsed,
      attemptNumber: currentAttempt,
    });

    // Update session stats
    const newStats = {
      ...sessionStats,
      wordsCompleted: sessionStats.wordsCompleted + 1,
      wordsRemembered:
        status === "remembered"
          ? sessionStats.wordsRemembered + 1
          : sessionStats.wordsRemembered,
      wordsForgotten:
        status === "needs_practice"
          ? sessionStats.wordsForgotten + 1
          : sessionStats.wordsForgotten,
    };

    // Calculate accuracy
    const totalAnswered = newStats.wordsRemembered + newStats.wordsForgotten;
    newStats.accuracy =
      totalAnswered > 0
        ? Math.round((newStats.wordsRemembered / totalAnswered) * 100)
        : 0;

    setSessionStats(newStats);

    // Set visual feedback type
    if (status !== "skipped") {
      setFeedbackType(status);
    }

    // Show celebration effect for successful interactions
    if (status === "remembered") {
      setCelebrationEffect(true);
      enhancedAudioService.playSuccessSound();
      setTimeout(() => setCelebrationEffect(false), 2000);
    } else if (status === "needs_practice") {
      enhancedAudioService.playEncouragementSound();
    }

    try {
      // Call the progress callback for overall tracking
      await onWordProgress(currentWord, status);

      // Track journey achievements
      const newJourneyAchievements = AchievementTracker.trackActivity({
        type: "wordLearning",
        wordsLearned: status === "remembered" ? 1 : 0,
        accuracy:
          status === "remembered"
            ? 100
            : status === "needs_practice"
              ? 0
              : undefined,
        category: currentWord.category,
        timeSpent: 1,
      });

      const enhancedAchievements = EnhancedAchievementTracker.trackActivity({
        type: "wordLearning",
        wordsLearned: status === "remembered" ? 1 : 0,
        accuracy:
          status === "remembered"
            ? 100
            : status === "needs_practice"
              ? 0
              : undefined,
        category: currentWord.category,
        difficulty: currentWord.difficulty,
        timeSpent: 1,
      });

      const allNewAchievements = [
        ...newJourneyAchievements,
        ...enhancedAchievements,
      ];

      if (allNewAchievements.length > 0) {
        setTimeout(() => {
          setJourneyAchievements(allNewAchievements);
        }, 1500);
      }
    } catch (error) {
      console.error("Error in word progress callback:", error);
    }

    // Check if session is complete
    if (newStats.wordsCompleted >= SESSION_SIZE) {
      const achievements = checkSessionAchievements(newStats);
      setSessionAchievements(achievements);

      // Complete AI session
      const sessionResult = await aiActions.endSession({
        completed: true,
        userSatisfaction:
          newStats.accuracy >= 80 ? 5 : newStats.accuracy >= 60 ? 4 : 3,
      });

      setShowSessionComplete(true);
      onSessionComplete?.(sessionResult);

      console.log("AI Enhanced Session completed!", {
        stats: newStats,
        achievements: achievements.map((a) => a.title),
        aiInsights: sessionResult?.learningInsights || [],
        nextRecommendations: sessionResult?.nextSessionRecommendations,
      });
      return;
    }

    // Auto-advance to next word
    setTimeout(
      () => {
        advanceToNextWord();
      },
      status === "remembered" ? 1500 : 800,
    );
  };

  const advanceToNextWord = () => {
    console.log(`Advancing from word ${currentWordIndex + 1}/${SESSION_SIZE}`);

    setIsTransitioning(true);

    setTimeout(() => {
      // Reset states for next word
      setIsAnswered(false);
      setFeedbackType(null);
      setCelebrationEffect(false);
      setShowWordName(false);
      setShowHint(false);
      setParticles([]);
      setButtonClickedId(null);
      setShowSuccessRipple(false);
      setShowPracticeRipple(false);
      setHintsUsed(0);
      setCurrentAttempt(1);

      const nextIndex = currentWordIndex + 1;

      if (nextIndex < SESSION_SIZE && nextIndex < sessionWords.length) {
        setCurrentWordIndex(nextIndex);
        setWordStartTime(Date.now());
        console.log(
          `Advanced to word ${nextIndex + 1}/${SESSION_SIZE}: ${sessionWords[nextIndex]?.word}`,
        );
      }

      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
  };

  const startNewSession = async () => {
    console.log("Starting new AI-enhanced session...");

    // Reset all session state
    setShowSessionComplete(false);
    setSessionAchievements([]);
    setJourneyAchievements([]);
    setCurrentWordIndex(0);
    setIsAnswered(false);
    setFeedbackType(null);
    setCelebrationEffect(false);
    setAdaptiveHints([]);
    setRealTimeEncouragement("");

    // Reset session stats
    setSessionStats({
      wordsCompleted: 0,
      wordsRemembered: 0,
      wordsForgotten: 0,
      accuracy: 0,
      sessionStartTime: Date.now(),
    });

    // Request new AI recommendations
    const sessionContext: SessionContext = {
      timeOfDay: new Date().getHours(),
      availableTime: 15,
      sessionGoal: "learning",
      deviceType: window.innerWidth < 768 ? "mobile" : "tablet",
      previousSessionGap: 1, // Recent session
    };

    await aiActions.getRecommendations(
      sessionContext,
      userProgress,
      childStats,
      selectedCategory || "all",
      SESSION_SIZE,
    );

    setSessionWords([]);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "hard":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const renderWordImage = () => {
    if (currentWord?.imageUrl) {
      return (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                <span className="text-xs text-gray-500">Loading image...</span>
              </div>
            </div>
          )}
          {imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">{currentWord.emoji || "📚"}</div>
                <span className="text-xs text-gray-500">
                  Image not available
                </span>
              </div>
            </div>
          )}
          <img
            src={currentWord.imageUrl}
            alt={`Picture showing ${currentWord.word}`}
            className={`w-full h-64 object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        </div>
      );
    }

    // Fallback to emoji with AI feedback overlay
    if (currentWord?.emoji) {
      if (feedbackType) {
        const feedbackEmoji = feedbackType === "remembered" ? "🎉" : "💪";
        const feedbackColor =
          feedbackType === "remembered"
            ? "from-green-100 to-green-200"
            : "from-orange-100 to-orange-200";
        const feedbackMessage =
          feedbackType === "remembered" ? "Great job!" : "Keep practicing!";

        return (
          <motion.div
            key={`feedback-${currentWordIndex}-${feedbackType}`}
            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              duration: 0.6,
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className={`w-48 h-32 mx-auto flex flex-col items-center justify-center bg-gradient-to-br ${feedbackColor} rounded-2xl shadow-lg hover:shadow-xl border-2 ${feedbackType === "remembered" ? "border-green-300" : "border-orange-300"} relative overflow-hidden`}
          >
            {/* AI Enhancement Badge */}
            <div className="absolute top-1 right-1 bg-white/80 rounded-full p-1">
              <Brain className="w-3 h-3 text-blue-500" />
            </div>

            {feedbackType === "remembered" && (
              <motion.div
                key={`feedback-bg-${currentWordIndex}`}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-0 bg-gradient-to-r from-green-200/50 to-emerald-200/50 rounded-2xl"
              />
            )}

            <motion.div
              key={`feedback-emoji-${currentWordIndex}-${feedbackType}`}
              animate={{
                y: [0, -10, 0],
                rotate:
                  feedbackType === "remembered"
                    ? [0, 15, -15, 0]
                    : [0, -5, 5, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: feedbackType === "remembered" ? 0.8 : 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-4xl mb-1 relative z-10"
            >
              {feedbackEmoji}
            </motion.div>

            <motion.div
              key={`feedback-message-${currentWordIndex}-${feedbackType}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-xs font-bold text-gray-700 relative z-10"
            >
              {feedbackMessage}
            </motion.div>

            {/* AI personalized encouragement */}
            {realTimeEncouragement && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="absolute bottom-1 left-1 right-1 text-center"
              >
                <div className="text-xs bg-white/90 rounded-lg px-2 py-1 text-gray-600 shadow-sm">
                  {realTimeEncouragement}
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      }

      return (
        <motion.div
          key={`emoji-normal-${currentWordIndex}`}
          initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.9, opacity: 0, rotateY: 15 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          whileHover={{
            scale: 1.05,
            rotateY: 5,
            transition: { duration: 0.3 },
          }}
          whileTap={{ scale: 0.95 }}
          className="w-48 h-32 mx-auto flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl shadow-lg hover:shadow-xl cursor-pointer group relative overflow-hidden"
          onClick={playPronunciation}
        >
          {/* AI Enhancement Badge */}
          <div className="absolute top-2 left-2 bg-white/80 rounded-full p-1">
            <Brain className="w-3 h-3 text-blue-500" />
          </div>

          {/* Confidence indicator */}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              🔊
            </div>
            <div className="bg-white/80 rounded-full px-2 py-1">
              <span className="text-xs font-bold text-blue-600">
                {Math.round(confidenceLevel * 100)}%
              </span>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/20 via-purple-200/20 to-pink-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <motion.div
            key={`emoji-inner-${currentWordIndex}`}
            animate={{
              y: [0, -8, 0],
              rotate: [0, 2, -2, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.5, 1],
            }}
            whileHover={{
              y: -5,
              scale: 1.1,
              transition: { duration: 0.2 },
            }}
            className="text-8xl filter drop-shadow-lg relative z-10"
          >
            {currentWord.emoji}

            <AnimatePresence>
              <motion.div
                key={`sparkle-1-${currentWordIndex}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
                className="absolute -top-2 -right-2 text-yellow-400 text-sm"
              >
                ✨
              </motion.div>
              <motion.div
                key={`sparkle-2-${currentWordIndex}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 4,
                  delay: 1,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-1 -left-1 text-blue-400 text-xs"
              >
                ⭐
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      );
    }

    return (
      <div className="w-full h-64 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-lg">Picture coming soon!</p>
        </div>
      </div>
    );
  };

  if (aiState.isLoading) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 mx-auto mb-4">
            <Brain className="w-8 h-8 text-educational-blue" />
          </div>
          <p className="text-lg text-gray-600">
            AI is selecting personalized words...
          </p>
          <div className="mt-4 space-y-2">
            <div className="bg-gray-200 rounded-lg h-2 w-3/4 mx-auto animate-pulse"></div>
            <div className="bg-gray-200 rounded-lg h-2 w-1/2 mx-auto animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (aiState.error) {
    return (
      <Alert className="w-full max-w-4xl mx-auto">
        <Brain className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            AI system temporarily unavailable. Using standard word selection.
          </span>
          <Button onClick={() => aiActions.reset()} variant="outline" size="sm">
            Retry AI
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!currentWord) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">
            No words available
          </h3>
          <p className="text-gray-500">
            Select a category to start learning vocabulary!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn("space-y-6", className)}
      role="main"
      aria-label="AI-enhanced interactive word learning card"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* AI Insights Panel */}
      {showAIInsights && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                AI Learning Insights
              </h3>
              <Button
                onClick={() => setShowAIInsights(false)}
                variant="ghost"
                size="sm"
              >
                ×
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(confidenceLevel * 100)}%
                </div>
                <div className="text-gray-600">AI Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {learningVelocity.toFixed(1)}
                </div>
                <div className="text-gray-600">Words/Min</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {sessionStats.accuracy}%
                </div>
                <div className="text-gray-600">Accuracy</div>
              </div>
            </div>
            {aiState.reasoning.length > 0 && (
              <div className="mt-3 p-3 bg-white/60 rounded-lg">
                <div className="text-xs font-medium text-gray-700 mb-1">
                  Why AI selected these words:
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {aiState.reasoning.slice(-2).map((reason, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-blue-500">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session Completion Modal */}
      {showSessionComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-1 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-3xl p-2 sm:p-8 max-w-xs sm:max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-3xl sm:text-6xl mb-1 sm:mb-4">🤖🎉</div>
            <h2 className="text-lg sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
              AI Session Complete!
            </h2>

            {/* AI Enhancement Badge */}
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-2 mb-4">
              <div className="flex items-center justify-center gap-2 text-sm">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">
                  AI Confidence: {Math.round(confidenceLevel * 100)}%
                </span>
              </div>
            </div>

            {/* Session Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-2xl p-2 sm:p-4 mb-2 sm:mb-6">
              <div className="grid grid-cols-3 gap-1 sm:gap-4 text-center">
                <div>
                  <div className="text-sm sm:text-2xl font-bold text-green-600">
                    {sessionStats.wordsRemembered}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Mastered
                  </div>
                </div>
                <div>
                  <div className="text-sm sm:text-2xl font-bold text-orange-600">
                    {sessionStats.wordsForgotten}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    To Practice
                  </div>
                </div>
                <div>
                  <div className="text-sm sm:text-2xl font-bold text-purple-600">
                    {sessionStats.accuracy}%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Accuracy
                  </div>
                </div>
              </div>
            </div>

            {/* AI Achievements */}
            {sessionAchievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className="mb-2 sm:mb-4 p-2 sm:p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg sm:rounded-2xl border border-yellow-300"
              >
                <div className="text-xl sm:text-3xl mb-0.5 sm:mb-2">
                  {achievement.emoji}
                </div>
                <div className="font-bold text-xs sm:text-lg text-gray-800">
                  {achievement.title}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 leading-tight">
                  {achievement.description}
                </div>
              </div>
            ))}

            {/* Real-time encouragement */}
            {realTimeEncouragement && (
              <div className="mb-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-200">
                <div className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {realTimeEncouragement}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={startNewSession}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-2 sm:py-4 px-3 sm:px-6 text-xs sm:text-base rounded-lg sm:rounded-2xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🤖 Start New AI Session
            </button>
          </div>
        </div>
      )}

      {/* Interactive Word Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
          type: "spring",
          damping: 20,
        }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 },
        }}
        whileTap={{
          scale: 0.98,
          transition: { duration: 0.1 },
        }}
        className="will-change-transform"
      >
        <Card
          className={cn(
            "w-full max-w-3xl mx-auto relative overflow-hidden",
            "bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30",
            "shadow-lg hover:shadow-xl border-0 rounded-2xl sm:rounded-3xl",
            "backdrop-blur-sm ring-1 ring-black/5",
            celebrationEffect &&
              "animate-pulse shadow-2xl border-yellow-400 border-4 bg-gradient-to-br from-yellow-50 to-orange-50",
          )}
        >
          {/* Celebration Sparkles */}
          {celebrationEffect && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 animate-pulse z-20">
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

          <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8 relative z-10">
            {/* AI Enhancement Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">
                    AI Enhanced Learning
                  </div>
                  <div className="text-xs text-gray-600">
                    Confidence: {Math.round(confidenceLevel * 100)}% | Progress:{" "}
                    {currentWordIndex + 1}/{SESSION_SIZE}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowAIInsights(!showAIInsights)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                {difficultyAdjustment !== "maintain" && (
                  <Badge variant="outline" className="text-xs">
                    AI suggests: {difficultyAdjustment} difficulty
                  </Badge>
                )}
              </div>
            </div>

            {/* Achievement Teaser */}
            <div aria-live="polite" aria-label="Motivational messages">
              <AchievementTeaser className="mb-3" />
            </div>

            {/* Category and Progress Header */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8 mt-4 sm:mt-6 md:mt-8">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                <Badge
                  className={cn(
                    "text-xs sm:text-sm px-2 sm:px-3 py-1",
                    getDifficultyColor(currentWord.difficulty),
                  )}
                >
                  {currentWord.difficulty
                    ? currentWord.difficulty.charAt(0).toUpperCase() +
                      currentWord.difficulty.slice(1)
                    : "Medium"}
                </Badge>
                <Badge
                  className={cn(
                    "text-xs sm:text-sm px-2 sm:px-3 py-1",
                    getDifficultyColor(currentWord.difficulty),
                  )}
                >
                  {currentWord.category}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 bg-purple-50 text-purple-700 border-purple-300"
                >
                  {sessionStats.accuracy}% Accuracy
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${sessionProgress}%` }}
                />
              </div>
              <div className="text-xs text-gray-600">
                Session Progress: {currentWordIndex + 1} of {SESSION_SIZE} words
              </div>
            </div>

            {/* Picture Display with State Transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`word-${currentWordIndex}-${showWordName ? "revealed" : "hidden"}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 1.05 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                className="mb-4 md:mb-6"
                role="img"
                aria-label={`Picture showing ${currentWord.emoji} ${currentWord.word}`}
              >
                {renderWordImage()}

                {isTransitioning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                    />
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Game Instructions */}
            <header className="text-center mb-3 sm:mb-4 md:mb-5" role="banner">
              <motion.h1
                key={`prompt-${currentWordIndex}`}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, type: "spring", damping: 20 }}
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-1 sm:mb-2"
              >
                🤔 What is this?
              </motion.h1>
              <motion.p
                key={`desc-${currentWordIndex}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-xs sm:text-sm md:text-base text-gray-600 px-2"
                id="game-instructions"
              >
                AI has selected this word specially for you!
              </motion.p>
            </header>

            {/* Action Buttons Row */}
            <div
              className="flex justify-center items-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-2"
              role="toolbar"
              aria-label="AI-enhanced word learning controls"
              aria-describedby="game-instructions"
            >
              {!showHint && !showWordName && (
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={() =>
                      handleActionWithFeedback(handleRequestHint, "light")
                    }
                    variant="outline"
                    size="sm"
                    className="px-3 py-2 text-xs sm:text-sm rounded-xl transition-all duration-300 min-h-[44px] touch-manipulation group relative overflow-hidden bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 border-2 border-yellow-200 hover:border-yellow-300 shadow-md hover:shadow-lg"
                    aria-label="Get AI hint"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/0 via-yellow-200/50 to-yellow-200/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                    <Lightbulb className="w-4 h-4 mr-1 group-hover:animate-pulse text-yellow-600" />
                    <span className="relative z-10 font-semibold text-yellow-700">
                      🤖 AI Hint {hintsUsed > 0 && `(${hintsUsed})`}
                    </span>
                  </Button>
                </motion.div>
              )}

              {!showWordName && (
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={() =>
                      handleActionWithFeedback(
                        () => setShowWordName(true),
                        "medium",
                      )
                    }
                    size="sm"
                    className="bg-gradient-to-r from-educational-purple via-purple-500 to-purple-600 hover:from-purple-500 hover:via-purple-600 hover:to-purple-700 text-white px-3 py-2 text-xs sm:text-sm rounded-xl min-h-[44px] touch-manipulation group relative overflow-hidden shadow-lg hover:shadow-xl border-2 border-purple-300/50 hover:border-purple-200"
                    aria-label="Show word answer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-600 ease-out" />
                    <Eye className="w-4 h-4 mr-1 group-hover:animate-bounce" />
                    <span className="relative z-10 font-semibold">👁️ Show</span>
                  </Button>
                </motion.div>
              )}

              <Button
                onClick={playPronunciation}
                disabled={isPlaying}
                size="lg"
                className={cn(
                  "bg-gradient-to-br from-educational-blue via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 text-white p-4 sm:p-5 md:p-6 rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-xl hover:shadow-2xl border-2 border-blue-300/50 hover:border-blue-200",
                  "min-w-[60px] min-h-[60px] sm:min-w-[70px] sm:min-h-[70px] md:min-w-[80px] md:min-h-[80px]",
                  "ring-4 ring-blue-200/30 hover:ring-blue-300/50",
                  "backdrop-blur-sm",
                  isPlaying &&
                    "animate-pulse ring-yellow-400/60 shadow-yellow-400/30",
                  "disabled:opacity-50 disabled:transform-none disabled:hover:scale-100",
                )}
                aria-label="🔊 Play pronunciation - AI-enhanced audio!"
              >
                <Volume2
                  className={cn(
                    "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8",
                    "drop-shadow-lg",
                    isPlaying && "animate-bounce text-yellow-100 scale-110",
                  )}
                />
                {isPlaying && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse" />
                )}
              </Button>
            </div>

            {/* AI Hint Display */}
            <AnimatePresence>
              {showHint && !showWordName && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    type: "spring",
                    damping: 20,
                  }}
                  className="bg-gradient-to-br from-yellow-50 via-orange-50/50 to-amber-50 border border-yellow-200/60 rounded-2xl p-4 mb-4 text-center shadow-lg backdrop-blur-sm ring-1 ring-yellow-200/20 will-change-transform"
                  role="region"
                  aria-label="AI-generated word hint"
                  aria-live="polite"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    <h2 className="text-sm font-semibold text-yellow-800">
                      🤖 AI Hint:
                    </h2>
                  </div>
                  <p className="text-yellow-700 text-sm mb-2" id="hint-text">
                    "{currentWord.definition}"
                  </p>

                  {/* AI adaptive hints */}
                  {adaptiveHints.length > 0 && (
                    <div className="mt-3 p-2 bg-white/60 rounded-lg">
                      <div className="text-xs font-medium text-blue-700 mb-1">
                        💡 Personalized tip:
                      </div>
                      <p className="text-xs text-blue-600">
                        {adaptiveHints[adaptiveHints.length - 1]}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Word Name and Details */}
            <AnimatePresence>
              {showWordName && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 1.05 }}
                  transition={{
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                  className="space-y-3 md:space-y-4 mb-6 md:mb-8"
                  role="region"
                  aria-label="Word answer revealed by AI"
                  aria-live="polite"
                >
                  {/* Word Name with AI enhancement badge */}
                  <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 shadow-lg border border-blue-200/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">
                        AI Selected Word
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                      {currentWord.word}
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 italic">
                      "{currentWord.definition}"
                    </p>
                    {currentWord.example && (
                      <p className="text-xs md:text-sm text-gray-500 mt-2">
                        Example: {currentWord.example}
                      </p>
                    )}
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons - Always visible when not answered */}
            {!isAnswered && (
              <div
                className="space-y-3 sm:space-y-4 px-2 sm:px-0 mb-4"
                role="group"
                aria-label="AI-enhanced word learning choices"
              >
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    onClick={() => handleWordAction("needs_practice")}
                    disabled={isAnswered}
                    className="w-full bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 active:from-red-600 active:to-pink-700 text-white font-bold border-0 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 py-2 sm:py-3 md:py-4 px-2 sm:px-3 min-h-[48px] sm:min-h-[56px] md:min-h-[64px] relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-manipulation"
                    aria-label="Mark word as forgotten"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="text-base sm:text-lg mr-1 sm:mr-2 animate-wiggle">
                        😔
                      </span>
                      <div className="text-center">
                        <div className="font-bold text-xs sm:text-sm md:text-base">
                          I Forgot
                        </div>
                        <div className="text-xs opacity-90 mt-0.5 hidden sm:block">
                          Need practice! 💪
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleWordAction("remembered")}
                    disabled={isAnswered}
                    className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 active:from-green-600 active:to-emerald-700 text-white font-bold border-0 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 py-2 sm:py-3 md:py-4 px-2 sm:px-3 min-h-[48px] sm:min-h-[56px] md:min-h-[64px] relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none touch-manipulation"
                    aria-label="Mark word as remembered"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10 flex items-center justify-center">
                      <span className="text-base sm:text-lg mr-1 sm:mr-2 animate-bounce">
                        😊
                      </span>
                      <div className="text-center">
                        <div className="font-bold text-xs sm:text-sm md:text-base">
                          I Remember
                        </div>
                        <div className="text-xs opacity-90 mt-0.5 hidden sm:block">
                          Awesome! ⭐
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>
              </div>
            )}

            {/* AI-Enhanced Session Progress */}
            {!isAnswered && (
              <div className="mt-2 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50 rounded-xl p-3 sm:p-4 border border-blue-200/60 shadow-md backdrop-blur-sm ring-1 ring-blue-100/30">
                {/* AI Enhancement Badge */}
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-1 rounded-full mr-2">
                    <Brain className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-blue-700">AI Session Progress</span>
                </div>

                {/* Compact Progress Bar */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-gray-700">
                    🚀 {sessionStats.wordsCompleted}/{SESSION_SIZE}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-2 shadow-inner relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-700 ease-out shadow-sm relative"
                        style={{
                          width: `${(sessionStats.wordsCompleted / SESSION_SIZE) * 100}%`,
                        }}
                      >
                        {/* Progress shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {Math.round(
                      (sessionStats.wordsCompleted / SESSION_SIZE) * 100,
                    )}
                    %
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  {/* Compact Stats with AI confidence indicator */}
                  <div className="bg-green-100 rounded-md px-2 py-1 text-center">
                    <div className="text-xs">
                      😊 {sessionStats.wordsRemembered}
                    </div>
                  </div>
                  <div className="bg-orange-100 rounded-md px-2 py-1 text-center">
                    <div className="text-xs">
                      💪 {sessionStats.wordsForgotten}
                    </div>
                  </div>
                  <div className="bg-blue-100 rounded-md px-2 py-1 text-center">
                    <div className="text-xs">
                      🤖 {Math.round(confidenceLevel * 100)}%
                    </div>
                  </div>
                </div>

                {/* AI-enhanced encouraging message */}
                <div className="mt-1 text-center">
                  {sessionStats.wordsRemembered >= 15 ? (
                    <div className="text-green-600 font-medium text-xs">
                      🌟 AI says: You're a superstar!
                    </div>
                  ) : sessionStats.wordsRemembered >= 10 ? (
                    <div className="text-green-600 font-medium text-xs">
                      🎯 AI says: Awesome job!
                    </div>
                  ) : sessionStats.wordsCompleted >= 10 ? (
                    <div className="text-blue-600 font-medium text-xs">
                      🔥 AI says: Keep going!
                    </div>
                  ) : (
                    <div className="text-purple-600 font-medium text-xs">
                      🌟 AI says: Great start!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Real-time AI encouragement */}
            {realTimeEncouragement && !showWordName && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-200 mb-4"
              >
                <div className="text-sm font-medium text-green-800 flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4" />
                  {realTimeEncouragement}
                </div>
              </motion.div>
            )}
            {/* Loading next word indicator */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-6"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-educational-purple mx-auto mb-2 will-change-transform"></div>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-600 flex items-center justify-center gap-2"
                  >
                    <Brain className="w-4 h-4 text-blue-500" />
                    AI is preparing next word...
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Achievement Popup for journey achievements */}
      <EnhancedAchievementPopup
        achievements={journeyAchievements}
        onClose={() => setJourneyAchievements([])}
      />
    </div>
  );
}
